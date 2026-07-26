from fastapi import FastAPI
from src.routers import analytics
from src.database import init_db
from src.config import PORT
import threading
from src.consumers.txConsumer import start_tx_consumer
import uvicorn
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="YieldMind Analytics Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics-service"}

@app.on_event("startup")
def startup():
    init_db()
    # Run Kafka consumer in background thread
    thread = threading.Thread(target=start_tx_consumer, daemon=True)
    thread.start()

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=PORT, reload=True)