import express from "express";
import { AdminController } from "../controllers/adminController.js";
import { optionalAuthenticate, authenticate, requireAdmin } from "../middleware/authMiddleware.js";
import { TrainerModel } from "../models/Trainer.js";

const router = express.Router();

router.get("/stats", optionalAuthenticate, AdminController.getStats);
router.delete("/users/:id", authenticate, requireAdmin, AdminController.deleteUser);

// Trainer Management
router.post("/trainers", authenticate, requireAdmin, async (req, res) => {
  try {
    const trainer = await TrainerModel.create(req.body);
    res.status(201).json(trainer);
  } catch (error) {
    res.status(500).json({ message: "Error creating trainer", error: error.message });
  }
});

router.put("/trainers/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const trainer = await TrainerModel.update(req.params.id, req.body);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: "Error updating trainer", error: error.message });
  }
});

router.delete("/trainers/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const success = await TrainerModel.delete(req.params.id);
    if (!success) return res.status(404).json({ message: "Trainer not found" });
    res.json({ message: "Trainer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting trainer", error: error.message });
  }
});

export default router;
