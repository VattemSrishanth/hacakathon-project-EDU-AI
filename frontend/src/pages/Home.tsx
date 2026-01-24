import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-cyan-50 text-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 dark:text-white">
            {t.home.welcome}{' '}
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent italic">
              {t.home.brandName}
            </span>
          </h1>
          <p className="text-xl text-gray-800 dark:text-gray-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t.home.tagline}
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              variant="primary" 
              onClick={() => navigate(isAuthenticated ? "/lessons" : "/register")}
            >
              {t.home.getStarted}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/ai-tutor")}
            >
              {t.home.tryAiTutor}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white uppercase tracking-wide">
            {t.home.features}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t.home.aiTutorTitle}</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                  {t.home.aiTutorDesc}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t.home.richContentTitle}</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                  {t.home.richContentDesc}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t.home.offlineTitle}</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                  {t.home.offlineDesc}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">♿</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t.home.accessibleTitle}</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                  {t.home.accessibleDesc}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t.home.personalizedTitle}</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                  {t.home.personalizedDesc}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t.home.mobileFirstTitle}</h3>
                <p className="text-gray-900">
                  {t.home.mobileFirstDesc}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-linear-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">{t.home.ctaTitle}</h2>
          <p className="text-xl mb-8 text-white/95">
            {t.home.ctaDesc}
          </p>
          <Button 
            className="bg-white text-primary hover:bg-gray-100"
            onClick={() => navigate(isAuthenticated ? "/lessons" : "/register")}
          >
            {t.home.startLearning}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
