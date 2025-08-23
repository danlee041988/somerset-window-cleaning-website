export const siteConfig = {
  name: "Somerset Window Cleaning",
  legalName: "Somerset Window Cleaning",
  phone: "01458 860339",
  email: "info@somersetwindowcleaning.co.uk",
  
  address: {
    line1: "13 Rockhaven Business Centre",
    line2: "Gravenchon Way", 
    city: "Street",
    county: "Somerset",
    postcode: "BA16 0HW",
    country: "United Kingdom"
  },
  
  serviceAreas: [
    "Somerset", "North Somerset", "Mendip", "South Somerset", 
    "Wells", "Glastonbury", "Street", "Bridgwater", "Taunton", 
    "Yeovil", "Weston-Super-Mare", "Cheddar"
  ],
  
  postcodePrefixes: ["BA", "TA", "BS", "DT9"],
  
  bookingUrl: "/booking-2step",
  reviewUrl: "https://g.page/r/CQr1XNaOScPuEAE/review", // Update with your actual Google review URL
  
  guaranteeHours: 48,
  establishedYear: 2019,
  
  services: {
    window: {
      name: "Window Cleaning",
      fromPrice: "£20",
      description: "Pure water reach-and-wash system"
    },
    gutter: {
      name: "Gutter Clearing", 
      fromPrice: "£80",
      description: "High-reach vacuum system"
    },
    fascia: {
      name: "Fascia & Soffit Cleaning",
      fromPrice: "£90", 
      description: "UPVC restoration"
    },
    conservatory: {
      name: "Conservatory Roof Cleaning",
      fromPrice: "£40",
      description: "Glass & polycarbonate"
    },
    solar: {
      name: "Solar Panel Cleaning",
      fromPrice: "£40",
      description: "Efficiency maintenance"
    },
    commercial: {
      name: "Commercial Window Cleaning", 
      fromPrice: "Quote",
      description: "Business services"
    }
  },
  
  social: {
    whatsapp: "447415526331",
    facebook: "", // Add if you have one
    google: "https://g.page/r/CQr1XNaOScPuEAE" // Your Google Business Profile
  }
} as const;

export const policyCopy = {
  guarantee: `48-hour guarantee: if you notice any issues with your clean within ${siteConfig.guaranteeHours} hours, contact us and we'll return to address them at no charge.`,
  
  payment: `Payment by card or Direct Debit. Direct Debit runs automatically after each clean and is protected by the Direct Debit Guarantee.`,
  
  insurance: `Fully insured with £5 million public liability insurance for your complete peace of mind.`,
  
  areas: `We serve customers across ${siteConfig.serviceAreas.slice(0, 3).join(", ")} and surrounding areas. Contact us with your postcode to confirm coverage.`
} as const;