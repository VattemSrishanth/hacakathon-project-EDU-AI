import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userDataAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import NotificationItem from './NotificationItem';

const NotificationBell = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  const fetchNotifs = async () => {
    if (!auth?.user?.id) return;
    try {
      const res = await userDataAPI.getNotifications(String(auth.user.id));
      if (res.success) {
        setNotifications(res.notifications || []);
        const unread = (res.notifications || []).filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error('Failed to load notifications in header bell', e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [auth?.user?.id]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggle = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen && unreadCount > 0) {
      // Mark read when opening dropdown
      if (auth?.user?.id) {
        userDataAPI.updateNotificationsRead(String(auth.user.id))
          .then(() => {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
          })
          .catch(e => console.error(e));
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="p-2 hover:bg-app-accent/10 rounded-lg text-app-text-muted hover:text-app-primary transition-all relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-app-primary text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-app-bg-alt border border-app-border rounded-3xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-app-border flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-app-text-main">Recent Activity</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase rounded">
              {unreadCount} New
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-app-text-muted">
                <Zap size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Alerts Received</p>
              </div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <NotificationItem
                  key={n.id || n._id}
                  notification={n}
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/notifications');
                  }}
                />
              ))
            )}
          </div>

          <button
            onClick={() => {
              setDropdownOpen(false);
              navigate('/notifications');
            }}
            className="w-full py-3 bg-app-bg text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-widest border-t border-app-border flex items-center justify-center gap-1"
          >
            Open Notifications Center <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;