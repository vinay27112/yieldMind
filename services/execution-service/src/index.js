import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import { connectProducer } from "./config/kafka.js";
import executionRoutes from "./routes/executionRoutes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3005;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use("/execution", executionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "execution-service" });
});

const start = async () => {
  try {
    await connectDB();
    await connectProducer();
    app.listen(PORT, () => {
      console.log(`Execution service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start execution service:", err);
    process.exit(1);
  }
};

start();
