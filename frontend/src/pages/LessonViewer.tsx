import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI, aiAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/Card';
import Button from '../components/Button';
import type { Lesson } from '../types';

const LessonViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings, t } = useSettings();
  const { accessibilityMode } = settings.themeAccessibility;
  const { language } = settings.learning;
  const answerStyle = ''; // TODO: Define answerStyle source or remove if not needed

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const audioStarted = useRef(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Get Lesson Metadata
        const lessonRes = await lessonsAPI.getById(id);
        if (lessonRes.success) {
          setLesson(lessonRes.lesson);
        }

        // 2. Check Cache for Summary
        const cachedSummary = localStorage.getItem(`lesson_summary_${id}_${language}_${answerStyle}`);
        if (cachedSummary) {
          setSummary(cachedSummary);
          setLoading(false);
        } else {
          // 3. Extract PDF Content (logic is on backend)
          try {
            const contentRes = await lessonsAPI.getContent(id);
            if (contentRes.success) {
              const rawContent = contentRes.content;

              // 4. Summarize via AI
              setSummarizing(true);
              const aiRes = await aiAPI.analyzePdf(
                rawContent,
                '',
                accessibilityMode.toLowerCase(),
                language,
                answerStyle
              );

              if (aiRes.success) {
                const generatedSummary = aiRes.summary;
                setSummary(generatedSummary);
                localStorage.setItem(`lesson_summary_${id}_${language}_${answerStyle}`, generatedSummary);
              }
            }
          } catch (err) {
            console.error('Failed to get content/summary', err);
            setSummary("Could not load lesson summary. Please try again.");
          }
        }
      } catch (error) {
        console.error('Failed to load lesson:', error);
      } finally {
        setLoading(false);
        setSummarizing(false);
      }
    };

    fetchLessonData();

    // Check completion status
    const storedCompleted = localStorage.getItem('lesson_completion_tracker');
    if (storedCompleted) {
      try {
        const ids = JSON.parse(storedCompleted) as string[];
        if (ids.includes(id || '')) {
          setCompleted(true);
        }
      } catch (e) {
        console.error('Error parsing completion tracker', e);
      }
    }
  }, [id, language, accessibilityMode]);

  // Accessibility: Text-to-Speech for Blind Mode
  useEffect(() => {
    if (accessibilityMode === 'Blind' && summary && !audioStarted.current) {
      const speech = new SpeechSynthesisUtterance(summary);
      speech.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';
      speech.rate = 0.9;
      window.speechSynthesis.speak(speech);
      audioStarted.current = true;
    }
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [summary, accessibilityMode, language]);

  const handleMarkCompleted = () => {
    if (!id) return;
    
    const stored = localStorage.getItem('lesson_completion_tracker');
    const completedIds = stored ? JSON.parse(stored) as string[] : [];
    
    if (!completedIds.includes(id)) {
      const newIds = [...completedIds, id];
      localStorage.setItem('lesson_completion_tracker', JSON.stringify(newIds));
      setCompleted(true);
    }
    
    // Redirect to lessons list
    navigate('/lessons');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-gray-100">Loading lesson context...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <h2 className="text-xl font-bold text-red-600">Lesson not found</h2>
          <Button onClick={() => navigate('/lessons')} className="mt-4">Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{lesson.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{lesson.level} Level • {lesson.duration}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/lessons')}>
            {t.nav.lessons}
          </Button>
        </div>

        <Card className="mb-8 p-6 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl">
          <div className="flex items-center gap-2 mb-6 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-xl">📄</span>
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">
              Smart Summarized Content
            </span>
          </div>

          {summarizing ? (
            <div className="py-12 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <p className="mt-6 text-gray-500 dark:text-gray-400 text-sm">Generating student-friendly summary...</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-indigo max-w-none dark:prose-invert">
              <div className="text-gray-900 dark:text-gray-100 leading-relaxed space-y-4 whitespace-pre-wrap text-lg">
                {summary || "No summary available."}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
             <div className="flex items-center gap-2">
                {completed ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Lesson Completed
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm italic">You haven't finished this lesson yet.</span>
                )}
             </div>
             
             <div className="flex gap-4">
                {accessibilityMode === 'Blind' && (
                   <Button variant="outline" onClick={() => {
                      window.speechSynthesis.cancel();
                      const speech = new SpeechSynthesisUtterance(summary);
                      speech.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';
                      window.speechSynthesis.speak(speech);
                   }}>
                      Replay Lesson
                   </Button>
                )}
                
                <Button 
                  variant={completed ? "outline" : "primary"} 
                  onClick={handleMarkCompleted}
                  className="px-8"
                >
                  {completed ? "Return to Lessons" : "Mark as Completed"}
                </Button>
             </div>
          </div>
        </Card>

        {/* Accessibility Context Notice */}
        <div className="bg-white dark:bg-gray-800 border-l-4 border-primary p-4 rounded-r-lg shadow-md border dark:border-gray-700">
          <div className="flex gap-3">
            <span className="text-xl">🛠️</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {accessibilityMode} Mode Integration
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {accessibilityMode === 'Blind' && "Text-to-speech is automatically playing. No visual interaction required."}
                {accessibilityMode === 'Deaf' && "Visual text only. Audio output is disabled for clear focus."}
                {accessibilityMode === 'Dumb' && "Interaction is limited to reading. Voice tools are disabled."}
                {accessibilityMode === 'Normal' && "Feel free to read the summary and mark it as complete when ready."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
