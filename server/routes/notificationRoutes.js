import express from "express";
import { NotificationController } from "../controllers/notificationController.js";
import { optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuthenticate, NotificationController.getNotifications);
router.post("/", optionalAuthenticate, NotificationController.create);
router.patch("/read", optionalAuthenticate, NotificationController.markAllRead);

export default router;
