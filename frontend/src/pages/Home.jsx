import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Smartphone,
  GraduationCap,
  ArrowRight,
  WifiOff,
  Headphones,
  CheckCircle2,
  Compass
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const { isAuthenticated, isGuest } = useAuth();

  const handleRestrictedAction = (path) => {
    if (isGuest) {
      if (window.confirm("This feature is restricted to logged-in users. Would you like to log in now?")) {
        navigate('/login');
      }
    } else {
      navigate(path);
    }
  };

  const handlePrimaryNavigation = () => {
    if (isAuthenticated) {
      navigate("/lessons");
    } else if (isGuest) {
      handleRestrictedAction("/lessons");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main transition-colors duration-300">
      {/* 1. Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-secondary/15 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          {/* Subtle Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs md:text-sm font-semibold tracking-wide mb-8 shadow-xs backdrop-blur-xs">
            <Sparkles size={15} className="text-primary animate-pulse" />
            <span>Inclusive &bull; Offline-First &bull; Curriculum-Aligned AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-app-text-main mb-6 leading-[1.12] tracking-[-0.035em]">
            {t.home.welcome}{' '}
            <span className="text-primary font-bold">
              {t.home.brandName}
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-app-text-sub mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
            {t.home.tagline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Button
              variant="primary"
              className={`w-full sm:w-auto px-10 py-4 text-base sm:text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${isGuest ? 'opacity-85' : ''}`}
              onClick={handlePrimaryNavigation}
            >
              <GraduationCap size={22} />
              <span>{t.home.getStarted}</span>
              {isGuest && <span className="ml-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Pro</span>}
              <ArrowRight size={18} />
            </Button>

            <Button
              variant="outline"
              className={`w-full sm:w-auto px-10 py-4 text-base sm:text-lg font-bold rounded-2xl border-2 border-app-border hover:border-primary/40 hover:scale-105 active:scale-95 transition-all bg-app-bg/60 backdrop-blur-sm flex items-center justify-center gap-2 cursor-pointer ${isGuest ? 'opacity-70' : ''}`}
              onClick={() => handleRestrictedAction("/ai-tutor")}
            >
              <Bot size={22} className="text-primary" />
              <span>{t.home.tryAiTutor}</span>
              {isGuest && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Login Required</span>}
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics & Impact Banner */}
      <section className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-app-bg-alt/60 hover:bg-app-bg-alt border border-app-border rounded-2xl p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 backdrop-blur-xs">
              <div className="text-2xl md:text-3xl font-black text-primary mb-1 tracking-tight">100%</div>
              <div className="text-xs md:text-sm font-bold text-app-text-main">Offline Resilience</div>
              <div className="text-[11px] md:text-xs text-app-text-muted mt-1 font-medium">Works without active internet</div>
            </div>

            <div className="bg-app-bg-alt/60 hover:bg-app-bg-alt border border-app-border rounded-2xl p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 backdrop-blur-xs">
              <div className="text-2xl md:text-3xl font-black text-primary mb-1 tracking-tight">K-12</div>
              <div className="text-xs md:text-sm font-bold text-app-text-main">Curriculum Aligned</div>
              <div className="text-[11px] md:text-xs text-app-text-muted mt-1 font-medium">Math, Science, Social & Languages</div>
            </div>

            <div className="bg-app-bg-alt/60 hover:bg-app-bg-alt border border-app-border rounded-2xl p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 backdrop-blur-xs">
              <div className="text-2xl md:text-3xl font-black text-primary mb-1 tracking-tight">24/7</div>
              <div className="text-xs md:text-sm font-bold text-app-text-main">Multilingual AI Tutor</div>
              <div className="text-[11px] md:text-xs text-app-text-muted mt-1 font-medium">Instant concept & doubt clarity</div>
            </div>

            <div className="bg-app-bg-alt/60 hover:bg-app-bg-alt border border-app-border rounded-2xl p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 backdrop-blur-xs">
              <div className="text-2xl md:text-3xl font-black text-primary mb-1 tracking-tight">WCAG</div>
              <div className="text-xs md:text-sm font-bold text-app-text-main">Universal Inclusion</div>
              <div className="text-[11px] md:text-xs text-app-text-muted mt-1 font-medium">Speech assist & sign language</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Grid */}
      <section className="py-20 px-4 bg-app-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-black text-primary uppercase tracking-[0.25em] mb-3 bg-primary/10 px-3.5 py-1 rounded-full">
              {t.home.features}
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-app-text-main tracking-tight">
              Everything You Need to Excel
            </h2>
            <p className="text-base md:text-lg text-app-text-sub mt-4 max-w-2xl mx-auto">
              Engineered for equal opportunity, accessibility, and frictionless learning under any network condition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: AI Tutor */}
            <Card hover className="p-8 border border-app-border/70 hover:border-primary/40 shadow-md bg-app-bg flex flex-col justify-between">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-ai-accent/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-ai-accent/25 text-ai-accent">
                  <Bot size={36} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.aiTutorTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-normal text-sm md:text-base">
                  {t.home.aiTutorDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-app-border/40 text-center">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Multimodal AI Engine</span>
              </div>
            </Card>

            {/* Feature 2: Rich Curriculum */}
            <Card hover className="p-8 border border-app-border/70 hover:border-primary/40 shadow-md bg-app-bg flex flex-col justify-between">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/25 text-primary">
                  <BookOpen size={36} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.richContentTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-normal text-sm md:text-base">
                  {t.home.richContentDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-app-border/40 text-center">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Structured Syllabus</span>
              </div>
            </Card>

            {/* Feature 3: Offline Resilience */}
            <Card hover className="p-8 border border-app-border/70 hover:border-secondary/40 shadow-md bg-app-bg flex flex-col justify-between">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-secondary/25 text-secondary">
                  <WifiOff size={36} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.offlineTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-normal text-sm md:text-base">
                  {t.home.offlineDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-app-border/40 text-center">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Local Cache Storage</span>
              </div>
            </Card>

            {/* Feature 4: Accessible & Inclusive */}
            <Card hover className="p-8 border border-app-border/70 hover:border-primary/40 shadow-md bg-app-bg flex flex-col justify-between">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/25 text-primary">
                  <ShieldCheck size={36} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.accessibleTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-normal text-sm md:text-base">
                  {t.home.accessibleDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-app-border/40 text-center">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Speech & Sign Assist</span>
              </div>
            </Card>

            {/* Feature 5: Personalized Adaptation */}
            <Card hover className="p-8 border border-app-border/70 hover:border-ai-accent/40 shadow-md bg-app-bg flex flex-col justify-between">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-ai-accent/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-ai-accent/25 text-ai-accent">
                  <Sparkles size={36} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.personalizedTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-normal text-sm md:text-base">
                  {t.home.personalizedDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-app-border/40 text-center">
                <span className="text-xs font-semibold text-ai-accent uppercase tracking-wider">Adaptive Growth Path</span>
              </div>
            </Card>

            {/* Feature 6: Mobile-First Optimization */}
            <Card hover className="p-8 border border-app-border/70 hover:border-secondary/40 shadow-md bg-app-bg flex flex-col justify-between">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-secondary/25 text-secondary">
                  <Smartphone size={36} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.mobileFirstTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-normal text-sm md:text-base">
                  {t.home.mobileFirstDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-app-border/40 text-center">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Responsive Everywhere</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. How Edu-AI Works: 3-Step Guided Journey */}
      <section className="py-20 px-4 bg-app-bg-alt/30 border-y border-app-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-black text-primary uppercase tracking-[0.25em] mb-3 bg-primary/10 px-3.5 py-1 rounded-full">
              Guided Flow
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-app-text-main tracking-tight">
              How Edu-AI Powers Your Learning
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-app-bg border border-app-border/80 rounded-3xl p-8 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-primary/20">
                1
              </div>
              <h3 className="text-xl font-bold text-app-text-main mb-3 flex items-center gap-2">
                <Compass size={20} className="text-primary" />
                Select Your Path
              </h3>
              <p className="text-app-text-sub text-sm leading-relaxed">
                Choose your grade, curriculum standard, and subjects with verified, pre-structured syllabi ready to explore.
              </p>
            </div>

            <div className="bg-app-bg border border-app-border/80 rounded-3xl p-8 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-secondary/20">
                2
              </div>
              <h3 className="text-xl font-bold text-app-text-main mb-3 flex items-center gap-2">
                <Headphones size={20} className="text-secondary" />
                Learn in Any Format
              </h3>
              <p className="text-app-text-sub text-sm leading-relaxed">
                Interact through readable text, voice speech assistance, sign language panels, or upload textbooks for AI Q&A.
              </p>
            </div>

            <div className="bg-app-bg border border-app-border/80 rounded-3xl p-8 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-ai-accent text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-ai-accent/20">
                3
              </div>
              <h3 className="text-xl font-bold text-app-text-main mb-3 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-ai-accent" />
                Assess & Master
              </h3>
              <p className="text-app-text-sub text-sm leading-relaxed">
                Validate comprehension through AI quizzes, exam simulation mode, and unlock verifiable progress achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="py-24 px-4 bg-app-bg">
        <div className="max-w-5xl mx-auto">
          <Card variant="magic" className="p-10 md:p-16 text-center relative overflow-hidden border border-app-border/80 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight text-app-text-main tracking-tight">
              {t.home.ctaTitle}
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed text-app-text-sub">
              {t.home.ctaDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="primary"
                className={`w-full sm:w-auto px-12 py-5 text-lg font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 ${isGuest ? 'opacity-85' : ''}`}
                onClick={handlePrimaryNavigation}
              >
                <span>{t.home.startLearning}</span>
                <ArrowRight size={20} />
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
