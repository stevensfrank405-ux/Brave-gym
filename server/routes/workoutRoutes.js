import express from "express";
import { WorkoutController } from "../controllers/workoutController.js";
import { optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuthenticate, WorkoutController.getLogs);
router.post("/", optionalAuthenticate, WorkoutController.addLog);

export default router;
