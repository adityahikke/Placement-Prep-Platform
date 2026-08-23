import React, { useRef, useState } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { adminApi } from '../../api';
import { useToast } from '../../context/ToastContext';

const REQUIRED_COLUMNS = [
  'section',
  'chapter',
  'question',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'correctAnswer',
  'difficulty',
];

const STATUS_STYLES = {
  VALID: {
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle2,
    row: '',
  },
  DUPLICATE: {
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    icon: Copy,
    row: 'bg-amber-50/40 dark:bg-amber-950/10',
  },
  INVALID: {
    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
    icon: AlertTriangle,
    row: 'bg-rose-50/40 dark:bg-rose-950/10',
  },
};

const TEMPLATE = `section,chapter,question,optionA,optionB,optionC,optionD,correctAnswer,difficulty,explanation
Aptitude,Percentages,"What is 10% of 200?",10,20,30,40,B,EASY,"10% of 200 = 20"`;

const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n)}…` : s || '');

/**
 * Bulk upload flow: pick a CSV/Excel file → server validates and returns a
 * preview (valid / invalid / duplicate) → admin confirms → only VALID rows are
 * committed. Nothing is written until the admin clicks Import.
 */
export const BulkUploadModal = ({ isOpen, onClose, onImported }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState('select'); // select | review | done
  const [busy, setBusy] = useState(false); // previewing/committing spinner
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const reset = () => {
    setStep('select');
    setBusy(false);
    setFile(null);
    setPreview(null);
    setResult(null);
    setDragOver(false);
  };

  const handleClose = () => {
    if (busy) return;
    reset();
    onClose?.();
  };

  const runPreview = async (f) => {
    if (!f) return;
    const name = f.name.toLowerCase();
    if (!/\.(csv|xlsx|xls)$/.test(name)) {
      toast.error('Please upload a .csv, .xlsx or .xls file.');
      return;
    }
    setFile(f);
    setBusy(true);
    try {
      const res = await adminApi.bulkUploadPreview(f);
      if (res.success) {
        setPreview(res.data);
        setStep('review');
      } else {
        throw new Error(res.message || 'Could not read the file');
      }
    } catch (err) {
      toast.error(err.message || 'Could not read the file');
    } finally {
      setBusy(false);
    }
  };

  const handleFilePick = (e) => {
    const f = e.target.files?.[0];
    if (f) runPreview(f);
    e.target.value = ''; // allow re-picking the same file
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) runPreview(f);
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question-upload-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCommit = async () => {
    if (!preview) return;
    const validRows = (preview.rows || []).filter((r) => r.status === 'VALID');
    if (validRows.length === 0) {
      toast.error('There are no valid rows to import.');
      return;
    }
    const questions = validRows.map((r) => ({
      chapterId: r.chapterId,
      questionText: r.question,
      optionA: r.optionA,
      optionB: r.optionB,
      optionC: r.optionC,
      optionD: r.optionD,
      correctOption: r.correctAnswer, // backend upper-cases + validates
      // VALID rows are guaranteed to upper-case to a real enum name.
      difficulty: (r.difficulty || '').trim().toUpperCase(),
      explanation: r.explanation || null,
      estimatedTimeSeconds: 30,
    }));

    setBusy(true);
    try {
      const res = await adminApi.bulkCommit(questions);
      if (res.success) {
        setResult(res.data);
        setStep('done');
        onImported?.(res.data);
      } else {
        throw new Error(res.message || 'Import failed');
      }
    } catch (err) {
      toast.error(err.message || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  const rows = preview?.rows || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl z-10 flex flex-col max-h-[90vh] pp-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            {step === 'review' && (
              <button
                onClick={() => !busy && reset()}
                disabled={busy}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Bulk Upload Questions
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={busy}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {/* Step: select */}
          {step === 'select' && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !busy && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFilePick}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                  {busy ? <Loader2 className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
                </div>
                {busy ? (
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Reading “{file?.name}”…
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Click to choose a file or drag it here
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      CSV or Excel (.csv, .xlsx, .xls)
                    </p>
                  </>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Required columns
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download template
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {REQUIRED_COLUMNS.map((c) => (
                    <code
                      key={c}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300"
                    >
                      {c}
                    </code>
                  ))}
                  <code className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-400">
                    explanation (optional)
                  </code>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                  <span className="font-semibold">Section</span> and{' '}
                  <span className="font-semibold">chapter</span> must match existing names.{' '}
                  <span className="font-semibold">correctAnswer</span> is a letter A–D and{' '}
                  <span className="font-semibold">difficulty</span> is EASY, MEDIUM or HARD.
                </p>
              </div>
            </div>
          )}

          {/* Step: review */}
          {step === 'review' && preview && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <SummaryTile label="Total" value={preview.totalRows} tone="slate" />
                <SummaryTile label="Valid" value={preview.validCount} tone="emerald" />
                <SummaryTile label="Duplicates" value={preview.duplicateCount} tone="amber" />
                <SummaryTile label="Invalid" value={preview.invalidCount} tone="rose" />
              </div>

              {preview.validCount > 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {preview.validCount}
                  </span>{' '}
                  question{preview.validCount === 1 ? '' : 's'} will be imported. Duplicate and invalid
                  rows are skipped.
                </p>
              ) : (
                <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                  No valid rows to import. Fix the issues below and try again.
                </p>
              )}

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-[42vh] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                      <tr className="text-left text-slate-500 dark:text-slate-400">
                        <th className="px-3 py-2.5 font-semibold">#</th>
                        <th className="px-3 py-2.5 font-semibold">Status</th>
                        <th className="px-3 py-2.5 font-semibold">Chapter</th>
                        <th className="px-3 py-2.5 font-semibold">Question</th>
                        <th className="px-3 py-2.5 font-semibold">Diff.</th>
                        <th className="px-3 py-2.5 font-semibold">Ans</th>
                        <th className="px-3 py-2.5 font-semibold">Issues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {rows.map((r) => {
                        const st = STATUS_STYLES[r.status] || STATUS_STYLES.INVALID;
                        const Icon = st.icon;
                        return (
                          <tr key={r.rowNumber} className={st.row}>
                            <td className="px-3 py-2 text-slate-400 tabular-nums">{r.rowNumber}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold ${st.badge}`}
                              >
                                <Icon className="w-3 h-3" />
                                {r.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {truncate(r.chapter, 22) || <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-700 dark:text-slate-200 max-w-[220px]">
                              {truncate(r.question, 60) || <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-500 dark:text-slate-400 whitespace-nowrap uppercase">
                              {r.difficulty || '—'}
                            </td>
                            <td className="px-3 py-2 text-slate-500 dark:text-slate-400 uppercase">
                              {r.correctAnswer || '—'}
                            </td>
                            <td className="px-3 py-2 text-rose-600 dark:text-rose-400 max-w-[220px]">
                              {r.errors && r.errors.length > 0 ? (
                                <span title={r.errors.join(' ')}>{r.errors.join(' ')}</span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400">OK</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step: done */}
          {step === 'done' && result && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Import complete</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {result.imported}
                </span>{' '}
                question{result.imported === 1 ? '' : 's'} imported
                {result.skipped ? (
                  <>
                    {' '}
                    ·{' '}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {result.skipped}
                    </span>{' '}
                    skipped
                  </>
                ) : null}
                .
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 min-w-0">
            {file && step !== 'done' && (
              <>
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span className="truncate">{file.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {step === 'select' && (
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            )}
            {step === 'review' && (
              <>
                <Button variant="outline" onClick={reset} disabled={busy}>
                  Choose another file
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCommit}
                  loading={busy}
                  disabled={!preview || preview.validCount === 0}
                >
                  Import {preview?.validCount || 0} question{preview?.validCount === 1 ? '' : 's'}
                </Button>
              </>
            )}
            {step === 'done' && (
              <Button variant="primary" onClick={handleClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TONES = {
  slate: 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400',
};

const SummaryTile = ({ label, value, tone }) => (
  <div className={`rounded-xl p-3 text-center ${TONES[tone]}`}>
    <p className="text-2xl font-extrabold tabular-nums leading-none">{value ?? 0}</p>
    <p className="text-[11px] font-semibold uppercase tracking-wider mt-1 opacity-80">{label}</p>
  </div>
);
