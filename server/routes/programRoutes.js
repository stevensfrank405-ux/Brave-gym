import express from "express";
import { ProgramController } from "../controllers/programController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", ProgramController.getAll);
router.get("/:id", ProgramController.getOne);

// Admin only routes
router.post("/", requireAdmin, ProgramController.create);
router.put("/:id", requireAdmin, ProgramController.update);
router.delete("/:id", requireAdmin, ProgramController.delete);

export default router;
