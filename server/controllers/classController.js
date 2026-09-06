import { ClassViewModel } from "../viewmodels/classViewModel.js";

export class ClassController {
  static getSchedule(req, res) {
    try {
      const schedule = ClassViewModel.getSchedule();
      return res.status(200).json({ success: true, data: schedule });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static createClass(req, res) {
    try {
      const created = ClassViewModel.createClass(req.body);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static deleteClass(req, res) {
    try {
      const { id } = req.params;
      const success = ClassViewModel.deleteClass(id);
      return res.status(200).json({ success, message: success ? "Class deleted" : "Class not found" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
