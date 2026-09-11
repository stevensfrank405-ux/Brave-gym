import express from "express";
import { AdminController } from "../controllers/adminController.js";
import { optionalAuthenticate, authenticate, requireAdmin } from "../middleware/authMiddleware.js";
import { TrainerModel } from "../models/Trainer.js";

import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/upload", authenticate, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ url: imageUrl });
});

import { db } from "../config/db.js";

router.get("/force-migrate", authenticate, requireAdmin, async (req, res) => {
  try {
    const migSqls = [
      `ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending'`,
      `ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS user_name VARCHAR(255)`,
      `ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS user_email VARCHAR(255)`,
      `CREATE INDEX IF NOT EXISTS idx_workout_logs_status ON workout_logs (status)`
    ];
    
    const results = [];
    for (const sql of migSqls) {
      try {
        await db.query(sql);
        results.push({ sql, status: "success" });
      } catch (err) {
        results.push({ sql, status: "error", error: err.message });
      }
    }
    
    res.json({ message: "Migration executed", results });
  } catch (err) {
    res.status(500).json({ message: "Migration failed completely", error: err.message });
  }
});

router.get("/stats", optionalAuthenticate, AdminController.getStats);
router.delete("/users/:id", authenticate, requireAdmin, AdminController.deleteUser);

// Trainer Management
router.post("/trainers", authenticate, requireAdmin, async (req, res) => {
  try {
    const trainer = await TrainerModel.create(req.body);
    const io = req.app.get("io");
    if (io && trainer) {
      io.emit("trainerCreated", trainer);
    }
    res.status(201).json(trainer);
  } catch (error) {
    res.status(500).json({ message: "Error creating trainer", error: error.message });
  }
});

router.put("/trainers/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const trainer = await TrainerModel.update(req.params.id, req.body);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });
    const io = req.app.get("io");
    if (io) {
      io.emit("trainerUpdated", trainer);
    }
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: "Error updating trainer", error: error.message });
  }
});

router.delete("/trainers/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const success = await TrainerModel.delete(req.params.id);
    if (!success) return res.status(404).json({ message: "Trainer not found" });
    const io = req.app.get("io");
    if (io) {
      io.emit("trainerDeleted", { id: req.params.id });
    }
    res.json({ message: "Trainer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting trainer", error: error.message });
  }
});

export default router;
