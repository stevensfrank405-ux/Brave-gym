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
      membership VARCHAR(100) DEFAULT '',
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

    CREATE TABLE IF NOT EXISTS programs (
      id VARCHAR(50) PRIMARY KEY,
      category VARCHAR(100) DEFAULT 'ALL',
      tag VARCHAR(100),
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      duration VARCHAR(50),
      intensity VARCHAR(50),
      trainer VARCHAR(255),
      capacity INT DEFAULT 16,
      enrolled INT DEFAULT 0,
      image TEXT,
      poster TEXT,
      details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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

    CREATE TABLE IF NOT EXISTS membership_orders (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
      member VARCHAR(255) NOT NULL,
      plan VARCHAR(255) NOT NULL,
      amount VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      date VARCHAR(100) DEFAULT 'Today',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_membership_orders_user_id ON membership_orders (user_id);
    CREATE INDEX IF NOT EXISTS idx_membership_orders_status ON membership_orders (status);

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
      user_name VARCHAR(255),
      user_email VARCHAR(255),
      exercise VARCHAR(255) NOT NULL,
      weight VARCHAR(100),
      notes TEXT,
      date VARCHAR(100) DEFAULT 'Today',
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs (user_id);
    CREATE TABLE IF NOT EXISTS trainers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      image TEXT,
      bio TEXT,
      quote TEXT,
      specialties JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  try {
    await pool.query(schemaSql);
    console.log("🐘 PostgreSQL schema initialized successfully!");


    // Ensure columns exist if table was previously created without them
    // Run each ALTER separately so a failure on one doesn't block others
    for (const migSql of [
      `ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending'`,
      `ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS user_name VARCHAR(255)`,
      `ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS user_email VARCHAR(255)`,
      `CREATE INDEX IF NOT EXISTS idx_workout_logs_status ON workout_logs (status)`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS schedule_id VARCHAR(50)`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_schedule_id ON bookings (schedule_id)`,
      `UPDATE trainers SET image = '/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg' WHERE image LIKE '%victor-freitas%'`,
      `UPDATE trainers SET image = '/media/hermes-rivera-qbf59TU077Q-unsplash.jpg' WHERE image LIKE '%anastase-maragos%'`,
      `UPDATE trainers SET image = '/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg' WHERE image LIKE '%logan-weaver%'`
    ]) {
      try {
        await pool.query(migSql);
      } catch (migErr) {
        console.warn("migration step note:", migErr.message);
      }
    }


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

    // Seed default programs if empty
    const progCheck = await pool.query("SELECT COUNT(*) FROM programs");
    if (Number(progCheck.rows[0].count) === 0) {
      console.log("🌱 Seeding default curriculum & programs...");
      await pool.query(`
        INSERT INTO programs (id, category, tag, title, subtitle, duration, intensity, trainer, capacity, enrolled, image, poster, details) VALUES
          ('boxing', 'BOXING', 'STRIKING & FOOTWORK', 'Championship Boxing', 'Heavy bag drill, kinetic chain rotation, head movement, and sparring discipline.', '60 MIN', 'HIGH', 'Marcus Vance', 16, 14, '/media/boxing-hero.mp4', '/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg', 'Focuses on explosive power generation, tactical ring presence, and cardiovascular threshold conditioning.'),
          ('strength', 'STRENGTH', 'RESISTANCE & POWER', 'Iron Discipline Strength', 'Barbell mastery, compound movements, deadlift mechanics, and neuromuscular recruitment.', '75 MIN', 'ELITE', 'Elena Rostova', 12, 10, '/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg', '/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg', 'Progressive overload methodology programmed to build absolute power, tendon resilience, and muscle density.'),
          ('conditioning', 'METABOLIC', 'AEROBIC THRESHOLD', 'Metabolic Warfare', 'Ski-erg, assault runner intervals, kettlebell ballistic circuits, and breath control.', '50 MIN', 'MAXIMAL', 'Jaxson Cole', 20, 18, '/media/hermes-rivera-qbf59TU077Q-unsplash.jpg', '/media/hermes-rivera-qbf59TU077Q-unsplash.jpg', 'Pushes VO2 max into new frontiers through tactical interval pacing and active lactic acid flush drills.'),
          ('recovery', 'RECOVERY', 'MOBILITY & RESTORATION', 'Kinetic Reset & Ice Protocol', 'Contrast hydrotherapy, myofascial decompression, hyperbaric oxygen, and mobility flow.', '45 MIN', 'LOW', 'Dr. Maya Lin', 8, 8, '/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg', '/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg', 'Systematic nervous system down-regulation utilizing extreme temperature exposure and joint articulation.');
      `);
    }

    // Seed default classes if empty
    const classCheck = await pool.query("SELECT COUNT(*) FROM classes");
    if (Number(classCheck.rows[0].count) === 0) {
      console.log("🌱 Seeding default class schedule slots...");
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
      console.log("🌱 Seeding default membership tiers...");
      await pool.query(`
        INSERT INTO membership_tiers (id, name, price, interval, billing, description, features, popular, cta) VALUES
          ('tier-trial', 'Trial Pass', 45, 'day', 'day', 'Full facility day access with single coached sparring session.', '["Single Day All-Access", "Coached Sparring Session", "Sauna & Cold Plunge Entry", "Locker & Shower Amenities"]'::jsonb, false, 'Claim Day Pass'),
          ('tier-black', 'Black Tier', 195, 'month', 'monthly', 'Standard athletic roster access with unlimited floor and class sessions.', '["Unlimited Floor Access", "All Combat & Strength Classes", "Dedicated Gear Locker", "Biometric Progress Scans", "Guest Passes (2/mo)"]'::jsonb, true, 'Enroll Black Tier'),
          ('tier-obsidian', 'Obsidian Sovereign', 380, 'month', 'monthly', 'Elite executive tier with dedicated trainer access and priority combine slots.', '["24/7 Biometric Keycard Access", "Dedicated 1-on-1 Master Coach", "Hyperbaric & Ice Protocol Access", "Custom Nutritional Macro Delivery", "Private Executive Locker Suite", "VIP Combine Ringside Seating"]'::jsonb, false, 'Ascend to Obsidian');
      `);
    }

    // Seed default trainers if empty
    const trainerCheck = await pool.query("SELECT COUNT(*) FROM trainers");
    if (Number(trainerCheck.rows[0].count) === 0) {
      console.log("🌱 Seeding default trainers...");
      await pool.query(`
        INSERT INTO trainers (id, name, role, image, bio, quote, specialties) VALUES
          ('tr-1', 'Marcus Vance', 'Head Boxing Director', '/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg', 'Former Golden Gloves heavyweight champion with 18 years in championship cornering and tactical striking development.', 'Form is nothing without relentless intent.', '["Olympic Boxing", "Heavy Bag Mechanics", "Tactical Footwork"]'::jsonb),
          ('tr-2', 'Elena Rostova', 'Elite Strength & Conditioning', '/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg', 'Former national powerlifting record holder specializing in progressive neuromuscular adaptation and power output.', 'The barbell does not negotiate with weakness.', '["Powerlifting", "Neuromuscular Recruiter", "Deadlift Dynamics"]'::jsonb),
          ('tr-3', 'Jaxson Cole', 'Metabolic Conditioning Coach', '/media/hermes-rivera-qbf59TU077Q-unsplash.jpg', 'Ex-Special Forces combat fitness instructor leading high-threshold conditioning and lactic clearance circuits.', 'Find comfort at the redline.', '["Assault Runner Intervals", "Kettlebell Ballistics", "VO2 Max Extension"]'::jsonb),
          ('tr-4', 'Dr. Maya Lin', 'Recovery & Performance Specialist', '/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg', 'Doctor of Physical Therapy focused on contrast therapy protocols, fascia release, and nervous system restoration.', 'Growth occurs in deep parasympathetic recovery.', '["Cryotherapy Protocols", "Myofascial Decompression", "Joint Articulation"]'::jsonb);
      `);
    }

    console.log("✨ PostgreSQL auto-setup and initial seeding complete!");
    return true;
  } catch (err) {
    console.error("Error initializing PostgreSQL schema:", err);
    return false;
  }
}
