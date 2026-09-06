import { NotificationViewModel } from "../viewmodels/notificationViewModel.js";

export class NotificationController {
  static getNotifications(req, res) {
    try {
      const userId = req.user ? req.user.id : req.query.userId;
      const list = NotificationViewModel.getUserNotifications(userId);
      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static create(req, res) {
    try {
      const notif = NotificationViewModel.createNotification(req.body);
      return res.status(201).json({ success: true, data: notif });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static markAllRead(req, res) {
    try {
      const userId = req.user ? req.user.id : req.body.userId;
      NotificationViewModel.markAllRead(userId);
      return res.status(200).json({ success: true, message: "Marked all as read" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
