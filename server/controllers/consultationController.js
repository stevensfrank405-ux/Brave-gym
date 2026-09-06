import { ConsultationViewModel } from "../viewmodels/consultationViewModel.js";

export class ConsultationController {
  static getConsultations(req, res) {
    try {
      const items = ConsultationViewModel.getConsultations();
      return res.status(200).json({ success: true, data: items });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static submit(req, res) {
    try {
      const result = ConsultationViewModel.submitConsultation({
        ...req.body,
        userId: req.user?.id || req.body.userId
      });
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = ConsultationViewModel.updateStatus(id, status);
      return res.status(200).json({ success: !!updated, data: updated });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static remove(req, res) {
    try {
      const { id } = req.params;
      const success = ConsultationViewModel.removeConsultation(id);
      return res.status(200).json({ success, message: success ? "Removed" : "Not found" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
