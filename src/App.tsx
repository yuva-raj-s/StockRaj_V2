import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { MarketActivity } from './pages/MarketActivity';
import { Watchlist } from './pages/Watchlist';
import { Portfolio } from './pages/Portfolio';
import {AIAnalysis} from './pages/AIAnalysis';
import { Chatbot } from './pages/Chatbot';
import { Settings } from './pages/Settings';
import { Footer } from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext.tsx';
import './styles/glassmorphism.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add scroll to top effect when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'market':
        return <MarketActivity />;
      case 'watchlist':
        return <Watchlist />;
      case 'portfolio':
        return <Portfolio />;
      case 'analysis':
        return <AIAnalysis />;
      case 'chatbot':
        return <Chatbot />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <DataProvider>
          <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
            <div className="lg:hidden">
              <button
                type="button"
                aria-label="Toggle mobile menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="fixed top-4 left-4 z-50 glass-button p-2 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>

            <Navigation 
              onPageChange={setCurrentPage}
              isMobileMenuOpen={isMobileMenuOpen}
              onMobileMenuClose={() => setIsMobileMenuOpen(false)}
            />

            <div className="lg:pl-64 transition-all duration-300">
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {renderPage()}
              </main>
              <Footer />
            </div>
          </div>
        </DataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;