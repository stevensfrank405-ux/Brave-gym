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
    return true;
  } catch (err) {
    console.error("Error initializing PostgreSQL schema:", err);
    return false;
  }
}
