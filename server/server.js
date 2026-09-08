import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/config.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

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

// Serve frontend dist assets if present (production deployment)
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  const indexHtml = path.join(clientDistPath, "index.html");
  res.sendFile(indexHtml, (err) => {
    if (err) next();
  });
});

// Global Error Handler
app.use(errorHandler);

import { db, initPostgresTables } from "./config/db.js";

// Start server
httpServer.listen(config.port, async () => {
  console.log(`=========================================`);
  console.log(`🥊 Brave Gym MVVM Node.js Server Running`);
  console.log(`📡 Port: http://localhost:${config.port}`);
  console.log(`🌐 Health Check: http://localhost:${config.port}/api/health`);
  if (db.isConfigured()) {
    console.log(`🐘 PostgreSQL detected via DATABASE_URL. Initializing tables...`);
    await initPostgresTables();
  } else {
    console.log(`💾 Using Local File Store (PostgreSQL ready when DATABASE_URL is provided)`);
  }
  console.log(`=========================================`);
});
