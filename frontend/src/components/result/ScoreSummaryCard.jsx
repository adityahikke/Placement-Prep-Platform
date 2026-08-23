import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '../common/Card';
import { CheckCircle2, XCircle, HelpCircle, Clock, Trophy, Target } from 'lucide-react';

export const ScoreSummaryCard = ({ result }) => {
  if (!result) return null;

  const {
    testTitle,
    score,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unattemptedQuestions,
    accuracy,
    timeTakenSeconds = 0,
  } = result;

  useEffect(() => {
    if (accuracy >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [accuracy]);

  const minutes = Math.floor(timeTakenSeconds / 60);
  const seconds = timeTakenSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 border-blue-100 dark:border-blue-900/40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <Trophy className="w-4 h-4" />
            Test Complete
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {testTitle || 'Chapter Test Result'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your accuracy, breakdown, and detailed step-by-step explanations below.
          </p>
        </div>

        {/* Big Score / Accuracy Badge */}
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm shrink-0">
          <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Score</p>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {score}/{totalQuestions}
            </p>
          </div>
          <div className="text-center px-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Accuracy</p>
            <p className={`text-3xl font-extrabold ${accuracy >= 75 ? 'text-emerald-500' : accuracy >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
              {accuracy}%
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Correct</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{correctAnswers}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
          <XCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Incorrect</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{incorrectAnswers}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
          <HelpCircle className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Unattempted</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{unattemptedQuestions}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
          <Clock className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Time Taken</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{timeFormatted}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
