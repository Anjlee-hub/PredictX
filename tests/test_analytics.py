"""
PredictX Automated Test Suite - Factory Analytics & Decision Intelligence
Validates all 13 required test criteria:
1. OEE calculation
2. Availability calculation
3. Performance calculation
4. Quality calculation
5. Downtime aggregation
6. Machine-wise downtime
7. MTBF calculation
8. MTTR calculation
9. Maintenance recommendation generation
10. Missing data handling
11. Zero values / division-by-zero protection
12. Invalid input validation
13. Backend API integration
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure root repository directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from analytics.oee.calculator import (
    calculate_oee,
    calculate_availability,
    calculate_performance,
    calculate_quality,
    OEEResult,
)
from analytics.oee.metrics import (
    aggregate_factory_oee,
    calculate_machine_wise_oee,
    calculate_six_big_losses,
)
from analytics.downtime.analyzer import analyze_downtime
from analytics.reliability.mtbf import calculate_machine_mtbf, analyze_fleet_mtbf
from analytics.reliability.mttr import calculate_machine_mttr, analyze_fleet_mttr
from analytics.decision_engine.priority import PriorityLevel, classify_priority
from analytics.decision_engine.recommendations import (
    RecommendationEngine,
    MaintenanceRecommendation,
    recommendation_engine,
)
from analytics.simulation.simulator import simulate_improvement
from backend.app.main import app


# ---------------------------------------------------------------------------
# 1. OEE Calculation Test
# ---------------------------------------------------------------------------
def test_oee_standard_calculation():
    """Validates OEE = Availability * Performance * Quality."""
    # 8h planned, 7.2h operating (Avail = 7.2/8.0 = 0.90)
    # 7.2h operating, cycle 30s, 720 units (Perf = (30 * 720) / (7.2 * 3600) = 21600 / 25920 = 0.8333)
    # 720 total units, 684 good units (Qual = 684/720 = 0.95)
    # OEE = 0.90 * 0.8333 * 0.95 = 0.7125 (71.25%)
    res = calculate_oee(
        planned_time_hours=8.0,
        operating_time_hours=7.2,
        ideal_cycle_time_seconds=30.0,
        total_units=720,
        good_units=684
    )

    assert isinstance(res, OEEResult)
    assert pytest.approx(res.availability, 0.01) == 0.90
    assert pytest.approx(res.availability_pct, 0.1) == 90.0
    assert pytest.approx(res.performance, 0.01) == 0.8333
    assert pytest.approx(res.performance_pct, 0.1) == 83.33
    assert pytest.approx(res.quality, 0.01) == 0.95
    assert pytest.approx(res.quality_pct, 0.1) == 95.0
    assert pytest.approx(res.oee_pct, 0.2) == 71.25
    assert res.total_units == 720
    assert res.good_units == 684
    assert res.rejected_units == 36
    assert res.downtime_hours == 0.8
    assert res.status == "Acceptable"


# ---------------------------------------------------------------------------
# 2. Availability Calculation Test
# ---------------------------------------------------------------------------
def test_availability_calculation():
    """Availability = Operating Time / Planned Production Time"""
    # Exact match
    assert calculate_availability(6.0, 8.0) == 0.75
    # Operating time equal to planned time
    assert calculate_availability(8.0, 8.0) == 1.0
    # Zero operating time
    assert calculate_availability(0.0, 8.0) == 0.0


# ---------------------------------------------------------------------------
# 3. Performance Calculation Test
# ---------------------------------------------------------------------------
def test_performance_calculation():
    """Performance = (Ideal Cycle Time * Total Units Produced) / Operating Time"""
    # 3600 seconds operating time, 60s cycle, 50 units -> 3000 / 3600 = 0.8333
    perf = calculate_performance(
        ideal_cycle_time_seconds=60.0,
        total_units=50,
        operating_time_hours=1.0
    )
    assert pytest.approx(perf, 0.001) == 0.8333


# ---------------------------------------------------------------------------
# 4. Quality Calculation Test
# ---------------------------------------------------------------------------
def test_quality_calculation():
    """Quality = Good Units Produced / Total Units Produced"""
    # 950 good out of 1000 total = 0.95
    assert calculate_quality(950, 1000) == 0.95
    # 100% first pass yield
    assert calculate_quality(500, 500) == 1.0
    # Zero good units
    assert calculate_quality(0, 500) == 0.0


# ---------------------------------------------------------------------------
# 5. Downtime Aggregation Test
# ---------------------------------------------------------------------------
def test_downtime_aggregation():
    """Validates total downtime, category Pareto, and cost impact."""
    records = [
        {"machine_id": "M1", "duration_hours": 2.0, "category": "Tool Breakage", "timestamp": "2026-11-01"},
        {"machine_id": "M2", "duration_hours": 1.5, "category": "Tool Breakage", "timestamp": "2026-11-02"},
        {"machine_id": "M1", "duration_hours": 3.0, "category": "Thermal Trip", "timestamp": "2026-11-03"},
    ]
    res = analyze_downtime(records, hourly_cost=1000.0)

    assert res["total_downtime_hours"] == 6.5
    assert res["total_incidents"] == 3
    # Tool breakage should have 3.5h, Thermal Trip should have 3.0h
    cats = {c["category"]: c["hours"] for c in res["category_breakdown"]}
    assert cats["Tool Breakage"] == 3.5
    assert cats["Thermal Trip"] == 3.0
    # Daily trend verified
    assert len(res["daily_trend"]) == 3


# ---------------------------------------------------------------------------
# 6. Machine-Wise Downtime Test
# ---------------------------------------------------------------------------
def test_machine_wise_downtime():
    """Validates downtime comparison and repeat offender detection."""
    records = [
        {"machine_id": "M1", "machine_name": "Press 01", "duration_hours": 4.0, "category": "Jam"},
        {"machine_id": "M2", "machine_name": "Lathe 02", "duration_hours": 1.0, "category": "Wear"},
        {"machine_id": "M1", "machine_name": "Press 01", "duration_hours": 2.5, "category": "Jam"},
    ]
    res = analyze_downtime(records)
    machines = {m["machine_id"]: m for m in res["machine_breakdown"]}

    assert machines["M1"]["downtime_hours"] == 6.5
    assert machines["M1"]["incidents"] == 2
    assert machines["M2"]["downtime_hours"] == 1.0
    assert machines["M2"]["incidents"] == 1
    # M1 is top downtime offender
    assert res["machine_breakdown"][0]["machine_id"] == "M1"


# ---------------------------------------------------------------------------
# 7. MTBF Calculation Test
# ---------------------------------------------------------------------------
def test_mtbf_calculation():
    """MTBF = Operating Time / Number of Failures"""
    # 500 operating hours with 2 failures = 250 hours MTBF
    res = calculate_machine_mtbf(
        operating_time_hours=500.0,
        failure_count=2,
        machine_id="MAC-001",
        machine_name="Milling 01"
    )
    assert res["mtbf_hours"] == 250.0
    assert res["has_failures"] is True
    assert res["status"] == "ACCEPTABLE"

    # Zero failures handled gracefully
    zero_f = calculate_machine_mtbf(
        operating_time_hours=400.0,
        failure_count=0,
        machine_id="MAC-002"
    )
    assert zero_f["mtbf_hours"] == 400.0
    assert zero_f["has_failures"] is False
    assert zero_f["status"] == "EXCELLENT"


# ---------------------------------------------------------------------------
# 8. MTTR Calculation Test
# ---------------------------------------------------------------------------
def test_mttr_calculation():
    """MTTR = Total Repair Time / Number of Repairs"""
    # 10 hours repair time over 4 repairs = 2.5 hours MTTR
    res = calculate_machine_mttr(
        repair_time_hours=10.0,
        repair_count=4,
        machine_id="MAC-003",
        machine_name="Press 03"
    )
    assert res["mttr_hours"] == 2.5
    assert res["mttr_minutes"] == 150.0
    assert res["status"] == "ACCEPTABLE"

    # Zero repairs handled gracefully
    zero_rep = calculate_machine_mttr(
        repair_time_hours=0.0,
        repair_count=0,
        machine_id="MAC-004"
    )
    assert zero_rep["mttr_hours"] == 0.0
    assert zero_rep["has_repairs"] is False
    assert zero_rep["status"] == "NO_REPAIRS"


# ---------------------------------------------------------------------------
# 9. Maintenance Recommendation Generation Test
# ---------------------------------------------------------------------------
def test_maintenance_recommendation_engine():
    """Validates rule-based recommendation trigger logic and priority levels."""
    engine = RecommendationEngine()

    oee_data = [
        # Critical low OEE and low availability
        {"machine_id": "MAC-004", "machine_name": "Gas Turbine", "oee": 58.0, "availability": 68.0, "performance": 88.0, "quality": 97.0},
        # Low quality
        {"machine_id": "MAC-005", "machine_name": "Laser Cell", "oee": 72.0, "availability": 90.0, "performance": 90.0, "quality": 89.0},
    ]

    mtbf_data = {
        "machine_mtbf_rankings": [
            {"machine_id": "MAC-004", "machine_name": "Gas Turbine", "mtbf_hours": 45.0, "has_failures": True, "failure_count": 5}
        ]
    }

    mttr_data = {
        "machine_mttr_rankings": [
            {"machine_id": "MAC-004", "machine_name": "Gas Turbine", "mttr_hours": 5.2, "has_repairs": True}
        ]
    }

    recs = engine.generate_recommendations(
        oee_data=oee_data,
        downtime_data=None,
        mtbf_data=mtbf_data,
        mttr_data=mttr_data
    )

    assert len(recs) >= 4
    # All recommendations must be transparently rule-based
    for r in recs:
        assert r["engine_source"] == "RULE_BASED"
        assert r["priority"] in ("HIGH", "MEDIUM", "LOW")
        assert "machine_id" in r
        assert "action" in r
        assert "explanation" in r

    # Verify high priority ranking
    assert recs[0]["priority"] == "HIGH"


# ---------------------------------------------------------------------------
# 10. Missing Data Handling Test
# ---------------------------------------------------------------------------
def test_missing_data_handling():
    """Validates that empty inputs or None values do not crash the engine."""
    # None parameters
    res_none = calculate_oee(
        planned_time_hours=None,
        operating_time_hours=None,
        ideal_cycle_time_seconds=None,
        total_units=None,
        good_units=None
    )
    assert res_none.oee == 0.0
    assert res_none.status == "Critical Loss"

    # Empty downtime records
    dt_empty = analyze_downtime([])
    assert dt_empty["total_downtime_hours"] == 0.0
    assert dt_empty["category_breakdown"] == []

    # Empty fleet reliability
    mtbf_empty = analyze_fleet_mtbf([], [])
    assert mtbf_empty["total_failures"] == 0

    mttr_empty = analyze_fleet_mttr([], [])
    assert mttr_empty["total_repairs"] == 0


# ---------------------------------------------------------------------------
# 11. Zero Values & Division-by-Zero Protection Test
# ---------------------------------------------------------------------------
def test_zero_values_and_division_by_zero():
    """Validates robust zero-division protection."""
    # Zero planned time
    assert calculate_availability(10.0, 0.0) == 0.0

    # Zero operating time
    assert calculate_performance(30.0, 100, 0.0) == 0.0

    # Zero total units
    assert calculate_quality(0, 0) == 0.0

    # MTBF with zero failures
    mtbf_z = calculate_machine_mtbf(100.0, 0)
    assert mtbf_z["mtbf_hours"] == 100.0

    # MTTR with zero repairs
    mttr_z = calculate_machine_mttr(10.0, 0)
    assert mttr_z["mttr_hours"] == 0.0


# ---------------------------------------------------------------------------
# 12. Invalid Input Validation Test
# ---------------------------------------------------------------------------
def test_invalid_input_validation():
    """Validates negative values, bounds clamping, and physical consistency."""
    # Negative planned time
    assert calculate_availability(-5.0, -10.0) == 0.0

    # Operating time exceeding planned time must clamp to 1.0 (100%)
    avail_clamped = calculate_availability(12.0, 8.0)
    assert avail_clamped == 1.0

    # Good units exceeding total units must clamp to 1.0 (100%)
    qual_clamped = calculate_quality(600, 500)
    assert qual_clamped == 1.0

    # Negative cycle time or units
    perf_neg = calculate_performance(-30.0, -100, 8.0)
    assert perf_neg == 0.0


# ---------------------------------------------------------------------------
# 13. FastAPI Backend Integration Tests
# ---------------------------------------------------------------------------
client = TestClient(app)


def test_api_health():
    """Validates root and health check endpoints."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_api_get_kpis():
    """Validates GET /api/v1/analytics/kpis endpoint."""
    res = client.get("/api/v1/analytics/kpis")
    assert res.status_code == 200
    data = res.json()
    assert "overallOEE" in data
    assert "availability" in data
    assert "performance" in data
    assert "quality" in data
    assert "totalDowntimeHours" in data
    assert "mtbfHours" in data
    assert "mttrHours" in data
    assert data["totalMachines"] > 0
    assert 0.0 <= data["overallOEE"] <= 100.0


def test_api_get_oee_history():
    """Validates GET /api/v1/analytics/oee endpoint."""
    res = client.get("/api/v1/analytics/oee")
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)
    assert len(history) > 0
    assert "oee" in history[0]
    assert "availability" in history[0]


def test_api_get_downtime():
    """Validates GET /api/v1/analytics/downtime endpoint."""
    res = client.get("/api/v1/analytics/downtime")
    assert res.status_code == 200
    categories = res.json()
    assert isinstance(categories, list)
    assert len(categories) > 0
    assert "category" in categories[0]
    assert "hours" in categories[0]
    assert "percentage" in categories[0]


def test_api_get_reliability():
    """Validates GET /api/v1/analytics/reliability endpoint."""
    res = client.get("/api/v1/analytics/reliability")
    assert res.status_code == 200
    rel = res.json()
    assert "factory_mtbf_hours" in rel
    assert "factory_mttr_hours" in rel
    assert len(rel["machine_mtbf_rankings"]) > 0


def test_api_get_recommendations():
    """Validates GET /api/v1/analytics/recommendations endpoint."""
    res = client.get("/api/v1/analytics/recommendations")
    assert res.status_code == 200
    recs = res.json()
    assert isinstance(recs, list)
    assert len(recs) > 0
    assert recs[0]["engine_source"] == "RULE_BASED"
    assert recs[0]["priority"] in ("HIGH", "MEDIUM", "LOW")


def test_api_simulate_scenario():
    """Validates POST /api/v1/analytics/simulate endpoint."""
    payload = {
        "downtime_reduction_pct": 25.0,
        "speed_improvement_pct": 8.0,
        "scrap_reduction_pct": 20.0,
        "investment_cost_usd": 10000.0,
    }
    res = client.post("/api/v1/analytics/simulate", json=payload)
    assert res.status_code == 200
    sim = res.json()
    assert "baseline" in sim
    assert "simulated" in sim
    assert "delta" in sim
    assert "financial_impact" in sim
    assert sim["delta"]["oee_gain_pct"] >= 0.0
