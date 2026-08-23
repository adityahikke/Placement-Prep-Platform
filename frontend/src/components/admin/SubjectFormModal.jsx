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
 * Add / Edit a subject within a section. On create, the section is fixed
 * (passed via sectionId/sectionName from the active tab). Calls onSaved() on success.
 */
export const SubjectFormModal = ({
  isOpen,
  onClose,
  onSaved,
  initialSubject = null,
  sectionId,
  sectionName = '',
}) => {
  const toast = useToast();
  const isEdit = Boolean(initialSubject);

  const [form, setForm] = useState({ name: '', code: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      name: initialSubject?.name || '',
      code: initialSubject?.code || '',
    });
    setErrors({});
  }, [isOpen, initialSubject]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (ev) => {
    ev?.preventDefault?.();
    if (!form.name.trim()) {
      setErrors({ name: 'Subject name is required' });
      return;
    }
    setSaving(true);
    try {
      let res;
      if (isEdit) {
        res = await adminApi.updateSubject(initialSubject.id, {
          name: form.name.trim(),
          code: form.code.trim() || null,
        });
      } else {
        res = await adminApi.createSubject({
          sectionId: Number(sectionId),
          name: form.name.trim(),
          code: form.code.trim() || null,
        });
      }
      if (res.success) {
        toast.success(isEdit ? 'Subject updated.' : 'Subject added.');
        onSaved?.(res.data);
        onClose?.();
      } else {
        throw new Error(res.message || 'Failed to save subject');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Subject' : 'Add Subject'} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && sectionName && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adding to section <span className="font-semibold text-slate-700 dark:text-slate-300">{sectionName}</span>
          </p>
        )}
        <div>
          <label className={labelCls}>Subject Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="e.g. Operating Systems"
            autoFocus
            className={inputCls}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className={labelCls}>
            Code <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setField('code', e.target.value)}
            placeholder="e.g. OS"
            className={inputCls}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} onClick={handleSubmit}>
            <Save className="w-4 h-4" />
            {isEdit ? 'Save Changes' : 'Add Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
