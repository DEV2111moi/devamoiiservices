const { services, nextId } = require("./db");

function getAllServices(filter = {}) {
  const { type } = filter;
  if (!type) {
    return services;
  }

  return services.filter((service) => service.type === type);
}

function getServiceById(id) {
  return services.find((service) => service._id === id);
}

function validateServicePayload(payload) {
  if (!payload.name || !payload.category) {
    return "Service name and category are required.";
  }

  if (!["single", "combo"].includes(payload.type)) {
    return "Service type must be single or combo.";
  }

  if (Number.isNaN(Number(payload.price)) || Number(payload.price) <= 0) {
    return "Price must be a positive number.";
  }

  if (payload.offer_price !== "" && payload.offer_price !== null && payload.offer_price !== undefined) {
    if (Number.isNaN(Number(payload.offer_price)) || Number(payload.offer_price) <= 0) {
      return "Offer price must be a positive number when provided.";
    }
  }

  if (payload.type === "combo") {
    if (!Array.isArray(payload.items) || payload.items.length < 2) {
      return "Combo services must include at least two services.";
    }
  }

  return null;
}

function createService(payload) {
  const service = {
    _id: nextId(payload.type === "combo" ? "combo" : "service"),
    name: payload.name,
    type: payload.type,
    items: Array.isArray(payload.items) ? payload.items : [],
    price: Number(payload.price),
    offer_price: payload.offer_price ? Number(payload.offer_price) : null,
    image: payload.image || "",
    imageStoragePath: payload.imageStoragePath || "",
    category: payload.category,
    duration: payload.duration || "60 mins",
    isActive: payload.isActive !== false
  };

  services.push(service);
  return service;
}

function updateService(id, payload) {
  const service = getServiceById(id);

  if (!service) {
    return null;
  }

  service.name = payload.name;
  service.type = payload.type;
  service.items = Array.isArray(payload.items) ? payload.items : [];
  service.price = Number(payload.price);
  service.offer_price = payload.offer_price ? Number(payload.offer_price) : null;
  service.image = payload.image || service.image;
  service.imageStoragePath = payload.imageStoragePath || service.imageStoragePath || "";
  service.category = payload.category;
  service.duration = payload.duration || service.duration;
  service.isActive = payload.isActive !== false;

  return service;
}

module.exports = {
  getAllServices,
  getServiceById,
  validateServicePayload,
  createService,
  updateService
};
