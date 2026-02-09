import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useOffline } from '../context/OfflineContext';
import { useProgress } from '../context/ProgressContext';
import { lessonsAPI } from '../services/api';
import { offlineContentService } from '../services/offlineContent';
import SignLanguagePanel from '../components/Syllabus/SignLanguagePanel';
import { 
  Upload, 
  Volume2, 
  FileText, 
  BookOpen, 
  Loader2,
  ChevronLeft,
  Sparkles,
  Download,
  CheckCircle2,
  WifiOff
} from 'lucide-react';
import Button from '../components/Button';

interface LessonData {
  id: string;
  title: string;
  description: string;
  pdfUrl?: string;
  aiSummary: string;
  textVersion: string;
}

export default function LessonViewer() {
  const { lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { settings } = useSettings();
  const { signLanguageEnabled, updateAccessibility } = useAccessibility();
  const { isOffline, downloadLesson, removeLesson, downloadedLessons, downloadingIds } = useOffline();
  const { startLessonTimer, stopLessonTimer, markLessonCompleted } = useProgress();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPdf, setUploadedPdf] = useState<string | null>(location.state?.pdfUrl || null);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    if (lessonId) {
      startLessonTimer(lessonId);
    }
    return () => {
      if (lessonId) {
        stopLessonTimer(lessonId);
      }
    };
  }, [lessonId]);

  // Force captions when sign language is enabled
  useEffect(() => {
    if (signLanguageEnabled) {
      updateAccessibility({ captionsEnabled: true });
    }
  }, [signLanguageEnabled]);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      if (lessonId === 'uploaded') {
        const state = location.state;
        if (state) {
          setLesson({
            id: 'uploaded',
            title: state.pdfName || 'Uploaded PDF',
            description: 'Custom learning material',
            pdfUrl: state.pdfUrl,
            aiSummary: 'Analyzing your custom document...',
            textVersion: 'Extracting text for accessibility...'
          });
        }
        setLoading(false);
        return;
      }

      try {
        // First check offline storage
        let offlineLesson = null;
        if (auth?.user?.id) {
          offlineLesson = await offlineContentService.getLesson(String(auth.user.id), lessonId);
        }

        if (offlineLesson) {
          setLesson({
            id: offlineLesson.id,
            title: offlineLesson.title,
            description: 'Offline Content',
            aiSummary: offlineLesson.content.aiSummary || offlineLesson.content.summary || 'This content is available offline.',
            textVersion: offlineLesson.content.textVersion || offlineLesson.content.content || ''
          });
          setLoading(false);
          return;
        }

        if (isOffline) {
          setError('Connect to the internet to load this lesson');
          setLoading(false);
          return;
        }

        const res = await lessonsAPI.getOne(lessonId);
        if (res.success) {
          setLesson(res.lesson);
        }
      } catch (e) {
        console.error('Failed to fetch lesson', e);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();

    // Announce lesson loaded for screen readers
    if (settings.themeAccessibility.accessibilityMode === 'Blind' && lesson) {
      announceText(`Lesson ${lesson.title} loaded`);
    }
  }, [lessonId, location.state, settings.themeAccessibility.accessibilityMode]);

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const pdfDataUrl = e.target?.result as string;
        setUploadedPdf(pdfDataUrl);
        // Store in localStorage for persistence
        localStorage.setItem(`lesson-pdf-${lessonId}`, pdfDataUrl);
        
        if (settings.themeAccessibility.accessibilityMode === 'Blind') {
          announceText('PDF uploaded successfully');
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const announceText = (text: string) => {
    if (settings.themeAccessibility.accessibilityMode !== 'Blind') return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.learning.language === 'English' ? 'en-US' : 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleReadAloud = (text: string) => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      announceText(text);
      setIsReading(true);
      
      // Reset isReading when speech ends
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsReading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="text-center animate-pulse">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-black text-app-text-main">Opening Lesson...</h2>
          <p className="text-app-text-sub text-sm font-bold uppercase tracking-widest mt-2">Connecting to Knowledge Base</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
            <WifiOff size={48} />
          </div>
          <p className="text-app-text-main font-black text-xl uppercase tracking-widest">{error}</p>
          <Button variant="outline" className="mt-6" onClick={() => navigate('/lessons')}>Return to Lessons</Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse text-primary">
            <BookOpen size={48} />
          </div>
          <p className="text-app-text-main font-black text-xl uppercase tracking-widest">Lesson Not Found</p>
        </div>
      </div>
    );
  }

  const showTextVersion = settings.themeAccessibility.accessibilityMode === 'Blind' || 
                          settings.themeAccessibility.accessibilityMode === 'Deaf' || 
                          (!lesson?.pdfUrl && !uploadedPdf);

  return (
    <div className={`min-h-screen bg-app-bg text-app-text-main px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${signLanguageEnabled ? 'py-20' : 'py-12'}`}>
      <div className={`max-auto ${signLanguageEnabled ? 'max-w-7xl' : 'max-w-5xl'} ${signLanguageEnabled ? 'space-y-16' : 'space-y-10'}`}>
        {/* Header */}
        <div className="space-y-6">
          <button
            onClick={() => navigate('/lessons')}
            className="group flex items-center gap-3 text-app-text-sub hover:text-primary transition-all font-black text-xs uppercase tracking-[0.2em]"
          >
            <div className="p-2 rounded-xl bg-app-bg-alt border border-app-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all text-primary">
              <ChevronLeft size={16} />
            </div>
            Back to Learning Area
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tight uppercase leading-[0.9] text-primary">{lesson.title}</h1>
              <p className="text-app-text-sub font-bold text-sm uppercase tracking-[0.15em] opacity-70">Lesson Overview & Content</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {lesson.id !== 'uploaded' && (
                <>
                  {downloadedLessons.includes(lesson.id) ? (
                    <Button
                      variant="outline"
                      onClick={() => removeLesson(lesson.id)}
                      className="flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-secondary hover:text-red-500 transition-colors"
                    >
                      <CheckCircle2 size={20} />
                      Lesson Downloaded (Delete?)
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => downloadLesson(lesson.id)}
                      disabled={isOffline || downloadingIds.includes(lesson.id)}
                      className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest"
                    >
                      {downloadingIds.includes(lesson.id) ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : isOffline ? (
                        <WifiOff size={20} />
                      ) : (
                        <Download size={20} />
                      )}
                      {downloadingIds.includes(lesson.id) ? 'Downloading...' : isOffline ? 'Offline' : 'Save Offline'}
                    </Button>
                  )}
                </>
              )}

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <Button 
                  variant="primary" 
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest"
                >
                  <Upload size={20} />
                  Update Lesson PDF
                </Button>
              </label>
              
              {settings.themeAccessibility.accessibilityMode === 'Blind' && (
                <Button
                  variant="success"
                  onClick={() => handleReadAloud(lesson.textVersion)}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg shadow-secondary/20 text-xs font-black uppercase tracking-widest"
                >
                  <div className={isReading ? 'animate-pulse' : ''}>
                    <Volume2 size={24} />
                  </div>
                  {isReading ? 'Stop Narrator' : 'Start Narrator'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-app-bg-alt rounded-[2.5rem] p-4 border border-app-border shadow-sm group">
          <div className="bg-app-bg rounded-4xl p-8 space-y-4 border border-app-border group-hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Sparkles size={24} />
              </div>
              <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">AI Key Summary</h2>
              {settings.themeAccessibility.accessibilityMode === 'Blind' && (
                <button
                  onClick={() => handleReadAloud(lesson.aiSummary)}
                  className="ml-auto p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all text-primary"
                >
                  <Volume2 size={24} />
                </button>
              )}
            </div>
            <p className="text-app-text-main leading-relaxed font-bold text-lg max-w-4xl">{lesson.aiSummary}</p>
          </div>
        </div>

        {/* Content Area */}
        {signLanguageEnabled ? (
          <SignLanguagePanel 
            lessonTitle={lesson.title} 
            transcript={lesson.textVersion}
            // signVideoUrl={lesson.signVideoUrl} // Assuming this might exist in future backend schema
          />
        ) : showTextVersion ? (
          /* Text Version for Accessibility */
          <div className="bg-app-bg-alt rounded-[2.5rem] p-10 border border-app-border shadow-inner">
            <h2 className="text-2xl font-black text-app-text-main mb-8 uppercase tracking-tight">Lesson Content</h2>
            <div className="prose prose-slate prose-xl dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-app-text-main leading-relaxed font-bold">
                {lesson.textVersion}
              </pre>
            </div>
          </div>
        ) : (
          /* PDF Viewer */
          <div className="bg-app-bg-alt rounded-[2.5rem] p-3 border border-app-border shadow-2xl overflow-hidden ring-1 ring-app-border">
            {uploadedPdf || lesson.pdfUrl ? (
              <div className="relative rounded-[1.8rem] overflow-hidden bg-app-bg">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <a 
                    href={uploadedPdf || lesson.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-all"
                    title="Open in New Tab"
                  >
                    <Download size={16} />
                  </a>
                </div>
                <iframe
                  src={`${uploadedPdf || lesson.pdfUrl}#toolbar=0&navpanes=0`}
                  className="w-full border-0"
                  style={{ height: '850px' }}
                  title={`${lesson.title} PDF`}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 px-4 text-center bg-app-bg rounded-4xl">
                <div className="w-24 h-24 rounded-3xl bg-app-bg-alt border border-app-border flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-primary/60">
                  <FileText size={40} />
                </div>
                <h3 className="text-2xl font-black text-app-text-main mb-3 uppercase tracking-tight">
                  No PDF Content Available
                </h3>
                <p className="text-app-text-sub font-bold mb-10 max-w-md uppercase text-xs tracking-widest opacity-60">
                  Please upload a PDF document to begin viewing this lesson's specialized content.
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <Button variant="primary" className="flex items-center gap-4 px-10 py-5 rounded-4xl shadow-2xl shadow-primary/30 text-sm font-black uppercase tracking-[0.2em] transform active:scale-95 transition-all">
                    <Upload size={28} />
                    Upload PDF Now
                  </Button>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Completion Area */}
        <div className="flex justify-center pt-8">
          <Button 
            variant="success" 
            className="flex items-center gap-4 px-12 py-6 rounded-4xl shadow-2xl shadow-secondary/20 text-sm font-black uppercase tracking-[0.2em]"
            onClick={() => {
              if (lessonId) {
                markLessonCompleted(lessonId, `Completed lesson: ${lesson.title}`);
                navigate('/lessons');
              }
            }}
          >
            <CheckCircle2 size={24} />
            Mark Lesson as Completed
          </Button>
        </div>
      </div>
    </div>
  );
}
