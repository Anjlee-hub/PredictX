"""
PredictX Factory Analytics - Downtime Reports Module
Formats downtime analysis outputs into executive summaries and structured export payloads.
"""

from typing import Dict, Any, List
from .analyzer import analyze_downtime


def generate_downtime_executive_summary(downtime_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a concise executive report summarizing operational losses,
    the #1 stoppage root cause, and the highest-risk machines.
    """
    total_hours = downtime_analysis.get("total_downtime_hours", 0.0)
    total_cost = downtime_analysis.get("total_cost_impact", 0.0)
    lost_units = downtime_analysis.get("total_lost_units", 0)
    categories = downtime_analysis.get("category_breakdown", [])
    machines = downtime_analysis.get("machine_breakdown", [])

    top_category = categories[0] if categories else {"category": "None", "hours": 0.0, "percentage": 0.0}
    top_machine = machines[0] if machines else {"machine_name": "None", "downtime_hours": 0.0}

    return {
        "summary_title": "PredictX Factory Downtime Intelligence Report",
        "total_downtime_hours": total_hours,
        "total_financial_loss_usd": total_cost,
        "total_lost_production_units": lost_units,
        "primary_root_cause": {
            "category": top_category.get("category"),
            "lost_hours": top_category.get("hours"),
            "percentage_of_total": top_category.get("percentage"),
        },
        "critical_bottleneck_asset": {
            "machine_name": top_machine.get("machine_name"),
            "downtime_hours": top_machine.get("downtime_hours"),
            "primary_reason": top_machine.get("primary_reason", "N/A"),
        },
        "actionable_insight": (
            f"Asset '{top_machine.get('machine_name')}' contributed {top_machine.get('downtime_hours')}h "
            f"of stoppage, predominantly driven by '{top_category.get('category')}'. "
            f"Addressing this category offers immediate recovery of up to ${top_category.get('costImpact', 0):,.0f}."
        ),
    }
