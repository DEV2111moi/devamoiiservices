import { renderStatusTimeline } from "./StatusTimeline.jsx";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function renderPaymentBox(booking, context) {
  if (context === "user") {
    if (booking.paymentMethod === "razorpay" && booking.paymentStatus === "pending") {
      return `
        <div class="compact-card">
          <strong>Payment Link</strong>
          <p class="small-copy">Booking approved. Complete payment through Razorpay to move this booking to paid.</p>
          <div class="action-row">
            <a class="primary-button" href="${booking.paymentLink}" target="_blank" rel="noreferrer">Pay Now</a>
          </div>
        </div>
      `;
    }

    if (booking.paymentMethod === "qr") {
      return `
        <div class="compact-card">
          <strong>Scan & Pay</strong>
          <p class="small-copy">Scan the QR and tap "I Have Paid" once the transfer is done.</p>
          <img class="preview-image" src="${booking.qrImage}" alt="QR for ${booking._id}" />
          ${
            booking.paymentStatus === "pending"
              ? `<div class="action-row"><button class="primary-button" data-action="mark-paid" data-id="${booking._id}">I Have Paid</button></div>`
              : ""
          }
        </div>
      `;
    }

    if (booking.paymentMethod === "cash") {
      return `
        <div class="compact-card">
          <strong>Cash at Service</strong>
          <p class="small-copy">No online action required. The admin will mark payment complete after the service visit.</p>
        </div>
      `;
    }
  }

  if (context === "admin") {
    return `
      <div class="action-row">
        <a class="ghost-button" href="tel:${booking.user.phone}">Call</a>
        ${
          booking.status === "requested" || booking.status === "payment_pending"
            ? `<button class="primary-button" data-action="open-approval" data-id="${booking._id}">Approve</button>`
            : ""
        }
        ${
          booking.paymentMethod === "razorpay" && booking.paymentStatus === "pending"
            ? `<button class="ghost-button" data-action="simulate-webhook" data-id="${booking._id}">Verify Razorpay</button>`
            : ""
        }
        ${
          booking.paymentMethod === "qr" && booking.paymentStatus === "pending_verification"
            ? `<button class="ghost-button" data-action="admin-verify" data-id="${booking._id}">Verify QR Payment</button>`
            : ""
        }
        ${
          booking.paymentMethod === "cash" && booking.status !== "completed"
            ? `<button class="ghost-button" data-action="admin-verify" data-id="${booking._id}">Mark Cash Paid</button>`
            : ""
        }
        ${
          booking.status === "paid"
            ? `<button class="ghost-button" data-action="complete-booking" data-id="${booking._id}">Mark Completed</button>`
            : ""
        }
      </div>
    `;
  }

  return "";
}

export function renderBookingCard(booking, context = "user") {
  return `
    <article class="booking-card">
      <div class="booking-top">
        <div>
          <p class="eyebrow">${context === "user" ? booking._id : booking.user.name}</p>
          <h3>${context === "user" ? booking.services.map((service) => service.name).join(", ") : booking._id}</h3>
          <p class="small-copy">${booking.date} • ${booking.location}</p>
        </div>
        <div class="chip-row">
          <span class="status-chip status-${booking.status}">${booking.status.replaceAll("_", " ")}</span>
          ${booking.paymentStatus ? `<span class="status-chip status-${booking.paymentStatus}">${booking.userFacingPaymentStatus}</span>` : ""}
        </div>
      </div>
      <div class="meta-grid">
        <span><strong>Total:</strong> ${formatCurrency(booking.totalAmount)}</span>
        <span><strong>Services:</strong> ${booking.services.length}</span>
        <span><strong>Payment:</strong> ${booking.paymentMethod || "Not selected"}</span>
        <span><strong>Address:</strong> ${booking.addressSnapshot.label}</span>
      </div>
      ${renderStatusTimeline(booking.timeline)}
      ${
        context === "admin"
          ? `
            <div class="map-box">
              <div class="map-grid">
                <div>
                  <strong>${booking.user.name}</strong>
                  <p class="small-copy">${booking.user.phone}</p>
                  <p class="small-copy">${booking.addressSnapshot.addressText}</p>
                  <p class="small-copy">Lat ${booking.addressSnapshot.lat}, Lng ${booking.addressSnapshot.lng}</p>
                </div>
                <div class="map-pin">📍</div>
              </div>
            </div>
          `
          : ""
      }
      ${renderPaymentBox(booking, context)}
    </article>
  `;
}
