import axios from 'axios';

interface MarketIndexData {
  price: number;
  change_percent: number;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
}

interface MarketIndices {
  'NIFTY 50': MarketIndexData;
  'SENSEX': MarketIndexData;
  'BANK NIFTY': MarketIndexData;
}

export const fetchMarketIndices = async (): Promise<MarketIndices> => {
  try {
    const response = await axios.get('http://localhost:3001/api/market-indices');
    return response.data;
  } catch (error) {
    console.error('Error fetching market indices:', error);
    // Return mock data in case of error
    return {
      'NIFTY 50': {
        price: 0,
        change_percent: 0,
        timestamp: 0,
        open: 0,
        high: 0,
        low: 0,
        volume: 0,
        previousClose: 0
      },
      'SENSEX': {
        price: 0,
        change_percent: 0,
        timestamp: 0,
        open: 0,
        high: 0,
        low: 0,
        volume: 0,
        previousClose: 0
      },
      'BANK NIFTY': {
        price: 0,
        change_percent: 0,
        timestamp: 0,
        open: 0,
        high: 0,
        low: 0,
        volume: 0,
        previousClose: 0
      }
    };
  }
};

export const fetchHistoricalData = async (symbol: string, interval: string = '1d', range: string = '1mo') => {
  try {
    // Ensure the symbol is properly encoded
    const encodedSymbol = encodeURIComponent(symbol);
    const response = await axios.get(
      `http://localhost:3001/api/market-indices/historical/${encodedSymbol}?interval=${interval}&range=${range}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
}; 