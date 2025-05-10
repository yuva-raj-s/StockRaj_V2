import React from 'react';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small';
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  className = ''
}) => {
  const variants = {
    h1: "text-3xl font-bold text-primary",
    h2: "text-2xl font-bold text-primary",
    h3: "text-xl font-semibold text-primary",
    h4: "text-lg font-semibold text-primary",
    body: "text-base text-secondary",
    small: "text-sm text-muted"
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};