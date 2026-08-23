import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { testApi } from '../api';
import { useTestTimer } from '../hooks/useTestTimer';
import { TestTimer } from '../components/test/TestTimer';
import { QuestionCard } from '../components/test/QuestionCard';
import { QuestionPalette } from '../components/test/QuestionPalette';
import { SubmitConfirmModal } from '../components/test/SubmitConfirmModal';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { ArrowLeft, ArrowRight, Send, AlertTriangle } from 'lucide-react';

export const TestEnvironment = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [testData, setTestData] = useState(location.state?.testData || null);
  const [loading, setLoading] = useState(!testData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: "A" | "B" | "C" | "D" }
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const submittingRef = useRef(false);

  // If page was refreshed without router state, fallback or recover
  useEffect(() => {
    if (!testData) {
      // If we don't have local test state, redirect to aptitude
      alert('Test session not found in memory. Please launch test from the chapter page.');
      navigate('/aptitude');
    }
  }, [testData, navigate]);

  const questions = testData?.questions || [];
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optionKey) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionKey,
    }));
  };

  const handleClearOption = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const performSubmit = useCallback(async (isAuto = false) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: parseInt(qId),
        selectedAnswer: ans,
      }));

      const res = await testApi.submitTest(testId, formattedAnswers);
      if (res.success && res.data) {
        navigate(`/test/${testId}/result`, { 
          state: { resultData: res.data, wasAutoSubmitted: isAuto },
          replace: true 
        });
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit test. Retrying...');
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [testId, answers, navigate]);

  // Hook for 5-minute timer and auto-submission
  const { formattedTime, isUrgent, isCritical } = useTestTimer({
    durationSeconds: testData?.durationSeconds || 300,
    startedAt: testData?.startedAt,
    onTimeUp: () => {
      setAutoSubmitted(true);
      performSubmit(true);
    },
  });

  if (loading || !testData) {
    return <Loader message="Initializing test environment..." fullScreen />;
  }

  const answeredCount = Object.values(answers).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Sticky Test Header Bar */}
      <div className="sticky top-20 z-20 flex items-center justify-between p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {testData.sectionCode || 'Aptitude'} • Timed Session
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-xs sm:max-w-md">
            {testData.testTitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <TestTimer
            formattedTime={formattedTime}
            isUrgent={isUrgent}
            isCritical={isCritical}
          />
          <Button
            size="sm"
            variant="primary"
            onClick={() => setConfirmModalOpen(true)}
            className="hidden sm:inline-flex"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Submit
          </Button>
        </div>
      </div>

      {autoSubmitted && (
        <div className="p-4 rounded-xl bg-red-500 text-white font-semibold text-center flex items-center justify-center gap-2 animate-bounce">
          <AlertTriangle className="w-5 h-5" />
          Time is up! Auto-submitting your test attempt...
        </div>
      )}

      {/* Main Test Grid (Question + Palette) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Area */}
        <div className="lg:col-span-2 space-y-4">
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            selectedOption={answers[currentQuestion?.id]}
            onSelectOption={handleSelectOption}
            onClearOption={handleClearOption}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Previous
            </Button>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {currentIndex + 1} of {questions.length}
            </span>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                onClick={() => setConfirmModalOpen(true)}
              >
                Finish <Send className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Right 1 Col: Question Palette */}
        <div className="lg:col-span-1">
          <QuestionPalette
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onSelectIndex={(idx) => setCurrentIndex(idx)}
            onSubmitClick={() => setConfirmModalOpen(true)}
          />
        </div>
      </div>

      <SubmitConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          setConfirmModalOpen(false);
          performSubmit(false);
        }}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        loading={submitting}
      />
    </div>
  );
};
