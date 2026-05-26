import express from "express";
import {
  register,
  login,
  connectWallet,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/connect-wallet", connectWallet);

// Protected routes
router.get("/me", protect, getMe);

export default router;
