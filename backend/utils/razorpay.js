const { createPaymentLink } = require("../models/db");

function generatePaymentLink(bookingId) {
  return createPaymentLink(bookingId);
}

function verifyWebhook(event) {
  return event === "payment.captured";
}

module.exports = {
  generatePaymentLink,
  verifyWebhook
};
