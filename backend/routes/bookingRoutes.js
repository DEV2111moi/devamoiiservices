const {
  getAllBookingsController,
  getUserBookingsController,
  createBookingController,
  approveBookingController,
  markPaidController,
  adminVerifyController,
  completeBookingController,
  webhookController
} = require("../controllers/bookingController");

module.exports = [
  { method: "GET", path: "/api/bookings", handler: getAllBookingsController },
  { method: "GET", path: "/api/bookings/user/:userId", handler: getUserBookingsController },
  { method: "POST", path: "/api/bookings", handler: createBookingController },
  { method: "PUT", path: "/api/bookings/approve/:id", handler: approveBookingController },
  { method: "POST", path: "/api/bookings/mark-paid/:id", handler: markPaidController },
  { method: "POST", path: "/api/bookings/admin-verify/:id", handler: adminVerifyController },
  { method: "POST", path: "/api/bookings/complete/:id", handler: completeBookingController },
  { method: "POST", path: "/api/payment/webhook", handler: webhookController }
];
