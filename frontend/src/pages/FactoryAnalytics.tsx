import React, { useState } from 'react';
import {
  Gauge,
  CheckCircle2,
  TrendingUp,
  Zap,
  Clock,
  Activity,
  Layers,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { ChartContainer } from '../components/ChartContainer';
import { ProgressBar } from '../components/ProgressBar';
import {
  mockFactoryKPIs,
  mockOeeHistory,
} from '../data';
import { exportToCsv } from '../utils/exportUtils';
import toast from 'react-hot-toast';

export const FactoryAnalytics: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d'>('7d');

  // Machine comparison mock data
  const machineComparisonData = [
    { name: 'Milling Unit 01', oee: 92.4, availability: 96, performance: 94, quality: 99 },
    { name: 'Lathe Unit 02', oee: 88.1, availability: 91, performance: 89, quality: 98 },
    { name: 'Gas Turbine 04', oee: 62.5, availability: 70, performance: 65, quality: 95 },
    { name: 'Lathe Unit 09', oee: 78.4, availability: 84, performance: 81, quality: 97 },
    { name: 'Laser Cell 12', oee: 71.0, availability: 76, performance: 74, quality: 96 },
    { name: 'Robotic Arm 27', oee: 84.8, availability: 90, performance: 86, quality: 99 },
    { name: 'Hydraulic Press 23', oee: 68.2, availability: 74, performance: 71, quality: 96 },
    { name: 'Compressor 39', oee: 74.5, availability: 80, performance: 78, quality: 97 },
  ];

  const handleExportAnalytics = () => {
    exportToCsv('predictx-factory-analytics-oee', mockOeeHistory);
    toast.success('Factory OEE & Analytics dataset exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Factory Intelligence & OEE Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              TPM & Six Sigma
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Overall Equipment Effectiveness (Availability × Performance × Quality) and line utilization analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateFilter(r)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  dateFilter === r
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 8 Primary Factory Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard
          title="Availability"
          value={mockFactoryKPIs.availability}
          unit="%"
          icon={Clock}
          change={+1.2}
          description="Operational Uptime"
        />
        <StatCard
          title="Performance"
          value={mockFactoryKPIs.performance}
          unit="%"
          icon={Activity}
          change={+0.8}
          description="Operating Speed Ratio"
        />
        <StatCard
          title="Quality Rate"
          value={mockFactoryKPIs.quality}
          unit="%"
          icon={CheckCircle2}
          statusVariant="success"
          change={+0.3}
          description="First-Pass Yield"
        />
        <StatCard
          title="Overall OEE"
          value={mockFactoryKPIs.overallOEE}
          unit="%"
          icon={Gauge}
          statusVariant="info"
          change={+1.8}
          description="A × P × Q Combined"
        />
        <StatCard
          title="Line Efficiency"
          value={mockFactoryKPIs.productionEfficiency}
          unit="%"
          icon={TrendingUp}
          change={+2.1}
          description="Schedule Adherence"
        />
        <StatCard
          title="Total Downtime"
          value={mockFactoryKPIs.totalDowntimeHours}
          unit="Hours"
          icon={Clock}
          change={-2.4}
          isPositiveGood={true}
          description="Lost shift hours"
        />
        <StatCard
          title="Energy Power"
          value={Math.round(mockFactoryKPIs.energyUsageKwh / 1000)}
          unit="MWh"
          icon={Zap}
          description="Facility Consumption"
        />
        <StatCard
          title="Utilization"
          value={mockFactoryKPIs.machineUtilization}
          unit="%"
          icon={Layers}
          change={+3.5}
          description="Shift Loading Rate"
        />
      </div>

      {/* OEE Trend Chart & OEE Pillar Decomposition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartContainer
          title="Weekly OEE Composite Trend vs World-Class Target"
          subtitle="World-class manufacturing standard is 85.0% OEE"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockOeeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[75, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
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
                <Line type="monotone" dataKey="oee" name="OEE Score (%)" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="availability" name="Availability" stroke="#14B8A6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="performance" name="Performance" stroke="#8B5CF6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="quality" name="Quality" stroke="#10B981" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="target" name="Target (85%)" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* OEE 3 Pillars Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">OEE Three Pillars Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Six Big Losses breakdown</p>
          </div>

          <div className="space-y-4 my-auto py-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Availability (Operating Time)</span>
                <span className="text-teal-600 font-mono font-bold">{mockFactoryKPIs.availability}%</span>
              </div>
              <ProgressBar value={mockFactoryKPIs.availability} showValue={false} colorVariant="success" />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Losses: Breakdowns & Setup adjustments</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Performance (Net Operating Time)</span>
                <span className="text-blue-600 font-mono font-bold">{mockFactoryKPIs.performance}%</span>
              </div>
              <ProgressBar value={mockFactoryKPIs.performance} showValue={false} colorVariant="default" />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Losses: Small stops & Reduced speed</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Quality (Fully Productive Time)</span>
                <span className="text-emerald-600 font-mono font-bold">{mockFactoryKPIs.quality}%</span>
              </div>
              <ProgressBar value={mockFactoryKPIs.quality} showValue={false} colorVariant="success" />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Losses: Production scrap & Startup reject</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs">
            <span className="font-bold text-blue-900 dark:text-blue-300">OEE Multiplier Formula:</span>
            <div className="font-mono text-slate-600 dark:text-slate-300 mt-0.5 text-[11px]">
              0.912 × 0.884 × 0.986 = <span className="font-bold text-blue-600 dark:text-blue-400">84.6%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Machine Fleet Comparison Chart */}
      <ChartContainer
        title="Fleet Machine OEE Benchmarking Comparison"
        subtitle="Identifying high-performing units vs machines suffering chronic micro-stops"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={machineComparisonData}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} interval={0} angle={-10} textAnchor="end" />
              <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} tickLine={false} unit="%" />
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
              <Bar dataKey="oee" name="Overall OEE" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="availability" name="Availability" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="performance" name="Performance" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Machine Shift Utilization Matrix Heatmap */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shift Utilization Heatmap Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Continuous 3-shift factory machine utilization rates</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-500" />
              <span className="text-slate-400">&gt; 85% Optimal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-amber-500" />
              <span className="text-slate-400">60-85% Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-rose-500" />
              <span className="text-slate-400">&lt; 60% Low / Idle</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Machine</th>
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3 text-center">Shift 1 (06:00 - 14:00)</th>
                <th className="py-2.5 px-3 text-center">Shift 2 (14:00 - 22:00)</th>
                <th className="py-2.5 px-3 text-center">Shift 3 (22:00 - 06:00)</th>
                <th className="py-2.5 px-3 text-right">Avg Loading</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {['Milling Unit 01', 'Lathe Unit 02', 'Gas Turbine 04', 'Laser Cell 12', 'Hydraulic Press 23'].map((mName, idx) => {
                const s1 = [94, 88, 42, 72, 58][idx];
                const s2 = [91, 82, 35, 68, 45][idx];
                const s3 = [78, 64, 0, 50, 0][idx];
                const avg = Math.round((s1 + s2 + s3) / 3);

                const getCellColor = (val: number) => {
                  if (val >= 85) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
                  if (val >= 60) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
                  return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30';
                };

                return (
                  <tr key={mName} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {mName}
                    </td>
                    <td className="py-3 px-3 text-slate-400">Current Week</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block w-16 py-1 rounded font-mono font-bold text-xs ${getCellColor(s1)}`}>
                        {s1}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block w-16 py-1 rounded font-mono font-bold text-xs ${getCellColor(s2)}`}>
                        {s2}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block w-16 py-1 rounded font-mono font-bold text-xs ${getCellColor(s3)}`}>
                        {s3}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {avg}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
