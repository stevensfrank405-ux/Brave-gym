import express from "express";
import { AdminController } from "../controllers/adminController.js";
import { optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", optionalAuthenticate, AdminController.getStats);

export default router;
