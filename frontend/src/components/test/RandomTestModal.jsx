import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { testApi } from '../../api';
import { Sparkles, Layers, Sliders, Hash } from 'lucide-react';

export const RandomTestModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [sectionCode, setSectionCode] = useState('APTITUDE');
  const [difficulty, setDifficulty] = useState('MIXED');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await testApi.startRandomTest({
        sectionCode,
        difficulty,
        questionCount,
      });
      if (res.success && res.data) {
        onClose();
        navigate(`/test/${res.data.testId}`, { state: { testData: res.data } });
      }
    } catch (err) {
      setError(err.message || 'Failed to start random test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Random Test" maxWidth="max-w-lg">
      <div className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Section selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Section
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'APTITUDE', label: 'Aptitude' },
              { id: 'CS_FUNDAMENTALS', label: 'CS Fundamentals' },
            ].map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSectionCode(sec.id)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                  sectionCode === sec.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> Difficulty
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'MIXED', label: 'Mixed' },
              { id: 'EASY', label: 'Easy' },
              { id: 'MEDIUM', label: 'Medium' },
              { id: 'HARD', label: 'Hard' },
            ].map((diff) => (
              <button
                key={diff.id}
                type="button"
                onClick={() => setDifficulty(diff.id)}
                className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  difficulty === diff.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" /> Number of Questions
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                  questionCount === count
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {count} Questions
                <span className="block text-[11px] font-normal opacity-75">
                  ({(count * 30) / 60} mins)
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStart} loading={loading}>
            <Sparkles className="w-4 h-4 mr-1.5" />
            Launch Test
          </Button>
        </div>
      </div>
    </Modal>
  );
};
