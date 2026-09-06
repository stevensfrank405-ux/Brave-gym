import { BookingModel } from "../models/Booking.js";
import { ClassModel } from "../models/Class.js";
import { NotificationModel } from "../models/Notification.js";

export class BookingViewModel {
  static getUserBookings(userId) {
    return BookingModel.findByUserId(userId);
  }

  static getAllBookings() {
    return BookingModel.findAll();
  }

  static createBooking({ userId, scheduleItem, userMeta }) {
    if (!scheduleItem || !scheduleItem.classTitle) {
      throw new Error("Class details are required for booking");
    }

    // Decrement class spots if matching schedule item exists
    if (scheduleItem.id) {
      ClassModel.decrementSpots(scheduleItem.id);
    }

    const booking = BookingModel.create({
      userId,
      userName: userMeta?.name || "Athlete",
      userEmail: userMeta?.email || "",
      classTitle: scheduleItem.classTitle,
      trainer: scheduleItem.trainer,
      date: scheduleItem.date || `${scheduleItem.day}, ${scheduleItem.time}`,
      room: scheduleItem.room || "Main Athletic Floor",
      status: "Confirmed"
    });

    // Notify user
    if (userId) {
      NotificationModel.create({
        userId,
        title: "Reservation Secured",
        message: `Your spot in ${scheduleItem.classTitle} with ${scheduleItem.trainer} is confirmed.`,
        type: "admin_response"
      });
    }

    return booking;
  }

  static cancelBooking(bookingId) {
    const booking = BookingModel.findById(bookingId);
    if (booking) {
      // Find class and increment spots if possible
      const classes = ClassModel.findAll();
      const matched = classes.find(
        (c) => c.classTitle === booking.classTitle && c.trainer === booking.trainer
      );
      if (matched) {
        ClassModel.incrementSpots(matched.id);
      }
    }
    return BookingModel.delete(bookingId);
  }
}
