from backend.services.validation import validate_sensor_data
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from backend.database import db

router = APIRouter()

# Sensor data structure
class SensorReading(BaseModel):
    machine_id: str
    air_temperature: float
    process_temperature: float
    rotational_speed: float
    torque: float
    tool_wear: float


# POST API - Insert sensor data
@router.post("/sensor-readings")
def add_sensor_reading(reading: SensorReading):

    try:
        data = reading.model_dump()

        data["timestamp"] = datetime.now(timezone.utc)

        result = db.sensor_readings.insert_one(data)

        return {
            "message": "Sensor reading saved successfully",
            "id": str(result.inserted_id)
        }
        errors = validate_sensor_data(reading)

        if errors:
            raise HTTPException(
                status_code=422,
                detail=errors
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# GET API - Retrieve sensor data
@router.get("/sensor-readings")
def get_sensor_readings():

    try:
        readings = list(
            db.sensor_readings.find().sort("_id", -1).limit(100)
        )

        for reading in readings:
            reading["_id"] = str(reading["_id"])

        return readings

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
