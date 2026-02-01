import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'magic';
}

const Card = ({ children, className = '', hover = false, onClick, variant = 'default' }: CardProps) => {
  const themeHookClass = variant === 'magic' ? 'magic-card' : 'card';

  return (
    <div
      onClick={onClick}
      className={`
        ${themeHookClass} bg-app-bg rounded-3xl shadow-sm p-8 border border-app-border transition-all duration-300 card-float
        ${hover ? 'hover:shadow-2xl hover:border-primary/30 cursor-pointer hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
