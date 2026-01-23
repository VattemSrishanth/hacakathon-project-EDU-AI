const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">RuralAccess AI</h3>
            <p className="text-gray-400">
              Empowering education through AI technology for rural communities.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/lessons" className="hover:text-white transition-colors">
                  Lessons
                </a>
              </li>
              <li>
                <a href="/ai-tutor" className="hover:text-white transition-colors">
                  AI Tutor
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/accessibility" className="hover:text-white transition-colors">
                  Accessibility
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2026 RuralAccess AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
