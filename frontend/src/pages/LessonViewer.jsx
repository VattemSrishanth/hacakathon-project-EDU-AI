import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useOffline } from '../context/OfflineContext';
import { useProgress } from '../context/ProgressContext';
import { lessonsAPI } from '../services/api';
import { offlineContentService } from '../services/offlineContent';
import SignLanguagePanel from '../components/Syllabus/SignLanguagePanel';
import { youtubeService, generateSearchQuery } from '../services/youtubeService';
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
  WifiOff,
  Maximize } from
'lucide-react';
import Button from '../components/Button';











export default function LessonViewer() {
  const { lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { settings } = useSettings();
  const { signLanguageEnabled, updateAccessibility } = useAccessibility();
  const { isOffline, downloadLesson, removeLesson, downloadedLessons, downloadingIds } = useOffline();
  const { startLessonTimer, stopLessonTimer, markLessonCompleted } = useProgress();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedPdf, setUploadedPdf] = useState(location.state?.pdfUrl || null);
  const [isReading, setIsReading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState(null);
  const [videoTranscript, setVideoTranscript] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const pdfContainerRef = useRef(null);

  const handleFullscreen = () => {
    if (!document.fullscreenElement && pdfContainerRef.current) {
      pdfContainerRef.current.requestFullscreen?.().catch(() => undefined);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

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

      // Redirect to dedicated sign language page for standard lessons
      if (lessonId && lessonId !== 'uploaded') {
        navigate(`/sign-language/${lessonId}`, { state: { lesson } });
      }
    }
  }, [signLanguageEnabled, lessonId, lesson, navigate]);

  // Fetch YouTube sign language video when mode is active
  useEffect(() => {
    const fetchSignLanguageVideo = async () => {
      // Only fetch if dumb mode is on and we don't have a video yet
      if (signLanguageEnabled && lesson && !youtubeEmbedUrl && !videoLoading) {
        setVideoLoading(true);
        setVideoError(null);
        try {
          const query = generateSearchQuery(lesson);
          const result = await youtubeService.searchSignLanguageVideo(query);
          setYoutubeEmbedUrl(result.embedUrl);

          // Try to get captions/transcript for accurately displaying content
          try {
            const transcript = await youtubeService.getVideoCaptions(result.videoId);
            if (transcript) setVideoTranscript(transcript);
          } catch (tErr) {
            console.log("Captions not found, will fallback to description");
          }
        } catch (err) {
          console.error("Failed to load sign language video:", err);
          setVideoError("Sign language video not available.");
        } finally {
          setVideoLoading(false);
        }
      }
    };

    fetchSignLanguageVideo();
  }, [signLanguageEnabled, lesson, youtubeEmbedUrl, videoLoading]);

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
            signVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
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
            signVideoUrl: offlineLesson.content.signVideoUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
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

  const handlePdfUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const pdfDataUrl = e.target?.result;
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

  const announceText = (text) => {
    if (settings.themeAccessibility.accessibilityMode !== 'Blind') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.learning.language === 'English' ? 'en-US' : 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleReadAloud = (text) => {
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
      </div>);

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
      </div>);

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
      </div>);

  }

  const showTextVersion = settings.themeAccessibility.accessibilityMode === 'Blind' ||
  settings.themeAccessibility.accessibilityMode === 'Deaf' ||
  !lesson?.pdfUrl && !uploadedPdf;

  return (
    <div className={`min-h-screen bg-app-bg text-app-text-main px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${signLanguageEnabled ? 'py-20' : 'py-12'}`}>
      <div className={`mx-auto ${signLanguageEnabled ? 'max-w-7xl' : 'max-w-5xl'} ${signLanguageEnabled ? 'space-y-16' : 'space-y-10'}`}>
        {/* Header */}
        <div className="space-y-6">
          <button
            onClick={() => navigate('/lessons')}
            className="group flex items-center gap-3 text-app-text-sub hover:text-primary transition-all font-black text-xs uppercase tracking-[0.2em]">
            
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
              {lesson.id !== 'uploaded' &&
              <>
                  {downloadedLessons.includes(lesson.id) ?
                <Button
                  variant="outline"
                  onClick={() => removeLesson(lesson.id)}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-secondary hover:text-red-500 transition-colors">
                  
                      <CheckCircle2 size={20} />
                      Lesson Downloaded (Delete?)
                    </Button> :

                <Button
                  variant="primary"
                  onClick={() => downloadLesson(lesson.id)}
                  disabled={isOffline || downloadingIds.includes(lesson.id)}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest">
                  
                      {downloadingIds.includes(lesson.id) ?
                  <Loader2 size={20} className="animate-spin" /> :
                  isOffline ?
                  <WifiOff size={20} /> :

                  <Download size={20} />
                  }
                      {downloadingIds.includes(lesson.id) ? 'Downloading...' : isOffline ? 'Offline' : 'Save Offline'}
                    </Button>
                }
                </>
              }

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden" />
                
                <Button
                  variant="primary"
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest">
                  
                  <Upload size={20} />
                  Update Lesson PDF
                </Button>
              </label>

              {(lesson.pdfUrl || uploadedPdf) &&
              <Button
                variant="ai-accent"
                onClick={() => setShowPdf(!showPdf)}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest">
                
                  <FileText size={20} />
                  {showPdf ? 'Hide Reference PDF' : 'View Reference PDF'}
                </Button>
              }
              
              {settings.themeAccessibility.accessibilityMode === 'Blind' &&
              <Button
                variant="success"
                onClick={() => handleReadAloud(lesson.textVersion)}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg shadow-secondary/20 text-xs font-black uppercase tracking-widest">
                
                  <div className={isReading ? 'animate-pulse' : ''}>
                    <Volume2 size={24} />
                  </div>
                  {isReading ? 'Stop Narrator' : 'Start Narrator'}
                </Button>
              }
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
              {settings.themeAccessibility.accessibilityMode === 'Blind' &&
              <button
                onClick={() => handleReadAloud(lesson.aiSummary)}
                className="ml-auto p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all text-primary">
                
                  <Volume2 size={24} />
                </button>
              }
            </div>
            <p className="text-app-text-main leading-relaxed font-bold text-lg max-w-4xl">{lesson.aiSummary}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-10">
          {showPdf && (uploadedPdf || lesson.pdfUrl) &&
          <div ref={pdfContainerRef} className="bg-app-bg-alt rounded-[2.5rem] p-3 border-4 border-primary/30 shadow-2xl overflow-hidden ring-4 ring-primary/10 animate-in zoom-in duration-500">
               <div className="flex items-center justify-between px-8 py-4 bg-app-bg-alt/50 border-b border-app-border mb-3 rounded-t-[1.8rem]">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                   <h3 className="text-sm font-black uppercase tracking-widest text-app-text-main">Reference Study Material</h3>
                 </div>
                 <div className="flex items-center gap-4">
                   <button
                  onClick={handleFullscreen}
                  className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  title="Toggle Fullscreen">
                  
                     <Maximize size={18} />
                   </button>
                   <button
                  onClick={() => setShowPdf(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400">
                  
                     [ Close PDF ]
                   </button>
                 </div>
               </div>
               <div className="relative rounded-[1.8rem] overflow-hidden bg-app-bg">
                 <iframe
                src={uploadedPdf || lesson.pdfUrl || undefined}
                className="w-full border-0"
                style={{ height: '850px' }}
                title={`${lesson.title} PDF`}
                allowFullScreen />
              
               </div>
             </div>
          }

          {signLanguageEnabled ?
          <SignLanguagePanel
            lessonTitle={lesson.title}
            transcript={videoTranscript || lesson.textVersion || lesson.description}
            signVideoUrl={youtubeEmbedUrl || lesson.signVideoUrl}
            isLoading={videoLoading}
            error={videoError} /> :

          showTextVersion ? (
          /* Text Version for Accessibility */
          <div className="bg-app-bg-alt rounded-[2.5rem] p-10 border border-app-border shadow-inner">
              <h2 className="text-2xl font-black text-app-text-main mb-8 uppercase tracking-tight">Lesson Content</h2>
              <div className="prose prose-slate prose-xl dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-app-text-main leading-relaxed font-bold">
                  {lesson.textVersion}
                </pre>
              </div>
            </div>) :
          !showPdf ? (
          /* Standard PDF Viewer (if not already opened as reference) */
          <div ref={pdfContainerRef} className="bg-app-bg-alt rounded-[2.5rem] p-3 border border-app-border shadow-2xl overflow-hidden ring-1 ring-app-border">
              {uploadedPdf || lesson.pdfUrl ?
            <div className="relative rounded-[1.8rem] overflow-hidden bg-app-bg">
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                  onClick={handleFullscreen}
                  className="p-2 rounded-xl bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-all"
                  title="Toggle Fullscreen">
                  
                      <Maximize size={16} />
                    </button>
                  </div>
                  <iframe
                src={uploadedPdf || lesson.pdfUrl || undefined}
                className="w-full border-0"
                style={{ height: '850px' }}
                title={`${lesson.title} PDF`}
                allowFullScreen />
              
                </div> :

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
                  className="hidden" />
                
                    <Button variant="primary" className="flex items-center gap-4 px-10 py-5 rounded-4xl shadow-2xl shadow-primary/30 text-sm font-black uppercase tracking-[0.2em] transform active:scale-95 transition-all">
                      <Upload size={28} />
                      Upload PDF Now
                    </Button>
                  </label>
                </div>
            }
            </div>) : (

          /* Fallback or spacing when PDF is already shown above */
          <div className="py-10 bg-app-bg-alt rounded-4xl border border-dashed border-app-border text-center">
               <p className="text-app-text-sub font-black uppercase text-xs tracking-widest">Reference PDF is active above. Scroll up to view.</p>
            </div>)
          }
        </div>

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
            }}>
            
            <CheckCircle2 size={24} />
            Mark Lesson as Completed
          </Button>
        </div>
      </div>
    </div>);

}