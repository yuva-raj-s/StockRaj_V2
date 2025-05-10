import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TechnicalIndicators {
    rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    price: number;
  };
}

interface TechnicalSignalsProps {
  symbol?: string;
  priceData?: number[];
}

const calculateRSI = (prices: number[], period = 14): number => {
  if (prices.length < period + 1) return 0;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < period + 1; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / (avgLoss || 1); // Prevent division by zero
  return 100 - (100 / (1 + rs));
};

const calculateEMA = (prices: number[], period: number): number => {
  const multiplier = 2 / (period + 1);
  let ema = prices[0];

  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
};

const calculateMACD = (prices: number[]): { macd: number; signal: number; histogram: number } => {
  if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  const signal = calculateEMA([macd], 9);
  const histogram = macd - signal;

  return { macd, signal, histogram };
};

const calculateBollingerBands = (prices: number[], period = 20): { upper: number; middle: number; lower: number } => {
  if (prices.length < period) return { upper: 0, middle: 0, lower: 0 };

  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  const sma = sum / period;
  
  const squaredDifferences = prices.slice(-period).map(price => Math.pow(price - sma, 2));
  const variance = squaredDifferences.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(variance);
  
  const upper = sma + (2 * stdDev);
  const lower = sma - (2 * stdDev);

  return { upper, middle: sma, lower };
  };

const getSignalStrength = (value: number, thresholds: { low: number; high: number }): number => {
  if (value <= thresholds.low) return 0;
  if (value >= thresholds.high) return 100;
  return ((value - thresholds.low) / (thresholds.high - thresholds.low)) * 100;
};

const getSignalStatus = (value: number, thresholds: { low: number; high: number }): 'OVERSOLD' | 'OVERBOUGHT' | 'NEUTRAL' => {
  if (value <= thresholds.low) return 'OVERSOLD';
  if (value >= thresholds.high) return 'OVERBOUGHT';
  return 'NEUTRAL';
};

export const TechnicalSignals: React.FC<TechnicalSignalsProps> = ({ priceData = [] }) => {
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    rsi: 0,
    macd: { macd: 0, signal: 0, histogram: 0 },
    bollingerBands: { upper: 0, middle: 0, lower: 0, price: 0 }
  });

  useEffect(() => {
    if (priceData.length > 0) {
      const rsi = calculateRSI(priceData);
      const macd = calculateMACD(priceData);
      const bollingerBands = calculateBollingerBands(priceData);
      
      setIndicators({
        rsi,
        macd,
        bollingerBands: {
          ...bollingerBands,
          price: priceData[priceData.length - 1]
        }
      });
    }
  }, [priceData]);

  const rsiStrength = getSignalStrength(indicators.rsi, { low: 30, high: 70 });
  const rsiStatus = getSignalStatus(indicators.rsi, { low: 30, high: 70 });

  const macdStatus = indicators.macd.histogram > 0 ? 'BULLISH' : indicators.macd.histogram < 0 ? 'BEARISH' : 'NEUTRAL';
  const macdStrength = Math.abs(indicators.macd.histogram) * 100;

  const bollingerPosition = indicators.bollingerBands.price > indicators.bollingerBands.upper 
    ? 'ABOVE_UPPER' 
    : indicators.bollingerBands.price < indicators.bollingerBands.lower 
      ? 'BELOW_LOWER' 
      : 'WITHIN_BANDS';
  const bollingerStatus = bollingerPosition === 'ABOVE_UPPER' ? 'OVERBOUGHT' : 
                         bollingerPosition === 'BELOW_LOWER' ? 'OVERSOLD' : 'NEUTRAL';
  const bollingerStrength = bollingerPosition === 'WITHIN_BANDS' ? 0 : 100;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Technical Signals</h3>
      <p className="text-sm text-gray-400">Key technical indicators and patterns</p>

      {/* RSI Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">RSI</h4>
          <span className="text-xs text-gray-400">Relative Strength Index</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {rsiStatus === 'OVERSOLD' && <TrendingDown className="w-4 h-4 text-red-400" />}
            {rsiStatus === 'OVERBOUGHT' && <TrendingUp className="w-4 h-4 text-green-400" />}
            {rsiStatus === 'NEUTRAL' && <Minus className="w-4 h-4 text-yellow-400" />}
            <span className={`text-sm ${
              rsiStatus === 'OVERSOLD' ? 'text-red-400' :
              rsiStatus === 'OVERBOUGHT' ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              {rsiStatus === 'OVERSOLD' ? 'Oversold conditions' :
               rsiStatus === 'OVERBOUGHT' ? 'Overbought conditions' :
               'Neutral conditions'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{rsiStatus}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${rsiStrength}%`,
                  backgroundColor: rsiStatus === 'OVERSOLD' ? '#f87171' :
                                rsiStatus === 'OVERBOUGHT' ? '#4ade80' :
                                '#facc15'
                }}
              />
            </div>
            <span className="text-sm text-gray-400">{Math.round(rsiStrength)}%</span>
          </div>
        </div>
      </div>

      {/* MACD Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">MACD</h4>
          <span className="text-xs text-gray-400">Moving Average Convergence Divergence</span>
        </div>
        <div className="space-y-1">
                <div className="flex items-center gap-2">
            {macdStatus === 'BULLISH' && <TrendingUp className="w-4 h-4 text-green-400" />}
            {macdStatus === 'BEARISH' && <TrendingDown className="w-4 h-4 text-red-400" />}
            {macdStatus === 'NEUTRAL' && <Minus className="w-4 h-4 text-yellow-400" />}
            <span className={`text-sm ${
              macdStatus === 'BULLISH' ? 'text-green-400' :
              macdStatus === 'BEARISH' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {macdStatus === 'BULLISH' ? 'Bullish trend' :
               macdStatus === 'BEARISH' ? 'Bearish trend' :
               'Neutral trend'}
                  </span>
                </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{macdStatus}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${macdStrength}%`,
                  backgroundColor: macdStatus === 'BULLISH' ? '#4ade80' :
                                macdStatus === 'BEARISH' ? '#f87171' :
                                '#facc15'
                }}
              />
            </div>
            <span className="text-sm text-gray-400">{Math.round(macdStrength)}%</span>
                  </div>
                </div>
              </div>

      {/* Bollinger Bands Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">Bollinger</h4>
          <span className="text-xs text-gray-400">Bollinger Bands Position</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {bollingerStatus === 'OVERSOLD' && <TrendingDown className="w-4 h-4 text-red-400" />}
            {bollingerStatus === 'OVERBOUGHT' && <TrendingUp className="w-4 h-4 text-green-400" />}
            {bollingerStatus === 'NEUTRAL' && <Minus className="w-4 h-4 text-yellow-400" />}
            <span className={`text-sm ${
              bollingerStatus === 'OVERSOLD' ? 'text-red-400' :
              bollingerStatus === 'OVERBOUGHT' ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              {bollingerStatus === 'OVERSOLD' ? 'Price below lower band' :
               bollingerStatus === 'OVERBOUGHT' ? 'Price above upper band' :
               'Price within bands'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{bollingerStatus}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${bollingerStrength}%`,
                  backgroundColor: bollingerStatus === 'OVERSOLD' ? '#f87171' :
                                bollingerStatus === 'OVERBOUGHT' ? '#4ade80' :
                                '#facc15'
                }}
              />
            </div>
            <span className="text-sm text-gray-400">{Math.round(bollingerStrength)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};