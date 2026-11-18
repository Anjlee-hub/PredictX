export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface IndustrialAlert {
  id: string;
  machineId: string;
  machineName: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  metric?: string;
  triggerValue?: string;
  thresholdLimit?: string;
}
