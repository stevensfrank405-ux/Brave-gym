import { JsonStore } from "./JsonStore.js";
import { v4 as uuidv4 } from "uuid";

const defaultLogs = [
  {
    id: "log-1",
    userId: "usr-athlete-1",
    exercise: "Clean & Jerk",
    weight: "225 lbs",
    notes: "Triple at RPE 8. Explosive bar speed.",
    date: "Today",
    createdAt: new Date().toISOString()
  },
  {
    id: "log-2",
    userId: "usr-athlete-1",
    exercise: "Heavy Bag Sparring",
    weight: "6 Rounds",
    notes: "Combinations sharp, heart rate recovery sub-60s.",
    date: "Yesterday",
    createdAt: new Date().toISOString()
  }
];

export const workoutStore = new JsonStore("workouts", defaultLogs);

export class WorkoutLogModel {
  static findAll() {
    return workoutStore.findAll();
  }

  static findByUserId(userId) {
    return workoutStore.findAll((l) => String(l.userId) === String(userId));
  }

  static create(data) {
    const newLog = {
      id: data.id || `log-${uuidv4().slice(0, 8)}`,
      userId: data.userId,
      exercise: data.exercise,
      weight: data.weight || "Bodyweight",
      notes: data.notes || "",
      date: data.date || "Today",
      createdAt: new Date().toISOString()
    };
    workoutStore.insert(newLog);
    return newLog;
  }

  static delete(id) {
    return workoutStore.delete(id);
  }
}
