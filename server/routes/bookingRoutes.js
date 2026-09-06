import express from "express";
import { BookingController } from "../controllers/bookingController.js";
import { optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuthenticate, BookingController.getBookings);
router.post("/", optionalAuthenticate, BookingController.createBooking);
router.delete("/:id", optionalAuthenticate, BookingController.cancelBooking);

export default router;
