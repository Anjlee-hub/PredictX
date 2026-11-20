"""
PredictX Backend - Factory Analytics Service Layer
Bridges FastAPI route handlers with the underlying analytics engine and data sources.
"""

from typing import List, Dict, Any, Optional
import os
import sys

# Ensure analytics package is accessible
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from analytics.oee.calculator import calculate_oee
from analytics.oee.metrics import aggregate_factory_oee, calculate_machine_wise_oee
from analytics.downtime.analyzer import analyze_downtime
from analytics.reliability.mtbf import analyze_fleet_mtbf
from analytics.reliability.mttr import analyze_fleet_mttr
from analytics.decision_engine.recommendations import recommendation_engine
from analytics.data_generation.production_generator import demo_dataset
from analytics.simulation.simulator import simulate_improvement


class FactoryAnalyticsService:
    """
    Encapsulates all factory intelligence calculations and data aggregation.
    Works independently of the underlying persistence layer (MongoDB or Demo Generator).
    """

    def __init__(self):
        self.dataset = demo_dataset

    def get_factory_kpis(self) -> Dict[str, Any]:
        """Calculates high-level factory health and composite OEE KPIs."""
        records = self.dataset.production_records
        dt_records = self.dataset.downtime_records
        fail_records = self.dataset.failure_records
        repair_records = self.dataset.repair_records

        # Aggregate OEE
        agg = aggregate_factory_oee(records)
        # Aggregate Downtime
        dt_analysis = analyze_downtime(dt_records)

        # Machine runtimes for MTBF
        machine_runtimes = [
            {
                "machine_id": m["machine_id"],
                "machine_name": m["machine_name"],
                "operating_time_hours": sum(
                    float(r["operating_time_hours"])
                    for r in records if r["machine_id"] == m["machine_id"]
                )
            }
            for m in self.dataset.machines
        ]
        mtbf_res = analyze_fleet_mtbf(machine_runtimes, fail_records)
        mttr_res = analyze_fleet_mttr(repair_records, self.dataset.machines)

        # Machine health distribution
        machine_oee = calculate_machine_wise_oee(records)
        critical_count = sum(1 for m in machine_oee if m["oee"] < 65.0)
        warning_count = sum(1 for m in machine_oee if 65.0 <= m["oee"] < 75.0)
        healthy_count = len(machine_oee) - critical_count - warning_count

        return {
            "totalMachines": len(self.dataset.machines),
            "healthyMachines": max(0, healthy_count),
            "warningMachines": warning_count,
            "criticalMachines": critical_count,
            "offlineMachines": 1 if critical_count > 0 else 0,
            "maintenanceDue": warning_count + critical_count,
            "overallOEE": agg["overall_oee_pct"],
            "availability": agg["availability_pct"],
            "performance": agg["performance_pct"],
            "quality": agg["quality_pct"],
            "totalDowntimeHours": dt_analysis["total_downtime_hours"],
            "mtbfHours": mtbf_res["factory_mtbf_hours"],
            "mttrHours": mttr_res["factory_mttr_hours"],
            "totalUnits": agg["total_units"],
            "goodUnits": agg["good_units"],
            "rejectedUnits": agg["rejected_units"],
            "todayAlertsCount": 8,
            "activePredictionsCount": 18,
            "productionEfficiency": 94.1,
            "energyUsageKwh": 124850.0,
            "machineUtilization": round((agg["total_operating_hours"] / agg["total_planned_hours"] * 100.0), 1) if agg["total_planned_hours"] > 0 else 85.0,
        }

    def get_oee_history(self) -> List[Dict[str, Any]]:
        """Returns 7-day trailing OEE trend by day."""
        records = self.dataset.production_records
        # Group by date
        by_date: Dict[str, List[Dict[str, Any]]] = {}
        for r in records:
            d = r.get("date", "Unknown")
            if d not in by_date:
                by_date[d] = []
            by_date[d].append(r)

        history = []
        for d in sorted(by_date.keys())[-7:]:
            daily_agg = aggregate_factory_oee(by_date[d])
            history.append({
                "date": d,
                "oee": daily_agg["overall_oee_pct"],
                "availability": daily_agg["availability_pct"],
                "performance": daily_agg["performance_pct"],
                "quality": daily_agg["quality_pct"],
                "target": 85.0,
            })
        return history

    def get_machine_wise_oee(self) -> List[Dict[str, Any]]:
        """Returns machine performance breakdown."""
        return calculate_machine_wise_oee(self.dataset.production_records)

    def get_downtime_categories(self) -> List[Dict[str, Any]]:
        """Returns Pareto downtime categories."""
        res = analyze_downtime(self.dataset.downtime_records)
        return res["category_breakdown"]

    def get_downtime_summary(self) -> Dict[str, Any]:
        """Returns complete downtime analysis."""
        return analyze_downtime(self.dataset.downtime_records)

    def get_reliability_metrics(self) -> Dict[str, Any]:
        """Returns MTBF and MTTR metrics."""
        records = self.dataset.production_records
        machine_runtimes = [
            {
                "machine_id": m["machine_id"],
                "machine_name": m["machine_name"],
                "operating_time_hours": sum(
                    float(r["operating_time_hours"])
                    for r in records if r["machine_id"] == m["machine_id"]
                )
            }
            for m in self.dataset.machines
        ]
        mtbf_res = analyze_fleet_mtbf(machine_runtimes, self.dataset.failure_records)
        mttr_res = analyze_fleet_mttr(self.dataset.repair_records, self.dataset.machines)

        return {
            "factory_mtbf_hours": mtbf_res["factory_mtbf_hours"],
            "factory_mttr_hours": mttr_res["factory_mttr_hours"],
            "factory_mttr_minutes": mttr_res["factory_mttr_minutes"],
            "total_operating_hours": mtbf_res["total_operating_hours"],
            "total_repair_hours": mttr_res["total_repair_hours"],
            "total_failures": mtbf_res["total_failures"],
            "total_repairs": mttr_res["total_repairs"],
            "machine_mtbf_rankings": mtbf_res["machine_mtbf_rankings"],
            "machine_mttr_rankings": mttr_res["machine_mttr_rankings"],
            "frequent_failure_machines": mtbf_res["frequent_failure_machines"],
            "prolonged_repair_machines": mttr_res["prolonged_repair_machines"],
        }

    def get_maintenance_recommendations(self) -> List[Dict[str, Any]]:
        """Generates prioritized rule-based maintenance recommendations."""
        oee_data = self.get_machine_wise_oee()
        dt_data = self.get_downtime_summary()
        rel_data = self.get_reliability_metrics()

        mtbf_dict = {
            "machine_mtbf_rankings": rel_data["machine_mtbf_rankings"],
            "frequent_failure_machines": rel_data["frequent_failure_machines"],
        }
        mttr_dict = {
            "machine_mttr_rankings": rel_data["machine_mttr_rankings"],
            "prolonged_repair_machines": rel_data["prolonged_repair_machines"],
        }

        return recommendation_engine.generate_recommendations(
            oee_data=oee_data,
            downtime_data=dt_data,
            mtbf_data=mtbf_dict,
            mttr_data=mttr_dict
        )

    def run_simulation(
        self,
        downtime_reduction_pct: float,
        speed_improvement_pct: float,
        scrap_reduction_pct: float,
        investment_cost_usd: float
    ) -> Dict[str, Any]:
        """Runs what-if simulation against current factory baseline."""
        kpis = self.get_factory_kpis()
        agg = aggregate_factory_oee(self.dataset.production_records)

        return simulate_improvement(
            baseline_planned_hours=agg["total_planned_hours"],
            baseline_operating_hours=agg["total_operating_hours"],
            baseline_ideal_cycle_seconds=35.0,
            baseline_total_units=agg["total_units"],
            baseline_good_units=agg["good_units"],
            downtime_reduction_pct=downtime_reduction_pct,
            speed_improvement_pct=speed_improvement_pct,
            scrap_reduction_pct=scrap_reduction_pct,
            investment_cost_usd=investment_cost_usd
        )


analytics_service = FactoryAnalyticsService()
