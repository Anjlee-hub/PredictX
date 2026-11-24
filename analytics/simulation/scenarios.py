"""
PredictX Factory Analytics - Simulation Scenarios Definition
Defines what-if scenario presets for factory optimization simulations.
"""

from typing import Dict, Any
from dataclasses import dataclass, asdict


@dataclass
class SimulationScenario:
    scenario_id: str
    name: str
    description: str
    downtime_reduction_pct: float   # 0 to 100% reduction in unplanned downtime
    speed_improvement_pct: float     # 0 to 100% improvement in cycle performance
    scrap_reduction_pct: float       # 0 to 100% reduction in defective units
    investment_cost_usd: float       # Estimated cost to implement corrective program

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


PRESET_SCENARIOS = {
    "tpm_autonomous_maintenance": SimulationScenario(
        scenario_id="tpm_autonomous_maintenance",
        name="TPM Autonomous Maintenance Overhaul",
        description="Daily operator lubrication, cleaning, and basic autonomous tightening to cut micro-stops and breakdown frequency.",
        downtime_reduction_pct=25.0,
        speed_improvement_pct=8.0,
        scrap_reduction_pct=15.0,
        investment_cost_usd=12000.0,
    ),
    "smed_rapid_changeover": SimulationScenario(
        scenario_id="smed_rapid_changeover",
        name="SMED Rapid Tool Changeover (Single-Minute Exchange of Die)",
        description="Converts internal changeover steps to external preparation to compress tool change downtime by 40%.",
        downtime_reduction_pct=35.0,
        speed_improvement_pct=5.0,
        scrap_reduction_pct=10.0,
        investment_cost_usd=18500.0,
    ),
    "six_sigma_quality_focus": SimulationScenario(
        scenario_id="six_sigma_quality_focus",
        name="Six Sigma DMAIC Quality Yield Program",
        description="Tightens thermal compensation and tool calibration to slash reject scrap rate by 60%.",
        downtime_reduction_pct=5.0,
        speed_improvement_pct=3.0,
        scrap_reduction_pct=60.0,
        investment_cost_usd=22000.0,
    ),
    "predictx_ai_prescriptive": SimulationScenario(
        scenario_id="predictx_ai_prescriptive",
        name="PredictX Full Prescriptive AI & Predictive Maintenance Suite",
        description="End-to-end integration of predictive survival alerts, smart spare stocking, and automated line load balancing.",
        downtime_reduction_pct=45.0,
        speed_improvement_pct=12.0,
        scrap_reduction_pct=40.0,
        investment_cost_usd=35000.0,
    ),
}
