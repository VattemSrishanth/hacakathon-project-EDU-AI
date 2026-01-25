import { useSettings } from '../context/SettingsContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useSettings();
  
  return (
    <footer className="bg-app-bg-alt border-t border-app-border text-app-text-main mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-black text-primary mb-4">
              LearnBridge AI
            </h3>
            <p className="text-app-text-sub font-medium leading-relaxed">
              Empowering learners with AI-powered education. Learn anytime, anywhere with our intelligent tutoring system.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-app-text-main uppercase tracking-widest text-xs mb-6">Learning</h4>
            <ul className="space-y-4 text-app-text-sub font-bold text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors">
                  {t.nav.dashboard}
                </Link>
              </li>
              <li>
                <Link to="/lessons" className="hover:text-primary transition-colors">
                  {t.nav.lessons}
                </Link>
              </li>
              <li>
                <Link to="/ai-tutor" className="hover:text-primary transition-colors">
                  {t.nav.aiTutor}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-app-text-main uppercase tracking-widest text-xs mb-6">Support</h4>
            <ul className="space-y-4 text-app-text-sub font-bold text-sm">
              <li>
                <Link to="/accessibility" className="hover:text-primary transition-colors">
                  {t.nav.accessibility}
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-primary transition-colors">
                  {t.nav.support}
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-primary transition-colors">
                  {t.nav.settings}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-app-text-main uppercase tracking-widest text-xs mb-6">Connect</h4>
            <p className="text-app-text-sub font-medium text-sm mb-4">
              Stay updated with our latest features and educational content.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-app-bg border border-app-border flex items-center justify-center hover:border-primary cursor-pointer transition-all">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </div>
              <div className="w-10 h-10 rounded-xl bg-app-bg border border-app-border flex items-center justify-center hover:border-primary cursor-pointer transition-all">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-app-border text-center text-app-text-muted font-bold text-xs uppercase tracking-widest">
          <p>&copy; 2026 LearnBridge AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
