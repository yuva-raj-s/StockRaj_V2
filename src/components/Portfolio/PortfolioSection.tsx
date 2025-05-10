import React from 'react';
import { Briefcase, Plus, TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioStock {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  change: number;
}

const portfolioData: PortfolioStock[] = [
  { symbol: 'RELIANCE', quantity: 100, avgPrice: 2400, currentPrice: 2456.75, change: 2.36 },
  { symbol: 'INFY', quantity: 50, avgPrice: 1500, currentPrice: 1456.80, change: -2.88 },
];

export const PortfolioSection: React.FC = () => {
  const calculateTotalValue = () => {
    return portfolioData.reduce((total, stock) => total + (stock.currentPrice * stock.quantity), 0);
  };

  const calculateTotalGain = () => {
    return portfolioData.reduce((total, stock) => 
      total + ((stock.currentPrice - stock.avgPrice) * stock.quantity), 0);
  };

  return (
    <div className="glass p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-accent-primary" />
          <h3 className="text-lg font-semibold text-white">Your Portfolio</h3>
        </div>
        <button className="glass-button px-3 py-1 flex items-center space-x-1">
          <Plus className="w-4 h-4" />
          <span>New Portfolio</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="glass p-3 rounded-lg">
          <div className="text-sm text-gray-400">Total Value</div>
          <div className="text-lg font-bold text-white">
            ₹{calculateTotalValue().toLocaleString('en-IN')}
          </div>
        </div>
        <div className="glass p-3 rounded-lg">
          <div className="text-sm text-gray-400">Total Gain/Loss</div>
          <div className={`text-lg font-bold ${calculateTotalGain() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ₹{calculateTotalGain().toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {portfolioData.map((stock, index) => (
          <div key={index} className="glass p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{stock.symbol}</div>
                <div className="text-xs text-gray-400">{stock.quantity} shares</div>
              </div>
              <div className="text-right">
                <div className="text-white">₹{stock.currentPrice.toFixed(2)}</div>
                <div className={`flex items-center text-sm ${
                  stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stock.change}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};