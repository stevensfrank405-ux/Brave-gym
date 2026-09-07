import { JsonStore } from "./JsonStore.js";
import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const defaultConsultations = [];

export const consultationStore = new JsonStore("consultations", defaultConsultations);

function mapPgRowToConsultation(r) {
  if (!r) return null;
  let parsedMessages = [];
  if (Array.isArray(r.chat_messages)) {
    parsedMessages = r.chat_messages;
  } else if (typeof r.chat_messages === "string") {
    try {
      parsedMessages = JSON.parse(r.chat_messages);
    } catch {
      parsedMessages = [];
    }
  }
  return {
    id: r.id,
    userId: r.user_id,
    trainerId: r.trainer_id,
    trainerName: r.trainer_name,
    userName: r.user_name,
    phone: r.phone,
    address: r.address,
    serviceType: r.service_type,
    customRequirements: r.custom_requirements,
    chatMessages: parsedMessages,
    chatHistory: parsedMessages,
    status: r.status,
    createdAt: r.created_at
  };
}

export class ConsultationModel {
  static async findAll() {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM consultations ORDER BY created_at DESC");
        if (res.rows.length > 0) {
          return res.rows.map(mapPgRowToConsultation);
        }
      } catch (err) {
        console.warn("PostgreSQL consultations findAll error:", err.message);
      }
    }
    return consultationStore.findAll().map(c => ({
      ...c,
      chatMessages: c.chatMessages || c.chatHistory || [],
      chatHistory: c.chatMessages || c.chatHistory || []
    }));
  }

  static async findById(id) {
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM consultations WHERE id = $1 LIMIT 1", [id]);
        if (res.rows.length > 0) {
          return mapPgRowToConsultation(res.rows[0]);
        }
      } catch (err) {
        console.warn("PostgreSQL consultations findById error:", err.message);
      }
    }
    const local = consultationStore.findById(id);
    if (!local) return null;
    return {
      ...local,
      chatMessages: local.chatMessages || local.chatHistory || [],
      chatHistory: local.chatMessages || local.chatHistory || []
    };
  }

  static async findByUserId(userId) {
    if (db.isConfigured() && userId) {
      try {
        const res = await db.query("SELECT * FROM consultations WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        if (res.rows.length > 0) {
          return res.rows.map(mapPgRowToConsultation);
        }
      } catch (err) {
        console.warn("PostgreSQL consultations findByUserId error:", err.message);
      }
    }
    return consultationStore.findAll((c) => String(c.userId) === String(userId)).map(c => ({
      ...c,
      chatMessages: c.chatMessages || c.chatHistory || [],
      chatHistory: c.chatMessages || c.chatHistory || []
    }));
  }

  static async create(data) {
    const newReq = {
      id: data.id || `req-${uuidv4().slice(0, 8)}`,
      userId: data.userId || null,
      trainerId: data.trainerId || null,
      trainerName: data.trainerName || "Marcus Vance",
      userName: data.userName || data.name || "Athlete",
      phone: data.phone || "N/A",
      address: data.address || "",
      serviceType: data.serviceType || "Membership Negotiation",
      customRequirements: data.customRequirements || "",
      chatMessages: data.chatMessages || data.chatHistory || [],
      chatHistory: data.chatMessages || data.chatHistory || [],
      status: data.status || "Pending",
      createdAt: new Date().toISOString()
    };

    if (db.isConfigured()) {
      try {
        await db.query(
          `INSERT INTO consultations (
            id, user_id, trainer_id, trainer_name, user_name, phone, address, 
            service_type, custom_requirements, chat_messages, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
          [
            newReq.id,
            newReq.userId,
            newReq.trainerId,
            newReq.trainerName,
            newReq.userName,
            newReq.phone,
            newReq.address,
            newReq.serviceType,
            newReq.customRequirements,
            JSON.stringify(newReq.chatMessages),
            newReq.status
          ]
        );
      } catch (err) {
        console.error("PostgreSQL consultation insert error:", err.message);
      }
    }

    consultationStore.insert(newReq);
    return newReq;
  }

  static async updateStatus(id, status) {
    if (db.isConfigured()) {
      try {
        await db.query("UPDATE consultations SET status = $1 WHERE id = $2", [status, id]);
      } catch (err) {
        console.error("PostgreSQL consultation updateStatus error:", err.message);
      }
    }
    return consultationStore.update(id, { status });
  }

  static async addMessage(id, message) {
    let current = await this.findById(id);
    const newMsg = {
      sender: message.sender || "user",
      text: message.text || "",
      timestamp: new Date().toISOString()
    };

    if (!current) {
      // Auto-provision consultation thread for this athlete/order
      const derivedUserId = id.startsWith("order-user-") 
        ? id.replace("order-user-", "") 
        : (message.userId || null);

      const newThreadData = {
        id,
        userId: derivedUserId,
        trainerName: "Brave Gym Director",
        userName: message.userName || "Athlete",
        phone: "N/A",
        serviceType: "Membership Negotiation",
        customRequirements: "Direct athlete negotiation regarding membership order.",
        chatMessages: [newMsg],
        status: "Pending"
      };

      const created = await this.create(newThreadData);
      return {
        ...created,
        chatMessages: [newMsg],
        chatHistory: [newMsg]
      };
    }

    const messages = Array.isArray(current.chatMessages) 
      ? [...current.chatMessages] 
      : (Array.isArray(current.chatHistory) ? [...current.chatHistory] : []);
    messages.push(newMsg);

    if (db.isConfigured()) {
      try {
        await db.query("UPDATE consultations SET chat_messages = $1 WHERE id = $2", [
          JSON.stringify(messages),
          id
        ]);
      } catch (err) {
        console.error("PostgreSQL consultation addMessage error:", err.message);
      }
    }

    consultationStore.update(id, { chatMessages: messages, chatHistory: messages });
    return { ...current, chatMessages: messages, chatHistory: messages };
  }

  static async delete(id) {
    if (db.isConfigured()) {
      try {
        await db.query("DELETE FROM consultations WHERE id = $1", [id]);
      } catch (err) {
        console.error("PostgreSQL consultation delete error:", err.message);
      }
    }
    return consultationStore.delete(id);
  }
}
