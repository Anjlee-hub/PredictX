"""
PredictX Factory Analytics - Factory Decision Intelligence & Maintenance Recommendation Engine
Generates transparent, deterministic, rule-based maintenance recommendations by analyzing
OEE, Availability, Performance, Quality, Downtime incidents, MTBF, and MTTR.

Note:
These recommendations are purely rule-based engineering insights and are NOT AI predictions.
Predictive ML and survival modeling are the responsibility of Member 1 (feature/ml-survival).
A documented integration interface is provided to augment recommendations with survival risk when available.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from .priority import PriorityLevel, classify_priority, DEFAULT_THRESHOLDS


@dataclass
class MaintenanceRecommendation:
    """Actionable maintenance recommendation schema."""
    machine_id: str
    machine_name: str
    problem: str
    metric: str
    observed_value: float
    unit: str
    threshold: float
    explanation: str
    action: str
    priority: str          # HIGH, MEDIUM, LOW
    engine_source: str     # Strictly "RULE_BASED"
    ml_augmented: bool     # True if augmented by Member 1's survival analysis
    ml_risk_score: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class RecommendationEngine:
    """
    Transparent Rule-Based Maintenance Decision Engine.
    Evaluates machine telemetry against engineering limits to suggest prioritized corrective interventions.
    """

    def __init__(self, thresholds: Optional[Dict[str, float]] = None):
        self.thresholds = thresholds or DEFAULT_THRESHOLDS.copy()

    def generate_recommendations(
        self,
        oee_data: Optional[List[Dict[str, Any]]] = None,
        downtime_data: Optional[Dict[str, Any]] = None,
        mtbf_data: Optional[Dict[str, Any]] = None,
        mttr_data: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes decision rules across factory analytics metrics.

        Args:
            oee_data: Machine-wise OEE records.
            downtime_data: Analyzed downtime output with machine breakdown and frequent machines.
            mtbf_data: Fleet MTBF output with machine rankings.
            mttr_data: Fleet MTTR output with machine rankings.

        Returns:
            List of prioritized recommendations sorted by High -> Medium -> Low.
        """
        recommendations: List[MaintenanceRecommendation] = []

        # 1. Evaluate OEE, Availability, Performance, Quality
        if oee_data:
            for item in oee_data:
                m_id = str(item.get("machine_id", "UNKNOWN"))
                m_name = item.get("machine_name", m_id)

                oee_val = float(item.get("oee", 100.0))
                avail_val = float(item.get("availability", 100.0))
                perf_val = float(item.get("performance", 100.0))
                qual_val = float(item.get("quality", 100.0))

                # Rule 1: Low Overall Equipment Effectiveness
                if oee_val < self.thresholds["oee_warning"]:
                    prio = classify_priority("oee", oee_val, self.thresholds)
                    recommendations.append(MaintenanceRecommendation(
                        machine_id=m_id,
                        machine_name=m_name,
                        problem="Substandard Overall Equipment Effectiveness",
                        metric="OEE",
                        observed_value=oee_val,
                        unit="%",
                        threshold=self.thresholds["oee_warning"],
                        explanation=(
                            f"Asset operating at {oee_val}% OEE, trailing the industrial target of 85.0%. "
                            f"Compounded losses across availability, line speed, or scrap rate reduce net line throughput."
                        ),
                        action="Conduct comprehensive cross-functional Kaizen loss assessment on this line.",
                        priority=prio.value,
                        engine_source="RULE_BASED",
                        ml_augmented=False
                    ))

                # Rule 2: Low Availability (Excessive Downtime)
                if avail_val < self.thresholds["availability_warning"]:
                    prio = classify_priority("availability", avail_val, self.thresholds)
                    recommendations.append(MaintenanceRecommendation(
                        machine_id=m_id,
                        machine_name=m_name,
                        problem="Excessive Equipment Downtime & Setup Losses",
                        metric="Availability",
                        observed_value=avail_val,
                        unit="%",
                        threshold=self.thresholds["availability_warning"],
                        explanation=(
                            f"Operational uptime is {avail_val}%, indicating severe stoppage losses during planned shifts. "
                            f"Machine is offline longer than scheduled tolerance."
                        ),
                        action="Audit daily shift changeover logs and inspect mechanical drive components for wear.",
                        priority=prio.value,
                        engine_source="RULE_BASED",
                        ml_augmented=False
                    ))

                # Rule 3: Low Performance (Operating Speed Loss / Idling)
                if perf_val < self.thresholds["performance_warning"]:
                    prio = classify_priority("performance", perf_val, self.thresholds)
                    recommendations.append(MaintenanceRecommendation(
                        machine_id=m_id,
                        machine_name=m_name,
                        problem="Operating Below Design Cycle Speed / Micro-Stoppages",
                        metric="Performance",
                        observed_value=perf_val,
                        unit="%",
                        threshold=self.thresholds["performance_warning"],
                        explanation=(
                            f"Machine operating at {perf_val}% of rated design speed. Minor jams, feed stutter, "
                            f"or operator throttled feed rates are choking production cadence."
                        ),
                        action="Inspect spindle lubrication, clean feed guides, and check servo motor torque parameters.",
                        priority=prio.value,
                        engine_source="RULE_BASED",
                        ml_augmented=False
                    ))

                # Rule 4: Low Quality (High Rejection / Scrap Rate)
                if qual_val < self.thresholds["quality_warning"]:
                    prio = classify_priority("quality", qual_val, self.thresholds)
                    defect_rate = round(100.0 - qual_val, 2)
                    recommendations.append(MaintenanceRecommendation(
                        machine_id=m_id,
                        machine_name=m_name,
                        problem="Elevated Defect / Scrap Rejection Rate",
                        metric="Quality",
                        observed_value=qual_val,
                        unit="%",
                        threshold=self.thresholds["quality_warning"],
                        explanation=(
                            f"First-pass quality yield dropped to {qual_val}% (Defect rate: {defect_rate}%). "
                            f"Out-of-tolerance parts require rework or scrapping."
                        ),
                        action="Recalibrate cutting tool inserts, check thermal expansion offsets, and inspect incoming material spec.",
                        priority=prio.value,
                        engine_source="RULE_BASED",
                        ml_augmented=False
                    ))

        # 2. Evaluate MTBF (Failure Frequency)
        if mtbf_data and "machine_mtbf_rankings" in mtbf_data:
            for item in mtbf_data["machine_mtbf_rankings"]:
                if not item.get("has_failures", False):
                    continue
                mtbf_val = float(item.get("mtbf_hours", 0.0))
                if mtbf_val < self.thresholds["mtbf_warning"]:
                    m_id = item.get("machine_id", "UNKNOWN")
                    m_name = item.get("machine_name", m_id)
                    prio = classify_priority("mtbf", mtbf_val, self.thresholds)
                    f_count = item.get("failure_count", 0)
                    recommendations.append(MaintenanceRecommendation(
                        machine_id=m_id,
                        machine_name=m_name,
                        problem="High Breakdown Recurrence / Low MTBF",
                        metric="MTBF",
                        observed_value=mtbf_val,
                        unit="Hours",
                        threshold=self.thresholds["mtbf_warning"],
                        explanation=(
                            f"Mean Time Between Failures is only {mtbf_val}h with {f_count} recorded failures. "
                            f"Frequent stoppages indicate chronic degradation rather than random component wear."
                        ),
                        action="Perform Root Cause Failure Analysis (RCFA) and replace high-wear bearings/belts.",
                        priority=prio.value,
                        engine_source="RULE_BASED",
                        ml_augmented=False
                    ))

        # 3. Evaluate MTTR (Protracted Repair Times)
        if mttr_data and "machine_mttr_rankings" in mttr_data:
            for item in mttr_data["machine_mttr_rankings"]:
                if not item.get("has_repairs", False):
                    continue
                mttr_val = float(item.get("mttr_hours", 0.0))
                if mttr_val >= self.thresholds["mttr_warning"]:
                    m_id = item.get("machine_id", "UNKNOWN")
                    m_name = item.get("machine_name", m_id)
                    prio = classify_priority("mttr", mttr_val, self.thresholds)
                    recommendations.append(MaintenanceRecommendation(
                        machine_id=m_id,
                        machine_name=m_name,
                        problem="Excessive Restoration Duration / High MTTR",
                        metric="MTTR",
                        observed_value=mttr_val,
                        unit="Hours",
                        threshold=self.thresholds["mttr_warning"],
                        explanation=(
                            f"Average repair duration is {mttr_val}h. Extended maintenance turnaround indicates "
                            f"delayed spare part availability or difficult diagnostic procedures."
                        ),
                        action="Stock critical fast-moving spare subassemblies near the machine and update standard repair SOPs.",
                        priority=prio.value,
                        engine_source="RULE_BASED",
                        ml_augmented=False
                    ))

        # 4. Evaluate Repeated Downtime Incidents
        if downtime_data and "frequent_downtime_machines" in downtime_data:
            for item in downtime_data["frequent_downtime_machines"]:
                incidents = int(item.get("incidents", 0))
                if incidents >= self.thresholds["repeat_downtime_warning"]:
                    m_id = item.get("machine_id", "UNKNOWN")
                    m_name = item.get("machine_name", m_id)
                    prio = classify_priority("incidents", float(incidents), self.thresholds)
                    dt_hours = item.get("downtime_hours", 0.0)
                    primary_r = item.get("primary_reason", "Recurring stops")
                    recommendations.append(MaintenanceRecommendation(
                        machine_id=m_id,
                        machine_name=m_name,
                        problem="Chronic Repeated Downtime Incidents",
                        metric="Incident Frequency",
                        observed_value=float(incidents),
                        unit="Events",
                        threshold=float(self.thresholds["repeat_downtime_warning"]),
                        explanation=(
                            f"Machine stopped {incidents} times accumulating {dt_hours}h of lost time. "
                            f"Primary recurring reason: '{primary_r}'."
                        ),
                        action="Schedule an immediate preventive maintenance shutdown overhaul before catastrophic line failure.",
                        priority=prio.value,
                        engine_source="RULE_BASED",
                        ml_augmented=False
                    ))

        # Sort recommendations by Priority: HIGH -> MEDIUM -> LOW
        priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        recommendations.sort(key=lambda r: priority_order.get(r.priority, 3))

        return [r.to_dict() for r in recommendations]

    def integrate_survival_predictions(
        self,
        recommendations: List[Dict[str, Any]],
        survival_predictions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Documented Interface for Member 1 (feature/ml-survival).
        Augments rule-based recommendations with predictive ML survival probabilities when available.

        Args:
            recommendations: Existing rule-based recommendations.
            survival_predictions: List of dicts from Member 1 with keys:
                machine_id, failure_probability_next_7d (0.0 to 1.0), cox_hazard_ratio.

        Returns:
            Updated recommendations with ml_augmented=True and escalated priority if survival risk is elevated.
        """
        if not survival_predictions:
            return recommendations

        survival_map = {str(p.get("machine_id")): p for p in survival_predictions}

        augmented_list = []
        for rec in recommendations:
            m_id = rec.get("machine_id")
            if m_id in survival_map:
                ml_data = survival_map[m_id]
                risk_score = float(ml_data.get("failure_probability_next_7d", 0.0))
                rec["ml_augmented"] = True
                rec["ml_risk_score"] = round(risk_score, 4)
                # Escalate priority if ML predicts impending breakdown (> 70% risk)
                if risk_score >= 0.70 and rec["priority"] != "HIGH":
                    rec["priority"] = "HIGH"
                    rec["explanation"] += f" [ML Survival Alert: High 7-day failure risk of {round(risk_score * 100, 1)}%]."
            augmented_list.append(rec)

        return augmented_list


# Singleton instance for simple imports
recommendation_engine = RecommendationEngine()
