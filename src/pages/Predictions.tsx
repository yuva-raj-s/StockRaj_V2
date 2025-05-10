import React, { useState } from 'react';
import { SearchBar } from '../components/Search/SearchBar';
import { Card } from '../components/ui/Card';
import { TechnicalIndicators } from '../components/Analysis/TechnicalIndicators';
import { PredictionCard } from '../components/Analysis/PredictionCard';
import StockChart from '../components/Charts/StockChart';
import { AlertTriangle } from 'lucide-react';

const mockData = {
  stockData: {
    symbol: 'RELIANCE',
    price: 2456.75,
    change: 45.80,
    changePercent: 1.89,
  },
  prediction: {
    probability: 78,
    targetPrice: 2598.45,
    timeframe: '7 Days',
    confidence: 85
  }
};

export const Predictions: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState('RELIANCE');

  const handleSearch = (query: string) => {
    setSelectedStock(query);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-center">
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            AI Analysis for {selectedStock}
          </h2>
          <div className="flex items-center text-yellow-400">
            <AlertTriangle className="w-5 h-4 mr-2" />
            <span className="text-sm">High Confidence Signals</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <StockChart symbol={selectedStock} data={mockData.stockData} />
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TechnicalIndicators />
          <PredictionCard prediction={mockData.prediction} />
        </div>
      </div>
    </div>
  );
};