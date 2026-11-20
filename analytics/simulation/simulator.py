"""
PredictX Factory Analytics - What-If Scenario Simulator Engine
Simulates factory-wide performance outcomes under varying operational improvements
(downtime mitigation, cycle acceleration, defect reduction).
"""

from typing import Dict, Any, Optional
from .scenarios import PRESET_SCENARIOS, SimulationScenario
from ..oee.calculator import calculate_oee


def simulate_improvement(
    baseline_planned_hours: float,
    baseline_operating_hours: float,
    baseline_ideal_cycle_seconds: float,
    baseline_total_units: int,
    baseline_good_units: int,
    downtime_reduction_pct: float = 20.0,
    speed_improvement_pct: float = 5.0,
    scrap_reduction_pct: float = 25.0,
    unit_margin_usd: float = 25.0,
    hourly_overhead_usd: float = 150.0,
    investment_cost_usd: float = 15000.0
) -> Dict[str, Any]:
    """
    Simulates operational and financial outcomes from continuous improvement initiatives.

    Args:
        baseline_planned_hours: Current planned hours.
        baseline_operating_hours: Current operating hours.
        baseline_ideal_cycle_seconds: Current ideal cycle time.
        baseline_total_units: Current total units.
        baseline_good_units: Current good units.
        downtime_reduction_pct: 0 to 100% reduction in downtime.
        speed_improvement_pct: 0 to 100% increase in effective cycle performance.
        scrap_reduction_pct: 0 to 100% reduction in scrap defects.
        unit_margin_usd: Net profit contribution per finished good part ($).
        hourly_overhead_usd: Hourly fixed overhead saving during recovered operating hours ($).
        investment_cost_usd: Program initial capex/opex ($).

    Returns:
        Comparative dictionary containing baseline vs simulated OEE and financial impact.
    """
    # 1. Baseline Calculation
    base_res = calculate_oee(
        planned_time_hours=baseline_planned_hours,
        operating_time_hours=baseline_operating_hours,
        ideal_cycle_time_seconds=baseline_ideal_cycle_seconds,
        total_units=baseline_total_units,
        good_units=baseline_good_units
    )

    base_downtime = max(0.0, baseline_planned_hours - baseline_operating_hours)
    base_rejects = max(0, baseline_total_units - baseline_good_units)

    # 2. Simulated Improvements
    # A. Downtime reduction -> More operating hours
    dt_reduction_factor = max(0.0, min(100.0, downtime_reduction_pct)) / 100.0
    recovered_downtime_hours = base_downtime * dt_reduction_factor
    sim_operating_hours = min(baseline_planned_hours, baseline_operating_hours + recovered_downtime_hours)

    # B. Speed improvement -> More total units produced per operating hour
    speed_factor = 1.0 + (max(0.0, min(100.0, speed_improvement_pct)) / 100.0)
    # Scaled by additional operating time and speed factor
    time_ratio = (sim_operating_hours / baseline_operating_hours) if baseline_operating_hours > 0 else 1.0
    sim_total_units = int(round(baseline_total_units * time_ratio * speed_factor))

    # C. Scrap reduction -> Higher good units
    scrap_reduction_factor = max(0.0, min(100.0, scrap_reduction_pct)) / 100.0
    sim_rejects = int(round(base_rejects * (1.0 - scrap_reduction_factor)))
    sim_good_units = max(0, sim_total_units - sim_rejects)

    # 3. Simulated OEE
    sim_res = calculate_oee(
        planned_time_hours=baseline_planned_hours,
        operating_time_hours=sim_operating_hours,
        ideal_cycle_time_seconds=baseline_ideal_cycle_seconds,
        total_units=sim_total_units,
        good_units=sim_good_units
    )

    # 4. Financial Benefit Quantification
    additional_good_units = max(0, sim_good_units - baseline_good_units)
    gross_margin_gain = additional_good_units * unit_margin_usd
    downtime_overhead_saving = recovered_downtime_hours * hourly_overhead_usd
    total_financial_benefit = round(gross_margin_gain + downtime_overhead_saving, 2)

    net_annual_roi_pct = 0.0
    if investment_cost_usd > 0:
        net_profit = total_financial_benefit - investment_cost_usd
        net_annual_roi_pct = round((net_profit / investment_cost_usd) * 100.0, 1)

    payback_months = (
        round((investment_cost_usd / (total_financial_benefit / 12.0)), 1)
        if total_financial_benefit > 0
        else 0.0
    )

    return {
        "baseline": {
            "oee_pct": base_res.oee_pct,
            "availability_pct": base_res.availability_pct,
            "performance_pct": base_res.performance_pct,
            "quality_pct": base_res.quality_pct,
            "operating_hours": base_res.operating_time_hours,
            "downtime_hours": base_res.downtime_hours,
            "total_units": base_res.total_units,
            "good_units": base_res.good_units,
            "rejected_units": base_res.rejected_units,
        },
        "simulated": {
            "oee_pct": sim_res.oee_pct,
            "availability_pct": sim_res.availability_pct,
            "performance_pct": sim_res.performance_pct,
            "quality_pct": sim_res.quality_pct,
            "operating_hours": sim_res.operating_time_hours,
            "downtime_hours": sim_res.downtime_hours,
            "total_units": sim_res.total_units,
            "good_units": sim_res.good_units,
            "rejected_units": sim_res.rejected_units,
        },
        "delta": {
            "oee_gain_pct": round(sim_res.oee_pct - base_res.oee_pct, 2),
            "availability_gain_pct": round(sim_res.availability_pct - base_res.availability_pct, 2),
            "performance_gain_pct": round(sim_res.performance_pct - base_res.performance_pct, 2),
            "quality_gain_pct": round(sim_res.quality_pct - base_res.quality_pct, 2),
            "additional_good_units": additional_good_units,
            "recovered_downtime_hours": round(recovered_downtime_hours, 2),
        },
        "financial_impact": {
            "gross_margin_gain_usd": round(gross_margin_gain, 2),
            "overhead_savings_usd": round(downtime_overhead_saving, 2),
            "total_benefit_usd": total_financial_benefit,
            "investment_cost_usd": investment_cost_usd,
            "net_roi_pct": net_annual_roi_pct,
            "payback_months": payback_months,
        },
    }
