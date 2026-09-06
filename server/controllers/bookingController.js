import { BookingViewModel } from "../viewmodels/bookingViewModel.js";

export class BookingController {
  static getBookings(req, res) {
    try {
      const { all } = req.query;
      if (all === "true" || (req.user && req.user.role === "admin")) {
        const bookings = BookingViewModel.getAllBookings();
        return res.status(200).json({ success: true, data: bookings });
      }
      const userId = req.user ? req.user.id : req.query.userId;
      const bookings = BookingViewModel.getUserBookings(userId);
      return res.status(200).json({ success: true, data: bookings });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static createBooking(req, res) {
    try {
      const userId = req.user?.id || req.body.userId;
      const booking = BookingViewModel.createBooking({
        userId,
        scheduleItem: req.body.scheduleItem || req.body,
        userMeta: req.body.userMeta || { name: req.user?.name, email: req.user?.email }
      });
      return res.status(201).json({ success: true, data: booking });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const success = BookingViewModel.cancelBooking(id);
      return res.status(200).json({ success, message: success ? "Booking cancelled" : "Booking not found" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
