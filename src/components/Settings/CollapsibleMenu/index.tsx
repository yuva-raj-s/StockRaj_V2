import React, { useState } from 'react';
import {
  User, Bell, MessageSquare, Users,
  HelpCircle, Lock, LogOut
} from 'lucide-react';
import { MenuItem } from './MenuItem';
import { MenuIcon } from './MenuIcon';

const menuItems = [
  { id: 'profile', icon: User, label: 'Profile settings 📝' },
  { id: 'notifications', icon: Bell, label: 'Notifications 🔔' },
  { id: 'feedback', icon: MessageSquare, label: 'Send Feedback 💬' },
  { id: 'refer', icon: Users, label: 'Refer a Friend 👥' },
  { id: 'help', icon: HelpCircle, label: 'Help & Support ❓' },
  { id: 'privacy', icon: Lock, label: 'Privacy & Security 🔒' },
  { id: 'logout', icon: LogOut, label: 'Logout ↪️' },
];

export const CollapsibleMenu: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleItemClick = (id: string) => {
    console.log(`Clicked: ${id}`);
    // Handle menu item click
  };

  return (
    <div className={`glass p-4 rounded-xl transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex justify-end mb-4">
        <MenuIcon isCollapsed={isCollapsed} onClick={() => setIsCollapsed(!isCollapsed)} />
      </div>
      
      <div className="space-y-2">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            onClick={() => handleItemClick(item.id)}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
};