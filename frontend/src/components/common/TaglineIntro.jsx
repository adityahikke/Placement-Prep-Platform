import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

/**
 * Full-screen animated brand intro shown once per browser session before the
 * app is revealed. The tagline animates in, holds briefly, then fades out and
 * calls {@link onDone}. Users can tap anywhere (or press the Skip control) to
 * dismiss it immediately. Reduced-motion users never see it (gated in App).
 */
export const TaglineIntro = ({ onDone }) => {
  const [leaving, setLeaving] = useState(false);

  // Hold the tagline on screen, then begin the exit fade.
  useEffect(() => {
    const hold = setTimeout(() => setLeaving(true), 2100);
    return () => clearTimeout(hold);
  }, []);

  // Once the exit fade starts, finish after the animation completes.
  useEffect(() => {
    if (!leaving) return undefined;
    const done = setTimeout(() => onDone?.(), 450);
    return () => clearTimeout(done);
  }, [leaving, onDone]);

  const skip = () => setLeaving(true);

  return (
    <div
      role="dialog"
      aria-label="Welcome to PlacementPrep"
      onClick={skip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 text-white select-none cursor-pointer ${
        leaving ? 'pp-intro-leaving' : ''
      }`}
    >
      <div className="pp-intro-pop mb-7 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25 shadow-2xl">
        <GraduationCap className="w-11 h-11" />
      </div>

      <div className="px-6 text-center">
        <h1 className="pp-intro-line1 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Practice What Matters,
        </h1>
        <h2 className="pp-intro-line2 mt-2 text-xl sm:text-3xl font-semibold text-blue-100">
          master what gets you hired
        </h2>
        <div
          className="pp-intro-underline mx-auto mt-6 h-1 w-40 rounded-full bg-white/70"
          aria-hidden="true"
        />
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute bottom-8 text-[11px] uppercase tracking-[0.2em] text-white/60 hover:text-white/90 transition-colors"
      >
        PlacementPrep · tap to skip
      </button>
    </div>
  );
};

export default TaglineIntro;
