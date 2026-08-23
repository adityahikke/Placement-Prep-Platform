import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const SubmitConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions = 10,
  answeredCount = 0,
  loading = false,
}) => {
  const unattemptedCount = totalQuestions - answeredCount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Test Confirmation" maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to submit your test? Once submitted, your score and detailed answer explanations will be computed.
        </p>

        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Answered</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">{answeredCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unanswered</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">{unattemptedCount}</p>
            </div>
          </div>
        </div>

        {unattemptedCount > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Note: You still have {unattemptedCount} unanswered questions.
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Resume Test
          </Button>
          <Button onClick={onConfirm} loading={loading} variant="primary">
            Confirm & Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};
