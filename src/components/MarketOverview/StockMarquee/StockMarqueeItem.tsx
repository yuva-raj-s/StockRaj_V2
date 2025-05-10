import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockMarqueeItemProps {
  symbol: string;
  price: number;
  change: number;
}

export const StockMarqueeItem: React.FC<StockMarqueeItemProps> = ({ 
  symbol, 
  price, 
  change 
}) => {
  return (
    <div className="inline-flex items-center mx-4">
      <span className="text-white font-medium">{symbol}</span>
      <span className="mx-2 text-gray-300">₹{price}</span>
      <span className={`flex items-center ${
        change >= 0 ? 'text-success' : 'text-danger'
      }`}>
        {change >= 0 ? (
          <TrendingUp className="w-4 h-4 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 mr-1" />
        )}
        {change}%
      </span>
    </div>
  );
};