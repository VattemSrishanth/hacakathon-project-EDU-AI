import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { quizAPI } from '../services/api';

interface LocationState {
  pdfUrl?: string;
  pdfName?: string;
  pdfData?: string;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

const EMPTY_QUIZ: Question[] = [];

const PdfQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => !!document.fullscreenElement);

  const pdfName = state.pdfName || 'Uploaded PDF';
  const pdfData = state.pdfData;

  // Guard: if no pdf data, send back to lessons
  useEffect(() => {
    if (!state.pdfUrl || !pdfData) {
      navigate('/lessons', { replace: true });
    }
  }, [navigate, pdfData, state.pdfUrl]);

  // Keep quiz in fullscreen until submission
  useEffect(() => {
    const root = document.documentElement;
    const ensureFullScreen = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!document.fullscreenElement && !submitted) {
        root.requestFullscreen?.().catch(() => undefined);
      }
    };
    ensureFullScreen();
    document.addEventListener('fullscreenchange', ensureFullScreen);
    return () => {
      document.removeEventListener('fullscreenchange', ensureFullScreen);
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => undefined);
      }
    };
  }, [submitted]);

  // Block back navigation during quiz
  useEffect(() => {
    const block = () => window.history.forward();
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', block);
    return () => {
      window.removeEventListener('popstate', block);
    };
  }, []);

  // Load PDF text and build quiz from content
  useEffect(() => {
    const load = async () => {
      if (!pdfData) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await quizAPI.generateFromPdf(pdfData, pdfName);
        if (response?.success && Array.isArray(response.questions)) {
          setQuestions(response.questions as Question[]);
        } else {
          setQuestions(EMPTY_QUIZ);
          setError(response?.error || 'Could not generate quiz from PDF.');
        }
      } catch (e: any) {
        console.error('Failed to generate quiz', e);
        const errMsg = e?.response?.data?.error || e?.message || 'Network error. Make sure the backend server is running.';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pdfData, pdfName]);

  const handleSelect = (id: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [id]: optionIndex }));
  };

  const handleSubmit = () => {
    if (loading || error || !questions.length) return;
    const total = questions.length;
    const correctCount = questions.reduce((acc, q) => {
      return acc + ((answers[q.id] ?? -1) === q.correct ? 1 : 0);
    }, 0);
    setScore(correctCount);
    setSubmitted(true);

    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }

    const result = {
      id: Date.now(),
      pdfName,
      score: correctCount,
      total,
      submittedAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem('quiz_results') || '[]') as typeof result[];
      localStorage.setItem('quiz_results', JSON.stringify([result, ...existing].slice(0, 20)));
    } catch (e) {
      console.error('Failed to persist quiz result', e);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg-alt py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-app-text-muted">Exam Mode</p>
            <h1 className="text-3xl font-black text-app-text-main">Quiz on {pdfName}</h1>
            <p className="text-app-text-sub font-medium">15 questions generated from your PDF. Stay in full screen until you submit.</p>
          </div>
            {!submitted && !isFullscreen && !loading && !error && (
              <Button
                variant="secondary"
                onClick={() => document.documentElement.requestFullscreen?.()}
                className="rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                Enter Fullscreen
              </Button>
            )}
          {submitted && (
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard', { replace: true })}
              className="rounded-xl font-black uppercase tracking-widest text-[10px]"
            >
              View Dashboard
            </Button>
          )}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-app-text-muted">No PDF Access</p>
              <p className="text-app-text-sub font-medium">Stay on this page until you submit. Back navigation is disabled.</p>
            </div>
            {!submitted && !loading && !error && (
              <Button
                variant="primary"
                onClick={handleSubmit}
                className="rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                Submit Quiz
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-app-text-sub font-bold">Generating quiz from your PDF...</div>
          ) : error ? (
            <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-700 font-bold">{error}</div>
          ) : (
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="p-4 rounded-xl border border-app-border bg-app-bg-alt">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">{q.id}</span>
                    <p className="text-app-text-main font-bold leading-snug">{q.text}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, idx) => {
                      const selected = answers[q.id] === idx;
                      const isCorrect = submitted && q.correct === idx;
                      const isWrong = submitted && selected && q.correct !== idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(q.id, idx)}
                          className={`text-left rounded-xl border px-4 py-3 font-medium transition-all ${
                            selected ? 'border-primary text-primary bg-primary/5' : 'border-app-border text-app-text-main hover:border-primary/40'
                          } ${isCorrect ? 'border-green-500 text-green-600 bg-green-500/10' : ''} ${isWrong ? 'border-red-500 text-red-600 bg-red-500/10' : ''}`}
                          disabled={submitted}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {submitted && score !== null && (
            <div className="mt-8 p-5 rounded-xl bg-app-bg border border-app-border flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-app-text-muted">Quiz submitted</p>
                <p className="text-app-text-main font-black text-xl">Score: {score}/{questions.length}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/lessons', { replace: true })}
                  className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  Back to Lessons
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/dashboard', { replace: true })}
                  className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PdfQuiz;
