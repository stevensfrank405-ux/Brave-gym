import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { localStore } from "../config/localStore.js";

function mapPgRowToLog(r) {
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    user_id: r.user_id,
    userName: r.user_name || "Athlete",
    userEmail: r.user_email || "",
    exercise: r.exercise,
    weight: r.weight,
    notes: r.notes,
    date: r.date,
    status: r.status || "Pending",
    createdAt: r.created_at
  };
}

export class WorkoutLogModel {
  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query(`
          SELECT wl.*, u.name as join_user_name, u.email as join_user_email
          FROM workout_logs wl
          LEFT JOIN users u ON wl.user_id = u.id
          ORDER BY wl.created_at DESC
        `);
        if (res && res.rows) {
          return res.rows.map(r => {
            const mapped = mapPgRowToLog(r);
            if (!r.user_name && r.join_user_name) mapped.userName = r.join_user_name;
            if (!r.user_email && r.join_user_email) mapped.userEmail = r.join_user_email;
            return mapped;
          });
        }
        return [];
      } catch (err) {
        console.error("PostgreSQL workout_logs findAll error:", err.message);
        throw err;
      }
    }
    return localStore.getCollection("workout_logs");
  }

  static async findById(id) {
    if (!id) return null;
    if (db.isConfigured()) {
      try {
        const res = await db.query(`
          SELECT wl.*, u.name as join_user_name, u.email as join_user_email
          FROM workout_logs wl
          LEFT JOIN users u ON wl.user_id = u.id
          WHERE wl.id = $1 LIMIT 1
        `, [id]);
        if (res && res.rows && res.rows.length > 0) {
          const r = res.rows[0];
          const mapped = mapPgRowToLog(r);
          if (!r.user_name && r.join_user_name) mapped.userName = r.join_user_name;
          if (!r.user_email && r.join_user_email) mapped.userEmail = r.join_user_email;
          return mapped;
        }
        return null;
      } catch (err) {
        console.error("PostgreSQL workout_logs findById error:", err.message);
        throw err;
      }
    }
    const logs = localStore.getCollection("workout_logs");
    return logs.find((l) => l.id === id) || null;
  }

  static async findByUserId(userId) {
    if (!userId) return [];
    if (db.isConfigured()) {
      try {
        const res = await db.query(
          "SELECT * FROM workout_logs WHERE user_id = $1 ORDER BY created_at DESC",
          [userId]
        );
        if (res && res.rows) {
          return res.rows.map(mapPgRowToLog);
        }
        return [];
      } catch (err) {
        console.error("PostgreSQL workout_logs findByUserId error:", err.message);
        throw err;
      }
    }
    const logs = localStore.getCollection("workout_logs");
    return logs.filter((l) => l.userId === userId);
  }

  static async create(data) {
    const newLog = {
      id: data.id || `log-${uuidv4().slice(0, 8)}`,
      userId: data.userId,
      userName: data.userName || "Athlete",
      userEmail: data.userEmail || "",
      exercise: data.exercise,
      weight: data.weight || "Bodyweight",
      notes: data.notes || "",
      date: data.date || "Today",
      status: data.status || "Pending",
      createdAt: new Date().toISOString()
    };

    if (db.isConfigured()) {
      try {
        await db.query(
          `INSERT INTO workout_logs (id, user_id, user_name, user_email, exercise, weight, notes, date, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
          [
            newLog.id,
            newLog.userId,
            newLog.userName,
            newLog.userEmail,
            newLog.exercise,
            newLog.weight,
            newLog.notes,
            newLog.date,
            newLog.status
          ]
        );
        return await this.findById(newLog.id) || newLog;
      } catch (err) {
        console.error("PostgreSQL workout_logs insert error:", err.message);
        throw err;
      }
    }

    const logs = localStore.getCollection("workout_logs");
    logs.unshift(newLog);
    localStore.saveCollection("workout_logs", logs);
    return newLog;
  }

  static async updateStatus(id, status) {
    if (!id || !status) return null;
    if (db.isConfigured()) {
      try {
        const res = await db.query(
          "UPDATE workout_logs SET status = $1 WHERE id = $2 RETURNING *",
          [status, id]
        );
        if (res && res.rows && res.rows.length > 0) {
          return await this.findById(id) || mapPgRowToLog(res.rows[0]);
        }
        return null;
      } catch (err) {
        console.error("PostgreSQL workout_logs updateStatus error:", err.message);
        throw err;
      }
    }
    const logs = localStore.getCollection("workout_logs");
    const idx = logs.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    logs[idx].status = status;
    localStore.saveCollection("workout_logs", logs);
    return logs[idx];
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
    }
    const logs = localStore.getCollection("workout_logs");
    const filtered = logs.filter((l) => l.id !== id);
    localStore.saveCollection("workout_logs", filtered);
    return true;
  }
}
