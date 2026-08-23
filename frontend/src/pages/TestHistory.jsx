import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testApi } from '../api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { History, ArrowRight, CheckCircle2, Clock, Calendar } from 'lucide-react';

export const TestHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await testApi.getTestHistory();
        if (res.success && res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error('Failed to load test history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <Loader message="Fetching your test history records..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
          <History className="w-4 h-4" /> Activity Log
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Test Attempt History
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your past test sessions, accuracy progressions, and detailed question breakdowns.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Test Title</th>
                  <th className="py-3.5 px-4 font-semibold">Section</th>
                  <th className="py-3.5 px-4 font-semibold">Score</th>
                  <th className="py-3.5 px-4 font-semibold">Accuracy</th>
                  <th className="py-3.5 px-4 font-semibold">Time</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-5 text-right font-semibold">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-slate-100">
                      {item.testTitle || item.chapterName}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {item.sectionCode || 'Aptitude'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-blue-600 dark:text-blue-400">
                      {item.correctAnswers}/{item.totalQuestions}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-semibold text-xs px-2 py-0.5 rounded-md ${
                          item.accuracy >= 75
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : item.accuracy >= 50
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                        }`}
                      >
                        {item.accuracy}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {item.timeTakenSeconds ? `${Math.floor(item.timeTakenSeconds / 60)}m ${item.timeTakenSeconds % 60}s` : '5m'}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {item.startedAt ? new Date(item.startedAt).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/test/${item.id}/result`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                      >
                        Solutions <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <p className="text-sm">No test attempts recorded yet.</p>
            <Link to="/aptitude">
              <Button size="sm">Explore Aptitude Chapters</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
