"""
PredictX Factory Analytics - Downtime Analyzer Module
Analyzes machine stoppage logs, categorizes root causes, computes daily/weekly/monthly
temporal aggregations, identifies repeat offenders, and calculates associated production/financial losses.
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
from datetime import datetime, date


# Standard industrial downtime categories and baseline hourly cost impact
DEFAULT_DOWNTIME_CATEGORIES = [
    "Tool Breakage & Insert Wear",
    "Thermal Overheating (ΔT Collapse)",
    "Mechanical Jam & Material Clog",
    "Spindle & Motor Electrical Trip",
    "Die Setup & Tool Changeover",
    "Pneumatic / Hydraulic Pressure Drop",
    "Operator Absence / Shift Handover",
    "Scheduled Preventive Inspection",
]

DEFAULT_HOURLY_DOWNTIME_COST = 2000.0  # $ per hour (idle labor + fixed overhead)
DEFAULT_UNIT_MARGIN = 25.0            # $ lost profit per unproduced unit
DEFAULT_NOMINAL_UNITS_PER_HOUR = 60.0 # Expected units/hour during operating state


def analyze_downtime(
    downtime_records: List[Dict[str, Any]],
    hourly_cost: float = DEFAULT_HOURLY_DOWNTIME_COST,
    unit_margin: float = DEFAULT_UNIT_MARGIN,
    units_per_hour: float = DEFAULT_NOMINAL_UNITS_PER_HOUR
) -> Dict[str, Any]:
    """
    Comprehensive downtime aggregation and root-cause analysis.

    Args:
        downtime_records: List of downtime incident dicts with keys:
            machine_id, machine_name, duration_hours, category, reason, timestamp (YYYY-MM-DD or datetime),
            cost_impact (optional)
        hourly_cost: Cost per hour of machine stoppage ($).
        unit_margin: Lost contribution margin per unproduced part ($).
        units_per_hour: Nominal line output rate.

    Returns:
        Structured dictionary containing total downtime, machine-wise breakdown,
        category Pareto analysis, daily/weekly/monthly trends, and financial loss impact.
    """
    if not downtime_records:
        return {
            "total_downtime_hours": 0.0,
            "total_incidents": 0,
            "total_cost_impact": 0.0,
            "total_lost_units": 0,
            "category_breakdown": [],
            "machine_breakdown": [],
            "frequent_downtime_machines": [],
            "daily_trend": [],
            "weekly_trend": [],
            "monthly_trend": [],
        }

    total_hours = 0.0
    total_incidents = len(downtime_records)
    total_explicit_cost = 0.0

    category_map: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "hours": 0.0,
        "incidents": 0,
        "explicit_cost": 0.0
    })

    machine_map: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "machine_name": "",
        "hours": 0.0,
        "incidents": 0,
        "reasons": defaultdict(int),
        "explicit_cost": 0.0
    })

    daily_map: Dict[str, float] = defaultdict(float)
    weekly_map: Dict[str, float] = defaultdict(float)
    monthly_map: Dict[str, float] = defaultdict(float)

    for record in downtime_records:
        hours = max(0.0, float(record.get("duration_hours", 0.0)))
        total_hours += hours

        category = record.get("category") or "Unclassified Stoppage"
        reason = record.get("reason") or category
        m_id = str(record.get("machine_id", "UNKNOWN"))
        m_name = record.get("machine_name") or m_id
        explicit_c = float(record.get("cost_impact", 0.0))
        total_explicit_cost += explicit_c

        # Category accumulation
        cat_entry = category_map[category]
        cat_entry["hours"] += hours
        cat_entry["incidents"] += 1
        cat_entry["explicit_cost"] += explicit_c

        # Machine accumulation
        mach_entry = machine_map[m_id]
        if not mach_entry["machine_name"]:
            mach_entry["machine_name"] = m_name
        mach_entry["hours"] += hours
        mach_entry["incidents"] += 1
        mach_entry["reasons"][reason] += 1
        mach_entry["explicit_cost"] += explicit_c

        # Temporal breakdown
        ts_val = record.get("timestamp")
        parsed_date: Optional[date] = None
        if isinstance(ts_val, (datetime, date)):
            parsed_date = ts_val if isinstance(ts_val, date) else ts_val.date()
        elif isinstance(ts_val, str) and ts_val:
            try:
                # Support YYYY-MM-DD or ISO strings
                clean_ts = ts_val.replace("Z", "").split("T")[0]
                parsed_date = datetime.strptime(clean_ts, "%Y-%m-%d").date()
            except ValueError:
                parsed_date = None

        if parsed_date:
            day_str = parsed_date.strftime("%Y-%m-%d")
            # ISO year and week number e.g. "2026-W47"
            week_str = f"{parsed_date.year}-W{parsed_date.isocalendar()[1]:02d}"
            month_str = parsed_date.strftime("%Y-%m")

            daily_map[day_str] += hours
            weekly_map[week_str] += hours
            monthly_map[month_str] += hours

    # Derived loss calculations
    lost_units = int(round(total_hours * units_per_hour))
    calculated_cost = (total_hours * hourly_cost) + (lost_units * unit_margin)
    final_cost_impact = max(calculated_cost, total_explicit_cost)

    # 1. Category Pareto list
    category_list = []
    for cat_name, data in category_map.items():
        pct = round((data["hours"] / total_hours * 100.0), 2) if total_hours > 0 else 0.0
        cat_cost = data["explicit_cost"] if data["explicit_cost"] > 0 else round(data["hours"] * hourly_cost, 2)
        category_list.append({
            "category": cat_name,
            "hours": round(data["hours"], 2),
            "percentage": pct,
            "incidents": data["incidents"],
            "costImpact": cat_cost,
        })
    category_list.sort(key=lambda x: x["hours"], reverse=True)

    # 2. Machine-wise breakdown
    machine_list = []
    for m_id, data in machine_map.items():
        primary_reason = max(data["reasons"].items(), key=lambda x: x[1])[0] if data["reasons"] else "N/A"
        m_pct = round((data["hours"] / total_hours * 100.0), 2) if total_hours > 0 else 0.0
        m_cost = data["explicit_cost"] if data["explicit_cost"] > 0 else round(data["hours"] * hourly_cost, 2)
        machine_list.append({
            "machine_id": m_id,
            "machine_name": data["machine_name"],
            "downtime_hours": round(data["hours"], 2),
            "percentage": m_pct,
            "incidents": data["incidents"],
            "primary_reason": primary_reason,
            "cost_impact": m_cost,
        })
    machine_list.sort(key=lambda x: x["downtime_hours"], reverse=True)

    # 3. Frequent downtime machines (top 3 or incidents >= 3)
    frequent_machines = [
        m for m in machine_list if m["incidents"] >= 3 or m["downtime_hours"] >= (total_hours * 0.15)
    ]
    if not frequent_machines and machine_list:
        frequent_machines = machine_list[:3]

    # 4. Temporal sorted series
    daily_trend = [
        {"date": d, "downtime_hours": round(h, 2)}
        for d, h in sorted(daily_map.items())
    ]
    weekly_trend = [
        {"week": w, "downtime_hours": round(h, 2)}
        for w, h in sorted(weekly_map.items())
    ]
    monthly_trend = [
        {"month": m, "downtime_hours": round(h, 2)}
        for m, h in sorted(monthly_map.items())
    ]

    return {
        "total_downtime_hours": round(total_hours, 2),
        "total_incidents": total_incidents,
        "total_cost_impact": round(final_cost_impact, 2),
        "total_lost_units": lost_units,
        "category_breakdown": category_list,
        "machine_breakdown": machine_list,
        "frequent_downtime_machines": frequent_machines,
        "daily_trend": daily_trend,
        "weekly_trend": weekly_trend,
        "monthly_trend": monthly_trend,
    }
