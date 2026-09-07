import { JsonStore } from "./JsonStore.js";
import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const defaultBookings = [];

export const bookingStore = new JsonStore("bookings", defaultBookings);

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
  static async findAll(predicate) {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM bookings ORDER BY created_at DESC");
        if (res && res.rows) {
          const mapped = res.rows.map(mapPgRowToBooking);
          return predicate ? mapped.filter(predicate) : mapped;
        }
      } catch (err) {
        console.warn("PostgreSQL bookings findAll error, falling back to local:", err.message);
      }
    }
    return bookingStore.findAll(predicate);
  }

  static async findById(id) {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM bookings WHERE id = $1 LIMIT 1", [id]);
        if (res.rows.length > 0) {
          return mapPgRowToBooking(res.rows[0]);
        }
      } catch (err) {
        console.warn("PostgreSQL bookings findById error:", err.message);
      }
    }
    return bookingStore.findById(id);
  }

  static async findByUserId(userId) {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        if (res && res.rows) {
          return res.rows.map(mapPgRowToBooking);
        }
      } catch (err) {
        console.warn("PostgreSQL bookings findByUserId error:", err.message);
      }
    }
    return bookingStore.findAll((b) => String(b.userId) === String(userId));
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
      } catch (err) {
        console.error("PostgreSQL booking insert error:", err.message);
      }
    }

    bookingStore.insert(newBooking);
    return newBooking;
  }

  static async delete(id) {
    if (db.isConfigured()) {
      try {
        await db.query("DELETE FROM bookings WHERE id = $1", [id]);
      } catch (err) {
        console.warn("PostgreSQL booking delete error:", err.message);
      }
    }
    return bookingStore.delete(id);
  }
}
