import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const WeakAreaCard = ({ weakChapters = [], strongChapters = [] }) => {
  return (
    <Card>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
        Strengths & Recommendations
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        AI-driven insights based on your recent test attempts
      </p>

      <div className="space-y-4">
        {/* Weak Chapters (<50%) */}
        {weakChapters.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1 mb-2">
              <AlertCircle className="w-3.5 h-3.5" /> Needs Attention (Accuracy &lt; 50%)
            </p>
            <div className="space-y-2">
              {weakChapters.map((ch) => (
                <div
                  key={ch.chapterId}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{ch.chapterName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{ch.subjectName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600 dark:text-red-400">{ch.accuracy}%</span>
                    <Link
                      to={`/chapter/${ch.chapterId}`}
                      className="p-1 rounded-md bg-white dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 transition-colors"
                      title="Practice chapter"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strong Chapters (>=75%) */}
        {strongChapters.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Strong Chapters (Accuracy &ge; 75%)
            </p>
            <div className="space-y-2">
              {strongChapters.map((ch) => (
                <div
                  key={ch.chapterId}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{ch.chapterName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{ch.subjectName}</p>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{ch.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {weakChapters.length === 0 && strongChapters.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400">
            Take at least 1-2 chapter tests to reveal your strengths and weakness insights.
          </div>
        )}
      </div>
    </Card>
  );
};
