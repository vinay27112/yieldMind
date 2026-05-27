from fastapi import APIRouter, HTTPException
from src.schemas.portfolio import RiskRequest
from src.services.risk_scorer import compute_risk_score
from src.services.groq_service import explain_risk

router = APIRouter()

@router.post("/score")
async def get_risk_score(request: RiskRequest):
    try:
        risk_result = compute_risk_score(request.portfolio)
        explanation = explain_risk(request.portfolio, risk_result)
        
        return {
            "success": True,
            "data": {
                "risk_score": risk_result,
                "explanation": explanation
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))