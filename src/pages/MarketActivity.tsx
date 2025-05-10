import React, { useState } from 'react';
import { MarketPulse } from '../components/MarketOverview/MarketPulse';
import { SectorPerformanceChart } from '../components/MarketOverview/SectorPerformanceChart';
import { SectorIndices } from '../components/MarketOverview/SectorIndices';
import { SectorTrends } from '../components/MarketOverview/SectorTrends';
import { MarketMovers } from '../components/MarketOverview/MarketMovers';
import VolatilityMeter from '../components/MarketOverview/VolatilityMeter';
import { Activity, RefreshCw, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

export const MarketActivity: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { marketIndices } = useData();

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* Market Pulse */}
            <div className="glass p-6 rounded-xl mb-6">
              <h2 className="text-xl font-bold text-white mb-6">Market Pulse</h2>
              <MarketPulse data={{
                'NIFTY 50': marketIndices['NIFTY 50'],
                'SENSEX': marketIndices['SENSEX'],
                'NIFTY BANK': marketIndices['NIFTY BANK']
              }} />
            </div>

            {/* Broad Market Indices */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
              <div className="absolute -right-24 -top-24 w-48 h-48 bg-accent-primary/10 blur-3xl rounded-full" />
              <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-accent-primary/5 blur-3xl rounded-full" />
              
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">Broad Market Indices</h2>
                    <div className="h-px w-24 bg-gradient-to-r from-accent-primary/50 to-transparent" />
                  </div>
                  <div className="flex items-center text-xs text-white/40">
                    <Clock className="w-3 h-3 mr-1" />
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(marketIndices).map(([name, data]) => (
                    <div 
                      key={name} 
                      className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white/60">{name}</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            data.change_percent >= 0 ? 'bg-emerald-400' : 'bg-rose-400'
                          }`} />
                        </div>
                        <div className="text-2xl font-bold text-white tracking-tight">
                      {data.price.toLocaleString()}
                    </div>
                        <div className={`text-sm font-medium flex items-center gap-1 mt-2 ${
                          data.change_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                      {data.change_percent >= 0 ? '+' : ''}{data.change_percent.toFixed(2)}%
                        </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>

            {/* Volatility Meter */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
              <div className="absolute -right-24 -top-24 w-48 h-48 bg-accent-primary/10 blur-3xl rounded-full" />
              <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-accent-primary/5 blur-3xl rounded-full" />
              
              <div className="relative z-10 p-6">
              <VolatilityMeter />
              </div>
            </div>

            {/* Market Movers */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
              <div className="absolute -right-24 -top-24 w-48 h-48 bg-accent-primary/10 blur-3xl rounded-full" />
              <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-accent-primary/5 blur-3xl rounded-full" />
              
              <div className="relative z-10 p-6">
              <MarketMovers />
              </div>
            </div>
          </>
        );
      case 'sectors':
        return (
          <>
            {/* Sector Performance */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
              <div className="absolute -right-24 -top-24 w-48 h-48 bg-accent-primary/10 blur-3xl rounded-full" />
              <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-accent-primary/5 blur-3xl rounded-full" />
              
              <div className="relative z-10 p-6">
              <SectorPerformanceChart />
              </div>
            </div>
            
            {/* Sector-specific Indices */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
              <div className="absolute -right-24 -top-24 w-48 h-48 bg-accent-primary/10 blur-3xl rounded-full" />
              <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-accent-primary/5 blur-3xl rounded-full" />
              
              <div className="relative z-10 p-6">
                <SectorIndices />
              </div>
            </div>
            
            {/* Sector Trends */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
              <div className="absolute -right-24 -top-24 w-48 h-48 bg-accent-primary/10 blur-3xl rounded-full" />
              <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-accent-primary/5 blur-3xl rounded-full" />
              
              <div className="relative z-10 p-6">
                <SectorTrends />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-6 space-y-6">
      {/* Header with tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-white">Market Activity</h1>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <button 
                    className="glass-button p-2" 
                    onClick={handleRefresh}
                    title="Refresh market data"
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh market data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-accent/20 text-accent shadow-neon-sm'
                  : 'text-gray-400 bg-white/5 hover:bg-white/10'
              }`}
              title="View market overview"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sectors')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'sectors'
                  ? 'bg-accent/20 text-accent shadow-neon-sm'
                  : 'text-gray-400 bg-white/5 hover:bg-white/10'
              }`}
              title="View sector performance"
            >
              Sectors
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {renderTabContent()}
    </div>
  );
};
