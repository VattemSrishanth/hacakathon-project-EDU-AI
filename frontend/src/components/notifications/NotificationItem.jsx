import React from 'react';
import { Bell, AlertCircle, BookOpen, CheckCircle2, Info, Zap } from 'lucide-react';

const NotificationItem = ({ notification, onClick }) => {
  const getIcon = (type, priority) => {
    if (priority === 'high') return <AlertCircle className="text-red-500" size={16} />;
    switch (type) {
      case 'assignment': return <BookOpen className="text-blue-500" size={16} />;
      case 'info': return <Info className="text-secondary" size={16} />;
      case 'success': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'system': return <Zap className="text-amber-500" size={16} />;
      default: return <Bell className="text-app-text-muted" size={16} />;
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(notification)}
      className={`p-4 border-b border-app-border/40 last:border-0 hover:bg-app-bg transition-colors flex gap-3 cursor-pointer ${
        !notification.is_read ? 'bg-primary/5' : ''
      }`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
        !notification.is_read ? 'bg-primary/10 border-primary/20' : 'bg-app-bg-alt border-app-border'
      }`}>
        {getIcon(notification.type, notification.priority)}
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className={`text-xs font-black uppercase tracking-tight truncate ${
            !notification.is_read ? 'text-app-text-main' : 'text-app-text-sub'
          }`}>
            {notification.title}
          </h4>
          <span className="text-[8px] font-bold text-app-text-muted uppercase tracking-widest whitespace-nowrap">
            {new Date(notification.timestamp || notification.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <p className="text-[10px] font-bold text-app-text-sub uppercase tracking-widest line-clamp-2 mt-0.5 opacity-60">
          {notification.message}
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;