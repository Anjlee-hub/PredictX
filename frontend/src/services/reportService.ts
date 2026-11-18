import { apiClient } from './api';
import type { GeneratedReport, ReportFilterParams } from '../types';
import { initialReports } from '../data';

const STORAGE_KEY = 'predictx_reports_data';

function getStoredReports(): GeneratedReport[] {
  if (typeof window === 'undefined') return initialReports;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReports));
    return initialReports;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialReports;
  }
}

function saveStoredReports(reports: GeneratedReport[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
}

export const reportService = {
  async getReports(): Promise<GeneratedReport[]> {
    try {
      const response = await apiClient.get<GeneratedReport[]>('/reports');
      return response.data;
    } catch {
      return getStoredReports();
    }
  },

  async generateReport(params: ReportFilterParams): Promise<GeneratedReport> {
    try {
      const response = await apiClient.post<GeneratedReport>('/reports/generate', params);
      return response.data;
    } catch {
      const titles: Record<string, string> = {
        machine_health: 'Fleet Health & Anomaly Summary',
        maintenance_audit: 'Predictive Work Order & Cost Audit',
        prediction_anomaly: 'SHAP & XGBoost Predictive Telemetry Log',
        factory_oee: 'Factory OEE, Availability & Quality Review',
        downtime_root_cause: 'Root Cause & Pareto Downtime Classification',
      };

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0] + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newReport: GeneratedReport = {
        id: `REP-${Math.floor(410 + Math.random() * 500)}`,
        title: `${titles[params.type] || 'Fleet Diagnostic Report'} (${params.dateRange.replace(/_/g, ' ')})`,
        type: params.type,
        generatedAt: dateStr,
        generatedBy: 'Dr. Marcus Vance (Director)',
        fileSize: `${(2.1 + Math.random() * 3).toFixed(1)} MB`,
        status: 'ready',
        recordCount: Math.floor(40 + Math.random() * 150),
        period: params.dateRange.replace(/_/g, ' ').toUpperCase(),
        summary: `Autonomous intelligence synthesis for ${params.factory || 'All Global Facilities'}. Zero unclassified exceptions.`,
      };

      const stored = getStoredReports();
      saveStoredReports([newReport, ...stored]);
      return newReport;
    }
  },

  async deleteReport(id: string): Promise<void> {
    try {
      await apiClient.delete(`/reports/${id}`);
    } catch {
      const stored = getStoredReports();
      const filtered = stored.filter((r) => r.id !== id);
      saveStoredReports(filtered);
    }
  },
};
