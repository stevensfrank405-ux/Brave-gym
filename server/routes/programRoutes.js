import express from "express";
import { ProgramController } from "../controllers/programController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", ProgramController.getAll);
router.get("/:id", ProgramController.getOne);

// Admin only routes
router.post("/", authenticate, requireAdmin, ProgramController.create);
router.put("/:id", authenticate, requireAdmin, ProgramController.update);
router.delete("/:id", authenticate, requireAdmin, ProgramController.delete);

export default router;
