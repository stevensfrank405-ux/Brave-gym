import { WorkoutLogModel } from "../models/WorkoutLog.js";
import { UserModel } from "../models/User.js";

export class WorkoutViewModel {
  static async getLogs(userId) {
    return await WorkoutLogModel.findByUserId(userId);
  }

  static async getAllLogs() {
    return await WorkoutLogModel.findAll();
  }

  static async addLog(userId, data, userObj = null) {
    if (!data.exercise) {
      throw new Error("Exercise routine is required");
    }

    let userName = data.userName || "";
    let userEmail = data.userEmail || "";

    if ((!userName || !userEmail) && userObj) {
      userName = userObj.name || userName;
      userEmail = userObj.email || userEmail;
    } else if ((!userName || !userEmail) && userId) {
      try {
        const found = await UserModel.findById(userId);
        if (found) {
          userName = userName || found.name;
          userEmail = userEmail || found.email;
        }
      } catch (err) {
        console.warn("Could not load user for workout log:", err.message);
      }
    }

    return await WorkoutLogModel.create({
      userId,
      userName: userName || "Athlete",
      userEmail: userEmail || "",
      exercise: data.exercise,
      weight: data.weight || "Bodyweight",
      notes: data.notes || "",
      date: data.date || "Today",
      status: data.status || "Pending"
    });
  }

  static async updateStatus(id, status) {
    if (!id || !status) {
      throw new Error("Log ID and status are required");
    }
    const updated = await WorkoutLogModel.updateStatus(id, status);
    if (!updated) {
      throw new Error("Workout log entry not found");
    }
    return updated;
  }
}
