import React from 'react';
import { BarChart2, LineChart, CandlestickChart } from 'lucide-react';

interface ChartSelectorProps {
  onSelect: (type: string) => void;
  selected: string;
}

export const ChartSelector: React.FC<ChartSelectorProps> = ({ onSelect, selected }) => {
  const chartTypes = [
    { id: 'line', name: 'Line', icon: <LineChart className="w-4 h-4" /> },
    { id: 'candle', name: 'Candlestick', icon: <CandlestickChart className="w-4 h-4" /> },
    { id: 'bar', name: 'Bar', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex p-1 bg-white/5 rounded-lg">
      {chartTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
            selected === type.id 
              ? 'selected-glow' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title={`Switch to ${type.name} chart`}
        >
          {type.icon}
          <span className="text-sm font-medium">{type.name}</span>
        </button>
      ))}
    </div>
  );
};