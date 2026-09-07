import { JsonStore } from "./JsonStore.js";
import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const defaultClasses = [
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

export const classStore = new JsonStore("classes", defaultClasses);

function mapPgRowToClass(r) {
  if (!r) return null;
  return {
    id: r.id,
    day: r.day,
    time: r.time,
    classTitle: r.class_title,
    trainer: r.trainer,
    spotsLeft: Number(r.spots_left ?? r.total ?? 16),
    total: Number(r.total ?? 16),
    createdAt: r.created_at
  };
}

export class ClassModel {
  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM classes ORDER BY id ASC");
        if (res && res.rows && res.rows.length > 0) {
          return res.rows.map(mapPgRowToClass);
        }
        // If DB table is empty, seed defaults into PostgreSQL
        for (const cls of defaultClasses) {
          await db.query(
            `INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) ON CONFLICT (id) DO NOTHING`,
            [cls.id, cls.day, cls.time, cls.classTitle, cls.trainer, cls.spotsLeft, cls.total]
          );
        }
        const seeded = await db.query("SELECT * FROM classes ORDER BY id ASC");
        if (seeded && seeded.rows) return seeded.rows.map(mapPgRowToClass);
      } catch (err) {
        console.warn("PostgreSQL classes findAll error, fallback to local:", err.message);
      }
    }
    return classStore.findAll();
  }

  static async findById(id) {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM classes WHERE id = $1 LIMIT 1", [id]);
        if (res && res.rows && res.rows.length > 0) {
          return mapPgRowToClass(res.rows[0]);
        }
      } catch (err) {
        console.warn("PostgreSQL classes findById error:", err.message);
      }
    }
    return classStore.findById(id);
  }

  static async create(data) {
    const newClass = {
      id: data.id || `sc-${uuidv4().slice(0, 8)}`,
      day: data.day,
      time: data.time,
      classTitle: data.classTitle || data.class_title,
      trainer: data.trainer,
      spotsLeft: Number(data.spotsLeft ?? data.spots_left ?? data.total),
      total: Number(data.total),
      createdAt: new Date().toISOString()
    };

    if (db.isConfigured()) {
      try {
        await db.query(
          `INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [newClass.id, newClass.day, newClass.time, newClass.classTitle, newClass.trainer, newClass.spotsLeft, newClass.total]
        );
      } catch (err) {
        console.error("PostgreSQL class insert error:", err.message);
      }
    }

    classStore.insert(newClass);
    return newClass;
  }

  static async update(id, updates) {
    if (db.isConfigured()) {
      try {
        if (updates.spotsLeft !== undefined) {
          await db.query("UPDATE classes SET spots_left = $1 WHERE id = $2", [updates.spotsLeft, id]);
        }
      } catch (err) {
        console.warn("PostgreSQL class update error:", err.message);
      }
    }
    return classStore.update(id, updates);
  }

  static async delete(id) {
    if (db.isConfigured()) {
      try {
        await db.query("DELETE FROM classes WHERE id = $1", [id]);
      } catch (err) {
        console.warn("PostgreSQL class delete error:", err.message);
      }
    }
    return classStore.delete(id);
  }

  static async decrementSpots(id) {
    const cls = await this.findById(id);
    if (!cls) return null;
    const spotsLeft = Math.max(0, (cls.spotsLeft || 0) - 1);
    await this.update(id, { spotsLeft });
    return { ...cls, spotsLeft };
  }

  static async incrementSpots(id) {
    const cls = await this.findById(id);
    if (!cls) return null;
    const spotsLeft = Math.min(cls.total || 20, (cls.spotsLeft || 0) + 1);
    await this.update(id, { spotsLeft });
    return { ...cls, spotsLeft };
  }
}
