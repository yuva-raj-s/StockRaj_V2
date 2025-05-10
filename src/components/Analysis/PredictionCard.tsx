import React from 'react';
import { Brain, TrendingUp, BarChart } from 'lucide-react';

interface PredictionData {
  probability: number;
  targetPrice: number;
  timeframe: string;
  confidence: number;
}

interface PredictionCardProps {
  prediction: PredictionData;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction }) => {
  return (
    <div className="glass p-4 rounded-xl">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-accent-primary" />
        <h3 className="text-lg font-semibold text-white">AI Prediction</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-gray-400">Target Price</div>
          <div className="text-xl font-bold text-white">₹{prediction.targetPrice.toFixed(2)}</div>
        </div>

        <div className="glass p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400">Probability</div>
            <div className="flex items-center text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              {prediction.probability}%
            </div>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400"
              style={{ width: `${prediction.probability}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-2 rounded-lg text-center">
            <div className="text-gray-400 text-sm mb-1">Timeframe</div>
            <div className="text-white">{prediction.timeframe}</div>
          </div>
          <div className="glass p-2 rounded-lg text-center">
            <div className="text-gray-400 text-sm mb-1">Confidence</div>
            <div className="text-accent-primary">{prediction.confidence}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};