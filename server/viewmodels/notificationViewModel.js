import { NotificationModel } from "../models/Notification.js";

export class NotificationViewModel {
  static async getUserNotifications(userId) {
    return await NotificationModel.findByUserId(userId);
  }

  static async createNotification({ userId, title, message, type }) {
    return await NotificationModel.create({
      userId,
      title,
      message,
      type: type || "admin_response"
    });
  }

  static async markAllRead(userId) {
    return await NotificationModel.markAllRead(userId);
  }
}
