import { AuthViewModel } from "../viewmodels/authViewModel.js";

export class AuthController {
  static async register(req, res) {
    try {
      const result = await AuthViewModel.register(req.body);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async login(req, res) {
    try {
      const result = await AuthViewModel.login(req.body);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(401).json({ success: false, message: err.message });
    }
  }

  static async getMe(req, res) {
    try {
      const user = AuthViewModel.shapeUser(req.user);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const updated = await AuthViewModel.updateProfile(req.user.id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file provided" });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      const updated = await AuthViewModel.updateProfile(req.user.id, { avatar: avatarUrl });
      return res.status(200).json({ success: true, data: { avatarUrl, user: updated } });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
