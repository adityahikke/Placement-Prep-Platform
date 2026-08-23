import { useState, useEffect, useRef } from 'react';

export const useTestTimer = ({
  durationSeconds = 300,
  startedAt = null,
  onTimeUp,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      return Math.max(0, durationSeconds - elapsed);
    }
    return durationSeconds;
  });

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
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
  }, [secondsLeft]);

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
