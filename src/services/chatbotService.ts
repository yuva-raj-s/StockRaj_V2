// import { StockData } from '../context/DataContext';

interface ChatbotResponse {
  text: string;
  data?: MessageData;
  type: 'text' | 'analysis' | 'market' | 'error';
}

interface StockDetails {
  symbol: string;
  currentPrice: number;
  changePercent: number;
  volume: number;
  lastUpdated: string;
}

interface MarketActivity {
  nifty: {
    current: number;
    change: number;
    changePct: number;
  };
  sensex: {
    current: number;
    change: number;
    changePct: number;
  };
  marketStatus: string;
  lastUpdated: string;
}

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
  sentiment?: {
    score: number;
    positive: number;
    negative: number;
    neutral: number;
    totalNews: number;
    recentNews: Array<{
      title: string;
      sentiment: string;
      confidence: number;
      date: string;
    }>;
  };
  technicalIndicators?: {
    rsi: number;
    macd: number;
    macdSignal: number;
    bbUpper: number;
    bbLower: number;
  };
  prediction?: {
    price: number;
    change: number;
    signal: string;
  };
}

class ChatbotService {
  private stockSymbols: Record<string, string> = {
    "reliance": "RELIANCE.NS",
    "reliance industries": "RELIANCE.NS",
    "ril": "RELIANCE.NS",
    "tcs": "TCS.NS",
    "tata consultancy": "TCS.NS",
    "tata consultancy services": "TCS.NS",
    "infosys": "INFY.NS",
    "infy": "INFY.NS",
    "hdfc bank": "HDFCBANK.NS",
    "hdfc": "HDFCBANK.NS",
    "icici bank": "ICICIBANK.NS",
    "icici": "ICICIBANK.NS",
    "wipro": "WIPRO.NS",
    "tata motors": "TATAMOTORS.NS",
    "tatamotors": "TATAMOTORS.NS",
    "tata steel": "TATASTEEL.NS",
    "tatasteel": "TATASTEEL.NS",
    "bharti airtel": "BHARTIARTL.NS",
    "airtel": "BHARTIARTL.NS",
    "sbi": "SBIN.NS",
    "state bank": "SBIN.NS",
    "state bank of india": "SBIN.NS",
    "axis bank": "AXISBANK.NS",
    "axis": "AXISBANK.NS",
    "kotak bank": "KOTAKBANK.NS",
    "kotak": "KOTAKBANK.NS",
    "asian paints": "ASIANPAINT.NS",
    "asian": "ASIANPAINT.NS",
    "bajaj auto": "BAJAJ-AUTO.NS",
    "bajaj": "BAJAJ-AUTO.NS",
    "hindalco": "HINDALCO.NS",
    "itc": "ITC.NS",
    "larsen": "LT.NS",
    "l&t": "LT.NS",
    "larsen and toubro": "LT.NS",
    "m&m": "M&M.NS",
    "mahindra": "M&M.NS",
    "maruti": "MARUTI.NS",
    "maruti suzuki": "MARUTI.NS",
    "nestle": "NESTLEIND.NS",
    "nestle india": "NESTLEIND.NS",
    "ongc": "ONGC.NS",
    "oil and natural gas": "ONGC.NS",
    "power grid": "POWERGRID.NS",
    "sun pharma": "SUNPHARMA.NS",
    "sun": "SUNPHARMA.NS",
    "titan": "TITAN.NS",
    "ultracemco": "ULTRACEMCO.NS",
    "ultra cement": "ULTRACEMCO.NS"
  };

  private marketTerms: Record<string, string> = {
    "nifty": "Nifty 50 is an index of 50 major companies listed on the National Stock Exchange (NSE) of India.",
    "sensex": "Sensex is an index of 30 major companies listed on the Bombay Stock Exchange (BSE) of India.",
    "ipo": "Initial Public Offering (IPO) is when a private company offers its shares to the public for the first time.",
    "fii": "Foreign Institutional Investors (FIIs) are entities that invest in Indian markets from outside India.",
    "dii": "Domestic Institutional Investors (DIIs) are Indian entities that invest in the stock market.",
    "circuit": "Circuit limits are the maximum percentage by which a stock can move up or down in a single day.",
    "upper circuit": "Upper circuit is the maximum percentage a stock can rise in a single day.",
    "lower circuit": "Lower circuit is the maximum percentage a stock can fall in a single day.",
    "market": "The Indian stock market consists of two major exchanges: NSE and BSE. Trading hours are 9:15 AM to 3:30 PM IST on weekdays.",
    "trading": "Trading in Indian stocks happens on NSE and BSE from 9:15 AM to 3:30 PM IST on weekdays.",
    "invest": "Investing in Indian stocks requires a demat account and trading account. You can invest through brokers or online platforms.",
    "broker": "Stock brokers in India are regulated by SEBI. Popular brokers include Zerodha, ICICI Direct, HDFC Securities, and Kotak Securities.",
    "demat": "A Demat account is required to hold shares in electronic form. It's mandatory for trading in Indian stocks.",
    "sebi": "SEBI (Securities and Exchange Board of India) is the regulator for securities markets in India.",
    "sector": "Major sectors in Indian markets include IT, Banking, FMCG, Auto, Pharma, and Infrastructure.",
    "dividend": "Dividends are payments made by companies to their shareholders from profits. They are usually paid quarterly or annually.",
    "mutual fund": "Mutual funds pool money from investors to invest in stocks, bonds, and other securities. They are managed by professional fund managers.",
    "etf": "ETFs (Exchange Traded Funds) are investment funds that track an index and trade like stocks on exchanges."
  };

  private intentPatterns: Record<string, string[]> = {
    'price_query': [
      'price', 'current price', 'stock price', 'share price', 'value',
      'how much', 'what is the price', 'current value'
    ],
    'market_status': [
      'market status', 'market open', 'trading hours', 'market timing',
      'is market open', 'when does market open'
    ],
    'index_query': [
      'nifty', 'sensex', 'index', 'market index', 'benchmark',
      'nifty 50', 'bse sensex'
    ],
    'term_query': [
      'what is', 'explain', 'define', 'meaning of', 'tell me about',
      'ipo', 'fii', 'dii', 'circuit', 'demat', 'sebi'
    ],
    'analysis_query': [
      'analysis', 'outlook', 'trend', 'performance', 'how is',
      'what about', 'tell me about'
    ]
  };

  private cleanQuery(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s.]/g, '').replace(/\s+/g, ' ').trim();
  }

  private getStockSymbol(userInput: string): string | null {
    const cleanedInput = this.cleanQuery(userInput);
    
    // First try exact match from predefined symbols
    for (const [key, symbol] of Object.entries(this.stockSymbols)) {
      if (cleanedInput.includes(key)) {
        return symbol;
      }
    }
    
    return null;
  }

  private async getStockDetails(symbol: string): Promise<StockDetails | null> {
    try {
      const response = await fetch(`/api/stock/${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch stock details');
      
      const data = await response.json();
      return {
        symbol: data.symbol,
        currentPrice: data.currentPrice,
        changePercent: data.changePercent,
        volume: data.volume,
        lastUpdated: data.lastUpdated
      };
    } catch (error) {
      console.error('Error fetching stock details:', error);
      return null;
    }
  }

  private async getMarketActivity(): Promise<MarketActivity | null> {
    try {
      const response = await fetch('/api/market/activity');
      if (!response.ok) throw new Error('Failed to fetch market activity');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching market activity:', error);
      return null;
    }
  }

  private isMarketOpen(): boolean {
    const now = new Date();
    if (now.getDay() >= 5) return false; // Weekend
    
    const marketOpen = new Date(now);
    marketOpen.setHours(9, 15, 0, 0);
    
    const marketClose = new Date(now);
    marketClose.setHours(15, 30, 0, 0);
    
    return now >= marketOpen && now <= marketClose;
  }

  private async classifyIntent(query: string): Promise<{ intent: string; confidence: number; sentiment: string }> {
    try {
      const response = await fetch('http://localhost:3001/api/chatbot/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Classification error:', errorData);
        // Fallback to basic intent detection
        return this.fallbackIntentDetection(query);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error classifying intent:', error);
      // Fallback to basic intent detection
      return this.fallbackIntentDetection(query);
    }
  }

  private fallbackIntentDetection(query: string): { intent: string; confidence: number; sentiment: string } {
    const lowerQuery = query.toLowerCase();
    
    // Basic keyword matching for fallback
    if (lowerQuery.includes('price') || lowerQuery.includes('stock') || lowerQuery.includes('share')) {
      return { intent: 'price_query', confidence: 0.8, sentiment: 'neutral' };
    }
    if (lowerQuery.includes('market') && (lowerQuery.includes('open') || lowerQuery.includes('close'))) {
      return { intent: 'market_status', confidence: 0.8, sentiment: 'neutral' };
    }
    if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis')) {
      return { intent: 'analysis_query', confidence: 0.8, sentiment: 'neutral' };
    }
    if (lowerQuery.includes('what is') || lowerQuery.includes('explain')) {
      return { intent: 'term_query', confidence: 0.8, sentiment: 'neutral' };
    }
    
    return { intent: 'general_query', confidence: 0.5, sentiment: 'neutral' };
  }

  private async getSentimentAnalysis(symbol: string): Promise<MessageData['sentiment'] | null> {
    try {
      const response = await fetch(`http://localhost:3001/api/chatbot/sentiment/${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch sentiment analysis');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sentiment analysis:', error);
      return null;
    }
  }

  private async getTechnicalAnalysis(symbol: string): Promise<MessageData['technicalIndicators'] | null> {
    try {
      const response = await fetch(`http://localhost:3001/api/chatbot/technical/${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch technical analysis');
      return await response.json();
    } catch (error) {
      console.error('Error fetching technical analysis:', error);
      return null;
    }
  }

  private async getPricePrediction(symbol: string): Promise<MessageData['prediction'] | null> {
    try {
      const response = await fetch(`http://localhost:3001/api/chatbot/predict/${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch price prediction');
      return await response.json();
    } catch (error) {
      console.error('Error fetching price prediction:', error);
      return null;
    }
  }

  private getMarketTerm(query: string): string | null {
    const lowerQuery = query.toLowerCase();
    for (const [term, explanation] of Object.entries(this.marketTerms)) {
      if (lowerQuery.includes(term.toLowerCase())) {
        return explanation;
      }
    }
    return null;
  }

  public async processQuery(query: string): Promise<ChatbotResponse> {
    try {
      const { intent } = await this.classifyIntent(query);
      
      switch (intent) {
        case 'price_query': {
          const symbol = this.getStockSymbol(query);
          if (!symbol) {
            return {
              text: "I couldn't identify the stock symbol. Please try again with a valid stock name.",
              type: 'error'
            };
          }
          const stockData = await this.getStockDetails(symbol);
          if (!stockData) {
            return {
              text: `Unable to fetch data for ${symbol}. Please try again later.`,
              type: 'error'
            };
          }
          return {
            text: `The current price of ${symbol} is ₹${stockData.currentPrice}.`,
            type: 'text',
            data: stockData
          };
        }

        case 'market_status': {
          const marketActivity = await this.getMarketActivity();
          if (!marketActivity) {
            return {
              text: "Unable to fetch market status. Please try again later.",
              type: 'error'
            };
          }
          return {
            text: marketActivity.marketStatus === 'open' 
              ? 'The market is currently open.'
              : 'The market is currently closed.',
            type: 'market',
            data: marketActivity
          };
        }

        case 'analysis_query': {
          const analysisSymbol = this.getStockSymbol(query);
          if (!analysisSymbol) {
            return {
              text: "I couldn't identify the stock symbol for analysis. Please try again with a valid stock name.",
              type: 'error'
            };
          }
          const [sentiment, technical, prediction] = await Promise.all([
            this.getSentimentAnalysis(analysisSymbol),
            this.getTechnicalAnalysis(analysisSymbol),
            this.getPricePrediction(analysisSymbol)
          ]);
          return {
            text: `Here's the analysis for ${analysisSymbol}:`,
            type: 'analysis',
            data: {
              symbol: analysisSymbol,
              sentiment: sentiment ?? undefined,
              technicalIndicators: technical ?? undefined,
              prediction: prediction ?? undefined
            }
          };
        }

        case 'term_query': {
          const term = this.getMarketTerm(query);
          if (term) {
            return {
              text: term,
              type: 'text'
            };
          }
          return {
            text: "I couldn't identify the market term you're asking about. Please try rephrasing your question.",
            type: 'error'
          };
        }

        default:
          return {
            text: "I'm not sure how to help with that. You can ask about stock prices, market status, or request analysis of a specific stock.",
            type: 'text'
          };
      }
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        text: "I'm having trouble processing your request. Please try again later.",
        type: 'error'
      };
    }
  }

  private generateAnalysisResponse(
    symbol: string,
    stockDetails: StockDetails,
    sentiment: MessageData['sentiment'],
    technical: MessageData['technicalIndicators'],
    prediction: MessageData['prediction']
  ): string {
    let response = `Analysis for ${symbol.replace('.NS', '')}:\n\n`;
    
    // Price information
    response += `Current Price: ₹${stockDetails.currentPrice.toFixed(2)} (${stockDetails.changePercent.toFixed(2)}%)\n`;
    
    // Technical analysis
    if (technical) {
      response += `\nTechnical Indicators:\n`;
      response += `RSI: ${technical.rsi.toFixed(2)} (${technical.rsi > 70 ? 'Overbought' : technical.rsi < 30 ? 'Oversold' : 'Neutral'})\n`;
      response += `MACD: ${technical.macd.toFixed(2)} (Signal: ${technical.macdSignal.toFixed(2)})\n`;
    }
    
    // Sentiment analysis
    if (sentiment) {
      response += `\nSentiment Analysis:\n`;
      response += `Overall Score: ${sentiment.score.toFixed(2)}\n`;
      response += `Positive News: ${sentiment.positive}\n`;
      response += `Negative News: ${sentiment.negative}\n`;
      response += `Neutral News: ${sentiment.neutral}\n`;
    }
    
    // Price prediction
    if (prediction) {
      response += `\nPrice Prediction:\n`;
      response += `Predicted Price: ₹${prediction.price.toFixed(2)}\n`;
      response += `Expected Change: ${prediction.change.toFixed(2)}%\n`;
      response += `Signal: ${prediction.signal}\n`;
    }
    
    return response;
  }
}

export const chatbotService = new ChatbotService(); 