import React from 'react';
import { StockList } from '../components/StockList/StockList';
import { NewsSection } from '../components/News/NewsSection';
import { MarketPulse } from '../components/MarketOverview/MarketPulse';
import { StockMarquee } from '../components/MarketOverview/StockMarquee';
import { Bell, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Skeleton } from '../components/ui/Skeleton';
import { useMarketData } from '../hooks/useMarketData';

export const Dashboard: React.FC = () => {
  const {
    marqueeData,
    marketOverview,
    topStocks,
    news,
    loading,
    error,
    refresh
  } = useMarketData(30000); // Refresh every 30 seconds

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-6 space-y-6">
      {/* Marquee Section */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-primary/5" />
        <StockMarquee data={marqueeData} loading={loading} />
      </div>

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-accent-primary/50 to-transparent rounded-full" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Market Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="relative overflow-hidden p-2.5 rounded-xl border border-white/10 hover:border-accent-primary/50 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                  onClick={refresh}
                  aria-label="Refresh data"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <RefreshCw className={`w-5 h-5 relative z-10 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="relative overflow-hidden p-2.5 rounded-xl border border-white/10 hover:border-accent-primary/50 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                  aria-label="View notifications"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Bell className="w-5 h-5 relative z-10" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {error && (
        <div className="relative overflow-hidden p-4 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
          <p className="relative z-10 text-red-400">{error}</p>
        </div>
      )}

      {/* Market Overview Section */}
      <div className="relative overflow-hidden glass p-8 rounded-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-xl font-bold text-white">Market Overview</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-accent-primary/50 to-transparent" />
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          ) : (
            <MarketPulse data={marketOverview} />
          )}
        </div>
      </div>

      {/* Stock List Section */}
      <div className="relative overflow-hidden glass p-8 rounded-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
              <h2 className="text-xl font-bold text-white">Top Indian Stocks</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-accent-primary/50 to-transparent" />
          </div>
          
          {loading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <StockList data={topStocks} />
          )}
        </div>
      </div>

      {/* News Section */}
      <div className="relative overflow-hidden glass p-8 rounded-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
        <div className="relative z-10">
          <NewsSection data={news} loading={loading} />
        </div>
      </div>
    </div>
  );
};