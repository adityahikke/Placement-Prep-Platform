import React from 'react';
import { Card } from '../common/Card';

export const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorMap = {
    blue: 'from-blue-600 to-indigo-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
    emerald: 'from-emerald-600 to-teal-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
    amber: 'from-amber-500 to-orange-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
    purple: 'from-purple-600 to-pink-600 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-2xl ${colorMap[color] || colorMap.blue} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
