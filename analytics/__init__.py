"""
PredictX Factory Analytics Package
"""

from .oee.calculator import (
    calculate_oee,
    calculate_availability,
    calculate_performance,
    calculate_quality,
    OEEResult,
)
from .oee.metrics import (
    aggregate_factory_oee,
    calculate_machine_wise_oee,
    calculate_six_big_losses,
)
from .downtime.analyzer import analyze_downtime
from .reliability.mtbf import calculate_machine_mtbf, analyze_fleet_mtbf
from .reliability.mttr import calculate_machine_mttr, analyze_fleet_mttr
from .decision_engine.recommendations import recommendation_engine, RecommendationEngine
from .decision_engine.priority import PriorityLevel, classify_priority
from .data_generation.production_generator import demo_dataset, DemonstrationDataset
from .simulation.simulator import simulate_improvement
from .simulation.scenarios import PRESET_SCENARIOS

__all__ = [
    "calculate_oee",
    "calculate_availability",
    "calculate_performance",
    "calculate_quality",
    "OEEResult",
    "aggregate_factory_oee",
    "calculate_machine_wise_oee",
    "calculate_six_big_losses",
    "analyze_downtime",
    "calculate_machine_mtbf",
    "analyze_fleet_mtbf",
    "calculate_machine_mttr",
    "analyze_fleet_mttr",
    "recommendation_engine",
    "RecommendationEngine",
    "PriorityLevel",
    "classify_priority",
    "demo_dataset",
    "DemonstrationDataset",
    "simulate_improvement",
    "PRESET_SCENARIOS",
]
