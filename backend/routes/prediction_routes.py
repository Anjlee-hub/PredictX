
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from backend.database import db

router = APIRouter()


class Prediction(BaseModel):
    machine_id: str
    prediction: str
    failure_probability: float
    model_name: str = "PredictX ML Model"


# Store prediction
@router.post("/predictions")
def add_prediction(data: Prediction):

    machine = db.machines.find_one(
        {"machine_id": data.machine_id}
    )

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machine not registered"
        )

    if not 0 <= data.failure_probability <= 1:
        raise HTTPException(
            status_code=400,
            detail="Probability must be between 0 and 1"
        )

    prediction_data = data.model_dump()

    prediction_data["timestamp"] = datetime.now(timezone.utc)

    result = db.predictions.insert_one(prediction_data)

    return {
        "message": "Prediction saved successfully",
        "id": str(result.inserted_id)
    }


# Retrieve predictions
@router.get("/predictions")
def get_predictions():

    predictions = list(
        db.predictions.find().sort("_id", -1).limit(100)
    )

    for item in predictions:
        item["_id"] = str(item["_id"])

    return predictions


# Retrieve predictions for one machine
@router.get("/predictions/{machine_id}")
def get_machine_predictions(machine_id: str):

    predictions = list(
        db.predictions.find(
            {"machine_id": machine_id}
        ).sort("_id", -1)
    )

    for item in predictions:
        item["_id"] = str(item["_id"])

    return predictions
