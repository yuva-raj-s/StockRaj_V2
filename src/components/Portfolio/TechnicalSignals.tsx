import React, { useEffect, useState } from 'react';

interface TechnicalSignalsProps {
  symbol: string;
}

interface TechnicalData {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
}

const TechnicalSignals: React.FC<TechnicalSignalsProps> = ({ symbol }) => {
  const [data, setData] = useState<TechnicalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3001/api/portfolio/technical/${symbol}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch technical data: ${response.statusText}`);
        }
        const result = await response.json();
        if (!result || !result.rsi || !result.macd) {
          throw new Error('Invalid technical data received from server');
        }
        setData(result);
      } catch (err) {
        console.error('Error fetching technical data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch technical data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return <div className="text-center py-4">Loading technical signals...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (!data) {
    return <div className="text-center py-4">No technical data available</div>;
  }

  return (
    <div className="bg-[#19232e] rounded-xl border border-[#222f3e] shadow-lg p-3 md:p-4 text-white min-w-[220px] max-w-[340px] mx-auto">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide text-accent">Technical Signals</span>
        {/* Optionally, add an icon here for style */}
      </div>
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">RSI (14)</span>
          <span className="ml-auto text-xs font-mono text-gray-300">{data.rsi.toFixed(2)}</span>
        </div>
        <div className="w-full h-2.5 bg-[#232f3e] rounded-full mt-1">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              data.rsi > 70 ? 'bg-red-500' : data.rsi < 30 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, data.rsi))}%` }}
          ></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">Signal</span>
          <span className={`text-sm font-semibold ${data.macd.signal > 0 ? 'text-green-400' : 'text-red-400'}`}>{data.macd.signal.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">Histogram</span>
          <span className={`text-sm font-semibold ${data.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>{data.macd.histogram.toFixed(2)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">Current</span>
          <span className="text-sm font-semibold">₹{data.currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">Change</span>
          <span className={`text-sm font-semibold ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{data.change >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSignals; 