import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Menu, X, LayoutDashboard, BookOpen, Sparkles, Accessibility, 
  Hand, Captions, Mic, WifiOff, Download, RefreshCw, Zap, 
  Headset, Settings, ShieldAlert,
  ChevronLeft, ChevronRight, LogOut, Home, MessageSquare, Award, HelpCircle, BarChart, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import SidebarItem from './SidebarItem';
import { useOffline } from '../../context/OfflineContext';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: { 
  isCollapsed: boolean, 
  setIsCollapsed: (v: boolean) => void,
  isMobileOpen: boolean,
  setIsMobileOpen: (v: boolean) => void 
}) => {
  const { auth, isGuest, logout } = useAuth();
  const { t } = useSettings();
  const { isOffline, syncInProgress } = useOffline();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const isAdmin = auth?.user?.role === 'admin';

  const navGroups = [
    {
      title: 'CORE LEARNING',
      items: [
        { to: '/', label: 'Home', icon: Home, disabled: false },
        { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard, disabled: false },
        { to: '/lessons', label: t.nav.lessons, icon: BookOpen, disabled: false },
        { to: '/ai-tutor', label: t.nav.aiTutor, icon: Sparkles, disabled: false },
      ]
    },
    {
      title: 'ACCESSIBILITY',
      isHighlight: true,
      items: [
        { to: '/accessibility', label: 'Accessibility Hub', icon: Accessibility, disabled: false },
        { to: '/sign-language', label: 'Sign Language', icon: Hand, disabled: false },
        { to: '/captions', label: 'Captions', icon: Captions, disabled: false },
        { to: '/speech-assist', label: 'Speech Assist', icon: Mic, disabled: false },
      ]
    },
    {
      title: 'OFFLINE & LOW DATA',
      items: [
        { to: '/lessons/uploaded', label: 'Offline Content', icon: WifiOff, disabled: false },
        { to: '/downloads', label: 'Downloads', icon: Download, disabled: false },
        { to: '/sync-status', label: 'Sync Status', icon: RefreshCw, disabled: false },
        { to: '/data-usage', label: 'Data Usage', icon: Zap, disabled: false },
      ]
    },
    {
      title: 'COMMUNITY & SUPPORT',
      items: [
        { to: '/community', label: 'Community', icon: MessageSquare, disabled: false },
        { to: '/community/ask', label: 'Ask Doubt', icon: HelpCircle, disabled: false },
        { to: '/support', label: t.nav.support, icon: Headset, disabled: false },
      ]
    },
    {
      title: 'PROGRESS',
      items: [
        { to: '/insights', label: 'Progress', icon: BarChart, disabled: false },
        { to: '/certificates', label: 'Achievements', icon: Award, disabled: false },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { to: '/settings', label: t.nav.settings, icon: Settings, disabled: false },
        { to: '/dashboard', label: t.nav.profile, icon: User, disabled: false },
        ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldAlert, disabled: false }] : []),
      ]
    }
  ];

  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[240px]';

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={toggleMobile}
        className="lg:hidden fixed bottom-6 right-6 z-60 p-4 rounded-full bg-primary text-white shadow-2xl active:scale-90 transition-transform"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar Container */}
      <nav className={`
        fixed left-0 top-0 h-full bg-app-bg border-r border-app-border z-50 transition-all duration-300 ease-in-out
        ${sidebarWidth}
        ${isMobileOpen ? 'translate-x-0 w-70' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-6 flex items-center h-20 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <Link to="/" className="text-xl font-black tracking-tighter text-primary truncate hover:opacity-80 transition-opacity">
                LearnBridge AI
              </Link>
            )}
            <button 
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-app-bg-alt text-app-text-muted transition-colors"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin">
            <ul className="space-y-6">
              {navGroups.map((group, gIdx) => (
                <li key={gIdx} className="space-y-1">
                  {!isCollapsed && (
                    <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-app-text-muted mb-2">
                      {group.title}
                    </h3>
                  )}
                  <ul className="space-y-1">
                    {group.items.map((item, iIdx) => {
                      const isRestricted = !['/', '/accessibility', '/support'].includes(item.to);
                      const isDisabled = (isGuest && isRestricted) || item.disabled;

                      return (
                        <li key={iIdx}>
                          <SidebarItem
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            isCollapsed={isCollapsed}
                            isAccessibility={group.isHighlight}
                            disabled={isDisabled}
                            onClick={() => {
                              if (isDisabled && isGuest) {
                                if (window.confirm("This feature is for logged-in users only. Go to login?")) {
                                  navigate('/login');
                                }
                              }
                            }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer - Logout/User info/Connectivity */}
          <div className="p-3 border-t border-app-border space-y-2">
            {(isOffline || syncInProgress) && (
              <div 
                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-500 ${
                  syncInProgress 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                }`}
                title={isOffline ? 'Working Offline' : 'Syncing Data...'}
              >
                {syncInProgress ? (
                  <RefreshCw size={18} className="shrink-0 animate-spin" />
                ) : (
                  <WifiOff size={18} className="shrink-0" />
                )}
                {!isCollapsed && (
                  <span>{syncInProgress ? 'Syncing...' : 'Offline'}</span>
                )}
              </div>
            )}

            <button
              onClick={logout}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group relative`}
              title={isCollapsed ? t.nav.logout : ''}
            >
              <LogOut size={22} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-black uppercase tracking-wider">{t.nav.logout}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                  {t.nav.logout}
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
