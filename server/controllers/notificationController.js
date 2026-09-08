import { NotificationViewModel } from "../viewmodels/notificationViewModel.js";

export class NotificationController {
  static async getNotifications(req, res) {
    try {
      const userId = req.user ? req.user.id : req.query.userId;
      const list = await NotificationViewModel.getUserNotifications(userId);
      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const notif = await NotificationViewModel.createNotification(req.body);
      return res.status(201).json({ success: true, data: notif });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async markAllRead(req, res) {
    try {
      const userId = req.user ? req.user.id : req.body.userId;
      await NotificationViewModel.markAllRead(userId);
      return res.status(200).json({ success: true, message: "Marked all as read" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
