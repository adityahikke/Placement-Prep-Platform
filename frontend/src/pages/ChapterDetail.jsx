import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentApi, testApi } from '../api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { 
  Clock, 
  CheckCircle2, 
  Play, 
  ArrowLeft, 
  HelpCircle, 
  Target, 
  Sparkles,
  Zap
} from 'lucide-react';

export const ChapterDetail = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await contentApi.getChapterDetails(chapterId);
        if (res.success && res.data) {
          setChapter(res.data);
        }
      } catch (err) {
        console.error('Failed to load chapter:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId]);

  const handleStartTest = async () => {
    setStarting(true);
    try {
      const res = await testApi.startChapterTest(chapterId);
      if (res.success && res.data) {
        navigate(`/test/${res.data.testId}`, { state: { testData: res.data } });
      }
    } catch (err) {
      alert(err.message || 'Failed to start test');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading chapter specifications & metrics..." />;
  }

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Chapter not found.</p>
        <Button onClick={() => navigate('/aptitude')} className="mt-4">
          Return to Aptitude
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Curriculum
      </button>

      {/* Main Chapter Banner */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-xl shadow-blue-500/15 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              {chapter.subjectName || 'Quantitative Aptitude'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {chapter.name}
            </h1>
            <p className="text-sm text-blue-100/90 mt-2 max-w-xl leading-relaxed">
              {chapter.description}
            </p>
          </div>

          <div className="shrink-0">
            <Button
              onClick={handleStartTest}
              loading={starting}
              disabled={chapter.totalQuestions === 0}
              variant="secondary"
              className="bg-white hover:bg-blue-50 text-blue-700 font-bold px-6 py-3 shadow-lg"
            >
              <Play className="w-4 h-4 fill-current mr-1.5" />
              Start 5-Min Test
            </Button>
          </div>
        </div>
      </Card>

      {/* Test Specifications & Rules Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3.5 p-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Test Duration</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">5 Minutes</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Question Format</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">10 Balanced MCQs</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">4 Easy, 4 Med, 2 Hard</p>
          </div>
        </Card>
      </div>

      {/* Question Bank Breakdown */}
      <Card>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
          Question Bank Distribution
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Each chapter contains ~100 questions structured into three distinct difficulty levels:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                Easy Tier
              </span>
              <span className="text-xs text-slate-400">40 Target</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
              {chapter.easyQuestions || 0} Questions
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Direct formula application & standard speed calculations.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
                Medium Tier
              </span>
              <span className="text-xs text-slate-400">40 Target</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
              {chapter.mediumQuestions || 0} Questions
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Multi-step word problems & analytical deductions.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">
                Hard Tier
              </span>
              <span className="text-xs text-slate-400">20 Target</span>
            </div>
            <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-2">
              {chapter.hardQuestions || 0} Questions
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Complex scenario problem solving & product company interview level.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
