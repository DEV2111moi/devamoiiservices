const { getAllBookings, getBookingById, getBookingsByUser, createBooking } = require("../models/Booking");
const { getAllServices, getServiceById } = require("../models/Service");
const { getAllUsers, getUserById } = require("../models/User");
const { uploadImage } = require("../utils/firebaseStorage");
const { generatePaymentLink, verifyWebhook } = require("../utils/razorpay");
const { requireAdmin } = require("../middleware/auth");

function getDefaultAddress(user) {
  return user.addresses.find((address) => address.isDefault) || user.addresses[0];
}

function deriveTimeline(status, paymentMethod, paymentStatus) {
  const approved = status !== "requested" || Boolean(paymentMethod);
  const paymentPending = status === "payment_pending" || paymentStatus === "pending" || paymentStatus === "pending_verification";
  const paid = status === "paid" || status === "completed" || paymentStatus === "paid";
  const completed = status === "completed";

  return [
    { key: "requested", label: "Requested", done: true },
    { key: "confirmed", label: "Confirmed", done: approved },
    { key: "payment_pending", label: "Payment Pending", done: paymentPending || paid || completed },
    { key: "paid", label: "Paid", done: paid || completed },
    { key: "completed", label: "Completed", done: completed }
  ];
}

function hydrateBooking(booking) {
  const user = getUserById(booking.userId);
  const services = booking.serviceIds.map((id) => getServiceById(id)).filter(Boolean);
  const originalTotal = services.reduce((sum, service) => sum + Number(service.price || 0), 0);

  return {
    ...booking,
    user,
    services,
    originalTotal,
    location: booking.addressSnapshot.addressText,
    userFacingPaymentStatus:
      booking.paymentStatus === "pending_verification"
        ? "Payment Under Review"
        : booking.paymentStatus === "paid"
          ? "Payment Completed"
          : booking.paymentStatus === "pending"
            ? "Waiting for Payment"
            : "Awaiting Approval",
    timeline: deriveTimeline(booking.status, booking.paymentMethod, booking.paymentStatus)
  };
}

function resolveBookingAmount(serviceIds) {
  return serviceIds.reduce((sum, serviceId) => {
    const service = getServiceById(serviceId);
    if (!service) {
      return sum;
    }

    return sum + Number(service.offer_price || service.price);
  }, 0);
}

async function getAllBookingsController({ sendJson }) {
  sendJson(200, getAllBookings().map(hydrateBooking));
}

async function getUserBookingsController({ params, sendJson, sendError }) {
  const user = getUserById(params.userId);
  if (!user) {
    sendError(404, "User not found.");
    return;
  }

  sendJson(200, getBookingsByUser(params.userId).map(hydrateBooking));
}

async function createBookingController({ body, sendJson, sendError }) {
  const user = getUserById(body.userId);
  if (!user) {
    sendError(404, "User not found.");
    return;
  }

  if (!Array.isArray(body.serviceIds) || body.serviceIds.length === 0) {
    sendError(400, "At least one service is required.");
    return;
  }

  const serviceIdsValid = body.serviceIds.every((serviceId) => getServiceById(serviceId));
  if (!serviceIdsValid) {
    sendError(400, "One or more services are invalid.");
    return;
  }

  const address =
    user.addresses.find((item) => item.label === body.addressLabel && item.addressText === body.addressText) ||
    user.addresses.find((item) => item.isDefault) ||
    getDefaultAddress(user);

  const booking = createBooking({
    userId: user._id,
    serviceIds: body.serviceIds,
    totalAmount: resolveBookingAmount(body.serviceIds),
    addressSnapshot: {
      label: address.label,
      lat: Number(body.lat ?? address.lat),
      lng: Number(body.lng ?? address.lng),
      addressText: body.addressText || address.addressText
    },
    date: body.date
  });

  sendJson(201, hydrateBooking(booking));
}

async function approveBookingController({ req, params, body, sendJson, sendError }) {
  if (!requireAdmin(req)) {
    sendError(403, "Admin access required.");
    return;
  }

  const booking = getBookingById(params.id);
  if (!booking) {
    sendError(404, "Booking not found.");
    return;
  }

  if (!["razorpay", "qr", "cash"].includes(body.paymentMethod)) {
    sendError(400, "Invalid payment method.");
    return;
  }

  booking.paymentMethod = body.paymentMethod;
  booking.status = "payment_pending";
  booking.paymentStatus = "pending";

  if (body.paymentMethod === "razorpay") {
    booking.paymentLink = generatePaymentLink(booking._id);
    booking.qrImage = "";
  }

  if (body.paymentMethod === "qr") {
    if (!body.qrImage) {
      sendError(400, "QR image is required for QR approvals.");
      return;
    }

    const upload = uploadImage({
      folder: "qr",
      fileName: `${booking._id}.png`,
      dataUrl: body.qrImage
    });
    booking.qrImage = upload.url;
    booking.paymentLink = "";
  }

  if (body.paymentMethod === "cash") {
    booking.paymentLink = "";
    booking.qrImage = "";
  }

  sendJson(200, hydrateBooking(booking));
}

async function markPaidController({ params, sendJson, sendError }) {
  const booking = getBookingById(params.id);
  if (!booking) {
    sendError(404, "Booking not found.");
    return;
  }

  if (booking.paymentMethod !== "qr" || booking.paymentStatus !== "pending") {
    sendError(400, "Only QR bookings waiting for payment can be submitted for verification.");
    return;
  }

  booking.paymentStatus = "pending_verification";
  sendJson(200, hydrateBooking(booking));
}

async function adminVerifyController({ req, params, sendJson, sendError }) {
  if (!requireAdmin(req)) {
    sendError(403, "Admin access required.");
    return;
  }

  const booking = getBookingById(params.id);
  if (!booking) {
    sendError(404, "Booking not found.");
    return;
  }

  if (!["pending", "pending_verification"].includes(booking.paymentStatus)) {
    sendError(400, "Booking is not ready for payment verification.");
    return;
  }

  booking.paymentStatus = "paid";
  booking.status = "paid";
  sendJson(200, hydrateBooking(booking));
}

async function completeBookingController({ req, params, sendJson, sendError }) {
  if (!requireAdmin(req)) {
    sendError(403, "Admin access required.");
    return;
  }

  const booking = getBookingById(params.id);
  if (!booking) {
    sendError(404, "Booking not found.");
    return;
  }

  booking.status = "completed";
  if (booking.paymentMethod === "cash" && booking.paymentStatus !== "paid") {
    booking.paymentStatus = "paid";
  }
  sendJson(200, hydrateBooking(booking));
}

async function webhookController({ req, body, sendJson, sendError }) {
  if (!requireAdmin(req)) {
    sendError(403, "Admin access required.");
    return;
  }

  const booking = getBookingById(body.bookingId);
  if (!booking) {
    sendError(404, "Booking not found.");
    return;
  }

  if (booking.paymentMethod !== "razorpay") {
    sendError(400, "Webhook only applies to Razorpay bookings.");
    return;
  }

  if (!verifyWebhook(body.event)) {
    sendError(400, "Unsupported payment event.");
    return;
  }

  booking.paymentStatus = "paid";
  booking.status = "paid";
  sendJson(200, hydrateBooking(booking));
}

module.exports = {
  getAllBookingsController,
  getUserBookingsController,
  createBookingController,
  approveBookingController,
  markPaidController,
  adminVerifyController,
  completeBookingController,
  webhookController,
  hydrateBooking
};
