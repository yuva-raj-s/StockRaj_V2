import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { UserStock } from '../../../types/portfolio';

interface StockCardProps {
  stock: UserStock;
}

export const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  // Add default values to prevent undefined errors
  const currentPrice = stock.currentPrice || 0;
  const avgPrice = stock.avgPrice || 0;
  const quantity = stock.quantity || 0;

  const profitLoss = (currentPrice - avgPrice) * quantity;
  const profitLossPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

  return (
    <div className="glass p-4 rounded-lg hover:shadow-neon-sm transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-white font-medium text-lg">{stock.symbol}</div>
          <div className="text-sm text-gray-400">{stock.name}</div>
        </div>
        <div className="text-right">
          <div className="text-white">₹{currentPrice.toFixed(2)}</div>
          <div className={`flex items-center text-sm ${
            profitLossPercent >= 0 ? 'text-success' : 'text-danger'
          }`}>
            {profitLossPercent >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {Math.abs(profitLossPercent).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-400">Quantity</div>
          <div className="text-white">{quantity}</div>
        </div>
        <div>
          <div className="text-gray-400">Avg. Price</div>
          <div className="text-white">₹{avgPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-400">Invested</div>
          <div className="text-white">₹{(quantity * avgPrice).toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-400">Current Value</div>
          <div className="text-white">₹{(quantity * currentPrice).toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-gray-400 text-sm mb-1">P&L</div>
        <div className={`font-medium ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
          ₹{Math.abs(profitLoss).toFixed(2)}
          <span className="text-sm ml-1">({Math.abs(profitLossPercent).toFixed(2)}%)</span>
        </div>
      </div>
    </div>
  );
};