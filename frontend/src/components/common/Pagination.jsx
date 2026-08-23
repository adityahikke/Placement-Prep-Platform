import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Simple pagination control for the admin tables. Pages are 0-based (matching
 * Spring's Page). Renders "Showing X–Y of Z" plus Prev/Next and a page readout.
 *
 * Props: page, totalPages, totalElements, size, onPageChange(nextPage)
 */
export const Pagination = ({ page = 0, totalPages = 0, totalElements = 0, size = 10, onPageChange }) => {
  if (totalPages <= 1 && totalElements <= size) {
    // Nothing to paginate — still show the count for context if there are items.
    if (totalElements === 0) return null;
    return (
      <div className="flex items-center justify-between px-1 py-3 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing {totalElements} {totalElements === 1 ? 'result' : 'results'}
        </span>
      </div>
    );
  }

  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);
  const isFirst = page <= 0;
  const isLast = page >= totalPages - 1;

  const btn =
    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-3">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{from}</span>–
        <span className="font-semibold text-slate-700 dark:text-slate-300">{to}</span> of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{totalElements}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={isFirst}
          className={`${btn} border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
          Page {page + 1} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isLast}
          className={`${btn} border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
