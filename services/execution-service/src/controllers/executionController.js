import { depositToVault, withdrawFromVault } from "../services/vaultService.js";
import { ethers } from "ethers";
import Transaction from "../models/Transaction.js";

export const deposit = async (req, res) => {
  const { userAddress, tokenAddress, amount, protocolAddress } = req.body;
  const amountBN = ethers.parseUnits(amount, 18);
  try {
    await depositToVault(userAddress, tokenAddress, amountBN, protocolAddress);
    res.status(200).json({ success: true, message: "Deposit successful" });
  } catch (error) {
    console.error("Error occurred while depositing:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const withdraw = async (req, res) => {
  const { userAddress, tokenAddress, amount } = req.body;
  const amountBN = ethers.parseUnits(amount, 18);
  try {
    await withdrawFromVault(userAddress, tokenAddress, amountBN);
    res.status(200).json({ success: true, message: "Withdrawal successful" });
  } catch (error) {
    console.error("Error occurred while withdrawing:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { userAddress } = req.params;
    const transactions = await Transaction.find({
      user_address: userAddress,
    }).sort({ created_at: -1 });
    return res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch transactions" });
  }
};
