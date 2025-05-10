import React from 'react';
import { Briefcase } from 'lucide-react';
import { StockCard } from './StockCard';
import type { UserStock } from '../../../types/portfolio';

interface StocksListProps {
  stocks: UserStock[];
  loading?: boolean;
  error?: string | null;
}

export const StocksList: React.FC<StocksListProps> = ({ stocks, loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center mb-4">
          <Briefcase className="w-5 h-5 mr-2 text-accent" />
          Your Stocks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass p-4 rounded-lg animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-2/3"></div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-4 rounded-lg text-rose-400">
        {error}
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="glass p-4 rounded-lg text-gray-400">
        No stocks in your portfolio yet.
      </div>
    );
  }

  return (
    <>
      <h3 className="text-lg font-semibold text-white flex items-center mb-4">
        <Briefcase className="w-5 h-5 mr-2 text-accent" />
        Your Stocks
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} />
        ))}
      </div>
    </>
  );
};