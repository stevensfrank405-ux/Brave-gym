import { MembershipViewModel } from "../viewmodels/membershipViewModel.js";

export class MembershipController {
  static async getTiers(req, res) {
    try {
      const tiers = await MembershipViewModel.getTiers();
      return res.status(200).json({ success: true, data: tiers });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createTier(req, res) {
    try {
      const created = await MembershipViewModel.createTier(req.body);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteTier(req, res) {
    try {
      const { id } = req.params;
      const success = await MembershipViewModel.deleteTier(id);
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

  static async getOrders(req, res) {
    try {
      const orders = await MembershipViewModel.getOrders();
      return res.status(200).json({ success: true, data: orders });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async approve(req, res) {
    try {
      const { orderId, userId, planName } = req.body;
      const result = await MembershipViewModel.approveOrder({ orderId, userId, planName });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async reject(req, res) {
    try {
      const { orderId, userId, reason } = req.body;
      const result = await MembershipViewModel.rejectOrder({ orderId, userId, reason });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
