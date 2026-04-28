import { renderSectionHeader } from "../components/SectionHeader.jsx";

export function renderLoginPage(state) {
  const step = state.auth.step;
  const firstLogin = step === "capture";

  return `
    <div class="login-layout">
      <section class="login-card">
        <div>
          <p class="eyebrow">Devamoii Home Services</p>
          <h2>Trusted doorstep services with a cleaner booking and approval experience.</h2>
          <p class="small-copy">
            Customers can book in minutes, while operations teams manage approvals, payment collection, and service catalog updates from one dashboard.
          </p>
        </div>
        <div class="trust-grid">
          <div class="integration-item">
            <strong>Fast Booking</strong>
            <p class="small-copy">Saved profile and address details speed up repeat bookings.</p>
          </div>
          <div class="integration-item">
            <strong>Flexible Payments</strong>
            <p class="small-copy">Razorpay, QR, and cash are selected only after admin approval.</p>
          </div>
          <div class="integration-item">
            <strong>Operations Visibility</strong>
            <p class="small-copy">Bookings, users, locations, and services stay connected in one flow.</p>
          </div>
        </div>
      </section>

      <section class="login-card">
        <div class="tab-row">
          <button class="tab-button ${state.auth.mode === "user" ? "active" : ""}" data-action="set-auth-mode" data-mode="user">Customer Login</button>
          <button class="tab-button ${state.auth.mode === "admin" ? "active" : ""}" data-action="set-auth-mode" data-mode="admin">Admin Login</button>
        </div>
        ${renderSectionHeader({
          eyebrow: state.auth.mode === "admin" ? "Admin Access" : firstLogin ? "First Login" : "Customer Login",
          title:
            state.auth.mode === "admin"
              ? "Access the operations dashboard"
              : firstLogin
                ? "Capture profile details"
                : "Verify phone with OTP"
        })}
        ${state.auth.mode === "user" && !firstLogin ? `
          <div class="helper">Use <strong>+91 98765 12345</strong> for an existing customer or any new number for first-time signup. Demo OTP: <strong>123456</strong>.</div>
        ` : ""}
        ${
          state.auth.mode === "user" && step === "phone"
            ? `
              <div class="otp-box">
                <form id="phoneForm" class="form-grid single">
                  <div class="field">
                    <label for="phoneInput">Phone Number</label>
                    <input id="phoneInput" name="phone" placeholder="+91 98765 12345" value="${state.auth.pendingPhone || ""}" />
                  </div>
                  <div class="action-row">
                    <button class="primary-button" type="submit">Send OTP</button>
                    <button class="ghost-button" type="button" data-action="fill-existing-user">Use Existing Demo</button>
                  </div>
                </form>
              </div>
            `
            : ""
        }
        ${
          state.auth.mode === "user" && step === "otp"
            ? `
              <div class="otp-box">
                <form id="otpForm" class="form-grid single">
                  <div class="field">
                    <label for="otpInput">Enter OTP</label>
                    <input id="otpInput" name="otp" placeholder="123456" value="${state.auth.otp}" />
                  </div>
                  <div class="action-row">
                    <button class="primary-button" type="submit">Verify OTP</button>
                    <button class="ghost-button" type="button" data-action="back-to-phone">Change Phone</button>
                  </div>
                </form>
              </div>
            `
            : ""
        }
        ${
          state.auth.mode === "admin"
            ? `
              <div class="otp-box">
                <form id="adminLoginForm" class="form-grid single">
                  <div class="field">
                    <label for="adminEmail">Work Email</label>
                    <input id="adminEmail" name="email" value="${state.auth.adminEmail}" />
                  </div>
                  <div class="field">
                    <label for="adminPassword">Password</label>
                    <input id="adminPassword" name="password" type="password" value="${state.auth.adminPassword}" />
                  </div>
                  <div class="helper">Demo admin credentials: <strong>admin@devamoii.com</strong> / <strong>admin123</strong>.</div>
                  <div class="action-row">
                    <button class="primary-button" type="submit">Login as Admin</button>
                  </div>
                </form>
              </div>
            `
            : ""
        }
        ${
          firstLogin
            ? `
              <div class="capture-box">
                <form id="profileCaptureForm" class="form-grid">
                  <div class="field">
                    <label for="captureName">Full Name</label>
                    <input id="captureName" name="name" value="${state.profileDraft.name}" />
                  </div>
                  <div class="field">
                    <label for="capturePhone">Phone</label>
                    <input id="capturePhone" name="phone" value="${state.profileDraft.phone}" readonly />
                  </div>
                  <div class="field">
                    <label for="captureEmail">Email (optional)</label>
                    <input id="captureEmail" name="email" value="${state.profileDraft.email}" />
                  </div>
                  <div class="field">
                    <label for="captureLabel">Address Label</label>
                    <select id="captureLabel" name="label">
                      <option value="Home" ${state.profileDraft.addressLabel === "Home" ? "selected" : ""}>Home</option>
                      <option value="Work" ${state.profileDraft.addressLabel === "Work" ? "selected" : ""}>Work</option>
                    </select>
                  </div>
                  <div class="field">
                    <label for="captureAddress">Address</label>
                    <textarea id="captureAddress" name="addressText">${state.profileDraft.addressText}</textarea>
                  </div>
                  <div class="field">
                    <label for="captureLat">Latitude</label>
                    <input id="captureLat" name="lat" value="${state.profileDraft.lat}" />
                  </div>
                  <div class="field">
                    <label for="captureLng">Longitude</label>
                    <input id="captureLng" name="lng" value="${state.profileDraft.lng}" />
                  </div>
                  <div class="field">
                    <label>Location Helpers</label>
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
            `
            : ""
        }
      </section>
    </div>
  `;
}
