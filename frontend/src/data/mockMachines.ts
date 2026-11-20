import type { Machine, SensorReading } from '../types';

const machineTypes = [
  'CNC 5-Axis Milling Center',
  'High-Precision CNC Lathe',
  '1500T Hydraulic Stamping Press',
  '6-Axis Articulated Robotic Arm',
  'Industrial Centrifugal Compressor',
  'Multi-Cavity Injection Molding',
  '10kW Fiber Laser Cutting Cell',
  'Industrial Gas Turbine Unit',
  'Vacuum Heat Treatment Furnace',
  'High-Speed Conveyor Sorting Cell',
  'Rotary Screw Air Compressor',
  'Heavy Duty Gearbox Test Stand',
];

const factories = [
  { factory: 'Factory Alpha (Detroit Hub)', locations: ['Bay 1 - Machining', 'Bay 2 - Stamping', 'Bay 3 - Assembly'] },
  { factory: 'Factory Beta (Munich Gigaplant)', locations: ['Hall A - Precision Tooling', 'Hall B - Robotics', 'Hall C - Finishing'] },
  { factory: 'Factory Gamma (Yokohama Plant)', locations: ['Section East - CNC Cell', 'Section West - Press Shop', 'Section Central'] },
  { factory: 'Factory Delta (Austin Facility)', locations: ['Zone 1 - High Volume', 'Zone 2 - Automated QA', 'Zone 3 - Packaging'] },
];

const operators = [
  'Dr. Marcus Vance', 'Sarah Jenkins, PE', 'Kenji Sato', 'Elena Rostova',
  'Carlos Mendez', 'Amina Diallo', 'Lukas Weber', 'Priya Patel',
  'David Kim', 'Rachel Thorne', 'Michael Chang', 'Sofia Rossi'
];

// Generates 24 hours of hourly telemetry data with realistic sensor noise and trends
function generateSensorHistory(
  baseAirTemp: number,
  baseProcTemp: number,
  baseRpm: number,
  baseTorque: number,
  baseWear: number,
  isCritical: boolean
): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600 * 1000);
    const hourFactor = Math.sin(i / 3) * 1.5;
    const criticalSpike = isCritical && i < 6 ? (6 - i) * 1.8 : 0;

    readings.push({
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      airTemperature: Number((baseAirTemp + hourFactor * 0.4 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
      processTemperature: Number((baseProcTemp + hourFactor * 0.6 + criticalSpike * 0.8 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
      rotationalSpeed: Math.round(baseRpm + hourFactor * 25 - criticalSpike * 40 + (Math.random() * 30 - 15)),
      torque: Number((baseTorque + criticalSpike * 2.5 + (Math.random() * 1.8 - 0.9)).toFixed(1)),
      toolWear: Math.max(0, Math.round(baseWear - i * 0.8)),
      vibration: Number((1.2 + (isCritical ? 2.5 + Math.random() * 1.5 : Math.random() * 0.4)).toFixed(2)),
      pressure: Number((5.8 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
    });
  }

  return readings;
}

export const initialMachines: Machine[] = Array.from({ length: 50 }, (_, index) => {
  const idNum = index + 1;
  const id = `MAC-${String(idNum).padStart(3, '0')}`;
  const typeIndex = index % machineTypes.length;
  const type = machineTypes[typeIndex];
  const factoryObj = factories[index % factories.length];
  const location = factoryObj.locations[index % factoryObj.locations.length];
  const operator = operators[index % operators.length];

  // Specific profiles for critical / warning / offline machines
  const isCritical = [4, 12, 23, 39].includes(idNum);
  const isWarning = [2, 9, 18, 27, 33, 44, 48].includes(idNum);
  const isOffline = idNum === 31;

  let status: Machine['status'] = 'healthy';
  let risk: Machine['risk'] = 'Low';
  let riskScore = 12 + ((index * 7) % 20); // 12% - 32%
  let healthPercentage = 92 + ((index * 3) % 8); // 92% - 99%
  let airTemp = 23.5 + (index % 5) * 0.6;
  let processTemp = 33.2 + (index % 6) * 0.7;
  let rpm = 1450 + ((index * 37) % 950);
  let torque = 38.5 + ((index * 13) % 28);
  let toolWear = 45 + ((index * 29) % 110);

  if (isCritical) {
    status = 'critical';
    risk = 'Critical';
    riskScore = 86 + (index % 12);
    healthPercentage = 42 + (index % 15);
    airTemp = 29.8 + (index % 3);
    processTemp = 43.5 + (index % 4);
    torque = 68.4 + (index % 8);
    rpm = 1180;
    toolWear = 215 + (index % 25);
  } else if (isWarning) {
    status = 'warning';
    risk = 'Medium';
    riskScore = 55 + (index % 18);
    healthPercentage = 71 + (index % 12);
    processTemp = 38.4 + (index % 3);
    torque = 54.2 + (index % 7);
    toolWear = 165 + (index % 30);
  } else if (isOffline) {
    status = 'offline';
    risk = 'Low';
    riskScore = 5;
    healthPercentage = 100;
    airTemp = 21.0;
    processTemp = 21.2;
    rpm = 0;
    torque = 0;
    toolWear = 88;
  }

  const daysAgo = (index * 9) % 75 + 3;
  const lastMaintDate = new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];
  const nextDays = isCritical ? 1 : isWarning ? 4 : (index * 11) % 45 + 10;
  const nextMaintDate = new Date(Date.now() + nextDays * 86400000).toISOString().split('T')[0];

  return {
    id,
    name: `${type.split(' ')[0]} Unit #${String(idNum).padStart(2, '0')}`,
    type,
    factory: factoryObj.factory,
    location,
    airTemperature: airTemp,
    processTemperature: processTemp,
    rpm,
    torque,
    toolWear,
    status,
    risk,
    riskScore,
    lastMaintenance: lastMaintDate,
    nextScheduledMaintenance: nextMaintDate,
    healthPercentage,
    uptimeHours: 1200 + ((index * 133) % 4800),
    serialNumber: `SN-PX-${2023 + (index % 3)}-${String(4100 + idNum)}`,
    operator,
    installedDate: `${2021 + (index % 4)}-0${(index % 9) + 1}-15`,
    firmwareVersion: `v4.${(index % 3) + 1}.${(index % 8) + 2}-industrial`,
    sensorHistory: generateSensorHistory(airTemp, processTemp, rpm, torque, toolWear, isCritical),
  };
});
