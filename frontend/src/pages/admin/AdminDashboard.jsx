import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Library,
  Calculator,
  Cpu,
  Code,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <Card className="!p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
        {value ?? 0}
      </p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{label}</p>
    </div>
  </Card>
);

const DistributionBar = ({ easy, medium, hard, total }) => {
  const t = total || 0;
  const pct = (n) => (t > 0 ? `${(n / t) * 100}%` : '0%');
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
      <div className="h-full bg-emerald-500" style={{ width: pct(easy) }} title={`Easy: ${easy}`} />
      <div className="h-full bg-amber-500" style={{ width: pct(medium) }} title={`Medium: ${medium}`} />
      <div className="h-full bg-rose-500" style={{ width: pct(hard) }} title={`Hard: ${hard}`} />
    </div>
  );
};

export const AdminDashboard = () => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getDashboard();
      if (res.success) {
        setData(res.data);
      } else {
        throw new Error(res.message || 'Failed to load dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">{error}</p>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </Card>
    );
  }

  const d = data || {};
  const distribution = d.questionDistribution || [];
  const recent = d.recentStudents || [];

  return (
    <div className="space-y-6 pp-fade-in">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Platform overview and question bank statistics.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Registered Students"
          value={d.totalStudents}
          accent="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          icon={Calculator}
          label="Aptitude Questions"
          value={d.totalAptitudeQuestions}
          accent="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Cpu}
          label="CS Fundamentals"
          value={d.totalCsFundamentalsQuestions}
          accent="bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"
        />
        <StatCard
          icon={Code}
          label="DSA Questions"
          value={d.totalDsaQuestions}
          accent="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={Library}
          label="Total Questions"
          value={d.totalQuestions}
          accent="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent students */}
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Students</h2>
            <Link
              to="/admin/students"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No students registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold whitespace-nowrap">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recent.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-3">
                        <Link
                          to={`/admin/students/${s.id}`}
                          className="font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                        {s.email}
                      </td>
                      <td className="px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(s.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Question distribution */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Question Distribution</h2>
          </div>
          {distribution.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No sections found.
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {distribution.map((sec) => (
                <div key={sec.sectionId ?? sec.sectionCode}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {sec.sectionName}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {sec.totalQuestions}
                    </span>
                  </div>
                  <DistributionBar
                    easy={sec.easyQuestions}
                    medium={sec.mediumQuestions}
                    hard={sec.hardQuestions}
                    total={sec.totalQuestions}
                  />
                  <div className="flex gap-4 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Easy {sec.easyQuestions}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium {sec.mediumQuestions}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Hard {sec.hardQuestions}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
