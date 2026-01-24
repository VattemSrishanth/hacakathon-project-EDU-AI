import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { ArrowLeft, Upload, Volume2, FileText, BookOpen } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const showTextVersion = settings.themeAccessibility.accessibilityMode === 'Blind' || settings.themeAccessibility.accessibilityMode === 'Deaf';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/lessons')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Lessons</span>
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
          
          {/* Upload Button */}
          <div className="flex gap-3 mb-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload PDF
              </Button>
            </label>
            
            {(settings.themeAccessibility.accessibilityMode === 'Blind' || settings.themeAccessibility.accessibilityMode === 'Deaf') && (
              <Button
                variant="success"
                onClick={() => handleReadAloud(lesson.textVersion)}
                className="flex items-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                {isReading ? 'Stop Reading' : 'Read Aloud'}
              </Button>
            )}
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8 border border-indigo-200">
          <div className="flex items-start gap-3 mb-3">
            <FileText className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">AI Summary</h2>
              <p className="text-gray-700 leading-relaxed">{lesson.aiSummary}</p>
            </div>
            {settings.themeAccessibility.accessibilityMode === 'Blind' && (
              <button
                onClick={() => handleReadAloud(lesson.aiSummary)}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {showTextVersion ? (
          /* Text Version for Accessibility */
          <div className="bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lesson Content</h2>
            <div className="prose prose-lg max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                {lesson.textVersion}
              </pre>
            </div>
          </div>
        ) : (
          /* PDF Viewer */
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {uploadedPdf || lesson.pdfUrl ? (
              <iframe
                src={uploadedPdf || lesson.pdfUrl}
                className="w-full border-0"
                style={{ height: '800px' }}
                title={`${lesson.title} PDF`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <Upload className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No PDF Available
                </h3>
                <p className="text-gray-500 mb-6">
                  Upload a PDF to view the lesson content
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <Button variant="primary" className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
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
