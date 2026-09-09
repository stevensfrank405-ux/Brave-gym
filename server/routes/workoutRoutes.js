import express from "express";
import { WorkoutController } from "../controllers/workoutController.js";
import { authenticate, optionalAuthenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuthenticate, WorkoutController.getLogs);
router.post("/", optionalAuthenticate, WorkoutController.addLog);
router.put("/:id/status", authenticate, requireAdmin, WorkoutController.updateLogStatus);

export default router;
