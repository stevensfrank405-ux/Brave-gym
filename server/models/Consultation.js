import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { localStore } from "../config/localStore.js";

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
        return res.rows.map(mapPgRowToConsultation);
      } catch (err) {
        console.error("PostgreSQL consultations findAll error:", err.message);
        throw err;
      }
    }
    return localStore.getCollection("consultations");
  }

  static async findById(id) {
    if (!id) return null;
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM consultations WHERE id = $1 LIMIT 1", [id]);
        if (res.rows.length > 0) {
          return mapPgRowToConsultation(res.rows[0]);
        }
        return null;
      } catch (err) {
        console.error("PostgreSQL consultations findById error:", err.message);
        throw err;
      }
    }
    const consultations = localStore.getCollection("consultations");
    return consultations.find((c) => c.id === id) || null;
  }

  static async findByUserId(userId) {
    if (!userId) return [];
    if (db.isConfigured()) {
      try {
        const res = await db.query("SELECT * FROM consultations WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        return res.rows.map(mapPgRowToConsultation);
      } catch (err) {
        console.error("PostgreSQL consultations findByUserId error:", err.message);
        throw err;
      }
    }
    const consultations = localStore.getCollection("consultations");
    return consultations.filter((c) => c.userId === userId);
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
            newReq.id, newReq.userId, newReq.trainerId, newReq.trainerName,
            newReq.userName, newReq.phone, newReq.address, newReq.serviceType,
            newReq.customRequirements, JSON.stringify(newReq.chatMessages), newReq.status
          ]
        );
        return newReq;
      } catch (err) {
        console.error("PostgreSQL consultation insert error:", err.message);
        throw err;
      }
    }

    const consultations = localStore.getCollection("consultations");
    consultations.unshift(newReq);
    localStore.saveCollection("consultations", consultations);
    return newReq;
  }

  static async updateStatus(id, status) {
    if (db.isConfigured()) {
      try {
        await db.query("UPDATE consultations SET status = $1 WHERE id = $2", [status, id]);
        return await this.findById(id);
      } catch (err) {
        console.error("PostgreSQL consultation updateStatus error:", err.message);
        throw err;
      }
    }
    const consultations = localStore.getCollection("consultations");
    const idx = consultations.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    consultations[idx].status = status;
    localStore.saveCollection("consultations", consultations);
    return consultations[idx];
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

    const messages = Array.isArray(current.chatMessages) ? [...current.chatMessages] : [];
    messages.push(newMsg);

    if (db.isConfigured()) {
      try {
        await db.query("UPDATE consultations SET chat_messages = $1 WHERE id = $2", [
          JSON.stringify(messages),
          id
        ]);
        return { ...current, chatMessages: messages, chatHistory: messages };
      } catch (err) {
        console.error("PostgreSQL consultation addMessage error:", err.message);
        throw err;
      }
    }

    const consultations = localStore.getCollection("consultations");
    const idx = consultations.findIndex((c) => c.id === id);
    if (idx !== -1) {
      consultations[idx].chatMessages = messages;
      localStore.saveCollection("consultations", consultations);
    }
    return { ...current, chatMessages: messages, chatHistory: messages };
  }

  static async delete(id) {
    if (db.isConfigured()) {
      try {
        await db.query("DELETE FROM consultations WHERE id = $1", [id]);
        return true;
      } catch (err) {
        console.error("PostgreSQL consultation delete error:", err.message);
        throw err;
      }
    }
    const consultations = localStore.getCollection("consultations");
    const filtered = consultations.filter((c) => c.id !== id);
    localStore.saveCollection("consultations", filtered);
    return true;
  }
}
