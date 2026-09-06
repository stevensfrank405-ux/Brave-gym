import express from "express";
import { ConsultationController } from "../controllers/consultationController.js";
import { optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ConsultationController.getConsultations);
router.post("/", optionalAuthenticate, ConsultationController.submit);
router.patch("/:id/status", ConsultationController.updateStatus);
router.delete("/:id", ConsultationController.remove);

export default router;
