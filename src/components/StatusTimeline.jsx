export function renderStatusTimeline(steps) {
  return `
    <div class="timeline">
      <div class="timeline-track">
        ${steps
          .map(
            (step) => `
              <div class="timeline-step ${step.done ? "done" : ""}">
                <span>${step.label}</span>
                <small>${step.done ? "Active" : "Upcoming"}</small>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}
