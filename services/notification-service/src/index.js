import express from "express";
import "dotenv/config";
import { connectConsumer } from "./config/kafka.js";
import { startConsumers } from "./consumers/messageHandler.js";

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "notification-service" });
});

const start = async () => {
  try {
    await connectConsumer();
    await startConsumers();
    app.listen(PORT, () => {
      console.log(`Notification service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start notification service:", err);
    process.exit(1);
  }
};

start();
