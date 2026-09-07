import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

function mapPgRowToBooking(r) {
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    userEmail: r.user_email,
    classTitle: r.class_title,
    trainer: r.trainer,
    date: r.date,
    room: r.room || "Main Athletic Floor",
    status: r.status || "Confirmed",
    createdAt: r.created_at
  };
}

export class BookingModel {
  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM bookings ORDER BY created_at DESC");
        if (res && res.rows) {
          return res.rows.map(mapPgRowToBooking);
        }
      } catch (err) {
        console.error("PostgreSQL bookings findAll error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
    return [];
  }

  static async findById(id) {
    if (!id) return null;
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM bookings WHERE id = $1 LIMIT 1", [id]);
        if (res.rows.length > 0) {
          return mapPgRowToBooking(res.rows[0]);
        }
      } catch (err) {
        console.error("PostgreSQL bookings findById error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
    return null;
  }

  static async findByUserId(userId) {
    if (!userId) return [];
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        if (res && res.rows) {
          return res.rows.map(mapPgRowToBooking);
        }
      } catch (err) {
        console.error("PostgreSQL bookings findByUserId error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
    return [];
  }

  static async create(data) {
    const newBooking = {
      id: data.id || `bk-${uuidv4().slice(0, 8)}`,
      userId: data.userId,
      userName: data.userName || "Athlete",
      userEmail: data.userEmail || "",
      classTitle: data.classTitle,
      trainer: data.trainer,
      date: data.date,
      room: data.room || "Main Athletic Floor",
      status: data.status || "Confirmed",
      createdAt: new Date().toISOString()
    };

    if (db.isConfigured()) {
      try {
        await db.query(
          `INSERT INTO bookings (id, user_id, user_name, user_email, class_title, trainer, date, room, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
          [
            newBooking.id,
            newBooking.userId,
            newBooking.userName,
            newBooking.userEmail,
            newBooking.classTitle,
            newBooking.trainer,
            newBooking.date,
            newBooking.room,
            newBooking.status
          ]
        );
        return newBooking;
      } catch (err) {
        console.error("PostgreSQL booking insert error:", err.message);
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
        await db.query("DELETE FROM bookings WHERE id = $1", [id]);
        return true;
      } catch (err) {
        console.error("PostgreSQL booking delete error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }
}
