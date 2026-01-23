import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';

const Home = () => {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t.home.welcome}{' '}
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t.home.brandName}
            </span>
          </h1>
          <p className="text-xl text-gray-900 mb-8 max-w-3xl mx-auto">
            {t.home.tagline}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary">{t.home.getStarted}</Button>
            </Link>
            <Link to="/ai-tutor">
              <Button variant="outline">{t.home.tryAiTutor}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{t.home.features}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t.home.aiTutorTitle}</h3>
                <p className="text-gray-900">
                  {t.home.aiTutorDesc}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t.home.richContentTitle}</h3>
                <p className="text-gray-900">
                  {t.home.richContentDesc}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t.home.offlineTitle}</h3>
                <p className="text-gray-900">
                  {t.home.offlineDesc}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">♿</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t.home.accessibleTitle}</h3>
                <p className="text-gray-900">
                  {t.home.accessibleDesc}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t.home.personalizedTitle}</h3>
                <p className="text-gray-900">
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
          <Link to="/register">
            <Button className="bg-white text-primary hover:bg-gray-100">
              {t.home.startLearning}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
