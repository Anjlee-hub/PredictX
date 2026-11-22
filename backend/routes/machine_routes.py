
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.database import db

router = APIRouter()


class Machine(BaseModel):
    machine_id: str
    machine_type: str
    location: str
    status: str = "Active"


# Register a machine
@router.post("/machines")
def add_machine(machine: Machine):

    if db.machines.find_one({"machine_id": machine.machine_id}):
        raise HTTPException(
            status_code=409,
            detail="Machine already exists"
        )

    result = db.machines.insert_one(machine.model_dump())

    return {
        "message": "Machine registered successfully",
        "id": str(result.inserted_id)
    }


# Get all machines
@router.get("/machines")
def get_machines():

    machines = list(db.machines.find())

    for machine in machines:
        machine["_id"] = str(machine["_id"])

    return machines


# Get one machine
@router.get("/machines/{machine_id}")
def get_machine(machine_id: str):

    machine = db.machines.find_one({"machine_id": machine_id})

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )

    machine["_id"] = str(machine["_id"])

    return machine
