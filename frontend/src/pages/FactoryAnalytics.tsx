import React, { useState, useEffect } from 'react';
import {
  Gauge,
  CheckCircle2,
  TrendingUp,
  Zap,
  Clock,
  Activity,
  Layers,
  Download,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  ArrowUpRight,
  Package,
  Sliders,
  RefreshCw,
  Info,
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
  mockDowntimeCategories,
  mockMaintenanceRecommendations,
  mockMachinePerformanceList,
  mockReliabilityOverview,
} from '../data';
import { analyticsService } from '../services';
import type {
  FactoryKPIs,
  OeeHistoryEntry,
  DowntimeCategory,
  MaintenanceRecommendation,
  MachinePerformanceRecord,
  ReliabilityOverview,
  SimulationResult,
} from '../types';
import { exportToCsv } from '../utils/exportUtils';
import toast from 'react-hot-toast';

export const FactoryAnalytics: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [kpis, setKpis] = useState<FactoryKPIs>(mockFactoryKPIs);
  const [oeeHistory, setOeeHistory] = useState<OeeHistoryEntry[]>(mockOeeHistory);
  const [downtimeCategories, setDowntimeCategories] = useState<DowntimeCategory[]>(mockDowntimeCategories);
  const [machineData, setMachineData] = useState<MachinePerformanceRecord[]>(mockMachinePerformanceList);
  const [reliability, setReliability] = useState<ReliabilityOverview>(mockReliabilityOverview);
  const [recommendations, setRecommendations] = useState<MaintenanceRecommendation[]>(mockMaintenanceRecommendations);

  // What-If Simulation State
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [simDowntimeCut, setSimDowntimeCut] = useState<number>(25);
  const [simSpeedBoost, setSimSpeedBoost] = useState<number>(8);
  const [simScrapCut, setSimScrapCut] = useState<number>(30);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Fetch real backend data on mount, with graceful fallback to mock data
  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, oeeRes, dtRes, machRes, relRes, recRes] = await Promise.allSettled([
        analyticsService.getKPIs(),
        analyticsService.getOeeHistory(),
        analyticsService.getDowntimeBreakdown(),
        analyticsService.getMachinePerformance(),
        analyticsService.getReliability(),
        analyticsService.getRecommendations(),
      ]);

      if (kpiRes.status === 'fulfilled' && kpiRes.value) setKpis(kpiRes.value);
      if (oeeRes.status === 'fulfilled' && oeeRes.value.length > 0) setOeeHistory(oeeRes.value);
      if (dtRes.status === 'fulfilled' && dtRes.value.length > 0) setDowntimeCategories(dtRes.value);
      if (machRes.status === 'fulfilled' && machRes.value.length > 0) setMachineData(machRes.value);
      if (relRes.status === 'fulfilled' && relRes.value) setReliability(relRes.value);
      if (recRes.status === 'fulfilled' && recRes.value.length > 0) setRecommendations(recRes.value);
    } catch {
      // Retain robust mock data fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const handleExportAnalytics = () => {
    exportToCsv('predictx-factory-analytics-oee', oeeHistory);
    toast.success('Factory OEE & Analytics dataset exported');
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await analyticsService.runSimulation({
        downtime_reduction_pct: simDowntimeCut,
        speed_improvement_pct: simSpeedBoost,
        scrap_reduction_pct: simScrapCut,
        investment_cost_usd: 15000,
      });
      if (res) {
        setSimResult(res);
        toast.success('Simulation executed against live baseline');
      } else {
        // Compute client-side fallback simulation
        const currentOee = kpis.overallOEE;
        const oeeBoost = Number((simDowntimeCut * 0.15 + simSpeedBoost * 0.45 + simScrapCut * 0.12).toFixed(1));
        const simOee = Math.min(99.0, Number((currentOee + oeeBoost).toFixed(1)));
        const addUnits = Math.round(simSpeedBoost * 450 + simDowntimeCut * 320);
        const gain = Math.round(addUnits * 25.0 + simDowntimeCut * 180);

        setSimResult({
          baseline: {
            oee_pct: currentOee,
            availability_pct: kpis.availability,
            performance_pct: kpis.performance,
            quality_pct: kpis.quality,
            operating_hours: 2680,
            downtime_hours: kpis.totalDowntimeHours,
            total_units: kpis.totalUnits || 58420,
            good_units: kpis.goodUnits || 57602,
            rejected_units: kpis.rejectedUnits || 818,
          },
          simulated: {
            oee_pct: simOee,
            availability_pct: Math.min(99.0, Number((kpis.availability + simDowntimeCut * 0.2).toFixed(1))),
            performance_pct: Math.min(99.0, Number((kpis.performance + simSpeedBoost * 0.8).toFixed(1))),
            quality_pct: Math.min(99.8, Number((kpis.quality + simScrapCut * 0.05).toFixed(1))),
            operating_hours: 2715,
            downtime_hours: Math.max(2.0, Number((kpis.totalDowntimeHours * (1 - simDowntimeCut / 100)).toFixed(1))),
            total_units: (kpis.totalUnits || 58420) + addUnits,
            good_units: (kpis.goodUnits || 57602) + addUnits + 150,
            rejected_units: Math.max(100, Math.round((kpis.rejectedUnits || 818) * (1 - simScrapCut / 100))),
          },
          delta: {
            oee_gain_pct: oeeBoost,
            availability_gain_pct: Number((simDowntimeCut * 0.2).toFixed(1)),
            performance_gain_pct: Number((simSpeedBoost * 0.8).toFixed(1)),
            quality_gain_pct: Number((simScrapCut * 0.05).toFixed(1)),
            additional_good_units: addUnits + 150,
            recovered_downtime_hours: Number((kpis.totalDowntimeHours * (simDowntimeCut / 100)).toFixed(1)),
          },
          financial_impact: {
            gross_margin_gain_usd: gain,
            overhead_savings_usd: Math.round(simDowntimeCut * 180),
            total_benefit_usd: gain + Math.round(simDowntimeCut * 180),
            investment_cost_usd: 15000,
            net_roi_pct: Math.round(((gain + simDowntimeCut * 180 - 15000) / 15000) * 100),
            payback_months: 2.1,
          },
        });
        toast.success('Simulation executed successfully');
      }
    } catch {
      toast.error('Simulation calculation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Factory Intelligence & Performance Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              OEE & Decision Engine
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Overall Equipment Effectiveness (Availability × Performance × Quality), Downtime Pareto, MTBF/MTTR, and Rule-Based Decision Intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setShowSimModal(!showSimModal);
              if (!simResult) handleRunSimulation();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-all shadow-2xs"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>What-If Simulator</span>
          </button>

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
            onClick={loadAnalyticsData}
            title="Refresh telemetry"
            className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Primary Factory Analytics KPI Cards (Part 1.1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard
          title="Availability"
          value={kpis.availability}
          unit="%"
          icon={Clock}
          change={+1.2}
          description="Operating / Planned Time"
        />
        <StatCard
          title="Performance"
          value={kpis.performance}
          unit="%"
          icon={Activity}
          change={+0.8}
          description="Cycle Speed Adherence"
        />
        <StatCard
          title="Quality Rate"
          value={kpis.quality}
          unit="%"
          icon={CheckCircle2}
          statusVariant="success"
          change={+0.3}
          description="First-Pass Yield"
        />
        <StatCard
          title="Overall OEE"
          value={kpis.overallOEE}
          unit="%"
          icon={Gauge}
          statusVariant="info"
          change={+1.8}
          description="A × P × Q Combined"
        />
        <StatCard
          title="Total Downtime"
          value={kpis.totalDowntimeHours}
          unit="Hours"
          icon={Clock}
          change={-2.4}
          isPositiveGood={true}
          description="Lost shift stoppage"
        />
        <StatCard
          title="MTBF"
          value={kpis.mtbfHours}
          unit="Hours"
          icon={TrendingUp}
          statusVariant="success"
          description="Mean Time Between Failures"
        />
        <StatCard
          title="MTTR"
          value={kpis.mttrHours}
          unit="Hours"
          icon={Wrench}
          description="Mean Time To Repair"
        />
        <StatCard
          title="Utilization"
          value={kpis.machineUtilization}
          unit="%"
          icon={Layers}
          change={+3.5}
          description="Shift Loading Rate"
        />
      </div>

      {/* Production Units Summary Banner (Part 1.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Production Units</p>
            <p className="text-lg font-bold font-mono text-white">{(kpis.totalUnits || 58420).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Total parts manufactured during window</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Good Units (Conforming)</p>
            <p className="text-lg font-bold font-mono text-emerald-400">{(kpis.goodUnits || 57602).toLocaleString()}</p>
            <p className="text-[10px] text-emerald-500/80 font-semibold">{kpis.quality}% quality pass rate</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Rejected / Scrap Units</p>
            <p className="text-lg font-bold font-mono text-rose-400">{(kpis.rejectedUnits || 818).toLocaleString()}</p>
            <p className="text-[10px] text-rose-400/80 font-semibold">{((100 - kpis.quality)).toFixed(2)}% scrap loss rate</p>
          </div>
        </div>
      </div>

      {/* What-If Scenario Simulator Panel (Part 4) */}
      {showSimModal && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 dark:bg-blue-950/40 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Continuous Improvement What-If Simulator</h3>
                <p className="text-xs text-slate-400">Model operational and financial returns from TPM downtime reduction, cycle speed optimization, and scrap reduction.</p>
              </div>
            </div>
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Recalculate Model</span>
            </button>
          </div>

          {/* Slider Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Downtime Reduction (TPM / SMED)</span>
                <span className="font-mono font-bold text-blue-400">{simDowntimeCut}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={simDowntimeCut}
                onChange={(e) => setSimDowntimeCut(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Eliminates unplanned breakdowns via autonomous maintenance.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Speed Optimization (Micro-Stops)</span>
                <span className="font-mono font-bold text-purple-400">{simSpeedBoost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={simSpeedBoost}
                onChange={(e) => setSimSpeedBoost(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Cures feeder chatter and recovers design feed rates.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Scrap Defect Reduction (Six Sigma)</span>
                <span className="font-mono font-bold text-emerald-400">{simScrapCut}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={simScrapCut}
                onChange={(e) => setSimScrapCut(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Recalibrates tool offsets and incoming material spec.</p>
            </div>
          </div>

          {/* Simulation Output Comparison Cards */}
          {simResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Simulated OEE</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-blue-400">{simResult.simulated.oee_pct}%</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center">
                    <ArrowUpRight className="h-3 w-3" /> +{simResult.delta.oee_gain_pct}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Baseline: {simResult.baseline.oee_pct}%</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Additional Finished Goods</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-400">+{simResult.delta.additional_good_units.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">units</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Defects cut by {simScrapCut}%</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Recovered Uptime</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-teal-400">+{simResult.delta.recovered_downtime_hours}h</span>
                  <span className="text-xs text-slate-400">operating</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Stoppages cut by {simDowntimeCut}%</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Projected Net ROI</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-400">+{simResult.financial_impact.net_roi_pct}%</span>
                  <span className="text-xs text-slate-400">annual</span>
                </div>
                <p className="text-[10px] text-emerald-400/90 mt-0.5">${simResult.financial_impact.total_benefit_usd.toLocaleString()} gain (Payback: {simResult.financial_impact.payback_months} mo)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OEE Trend Chart & OEE Pillar Decomposition (Part 1.1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartContainer
          title="Weekly OEE Composite Trend vs World-Class Target"
          subtitle="World-class manufacturing benchmark is 85.0% OEE"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={oeeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">TPM Six Big Losses breakdown</p>
          </div>

          <div className="space-y-4 my-auto py-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">1. Availability Rate</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">{kpis.availability}%</span>
              </div>
              <ProgressBar value={kpis.availability} colorVariant="default" size="sm" showValue={false} />
              <p className="text-[10px] text-slate-400 mt-1">Losses: Equipment breakdowns & setup changeovers</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">2. Performance Efficiency</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">{kpis.performance}%</span>
              </div>
              <ProgressBar value={kpis.performance} colorVariant="warning" size="sm" showValue={false} />
              <p className="text-[10px] text-slate-400 mt-1">Losses: Minor idling stops & reduced speed throttling</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">3. Quality Pass Yield</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{kpis.quality}%</span>
              </div>
              <ProgressBar value={kpis.quality} colorVariant="success" size="sm" showValue={false} />
              <p className="text-[10px] text-slate-400 mt-1">Losses: Startup rejection & production defects</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">World-Class Target: 85%</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">Current: {kpis.overallOEE}%</span>
          </div>
        </div>
      </div>

      {/* Production Downtime Analysis (Part 1.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartContainer
          title="Downtime Pareto Breakdown by Root Cause"
          subtitle="Identifies the primary drivers of factory stoppage hours and financial loss"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downtimeCategories} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis type="number" stroke="#64748B" fontSize={11} unit="h" />
                <YAxis dataKey="category" type="category" stroke="#64748B" fontSize={10} width={120} tickLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'hours' ? `${val} hours` : `$${val.toLocaleString()}`,
                    name === 'hours' ? 'Downtime Duration' : 'Financial Impact',
                  ]}
                  contentStyle={{
                    backgroundColor: '#121215',
                    borderColor: '#2A2A33',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="hours" name="Stoppage (Hours)" fill="#F43F5E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Downtime Executive Loss Impact Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Downtime Financial Impact</h3>
              <span className="p-1 rounded bg-rose-500/10 text-rose-500 text-xs font-bold font-mono">-$27,100</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Direct labor loss + lost production margin</p>
          </div>

          <div className="space-y-3 my-auto py-2">
            {downtimeCategories.slice(0, 4).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]">{cat.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{cat.hours}h</span>
                  <span className="text-[10px] text-slate-400 block">${cat.costImpact.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Lost Stoppage:</span>
            <span className="font-bold text-rose-500 font-mono">{kpis.totalDowntimeHours} Hours</span>
          </div>
        </div>
      </div>

      {/* Machine Performance Comparison (Part 1.1 & 1.2) */}
      <ChartContainer
        title="Fleet Machine-Wise Performance Comparison"
        subtitle="Individual equipment Availability, Performance, and Overall OEE ratings"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={machineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="machine_name" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
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
              <Bar dataKey="oee" name="Overall OEE (%)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="availability" name="Availability (%)" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="performance" name="Performance (%)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* MTBF and MTTR Reliability Analysis Section (Part 1.3 & 1.4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MTBF Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">MTBF – Mean Time Between Failures</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Formula: MTBF = Total Operating Time / Number of Failures</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Factory Fleet MTBF</span>
              <span className="text-lg font-bold font-mono text-emerald-500">{reliability.factory_mtbf_hours}h</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2 px-2">Machine</th>
                  <th className="py-2 px-2 text-center">Runtime</th>
                  <th className="py-2 px-2 text-center">Failures</th>
                  <th className="py-2 px-2 text-center">MTBF (h)</th>
                  <th className="py-2 px-2 text-right">Reliability Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {reliability.machine_mtbf_rankings.map((m) => (
                  <tr key={m.machine_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-2 font-sans font-semibold text-slate-800 dark:text-slate-200">{m.machine_name}</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">{m.operating_time_hours}h</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">{m.failure_count}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-900 dark:text-white">{m.mtbf_display}</td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                        m.status === 'EXCELLENT' ? 'bg-emerald-500/15 text-emerald-400' :
                        m.status === 'OPTIMAL' ? 'bg-blue-500/15 text-blue-400' :
                        m.status === 'WARNING' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-rose-500/15 text-rose-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MTTR Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">MTTR – Mean Time To Repair</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Formula: MTTR = Total Repair Time / Number of Repairs</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Factory Fleet MTTR</span>
              <span className="text-lg font-bold font-mono text-purple-400">{reliability.factory_mttr_hours}h ({reliability.factory_mttr_minutes}m)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2 px-2">Machine</th>
                  <th className="py-2 px-2 text-center">Repair Time</th>
                  <th className="py-2 px-2 text-center">Repairs</th>
                  <th className="py-2 px-2 text-center">MTTR</th>
                  <th className="py-2 px-2 text-right">Maintainability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {reliability.machine_mttr_rankings.map((m) => (
                  <tr key={m.machine_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-2 font-sans font-semibold text-slate-800 dark:text-slate-200">{m.machine_name}</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">{m.total_repair_time_hours}h</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">{m.repair_count}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-900 dark:text-white">{m.mttr_display}</td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                        m.status === 'RAPID' || m.status === 'NO_REPAIRS' ? 'bg-emerald-500/15 text-emerald-400' :
                        m.status === 'ACCEPTABLE' ? 'bg-blue-500/15 text-blue-400' :
                        m.status === 'PROLONGED' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-rose-500/15 text-rose-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Decision Intelligence Maintenance Recommendation Engine (Part 2) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Factory Decision Intelligence – Maintenance Recommendations
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated rule-based engineering recommendations derived from OEE, Availability, Performance, Quality, Downtime, MTBF, and MTTR.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Info className="h-3 w-3 text-blue-400" />
              Deterministic Rule Engine (Not AI Predictions)
            </span>
          </div>
        </div>

        {/* Recommendation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => {
            const isHigh = rec.priority === 'HIGH';
            const isMed = rec.priority === 'MEDIUM';

            return (
              <div
                key={`${rec.machine_id}-${index}`}
                className={`p-4 rounded-xl border transition-all ${
                  isHigh
                    ? 'border-rose-500/30 bg-rose-50/30 dark:bg-rose-950/20'
                    : isMed
                    ? 'border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{rec.machine_id}</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{rec.machine_name}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      isHigh
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : isMed
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-xs font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {rec.problem}
                  </p>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    Trigger Metric: <strong className="text-slate-800 dark:text-slate-200">{rec.metric}</strong> = {rec.observed_value}{rec.unit} (Limit: {rec.threshold}{rec.unit})
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {rec.explanation}
                </p>

                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-200">
                    <Wrench className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <span><strong>Action:</strong> {rec.action}</span>
                  </div>
                  <button
                    onClick={() => toast.success(`Work order created for ${rec.machine_name}`)}
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                  >
                    Dispatch
                  </button>
                </div>

                {rec.ml_augmented && (
                  <div className="mt-2 text-[10px] text-purple-400 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Augmented with Member 1 Survival Model (Risk: {((rec.ml_risk_score || 0) * 100).toFixed(0)}%)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
