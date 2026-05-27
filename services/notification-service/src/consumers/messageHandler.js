import { consumer } from "../config/kafka.js";
import {
  sendTransactionEmail,
  sendPriceAlertEmail,
} from "../services/emailService.js";

const TEST_ALERTS = [
  {
    email: "vinay@example.com",
    symbol: "ETH",
    threshold: 3000,
    direction: "below",
  },
];

export const startConsumers = async () => {
  await consumer.subscribe({ topic: "tx.confirmed", fromBeginning: false });
  await consumer.subscribe({ topic: "price.updates", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const data = JSON.parse(message.value.toString());

        if (topic === "tx.confirmed") {
          console.log("Transaction confirmed:", data.txHash);
          await sendTransactionEmail("vinay@example.com", data);
        }

        if (topic === "price.updates") {
          for (const alert of TEST_ALERTS) {
            if (alert.symbol !== data.symbol) continue;
            const triggered =
              alert.direction === "below"
                ? data.price_usd < alert.threshold
                : data.price_usd > alert.threshold;

            if (triggered) {
              console.log(`Price alert triggered for ${data.symbol}`);
              await sendPriceAlertEmail(alert.email, {
                symbol: data.symbol,
                price: data.price_usd,
                threshold: alert.threshold,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error processing message:", err.message);
      }
    },
  });
};
