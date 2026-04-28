export function renderSectionHeader({ eyebrow, title, description, actionMarkup = "" }) {
  return `
    <div class="section-head">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h2>${title}</h2>
        ${description ? `<p class="small-copy">${description}</p>` : ""}
      </div>
      ${actionMarkup}
    </div>
  `;
}
