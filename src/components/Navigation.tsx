import React from 'react';
import { Layout, Activity, Brain, Briefcase, List, MessageSquare, Settings } from 'lucide-react';

interface NavigationProps {
  onPageChange: (page: string) => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  onPageChange, 
  isMobileMenuOpen = false,
  onMobileMenuClose 
}) => {
  const links = [
    { name: 'Dashboard', icon: <Layout className="w-5 h-5" />, id: 'dashboard' },
    { name: 'Market Activity', icon: <Activity className="w-5 h-5" />, id: 'market' },
    { name: 'Watchlist', icon: <List className="w-5 h-5" />, id: 'watchlist' },
    { name: 'Portfolio', icon: <Briefcase className="w-5 h-5" />, id: 'portfolio' },
    { name: 'AI Analysis', icon: <Brain className="w-5 h-5" />, id: 'analysis' },
    { name: 'AI Chat', icon: <MessageSquare className="w-5 h-5" />, id: 'chatbot' },
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, id: 'settings' },
  ];

  const handleClick = (id: string) => {
    onPageChange(id);
    onMobileMenuClose?.();
  };

  return (
    <aside className={`fixed inset-y-0 left-0 transform ${
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:w-64 transition-transform duration-300 ease-in-out z-30
    glass border-r border-white/10 bg-gradient-to-b from-cyan-900/50 to-gray-900/50`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Brain className="h-8 w-8 text-cyan-500 dark:text-cyan-400 animate-pulse" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">StockRaj</span>
        </div>
        
        <nav className="space-y-2">
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => handleClick(link.id)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                       text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg
                            bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                {link.icon}
              </div>
              <span>{link.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default Navigation;