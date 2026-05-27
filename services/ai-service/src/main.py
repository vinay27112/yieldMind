from fastapi import FastAPI
from src.routers import risk, strategies
import uvicorn
from src.config import PORT

app = FastAPI(title="YieldMind AI Service")

app.include_router(risk.router, prefix="/risk", tags=["risk"])
app.include_router(strategies.router, prefix="/strategies", tags=["strategies"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=PORT, reload=True)