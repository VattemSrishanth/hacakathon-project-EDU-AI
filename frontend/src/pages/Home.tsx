import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RuralAccess AI
            </span>
          </h1>
          <p className="text-xl text-gray-900 mb-8 max-w-3xl mx-auto">
            Empowering rural communities with AI-powered education. Learn anytime, anywhere with
            our intelligent tutoring system.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
            <Link to="/ai-tutor">
              <Button variant="outline">Try AI Tutor</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">AI Tutor</h3>
                <p className="text-gray-900">
                  Get instant answers to your questions with our intelligent AI tutor.
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Rich Content</h3>
                <p className="text-gray-900">
                  Access a wide range of lessons across multiple subjects.
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Offline Access</h3>
                <p className="text-gray-900">
                  Learn without internet connectivity with our offline mode.
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">♿</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Accessible</h3>
                <p className="text-gray-900">
                  Built with accessibility in mind for all learners.
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Personalized</h3>
                <p className="text-gray-900">
                  Adaptive learning paths tailored to your needs.
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Mobile First</h3>
                <p className="text-gray-900">
                  Responsive design that works on any device.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 text-white/95">
            Join thousands of students already using RuralAccess AI to enhance their education.
          </p>
          <Link to="/register">
            <Button className="bg-white text-primary hover:bg-gray-100">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
