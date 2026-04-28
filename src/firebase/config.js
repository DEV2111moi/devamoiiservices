export const firebaseConfig = {
  authMode: "Firebase Authentication (OTP) - simulated locally",
  storageFolderServices: "/services/{timestamp}_{filename}",
  storageFolderQr: "/qr/{bookingId}.png",
  mapsMode: "Google Maps auto-detect simulated with saved geo presets"
};

export function buildLocationPreset(label) {
  if (label === "Home") {
    return {
      label: "Home",
      lat: 12.972442,
      lng: 77.580643,
      addressText: "12, 5th Main, Indiranagar, Bengaluru",
      isDefault: true
    };
  }

  return {
    label: "Work",
    lat: 12.966731,
    lng: 77.641144,
    addressText: "Innov8 Hub, Koramangala, Bengaluru",
    isDefault: false
  };
}

export function demoOtp() {
  return "123456";
}
