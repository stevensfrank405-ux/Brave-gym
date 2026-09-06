import { JsonStore } from "./JsonStore.js";
import { v4 as uuidv4 } from "uuid";

const defaultNotifications = [
  {
    id: "notif-1",
    userId: "usr-athlete-1",
    title: "Class Reservation Confirmed",
    message: "Your spot in Championship Boxing with Marcus Vance has been secured.",
    type: "admin_response",
    read: false,
    createdAt: new Date().toISOString()
  }
];

export const notificationStore = new JsonStore("notifications", defaultNotifications);

export class NotificationModel {
  static findAll() {
    return notificationStore.findAll();
  }

  static findByUserId(userId) {
    return notificationStore.findAll((n) => String(n.userId) === String(userId));
  }

  static create(data) {
    const newNotif = {
      id: data.id || `notif-${uuidv4().slice(0, 8)}`,
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || "admin_response",
      read: false,
      createdAt: new Date().toISOString()
    };
    notificationStore.insert(newNotif);
    return newNotif;
  }

  static markAllRead(userId) {
    const data = notificationStore.read();
    let updated = false;
    for (const item of data) {
      if (String(item.userId) === String(userId) && !item.read) {
        item.read = true;
        updated = true;
      }
    }
    if (updated) {
      notificationStore.write(data);
    }
    return true;
  }
}
