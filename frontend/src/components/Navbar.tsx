import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePinned, setProfilePinned] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => !!document.fullscreenElement);
  const { auth, isAuthenticated, isGuest, logout } = useAuth();
  const { t, isDark } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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

  const popupBg = isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900';
  const popupHeaderBg = isDark ? 'bg-gray-900/60 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-100 text-gray-900';
  const popupHover = isDark ? 'hover:bg-gray-700 text-gray-100' : 'hover:bg-gray-100 text-gray-800';
  const logoutHover = isDark ? 'hover:bg-red-900/30 text-red-300' : 'hover:bg-red-50 text-red-600';

  if (isFullscreen) return null;

  return (
    <nav className="bg-app-bg border-b border-app-border sticky top-0 z-50 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="text-3xl font-black tracking-tighter text-primary">
                LearnBridge AI
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => {
              const isRestricted = !['/', '/accessibility', '/support'].includes(link.to);
              const isDisabled = isGuest && isRestricted;
              
              return (
                <Link
                  key={link.to}
                  to={isDisabled ? '#' : link.to}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                      if (window.confirm("This feature is for logged-in users only. Go to login?")) {
                        navigate('/login');
                      }
                    }
                  }}
                  className={`text-app-text-sub font-black text-lg hover:text-primary transition-colors duration-200 ${
                    isDisabled ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isGuest && (
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  Guest Mode
                </span>
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-xl bg-app-bg border-2 border-primary text-primary hover:bg-primary hover:text-white font-black text-sm uppercase tracking-widest transition-all"
                >
                  Log In
                </Link>
              </div>
            )}
            {!isAuthenticated && !isGuest ? (
              <Link
                to="/login"
                className="px-8 py-3 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {t.nav.login}
              </Link>
            ) : isAuthenticated && (
              <div
                className="relative"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => {
                  if (!profilePinned) setProfileOpen(false);
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((prev) => !prev);
                    setProfilePinned((prev) => !prev);
                  }}
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
                  <div
                    className={`absolute right-0 mt-2 rounded-lg border shadow-lg z-50 popup-interactive profile-dropdown ${popupBg}`}
                  >
                    <div className={`px-4 py-3 border-b profile-dropdown__header ${popupHeaderBg}`}>
                      <p className="text-sm font-bold profile-dropdown__text">
                        {auth?.user?.username || auth?.user?.email || 'User'}
                      </p>
                      <p className="text-xs font-medium opacity-80 profile-dropdown__email">{auth?.user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        setProfilePinned(false);
                        navigate('/dashboard');
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${popupHover}`}
                    >
                      {t.nav.profile}
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${logoutHover}`}
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
