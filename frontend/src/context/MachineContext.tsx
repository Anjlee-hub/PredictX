/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Machine } from '../types';
import { machineService } from '../services';
import toast from 'react-hot-toast';

interface MachineContextType {
  machines: Machine[];
  isLoading: boolean;
  selectedMachine: Machine | null;
  setSelectedMachine: (machine: Machine | null) => void;
  getMachineById: (id: string) => Machine | undefined;
  addMachine: (data: Omit<Machine, 'id' | 'sensorHistory'>) => Promise<Machine>;
  updateMachine: (id: string, updates: Partial<Machine>) => Promise<Machine>;
  deleteMachine: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  refreshMachines: () => Promise<void>;
}

const MachineContext = createContext<MachineContextType | undefined>(undefined);

export const MachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const fetchMachines = async () => {
    try {
      const data = await machineService.getMachines();
      setMachines(data);
    } catch (err) {
      console.error('Failed to load machines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadMachines = async () => {
      try {
        const data = await machineService.getMachines();
        if (isMounted) {
          setMachines(data);
        }
      } catch (err) {
        console.error('Failed to load machines:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadMachines();
    return () => {
      isMounted = false;
    };
  }, []);

  const getMachineById = (id: string): Machine | undefined => {
    return machines.find((m) => m.id === id);
  };

  const addMachine = async (data: Omit<Machine, 'id' | 'sensorHistory'>): Promise<Machine> => {
    try {
      const created = await machineService.addMachine(data);
      setMachines((prev) => [created, ...prev]);
      toast.success(`Machine ${created.name} (${created.id}) registered`);
      return created;
    } catch {
      toast.error('Failed to add machine');
      throw new Error('Failed to add machine');
    }
  };

  const updateMachine = async (id: string, updates: Partial<Machine>): Promise<Machine> => {
    try {
      const updated = await machineService.updateMachine(id, updates);
      setMachines((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (selectedMachine?.id === id) {
        setSelectedMachine(updated);
      }
      toast.success(`Machine ${id} parameters updated`);
      return updated;
    } catch {
      toast.error('Failed to update machine');
      throw new Error('Failed to update machine');
    }
  };

  const deleteMachine = async (id: string): Promise<void> => {
    try {
      await machineService.deleteMachine(id);
      setMachines((prev) => prev.filter((m) => m.id !== id));
      if (selectedMachine?.id === id) {
        setSelectedMachine(null);
      }
      toast.success(`Machine ${id} decommissioned`);
    } catch {
      toast.error('Failed to delete machine');
      throw new Error('Failed to delete machine');
    }
  };

  const resetToDefaults = async () => {
    try {
      const reset = await machineService.resetToDefaults();
      setMachines(reset);
      toast.success('Fleet dataset restored to 50 initial units');
    } catch {
      toast.error('Failed to reset dataset');
    }
  };

  return (
    <MachineContext.Provider
      value={{
        machines,
        isLoading,
        selectedMachine,
        setSelectedMachine,
        getMachineById,
        addMachine,
        updateMachine,
        deleteMachine,
        resetToDefaults,
        refreshMachines: fetchMachines,
      }}
    >
      {children}
    </MachineContext.Provider>
  );
};

export const useMachines = (): MachineContextType => {
  const context = useContext(MachineContext);
  if (!context) {
    throw new Error('useMachines must be used within a MachineProvider');
  }
  return context;
};
