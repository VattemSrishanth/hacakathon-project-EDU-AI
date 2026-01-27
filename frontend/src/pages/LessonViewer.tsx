import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { 
  ChevronLeft, 
  FileText, 
  Volume2, 
  Upload,
  Sparkles,
  BookOpen
} from 'lucide-react';
import Button from '../components/Button';

interface LessonData {
  id: string;
  title: string;
  pdfUrl?: string;
  aiSummary: string;
  textVersion: string;
}

export default function LessonViewer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [uploadedPdf, setUploadedPdf] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    // Load lesson data
    const lessonData: LessonData = {
      id: lessonId || '1',
      title: 'Introduction to Algebra',
      pdfUrl: '', // Can be set to a default PDF URL
      aiSummary: 'This lesson covers fundamental algebraic concepts including variables, expressions, and basic equations. You will learn how to solve simple linear equations and understand the relationship between variables.',
      textVersion: 'Introduction to Algebra\n\nAlgebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations.\n\nKey Concepts:\n1. Variables: Letters that represent unknown values (e.g., x, y, z)\n2. Expressions: Combinations of variables and numbers (e.g., 2x + 5)\n3. Equations: Mathematical statements showing equality (e.g., 2x + 5 = 15)\n\nSolving Basic Equations:\nTo solve an equation, isolate the variable on one side.\n\nExample: 2x + 5 = 15\nStep 1: Subtract 5 from both sides: 2x = 10\nStep 2: Divide both sides by 2: x = 5'
    };

    // Check for uploaded PDF in localStorage
    const storedPdf = localStorage.getItem(`lesson-pdf-${lessonId}`);
    if (storedPdf) {
      setUploadedPdf(storedPdf);
    }

    setLesson(lessonData);

    // Announce lesson loaded for screen readers
    if (settings.themeAccessibility.accessibilityMode === 'Blind') {
      announceText(`Lesson ${lessonData.title} loaded`);
    }
  }, [lessonId, settings.themeAccessibility.accessibilityMode]);

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

  if (!lesson) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse text-primary">
            <BookOpen size={48} />
          </div>
          <p className="text-app-text-main font-black text-xl uppercase tracking-widest">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const showTextVersion = settings.themeAccessibility.accessibilityMode === 'Blind' || settings.themeAccessibility.accessibilityMode === 'Deaf';

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-10">
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
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg shadow-emerald-500/20 text-xs font-black uppercase tracking-widest"
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
                  className="ml-auto p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 transition-all text-indigo-600"
                >
                  <Volume2 size={24} />
                </button>
              )}
            </div>
            <p className="text-app-text-main leading-relaxed font-bold text-lg max-w-4xl">{lesson.aiSummary}</p>
          </div>
        </div>

        {/* Content Area */}
        {showTextVersion ? (
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
                <iframe
                  src={uploadedPdf || lesson.pdfUrl}
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
      </div>
    </div>
  );
}
