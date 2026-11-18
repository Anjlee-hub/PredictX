export type ReportType = 
  | 'machine_health' 
  | 'maintenance_audit' 
  | 'prediction_anomaly' 
  | 'factory_oee' 
  | 'downtime_root_cause';

export type ReportFormat = 'pdf' | 'csv' | 'xlsx';

export interface GeneratedReport {
  id: string;
  title: string;
  type: ReportType;
  generatedAt: string;
  generatedBy: string;
  fileSize: string;
  status: 'ready' | 'generating' | 'failed';
  recordCount: number;
  period: string;
  summary: string;
}

export interface ReportFilterParams {
  type: ReportType;
  dateRange: 'today' | 'last_7_days' | 'last_30_days' | 'last_quarter' | 'year_to_date';
  factory?: string;
  machineId?: string;
  format: ReportFormat;
}
