import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';
import { adminApi } from '../../api';
import { useToast } from '../../context/ToastContext';

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy', active: 'bg-emerald-600 text-white border-emerald-600', idle: 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' },
  { value: 'MEDIUM', label: 'Medium', active: 'bg-amber-500 text-white border-amber-500', idle: 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900' },
  { value: 'HARD', label: 'Hard', active: 'bg-rose-600 text-white border-rose-600', idle: 'text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900' },
];

const emptyForm = {
  title: '',
  topic: '',
  difficulty: 'EASY',
  platform: 'LeetCode',
  problemUrl: '',
  description: '',
  tags: '',
};

const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5';
const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all';

/**
 * Add / Edit a DSA problem. DSA problems are standalone (not tied to a
 * chapter/subject) — each one carries its own practice link (typically a
 * LeetCode URL). Only title, topic and difficulty are required; platform
 * defaults to "LeetCode". Calls onSaved(problem) on success.
 */
export const DsaProblemFormModal = ({
  isOpen,
  onClose,
  onSaved,
  initialProblem = null,
  topics = [],
}) => {
  const toast = useToast();
  const isEdit = Boolean(initialProblem);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // (Re)initialise the form whenever the modal opens or the target changes.
  useEffect(() => {
    if (!isOpen) return;
    if (initialProblem) {
      setForm({
        title: initialProblem.title || '',
        topic: initialProblem.topic || '',
        difficulty: initialProblem.difficulty || 'EASY',
        platform: initialProblem.platform || 'LeetCode',
        problemUrl: initialProblem.problemUrl || '',
        description: initialProblem.description || '',
        tags: initialProblem.tags || '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [isOpen, initialProblem]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.topic.trim()) e.topic = 'Topic is required';
    if (!form.difficulty) e.difficulty = 'Select a difficulty';
    // Light URL sanity check (optional field, but if present it should look like a link).
    const url = form.problemUrl.trim();
    if (url) {
      if (url.length > 1000) e.problemUrl = 'URL is too long (max 1000 characters)';
      else if (!/^https?:\/\/.+/i.test(url)) e.problemUrl = 'Enter a full URL starting with http:// or https://';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      topic: form.topic.trim(),
      difficulty: form.difficulty,
      platform: form.platform.trim() || 'LeetCode',
      problemUrl: form.problemUrl.trim() || null,
      description: form.description.trim() || null,
      tags: form.tags.trim() || null,
    };
    try {
      const res = isEdit
        ? await adminApi.updateDsaProblem(initialProblem.id, payload)
        : await adminApi.createDsaProblem(payload);
      if (res.success) {
        toast.success(isEdit ? 'DSA problem updated.' : 'DSA problem added.');
        onSaved?.(res.data);
        onClose?.();
      } else {
        throw new Error(res.message || 'Failed to save problem');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save problem');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const url = form.problemUrl.trim();
  const urlLooksValid = /^https?:\/\/.+/i.test(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={saving ? undefined : onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl z-10 flex flex-col max-h-[90vh] pp-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {isEdit ? 'Edit DSA Problem' : 'Add DSA Problem'}
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form id="dsa-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="e.g. Two Sum"
              className={inputCls}
            />
            {errors.title && <FieldError msg={errors.title} />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Topic</label>
              <input
                type="text"
                list="dsa-topic-options"
                value={form.topic}
                onChange={(e) => setField('topic', e.target.value)}
                placeholder="e.g. Arrays, Graphs, DP…"
                className={inputCls}
              />
              <datalist id="dsa-topic-options">
                {topics.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              {errors.topic && <FieldError msg={errors.topic} />}
            </div>
            <div>
              <label className={labelCls}>Platform</label>
              <input
                type="text"
                value={form.platform}
                onChange={(e) => setField('platform', e.target.value)}
                placeholder="LeetCode"
                className={inputCls}
              />
              <p className="mt-1 text-[11px] text-slate-400">Defaults to LeetCode if left blank.</p>
            </div>
          </div>

          <div>
            <label className={labelCls}>Difficulty</label>
            <div className="flex gap-2 max-w-xs">
              {DIFFICULTIES.map((d) => {
                const active = form.difficulty === d.value;
                return (
                  <button
                    type="button"
                    key={d.value}
                    onClick={() => setField('difficulty', d.value)}
                    className={`flex-1 px-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      active ? d.active : `bg-white dark:bg-slate-800 ${d.idle} hover:border-current`
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            {errors.difficulty && <FieldError msg={errors.difficulty} />}
          </div>

          <div>
            <label className={labelCls}>
              Problem Link <span className="font-normal text-slate-400">(LeetCode / practice URL)</span>
            </label>
            <input
              type="url"
              value={form.problemUrl}
              onChange={(e) => setField('problemUrl', e.target.value)}
              placeholder="https://leetcode.com/problems/two-sum/"
              className={inputCls}
            />
            {errors.problemUrl ? (
              <FieldError msg={errors.problemUrl} />
            ) : (
              url && urlLooksValid && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> Open link to verify
                </a>
              )
            )}
          </div>

          <div>
            <label className={labelCls}>
              Tags <span className="font-normal text-slate-400">(optional, comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setField('tags', e.target.value)}
              placeholder="e.g. hash-table, two-pointers"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              placeholder="Short summary, hints, or notes about the problem…"
              className={`${inputCls} resize-y`}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="dsa-form" variant="primary" loading={saving} onClick={handleSubmit}>
            <Save className="w-4 h-4" />
            {isEdit ? 'Save Changes' : 'Add Problem'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const FieldError = ({ msg }) => (
  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
);
