"""
PredictX Factory Analytics - OEE Metrics Aggregator
Aggregates machine-level and line-level OEE records, analyzes TPM Six Big Losses,
and produces historical OEE time-series trends.
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
from .calculator import calculate_oee, OEEResult


def aggregate_factory_oee(machine_records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes factory-wide weighted OEE and summary KPIs across multiple production records.

    Args:
        machine_records: List of production record dicts with keys:
            planned_time_hours, operating_time_hours, ideal_cycle_time_seconds,
            total_units, good_units, machine_id, machine_name (optional)

    Returns:
        Dictionary with aggregated factory-level OEE, component percentages, and unit totals.
    """
    if not machine_records:
        return {
            "overall_oee_pct": 0.0,
            "availability_pct": 0.0,
            "performance_pct": 0.0,
            "quality_pct": 0.0,
            "total_units": 0,
            "good_units": 0,
            "rejected_units": 0,
            "total_operating_hours": 0.0,
            "total_planned_hours": 0.0,
            "total_downtime_hours": 0.0,
            "machine_count": 0,
            "status": "No Data",
        }

    total_planned = sum(float(r.get("planned_time_hours", 0.0)) for r in machine_records)
    total_operating = sum(float(r.get("operating_time_hours", 0.0)) for r in machine_records)
    total_units = sum(int(r.get("total_units", 0)) for r in machine_records)
    total_good = sum(int(r.get("good_units", 0)) for r in machine_records)
    total_rejected = sum(int(r.get("rejected_units", max(0, int(r.get("total_units", 0)) - int(r.get("good_units", 0))))) for r in machine_records)

    # Weighted cycle time
    weighted_ideal_seconds = 0.0
    if total_units > 0:
        weighted_ideal_seconds = sum(
            float(r.get("ideal_cycle_time_seconds", 30.0)) * int(r.get("total_units", 0))
            for r in machine_records
        ) / float(total_units)

    oee_res = calculate_oee(
        planned_time_hours=total_planned,
        operating_time_hours=total_operating,
        ideal_cycle_time_seconds=weighted_ideal_seconds,
        total_units=total_units,
        good_units=total_good,
        rejected_units=total_rejected
    )

    unique_machines = len(set(r.get("machine_id", str(i)) for i, r in enumerate(machine_records)))

    return {
        "overall_oee_pct": oee_res.oee_pct,
        "availability_pct": oee_res.availability_pct,
        "performance_pct": oee_res.performance_pct,
        "quality_pct": oee_res.quality_pct,
        "total_units": total_units,
        "good_units": total_good,
        "rejected_units": total_rejected,
        "total_operating_hours": round(total_operating, 2),
        "total_planned_hours": round(total_planned, 2),
        "total_downtime_hours": oee_res.downtime_hours,
        "machine_count": unique_machines,
        "status": oee_res.status,
    }


def calculate_machine_wise_oee(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Groups production records by machine_id and calculates OEE for each individual machine.

    Args:
        records: List of production record dicts.

    Returns:
        List of machine-level OEE summaries sorted by OEE percentage ascending (lowest first).
    """
    grouped: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "machine_name": "",
        "machine_type": "Industrial Asset",
        "planned_time_hours": 0.0,
        "operating_time_hours": 0.0,
        "ideal_cycle_time_seconds": 0.0,
        "total_units": 0,
        "good_units": 0,
        "count": 0,
    })

    for r in records:
        m_id = r.get("machine_id", "UNKNOWN")
        entry = grouped[m_id]
        if not entry["machine_name"]:
            entry["machine_name"] = r.get("machine_name", m_id)
        if "machine_type" in r:
            entry["machine_type"] = r.get("machine_type")

        entry["planned_time_hours"] += float(r.get("planned_time_hours", 0.0))
        entry["operating_time_hours"] += float(r.get("operating_time_hours", 0.0))
        entry["ideal_cycle_time_seconds"] = float(r.get("ideal_cycle_time_seconds", 30.0))
        entry["total_units"] += int(r.get("total_units", 0))
        entry["good_units"] += int(r.get("good_units", 0))
        entry["count"] += 1

    results = []
    for m_id, data in grouped.items():
        oee_res = calculate_oee(
            planned_time_hours=data["planned_time_hours"],
            operating_time_hours=data["operating_time_hours"],
            ideal_cycle_time_seconds=data["ideal_cycle_time_seconds"],
            total_units=data["total_units"],
            good_units=data["good_units"]
        )
        results.append({
            "machine_id": m_id,
            "machine_name": data["machine_name"],
            "machine_type": data["machine_type"],
            "oee": oee_res.oee_pct,
            "availability": oee_res.availability_pct,
            "performance": oee_res.performance_pct,
            "quality": oee_res.quality_pct,
            "total_units": oee_res.total_units,
            "good_units": oee_res.good_units,
            "rejected_units": oee_res.rejected_units,
            "downtime_hours": oee_res.downtime_hours,
            "status": oee_res.status,
        })

    # Sort so underperforming machines appear first for rapid intervention
    results.sort(key=lambda x: x["oee"])
    return results


def calculate_six_big_losses(
    planned_hours: float,
    operating_hours: float,
    ideal_cycle_time_seconds: float,
    total_units: int,
    good_units: int
) -> Dict[str, Any]:
    """
    Decomposes total factory production losses into the Six Big Losses of TPM:
    1. Unplanned Breakdowns (Availability loss)
    2. Setup & Adjustments (Availability loss)
    3. Minor Stops & Idling (Performance loss)
    4. Reduced Speed (Performance loss)
    5. Startup Defects (Quality loss)
    6. Production Defects (Quality loss)
    """
    planned = max(0.0, float(planned_hours))
    operating = min(max(0.0, float(operating_hours)), planned)
    downtime = max(0.0, planned - operating)

    # 1 & 2: Availability losses
    breakdown_loss_hours = round(downtime * 0.65, 2)
    setup_loss_hours = round(downtime * 0.35, 2)

    # 3 & 4: Performance losses
    ideal_seconds = float(ideal_cycle_time_seconds)
    actual_run_seconds = operating * 3600.0
    theoretical_run_seconds = ideal_seconds * total_units
    speed_loss_seconds = max(0.0, actual_run_seconds - theoretical_run_seconds)
    speed_loss_hours = round(speed_loss_seconds / 3600.0, 2)

    minor_stops_hours = round(speed_loss_hours * 0.40, 2)
    reduced_speed_hours = round(speed_loss_hours * 0.60, 2)

    # 5 & 6: Quality losses
    defects = max(0, total_units - good_units)
    startup_rejects = int(defects * 0.25)
    production_rejects = defects - startup_rejects

    return {
        "availability_losses": {
            "unplanned_breakdowns_hours": breakdown_loss_hours,
            "setup_and_adjustments_hours": setup_loss_hours,
            "total_availability_loss_hours": downtime,
        },
        "performance_losses": {
            "minor_stops_idling_hours": minor_stops_hours,
            "reduced_speed_hours": reduced_speed_hours,
            "total_speed_loss_hours": speed_loss_hours,
        },
        "quality_losses": {
            "startup_defects_units": startup_rejects,
            "production_defects_units": production_rejects,
            "total_defect_units": defects,
        },
    }
