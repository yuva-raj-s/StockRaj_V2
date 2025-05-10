import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

export interface HistoricalData {
  timestamp: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

interface TechnicalIndicatorsProps {
  historicalData: HistoricalData | null;
  technicalIndicators: {
    rsi: number;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
    };
  } | null;
}

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({
  historicalData,
  technicalIndicators
}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [historicalData, technicalIndicators]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!technicalIndicators) {
    return (
      <div className="text-gray-400 text-sm">
        No technical indicators available
      </div>
    );
  }

  const { rsi, macd } = technicalIndicators;

  // RSI interpretation
  const getRSIInterpretation = (value: number) => {
    if (value >= 70) return { text: 'Overbought', color: 'text-red-400' };
    if (value <= 30) return { text: 'Oversold', color: 'text-green-400' };
    return { text: 'Neutral', color: 'text-gray-400' };
  };

  // MACD interpretation
  const getMACDInterpretation = (macd: number, signal: number) => {
    if (macd > signal) return { text: 'Bullish', color: 'text-green-400' };
    if (macd < signal) return { text: 'Bearish', color: 'text-red-400' };
    return { text: 'Neutral', color: 'text-gray-400' };
  };

  const rsiInterpretation = getRSIInterpretation(rsi);
  const macdInterpretation = getMACDInterpretation(macd.macd, macd.signal);

  return (
    <div className="space-y-6">
      {/* RSI Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">RSI (14)</span>
          <span className={`text-sm font-medium ${rsiInterpretation.color}`}>
            {rsiInterpretation.text}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              rsi >= 70 ? 'bg-red-400' : rsi <= 30 ? 'bg-green-400' : 'bg-gray-400'
            }`}
            style={{ width: `${Math.min(Math.max(rsi, 0), 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
        <div className="text-sm text-white">{rsi.toFixed(2)}</div>
      </div>

      {/* MACD Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">MACD (12,26,9)</span>
          <span className={`text-sm font-medium ${macdInterpretation.color}`}>
            {macdInterpretation.text}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">MACD Line</span>
            <span className="text-white">{macd.macd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Signal Line</span>
            <span className="text-white">{macd.signal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Histogram</span>
            <span className={`${macd.histogram >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {macd.histogram.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};