import { apiClient } from './api';
import type {
  FactoryKPIs,
  DowntimeCategory,
  OeeHistoryEntry,
  ProductionTrendEntry,
  FailureTrendEntry,
  MachineUtilizationCell,
  MaintenanceRecommendation,
  MachinePerformanceRecord,
  ReliabilityOverview,
  SimulationParams,
  SimulationResult,
} from '../types';
import {
  mockFactoryKPIs,
  mockDowntimeCategories,
  mockOeeHistory,
  mockProductionTrend,
  mockFailureTrend,
  mockUtilizationHeatmap,
  mockMaintenanceRecommendations,
  mockMachinePerformanceList,
  mockReliabilityOverview,
} from '../data';

export const analyticsService = {
  async getKPIs(): Promise<FactoryKPIs> {
    try {
      const response = await apiClient.get<FactoryKPIs>('/analytics/kpis');
      return response.data;
    } catch {
      return mockFactoryKPIs;
    }
  },

  async getOeeHistory(): Promise<OeeHistoryEntry[]> {
    try {
      const response = await apiClient.get<OeeHistoryEntry[]>('/analytics/oee');
      return response.data;
    } catch {
      return mockOeeHistory;
    }
  },

  async getMachinePerformance(): Promise<MachinePerformanceRecord[]> {
    try {
      const response = await apiClient.get<MachinePerformanceRecord[]>('/analytics/machines');
      return response.data;
    } catch {
      return mockMachinePerformanceList;
    }
  },

  async getDowntimeBreakdown(): Promise<DowntimeCategory[]> {
    try {
      const response = await apiClient.get<DowntimeCategory[]>('/analytics/downtime');
      return response.data;
    } catch {
      return mockDowntimeCategories;
    }
  },

  async getReliability(): Promise<ReliabilityOverview> {
    try {
      const response = await apiClient.get<ReliabilityOverview>('/analytics/reliability');
      return response.data;
    } catch {
      return mockReliabilityOverview;
    }
  },

  async getRecommendations(): Promise<MaintenanceRecommendation[]> {
    try {
      const response = await apiClient.get<MaintenanceRecommendation[]>('/analytics/recommendations');
      return response.data;
    } catch {
      return mockMaintenanceRecommendations;
    }
  },

  async runSimulation(params: SimulationParams): Promise<SimulationResult | null> {
    try {
      const response = await apiClient.post<SimulationResult>('/analytics/simulate', params);
      return response.data;
    } catch {
      return null;
    }
  },

  async getProductionTrends(): Promise<ProductionTrendEntry[]> {
    try {
      const response = await apiClient.get<ProductionTrendEntry[]>('/analytics/production');
      return response.data;
    } catch {
      return mockProductionTrend;
    }
  },

  async getFailureTrends(): Promise<FailureTrendEntry[]> {
    try {
      const response = await apiClient.get<FailureTrendEntry[]>('/analytics/failures');
      return response.data;
    } catch {
      return mockFailureTrend;
    }
  },

  async getUtilizationHeatmap(): Promise<MachineUtilizationCell[]> {
    try {
      const response = await apiClient.get<MachineUtilizationCell[]>('/analytics/heatmap');
      return response.data;
    } catch {
      return mockUtilizationHeatmap;
    }
  },
};
