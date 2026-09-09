import { ClassModel } from "../models/Class.js";

export class ClassViewModel {
  static async getSchedule() {
    const classes = await ClassModel.findAll();
    return classes.map((c) => ({
      id: c.id,
      day: c.day,
      time: c.time,
      classTitle: c.classTitle,
      trainer: c.trainer,
      spotsLeft: c.spotsLeft,
      total: c.total
    }));
  }

  static async createClass(data) {
    if (!data.classTitle || !data.trainer || !data.day || !data.time) {
      throw new Error("Class title, trainer, day, and time are required");
    }
    return await ClassModel.create(data);
  }

  static async deleteClass(id) {
    return await ClassModel.delete(id);
  }
}
