import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isCollapsed: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, onClick, isCollapsed }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                text-gray-300 hover:bg-white/5 transition-all duration-200"
    >
      <Icon className="w-5 h-5" />
      {!isCollapsed && <span className="transition-all duration-200">{label}</span>}
    </button>
  );
};