import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByWallet,
} from "../models/UsersModel.js";
import { success, error } from "../utils/response.js";

const generateToken = async (userId, role, walletAddress) => {
  return jwt.sign({ userId, role, walletAddress }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const register = async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return error(res, "Email already registered", 400);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(email, passwordHash, walletAddress);
    const token = await generateToken(
      newUser.id,
      newUser.role,
      newUser.wallet_address,
    );
    success(res, { token }, "User registered successfully", 201);
  } catch (err) {
    error(res, "Error registering user", 500);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return error(res, "Invalid email or password", 401);
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return error(res, "Invalid email or password", 401);
    }
    const token = await generateToken(user.id, user.role, user.wallet_address);
    success(res, { token }, "Login successful");
  } catch (err) {
    error(res, "Error logging in", 500);
  }
};

export const connectWallet = async (req, res) => {
  const { walletAddress, signature } = req.body;
  try {
    const message = `YieldMind authentication: ${walletAddress}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return error(res, "Invalid signature", 401);
    }
    let user = await findUserByWallet(walletAddress);
    if (!user) {
      user = await createUser(null, null, walletAddress);
    }
    const token = await generateToken(user.id, user.role, user.wallet_address);
    success(res, { token }, "Wallet connected successfully");
  } catch (err) {
    error(res, "Error connecting wallet", 500);
  }
};

export const getMe = async (req, res) => {
  const user = await findUserById(req.user.userId);
  if (!user) {
    return error(res, "User not found", 404);
  }
  success(res, user, "User retrieved successfully");
};
