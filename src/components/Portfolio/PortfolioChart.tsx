import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceData {
  date: string;
  value: number;
}

interface PortfolioChartProps {
  performanceData: PerformanceData[];
  timeframe: string;
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ performanceData = [], timeframe }) => {
  const filteredData = useMemo(() => {
    if (!Array.isArray(performanceData) || performanceData.length === 0) {
      console.warn('No performance data available');
      return [];
    }

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeframe) {
      case '1W':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return performanceData;
    }

    return performanceData.filter(data => {
      const dataDate = new Date(data.date);
      return dataDate >= cutoffDate && dataDate <= now;
    });
  }, [performanceData, timeframe]);

  // If no data is available, show a message
  if (!filteredData.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No performance data available for the selected timeframe
      </div>
    );
  }

  const formatXAxis = (date: string) => {
    const d = new Date(date);
    switch (timeframe) {
      case '1W':
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      case '1M':
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      case '3M':
      case '6M':
        return d.toLocaleDateString('en-US', { month: 'short' });
      case '1Y':
        return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      default:
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  const formatTooltip = (value: number) => {
    return `₹${value.toLocaleString()}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={filteredData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00C896" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          stroke="#ffffff40"
          tick={{ fill: '#ffffff40' }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          stroke="#ffffff40"
          tick={{ fill: '#ffffff40' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a2634',
            border: '1px solid #ffffff20',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#ffffff' }}
          formatter={formatTooltip}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#00C896"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#00C896' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};