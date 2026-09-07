import pkg from "pg";
const { Pool } = pkg;
import { config } from "../config/config.js";

let pool = null;

const rawDbUrl = (config.databaseUrl || "").trim();

if (rawDbUrl && (rawDbUrl.startsWith("postgres://") || rawDbUrl.startsWith("postgresql://"))) {
  try {
    // Validate with URL constructor to avoid crash on malformed string
    new URL(rawDbUrl);
    pool = new Pool({
      connectionString: rawDbUrl,
      ssl: rawDbUrl.includes("localhost") ? false : { rejectUnauthorized: false }
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client:", err);
    });
  } catch (urlErr) {
    console.warn("⚠️ Invalid DATABASE_URL format provided. Falling back to local file store:", urlErr.message);
    pool = null;
  }
} else if (rawDbUrl) {
  console.warn("⚠️ DATABASE_URL does not start with postgresql:// or postgres://. Value:", rawDbUrl);
}

export const db = {
  isConfigured: () => Boolean(pool),
  query: async (text, params) => {
    if (!pool) return null;
    return pool.query(text, params);
  },
  pool
};

export async function initPostgresTables() {
  if (!pool) return false;

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      membership VARCHAR(100) DEFAULT 'Brave Trial',
      status VARCHAR(50) DEFAULT 'Pending',
      renewal_date VARCHAR(100) DEFAULT 'Pending Admin Approval',
      streak INT DEFAULT 0,
      sessions_this_month INT DEFAULT 0,
      avatar TEXT,
      bio TEXT,
      phone VARCHAR(50),
      weight_class VARCHAR(100),
      discipline VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
    CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

    CREATE TABLE IF NOT EXISTS membership_tiers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price NUMERIC(10,2) NOT NULL DEFAULT 0,
      interval VARCHAR(50) DEFAULT 'monthly',
      billing VARCHAR(50) DEFAULT 'monthly',
      description TEXT,
      features JSONB DEFAULT '[]'::jsonb,
      popular BOOLEAN DEFAULT FALSE,
      cta VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS classes (
      id VARCHAR(50) PRIMARY KEY,
      day VARCHAR(50) NOT NULL,
      time VARCHAR(50) NOT NULL,
      class_title VARCHAR(255) NOT NULL,
      trainer VARCHAR(255) NOT NULL,
      spots_left INT NOT NULL DEFAULT 16,
      total INT NOT NULL DEFAULT 16,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_classes_day ON classes (day);

    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
      user_name VARCHAR(255),
      user_email VARCHAR(255),
      class_title VARCHAR(255) NOT NULL,
      trainer VARCHAR(255) NOT NULL,
      date VARCHAR(100) NOT NULL,
      room VARCHAR(100) DEFAULT 'Main Athletic Floor',
      status VARCHAR(50) DEFAULT 'Confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
      member VARCHAR(255) NOT NULL,
      plan VARCHAR(255) NOT NULL,
      amount VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      date VARCHAR(100) DEFAULT 'Today',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);

    CREATE TABLE IF NOT EXISTS consultations (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
      trainer_id VARCHAR(50),
      trainer_name VARCHAR(255) NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL,
      address TEXT,
      service_type VARCHAR(255) NOT NULL,
      custom_requirements TEXT,
      chat_messages JSONB DEFAULT '[]'::jsonb,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations (user_id);
    CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations (status);

    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'admin_response',
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (user_id, read);

    CREATE TABLE IF NOT EXISTS workout_logs (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
      exercise VARCHAR(255) NOT NULL,
      weight VARCHAR(100),
      notes TEXT,
      date VARCHAR(100) DEFAULT 'Today',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs (user_id);
  `;

  try {
    await pool.query(schemaSql);
    console.log("🐘 PostgreSQL schema initialized successfully!");

    // Auto-update trigger for users.updated_at
    try {
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
        $$ LANGUAGE plpgsql;
      `);
      await pool.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
            CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
          END IF;
        END; $$;
      `);
    } catch (triggerErr) {
      console.warn("Trigger creation skipped:", triggerErr.message);
    }

    // Seed admin and demo athlete if users table is empty
    const userCheck = await pool.query("SELECT COUNT(*) FROM users");
    if (Number(userCheck.rows[0].count) === 0) {
      console.log("🌱 Seeding default admin & athlete accounts...");
      await pool.query(`
        INSERT INTO users (id, email, password_hash, name, role, membership, status, renewal_date, streak, sessions_this_month, avatar, bio, phone, weight_class, discipline) VALUES
          ('usr-admin', 'admin@bravegym.com', '$2a$10$wNqBw5r1hVpM4y7I9w8E0.kQe3oQfS0GzZkR3sU9m6tQ2wE4rY1Ou', 'Marcus Vance HQ', 'admin', 'Staff Command', 'Active', 'Lifetime Master', 42, 24, '/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg', 'Full jurisdiction over facility security protocols, coaches timetable scheduling, athlete subscriptions, and financial audits.', '+1 (555) 019-2831', 'Heavyweight (91+ kg)', 'Head Boxing Director'),
          ('usr-athlete-1', 'athlete@bravegym.com', '$2a$10$wNqBw5r1hVpM4y7I9w8E0.kQe3oQfS0GzZkR3sU9m6tQ2wE4rY1Ou', 'Darius Sterling', 'user', 'Black Tier', 'Active', 'Dec 31, 2026', 18, 14, '/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg', 'Discipline over motivation. Training for athletic excellence.', '+1 (555) 234-5678', 'Middleweight (75 kg)', 'Championship Boxing & Strength');
      `);
    }

    // Seed default classes if empty
    const classCheck = await pool.query("SELECT COUNT(*) FROM classes");
    if (Number(classCheck.rows[0].count) === 0) {
      console.log("🌱 Seeding initial timetable classes...");
      await pool.query(`
        INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total) VALUES
          ('sc-1', 'Monday', '06:30 AM', 'Metabolic Warfare', 'Jaxson Cole', 3, 20),
          ('sc-2', 'Monday', '08:00 AM', 'Championship Boxing', 'Marcus Vance', 2, 16),
          ('sc-3', 'Monday', '05:30 PM', 'Iron Discipline Strength', 'Elena Rostova', 1, 12),
          ('sc-4', 'Tuesday', '07:00 AM', 'Championship Boxing', 'Marcus Vance', 5, 16),
          ('sc-5', 'Tuesday', '06:00 PM', 'Kinetic Reset & Ice Protocol', 'Dr. Maya Lin', 2, 8),
          ('sc-6', 'Wednesday', '06:30 AM', 'Iron Discipline Strength', 'Elena Rostova', 4, 12),
          ('sc-7', 'Wednesday', '05:30 PM', 'Metabolic Warfare', 'Jaxson Cole', 0, 20),
          ('sc-8', 'Thursday', '07:00 AM', 'Championship Boxing', 'Marcus Vance', 3, 16),
          ('sc-9', 'Friday', '05:30 PM', 'Friday Night Sparring & Conditioning', 'Marcus Vance', 6, 16),
          ('sc-10', 'Saturday', '09:00 AM', 'Brave Community Combine', 'All Coaches', 8, 30);
      `);
    }

    // Seed default membership tiers if empty
    const tierCheck = await pool.query("SELECT COUNT(*) FROM membership_tiers");
    if (Number(tierCheck.rows[0].count) === 0) {
      console.log("🌱 Seeding initial membership tiers...");
      await pool.query(`
        INSERT INTO membership_tiers (id, name, price, interval, billing, description, features, popular, cta) VALUES
          ('trial', 'Brave Trial', 39, '3-class pass', '3-class pass', 'Experience the facility, coaching precision, and community standard.', '["Access to any 3 classes within 14 days", "Full locker room & sauna privileges", "1-on-1 movement assessment", "Complimentary hand wraps & glove rental"]', false, 'Book Trial Pass'),
          ('black-tier', 'Black Tier', 189, 'monthly', 'monthly', 'The complete athletic standard for disciplined, dedicated daily athletes.', '["Unlimited group classes (Boxing, Strength, HIIT)", "Priority 7-day advance booking window", "Recovery suite (Sauna & Cold Plunge)", "Quarterly body composition & biomarker scan", "1 Guest pass per month"]', true, 'Claim Black Tier'),
          ('obsidian-tier', 'Obsidian Private', 349, 'monthly', 'monthly', 'High-touch coaching with individualized programming and biometric oversight.', '["All Black Tier privileges included", "4 Private 1-on-1 coaching sessions per month", "Custom nutrition & recovery protocol", "Private locker with daily laundry service", "24/7 dedicated coach direct messaging"]', false, 'Apply for Obsidian');
      `);
    }

    console.log("✨ PostgreSQL auto-setup and initial seeding complete!");
    return true;
  } catch (err) {
    console.error("Error initializing PostgreSQL schema:", err);
    return false;
  }
}
