import { ProgramModel } from "../models/Program.js";

export class ProgramController {
  static async getAll(req, res) {
    try {
      const programs = await ProgramModel.findAll();
      res.json(programs);
    } catch (err) {
      console.error("Error fetching programs:", err);
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  }

  static async getOne(req, res) {
    try {
      const program = await ProgramModel.findById(req.params.id);
      if (!program) return res.status(404).json({ error: "Program not found" });
      res.json(program);
    } catch (err) {
      console.error("Error fetching program:", err);
      res.status(500).json({ error: "Failed to fetch program" });
    }
  }

  static async create(req, res) {
    try {
      const program = await ProgramModel.create(req.body);
      res.status(201).json(program);
    } catch (err) {
      console.error("Error creating program:", err);
      res.status(500).json({ error: "Failed to create program" });
    }
  }

  static async update(req, res) {
    try {
      const program = await ProgramModel.update(req.params.id, req.body);
      if (!program) return res.status(404).json({ error: "Program not found" });
      res.json(program);
    } catch (err) {
      console.error("Error updating program:", err);
      res.status(500).json({ error: "Failed to update program" });
    }
  }

  static async delete(req, res) {
    try {
      const success = await ProgramModel.delete(req.params.id);
      if (!success) return res.status(404).json({ error: "Program not found" });
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting program:", err);
      res.status(500).json({ error: "Failed to delete program" });
    }
  }
}
