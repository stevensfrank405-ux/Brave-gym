import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

function mapPgRowToLog(r) {
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    user_id: r.user_id,
    exercise: r.exercise,
    weight: r.weight,
    notes: r.notes,
    date: r.date,
    createdAt: r.created_at
  };
}

export class WorkoutLogModel {
  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM workout_logs ORDER BY created_at DESC");
        if (res && res.rows) {
          return res.rows.map(mapPgRowToLog);
        }
        return [];
      } catch (err) {
        console.error("PostgreSQL workout_logs findAll error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }

  static async findByUserId(userId) {
    if (!userId) return [];
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM workout_logs WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        if (res && res.rows) {
          return res.rows.map(mapPgRowToLog);
        }
        return [];
      } catch (err) {
        console.error("PostgreSQL workout_logs findByUserId error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }

  static async create(data) {
    const newLog = {
      id: data.id || `log-${uuidv4().slice(0, 8)}`,
      userId: data.userId,
      exercise: data.exercise,
      weight: data.weight || "Bodyweight",
      notes: data.notes || "",
      date: data.date || "Today",
      createdAt: new Date().toISOString()
    };

    if (db.isConfigured()) {
      try {
        await db.query(
          `INSERT INTO workout_logs (id, user_id, exercise, weight, notes, date, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            newLog.id,
            newLog.userId,
            newLog.exercise,
            newLog.weight,
            newLog.notes,
            newLog.date
          ]
        );
        return newLog;
      } catch (err) {
        console.error("PostgreSQL workout_logs insert error:", err.message);
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
        await db.query("DELETE FROM workout_logs WHERE id = $1", [id]);
        return true;
      } catch (err) {
        console.error("PostgreSQL workout_logs delete error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }
}
