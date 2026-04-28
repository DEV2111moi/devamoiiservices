const { getUserById, getUserByPhone, upsertUser } = require("../models/User");

function validateUserPayload(body) {
  if (!body.name || !body.phone) {
    return "Name and phone are required.";
  }

  if (!Array.isArray(body.addresses) || body.addresses.length === 0) {
    return "At least one address is required.";
  }

  return null;
}

async function getUserController({ params, query, sendJson, sendError }) {
  if (query.phone) {
    const byPhone = getUserByPhone(query.phone);
    if (!byPhone) {
      sendError(404, "User not found.");
      return;
    }

    sendJson(200, byPhone);
    return;
  }

  const user = getUserById(params.id);
  if (!user) {
    sendError(404, "User not found.");
    return;
  }

  sendJson(200, user);
}

async function upsertUserController({ body, sendJson, sendError }) {
  const validationError = validateUserPayload(body);
  if (validationError) {
    sendError(400, validationError);
    return;
  }

  const user = upsertUser(body);
  sendJson(200, user);
}

module.exports = {
  getUserController,
  upsertUserController
};
