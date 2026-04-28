const { getUserController, upsertUserController } = require("../controllers/userController");

module.exports = [
  { method: "GET", path: "/api/users/:id", handler: getUserController },
  { method: "GET", path: "/api/users", handler: getUserController },
  { method: "POST", path: "/api/users", handler: upsertUserController }
];
