function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function renderServiceCard(service, options = {}) {
  const { inCart = false } = options;
  const includes = service.includedServices || [];
  const badge = service.offer_price ? `<span class="offer-badge">Offer ${formatCurrency(service.offer_price)}</span>` : "";
  const priceToUse = service.offer_price || service.price;

  return `
    <article class="service-card">
      <img src="${service.image}" alt="${service.name}" />
      <div class="badge-row">
        <span class="chip">${service.type === "combo" ? "🔥 Combo Offer" : service.category}</span>
        ${badge}
      </div>
      <div>
        <h3>${service.name}</h3>
        <p class="small-copy">${service.duration} • ${service.isActive ? "Active" : "Paused"}</p>
      </div>
      ${
        includes.length
          ? `
            <div class="compact-card">
              <strong>Included services</strong>
              <div class="detail-list">
                ${includes.map((item) => `<span>${item.name}</span>`).join("")}
              </div>
            </div>
          `
          : ""
      }
      <div class="price-row">
        <span class="price-main">${formatCurrency(priceToUse)}</span>
        ${service.offer_price ? `<span class="price-strike">${formatCurrency(service.price)}</span>` : ""}
      </div>
      <div class="action-row">
        <button class="primary-button" data-action="${inCart ? "remove-from-cart" : "add-to-cart"}" data-id="${service._id}">
          ${inCart ? "Remove from Cart" : "Add to Cart"}
        </button>
      </div>
    </article>
  `;
}
