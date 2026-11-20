import type { RiskLevel } from './machine';

export type FailureMode = 
  | 'No Failure'
  | 'Tool Wear Failure (TWF)'
  | 'Heat Dissipation Failure (HDF)'
  | 'Power Failure (PWF)'
  | 'Overstrain Failure (OSF)'
  | 'Random Failures (RNF)';

export interface PredictionInput {
  machineId: string;
  airTemperature: number;
  processTemperature: number;
  rpm: number;
  torque: number;
  toolWear: number;
}

export interface ShapContribution {
  feature: string;
  label: string;
  value: number;
  unit: string;
  shapValue: number; // positive = pushes to failure, negative = pulls toward healthy
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface PredictionResult {
  id: string;
  machineId: string;
  machineName: string;
  failureProbability: number; // 0 - 100%
  riskCategory: RiskLevel;
  confidence: number;         // 0 - 100%
  predictionTime: string;
  recommendation: string;
  failureMode: FailureMode;
  estimatedRULHours: number;  // Remaining Useful Life
  shapValues: ShapContribution[];
  inputValues: PredictionInput;
}
