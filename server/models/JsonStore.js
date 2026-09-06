import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");

export class JsonStore {
  constructor(collectionName, defaultData = []) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this.defaultData = defaultData;
    this._ensureFile();
  }

  _ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(this.defaultData, null, 2), "utf-8");
    }
  }

  read() {
    try {
      this._ensureFile();
      const raw = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(raw);
    } catch (err) {
      console.error(`Error reading ${this.filePath}:`, err);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (err) {
      console.error(`Error writing ${this.filePath}:`, err);
      return false;
    }
  }

  findAll(predicate) {
    const data = this.read();
    return predicate ? data.filter(predicate) : data;
  }

  findById(id) {
    const data = this.read();
    return data.find((item) => String(item.id) === String(id)) || null;
  }

  findOne(predicate) {
    const data = this.read();
    return data.find(predicate) || null;
  }

  insert(item) {
    const data = this.read();
    data.push(item);
    this.write(data);
    return item;
  }

  update(id, updates) {
    const data = this.read();
    const index = data.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return null;
    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    this.write(data);
    return data[index];
  }

  delete(id) {
    const data = this.read();
    const filtered = data.filter((item) => String(item.id) !== String(id));
    const deleted = filtered.length !== data.length;
    if (deleted) {
      this.write(filtered);
    }
    return deleted;
  }
}
