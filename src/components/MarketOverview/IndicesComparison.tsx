import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { indiaIndices } from './data/marketData';

export const IndicesComparison: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Indices Comparison</h3>
        <div className="flex space-x-2">
          <span className="text-xs px-2 py-1 rounded-full bg-primary-light text-gray-300">1D</span>
          <span className="text-xs px-2 py-1 rounded-full text-gray-300 hover:bg-primary-light cursor-pointer">1W</span>
          <span className="text-xs px-2 py-1 rounded-full text-gray-300 hover:bg-primary-light cursor-pointer">1M</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {indiaIndices.map((index) => (
          <div 
            key={index.name}
            className="glass p-4 rounded-lg transition-all duration-300 hover-glow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-white group-hover:text-accent transition-colors">{index.name}</h4>
              <div className={`flex items-center ${index.change >= 0 ? 'text-success' : 'text-danger'}`}>
                {index.change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                <span className="font-bold">{Math.abs(index.change).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="text-2xl font-bold text-white mb-3">
              {index.value.toFixed(2)}
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Previous: {index.previousClose.toFixed(2)}</span>
              <span className={`${index.change >= 0 ? 'text-success' : 'text-danger'}`}>
                {index.change >= 0 ? '+' : ''}{(index.value - index.previousClose).toFixed(2)}
              </span>
            </div>

            {/* Mini Sparkline Chart (placeholder) */}
            <div className="h-10 mt-3 flex items-end">
              {Array.from({ length: 20 }).map((_, i) => {
                const height = 5 + Math.random() * 25;
                return (
                  <div 
                    key={i}
                    className={`w-1 mx-[1px] rounded-t-sm ${index.change >= 0 ? 'bg-success/40' : 'bg-danger/40'}`}
                    style={{ height: `${height}px` }}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 