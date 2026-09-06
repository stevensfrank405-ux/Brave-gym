import { ConsultationModel } from "../models/Consultation.js";

export class ConsultationViewModel {
  static async getConsultations() {
    return ConsultationModel.findAll();
  }

  static async submitConsultation(data) {
    if (!data.userName || !data.phone) {
      throw new Error("Athlete name and contact phone are required");
    }
    return ConsultationModel.create(data);
  }

  static async updateStatus(id, status) {
    return ConsultationModel.updateStatus(id, status);
  }

  static async addMessage(id, message) {
    if (!message || !message.text) {
      throw new Error("Message text is required");
    }
    return ConsultationModel.addMessage(id, message);
  }

  static async removeConsultation(id) {
    return ConsultationModel.delete(id);
  }
}
