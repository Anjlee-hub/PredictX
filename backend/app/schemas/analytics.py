"""
PredictX Backend - Pydantic Schemas for Factory Analytics API
Strict input validation and output serialization conforming to frontend interfaces.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class FactoryKPIsResponse(BaseModel):
    """Factory-level KPIs matching the frontend FactoryKPIs interface."""
    totalMachines: int = Field(..., description="Total active monitored machines in fleet")
    healthyMachines: int = Field(..., description="Machines in optimal condition")
    warningMachines: int = Field(..., description="Machines in warning state")
    criticalMachines: int = Field(..., description="Machines in critical alert state")
    offlineMachines: int = Field(..., description="Machines currently stopped/offline")
    maintenanceDue: int = Field(..., description="Machines requiring scheduled maintenance")
    overallOEE: float = Field(..., description="Combined OEE percentage (0-100%)")
    availability: float = Field(..., description="Availability percentage (0-100%)")
    performance: float = Field(..., description="Performance percentage (0-100%)")
    quality: float = Field(..., description="Quality rate percentage (0-100%)")
    totalDowntimeHours: float = Field(..., description="Total operational downtime in hours")
    mtbfHours: float = Field(..., description="Mean Time Between Failures in hours")
    mttrHours: float = Field(..., description="Mean Time To Repair in hours")
    totalUnits: int = Field(0, description="Total units produced")
    goodUnits: int = Field(0, description="Good conforming parts produced")
    rejectedUnits: int = Field(0, description="Defective scrap parts produced")
    todayAlertsCount: int = Field(8, description="Active alerts today")
    activePredictionsCount: int = Field(18, description="Active failure predictions")
    productionEfficiency: float = Field(94.1, description="Line schedule adherence %")
    energyUsageKwh: float = Field(124850.0, description="Facility energy usage")
    machineUtilization: float = Field(86.3, description="Fleet average utilization rate %")


class OeeHistoryEntry(BaseModel):
    """Daily or shift OEE time-series entry."""
    date: str
    oee: float
    availability: float
    performance: float
    quality: float
    target: float = 85.0


class MachinePerformanceResponse(BaseModel):
    """Machine-level OEE and production breakdown."""
    machine_id: str
    machine_name: str
    machine_type: str = "Industrial Asset"
    oee: float
    availability: float
    performance: float
    quality: float
    total_units: int
    good_units: int
    rejected_units: int
    downtime_hours: float
    status: str


class DowntimeCategoryResponse(BaseModel):
    """Downtime Pareto category item."""
    category: str
    hours: float
    percentage: float
    incidents: int
    costImpact: float


class DowntimeSummaryResponse(BaseModel):
    """Aggregated downtime analysis response."""
    total_downtime_hours: float
    total_incidents: int
    total_cost_impact: float
    total_lost_units: int
    category_breakdown: List[DowntimeCategoryResponse]
    machine_breakdown: List[Dict[str, Any]]
    frequent_downtime_machines: List[Dict[str, Any]]
    daily_trend: List[Dict[str, Any]]
    weekly_trend: List[Dict[str, Any]]


class ReliabilityMetricsResponse(BaseModel):
    """MTBF and MTTR fleet reliability response."""
    factory_mtbf_hours: float
    factory_mttr_hours: float
    factory_mttr_minutes: float
    total_operating_hours: float
    total_repair_hours: float
    total_failures: int
    total_repairs: int
    machine_mtbf_rankings: List[Dict[str, Any]]
    machine_mttr_rankings: List[Dict[str, Any]]
    frequent_failure_machines: List[Dict[str, Any]]
    prolonged_repair_machines: List[Dict[str, Any]]


class MaintenanceRecommendationResponse(BaseModel):
    """Actionable decision intelligence recommendation."""
    machine_id: str
    machine_name: str
    problem: str
    metric: str
    observed_value: float
    unit: str
    threshold: float
    explanation: str
    action: str
    priority: str = Field(..., description="HIGH | MEDIUM | LOW")
    engine_source: str = "RULE_BASED"
    ml_augmented: bool = False
    ml_risk_score: Optional[float] = None


class SimulationRequest(BaseModel):
    """What-if scenario parameters."""
    downtime_reduction_pct: float = Field(20.0, ge=0.0, le=100.0)
    speed_improvement_pct: float = Field(5.0, ge=0.0, le=100.0)
    scrap_reduction_pct: float = Field(25.0, ge=0.0, le=100.0)
    investment_cost_usd: float = Field(15000.0, ge=0.0)


class SimulationResponse(BaseModel):
    """What-if simulation result."""
    baseline: Dict[str, Any]
    simulated: Dict[str, Any]
    delta: Dict[str, Any]
    financial_impact: Dict[str, Any]
