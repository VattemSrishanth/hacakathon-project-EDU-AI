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
  Flame,
  X,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Accessibility as AccessibilityIcon,
  Award,
  Settings as SettingsIcon,
  HelpCircle,
  Clock,
  WifiOff as OfflineIcon,
  CreditCard
} from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

const TopBar = ({ onOpenMobileMenu }) => {
  const { auth } = useAuth();
  const { settings, updateLearning, updateThemeAccessibility, isDark } = useSettings();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleLanguage = () => {
    const nextLang = settings.learning.language === 'English' ? 'Telugu' : 'English';
    updateLearning({ language: nextLang });
  };

  const toggleTheme = () => {
    updateThemeAccessibility({
      theme: isDark ? 'Crystal Light' : 'Midnight Void'
    });
  };

  const navigationShortcuts = [
    { label: 'Dashboard', desc: 'Overview, learning pulse, and calendar', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Lessons Library', desc: 'Browse curriculums, chapters, and topics', to: '/lessons', icon: BookOpen },
    { label: 'AI Tutor', desc: 'Interactive concept tutor powered by Groq', to: '/ai-tutor', icon: Sparkles },
    { label: 'Accessibility Hub', desc: 'Contrast, large text, and voice assist', to: '/accessibility', icon: AccessibilityIcon },
    { label: 'Practice Quiz', desc: 'Interactive self-paced assessments', to: '/lessons/quiz', icon: Award },
    { label: 'Offline Content', desc: 'Locally cached resources & lessons', to: '/lessons/uploaded', icon: OfflineIcon },
    { label: 'Study Focus Timer', desc: 'Jump to student dashboard focus timer', to: '/dashboard', icon: Clock },
    { label: 'Help & FAQs', desc: 'User guides and support articles', to: '/support', icon: HelpCircle },
    { label: 'Pricing Plans', desc: 'Affordable subscriptions for students & schools', to: '/pricing', icon: CreditCard },
    { label: 'Settings', desc: 'Account and learning preferences', to: '/settings', icon: SettingsIcon }
  ];

  const filteredShortcuts = navigationShortcuts.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
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

          <div
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative max-w-md w-full hidden md:flex items-center cursor-pointer group"
          >
            <Search className="absolute left-3 w-4 h-4 text-app-text-muted group-hover:text-primary transition-colors" />
            <div className="w-full pl-10 pr-16 py-2 bg-app-accent/5 hover:bg-app-accent/10 border border-app-border group-hover:border-primary/40 rounded-xl transition-all text-sm font-medium text-app-text-muted select-none">
              Search lessons, tutors...
            </div>
            <span className="absolute right-3 px-1.5 py-0.5 rounded-md border border-app-border text-[10px] font-mono font-bold text-app-text-muted bg-app-bg shadow-xs">
              Ctrl K
            </span>
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

          {/* Study Streak & XP */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-500 cursor-pointer hover:border-orange-500/40 transition group"
            title="5-Day Learning Streak! Study tomorrow to keep the flame alive."
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-bounce group-hover:scale-125 transition-transform" />
            <span>5 Days</span>
            <span className="text-[10px] text-app-text-muted font-normal">• 420 XP</span>
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
            
            <NotificationBell />
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

      {/* Command Palette Modal */}
      {isCommandPaletteOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
          onClick={() => setIsCommandPaletteOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-app-bg border border-app-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="border-b border-app-border p-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-app-text-muted shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a page name or shortcut..."
                className="w-full bg-transparent outline-none text-base font-semibold text-app-text-main placeholder:text-app-text-muted"
              />
              <button
                onClick={() => setIsCommandPaletteOpen(false)}
                className="p-1 rounded-lg text-app-text-muted hover:text-app-text-main hover:bg-app-border/40 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-app-text-muted">
                Quick Navigation Shortcuts
              </p>
              {filteredShortcuts.map((item) => (
                <button
                  key={item.to + item.label}
                  onClick={() => {
                    navigate(item.to);
                    setIsCommandPaletteOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-primary/10 hover:text-primary transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-app-bg-alt group-hover:bg-primary/20 flex items-center justify-center text-app-text-muted group-hover:text-primary transition-colors">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-app-text-main group-hover:text-primary">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-app-text-muted">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-app-text-muted uppercase tracking-wider">
                    {item.to}
                  </span>
                </button>
              ))}
              {filteredShortcuts.length === 0 && (
                <div className="py-8 text-center text-xs text-app-text-muted font-medium">
                  No matching shortcuts found.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-app-bg-alt border-t border-app-border text-[11px] text-app-text-muted flex items-center justify-between">
              <span>Press shortcut to navigate instantly</span>
              <span><kbd className="font-mono bg-app-bg px-1.5 py-0.5 rounded border border-app-border text-[10px]">ESC</kbd> to exit</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
