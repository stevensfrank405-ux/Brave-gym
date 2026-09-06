import { WorkoutLogModel } from "../models/WorkoutLog.js";

export class WorkoutViewModel {
  static getLogs(userId) {
    return WorkoutLogModel.findByUserId(userId);
  }

  static getAllLogs() {
    return WorkoutLogModel.findAll();
  }

  static addLog(userId, data) {
    if (!data.exercise) {
      throw new Error("Exercise routine is required");
    }
    return WorkoutLogModel.create({
      userId,
      exercise: data.exercise,
      weight: data.weight || "Bodyweight",
      notes: data.notes || "",
      date: data.date || "Today"
    });
  }
}
