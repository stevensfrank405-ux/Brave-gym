// Mock initial state and data models conforming to brave gym specification.md

export const INITIAL_PROGRAMS = [
  {
    id: "boxing",
    tag: "STRIKING & FOOTWORK",
    category: "BOXING",
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
    category: "STRENGTH",
    title: "Iron Discipline Strength",
    subtitle: "Barbell mastery, compound movements, deadlift mechanics, and neuromuscular recruitment.",
    duration: "75 MIN",
    intensity: "ELITE",
    trainer: "Elena Rostova",
    capacity: 12,
    enrolled: 10,
    image: "/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg",
    poster: "/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg",
    details: "Progressive overload methodology programmed to build absolute power, tendon resilience, and muscle density."
  },
  {
    id: "conditioning",
    tag: "AEROBIC THRESHOLD",
    category: "METABOLIC",
    title: "Metabolic Warfare",
    subtitle: "Ski-erg, assault runner intervals, kettlebell ballistic circuits, and breath control.",
    duration: "50 MIN",
    intensity: "MAXIMAL",
    trainer: "Jaxson Cole",
    capacity: 20,
    enrolled: 18,
    image: "/media/hermes-rivera-qbf59TU077Q-unsplash.jpg",
    poster: "/media/hermes-rivera-qbf59TU077Q-unsplash.jpg",
    details: "Pushes VO2 max into new frontiers through tactical interval pacing and active lactic acid flush drills."
  },
  {
    id: "recovery",
    tag: "MOBILITY & RESTORATION",
    category: "RECOVERY",
    title: "Kinetic Reset & Ice Protocol",
    subtitle: "Contrast hydrotherapy, myofascial decompression, hyperbaric oxygen, and mobility flow.",
    duration: "45 MIN",
    intensity: "LOW",
    trainer: "Dr. Maya Lin",
    capacity: 8,
    enrolled: 8,
    image: "/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg",
    poster: "/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg",
    details: "Systematic nervous system down-regulation utilizing extreme temperature exposure and joint articulation."
  }
];

export const INITIAL_MEMBERSHIPS = [];

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

export const INITIAL_TESTIMONIALS = [];
