import express from "express";
import { MembershipController } from "../controllers/membershipController.js";
import { authenticate, requireAdmin, optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", MembershipController.getTiers);
router.post("/", authenticate, requireAdmin, MembershipController.createTier);
router.delete("/:id", authenticate, requireAdmin, MembershipController.deleteTier);
router.post("/purchase", optionalAuthenticate, MembershipController.purchase);

export default router;
