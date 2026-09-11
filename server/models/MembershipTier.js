import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";



import { localStore } from "../config/localStore.js";

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
    }
    return localStore.getCollection("membership_tiers");
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
    }
    const tiers = localStore.getCollection("membership_tiers");
    return tiers.find((t) => t.id === id) || null;
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
    }

    const tiers = localStore.getCollection("membership_tiers");
    tiers.push(newTier);
    localStore.saveCollection("membership_tiers", tiers);
    return newTier;
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
    }

    const tiers = localStore.getCollection("membership_tiers");
    const filtered = tiers.filter((t) => t.id !== id);
    localStore.saveCollection("membership_tiers", filtered);
    return filtered.length < tiers.length;
  }
}
