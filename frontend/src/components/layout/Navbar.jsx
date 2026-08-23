import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  GraduationCap, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  Flame, 
  Menu,
  ShieldCheck
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar, streak = 0 }) => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PlacementPrep
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 ml-2 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              Pro
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs">
          <Flame className="w-4 h-4 fill-amber-500 animate-pulse-subtle" />
          <span>{streak} Day Streak</span>
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* User Info & Role */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.name || 'Student'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-indigo-500" />
                  Admin
                </>
              ) : (
                user?.college || 'Student'
              )}
            </span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
