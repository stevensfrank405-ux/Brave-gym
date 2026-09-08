import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

function mapPgRowToTrainer(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    image: r.image,
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
    } else {
      throw new Error("Database is not configured.");
    }
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
    } else {
      throw new Error("Database is not configured.");
    }
    return null;
  }

  static async create({ name, role, image, bio, quote, specialties }) {
    const id = "tr-" + uuidv4().slice(0, 8);
    const specs = Array.isArray(specialties) ? JSON.stringify(specialties) : JSON.stringify([]);
    
    if (db.isConfigured()) {
      try {
        const res = await db.query(
          `INSERT INTO trainers (id, name, role, image, bio, quote, specialties, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
          [id, name, role, image, bio, quote, specs]
        );
        return mapPgRowToTrainer(res.rows[0]);
      } catch (err) {
        console.error("PostgreSQL create trainer error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
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
    } else {
      throw new Error("Database is not configured.");
    }
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
    } else {
      throw new Error("Database is not configured.");
    }
  }
}
