"""
PredictX Platform - FastAPI Main Application Entrypoint
Orchestrates backend REST APIs for predictive maintenance, machine telemetry,
and factory intelligence.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1.analytics import router as analytics_router

app = FastAPI(
    title="PredictX – Factory Intelligence & Predictive Maintenance API",
    description=(
        "Production-grade backend service powering explainable predictive maintenance, "
        "survival modeling, and factory decision intelligence."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure Cross-Origin Resource Sharing (CORS) for React / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Module Routers
# Member 4 - Factory Analytics & Decision Intelligence
app.include_router(analytics_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "PredictX API",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "active_modules": [
            "Factory Performance Analytics (OEE, Downtime, MTBF, MTTR)",
            "Decision Intelligence Engine (Rule-Based Recommendations)",
        ],
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "database": "mock_ready",
        "analytics_engine": "online",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
