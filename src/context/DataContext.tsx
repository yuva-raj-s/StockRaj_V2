import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { fetchNews } from '../services/newsService';
import { fetchMarketIndices } from '../services/marketIndicesService';

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  date?: string;
  description?: string;
  imageUrl?: string;
  timestamp: number;
}

export interface StockData {
  symbol: string;
  currentPrice: number;
  changePercent: number;
  volume: number;
  isLoading: boolean;
  error?: string;
  lastUpdated?: string;
}

interface MarketIndexData {
  price: number;
  change_percent: number;
}

interface MarketIndices {
  'NIFTY 50': MarketIndexData;
  'SENSEX': MarketIndexData;
  'BANK NIFTY': MarketIndexData;
}

interface DataContextType {
  stocks: Record<string, StockData>;
  setStocks: (data: Record<string, StockData>) => void;
  refreshStocks: (symbols: string[]) => void;
  news: NewsItem[];
  setNews: (data: NewsItem[]) => void;
  marketIndices: MarketIndices;
  setMarketIndices: (data: MarketIndices) => void;
  refreshMarketIndices: () => Promise<void>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  refreshNews: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<Record<string, StockData>>({});
  const [news, setNews] = useState<NewsItem[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndices>({
    'NIFTY 50': { price: 0, change_percent: 0 },
    'SENSEX': { price: 0, change_percent: 0 },
    'BANK NIFTY': { price: 0, change_percent: 0 }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshNews = async () => {
    setLoading(true);
    try {
      const newsData = await fetchNews();
      setNews(newsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const refreshMarketIndices = async () => {
    setLoading(true);
    try {
      const indicesData = await fetchMarketIndices();
      setMarketIndices(indicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market indices');
    } finally {
      setLoading(false);
    }
  };

  const refreshStocks = async (symbols: string[]) => {
    setLoading(true);
    try {
      // TODO: Implement actual API call here
      const mockData: Record<string, StockData> = {};
      symbols.forEach(symbol => {
        mockData[symbol] = {
          symbol,
          currentPrice: Math.random() * 1000,
          changePercent: (Math.random() * 10) - 5,
          volume: Math.floor(Math.random() * 1000000)
        };
      });
      setStocks(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNews();
    refreshMarketIndices();
    // Refresh news every 10 minutes
    const newsInterval = setInterval(refreshNews, 10 * 60 * 1000);
    // Refresh market indices every minute
    const indicesInterval = setInterval(refreshMarketIndices, 60 * 1000);
    return () => {
      clearInterval(newsInterval);
      clearInterval(indicesInterval);
    };
  }, []);

  const value = {
    stocks,
    setStocks,
    refreshStocks,
    news,
    setNews,
    marketIndices,
    setMarketIndices,
    refreshMarketIndices,
    loading,
    setLoading,
    error,
    setError,
    refreshNews
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
} 