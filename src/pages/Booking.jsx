import { renderStatusTimeline } from "../components/StatusTimeline.jsx";

function buildPreviewTimeline() {
  return [
    { label: "Requested", done: true },
    { label: "Confirmed", done: false },
    { label: "Payment Pending", done: false },
    { label: "Paid", done: false },
    { label: "Completed", done: false }
  ];
}

export function renderBookingPage(state) {
  if (!state.cart.length) {
    return `
      <section class="page-panel">
        <p class="eyebrow">Booking</p>
        <div class="empty-state">
          <strong>Cart is empty.</strong>
          <p class="small-copy">Add services first to start a frictionless booking flow.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="page-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Booking</p>
          <h2>Confirm date and address before submitting</h2>
        </div>
      </div>
      <div class="split-grid">
        <div class="profile-panel">
          <h3>Pre-filled customer details</h3>
          <form id="bookingForm" class="form-grid">
            <div class="field">
              <label>Name</label>
              <input value="${state.auth.currentUser.name}" readonly />
            </div>
            <div class="field">
              <label>Phone</label>
              <input value="${state.auth.currentUser.phone}" readonly />
            </div>
            <div class="field">
              <label for="bookingDate">Preferred Date</label>
              <input id="bookingDate" name="date" type="date" value="${state.bookingDraft.date}" />
            </div>
            <div class="field">
              <label for="bookingAddress">Address</label>
              <select id="bookingAddress" name="addressOption">
                ${state.auth.currentUser.addresses
                  .map(
                    (address) => `
                      <option value="${address.label}||${address.addressText}" ${
                        state.bookingDraft.addressLabel === address.label ? "selected" : ""
                      }>
                        ${address.label} • ${address.addressText}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </div>
            <div class="field">
              <label for="bookingAddressText">Address Text</label>
              <textarea id="bookingAddressText" name="addressText">${state.bookingDraft.addressText}</textarea>
            </div>
            <div class="field">
              <label>Helpers</label>
              <div class="action-row">
                <button class="ghost-button" type="button" data-action="booking-use-default">Use Default Address</button>
                <button class="ghost-button" type="button" data-action="detect-location">Auto Detect</button>
              </div>
            </div>
            <div class="action-row">
              <button class="primary-button" type="submit">Submit Booking</button>
            </div>
          </form>
        </div>
        <div class="summary-block">
          <p class="eyebrow">Booking Status Preview</p>
          <h3>Single source of truth</h3>
          ${renderStatusTimeline(buildPreviewTimeline())}
          <div class="detail-list">
            <div class="detail-item"><strong>Services</strong><span>${state.cart.map((item) => item.name).join(", ")}</span></div>
            <div class="detail-item"><strong>Default address</strong><span>${state.defaultAddress?.addressText || "Address required"}</span></div>
            <div class="detail-item"><strong>Payment</strong><span>Chosen by admin at approval time.</span></div>
          </div>
        </div>
      </div>
    </section>
  `;
}
