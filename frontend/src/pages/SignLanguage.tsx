import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Hand, Video, CheckCircle2, MessageSquareText, Loader2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import Card from '../components/Card';
import Button from '../components/Button';
import SignLanguagePanel from '../components/Syllabus/SignLanguagePanel';
import { youtubeService, generateSearchQuery } from '../services/youtubeService';
import { lessonsAPI } from '../services/api';

const SignLanguagePage = () => {
  const params = useParams();
  const lessonId = params['*'];
  const navigate = useNavigate();
  const location = useLocation();
  const { signLanguageEnabled, toggleSignLanguage } = useAccessibility();
  
  const [lesson, setLesson] = useState<any>(location.state?.lesson || null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonAndVideo = async () => {
      if (!lessonId) return;
      
      setLoading(true);
      setError(null);
      try {
        let lessonData = lesson;

        // 1. If we don't have lesson data in state, fetch it from API
        if (!lessonData && lessonId) {
          try {
            const res = await lessonsAPI.getOne(lessonId);
            if (res.success) {
              lessonData = res.lesson;
              setLesson(lessonData);
            }
          } catch (apiErr) {
            console.warn("Could not fetch lesson by ID, using ID as title fallback");
            // If ID is synthetic (e.g., 10-Maths-Topic), try to extract topic
            const parts = lessonId.split('-');
            const topic = parts.length > 2 ? parts.slice(2).join(' ') : lessonId;
            lessonData = { title: topic };
            setLesson(lessonData);
          }
        }

        if (lessonData) {
          // 2. Search for YouTube video
          const query = generateSearchQuery(lessonData);
          const result = await youtubeService.searchSignLanguageVideo(query);
          setVideoUrl(result.embedUrl);
        } else {
          setError("Lesson details are missing.");
        }
      } catch (err: any) {
        console.error("Error loading sign language content:", err);
        setError(err.message || "Sign language video not available for this topic.");
      } finally {
        setLoading(false);
      }
    };

    if (signLanguageEnabled && lessonId) {
      fetchLessonAndVideo();
    }
  }, [lessonId, signLanguageEnabled]);

  // If user disables sign mode while on a specific lesson, take them back to standard view
  useEffect(() => {
    if (!signLanguageEnabled && lessonId) {
      navigate(`/lessons/${lessonId}`);
    }
  }, [signLanguageEnabled, lessonId, navigate]);

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-app-bg p-10 rounded-[3rem] border border-app-border shadow-inst">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-ai-accent/10 flex items-center justify-center text-ai-accent">
                <Hand size={36} />
              </div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase italic">Sign Language Hub</h1>
            </div>
            <p className="text-app-text-sub font-bold text-lg max-w-xl leading-relaxed">
              {lesson ? `Viewing: ${lesson.title}` : 'Enable specialized video lessons with certified sign language interpretation for all our courses.'}
            </p>
          </div>
          
          <div className="flex gap-4">
            {lessonId && (
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                className="px-6 py-4 rounded-2xl font-black text-xs uppercase"
              >
                Back to Lesson
              </Button>
            )}
            <Button 
              onClick={toggleSignLanguage}
              className={`px-10 py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-inst transition-all active:scale-95 ${
                signLanguageEnabled 
                  ? 'bg-ai-accent hover:bg-ai-accent text-white shadow-ai-accent/20' 
                  : 'bg-app-bg border-4 border-app-border text-app-text-main grayscale hover:grayscale-0'
              }`}
            >
              {signLanguageEnabled ? 'Disable Sign Mode' : 'Go Sign Language'}
            </Button>
          </div>
        </header>

        {signLanguageEnabled && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-2 px-6">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Previewing Active Mode</span>
            </div>
            {loading ? (
              <Card className="p-12 border-2 border-app-border flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-app-text-sub font-bold uppercase tracking-widest animate-pulse">Loading Video Content...</p>
              </Card>
            ) : (
              <SignLanguagePanel 
                lessonTitle={lesson?.title || "Sign Language Hub"} 
                transcript={lesson?.explanation || lesson?.textVersion || lesson?.description || "Welcome to our sign language learning platform with certified interpreters."}
                signVideoUrl={videoUrl || undefined}
                isLoading={loading}
                error={error}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-10 bg-app-bg border border-app-border shadow-inst rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                <Video size={24} />
              </div>
              <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">High Definition Feed</h2>
            </div>
            <p className="text-app-text-sub font-medium leading-relaxed italic">
              Our sign language feeds are recorded in 4K resolution to ensure every hand placement and facial expression is clearly visible.
            </p>
          </Card>

          <Card className="p-10 bg-app-bg border border-app-border shadow-inst rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                <MessageSquareText size={24} />
              </div>
              <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">Smart Transcripts</h2>
            </div>
            <p className="text-app-text-sub font-medium leading-relaxed italic">
              Transcripts are generated from sign language syntax to ensure the context and meaning are preserved perfectly.
            </p>
          </Card>
        </div>

        <section className="bg-app-bg text-app-text-main p-12 rounded-[3rem] border border-app-border shadow-inst relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-ai-accent">Platform Features</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                'Certified ASL/ISL Interpreters',
                'Synchronized Playback',
                'Interactive Learning Boards',
                'Offline Download Support',
                'Variable Playback Speed',
                'Visual Focus Indicators'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 font-bold text-app-text-sub">
                  <CheckCircle2 size={20} className="text-ai-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-ai-accent/5 blur-[100px] rounded-full" />
        </section>
      </div>
    </div>
  );
};

export default SignLanguagePage;
