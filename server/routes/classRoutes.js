import express from "express";
import { ClassController } from "../controllers/classController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ClassController.getSchedule);
router.post("/", authenticate, requireAdmin, ClassController.createClass);
router.delete("/:id", authenticate, requireAdmin, ClassController.deleteClass);

export default router;
