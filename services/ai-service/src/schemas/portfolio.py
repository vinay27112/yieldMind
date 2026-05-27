from pydantic import BaseModel
from typing import Optional

class TokenBalance(BaseModel):
    symbol: str
    balance: str
    price_usd: float
    value_usd: float

class VaultPosition(BaseModel):
    token: str
    deposited: str

class Portfolio(BaseModel):
    wallet_address: str
    balances: list[TokenBalance]
    vault_position: VaultPosition
    total_value_usd: float

class RiskRequest(BaseModel):
    portfolio: Portfolio
    
class StrategyRequest(BaseModel):
    portfolio: Portfolio
    risk_appetite: str  # "low", "medium", "high"
    amount_to_invest: float