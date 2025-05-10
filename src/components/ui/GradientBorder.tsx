import React from 'react';

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientBorder: React.FC<GradientBorderProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-[1px] rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary ${className}`}>
      {children}
    </div>
  );
};