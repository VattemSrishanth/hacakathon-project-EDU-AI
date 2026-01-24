import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const Card = ({ children, className = '', hover = false }: CardProps) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-md p-6
        ${hover ? 'hover:shadow-xl transition-shadow duration-300 cursor-pointer popup-interactive' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
