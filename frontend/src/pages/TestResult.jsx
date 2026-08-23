import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { testApi } from '../api';
import { ScoreSummaryCard } from '../components/result/ScoreSummaryCard';
import { AnswerReviewItem } from '../components/result/AnswerReviewItem';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { 
  RotateCcw, 
  LayoutDashboard, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const TestResult = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state?.resultData || null);
  const [loading, setLoading] = useState(!result);
  const [filter, setFilter] = useState('ALL'); // ALL, CORRECT, INCORRECT, UNATTEMPTED

  useEffect(() => {
    if (!result && testId) {
      const fetchResult = async () => {
        try {
          const res = await testApi.getTestResult(testId);
          if (res.success && res.data) {
            setResult(res.data);
          }
        } catch (err) {
          console.error('Failed to load test result:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchResult();
    }
  }, [testId, result]);

  if (loading) {
    return <Loader message="Evaluating score & preparing detailed solutions..." />;
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Result not found for this test.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const reviews = result.reviews || [];
  const filteredReviews = reviews.filter((r) => {
    if (filter === 'CORRECT') return r.isCorrect;
    if (filter === 'INCORRECT') return !r.isCorrect && r.selectedOption;
    if (filter === 'UNATTEMPTED') return !r.selectedOption;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Score Summary Card */}
      <ScoreSummaryCard result={result} />

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard className="w-4 h-4 mr-1.5" />
            Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/aptitude')}
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            More Chapters
          </Button>
        </div>

        {result.chapterId && (
          <Button
            variant="primary"
            size="sm"
            onClick={async () => {
              try {
                const res = await testApi.startChapterTest(result.chapterId);
                if (res.success && res.data) {
                  navigate(`/test/${res.data.testId}`, { state: { testData: res.data } });
                }
              } catch (e) {
                alert('Failed to launch re-test');
              }
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Retake Test
          </Button>
        )}
      </div>

      {/* Review Filter Bar */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Question-by-Question Review
        </h3>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All', count: reviews.length },
            { id: 'CORRECT', label: 'Correct', count: result.correctAnswers },
            { id: 'INCORRECT', label: 'Incorrect', count: result.incorrectAnswers },
            { id: 'UNATTEMPTED', label: 'Skipped', count: result.unattemptedQuestions },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Question Reviews */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review, idx) => (
            <AnswerReviewItem
              key={review.questionId}
              review={review}
              index={review.questionOrder ? review.questionOrder - 1 : idx}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-400">
            No questions in this filter category.
          </div>
        )}
      </div>
    </div>
  );
};
