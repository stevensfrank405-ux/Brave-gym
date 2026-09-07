import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

function mapPgRowToNotif(r) {
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    message: r.message,
    type: r.type,
    read: !!r.read,
    createdAt: r.created_at
  };
}

export class NotificationModel {
  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM notifications ORDER BY created_at DESC");
        if (res.rows.length > 0) {
          return res.rows.map(mapPgRowToNotif);
        }
        return [];
      } catch (err) {
        console.error("PostgreSQL notifications findAll error:", err.message);
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
        const res = await db.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        if (res.rows.length > 0) {
          return res.rows.map(mapPgRowToNotif);
        }
        return [];
      } catch (err) {
        console.error("PostgreSQL notifications findByUserId error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }

  static async create(data) {
    const newNotif = {
      id: data.id || `notif-${uuidv4().slice(0, 8)}`,
      userId: data.userId || null,
      title: data.title,
      message: data.message,
      type: data.type || "admin_response",
      read: false,
      createdAt: new Date().toISOString()
    };

    if (db.isConfigured()) {
      try {
        await db.query(
          `INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [newNotif.id, newNotif.userId, newNotif.title, newNotif.message, newNotif.type, newNotif.read]
        );
        return newNotif;
      } catch (err) {
        console.error("PostgreSQL notification insert error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }

  static async markAllRead(userId) {
    if (!userId) return false;
    if (db.isConfigured()) {
      try {
        await db.query("UPDATE notifications SET read = TRUE WHERE user_id = $1", [userId]);
        return true;
      } catch (err) {
        console.error("PostgreSQL notification markAllRead error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }
}
