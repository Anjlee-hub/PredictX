import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  change?: number; // e.g. +3.2 or -1.5
  changePeriod?: string;
  isPositiveGood?: boolean;
  statusVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  description?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  change,
  changePeriod = 'vs last 7d',
  isPositiveGood = true,
  statusVariant = 'default',
  description,
  onClick,
  className = '',
}) => {
  const isPositive = change !== undefined ? change > 0 : null;
  const isNeutral = change === 0;

  // Determine if the change color is good or bad
  const isGood = isPositiveGood ? isPositive : !isPositive;

  const variantStyles = {
    default: 'border-[#E5E5DE] dark:border-slate-800/80 bg-white dark:bg-slate-900',
    success: 'border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20',
    warning: 'border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20',
    danger: 'border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20',
    info: 'border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20',
  }[statusVariant];

  const iconStyles = {
    default: 'text-[#EA580C] bg-[#EA580C]/10',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
    danger: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50',
    info: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50',
  }[statusVariant];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-4.5 shadow-2xs transition-all duration-200 hover:shadow-xs ${
        onClick ? 'cursor-pointer hover:border-slate-400' : ''
      } ${variantStyles} ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${iconStyles}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`flex items-center font-semibold ${
              isNeutral
                ? 'text-slate-500'
                : isGood
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isNeutral ? (
              <Minus className="h-3.5 w-3.5 mr-0.5" />
            ) : isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
            )}
            {change > 0 ? `+${change}%` : `${change}%`}
          </span>
          <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">{changePeriod}</span>
        </div>
      )}

      {description && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          {description}
        </p>
      )}
    </div>
  );
};
