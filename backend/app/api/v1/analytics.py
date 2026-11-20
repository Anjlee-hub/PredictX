"""
PredictX Backend - Factory Analytics REST API Endpoints
FastAPI Router serving OEE, Downtime, MTBF/MTTR reliability, and Decision Intelligence recommendations.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status

from ...schemas.analytics import (
    FactoryKPIsResponse,
    OeeHistoryEntry,
    MachinePerformanceResponse,
    DowntimeCategoryResponse,
    DowntimeSummaryResponse,
    ReliabilityMetricsResponse,
    MaintenanceRecommendationResponse,
    SimulationRequest,
    SimulationResponse,
)
from ...services.analytics_service import analytics_service

router = APIRouter(
    prefix="/analytics",
    tags=["Factory Analytics & Decision Intelligence"]
)


@router.get(
    "/kpis",
    response_model=FactoryKPIsResponse,
    summary="Get Factory Overview KPIs",
    description="Returns aggregate factory-level metrics including Overall OEE, Availability, Performance, Quality, Downtime, MTBF, and MTTR."
)
async def get_kpis() -> FactoryKPIsResponse:
    try:
        data = analytics_service.get_factory_kpis()
        return FactoryKPIsResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate factory KPIs: {str(e)}"
        )


@router.get(
    "/oee",
    response_model=List[OeeHistoryEntry],
    summary="Get OEE Trend History",
    description="Returns daily OEE time-series trend with Availability, Performance, and Quality components."
)
async def get_oee_history() -> List[OeeHistoryEntry]:
    try:
        data = analytics_service.get_oee_history()
        return [OeeHistoryEntry(**item) for item in data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve OEE history: {str(e)}"
        )


@router.get(
    "/machines",
    response_model=List[MachinePerformanceResponse],
    summary="Get Machine-Wise OEE Breakdown",
    description="Returns individual machine OEE, downtime hours, total units, and operational status."
)
async def get_machines_oee() -> List[MachinePerformanceResponse]:
    try:
        data = analytics_service.get_machine_wise_oee()
        return [MachinePerformanceResponse(**item) for item in data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate machine-wise OEE: {str(e)}"
        )


@router.get(
    "/downtime",
    response_model=List[DowntimeCategoryResponse],
    summary="Get Downtime Categories Breakdown",
    description="Returns Pareto breakdown of stoppage reasons with hours, percentages, and financial impact."
)
async def get_downtime_breakdown() -> List[DowntimeCategoryResponse]:
    try:
        data = analytics_service.get_downtime_categories()
        return [DowntimeCategoryResponse(**item) for item in data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze downtime categories: {str(e)}"
        )


@router.get(
    "/downtime/summary",
    response_model=DowntimeSummaryResponse,
    summary="Get Comprehensive Downtime Intelligence Summary",
    description="Returns total stoppage hours, machine comparisons, frequent offenders, and daily/weekly trends."
)
async def get_downtime_summary() -> DowntimeSummaryResponse:
    try:
        data = analytics_service.get_downtime_summary()
        return DowntimeSummaryResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve downtime summary: {str(e)}"
        )


@router.get(
    "/reliability",
    response_model=ReliabilityMetricsResponse,
    summary="Get MTBF and MTTR Reliability Metrics",
    description="Returns Mean Time Between Failures (MTBF) and Mean Time To Repair (MTTR) fleet rankings."
)
async def get_reliability() -> ReliabilityMetricsResponse:
    try:
        data = analytics_service.get_reliability_metrics()
        return ReliabilityMetricsResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate reliability metrics: {str(e)}"
        )


@router.get(
    "/recommendations",
    response_model=List[MaintenanceRecommendationResponse],
    summary="Get Decision Intelligence Maintenance Recommendations",
    description="Generates prioritized, rule-based corrective maintenance actions derived from factory telemetry."
)
async def get_recommendations() -> List[MaintenanceRecommendationResponse]:
    try:
        data = analytics_service.get_maintenance_recommendations()
        return [MaintenanceRecommendationResponse(**item) for item in data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate maintenance recommendations: {str(e)}"
        )


@router.post(
    "/simulate",
    response_model=SimulationResponse,
    summary="Run What-If Operational Simulation",
    description="Simulates the OEE and financial impact of targeted downtime, speed, and scrap reduction initiatives."
)
async def simulate_scenario(payload: SimulationRequest) -> SimulationResponse:
    try:
        data = analytics_service.run_simulation(
            downtime_reduction_pct=payload.downtime_reduction_pct,
            speed_improvement_pct=payload.speed_improvement_pct,
            scrap_reduction_pct=payload.scrap_reduction_pct,
            investment_cost_usd=payload.investment_cost_usd
        )
        return SimulationResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation error: {str(e)}"
        )
