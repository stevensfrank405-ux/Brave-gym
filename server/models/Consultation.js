import { JsonStore } from "./JsonStore.js";
import { v4 as uuidv4 } from "uuid";

const defaultConsultations = [
  {
    id: "req-1",
    userId: "usr-athlete-1",
    trainerId: "marcus-vance",
    trainerName: "Marcus Vance",
    userName: "Darius Sterling",
    phone: "+1 (555) 234-5678",
    address: "Brooklyn, NY",
    serviceType: "Private Boxing Assessment",
    customRequirements: "Preparing for amateur golden gloves competition next spring.",
    chatMessages: [
      { sender: "user", text: "Looking forward to working on ring mechanics and punch speed." },
      { sender: "trainer", text: "Welcome to Brave Gym. Let's schedule your kinetic baseline analysis." }
    ],
    status: "Pending",
    createdAt: new Date().toISOString()
  }
];

export const consultationStore = new JsonStore("consultations", defaultConsultations);

export class ConsultationModel {
  static findAll() {
    return consultationStore.findAll();
  }

  static findById(id) {
    return consultationStore.findById(id);
  }

  static create(data) {
    const newReq = {
      id: data.id || `req-${uuidv4().slice(0, 8)}`,
      userId: data.userId || null,
      trainerId: data.trainerId || null,
      trainerName: data.trainerName || "Marcus Vance",
      userName: data.userName || "Athlete",
      phone: data.phone || "",
      address: data.address || "",
      serviceType: data.serviceType || "Coaching Consultation",
      customRequirements: data.customRequirements || "",
      chatMessages: data.chatMessages || [],
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    consultationStore.insert(newReq);
    return newReq;
  }

  static updateStatus(id, status) {
    return consultationStore.update(id, { status });
  }

  static delete(id) {
    return consultationStore.delete(id);
  }
}
