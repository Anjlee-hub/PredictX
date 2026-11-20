import React from 'react';
import { Activity, ShieldCheck, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5E5DE] dark:border-slate-800/80 bg-[#F8F7F4]/90 dark:bg-slate-900/60 py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: System Health & telemetry status */}
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">SCADA Stream: Active</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
            <span>Sampling: 100 Hz</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <Database className="h-3.5 w-3.5 text-teal-500" />
            <span>FastAPI Bridge: Ready</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 text-slate-400">
            <Cpu className="h-3.5 w-3.5 text-amber-500" />
            <span>Inference Latency: 18ms</span>
          </div>
        </div>

        {/* Right: Copyright and compliance info */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            ISO 13374 Condition Monitoring Certified
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>© 2026 PredictX Platform. Enterprise Edition v4.2</span>
        </div>
      </div>
    </footer>
  );
};
