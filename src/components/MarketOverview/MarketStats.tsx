import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '../../context/DataContext';

const MARKET_INDICES = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50' },
  { symbol: 'SENSEX', name: 'SENSEX' },
  { symbol: 'NIFTY BANK', name: 'NIFTY BANK' },
];

export const MarketStats: React.FC = () => {
  const { marketIndices } = useData();

  return (
    <div className="space-y-4">
      {MARKET_INDICES.map((index) => {
        const indexData = marketIndices[index.symbol as keyof typeof marketIndices];
        const change = indexData?.change_percent || 0;
        const isPositive = change >= 0;
        
        return (
          <div 
            key={index.symbol} 
            className="glass p-4 rounded-xl border border-white/10 hover:border-accent-primary/30 transition-all duration-300"
          >
            <div className="flex justify-between items-center">
      <div>
                <h3 className="text-white/80 font-medium text-sm">{index.name}</h3>
                <p className="text-white text-2xl font-bold mt-1 tracking-tight">
                  {indexData?.price?.toFixed(2) || '0.00'}
                </p>
          </div>
              <div className={`flex items-center gap-2 ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="text-lg font-semibold">
                  {Math.abs(change).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};