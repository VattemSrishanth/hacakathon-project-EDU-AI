import { Captions as CaptionsIcon, Layout, Monitor, CheckCircle2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import Card from '../components/Card';
import Button from '../components/Button';

const CaptionsPage = () => {
  const { captionsEnabled, toggleCaptions } = useAccessibility();

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-app-bg-alt p-10 rounded-[3rem] border border-app-border shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <CaptionsIcon size={36} />
              </div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase">Live Captions</h1>
            </div>
            <p className="text-app-text-sub font-bold text-lg max-w-xl leading-relaxed">
              Standard and enhanced captions for all video content and AI narrations.
            </p>
          </div>
          
          <Button 
            onClick={toggleCaptions}
            className={`px-10 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${
              captionsEnabled 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-app-bg border-4 border-app-border text-app-text-main opacity-60 hover:opacity-100'
            }`}
          >
            {captionsEnabled ? 'Disable Captions' : 'Enable Captions'}
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Standard Captions', icon: Monitor, desc: 'Regular text at the bottom of video players.' },
            { title: 'High Contrast', icon: Layout, desc: 'Yellow text on black background for better visibility.' },
            { title: 'Dynamic Search', icon: CheckCircle2, desc: 'Search through lesson transcripts in real-time.' }
          ].map((item, idx) => (
            <Card key={idx} className="p-8 bg-app-bg border border-app-border rounded-3xl space-y-4">
              <div className="p-3 bg-app-bg-alt rounded-xl w-fit text-primary">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-black text-app-text-main uppercase tracking-tight">{item.title}</h3>
              <p className="text-sm font-bold text-app-text-sub leading-relaxed italic">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaptionsPage;
