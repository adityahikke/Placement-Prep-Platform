import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Mail,
  Calendar,
  GraduationCap,
  Building2,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3">
    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words">
        {value || '—'}
      </p>
    </div>
  </div>
);

const MiniStat = ({ icon: Icon, label, value, accent }) => (
  <Card className="!p-4 flex items-center gap-3">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
        {value ?? 0}
      </p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  </Card>
);

export const AdminStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getStudent(id);
      if (res.success) {
        setStudent(res.data);
      } else {
        throw new Error(res.message || 'Failed to load student');
      }
    } catch (err) {
      setError(err.message || 'Failed to load student');
      toast.error(err.message || 'Failed to load student');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <Loader message="Loading student..." />;
  }

  if (error) {
    return (
      <div className="space-y-4 pp-fade-in">
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="w-4 h-4" /> Back to students
        </Link>
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
      </div>
    );
  }

  const s = student || {};

  return (
    <div className="space-y-6 pp-fade-in">
      <button
        onClick={() => navigate('/admin/students')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to students
      </button>

      {/* Profile header */}
      <Card className="!p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {s.pictureUrl ? (
            <img
              src={s.pictureUrl}
              alt={s.name}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center text-2xl font-extrabold shrink-0">
              {s.name ? s.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {s.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 justify-center sm:justify-start mt-1">
              <Mail className="w-4 h-4" /> {s.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Student
              </span>
              {s.provider && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium capitalize">
                  {String(s.provider).toLowerCase()} sign-in
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Activity stats */}
      <div className="grid grid-cols-2 gap-4">
        <MiniStat
          icon={ClipboardCheck}
          label="Tests Attempted"
          value={s.totalTestsAttempted}
          accent="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
        />
        <MiniStat
          icon={CheckCircle2}
          label="Tests Completed"
          value={s.testsCompleted}
          accent="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Details */}
      <Card className="!p-6">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Profile Details</h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <InfoRow icon={Calendar} label="Registered On" value={formatDate(s.createdAt)} />
          <InfoRow icon={Building2} label="College" value={s.college} />
          <InfoRow icon={GraduationCap} label="Branch" value={s.branch} />
          <InfoRow
            icon={GraduationCap}
            label="Graduation Year"
            value={s.graduationYear ? String(s.graduationYear) : null}
          />
        </div>
      </Card>
    </div>
  );
};
