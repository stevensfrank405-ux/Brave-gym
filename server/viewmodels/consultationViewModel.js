import { ConsultationModel } from "../models/Consultation.js";

export class ConsultationViewModel {
  static getConsultations() {
    return ConsultationModel.findAll();
  }

  static submitConsultation(data) {
    if (!data.userName || !data.phone) {
      throw new Error("Athlete name and contact phone are required");
    }
    return ConsultationModel.create(data);
  }

  static updateStatus(id, status) {
    return ConsultationModel.updateStatus(id, status);
  }

  static removeConsultation(id) {
    return ConsultationModel.delete(id);
  }
}
