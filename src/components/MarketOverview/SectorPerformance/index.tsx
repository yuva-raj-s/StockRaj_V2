import React from 'react';
import { ArrowUp, ArrowDown, TrendingUp, ArrowUpRight } from 'lucide-react';
import { sectorData } from './data';

export const SectorPerformanceChart: React.FC = () => {
  const maxPerformance = Math.max(...sectorData.map(d => Math.abs(d.performance)));
  const sortedSectors = [...sectorData].sort((a, b) => b.performance - a.performance);
  
  // Calculate overall market trend
  const overallPerformance = sectorData.reduce((sum, sector) => sum + sector.performance, 0) / sectorData.length;
  const isPositiveTrend = overallPerformance >= 0;

  return (
    <div className="space-y-6">
      {/* Overall Performance Badge */}
      <div className="flex justify-start">
        <div className={`flex items-center justify-center w-28 h-28 rounded-full ${isPositiveTrend ? 'bg-success/15 border border-success/20' : 'bg-danger/15 border border-danger/20'}`}>
          <div className="text-center">
            <span className={`text-3xl font-bold ${isPositiveTrend ? 'text-success' : 'text-danger'}`}>
              {overallPerformance.toFixed(1)}%
            </span>
            <div className="flex justify-center mt-1">
              {isPositiveTrend ? <ArrowUp className="w-5 h-5 text-success" /> : <ArrowDown className="w-5 h-5 text-danger" />}
            </div>
          </div>
        </div>
      </div>
      
      {/* Column Headers */}
      <div className="flex justify-between py-3 text-sm text-gray-400 border-b border-white/10">
        <span className="font-medium">Sector</span>
        <div className="flex space-x-24">
          <span className="font-medium text-right w-24">Market Cap</span>
          <span className="font-medium w-20 text-right">Change</span>
        </div>
      </div>
      
      {/* Sector Bars with Scrollable Area */}
      <div 
        className="grid grid-cols-1 gap-y-6 max-h-[350px] pr-4 overflow-y-auto scrollbar-thin scrollbar-thumb-accent-primary/30 scrollbar-track-primary-light"
        style={{ scrollbarWidth: 'thin' }}
      >
        {sortedSectors.map((sector) => (
          <div key={sector.name} className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white text-lg font-semibold">{sector.name}</span>
              <div className="flex items-center space-x-24">
                <span className="text-gray-300 w-24 text-right">{sector.marketCap}</span>
                <div className={`flex items-center ${sector.performance >= 0 ? 'text-success' : 'text-danger'} w-20 justify-end`}>
                  {sector.performance >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  <span className="font-bold">{Math.abs(sector.performance).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="h-2 bg-primary-light/50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${sector.performance >= 0 ? 'bg-success' : 'bg-danger'}`}
                style={{
                  width: `${(Math.abs(sector.performance) / maxPerformance) * 100}%`,
                  boxShadow: sector.performance >= 0 
                    ? '0 0 10px rgba(52, 211, 153, 0.4)' 
                    : '0 0 10px rgba(239, 68, 68, 0.4)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Scrollbar visual indicator */}
      <div className="relative h-1 w-full bg-primary-light/30 rounded-full overflow-hidden">
        <div className="absolute right-0 w-10 h-full bg-accent-primary/30 rounded-full"></div>
      </div>
      
      {/* Footer */}
      <div className="py-3 border-t border-white/10 flex justify-between items-center">
        <div className="flex items-center text-gray-400">
          <TrendingUp className="w-4 h-4 mr-2" />
          <span className="text-sm">Best: <span className="text-success font-medium">{sortedSectors[0].name} (+{sortedSectors[0].performance.toFixed(1)}%)</span></span>
        </div>
        <div className="text-gray-400 text-sm">
          <span>Updated: Today, 3:15 PM</span>
        </div>
      </div>
    </div>
  );
};