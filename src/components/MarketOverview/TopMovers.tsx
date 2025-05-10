import React from 'react';
import { Zap } from 'lucide-react';

interface StockMove {
  symbol: string;
  name: string;
  change: number;
  volume: number;
}

const topGainers: StockMove[] = [
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', change: 5.67, volume: 12345678 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', change: 4.89, volume: 9876543 }
];

const topLosers: StockMove[] = [
  { symbol: 'HCLTECH', name: 'HCL Technologies', change: -3.45, volume: 7654321 },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', change: -2.98, volume: 6543210 }
];

export const TopMovers: React.FC = () => {
  return (
    <div className="glass p-4 rounded-xl">
      <div className="flex items-center mb-4 space-x-2">
        <Zap className="w-5 h-5 text-accent-primary" />
        <h3 className="text-lg font-semibold text-white">Top Movers</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm text-green-400 mb-2">Top Gainers</h4>
          {topGainers.map((stock) => (
            <div key={stock.symbol} className="glass p-2 rounded-lg mb-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">{stock.symbol}</div>
                  <div className="text-xs text-gray-400">{stock.name}</div>
                </div>
                <div className="text-green-400">+{stock.change}%</div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Vol: {(stock.volume / 1000000).toFixed(2)}M
              </div>
            </div>
          ))}
        </div>
        <div>
          <h4 className="text-sm text-red-400 mb-2">Top Losers</h4>
          {topLosers.map((stock) => (
            <div key={stock.symbol} className="glass p-2 rounded-lg mb-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">{stock.symbol}</div>
                  <div className="text-xs text-gray-400">{stock.name}</div>
                </div>
                <div className="text-red-400">{stock.change}%</div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Vol: {(stock.volume / 1000000).toFixed(2)}M
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};