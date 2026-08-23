import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';
import { TaglineIntro } from './components/common/TaglineIntro';

// Decide whether to play the intro: only once per browser session, and never
// for visitors who prefer reduced motion.
const shouldPlayIntro = () => {
  if (typeof window === 'undefined') return false;
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return false;
  try {
    return !sessionStorage.getItem('pp_intro_seen');
  } catch {
    return true;
  }
};

function App() {
  const [showIntro, setShowIntro] = useState(shouldPlayIntro);

  const handleIntroDone = () => {
    try {
      sessionStorage.setItem('pp_intro_seen', '1');
    } catch {
      /* sessionStorage unavailable — intro simply plays again next mount */
    }
    setShowIntro(false);
  };

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            {showIntro && <TaglineIntro onDone={handleIntroDone} />}
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
