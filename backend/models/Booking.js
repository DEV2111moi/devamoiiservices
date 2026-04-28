const { bookings, nextId } = require("./db");

function getAllBookings() {
  return bookings;
}

function getBookingById(id) {
  return bookings.find((booking) => booking._id === id);
}

function getBookingsByUser(userId) {
  return bookings.filter((booking) => booking.userId === userId);
}

function createBooking(payload) {
  const booking = {
    _id: nextId("booking"),
    userId: payload.userId,
    serviceIds: payload.serviceIds,
    totalAmount: payload.totalAmount,
    addressSnapshot: payload.addressSnapshot,
    date: payload.date,
    status: "requested",
    paymentMethod: null,
    paymentStatus: null,
    paymentLink: "",
    qrImage: "",
    createdAt: new Date().toISOString()
  };

  bookings.unshift(booking);
  return booking;
}

module.exports = {
  getAllBookings,
  getBookingById,
  getBookingsByUser,
  createBooking
};
