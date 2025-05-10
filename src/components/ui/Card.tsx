import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowEffect?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  glowEffect = false,
  hover = true
}) => {
  return (
    <div className={`
      glass-card
      ${glowEffect ? 'hover:shadow-neon' : ''}
      ${hover ? 'hover-glow' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};