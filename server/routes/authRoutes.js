import express from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authenticate, AuthController.getMe);
router.put("/profile", authenticate, AuthController.updateProfile);
router.post("/avatar", authenticate, upload.single("avatar"), AuthController.uploadAvatar);

export default router;
