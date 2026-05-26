import axios from "axios";
import redis from "../config/redis.js";
import { producer } from "../config/kafka.js";
import "dotenv/config";

// Tokens we track — CoinGecko IDs
const TOKENS = [
  { id: "ethereum", symbol: "ETH" },
  { id: "bitcoin", symbol: "BTC" },
  { id: "usd-coin", symbol: "USDC" },
  { id: "dai", symbol: "DAI" },
  { id: "solana", symbol: "SOL" },
];

const fetchAndPublish = async () => {
  try {
    // 1. Fetch prices from CoinGecko
    const ids = TOKENS.map((t) => t.id).join(",");
    const response = await axios.get(
      `${process.env.COINGECKO_API_URL}/simple/price`,
      {
        params: {
          ids,
          vs_currencies: "usd",
          include_24hr_change: true,
        },
      },
    );

    const prices = response.data;

    // 2. For each token — store in Redis and publish to Kafka
    for (const token of TOKENS) {
      const data = prices[token.id];
      if (!data) continue;

      const priceData = {
        symbol: token.symbol,
        price_usd: data.usd,
        change_24h: data.usd_24h_change,
        fetched_at: new Date().toISOString(),
      };

      // Store in Redis with 30 second TTL
      await redis.set(
        `price:${token.symbol}`,
        JSON.stringify(priceData),
        "EX",
        30,
      );

      // Publish to Kafka
      await producer.send({
        topic: "price.updates",
        messages: [
          {
            key: token.symbol,
            value: JSON.stringify(priceData),
          },
        ],
      });

      console.log(`${token.symbol}: $${data.usd}`);
    }
  } catch (err) {
    console.error("Price fetch error:", err.message);
  }
};

export const startPriceFetcher = async () => {
  // Fetch immediately on start
  await fetchAndPublish();

  // Then every 30 seconds
  setInterval(fetchAndPublish, 30000);
};
