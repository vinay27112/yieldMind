import { ethers } from "ethers";
import redis from "../config/redis.js";
import axios from "axios";
import "dotenv/config";

const YIELD_VAULT_ABI = [
  "function getBalance(address user, address token) external view returns (uint256)",
];

const SUPPORTED_TOKENS = [
  { symbol: "ETH", address: "native" },
  { symbol: "mUSDC", address: process.env.MOCK_USDC_ADDRESS },
];

const getProvider = () => {
  return new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
};

// Get token balances from wallet
export const getWalletBalances = async (walletAddress) => {
  const provider = getProvider();
  const balances = [];

  for (const token of SUPPORTED_TOKENS) {
    try {
      if (token.address === "native") {
        // ETH balance
        const balance = await provider.getBalance(walletAddress);
        const cached = await redis.get(`price:ETH`);
        const price = cached ? JSON.parse(cached).price_usd : 0;
        balances.push({
          symbol: "ETH",
          balance: ethers.formatEther(balance),
          price_usd: price,
          value_usd: parseFloat(ethers.formatEther(balance)) * price,
        });
      } else {
        // ERC20 balance using Alchemy
        const response = await axios.post(process.env.SEPOLIA_RPC_URL, {
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: token.address,
              data: `0x70a08231000000000000000000000000${walletAddress.slice(2)}`,
            },
            "latest",
          ],
          id: 1,
        });
        const balance = BigInt(response.data.result);
        const formatted = ethers.formatUnits(balance, 18);
        const cached = await redis.get(`price:${token.symbol}`);
        const price = cached ? JSON.parse(cached).price_usd : 1;
        balances.push({
          symbol: token.symbol,
          balance: formatted,
          price_usd: price,
          value_usd: parseFloat(formatted) * price,
        });
      }
    } catch (err) {
      console.error(`Error fetching ${token.symbol} balance:`, err.message);
    }
  }

  return balances;
};

// Get user's position in YieldVault
export const getVaultPosition = async (walletAddress) => {
  const provider = getProvider();
  const vault = new ethers.Contract(
    process.env.YIELD_VAULT_ADDRESS,
    YIELD_VAULT_ABI,
    provider,
  );

  try {
    const balance = await vault.getBalance(
      walletAddress,
      process.env.MOCK_USDC_ADDRESS,
    );
    return {
      token: "mUSDC",
      deposited: ethers.formatUnits(balance, 18),
    };
  } catch (err) {
    console.error("Error fetching vault position:", err.message);
    return { token: "mUSDC", deposited: "0" };
  }
};

// Get full portfolio
export const getPortfolio = async (walletAddress) => {
  const cacheKey = `portfolio:${walletAddress}`;

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch fresh data
  const [balances, vaultPosition] = await Promise.all([
    getWalletBalances(walletAddress),
    getVaultPosition(walletAddress),
  ]);

  const totalValue = balances.reduce((sum, b) => sum + b.value_usd, 0);

  const portfolio = {
    wallet_address: walletAddress,
    balances,
    vault_position: vaultPosition,
    total_value_usd: totalValue,
    fetched_at: new Date().toISOString(),
  };

  // Cache for 2 minutes
  await redis.set(cacheKey, JSON.stringify(portfolio), "EX", 120);

  return portfolio;
};
