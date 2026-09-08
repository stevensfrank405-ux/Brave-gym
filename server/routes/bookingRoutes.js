import express from "express";
import { BookingController } from "../controllers/bookingController.js";
import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuthenticate, BookingController.getBookings);
router.post("/", authenticate, BookingController.createBooking);
router.put("/:id", optionalAuthenticate, BookingController.updateBooking);
router.delete("/:id", optionalAuthenticate, BookingController.cancelBooking);

export default router;
