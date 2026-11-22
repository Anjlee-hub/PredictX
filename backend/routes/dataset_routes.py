from fastapi import APIRouter
from backend.database import db

router = APIRouter()

@router.get("/dataset/summary", tags=["Dataset"])
def get_dataset_summary():

    collection = db.ai4i_dataset

    total_records = collection.count_documents({})
    failures = collection.count_documents({"Machine failure": 1})
    normal = collection.count_documents({"Machine failure": 0})

    return {
        "total_records": total_records,
        "failure_records": failures,
        "normal_records": normal
    }

@router.get("/dataset/failure-breakdown", tags=["Dataset"])
def get_failure_breakdown():

    collection = db.ai4i_dataset

    failure_types = {
        "TWF": "Tool Wear Failure",
        "HDF": "Heat Dissipation Failure",
        "PWF": "Power Failure",
        "OSF": "Overstrain Failure",
        "RNF": "Random Failure"
    }

    breakdown = {}

    for code, name in failure_types.items():
        count = collection.count_documents({code: 1})

        breakdown[code] = {
            "failure_name": name,
            "count": count
        }

    return {
        "failure_breakdown": breakdown
    }

@router.get("/dataset/failed-machines", tags=["Dataset"])
def get_failed_machines():

    collection = db.ai4i_dataset

    records = list(
        collection.find(
            {"Machine failure": 1},
            {"_id": 0}
        ).limit(100)
    )

    return {
        "total_failures": collection.count_documents(
            {"Machine failure": 1}
        ),
        "returned_records": len(records),
        "failed_machines": records
    }

from fastapi import Query

@router.get("/dataset/records", tags=["Dataset"])
def get_dataset_records(
    failure_status: int | None = Query(default=None, ge=0, le=1),
    machine_type: str | None = Query(default=None, pattern="^[LMH]$"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100)
):

    collection = db.ai4i_dataset

    filters = {}

    if failure_status is not None:
        filters["Machine failure"] = failure_status

    if machine_type is not None:
        filters["Type"] = machine_type

    total_records = collection.count_documents(filters)

    records = list(
        collection.find(filters, {"_id": 0})
        .skip(skip)
        .limit(limit)
    )

    return {
        "total_records": total_records,
        "returned_records": len(records),
        "skip": skip,
        "limit": limit,
        "records": records
    }
    


