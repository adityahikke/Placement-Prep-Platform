import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Cpu,
  Code,
  History,
  BarChart3,
  Zap,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, onOpenRandomTest }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Aptitude', path: '/aptitude', icon: Calculator, badge: 'Tests' },
    { label: 'CS Fundamentals', path: '/cs-fundamentals', icon: Cpu },
    { label: 'DSA Tracker', path: '/dsa', icon: Code, badge: 'Curated' },
    { label: 'Test History', path: '/history', icon: History },
    { label: 'Analytics', path: '/progress', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 z-40 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Quick random test CTA */}
          <button
            onClick={() => {
              if (onOpenRandomTest) onOpenRandomTest();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 font-medium text-sm transition-all group"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              Quick Random Test
            </span>
            <Sparkles className="w-3.5 h-3.5 opacity-75 group-hover:rotate-12 transition-transform" />
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-slate-700 dark:text-slate-300">PlacementPrep 1.0</p>
          <p className="text-[11px] mt-0.5">Engineered for campus hiring success.</p>
        </div>
      </aside>
    </>
  );
};
