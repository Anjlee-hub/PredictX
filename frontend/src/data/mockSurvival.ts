export interface SurvivalCurvePoint {
  hours: number;
  survivalProbability: number; // 0 to 1 (or 0 to 100%)
  confidenceUpper: number;
  confidenceLower: number;
  hazardRate: number; // events per 1000 operating hours
}

export interface SurvivalMilestone {
  timeHours: number;
  event: string;
  probability: number;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
}

export const mockSurvivalCurve: SurvivalCurvePoint[] = [
  { hours: 0, survivalProbability: 100, confidenceUpper: 100, confidenceLower: 100, hazardRate: 0.05 },
  { hours: 250, survivalProbability: 98.5, confidenceUpper: 99.8, confidenceLower: 96.2, hazardRate: 0.12 },
  { hours: 500, survivalProbability: 96.2, confidenceUpper: 98.4, confidenceLower: 93.5, hazardRate: 0.22 },
  { hours: 750, survivalProbability: 93.4, confidenceUpper: 96.1, confidenceLower: 89.8, hazardRate: 0.38 },
  { hours: 1000, survivalProbability: 89.8, confidenceUpper: 93.2, confidenceLower: 85.4, hazardRate: 0.65 },
  { hours: 1250, survivalProbability: 84.1, confidenceUpper: 88.5, confidenceLower: 78.9, hazardRate: 1.15 },
  { hours: 1500, survivalProbability: 76.5, confidenceUpper: 81.9, confidenceLower: 70.2, hazardRate: 1.85 },
  { hours: 1750, survivalProbability: 65.8, confidenceUpper: 72.0, confidenceLower: 58.7, hazardRate: 2.90 },
  { hours: 2000, survivalProbability: 52.4, confidenceUpper: 59.8, confidenceLower: 44.5, hazardRate: 4.45 },
  { hours: 2250, survivalProbability: 38.6, confidenceUpper: 46.2, confidenceLower: 30.8, hazardRate: 6.80 },
  { hours: 2500, survivalProbability: 24.1, confidenceUpper: 31.5, confidenceLower: 17.2, hazardRate: 9.95 },
  { hours: 2750, survivalProbability: 12.8, confidenceUpper: 18.9, confidenceLower: 7.8, hazardRate: 14.50 },
  { hours: 3000, survivalProbability: 5.2, confidenceUpper: 9.4, confidenceLower: 2.1, hazardRate: 21.00 },
];

export const mockSurvivalMilestones: SurvivalMilestone[] = [
  {
    timeHours: 500,
    event: 'Infant Mortality Phase Concluded (Run-in)',
    probability: 96.2,
    impactLevel: 'low',
    recommendedAction: 'Verify baseline oil spectrograph and vibration spectrum calibration.',
  },
  {
    timeHours: 1250,
    event: 'Mid-Life Steady State Wear Horizon',
    probability: 84.1,
    impactLevel: 'medium',
    recommendedAction: 'Schedule precision dynamic laser alignment and thermal imaging check.',
  },
  {
    timeHours: 1850,
    event: 'B10 Life Limit Reached (10% Fleet Failure Threshold)',
    probability: 60.5,
    impactLevel: 'high',
    recommendedAction: 'Replace high-cycle carbide tool assemblies and inspect drive gear mesh teeth.',
  },
  {
    timeHours: 2000,
    event: 'Median Survival Time (B50 Life)',
    probability: 52.4,
    impactLevel: 'critical',
    recommendedAction: 'Perform comprehensive overhaul of main spindle bearings and harmonic seals.',
  },
  {
    timeHours: 2500,
    event: 'Wearout / End-of-Life Accelerating Degradation',
    probability: 24.1,
    impactLevel: 'critical',
    recommendedAction: 'Decommission or full factory refurbishment to prevent catastrophic seizure.',
  },
];
