export function renderProfilePage(state) {
  const user = state.auth.currentUser;

  return `
    <section class="page-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Profile</p>
          <h2>Edit saved addresses and default booking details</h2>
        </div>
      </div>
      <div class="profile-grid">
        <div class="profile-panel">
          <div class="profile-top">
            <div>
              <h3>${user.name}</h3>
              <p class="small-copy">${user.phone}</p>
            </div>
            <span class="chip">Firebase OTP</span>
          </div>
          <form id="profileForm" class="form-grid">
            <div class="field">
              <label for="profileName">Name</label>
              <input id="profileName" name="name" value="${user.name}" />
            </div>
            <div class="field">
              <label for="profileEmail">Email</label>
              <input id="profileEmail" name="email" value="${user.email || ""}" />
            </div>
            <div class="field">
              <label for="profileLabel">New Address Label</label>
              <select id="profileLabel" name="label">
                <option value="Home">Home</option>
                <option value="Work">Work</option>
              </select>
            </div>
            <div class="field">
              <label for="profileAddressText">Address Text</label>
              <textarea id="profileAddressText" name="addressText">${state.profileDraft.addressText}</textarea>
            </div>
            <div class="field">
              <label for="profileLat">Latitude</label>
              <input id="profileLat" name="lat" value="${state.profileDraft.lat}" />
            </div>
            <div class="field">
              <label for="profileLng">Longitude</label>
              <input id="profileLng" name="lng" value="${state.profileDraft.lng}" />
            </div>
            <div class="field">
              <label>Location helpers</label>
              <div class="action-row">
                <button type="button" class="ghost-button" data-action="detect-location">Auto Detect</button>
                <button type="button" class="ghost-button" data-action="use-work-location">Use Work Pin</button>
              </div>
            </div>
            <div class="action-row">
              <button class="primary-button" type="submit">Save Profile</button>
            </div>
          </form>
        </div>
        <div class="profile-panel">
          <h3>Saved Addresses</h3>
          <div class="address-list">
            ${user.addresses
              .map(
                (address, index) => `
                  <div class="address-card">
                    <div class="booking-top">
                      <div>
                        <strong>${address.label}</strong>
                        <p class="small-copy">${address.addressText}</p>
                        <p class="small-copy">Lat ${address.lat}, Lng ${address.lng}</p>
                      </div>
                      ${address.isDefault ? `<span class="chip">Default</span>` : ""}
                    </div>
                    <div class="action-row">
                      <button class="ghost-button" data-action="make-default-address" data-index="${index}">Make Default</button>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}
