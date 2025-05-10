import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

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
  error?: string;
}

interface WatchlistTableProps {
  symbols: string[];
  onDeleteSymbol: (symbol: string) => void;
}

export const WatchlistTable: React.FC<WatchlistTableProps> = ({ symbols, onDeleteSymbol }) => {
  const [sortBy, setSortBy] = useState<string>('symbol');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = async () => {
    if (!symbols.length) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

          const response = await fetch(
        `http://localhost:3001/api/watchlist-data?symbols=${symbols.join(',')}`
          );

          if (!response.ok) {
        throw new Error('Failed to fetch watchlist data');
          }

          const data = await response.json();
      setStockData(data);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to fetch stock data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    
    // Set up interval for real-time updates during market hours
    const interval = setInterval(fetchStockData, 5000);
    
    return () => clearInterval(interval);
  }, [symbols]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedData = [...stockData].sort((a, b) => {
    if (!a || !b) return 0;
    
    const aValue = a[sortBy as keyof StockData];
    const bValue = b[sortBy as keyof StockData];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000000) {
      return `₹${(value / 1000000000000).toFixed(2)}T`;
    }
    if (value >= 10000000000) {
      return `₹${(value / 10000000000).toFixed(2)}B`;
    }
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-500/10 border-red-500/20">
        <p className="text-red-400">{error}</p>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#0A1118] scrollbar-track-[#0A1118]">
        <table className="w-full hover:bg-accent/5 transition-all">
        <thead>
          <tr className="border-b border-gray-800">
            <th 
              className="py-3 px-4 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('symbol')}
            >
              Symbol {sortBy === 'symbol' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="py-3 px-4 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('currentPrice')}
            >
                Price {sortBy === 'currentPrice' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="py-3 px-4 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('change')}
            >
              Change {sortBy === 'change' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="py-3 px-4 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('changePercent')}
            >
              Change % {sortBy === 'changePercent' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
              <th 
                className="py-3 px-4 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('dayHigh')}
              >
                Day High {sortBy === 'dayHigh' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="py-3 px-4 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('dayLow')}
              >
                Day Low {sortBy === 'dayLow' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="py-3 px-4 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('marketCap')}
              >
                Market Cap {sortBy === 'marketCap' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="py-3 px-4 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('peRatio')}
              >
                P/E Ratio {sortBy === 'peRatio' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
            {sortedData.map((stock) => {
            const isPositive = stock.change >= 0;
            const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

            return (
              <tr 
                  key={stock.symbol} 
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center">
                      <span className="text-white font-medium">{stock.symbol}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 ml-2" />
                  </div>
                    <div className="text-sm text-gray-500">{stock.name}</div>
                </td>
                <td className="py-4 px-4">
                    <span className="text-white">₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <ChangeIcon className={`w-4 h-4 mr-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
                    <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                      ₹{Math.abs(stock.change).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </td>
                  <td className="py-4 px-4">
                    <span className="text-white">₹{stock.dayHigh.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">₹{stock.dayLow.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">{formatMarketCap(stock.marketCap)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">{stock.peRatio.toFixed(2)}</span>
                  </td>
                <td className="py-4 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                      onClick={() => onDeleteSymbol(stock.symbol)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
};