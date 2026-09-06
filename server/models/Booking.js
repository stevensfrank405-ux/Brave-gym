import { JsonStore } from "./JsonStore.js";
import { v4 as uuidv4 } from "uuid";

const defaultBookings = [
  {
    id: "bk-1",
    userId: "usr-athlete-1",
    userName: "Darius Sterling",
    userEmail: "athlete@bravegym.com",
    classTitle: "Championship Boxing",
    trainer: "Marcus Vance",
    date: "Tuesday, 07:00 AM",
    room: "Main Athletic Floor",
    status: "Confirmed",
    createdAt: new Date().toISOString()
  }
];

export const bookingStore = new JsonStore("bookings", defaultBookings);

export class BookingModel {
  static findAll(predicate) {
    return bookingStore.findAll(predicate);
  }

  static findById(id) {
    return bookingStore.findById(id);
  }

  static findByUserId(userId) {
    return bookingStore.findAll((b) => String(b.userId) === String(userId));
  }

  static create(data) {
    const newBooking = {
      id: data.id || `bk-${uuidv4().slice(0, 8)}`,
      userId: data.userId,
      userName: data.userName || "Athlete",
      userEmail: data.userEmail || "",
      classTitle: data.classTitle,
      trainer: data.trainer,
      date: data.date,
      room: data.room || "Main Athletic Floor",
      status: data.status || "Confirmed",
      createdAt: new Date().toISOString()
    };
    bookingStore.insert(newBooking);
    return newBooking;
  }

  static delete(id) {
    return bookingStore.delete(id);
  }
}
