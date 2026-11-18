import type {
  FactoryKPIs,
  DowntimeCategory,
  OeeHistoryEntry,
  ProductionTrendEntry,
  FailureTrendEntry,
  MachineUtilizationCell,
} from '../types';

export const mockFactoryKPIs: FactoryKPIs = {
  totalMachines: 50,
  healthyMachines: 39,
  criticalMachines: 4,
  warningMachines: 6,
  offlineMachines: 1,
  maintenanceDue: 7,
  overallOEE: 84.6,
  availability: 91.2,
  performance: 88.4,
  quality: 98.6,
  totalDowntimeHours: 14.2,
  mtbfHours: 342,
  mttrHours: 2.4,
  todayAlertsCount: 8,
  activePredictionsCount: 18,
  productionEfficiency: 94.1,
  energyUsageKwh: 124850,
  machineUtilization: 86.3,
};

export const mockOeeHistory: OeeHistoryEntry[] = [
  { date: 'Mon', oee: 81.2, availability: 89.0, performance: 85.0, quality: 97.8, target: 85.0 },
  { date: 'Tue', oee: 83.5, availability: 90.4, performance: 86.8, quality: 98.2, target: 85.0 },
  { date: 'Wed', oee: 85.1, availability: 92.1, performance: 88.5, quality: 98.4, target: 85.0 },
  { date: 'Thu', oee: 82.9, availability: 89.8, performance: 87.1, quality: 98.1, target: 85.0 },
  { date: 'Fri', oee: 86.4, availability: 93.0, performance: 89.6, quality: 98.8, target: 85.0 },
  { date: 'Sat', oee: 87.2, availability: 94.2, performance: 90.1, quality: 99.0, target: 85.0 },
  { date: 'Sun', oee: 84.6, availability: 91.2, performance: 88.4, quality: 98.6, target: 85.0 },
];

export const mockDowntimeCategories: DowntimeCategory[] = [
  { category: 'Tool Breakage & Insert Wear', hours: 4.8, percentage: 33.8, incidents: 6, costImpact: 9600 },
  { category: 'Thermal Overheating (ΔT Collapse)', hours: 3.2, percentage: 22.5, incidents: 4, costImpact: 6400 },
  { category: 'Mechanical Jam & Material Clog', hours: 2.6, percentage: 18.3, incidents: 3, costImpact: 5200 },
  { category: 'Spindle & Motor Electrical Trip', hours: 1.9, percentage: 13.4, incidents: 2, costImpact: 3800 },
  { category: 'Die Setup & Tool Changeover', hours: 1.7, percentage: 12.0, incidents: 5, costImpact: 2100 },
];

export const mockProductionTrend: ProductionTrendEntry[] = [
  { time: '06:00', actualUnits: 420, targetUnits: 450, scrapUnits: 8 },
  { time: '08:00', actualUnits: 490, targetUnits: 480, scrapUnits: 6 },
  { time: '10:00', actualUnits: 512, targetUnits: 500, scrapUnits: 7 },
  { time: '12:00', actualUnits: 478, targetUnits: 490, scrapUnits: 12 },
  { time: '14:00', actualUnits: 530, targetUnits: 500, scrapUnits: 5 },
  { time: '16:00', actualUnits: 515, targetUnits: 510, scrapUnits: 8 },
  { time: '18:00', actualUnits: 495, targetUnits: 500, scrapUnits: 9 },
  { time: '20:00', actualUnits: 480, targetUnits: 480, scrapUnits: 6 },
  { time: '22:00', actualUnits: 460, targetUnits: 470, scrapUnits: 11 },
];

export const mockFailureTrend: FailureTrendEntry[] = [
  { month: 'Jun', incidents: 14, preventedByAI: 18, criticalEvents: 3 },
  { month: 'Jul', incidents: 11, preventedByAI: 22, criticalEvents: 2 },
  { month: 'Aug', incidents: 9, preventedByAI: 26, criticalEvents: 1 },
  { month: 'Sep', incidents: 8, preventedByAI: 29, criticalEvents: 2 },
  { month: 'Oct', incidents: 6, preventedByAI: 34, criticalEvents: 1 },
  { month: 'Nov', incidents: 4, preventedByAI: 38, criticalEvents: 0 },
];

export const mockUtilizationHeatmap: MachineUtilizationCell[] = [
  { machineId: 'MAC-001', machineName: 'Milling Unit 01', day: 'Mon', shift: 'Shift 1', utilizationRate: 94, status: 'optimal' },
  { machineId: 'MAC-001', machineName: 'Milling Unit 01', day: 'Mon', shift: 'Shift 2', utilizationRate: 91, status: 'optimal' },
  { machineId: 'MAC-001', machineName: 'Milling Unit 01', day: 'Mon', shift: 'Shift 3', utilizationRate: 78, status: 'moderate' },
  { machineId: 'MAC-002', machineName: 'Lathe Unit 02', day: 'Mon', shift: 'Shift 1', utilizationRate: 88, status: 'optimal' },
  { machineId: 'MAC-002', machineName: 'Lathe Unit 02', day: 'Mon', shift: 'Shift 2', utilizationRate: 82, status: 'moderate' },
  { machineId: 'MAC-002', machineName: 'Lathe Unit 02', day: 'Mon', shift: 'Shift 3', utilizationRate: 64, status: 'low' },
  { machineId: 'MAC-004', machineName: 'Gas Turbine 04', day: 'Mon', shift: 'Shift 1', utilizationRate: 42, status: 'low' },
  { machineId: 'MAC-004', machineName: 'Gas Turbine 04', day: 'Mon', shift: 'Shift 2', utilizationRate: 35, status: 'low' },
  { machineId: 'MAC-004', machineName: 'Gas Turbine 04', day: 'Mon', shift: 'Shift 3', utilizationRate: 0, status: 'low' },
  { machineId: 'MAC-012', machineName: 'Laser Cell 12', day: 'Mon', shift: 'Shift 1', utilizationRate: 72, status: 'moderate' },
  { machineId: 'MAC-012', machineName: 'Laser Cell 12', day: 'Mon', shift: 'Shift 2', utilizationRate: 68, status: 'moderate' },
  { machineId: 'MAC-012', machineName: 'Laser Cell 12', day: 'Mon', shift: 'Shift 3', utilizationRate: 50, status: 'low' },
  { machineId: 'MAC-023', machineName: 'Hydraulic Press 23', day: 'Mon', shift: 'Shift 1', utilizationRate: 58, status: 'moderate' },
  { machineId: 'MAC-023', machineName: 'Hydraulic Press 23', day: 'Mon', shift: 'Shift 2', utilizationRate: 45, status: 'low' },
  { machineId: 'MAC-023', machineName: 'Hydraulic Press 23', day: 'Mon', shift: 'Shift 3', utilizationRate: 0, status: 'low' },
];
