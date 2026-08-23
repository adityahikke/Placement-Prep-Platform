import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Check, X, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

const difficultyColors = {
  EASY: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  HARD: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800',
};

export const AnswerReviewItem = ({ review, index }) => {
  const [showExplanation, setShowExplanation] = useState(true);

  if (!review) return null;

  const {
    questionText,
    optionA,
    optionB,
    optionC,
    optionD,
    selectedOption,
    correctOption,
    isCorrect,
    explanation,
    difficulty,
  } = review;

  const options = [
    { key: 'A', label: optionA },
    { key: 'B', label: optionB },
    { key: 'C', label: optionC },
    { key: 'D', label: optionD },
  ];

  return (
    <Card className="space-y-4">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
              isCorrect
                ? 'bg-emerald-500'
                : selectedOption
                ? 'bg-red-500'
                : 'bg-slate-400'
            }`}
          >
            {index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isCorrect ? 'Correct' : selectedOption ? 'Incorrect' : 'Unattempted'}
          </span>
        </div>

        <span
          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            difficultyColors[difficulty] || difficultyColors.MEDIUM
          }`}
        >
          {difficulty}
        </span>
      </div>

      {/* Question Text */}
      <p className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
        {questionText}
      </p>

      {/* Options listing */}
      <div className="space-y-2 pt-1">
        {options.map((opt) => {
          const isUserChoice = selectedOption === opt.key;
          const isRightAnswer = correctOption === opt.key;

          let badgeStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300';
          let indicator = null;

          if (isRightAnswer) {
            badgeStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500/30';
            indicator = <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
          } else if (isUserChoice && !isCorrect) {
            badgeStyle = 'border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-100 ring-1 ring-red-500/30';
            indicator = <X className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />;
          }

          return (
            <div
              key={opt.key}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-sm transition-all ${badgeStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                    isRightAnswer
                      ? 'bg-emerald-500 text-white'
                      : isUserChoice
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.key}
                </span>
                <span>{opt.label}</span>
              </div>
              {indicator}
            </div>
          );
        })}
      </div>

      {/* Explanation Section */}
      {explanation && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowExplanation(prev => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showExplanation ? 'Hide Explanation' : 'View Explanation'}</span>
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showExplanation && (
            <div className="mt-2.5 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-sm text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-xs uppercase tracking-wider text-blue-800 dark:text-blue-300">
                Solution & Explanation:
              </p>
              <p className="leading-relaxed whitespace-pre-line">{explanation}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
