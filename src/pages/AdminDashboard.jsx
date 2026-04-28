import { renderBookingCard } from "../components/BookingCard.jsx";
import { renderSectionHeader } from "../components/SectionHeader.jsx";

function serviceOptions(services, selectedIds) {
  return services
    .filter((service) => service.type === "single")
    .map(
      (service) => `
        <label class="chip">
          <input type="checkbox" name="comboItems" value="${service._id}" ${selectedIds.includes(service._id) ? "checked" : ""} />
          <span>${service.name}</span>
        </label>
      `
    )
    .join("");
}

export function renderAdminDashboard(state) {
  return `
    <section class="page-panel">
      ${renderSectionHeader({
        eyebrow: "Admin Dashboard",
        title: "Bookings, user map view, service management and combo offers",
        description: "Admin-only actions stay protected while users see clean status and payment surfaces."
      })}
      <div class="admin-grid">
        <div class="admin-panel">
          <p class="eyebrow">Service Management</p>
          <h3>${state.admin.serviceForm.editingId ? "Edit Service" : "Add New Service"}</h3>
          <form id="serviceForm" class="form-grid">
            <div class="field">
              <label for="serviceName">Name</label>
              <input id="serviceName" name="name" value="${state.admin.serviceForm.name}" />
            </div>
            <div class="field">
              <label for="serviceCategory">Category</label>
              <input id="serviceCategory" name="category" value="${state.admin.serviceForm.category}" />
            </div>
            <div class="field">
              <label for="serviceType">Type</label>
              <select id="serviceType" name="type">
                <option value="single" ${state.admin.serviceForm.type === "single" ? "selected" : ""}>Single</option>
                <option value="combo" ${state.admin.serviceForm.type === "combo" ? "selected" : ""}>Combo</option>
              </select>
            </div>
            <div class="field">
              <label for="serviceDuration">Duration</label>
              <input id="serviceDuration" name="duration" value="${state.admin.serviceForm.duration}" />
            </div>
            <div class="field">
              <label for="servicePrice">Price</label>
              <input id="servicePrice" name="price" value="${state.admin.serviceForm.price}" />
            </div>
            <div class="field">
              <label for="serviceOfferPrice">Offer Price</label>
              <input id="serviceOfferPrice" name="offer_price" value="${state.admin.serviceForm.offer_price}" />
            </div>
            <div class="field">
              <label for="serviceImage">Service Image</label>
              <input id="serviceImage" class="file-input" type="file" accept="image/*" />
            </div>
            <div class="field">
              <label for="serviceActive">Status</label>
              <select id="serviceActive" name="isActive">
                <option value="true" ${state.admin.serviceForm.isActive ? "selected" : ""}>Active</option>
                <option value="false" ${!state.admin.serviceForm.isActive ? "selected" : ""}>Paused</option>
              </select>
            </div>
            ${
              state.admin.serviceForm.type === "combo"
                ? `
                  <div class="field" style="grid-column: 1 / -1;">
                    <label>Combo Items</label>
                    <div class="chip-row">
                      ${serviceOptions(state.services, state.admin.serviceForm.items)}
                    </div>
                  </div>
                `
                : ""
            }
            ${
              state.admin.serviceForm.previewImage
                ? `
                  <div class="field">
                    <label>Preview</label>
                    <img class="preview-image" src="${state.admin.serviceForm.previewImage}" alt="Service preview" />
                  </div>
                `
                : ""
            }
            <div class="action-row">
              <button class="primary-button" type="submit">${state.admin.serviceForm.editingId ? "Update Service" : "Create Service"}</button>
              ${
                state.admin.serviceForm.editingId
                  ? `<button class="ghost-button" type="button" data-action="reset-service-form">Cancel Edit</button>`
                  : ""
              }
            </div>
          </form>
        </div>
        <div class="admin-panel">
          <p class="eyebrow">Catalog</p>
          <h3>Singles and combo packages</h3>
          <div class="booking-list">
            ${state.services
              .map(
                (service) => `
                  <div class="compact-card">
                    <div class="booking-top">
                      <div>
                        <strong>${service.name}</strong>
                        <p class="small-copy">${service.type} • ${service.category}</p>
                      </div>
                      <button class="ghost-button" data-action="edit-service" data-id="${service._id}">Edit</button>
                    </div>
                    <div class="price-row">
                      <span class="price-main">₹${service.offer_price || service.price}</span>
                      ${service.offer_price ? `<span class="price-strike">₹${service.price}</span>` : ""}
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>

    <section class="page-panel">
      ${renderSectionHeader({
        eyebrow: "Admin ↔ User Sync",
        title: "Every booking keeps service, location and payment visibility in one place"
      })}
      <div class="booking-list">
        ${state.bookings.map((booking) => renderBookingCard(booking, "admin")).join("")}
      </div>
    </section>
  `;
}
