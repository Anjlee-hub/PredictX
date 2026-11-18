import { apiClient } from './api';
import type { Machine, SensorReading } from '../types';
import { initialMachines } from '../data';

const STORAGE_KEY = 'predictx_machines_data';

function getStoredMachines(): Machine[] {
  if (typeof window === 'undefined') return initialMachines;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMachines));
    return initialMachines;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialMachines;
  }
}

function saveStoredMachines(machines: Machine[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(machines));
  }
}

export const machineService = {
  async getMachines(): Promise<Machine[]> {
    try {
      const response = await apiClient.get<Machine[]>('/machines');
      return response.data;
    } catch {
      return getStoredMachines();
    }
  },

  async getMachineById(id: string): Promise<Machine | undefined> {
    try {
      const response = await apiClient.get<Machine>(`/machines/${id}`);
      return response.data;
    } catch {
      const machines = getStoredMachines();
      return machines.find((m) => m.id === id);
    }
  },

  async addMachine(machineData: Omit<Machine, 'id' | 'sensorHistory'>): Promise<Machine> {
    try {
      const response = await apiClient.post<Machine>('/machines', machineData);
      return response.data;
    } catch {
      const machines = getStoredMachines();
      const newId = `MAC-${String(machines.length + 1).padStart(3, '0')}`;
      const now = new Date();
      const initialHistory: SensorReading[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (23 - i) * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        airTemperature: machineData.airTemperature,
        processTemperature: machineData.processTemperature,
        rotationalSpeed: machineData.rpm,
        torque: machineData.torque,
        toolWear: machineData.toolWear,
        vibration: 1.25,
        pressure: 6.0,
      }));

      const newMachine: Machine = {
        ...machineData,
        id: newId,
        sensorHistory: initialHistory,
      };

      const updated = [newMachine, ...machines];
      saveStoredMachines(updated);
      return newMachine;
    }
  },

  async updateMachine(id: string, updates: Partial<Machine>): Promise<Machine> {
    try {
      const response = await apiClient.put<Machine>(`/machines/${id}`, updates);
      return response.data;
    } catch {
      const machines = getStoredMachines();
      const index = machines.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Machine not found');
      
      const updatedMachine = { ...machines[index], ...updates };
      machines[index] = updatedMachine;
      saveStoredMachines(machines);
      return updatedMachine;
    }
  },

  async deleteMachine(id: string): Promise<void> {
    try {
      await apiClient.delete(`/machines/${id}`);
    } catch {
      const machines = getStoredMachines();
      const filtered = machines.filter((m) => m.id !== id);
      saveStoredMachines(filtered);
    }
  },

  async resetToDefaults(): Promise<Machine[]> {
    saveStoredMachines(initialMachines);
    return initialMachines;
  },
};
