import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import axios from 'axios';

interface SectorData {
  name: string;
  price: number;
  change_percent: number;
}

interface ApiResponse {
  status: string;
  timestamp: number;
  data: {
    [key: string]: {
      price: number;
      change_percent: number;
    }
  }
}

export const SectorPerformanceChart: React.FC = () => {
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<ApiResponse>('/api/sector-performance');
        
        // Transform the data into the expected format
        const transformedData = Object.entries(response.data.data).map(([name, data]) => ({
          name,
          price: data.price,
          change_percent: data.change_percent
        }));

        setSectorData(transformedData);
      } catch (err) {
        setError('Failed to fetch sector data');
        console.error('Error fetching sector data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectorData();
  }, []);

  const maxPerformance = Math.max(...sectorData.map(d => Math.abs(d.change_percent)));

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-accent-primary" />
        <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Sector Performance
            </h2>
        <div className="h-px w-24 bg-gradient-to-r from-accent-primary/50 to-transparent" />
        </div>
        
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
        {sectorData.map((sector) => (
          <div 
            key={sector.name} 
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-2">
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

              <div className="flex justify-between items-center">
                <div className="text-lg font-bold font-mono text-white">
                  {sector.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>

                <div className="flex-1 mx-4 h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                      sector.change_percent >= 0 
                        ? 'bg-gradient-to-r from-emerald-500/40 to-emerald-400/60' 
                        : 'bg-gradient-to-r from-rose-500/40 to-rose-400/60'
                }`}
                style={{
                      width: `${(Math.abs(sector.change_percent) / maxPerformance) * 100}%`,
                      marginLeft: sector.change_percent < 0 ? 'auto' : 0,
                }}
              />
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};