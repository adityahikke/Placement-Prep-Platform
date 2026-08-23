import React from 'react';

export const ProgressBar = ({
  progress = 0,
  label = '',
  color = 'blue',
  showPercentage = true,
  height = 'h-2.5',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const colorVariants = {
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-600',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
          {label && <span>{label}</span>}
          {showPercentage && <span>{clampedProgress.toFixed(0)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${colorVariants[color] || colorVariants.blue} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
