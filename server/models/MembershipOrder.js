import { JsonStore } from "./JsonStore.js";
import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const defaultMembershipOrders = [];

export const membershipOrderStore = new JsonStore("membership_orders", defaultMembershipOrders);

function mapPgRowToTx(r) {
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    member: r.member,
    plan: r.plan,
    amount: r.amount,
    status: r.status,
    date: r.date,
    createdAt: r.created_at
  };
}

export class MembershipOrderModel {
  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM membership_orders ORDER BY created_at DESC");
        if (res.rows.length > 0) {
          return res.rows.map(mapPgRowToTx);
        }
      } catch (err) {
        console.warn("PostgreSQL membership_orders findAll error, falling back to local:", err.message);
      }
    }
    return membershipOrderStore.findAll();
  }

  static async findById(id) {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM membership_orders WHERE id = $1 LIMIT 1", [id]);
        if (res.rows.length > 0) {
          return mapPgRowToTx(res.rows[0]);
        }
      } catch (err) {
        console.warn("PostgreSQL membership_orders findById error:", err.message);
      }
    }
    return membershipOrderStore.findById(id);
  }

  static async create(data) {
    const newTx = {
      id: data.id || `tx-${uuidv4().slice(0, 8)}`,
      userId: data.userId || null,
      member: data.member || "Athlete",
      plan: data.plan || "Membership Tier",
      amount: String(data.amount).startsWith("$") ? data.amount : `$${data.amount}`,
      status: data.status || "Pending",
      date: data.date || "Today",
      createdAt: new Date().toISOString()
    };

    if (db.isConfigured()) {
      try {
        await db.query(
          `INSERT INTO membership_orders (id, user_id, member, plan, amount, status, date, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [newTx.id, newTx.userId, newTx.member, newTx.plan, newTx.amount, newTx.status, newTx.date]
        );
      } catch (err) {
        console.error("PostgreSQL membership_orders insert error:", err.message);
      }
    }

    membershipOrderStore.insert(newTx);
    return newTx;
  }

  static async updateStatus(id, status) {
    if (db.isConfigured()) {
      try {
        await db.query("UPDATE membership_orders SET status = $1 WHERE id = $2", [status, id]);
      } catch (err) {
        console.error("PostgreSQL membership_orders update error:", err.message);
      }
    }
    return membershipOrderStore.update(id, { status });
  }
}
