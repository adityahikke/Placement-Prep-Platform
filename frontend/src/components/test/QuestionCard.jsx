import React from 'react';
import { Card } from '../common/Card';

const difficultyColors = {
  EASY: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  HARD: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800',
};

export const QuestionCard = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onClearOption,
}) => {
  if (!question) return null;

  const options = [
    { key: 'A', label: question.optionA },
    { key: 'B', label: question.optionB },
    { key: 'C', label: question.optionC },
    { key: 'D', label: question.optionD },
  ];

  return (
    <Card className="flex flex-col justify-between min-h-[420px]">
      <div>
        {/* Header with question number and difficulty */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                difficultyColors[question.difficulty] || difficultyColors.MEDIUM
              }`}
            >
              {question.difficulty}
            </span>
            {selectedOption && (
              <button
                type="button"
                onClick={onClearOption}
                className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2 underline underline-offset-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Question Text */}
        <div className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed mb-6">
          {question.questionText}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onSelectOption(opt.key)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.key}
                </div>
                <div className="text-sm font-medium leading-relaxed">{opt.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
