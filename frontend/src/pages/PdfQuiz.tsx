import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  XCircle, 
  Zap,
  Loader2
} from 'lucide-react';
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
  type: 'mcq' | 'short' | 'conceptual';
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

const PdfQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const [answers, setAnswers] = useState<Record<number, any>>({});
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

  const handleSelect = (id: number, val: any) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const handleSubmit = () => {
    if (loading || error || !questions.length) return;
    const total = questions.length;
    
    let correctCount = 0;
    questions.forEach(q => {
      const ans = answers[q.id];
      if (q.type === 'mcq') {
        if (ans === q.correct_answer) correctCount++;
      } else {
        // Simple string match for short/conceptual
        if (ans?.toString().toLowerCase().trim() === q.correct_answer.toLowerCase().trim()) {
          correctCount++;
        }
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }
    
    // Persist result
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
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ClipboardList size={32} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-1 flex items-center gap-2">
                <Zap size={14} /> Exam Mode
              </p>
              <h1 className="text-3xl font-black text-app-text-main tracking-tight">Quiz on {pdfName}</h1>
              <p className="text-app-text-sub font-medium">Auto-generated from your PDF content. Accuracy varies based on document quality.</p>
            </div>
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
            <div className="flex flex-col items-center justify-center py-20 text-app-text-sub font-black uppercase tracking-widest gap-4">
              <div className="animate-spin text-primary">
                <Loader2 size={48} />
              </div>
              <span className="animate-pulse">Generating exam-grade quiz...</span>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl border-2 border-red-500/20 bg-red-500/10 text-red-600 font-bold flex items-center gap-4">
              <XCircle size={32} />
              <div>
                <p className="text-lg">Quiz Generation Failed</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="p-6 rounded-2xl border border-app-border bg-app-bg shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black text-xs">
                      {q.id}
                    </span>
                    <div className="flex-1">
                       <span className="text-[10px] font-black uppercase tracking-tighter text-blue-500 mb-1 block">
                         {q.type} Question
                       </span>
                       <p className="text-app-text-main font-bold text-lg leading-tight">{q.question}</p>
                    </div>
                  </div>

                  {q.type === 'mcq' && q.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {q.options.map((opt, idx) => {
                        const isSelected = answers[q.id] === opt;
                        const isCorrect = submitted && opt === q.correct_answer;
                        const isWrong = submitted && isSelected && opt !== q.correct_answer;
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelect(q.id, opt)}
                            disabled={submitted}
                            className={`text-left rounded-xl border-2 px-6 py-4 font-bold transition-all relative ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                                : 'border-slate-100 dark:border-slate-800 text-app-text-main hover:border-blue-200'
                            } ${isCorrect ? 'border-green-500! bg-green-50! text-green-700!' : ''} 
                            ${isWrong ? 'border-red-500! bg-red-50! text-red-700!' : ''}`}
                          >
                            <span className="mr-3 text-sm opacity-50">{String.fromCharCode(65 + idx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {(q.type === 'short' || q.type === 'conceptual') && (
                    <div className="mt-4">
                       <textarea
                         className="w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 focus:border-blue-500 outline-none transition-all font-medium text-app-text-main"
                         placeholder="Type your answer here..."
                         rows={2}
                         value={answers[q.id] || ''}
                         onChange={(e) => handleSelect(q.id, e.target.value)}
                         disabled={submitted}
                       />
                       {submitted && (
                         <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                            <p className="text-xs font-black uppercase text-blue-600 mb-1">Correct Answer / Criteria:</p>
                            <p className="text-blue-800 dark:text-blue-200 font-bold">{q.correct_answer}</p>
                         </div>
                       )}
                    </div>
                  )}

                  {submitted && q.explanation && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                       <p className="text-xs font-black uppercase text-slate-500 mb-1">Explanation:</p>
                       <p className="text-app-text-sub text-sm font-medium">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {submitted && score !== null && (
            <div className="mt-12 p-8 rounded-4xl bg-slate-900 text-white shadow-2xl flex items-center justify-between flex-wrap gap-6 border border-white/10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Quiz Results</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-5xl font-black">{score}</span>
                   <span className="text-xl text-slate-400">/ {questions.length}</span>
                </div>
                <p className="text-slate-400 mt-2 font-medium">Great effort! Review the explanations above to improve.</p>
              </div>
              <div className="flex gap-4">
                <Button
                  className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:scale-105 transition-all"
                  onClick={() => navigate('/lessons', { replace: true })}
                >
                  Lessons
                </Button>
                <Button
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-blue-500/30"
                  onClick={() => navigate('/dashboard', { replace: true })}
                >
                  Dashboard
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
