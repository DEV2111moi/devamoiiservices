async function request(path, options = {}) {
  const response = await fetch(path, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

export const api = {
  getUserByPhone(phone) {
    return request(`/api/users?phone=${encodeURIComponent(phone)}`);
  },
  getUser(userId) {
    return request(`/api/users/${userId}`);
  },
  saveUserProfile(body) {
    return request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  },
  getServices(filter = {}) {
    const query = filter.type ? `?type=${encodeURIComponent(filter.type)}` : "";
    return request(`/api/services${query}`);
  },
  createService(body) {
    return request("/api/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-role": "admin"
      },
      body: JSON.stringify(body)
    });
  },
  updateService(id, body) {
    return request(`/api/services/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-role": "admin"
      },
      body: JSON.stringify(body)
    });
  },
  getBookings() {
    return request("/api/bookings");
  },
  getUserBookings(userId) {
    return request(`/api/bookings/user/${userId}`);
  },
  createBooking(body) {
    return request("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  },
  approveBooking(id, body) {
    return request(`/api/bookings/approve/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-role": "admin"
      },
      body: JSON.stringify(body)
    });
  },
  markQrPaid(id) {
    return request(`/api/bookings/mark-paid/${id}`, {
      method: "POST"
    });
  },
  verifyPayment(id) {
    return request(`/api/bookings/admin-verify/${id}`, {
      method: "POST",
      headers: {
        "x-role": "admin"
      }
    });
  },
  completeBooking(id) {
    return request(`/api/bookings/complete/${id}`, {
      method: "POST",
      headers: {
        "x-role": "admin"
      }
    });
  },
  simulateWebhook(bookingId) {
    return request("/api/payment/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-role": "admin"
      },
      body: JSON.stringify({
        bookingId,
        event: "payment.captured"
      })
    });
  }
};
