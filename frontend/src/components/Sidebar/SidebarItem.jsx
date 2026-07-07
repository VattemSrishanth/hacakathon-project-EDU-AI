import React from 'react';
import { NavLink } from 'react-router-dom';












const SidebarItem = ({
  to,
  icon: Icon,
  label,
  isCollapsed,
  isAccessibility,
  onClick,
  disabled
}) => {
  const baseClasses = `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative`;
  const accessibilityClasses = isAccessibility ?
  'bg-ai-accent/5 text-ai-accent border border-ai-accent/10 hover:bg-ai-accent/10' :
  'text-app-text-sub hover:bg-sidebar-hover-bg hover:text-primary';
  const disabledClasses = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '';

  return (
    <NavLink
      to={disabled ? '#' : to}
      onClick={onClick}
      className={({ isActive }) => `
        ${baseClasses} 
        ${accessibilityClasses} 
        ${disabledClasses}
        ${isActive && !disabled ? 'bg-sidebar-active-bg text-sidebar-active-text font-bold shadow-sm' : ''}
      `}
      title={isCollapsed ? label : ''}>
      
      {({ isActive }) =>
      <>
          <Icon size={22} className={`shrink-0 ${isActive && !disabled ? 'text-sidebar-active-text' : ''}`} />
          {!isCollapsed && <span className="text-sm font-medium truncate">{label}</span>}
          
          {isCollapsed &&
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity">
              {label}
            </div>
        }
        </>
      }
    </NavLink>);

};

export default SidebarItem;