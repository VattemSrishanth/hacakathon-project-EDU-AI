import { Link } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/lessons', label: 'Lessons' },
    { to: '/ai-tutor', label: 'AI Tutor' },
    { to: '/accessibility', label: 'Accessibility' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                RuralAccess AI
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-indigo-700 transition-colors duration-200"
            >
              Login
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 hover:text-primary transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-indigo-700 transition-colors duration-200 inline-block w-fit"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
