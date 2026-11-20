import type { PredictionInput, PredictionResult, ShapContribution, FailureMode } from '../types';

export function runInference(input: PredictionInput, machineName: string = 'Industrial Unit'): PredictionResult {
  const { airTemperature, processTemperature, rpm, torque, toolWear, machineId } = input;

  // Mechanical power in Watts: P = Torque * (RPM * 2 * PI / 60)
  const powerWatts = torque * (rpm * 2 * Math.PI / 60);
  const tempDiff = processTemperature - airTemperature;
  const wearTorqueProduct = toolWear * torque;

  // Anomaly scores
  let twfRisk = 0; // Tool wear
  let hdfRisk = 0; // Heat dissipation
  let pwfRisk = 0; // Power failure
  let osfRisk = 0; // Overstrain

  if (toolWear > 200) {
    twfRisk = Math.min(95, 45 + (toolWear - 200) * 1.4);
  } else if (toolWear > 150) {
    twfRisk = 20 + (toolWear - 150) * 0.4;
  } else {
    twfRisk = 5;
  }

  if (tempDiff < 8.6 && rpm < 1380) {
    hdfRisk = 82 + Math.min(15, (8.6 - tempDiff) * 5);
  } else if (tempDiff < 9.5) {
    hdfRisk = 35;
  } else {
    hdfRisk = 4;
  }

  if (powerWatts < 3500 || powerWatts > 9000) {
    pwfRisk = 88;
  } else if (powerWatts < 4000 || powerWatts > 8200) {
    pwfRisk = 48;
  } else {
    pwfRisk = 6;
  }

  if (wearTorqueProduct > 11500) {
    osfRisk = 91;
  } else if (wearTorqueProduct > 9000) {
    osfRisk = 52;
  } else {
    osfRisk = 7;
  }

  // Combined failure probability
  const maxSpecificRisk = Math.max(twfRisk, hdfRisk, pwfRisk, osfRisk);
  const baseNoise = 2.4;
  const failureProbability = Number(Math.min(99.2, Math.max(1.8, maxSpecificRisk * 0.85 + baseNoise)).toFixed(1));

  // Determine dominant failure mode
  let failureMode: FailureMode = 'No Failure';
  if (failureProbability > 40) {
    if (twfRisk >= hdfRisk && twfRisk >= pwfRisk && twfRisk >= osfRisk) {
      failureMode = 'Tool Wear Failure (TWF)';
    } else if (hdfRisk >= twfRisk && hdfRisk >= pwfRisk && hdfRisk >= osfRisk) {
      failureMode = 'Heat Dissipation Failure (HDF)';
    } else if (pwfRisk >= twfRisk && pwfRisk >= hdfRisk && pwfRisk >= osfRisk) {
      failureMode = 'Power Failure (PWF)';
    } else {
      failureMode = 'Overstrain Failure (OSF)';
    }
  }

  // Determine risk category
  let riskCategory: PredictionResult['riskCategory'] = 'Low';
  if (failureProbability >= 80) riskCategory = 'Critical';
  else if (failureProbability >= 50) riskCategory = 'High';
  else if (failureProbability >= 25) riskCategory = 'Medium';

  // Confidence calculation (synthetic ML uncertainty)
  const confidence = Number((91 + Math.sin(rpm / 100) * 4.5 + Math.random() * 2).toFixed(1));

  // Estimated RUL in hours
  let estimatedRULHours = Math.round(1800 * (1 - failureProbability / 100));
  if (failureProbability > 75) estimatedRULHours = Math.max(4, Math.round(48 * (1 - (failureProbability - 75) / 25)));

  // Recommendations
  let recommendation = 'Machine operational telemetry is optimal. Maintain current preventive inspection schedule.';
  if (failureMode === 'Tool Wear Failure (TWF)') {
    recommendation = `URGENT: Tool wear at ${toolWear} min exceeds safe operational threshold (200 min). Schedule immediate tool insert replacement within ${estimatedRULHours} hours.`;
  } else if (failureMode === 'Heat Dissipation Failure (HDF)') {
    recommendation = `CRITICAL: Thermal gradient insufficient (ΔT: ${tempDiff.toFixed(1)}°C at ${rpm} RPM). Clean cooling channels, inspect coolant pump flow rate, and purge heat exchanger.`;
  } else if (failureMode === 'Power Failure (PWF)') {
    recommendation = `WARNING: Spindle mechanical power (${(powerWatts / 1000).toFixed(2)} kW) outside nominal bracket (3.5 - 9.0 kW). Inspect motor drive inverter and drive belt tension.`;
  } else if (failureMode === 'Overstrain Failure (OSF)') {
    recommendation = `HIGH RISK: Mechanical strain product (${Math.round(wearTorqueProduct)} min·Nm) approaching fracture envelope. Reduce spindle feed rate by 15% immediately.`;
  } else if (riskCategory === 'Medium') {
    recommendation = 'Moderate stress metrics detected. Increase telemetry polling frequency and inspect during next shift transition.';
  }

  // SHAP feature contributions
  const shapValues: ShapContribution[] = [
    {
      feature: 'toolWear',
      label: 'Tool Wear Time',
      value: toolWear,
      unit: 'min',
      shapValue: Number(((toolWear - 120) * 0.28).toFixed(2)),
      impact: toolWear > 150 ? 'positive' : toolWear < 80 ? 'negative' : 'neutral',
      description: toolWear > 150 
        ? `Elevated tool wear (+${toolWear} min) significantly increases micro-fracture probability` 
        : 'Tool condition within nominal blade lifespan',
    },
    {
      feature: 'torque',
      label: 'Spindle Torque',
      value: torque,
      unit: 'Nm',
      shapValue: Number(((torque - 40) * 0.45).toFixed(2)),
      impact: torque > 55 ? 'positive' : torque < 35 ? 'negative' : 'neutral',
      description: torque > 55 
        ? `High mechanical resistance (+${torque.toFixed(1)} Nm) puts excessive stress on bearing cage` 
        : 'Torque loading is balanced and steady',
    },
    {
      feature: 'tempDiff',
      label: 'Thermal Differential (ΔT)',
      value: Number(tempDiff.toFixed(1)),
      unit: '°C',
      shapValue: Number(((10 - tempDiff) * 1.8).toFixed(2)),
      impact: tempDiff < 8.6 ? 'positive' : 'negative',
      description: tempDiff < 8.6 
        ? 'Insufficient heat dissipation detected between core process and ambient air' 
        : 'Cooling fluid airflow maintaining adequate heat transfer',
    },
    {
      feature: 'rotationalSpeed',
      label: 'Rotational Speed',
      value: rpm,
      unit: 'RPM',
      shapValue: Number(((1500 - rpm) * 0.04).toFixed(2)),
      impact: rpm < 1350 || rpm > 2200 ? 'positive' : 'negative',
      description: rpm < 1350 
        ? 'Spindle speed stalling under heavy mechanical load' 
        : 'Speed within recommended dynamic balance window',
    },
    {
      feature: 'processTemperature',
      label: 'Process Temperature',
      value: processTemperature,
      unit: '°C',
      shapValue: Number(((processTemperature - 35) * 0.7).toFixed(2)),
      impact: processTemperature > 38 ? 'positive' : 'neutral',
      description: processTemperature > 38 
        ? 'Chamber temperature higher than standard ISO operating range' 
        : 'Thermal expansion within standard dimensional tolerances',
    },
    {
      feature: 'powerWatts',
      label: 'Mechanical Power Draw',
      value: Number((powerWatts / 1000).toFixed(2)),
      unit: 'kW',
      shapValue: Number(((powerWatts - 5000) / 1000 * 1.2).toFixed(2)),
      impact: powerWatts > 8000 || powerWatts < 3500 ? 'positive' : 'neutral',
      description: powerWatts > 8000 
        ? 'High current draw approaching motor drive trip threshold' 
        : 'Electrical efficiency in normal green envelope',
    },
  ];

  return {
    id: `PRED-${Date.now().toString().slice(-6)}`,
    machineId,
    machineName,
    failureProbability,
    riskCategory,
    confidence,
    predictionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    recommendation,
    failureMode,
    estimatedRULHours,
    shapValues,
    inputValues: input,
  };
}
