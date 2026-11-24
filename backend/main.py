
from fastapi import FastAPI

from backend.database import (
    connect_to_database,
    create_collections,
    db,
)
from backend.routes.sensor_routes import router as sensor_router
from backend.routes.machine_routes import router as machine_router
from backend.routes.prediction_routes import router as prediction_router
from backend.routes.dashboard_routes import router as dashboard_router
from backend.routes import dataset_routes

from backend.app.api.v1.analytics import router as analytics_router


app = FastAPI(
    title="PredictX API",
    description=(
        "AI-Assisted Predictive Maintenance System "
        "with Factory Performance Analytics"
    ),
    version="1.0.0",
)

# Existing application routes
app.include_router(sensor_router, tags=["Sensor Readings"])
app.include_router(machine_router, tags=["Machines"])
app.include_router(prediction_router, tags=["Predictions"])
app.include_router(dashboard_router, tags=["Dashboard"])
app.include_router(dataset_routes.router)

# Factory analytics routes
app.include_router(analytics_router)


@app.on_event("startup")
def startup_event():
    if connect_to_database():
        create_collections()


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "Healthy",
        "service": "PredictX API",
    }


@app.get("/database-status", tags=["Health"])
def database_status():
    try:
        from backend.database import client

        client.admin.command("ping")

        return {
            "database": "Connected",
            "database_name": db.name,
        }

    except Exception:
        return {
            "database": "Not Connected",
        }
