import React from 'react';

interface ToastProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  // For now, just console log the toast message
  // You can implement a proper toast notification system later
  console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
}; 