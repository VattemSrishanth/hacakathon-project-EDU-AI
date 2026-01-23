import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { auth, isAuthenticated, logout } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/dashboard', label: t.nav.dashboard },
    { to: '/lessons', label: t.nav.lessons },
    { to: '/ai-tutor', label: t.nav.aiTutor },
    { to: '/accessibility', label: t.nav.accessibility },
    { to: '/support', label: t.nav.support },
    { to: '/settings', label: t.nav.settings },
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
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-indigo-700 transition-colors duration-200"
              >
                {t.nav.login}
              </Link>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold"
                  aria-label="User menu"
                >
                  {auth?.user?.avatarUrl ? (
                    <img
                      src={auth.user.avatarUrl}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    auth?.user?.initials || 'U'
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {auth?.user?.username || auth?.user?.email || 'User'}
                      </p>
                      <p className="text-xs text-gray-600">{auth?.user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {t.nav.profile}
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            )}
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
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-indigo-700 transition-colors duration-200 inline-block w-fit"
                  onClick={() => setIsOpen(false)}
                >
                  {t.nav.login}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 inline-block w-fit"
                >
                  {t.nav.logout}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
