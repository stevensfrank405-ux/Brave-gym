import { WorkoutViewModel } from "../viewmodels/workoutViewModel.js";
import { NotificationModel } from "../models/Notification.js";

export class WorkoutController {
  static async getLogs(req, res) {
    try {
      const { all } = req.query;
      if (all === "true" || (req.user && req.user.role === "admin")) {
        const logs = await WorkoutViewModel.getAllLogs();
        return res.status(200).json({ success: true, data: logs });
      }
      const userId = req.user ? req.user.id : req.query.userId;
      const logs = await WorkoutViewModel.getLogs(userId);
      return res.status(200).json({ success: true, data: logs });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async addLog(req, res) {
    try {
      const userId = req.user ? req.user.id : req.body.userId;
      const log = await WorkoutViewModel.addLog(userId, req.body, req.user);

      // Emit real-time socket event so both Admin and User dashboards receive it
      const io = req.app.get("io");
      if (io) {
        io.emit("workoutLogCreated", log);
      }

      return res.status(201).json({ success: true, data: log });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateLogStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
      }

      const updatedLog = await WorkoutViewModel.updateStatus(id, status);

      // Notify user via in-app notification
      if (updatedLog && updatedLog.userId) {
        try {
          const statusText = status === "Approved" ? "approved" : "reviewed/rejected";
          await NotificationModel.create({
            userId: updatedLog.userId,
            title: `Workout Log ${status}`,
            message: `Admin has ${statusText} your workout log entry: "${updatedLog.exercise}" (${updatedLog.weight}).`,
            type: status === "Approved" ? "success" : "alert"
          });
        } catch (notifErr) {
          console.warn("Could not dispatch workout status notification:", notifErr.message);
        }
      }

      // Emit real-time socket event
      const io = req.app.get("io");
      if (io) {
        io.emit("workoutLogUpdated", updatedLog);
      }

      return res.status(200).json({ success: true, data: updatedLog });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
