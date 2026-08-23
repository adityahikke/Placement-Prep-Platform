import React, { useEffect, useMemo, useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { adminApi } from '../../api';
import { useToast } from '../../context/ToastContext';

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy', active: 'bg-emerald-600 text-white border-emerald-600', idle: 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' },
  { value: 'MEDIUM', label: 'Medium', active: 'bg-amber-500 text-white border-amber-500', idle: 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900' },
  { value: 'HARD', label: 'Hard', active: 'bg-rose-600 text-white border-rose-600', idle: 'text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900' },
];

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const emptyForm = {
  sectionId: '',
  chapterId: '',
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  difficulty: 'EASY',
  explanation: '',
};

const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5';
const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all';

/**
 * Add / Edit question modal. Section→Chapter are chosen from the full sections
 * tree (chapters grouped by subject via <optgroup>). Everything is validated
 * client-side, then persisted through adminApi. Calls onSaved(question) on success.
 */
export const QuestionFormModal = ({
  isOpen,
  onClose,
  onSaved,
  sections = [],
  initialQuestion = null,
  defaultSectionId = '',
  defaultChapterId = '',
}) => {
  const toast = useToast();
  const isEdit = Boolean(initialQuestion);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Find which section owns a given chapter id (chapters live under subjects).
  const findSectionIdForChapter = (chapterId) => {
    for (const sec of sections) {
      for (const sub of sec.subjects || []) {
        if ((sub.chapters || []).some((c) => String(c.id) === String(chapterId))) {
          return String(sec.id);
        }
      }
    }
    return '';
  };

  // (Re)initialise the form whenever the modal opens or the target changes.
  useEffect(() => {
    if (!isOpen) return;
    if (initialQuestion) {
      const secId =
        findSectionIdForChapter(initialQuestion.chapterId) ||
        (defaultSectionId ? String(defaultSectionId) : '');
      setForm({
        sectionId: secId,
        chapterId: initialQuestion.chapterId ? String(initialQuestion.chapterId) : '',
        questionText: initialQuestion.questionText || '',
        optionA: initialQuestion.optionA || '',
        optionB: initialQuestion.optionB || '',
        optionC: initialQuestion.optionC || '',
        optionD: initialQuestion.optionD || '',
        correctOption: initialQuestion.correctOption || 'A',
        difficulty: initialQuestion.difficulty || 'EASY',
        explanation: initialQuestion.explanation || '',
      });
    } else {
      setForm({
        ...emptyForm,
        sectionId: defaultSectionId ? String(defaultSectionId) : '',
        chapterId: defaultChapterId ? String(defaultChapterId) : '',
      });
    }
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialQuestion, defaultSectionId, defaultChapterId]);

  const selectedSection = useMemo(
    () => sections.find((s) => String(s.id) === String(form.sectionId)),
    [sections, form.sectionId]
  );

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSectionChange = (value) => {
    // Switching section invalidates the chosen chapter.
    setForm((f) => ({ ...f, sectionId: value, chapterId: '' }));
    setErrors((e) => ({ ...e, sectionId: undefined, chapterId: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.sectionId) e.sectionId = 'Select a section';
    if (!form.chapterId) e.chapterId = 'Select a chapter';
    if (!form.questionText.trim()) e.questionText = 'Question text is required';
    OPTION_KEYS.forEach((k) => {
      if (!form[`option${k}`].trim()) e[`option${k}`] = `Option ${k} is required`;
    });
    if (!OPTION_KEYS.includes(form.correctOption)) e.correctOption = 'Choose the correct option';
    if (!form.difficulty) e.difficulty = 'Select a difficulty';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      chapterId: Number(form.chapterId),
      questionText: form.questionText.trim(),
      optionA: form.optionA.trim(),
      optionB: form.optionB.trim(),
      optionC: form.optionC.trim(),
      optionD: form.optionD.trim(),
      correctOption: form.correctOption,
      difficulty: form.difficulty,
      explanation: form.explanation.trim() || null,
      estimatedTimeSeconds: 30,
    };
    try {
      const res = isEdit
        ? await adminApi.updateQuestion(initialQuestion.id, payload)
        : await adminApi.createQuestion(payload);
      if (res.success) {
        toast.success(isEdit ? 'Question updated.' : 'Question added.');
        onSaved?.(res.data);
        onClose?.();
      } else {
        throw new Error(res.message || 'Failed to save question');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={saving ? undefined : onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl z-10 flex flex-col max-h-[90vh] pp-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {isEdit ? 'Edit Question' : 'Add Question'}
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
        <form id="question-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Section</label>
              <select
                value={form.sectionId}
                onChange={(e) => handleSectionChange(e.target.value)}
                className={inputCls}
              >
                <option value="">Select section…</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
              {errors.sectionId && <FieldError msg={errors.sectionId} />}
            </div>
            <div>
              <label className={labelCls}>Chapter</label>
              <select
                value={form.chapterId}
                onChange={(e) => setField('chapterId', e.target.value)}
                disabled={!form.sectionId}
                className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {form.sectionId ? 'Select chapter…' : 'Select a section first'}
                </option>
                {(selectedSection?.subjects || []).map((sub) => (
                  <optgroup key={sub.id} label={sub.name}>
                    {(sub.chapters || []).map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.chapterId && <FieldError msg={errors.chapterId} />}
            </div>
          </div>

          <div>
            <label className={labelCls}>Question Text</label>
            <textarea
              value={form.questionText}
              onChange={(e) => setField('questionText', e.target.value)}
              rows={3}
              placeholder="Enter the question…"
              className={`${inputCls} resize-y`}
            />
            {errors.questionText && <FieldError msg={errors.questionText} />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OPTION_KEYS.map((k) => (
              <div key={k}>
                <label className={labelCls}>Option {k}</label>
                <input
                  type="text"
                  value={form[`option${k}`]}
                  onChange={(e) => setField(`option${k}`, e.target.value)}
                  placeholder={`Option ${k}`}
                  className={inputCls}
                />
                {errors[`option${k}`] && <FieldError msg={errors[`option${k}`]} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Correct Answer</label>
              <select
                value={form.correctOption}
                onChange={(e) => setField('correctOption', e.target.value)}
                className={inputCls}
              >
                {OPTION_KEYS.map((k) => (
                  <option key={k} value={k}>
                    Option {k}
                    {form[`option${k}`] ? ` — ${truncate(form[`option${k}`], 40)}` : ''}
                  </option>
                ))}
              </select>
              {errors.correctOption && <FieldError msg={errors.correctOption} />}
            </div>
            <div>
              <label className={labelCls}>Difficulty</label>
              <div className="flex gap-2">
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
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Explanation <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={form.explanation}
              onChange={(e) => setField('explanation', e.target.value)}
              rows={2}
              placeholder="Explain the correct answer…"
              className={`${inputCls} resize-y`}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="question-form" variant="primary" loading={saving} onClick={handleSubmit}>
            <Save className="w-4 h-4" />
            {isEdit ? 'Save Changes' : 'Add Question'}
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

const truncate = (str, n) => (str.length > n ? `${str.slice(0, n)}…` : str);
