import express from "express";
import { AdminController } from "../controllers/adminController.js";
import { optionalAuthenticate, authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", optionalAuthenticate, AdminController.getStats);
router.delete("/users/:id", authenticate, requireAdmin, AdminController.deleteUser);

export default router;
