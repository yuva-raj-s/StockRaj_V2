import { useState, useEffect } from 'react';
import { getMarqueeData, getMarketOverview, getTopIndianStocks, getFinancialNews } from '../services/marketData';
import type { StockData, MarketData, NewsItem } from '../services/marketData';

export const useMarketData = (refreshInterval = 30000) => {
  const [marqueeData, setMarqueeData] = useState<StockData[]>([]);
  const [marketOverview, setMarketOverview] = useState<Record<string, MarketData>>({});
  const [topStocks, setTopStocks] = useState<StockData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [marquee, overview, stocks, newsData] = await Promise.all([
        getMarqueeData(),
        getMarketOverview(),
        getTopIndianStocks(),
        getFinancialNews()
      ]);

      setMarqueeData(marquee);
      setMarketOverview(overview);
      setTopStocks(stocks);
      setNews(newsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      console.error('Error fetching market data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    marqueeData,
    marketOverview,
    topStocks,
    news,
    loading,
    error,
    refresh: fetchData
  };
}; 