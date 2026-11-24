"""
PredictX Factory Analytics - OEE Calculator Module
Calculates Overall Equipment Effectiveness (OEE) and its three constituent pillars:
Availability, Performance, and Quality according to TPM (Total Productive Maintenance) standards.

Formulas:
- Availability = Operating Time / Planned Production Time
- Performance = (Ideal Cycle Time * Total Units Produced) / Operating Time
- Quality = Good Units Produced / Total Units Produced
- OEE = Availability * Performance * Quality
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict


@dataclass
class OEEResult:
    """Standardized result schema for Overall Equipment Effectiveness calculations."""
    availability: float          # Ratio 0.0 to 1.0
    performance: float           # Ratio 0.0 to 1.0
    quality: float               # Ratio 0.0 to 1.0
    oee: float                   # Ratio 0.0 to 1.0
    availability_pct: float      # Percentage 0.0 to 100.0%
    performance_pct: float       # Percentage 0.0 to 100.0%
    quality_pct: float           # Percentage 0.0 to 100.0%
    oee_pct: float               # Percentage 0.0 to 100.0%
    total_units: int             # Total parts manufactured
    good_units: int              # Conforming parts passing quality inspection
    rejected_units: int          # Defective / scrap parts
    operating_time_hours: float  # Actual run time in hours
    planned_time_hours: float    # Scheduled production window in hours
    downtime_hours: float        # Planned - Operating time
    status: str                  # World-Class (>=85%), Acceptable (>=70%), Low (<70%)

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to serializable dictionary."""
        return asdict(self)


def calculate_availability(operating_time_hours: float, planned_time_hours: float) -> float:
    """
    Calculate the Availability component of OEE.
    Availability = Operating Time / Planned Production Time

    Args:
        operating_time_hours: Actual run time in hours.
        planned_time_hours: Scheduled production time in hours.

    Returns:
        Availability ratio bounded between 0.0 and 1.0. Zero if planned time is <= 0.
    """
    if planned_time_hours is None or operating_time_hours is None:
        return 0.0
    if planned_time_hours <= 0.0 or operating_time_hours < 0.0:
        return 0.0

    # Ensure operating time does not exceed planned time
    ratio = min(operating_time_hours / planned_time_hours, 1.0)
    return max(0.0, ratio)


def calculate_performance(
    ideal_cycle_time_seconds: float,
    total_units: int,
    operating_time_hours: float
) -> float:
    """
    Calculate the Performance component of OEE.
    Performance = (Ideal Cycle Time * Total Units Produced) / Operating Time

    Args:
        ideal_cycle_time_seconds: Minimum theoretical time (in seconds) required to produce 1 unit.
        total_units: Total quantity produced (including scrap/defective units).
        operating_time_hours: Actual machine operating time in hours.

    Returns:
        Performance ratio bounded between 0.0 and 1.0. Zero if operating time is <= 0.
    """
    if (
        ideal_cycle_time_seconds is None or
        total_units is None or
        operating_time_hours is None
    ):
        return 0.0

    if operating_time_hours <= 0.0 or ideal_cycle_time_seconds <= 0.0 or total_units <= 0:
        return 0.0

    operating_time_seconds = operating_time_hours * 3600.0
    theoretical_time_seconds = ideal_cycle_time_seconds * total_units

    # Performance capped at 1.0 (100%) to conform to standard OEE definition
    ratio = min(theoretical_time_seconds / operating_time_seconds, 1.0)
    return max(0.0, ratio)


def calculate_quality(good_units: int, total_units: int) -> float:
    """
    Calculate the Quality component of OEE.
    Quality = Good Units Produced / Total Units Produced

    Args:
        good_units: Count of conforming parts produced that meet quality standards.
        total_units: Total count of parts produced (good + defective).

    Returns:
        Quality ratio bounded between 0.0 and 1.0. Zero if total units <= 0.
    """
    if good_units is None or total_units is None:
        return 0.0
    if total_units <= 0 or good_units < 0:
        return 0.0

    # Good units cannot exceed total units
    valid_good = min(good_units, total_units)
    ratio = valid_good / float(total_units)
    return max(0.0, min(ratio, 1.0))


def calculate_oee(
    planned_time_hours: float,
    operating_time_hours: float,
    ideal_cycle_time_seconds: float,
    total_units: int,
    good_units: int,
    rejected_units: Optional[int] = None
) -> OEEResult:
    """
    Calculate full OEE with input validation and zero-division protection.

    Args:
        planned_time_hours: Scheduled production time in hours.
        operating_time_hours: Actual run time in hours.
        ideal_cycle_time_seconds: Minimum cycle time in seconds.
        total_units: Total units produced (good + scrap).
        good_units: Good units meeting specification.
        rejected_units: Optional reject count. If omitted, computed as total_units - good_units.

    Returns:
        OEEResult object with comprehensive metrics and percentage values.
    """
    # Defensive normalization for missing or negative inputs
    planned_time = max(0.0, float(planned_time_hours or 0.0))
    operating_time = max(0.0, float(operating_time_hours or 0.0))
    # Operating time cannot physically exceed planned production time
    operating_time = min(operating_time, planned_time)

    cycle_time = max(0.0, float(ideal_cycle_time_seconds or 0.0))
    total_u = max(0, int(total_units or 0))
    good_u = max(0, int(good_units or 0))
    good_u = min(good_u, total_u)

    if rejected_units is not None and rejected_units >= 0:
        reject_u = min(int(rejected_units), total_u)
    else:
        reject_u = max(0, total_u - good_u)

    # Calculate 3 Pillars
    availability = calculate_availability(operating_time, planned_time)
    performance = calculate_performance(cycle_time, total_u, operating_time)
    quality = calculate_quality(good_u, total_u)

    # OEE Composite
    oee = availability * performance * quality

    # Percentages rounded to 2 decimal places
    avail_pct = round(availability * 100.0, 2)
    perf_pct = round(performance * 100.0, 2)
    qual_pct = round(quality * 100.0, 2)
    oee_pct = round(oee * 100.0, 2)

    downtime_hours = max(0.0, round(planned_time - operating_time, 2))

    # TPM Industry Benchmark Classification
    if oee_pct >= 85.0:
        status = "World-Class"
    elif oee_pct >= 70.0:
        status = "Acceptable"
    elif oee_pct >= 50.0:
        status = "Underperforming"
    else:
        status = "Critical Loss"

    return OEEResult(
        availability=round(availability, 4),
        performance=round(performance, 4),
        quality=round(quality, 4),
        oee=round(oee, 4),
        availability_pct=avail_pct,
        performance_pct=perf_pct,
        quality_pct=qual_pct,
        oee_pct=oee_pct,
        total_units=total_u,
        good_units=good_u,
        rejected_units=reject_u,
        operating_time_hours=round(operating_time, 2),
        planned_time_hours=round(planned_time, 2),
        downtime_hours=downtime_hours,
        status=status,
    )
