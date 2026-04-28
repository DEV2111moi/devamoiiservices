import { renderBookingCard } from "../components/BookingCard.jsx";

export function renderMyBookingsPage(state) {
  return `
    <section class="page-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">My Bookings</p>
          <h2>Bookings, service details and payment state stay in sync</h2>
        </div>
      </div>
      <div class="booking-list">
        ${
          state.userBookings.length
            ? state.userBookings.map((booking) => renderBookingCard(booking, "user")).join("")
            : `<div class="empty-state"><strong>No bookings yet.</strong><p class="small-copy">Booked services will appear here with payment actions after admin approval.</p></div>`
        }
      </div>
    </section>
  `;
}
