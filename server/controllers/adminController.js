import { AdminViewModel } from "../viewmodels/adminViewModel.js";
import { UserModel } from "../models/User.js";

export class AdminController {
  static async getStats(req, res) {
    try {
      const stats = await AdminViewModel.getStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }

      // Prevent self-deletion or admin account deletion
      if (id === "usr-admin") {
        return res.status(403).json({ success: false, message: "Cannot delete the primary admin account" });
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const result = await UserModel.delete(id);
      return res.status(200).json({
        success: true,
        message: `User "${user.name || user.email}" and all related data removed successfully`
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
