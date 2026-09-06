import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/config.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded avatars and media statically
app.use("/uploads", express.static(path.join(__dirname, "data/uploads")));

// API routes
app.use("/api", routes);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(`🥊 Brave Gym MVVM Node.js Server Running`);
  console.log(`📡 Port: http://localhost:${config.port}`);
  console.log(`🌐 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`=========================================`);
});
