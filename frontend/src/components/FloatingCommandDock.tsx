import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Search,
  Grid3X3,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  GitBranch,
} from 'lucide-react';
import { useMachines } from '../context/MachineContext';
import { exportToCsv } from '../utils/exportUtils';
import toast from 'react-hot-toast';

interface FloatingCommandDockProps {
  onOpenSearch: () => void;
  onOpenMatrix: () => void;
  onOpenBranch?: () => void;
}

export const FloatingCommandDock: React.FC<FloatingCommandDockProps> = ({
  onOpenSearch,
  onOpenMatrix,
  onOpenBranch,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { machines } = useMachines();
  const [isMinimized, setIsMinimized] = useState(false);

  const avgHealth = Math.round(
    machines.reduce((acc, m) => acc + m.healthPercentage, 0) / (machines.length || 1)
  );

  const handleQuickExport = () => {
    exportToCsv(
      `predictx-quick-telemetry-${new Date().toISOString().split('T')[0]}`,
      machines.slice(0, 20).map((m) => ({
        ID: m.id,
        Name: m.name,
        Status: m.status,
        Health: `${m.healthPercentage}%`,
        ProcTemp: `${m.processTemperature}°C`,
        RPM: m.rpm,
        Torque: `${m.torque}Nm`,
        ToolWear: `${m.toolWear}min`,
      }))
    );
    toast.success('Active telemetry snapshot exported to CSV');
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-capsule text-xs font-semibold text-[#111827] dark:text-white hover:border-[#EA580C] transition-all cursor-pointer shadow-lg group glow-subtle"
          title="Expand Tactical Command Dock"
        >
          <div className="flex items-center gap-0.5 h-3">
            <span className="h-2 w-0.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="h-3 w-0.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-0.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">DOCK</span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full">
            {avgHealth}%
          </span>
          <ChevronUp className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[94%] sm:w-auto">
      <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 px-3 py-2 rounded-full glass-capsule transition-all shadow-xl glow-subtle">
        {/* Heartbeat Status Indicator with Animated Wave & Fleet Health */}
        <div
          onClick={onOpenMatrix}
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F8F7F4]/90 dark:bg-slate-800/80 border border-[#E5E5DE] dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 cursor-pointer hover:border-[#EA580C] transition-colors shadow-2xs"
          title="Click to view full flight deck matrix (⌘M)"
        >
          <div className="flex items-center gap-0.5 h-3">
            <span className="h-2 w-0.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="h-3.5 w-0.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-0.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="font-bold text-[#111827] dark:text-white">{avgHealth}% Health</span>
        </div>

        {/* Primary Decisive Action: Signature Burnt Orange Pop */}
        <button
          onClick={() => navigate('/predictions')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer ${
            location.pathname === '/predictions'
              ? 'bg-[#C2410C] text-white ring-2 ring-[#EA580C]/40'
              : 'bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white hover:scale-[1.02]'
          }`}
          title="Run XGBoost Multi-Sensor Diagnostics"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Prognosis</span>
        </button>

        {/* Branch Circuit HUD Button */}
        {onOpenBranch && (
          <button
            onClick={onOpenBranch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#E5E5DE] dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-[#EA580C] hover:text-[#EA580C] hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-all cursor-pointer group"
            title="Open Visual Branch Topology Circuit HUD (⌘B)"
          >
            <GitBranch className="h-3.5 w-3.5 text-[#EA580C] group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Branch</span>
            <span className="chiclet-key hidden lg:inline">⌘B</span>
          </button>
        )}

        {/* Quick Work Order Action */}
        <button
          onClick={() => navigate('/maintenance')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            location.pathname === '/maintenance'
              ? 'bg-[#111827] text-white dark:bg-[#1C1C21] dark:text-[#EA580C] border-[#111827] dark:border-[#EA580C] shadow-xs'
              : 'border-[#E5E5DE] dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs'
          }`}
          title="Dispatch Preventive Maintenance Work Order"
        >
          <Plus className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Work Order</span>
        </button>

        {/* Mission Matrix HUD Button */}
        <button
          onClick={onOpenMatrix}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#E5E5DE] dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-[#EA580C] hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-all cursor-pointer group"
          title="Open Flight Deck Mission Matrix (⌘M)"
        >
          <Grid3X3 className="h-3.5 w-3.5 text-[#EA580C] group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline">Matrix</span>
          <span className="chiclet-key hidden lg:inline">⌘M</span>
        </button>

        {/* Global Omnisearch Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border border-[#E5E5DE] dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
          title="Search telemetry, machines, pages (⌘K)"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="chiclet-key">⌘K</span>
        </button>

        {/* Export Telemetry */}
        <button
          onClick={handleQuickExport}
          className="hidden sm:flex items-center p-1.5 rounded-full text-slate-500 hover:text-[#EA580C] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Export Active Telemetry Snapshot (CSV)"
        >
          <FileSpreadsheet className="h-4 w-4" />
        </button>

        {/* Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Minimize Dock"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
