import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi, testApi } from '../api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { Cpu, Database, Network, Boxes, Play, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CsFundamentals = () => {
  const navigate = useNavigate();
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('OS');
  const [startingTestId, setStartingTestId] = useState(null);

  useEffect(() => {
    const fetchCs = async () => {
      try {
        const res = await contentApi.getSectionByCode('CS_FUNDAMENTALS');
        if (res.success && res.data) {
          setSectionData(res.data);
          if (res.data.subjects?.length > 0) {
            setActiveSubject(res.data.subjects[0].code || 'OS');
          }
        }
      } catch (err) {
        console.error('Failed to load CS fundamentals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCs();
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
    return <Loader message="Loading CS Fundamentals modules & question banks..." />;
  }

  const subjects = sectionData?.subjects || [];
  const currentSubjectObj = subjects.find(s => s.code === activeSubject) || subjects[0];
  const chapters = currentSubjectObj?.chapters || [];

  const subjectIcons = {
    OS: Cpu,
    DBMS: Database,
    CN: Network,
    OOP: Boxes,
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
          <Cpu className="w-4 h-4" /> Section 2
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          CS Fundamentals
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Deep-dive into Operating Systems, DBMS, Computer Networks, and Object-Oriented Design patterns tested in technical rounds.
        </p>
      </div>

      {/* Subject Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 w-fit">
        {subjects.map((sub) => {
          const Icon = subjectIcons[sub.code] || Cpu;
          const isActive = activeSubject === sub.code;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {chapters.map((ch) => (
          <Card key={ch.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Topic Test
                </span>
                {ch.isAttempted && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Attempted ({ch.lastAccuracy}%)
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {ch.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {ch.description || 'Core theoretical concepts, MCQs, and interview questions.'}
              </p>

              <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                  {ch.totalQuestions || 0} Questions Bank
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Button
                onClick={() => handleStartTest(ch.id)}
                loading={startingTestId === ch.id}
                disabled={ch.totalQuestions === 0}
                className="flex-1 text-xs py-2.5 font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {ch.totalQuestions > 0 ? 'Start 5m Test' : 'Coming Soon'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
