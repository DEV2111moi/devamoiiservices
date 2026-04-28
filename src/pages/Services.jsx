import { renderSectionHeader } from "../components/SectionHeader.jsx";
import { renderServiceCard } from "../components/ServiceCard.jsx";

export function renderServicesPage(state) {
  const singles = state.services.filter((service) => service.type === "single" && service.isActive);
  const combos = state.services.filter((service) => service.type === "combo" && service.isActive);

  return `
    <section class="page-panel">
      ${renderSectionHeader({
        eyebrow: "Home / Services",
        title: "Choose services with saved profile and faster checkout",
        description: "Service cards show images, offer prices, durations and combo savings. Cart and booking auto-fill from the user profile."
      })}
      <div class="split-grid">
        <div class="summary-block">
          <p class="eyebrow">Saved Profile</p>
          <h3>${state.auth.currentUser.name}</h3>
          <p class="small-copy">${state.auth.currentUser.phone}</p>
          <p class="small-copy">${state.defaultAddress?.addressText || "No default address yet."}</p>
        </div>
        <div class="summary-block">
          <p class="eyebrow">Booking UX</p>
          <div class="status-list">
            <div class="status-item"><strong>Pre-filled details</strong><span>Name, phone and default address are reused automatically.</span></div>
            <div class="status-item"><strong>Flexible scheduling</strong><span>Users can still change date and address before submit.</span></div>
            <div class="status-item"><strong>Status sync</strong><span>Requested → Confirmed → Payment Pending → Paid → Completed.</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="page-panel">
      ${renderSectionHeader({
        eyebrow: "🔥 Combo Offers",
        title: "Bundle multiple services at a lower package price",
        description: "Each combo shows the included services and the original total versus the offer price."
      })}
      <div class="card-grid">
        ${combos.map((service) => renderServiceCard(service, { inCart: state.cart.some((item) => item._id === service._id) })).join("")}
      </div>
    </section>

    <section class="page-panel">
      ${renderSectionHeader({
        eyebrow: "Single Services",
        title: "Card-based services with clear prices and offer badges"
      })}
      <div class="card-grid">
        ${singles.map((service) => renderServiceCard(service, { inCart: state.cart.some((item) => item._id === service._id) })).join("")}
      </div>
    </section>
  `;
}
