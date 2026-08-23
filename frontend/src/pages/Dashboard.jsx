import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/dashboard/StatsCard';
import { StreakWidget } from '../components/dashboard/StreakWidget';
import { SectionProgressCard } from '../components/dashboard/SectionProgressCard';
import { WeakAreaCard } from '../components/dashboard/WeakAreaCard';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Loader } from '../components/common/Loader';
import { RandomTestModal } from '../components/test/RandomTestModal';
import { 
  CheckCircle2, 
  HelpCircle, 
  Target, 
  Flame, 
  Zap, 
  BookOpen, 
  BarChart3, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [randomModalOpen, setRandomModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader message="Analyzing your placement readiness..." />;
  }

  const {
    questionsSolved = 0,
    totalTestsAttempted = 0,
    averageAccuracy = 0,
    currentStreak = 0,
    aptitudeProgress = 0,
    csProgress = 0,
    dsaProgress = 0,
    strongChapters = [],
    weakChapters = [],
    recentTests = [],
  } = stats || {};

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-300" /> Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to crack your dream company?
          </h1>
          <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
            Track your aptitude speed, refresh core CS fundamentals, and solve high-frequency DSA problems.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <Button
            onClick={() => setRandomModalOpen(true)}
            variant="secondary"
            className="bg-white hover:bg-blue-50 text-blue-700 font-semibold shadow-md"
          >
            <Zap className="w-4 h-4 fill-blue-600 text-blue-600 mr-1" />
            Quick Test
          </Button>
          <Button
            onClick={() => navigate('/aptitude')}
            className="bg-blue-500/40 hover:bg-blue-500/60 border border-white/30 text-white font-semibold backdrop-blur-sm"
          >
            Explore Aptitude
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Questions Solved"
          value={questionsSolved}
          subtitle="Correct answers across tests"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Tests Attempted"
          value={totalTestsAttempted}
          subtitle="Timed practice sessions"
          icon={Target}
          color="blue"
        />
        <StatsCard
          title="Average Accuracy"
          value={`${averageAccuracy}%`}
          subtitle={averageAccuracy >= 75 ? 'Excellent mastery' : 'Targeting 75%+'}
          icon={HelpCircle}
          color="amber"
        />
        <StatsCard
          title="Current Streak"
          value={`${currentStreak} Days`}
          subtitle="Keep daily momentum"
          icon={Flame}
          color="purple"
        />
      </div>

      {/* Streak Widget & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionProgressCard
            aptitudeProgress={aptitudeProgress}
            csProgress={csProgress}
            dsaProgress={dsaProgress}
          />

          {/* Recent Tests Table Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Recent Test Attempts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your last 5 timed test performances
                </p>
              </div>
              <Link
                to="/history"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentTests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Test Title</th>
                      <th className="pb-3 font-semibold">Score</th>
                      <th className="pb-3 font-semibold">Accuracy</th>
                      <th className="pb-3 font-semibold">Time</th>
                      <th className="pb-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentTests.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                          {t.testTitle || t.chapterName || 'Practice Test'}
                        </td>
                        <td className="py-3 font-bold text-blue-600 dark:text-blue-400">
                          {t.correctAnswers}/{t.totalQuestions}
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-semibold ${
                              t.accuracy >= 75
                                ? 'text-emerald-500'
                                : t.accuracy >= 50
                                ? 'text-amber-500'
                                : 'text-red-500'
                            }`}
                          >
                            {t.accuracy}%
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">
                          {t.timeTakenSeconds ? `${Math.floor(t.timeTakenSeconds / 60)}m ${t.timeTakenSeconds % 60}s` : '5m'}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/test/${t.id}/result`}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 space-y-3">
                <p>You haven't attempted any tests yet.</p>
                <Button size="sm" onClick={() => navigate('/aptitude')}>
                  Start First Test
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right side: Streak and Weak Areas */}
        <div className="space-y-6">
          <StreakWidget streak={currentStreak} />
          <WeakAreaCard weakChapters={weakChapters} strongChapters={strongChapters} />
        </div>
      </div>

      <RandomTestModal
        isOpen={randomModalOpen}
        onClose={() => setRandomModalOpen(false)}
      />
    </div>
  );
};
