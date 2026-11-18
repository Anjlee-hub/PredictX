export type MachineStatus = 'healthy' | 'warning' | 'critical' | 'offline';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SensorReading {
  timestamp: string;
  airTemperature: number;     // Kelvin or Celsius (°C)
  processTemperature: number; // °C
  rotationalSpeed: number;    // RPM
  torque: number;             // Nm
  toolWear: number;           // Minutes
  vibration?: number;         // mm/s
  pressure?: number;          // bar
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  factory: string;
  location: string;
  airTemperature: number;
  processTemperature: number;
  rpm: number;
  torque: number;
  toolWear: number;
  status: MachineStatus;
  risk: RiskLevel;
  riskScore: number; // 0 - 100%
  lastMaintenance: string;
  nextScheduledMaintenance: string;
  healthPercentage: number;
  uptimeHours: number;
  serialNumber: string;
  operator: string;
  installedDate: string;
  firmwareVersion: string;
  sensorHistory: SensorReading[];
}
