import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card = ({ children, className = '', hover = false, onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-app-bg rounded-3xl shadow-sm p-8 border border-app-border transition-all duration-300 card-float
        ${hover ? 'hover:shadow-2xl hover:border-primary/30 cursor-pointer hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
