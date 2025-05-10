import React from 'react';
import { 
  User, LogOut, MessageSquare, Share2, 
  HelpCircle, Shield, Bell, Gift 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SettingsMenuProps {
  activeSection: string;
  onSelect: (section: string) => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ activeSection, onSelect }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'feedback', label: 'Send Feedback', icon: MessageSquare },
    { id: 'refer', label: 'Refer a Friend', icon: Gift },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ];

  return (
    <div className="space-y-2">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg
            transition-colors duration-200 ${
              activeSection === item.id
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'text-gray-300 hover:bg-white/5'
            }`}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </button>
      ))}

      <button
        onClick={logout}
        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg
          text-red-400 hover:bg-red-400/10 transition-colors duration-200"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  );
};