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
