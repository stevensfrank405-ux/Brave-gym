import { NotificationModel } from "../models/Notification.js";

export class NotificationViewModel {
  static getUserNotifications(userId) {
    return NotificationModel.findByUserId(userId);
  }

  static createNotification({ userId, title, message, type }) {
    return NotificationModel.create({
      userId,
      title,
      message,
      type: type || "admin_response"
    });
  }

  static markAllRead(userId) {
    return NotificationModel.markAllRead(userId);
  }
}
