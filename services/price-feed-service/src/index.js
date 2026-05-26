import express from "express";
import "dotenv/config";
import { connectProducer } from "./config/kafka.js";
import { startPriceFetcher } from "./services/priceFetcher.js";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "price-feed-service" });
});

const start = async () => {
  try {
    await connectProducer();
    await startPriceFetcher();
    app.listen(PORT, () => {
      console.log(`Price feed service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start price feed service:", err);
    process.exit(1);
  }
};

start();
