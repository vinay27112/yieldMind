import express from "express";
import {
  deposit,
  withdraw,
  getTransactions,
} from "../controllers/executionController.js";

const router = express.Router();

router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.get("/transactions/:userAddress", getTransactions);

export default router;
