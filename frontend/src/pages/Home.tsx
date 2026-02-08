import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  BookOpen, 
  Globe, 
  Cpu,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const { isAuthenticated, isGuest } = useAuth();

  const handleRestrictedAction = (path: string) => {
    if (isGuest) {
      if (window.confirm("This feature is restricted to logged-in users. Would you like to log in now?")) {
        navigate('/login');
      }
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
        </div>

        <div className="hero-section max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-app-text-main mb-8 leading-tight tracking-tight">
            {t.home.welcome}{' '}
            <span className="text-primary italic">
              {t.home.brandName}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-app-text-sub mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            {t.home.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              variant="primary" 
              className={`px-12 py-5 text-xl rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all ${isGuest ? 'opacity-80' : ''}`}
              onClick={() => {
                if (isAuthenticated) navigate("/lessons");
                else if (isGuest) handleRestrictedAction("/lessons");
                else navigate("/register");
              }}
            >
              {t.home.getStarted}
              {isGuest && <span className="ml-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Pro</span>}
            </Button>
            <Button 
              variant="outline" 
              className={`px-12 py-5 text-xl rounded-2xl border-2 border-app-border hover:border-primary/30 hover:scale-105 transition-all bg-app-bg/50 backdrop-blur-sm ${isGuest ? 'opacity-50' : ''}`}
              onClick={() => handleRestrictedAction("/ai-tutor")}
            >
              {t.home.tryAiTutor}
              {isGuest && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Login Required</span>}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-app-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">
              {t.home.features}
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-app-text-main">
              Everything you need to succeed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-ai-accent/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-ai-accent/20 text-ai-accent">
                  <Bot size={40} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.aiTutorTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.aiTutorDesc}
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20 text-primary">
                  <BookOpen size={40} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.richContentTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.richContentDesc}
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-secondary/20 text-secondary">
                  <Globe size={40} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.offlineTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.offlineDesc}
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20 text-primary">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.accessibleTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.accessibleDesc}
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-ai-accent/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-ai-accent/20 text-ai-accent">
                  <Sparkles size={40} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.personalizedTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.personalizedDesc}
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20 text-primary">
                  <Cpu size={40} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">Edge Technology</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  Low-latency processing optimized for all network conditions and device types.
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-ai-accent/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-ai-accent/20 text-ai-accent">
                  <Cpu size={40} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.mobileFirstTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.mobileFirstDesc}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-app-bg">
        <div className="max-w-6xl mx-auto">
          <Card variant="magic" className="p-16 text-center relative overflow-hidden">
            <h2 className="text-5xl md:text-8xl font-black mb-8 leading-tight m-0 text-app-text-main">
              {t.home.ctaTitle}
            </h2>
            <p className="text-2xl md:text-4xl mb-12 max-w-4xl mx-auto font-bold leading-relaxed text-app-text-sub">
              {t.home.ctaDesc}
            </p>
            <Button 
              className={`px-16 py-6 text-2xl font-bold rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all bg-primary! text-white! border-none uppercase tracking-wide ${isGuest ? 'opacity-80' : ''}`}
              onClick={() => {
                if (isAuthenticated) navigate("/lessons");
                else if (isGuest) handleRestrictedAction("/lessons");
                else navigate("/register");
              }}
            >
              {t.home.startLearning}
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
