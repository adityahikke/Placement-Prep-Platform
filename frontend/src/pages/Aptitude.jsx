import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi, testApi } from '../api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { 
  Calculator, 
  Brain, 
  BookText, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const Aptitude = () => {
  const navigate = useNavigate();
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('QUANT');
  const [startingTestId, setStartingTestId] = useState(null);

  useEffect(() => {
    const fetchAptitude = async () => {
      try {
        const res = await contentApi.getSectionByCode('APTITUDE');
        if (res.success && res.data) {
          setSectionData(res.data);
          if (res.data.subjects && res.data.subjects.length > 0) {
            setActiveSubject(res.data.subjects[0].code || 'QUANT');
          }
        }
      } catch (err) {
        console.error('Failed to load aptitude curriculum:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAptitude();
  }, []);

  const handleStartTest = async (chapterId) => {
    setStartingTestId(chapterId);
    try {
      const res = await testApi.startChapterTest(chapterId);
      if (res.success && res.data) {
        navigate(`/test/${res.data.testId}`, { state: { testData: res.data } });
      }
    } catch (err) {
      alert(err.message || 'Failed to start test');
    } finally {
      setStartingTestId(null);
    }
  };

  if (loading) {
    return <Loader message="Loading Aptitude curriculum & question banks..." />;
  }

  const subjects = sectionData?.subjects || [];
  const currentSubjectObj = subjects.find(s => s.code === activeSubject) || subjects[0];
  const chapters = currentSubjectObj?.chapters || [];

  const subjectIcons = {
    QUANT: Calculator,
    LR: Brain,
    VERBAL: BookText,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
          <Calculator className="w-4 h-4" /> Section 1
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Aptitude Preparation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Organized chapter-wise with ~100 questions per chapter (40 Easy, 40 Medium, 20 Hard) and 5-minute balanced timed tests.
        </p>
      </div>

      {/* Subject Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 w-fit">
        {subjects.map((sub) => {
          const Icon = subjectIcons[sub.code] || Calculator;
          const isActive = activeSubject === sub.code;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sub.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {sub.chapters?.length || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {chapters.map((ch) => {
          const isFeatured = ['Percentage', 'Profit and Loss', 'Time and Work'].includes(ch.name);
          const hasAttempts = ch.isAttempted;

          return (
            <Card
              key={ch.id}
              className={`flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                isFeatured
                  ? 'border-blue-500/30 dark:border-blue-500/20 bg-gradient-to-b from-white via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 shadow-md shadow-blue-500/5'
                  : ''
              }`}
            >
              {isFeatured && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-bl-xl shadow-xs">
                  Active Q-Bank
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Chapter
                  </span>
                  {hasAttempts && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Attempted ({ch.lastAccuracy}%)
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                  {ch.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {ch.description || 'Master key concepts, short-cut formulas, and timed problem solving.'}
                </p>

                {/* Difficulty breakdown chips */}
                <div className="flex flex-wrap gap-1.5 mt-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                    Easy: {ch.easyQuestions || 0}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
                    Med: {ch.mediumQuestions || 0}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40">
                    Hard: {ch.hardQuestions || 0}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Button
                  onClick={() => handleStartTest(ch.id)}
                  loading={startingTestId === ch.id}
                  disabled={ch.totalQuestions === 0}
                  className="flex-1 text-xs py-2.5 font-semibold"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {ch.totalQuestions > 0 ? 'Start 5m Test' : 'Coming Soon'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/chapter/${ch.id}`)}
                  className="text-xs px-3 py-2.5"
                  title="View chapter details"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
