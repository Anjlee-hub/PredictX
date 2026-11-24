"""
PredictX Factory Analytics - MTTR (Mean Time To Repair) Module
Computes Mean Time To Repair for individual machines and maintenance teams.
Formula:
MTTR = Total Repair Time / Number of Repairs
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict


def calculate_machine_mttr(
    repair_time_hours: float,
    repair_count: int,
    machine_id: str = "UNKNOWN",
    machine_name: str = "Unknown Asset"
) -> Dict[str, Any]:
    """
    Calculate MTTR for a single machine with missing or zero-repair handling.

    Args:
        repair_time_hours: Cumulative active maintenance restoration time (hours).
        repair_count: Number of completed repair interventions.
        machine_id: Machine identifier.
        machine_name: Human-readable machine name.

    Returns:
        Dictionary with MTTR in hours and minutes, maintainability rating, and status.
    """
    rep_time = max(0.0, float(repair_time_hours or 0.0))
    rep_count = max(0, int(repair_count or 0))

    if rep_count == 0:
        return {
            "machine_id": machine_id,
            "machine_name": machine_name,
            "total_repair_time_hours": 0.0,
            "total_repair_time_minutes": 0.0,
            "repair_count": 0,
            "mttr_hours": 0.0,
            "mttr_minutes": 0.0,
            "mttr_display": "0.0h (No Repairs)",
            "has_repairs": False,
            "status": "NO_REPAIRS",
            "maintainability_tier": "No Interventions Required",
        }

    mttr_h = rep_time / float(rep_count)
    mttr_m = mttr_h * 60.0

    # Categorize maintainability tier based on industrial benchmarks
    # Standard industrial target: MTTR < 2.0 hours
    if mttr_h <= 1.5:
        status = "RAPID"
        tier = "High Maintainability (< 1.5h)"
    elif mttr_h <= 3.0:
        status = "ACCEPTABLE"
        tier = "Standard Maintainability (1.5 - 3h)"
    elif mttr_h <= 5.0:
        status = "PROLONGED"
        tier = "Elevated Repair Duration (3 - 5h)"
    else:
        status = "CRITICAL_DELAY"
        tier = "Critical Repair Delay (> 5h)"

    return {
        "machine_id": machine_id,
        "machine_name": machine_name,
        "total_repair_time_hours": round(rep_time, 2),
        "total_repair_time_minutes": round(rep_time * 60.0, 1),
        "repair_count": rep_count,
        "mttr_hours": round(mttr_h, 2),
        "mttr_minutes": round(mttr_m, 1),
        "mttr_display": f"{round(mttr_h, 1)}h ({round(mttr_m, 0):.0f} min)",
        "has_repairs": True,
        "status": status,
        "maintainability_tier": tier,
    }


def analyze_fleet_mttr(
    repair_records: List[Dict[str, Any]],
    all_machines: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Aggregates MTTR across all machines in the factory.

    Args:
        repair_records: List of completed maintenance/repair records with keys:
            machine_id, machine_name (optional), repair_duration_hours or duration_hours.
        all_machines: Optional list of all known machines to include zero-repair assets.

    Returns:
        Structured fleet MTTR analysis, comparisons, and identification of prolonged-repair assets.
    """
    machine_repairs: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "machine_name": "",
        "total_hours": 0.0,
        "count": 0,
    })

    # Register known machines first
    if all_machines:
        for m in all_machines:
            m_id = str(m.get("machine_id", "UNKNOWN"))
            machine_repairs[m_id]["machine_name"] = m.get("machine_name", m_id)

    total_factory_repair_hours = 0.0
    total_factory_repairs = 0

    for r in repair_records:
        m_id = str(r.get("machine_id", "UNKNOWN"))
        duration = float(r.get("repair_duration_hours", r.get("duration_hours", 0.0)))
        if duration < 0.0:
            duration = 0.0

        entry = machine_repairs[m_id]
        if not entry["machine_name"]:
            entry["machine_name"] = r.get("machine_name", m_id)

        entry["total_hours"] += duration
        entry["count"] += 1
        total_factory_repair_hours += duration
        total_factory_repairs += 1

    machine_results = []
    for m_id, data in machine_repairs.items():
        res = calculate_machine_mttr(
            repair_time_hours=data["total_hours"],
            repair_count=data["count"],
            machine_id=m_id,
            machine_name=data["machine_name"] or m_id
        )
        machine_results.append(res)

    # Sort so machines requiring longest repair times appear first
    machine_results.sort(key=lambda x: x["mttr_hours"], reverse=True)

    # Identify prolonged repair machines (MTTR > 3.0h or status in PROLONGED / CRITICAL_DELAY)
    prolonged_repair_machines = [
        m for m in machine_results if m["has_repairs"] and m["mttr_hours"] >= 3.0
    ]

    factory_mttr = (
        round(total_factory_repair_hours / total_factory_repairs, 2)
        if total_factory_repairs > 0
        else 0.0
    )

    return {
        "factory_mttr_hours": factory_mttr,
        "factory_mttr_minutes": round(factory_mttr * 60.0, 1),
        "total_repair_hours": round(total_factory_repair_hours, 2),
        "total_repairs": total_factory_repairs,
        "machine_mttr_rankings": machine_results,
        "prolonged_repair_machines": prolonged_repair_machines,
    }
