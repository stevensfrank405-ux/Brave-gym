import { WorkoutViewModel } from "../viewmodels/workoutViewModel.js";

export class WorkoutController {
  static getLogs(req, res) {
    try {
      const { all } = req.query;
      if (all === "true" || (req.user && req.user.role === "admin")) {
        const logs = WorkoutViewModel.getAllLogs();
        return res.status(200).json({ success: true, data: logs });
      }
      const userId = req.user ? req.user.id : req.query.userId;
      const logs = WorkoutViewModel.getLogs(userId);
      return res.status(200).json({ success: true, data: logs });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static addLog(req, res) {
    try {
      const userId = req.user ? req.user.id : req.body.userId;
      const log = WorkoutViewModel.addLog(userId, req.body);
      return res.status(201).json({ success: true, data: log });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
