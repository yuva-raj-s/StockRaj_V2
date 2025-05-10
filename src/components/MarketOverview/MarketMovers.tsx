import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import axios from 'axios';

type MoverType = 'gainers' | 'losers' | '52high' | '52low' | 'trending';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume?: number;
  high52w?: number;
  low52w?: number;
}

export const MarketMovers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MoverType>('gainers');
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        let endpoint = '';
        switch (activeTab) {
          case 'gainers':
            endpoint = '/api/top-gainers';
            break;
          case 'losers':
            endpoint = '/api/top-losers';
            break;
          case '52high':
            endpoint = '/api/52week-high';
            break;
          case '52low':
            endpoint = '/api/52week-low';
            break;
          case 'trending':
            endpoint = '/api/trending-stocks';
            break;
        }

        const response = await axios.get(endpoint);
        const responseData = response.data || [];
        setData(Array.isArray(responseData) ? responseData : []);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error(`Error fetching ${activeTab} data:`, err);
        setError(`Failed to fetch ${activeTab} data`);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [activeTab]);

  const renderStockCard = (stock: StockData) => {
    const isPositive = stock.changePercent >= 0;
    const colorClass = isPositive ? 'text-emerald-400' : 'text-rose-400';
    const bgClass = isPositive ? 'bg-emerald-500/5' : 'bg-rose-500/5';

    return (
      <div className={`group relative overflow-hidden rounded-xl border border-white/5 ${bgClass} p-4 hover:bg-white/5 transition-all duration-300`}>
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-[15px] font-semibold text-white/90">
                  {stock.name || stock.symbol.replace('.NS', '')}
              </h4>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">
                  {stock.symbol.replace('.NS', '')}
              </span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
                ₹{typeof stock.price === 'number' ? stock.price.toLocaleString() : '--'}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`${colorClass} text-base font-semibold flex items-center gap-1`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {typeof stock.changePercent === 'number' 
                  ? `${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%`
                  : '--'}
            </div>
              {stock.volume && (
              <div className="text-[11px] text-white/40 font-medium">
                VOL {(stock.volume / 1000).toFixed(0)}K
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabButton = (type: MoverType, label: string, icon: React.ReactNode) => {
    const isActive = activeTab === type;
    const baseClasses = "flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out";
    const activeClasses = {
      gainers: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      losers: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      "52high": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      "52low": "bg-orange-500/10 text-orange-400 border border-orange-500/20",
      trending: "bg-purple-500/10 text-purple-400 border border-purple-500/20"
    };
    const inactiveClasses = "text-white/50 border border-white/5 hover:border-white/10";

    return (
      <button
        className={`${baseClasses} ${isActive ? activeClasses[type] : inactiveClasses}`}
        onClick={() => setActiveTab(type)}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white tracking-tight">Market Movers</h3>
          <div className="h-px w-24 bg-gradient-to-r from-accent-primary/50 to-transparent" />
        </div>
          <div className="flex items-center text-xs text-white/40">
            <Clock className="w-3 h-3 mr-1" />
            Last updated: {lastUpdated}
        </div>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
        {renderTabButton('gainers', 'Top Gainers', <TrendingUp className="w-4 h-4" />)}
        {renderTabButton('losers', 'Top Losers', <TrendingDown className="w-4 h-4" />)}
        {renderTabButton('52high', '52W High', <Activity className="w-4 h-4" />)}
        {renderTabButton('52low', '52W Low', <Activity className="w-4 h-4" />)}
        {renderTabButton('trending', 'Trending', <TrendingUp className="w-4 h-4" />)}
      </div>

      <div className="overflow-y-auto max-h-[600px] pr-2 -mr-2 custom-scrollbar">
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[88px] bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-rose-400 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              {error}
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-white/60 p-4 rounded-xl bg-white/5 border border-white/10">
            No data available
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((stock, index) => (
              <div key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                {renderStockCard(stock)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketMovers; 