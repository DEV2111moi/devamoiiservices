const { getAllServices, getServiceById, validateServicePayload, createService, updateService } = require("../models/Service");
const { uploadImage } = require("../utils/firebaseStorage");

function enrichService(service, allServices) {
  if (service.type !== "combo") {
    return service;
  }

  return {
    ...service,
    includedServices: service.items
      .map((serviceId) => allServices.find((item) => item._id === serviceId))
      .filter(Boolean)
  };
}

async function getServicesController({ query, sendJson }) {
  const services = getAllServices({ type: query.type });
  const allServices = getAllServices();
  sendJson(200, services.map((service) => enrichService(service, allServices)));
}

async function createServiceController({ req, body, sendJson, sendError }) {
  if (req.headers["x-role"] !== "admin") {
    sendError(403, "Admin access required.");
    return;
  }

  const validationError = validateServicePayload(body);
  if (validationError) {
    sendError(400, validationError);
    return;
  }

  let image = body.image || "";
  let imageStoragePath = "";

  if (body.image) {
    const upload = uploadImage({
      folder: "services",
      fileName: body.fileName || `${body.name}.png`,
      dataUrl: body.image
    });
    image = upload.url;
    imageStoragePath = upload.storagePath;
  }

  const service = createService({
    ...body,
    image,
    imageStoragePath
  });

  sendJson(201, enrichService(service, getAllServices()));
}

async function updateServiceController({ req, params, body, sendJson, sendError }) {
  if (req.headers["x-role"] !== "admin") {
    sendError(403, "Admin access required.");
    return;
  }

  const existing = getServiceById(params.id);
  if (!existing) {
    sendError(404, "Service not found.");
    return;
  }

  const validationError = validateServicePayload(body);
  if (validationError) {
    sendError(400, validationError);
    return;
  }

  let image = body.image || existing.image;
  let imageStoragePath = existing.imageStoragePath || "";

  if (body.image && body.image !== existing.image) {
    const upload = uploadImage({
      folder: "services",
      fileName: body.fileName || `${body.name}.png`,
      dataUrl: body.image
    });
    image = upload.url;
    imageStoragePath = upload.storagePath;
  }

  const updated = updateService(params.id, {
    ...body,
    image,
    imageStoragePath
  });

  sendJson(200, enrichService(updated, getAllServices()));
}

module.exports = {
  getServicesController,
  createServiceController,
  updateServiceController
};
