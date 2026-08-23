import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { contentApi, adminApi } from '../../api';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { SubjectFormModal } from '../../components/admin/SubjectFormModal';
import { ChapterFormModal } from '../../components/admin/ChapterFormModal';
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  BookOpen,
  Layers,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

/**
 * Curriculum management: create / rename / delete Subjects and Chapters within a
 * Section. Layout is a section tab bar + a two-pane master/detail (subjects on the
 * left, the selected subject's chapters on the right). Question authoring still
 * lives in the Question Bank — this page manages the structure only.
 *
 * Delete rules mirror the backend: a subject can only be deleted when it has no
 * chapters; deleting a chapter with questions requires confirmation (force) and is
 * blocked entirely if any of its questions appear in students' test history.
 */
export const AdminCurriculum = () => {
  const toast = useToast();

  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [sectionsError, setSectionsError] = useState('');
  const [activeSectionId, setActiveSectionId] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState(null);

  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Modals
  const [subjectFormOpen, setSubjectFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [chapterFormOpen, setChapterFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [deletingChapter, setDeletingChapter] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- Load section list (for the tab bar) ---
  const loadSections = useCallback(async () => {
    setLoadingSections(true);
    setSectionsError('');
    try {
      const res = await contentApi.getAllSections();
      if (res.success) {
        const list = res.data || [];
        setSections(list);
        setActiveSectionId((prev) => prev ?? (list[0]?.id ?? null));
      } else {
        throw new Error(res.message || 'Failed to load sections');
      }
    } catch (err) {
      setSectionsError(err.message || 'Failed to load sections');
      toast.error(err.message || 'Failed to load sections');
    } finally {
      setLoadingSections(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  // --- Load subjects for the active section ---
  const loadSubjects = useCallback(
    async (sectionId, { keepSubject = false } = {}) => {
      if (!sectionId) {
        setSubjects([]);
        setActiveSubjectId(null);
        return;
      }
      setLoadingSubjects(true);
      try {
        const res = await adminApi.getSubjects({ sectionId });
        if (res.success) {
          const list = res.data || [];
          setSubjects(list);
          setActiveSubjectId((prev) => {
            if (keepSubject && prev && list.some((s) => String(s.id) === String(prev))) return prev;
            return list[0]?.id ?? null;
          });
        } else {
          throw new Error(res.message || 'Failed to load subjects');
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load subjects');
      } finally {
        setLoadingSubjects(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadSubjects(activeSectionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionId]);

  // --- Load chapters for the active subject ---
  const loadChapters = useCallback(
    async (subjectId) => {
      if (!subjectId) {
        setChapters([]);
        return;
      }
      setLoadingChapters(true);
      try {
        const res = await adminApi.getChapters({ subjectId });
        if (res.success) {
          setChapters(res.data || []);
        } else {
          throw new Error(res.message || 'Failed to load chapters');
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load chapters');
      } finally {
        setLoadingChapters(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadChapters(activeSubjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubjectId]);

  const activeSection = useMemo(
    () => sections.find((s) => String(s.id) === String(activeSectionId)),
    [sections, activeSectionId]
  );
  const activeSubject = useMemo(
    () => subjects.find((s) => String(s.id) === String(activeSubjectId)),
    [subjects, activeSubjectId]
  );

  // --- Refresh helpers ---
  const refreshSubjects = () => loadSubjects(activeSectionId, { keepSubject: true });
  const refreshChaptersAndCounts = async () => {
    await Promise.all([loadChapters(activeSubjectId), loadSubjects(activeSectionId, { keepSubject: true })]);
  };

  // --- Subject handlers ---
  const openAddSubject = () => {
    setEditingSubject(null);
    setSubjectFormOpen(true);
  };
  const openEditSubject = (s) => {
    setEditingSubject(s);
    setSubjectFormOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!deletingSubject) return;
    setDeleteLoading(true);
    try {
      const res = await adminApi.deleteSubject(deletingSubject.id);
      if (res.success) {
        toast.success('Subject deleted.');
        setDeletingSubject(null);
        await refreshSubjects();
      } else {
        throw new Error(res.message || 'Failed to delete subject');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete subject');
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Chapter handlers ---
  const openAddChapter = () => {
    setEditingChapter(null);
    setChapterFormOpen(true);
  };
  const openEditChapter = (c) => {
    setEditingChapter(c);
    setChapterFormOpen(true);
  };

  const confirmDeleteChapter = async () => {
    if (!deletingChapter) return;
    setDeleteLoading(true);
    try {
      // If the chapter has questions, force deletion (backend requires it). The
      // separate test-history guard can still block it, surfacing a clear message.
      const force = (deletingChapter.totalQuestions || 0) > 0;
      const res = await adminApi.deleteChapter(deletingChapter.id, force);
      if (res.success) {
        toast.success('Chapter deleted.');
        setDeletingChapter(null);
        await refreshChaptersAndCounts();
      } else {
        throw new Error(res.message || 'Failed to delete chapter');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete chapter');
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Render ---
  if (loadingSections && sections.length === 0) {
    return <Loader message="Loading curriculum..." />;
  }

  if (sectionsError && sections.length === 0) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">{sectionsError}</p>
        <button
          onClick={loadSections}
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
            Curriculum
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organise subjects and chapters. Add questions to chapters from the Question Bank.
          </p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map((sec) => {
          const active = String(sec.id) === String(activeSectionId);
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSectionId(sec.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                active
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              {sec.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subjects pane */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="!p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> Subjects
                {activeSection && (
                  <span className="text-xs font-normal text-slate-400">in {activeSection.name}</span>
                )}
              </h2>
              <Button variant="primary" size="sm" onClick={openAddSubject} disabled={!activeSectionId}>
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-2">
              {loadingSubjects ? (
                <div className="p-2 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                  ))}
                </div>
              ) : subjects.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 px-3 py-8 text-center">
                  No subjects in this section yet. Click “Add” to create one.
                </p>
              ) : (
                subjects.map((sub) => {
                  const active = String(sub.id) === String(activeSubjectId);
                  return (
                    <div
                      key={sub.id}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-colors ${
                        active
                          ? 'bg-indigo-50 dark:bg-indigo-900/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                      onClick={() => setActiveSubjectId(sub.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium truncate ${
                            active
                              ? 'text-indigo-700 dark:text-indigo-300'
                              : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {sub.name}
                          {sub.code ? (
                            <span className="ml-1.5 text-[11px] font-normal text-slate-400">({sub.code})</span>
                          ) : null}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {sub.totalChapters} chapter{sub.totalChapters === 1 ? '' : 's'} · {sub.totalQuestions}{' '}
                          question{sub.totalQuestions === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButton
                          title="Edit subject"
                          icon={Pencil}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditSubject(sub);
                          }}
                        />
                        <IconButton
                          title="Delete subject"
                          icon={Trash2}
                          danger
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingSubject(sub);
                          }}
                        />
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-indigo-400' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Chapters pane */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="!p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 min-w-0">
                <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">
                  Chapters
                  {activeSubject && (
                    <span className="text-xs font-normal text-slate-400"> in {activeSubject.name}</span>
                  )}
                </span>
              </h2>
              <Button variant="primary" size="sm" onClick={openAddChapter} disabled={!activeSubjectId}>
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto">
              {!activeSubjectId ? (
                <EmptyState
                  icon={FolderTree}
                  title="No subject selected"
                  subtitle="Pick a subject on the left to manage its chapters."
                />
              ) : loadingChapters ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                  ))}
                </div>
              ) : chapters.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No chapters yet"
                  subtitle="Add a chapter, then load it with questions from the Question Bank."
                  action={
                    <Button variant="primary" size="sm" onClick={openAddChapter} className="mt-4">
                      <Plus className="w-4 h-4" /> Add Chapter
                    </Button>
                  }
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {chapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {ch.name}
                          </p>
                          {ch.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {ch.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                (ch.totalQuestions || 0) > 0
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {ch.totalQuestions || 0} question{ch.totalQuestions === 1 ? '' : 's'}
                            </span>
                            {ch.estimatedMinutes != null && (
                              <span className="text-[11px] text-slate-400">{ch.estimatedMinutes} min</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <IconButton title="Edit chapter" icon={Pencil} onClick={() => openEditChapter(ch)} />
                          <IconButton
                            title="Delete chapter"
                            icon={Trash2}
                            danger
                            onClick={() => setDeletingChapter(ch)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <SubjectFormModal
        isOpen={subjectFormOpen}
        onClose={() => setSubjectFormOpen(false)}
        onSaved={() => {
          setSubjectFormOpen(false);
          refreshSubjects();
        }}
        initialSubject={editingSubject}
        sectionId={activeSectionId}
        sectionName={activeSection?.name}
      />

      <ChapterFormModal
        isOpen={chapterFormOpen}
        onClose={() => setChapterFormOpen(false)}
        onSaved={() => {
          setChapterFormOpen(false);
          refreshChaptersAndCounts();
        }}
        initialChapter={editingChapter}
        subjectId={activeSubjectId}
        subjectName={activeSubject?.name}
        subjects={subjects}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingSubject)}
        onClose={() => (deleteLoading ? null : setDeletingSubject(null))}
        onConfirm={confirmDeleteSubject}
        title="Delete subject?"
        message={
          deletingSubject
            ? (deletingSubject.totalChapters || 0) > 0
              ? `"${deletingSubject.name}" has ${deletingSubject.totalChapters} chapter(s). Delete or move those chapters first — subjects with chapters can't be removed.`
              : `"${deletingSubject.name}" will be permanently removed. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingChapter)}
        onClose={() => (deleteLoading ? null : setDeletingChapter(null))}
        onConfirm={confirmDeleteChapter}
        title="Delete chapter?"
        message={
          deletingChapter
            ? (deletingChapter.totalQuestions || 0) > 0
              ? `"${deletingChapter.name}" and its ${deletingChapter.totalQuestions} question(s) will be permanently deleted. This action cannot be undone.`
              : `"${deletingChapter.name}" will be permanently removed. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
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
