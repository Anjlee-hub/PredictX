/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { IndustrialAlert } from '../types';
import { alertService } from '../services';
import toast from 'react-hot-toast';

interface AlertContextType {
  alerts: IndustrialAlert[];
  isLoading: boolean;
  activeCount: number;
  criticalCount: number;
  acknowledgeAlert: (id: string) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  createAlert: (alertData: Omit<IndustrialAlert, 'id' | 'timestamp'>) => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<IndustrialAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAlerts = async () => {
    try {
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadAlerts = async () => {
      try {
        const data = await alertService.getAlerts();
        if (isMounted) {
          setAlerts(data);
        }
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadAlerts();
    return () => {
      isMounted = false;
    };
  }, []);

  const acknowledgeAlert = async (id: string) => {
    try {
      const updated = await alertService.updateAlertStatus(id, 'acknowledged');
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success(`Alert ${id} acknowledged`);
    } catch {
      toast.error('Failed to acknowledge alert');
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      const updated = await alertService.updateAlertStatus(id, 'resolved');
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success(`Alert ${id} resolved`);
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  const createAlert = async (alertData: Omit<IndustrialAlert, 'id' | 'timestamp'>) => {
    try {
      const newAlert = await alertService.createAlert(alertData);
      setAlerts((prev) => [newAlert, ...prev]);
      toast.error(`NEW ANOMALY: ${newAlert.title}`, { duration: 5000 });
    } catch {
      toast.error('Failed to trigger alert');
    }
  };

  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;

  return (
    <AlertContext.Provider
      value={{
        alerts,
        isLoading,
        activeCount,
        criticalCount,
        acknowledgeAlert,
        resolveAlert,
        createAlert,
        refreshAlerts: fetchAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
