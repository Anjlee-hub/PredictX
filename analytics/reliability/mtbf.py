"""
PredictX Factory Analytics - MTBF (Mean Time Between Failures) Module
Computes Mean Time Between Failures for individual assets and entire factory lines.
Formula:
MTBF = Total Operating Time / Number of Failures
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict


def calculate_machine_mtbf(
    operating_time_hours: float,
    failure_count: int,
    machine_id: str = "UNKNOWN",
    machine_name: str = "Unknown Asset"
) -> Dict[str, Any]:
    """
    Calculate MTBF for a single machine with zero-failure handling.

    Args:
        operating_time_hours: Total verified machine operating runtime (hours).
        failure_count: Number of recorded failure events during the observation window.
        machine_id: Machine identifier.
        machine_name: Human-readable machine name.

    Returns:
        Dictionary with MTBF in hours, failure rate (lambda), reliability rating, and status.
    """
    op_time = max(0.0, float(operating_time_hours or 0.0))
    failures = max(0, int(failure_count or 0))

    if failures == 0:
        # Machine experienced zero failures: MTBF is at least equal to operating time
        # Clearly flagged so operators know no failures have occurred
        return {
            "machine_id": machine_id,
            "machine_name": machine_name,
            "operating_time_hours": round(op_time, 2),
            "failure_count": 0,
            "mtbf_hours": round(op_time, 2),
            "mtbf_display": f"{round(op_time, 1)}h (Zero Failures)",
            "failure_rate_per_hour": 0.0,
            "has_failures": False,
            "status": "EXCELLENT",
            "reliability_tier": "High Reliability (Zero Failures)",
        }

    mtbf = op_time / float(failures)
    failure_rate = failures / op_time if op_time > 0 else 0.0

    # Categorize reliability tier
    if mtbf >= 300.0:
        status = "OPTIMAL"
        tier = "World-Class Reliability"
    elif mtbf >= 150.0:
        status = "ACCEPTABLE"
        tier = "Standard Industrial"
    elif mtbf >= 75.0:
        status = "WARNING"
        tier = "Elevated Failure Frequency"
    else:
        status = "CRITICAL"
        tier = "High Failure Frequency"

    return {
        "machine_id": machine_id,
        "machine_name": machine_name,
        "operating_time_hours": round(op_time, 2),
        "failure_count": failures,
        "mtbf_hours": round(mtbf, 2),
        "mtbf_display": f"{round(mtbf, 1)}h",
        "failure_rate_per_hour": round(failure_rate, 5),
        "has_failures": True,
        "status": status,
        "reliability_tier": tier,
    }


def analyze_fleet_mtbf(
    machine_runtimes: List[Dict[str, Any]],
    failure_records: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Aggregates MTBF across all machines in the factory.

    Args:
        machine_runtimes: List of dicts with machine_id, machine_name, operating_time_hours.
        failure_records: List of recorded failure incidents with machine_id.

    Returns:
        Structured fleet MTBF analysis, comparisons, and list of high-failure machines.
    """
    # Count failures per machine
    failure_counts: Dict[str, int] = defaultdict(int)
    for f in failure_records:
        m_id = str(f.get("machine_id", "UNKNOWN"))
        failure_counts[m_id] += 1

    # Map runtimes
    machine_results = []
    total_factory_runtime = 0.0
    total_factory_failures = len(failure_records)

    for item in machine_runtimes:
        m_id = str(item.get("machine_id", "UNKNOWN"))
        m_name = item.get("machine_name", m_id)
        runtime = float(item.get("operating_time_hours", 0.0))
        total_factory_runtime += runtime

        f_count = failure_counts.get(m_id, 0)
        res = calculate_machine_mtbf(runtime, f_count, m_id, m_name)
        machine_results.append(res)

    # Sort so machines with lowest MTBF (highest failure frequency) appear first
    # Machines with failures are prioritized in ranking
    machine_results.sort(
        key=lambda x: (not x["has_failures"], x["mtbf_hours"])
    )

    # Identify frequent failure machines (e.g. failure_count >= 3 or status == CRITICAL)
    frequent_failure_machines = [
        m for m in machine_results
        if m["has_failures"] and (m["failure_count"] >= 3 or m["status"] in ("CRITICAL", "WARNING"))
    ]

    factory_mtbf = (
        round(total_factory_runtime / total_factory_failures, 2)
        if total_factory_failures > 0
        else round(total_factory_runtime, 2)
    )

    return {
        "factory_mtbf_hours": factory_mtbf,
        "total_operating_hours": round(total_factory_runtime, 2),
        "total_failures": total_factory_failures,
        "machine_mtbf_rankings": machine_results,
        "frequent_failure_machines": frequent_failure_machines,
    }
