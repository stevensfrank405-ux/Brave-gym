import { JsonStore } from "./JsonStore.js";
import { v4 as uuidv4 } from "uuid";

const defaultClasses = [
  { id: "sc-1", day: "Monday", time: "06:30 AM", classTitle: "Metabolic Warfare", trainer: "Jaxson Cole", spotsLeft: 3, total: 20 },
  { id: "sc-2", day: "Monday", time: "08:00 AM", classTitle: "Championship Boxing", trainer: "Marcus Vance", spotsLeft: 2, total: 16 },
  { id: "sc-3", day: "Monday", time: "05:30 PM", classTitle: "Iron Discipline Strength", trainer: "Elena Rostova", spotsLeft: 1, total: 12 },
  { id: "sc-4", day: "Tuesday", time: "07:00 AM", classTitle: "Championship Boxing", trainer: "Marcus Vance", spotsLeft: 5, total: 16 },
  { id: "sc-5", day: "Tuesday", time: "06:00 PM", classTitle: "Kinetic Reset & Ice Protocol", trainer: "Dr. Maya Lin", spotsLeft: 2, total: 8 },
  { id: "sc-6", day: "Wednesday", time: "06:30 AM", classTitle: "Iron Discipline Strength", trainer: "Elena Rostova", spotsLeft: 4, total: 12 },
  { id: "sc-7", day: "Wednesday", time: "05:30 PM", classTitle: "Metabolic Warfare", trainer: "Jaxson Cole", spotsLeft: 0, total: 20 },
  { id: "sc-8", day: "Thursday", time: "07:00 AM", classTitle: "Championship Boxing", trainer: "Marcus Vance", spotsLeft: 3, total: 16 },
  { id: "sc-9", day: "Friday", time: "05:30 PM", classTitle: "Friday Night Sparring & Conditioning", trainer: "Marcus Vance", spotsLeft: 6, total: 16 },
  { id: "sc-10", day: "Saturday", time: "09:00 AM", classTitle: "Brave Community Combine", trainer: "All Coaches", spotsLeft: 8, total: 30 }
];

export const classStore = new JsonStore("classes", defaultClasses);

export class ClassModel {
  static findAll() {
    return classStore.findAll();
  }

  static findById(id) {
    return classStore.findById(id);
  }

  static create(data) {
    const newClass = {
      id: data.id || `sc-${uuidv4().slice(0, 8)}`,
      day: data.day,
      time: data.time,
      classTitle: data.classTitle || data.class_title,
      trainer: data.trainer,
      spotsLeft: Number(data.spotsLeft ?? data.spots_left ?? data.total),
      total: Number(data.total),
      createdAt: new Date().toISOString()
    };
    classStore.insert(newClass);
    return newClass;
  }

  static update(id, updates) {
    return classStore.update(id, updates);
  }

  static delete(id) {
    return classStore.delete(id);
  }

  static decrementSpots(id) {
    const cls = classStore.findById(id);
    if (!cls) return null;
    const spotsLeft = Math.max(0, (cls.spotsLeft || 0) - 1);
    return classStore.update(id, { spotsLeft });
  }

  static incrementSpots(id) {
    const cls = classStore.findById(id);
    if (!cls) return null;
    const spotsLeft = Math.min(cls.total || 20, (cls.spotsLeft || 0) + 1);
    return classStore.update(id, { spotsLeft });
  }
}
