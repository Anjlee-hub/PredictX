import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Cpu,
  Sparkles,
  SearchCheck,
  HeartPulse,
  BarChart3,
  Wrench,
  AlertTriangle,
  Sliders,
  FileBarChart,
  Settings,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useMachines } from '../context/MachineContext';
import { useAlerts } from '../context/AlertContext';

interface MissionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissionMatrixModal: React.FC<MissionMatrixModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { machines } = useMachines();
  const { alerts, criticalCount } = useAlerts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const healthyCount = machines.filter((m) => m.status === 'healthy').length;
  const warningCount = machines.filter((m) => m.status === 'warning').length;
  const criticalMachines = machines.filter((m) => m.status === 'critical').length;

  const operationalWings = [
    {
      category: 'Telemetry & Fleet Monitoring',
      description: 'Continuous 100Hz vibration, torque, and thermal telemetry',
      modules: [
        {
          title: 'Mission Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          metric: '10 Industrial KPIs',
          status: 'Optimal',
        },
        {
          title: 'Machine Fleet Management',
          path: '/machines',
          icon: Cpu,
          metric: `${machines.length} Active Workcells`,
          status: `${healthyCount} Healthy • ${warningCount} Warning`,
        },
      ],
    },
    {
      category: 'AI Prognostics & Physics Engines',
      description: 'Multi-sensor condition classification and physics RUL degradation',
      modules: [
        {
          title: 'AI Prediction Studio',
          path: '/predictions',
          icon: Sparkles,
          metric: 'XGBoost v3.4 Inference',
          status: '98.8% Test Accuracy',
        },
        {
          title: 'Explainable AI (TreeSHAP)',
          path: '/explainability',
          icon: SearchCheck,
          metric: 'Cooperative Game Theory',
          status: 'SHAP Waterfall Active',
        },
        {
          title: 'Survival Analysis (PHM)',
          path: '/survival-analysis',
          icon: HeartPulse,
          metric: 'Kaplan-Meier S(t) Curve',
          status: 'Cox Proportional Hazards',
        },
      ],
    },
    {
      category: 'Plant Operations & Interventions',
      description: 'TPM efficiency benchmarks, work order dispatch, and alarm response',
      modules: [
        {
          title: 'Factory Analytics & OEE',
          path: '/factory-analytics',
          icon: BarChart3,
          metric: '86.4% Overall OEE',
          status: 'A: 92% • P: 95% • Q: 99%',
        },
        {
          title: 'Maintenance CMMS Dispatch',
          path: '/maintenance',
          icon: Wrench,
          metric: '12 Active Work Orders',
          status: 'Next dispatch in 3h',
        },
        {
          title: 'Alarms & Anomaly Center',
          path: '/alerts',
          icon: AlertTriangle,
          metric: `${criticalCount} Critical Alarms`,
          status: `${alerts.length} Total Registered`,
          badge: criticalCount > 0 ? `${criticalCount} ALARM` : undefined,
        },
      ],
    },
    {
      category: 'System Engineering & Governance',
      description: 'Monte Carlo digital twin simulations and DIN EN ISO compliance',
      modules: [
        {
          title: 'Digital Twin Simulator',
          path: '/simulation',
          icon: Sliders,
          metric: 'Monte Carlo What-If',
          status: 'Speed & Derating Engine',
        },
        {
          title: 'Compliance Reports & Audits',
          path: '/reports',
          icon: FileBarChart,
          metric: 'ISO 13374 Condition Data',
          status: 'CSV • PDF • XLSX Export',
        },
        {
          title: 'System & FastAPI Settings',
          path: '/settings',
          icon: Settings,
          metric: 'FastAPI Python Bridge',
          status: 'Ready on :8000/api/v1',
        },
      ],
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop with architectural blur */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Flight Matrix Container */}
      <div className="relative w-full max-w-5xl bg-[#F8F7F4] dark:bg-[#111113] border border-[#E5E5DE] dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden my-6 schematic-box">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5DE] dark:border-slate-800 bg-white dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EA580C] text-white font-mono font-bold text-sm shadow-xs">
              PX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#111827] dark:text-white tracking-tight">
                  PredictX Mission Flight Deck Matrix
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#E5E5DE] dark:border-slate-700">
                  HUD Matrix (⌘M)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Real-time command overview across all 11 industrial AI operational wings.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Mission Matrix (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Facility Status Strip */}
        <div className="px-6 py-3 bg-[#F0EFEB] dark:bg-slate-950/60 border-b border-[#E5E5DE] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#111827] dark:text-white font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Plant Alpha (Detroit) : NOMINAL
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Fleet: <strong className="text-emerald-600">{healthyCount}</strong> healthy / <strong className="text-rose-500">{criticalMachines}</strong> critical
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span>Sampling: 100 Hz</span>
            <span>•</span>
            <span>Edge: 14ms</span>
            <span>•</span>
            <span>Model: RUL-XGBoost v3.4</span>
          </div>
        </div>

        {/* 4 Categorized Flight Matrix Domains */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {operationalWings.map((wing) => (
            <div key={wing.category} className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#E5E5DE]/80 dark:border-slate-800 pb-1.5">
                <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  {wing.category}
                </span>
                <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                  {wing.description}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {wing.modules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.path}
                      onClick={() => handleNavigate(mod.path)}
                      className="group p-3.5 rounded-xl border border-[#E5E5DE] dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#EA580C] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#111827] dark:text-white group-hover:text-[#EA580C] transition-colors">
                              {mod.title}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              {mod.metric}
                            </span>
                          </div>
                        </div>

                        {mod.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                            {mod.badge}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="truncate">{mod.status}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-[#EA580C] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Quick Action Bar */}
        <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-[#E5E5DE] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>ISO 13374 Condition Telemetry Certified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('/predictions')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Run AI Prognostics</span>
            </button>
            <button
              onClick={() => handleNavigate('/machines')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5DE] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Cpu className="h-3.5 w-3.5 text-slate-400" />
              <span>Inspect All 50 Machines</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
