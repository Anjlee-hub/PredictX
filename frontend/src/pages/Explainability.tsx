import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { initialPredictions } from '../data';
import { RiskBadge } from '../components/Badges';
import { ChartContainer } from '../components/ChartContainer';

export const Explainability: React.FC = () => {
  const [selectedPredId, setSelectedPredId] = useState<string>(initialPredictions[0].id);

  const selectedPrediction = useMemo(() => {
    return initialPredictions.find((p) => p.id === selectedPredId) || initialPredictions[0];
  }, [selectedPredId]);

  // Waterfall Chart data: diverging bars where positive increases failure risk and negative buffers it
  const waterfallData = useMemo(() => {
    return selectedPrediction.shapValues.map((s) => ({
      feature: s.label,
      shapValue: s.shapValue,
      rawVal: `${s.value} ${s.unit}`,
      impact: s.shapValue > 0 ? 'Risk Increasing' : 'Safety Buffer',
      color: s.shapValue > 0 ? '#EF4444' : '#10B981',
    }));
  }, [selectedPrediction]);

  // Global feature importance (across the 10,000 AI4I dataset baseline)
  const globalImportanceData = [
    { feature: 'Cumulative Tool Wear (min)', importance: 0.38, category: 'Mechanical' },
    { feature: 'Spindle Torque Load (Nm)', importance: 0.28, category: 'Mechanical' },
    { feature: 'Thermal Differential ΔT (Process - Air)', importance: 0.18, category: 'Thermodynamics' },
    { feature: 'Rotational Speed (RPM)', importance: 0.10, category: 'Kinematics' },
    { feature: 'Process Airflow Temperature', importance: 0.04, category: 'Environment' },
    { feature: 'Vibration Harmonic Ratio', importance: 0.02, category: 'Vibration' },
  ];

  const positiveFeatures = selectedPrediction.shapValues.filter((s) => s.shapValue > 0);
  const negativeFeatures = selectedPrediction.shapValues.filter((s) => s.shapValue <= 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explainable AI & SHAP Attribution
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              TreeSHAP Explainer
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Interpret machine failure predictions through mathematical Shapley values (Cooperative Game Theory).
          </p>
        </div>

        {/* Snapshot selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Inspection Snapshot:</span>
          <select
            value={selectedPredId}
            onChange={(e) => setSelectedPredId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden"
          >
            {initialPredictions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.machineName} ({p.riskCategory})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Snapshot Header Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Target Machine Case
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedPrediction.machineName} ({selectedPrediction.machineId})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Failure Risk</span>
              <span className="text-base font-extrabold font-mono text-rose-500">
                {selectedPrediction.failureProbability}%
              </span>
            </div>
            <RiskBadge risk={selectedPrediction.riskCategory} />
          </div>
        </div>

        {/* Explanation Summary Prose Card */}
        <div className="mt-4 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 text-xs">
          <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300 mb-1.5">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>AI Reasoning Summary: Why was this failure predicted?</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {selectedPrediction.recommendation}
          </p>
        </div>
      </div>

      {/* SHAP Waterfall Chart & Diverging Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ChartContainer
            title="Local SHAP Waterfall Diverging Chart"
            subtitle="Positive bars push toward failure (red), negative bars buffer machine safety (green)"
            badge={
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Base E[f(x)] = 2.4% → Model Output = {selectedPrediction.failureProbability}%
              </span>
            }
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={waterfallData}
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    width={150}
                  />
                  <Tooltip
                    formatter={(val, _name, item) => [
                      `${val} SHAP value (Observed: ${item.payload.rawVal})`,
                      item.payload.impact,
                    ]}
                    contentStyle={{
                      backgroundColor: '#121215',
                      borderColor: '#2A2A33',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="shapValue" radius={[4, 4, 4, 4]}>
                    {waterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        {/* Top Positive & Negative Drivers */}
        <div className="lg:col-span-4 space-y-4">
          {/* Top Positive (Risk Increasing) */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-rose-100 dark:border-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-400">
              <TrendingUp className="h-4 w-4" />
              <span>Risk Increasing Drivers (+SHAP)</span>
            </div>
            <div className="space-y-2 text-xs">
              {positiveFeatures.map((f) => (
                <div key={f.feature} className="p-2.5 rounded-lg bg-rose-50/40 dark:bg-rose-950/20">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{f.label}</span>
                    <span className="font-mono text-rose-500 font-bold">+{f.shapValue}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Measured: {f.value} {f.unit}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Negative (Health Buffers) */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-emerald-100 dark:border-emerald-900/40 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="h-4 w-4" />
              <span>Safety Margin Buffers (-SHAP)</span>
            </div>
            <div className="space-y-2 text-xs">
              {negativeFeatures.map((f) => (
                <div key={f.feature} className="p-2.5 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{f.label}</span>
                    <span className="font-mono text-emerald-500 font-bold">{f.shapValue}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Measured: {f.value} {f.unit}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Model Feature Importance */}
      <ChartContainer
        title="Global Fleet Feature Importance Ranking (Mean |SHAP|)"
        subtitle="Across 10,000 industrial machine operating cycles in factory training distribution"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={globalImportanceData}
              margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="feature" stroke="#64748B" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val) => [`${(Number(val) * 100).toFixed(0)}% contribution`, 'Global Weight']}
                contentStyle={{
                  backgroundColor: '#121215',
                  borderColor: '#2A2A33',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="importance" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
};
