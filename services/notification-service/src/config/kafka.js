import { Kafka } from "kafkajs";
import "dotenv/config";

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKERS],
});

export const consumer = kafka.consumer({
  groupId: "notification-group",
});

export const connectConsumer = async () => {
  await consumer.connect();
  console.log("Kafka consumer connected");
};

export default kafka;
