import { apiClient } from './api';
import type {
  FactoryKPIs,
  DowntimeCategory,
  OeeHistoryEntry,
  ProductionTrendEntry,
  FailureTrendEntry,
  MachineUtilizationCell,
} from '../types';
import {
  mockFactoryKPIs,
  mockDowntimeCategories,
  mockOeeHistory,
  mockProductionTrend,
  mockFailureTrend,
  mockUtilizationHeatmap,
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

  async getDowntimeBreakdown(): Promise<DowntimeCategory[]> {
    try {
      const response = await apiClient.get<DowntimeCategory[]>('/analytics/downtime');
      return response.data;
    } catch {
      return mockDowntimeCategories;
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
