const { randomUUID } = require("crypto");

function createSvgDataUrl({ title, subtitle, from, to, accent }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="480" height="320" rx="30" fill="url(#g)" />
      <circle cx="398" cy="80" r="62" fill="${accent}" opacity="0.22" />
      <circle cx="90" cy="248" r="74" fill="#ffffff" opacity="0.18" />
      <rect x="36" y="40" width="120" height="12" rx="6" fill="#ffffff" opacity="0.5" />
      <rect x="36" y="76" width="190" height="18" rx="9" fill="#ffffff" opacity="0.75" />
      <text x="36" y="170" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#1a1714">${title}</text>
      <text x="36" y="208" font-family="Arial, sans-serif" font-size="19" fill="#342b24">${subtitle}</text>
      <rect x="36" y="242" width="128" height="40" rx="20" fill="#ffffff" opacity="0.78" />
      <text x="68" y="268" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#1a1714">Book Now</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function createQrSvgDataUrl(label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <rect width="240" height="240" fill="#fffdf8"/>
      <rect x="20" y="20" width="58" height="58" fill="#171311"/>
      <rect x="36" y="36" width="26" height="26" fill="#fffdf8"/>
      <rect x="162" y="20" width="58" height="58" fill="#171311"/>
      <rect x="178" y="36" width="26" height="26" fill="#fffdf8"/>
      <rect x="20" y="162" width="58" height="58" fill="#171311"/>
      <rect x="36" y="178" width="26" height="26" fill="#fffdf8"/>
      <g fill="#171311">
        <rect x="96" y="24" width="14" height="14"/>
        <rect x="124" y="24" width="14" height="14"/>
        <rect x="96" y="52" width="14" height="14"/>
        <rect x="138" y="66" width="14" height="14"/>
        <rect x="82" y="94" width="14" height="14"/>
        <rect x="110" y="94" width="14" height="14"/>
        <rect x="138" y="94" width="14" height="14"/>
        <rect x="166" y="94" width="14" height="14"/>
        <rect x="96" y="122" width="14" height="14"/>
        <rect x="124" y="122" width="14" height="14"/>
        <rect x="152" y="122" width="14" height="14"/>
        <rect x="82" y="150" width="14" height="14"/>
        <rect x="110" y="150" width="14" height="14"/>
        <rect x="138" y="150" width="14" height="14"/>
        <rect x="166" y="150" width="14" height="14"/>
        <rect x="96" y="178" width="14" height="14"/>
        <rect x="124" y="178" width="14" height="14"/>
      </g>
      <text x="120" y="228" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#171311">${label}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const users = [
  {
    _id: "USR-1001",
    name: "Priya Nair",
    phone: "+91 98765 12345",
    email: "priya.nair@example.com",
    addresses: [
      {
        label: "Home",
        lat: 12.972442,
        lng: 77.580643,
        addressText: "12, 5th Main, Indiranagar, Bengaluru",
        isDefault: true
      },
      {
        label: "Work",
        lat: 12.966731,
        lng: 77.641144,
        addressText: "Innov8 Hub, Koramangala, Bengaluru",
        isDefault: false
      }
    ],
    createdAt: "2026-04-01T08:00:00.000Z"
  },
  {
    _id: "USR-1002",
    name: "Rahul Menon",
    phone: "+91 99887 00123",
    email: "rahul.menon@example.com",
    addresses: [
      {
        label: "Home",
        lat: 12.934533,
        lng: 77.626579,
        addressText: "22, 1st Cross, Koramangala, Bengaluru",
        isDefault: true
      }
    ],
    createdAt: "2026-03-28T09:20:00.000Z"
  },
  {
    _id: "USR-1003",
    name: "Meera Kapoor",
    phone: "+91 91234 56789",
    email: "meera.k@example.com",
    addresses: [
      {
        label: "Home",
        lat: 12.911622,
        lng: 77.647476,
        addressText: "88, 14th Main, HSR Layout, Bengaluru",
        isDefault: true
      }
    ],
    createdAt: "2026-03-25T10:45:00.000Z"
  }
];

const services = [
  {
    _id: "SRV-2001",
    name: "Deep Home Cleaning",
    type: "single",
    items: [],
    price: 2499,
    offer_price: 1999,
    image: createSvgDataUrl({
      title: "Deep Cleaning",
      subtitle: "Kitchen, living room and floors restored in one visit.",
      from: "#f7e5d0",
      to: "#f0c7a3",
      accent: "#c85c2f"
    }),
    category: "Home Care",
    duration: "3 hrs",
    isActive: true
  },
  {
    _id: "SRV-2002",
    name: "Sofa Shampoo",
    type: "single",
    items: [],
    price: 1499,
    offer_price: 1299,
    image: createSvgDataUrl({
      title: "Sofa Shampoo",
      subtitle: "Fabric-safe treatment with quick dry extraction.",
      from: "#dceef2",
      to: "#bedde3",
      accent: "#0c7c78"
    }),
    category: "Home Care",
    duration: "90 mins",
    isActive: true
  },
  {
    _id: "SRV-2003",
    name: "AC Service",
    type: "single",
    items: [],
    price: 1299,
    offer_price: 1099,
    image: createSvgDataUrl({
      title: "AC Service",
      subtitle: "Cooling restore, wash, gas check and diagnostics.",
      from: "#eff2ff",
      to: "#d7defe",
      accent: "#5870d9"
    }),
    category: "Appliance",
    duration: "75 mins",
    isActive: true
  },
  {
    _id: "SRV-2004",
    name: "Salon at Home",
    type: "single",
    items: [],
    price: 1799,
    offer_price: 1599,
    image: createSvgDataUrl({
      title: "Salon at Home",
      subtitle: "Facial, threading and grooming by trained experts.",
      from: "#f6dfe7",
      to: "#f0c5d4",
      accent: "#8f3c67"
    }),
    category: "Beauty",
    duration: "2 hrs",
    isActive: true
  },
  {
    _id: "CMB-3001",
    name: "Weekend Home Reset",
    type: "combo",
    items: ["SRV-2001", "SRV-2002"],
    price: 3998,
    offer_price: 2999,
    image: createSvgDataUrl({
      title: "Weekend Reset",
      subtitle: "Deep cleaning + sofa refresh bundled for better value.",
      from: "#f3ead1",
      to: "#d8c89b",
      accent: "#b38a2f"
    }),
    category: "Combo",
    duration: "4.5 hrs",
    isActive: true
  },
  {
    _id: "CMB-3002",
    name: "Comfort Cooling Pack",
    type: "combo",
    items: ["SRV-2003", "SRV-2002"],
    price: 2798,
    offer_price: 2199,
    image: createSvgDataUrl({
      title: "Cooling Pack",
      subtitle: "AC tune-up with upholstery refresh in one visit.",
      from: "#dff3ee",
      to: "#c2e7dd",
      accent: "#0f7d63"
    }),
    category: "Combo",
    duration: "3 hrs",
    isActive: true
  }
];

const bookings = [
  {
    _id: "BK-4001",
    userId: "USR-1001",
    serviceIds: ["CMB-3001"],
    totalAmount: 2999,
    addressSnapshot: {
      label: "Home",
      lat: 12.972442,
      lng: 77.580643,
      addressText: "12, 5th Main, Indiranagar, Bengaluru"
    },
    date: "2026-05-02",
    status: "requested",
    paymentMethod: null,
    paymentStatus: null,
    paymentLink: "",
    qrImage: "",
    createdAt: "2026-04-27T10:20:00.000Z"
  },
  {
    _id: "BK-4002",
    userId: "USR-1002",
    serviceIds: ["SRV-2003", "SRV-2002"],
    totalAmount: 2199,
    addressSnapshot: {
      label: "Home",
      lat: 12.934533,
      lng: 77.626579,
      addressText: "22, 1st Cross, Koramangala, Bengaluru"
    },
    date: "2026-05-04",
    status: "payment_pending",
    paymentMethod: "qr",
    paymentStatus: "pending",
    paymentLink: "",
    qrImage: createQrSvgDataUrl("UPI Demo QR"),
    createdAt: "2026-04-26T14:10:00.000Z"
  },
  {
    _id: "BK-4003",
    userId: "USR-1003",
    serviceIds: ["SRV-2004"],
    totalAmount: 1599,
    addressSnapshot: {
      label: "Home",
      lat: 12.911622,
      lng: 77.647476,
      addressText: "88, 14th Main, HSR Layout, Bengaluru"
    },
    date: "2026-05-05",
    status: "paid",
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    paymentLink: "https://rzp.io/i/demo-BK-4003",
    qrImage: "",
    createdAt: "2026-04-25T09:00:00.000Z"
  }
];

const counters = {
  user: 1004,
  service: 2005,
  combo: 3003,
  booking: 4004
};

function nextId(type) {
  if (type === "user") {
    counters.user += 1;
    return `USR-${counters.user}`;
  }

  if (type === "service") {
    counters.service += 1;
    return `SRV-${counters.service}`;
  }

  if (type === "combo") {
    counters.combo += 1;
    return `CMB-${counters.combo}`;
  }

  counters.booking += 1;
  return `BK-${counters.booking}`;
}

function createPaymentLink(bookingId) {
  return `https://rzp.io/i/${bookingId.toLowerCase()}-${randomUUID().slice(0, 8)}`;
}

module.exports = {
  users,
  services,
  bookings,
  nextId,
  createSvgDataUrl,
  createQrSvgDataUrl,
  createPaymentLink
};
