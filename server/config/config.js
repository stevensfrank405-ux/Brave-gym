import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "brave_gym_super_secret_jwt_key_2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR || "data/uploads",
  databaseUrl: process.env.DATABASE_URL || ""
};
