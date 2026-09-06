import { MembershipViewModel } from "../viewmodels/membershipViewModel.js";

export class MembershipController {
  static getTiers(req, res) {
    try {
      const tiers = MembershipViewModel.getTiers();
      return res.status(200).json({ success: true, data: tiers });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static createTier(req, res) {
    try {
      const created = MembershipViewModel.createTier(req.body);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static deleteTier(req, res) {
    try {
      const { id } = req.params;
      const success = MembershipViewModel.deleteTier(id);
      return res.status(200).json({ success, message: success ? "Tier deleted" : "Tier not found" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async purchase(req, res) {
    try {
      const userId = req.user ? req.user.id : req.body.userId;
      const result = await MembershipViewModel.purchasePlan({
        userId,
        plan: req.body.plan,
        userMeta: req.body.userMeta || { name: req.user?.name }
      });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
