import { ethers } from "ethers";
import "dotenv/config";
import Transaction from "../models/Transaction.js";
import { producer } from "../config/kafka.js";

const YIELD_VAULT_ABI = [
  "function deposit(address token, uint256 amount, address protocol) external",
  "function withdraw(address token, uint256 amount) external",
  "function rebalance(address user, address token, address toProtocol) external",
  "function getBalance(address user, address token) external view returns (uint256)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
];

const getSigner = () => {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
};

const getVault = (signer) => {
  return new ethers.Contract(
    process.env.YIELD_VAULT_ADDRESS,
    YIELD_VAULT_ABI,
    signer,
  );
};

export const depositToVault = async (
  userAddress,
  tokenAddress,
  amount,
  protocolAddress,
) => {
  const tx = await Transaction.create({
    user_address: userAddress,
    type: "deposit",
    token_address: tokenAddress,
    token_symbol: "mUSDC",
    amount: amount.toString(),
    to_protocol: protocolAddress,
    status: "pending",
  });

  try {
    const signer = getSigner();
    const vault = getVault(signer);
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    // Step 1 — approve YieldVault to spend tokens
    const approveTx = await token.approve(
      process.env.YIELD_VAULT_ADDRESS,
      amount,
    );
    await approveTx.wait();

    // Step 2 — deposit into vault
    const depositTx = await vault.deposit(
      tokenAddress,
      amount,
      protocolAddress,
    );
    const receipt = await depositTx.wait();

    // Update transaction record
    tx.tx_hash = receipt.hash;
    tx.status = "confirmed";
    tx.gas_used = receipt.gasUsed.toString();
    tx.confirmed_at = new Date();
    await tx.save();

    // Publish to Kafka
    await producer.send({
      topic: "tx.confirmed",
      messages: [
        {
          key: userAddress,
          value: JSON.stringify({
            type: "deposit",
            userAddress,
            tokenAddress,
            amount: amount.toString(),
            txHash: receipt.hash,
          }),
        },
      ],
    });

    return { success: true, txHash: receipt.hash };
  } catch (err) {
    tx.status = "failed";
    tx.error_message = err.message;
    await tx.save();
    throw err;
  }
};

export const withdrawFromVault = async (userAddress, tokenAddress, amount) => {
  const tx = await Transaction.create({
    user_address: userAddress,
    type: "withdraw",
    token_address: tokenAddress,
    token_symbol: "mUSDC",
    amount: amount.toString(),
    status: "pending",
  });

  try {
    const signer = getSigner();
    const vault = getVault(signer);

    const withdrawTx = await vault.withdraw(tokenAddress, amount);
    const receipt = await withdrawTx.wait();

    tx.tx_hash = receipt.hash;
    tx.status = "confirmed";
    tx.gas_used = receipt.gasUsed.toString();
    tx.confirmed_at = new Date();
    await tx.save();

    await producer.send({
      topic: "tx.confirmed",
      messages: [
        {
          key: userAddress,
          value: JSON.stringify({
            type: "withdraw",
            userAddress,
            tokenAddress,
            amount: amount.toString(),
            txHash: receipt.hash,
          }),
        },
      ],
    });

    return { success: true, txHash: receipt.hash };
  } catch (err) {
    tx.status = "failed";
    tx.error_message = err.message;
    await tx.save();
    throw err;
  }
};
