import React, { useState, useEffect } from 'react';
import { dsaApi } from '../api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import {
  Code,
  CheckCircle2,
  Clock,
  Circle,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';

export const DsaTracker = () => {
  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchProblems = async () => {
    try {
      const res = await dsaApi.getProblems();
      if (res.success && res.data) {
        setProblems(res.data);
      }
    } catch (err) {
      console.error('Failed to load DSA problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [probRes, topicRes] = await Promise.all([
          dsaApi.getProblems(),
          dsaApi.getTopics(),
        ]);
        if (probRes.success && probRes.data) setProblems(probRes.data);
        if (topicRes.success && topicRes.data) setTopics(topicRes.data);
      } catch (err) {
        console.error('Failed to initialize DSA tracker:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, []);

  const handleStatusChange = async (problemId, newStatus, force = false) => {
    setUpdatingId(problemId);
    try {
      const res = await dsaApi.updateStatus(problemId, newStatus, force);
      if (res.success && res.data) {
        // Trust the status the backend returns (it enforces the sticky-Solved rule).
        setProblems(prev => prev.map(p => p.id === problemId ? { ...p, userStatus: res.data.userStatus } : p));
      }
    } catch (err) {
      alert(err.message || 'Failed to update problem status');
    } finally {
      setUpdatingId(null);
      setConfirmingId(null);
    }
  };

  if (loading) {
    return <Loader message="Loading curated DSA problem repository..." />;
  }

  const filteredProblems = problems.filter((p) => {
    const matchesTopic = selectedTopic === 'ALL' || p.topic === selectedTopic;
    const matchesDiff = selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesDiff && matchesSearch;
  });

  const totalProblems = problems.length;
  const solvedCount = problems.filter(p => p.userStatus === 'SOLVED').length;
  const attemptedCount = problems.filter(p => p.userStatus === 'ATTEMPTED').length;

  const difficultyBadge = {
    EASY: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    HARD: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          <Code className="w-4 h-4" /> Section 3
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          DSA Problem Tracker
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Curated patterns across 19 topics. Mark problems as Solved/Attempted and track your interview readiness.
          Once a problem is <span className="font-semibold text-emerald-600 dark:text-emerald-400">Solved</span> it's locked so it can't be reset by accident — use <span className="font-semibold">Undo</span> to reopen it.
        </p>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Solved</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {solvedCount} <span className="text-xs font-normal text-slate-400">/ {totalProblems}</span>
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Attempted</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {attemptedCount} Problems
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Remaining</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {totalProblems - solvedCount} Problems
            </p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems, patterns or tags (e.g. Two Pointers)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Difficulty filter buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold shrink-0">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Chips */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedTopic('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedTopic === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Topics
          </button>
          {topics.map((top) => (
            <button
              key={top}
              onClick={() => setSelectedTopic(top)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedTopic === top
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {top}
            </button>
          ))}
        </div>
      </Card>

      {/* Problem List Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Problem Title</th>
                <th className="py-3.5 px-4 font-semibold">Topic</th>
                <th className="py-3.5 px-4 font-semibold">Difficulty</th>
                <th className="py-3.5 px-4 font-semibold">Tags</th>
                <th className="py-3.5 px-5 text-right font-semibold">Practice Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProblems.map((prob) => {
                const isSolved = prob.userStatus === 'SOLVED';
                const isAttempted = prob.userStatus === 'ATTEMPTED';

                return (
                  <tr key={prob.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Status Dropdown/Toggle — Solved is locked to prevent accidental resets */}
                    <td className="py-3.5 px-5">
                      {isSolved ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                            <Lock className="w-3 h-3 opacity-60" />
                          </span>
                          {confirmingId === prob.id ? (
                            <span className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(prob.id, 'ATTEMPTED', true)}
                                disabled={updatingId === prob.id}
                                className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                              >
                                Confirm reopen
                              </button>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <button
                                type="button"
                                onClick={() => setConfirmingId(null)}
                                className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:underline"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmingId(prob.id)}
                              disabled={updatingId === prob.id}
                              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline disabled:opacity-50"
                              title="Reopen this solved problem"
                            >
                              Undo
                            </button>
                          )}
                        </div>
                      ) : (
                        <select
                          value={prob.userStatus}
                          disabled={updatingId === prob.id}
                          onChange={(e) => handleStatusChange(prob.id, e.target.value)}
                          className={`text-xs font-semibold py-1 px-2.5 rounded-lg border focus:outline-none transition-all cursor-pointer ${
                            isAttempted
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          <option value="NOT_STARTED">To Do</option>
                          <option value="ATTEMPTED">Attempted</option>
                          <option value="SOLVED">Solved ✓</option>
                        </select>
                      )}
                    </td>

                    {/* Problem Title */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {prob.title}
                    </td>

                    {/* Topic */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {prob.topic}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          difficultyBadge[prob.difficulty] || difficultyBadge.MEDIUM
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {prob.tags || 'General'}
                    </td>

                    {/* External Link */}
                    <td className="py-3.5 px-5 text-right">
                      {prob.problemUrl ? (
                        <a
                          href={prob.problemUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {prob.platform || 'LeetCode'} <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
