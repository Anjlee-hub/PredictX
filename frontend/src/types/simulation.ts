export interface SimulationScenario {
  id: string;
  name: string;
  machineId: string;
  machineName: string;
  maintenanceDate: string;
  downtimeHours: number;
  expectedRepairTimeHours: number;
  speedAdjustmentPercent: number; // e.g. -10% or +5%
  lubricationFrequencyDays: number;
  // Computed outputs
  estimatedOEE: number;
  baselineOEE: number;
  productionGainUnits: number;
  downtimeSavedHours: number;
  costSavedDollars: number;
  failureRiskReduction: number; // percentage
  recommendation: string;
  createdAt: string;
}
