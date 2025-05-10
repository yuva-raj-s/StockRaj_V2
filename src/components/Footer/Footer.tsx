import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass mt-8 py-6 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Contact Us</h3>
          <div className="flex space-x-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
               className="text-gray-400 hover:text-accent-primary transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-accent-primary transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="mailto:contact@stockai.com"
               className="text-gray-400 hover:text-accent-primary transition-colors">
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Legal</h3>
          <div className="space-y-2">
            <a href="/privacy" className="block text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/disclaimer" className="block text-gray-400 hover:text-white transition-colors">
              Disclaimer
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">About</h3>
          <p className="text-gray-400">
            StockRaj provides AI-powered stock market analysis and insights. 
            All information is for educational purposes only.
          </p>
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t border-gray-800 text-center text-gray-400">
        <p>© {new Date().getFullYear()} StockRaj. All rights reserved.</p>
      </div>
    </footer>
  );
};