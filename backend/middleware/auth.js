function getRole(req) {
  return req.headers["x-role"] || "user";
}

function requireAdmin(req) {
  return getRole(req) === "admin";
}

module.exports = {
  getRole,
  requireAdmin
};
