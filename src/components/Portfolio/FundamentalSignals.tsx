import React, { useEffect, useState } from 'react';

interface FundamentalSignalsProps {
  symbol: string;
}

interface FundamentalData {
  marketCap: number;
  trailingPE: number;
  forwardPE: number;
  dividendYield: number;
  beta: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyDayAverage: number;
  twoHundredDayAverage: number;
  volume: number;
  averageVolume: number;
  priceToBook: number;
  priceToSales: number;
  enterpriseValue: number;
  profitMargins: number;
  operatingMargins: number;
  returnOnEquity: number;
  returnOnAssets: number;
  revenueGrowth: number;
  earningsGrowth: number;
  earningsQuarterlyGrowth: number;
  earningsAnnualGrowth: number;
  earningsAnnualGrowthRate: number;
  earningsQuarterlyGrowthRate: number;
}

const FundamentalSignals: React.FC<FundamentalSignalsProps> = ({ symbol }) => {
  const [data, setData] = useState<FundamentalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3001/api/portfolio/fundamental/${symbol}`);
        if (!response.ok) {
          throw new Error('Failed to fetch fundamental data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return <div className="text-center py-4">Loading fundamental signals...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (!data) {
    return <div className="text-center py-4">No fundamental data available</div>;
  }

  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Valuation Metrics */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Valuation Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Market Cap:</span>
              <span>{formatNumber(data.marketCap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">P/E Ratio:</span>
              <span>{formatNumber(data.trailingPE)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Forward P/E:</span>
              <span>{formatNumber(data.forwardPE)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">P/B Ratio:</span>
              <span>{formatNumber(data.priceToBook)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">P/S Ratio:</span>
              <span>{formatNumber(data.priceToSales)}</span>
            </div>
          </div>
        </div>

        {/* Growth & Margins */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Growth & Margins</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Profit Margin:</span>
              <span>{formatPercentage(data.profitMargins)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Operating Margin:</span>
              <span>{formatPercentage(data.operatingMargins)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ROE:</span>
              <span>{formatPercentage(data.returnOnEquity)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ROA:</span>
              <span>{formatPercentage(data.returnOnAssets)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Revenue Growth:</span>
              <span>{formatPercentage(data.revenueGrowth)}</span>
            </div>
          </div>
        </div>

        {/* Price Levels */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Price Levels</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">52 Week High:</span>
              <span>{formatNumber(data.fiftyTwoWeekHigh)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">52 Week Low:</span>
              <span>{formatNumber(data.fiftyTwoWeekLow)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">50 Day Avg:</span>
              <span>{formatNumber(data.fiftyDayAverage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">200 Day Avg:</span>
              <span>{formatNumber(data.twoHundredDayAverage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Beta:</span>
              <span>{formatNumber(data.beta)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundamentalSignals;