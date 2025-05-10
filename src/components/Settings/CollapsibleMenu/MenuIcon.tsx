import React from 'react';

interface MenuIconProps {
  isCollapsed: boolean;
  onClick: () => void;
}

export const MenuIcon: React.FC<MenuIconProps> = ({ isCollapsed, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="glass-button p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
      aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
};