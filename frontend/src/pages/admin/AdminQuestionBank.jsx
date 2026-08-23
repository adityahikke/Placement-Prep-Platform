import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { contentApi, adminApi } from '../../api';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';
import { QuestionFormModal } from '../../components/admin/QuestionFormModal';
import { BulkUploadModal } from '../../components/admin/BulkUploadModal';
import {
  Plus,
  UploadCloud,
  Search,
  Eye,
  Pencil,
  Trash2,
  Library,
  FolderOpen,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle2,
} from 'lucide-react';

const PAGE_SIZE = 10;

const DIFF_BADGE = {
  EASY: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  MEDIUM: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  HARD: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
};

const DiffBadge = ({ value }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ${
      DIFF_BADGE[value] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
    }`}
  >
    {value || '—'}
  </span>
);

export const AdminQuestionBank = () => {
  const toast = useToast();

  // Sections tree (Section → Subject → Chapter) used for navigation + counts.
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [sectionsError, setSectionsError] = useState('');

  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);

  // Questions list state
  const [pageData, setPageData] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState('');
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const didInit = useRef(false);

  // --- Load sections tree ---
  const loadSections = useCallback(
    async (preserveSelection = false) => {
      setLoadingSections(true);
      setSectionsError('');
      try {
        const res = await contentApi.getAllSections();
        if (res.success) {
          const list = res.data || [];
          setSections(list);
          // On first load, auto-select the first section + its first chapter.
          if (!preserveSelection && !didInit.current) {
            didInit.current = true;
            const firstSection = list[0];
            if (firstSection) {
              setActiveSectionId(firstSection.id);
              const firstChapter = firstChapterOf(firstSection);
              setActiveChapterId(firstChapter?.id ?? null);
            }
          }
        } else {
          throw new Error(res.message || 'Failed to load sections');
        }
      } catch (err) {
        setSectionsError(err.message || 'Failed to load sections');
        toast.error(err.message || 'Failed to load sections');
      } finally {
        setLoadingSections(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  // --- Debounce search ---
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // --- Load questions for the active chapter ---
  const loadQuestions = useCallback(async () => {
    if (!activeChapterId) {
      setPageData(null);
      return;
    }
    setLoadingQuestions(true);
    setQuestionsError('');
    try {
      const res = await adminApi.getQuestions({
        chapterId: activeChapterId,
        search: search || undefined,
        difficulty: difficulty || undefined,
        page,
        size: PAGE_SIZE,
      });
      if (res.success) {
        setPageData(res.data);
      } else {
        throw new Error(res.message || 'Failed to load questions');
      }
    } catch (err) {
      setQuestionsError(err.message || 'Failed to load questions');
      toast.error(err.message || 'Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
  }, [activeChapterId, search, difficulty, page, toast]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // --- Derived ---
  const activeSection = useMemo(
    () => sections.find((s) => String(s.id) === String(activeSectionId)),
    [sections, activeSectionId]
  );

  const activeChapter = useMemo(() => {
    if (!activeSection) return null;
    for (const sub of activeSection.subjects || []) {
      const ch = (sub.chapters || []).find((c) => String(c.id) === String(activeChapterId));
      if (ch) return { ...ch, subjectName: sub.name };
    }
    return null;
  }, [activeSection, activeChapterId]);

  const questions = pageData?.content || [];

  // --- Handlers ---
  const selectSection = (sectionId) => {
    setActiveSectionId(sectionId);
    const sec = sections.find((s) => String(s.id) === String(sectionId));
    const firstChapter = sec ? firstChapterOf(sec) : null;
    setActiveChapterId(firstChapter?.id ?? null);
    resetFilters();
  };

  const selectChapter = (chapterId) => {
    setActiveChapterId(chapterId);
    resetFilters();
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setDifficulty('');
    setPage(0);
  };

  // After any mutation, refresh both the counts (sections) and the question list.
  const refreshAll = async () => {
    await Promise.all([loadSections(true), loadQuestions()]);
  };

  const openAdd = () => {
    setEditingQuestion(null);
    setFormOpen(true);
  };

  const openEdit = (q) => {
    setEditingQuestion(q);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const res = await adminApi.deleteQuestion(deleting.id);
      if (res.success) {
        toast.success('Question deleted.');
        setDeleting(null);
        // If we just deleted the last item on a page, step back a page (which
        // re-fetches questions); otherwise refresh the current page. Either way
        // refresh the sections tree so the chapter counts stay accurate.
        if (questions.length === 1 && page > 0) {
          setPage((p) => p - 1);
          loadSections(true);
        } else {
          await refreshAll();
        }
      } else {
        throw new Error(res.message || 'Failed to delete question');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete question');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ---- Render ----
  if (loadingSections && sections.length === 0) {
    return <Loader message="Loading question bank..." />;
  }

  if (sectionsError && sections.length === 0) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">{sectionsError}</p>
        <button
          onClick={() => loadSections()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pp-fade-in">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Question Bank
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Add, edit and organise questions by section and chapter.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            <UploadCloud className="w-4 h-4" /> Bulk Upload
          </Button>
          <Button variant="primary" onClick={openAdd} disabled={!activeChapterId}>
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map((sec) => {
          const active = String(sec.id) === String(activeSectionId);
          return (
            <button
              key={sec.id}
              onClick={() => selectSection(sec.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                active
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              {sec.name}
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-md tabular-nums ${
                  active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {sec.totalQuestions ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chapter list */}
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="!p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-500" /> Chapters
              </h2>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-2">
              {!activeSection || (activeSection.subjects || []).length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 px-3 py-6 text-center">
                  No chapters in this section.
                </p>
              ) : (
                (activeSection.subjects || []).map((sub) => (
                  <div key={sub.id} className="mb-2">
                    <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {sub.name}
                    </p>
                    {(sub.chapters || []).length === 0 ? (
                      <p className="px-3 py-1 text-xs text-slate-400">No chapters</p>
                    ) : (
                      (sub.chapters || []).map((ch) => {
                        const active = String(ch.id) === String(activeChapterId);
                        return (
                          <button
                            key={ch.id}
                            onClick={() => selectChapter(ch.id)}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                              active
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <span className="truncate">{ch.name}</span>
                            <span
                              className={`shrink-0 text-[11px] px-1.5 py-0.5 rounded-md tabular-nums ${
                                active
                                  ? 'bg-indigo-100 dark:bg-indigo-800/50'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {ch.totalQuestions ?? 0}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Questions panel */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Chapter header + filters */}
          <Card className="!p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {activeChapter ? activeChapter.name : 'Select a chapter'}
                  </h2>
                  {activeChapter && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeChapter.subjectName} ·{' '}
                      {pageData?.totalElements ?? activeChapter.totalQuestions ?? 0} question
                      {(pageData?.totalElements ?? activeChapter.totalQuestions ?? 0) === 1 ? '' : 's'}
                    </p>
                  )}
                </div>
              </div>

              {activeChapterId && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search questions…"
                      className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                    />
                    {searchInput && (
                      <button
                        onClick={() => setSearchInput('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {['', 'EASY', 'MEDIUM', 'HARD'].map((d) => {
                      const active = difficulty === d;
                      return (
                        <button
                          key={d || 'ALL'}
                          onClick={() => {
                            setDifficulty(d);
                            setPage(0);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            active
                              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                          }`}
                        >
                          {d === '' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Question list */}
          <Card className="!p-0 overflow-hidden">
            {!activeChapterId ? (
              <EmptyState
                icon={Library}
                title="No chapter selected"
                subtitle="Pick a chapter from the list to view its questions."
              />
            ) : loadingQuestions ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                ))}
              </div>
            ) : questionsError ? (
              <div className="text-center py-12 px-6">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">{questionsError}</p>
                <button
                  onClick={loadQuestions}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Retry
                </button>
              </div>
            ) : questions.length === 0 ? (
              <EmptyState
                icon={Library}
                title={search || difficulty ? 'No matching questions' : 'No questions yet'}
                subtitle={
                  search || difficulty
                    ? 'Try clearing the search or difficulty filter.'
                    : 'Add your first question or bulk upload a file.'
                }
                action={
                  !search && !difficulty ? (
                    <Button variant="primary" size="sm" onClick={openAdd} className="mt-4">
                      <Plus className="w-4 h-4" /> Add Question
                    </Button>
                  ) : null
                }
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-mono text-slate-400 tabular-nums">
                            {page * PAGE_SIZE + idx + 1}.
                          </span>
                          <DiffBadge value={q.difficulty} />
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                          {q.questionText}
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5">
                          Correct answer: <span className="font-semibold">Option {q.correctOption}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <IconButton title="View" onClick={() => setViewing(q)} icon={Eye} />
                        <IconButton title="Edit" onClick={() => openEdit(q)} icon={Pencil} />
                        <IconButton
                          title="Delete"
                          onClick={() => setDeleting(q)}
                          icon={Trash2}
                          danger
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeChapterId && !loadingQuestions && !questionsError && questions.length > 0 && (
              <div className="px-4 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  page={pageData.page}
                  totalPages={pageData.totalPages}
                  totalElements={pageData.totalElements}
                  size={pageData.size || PAGE_SIZE}
                  onPageChange={setPage}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      <QuestionFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          // Jump to the first page so a newly added question is visible.
          if (!editingQuestion) setPage(0);
          refreshAll();
        }}
        sections={sections}
        initialQuestion={editingQuestion}
        defaultSectionId={activeSectionId}
        defaultChapterId={activeChapterId}
      />

      <BulkUploadModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onImported={() => {
          setPage(0);
          refreshAll();
        }}
      />

      <QuestionViewModal question={viewing} onClose={() => setViewing(null)} />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => (deleteLoading ? null : setDeleting(null))}
        onConfirm={confirmDelete}
        title="Delete question?"
        message="This question will be permanently removed from the chapter. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

// --- Small helpers / subcomponents ---

const firstChapterOf = (section) => {
  for (const sub of section?.subjects || []) {
    if ((sub.chapters || []).length > 0) return sub.chapters[0];
  }
  return null;
};

const IconButton = ({ icon: Icon, onClick, title, danger }) => (
  <button
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`p-2 rounded-lg transition-colors ${
      danger
        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
        : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
    }`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="text-center py-16 px-6">
    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-slate-700 dark:text-slate-300 font-medium">{title}</p>
    {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    {action}
  </div>
);

const QuestionViewModal = ({ question, onClose }) => {
  const options = question
    ? [
        { key: 'A', text: question.optionA },
        { key: 'B', text: question.optionB },
        { key: 'C', text: question.optionC },
        { key: 'D', text: question.optionD },
      ]
    : [];
  return (
    <Modal isOpen={Boolean(question)} onClose={onClose} title="Question Details" maxWidth="max-w-lg">
      {question && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DiffBadge value={question.difficulty} />
            {question.chapterName && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {question.sectionName ? `${question.sectionName} · ` : ''}
                {question.chapterName}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
            {question.questionText}
          </p>
          <div className="space-y-2">
            {options.map((o) => {
              const correct = o.key === question.correctOption;
              return (
                <div
                  key={o.key}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm ${
                    correct
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      correct
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {o.key}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200 flex-1">{o.text}</span>
                  {correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                </div>
              );
            })}
          </div>
          {question.explanation && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Explanation
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
