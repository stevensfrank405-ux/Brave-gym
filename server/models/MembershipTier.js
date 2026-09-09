import { db } from "../config/db.js";
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

function mapPgRowToTier(r) {
  if (!r) return null;
  let parsedFeatures = [];
  if (Array.isArray(r.features)) {
    parsedFeatures = r.features;
  } else if (typeof r.features === "string") {
    try {
      parsedFeatures = JSON.parse(r.features);
    } catch {
      parsedFeatures = [];
    }
  }
  return {
    id: r.id,
    name: r.name,
    price: Number(r.price) || 0,
    interval: r.interval || r.billing || "monthly",
    billing: r.billing || r.interval || "monthly",
    description: r.description || "",
    features: parsedFeatures,
    popular: !!r.popular,
    cta: r.cta || `Claim ${r.name}`,
    createdAt: r.created_at
  };
}

export class MembershipTierModel {
  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM membership_tiers ORDER BY price ASC");
        if (res && res.rows && res.rows.length > 0) {
          return res.rows.map(mapPgRowToTier);
        }
        
        return [];
      } catch (err) {
        console.error("PostgreSQL membership_tiers findAll error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }

  static async findById(id) {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM membership_tiers WHERE id = $1 LIMIT 1", [id]);
        if (res && res.rows && res.rows.length > 0) {
          return mapPgRowToTier(res.rows[0]);
        }
        return null;
      } catch (err) {
        console.error("PostgreSQL membership_tiers findById error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }

  static async create(data) {
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

    if (db.isConfigured()) {
      try {
        await db.query(
          `INSERT INTO membership_tiers (id, name, price, interval, billing, description, features, popular, cta, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
          [
            newTier.id, newTier.name, newTier.price, newTier.interval, newTier.billing,
            newTier.description, JSON.stringify(newTier.features), newTier.popular, newTier.cta
          ]
        );
        return newTier;
      } catch (err) {
        console.error("PostgreSQL membership_tiers insert error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }

  static async delete(id) {
    if (db.isConfigured()) {
      try {
        await db.query("DELETE FROM membership_tiers WHERE id = $1", [id]);
        return true;
      } catch (err) {
        console.error("PostgreSQL membership_tiers delete error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }
}
