import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Send } from 'lucide-react';

export const QuestionPalette = ({
  questions = [],
  answers = {},
  currentIndex,
  onSelectIndex,
  onSubmitClick,
}) => {
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const unattemptedCount = questions.length - answeredCount;

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Question Palette
        </h4>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-medium text-slate-600 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0"></span>
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700 shrink-0"></span>
            <span>Unanswered ({unattemptedCount})</span>
          </div>
        </div>

        {/* Numbers Grid */}
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const isCurrent = currentIndex === idx;
            const isAnswered = !!answers[q.id];

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={`w-full aspect-square rounded-xl font-semibold text-xs transition-all flex items-center justify-center relative ${
                  isCurrent
                    ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 font-bold scale-105 z-10'
                    : ''
                } ${
                  isAnswered
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button
          onClick={onSubmitClick}
          variant="primary"
          className="w-full justify-center shadow-lg"
        >
          <Send className="w-4 h-4 mr-1.5" />
          Submit Test
        </Button>
      </div>
    </Card>
  );
};
