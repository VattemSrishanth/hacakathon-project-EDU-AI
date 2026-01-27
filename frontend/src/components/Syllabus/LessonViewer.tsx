import { 
  Volume2, 
  Sparkles, 
  Pause, 
  Languages, 
  FileText,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import Button from '../Button';
import Card from '../Card';

interface LessonViewerProps {
  lesson: {
    title: string;
    class: string;
    subject: string;
    unit: string;
    explanation: string | null;
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
  return (
    <Card className="min-h-125 flex flex-col shadow-2xl animate-in fade-in zoom-in duration-500 rounded-[2.5rem] border-app-border overflow-hidden">
      <div className="p-8 md:p-12 space-y-8 grow">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                <GraduationCap size={14} />
                Class {lesson.class}
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest border border-secondary/20">
                {lesson.subject}
              </div>
            </div>
            
            {isCompleted && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                Completed
              </div>
            )}
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-app-text-main tracking-tighter leading-tight italic">
            {lesson.title}
          </h2>
          
          <div className="flex items-center gap-2 text-app-text-sub font-black uppercase text-[10px] tracking-[0.2em] opacity-60">
            <span>{lesson.unit}</span>
            <ChevronRight size={12} />
            <span className="text-primary">{lesson.title}</span>
          </div>
        </div>

        <div className="prose prose-blue max-w-none">
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
            <div className="space-y-6">
              <p className="text-xl md:text-3xl text-app-text-main leading-relaxed font-medium bg-app-bg-alt/30 p-8 md:p-12 rounded-[3rem] border border-app-border/50 shadow-inner whitespace-pre-wrap">
                {lesson.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {!generating && lesson.explanation && (
        <div className="p-6 bg-app-bg-alt/80 border-t border-app-border flex flex-wrap gap-4 items-center justify-between rounded-b-[2.5rem]">
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

            <Button 
              onClick={onMarkComplete}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg transition-transform active:scale-95 ${
                isCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30'
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
              <Sparkles size={16} className="text-blue-500" />
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
              <Languages size={16} className="text-green-500" />
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
