function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function renderCartPage(state) {
  const cartTotal = state.cart.reduce((sum, item) => sum + Number(item.offer_price || item.price || 0), 0);

  if (state.cart.length === 0) {
    return `
      <section class="page-panel">
        <p class="eyebrow">Cart</p>
        <div class="empty-state">
          <strong>No services in cart yet.</strong>
          <p class="small-copy">Add single services or combo packages from the services screen.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="page-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Cart</p>
          <h2>Review service selection before booking</h2>
        </div>
        <button class="primary-button" data-action="route-booking">Proceed to Booking</button>
      </div>
      <div class="booking-list">
        ${state.cart
          .map(
            (item) => `
              <div class="compact-card">
                <div class="booking-top">
                  <div>
                    <strong>${item.name}</strong>
                    <p class="small-copy">${item.duration} • ${item.type === "combo" ? "Combo" : item.category}</p>
                  </div>
                  <button class="ghost-button" data-action="remove-from-cart" data-id="${item._id}">Remove</button>
                </div>
                <div class="price-row">
                  <span class="price-main">${formatCurrency(item.offer_price || item.price)}</span>
                  ${item.offer_price ? `<span class="price-strike">${formatCurrency(item.price)}</span>` : ""}
                </div>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="summary-block">
        <div class="booking-top">
          <div>
            <p class="eyebrow">Cart Summary</p>
            <h3>${state.cart.length} item${state.cart.length > 1 ? "s" : ""}</h3>
          </div>
          <strong>${formatCurrency(cartTotal)}</strong>
        </div>
      </div>
    </section>
  `;
}
