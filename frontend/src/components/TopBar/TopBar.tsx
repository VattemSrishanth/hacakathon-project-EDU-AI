import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  User, 
  Wifi, 
  WifiOff, 
  Menu,
  Bell
} from 'lucide-react';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const { auth } = useAuth();
  const { settings, updateLearning, updateThemeAccessibility, isDark } = useSettings();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const displayName = (() => {
    if (auth?.user?.name) return auth.user.name;
    if (auth?.user?.username) return auth.user.username;
    if (auth?.user?.email) return auth.user.email.split('@')[0];
    return "Guest student";
  })();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleLanguage = () => {
    const nextLang = settings.learning.language === 'English' ? 'Telugu' : 'English';
    updateLearning({ language: nextLang });
  };

  const toggleTheme = () => {
    updateThemeAccessibility({ 
      theme: isDark ? 'Crystal Light' : 'Academic Maroon' 
    });
  };

  return (
    <header className="h-16 border-b border-app-border bg-app-bg/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 transition-all">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 hover:bg-app-accent/10 rounded-lg text-app-text transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted transition-colors" />
          <input 
            type="text"
            placeholder="Search lessons, tutors..."
            className="w-full pl-10 pr-4 py-2 bg-app-accent/5 border border-app-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
          />
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Network Status indicator */}
        <div 
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-500 ${
            isOnline 
              ? 'bg-amber-500/10 text-amber-600' 
              : 'bg-red-500/10 text-red-500 animate-pulse ring-1 ring-red-500/20'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span className="hidden sm:inline">Offline</span>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-app-border mx-1 hidden sm:block"></div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleLanguage}
            className="p-2 hover:bg-app-accent/10 rounded-lg text-app-text-muted hover:text-app-primary transition-all flex items-center gap-2"
            title="Switch Language"
          >
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {settings.learning.language === 'English' ? 'EN' : 'TE'}
            </span>
          </button>

          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-app-accent/10 rounded-lg text-app-text-muted hover:text-app-primary transition-all"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2 hover:bg-app-accent/10 rounded-lg text-app-text-muted hover:text-app-primary transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-app-primary rounded-full" />
          </button>
        </div>

        <div className="h-6 w-px bg-app-border mx-1"></div>

        {/* User Profile */}
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 p-1.5 hover:bg-app-accent/10 rounded-full transition-all border border-transparent hover:border-app-border group"
        >
          <div className="w-8 h-8 rounded-full bg-app-primary/10 border-2 border-app-primary/20 flex items-center justify-center text-app-primary transition-transform group-hover:scale-110">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-black text-app-text truncate max-w-20">
              {displayName}
            </p>
            <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest leading-none">
              Lvl 1
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
