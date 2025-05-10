import express, { RequestHandler } from 'express';
import axios from 'axios';
import cors from 'cors';

const router = express.Router();

// Enable CORS for all routes in this router
router.use(cors());

interface QueryParams {
  interval?: string;
  range?: string;
}

interface MarketData {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

interface MarketResponse {
  data: MarketData[];
  meta: {
    currency: string;
    symbol: string;
    exchangeName: string;
    instrumentType: string;
    firstTradeDate: number;
    regularMarketTime: number;
    gmtoffset: number;
    timezone: string;
    chartPreviousClose: number;
  };
}

interface RealTimeQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  open: number;
  bid?: number;
  ask?: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  averageVolume: number;
}

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
  };
  sma20: number;
  sma50: number;
  sma200: number;
}

interface MarketStatus {
  isOpen: boolean;
  nextOpenTime?: string;
  nextCloseTime?: string;
  currentTime: string;
  timezone: string;
}

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        currency: string;
        symbol: string;
        exchangeName: string;
        instrumentType: string;
        firstTradeDate: number;
        regularMarketTime: number;
        gmtoffset: number;
        timezone: string;
        chartPreviousClose: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
        adjclose?: Array<{
          adjclose: number[];
        }>;
      };
    }>;
    error?: unknown;
  };
}

type MarketDataHandler = RequestHandler<
  { symbol: string },
  MarketResponse | { message: string; error?: string },
  never,
  QueryParams
>;

const getHistoricalData: MarketDataHandler = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval, range } = req.query;

    // Fetch data from Yahoo Finance
    const response = await axios.get<YahooFinanceResponse>(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
        params: {
          interval,
          range,
          includePrePost: true,
          events: 'div,splits'
        }
      }
    );

    const yahooData = response.data;
    
    if (!yahooData.chart || !yahooData.chart.result || yahooData.chart.result.length === 0) {
      res.status(404).json({ message: 'No data found for the symbol' });
      return;
    }

    const result = yahooData.chart.result[0];
    const { timestamp, indicators } = result;
    const quote = indicators.quote[0];

    // Format data for our frontend
    const data = timestamp.map((time: number, index: number) => ({
      timestamp: time,
      date: new Date(time * 1000).toISOString(),
      open: quote.open[index],
      high: quote.high[index],
      low: quote.low[index],
      close: quote.close[index],
      volume: quote.volume[index],
      adjustedClose: indicators.adjclose ? indicators.adjclose[0].adjclose[index] : quote.close[index]
    }));

    res.json({
      data,
      meta: {
        currency: result.meta.currency,
        symbol: result.meta.symbol,
        exchangeName: result.meta.exchangeName,
        instrumentType: result.meta.instrumentType,
        firstTradeDate: result.meta.firstTradeDate,
        regularMarketTime: result.meta.regularMarketTime,
        gmtoffset: result.meta.gmtoffset,
        timezone: result.meta.timezone,
        chartPreviousClose: result.meta.chartPreviousClose
      }
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ 
      message: 'Failed to fetch market data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// New endpoint for real-time quotes
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`
    );

    const data = response.data.chart.result[0];
    const quote = data.indicators.quote[0];
    const meta = data.meta;

    const realTimeQuote: RealTimeQuote = {
      symbol: meta.symbol,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.chartPreviousClose,
      changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
      volume: meta.regularMarketVolume,
      dayHigh: Math.max(...quote.high),
      dayLow: Math.min(...quote.low),
      previousClose: meta.chartPreviousClose,
      open: quote.open[0],
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      averageVolume: meta.averageDailyVolume3Month
    };

    res.json(realTimeQuote);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch real-time quote',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// New endpoint for technical indicators
router.get('/indicators/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=6mo`
    );

    const data = response.data.chart.result[0];
    const quote = data.indicators.quote[0];
    const closes = quote.close;

    // Calculate RSI
    const rsi = calculateRSI(closes);

    // Calculate MACD
    const macd = calculateMACD(closes);

    // Calculate Bollinger Bands
    const bollingerBands = calculateBollingerBands(closes);

    // Calculate SMAs
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const sma200 = calculateSMA(closes, 200);

    const indicators: TechnicalIndicators = {
      rsi,
      macd,
      bollingerBands,
      sma20,
      sma50,
      sma200
    };

    res.json(indicators);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to calculate technical indicators',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// New endpoint for market status
router.get('/market-status', async (req, res) => {
  try {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(now.getTime() + istOffset);

    // Check if it's a weekday (0 = Sunday, 6 = Saturday)
    const isWeekday = istTime.getUTCDay() !== 0 && istTime.getUTCDay() !== 6;

    // Market hours: 9:15 AM to 3:30 PM IST
    const marketOpenTime = new Date(istTime);
    marketOpenTime.setUTCHours(3, 45, 0, 0); // 9:15 AM IST

    const marketCloseTime = new Date(istTime);
    marketCloseTime.setUTCHours(10, 0, 0, 0); // 3:30 PM IST

    const isOpen = isWeekday && 
      istTime >= marketOpenTime && 
      istTime <= marketCloseTime;

    const nextOpenTime = !isOpen ? 
      new Date(marketOpenTime.setDate(marketOpenTime.getDate() + (istTime.getUTCDay() === 6 ? 2 : 1))) : 
      undefined;

    const marketStatus: MarketStatus = {
      isOpen,
      nextOpenTime: nextOpenTime?.toISOString(),
      nextCloseTime: isOpen ? marketCloseTime.toISOString() : undefined,
      currentTime: istTime.toISOString(),
      timezone: 'IST'
    };

    res.json(marketStatus);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get market status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions for technical indicators
function calculateRSI(prices: number[], period = 14): number {
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
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  const signal = calculateEMA([macd], 9);
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

function calculateBollingerBands(prices: number[], period = 20): { upper: number; middle: number; lower: number } {
  const sma = calculateSMA(prices, period);
  const stdDev = calculateStandardDeviation(prices, period);
  const upper = sma + (2 * stdDev);
  const lower = sma - (2 * stdDev);

  return { upper, middle: sma, lower };
}

function calculateSMA(prices: number[], period: number): number {
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

function calculateEMA(prices: number[], period: number): number {
  const multiplier = 2 / (period + 1);
  let ema = prices[0];

  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

function calculateStandardDeviation(prices: number[], period: number): number {
  const sma = calculateSMA(prices, period);
  const squaredDifferences = prices.slice(-period).map(price => Math.pow(price - sma, 2));
  const variance = squaredDifferences.reduce((a, b) => a + b, 0) / period;
  return Math.sqrt(variance);
}

router.get('/historical/:symbol', getHistoricalData);

export default router; 