
from fastapi import APIRouter
from backend.database import db

router = APIRouter()


@router.get("/dashboard/summary")
def dashboard_summary():

    total_machines = db.machines.count_documents({})

    total_sensor_readings = db.sensor_readings.count_documents({})

    total_predictions = db.predictions.count_documents({})

    failure_predictions = db.predictions.count_documents({
        "prediction": "Failure"
    })

    normal_predictions = db.predictions.count_documents({
        "prediction": "No Failure"
    })

    return {
        "total_machines": total_machines,
        "total_sensor_readings": total_sensor_readings,
        "total_predictions": total_predictions,
        "failure_predictions": failure_predictions,
        "normal_predictions": normal_predictions
    }
