import { apiClient } from './api';
import type { IndustrialAlert, AlertStatus } from '../types';
import { initialAlerts } from '../data';

const STORAGE_KEY = 'predictx_alerts_data';

function getStoredAlerts(): IndustrialAlert[] {
  if (typeof window === 'undefined') return initialAlerts;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAlerts));
    return initialAlerts;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialAlerts;
  }
}

function saveStoredAlerts(alerts: IndustrialAlert[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }
}

export const alertService = {
  async getAlerts(): Promise<IndustrialAlert[]> {
    try {
      const response = await apiClient.get<IndustrialAlert[]>('/alerts');
      return response.data;
    } catch {
      return getStoredAlerts();
    }
  },

  async updateAlertStatus(id: string, status: AlertStatus, userName: string = 'Dr. Marcus Vance'): Promise<IndustrialAlert> {
    try {
      const response = await apiClient.patch<IndustrialAlert>(`/alerts/${id}`, { status, user: userName });
      return response.data;
    } catch {
      const alerts = getStoredAlerts();
      const index = alerts.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Alert not found');

      const updatedAlert = {
        ...alerts[index],
        status,
        ...(status === 'acknowledged' ? { acknowledgedBy: userName } : {}),
        ...(status === 'resolved' ? { resolvedAt: 'Just now' } : {}),
      };

      alerts[index] = updatedAlert;
      saveStoredAlerts(alerts);
      return updatedAlert;
    }
  },

  async createAlert(alertData: Omit<IndustrialAlert, 'id' | 'timestamp'>): Promise<IndustrialAlert> {
    try {
      const response = await apiClient.post<IndustrialAlert>('/alerts', alertData);
      return response.data;
    } catch {
      const alerts = getStoredAlerts();
      const newAlert: IndustrialAlert = {
        ...alertData,
        id: `ALT-${Math.floor(1100 + Math.random() * 900)}`,
        timestamp: 'Just now',
      };
      const updated = [newAlert, ...alerts];
      saveStoredAlerts(updated);
      return newAlert;
    }
  },
};
