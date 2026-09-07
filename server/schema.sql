-- ==========================================================
-- BRAVE GYM - POSTGRESQL DATABASE SCHEMA
-- ==========================================================
-- Run in Railway Query Console / pgAdmin / psql
-- Safe to re-run: uses IF NOT EXISTS throughout
-- ==========================================================


-- ==========================================================
-- 1. USERS
-- ==========================================================
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


-- ==========================================================
-- 2. MEMBERSHIP TIERS
-- ==========================================================
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


-- ==========================================================
-- 3. CLASSES (Timetable / Schedule)
-- ==========================================================
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


-- ==========================================================
-- 4. BOOKINGS (User class reservations)
-- ==========================================================
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
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


-- ==========================================================
-- 5. TRANSACTIONS (Membership orders / payments)
-- ==========================================================
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
  member VARCHAR(255) NOT NULL,
  plan VARCHAR(255) NOT NULL,
  amount VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  date VARCHAR(100) DEFAULT 'Today',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);


-- ==========================================================
-- 6. CONSULTATIONS (Live chat threads)
-- ==========================================================
CREATE TABLE IF NOT EXISTS consultations (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
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


-- ==========================================================
-- 7. NOTIFICATIONS
-- ==========================================================
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


-- ==========================================================
-- 8. WORKOUT LOGS
-- ==========================================================
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


-- ==========================================================
-- AUTO-UPDATE updated_at TRIGGER (for users table)
-- ==========================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at'
  ) THEN
    CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;


-- ==========================================================
-- SEED DATA (only inserts if tables are empty)
-- ==========================================================

-- Seed admin + demo athlete
INSERT INTO users (id, email, password_hash, name, role, membership, status, renewal_date, streak, sessions_this_month, avatar, bio, phone, weight_class, discipline)
SELECT 'usr-admin', 'admin@bravegym.com',
       '$2a$10$wNqBw5r1hVpM4y7I9w8E0.kQe3oQfS0GzZkR3sU9m6tQ2wE4rY1Ou',
       'Marcus Vance HQ', 'admin', 'Staff Command', 'Active', 'Lifetime Master',
       42, 24,
       '/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg',
       'Full jurisdiction over facility security protocols, coaches timetable scheduling, athlete subscriptions, and financial audits.',
       '+1 (555) 019-2831', 'Heavyweight (91+ kg)', 'Head Boxing Director'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'usr-admin');

INSERT INTO users (id, email, password_hash, name, role, membership, status, renewal_date, streak, sessions_this_month, avatar, bio, phone, weight_class, discipline)
SELECT 'usr-athlete-1', 'athlete@bravegym.com',
       '$2a$10$wNqBw5r1hVpM4y7I9w8E0.kQe3oQfS0GzZkR3sU9m6tQ2wE4rY1Ou',
       'Darius Sterling', 'user', 'Black Tier', 'Active', 'Dec 31, 2026',
       18, 14,
       '/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg',
       'Discipline over motivation. Training for athletic excellence.',
       '+1 (555) 234-5678', 'Middleweight (75 kg)', 'Championship Boxing & Strength'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'usr-athlete-1');


-- Seed membership tiers
INSERT INTO membership_tiers (id, name, price, interval, billing, description, features, popular, cta)
SELECT 'trial', 'Brave Trial', 39, '3-class pass', '3-class pass',
       'Experience the facility, coaching precision, and community standard.',
       '["Access to any 3 classes within 14 days", "Full locker room & sauna privileges", "1-on-1 movement assessment", "Complimentary hand wraps & glove rental"]'::jsonb,
       false, 'Book Trial Pass'
WHERE NOT EXISTS (SELECT 1 FROM membership_tiers WHERE id = 'trial');

INSERT INTO membership_tiers (id, name, price, interval, billing, description, features, popular, cta)
SELECT 'black-tier', 'Black Tier', 189, 'monthly', 'monthly',
       'The complete athletic standard for disciplined, dedicated daily athletes.',
       '["Unlimited group classes (Boxing, Strength, HIIT)", "Priority 7-day advance booking window", "Recovery suite (Sauna & Cold Plunge)", "Quarterly body composition & biomarker scan", "1 Guest pass per month"]'::jsonb,
       true, 'Claim Black Tier'
WHERE NOT EXISTS (SELECT 1 FROM membership_tiers WHERE id = 'black-tier');

INSERT INTO membership_tiers (id, name, price, interval, billing, description, features, popular, cta)
SELECT 'obsidian-tier', 'Obsidian Private', 349, 'monthly', 'monthly',
       'High-touch coaching with individualized programming and biometric oversight.',
       '["All Black Tier privileges included", "4 Private 1-on-1 coaching sessions per month", "Custom nutrition & recovery protocol", "Private locker with daily laundry service", "24/7 dedicated coach direct messaging"]'::jsonb,
       false, 'Apply for Obsidian'
WHERE NOT EXISTS (SELECT 1 FROM membership_tiers WHERE id = 'obsidian-tier');


-- Seed default timetable classes
INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total)
SELECT 'sc-1', 'Monday', '06:30 AM', 'Metabolic Warfare', 'Jaxson Cole', 3, 20
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = 'sc-1');

INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total)
SELECT 'sc-2', 'Monday', '08:00 AM', 'Championship Boxing', 'Marcus Vance', 2, 16
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = 'sc-2');

INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total)
SELECT 'sc-3', 'Monday', '05:30 PM', 'Iron Discipline Strength', 'Elena Rostova', 1, 12
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = 'sc-3');

INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total)
SELECT 'sc-4', 'Tuesday', '07:00 AM', 'Championship Boxing', 'Marcus Vance', 5, 16
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = 'sc-4');

INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total)
SELECT 'sc-5', 'Tuesday', '06:00 PM', 'Kinetic Reset & Ice Protocol', 'Dr. Maya Lin', 2, 8
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = 'sc-5');

INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total)
SELECT 'sc-6', 'Wednesday', '06:30 AM', 'Iron Discipline Strength', 'Elena Rostova', 4, 12
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = 'sc-6');

INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total)
SELECT 'sc-7', 'Wednesday', '05:30 PM', 'Metabolic Warfare', 'Jaxson Cole', 0, 20
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = 'sc-7');

INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total)
SELECT 'sc-8', 'Thursday', '07:00 AM', 'Championship Boxing', 'Marcus Vance', 3, 16
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = 'sc-8');

INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total)
SELECT 'sc-9', 'Friday', '05:30 PM', 'Friday Night Sparring & Conditioning', 'Marcus Vance', 6, 16
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = 'sc-9');

INSERT INTO classes (id, day, time, class_title, trainer, spots_left, total)
SELECT 'sc-10', 'Saturday', '09:00 AM', 'Brave Community Combine', 'All Coaches', 8, 30
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = 'sc-10');
