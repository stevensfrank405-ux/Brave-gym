import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

import { localStore } from "../config/localStore.js";

const VERIFIED_TRAINER_MEDIA = [
  "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg",
  "/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg",
  "/media/hermes-rivera-qbf59TU077Q-unsplash.jpg",
  "/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg",
  "/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg"
];

function sanitizeTrainerImage(img) {
  if (!img || typeof img !== "string" || !img.trim()) {
    return VERIFIED_TRAINER_MEDIA[0];
  }
  const s = img.trim();
  if (s.includes("victor-freitas")) return VERIFIED_TRAINER_MEDIA[1];
  if (s.includes("anastase-maragos")) return VERIFIED_TRAINER_MEDIA[2];
  if (s.includes("logan-weaver")) return VERIFIED_TRAINER_MEDIA[3];
  return s;
}

function mapPgRowToTrainer(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    image: sanitizeTrainerImage(r.image),
    bio: r.bio,
    quote: r.quote,
    specialties: typeof r.specialties === 'string' ? JSON.parse(r.specialties) : (r.specialties || []),
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

export class TrainerModel {
  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM trainers ORDER BY created_at ASC");
        return res.rows.map(mapPgRowToTrainer);
      } catch (err) {
        console.error("PostgreSQL findAll trainers error:", err.message);
        throw err;
      }
    }
    const trainers = localStore.getCollection("trainers");
    return (trainers || []).map((t, i) => ({
      ...t,
      image: sanitizeTrainerImage(t.image || VERIFIED_TRAINER_MEDIA[i % VERIFIED_TRAINER_MEDIA.length])
    }));
  }

  static async findById(id) {
    if (!id) return null;
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM trainers WHERE id = $1 LIMIT 1", [id]);
        if (res.rows.length > 0) {
          return mapPgRowToTrainer(res.rows[0]);
        }
      } catch (err) {
        console.error("PostgreSQL findById trainer error:", err.message);
        throw err;
      }
      return null;
    }
    const trainers = localStore.getCollection("trainers");
    const found = (trainers || []).find((t) => t.id === id);
    if (!found) return null;
    return {
      ...found,
      image: sanitizeTrainerImage(found.image)
    };
  }

  static async create({ name, role, image, bio, quote, specialties }) {
    const id = "tr-" + uuidv4().slice(0, 8);
    const specs = Array.isArray(specialties) ? specialties : (typeof specialties === "string" ? JSON.parse(specialties || "[]") : []);
    const newTrainer = {
      id,
      name,
      role: role || "Coach",
      image: image || "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg",
      bio: bio || "",
      quote: quote || "",
      specialties: specs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (db.isConfigured()) {
      try {
        const res = await db.query(
          `INSERT INTO trainers (id, name, role, image, bio, quote, specialties, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
          [id, name, role, image, bio, quote, JSON.stringify(specs)]
        );
        return mapPgRowToTrainer(res.rows[0]);
      } catch (err) {
        console.error("PostgreSQL create trainer error:", err.message);
        throw err;
      }
    }

    const trainers = localStore.getCollection("trainers");
    trainers.push(newTrainer);
    localStore.saveCollection("trainers", trainers);
    return newTrainer;
  }

  static async update(id, updates) {
    if (db.isConfigured()) {
      try {
        const setClauses = [];
        const values = [];
        let idx = 1;

        if (updates.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(updates.name); }
        if (updates.role !== undefined) { setClauses.push(`role = $${idx++}`); values.push(updates.role); }
        if (updates.image !== undefined) { setClauses.push(`image = $${idx++}`); values.push(updates.image); }
        if (updates.bio !== undefined) { setClauses.push(`bio = $${idx++}`); values.push(updates.bio); }
        if (updates.quote !== undefined) { setClauses.push(`quote = $${idx++}`); values.push(updates.quote); }
        if (updates.specialties !== undefined) { 
          setClauses.push(`specialties = $${idx++}`); 
          values.push(Array.isArray(updates.specialties) ? JSON.stringify(updates.specialties) : JSON.stringify([])); 
        }

        if (setClauses.length > 0) {
          setClauses.push(`updated_at = NOW()`);
          values.push(id);
          const q = `UPDATE trainers SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`;
          const res = await db.query(q, values);
          if (res.rows.length > 0) {
            return mapPgRowToTrainer(res.rows[0]);
          }
        }
        return null;
      } catch (err) {
        console.error("PostgreSQL update trainer error:", err.message);
        throw err;
      }
    }

    const trainers = localStore.getCollection("trainers");
    const idx = trainers.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    trainers[idx] = {
      ...trainers[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStore.saveCollection("trainers", trainers);
    return trainers[idx];
  }

  static async delete(id) {
    if (!id) return false;
    if (db.isConfigured()) {
      try {
        const res = await db.query("DELETE FROM trainers WHERE id = $1 RETURNING id", [id]);
        return res.rows.length > 0;
      } catch (err) {
        console.error("PostgreSQL delete trainer error:", err.message);
        throw err;
      }
    }
    const trainers = localStore.getCollection("trainers");
    const initialLen = trainers.length;
    const filtered = trainers.filter((t) => t.id !== id);
    if (filtered.length !== initialLen) {
      localStore.saveCollection("trainers", filtered);
      return true;
    }
    return false;
  }
}
