import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

interface StockHolding {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  change: number;
  name?: string;
  sector?: string;
}

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  timestamp: number;
}

export const PortfolioOverview: React.FC = () => {
  const [holdings, setHoldings] = useState<StockHolding[]>([
    { symbol: 'RELIANCE', shares: 100, avgPrice: 2400, currentPrice: 0, change: 0 },
    { symbol: 'INFY', shares: 50, avgPrice: 1500, currentPrice: 0, change: 0 },
    { symbol: 'TCS', shares: 75, avgPrice: 3500, currentPrice: 0, change: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const symbols = holdings.map(h => h.symbol).join(',');
        const response = await axios.get<StockData[]>(`http://localhost:3001/api/stocks?symbols=${symbols}`);

        const updatedHoldings = holdings.map(holding => {
          const stockData = response.data.find(s => s.symbol === holding.symbol);
          if (!stockData) return holding;

          return {
            ...holding,
            currentPrice: stockData.price,
            change: stockData.changePercent
          };
        });

        setHoldings(updatedHoldings);
        setError(null);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to fetch stock data');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const totalValue = holdings.reduce((sum, stock) => sum + (stock.currentPrice * stock.shares), 0);
  const totalGain = holdings.reduce((sum, stock) => 
    sum + ((stock.currentPrice - stock.avgPrice) * stock.shares), 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-white/10 rounded w-2/3"></div>
          </div>
          <div className="glass p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-white/10 rounded w-2/3"></div>
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass p-4 rounded-lg animate-pulse">
            <div className="h-6 bg-white/10 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
          </div>
        ))}
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass p-4 rounded-lg">
          <div className="text-text-secondary">Total Value</div>
          <div className="text-xl font-bold text-white">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="glass p-4 rounded-lg">
          <div className="text-text-secondary">Total Gain/Loss</div>
          <div className={`text-xl font-bold ${totalGain >= 0 ? 'text-success' : 'text-danger'}`}>
            ₹{totalGain.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {holdings.map((stock) => (
          <div key={stock.symbol} className="glass p-4 rounded-lg hover-glow transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{stock.symbol}</div>
                <div className="text-sm text-text-secondary">
                  {stock.shares} shares
                </div>
              </div>
              <div className="text-right">
                <div className="text-white">₹{stock.currentPrice.toFixed(2)}</div>
                <div className={`flex items-center text-sm ${
                  stock.change >= 0 ? 'text-success' : 'text-danger'
                }`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {stock.change.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};