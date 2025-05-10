import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  changePercent: number;
}

interface StocksListProps {
  holdings: Holding[];
  onStockClick: (symbol: string) => void;
}

export const StocksList: React.FC<StocksListProps> = ({ holdings, onStockClick }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Your Holdings</h3>
      
      <div className="space-y-4">
        {holdings.map((holding) => (
          <div
            key={holding.symbol}
            className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => onStockClick(holding.symbol)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-white font-medium">{holding.name}</div>
                <div className="text-sm text-gray-400">{holding.symbol}</div>
              </div>
              <div className="text-right">
                <div className="text-white">₹{holding.currentPrice.toLocaleString('en-IN')}</div>
                <div className={`flex items-center text-sm ${
                  holding.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {holding.changePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {holding.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Quantity</div>
                <div className="text-white">{holding.quantity}</div>
              </div>
              <div>
                <div className="text-gray-400">Avg. Price</div>
                <div className="text-white">₹{holding.avgPrice.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-gray-400">Invested</div>
                <div className="text-white">₹{holding.invested.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-gray-400">Current Value</div>
                <div className="text-white">₹{holding.currentValue.toLocaleString('en-IN')}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-400">P/L</div>
                <div className={`${
                  holding.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ₹{holding.pnl.toLocaleString('en-IN')} ({holding.pnlPercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 