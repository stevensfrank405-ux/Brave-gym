// Mock initial state and data models conforming to brave gym specification.md

export const INITIAL_PROGRAMS = [
  {
    id: "boxing",
    tag: "STRIKING & FOOTWORK",
    title: "Championship Boxing",
    subtitle: "Heavy bag drill, kinetic chain rotation, head movement, and sparring discipline.",
    duration: "60 MIN",
    intensity: "HIGH",
    trainer: "Marcus Vance",
    capacity: 16,
    enrolled: 14,
    image: "/media/boxing-hero.mp4",
    poster: "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg",
    details: "Focuses on explosive power generation, tactical ring presence, and cardiovascular threshold conditioning."
  },
  {
    id: "strength",
    tag: "RESISTANCE & POWER",
    title: "Iron Discipline Strength",
    subtitle: "Barbell mastery, compound movements, deadlift mechanics, and neuromuscular recruitment.",
    duration: "75 MIN",
    intensity: "ELITE",
    trainer: "Elena Rostova",
    capacity: 12,
    enrolled: 10,
    image: "/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg",
    details: "Progressive overload methodology programmed to build absolute power, tendon resilience, and muscle density."
  },
  {
    id: "conditioning",
    tag: "AEROBIC THRESHOLD",
    title: "Metabolic Warfare",
    subtitle: "Ski-erg, assault runner intervals, kettlebell ballistic circuits, and breath control.",
    duration: "50 MIN",
    intensity: "MAXIMAL",
    trainer: "Jaxson Cole",
    capacity: 20,
    enrolled: 18,
    image: "/media/hermes-rivera-qbf59TU077Q-unsplash.jpg",
    details: "Pushes VO2 max into new frontiers through tactical interval pacing and active lactic acid flush drills."
  },
  {
    id: "recovery",
    tag: "MOBILITY & RESTORATION",
    title: "Kinetic Reset & Ice Protocol",
    subtitle: "Contrast hydrotherapy, myofascial decompression, hyperbaric oxygen, and mobility flow.",
    duration: "45 MIN",
    intensity: "LOW",
    trainer: "Dr. Maya Lin",
    capacity: 8,
    enrolled: 6,
    image: "/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg",
    details: "Restores central nervous system vitality, decreases systemic inflammation, and accelerates muscle recovery."
  }
];


export const INITIAL_MEMBERSHIPS = [
  {
    id: "trial",
    name: "Brave Trial",
    price: 39,
    interval: "3-class pass",
    description: "Experience the facility, coaching precision, and community standard.",
    features: [
      "Access to any 3 classes within 14 days",
      "Full locker room & sauna privileges",
      "1-on-1 movement assessment",
      "Complimentary hand wraps & glove rental"
    ],
    popular: false,
    cta: "Book Trial Pass"
  },
  {
    id: "black-tier",
    name: "Black Tier",
    price: 189,
    interval: "monthly",
    description: "The complete athletic standard for disciplined, dedicated daily athletes.",
    features: [
      "Unlimited group classes (Boxing, Strength, HIIT)",
      "Priority 7-day advance booking window",
      "Recovery suite (Sauna & Cold Plunge)",
      "Quarterly body composition & biomarker scan",
      "1 Guest pass per month"
    ],
    popular: true,
    cta: "Claim Black Tier"
  },
  {
    id: "obsidian-tier",
    name: "Obsidian Private",
    price: 349,
    interval: "monthly",
    description: "High-touch coaching with individualized programming and biometric oversight.",
    features: [
      "All Black Tier privileges included",
      "4 Private 1-on-1 coaching sessions per month",
      "Custom nutrition & recovery protocol",
      "Private locker with daily laundry service",
      "24/7 dedicated coach direct messaging"
    ],
    popular: false,
    cta: "Apply for Obsidian"
  }
];

export const INITIAL_SCHEDULE = [
  { id: "sc-1", day: "Monday", time: "06:30 AM", classTitle: "Metabolic Warfare", trainer: "Jaxson Cole", spotsLeft: 3, total: 20 },
  { id: "sc-2", day: "Monday", time: "08:00 AM", classTitle: "Championship Boxing", trainer: "Marcus Vance", spotsLeft: 2, total: 16 },
  { id: "sc-3", day: "Monday", time: "05:30 PM", classTitle: "Iron Discipline Strength", trainer: "Elena Rostova", spotsLeft: 1, total: 12 },
  { id: "sc-4", day: "Tuesday", time: "07:00 AM", classTitle: "Championship Boxing", trainer: "Marcus Vance", spotsLeft: 5, total: 16 },
  { id: "sc-5", day: "Tuesday", time: "06:00 PM", classTitle: "Kinetic Reset & Ice Protocol", trainer: "Dr. Maya Lin", spotsLeft: 2, total: 8 },
  { id: "sc-6", day: "Wednesday", time: "06:30 AM", classTitle: "Iron Discipline Strength", trainer: "Elena Rostova", spotsLeft: 4, total: 12 },
  { id: "sc-7", day: "Wednesday", time: "05:30 PM", classTitle: "Metabolic Warfare", trainer: "Jaxson Cole", spotsLeft: 0, total: 20 },
  { id: "sc-8", day: "Thursday", time: "07:00 AM", classTitle: "Championship Boxing", trainer: "Marcus Vance", spotsLeft: 3, total: 16 },
  { id: "sc-9", day: "Friday", time: "05:30 PM", classTitle: "Friday Night Sparring & Conditioning", trainer: "Marcus Vance", spotsLeft: 6, total: 16 },
  { id: "sc-10", day: "Saturday", time: "09:00 AM", classTitle: "Brave Community Combine", trainer: "All Coaches", spotsLeft: 8, total: 30 }
];

export const INITIAL_TESTIMONIALS = [
  {
    quote: "Brave Gym stripped away all the gimmicks. In 6 months here, my striking precision and aerobic capacity transformed completely. The coaching standard is unrivaled.",
    author: "Liam K.",
    role: "Member since 2024 · 128 Sessions Logged",
    badge: "Black Tier"
  },
  {
    quote: "You walk in and the atmosphere commands your total focus. It's not a fitness club with loud distractions; it's a sanctuary of disciplined athletes pushing their edges.",
    author: "Sophia R.",
    role: "Competitive Runner & Boxing Enthusiast",
    badge: "Obsidian Private"
  }
];
