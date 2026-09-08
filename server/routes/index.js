import express from "express";
import authRoutes from "./authRoutes.js";
import classRoutes from "./classRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import workoutRoutes from "./workoutRoutes.js";
import consultationRoutes from "./consultationRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import membershipRoutes from "./membershipRoutes.js";
import programRoutes from "./programRoutes.js";
import adminRoutes from "./adminRoutes.js";
import trainerRoutes from "./trainerRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/classes", classRoutes);
router.use("/programs", programRoutes);
router.use("/bookings", bookingRoutes);
router.use("/workouts", workoutRoutes);
router.use("/consultations", consultationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/memberships", membershipRoutes);
router.use("/trainers", trainerRoutes);
router.use("/admin", adminRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

export default router;
