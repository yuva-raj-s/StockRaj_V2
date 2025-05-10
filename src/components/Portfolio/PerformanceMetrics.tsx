import React from 'react';
import { PieChart, TrendingUp } from 'lucide-react';

const metrics = [
  { label: 'Total Return', value: '+24.5%', type: 'success' },
  { label: "Today's P/L", value: '-1.2%', type: 'danger' },
  { label: 'Beta', value: '1.15', type: 'info' },
  { label: 'Sharpe Ratio', value: '1.8', type: 'info' },
];

export const PerformanceMetrics: React.FC = () => {
  return (
    <>
      <h3 className="text-lg font-semibold text-white flex items-center mb-4">
        <TrendingUp className="w-5 h-5 mr-2 text-accent" />
        Performance Metrics
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass p-4 rounded-lg hover:shadow-neon-sm transition-all duration-300">
            <div className="text-sm text-text-secondary">{metric.label}</div>
            <div className={`text-xl font-bold ${
              metric.type === 'success' ? 'text-success' :
              metric.type === 'danger' ? 'text-danger' :
              'text-info'
            }`}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};