from kafka import KafkaConsumer
import json
from src.database import SessionLocal, PortfolioSnapshot
from src.config import KAFKA_BROKERS
from datetime import datetime

def start_tx_consumer():
    consumer = KafkaConsumer(
        "tx.confirmed",
        bootstrap_servers=[KAFKA_BROKERS],
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        group_id="analytics-group",
        auto_offset_reset="latest",
    )

    print("Analytics Kafka consumer started")

    for message in consumer:
        try:
            data = message.value
            print(f"Analytics received: {data.get('type')} tx for {data.get('userAddress')}")

            db = SessionLocal()
            snapshot = PortfolioSnapshot(
                wallet_address=data.get("userAddress"),
                total_value_usd=0,        # updated by wallet service
                vault_deposited=float(data.get("amount", 0)) / 1e18,
                snapshot_at=datetime.utcnow()
            )
            db.add(snapshot)
            db.commit()
            db.close()
            print(f"Snapshot saved for {data.get('userAddress')}")

        except Exception as e:
            print(f"Analytics consumer error: {e}")