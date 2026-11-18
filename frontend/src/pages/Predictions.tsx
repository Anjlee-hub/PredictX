import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Cpu,
  Thermometer,
  RotateCw,
  Gauge,
  Scissors,
  History,
  ArrowRight,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react';
import { useMachines } from '../context/MachineContext';
import { predictionService } from '../services';
import type { PredictionResult, PredictionInput } from '../types';
import { initialPredictions } from '../data';
import { RiskBadge } from '../components/Badges';
import { ProgressBar } from '../components/ProgressBar';
import toast from 'react-hot-toast';

export const Predictions: React.FC = () => {
  const navigate = useNavigate();
  const { machines } = useMachines();

  const [history, setHistory] = useState<PredictionResult[]>(initialPredictions);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || 'MAC-001');

  // Interactive inputs state
  const [inputValues, setInputValues] = useState<PredictionInput>({
    machineId: machines[0]?.id || 'MAC-001',
    airTemperature: machines[0]?.airTemperature || 24.5,
    processTemperature: machines[0]?.processTemperature || 34.0,
    rpm: machines[0]?.rpm || 1500,
    torque: machines[0]?.torque || 42.0,
    toolWear: machines[0]?.toolWear || 55,
  });

  const [isInferring, setIsInferring] = useState(false);
  const [latestResult, setLatestResult] = useState<PredictionResult>(initialPredictions[0]);

  // When user picks a machine from dropdown, prefill its actual telemetry
  const handleMachineSelect = (mId: string) => {
    setSelectedMachineId(mId);
    const m = machines.find((item) => item.id === mId);
    if (m) {
      setInputValues({
        machineId: m.id,
        airTemperature: m.airTemperature,
        processTemperature: m.processTemperature,
        rpm: m.rpm,
        torque: m.torque,
        toolWear: m.toolWear,
      });
    }
  };

  // Run AI model prediction
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInferring(true);

    try {
      // Simulate inference time
      await new Promise((r) => setTimeout(r, 600));

      const machine = machines.find((m) => m.id === inputValues.machineId);
      const res = await predictionService.predict(inputValues, machine?.name || 'Unit');
      setLatestResult(res);
      setHistory((prev) => [res, ...prev]);

      if (res.riskCategory === 'Critical') {
        toast.error(`CRITICAL RISK: ${res.failureProbability}% failure probability!`, {
          icon: '⚠️',
          duration: 4000,
        });
      } else if (res.riskCategory === 'High') {
        toast('High Risk Anomaly Detected', { icon: '⚡' });
      } else {
        toast.success(`Inference Complete: Machine is ${res.riskCategory} Risk`);
      }
    } catch {
      toast.error('Prediction inference failed');
    } finally {
      setIsInferring(false);
    }
  };

  const handleLoadHistory = (item: PredictionResult) => {
    setInputValues(item.inputValues);
    setSelectedMachineId(item.machineId);
    setLatestResult(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success(`Loaded prediction snapshot #${item.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Predictive Maintenance Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              XGBoost + SHAP
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-sensor prognostic modeling for failure probability, failure mode, and remaining useful life (RUL).
          </p>
        </div>

        <button
          onClick={() => navigate('/explainability')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#E5E5DE] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-all cursor-pointer"
        >
          <SearchCheck className="h-4 w-4 text-[#EA580C]" />
          <span>Inspect SHAP Feature Importance →</span>
        </button>
      </div>

      {/* Main Grid: Form on Left, Output Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prediction Input Form */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Telemetry Input Parameters</h2>
            </div>
            <button
              type="button"
              onClick={() => handleMachineSelect(selectedMachineId)}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              title="Reset to current machine live sensors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset live</span>
            </button>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            {/* Machine Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Machine Selection
              </label>
              <select
                value={selectedMachineId}
                onChange={(e) => handleMachineSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} - {m.name} ({m.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Slider & Input: Process Temperature */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-rose-500" />
                  Process Temperature (°C)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {inputValues.processTemperature}°C
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="0.5"
                value={inputValues.processTemperature}
                onChange={(e) =>
                  setInputValues({ ...inputValues, processTemperature: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>20°C (Idle)</span>
                <span>40°C (Warning)</span>
                <span>60°C (Choke)</span>
              </div>
            </div>

            {/* Slider & Input: Air Temp */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-blue-500" />
                  Air Temperature (°C)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {inputValues.airTemperature}°C
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="38"
                step="0.5"
                value={inputValues.airTemperature}
                onChange={(e) =>
                  setInputValues({ ...inputValues, airTemperature: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>15°C (Climate Controlled)</span>
                <span>38°C (Extreme Ambient)</span>
              </div>
            </div>

            {/* Rotational Speed */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5 text-teal-500" />
                  Rotational Speed (RPM)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {inputValues.rpm} RPM
                </span>
              </div>
              <input
                type="range"
                min="800"
                max="2800"
                step="50"
                value={inputValues.rpm}
                onChange={(e) =>
                  setInputValues({ ...inputValues, rpm: parseInt(e.target.value) })
                }
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>800 (Low Torque)</span>
                <span>1500 (Nominal)</span>
                <span>2800 (Max Spec)</span>
              </div>
            </div>

            {/* Spindle Torque */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-amber-500" />
                  Torque (Nm)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {inputValues.torque} Nm
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                step="1"
                value={inputValues.torque}
                onChange={(e) =>
                  setInputValues({ ...inputValues, torque: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10 Nm (Free)</span>
                <span>40 Nm (Nominal)</span>
                <span>85 Nm (Overload)</span>
              </div>
            </div>

            {/* Tool Wear Time */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Scissors className="h-3.5 w-3.5 text-rose-500" />
                  Cumulative Tool Wear Time (min)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {inputValues.toolWear} min
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="260"
                step="5"
                value={inputValues.toolWear}
                onChange={(e) =>
                  setInputValues({ ...inputValues, toolWear: parseInt(e.target.value) })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0 min (Fresh Insert)</span>
                <span>180 min (Inspect)</span>
                <span>240 min (Fracture Limit)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isInferring}
              className="w-full py-3 px-4 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isInferring ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Computing Multi-Sensor Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run AI Model Inference</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Output & Recommendation */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Result Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs relative overflow-hidden">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400">
                  Model Output Snapshot: {latestResult.id}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {latestResult.machineName} ({latestResult.machineId})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge risk={latestResult.riskCategory} />
                <span className="text-xs font-mono text-slate-500">
                  {latestResult.predictionTime}
                </span>
              </div>
            </div>

            {/* Key Metrics Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              {/* Failure Probability */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">
                  Failure Probability
                </span>
                <div
                  className={`text-3xl font-extrabold font-mono ${
                    latestResult.failureProbability > 75
                      ? 'text-rose-600 dark:text-rose-400'
                      : latestResult.failureProbability > 40
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {latestResult.failureProbability}%
                </div>
                <div className="mt-2">
                  <ProgressBar
                    value={latestResult.failureProbability}
                    showValue={false}
                    colorVariant="dynamic"
                    size="sm"
                  />
                </div>
              </div>

              {/* Dominant Failure Mode */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center flex flex-col justify-between">
                <span className="text-[11px] font-medium text-slate-500 block">
                  Identified Failure Mode
                </span>
                <div className="text-sm font-bold text-slate-900 dark:text-white my-1">
                  {latestResult.failureMode}
                </div>
                <span className="text-[10px] text-slate-400">Physics Classifier</span>
              </div>

              {/* Remaining Useful Life */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center flex flex-col justify-between">
                <span className="text-[11px] font-medium text-slate-500 block">
                  Estimated RUL Horizon
                </span>
                <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400 my-1">
                  {latestResult.estimatedRULHours} hrs
                </div>
                <span className="text-[10px] text-slate-400">
                  Confidence: {latestResult.confidence}%
                </span>
              </div>
            </div>

            {/* Actionable AI Recommendation */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 text-xs">
              <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300 mb-1">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Prescriptive Maintenance Recommendation:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {latestResult.recommendation}
              </p>
            </div>

            {/* SHAP Contributors Quick Preview */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  SHAP Feature Contributions Preview
                </span>
                <button
                  onClick={() => navigate('/explainability')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                >
                  Full Waterfall Chart <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {latestResult.shapValues.slice(0, 6).map((shap) => (
                  <div
                    key={shap.feature}
                    className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30"
                  >
                    <div className="text-slate-500 text-[11px] truncate">{shap.label}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-xs font-semibold">
                        {shap.value} {shap.unit}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold ${
                          shap.shapValue > 0 ? 'text-rose-500' : 'text-emerald-500'
                        }`}
                      >
                        {shap.shapValue > 0 ? `+${shap.shapValue}` : shap.shapValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Predictions Log */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Prediction Inferences History Log ({history.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time inference cache</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Snapshot ID</th>
                <th className="py-2.5 px-3">Machine</th>
                <th className="py-2.5 px-3">Failure Prob</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Est. RUL</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                    {item.id}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                    {item.machineName} ({item.machineId})
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    <span
                      className={
                        item.failureProbability > 75
                          ? 'text-rose-500'
                          : item.failureProbability > 40
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }
                    >
                      {item.failureProbability}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <RiskBadge risk={item.riskCategory} />
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{item.failureMode}</td>
                  <td className="py-2.5 px-3 font-mono font-medium">{item.estimatedRULHours}h</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-500">{item.confidence}%</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleLoadHistory(item)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold transition-colors"
                    >
                      Load Snapshot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
