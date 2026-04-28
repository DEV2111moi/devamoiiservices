export function createAuthState() {
  return {
    mode: "user",
    role: null,
    step: "phone",
    pendingPhone: "",
    otp: "",
    adminEmail: "admin@devamoii.com",
    adminPassword: "admin123",
    currentUser: null
  };
}

export function isLoggedIn(auth) {
  return Boolean(auth.currentUser && auth.role);
}
