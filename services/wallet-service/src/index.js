import express from "express";
import "dotenv/config";
import walletRoutes from "./routes/walletRoutes.js";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3002;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use("/wallet", walletRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "wallet-service" });
});

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Wallet service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start wallet service:", err);
    process.exit(1);
  }
};

start();
