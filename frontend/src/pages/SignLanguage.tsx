import { Hand, Video, CheckCircle2, MessageSquareText } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import Card from '../components/Card';
import Button from '../components/Button';
import SignLanguagePanel from '../components/Syllabus/SignLanguagePanel';

const SignLanguagePage = () => {
  const { signLanguageEnabled, toggleSignLanguage } = useAccessibility();

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-app-bg-alt p-10 rounded-[3rem] border border-app-border shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                <Hand size={36} />
              </div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase italic">Sign Language Hub</h1>
            </div>
            <p className="text-app-text-sub font-bold text-lg max-w-xl leading-relaxed">
              Enable specialized video lessons with certified sign language interpretation for all our courses.
            </p>
          </div>
          
          <Button 
            onClick={toggleSignLanguage}
            className={`px-10 py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
              signLanguageEnabled 
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20' 
                : 'bg-app-bg border-4 border-app-border text-app-text-main grayscale hover:grayscale-0'
            }`}
          >
            {signLanguageEnabled ? 'Disable Sign Mode' : 'Go Sign Language'}
          </Button>
        </header>

        {signLanguageEnabled && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-2 px-6">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Previewing Active Mode</span>
            </div>
            <SignLanguagePanel lessonTitle="Sign Language Hub" transcript="Welcome to our sign language learning platform with certified interpreters." />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-10 bg-app-bg border border-app-border shadow-xl rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-600">
                <Video size={24} />
              </div>
              <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">High Definition Feed</h2>
            </div>
            <p className="text-app-text-sub font-medium leading-relaxed italic">
              Our sign language feeds are recorded in 4K resolution to ensure every hand placement and facial expression is clearly visible.
            </p>
          </Card>

          <Card className="p-10 bg-app-bg border border-app-border shadow-xl rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600">
                <MessageSquareText size={24} />
              </div>
              <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">Smart Transcripts</h2>
            </div>
            <p className="text-app-text-sub font-medium leading-relaxed italic">
              Transcripts are generated from sign language syntax to ensure the context and meaning are preserved perfectly.
            </p>
          </Card>
        </div>

        <section className="bg-zinc-950 text-white p-12 rounded-[3rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-purple-400">Platform Features</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                'Certified ASL/ISL Interpreters',
                'Synchronized Playback',
                'Interactive Learning Boards',
                'Offline Download Support',
                'Variable Playback Speed',
                'Visual Focus Indicators'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 font-bold text-zinc-400">
                  <CheckCircle2 size={20} className="text-purple-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full" />
        </section>
      </div>
    </div>
  );
};

export default SignLanguagePage;
