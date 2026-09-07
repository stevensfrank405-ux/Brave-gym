import { JsonStore } from "./JsonStore.js";
import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const defaultLogs = [];

export const workoutStore = new JsonStore("workouts", defaultLogs);

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
      } catch (err) {
        console.warn("PostgreSQL workout_logs findAll error, falling back to local:", err.message);
      }
    }
    return workoutStore.findAll();
  }

  static async findByUserId(userId) {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM workout_logs WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        if (res && res.rows) {
          return res.rows.map(mapPgRowToLog);
        }
      } catch (err) {
        console.warn("PostgreSQL workout_logs findByUserId error:", err.message);
      }
    }
    return workoutStore.findAll((l) => String(l.userId) === String(userId));
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
      } catch (err) {
        console.error("PostgreSQL workout_logs insert error:", err.message);
      }
    }

    workoutStore.insert(newLog);
    return newLog;
  }

  static async delete(id) {
    if (db.isConfigured()) {
      try {
        await db.query("DELETE FROM workout_logs WHERE id = $1", [id]);
      } catch (err) {
        console.warn("PostgreSQL workout_logs delete error:", err.message);
      }
    }
    return workoutStore.delete(id);
  }
}
