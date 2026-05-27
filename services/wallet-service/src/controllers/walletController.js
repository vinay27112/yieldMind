import { getPortfolio } from "../services/portfolioService.js";
import { success, error } from "../utils/response.js";

export const getPortfolioController = async (req, res) => {
  const { walletAddress } = req.params;

  if (!walletAddress) {
    return error(res, "Wallet address is required", 400);
  }

  try {
    const portfolio = await getPortfolio(walletAddress);
    return success(res, portfolio);
  } catch (error) {
    return error(res, "Failed to fetch portfolio", 500);
  }
};
