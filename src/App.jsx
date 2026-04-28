import { api } from "./services/api.js";
import { buildLocationPreset, demoOtp } from "./firebase/config.js";
import { createAuthState, isLoggedIn } from "./context/AuthContext.js";
import { renderLoginPage } from "./pages/Login.jsx";
import { renderServicesPage } from "./pages/Services.jsx";
import { renderCartPage } from "./pages/Cart.jsx";
import { renderBookingPage } from "./pages/Booking.jsx";
import { renderMyBookingsPage } from "./pages/MyBookings.jsx";
import { renderProfilePage } from "./pages/Profile.jsx";
import { renderAdminDashboard } from "./pages/AdminDashboard.jsx";

const app = document.getElementById("app");
const toast = document.getElementById("toast");
const approvalDialog = document.getElementById("approvalDialog");

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const state = {
  route: "services",
  auth: createAuthState(),
  services: [],
  bookings: [],
  userBookings: [],
  cart: [],
  profileDraft: {
    name: "",
    phone: "",
    email: "",
    addressLabel: "Home",
    addressText: buildLocationPreset("Home").addressText,
    lat: buildLocationPreset("Home").lat,
    lng: buildLocationPreset("Home").lng
  },
  bookingDraft: {
    date: tomorrow.toISOString().slice(0, 10),
    addressLabel: "Home",
    addressText: buildLocationPreset("Home").addressText
  },
  admin: {
    approval: {
      bookingId: null,
      paymentMethod: "razorpay",
      qrImage: "",
      linkPreview: ""
    },
    serviceForm: emptyServiceForm()
  }
};

function emptyServiceForm() {
  return {
    editingId: null,
    name: "",
    category: "",
    type: "single",
    items: [],
    price: "",
    offer_price: "",
    duration: "60 mins",
    isActive: true,
    previewImage: "",
    fileName: ""
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function getDefaultAddress(user = state.auth.currentUser) {
  if (!user) {
    return null;
  }

  return user.addresses.find((address) => address.isDefault) || user.addresses[0] || null;
}

function updateDraftFromDefaultAddress() {
  const address = getDefaultAddress();
  if (!address) {
    return;
  }

  state.bookingDraft.addressLabel = address.label;
  state.bookingDraft.addressText = address.addressText;
  state.profileDraft.addressLabel = address.label;
  state.profileDraft.addressText = address.addressText;
  state.profileDraft.lat = address.lat;
  state.profileDraft.lng = address.lng;
}

function syncDraftsFromDom() {
  const captureForm = document.getElementById("profileCaptureForm");
  if (captureForm) {
    const formData = new FormData(captureForm);
    state.profileDraft.name = formData.get("name") || state.profileDraft.name;
    state.profileDraft.phone = formData.get("phone") || state.profileDraft.phone;
    state.profileDraft.email = formData.get("email") || state.profileDraft.email;
    state.profileDraft.addressLabel = formData.get("label") || state.profileDraft.addressLabel;
    state.profileDraft.addressText = formData.get("addressText") || state.profileDraft.addressText;
    state.profileDraft.lat = formData.get("lat") || state.profileDraft.lat;
    state.profileDraft.lng = formData.get("lng") || state.profileDraft.lng;
  }

  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    const formData = new FormData(profileForm);
    state.profileDraft.name = formData.get("name") || state.profileDraft.name;
    state.profileDraft.email = formData.get("email") || state.profileDraft.email;
    state.profileDraft.addressLabel = formData.get("label") || state.profileDraft.addressLabel;
    state.profileDraft.addressText = formData.get("addressText") || state.profileDraft.addressText;
    state.profileDraft.lat = formData.get("lat") || state.profileDraft.lat;
    state.profileDraft.lng = formData.get("lng") || state.profileDraft.lng;
  }

  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    const formData = new FormData(bookingForm);
    const selected = String(formData.get("addressOption") || "").split("||");
    state.bookingDraft.date = formData.get("date") || state.bookingDraft.date;
    state.bookingDraft.addressLabel = selected[0] || state.bookingDraft.addressLabel;
    state.bookingDraft.addressText = formData.get("addressText") || state.bookingDraft.addressText;
  }

  const serviceForm = document.getElementById("serviceForm");
  if (serviceForm) {
    const formData = new FormData(serviceForm);
    state.admin.serviceForm.name = formData.get("name") || state.admin.serviceForm.name;
    state.admin.serviceForm.category = formData.get("category") || state.admin.serviceForm.category;
    state.admin.serviceForm.type = formData.get("type") || state.admin.serviceForm.type;
    state.admin.serviceForm.price = formData.get("price") || state.admin.serviceForm.price;
    state.admin.serviceForm.offer_price = formData.get("offer_price") || state.admin.serviceForm.offer_price;
    state.admin.serviceForm.duration = formData.get("duration") || state.admin.serviceForm.duration;
    state.admin.serviceForm.isActive = (formData.get("isActive") || "true") === "true";
    state.admin.serviceForm.items = Array.from(document.querySelectorAll('input[name="comboItems"]:checked')).map((input) => input.value);
  }
}

function computeCartTotal() {
  return state.cart.reduce((sum, item) => sum + Number(item.offer_price || item.price || 0), 0);
}

function renderStickyBar() {
  const pendingPayment = state.userBookings.find(
    (booking) => booking.paymentMethod === "razorpay" && booking.paymentStatus === "pending"
  );

  if (!state.cart.length && !pendingPayment) {
    return "";
  }

  return `
    <div class="sticky-bar">
      <div>
        ${
          state.cart.length
            ? `<strong>${state.cart.length} item${state.cart.length > 1 ? "s" : ""} in cart</strong><div class="small-copy">${formatCurrency(computeCartTotal())} ready for booking</div>`
            : `<strong>Payment waiting on ${pendingPayment._id}</strong><div class="small-copy">${pendingPayment.userFacingPaymentStatus}</div>`
        }
      </div>
      <div class="action-row">
        ${
          state.cart.length
            ? `<button class="primary-button" data-action="route-booking">Book Now</button>`
            : `<a class="primary-button" href="${pendingPayment.paymentLink}" target="_blank" rel="noreferrer">Pay Now</a>`
        }
      </div>
    </div>
  `;
}

function renderNavigation() {
  const isAdmin = state.auth.role === "admin";
  const routes = isAdmin
    ? [["admin", "Dashboard"]]
    : [
        ["services", "Services"],
        ["cart", "Cart"],
        ["booking", "Booking"],
        ["my-bookings", "My Bookings"],
        ["profile", "Profile"]
      ];

  return `
    <nav class="nav">
      <div class="brand">
        <div class="brand-mark">D</div>
        <div class="brand-copy">
          <strong>Devamoii</strong>
          <small class="muted">${isAdmin ? "Operations dashboard" : "Doorstep services, simplified"}</small>
        </div>
      </div>
      <div class="nav-links">
        ${routes
          .map(
            ([route, label]) => `
              <button class="nav-button ${state.route === route ? "active" : ""}" data-action="change-route" data-route="${route}">
                ${label}
              </button>
            `
          )
          .join("")}
      </div>
      <div class="nav-links">
        <span class="chip">${isAdmin ? "Admin" : "Customer"}</span>
        <button class="ghost-button" data-action="logout">Logout</button>
      </div>
    </nav>
  `;
}

function renderHero() {
  const isAdmin = state.auth.role === "admin";
  return `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${isAdmin ? "Operations Control" : "Home Services, Premium Care"}</p>
        <h1>${isAdmin ? "Manage approvals, services and payment follow-up from one clean dashboard." : "Book trusted home services with saved details and clear payment steps."}</h1>
        <p>
          ${
            isAdmin
              ? "Review booking details, contact customers, assign the right payment method, and keep every service order moving without friction."
              : "Choose services, reuse your saved address, pick a convenient date, and track each booking from request to completion."
          }
        </p>
      </div>
      <div class="hero-kpis">
        <div class="kpi">
          <span class="eyebrow">${isAdmin ? "Live Queue" : "Saved Profile"}</span>
          <strong>${isAdmin ? state.bookings.length : (getDefaultAddress() ? "Ready" : "Setup")}</strong>
          <small class="small-copy">${isAdmin ? "Bookings visible to operations" : "Default address and contact details available"}</small>
        </div>
        <div class="kpi">
          <span class="eyebrow">${isAdmin ? "Catalog" : "Offers"}</span>
          <strong>${state.services.length}</strong>
          <small class="small-copy">${state.services.filter((service) => service.type === "combo").length} combo offers active</small>
        </div>
        <div class="kpi">
          <span class="eyebrow">${isAdmin ? "Payment Control" : "Booking History"}</span>
          <strong>${isAdmin ? "3 Modes" : state.userBookings.length}</strong>
          <small class="small-copy">${isAdmin ? "Razorpay, QR and Cash at approval time" : "Bookings with timeline and payment status"}</small>
        </div>
      </div>
    </section>
  `;
}

function renderCurrentPage() {
  if (state.auth.role === "admin") {
    return renderAdminDashboard(state);
  }

  switch (state.route) {
    case "cart":
      return renderCartPage(state);
    case "booking":
      return renderBookingPage(state);
    case "my-bookings":
      return renderMyBookingsPage(state);
    case "profile":
      return renderProfilePage(state);
    case "admin":
      return renderAdminDashboard(state);
    default:
      return renderServicesPage(state);
  }
}

function renderLoggedInApp() {
  app.innerHTML = `
    <div class="shell">
      ${renderNavigation()}
      ${renderHero()}
      <div class="content-stack wide">
        ${renderCurrentPage()}
      </div>
      ${renderStickyBar()}
    </div>
  `;
}

function render() {
  if (!isLoggedIn(state.auth)) {
    app.innerHTML = renderLoginPage(state);
    return;
  }

  renderLoggedInApp();
}

async function refreshServices() {
  state.services = await api.getServices();
}

async function refreshBookings() {
  state.bookings = await api.getBookings();
  if (state.auth.currentUser && state.auth.role === "user") {
    state.userBookings = await api.getUserBookings(state.auth.currentUser._id);
    return;
  }

  state.userBookings = [];
}

async function loadInitialData() {
  await refreshServices();
  await refreshBookings();
  render();
}

async function loginWithOtp() {
  state.auth.otp = String(state.auth.otp || "").trim();
  if (state.auth.otp !== demoOtp()) {
    showToast("OTP mismatch. Use 123456 for the demo.");
    return;
  }

  try {
    const user = await api.getUserByPhone(state.auth.pendingPhone);
    state.auth.role = "user";
    state.auth.currentUser = user;
    updateDraftFromDefaultAddress();
    await refreshBookings();
    state.route = "services";
    render();
    showToast("Welcome back. Profile and address loaded.");
  } catch (error) {
    state.auth.step = "capture";
    state.profileDraft.phone = state.auth.pendingPhone;
    state.profileDraft.name = "";
    state.profileDraft.email = "";
    render();
    showToast("First login detected. Capture the profile to continue.");
  }
}

async function saveProfile(formData) {
  const payload = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    addresses: [
      {
        label: formData.get("label"),
        lat: Number(formData.get("lat")),
        lng: Number(formData.get("lng")),
        addressText: formData.get("addressText"),
        isDefault: true
      }
    ]
  };

  const user = await api.saveUserProfile(payload);
  state.auth.role = "user";
  state.auth.currentUser = user;
  state.auth.step = "phone";
  updateDraftFromDefaultAddress();
  await refreshBookings();
  state.route = "services";
  render();
  showToast("Profile saved. Future bookings will auto-fill this address.");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function addToCart(serviceId) {
  const service = state.services.find((item) => item._id === serviceId);
  if (!service) {
    return;
  }

  if (!state.cart.some((item) => item._id === serviceId)) {
    state.cart.push(service);
    render();
    showToast(`${service.name} added to cart.`);
  }
}

function removeFromCart(serviceId) {
  state.cart = state.cart.filter((item) => item._id !== serviceId);
  render();
}

async function submitBooking(formData) {
  const addressSelection = formData.get("addressOption")?.split("||") || [];
  const [addressLabel] = addressSelection;

  await api.createBooking({
    userId: state.auth.currentUser._id,
    serviceIds: state.cart.map((item) => item._id),
    date: formData.get("date"),
    addressLabel,
    addressText: formData.get("addressText")
  });

  state.cart = [];
  await refreshBookings();
  state.route = "my-bookings";
  render();
  showToast("Booking submitted. Admin review is now pending.");
}

async function saveProfileFromSettings(formData) {
  const newAddress = {
    label: formData.get("label"),
    lat: Number(formData.get("lat")),
    lng: Number(formData.get("lng")),
    addressText: formData.get("addressText"),
    isDefault: false
  };

  const existingAddresses = state.auth.currentUser.addresses.map((address) => ({ ...address }));
  if (newAddress.addressText) {
    existingAddresses.push(newAddress);
  }

  const payload = {
    name: formData.get("name"),
    phone: state.auth.currentUser.phone,
    email: formData.get("email"),
    addresses: existingAddresses
  };

  state.auth.currentUser = await api.saveUserProfile(payload);
  updateDraftFromDefaultAddress();
  render();
  showToast("Profile updated.");
}

async function persistDefaultAddress(index) {
  const addresses = state.auth.currentUser.addresses.map((address, addressIndex) => ({
    ...address,
    isDefault: addressIndex === index
  }));

  state.auth.currentUser = await api.saveUserProfile({
    name: state.auth.currentUser.name,
    phone: state.auth.currentUser.phone,
    email: state.auth.currentUser.email,
    addresses
  });

  updateDraftFromDefaultAddress();
  render();
  showToast("Default address updated.");
}

function openApprovalDialog(bookingId) {
  const booking = state.bookings.find((item) => item._id === bookingId);
  state.admin.approval = {
    bookingId,
    paymentMethod: "razorpay",
    qrImage: "",
    linkPreview: `https://rzp.io/i/${bookingId.toLowerCase()}-preview`
  };

  approvalDialog.innerHTML = `
    <div class="dialog-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Approve Booking</p>
          <h3>${booking._id} • ${booking.user.name}</h3>
        </div>
        <button class="ghost-button" data-action="close-approval">Close</button>
      </div>
      <div class="mode-grid">
        ${["razorpay", "qr", "cash"]
          .map(
            (mode) => `
              <label class="mode-option">
                <input type="radio" name="approvalPaymentMethod" value="${mode}" ${mode === "razorpay" ? "checked" : ""} />
                <strong>${mode === "razorpay" ? "💳 Razorpay" : mode === "qr" ? "📱 UPI QR" : "💵 Cash"}</strong>
                <span class="small-copy">${
                  mode === "razorpay"
                    ? "Generate secure payment link"
                    : mode === "qr"
                      ? "Upload or select QR image"
                      : "Collect payment on service"
                }</span>
              </label>
            `
          )
          .join("")}
      </div>
      <div class="modal-row" style="margin-top: 18px;">
        <div class="field" style="flex: 1;">
          <label>Razorpay Link Preview</label>
          <div class="compact-card">${state.admin.approval.linkPreview}</div>
        </div>
        <div class="field" style="flex: 1;">
          <label>QR Upload</label>
          <input id="approvalQrFile" class="file-input" type="file" accept="image/*" />
        </div>
      </div>
      <div id="approvalQrPreviewWrap" class="${state.admin.approval.qrImage ? "" : "hidden"}" style="margin-top: 12px;">
        <img class="preview-image" id="approvalQrPreview" src="${state.admin.approval.qrImage || ""}" alt="Approval QR preview" />
      </div>
      <div class="action-row" style="margin-top: 18px;">
        <button class="primary-button" data-action="confirm-approval">Confirm Approval</button>
      </div>
    </div>
  `;

  approvalDialog.showModal();
}

function closeApprovalDialog() {
  approvalDialog.close();
}

async function confirmApproval() {
  const selected = approvalDialog.querySelector('input[name="approvalPaymentMethod"]:checked');
  const paymentMethod = selected?.value || "razorpay";
  const payload = { paymentMethod };

  if (paymentMethod === "qr") {
    if (!state.admin.approval.qrImage) {
      showToast("Upload a QR image before approval.");
      return;
    }

    payload.qrImage = state.admin.approval.qrImage;
  }

  await api.approveBooking(state.admin.approval.bookingId, payload);
  closeApprovalDialog();
  await refreshBookings();
  render();
  showToast(`Booking approved with ${paymentMethod}.`);
}

async function saveService(formData, fileInput) {
  const selectedItems = Array.from(document.querySelectorAll('input[name="comboItems"]:checked')).map((input) => input.value);
  let image = state.admin.serviceForm.previewImage;
  let fileName = state.admin.serviceForm.fileName;

  if (fileInput?.files?.[0]) {
    image = await readFileAsDataUrl(fileInput.files[0]);
    fileName = fileInput.files[0].name;
  }

  const payload = {
    name: formData.get("name"),
    category: formData.get("category"),
    type: formData.get("type"),
    items: formData.get("type") === "combo" ? selectedItems : [],
    price: formData.get("price"),
    offer_price: formData.get("offer_price"),
    image,
    fileName,
    duration: formData.get("duration"),
    isActive: formData.get("isActive") === "true"
  };

  if (state.admin.serviceForm.editingId) {
    await api.updateService(state.admin.serviceForm.editingId, payload);
    showToast("Service updated.");
  } else {
    await api.createService(payload);
    showToast("Service created.");
  }

  state.admin.serviceForm = emptyServiceForm();
  await refreshServices();
  render();
}

function setPresetLocation(label) {
  syncDraftsFromDom();
  const location = buildLocationPreset(label);
  state.profileDraft.addressLabel = location.label;
  state.profileDraft.addressText = location.addressText;
  state.profileDraft.lat = location.lat;
  state.profileDraft.lng = location.lng;
  state.bookingDraft.addressLabel = location.label;
  state.bookingDraft.addressText = location.addressText;
  render();
}

function resetAuthState(mode = "user") {
  state.auth = createAuthState();
  state.auth.mode = mode;
  state.route = mode === "admin" ? "admin" : "services";
  state.cart = [];
  state.userBookings = [];
}

function loginAsAdmin(formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (email !== "admin@devamoii.com" || password !== "admin123") {
    throw new Error("Invalid admin credentials.");
  }

  state.auth.role = "admin";
  state.auth.currentUser = {
    _id: "ADMIN-1",
    name: "Operations Admin",
    email,
    phone: "+91 80000 00000",
    addresses: []
  };
  state.route = "admin";
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("button, a");

  if (!button || !button.dataset.action) {
    return;
  }

  const { action, id, route, index } = button.dataset;

  if (action === "fill-existing-user") {
    state.auth.mode = "user";
    state.auth.pendingPhone = "+91 98765 12345";
    render();
    return;
  }

  if (action === "set-auth-mode") {
    resetAuthState(button.dataset.mode || "user");
    render();
    return;
  }

  if (action === "back-to-phone") {
    state.auth.step = "phone";
    render();
    return;
  }

  if (action === "detect-location") {
    setPresetLocation("Home");
    showToast("Auto-detect filled the default Bengaluru location.");
    return;
  }

  if (action === "use-work-location") {
    setPresetLocation("Work");
    showToast("Work location applied.");
    return;
  }

  if (action === "change-route") {
    if (state.auth.role === "admin" && route !== "admin") {
      state.route = "admin";
      render();
      return;
    }
    state.route = route;
    render();
    return;
  }

  if (action === "logout") {
    resetAuthState("user");
    render();
    showToast("Logged out.");
    return;
  }

  if (action === "add-to-cart") {
    addToCart(id);
    return;
  }

  if (action === "remove-from-cart") {
    removeFromCart(id);
    return;
  }

  if (action === "route-booking") {
    state.route = "booking";
    render();
    return;
  }

  if (action === "booking-use-default") {
    updateDraftFromDefaultAddress();
    render();
    return;
  }

  if (action === "mark-paid") {
    await api.markQrPaid(id);
    await refreshBookings();
    render();
    showToast("QR payment submitted for admin verification.");
    return;
  }

  if (action === "make-default-address") {
    await persistDefaultAddress(Number(index));
    return;
  }

  if (action === "open-approval") {
    openApprovalDialog(id);
    return;
  }

  if (action === "close-approval") {
    closeApprovalDialog();
    return;
  }

  if (action === "confirm-approval") {
    await confirmApproval();
    return;
  }

  if (action === "admin-verify") {
    await api.verifyPayment(id);
    await refreshBookings();
    render();
    showToast("Payment verified.");
    return;
  }

  if (action === "simulate-webhook") {
    await api.simulateWebhook(id);
    await refreshBookings();
    render();
    showToast("Razorpay webhook processed.");
    return;
  }

  if (action === "complete-booking") {
    await api.completeBooking(id);
    await refreshBookings();
    render();
    showToast("Booking marked completed.");
    return;
  }

  if (action === "edit-service") {
    const service = state.services.find((item) => item._id === id);
    state.admin.serviceForm = {
      editingId: service._id,
      name: service.name,
      category: service.category,
      type: service.type,
      items: service.items || [],
      price: service.price,
      offer_price: service.offer_price || "",
      duration: service.duration,
      isActive: service.isActive,
      previewImage: service.image,
      fileName: ""
    };
    state.route = "admin";
    render();
    return;
  }

  if (action === "reset-service-form") {
    state.admin.serviceForm = emptyServiceForm();
    render();
  }
});

document.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);

  try {
    if (event.target.id === "phoneForm") {
      state.auth.pendingPhone = formData.get("phone");
      state.auth.step = "otp";
      render();
      showToast("OTP sent. Use 123456 for the local demo.");
      return;
    }

    if (event.target.id === "otpForm") {
      state.auth.otp = String(formData.get("otp") || "").trim();
      await loginWithOtp();
      return;
    }

    if (event.target.id === "adminLoginForm") {
      loginAsAdmin(formData);
      await refreshBookings();
      render();
      showToast("Admin dashboard ready.");
      return;
    }

    if (event.target.id === "profileCaptureForm") {
      await saveProfile(formData);
      return;
    }

    if (event.target.id === "bookingForm") {
      await submitBooking(formData);
      return;
    }

    if (event.target.id === "profileForm") {
      await saveProfileFromSettings(formData);
      return;
    }

    if (event.target.id === "serviceForm") {
      const fileInput = document.getElementById("serviceImage");
      await saveService(formData, fileInput);
    }
  } catch (error) {
    showToast(error.message);
  }
});

document.addEventListener("change", async (event) => {
  if (event.target.id === "serviceType") {
    syncDraftsFromDom();
    state.admin.serviceForm.type = event.target.value;
    render();
    return;
  }

  if (event.target.id === "serviceImage" && event.target.files?.[0]) {
    syncDraftsFromDom();
    state.admin.serviceForm.previewImage = await readFileAsDataUrl(event.target.files[0]);
    state.admin.serviceForm.fileName = event.target.files[0].name;
    render();
    return;
  }

  if (event.target.id === "approvalQrFile" && event.target.files?.[0]) {
    state.admin.approval.qrImage = await readFileAsDataUrl(event.target.files[0]);
    const previewWrap = document.getElementById("approvalQrPreviewWrap");
    const preview = document.getElementById("approvalQrPreview");
    if (previewWrap && preview) {
      previewWrap.classList.remove("hidden");
      preview.src = state.admin.approval.qrImage;
    }
  }
});

loadInitialData().catch((error) => {
  console.error(error);
  showToast("Failed to load local demo data.");
  render();
});
