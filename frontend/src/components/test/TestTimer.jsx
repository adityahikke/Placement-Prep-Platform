import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const TestTimer = ({ formattedTime, isUrgent, isCritical }) => {
  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm border transition-all ${
        isCritical
          ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 animate-pulse'
          : isUrgent
          ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
      }`}
    >
      {isCritical ? (
        <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
      ) : (
        <Clock className={`w-4 h-4 ${isUrgent ? 'text-amber-500' : 'text-blue-500'}`} />
      )}
      <span>{formattedTime}</span>
    </div>
  );
};
