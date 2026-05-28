from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
KAFKA_BROKERS = os.getenv("KAFKA_BROKERS")
PORT = int(os.getenv("PORT", 5002))