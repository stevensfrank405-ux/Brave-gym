import express from "express";
import { TrainerModel } from "../models/Trainer.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const trainers = await TrainerModel.findAll();
    res.json(trainers);
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res.status(500).json({ message: "Failed to fetch trainers", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const trainer = await TrainerModel.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    res.json(trainer);
  } catch (error) {
    console.error("Error fetching trainer:", error);
    res.status(500).json({ message: "Failed to fetch trainer", error: error.message });
  }
});

export default router;
