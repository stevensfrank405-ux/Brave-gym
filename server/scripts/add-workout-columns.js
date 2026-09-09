/**
 * One-time migration: add missing columns to workout_logs table
 * Run: node server/scripts/add-workout-columns.js
 */
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config({ path: new URL("../../.env", import.meta.url).pathname });

const dbUrl = (process.env.DATABASE_URL || "").trim();
if (!dbUrl) {
  console.error("❌ DATABASE_URL not set.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes("localhost") ? false : { rejectUnauthorized: false }
});

const migrations = [
  `ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending'`,
  `ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS user_name VARCHAR(255)`,
  `ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS user_email VARCHAR(255)`,
  `UPDATE workout_logs SET status = 'Pending' WHERE status IS NULL`,
  `CREATE INDEX IF NOT EXISTS idx_workout_logs_status ON workout_logs (status)`
];

async function run() {
  const client = await pool.connect();
  try {
    console.log("Connected to PostgreSQL");
    for (const sql of migrations) {
      try {
        await client.query(sql);
        console.log("OK:", sql.slice(0, 70));
      } catch (err) {
        console.warn("SKIP:", sql.slice(0, 70), "=>", err.message);
      }
    }
    const check = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'workout_logs' AND column_name IN ('status', 'user_name', 'user_email')
    `);
    console.log("\nColumns now in workout_logs:", check.rows.map(r => r.column_name).join(", "));
    console.log("Migration complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error("Migration failed:", err.message); process.exit(1); });
