import { ConsultationViewModel } from "../viewmodels/consultationViewModel.js";

export class ConsultationController {
  static async getConsultations(req, res) {
    try {
      const items = await ConsultationViewModel.getConsultations();
      return res.status(200).json({ success: true, data: items });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async submit(req, res) {
    try {
      const result = await ConsultationViewModel.submitConsultation({
        ...req.body,
        userId: req.user?.id || req.body.userId
      });
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await ConsultationViewModel.updateStatus(id, status);
      return res.status(200).json({ success: !!updated, data: updated });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { text, sender, userId, userName } = req.body;
      const updated = await ConsultationViewModel.addMessage(id, {
        text,
        sender: sender || (req.user?.role === "admin" ? "admin" : "user"),
        userId: req.user?.id || userId,
        userName: req.user?.name || userName
      });

      // Broadcast real-time update via Socket.io
      const io = req.app.get("io");
      if (io) {
        io.emit("consultationUpdated", updated);
      }

      return res.status(200).json({ success: !!updated, data: updated });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async remove(req, res) {
    try {
      const { id } = req.params;
      const success = await ConsultationViewModel.removeConsultation(id);
      return res.status(200).json({ success, message: success ? "Removed" : "Not found" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
