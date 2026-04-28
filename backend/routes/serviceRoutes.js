const { getServicesController, createServiceController, updateServiceController } = require("../controllers/serviceController");

module.exports = [
  { method: "GET", path: "/api/services", handler: getServicesController },
  { method: "POST", path: "/api/services", handler: createServiceController },
  { method: "PUT", path: "/api/services/:id", handler: updateServiceController }
];
