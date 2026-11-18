import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] dark:bg-slate-900 text-[#111827] dark:text-white p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center ring-1 ring-rose-500/20">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Industrial Node Not Found</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          The requested factory route or telemetry endpoint does not exist on this edge gateway.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-xs font-semibold text-white shadow-xs transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E5DE] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
