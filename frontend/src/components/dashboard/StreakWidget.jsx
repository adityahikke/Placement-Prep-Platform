import React from 'react';
import { Card } from '../common/Card';
import { Flame, Trophy } from 'lucide-react';

export const StreakWidget = ({ streak = 0 }) => {
  return (
    <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
          <Flame className="w-6 h-6 fill-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Trophy className="w-3.5 h-3.5" /> Placement Readiness Streak
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {streak > 0 ? `${streak} Day Streak!` : 'Start Your Streak Today!'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {streak > 0
              ? 'Consistency is the secret to cracking top tier engineering placements.'
              : 'Complete at least one timed test today to build daily momentum.'}
          </p>
        </div>
      </div>
    </Card>
  );
};
