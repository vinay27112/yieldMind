from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from src.config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    wallet_address = Column(String, nullable=False)
    total_value_usd = Column(Float, default=0)
    eth_balance = Column(Float, default=0)
    usdc_balance = Column(Float, default=0)
    vault_deposited = Column(Float, default=0)
    risk_score = Column(Integer, default=0)
    snapshot_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(engine)
    print("Analytics DB initialized")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()