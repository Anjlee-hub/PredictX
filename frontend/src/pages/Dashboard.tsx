import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  Timer,
  Zap,
  Activity,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  PlusCircle,
  Sliders,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useMachines } from '../context/MachineContext';
import { useAlerts } from '../context/AlertContext';
import { StatCard } from '../components/StatCard';
import { ChartContainer } from '../components/ChartContainer';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import {
  mockFactoryKPIs,
  mockOeeHistory,
  mockDowntimeCategories,
  mockProductionTrend,
  mockFailureTrend,
  initialMaintenanceRecords,
} from '../data';
import { exportToCsv } from '../utils/exportUtils';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { machines } = useMachines();
  const { alerts, acknowledgeAlert } = useAlerts();

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Compute live counts from machines context
  const totalMachines = machines.length;
  const healthyMachines = machines.filter((m) => m.status === 'healthy').length;
  const criticalMachines = machines.filter((m) => m.status === 'critical').length;
  const warningMachines = machines.filter((m) => m.status === 'warning').length;
  const offlineMachines = machines.filter((m) => m.status === 'offline').length;

  const healthPieData = [
    { name: 'Healthy', value: healthyMachines, color: '#10B981' },
    { name: 'Warning', value: warningMachines, color: '#F59E0B' },
    { name: 'Critical', value: criticalMachines, color: '#EF4444' },
    { name: 'Offline', value: offlineMachines, color: '#64748B' },
  ];

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && a.status === 'active');
  const upcomingMaintenance = initialMaintenanceRecords.slice(0, 4);

  const handleExportQuickReport = () => {
    exportToCsv(
      `predictx-fleet-kpis-${new Date().toISOString().split('T')[0]}`,
      machines.map((m) => ({
        id: m.id,
        name: m.name,
        factory: m.factory,
        status: m.status,
        risk: m.risk,
        health: `${m.healthPercentage}%`,
        airTemp: `${m.airTemperature}°C`,
        procTemp: `${m.processTemperature}°C`,
        rpm: m.rpm,
        torque: `${m.torque}Nm`,
        toolWear: `${m.toolWear}min`,
      }))
    );
    toast.success('Fleet KPI report exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#121215] border border-[#E5E5DE] dark:border-[#272730] rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white tracking-tight">
              Factory Intelligence Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#E5E5DE] dark:border-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              QoS-1 Stream
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
            Plant Alpha (Detroit) • 50 Machines • 100Hz Telemetry Polling • Model: RUL-XGBoost v3.4
          </p>
        </div>

        {/* Action Buttons: Burnt orange primary pop, architectural white secondary */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/predictions')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Run AI Diagnosis</span>
          </button>
          <button
            onClick={() => navigate('/maintenance')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E5DE] dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-all shadow-2xs"
          >
            <PlusCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>Schedule Work Order</span>
          </button>
          <button
            onClick={() => navigate('/simulation')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E5DE] dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-all shadow-2xs"
          >
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
            <span>Digital Twin Sim</span>
          </button>
          <button
            onClick={handleExportQuickReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E5DE] dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-all shadow-2xs"
            title="Download Fleet Summary"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Live Edge Telemetry Micro-Ticker Bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-2 shrink-0 text-slate-700 dark:text-slate-300 font-bold">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          <span>LIVE TELEMETRY:</span>
        </div>
        <div className="flex items-center gap-6">
          <span>MAC-001 (Milling): <strong className="text-emerald-600 dark:text-emerald-400">33.7°C • 1540 RPM • 38.5Nm</strong></span>
          <span>MAC-004 (Turbine): <strong className="text-rose-500 animate-pulse">44.8°C (HIGH) • 68.4Nm</strong></span>
          <span>MAC-023 (Press): <strong className="text-amber-500">228min (WEAR EXCEEDED)</strong></span>
          <span>MAC-012 (Laser): <strong className="text-teal-600 dark:text-teal-400">ΔT 6.2°C • 1180 RPM</strong></span>
          <span>GATEWAY: <strong className="text-slate-700 dark:text-slate-300">14ms ping • 0 dropped packets</strong></span>
        </div>
      </div>

      {/* KPI Cards Grid (10 KPIs requested) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Fleet"
          value={totalMachines}
          unit="Units"
          icon={Cpu}
          description="Monitored across 4 plants"
          onClick={() => navigate('/machines')}
        />
        <StatCard
          title="Healthy Units"
          value={healthyMachines}
          unit={`(${((healthyMachines / totalMachines) * 100).toFixed(0)}%)`}
          icon={CheckCircle2}
          statusVariant="success"
          change={+2.4}
          changePeriod="vs last week"
          onClick={() => navigate('/machines')}
        />
        <StatCard
          title="Critical Units"
          value={criticalMachines}
          unit="Immediate"
          icon={AlertTriangle}
          statusVariant="danger"
          change={-1}
          isPositiveGood={false}
          description="Action required within 24h"
          onClick={() => navigate('/alerts')}
        />
        <StatCard
          title="Maintenance Due"
          value={mockFactoryKPIs.maintenanceDue}
          unit="Scheduled"
          icon={Clock}
          statusVariant="warning"
          description="Within next 72 hours"
          onClick={() => navigate('/maintenance')}
        />
        <StatCard
          title="Overall OEE"
          value={mockFactoryKPIs.overallOEE}
          unit="%"
          icon={Gauge}
          statusVariant="info"
          change={+1.8}
          description="Target benchmark: 85.0%"
          onClick={() => navigate('/factory-analytics')}
        />
        <StatCard
          title="Total Downtime"
          value={mockFactoryKPIs.totalDowntimeHours}
          unit="Hours"
          icon={Timer}
          change={-3.4}
          isPositiveGood={true}
          description="Cumulative last 7 days"
          onClick={() => navigate('/factory-analytics')}
        />
        <StatCard
          title="MTBF"
          value={mockFactoryKPIs.mtbfHours}
          unit="Hours"
          icon={Activity}
          change={+5.2}
          description="Mean Time Between Failures"
        />
        <StatCard
          title="MTTR"
          value={mockFactoryKPIs.mttrHours}
          unit="Hours"
          icon={Zap}
          change={-0.6}
          isPositiveGood={true}
          description="Mean Time To Repair"
        />
        <StatCard
          title="Active Alerts"
          value={alerts.filter((a) => a.status === 'active').length}
          unit="Open"
          icon={AlertTriangle}
          statusVariant={criticalAlerts.length > 0 ? 'danger' : 'default'}
          description={`${criticalAlerts.length} high priority critical`}
          onClick={() => navigate('/alerts')}
        />
        <StatCard
          title="AI Models Online"
          value={mockFactoryKPIs.activePredictionsCount}
          unit="Models"
          icon={Sparkles}
          description="Inference polling at 100Hz"
          onClick={() => navigate('/predictions')}
        />
      </div>

      {/* Primary Analytics & Health Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Health Pie/Donut Chart */}
        <ChartContainer
          title="Fleet Health Distribution"
          subtitle="Real-time condition monitoring breakdown"
          className="lg:col-span-1"
          actions={
            <button
              onClick={() => navigate('/machines')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              Inspect Fleet <ArrowRight className="h-3 w-3" />
            </button>
          }
        >
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {healthPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121215',
                    borderColor: '#2A2A33',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalMachines}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Machines
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {healthPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </ChartContainer>

        {/* OEE Trend Chart */}
        <ChartContainer
          title="Overall OEE Trend & Benchmarks"
          subtitle="Availability, Performance, Quality vs 85% Target"
          className="lg:col-span-2"
          actions={
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              {(['24h', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    timeRange === r
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockOeeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[70, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
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
                  type="monotone"
                  dataKey="oee"
                  name="OEE Total (%)"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="availability"
                  name="Availability"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target (85%)"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      {/* Secondary Charts: Failures Prevented by AI & Downtime Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failures Prevented by AI */}
        <ChartContainer
          title="Predictive AI Impact: Incidents vs Prevented"
          subtitle="Predictive forewarning avoided 38 critical breakdowns in Nov"
          badge={
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              <TrendingUp className="h-3 w-3" /> +112% Prevented
            </span>
          }
        >
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockFailureTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121215',
                    borderColor: '#2A2A33',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="rect" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="preventedByAI" name="AI Prevented Breakdowns" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="incidents" name="Minor Line Stops" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="criticalEvents" name="Critical Events" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Downtime Categories Bar */}
        <ChartContainer
          title="Downtime Pareto Classification"
          subtitle="Leading root causes of line loss in hours and cost"
        >
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={mockDowntimeCategories}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} unit="h" />
                <YAxis
                  dataKey="category"
                  type="category"
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  width={130}
                />
                <Tooltip
                  formatter={(val) => [`${val} hrs`, 'Downtime']}
                  contentStyle={{
                    backgroundColor: '#121215',
                    borderColor: '#2A2A33',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="hours" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      {/* Production Trend Area Chart */}
      <ChartContainer
        title="Hourly Production Trend: Target vs Actual vs Scrap"
        subtitle="Shift 1 & 2 continuous line output telemetry"
      >
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockProductionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#121215',
                  borderColor: '#2A2A33',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="actualUnits" name="Actual Units Produced" stroke="#14B8A6" fillOpacity={1} fill="url(#colorActual)" />
              <Line type="monotone" dataKey="targetUnits" name="Target Demand" stroke="#2563EB" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="scrapUnits" name="Defects / Scrap" stroke="#EF4444" strokeWidth={1.5} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Bottom Grid: Live Critical Alerts Panel + Upcoming Maintenance + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Alerts Panel */}
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Critical Alarms</h3>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              View All ({criticalAlerts.length})
            </button>
          </div>

          <div className="space-y-3">
            {criticalAlerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <Check className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                No active critical alarms. All thresholds normal.
              </div>
            ) : (
              criticalAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl border border-rose-100 dark:border-rose-950/80 bg-rose-50/40 dark:bg-rose-950/20 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white leading-tight">
                      {alert.title}
                    </span>
                    <span className="text-[10px] font-mono text-rose-500 font-bold uppercase shrink-0">
                      CRITICAL
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {alert.message}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-rose-100 dark:border-rose-900/40 text-[10px]">
                    <span className="text-slate-500 font-medium">{alert.machineName}</span>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Work Orders</h3>
            </div>
            <button
              onClick={() => navigate('/maintenance')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Schedule
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingMaintenance.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate('/maintenance')}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/40 bg-slate-50/50 dark:bg-slate-800/30 transition-all cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {order.title}
                  </span>
                  <PriorityBadge priority={order.priority} />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{order.machineName}</span>
                  <span className="font-mono">Due: {order.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Risk Machines Summary Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">High Attention Fleet</h3>
            </div>
            <button
              onClick={() => navigate('/machines')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              All Machines
            </button>
          </div>

          <div className="space-y-2.5">
            {machines
              .filter((m) => m.status === 'critical' || m.status === 'warning')
              .slice(0, 4)
              .map((machine) => (
                <div
                  key={machine.id}
                  onClick={() => navigate(`/machines/${machine.id}`)}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-teal-500/40 bg-slate-50/50 dark:bg-slate-800/30 transition-all cursor-pointer text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {machine.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {machine.id} • {machine.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={machine.status} />
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Wear: {machine.toolWear} min
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
