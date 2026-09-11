import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// Default programs to seed the database if it's empty
const defaultPrograms = [
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

function mapPgRowToProgram(r) {
  if (!r) return null;
  return {
    id: r.id,
    category: r.category || "ALL",
    tag: r.tag,
    title: r.title,
    subtitle: r.subtitle,
    duration: r.duration,
    intensity: r.intensity,
    trainer: r.trainer,
    capacity: Number(r.capacity ?? 16),
    enrolled: Number(r.enrolled ?? 0),
    image: r.image,
    poster: r.poster,
    details: r.details,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

import { localStore } from "../config/localStore.js";

export class ProgramModel {
  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM programs ORDER BY created_at ASC");
        if (res && res.rows && res.rows.length > 0) {
          return res.rows.map(mapPgRowToProgram);
        }
        return [];
      } catch (err) {
        console.error("PostgreSQL programs findAll error:", err.message);
        throw err;
      }
    }
    
    // Resilient local store fallback
    return localStore.getCollection("programs");
  }

  static async findById(id) {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM programs WHERE id = $1 LIMIT 1", [id]);
        if (res && res.rows && res.rows.length > 0) {
          return mapPgRowToProgram(res.rows[0]);
        }
        return null;
      } catch (err) {
        console.error("PostgreSQL programs findById error:", err.message);
        throw err;
      }
    }

    const progs = localStore.getCollection("programs");
    return progs.find((p) => p.id === id) || null;
  }

  static async create(data) {
    const newId = `prog-${uuidv4().slice(0, 8)}`;
    const newProg = {
      id: newId,
      category: data.category || "ALL",
      tag: data.tag || "",
      title: data.title || "Untitled Program",
      subtitle: data.subtitle || "",
      duration: data.duration || "60 MIN",
      intensity: data.intensity || "MODERATE",
      trainer: data.trainer || "Head Coach",
      capacity: Number(data.capacity || 16),
      enrolled: Number(data.enrolled || 0),
      image: data.image || "",
      poster: data.poster || "",
      details: data.details || "",
      createdAt: new Date().toISOString()
    };

    if (db.isConfigured()) {
      try {
        await db.query(
          `INSERT INTO programs (id, category, tag, title, subtitle, duration, intensity, trainer, capacity, enrolled, image, poster, details, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
          [
            newProg.id, 
            newProg.category,
            newProg.tag,
            newProg.title,
            newProg.subtitle,
            newProg.duration,
            newProg.intensity,
            newProg.trainer,
            newProg.capacity,
            newProg.enrolled,
            newProg.image,
            newProg.poster,
            newProg.details
          ]
        );
        return this.findById(newId);
      } catch (err) {
        console.error("PostgreSQL programs create error:", err.message);
        throw err;
      }
    }

    const progs = localStore.getCollection("programs");
    progs.push(newProg);
    localStore.saveCollection("programs", progs);
    return newProg;
  }

  static async update(id, updates) {
    if (db.isConfigured()) {
      try {
        const existing = await this.findById(id);
        if (!existing) return null;
        
        const merged = { ...existing, ...updates };
        
        await db.query(
          `UPDATE programs 
           SET category = $1, tag = $2, title = $3, subtitle = $4, duration = $5, intensity = $6, trainer = $7, capacity = $8, enrolled = $9, image = $10, poster = $11, details = $12, updated_at = NOW()
           WHERE id = $13`,
          [
            merged.category,
            merged.tag,
            merged.title,
            merged.subtitle,
            merged.duration,
            merged.intensity,
            merged.trainer,
            merged.capacity,
            merged.enrolled,
            merged.image,
            merged.poster,
            merged.details,
            id
          ]
        );
        
        return this.findById(id);
      } catch (err) {
        console.error("PostgreSQL programs update error:", err.message);
        throw err;
      }
    }

    const progs = localStore.getCollection("programs");
    const idx = progs.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    progs[idx] = { ...progs[idx], ...updates, updatedAt: new Date().toISOString() };
    localStore.saveCollection("programs", progs);
    return progs[idx];
  }

  static async delete(id) {
    if (db.isConfigured()) {
      try {
        const res = await db.query("DELETE FROM programs WHERE id = $1 RETURNING id", [id]);
        return (res && res.rowCount > 0);
      } catch (err) {
        console.error("PostgreSQL programs delete error:", err.message);
        throw err;
      }
    }

    const progs = localStore.getCollection("programs");
    const filtered = progs.filter((p) => p.id !== id);
    localStore.saveCollection("programs", filtered);
    return filtered.length < progs.length;
  }
}
