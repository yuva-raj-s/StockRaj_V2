import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SectorBarProps {
  name: string;
  performance: number;
  marketCap: string;
  maxPerformance: number;
}

export const SectorBar: React.FC<SectorBarProps> = ({
  name,
  performance,
  marketCap,
  maxPerformance
}) => {
  const isPositive = performance >= 0;
  const barWidth = `${(Math.abs(performance) / maxPerformance) * 100}%`;
  
  return (
    <div className="relative group transition-all duration-200 hover:bg-white/5 p-2 rounded-lg cursor-pointer">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium">{name}</span>
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">{marketCap}</span>
          <div className={`flex items-center ${
            isPositive ? 'text-success' : 'text-danger'
          } font-semibold`}>
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-1" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-1" />
            )}
            <span>{Math.abs(performance).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      <div className="h-2 bg-primary/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isPositive ? 'bg-success' : 'bg-danger'
          } relative overflow-hidden group-hover:brightness-110`}
          style={{
            width: barWidth,
            marginLeft: !isPositive ? 'auto' : 0,
          }}
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full transform -translate-x-full group-hover:animate-shimmer"></div>
        </div>
      </div>
      <div className="absolute left-0 top-0 w-1 h-full rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ 
        backgroundColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        display: isPositive ? 'block' : 'none'
      }}></div>
    </div>
  );
};