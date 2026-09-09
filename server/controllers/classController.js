import { ClassViewModel } from "../viewmodels/classViewModel.js";

export class ClassController {
  static async getSchedule(req, res) {
    try {
      const schedule = await ClassViewModel.getSchedule();
      return res.status(200).json({ success: true, data: schedule });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createClass(req, res) {
    try {
      const created = await ClassViewModel.createClass(req.body);
      const io = req.app.get("io");
      if (io) {
        io.emit("scheduleClassCreated", created);
      }
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteClass(req, res) {
    try {
      const { id } = req.params;
      const success = await ClassViewModel.deleteClass(id);
      const io = req.app.get("io");
      if (io && success) {
        io.emit("scheduleClassDeleted", { id });
      }
      return res.status(200).json({ success, message: success ? "Class deleted" : "Class not found" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
