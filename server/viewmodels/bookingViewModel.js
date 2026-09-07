import { BookingModel } from "../models/Booking.js";
import { ClassModel } from "../models/Class.js";
import { NotificationModel } from "../models/Notification.js";

export class BookingViewModel {
  static async getUserBookings(userId) {
    return BookingModel.findByUserId(userId);
  }

  static async getAllBookings() {
    return BookingModel.findAll();
  }

  static async createBooking({ userId, scheduleItem, userMeta }) {
    if (!scheduleItem || !scheduleItem.classTitle) {
      throw new Error("Class details are required for booking");
    }

    // Decrement class spots in PostgreSQL & memory
    let updatedClass = null;
    if (scheduleItem.id) {
      updatedClass = await ClassModel.decrementSpots(scheduleItem.id);
    } else {
      const classes = await ClassModel.findAll();
      const matched = classes.find(
        (c) => c.classTitle === scheduleItem.classTitle && c.trainer === scheduleItem.trainer
      );
      if (matched) {
        updatedClass = await ClassModel.decrementSpots(matched.id);
      }
    }

    const booking = await BookingModel.create({
      userId,
      userName: userMeta?.name || "Athlete",
      userEmail: userMeta?.email || "",
      classTitle: scheduleItem.classTitle,
      trainer: scheduleItem.trainer,
      date: scheduleItem.date || `${scheduleItem.day}, ${scheduleItem.time}`,
      room: scheduleItem.room || "Main Athletic Floor",
      status: "Confirmed"
    });

    // Generate real-time confirmation notification for athlete
    if (userId) {
      await NotificationModel.create({
        userId,
        title: "Class Reservation Confirmed",
        message: `Your spot in ${scheduleItem.classTitle} with coach ${scheduleItem.trainer} is secured (${booking.date}). Room: ${booking.room}.`,
        type: "admin_response"
      });
    }

    // Generate admin notification so HQ monitors class enrollment in real time
    await NotificationModel.create({
      userId: null,
      title: "New Athlete Class Enrollment",
      message: `${userMeta?.name || "An athlete"} enrolled in ${scheduleItem.classTitle} (${booking.date}). Remaining spots: ${updatedClass?.spotsLeft ?? "updated"}.`,
      type: "admin_response"
    });

    return { booking, updatedClass };
  }

  static async cancelBooking(bookingId) {
    const booking = await BookingModel.findById(bookingId);
    if (booking) {
      // Find class and increment spots
      const classes = await ClassModel.findAll();
      const matched = classes.find(
        (c) => c.classTitle === booking.classTitle && c.trainer === booking.trainer
      );
      if (matched) {
        await ClassModel.incrementSpots(matched.id);
      }
    }
    return BookingModel.delete(bookingId);
  }
}
