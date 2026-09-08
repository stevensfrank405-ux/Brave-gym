import { initPostgresTables } from "../config/db.js";
import { config } from "../config/config.js";

async function runMigration() {
  console.log("=========================================");
  console.log("🐘 Brave Gym PostgreSQL Migration Script");
  console.log("=========================================");

  if (!config.databaseUrl) {
    console.error("❌ ERROR: DATABASE_URL is not set in environment or .env file!");
    console.log("Please set DATABASE_URL=postgresql://user:pass@host:port/dbname");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL...");
  const success = await initPostgresTables();
  if (success) {
    console.log("✅ All 8 tables have been successfully created/verified:");
    console.log("   - users");
    console.log("   - classes");
    console.log("   - bookings");
    console.log("   - workout_logs");
    console.log("   - consultations");
    console.log("   - notifications");
    console.log("   - membership_tiers");
    console.log("   - membership_orders");
    console.log("=========================================");
    process.exit(0);
  } else {
    console.error("❌ Migration failed. Check error details above.");
    process.exit(1);
  }
}

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
