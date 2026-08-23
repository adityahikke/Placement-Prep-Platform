import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

/**
 * Confirmation dialog for destructive or important actions (e.g. deleting a
 * question). Built on top of {@link Modal}.
 *
 * Props:
 *  - isOpen, onClose, onConfirm
 *  - title, message
 *  - confirmLabel (default "Confirm"), cancelLabel (default "Cancel")
 *  - variant: "danger" (default) | "primary"
 *  - loading: disables buttons and shows a spinner on confirm
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const isDanger = variant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex gap-4">
        <div
          className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
            isDanger
              ? 'bg-red-50 dark:bg-red-950/40 text-red-500'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-500'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 mt-6">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={isDanger ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};
