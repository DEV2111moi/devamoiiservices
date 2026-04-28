const { users, nextId } = require("./db");

function normalizePhone(phone) {
  return String(phone || "")
    .replace(/\s+/g, "")
    .replace(/-/g, "");
}

function ensureSingleDefault(addresses) {
  const safeAddresses = Array.isArray(addresses) ? addresses : [];
  let defaultSeen = false;

  return safeAddresses.map((address, index) => {
    const shouldBeDefault = address.isDefault && !defaultSeen;
    if (shouldBeDefault) {
      defaultSeen = true;
    }

    return {
      label: address.label || `Address ${index + 1}`,
      lat: Number(address.lat),
      lng: Number(address.lng),
      addressText: address.addressText || "",
      isDefault: shouldBeDefault
    };
  }).map((address, index, arr) => {
    if (!arr.some((item) => item.isDefault) && index === 0) {
      return { ...address, isDefault: true };
    }

    return address;
  });
}

function getAllUsers() {
  return users;
}

function getUserById(id) {
  return users.find((user) => user._id === id);
}

function getUserByPhone(phone) {
  const normalized = normalizePhone(phone);
  return users.find((user) => normalizePhone(user.phone) === normalized);
}

function upsertUser(payload) {
  const existing = getUserByPhone(payload.phone);
  const addresses = ensureSingleDefault(payload.addresses);

  if (existing) {
    existing.name = payload.name;
    existing.phone = payload.phone;
    existing.email = payload.email || "";
    existing.addresses = addresses;
    return existing;
  }

  const created = {
    _id: nextId("user"),
    name: payload.name,
    phone: payload.phone,
    email: payload.email || "",
    addresses,
    createdAt: new Date().toISOString()
  };

  users.push(created);
  return created;
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByPhone,
  upsertUser,
  normalizePhone
};
