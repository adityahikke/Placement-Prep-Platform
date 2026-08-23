import React, { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { DsaProblemFormModal } from '../../components/admin/DsaProblemFormModal';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Code2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  X,
  Tag,
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

/**
 * DSA problem management. DSA is a standalone catalogue (not chapter-based):
 * each problem has a topic, difficulty, platform and a practice link (usually
 * LeetCode). Admins can add / edit / delete problems here. Deleting a problem
 * also clears students' progress rows for it (handled server-side).
 */
export const AdminDsaProblems = () => {
  const toast = useToast();

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- Topics (for the filter dropdown + form suggestions) ---
  const loadTopics = useCallback(async () => {
    try {
      const res = await adminApi.getDsaTopics();
      if (res.success) setTopics(res.data || []);
    } catch {
      // Non-fatal: the page still works without topic suggestions.
    }
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  // --- Debounce search ---
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // --- Load problems ---
  const loadProblems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getDsaProblems({
        topic: topic || undefined,
        search: search || undefined,
        difficulty: difficulty || undefined,
        page,
        size: PAGE_SIZE,
      });
      if (res.success) {
        setPageData(res.data);
      } else {
        throw new Error(res.message || 'Failed to load problems');
      }
    } catch (err) {
      setError(err.message || 'Failed to load problems');
      toast.error(err.message || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, [topic, search, difficulty, page, toast]);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  const problems = pageData?.content || [];

  const refreshAll = async () => {
    await Promise.all([loadProblems(), loadTopics()]);
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setFormOpen(true);
  };

  const resetFilters = () => {
    setTopic('');
    setDifficulty('');
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const res = await adminApi.deleteDsaProblem(deleting.id);
      if (res.success) {
        toast.success('DSA problem deleted.');
        setDeleting(null);
        if (problems.length === 1 && page > 0) {
          setPage((p) => p - 1);
          loadTopics();
        } else {
          await refreshAll();
        }
      } else {
        throw new Error(res.message || 'Failed to delete problem');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete problem');
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasFilters = Boolean(topic || difficulty || search);

  if (loading && !pageData) {
    return <Loader message="Loading DSA problems..." />;
  }

  return (
    <div className="space-y-6 pp-fade-in">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            DSA Problems
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage the DSA practice catalogue — each problem links to its practice page (e.g. LeetCode).
          </p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Problem
        </Button>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title or tag…"
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

          <select
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

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
      </Card>

      {/* List */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 px-6">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">{error}</p>
            <button
              onClick={loadProblems}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <Code2 className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              {hasFilters ? 'No matching problems' : 'No DSA problems yet'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {hasFilters ? 'Try clearing the filters.' : 'Add your first DSA problem to get started.'}
            </p>
            {hasFilters ? (
              <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                Clear filters
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={openAdd} className="mt-4">
                <Plus className="w-4 h-4" /> Add Problem
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {problems.map((p, idx) => (
              <div
                key={p.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono text-slate-400 tabular-nums">
                        {page * PAGE_SIZE + idx + 1}.
                      </span>
                      <DiffBadge value={p.difficulty} />
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                        <Tag className="w-3 h-3" /> {p.topic}
                      </span>
                      <span className="text-[11px] text-slate-400">{p.platform}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {p.title}
                    </p>
                    {p.tags && (
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {p.tags}
                      </p>
                    )}
                    {p.problemUrl && (
                      <a
                        href={p.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-xs">{p.problemUrl}</span>
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <IconButton title="Edit" onClick={() => openEdit(p)} icon={Pencil} />
                    <IconButton title="Delete" onClick={() => setDeleting(p)} icon={Trash2} danger />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && problems.length > 0 && (
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

      {/* Modals */}
      <DsaProblemFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          if (!editing) setPage(0);
          refreshAll();
        }}
        initialProblem={editing}
        topics={topics}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => (deleteLoading ? null : setDeleting(null))}
        onConfirm={confirmDelete}
        title="Delete DSA problem?"
        message={
          deleting
            ? `"${deleting.title}" will be permanently removed, along with any students' progress on it. This action cannot be undone.`
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
