import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export const SkeletonLoader: React.FC<{
  type?: 'card' | 'table' | 'chart' | 'text';
  count?: number;
  className?: string;
}> = ({ type = 'card', count = 1, className = '' }) => {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className={`w-full animate-pulse space-y-3 ${className}`}>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
        {items.map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`w-full h-72 animate-pulse bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col justify-end space-y-2 ${className}`}>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-auto" />
        <div className="flex items-end gap-3 h-48 w-full pt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-200 dark:bg-slate-800 rounded-t flex-1"
              style={{ height: `${30 + (i % 5) * 15}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
        >
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-3" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  message: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}> = ({ title, message, icon: Icon = Inbox, actionText, onAction, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 ${className}`}>
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white shadow-xs transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  title = 'Something went wrong',
  message = 'An unexpected telemetry error occurred while communicating with the factory controller.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 ${className}`}>
      <div className="p-3.5 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 mb-3">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  );
};
