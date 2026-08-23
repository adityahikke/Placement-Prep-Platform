import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { Loader } from '../components/common/Loader';
import { BarChart3, Target, CheckCircle2, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export const ProgressAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await dashboardApi.getOverallProgress();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load progress analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return <Loader message="Compiling syllabus progress and mastery analytics..." />;
  }

  const {
    overallAccuracy = 0,
    totalTests = 0,
    totalQuestionsAttempted = 0,
    totalCorrectAnswers = 0,
    chapterProgressList = [],
  } = data || {};

  const masteryColors = {
    STRONG: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    AVERAGE: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    WEAK: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800',
    NOT_STARTED: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
          <BarChart3 className="w-4 h-4" /> Performance Analytics
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Syllabus Mastery & Progress
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          In-depth tracking of chapter-level completion and accuracy across all modules.
        </p>
      </div>

      {/* Aggregate Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Overall Accuracy</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{overallAccuracy}%</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Questions Solved</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {totalCorrectAnswers} / {totalQuestionsAttempted}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Timed Tests</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{totalTests} Tests</p>
          </div>
        </Card>
      </div>

      {/* Chapter Breakdown Matrix */}
      <Card>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
          Chapter-Wise Completion & Accuracy
        </h3>

        <div className="space-y-4">
          {chapterProgressList.map((item) => (
            <div
              key={item.chapterId}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="sm:w-1/3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {item.chapterName}
                  </h4>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      masteryColors[item.masteryLevel] || masteryColors.NOT_STARTED
                    }`}
                  >
                    {item.masteryLevel.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.subjectName} • {item.attemptsCount} tests attempted
                </p>
              </div>

              <div className="sm:w-1/3">
                <ProgressBar
                  progress={item.completionRate}
                  label="Question Bank Exposure"
                  color="blue"
                  height="h-2"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/4 text-right">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Avg Accuracy</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {item.accuracy > 0 ? `${item.accuracy}%` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Bank</p>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {item.totalQuestions} Qs
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
