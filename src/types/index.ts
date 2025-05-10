export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface SentimentData {
  score: number;
  sources: {
    news: number;
    social: number;
    forums: number;
  };
  label: 'Strong Sell' | 'Sell' | 'Neutral' | 'Buy' | 'Strong Buy';
}

export interface UserSettings {
  chartTimeframe: 'daily' | 'weekly' | 'monthly';
  indicators: {
    movingAverages: boolean;
    rsi: boolean;
    bollingerBands: boolean;
  };
  notifications: {
    signals: boolean;
    sentiment: boolean;
  };
}