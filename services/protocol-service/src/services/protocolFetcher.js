import axios from "axios";
import Protocol from "../models/Protocol.js";
import { producer } from "../config/kafka.js";

const DEFILLAMA_API = "https://yields.llama.fi/pools";

const fetchFromDeFiLlama = async () => {
  try {
    const response = await axios.get(DEFILLAMA_API);
    const pools = response.data?.data || [];

    // Filter only Aave and Compound pools
    const relevant = pools.filter(
      (p) =>
        (p.project === "aave-v3" || p.project === "compound-v3") &&
        p.chain === "Ethereum" &&
        p.apy > 0,
    );

    for (const pool of relevant) {
      const protocol = pool.project.includes("aave") ? "aave" : "compound";

      await Protocol.findOneAndUpdate(
        { protocol, token: pool.symbol },
        {
          protocol,
          token: pool.symbol,
          supply_apy: parseFloat(pool.apy.toFixed(4)),
          borrow_apy: parseFloat((pool.apyBorrow || 0).toFixed(4)),
          total_liquidity: pool.tvlUsd || 0,
          utilization_rate: pool.utilization || 0,
          fetched_at: new Date(),
        },
        { upsert: true, returnDocument: "after" },
      );
    }
    console.log(`DeFiLlama: updated ${relevant.length} pools`);

    // Publish to Kafka
    await producer.send({
      topic: "strategy.recommended",
      messages: [
        {
          key: "apy-update",
          value: JSON.stringify({
            event: "apy_updated",
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
  } catch (err) {
    console.error("DeFiLlama fetch error:", err.message);
  }
};

export const fetchAllRates = async () => {
  await fetchFromDeFiLlama();
};

export const startProtocolFetcher = async () => {
  await fetchAllRates();
  setInterval(fetchAllRates, 5 * 60 * 1000);
};
