import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Thermometer,
  RotateCw,
  Gauge,
  Scissors,
  Activity,
  AlertTriangle,
  Sparkles,
  Wrench,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useMachines } from '../context/MachineContext';
import { useAlerts } from '../context/AlertContext';
import { StatusBadge, RiskBadge, PriorityBadge } from '../components/Badges';
import { ChartContainer } from '../components/ChartContainer';
import { RadialGauge } from '../components/ProgressBar';
import { initialMaintenanceRecords } from '../data';
import { runInference } from '../utils/predictionEngine';

export const MachineDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { machines } = useMachines();
  const { alerts, acknowledgeAlert } = useAlerts();

  const [historyRange, setHistoryRange] = useState<'6h' | '12h' | '24h'>('24h');

  const machine = useMemo(() => {
    return machines.find((m) => m.id === id) || machines[0];
  }, [machines, id]);

  // Generate instant real-time physics prediction for this machine's current telemetry
  const prediction = useMemo(() => {
    if (!machine) return null;
    return runInference(
      {
        machineId: machine.id,
        airTemperature: machine.airTemperature,
        processTemperature: machine.processTemperature,
        rpm: machine.rpm,
        torque: machine.torque,
        toolWear: machine.toolWear,
      },
      machine.name
    );
  }, [machine]);

  const machineAlerts = useMemo(() => {
    return alerts.filter((a) => a.machineId === machine?.id);
  }, [alerts, machine]);

  const machineMaintenance = useMemo(() => {
    return initialMaintenanceRecords.filter((r) => r.machineId === machine?.id);
  }, [machine]);

  // Slice sensor history based on range (called unconditionally before early returns)
  const displayedHistory = useMemo(() => {
    if (!machine) return [];
    const history = machine.sensorHistory || [];
    if (historyRange === '6h') return history.slice(-6);
    if (historyRange === '12h') return history.slice(-12);
    return history;
  }, [machine, historyRange]);

  if (!machine) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Machine Not Found</h2>
        <Link to="/machines" className="mt-4 inline-block text-blue-600 hover:underline text-sm font-semibold">
          Return to Fleet Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Machine Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/machines')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Fleet Directory</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {machine.name}
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {machine.id}
            </span>
            <StatusBadge status={machine.status} />
            <RiskBadge risk={machine.risk} />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {machine.type} • {machine.factory} • Location: {machine.location}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/predictions')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simulate / Predict</span>
          </button>
          <button
            onClick={() => navigate('/maintenance')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E5E5DE] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Machine Specifications Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Serial Number</span>
          <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
            {machine.serialNumber}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Lead Operator</span>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
            {machine.operator}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Operating Hours</span>
          <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
            {machine.uptimeHours.toLocaleString()} hrs
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Firmware Build</span>
          <div className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 mt-1 truncate">
            {machine.firmwareVersion}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Last Overhaul</span>
          <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
            {machine.lastMaintenance}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Next Scheduled</span>
          <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
            {machine.nextScheduledMaintenance}
          </div>
        </div>
      </div>

      {/* Live Real-Time Sensor Telemetry Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Live Edge Sensor Telemetry
            </h2>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[11px] font-mono text-slate-400">Telemetry Stream: 100ms cycle</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Air Temp */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium">Air Temp</span>
              <Thermometer className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {machine.airTemperature}°C
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Ambient Enclosure</span>
          </div>

          {/* Process Temp */}
          <div className={`p-4 rounded-xl border shadow-xs ${
            machine.processTemperature > 40
              ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium">Process Temp</span>
              <Thermometer className={`h-4 w-4 ${machine.processTemperature > 40 ? 'text-rose-500' : 'text-amber-500'}`} />
            </div>
            <div className={`text-xl font-bold font-mono ${machine.processTemperature > 40 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {machine.processTemperature}°C
            </div>
            <span className="text-[10px] text-slate-400 font-medium">ΔT: {(machine.processTemperature - machine.airTemperature).toFixed(1)}°C</span>
          </div>

          {/* Rotational Speed */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium">Spindle RPM</span>
              <RotateCw className="h-4 w-4 text-teal-500" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {machine.rpm.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Rated 2,800 max</span>
          </div>

          {/* Torque */}
          <div className={`p-4 rounded-xl border shadow-xs ${
            machine.torque > 60
              ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium">Spindle Torque</span>
              <Gauge className={`h-4 w-4 ${machine.torque > 60 ? 'text-rose-500' : 'text-blue-500'}`} />
            </div>
            <div className={`text-xl font-bold font-mono ${machine.torque > 60 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {machine.torque} Nm
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Trip: 68.0 Nm</span>
          </div>

          {/* Tool Wear */}
          <div className={`p-4 rounded-xl border shadow-xs ${
            machine.toolWear > 200
              ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium">Tool Wear</span>
              <Scissors className={`h-4 w-4 ${machine.toolWear > 200 ? 'text-rose-500' : 'text-amber-500'}`} />
            </div>
            <div className={`text-xl font-bold font-mono ${machine.toolWear > 200 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {machine.toolWear} min
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Threshold: 200 min</span>
          </div>

          {/* Vibration / Health Gauge */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium">Vibration RMS</span>
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {machine.sensorHistory[machine.sensorHistory.length - 1]?.vibration || 1.45} mm/s
            </div>
            <span className="text-[10px] text-slate-400 font-medium">ISO 10816 Class II</span>
          </div>
        </div>
      </div>

      {/* Sensor History Graph & Health Gauges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Line Sensor History Graph */}
        <ChartContainer
          title="24-Hour Telemetry Multi-Sensor Stream"
          subtitle="Process Temperature, Spindle Torque & RPM correlation"
          className="lg:col-span-2"
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                {(['6h', '12h', '24h'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setHistoryRange(r)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                      historyRange === r
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayedHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="timestamp" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121215',
                    borderColor: '#2A2A33',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="processTemperature"
                  name="Proc Temp (°C)"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="airTemperature"
                  name="Air Temp (°C)"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="torque"
                  name="Torque (Nm)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rotationalSpeed"
                  name="Speed (RPM)"
                  stroke="#14B8A6"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Health & Risk Radial Gauges */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Prognostics Health Status</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated ML condition index</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-auto">
            <RadialGauge
              value={machine.healthPercentage}
              label="Health Score"
              sublabel="Fleet Index"
              size={120}
              invertedRisk={false}
            />
            <RadialGauge
              value={machine.riskScore}
              label="Failure Risk"
              sublabel="Inference"
              size={120}
              invertedRisk={true}
            />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Predicted Failure Mode:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {prediction?.failureMode || 'No Failure'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated RUL:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {prediction?.estimatedRULHours || 1200} hours
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Model Confidence:</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {prediction?.confidence || 96}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Diagnostic Prediction Summary Card */}
      {prediction && (
        <div className={`rounded-2xl border p-5 shadow-xs ${
          prediction.riskCategory === 'Critical'
            ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
            : prediction.riskCategory === 'High'
            ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
            : 'border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Predictive AI Inference & Prescriptive Action
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Computed: {prediction.predictionTime}</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {prediction.recommendation}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-500 font-medium">Risk Drivers:</span>
              {prediction.shapValues
                .filter((s) => s.impact === 'positive')
                .map((shap) => (
                  <span
                    key={shap.feature}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-rose-500"
                  >
                    +{shap.shapValue} {shap.label}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Machine Maintenance & Active Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machine Alerts */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Machine Alarms & Events ({machineAlerts.length})
              </h3>
            </div>
            <Link to="/alerts" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Alert Center
            </Link>
          </div>

          <div className="space-y-3">
            {machineAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No active or historical alerts logged for this unit.
              </div>
            ) : (
              machineAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{alert.title}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        alert.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{alert.message}</p>
                  <div className="mt-2 flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>{alert.timestamp}</span>
                    {alert.status === 'active' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maintenance History */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Work Orders & Maintenance Log ({machineMaintenance.length})
              </h3>
            </div>
            <Link to="/maintenance" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Manage All
            </Link>
          </div>

          <div className="space-y-3">
            {machineMaintenance.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <ShieldCheck className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-60" />
                No pending work orders currently queued for this machine.
              </div>
            ) : (
              machineMaintenance.map((wo) => (
                <div
                  key={wo.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{wo.title}</span>
                    <PriorityBadge priority={wo.priority} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{wo.description}</p>
                  <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-400">
                    <span>Assigned: {wo.engineer.name}</span>
                    <span className="font-mono">Due: {wo.dueDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
