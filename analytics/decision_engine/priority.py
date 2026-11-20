"""
PredictX Factory Analytics - Priority Determination Engine
Classifies recommendation priority (HIGH, MEDIUM, LOW) based on operational thresholds
and business criticality.
"""

from enum import Enum
from typing import Dict, Any


class PriorityLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


# Standard configurable factory thresholds
DEFAULT_THRESHOLDS = {
    # OEE thresholds (%)
    "oee_critical": 65.0,
    "oee_warning": 75.0,
    # Availability thresholds (%)
    "availability_critical": 75.0,
    "availability_warning": 85.0,
    # Performance thresholds (%)
    "performance_critical": 75.0,
    "performance_warning": 85.0,
    # Quality thresholds (%)
    "quality_critical": 95.0,
    "quality_warning": 98.0,
    # MTBF thresholds (Hours)
    "mtbf_critical": 80.0,
    "mtbf_warning": 150.0,
    # MTTR thresholds (Hours)
    "mttr_critical": 4.5,
    "mttr_warning": 3.0,
    # Stoppage frequency in period
    "repeat_downtime_critical": 4,
    "repeat_downtime_warning": 2,
}


def classify_priority(
    metric_name: str,
    observed_value: float,
    thresholds: Dict[str, float] = DEFAULT_THRESHOLDS
) -> PriorityLevel:
    """
    Deterministic rule-based priority classifier.

    Args:
        metric_name: Name of KPI being evaluated (oee, availability, performance, quality, mtbf, mttr, incidents).
        observed_value: Numerical observed value.
        thresholds: Dictionary of threshold boundaries.

    Returns:
        PriorityLevel (HIGH, MEDIUM, or LOW).
    """
    m = metric_name.lower()

    # For OEE, Availability, Performance, Quality, MTBF: lower is worse
    if "oee" in m:
        if observed_value < thresholds["oee_critical"]:
            return PriorityLevel.HIGH
        elif observed_value < thresholds["oee_warning"]:
            return PriorityLevel.MEDIUM
        return PriorityLevel.LOW

    if "avail" in m:
        if observed_value < thresholds["availability_critical"]:
            return PriorityLevel.HIGH
        elif observed_value < thresholds["availability_warning"]:
            return PriorityLevel.MEDIUM
        return PriorityLevel.LOW

    if "perf" in m:
        if observed_value < thresholds["performance_critical"]:
            return PriorityLevel.HIGH
        elif observed_value < thresholds["performance_warning"]:
            return PriorityLevel.MEDIUM
        return PriorityLevel.LOW

    if "qual" in m:
        if observed_value < thresholds["quality_critical"]:
            return PriorityLevel.HIGH
        elif observed_value < thresholds["quality_warning"]:
            return PriorityLevel.MEDIUM
        return PriorityLevel.LOW

    if "mtbf" in m:
        if observed_value < thresholds["mtbf_critical"]:
            return PriorityLevel.HIGH
        elif observed_value < thresholds["mtbf_warning"]:
            return PriorityLevel.MEDIUM
        return PriorityLevel.LOW

    # For MTTR, downtime hours, and incidents: higher is worse
    if "mttr" in m:
        if observed_value >= thresholds["mttr_critical"]:
            return PriorityLevel.HIGH
        elif observed_value >= thresholds["mttr_warning"]:
            return PriorityLevel.MEDIUM
        return PriorityLevel.LOW

    if "incident" in m or "repeat" in m or "downtime_count" in m:
        if observed_value >= thresholds["repeat_downtime_critical"]:
            return PriorityLevel.HIGH
        elif observed_value >= thresholds["repeat_downtime_warning"]:
            return PriorityLevel.MEDIUM
        return PriorityLevel.LOW

    return PriorityLevel.LOW
