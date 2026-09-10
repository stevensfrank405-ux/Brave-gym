import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { UserModel } from "../models/User.js";

export class AuthViewModel {
  static shapeUser(user) {
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  static async register({ name, email, password, role, membership }) {
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      throw new Error("Full name must be at least 2 characters long.");
    }

    if (!email || typeof email !== "string") {
      throw new Error("A valid email address is required.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error("Please enter a valid email address format (e.g. name@domain.com).");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const existing = await UserModel.findByEmail(cleanEmail);
    if (existing) {
      throw new Error("An athlete or account with this email is already registered.");
    }

    const isAdmin = cleanEmail.includes("admin") || role === "admin";
    const userRole = isAdmin ? "admin" : (role || "user");
    const userTier = isAdmin ? "Staff Command" : (membership || "");
    const userStatus = isAdmin ? "Active" : "Pending";

    const createdUser = await UserModel.create({
      name: name || (isAdmin ? "Admin Director" : cleanEmail.split("@")[0]),
      email: cleanEmail,
      password,
      role: userRole,
      membership: userTier,
      status: userStatus
    });

    if (!isAdmin) {
      let finalAmount = "$0.00";
      if (userTier) {
        try {
          const { MembershipTierModel } = await import("../models/MembershipTier.js");
          const tiers = await MembershipTierModel.findAll();
          const matchedTier = tiers.find(t => t.name.toLowerCase() === userTier.toLowerCase());
          if (matchedTier) {
            finalAmount = `$${matchedTier.price}`;
          } else {
             finalAmount = userTier.toLowerCase().includes("trial") ? "$0.00" : "$99.00";
          }
        } catch (err) {
          finalAmount = userTier.toLowerCase().includes("trial") ? "$0.00" : "$99.00";
        }
      }

      const { MembershipOrderModel } = await import("../models/MembershipOrder.js");
      const createdOrder = await MembershipOrderModel.create({
        userId: createdUser.id,
        member: createdUser.name,
        plan: userTier || "No Tier Selected",
        amount: finalAmount,
        status: "Pending",
        date: new Date().toISOString().split("T")[0]
      });

      const token = this.generateToken(createdUser);
      return {
        user: this.shapeUser(createdUser),
        order: createdOrder,
        token
      };
    }

    const token = this.generateToken(createdUser);
    return {
      user: this.shapeUser(createdUser),
      order: null,
      token
    };
  }

  static async login({ email, password, role }) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await UserModel.findByEmail(cleanEmail);

    if (!user) {
      throw new Error("No account found with this email. Please register first.");
    }

    const isValid = await UserModel.verifyPassword(user, password);
    if (!isValid) {
      throw new Error("Invalid email or password provided.");
    }

    const token = this.generateToken(user);
    return {
      user: this.shapeUser(user),
      token
    };
  }

  static async syncToken({ email, id }) {
    let user = null;
    if (id) {
      user = await UserModel.findById(id);
    }
    if (!user && email) {
      user = await UserModel.findByEmail(email);
    }

    if (!user) {
      throw new Error("Session verification failed: User profile not found.");
    }

    const token = this.generateToken(user);
    return {
      user: this.shapeUser(user),
      token
    };
  }

  static async updateProfile(userId, updates) {
    const allowed = [
      "name",
      "avatar",
      "bio",
      "phone",
      "weightClass",
      "discipline",
      "membership",
      "status"
    ];

    const cleanUpdates = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    }

    const updated = await UserModel.update(userId, cleanUpdates);
    return this.shapeUser(updated);
  }
}
