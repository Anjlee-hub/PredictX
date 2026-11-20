import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  label?: string;
  showValue?: boolean;
  colorVariant?: 'default' | 'success' | 'warning' | 'danger' | 'dynamic';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  colorVariant = 'dynamic',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let colorClass = 'bg-blue-600';
  if (colorVariant === 'success') colorClass = 'bg-emerald-500';
  else if (colorVariant === 'warning') colorClass = 'bg-amber-500';
  else if (colorVariant === 'danger') colorClass = 'bg-rose-500';
  else if (colorVariant === 'dynamic') {
    if (percentage > 75) colorClass = 'bg-rose-500';
    else if (percentage > 45) colorClass = 'bg-amber-500';
    else colorClass = 'bg-emerald-500';
  }

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          {label && <span>{label}</span>}
          {showValue && <span className="font-semibold">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const RadialGauge: React.FC<{
  value: number;
  label: string;
  sublabel?: string;
  size?: number;
  unit?: string;
  invertedRisk?: boolean; // if true, higher score is bad (red)
}> = ({ value, label, sublabel, size = 130, unit = '%', invertedRisk = false }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (normalizedValue / 100) * circumference;

  let strokeColor = '#10B981'; // green
  if (invertedRisk) {
    if (value > 75) strokeColor = '#EF4444';
    else if (value > 40) strokeColor = '#F59E0B';
    else strokeColor = '#10B981';
  } else {
    if (value < 50) strokeColor = '#EF4444';
    else if (value < 80) strokeColor = '#F59E0B';
    else strokeColor = '#10B981';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value.toFixed(0)}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-0.5">{unit}</span>
          </span>
          {sublabel && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{sublabel}</span>
          )}
        </div>
      </div>
      <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">{label}</span>
    </div>
  );
};
