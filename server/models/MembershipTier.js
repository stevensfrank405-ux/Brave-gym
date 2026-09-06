import { JsonStore } from "./JsonStore.js";
import { v4 as uuidv4 } from "uuid";

const defaultTiers = [
  {
    id: "trial",
    name: "Brave Trial",
    price: 39,
    interval: "3-class pass",
    billing: "3-class pass",
    description: "Experience the facility, coaching precision, and community standard.",
    features: [
      "Access to any 3 classes within 14 days",
      "Full locker room & sauna privileges",
      "1-on-1 movement assessment",
      "Complimentary hand wraps & glove rental"
    ],
    popular: false,
    cta: "Book Trial Pass",
    createdAt: new Date().toISOString()
  },
  {
    id: "black-tier",
    name: "Black Tier",
    price: 189,
    interval: "monthly",
    billing: "monthly",
    description: "The complete athletic standard for disciplined, dedicated daily athletes.",
    features: [
      "Unlimited group classes (Boxing, Strength, HIIT)",
      "Priority 7-day advance booking window",
      "Recovery suite (Sauna & Cold Plunge)",
      "Quarterly body composition & biomarker scan",
      "1 Guest pass per month"
    ],
    popular: true,
    cta: "Claim Black Tier",
    createdAt: new Date().toISOString()
  },
  {
    id: "obsidian-tier",
    name: "Obsidian Private",
    price: 349,
    interval: "monthly",
    billing: "monthly",
    description: "High-touch coaching with individualized programming and biometric oversight.",
    features: [
      "All Black Tier privileges included",
      "4 Private 1-on-1 coaching sessions per month",
      "Custom nutrition & recovery protocol",
      "Private locker with daily laundry service",
      "24/7 dedicated coach direct messaging"
    ],
    popular: false,
    cta: "Apply for Obsidian",
    createdAt: new Date().toISOString()
  }
];

export const tierStore = new JsonStore("membership_tiers", defaultTiers);

export class MembershipTierModel {
  static findAll() {
    return tierStore.findAll();
  }

  static findById(id) {
    return tierStore.findById(id);
  }

  static create(data) {
    const newTier = {
      id: data.id || `tier-${uuidv4().slice(0, 8)}`,
      name: data.name,
      price: Number(data.price) || 0,
      interval: data.interval || data.billing || "monthly",
      billing: data.billing || data.interval || "monthly",
      description: data.description || "",
      features: Array.isArray(data.features) ? data.features : (data.features || "").split("\n").filter(Boolean),
      popular: !!data.popular,
      cta: data.cta || `Claim ${data.name}`,
      createdAt: new Date().toISOString()
    };
    tierStore.insert(newTier);
    return newTier;
  }

  static delete(id) {
    return tierStore.delete(id);
  }
}
