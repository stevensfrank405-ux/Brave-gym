import { AdminViewModel } from "../viewmodels/adminViewModel.js";

export class AdminController {
  static getStats(req, res) {
    try {
      const stats = AdminViewModel.getStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
