import { apiClient } from './api';
import type { PredictionInput, PredictionResult } from '../types';
import { initialPredictions } from '../data';
import { runInference } from '../utils/predictionEngine';

const STORAGE_KEY = 'predictx_predictions_data';

function getStoredPredictions(): PredictionResult[] {
  if (typeof window === 'undefined') return initialPredictions;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPredictions));
    return initialPredictions;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialPredictions;
  }
}

function saveStoredPredictions(predictions: PredictionResult[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
  }
}

export const predictionService = {
  async predict(input: PredictionInput, machineName: string = 'Industrial Machine'): Promise<PredictionResult> {
    try {
      const response = await apiClient.post<PredictionResult>('/predict', input);
      const res = response.data;
      const stored = getStoredPredictions();
      saveStoredPredictions([res, ...stored]);
      return res;
    } catch {
      // High-precision ML physics inference mock engine
      const res = runInference(input, machineName);
      const stored = getStoredPredictions();
      saveStoredPredictions([res, ...stored]);
      return res;
    }
  },

  async getHistory(): Promise<PredictionResult[]> {
    try {
      const response = await apiClient.get<PredictionResult[]>('/predict/history');
      return response.data;
    } catch {
      return getStoredPredictions();
    }
  },

  async getShapExplanations(predictionId?: string): Promise<PredictionResult> {
    const list = getStoredPredictions();
    if (predictionId) {
      const found = list.find((p) => p.id === predictionId);
      if (found) return found;
    }
    return list[0] || initialPredictions[0];
  },
};
