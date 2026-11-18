export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue';

export interface Engineer {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  phone: string;
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  machineName: string;
  title: string;
  priority: MaintenancePriority;
  engineer: Engineer;
  status: MaintenanceStatus;
  dueDate: string;
  scheduledDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours?: number;
  cost: number;
  description: string;
  tasks: string[];
  checklist: { item: string; completed: boolean }[];
  failureModePrevented?: string;
}
