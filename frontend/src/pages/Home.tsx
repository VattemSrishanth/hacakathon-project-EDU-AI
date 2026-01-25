import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { t, settings } = useSettings();
  const { isAuthenticated } = useAuth();
  const isDark = settings.themeAccessibility.theme === 'Dark';

  return (
    <div className="min-h-screen bg-white text-app-text-main transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 dark:opacity-10">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-app-text-main mb-8 leading-tight tracking-tight">
            {t.home.welcome}{' '}
            <span className="text-secondary italic">
              {t.home.brandName}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-app-text-sub mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            {t.home.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="primary" 
              className="px-10 py-4 text-lg rounded-2xl shadow-xl shadow-green-500/30 bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-transform"
              onClick={() => navigate(isAuthenticated ? "/lessons" : "/register")}
            >
              {t.home.getStarted}
            </Button>
            <Button 
              variant="outline" 
              className="px-10 py-4 text-lg rounded-2xl border-2 hover:scale-105 transition-transform bg-app-bg/50 backdrop-blur-sm"
              onClick={() => navigate("/ai-tutor")}
            >
              {t.home.tryAiTutor}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
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
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-blue-100 dark:ring-blue-800">
                  🤖
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.aiTutorTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.aiTutorDesc}
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-indigo-100 dark:ring-indigo-800">
                  📚
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.richContentTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.richContentDesc}
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-cyan-100 dark:ring-cyan-800">
                  🌐
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.offlineTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.offlineDesc}
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-purple-100 dark:ring-purple-800">
                  ♿
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.accessibleTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.accessibleDesc}
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-rose-100 dark:ring-rose-800">
                  🎯
                </div>
                <h3 className="text-xl font-bold mb-3 text-app-text-main">{t.home.personalizedTitle}</h3>
                <p className="text-app-text-sub leading-relaxed font-medium">
                  {t.home.personalizedDesc}
                </p>
              </div>
            </Card>

            <Card hover className="p-8 border-none shadow-lg bg-app-bg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-amber-100 dark:ring-amber-800">
                  📱
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
      <section className="py-24 px-4">
        <div
          className={`max-w-5xl mx-auto rounded-[3rem] p-12 text-center relative overflow-hidden border
            ${isDark
              ? 'bg-linear-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-2xl shadow-black/40 border-white/10'
              : 'bg-linear-to-br from-primary to-indigo-700 text-white shadow-2xl shadow-primary/30 border-primary/10'
            }
          `}
        >
          {/* Subtle CTA background patterns tuned per theme */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 blur-3xl ${isDark ? 'bg-white/10' : 'bg-white/10'}`} />
          <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full -ml-32 -mb-32 blur-3xl ${isDark ? 'bg-cyan-300/15' : 'bg-cyan-400/20'}`} />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">{t.home.ctaTitle}</h2>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto font-medium">
              {t.home.ctaDesc}
            </p>
            <Button 
              className={`${isDark
                ? 'bg-white/90 text-indigo-900 hover:bg-white shadow-xl shadow-black/20'
                : 'bg-white text-indigo-900 shadow-xl shadow-primary/20'
              } px-12 py-5 text-xl font-black rounded-2xl hover:scale-105 active:scale-95 transition-all`}
              onClick={() => navigate(isAuthenticated ? "/lessons" : "/register")}
            >
              {t.home.startLearning}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
