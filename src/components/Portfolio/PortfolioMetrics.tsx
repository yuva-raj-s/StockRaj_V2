import React from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

interface PortfolioMetricsProps {
  totalValue: number;
  totalGain: number;
  metrics: {
    totalReturn: string;
    todayPL: string;
    beta: string;
    sharpeRatio: string;
  };
}

export const PortfolioMetrics: React.FC<PortfolioMetricsProps> = ({ totalValue, totalGain, metrics }) => {
  return (
    <>
      <h3 className="text-lg font-semibold text-white flex items-center mb-4">
        <TrendingUp className="w-5 h-5 mr-2 text-accent" />
        Portfolio Metrics
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass p-4 rounded-lg">
          <div className="text-text-secondary">Total Value</div>
          <div className="text-xl font-bold text-white">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="glass p-4 rounded-lg">
          <div className="text-text-secondary">Total Gain/Loss</div>
          <div className={`text-xl font-bold ${totalGain >= 0 ? 'text-success' : 'text-danger'}`}>
            ₹{totalGain.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="glass p-4 rounded-lg">
            <div className="text-sm text-text-secondary">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className={`text-lg font-bold ${
              value.startsWith('+') ? 'text-success' :
              value.startsWith('-') ? 'text-danger' :
              'text-info'
            }`}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};