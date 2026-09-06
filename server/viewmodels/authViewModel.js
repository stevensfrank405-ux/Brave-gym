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
    const userTier = isAdmin ? "Staff Command" : (membership || "Brave Trial");

    const createdUser = await UserModel.create({
      name: name || (isAdmin ? "Admin Director" : cleanEmail.split("@")[0]),
      email: cleanEmail,
      password,
      role: userRole,
      membership: userTier
    });

    const token = this.generateToken(createdUser);
    return {
      user: this.shapeUser(createdUser),
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
      // Auto-provision user on valid login for smooth demo / migration experience
      const isAdmin = cleanEmail.includes("admin") || role === "admin";
      user = await UserModel.create({
        email: cleanEmail,
        password,
        name: isAdmin ? "Admin Director" : cleanEmail.split("@")[0],
        role: isAdmin ? "admin" : "user",
        membership: isAdmin ? "Staff Command" : "Black Tier"
      });
    } else {
      const isValid = await UserModel.verifyPassword(user, password);
      if (!isValid) {
        throw new Error("Invalid credentials provided");
      }
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
