import React, { useState } from 'react';
import {
  HeartPulse,
  Clock,
  AlertTriangle,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useMachines } from '../context/MachineContext';
import { ChartContainer } from '../components/ChartContainer';
import { StatCard } from '../components/StatCard';
import { mockSurvivalCurve, mockSurvivalMilestones } from '../data/mockSurvival';

export const SurvivalAnalysis: React.FC = () => {
  const { machines } = useMachines();
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || 'MAC-001');

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  // Adjust survival probability based on machine health percentage
  const machineSurvivalRate = selectedMachine ? Math.round(selectedMachine.healthPercentage * 0.92) : 88;
  const machineHazardRate = selectedMachine ? (selectedMachine.riskScore / 10).toFixed(2) : '1.45';
  const remainingLifeHours = selectedMachine
    ? Math.round(selectedMachine.uptimeHours * 0.45 * (selectedMachine.healthPercentage / 100))
    : 1420;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Prognostics & Survival Analysis (PHM)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Kaplan-Meier & Cox Proportional Hazards
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Time-to-event degradation forecasting, Weibull reliability modeling, and Remaining Useful Life (RUL) estimation.
          </p>
        </div>

        {/* Machine selection dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Unit:</span>
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden"
          >
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} - {m.name} ({m.healthPercentage}% Health)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Remaining Useful Life (RUL)"
          value={remainingLifeHours}
          unit="Hours"
          icon={Clock}
          statusVariant={remainingLifeHours < 200 ? 'danger' : 'info'}
          description="Operational window before critical wear"
        />
        <StatCard
          title="Survival Probability"
          value={machineSurvivalRate}
          unit="%"
          icon={HeartPulse}
          statusVariant={machineSurvivalRate < 60 ? 'danger' : 'success'}
          description="S(t) at current operational cycle"
        />
        <StatCard
          title="Instantaneous Hazard Rate"
          value={machineHazardRate}
          unit="λ(t)"
          icon={AlertTriangle}
          statusVariant={Number(machineHazardRate) > 5 ? 'danger' : 'warning'}
          description="Failure events / 1000 running hours"
        />
        <StatCard
          title="Cumulative Fleet Uptime"
          value={selectedMachine?.uptimeHours || 3200}
          unit="Hours"
          icon={Activity}
          description="Hours in operation since commissioning"
        />
      </div>

      {/* Primary Survival Curve & Hazard Rate Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kaplan-Meier Survival Curve */}
        <ChartContainer
          title="Kaplan-Meier Survival Probability Curve S(t)"
          subtitle="Non-parametric lifetime estimate with 95% Hall-Wellner confidence bands"
          badge={
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
              B50 Median Life = 2,050h
            </span>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSurvivalCurve} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="survivalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="hours" stroke="#64748B" fontSize={11} tickLine={false} unit="h" />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Survival Probability']}
                  contentStyle={{
                    backgroundColor: '#121215',
                    borderColor: '#2A2A33',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="survivalProbability"
                  name="Mean Survival S(t)"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#survivalGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="confidenceUpper"
                  name="95% CI Upper"
                  stroke="#14B8A6"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="confidenceLower"
                  name="95% CI Lower"
                  stroke="#F59E0B"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Cumulative Hazard Curve */}
        <ChartContainer
          title="Cumulative Hazard Function H(t)"
          subtitle="Bathtub hazard curve: Accelerating wearout phase beyond 1,750 hours"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockSurvivalCurve} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="hours" stroke="#64748B" fontSize={11} tickLine={false} unit="h" />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} failures / 1k hrs`, 'Hazard Rate']}
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
                  type="monotone"
                  dataKey="hazardRate"
                  name="Hazard Rate λ(t)"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      {/* Survival Timeline Milestones */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Lifetime Degradation Timeline & Preventive Milestones
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">ISO 13374 PHM Standards</span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {mockSurvivalMilestones.map((milestone, idx) => {
            const isCurrent =
              selectedMachine &&
              selectedMachine.uptimeHours >= milestone.timeHours &&
              (idx === mockSurvivalMilestones.length - 1 || selectedMachine.uptimeHours < mockSurvivalMilestones[idx + 1].timeHours);

            return (
              <div key={milestone.event} className="relative flex items-start gap-4">
                {/* Milestone Dot */}
                <div
                  className={`absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 ${
                    milestone.impactLevel === 'critical'
                      ? 'border-rose-500 text-rose-500'
                      : milestone.impactLevel === 'high'
                      ? 'border-amber-500 text-amber-500'
                      : 'border-blue-500 text-blue-500'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      milestone.impactLevel === 'critical'
                        ? 'bg-rose-500'
                        : milestone.impactLevel === 'high'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                  />
                </div>

                {/* Milestone Details Card */}
                <div
                  className={`flex-1 p-3.5 rounded-xl border text-xs ${
                    isCurrent
                      ? 'border-blue-500/60 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500/30'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {milestone.event}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-blue-500 text-white">
                          Current Fleet Phase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <span>{milestone.timeHours} Hours</span>
                      <span>•</span>
                      <span>Survival: {milestone.probability}%</span>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Action:</span>{' '}
                    {milestone.recommendedAction}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
