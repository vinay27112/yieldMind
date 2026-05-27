from fastapi import APIRouter, HTTPException
from src.schemas.portfolio import StrategyRequest
from src.services.groq_service import explain_strategy

router = APIRouter()

# Available strategies — in production these come from protocol service
STRATEGIES = [
    {
        "protocol": "MockAave",
        "token": "mUSDC",
        "expected_apy": 4.8,
        "risk_score": 15,
        "description": "Stable lending on Aave with low risk"
    },
    {
        "protocol": "MockCompound",
        "token": "mUSDC",
        "expected_apy": 5.2,
        "risk_score": 20,
        "description": "Slightly higher yield on Compound"
    },
    {
        "protocol": "ETH Staking",
        "token": "ETH",
        "expected_apy": 3.8,
        "risk_score": 30,
        "description": "Steady ETH staking rewards"
    },
]

RISK_FILTERS = {
    "low": 30,
    "medium": 60,
    "high": 100,
}

@router.post("/recommend")
async def recommend_strategies(request: StrategyRequest):
    try:
        # Filter strategies by risk appetite
        max_risk = RISK_FILTERS.get(request.risk_appetite, 60)
        filtered = [s for s in STRATEGIES if s["risk_score"] <= max_risk]
        
        # Sort by APY descending
        ranked = sorted(filtered, key=lambda x: x["expected_apy"], reverse=True)
        
        return {
            "success": True,
            "data": {
                "strategies": ranked,
                "amount_to_invest": request.amount_to_invest,
                "risk_appetite": request.risk_appetite
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))