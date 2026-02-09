import { useState, useRef } from 'react';
import { 
  Volume2, 
  Sparkles, 
  Pause, 
  Languages, 
  FileText,
  ChevronRight,
  GraduationCap,
  MessageSquareText,
  Video,
  Download,
  CheckCircle2,
  Loader2,
  Maximize
} from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useOffline } from '../../context/OfflineContext';
import type { OfflineLesson } from '../../services/offlineContent';
import SignLanguagePanel from './SignLanguagePanel';

interface LessonViewerProps {
  lesson: {
    id: string;
    title: string;
    class: string;
    subject: string;
    unit: string;
    explanation: string | null;
    pdfUrl?: string;
  };
  generating: boolean;
  isSpeaking: boolean;
  onListen: () => void;
  onRefresh: () => void;
  onTranslate: () => void;
  onExplainMode: (mode: 'simple' | 'detailed') => void;
  onMarkComplete: () => void;
  isCompleted: boolean;
}

const LessonViewer = ({ 
  lesson, 
  generating, 
  isSpeaking, 
  onListen, 
  onRefresh, 
  onTranslate,
  onExplainMode,
  onMarkComplete,
  isCompleted 
}: LessonViewerProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const { signLanguageEnabled } = useAccessibility();
  const { isOffline, removeLesson, downloadedLessons, downloadingIds, saveOfflineLesson } = useOffline();

  const handleFullscreen = () => {
    if (!document.fullscreenElement && pdfContainerRef.current) {
      pdfContainerRef.current.requestFullscreen?.().catch(() => undefined);
    } else if (document.fullscreenElement) {
        document.exitFullscreen();
    }
  };

  const handleDownload = async () => {
    if (isSaving) return;
    
    // If it's a generated lesson, save it directly
    setIsSaving(true);
    try {
      const offlineLesson: OfflineLesson = {
        id: lesson.id,
        userId: localStorage.getItem('userId') || 'guest',
        title: lesson.title,
        subject: lesson.subject,
        content: { content: lesson.explanation },
        downloadedAt: Date.now()
      };
      await saveOfflineLesson(offlineLesson);
      // We don't need window.dispatchEvent anymore as saveOfflineLesson updates context state
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Mock video data for demonstration (in real app, this would come from a database)
  const signLanguageVideoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Placeholder
  const transcript = "In this lesson on " + lesson.title + ", we explore " + lesson.unit + ". " + (lesson.explanation ? lesson.explanation.substring(0, 100) + "..." : "The content is being loaded.");

  return (
    <Card className={`min-h-125 flex flex-col shadow-2xl animate-in fade-in zoom-in duration-500 rounded-[2.5rem] border-app-border overflow-hidden ${signLanguageEnabled ? 'bg-zinc-950 border-zinc-800' : ''}`}>
      <div className="p-8 md:p-12 space-y-8 grow">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                signLanguageEnabled ? 'bg-primary/20 text-primary border-primary/30' : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                <GraduationCap size={14} />
                Class {lesson.class}
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                signLanguageEnabled ? 'bg-secondary/20 text-secondary border-secondary/30' : 'bg-secondary/10 text-secondary border-secondary/20'
              }`}>
                {lesson.subject}
              </div>
            </div>
            
            {isCompleted && (
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                signLanguageEnabled ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                Completed
              </div>
            )}
          </div>
          
          <h2 className={`text-4xl md:text-6xl font-black tracking-tighter leading-tight italic ${
            signLanguageEnabled ? 'text-zinc-100' : 'text-app-text-main'
          }`}>
            {lesson.title}
          </h2>
          
          <div className="flex items-center gap-2 text-app-text-sub font-black uppercase text-[10px] tracking-[0.2em] opacity-60">
            <span>{lesson.unit}</span>
            <ChevronRight size={12} />
            <span className="text-primary">{lesson.title}</span>
          </div>
        </div>

        <div className="prose prose-stone dark:prose-invert max-w-none">
          {generating ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
              </div>
              <p className="font-black text-primary animate-pulse tracking-widest uppercase text-xs">
                AI is tailoring this lesson for you...
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {signLanguageEnabled ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-2">
                      <Video size={12} />
                      Sign Language Mode Active
                    </div>
                  </div>
                  
                  <SignLanguagePanel 
                    lessonTitle={lesson.title}
                    signVideoUrl={signLanguageVideoUrl}
                    transcript={transcript}
                  />

                  {lesson.explanation && (
                    <div className="mt-8 space-y-4">
                      <div className="flex items-center gap-2 text-app-text-muted font-black uppercase text-[10px] tracking-widest opacity-60">
                        <MessageSquareText size={14} />
                        Original Content Reference
                      </div>
                      <p className="text-lg text-zinc-400 leading-relaxed font-medium bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 shadow-inner">
                        {lesson.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {lesson.pdfUrl && (
                    <div className="mb-8 rounded-4xl border-2 border-primary/20 bg-primary/5 p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-sm uppercase tracking-wider text-app-text-main">Official Study Material</h4>
                          <p className="text-xs font-bold text-app-text-sub uppercase tracking-widest mt-1">Admin uploaded PDF available</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setShowPdf(!showPdf)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95"
                      >
                        <FileText size={16} />
                        {showPdf ? 'Hide PDF' : 'View PDF'}
                      </Button>
                    </div>
                  )}

                  {showPdf && lesson.pdfUrl && (
                    <div ref={pdfContainerRef} className="mb-8 rounded-[2.5rem] border-2 border-app-border bg-app-bg-alt p-3 shadow-2xl animate-in zoom-in duration-500 overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-3 border-b border-app-border/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-app-text-sub">Interactive PDF Canvas</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={handleFullscreen}
                            className="p-1.5 rounded-lg hover:bg-app-bg transition-colors text-app-text-muted hover:text-primary"
                            title="Toggle Fullscreen"
                          >
                            <Maximize size={16} />
                          </button>
                          <button 
                            onClick={() => setShowPdf(false)}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                          >
                            [ Close ]
                          </button>
                        </div>
                      </div>
                      <div className="rounded-[1.8rem] overflow-hidden bg-white h-175 border border-app-border/30">
                        <iframe 
                          src={lesson.pdfUrl}
                          className="w-full h-full border-0"
                          title="Lesson PDF Content"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-xl md:text-3xl text-app-text-main leading-relaxed font-medium bg-app-bg-alt/30 p-8 md:p-12 rounded-[3rem] border border-app-border/50 shadow-inner whitespace-pre-wrap">
                    {lesson.explanation}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {!generating && lesson.explanation && (
        <div className={`p-6 border-t flex flex-wrap gap-4 items-center justify-between rounded-b-[2.5rem] ${
          signLanguageEnabled ? 'bg-zinc-900/80 border-zinc-800' : 'bg-app-bg-alt/80 border-app-border'
        }`}>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={onListen}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg transition-transform active:scale-95 ${
                isSpeaking ? 'bg-red-500 hover:bg-red-600' : ''
              }`}
            >
              {isSpeaking ? (
                <><Pause size={20} fill="currentColor" /> Stop</>
              ) : (
                <><Volume2 size={20} /> Listen</>
              )}
            </Button>

            {/* Offline Save Button - Made more prominent */}
            {(downloadedLessons || []).includes(lesson.id) ? (
              <Button
                variant="success"
                onClick={() => removeLesson(lesson.id)}
                className="flex items-center gap-2 px-6 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-lg"
              >
                <CheckCircle2 size={18} />
                Saved Offline
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleDownload}
                disabled={isOffline || isSaving || generating || !lesson.explanation || (downloadingIds || []).includes(lesson.id)}
                className="flex items-center gap-2 px-6 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                {isSaving || (downloadingIds || []).includes(lesson.id) ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {isSaving || (downloadingIds || []).includes(lesson.id) ? 'Saving...' : 'Save Offline'}
              </Button>
            )}

            <Button 
              onClick={onMarkComplete}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg transition-transform active:scale-95 ${
                isCompleted ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30'
              }`}
            >
              {isCompleted ? 'Finished!' : 'Mark Done'}
            </Button>
            
            <button 
              onClick={onRefresh}
              className="px-6 py-4 rounded-full font-black text-xs uppercase tracking-widest bg-app-bg border border-app-border text-app-text-main hover:border-primary/50 transition-all flex items-center gap-2"
            >
              <Sparkles size={16} className="text-primary" />
              Regenerate
            </button>

            <button 
              onClick={() => onExplainMode('simple')}
              className="px-6 py-4 rounded-full font-black text-xs uppercase tracking-widest bg-app-bg border border-app-border text-app-text-main hover:border-primary/50 transition-all flex items-center gap-2"
            >
              <Sparkles size={16} className="text-primary" />
              Simple
            </button>

            <button 
              onClick={() => onExplainMode('detailed')}
              className="px-6 py-4 rounded-full font-black text-xs uppercase tracking-widest bg-app-bg border border-app-border text-app-text-main hover:border-primary/50 transition-all flex items-center gap-2"
            >
              <FileText size={16} className="text-secondary" />
              Detailed
            </button>

            <button 
              onClick={onTranslate}
              className="px-6 py-4 rounded-full font-black text-xs uppercase tracking-widest bg-app-bg border border-app-border text-app-text-main hover:border-primary/50 transition-all flex items-center gap-2"
            >
              <Languages size={16} className="text-amber-500" />
              Translate
            </button>
          </div>

          <div className="hidden lg:block">
            <p className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.3em] opacity-40">
              Interactive Hub v2.0
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default LessonViewer;
