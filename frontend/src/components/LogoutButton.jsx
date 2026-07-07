import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const LogoutButton = ({ 
  isCollapsed = false, 
  text = 'Logout',
  className = "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group relative"
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className={className}
      title={isCollapsed ? text : ''}>
      
      <LogOut size={22} className="shrink-0" />
      
      {!isCollapsed && (
        <span className="text-sm font-black uppercase tracking-wider">{text}</span>
      )}
      
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          {text}
        </div>
      )}
    </button>
  );
};

export default LogoutButton;
