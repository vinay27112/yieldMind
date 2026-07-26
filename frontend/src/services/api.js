import axios from "axios";

const AUTH_URL = "http://localhost:3001";
const WALLET_URL = "http://localhost:3002";
const AI_URL = "http://localhost:5001";
const EXECUTION_URL = "http://localhost:3005";
const PROTOCOL_URL = "http://localhost:3004";
const ANALYTICS_URL = "http://localhost:5002";

// Auth
export const connectWallet = (walletAddress, signature) =>
  axios.post(`${AUTH_URL}/auth/connect-wallet`, { walletAddress, signature });

// Portfolio
export const getPortfolio = (walletAddress) =>
  axios.get(`${WALLET_URL}/wallet/portfolio/${walletAddress}`);

// AI
export const getRiskScore = (portfolio) =>
  axios.post(`${AI_URL}/risk/score`, { portfolio });

export const getStrategies = (portfolio, riskAppetite, amount) =>
  axios.post(`${AI_URL}/strategies/recommend`, {
    portfolio,
    risk_appetite: riskAppetite,
    amount_to_invest: amount,
  });

// Execution
export const deposit = (userAddress, tokenAddress, amount, protocolAddress) =>
  axios.post(`${EXECUTION_URL}/execution/deposit`, {
    userAddress,
    tokenAddress,
    amount,
    protocolAddress,
  });

export const withdraw = (userAddress, tokenAddress, amount) =>
  axios.post(`${EXECUTION_URL}/execution/withdraw`, {
    userAddress,
    tokenAddress,
    amount,
  });

export const getTransactions = (userAddress) =>
  axios.get(`${EXECUTION_URL}/execution/transactions/${userAddress}`);

// Protocols
export const getProtocols = () => axios.get(`${PROTOCOL_URL}/protocols`);

// Analytics
export const getAnalytics = (walletAddress) =>
  axios.get(`${ANALYTICS_URL}/analytics/${walletAddress}`);
