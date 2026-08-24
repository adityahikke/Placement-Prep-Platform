import { useState, useEffect, useRef } from 'react';

export const useTestTimer = ({
  durationSeconds = 300,
  startedAt = null,
  onTimeUp,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (startedAt) {
      try {
        // Normalize ISO string without timezone to UTC so browser timezone offsets don't break the timer
        let dateStr = startedAt;
        if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
          dateStr = dateStr + 'Z';
        }
        const startTime = new Date(dateStr).getTime();
        if (!isNaN(startTime)) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          // Only apply elapsed if within reasonable window (e.g., user refreshed the page during active test)
          if (elapsed >= 0 && elapsed < durationSeconds) {
            return durationSeconds - elapsed;
          }
        }
      } catch (e) {
        console.warn('Could not parse startedAt, falling back to full duration:', e);
      }
    }
    return durationSeconds;
  });

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  // Track initial mount so we don't trigger onTimeUp immediately on mount
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (secondsLeft <= 0) {
        // Reset if it was 0 due to an initialization glitch
        setSecondsLeft(durationSeconds);
        return;
      }
    }

    if (secondsLeft <= 0) {
      if (onTimeUpRef.current) onTimeUpRef.current();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUpRef.current) onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, durationSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const percentage = (secondsLeft / durationSeconds) * 100;
  const isUrgent = secondsLeft <= 60;
  const isCritical = secondsLeft <= 30;

  return {
    secondsLeft,
    formattedTime,
    percentage,
    isUrgent,
    isCritical,
  };
};
