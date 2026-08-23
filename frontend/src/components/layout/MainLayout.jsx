import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { RandomTestModal } from '../test/RandomTestModal';
import { dashboardApi } from '../../api';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [randomTestModalOpen, setRandomTestModalOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await dashboardApi.getStats();
        if (res.success && res.data) {
          setStreak(res.data.currentStreak || 0);
        }
      } catch (err) {
        // silent fallback
      }
    };
    fetchStreak();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        streak={streak}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenRandomTest={() => setRandomTestModalOpen(true)}
        />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full transition-all">
          <Outlet />
        </main>
      </div>

      <RandomTestModal
        isOpen={randomTestModalOpen}
        onClose={() => setRandomTestModalOpen(false)}
      />
    </div>
  );
};
