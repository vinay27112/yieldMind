import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import { connectProducer } from "./config/kafka.js";
import { startProtocolFetcher } from "./services/protocolFetcher.js";
import protocolRoutes from "./routes/protocolRoutes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3004;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use("/protocols", protocolRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "protocol-service" });
});

const start = async () => {
  try {
    await connectDB();
    await connectProducer();
    await startProtocolFetcher();
    app.listen(PORT, () => {
      console.log(`Protocol service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start protocol service:", err);
    process.exit(1);
  }
};

start();
