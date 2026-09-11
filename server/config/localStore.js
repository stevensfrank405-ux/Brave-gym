import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function loadCollection(collection, defaultData = []) {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    saveCollection(collection, defaultData);
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[LocalStore] Failed reading ${collection}.json, resetting:`, err.message);
    saveCollection(collection, defaultData);
    return defaultData;
  }
}

function saveCollection(collection, data) {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`[LocalStore] Error writing ${collection}.json:`, err.message);
  }
}

// Initial default seed datasets
const DEFAULT_USERS = [
  {
    id: "usr-admin",
    email: "admin@bravegym.com",
    passwordHash: bcrypt.hashSync("admin123", 10),
    name: "Marcus Vance HQ",
    role: "admin",
    membership: "Staff Command",
    status: "Active",
    renewalDate: "Lifetime Master",
    streak: 42,
    sessionsThisMonth: 24,
    avatar: "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg",
    bio: "Full jurisdiction over facility security protocols, coaches timetable scheduling, athlete subscriptions, and financial audits.",
    phone: "+1 (555) 019-2831",
    weightClass: "Heavyweight (91+ kg)",
    discipline: "Head Boxing Director",
    createdAt: new Date().toISOString()
  },
  {
    id: "usr-athlete-1",
    email: "athlete@bravegym.com",
    passwordHash: bcrypt.hashSync("athlete123", 10),
    name: "Darius Sterling",
    role: "user",
    membership: "Black Tier",
    status: "Active",
    renewalDate: "Dec 31, 2026",
    streak: 18,
    sessionsThisMonth: 14,
    avatar: "/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg",
    bio: "Discipline over motivation. Training for athletic excellence.",
    phone: "+1 (555) 234-5678",
    weightClass: "Middleweight (75 kg)",
    discipline: "Championship Boxing & Strength",
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_PROGRAMS = [
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

const DEFAULT_CLASSES = [
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

const DEFAULT_TIERS = [
  { id: "tier-trial", name: "Trial Pass", price: 45, interval: "day", billing: "day", description: "Full facility day access with single coached sparring session.", features: ["Single Day All-Access", "Coached Sparring Session", "Sauna & Cold Plunge Entry", "Locker & Shower Amenities"], popular: false, cta: "Claim Day Pass" },
  { id: "tier-black", name: "Black Tier", price: 195, interval: "month", billing: "monthly", description: "Standard athletic roster access with unlimited floor and class sessions.", features: ["Unlimited Floor Access", "All Combat & Strength Classes", "Dedicated Gear Locker", "Biometric Progress Scans", "Guest Passes (2/mo)"], popular: true, cta: "Enroll Black Tier" },
  { id: "tier-obsidian", name: "Obsidian Sovereign", price: 380, interval: "month", billing: "monthly", description: "Elite executive tier with dedicated trainer access and priority combine slots.", features: ["24/7 Biometric Keycard Access", "Dedicated 1-on-1 Master Coach", "Hyperbaric & Ice Protocol Access", "Custom Nutritional Macro Delivery", "Private Executive Locker Suite", "VIP Combine Ringside Seating"], popular: false, cta: "Ascend to Obsidian" }
];

const DEFAULT_TRAINERS = [
  { id: "tr-1", name: "Marcus Vance", role: "Head Boxing Director", image: "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg", bio: "Former Golden Gloves heavyweight champion with 18 years in championship cornering and tactical striking development.", quote: "Form is nothing without relentless intent.", specialties: ["Olympic Boxing", "Heavy Bag Mechanics", "Tactical Footwork"] },
  { id: "tr-2", name: "Elena Rostova", role: "Elite Strength & Conditioning", image: "/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg", bio: "Former national powerlifting record holder specializing in progressive neuromuscular adaptation and power output.", quote: "The barbell does not negotiate with weakness.", specialties: ["Powerlifting", "Neuromuscular Recruiter", "Deadlift Dynamics"] },
  { id: "tr-3", name: "Jaxson Cole", role: "Metabolic Conditioning Coach", image: "/media/hermes-rivera-qbf59TU077Q-unsplash.jpg", bio: "Ex-Special Forces combat fitness instructor leading high-threshold conditioning and lactic clearance circuits.", quote: "Find comfort at the redline.", specialties: ["Assault Runner Intervals", "Kettlebell Ballistics", "VO2 Max Extension"] },
  { id: "tr-4", name: "Dr. Maya Lin", role: "Recovery & Performance Specialist", image: "/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg", bio: "Doctor of Physical Therapy focused on contrast therapy protocols, fascia release, and nervous system restoration.", quote: "Growth occurs in deep parasympathetic recovery.", specialties: ["Cryotherapy Protocols", "Myofascial Decompression", "Joint Articulation"] }
];

export const localStore = {
  getCollection(name) {
    if (name === "users") return loadCollection("users", DEFAULT_USERS);
    if (name === "programs") return loadCollection("programs", DEFAULT_PROGRAMS);
    if (name === "classes") return loadCollection("classes", DEFAULT_CLASSES);
    if (name === "membership_tiers") return loadCollection("membership_tiers", DEFAULT_TIERS);
    if (name === "trainers") return loadCollection("trainers", DEFAULT_TRAINERS);
    return loadCollection(name, []);
  },
  saveCollection(name, data) {
    saveCollection(name, data);
  }
};
