import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity, ShieldCheck, Terminal } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F7F4] dark:bg-[#08080A] text-[#111827] dark:text-[#F4F4F5]">
      {/* Left Column: Industrial Engineering & Architecture Showcase */}
      <div className="relative lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#E5E5DE] dark:border-[#272730] bg-[#F4F1EA] dark:bg-[#0C0C0E]">
        {/* Subtle engineering grid background */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Top Header: Monolithic Brand Identity */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EA580C] text-white font-mono font-bold text-base shadow-xs">
              PX
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-[#111827] dark:text-white flex items-center gap-2">
                <span>PREDICT<span className="text-[#EA580C]">X</span></span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-[#111827] dark:text-slate-300 border border-slate-300/80 dark:border-slate-700">
                  v4.2-PRO
                </span>
              </div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Factory Intelligence Platform
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-400 bg-white/90 dark:bg-slate-900/90 border border-[#E5E5DE] dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SCADA Gateway 01 : ONLINE</span>
          </div>
        </div>

        {/* Center: Engineering Focus & Architecture Points */}
        <div className="relative z-10 my-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono mb-6 shadow-2xs">
            <Terminal className="h-3.5 w-3.5 text-[#EA580C]" />
            <span>ISO 13374 Condition Monitoring Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-tight">
            Predictive Telemetry. <br />
            Zero Unplanned Line Stoppages.
          </h1>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Continuous vibration harmonics, torque envelopes, thermal gradients, and tool degradation analytics for precision manufacturing cells.
          </p>

          {/* Technical Specifications Matrix */}
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg border border-[#E5E5DE] dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase">Sampling Rate</span>
              <span className="text-[#111827] dark:text-white font-bold text-sm">100 Hz Streaming</span>
            </div>
            <div className="p-3 rounded-lg border border-[#E5E5DE] dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase">Inference Latency</span>
              <span className="text-[#111827] dark:text-white font-bold text-sm">&lt; 18ms Edge</span>
            </div>
            <div className="p-3 rounded-lg border border-[#E5E5DE] dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase">Explainability</span>
              <span className="text-[#111827] dark:text-white font-bold text-sm">TreeSHAP Kernel</span>
            </div>
            <div className="p-3 rounded-lg border border-[#E5E5DE] dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase">Reliability Model</span>
              <span className="text-[#111827] dark:text-white font-bold text-sm">Weibull PHM RUL</span>
            </div>
          </div>
        </div>

        {/* Bottom Technical Status */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#E5E5DE] dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>TLS 1.3 / Modbus TCP</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#EA580C]" />
              <span>50 Active Workcells</span>
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400">Node ID: PX-US-DET-01</span>
        </div>
      </div>

      {/* Right Column: Clean, High-Contrast Form Pane */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#FFFFFF] dark:bg-[#070A11]">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
