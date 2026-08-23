import React, { useEffect, useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { adminApi } from '../../api';
import { useToast } from '../../context/ToastContext';

const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5';
const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all';

/**
 * Add / Edit a chapter under a subject. On create the subject is fixed (passed
 * via subjectId/subjectName). On edit, an optional subject dropdown (populated
 * from `subjects`) lets an admin move the chapter to another subject in the same
 * section. estimatedMinutes defaults to 5 server-side when left blank.
 */
export const ChapterFormModal = ({
  isOpen,
  onClose,
  onSaved,
  initialChapter = null,
  subjectId,
  subjectName = '',
  subjects = [],
}) => {
  const toast = useToast();
  const isEdit = Boolean(initialChapter);

  const [form, setForm] = useState({ name: '', description: '', estimatedMinutes: '', subjectId: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialChapter) {
      setForm({
        name: initialChapter.name || '',
        description: initialChapter.description || '',
        estimatedMinutes:
          initialChapter.estimatedMinutes != null ? String(initialChapter.estimatedMinutes) : '',
        subjectId: initialChapter.subjectId ? String(initialChapter.subjectId) : '',
      });
    } else {
      setForm({
        name: '',
        description: '',
        estimatedMinutes: '',
        subjectId: subjectId ? String(subjectId) : '',
      });
    }
    setErrors({});
  }, [isOpen, initialChapter, subjectId]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (ev) => {
    ev?.preventDefault?.();
    const e = {};
    if (!form.name.trim()) e.name = 'Chapter name is required';
    let minutes = null;
    if (form.estimatedMinutes !== '') {
      const n = Number(form.estimatedMinutes);
      if (!Number.isFinite(n) || n < 1) e.estimatedMinutes = 'Enter a whole number of minutes (1 or more)';
      else minutes = Math.round(n);
    }
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSaving(true);
    try {
      let res;
      if (isEdit) {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          estimatedMinutes: minutes,
        };
        // Only send subjectId when it actually changes (a "move").
        if (form.subjectId && String(form.subjectId) !== String(initialChapter.subjectId)) {
          payload.subjectId = Number(form.subjectId);
        }
        res = await adminApi.updateChapter(initialChapter.id, payload);
      } else {
        res = await adminApi.createChapter({
          subjectId: Number(form.subjectId || subjectId),
          name: form.name.trim(),
          description: form.description.trim() || null,
          estimatedMinutes: minutes,
        });
      }
      if (res.success) {
        toast.success(isEdit ? 'Chapter updated.' : 'Chapter added.');
        onSaved?.(res.data);
        onClose?.();
      } else {
        throw new Error(res.message || 'Failed to save chapter');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };

  // Show the move dropdown only when editing and there is more than one subject to move between.
  const showMove = isEdit && subjects.length > 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Chapter' : 'Add Chapter'} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && subjectName && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adding to subject <span className="font-semibold text-slate-700 dark:text-slate-300">{subjectName}</span>
          </p>
        )}

        <div>
          <label className={labelCls}>Chapter Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="e.g. CPU Scheduling"
            autoFocus
            className={inputCls}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {showMove && (
          <div>
            <label className={labelCls}>Subject</label>
            <select
              value={form.subjectId}
              onChange={(e) => setField('subjectId', e.target.value)}
              className={inputCls}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">Change to move this chapter to another subject.</p>
          </div>
        )}

        <div>
          <label className={labelCls}>
            Estimated Minutes <span className="font-normal text-slate-400">(optional, defaults to 5)</span>
          </label>
          <input
            type="number"
            min="1"
            value={form.estimatedMinutes}
            onChange={(e) => setField('estimatedMinutes', e.target.value)}
            placeholder="5"
            className={inputCls}
          />
          {errors.estimatedMinutes && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.estimatedMinutes}
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>
            Description <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            rows={2}
            placeholder="Short description of what this chapter covers…"
            className={`${inputCls} resize-y`}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} onClick={handleSubmit}>
            <Save className="w-4 h-4" />
            {isEdit ? 'Save Changes' : 'Add Chapter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
