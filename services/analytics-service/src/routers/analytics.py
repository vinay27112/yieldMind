from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db, PortfolioSnapshot

router = APIRouter()

@router.get("/{wallet_address}")
def get_portfolio_history(wallet_address: str, db: Session = Depends(get_db)):
    snapshots = db.query(PortfolioSnapshot)\
        .filter(PortfolioSnapshot.wallet_address == wallet_address)\
        .order_by(PortfolioSnapshot.snapshot_at.desc())\
        .limit(30)\
        .all()
    
    return {
        "success": True,
        "data": [
            {
                "total_value_usd": s.total_value_usd,
                "vault_deposited": s.vault_deposited,
                "risk_score": s.risk_score,
                "snapshot_at": s.snapshot_at.isoformat()
            }
            for s in snapshots
        ]
    }

@router.get("/{wallet_address}/summary")
def get_summary(wallet_address: str, db: Session = Depends(get_db)):
    snapshots = db.query(PortfolioSnapshot)\
        .filter(PortfolioSnapshot.wallet_address == wallet_address)\
        .order_by(PortfolioSnapshot.snapshot_at.desc())\
        .all()

    if not snapshots:
        return {"success": True, "data": {"message": "No history yet"}}

    total_deposited = sum(s.vault_deposited for s in snapshots if s.vault_deposited)

    return {
        "success": True,
        "data": {
            "total_snapshots": len(snapshots),
            "total_deposited": total_deposited,
            "latest_snapshot": snapshots[0].snapshot_at.isoformat()
        }
    }