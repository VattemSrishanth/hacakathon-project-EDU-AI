import { Mic, Volume2, Search, MessageSquare } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import Card from '../components/Card';
import Button from '../components/Button';
import SpeechAssist from '../components/Accessibility/SpeechAssist';

const SpeechAssistPage = () => {
  const { speechAssistEnabled, toggleSpeechAssist } = useAccessibility();

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-app-bg p-10 rounded-[3rem] border border-app-border shadow-inst">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-ai-accent/10 flex items-center justify-center text-ai-accent">
                <Mic size={36} />
              </div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase">Speech Assist</h1>
            </div>
            <p className="text-app-text-sub font-bold text-lg max-w-xl leading-relaxed">
              Control the platform using your voice and listen to AI-narrated lesson content.
            </p>
          </div>
          
          <Button 
            onClick={toggleSpeechAssist}
            className={`px-10 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${
              speechAssistEnabled 
                ? 'bg-ai-accent hover:bg-ai-accent text-white shadow-inst' 
                : 'bg-app-bg border-4 border-app-border text-app-text-main opacity-60 hover:opacity-100'
            }`}
          >
            {speechAssistEnabled ? 'System Listening' : 'Enable Voice'}
          </Button>
        </header>

        {/* Live Interaction Demo */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <MessageSquare size={18} className="text-primary" />
            <h2 className="text-xl font-black text-app-text-main uppercase tracking-tight">Interactive Mic Trial</h2>
          </div>
          <SpeechAssist 
            onTranscript={(text) => console.log(`MVP Received: ${text}`)}
            placeholder="Try saying 'Open my lessons' or 'Explain biology'..."
          />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-10 bg-app-bg border border-app-border rounded-3xl space-y-6">
            <h3 className="text-xl font-black text-app-text-main flex items-center gap-3 uppercase tracking-tight">
              <Volume2 className="text-primary" />
              Lesson Narrator
            </h3>
            <p className="text-app-text-sub font-medium leading-relaxed italic">
              Automatically read lesson text aloud using high-quality AI voices.
            </p>
          </Card>
          
          <Card className="p-10 bg-app-bg border border-app-border rounded-3xl space-y-6">
            <h3 className="text-xl font-black text-app-text-main flex items-center gap-3 uppercase tracking-tight">
              <Search className="text-primary" />
              Voice Commands
            </h3>
            <p className="text-app-text-sub font-medium leading-relaxed italic">
              Navigate through the app by saying "Go to Dashboard", "Open Lessons", or "Explain this".
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeechAssistPage;
