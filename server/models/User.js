import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

function mapPgRowToUser(r) {
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash || r.passwordHash,
    name: r.name,
    role: r.role,
    membership: r.membership,
    membership_tier: r.membership,
    status: r.status,
    renewalDate: r.renewal_date || r.renewalDate,
    streak: Number(r.streak || 0),
    sessionsThisMonth: Number(r.sessions_this_month || 0),
    avatar: r.avatar,
    avatar_url: r.avatar,
    bio: r.bio,
    phone: r.phone,
    weightClass: r.weight_class,
    weight_class: r.weight_class,
    discipline: r.discipline,
    createdAt: r.created_at
  };
}

export class UserModel {
  static async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", [cleanEmail]);
        if (res.rows.length > 0) {
          return mapPgRowToUser(res.rows[0]);
        }
      } catch (err) {
        console.error("PostgreSQL findByEmail error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
    return null;
  }

  static async findById(id) {
    if (!id) return null;
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
        if (res.rows.length > 0) {
          return mapPgRowToUser(res.rows[0]);
        }
      } catch (err) {
        console.error("PostgreSQL findById error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
    return null;
  }

  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM users ORDER BY created_at DESC");
        if (res && res.rows) {
          return res.rows.map(mapPgRowToUser);
        }
      } catch (err) {
        console.error("PostgreSQL findAll error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
    return [];
  }

  static async create({ email, password, name, role = "user", membership = "" }) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const cleanEmail = email.trim().toLowerCase();
    const newUser = {
      id: "usr-" + uuidv4().slice(0, 8),
      email: cleanEmail,
      passwordHash,
      name: name || cleanEmail.split("@")[0],
      role,
      membership: membership || "",
      status: role === "admin" ? "Active" : "Pending",
      renewalDate: role === "admin" ? "Staff Sovereign" : "Pending Admin Approval",
      streak: role === "admin" ? 42 : 0,
      sessionsThisMonth: role === "admin" ? 24 : 0,
      avatar: role === "admin"
        ? "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg"
        : "/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg",
      bio: "Discipline over motivation. Training for athletic excellence.",
      phone: "",
      weightClass: "Open Weight",
      discipline: "General Conditioning & Strength",
      createdAt: new Date().toISOString()
    };

    if (db.isConfigured()) {
      try {
        await db.query(
          `INSERT INTO users (
            id, email, password_hash, name, role, membership, status, 
            renewal_date, streak, sessions_this_month, avatar, bio, phone, 
            weight_class, discipline, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())`,
          [
            newUser.id, newUser.email, newUser.passwordHash, newUser.name,
            newUser.role, newUser.membership, newUser.status, newUser.renewalDate,
            newUser.streak, newUser.sessionsThisMonth, newUser.avatar, newUser.bio,
            newUser.phone, newUser.weightClass, newUser.discipline
          ]
        );
        return newUser;
      } catch (err) {
        console.error("PostgreSQL user insert error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }

  static async verifyPassword(user, password) {
    if (!user || !user.passwordHash) return false;
    return bcrypt.compare(password, user.passwordHash);
  }

  static async update(id, updates) {
    if (db.isConfigured()) {
      try {
        const setClauses = [];
        const values = [];
        let idx = 1;

        if (updates.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(updates.name); }
        if (updates.avatar !== undefined) { setClauses.push(`avatar = $${idx++}`); values.push(updates.avatar); }
        if (updates.bio !== undefined) { setClauses.push(`bio = $${idx++}`); values.push(updates.bio); }
        if (updates.phone !== undefined) { setClauses.push(`phone = $${idx++}`); values.push(updates.phone); }
        if (updates.weightClass !== undefined) { setClauses.push(`weight_class = $${idx++}`); values.push(updates.weightClass); }
        if (updates.discipline !== undefined) { setClauses.push(`discipline = $${idx++}`); values.push(updates.discipline); }
        if (updates.membership !== undefined) { setClauses.push(`membership = $${idx++}`); values.push(updates.membership); }
        if (updates.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(updates.status); }
        if (updates.renewalDate !== undefined) { setClauses.push(`renewal_date = $${idx++}`); values.push(updates.renewalDate); }
        if (updates.role !== undefined) { setClauses.push(`role = $${idx++}`); values.push(updates.role); }

        if (setClauses.length > 0) {
          setClauses.push(`updated_at = NOW()`);
          values.push(id);
          const q = `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`;
          const res = await db.query(q, values);
          if (res.rows.length > 0) {
            return mapPgRowToUser(res.rows[0]);
          }
        }
        return null;
      } catch (err) {
        console.error("PostgreSQL user update error:", err.message);
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
        await db.query("BEGIN");
        
        // Find user to get email for complete cascade wipe
        const uRes = await db.query("SELECT id, email FROM users WHERE id = $1 LIMIT 1", [id]);
        const userEmail = uRes.rows.length > 0 ? uRes.rows[0].email : null;

        // 1. Delete all bookings associated by user_id OR email
        if (userEmail) {
          await db.query("DELETE FROM bookings WHERE user_id = $1 OR LOWER(user_email) = LOWER($2)", [id, userEmail]);
        } else {
          await db.query("DELETE FROM bookings WHERE user_id = $1", [id]);
        }

        // 2. Delete all consultation chats & support threads
        await db.query("DELETE FROM consultations WHERE user_id = $1", [id]);

        // 3. Delete all membership orders & payment records
        await db.query("DELETE FROM membership_orders WHERE user_id = $1", [id]);

        // 4. Delete all athlete notifications
        await db.query("DELETE FROM notifications WHERE user_id = $1", [id]);

        // 5. Delete all workout logs
        await db.query("DELETE FROM workout_logs WHERE user_id = $1", [id]);

        // 6. Delete user profile
        const res = await db.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
        
        if (res.rows.length === 0) {
          await db.query("ROLLBACK");
          console.warn(`User ${id} not found in PostgreSQL`);
          return false;
        }
        
        await db.query("COMMIT");
        return true;
      } catch (err) {
        await db.query("ROLLBACK");
        console.error("PostgreSQL user delete error:", err.message);
        throw err;
      }
    } else {
      throw new Error("Database is not configured.");
    }
  }
}
