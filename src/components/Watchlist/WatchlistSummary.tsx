import React from 'react';
import { Card } from '../ui/Card';

interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
}

interface WatchlistSummaryProps {
  data: StockData[];
}

export const WatchlistSummary: React.FC<WatchlistSummaryProps> = ({ data }) => {
  const totalMarketCap = data.reduce((sum, stock) => sum + stock.marketCap, 0);
  const avgPeRatio = data.reduce((sum, stock) => sum + stock.peRatio, 0) / data.length;
  const avgDividendYield = data.reduce((sum, stock) => sum + stock.dividendYield, 0) / data.length;

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000000) {
      return `₹${(value / 1000000000000).toFixed(2)}T`;
    }
    if (value >= 10000000000) {
      return `₹${(value / 10000000000).toFixed(2)}B`;
    }
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Watchlist Summary</h3>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">Total Market Cap</div>
          <div className="text-xl font-medium text-white">{formatMarketCap(totalMarketCap)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Average P/E Ratio</div>
          <div className="text-xl font-medium text-white">{avgPeRatio.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Average Dividend Yield</div>
          <div className="text-xl font-medium text-white">{avgDividendYield.toFixed(2)}%</div>
        </div>
      </div>
    </Card>
  );
}; 