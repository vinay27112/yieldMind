import express from "express";
import { initDB } from "./config/db.js";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.send("Auth Service is running");
});

const startAuth = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startAuth();
