import express from "express";
import { getPortfolioController } from "../controllers/walletController.js";

const router = express.Router();

router.get("/portfolio/:walletAddress", getPortfolioController);

export default router;
