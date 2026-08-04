import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { userDataAPI } from '../services/api';
import {
  Home,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Accessibility,
  Headset,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ArrowRight,
  Bell,
  ShieldCheck } from
'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePinned, setProfilePinned] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const { auth, isAuthenticated, isGuest, logout } = useAuth();
  const { t, isDark } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    let previousNotifications = [];
    const fetchNotifs = async () => {
      if (auth?.user?.id) {
        try {
          const res = await userDataAPI.getNotifications(String(auth.user.id));
          if (res.success) {
            const currentNotifs = res.notifications || [];
            const unreadList = currentNotifs.filter((n) => !n.is_read);
            
            if (unreadList.length > 0) {
              const latestUnread = unreadList[0];
              const isNewlyPolled = previousNotifications.length > 0 && 
                                    !previousNotifications.some((p) => p.id === latestUnread.id);
              const isFirstFetch = previousNotifications.length === 0;
              
              if (isNewlyPolled || isFirstFetch) {
                const sessionKey = `shown_toast_${latestUnread.id}`;
                if (!sessionStorage.getItem(sessionKey)) {
                  setActiveToast(latestUnread);
                  sessionStorage.setItem(sessionKey, 'true');
                  setTimeout(() => {
                    setActiveToast((curr) => (curr?.id === latestUnread.id ? null : curr));
                  }, 8000);
                }
              }
            }
            previousNotifications = currentNotifs;
            setNotifications(currentNotifs);
          }
        } catch (e) {
          console.error('Failed to fetch notifs');
        }
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // 10s polling for demo
    return () => clearInterval(interval);
  }, [auth]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const navLinks = [
  { to: '/', label: t.nav.home, icon: Home },
  { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
  { to: '/lessons', label: t.nav.lessons, icon: BookOpen },
  { to: '/ai-tutor', label: t.nav.aiTutor, icon: Sparkles },
  { to: '/accessibility', label: t.nav.accessibility, icon: Accessibility },
  { to: '/support', label: t.nav.support, icon: Headset },
  { to: '/settings', label: t.nav.settings, icon: Settings }];


  if (auth?.user?.role === 'admin') {
    navLinks.push({ to: '/admin', label: 'Admin', icon: User });
  }

  const popupBg = isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900';
  const popupHeaderBg = isDark ? 'bg-gray-900/60 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-100 text-gray-900';
  const popupHover = isDark ? 'hover:bg-gray-700 text-gray-100' : 'hover:bg-gray-100 text-gray-800';
  const logoutHover = isDark ? 'hover:bg-red-900/30 text-red-300' : 'hover:bg-red-50 text-red-600';

  if (isFullscreen) return null;

  return (
    <nav className="navbar bg-app-bg border-b border-app-border sticky top-0 z-50 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="wa-logo text-3xl font-black tracking-tighter text-primary">
                LearnBridge AI
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const isRestricted = !['/', '/accessibility', '/support'].includes(link.to);
              const isDisabled = isGuest && isRestricted;
              const Icon = link.icon;

              return (
                <NavLink
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
                  className={({ isActive }) => `
                    wa-navlink flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group
                    ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                    ${isActive && !isDisabled ?
                  'bg-primary/10 text-primary active-link shadow-sm' :
                  'text-app-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary'}
                  `}>
                  
                  <Icon
                    size={20}
                    className={`transition-colors duration-300 ${
                    isDisabled ? 'text-gray-400' : 'group-hover:text-primary'}`
                    } />
                  
                  <span className="text-sm font-bold tracking-tight">{link.label}</span>
                </NavLink>);

            })}
            
            {isGuest &&
            <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest border border-secondary/20">
                  Guest Mode
                </span>
                <Link
                to="/login"
                className="px-6 py-2 rounded-xl bg-app-bg border-2 border-primary text-primary hover:bg-primary hover:text-white font-black text-sm uppercase tracking-widest transition-all">
                
                  Log In
                </Link>
              </div>
            }
            
            {!isAuthenticated && !isGuest ?
            <Link
              to="/login"
              className="px-8 py-3 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95">
              
                {t.nav.login}
              </Link> :
            isAuthenticated ?
            <div className="flex items-center gap-6">
                <div className="relative">
                  <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-xl bg-app-bg-alt text-app-text-muted hover:text-primary transition-all relative">
                  
                    <Bell size={20} />
                    {unreadCount > 0 &&
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-app-bg">
                        {unreadCount}
                      </span>
                  }
                  </button>

                  {notifOpen &&
                <div className={`absolute right-0 mt-3 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${popupBg}`}>
                      <div className={`px-4 py-3 border-b ${popupHeaderBg}`}>
                        <h3 className="font-black text-xs uppercase tracking-widest">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ?
                    <div className="p-8 text-center text-app-text-muted italic text-sm font-medium">
                            No notifications yet
                          </div> :

                    notifications.map((n, i) =>
                    <div key={i} className={`p-4 border-b border-app-border/50 hover:bg-app-bg-alt transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}>
                              <p className="text-sm font-bold text-app-text-main mb-1">{n.title}</p>
                              <p className="text-xs text-app-text-sub leading-relaxed">{n.message}</p>
                            </div>
                    )
                    }
                      </div>
                    </div>
                }
                </div>

                <div
                className="relative"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => {
                  if (!profilePinned) setProfileOpen(false);
                }}>
                
                  <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((prev) => !prev);
                    setProfilePinned((prev) => !prev);
                  }}
                  className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold"
                  aria-label="User menu">
                  
                    {auth?.user?.avatarUrl ?
                  <img
                    src={auth.user.avatarUrl}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover" /> :


                  auth?.user?.initials || 'U'
                  }
                  </button>

                  {profileOpen &&
                <div
                  className={`absolute right-0 mt-2 rounded-lg border shadow-lg z-50 popup-interactive profile-dropdown ${popupBg}`}>
                  
                      <div className={`px-4 py-3 border-b profile-dropdown__header ${popupHeaderBg}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {auth?.user?.avatarUrl ?
                        <img src={auth.user.avatarUrl} alt="" className="w-full h-full object-cover" /> :

                        <User className="text-primary" size={24} />
                        }
                          </div>
                          <div>
                            <p className="text-sm font-bold profile-dropdown__text">
                              {auth?.user?.username || auth?.user?.email || 'User'}
                            </p>
                            <p className="text-xs font-medium opacity-60 profile-dropdown__email">{auth?.user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setProfilePinned(false);
                      navigate('/dashboard');
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-3 ${popupHover}`}>
                    
                        <User className="text-primary" size={20} />
                        {t.nav.profile}
                      </button>
                      {auth?.user?.role === 'admin' &&
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setProfilePinned(false);
                      navigate('/admin');
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-3 border-t border-app-border/30 bg-primary/5 ${popupHover}`}>
                    
                          <ShieldCheck className="text-primary" size={20} />
                          Admin Dashboard
                        </button>
                  }
                      <button
                    type="button"
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-3 text-sm font-black whitespace-nowrap transition-colors flex items-center gap-3 border-t border-app-border/50 text-red-600 ${logoutHover}`}>
                    
                        <LogOut className="text-red-500" size={20} />
                        {t.nav.logout}
                      </button>
                    </div>
                }
                </div>
              </div> :
            null}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-app-text-sub hover:bg-app-bg-alt hover:text-primary transition-all active:scale-90"
              aria-label="Toggle menu">
              
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen &&
        <div className="md:hidden pb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col space-y-1 mt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-4 px-4 py-4 text-app-text-main font-bold hover:bg-app-bg-alt hover:text-primary rounded-2xl transition-all group"
                  onClick={() => setIsOpen(false)}>
                  
                  <Icon size={24} className="text-primary" />
                  <span className="flex-1">{link.label}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={16} />
                  </div>
                </Link>);

            })}
            {!isAuthenticated ?
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity duration-200 inline-block w-fit"
              onClick={() => setIsOpen(false)}>
              
                {t.nav.login}
              </Link> :

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 inline-block w-fit">
              
                {t.nav.logout}
              </button>
            }
          </div>
        </div>
        }
    </div>

    {/* Toast Notification Card - Premium Slide-in Message Popup */}
    {activeToast && (
      <div className="fixed top-24 right-6 z-[9999] max-w-sm w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl shadow-2xl p-5 flex gap-4 items-start animate-in slide-in-from-top-4 duration-300 transition-all hover:scale-[1.02] shadow-primary/10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${
          activeToast.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-primary/10 border-primary/20 text-primary'
        }`}>
          <Bell size={22} className="animate-bounce" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
              {activeToast.priority === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
              {activeToast.priority === 'high' ? 'URGENT NOTIFICATION' : 'NEW UPDATE'}
            </span>
          </div>
          <h4 className="text-sm font-black text-app-text-main uppercase tracking-tight">{activeToast.title}</h4>
          <p className="text-xs font-bold text-app-text-sub mt-1.5 leading-relaxed opacity-85 uppercase tracking-wider">{activeToast.message}</p>
          <div className="flex gap-2.5 mt-4">
            <button 
              onClick={() => {
                setActiveToast(null);
                navigate('/notifications');
              }}
              className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition-all shadow-md shadow-primary/15"
            >
              View Gazette
            </button>
            <button 
              onClick={() => setActiveToast(null)} 
              className="px-4 py-2.5 bg-app-bg-alt hover:bg-gray-100 dark:hover:bg-gray-800 border border-app-border text-app-text-main font-black rounded-xl text-[9px] uppercase tracking-widest transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button 
          onClick={() => setActiveToast(null)} 
          className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-xl font-bold leading-none p-1"
        >
          &times;
        </button>
      </div>
    )}
  </nav>);

};

export default Navbar;