import pkg from "pg";
const { Pool } = pkg;
import { config } from "../config/config.js";

let pool = null;

if (config.databaseUrl) {
  pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false }
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client:", err);
  });
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
      role VARCHAR(50) DEFAULT 'user',
      membership VARCHAR(100) DEFAULT 'Brave Trial',
      status VARCHAR(50) DEFAULT 'Active',
      renewal_date VARCHAR(100) DEFAULT '30 Days Free',
      streak INT DEFAULT 0,
      sessions_this_month INT DEFAULT 0,
      avatar TEXT,
      bio TEXT,
      phone VARCHAR(50),
      weight_class VARCHAR(100),
      discipline VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS classes (
      id VARCHAR(50) PRIMARY KEY,
      day VARCHAR(50) NOT NULL,
      time VARCHAR(50) NOT NULL,
      class_title VARCHAR(255) NOT NULL,
      trainer VARCHAR(255) NOT NULL,
      spots_left INT NOT NULL DEFAULT 16,
      total INT NOT NULL DEFAULT 16,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50),
      user_name VARCHAR(255),
      user_email VARCHAR(255),
      class_title VARCHAR(255) NOT NULL,
      trainer VARCHAR(255) NOT NULL,
      date VARCHAR(100) NOT NULL,
      room VARCHAR(100) DEFAULT 'Main Athletic Floor',
      status VARCHAR(50) DEFAULT 'Confirmed',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50),
      exercise VARCHAR(255) NOT NULL,
      weight VARCHAR(100),
      notes TEXT,
      date VARCHAR(100) DEFAULT 'Today',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50),
      trainer_id VARCHAR(50),
      trainer_name VARCHAR(255) NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL,
      address TEXT,
      service_type VARCHAR(255) NOT NULL,
      custom_requirements TEXT,
      chat_messages JSONB DEFAULT '[]'::jsonb,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50),
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'admin_response',
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

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
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50),
      member VARCHAR(255) NOT NULL,
      plan VARCHAR(255) NOT NULL,
      amount VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'Paid',
      date VARCHAR(100) DEFAULT 'Today',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  try {
    await pool.query(schemaSql);
    console.log("🐘 PostgreSQL schema initialized successfully on Railway!");

    // Auto-seed default classes if table is empty
    const classCheck = await pool.query("SELECT COUNT(*) FROM classes");
    if (Number(classCheck.rows[0].count) === 0) {
      console.log("🌱 Auto-seeding initial timetable classes...");
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

    // Auto-seed default membership tiers if empty
    const tierCheck = await pool.query("SELECT COUNT(*) FROM membership_tiers");
    if (Number(tierCheck.rows[0].count) === 0) {
      console.log("🌱 Auto-seeding initial membership tiers...");
      await pool.query(`
        INSERT INTO membership_tiers (id, name, price, interval, billing, description, features, popular, cta) VALUES
          ('trial', 'Brave Trial', 39, '3-class pass', '3-class pass', 'Experience the facility, coaching precision, and community standard.', '["Access to any 3 classes within 14 days", "Full locker room & sauna privileges", "1-on-1 movement assessment", "Complimentary hand wraps & glove rental"]', false, 'Book Trial Pass'),
          ('black-tier', 'Black Tier', 189, 'monthly', 'monthly', 'The complete athletic standard for disciplined, dedicated daily athletes.', '["Unlimited group classes (Boxing, Strength, HIIT)", "Priority 7-day advance booking window", "Recovery suite (Sauna & Cold Plunge)", "Quarterly body composition & biomarker scan", "1 Guest pass per month"]', true, 'Claim Black Tier'),
          ('obsidian-tier', 'Obsidian Private', 349, 'monthly', 'monthly', 'High-touch coaching with individualized programming and biometric oversight.', '["All Black Tier privileges included", "4 Private 1-on-1 coaching sessions per month", "Custom nutrition & recovery protocol", "Private locker with daily laundry service", "24/7 dedicated coach direct messaging"]', false, 'Apply for Obsidian');
      `);
    }

    // Auto-seed default admin and athlete accounts if empty
    const userCheck = await pool.query("SELECT COUNT(*) FROM users");
    if (Number(userCheck.rows[0].count) === 0) {
      console.log("🌱 Auto-seeding initial admin and athlete accounts...");
      await pool.query(`
        INSERT INTO users (id, email, password_hash, name, role, membership, status, renewal_date, streak, sessions_this_month, avatar, bio, phone, weight_class, discipline) VALUES
          ('usr-admin', 'admin@bravegym.com', '$2a$10$wNqBw5r1hVpM4y7I9w8E0.kQe3oQfS0GzZkR3sU9m6tQ2wE4rY1Ou', 'Marcus Vance HQ', 'admin', 'Staff Command', 'Active', 'Lifetime Master', 42, 24, '/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg', 'Full jurisdiction over facility security protocols, coaches timetable scheduling, athlete subscriptions, and financial audits.', '+1 (555) 019-2831', 'Heavyweight (91+ kg)', 'Head Boxing Director'),
          ('usr-athlete-1', 'athlete@bravegym.com', '$2a$10$wNqBw5r1hVpM4y7I9w8E0.kQe3oQfS0GzZkR3sU9m6tQ2wE4rY1Ou', 'Darius Sterling', 'user', 'Black Tier', 'Active', 'Dec 31, 2026', 18, 14, '/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg', 'Discipline over motivation. Training for athletic excellence.', '+1 (555) 234-5678', 'Middleweight (75 kg)', 'Championship Boxing & Strength');
      `);
    }

    console.log("✨ PostgreSQL auto-setup and initial seeding complete!");
    return true;
  } catch (err) {
    console.error("Error initializing PostgreSQL schema:", err);
    return false;
  }
}
