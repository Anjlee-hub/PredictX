import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Sparkles,
  Layers,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useMachines } from '../context/MachineContext';
import { simulationService } from '../services';
import type { SimulationScenario } from '../types';
import { initialScenarios } from '../data/mockScenarios';
import { ChartContainer } from '../components/ChartContainer';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

export const Simulation: React.FC = () => {
  const { machines } = useMachines();
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(initialScenarios);

  // Form Inputs
  const [scenarioName, setScenarioName] = useState('Proactive Weekend Bearing Kit Swap');
  const [selectedMachineId, setSelectedMachineId] = useState(machines[0]?.id || 'MAC-004');
  const [maintenanceDate, setMaintenanceDate] = useState(() =>
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [downtimeHours, setDowntimeHours] = useState(3.5);
  const [expectedRepairTimeHours, setExpectedRepairTimeHours] = useState(3.5);
  const [speedAdjustmentPercent, setSpeedAdjustmentPercent] = useState(-5);
  const [lubricationFrequencyDays, setLubricationFrequencyDays] = useState(5);

  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>(initialScenarios[0]);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);

    try {
      await new Promise((r) => setTimeout(r, 600));

      const machine = machines.find((m) => m.id === selectedMachineId);
      const res = await simulationService.runSimulation({
        machineId: selectedMachineId,
        machineName: machine ? machine.name : 'Industrial Unit',
        scenarioName,
        maintenanceDate,
        downtimeHours,
        expectedRepairTimeHours,
        speedAdjustmentPercent,
        lubricationFrequencyDays,
      });

      setActiveScenario(res);
      setScenarios((prev) => [res, ...prev]);
      toast.success('Monte Carlo What-if simulation completed');
    } catch {
      toast.error('Simulation run failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleDeleteScenario = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await simulationService.deleteScenario(id);
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    toast.success('Scenario removed');
  };

  // Comparison chart data across saved scenarios
  const comparisonData = scenarios.slice(0, 4).map((scen) => ({
    name: scen.name.slice(0, 22) + '...',
    baselineOEE: scen.baselineOEE,
    estimatedOEE: scen.estimatedOEE,
    downtimeSaved: scen.downtimeSavedHours,
    costSavedK: Math.round(scen.costSavedDollars / 1000),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              What-If Digital Twin Scenario Simulator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Monte Carlo Engine
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Simulate operational speed adjustments, preventive repair timing, and evaluate projected OEE gains and financial savings.
          </p>
        </div>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Parameter Builder Form */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Simulation Controls</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Variables (5)</span>
          </div>

          <form onSubmit={handleRunSimulation} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Scenario Name
              </label>
              <input
                type="text"
                required
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Machine
                </label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Intervention Date
                </label>
                <input
                  type="date"
                  value={maintenanceDate}
                  onChange={(e) => setMaintenanceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Slider: Planned Downtime */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Planned Maintenance Outage Window
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {downtimeHours} Hours
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.5"
                value={downtimeHours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setDowntimeHours(val);
                  setExpectedRepairTimeHours(val);
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.5h (Quick Tooling)</span>
                <span>4h (Bearing Swap)</span>
                <span>12h (Full Overhaul)</span>
              </div>
            </div>

            {/* Slider: Spindle Operating Speed Adjustment */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Operating Speed Buffer (Load Derating)
                </span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {speedAdjustmentPercent > 0 ? `+${speedAdjustmentPercent}%` : `${speedAdjustmentPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="5"
                value={speedAdjustmentPercent}
                onChange={(e) => setSpeedAdjustmentPercent(parseInt(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>-20% (Stress Relief)</span>
                <span>0% (Nominal Spec)</span>
                <span>+20% (High Output)</span>
              </div>
            </div>

            {/* Lubrication Interval */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Lubrication & Purge Frequency
                </span>
                <span className="font-mono font-bold text-amber-500">
                  Every {lubricationFrequencyDays} Days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                step="1"
                value={lubricationFrequencyDays}
                onChange={(e) => setLubricationFrequencyDays(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isRunning}
              className="w-full py-3 px-4 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Iterating Monte Carlo Iterations...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Execute Digital Twin Simulation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Computed Outputs & Scenario Impact */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Simulation Output Dashboard */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Simulated Scenario Result
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeScenario.name}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Machine: {activeScenario.machineName}
              </span>
            </div>

            {/* Impact Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                <span className="text-[11px] text-slate-500 block mb-0.5">Projected OEE</span>
                <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                  {activeScenario.estimatedOEE}%
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">
                  +{Number(activeScenario.estimatedOEE - activeScenario.baselineOEE).toFixed(1)}% vs Base
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                <span className="text-[11px] text-slate-500 block mb-0.5">Downtime Saved</span>
                <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {activeScenario.downtimeSavedHours}h
                </div>
                <span className="text-[10px] text-slate-400">Avoided outages</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                <span className="text-[11px] text-slate-500 block mb-0.5">Est. Cost Saved</span>
                <div className="text-2xl font-extrabold font-mono text-teal-600 dark:text-teal-400">
                  {formatCurrency(activeScenario.costSavedDollars)}
                </div>
                <span className="text-[10px] text-slate-400">Unplanned losses</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                <span className="text-[11px] text-slate-500 block mb-0.5">Production Gain</span>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  +{activeScenario.productionGainUnits}
                </div>
                <span className="text-[10px] text-slate-400">Additional parts</span>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-300 mb-1">
                <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Simulation Recommendation & ROI:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {activeScenario.recommendation}
              </p>
            </div>
          </div>

          {/* Scenario Comparison Chart */}
          <ChartContainer
            title="Scenario ROI Comparison: Estimated OEE vs Downtime Saved"
            subtitle="Comparing alternative proactive scheduling options"
          >
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
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
                  <Bar dataKey="estimatedOEE" name="Projected OEE (%)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="downtimeSaved" name="Downtime Saved (hrs)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="costSavedK" name="Cost Saved ($K)" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>
      </div>

      {/* Saved Scenarios List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Saved Simulation Scenarios ({scenarios.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Digital twin history</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scen) => (
            <div
              key={scen.id}
              onClick={() => {
                setActiveScenario(scen);
                setSelectedMachineId(scen.machineId);
                setScenarioName(scen.name);
                setDowntimeHours(scen.downtimeHours);
                setSpeedAdjustmentPercent(scen.speedAdjustmentPercent);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeScenario.id === scen.id
                  ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {scen.name}
                </span>
                <button
                  onClick={(e) => handleDeleteScenario(scen.id, e)}
                  className="p-1 rounded text-slate-400 hover:text-rose-500"
                  title="Remove scenario"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 text-[11px] text-slate-500 font-mono">
                {scen.machineName} ({scen.machineId})
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-emerald-600 font-bold">OEE: {scen.estimatedOEE}%</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  {formatCurrency(scen.costSavedDollars)} saved
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
