import Protocol from "../models/Protocol.js";
import { success, error } from "../utils/response.js";

export const getAllProtocols = async (req, res) => {
  try {
    const protocols = await Protocol.find({ is_active: true }).sort({
      supply_apy: -1,
    });
    success(res, protocols);
  } catch (err) {
    error(res, err.message);
  }
};

export const getProtocolByName = async (req, res) => {
  const { protocol } = req.params;
  try {
    const protocolData = await Protocol.find({
      protocol,
      is_active: true,
    }).sort({ supply_apy: -1 });
    if (protocolData.length === 0) {
      return error(res, "Protocol not found", 404);
    }
    success(res, protocolData);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const getBestRates = async (req, res) => {
  const { symbol } = req.params;
  try {
    const bestSupply = await Protocol.findOne({
      token: symbol,
      is_active: true,
    }).sort({ supply_apy: -1 });

    const bestBorrow = await Protocol.findOne({
      token: symbol,
      is_active: true,
    }).sort({ borrow_apy: -1 });

    if (!bestSupply || !bestBorrow) {
      return error(res, "No rates found for this token", 404);
    }

    success(res, {
      token: symbol,
      best_supply: {
        protocol: bestSupply.protocol,
        apy: bestSupply.supply_apy,
        total_liquidity: bestSupply.total_liquidity,
      },
      best_borrow: {
        protocol: bestBorrow.protocol,
        apy: bestBorrow.borrow_apy,
        total_liquidity: bestBorrow.total_liquidity,
      },
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};
