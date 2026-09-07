import express from "express";
import authRoutes from "./server/routes/authRoutes.js";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

const server = app.listen(5000, async () => {
  try {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unregistered@example.com", password: "password" })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", data);
  } catch(e) {
    console.error(e);
  } finally {
    server.close();
  }
});
