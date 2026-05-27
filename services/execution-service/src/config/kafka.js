import { Kafka } from "kafkajs";
import "dotenv/config";

const kafka = new Kafka({
  clientId: "execution-service",
  brokers: [process.env.KAFKA_BROKERS],
});

export const producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
  console.log("Kafka producer connected");
};

export default kafka;
