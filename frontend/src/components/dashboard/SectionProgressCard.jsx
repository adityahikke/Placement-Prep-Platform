import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Calculator, Cpu, Code, ArrowRight } from 'lucide-react';

export const SectionProgressCard = ({
  aptitudeProgress = 0,
  csProgress = 0,
  dsaProgress = 0,
}) => {
  const sections = [
    {
      title: 'Aptitude',
      desc: 'Quantitative, LR & Verbal',
      progress: aptitudeProgress,
      path: '/aptitude',
      icon: Calculator,
      color: 'blue',
    },
    {
      title: 'CS Fundamentals',
      desc: 'OS, DBMS, CN & OOP',
      progress: csProgress,
      path: '/cs-fundamentals',
      icon: Cpu,
      color: 'indigo',
    },
    {
      title: 'DSA Tracker',
      desc: 'Topic-wise Curated Problems',
      progress: dsaProgress,
      path: '/dsa',
      icon: Code,
      color: 'emerald',
    },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Preparation Sections
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track your syllabus completion across the three pillars
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Link
              key={sec.title}
              to={sec.path}
              className="block p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-500/30 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {sec.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sec.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
              </div>
              <ProgressBar progress={sec.progress} color={sec.color} />
            </Link>
          );
        })}
      </div>
    </Card>
  );
};
