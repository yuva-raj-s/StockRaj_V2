import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Cache implementation
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache storage
const cache = new Map<string, CacheEntry<unknown>>();

// Top Indian stocks list
const TOP_INDIAN_STOCKS = [
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'ICICIBANK.NS',
  'INFY.NS',
  'HINDUNILVR.NS',
  'SBIN.NS',
  'BHARTIARTL.NS',
  'LT.NS',
  'ITC.NS',
  'BAJFINANCE.NS',
  'HCLTECH.NS',
  'AXISBANK.NS',
  'MARUTI.NS',
  'NTPC.NS'
];

export interface MarketData {
  price: number;
  change_percent: number;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  volume: number;
}

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
}

interface StockResponse {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  volume: number;
  timestamp: number;
  error?: string;
}

// Helper function to get cached data
const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
};

// Helper function to set cached data
const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Helper function to handle API errors
const handleApiError = <T>(error: unknown, fallbackData: T): T => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 429) {
      console.warn('Rate limit exceeded, using cached data if available');
      return fallbackData;
    }
    console.error('API Error:', axiosError.message);
  } else {
    console.error('Unknown Error:', error);
  }
  return fallbackData;
};

// Marquee data
export const getMarqueeData = async (): Promise<StockData[]> => {
  const cacheKey = 'marquee_data';
  const cachedData = getCachedData<StockData[]>(cacheKey);
  
  try {
    // Get data for top 5 stocks for marquee
    const symbols = TOP_INDIAN_STOCKS.slice(0, 5);
    const response = await axios.get<StockResponse[]>(`${API_BASE_URL}/stocks?symbols=${symbols.join(',')}`);
    
    const data = response.data.map((stock) => ({
      symbol: stock.symbol,
      name: stock.symbol.replace('.NS', ''),
      price: stock.price || 0,
      change_percent: stock.changePercent || 0,
      volume: stock.volume || 0
    }));
    
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    return handleApiError(error, cachedData || []);
  }
};

// Market overview (Nifty 50, Sensex, Nifty Bank)
export const getMarketOverview = async (): Promise<Record<string, MarketData>> => {
  const cacheKey = 'market_overview';
  const cachedData = getCachedData<Record<string, MarketData>>(cacheKey);
  
  try {
    const response = await axios.get(`${API_BASE_URL}/market-indices`);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, cachedData || {});
  }
};

// Top Indian stocks
export const getTopIndianStocks = async (): Promise<StockData[]> => {
  const cacheKey = 'top_indian_stocks';
  const cachedData = getCachedData<StockData[]>(cacheKey);
  
  try {
    const response = await axios.get<StockResponse[]>(`${API_BASE_URL}/stocks?symbols=${TOP_INDIAN_STOCKS.join(',')}`);
    
    const data = response.data.map((stock) => ({
      symbol: stock.symbol,
      name: stock.symbol.replace('.NS', ''),
      price: stock.price || 0,
      change_percent: stock.changePercent || 0,
      volume: stock.volume || 0
    }));

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    return handleApiError(error, cachedData || []);
  }
};

// Financial news
export const getFinancialNews = async (): Promise<NewsItem[]> => {
  const cacheKey = 'financial_news';
  const cachedData = getCachedData<NewsItem[]>(cacheKey);
  
  try {
    const response = await axios.get<NewsItem[]>(`${API_BASE_URL}/financial-news`);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, cachedData || []);
  }
}; 