// Moving Average (Simple)
export function calculateMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const ma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    ma.push(sum / period);
  }
  return ma;
}

// Relative Strength Index (RSI)
export const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate RSI using smoothed averages
  for (let i = period + 1; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) {
      avgGain = (avgGain * (period - 1) + difference) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - difference) / period;
    }
  }

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

// MACD
export const calculateMACD = (prices: number[]): { macd: number; signal: number; histogram: number } => {
  const shortPeriod = 12;
  const longPeriod = 26;
  const signalPeriod = 9;

  // Calculate EMAs
  const shortEMA = calculateEMA(prices, shortPeriod);
  const longEMA = calculateEMA(prices, longPeriod);

  // Calculate MACD line
  const macdLine = shortEMA - longEMA;

  // Calculate Signal line (EMA of MACD line)
  const macdValues = prices.map((_, i) => {
    if (i < longPeriod) return 0;
    return calculateEMA(prices.slice(0, i + 1), shortPeriod) - calculateEMA(prices.slice(0, i + 1), longPeriod);
  });

  const signalLine = calculateEMA(macdValues, signalPeriod);

  // Calculate Histogram
  const histogram = macdLine - signalLine;

  return {
    macd: Number(macdLine.toFixed(2)),
    signal: Number(signalLine.toFixed(2)),
    histogram: Number(histogram.toFixed(2))
  };
};

// Bollinger Bands
export const calculateBollingerBands = (prices: number[], period: number = 20, multiplier: number = 2): { upper: number; middle: number; lower: number } => {
  if (prices.length < period) {
    return { upper: 0, middle: 0, lower: 0 };
  }

  // Calculate SMA (middle band)
  const sma = prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;

  // Calculate Standard Deviation
  const squaredDiffs = prices.slice(-period).map(price => Math.pow(price - sma, 2));
  const standardDeviation = Math.sqrt(squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period);

  // Calculate bands
  const upperBand = sma + (multiplier * standardDeviation);
  const lowerBand = sma - (multiplier * standardDeviation);

  return {
    upper: Number(upperBand.toFixed(2)),
    middle: Number(sma.toFixed(2)),
    lower: Number(lowerBand.toFixed(2))
  };
};

// Helper function to calculate EMA
const calculateEMA = (prices: number[], period: number): number => {
  const multiplier = 2 / (period + 1);
  let ema = prices[0];

  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}; 