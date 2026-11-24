export interface FactoryKPIs {
  totalMachines: number;
  healthyMachines: number;
  criticalMachines: number;
  warningMachines: number;
  offlineMachines: number;
  maintenanceDue: number;
  overallOEE: number;         // percentage
  availability: number;       // percentage
  performance: number;        // percentage
  quality: number;            // percentage
  totalDowntimeHours: number; // hours
  mtbfHours: number;          // Mean Time Between Failures
  mttrHours: number;          // Mean Time To Repair
  todayAlertsCount: number;
  activePredictionsCount: number;
  productionEfficiency: number;
  energyUsageKwh: number;
  machineUtilization: number;
  totalUnits?: number;
  goodUnits?: number;
  rejectedUnits?: number;
}

export interface DowntimeCategory {
  category: string;
  hours: number;
  percentage: number;
  incidents: number;
  costImpact: number;
}

export interface OeeHistoryEntry {
  date: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  target: number;
}

export interface ProductionTrendEntry {
  time: string;
  actualUnits: number;
  targetUnits: number;
  scrapUnits: number;
}

export interface FailureTrendEntry {
  month: string;
  incidents: number;
  preventedByAI: number;
  criticalEvents: number;
}

export interface MachineUtilizationCell {
  machineId: string;
  machineName: string;
  day: string;
  shift: 'Shift 1' | 'Shift 2' | 'Shift 3';
  utilizationRate: number; // 0 - 100%
  status: 'optimal' | 'moderate' | 'low';
}

export interface MaintenanceRecommendation {
  machine_id: string;
  machine_name: string;
  problem: string;
  metric: string;
  observed_value: number;
  unit: string;
  threshold: number;
  explanation: string;
  action: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  engine_source: string;
  ml_augmented?: boolean;
  ml_risk_score?: number;
}

export interface MachinePerformanceRecord {
  machine_id: string;
  machine_name: string;
  machine_type: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  total_units: number;
  good_units: number;
  rejected_units: number;
  downtime_hours: number;
  status: string;
}

export interface ReliabilityOverview {
  factory_mtbf_hours: number;
  factory_mttr_hours: number;
  factory_mttr_minutes: number;
  total_operating_hours: number;
  total_repair_hours: number;
  total_failures: number;
  total_repairs: number;
  machine_mtbf_rankings: Array<{
    machine_id: string;
    machine_name: string;
    operating_time_hours: number;
    failure_count: number;
    mtbf_hours: number;
    mtbf_display: string;
    status: string;
    reliability_tier: string;
  }>;
  machine_mttr_rankings: Array<{
    machine_id: string;
    machine_name: string;
    total_repair_time_hours: number;
    repair_count: number;
    mttr_hours: number;
    mttr_minutes: number;
    mttr_display: string;
    status: string;
    maintainability_tier: string;
  }>;
  frequent_failure_machines: Array<any>;
  prolonged_repair_machines: Array<any>;
}

export interface SimulationParams {
  downtime_reduction_pct: number;
  speed_improvement_pct: number;
  scrap_reduction_pct: number;
  investment_cost_usd: number;
}

export interface SimulationResult {
  baseline: {
    oee_pct: number;
    availability_pct: number;
    performance_pct: number;
    quality_pct: number;
    operating_hours: number;
    downtime_hours: number;
    total_units: number;
    good_units: number;
    rejected_units: number;
  };
  simulated: {
    oee_pct: number;
    availability_pct: number;
    performance_pct: number;
    quality_pct: number;
    operating_hours: number;
    downtime_hours: number;
    total_units: number;
    good_units: number;
    rejected_units: number;
  };
  delta: {
    oee_gain_pct: number;
    availability_gain_pct: number;
    performance_gain_pct: number;
    quality_gain_pct: number;
    additional_good_units: number;
    recovered_downtime_hours: number;
  };
  financial_impact: {
    gross_margin_gain_usd: number;
    overhead_savings_usd: number;
    total_benefit_usd: number;
    investment_cost_usd: number;
    net_roi_pct: number;
    payback_months: number;
  };
}
