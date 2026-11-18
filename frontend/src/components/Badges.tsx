import React from 'react';
import type { MachineStatus, RiskLevel, AlertSeverity, MaintenancePriority } from '../types';

export const StatusBadge: React.FC<{ status: MachineStatus }> = ({ status }) => {
  const config = {
    healthy: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-300/60 dark:border-emerald-800/60', dot: 'bg-emerald-500' },
    warning: { bg: 'bg-amber-500/10 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-300/60 dark:border-amber-800/60', dot: 'bg-amber-500' },
    critical: { bg: 'bg-rose-500/10 dark:bg-rose-500/15', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-300/60 dark:border-rose-800/60', dot: 'bg-rose-500' },
    offline: { bg: 'bg-slate-500/10 dark:bg-slate-500/15', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-300/60 dark:border-slate-700/60', dot: 'bg-slate-400' },
  }[status] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <span className="relative flex h-1.5 w-1.5">
        {status === 'critical' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`}></span>
      </span>
      {status.toUpperCase()}
    </span>
  );
};

export const RiskBadge: React.FC<{ risk: RiskLevel }> = ({ risk }) => {
  const config = {
    Low: { bg: 'bg-emerald-500/10 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300/60 dark:border-emerald-800/60' },
    Medium: { bg: 'bg-amber-500/10 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300/60 dark:border-amber-800/60' },
    High: { bg: 'bg-orange-500/10 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300/60 dark:border-orange-800/60' },
    Critical: { bg: 'bg-rose-500/10 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300/60 dark:border-rose-800/60' },
  }[risk] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
      {risk}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  const config = {
    critical: { bg: 'bg-red-500/10 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-400', border: 'border-red-300/60 dark:border-red-800/60' },
    high: { bg: 'bg-orange-500/10 dark:bg-orange-500/15', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-300/60 dark:border-orange-800/60' },
    medium: { bg: 'bg-amber-500/10 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-300/60 dark:border-amber-800/60' },
    low: { bg: 'bg-blue-500/10 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-300/60 dark:border-blue-800/60' },
  }[severity] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
      {severity}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: MaintenancePriority }> = ({ priority }) => {
  const config = {
    urgent: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300/60 dark:border-rose-800/60',
    high: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-800/60',
    medium: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300/60 dark:border-blue-800/60',
    low: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:border-slate-700/60',
  }[priority] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wide border ${config}`}>
      {priority}
    </span>
  );
};
