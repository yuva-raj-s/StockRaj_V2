import React from 'react';
import { LineChart, ArrowUp, ArrowDown } from 'lucide-react';

interface StockChartProps {
  symbol: string;
  data: {
    price: number;
    change: number;
    changePercent: number;
  };
}

const StockChart: React.FC<StockChartProps> = ({ symbol, data }) => {
  const isPositive = data.change >= 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
          <div className="flex items-center mt-1">
            <span className="text-2xl font-bold">₹{data.price.toFixed(2)}</span>
            <span className={`ml-2 flex items-center ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(data.changePercent).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">1D</button>
          <button className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">1W</button>
          <button className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">1M</button>
        </div>
      </div>
      <div className="h-64 flex items-center justify-center text-gray-400">
        <LineChart className="w-8 h-8" />
        <span className="ml-2">Chart visualization will be integrated here</span>
      </div>
    </div>
  );
};

export default StockChart;