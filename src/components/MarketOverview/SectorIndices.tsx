import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import axios from 'axios';

interface SectorIndex {
  name: string;
  price: number;
  change_percent: number;
  topGainers: Array<{
    symbol: string;
    name: string;
    price: number;
    change_percent: number;
  }>;
  topLosers: Array<{
    symbol: string;
    name: string;
    price: number;
    change_percent: number;
  }>;
}

interface ApiResponse {
  status: string;
  timestamp: number;
  data: {
    [key: string]: {
      price: number;
      change_percent: number;
      timestamp: number;
      topGainers: Array<{
        symbol: string;
        name: string;
        price: number;
        change_percent: number;
      }>;
      topLosers: Array<{
        symbol: string;
        name: string;
        price: number;
        change_percent: number;
      }>;
    }
  }
}

export const SectorIndices: React.FC = () => {
  const [sectorIndices, setSectorIndices] = useState<SectorIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectorIndices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<ApiResponse>('/api/sector-indices');
        
        // Transform the data into the expected format
        const transformedData = Object.entries(response.data.data).map(([name, data]) => ({
          name,
          price: data.price,
          change_percent: data.change_percent,
          topGainers: data.topGainers || [],
          topLosers: data.topLosers || []
        }));

        setSectorIndices(transformedData);
      } catch (err) {
        setError('Failed to fetch sector indices data');
        console.error('Error fetching sector indices:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectorIndices();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Sector-specific Indices
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-accent-primary/50 to-transparent" />
        </div>
        <div className="flex items-center gap-2 text-sm text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectorIndices.map((sector) => (
          <div 
            key={sector.name}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all duration-300"
          >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-white/80">{sector.name}</span>
                <div className={`text-sm font-medium flex items-center gap-1.5 ${
                  sector.change_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {sector.change_percent >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span className="font-mono">{sector.change_percent >= 0 ? '+' : ''}{sector.change_percent.toFixed(2)}%</span>
                </div>
              </div>
              
              <div className="text-lg font-bold font-mono text-white mb-4">
                {sector.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/40 mb-1.5">Top Gainer</div>
                  {sector.topGainers[0] && (
                    <div className="text-sm font-medium text-emerald-400">
                      {sector.topGainers[0].symbol}: {sector.topGainers[0].change_percent.toFixed(2)}%
                  </div>
                  )}
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/40 mb-1.5">Top Loser</div>
                  {sector.topLosers[0] && (
                    <div className="text-sm font-medium text-rose-400">
                      {sector.topLosers[0].symbol}: {sector.topLosers[0].change_percent.toFixed(2)}%
                  </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}; 