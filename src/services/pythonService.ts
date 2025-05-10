import axios from 'axios';

interface MessageData {
  symbol?: string;
  currentPrice?: number;
  changePercent?: number;
  volume?: number;
  lastUpdated?: string;
  nifty?: {
    current: number;
    changePct: number;
  };
  sensex?: {
    current: number;
    changePct: number;
  };
  marketStatus?: string;
  company_name?: string;
  current_price?: number;
  price_change?: number;
  price_change_pct?: number;
  pe_ratio?: number;
  market_cap?: number;
  recommendation?: string;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  sentiment_score?: number;
  positive?: number;
  negative?: number;
  neutral?: number;
  total_news?: number;
  recent_news?: Array<{
    title: string;
    sentiment: string;
    confidence: number;
    date: string;
  }>;
  stocks?: Array<{
    symbol: string;
    current_price: number;
    price_change: number;
    price_change_pct: number;
    volume: number;
    pe_ratio: number;
    market_cap: number;
  }>;
  sector_name?: string;
  industry_name?: string;
  top_stocks?: Array<{
    symbol: string;
    current_price: number;
    price_change: number;
    price_change_pct: number;
  }>;
}

interface PythonResponse {
  text: string;
  data?: MessageData;
  type: 'text' | 'analysis' | 'market' | 'error';
}

export class PythonService {
  private static instance: PythonService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = 'http://localhost:8000'; // FastAPI default port
  }

  public static getInstance(): PythonService {
    if (!PythonService.instance) {
      PythonService.instance = new PythonService();
    }
    return PythonService.instance;
  }

  // Helper: Format currency values
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  }

  // Helper: Format percentage values
  private formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  // Helper: Format large numbers
  private formatLargeNumber(value: number): string {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toString();
  }

  // Helper: Format stock details
  private formatStockDetails(data: MessageData): string {
    return `Stock Details for ${data.company_name || data.symbol}:
Current Price: ${this.formatCurrency(data.current_price || 0)}
Change: ${this.formatCurrency(data.price_change || 0)} (${this.formatPercent(data.price_change_pct || 0)})
52W High: ${this.formatCurrency(data.fifty_two_week_high || 0)}
52W Low: ${this.formatCurrency(data.fifty_two_week_low || 0)}
Volume: ${this.formatLargeNumber(data.volume || 0)}
P/E Ratio: ${data.pe_ratio?.toFixed(2) || 'N/A'}
Market Cap: ${this.formatCurrency(data.market_cap || 0)}`;
  }

  // Helper: Format market summary
  private formatMarketSummary(data: MessageData): string {
    return `Market Summary:
Nifty 50: ${this.formatCurrency(data.nifty?.current || 0)} (${this.formatPercent(data.nifty?.changePct || 0)})
Sensex: ${this.formatCurrency(data.sensex?.current || 0)} (${this.formatPercent(data.sensex?.changePct || 0)})
Status: ${data.marketStatus || 'Unknown'}`;
  }

  // Helper: Format sentiment analysis
  private formatSentiment(data: MessageData): string {
    let text = `Sentiment Analysis for ${data.symbol}:
Overall Score: ${data.sentiment_score?.toFixed(2) || 'N/A'}
Positive News: ${data.positive || 0}
Negative News: ${data.negative || 0}
Neutral News: ${data.neutral || 0}
Total News: ${data.total_news || 0}

Recent News:`;
    
    data.recent_news?.forEach((news) => {
      text += `\n- ${news.title} (${news.sentiment}, ${(news.confidence * 100).toFixed(1)}% confidence)`;
    });
    
    return text;
  }

  // Helper: Format portfolio/watchlist
  private formatStockList(data: MessageData, title: string): string {
    let text = `${title}:\n`;
    data.stocks?.forEach((stock) => {
      text += `\n${stock.symbol}:
  Price: ${this.formatCurrency(stock.current_price)}
  Change: ${this.formatCurrency(stock.price_change)} (${this.formatPercent(stock.price_change_pct)})
  Volume: ${this.formatLargeNumber(stock.volume)}
  P/E: ${stock.pe_ratio?.toFixed(2) || 'N/A'}
  Market Cap: ${this.formatCurrency(stock.market_cap)}`;
    });
    return text;
  }

  // Helper: Format sector/industry
  private formatSectorIndustry(data: MessageData, type: 'Sector' | 'Industry'): string {
    let text = `${type} Overview: ${data.sector_name || data.industry_name}\n\nTop Stocks:`;
    data.top_stocks?.forEach((stock) => {
      text += `\n${stock.symbol}:
  Price: ${this.formatCurrency(stock.current_price)}
  Change: ${this.formatCurrency(stock.price_change)} (${this.formatPercent(stock.price_change_pct)})`;
    });
    return text;
  }

  // Helper: Basic intent detection for routing
  private detectIntent(query: string): { intent: string, symbol?: string, sector?: string, industry?: string, symbols?: string[] } {
    const lower = query.toLowerCase();
    // Stock details
    const stockMatch = lower.match(/details for ([a-z0-9]+)/i) || lower.match(/stock info for ([a-z0-9]+)/i) || lower.match(/fundamentals for ([a-z0-9]+)/i);
    if (stockMatch) return { intent: 'stock', symbol: stockMatch[1].toUpperCase() };
    // Market summary
    if (lower.includes('market summary') || lower.includes('how is the market') || lower.includes('status of nifty') || lower.includes('status of sensex')) return { intent: 'market' };
    // Analysis
    const analysisMatch = lower.match(/analysis of ([a-z0-9]+)/i) || lower.match(/performing\?? ([a-z0-9]+)/i);
    if (analysisMatch) return { intent: 'analysis', symbol: analysisMatch[1].toUpperCase() };
    // Sentiment
    const sentimentMatch = lower.match(/sentiment for ([a-z0-9]+)/i) || lower.match(/news sentiment for ([a-z0-9]+)/i);
    if (sentimentMatch) return { intent: 'sentiment', symbol: sentimentMatch[1].toUpperCase() };
    // Portfolio
    if (lower.includes('portfolio') || lower.includes('my stocks') || lower.includes('my investments')) {
      const symbols = lower.match(/([a-z0-9, ]+)/gi)?.[0].split(',').map(s => s.trim().toUpperCase()).filter(Boolean) || ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'];
      return { intent: 'portfolio', symbols };
    }
    // Watchlist
    if (lower.includes('watchlist') || lower.includes('watch list')) {
      const symbols = lower.match(/([a-z0-9, ]+)/gi)?.[0].split(',').map(s => s.trim().toUpperCase()).filter(Boolean) || ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'];
      return { intent: 'watchlist', symbols };
    }
    // Sector
    const sectorMatch = lower.match(/sector ([a-z0-9]+)/i);
    if (sectorMatch) return { intent: 'sector', sector: sectorMatch[1].toUpperCase() };
    // Industry
    const industryMatch = lower.match(/industry ([a-z0-9]+)/i);
    if (industryMatch) return { intent: 'industry', industry: industryMatch[1].toUpperCase() };
    // Fallback
    return { intent: 'process' };
  }

  public async processQuery(query: string): Promise<PythonResponse> {
    const intentInfo = this.detectIntent(query);
    try {
      let response;
      switch (intentInfo.intent) {
        case 'stock':
          if (intentInfo.symbol) {
            response = await axios.get(`${this.baseUrl}/stock/${intentInfo.symbol}`);
            return {
              text: this.formatStockDetails(response.data),
              type: 'text',
              data: response.data
            };
          }
          break;

        case 'market':
          response = await axios.get(`${this.baseUrl}/market`);
          return {
            text: this.formatMarketSummary(response.data),
            type: 'market',
            data: response.data
          };

        case 'analysis':
          if (intentInfo.symbol) {
            response = await axios.get(`${this.baseUrl}/analysis/${intentInfo.symbol}`);
            return {
              text: this.formatStockDetails(response.data),
              type: 'analysis',
              data: response.data
            };
          }
          break;

        case 'sentiment':
          if (intentInfo.symbol) {
            response = await axios.get(`${this.baseUrl}/sentiment/${intentInfo.symbol}`);
            return {
              text: this.formatSentiment(response.data),
              type: 'analysis',
              data: response.data
            };
          }
          break;

        case 'portfolio':
          if (intentInfo.symbols) {
            response = await axios.post(`${this.baseUrl}/portfolio`, { symbols: intentInfo.symbols });
            return {
              text: this.formatStockList(response.data, 'Portfolio'),
              type: 'analysis',
              data: response.data
            };
          }
          break;

        case 'watchlist':
          if (intentInfo.symbols) {
            response = await axios.post(`${this.baseUrl}/watchlist`, { symbols: intentInfo.symbols });
            return {
              text: this.formatStockList(response.data, 'Watchlist'),
              type: 'analysis',
              data: response.data
            };
          }
          break;

        case 'sector':
          if (intentInfo.sector) {
            response = await axios.get(`${this.baseUrl}/sector/${intentInfo.sector}`);
            return {
              text: this.formatSectorIndustry(response.data, 'Sector'),
              type: 'analysis',
              data: response.data
            };
          }
          break;

        case 'industry':
          if (intentInfo.industry) {
            response = await axios.get(`${this.baseUrl}/industry/${intentInfo.industry}`);
            return {
              text: this.formatSectorIndustry(response.data, 'Industry'),
              type: 'analysis',
              data: response.data
            };
          }
          break;

        default:
          response = await axios.post(`${this.baseUrl}/process`, { query });
          return response.data;
      }
      // If nothing matched, fallback
      response = await axios.post(`${this.baseUrl}/process`, { query });
      return response.data;
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        type: 'error'
      };
    }
  }

  public async getStockData(symbol: string): Promise<MessageData | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/stock/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error getting stock data:', error);
      return null;
    }
  }

  public async getMarketData(): Promise<MessageData | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/market`);
      return response.data;
    } catch (error) {
      console.error('Error getting market data:', error);
      return null;
    }
  }

  public async getAnalysis(symbol: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/analysis/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error getting analysis:', error);
      return null;
    }
  }

  public async getSentiment(symbol: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/sentiment/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error getting sentiment:', error);
      return null;
    }
  }

  public async getPortfolio(symbols: string[]): Promise<Record<string, unknown> | null> {
    try {
      const response = await axios.post(`${this.baseUrl}/portfolio`, { symbols: symbols });
      return response.data;
    } catch (error) {
      console.error('Error getting portfolio:', error);
      return null;
    }
  }

  public async getWatchlist(symbols: string[]): Promise<Record<string, unknown> | null> {
    try {
      const response = await axios.post(`${this.baseUrl}/watchlist`, { symbols: symbols });
      return response.data;
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return null;
    }
  }

  public async getSector(sectorKey: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/sector/${sectorKey}`);
      return response.data;
    } catch (error) {
      console.error('Error getting sector:', error);
      return null;
    }
  }

  public async getIndustry(industryKey: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/industry/${industryKey}`);
      return response.data;
    } catch (error) {
      console.error('Error getting industry:', error);
      return null;
    }
  }
}

export const pythonService = PythonService.getInstance(); 