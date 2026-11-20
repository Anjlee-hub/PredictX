import { apiClient } from './api';
import type { MaintenanceRecord } from '../types';
import { initialMaintenanceRecords, mockEngineers } from '../data';

const STORAGE_KEY = 'predictx_maintenance_data';

function getStoredMaintenance(): MaintenanceRecord[] {
  if (typeof window === 'undefined') return initialMaintenanceRecords;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMaintenanceRecords));
    return initialMaintenanceRecords;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialMaintenanceRecords;
  }
}

function saveStoredMaintenance(records: MaintenanceRecord[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}

export const maintenanceService = {
  async getRecords(): Promise<MaintenanceRecord[]> {
    try {
      const response = await apiClient.get<MaintenanceRecord[]>('/maintenance');
      return response.data;
    } catch {
      return getStoredMaintenance();
    }
  },

  async createRecord(recordData: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    try {
      const response = await apiClient.post<MaintenanceRecord>('/maintenance', recordData);
      return response.data;
    } catch {
      const records = getStoredMaintenance();
      const newRecord: MaintenanceRecord = {
        ...recordData,
        id: `WO-${Math.floor(8050 + Math.random() * 500)}`,
      };
      const updated = [newRecord, ...records];
      saveStoredMaintenance(updated);
      return newRecord;
    }
  },

  async updateRecord(id: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    try {
      const response = await apiClient.put<MaintenanceRecord>(`/maintenance/${id}`, updates);
      return response.data;
    } catch {
      const records = getStoredMaintenance();
      const index = records.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Work order not found');

      const updated = { ...records[index], ...updates };
      records[index] = updated;
      saveStoredMaintenance(records);
      return updated;
    }
  },

  async deleteRecord(id: string): Promise<void> {
    try {
      await apiClient.delete(`/maintenance/${id}`);
    } catch {
      const records = getStoredMaintenance();
      const filtered = records.filter((r) => r.id !== id);
      saveStoredMaintenance(filtered);
    }
  },

  getEngineers() {
    return mockEngineers;
  },
};
