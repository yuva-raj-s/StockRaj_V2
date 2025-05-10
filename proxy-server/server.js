const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { spawn } = require('child_process');
const path = require('path');
const xml2js = require('xml2js');
const yahooFinance = require('yahoo-finance2').default;
const fs = require('fs');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3001;

// Configure Yahoo Finance
yahooFinance.setGlobalConfig({
  queue: { concurrency: 4 },
  validation: { logErrors: false }
});

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle Yahoo Finance errors
  if (err.name === 'HTTPError' || err.name === 'YahooFinanceError') {
    return res.status(500).json({
      error: 'External API Error',
      message: err.message,
      symbol: req.params.symbol
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  // Handle network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Unable to connect to external service'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Add market hours utility at the top of the file
function isIndianMarketOpen() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  
  if (istTime.getUTCDay() === 0 || istTime.getUTCDay() === 6) return false;
  
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  return timeInMinutes >= 555 && timeInMinutes <= 930; // 9:15 AM to 3:30 PM IST
}

// Add market hours utility functions
function getNextMarketOpen() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  
  // Set to next 9:15 AM IST
  istTime.setHours(9, 15, 0, 0);
  
  // If we're past 9:15 AM today, move to tomorrow
  if (now.getTime() > istTime.getTime()) {
    istTime.setDate(istTime.getDate() + 1);
  }
  
  // Skip weekends
  while (istTime.getUTCDay() === 0 || istTime.getUTCDay() === 6) {
    istTime.setDate(istTime.getDate() + 1);
  }
  
  return istTime;
}

// Market Indices Symbols
const MARKET_INDICES = {
  'NIFTY 50': '^NSEI',
  'SENSEX': '^BSESN',
  'NIFTY BANK': '^NSEBANK',
  'NIFTY NEXT 50': '^NSMIDCP',
  'NIFTY MIDCAP 50': 'NIFTY_MIDCAP_50.NS',
  'NIFTY MIDCAP 100': 'NIFTY_MIDCAP_100.NS',
  'NIFTY SMALLCAP 100': '^CNXSC',
  'NIFTY 100': '^CNX100',
  'NIFTY 200': '^CNX200',
  'NIFTY 500': '^CRSLDX'
};

// Sector Symbols
const SECTOR_SYMBOLS = {
  'NIFTY IT': '^CNXIT',
  'NIFTY PHARMA': '^CNXPHARMA',
  'NIFTY AUTO': '^CNXAUTO',
  'NIFTY METAL': '^CNXMETAL',
  'NIFTY FMCG': '^CNXFMCG',
  'NIFTY ENERGY': '^CNXENERGY',
  'NIFTY PSU BANK': '^CNXPSUBANK',
  'NIFTY BANK': '^NSEBANK',
  'NIFTY MEDIA': '^CNXMEDIA',
  'NIFTY INFRA': '^CNXINFRA'
};

// Major companies in each sector
const SECTOR_COMPANIES = {
  'NIFTY IT': ['TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS'],
  'NIFTY PHARMA': ['SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'LUPIN.NS', 'AUROPHARMA.NS'],
  'NIFTY AUTO': ['MARUTI.NS', 'TATAMOTORS.NS', 'M&M.NS', 'BAJFINANCE.NS', 'HEROMOTOCO.NS'],
  'NIFTY METAL': ['TATASTEEL.NS', 'HINDALCO.NS', 'JSWSTEEL.NS', 'SAIL.NS', 'COALINDIA.NS'],
  'NIFTY FMCG': ['HINDUNILVR.NS', 'ITC.NS', 'NESTLEIND.NS', 'BRITANNIA.NS', 'DABUR.NS'],
  'NIFTY ENERGY': ['RELIANCE.NS', 'ONGC.NS', 'IOC.NS', 'BPCL.NS', 'GAIL.NS'],
  'NIFTY PSU BANK': ['SBIN.NS', 'PNB.NS', 'BANKBARODA.NS', 'CANBK.NS', 'UNIONBANK.NS'],
  'NIFTY BANK': ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS', 'AXISBANK.NS'],
  'NIFTY MEDIA': ['ZEEL.NS', 'SUNTV.NS', 'NETWORK18.NS', 'DISHTV.NS', 'PVRINOX.NS'],
  'NIFTY INFRA': ['LARSEN.NS', 'NTPC.NS', 'POWERGRID.NS', 'ADANIPORTS.NS', 'TITAN.NS']
};

// Add caching middleware
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to format symbol for Yahoo Finance
function formatSymbol(symbol) {
  // Remove any existing .NS suffix
  symbol = symbol.replace('.NS', '');
  
  // Add .NS suffix for Indian stocks
  return `${symbol}.NS`;
}

// Market Indices Endpoint
app.get('/api/market-indices', async (req, res) => {
  try {
    console.log('Fetching real-time market indices data...');
    
    const indexPromises = Object.entries(MARKET_INDICES).map(async ([name, symbol]) => {
      try {
        console.log(`Processing ${name} (${symbol})...`);
        const result = await yahooFinance.quote(symbol);
        
        return {
          name,
          data: {
            price: result.regularMarketPrice,
            change_percent: result.regularMarketChangePercent,
            timestamp: Math.floor(Date.now() / 1000),
            open: result.regularMarketOpen,
            high: result.regularMarketDayHigh,
            low: result.regularMarketDayLow,
            volume: result.regularMarketVolume,
            previousClose: result.regularMarketPreviousClose
          }
        };
      } catch (error) {
        console.error(`Error processing ${name}:`, error.message);
        return {
          name,
          data: {
            price: 0,
            change_percent: 0,
            timestamp: Math.floor(Date.now() / 1000),
            open: 0,
            high: 0,
            low: 0,
            volume: 0,
            previousClose: 0
          }
        };
      }
    });

    const results = await Promise.all(indexPromises);
    const indicesData = results.reduce((acc, { name, data }) => {
      acc[name] = data;
      return acc;
    }, {});

    console.log('Successfully fetched real-time market indices data');
    res.json(indicesData);
  } catch (error) {
    console.error('Error fetching market indices:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch market indices data',
      message: error.message
    });
  }
});

// Historical Market Indices Endpoint
app.get('/api/market-indices/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1d', range = '1d' } = req.query;
    
    // Format symbol for Yahoo Finance
    const formattedSymbol = formatSymbol(symbol);
    
    console.log(`[Historical] Fetching data for symbol=${formattedSymbol}, interval=${interval}, range=${range}`);
    
    try {
      // Check if market is open for intraday data
      const isIntraday = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h'].includes(interval);
      if (isIntraday && !isIndianMarketOpen()) {
        return res.status(400).json({
          error: 'Market Closed',
          message: 'Market is currently closed. Intraday data is not available.',
          nextOpen: getNextMarketOpen()
        });
      }

      // Calculate start and end dates based on range
      const end = new Date();
      let start = new Date();
      
      switch(range) {
        case '1d':
          start.setDate(end.getDate() - 1);
          break;
        case '5d':
          start.setDate(end.getDate() - 5);
          break;
        case '1mo':
          start.setMonth(end.getMonth() - 1);
          break;
        case '3mo':
          start.setMonth(end.getMonth() - 3);
          break;
        case '6mo':
          start.setMonth(end.getMonth() - 6);
          break;
        case '1y':
          start.setFullYear(end.getFullYear() - 1);
          break;
        case '2y':
          start.setFullYear(end.getFullYear() - 2);
          break;
        case '5y':
          start.setFullYear(end.getFullYear() - 5);
          break;
        case 'max':
          start = new Date('1970-01-01');
          break;
        default:
          start.setDate(end.getDate() - 1);
      }

      const options = {
        period1: start.toISOString(),  // Convert to ISO string
        period2: end.toISOString(),    // Convert to ISO string
        interval: interval
      };

      const result = await yahooFinance.historical(formattedSymbol, options);

      if (!result || !Array.isArray(result) || result.length === 0) {
        console.log('No data found for symbol:', formattedSymbol);
        return res.json({ 
          data: [],
          message: 'No historical data available for the specified symbol and timeframe'
        });
      }

      const formattedData = result.map(item => ({
        timestamp: Math.floor(item.date.getTime() / 1000),
        open: item.open || item.close,
        high: item.high || item.close,
        low: item.low || item.close,
        close: item.close,
        volume: item.volume || 0
      }));

      console.log(`Successfully fetched ${formattedData.length} data points for ${formattedSymbol}`);
      res.json({ 
        data: formattedData,
        symbol: formattedSymbol,
        interval,
        range
      });
    } catch (error) {
      console.error('Error fetching historical data from Yahoo Finance:', error);
      res.status(500).json({
        error: 'Failed to fetch historical data',
        message: error.message,
        symbol: formattedSymbol,
        details: error.stack
      });
    }
  } catch (error) {
    console.error('Error in historical data endpoint:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: error.message,
      details: error.stack
    });
  }
});

// Batch stock data endpoint
app.get('/api/stocks', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      throw new Error('Symbols parameter is required');
    }

    const symbolList = symbols.split(',').map(formatSymbol);
    console.log(`Fetching batch data for symbols: ${symbolList.join(', ')}`);

    try {
      // Use individual quote calls instead of quoteCombine
      const quotePromises = symbolList.map(symbol => 
        yahooFinance.quote(symbol, {
        fields: [
          'regularMarketPrice',
          'regularMarketChange',
          'regularMarketChangePercent',
          'regularMarketPreviousClose',
          'regularMarketVolume',
          'regularMarketOpen',
          'regularMarketDayHigh',
          'regularMarketDayLow'
        ]
        })
      );

      const results = await Promise.all(quotePromises);
      const formattedResults = symbolList.map((symbol, index) => {
        const quote = results[index];
        if (!quote) {
          return {
            symbol: symbol.replace('.NS', ''),
            price: 0,
            change: 0,
            changePercent: 0,
            previousClose: 0,
            volume: 0,
            open: 0,
            high: 0,
            low: 0,
            timestamp: Math.floor(Date.now() / 1000),
            error: 'No data available'
          };
        }

        return {
          symbol: symbol.replace('.NS', ''),
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          previousClose: quote.regularMarketPreviousClose || 0,
          volume: quote.regularMarketVolume || 0,
          open: quote.regularMarketOpen || 0,
          high: quote.regularMarketDayHigh || 0,
          low: quote.regularMarketDayLow || 0,
          timestamp: Math.floor(Date.now() / 1000)
        };
      });

      res.json(formattedResults);
    } catch (error) {
      console.error('Error fetching stock data:', error.message);
      const fallbackResults = symbolList.map(symbol => ({
        symbol: symbol.replace('.NS', ''),
        price: 0,
        change: 0,
        changePercent: 0,
        previousClose: 0,
        volume: 0,
        open: 0,
        high: 0,
        low: 0,
        timestamp: Math.floor(Date.now() / 1000),
        error: error.message
      }));
      res.json(fallbackResults);
    }
  } catch (error) {
    console.error('Error in stocks endpoint:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      message: error.message
    });
  }
});

// Market Volatility (India VIX)
app.get('/api/volatility', async (req, res) => {
  try {
    const py = spawn('python', [
      path.join(__dirname, '../Actual_Yf_StockRaj/Dashboard/utils/market_data.py'),
      'indiavix'
    ]);

    let data = '';
    let error = '';

    py.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    py.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process error:', error);
        return res.status(500).json({
          error: 'Failed to fetch volatility data',
          message: error
        });
      }
      try {
        const vixData = JSON.parse(data);
        res.json(vixData);
      } catch (e) {
        console.error('Error parsing VIX data:', e);
        res.status(500).json({
          error: 'Failed to parse VIX data',
          message: e.message
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volatility data', message: error.message });
  }
});

const MOVERS_SYMBOLS = [
  'RELIANCE.NS','TCS.NS','HDFCBANK.NS','ICICIBANK.NS','INFY.NS','HINDUNILVR.NS','SBIN.NS','BHARTIARTL.NS','LT.NS','ITC.NS','BAJFINANCE.NS','HCLTECH.NS','AXISBANK.NS','MARUTI.NS','NTPC.NS'
];

async function fetchMoversData() {
  const tickers = MOVERS_SYMBOLS;
  const results = await Promise.all(
    tickers.map(symbol => yahooFinance.quote(symbol))
  );
  return results.map(q => ({
    symbol: q.symbol,
    name: q.shortName || q.longName || q.symbol.replace('.NS', ''),
    price: q.regularMarketPrice,
    changePercent: q.regularMarketChangePercent,
    volume: q.regularMarketVolume,
    high52w: q.fiftyTwoWeekHigh,
    low52w: q.fiftyTwoWeekLow
  }));
}

// Top Gainers
app.get('/api/top-gainers', async (req, res) => {
  try {
    const movers = await fetchMoversData();
    const sorted = movers
      .filter(m => m.price && m.changePercent !== undefined)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5);
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top gainers', message: error.message });
  }
});

// Top Losers
app.get('/api/top-losers', async (req, res) => {
  try {
    const movers = await fetchMoversData();
    const sorted = movers
      .filter(m => m.price && m.changePercent !== undefined)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5);
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top losers', message: error.message });
  }
});

// 52 Week High
app.get('/api/52week-high', async (req, res) => {
  try {
    const movers = await fetchMoversData();
    const sorted = movers
      .filter(m => m.price && m.high52w !== undefined)
      .sort((a, b) => b.high52w - a.high52w)
      .slice(0, 5);
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch 52 week high', message: error.message });
  }
});

// 52 Week Low
app.get('/api/52week-low', async (req, res) => {
  try {
    const movers = await fetchMoversData();
    const sorted = movers
      .filter(m => m.price && m.low52w !== undefined)
      .sort((a, b) => a.low52w - b.low52w)
      .slice(0, 5);
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch 52 week low', message: error.message });
  }
});

// Trending (by volume)
app.get('/api/trending-stocks', async (req, res) => {
  try {
    const movers = await fetchMoversData();
    const sorted = movers
      .filter(m => m.price && m.volume !== undefined)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending stocks', message: error.message });
  }
});

// Financial News Endpoint
app.get('/api/financial-news', async (req, res) => {
  try {
    const py = spawn('python', [
      path.join(__dirname, '../Actual_Yf_StockRaj/Dashboard/utils/market_data.py'),
      'news'
    ]);
    
    let data = '';
    let error = '';
    
    py.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    py.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });
    
    py.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process error:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch financial news',
          message: error
        });
      }
      
      try {
        const newsData = JSON.parse(data);
        res.json(newsData);
      } catch (e) {
        console.error('Error parsing news data:', e);
        res.status(500).json({ 
          error: 'Failed to parse news data',
          message: e.message
        });
      }
    });
  } catch (error) {
    console.error('Error in financial news endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to fetch financial news',
      message: error.message
    });
  }
});

// Watchlist data endpoint
app.get('/api/watchlist-data', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      throw new Error('Symbols parameter is required');
    }

    const symbolList = symbols.split(',').map(formatSymbol);
    console.log(`Fetching watchlist data for symbols: ${symbolList.join(', ')}`);

    try {
      // Use individual quote calls for each symbol
      const quotePromises = symbolList.map(symbol => 
        yahooFinance.quote(symbol, {
          fields: [
            'regularMarketPrice',
            'regularMarketChange',
            'regularMarketChangePercent',
            'regularMarketPreviousClose',
            'regularMarketVolume',
            'regularMarketOpen',
            'regularMarketDayHigh',
            'regularMarketDayLow',
            'marketCap',
            'trailingPE'
          ]
        })
      );

      const results = await Promise.all(quotePromises);
      const formattedResults = symbolList.map((symbol, index) => {
        const quote = results[index];
        if (!quote) {
          return {
            symbol: symbol.replace('.NS', ''),
            currentPrice: 0,
            change: 0,
            changePercent: 0,
            dayHigh: 0,
            dayLow: 0,
            marketCap: 0,
            peRatio: 0,
            dividendYield: 0,
            name: symbol.replace('.NS', ''),
            error: 'No data available'
          };
        }

        return {
          symbol: symbol.replace('.NS', ''),
          currentPrice: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          dayHigh: quote.regularMarketDayHigh || 0,
          dayLow: quote.regularMarketDayLow || 0,
          marketCap: quote.marketCap || 0,
          peRatio: quote.trailingPE || 0,
          dividendYield: quote.dividendYield || 0,
          name: quote.shortName || symbol.replace('.NS', '')
        };
      });

      res.json(formattedResults);
    } catch (error) {
      console.error('Error fetching watchlist data:', error.message);
      const fallbackResults = symbolList.map(symbol => ({
        symbol: symbol.replace('.NS', ''),
        currentPrice: 0,
        change: 0,
        changePercent: 0,
        dayHigh: 0,
        dayLow: 0,
        marketCap: 0,
        peRatio: 0,
        dividendYield: 0,
        name: symbol.replace('.NS', ''),
        error: error.message
      }));
      res.json(fallbackResults);
    }
  } catch (error) {
    console.error('Error in watchlist data endpoint:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch watchlist data',
      message: error.message
    });
  }
});

// Popular Indian NSE Stocks List
const POPULAR_NSE_STOCKS = {
  // Nifty 50 Companies
  'RELIANCE': 'Reliance Industries Ltd.',
  'TCS': 'Tata Consultancy Services Ltd.',
  'HDFCBANK': 'HDFC Bank Ltd.',
  'INFY': 'Infosys Ltd.',
  'ICICIBANK': 'ICICI Bank Ltd.',
  'HINDUNILVR': 'Hindustan Unilever Ltd.',
  'HDFC': 'Housing Development Finance Corporation Ltd.',
  'SBIN': 'State Bank of India',
  'BHARTIARTL': 'Bharti Airtel Ltd.',
  'ITC': 'ITC Ltd.',
  'KOTAKBANK': 'Kotak Mahindra Bank Ltd.',
  'WIPRO': 'Wipro Ltd.',
  'HCLTECH': 'HCL Technologies Ltd.',
  'AXISBANK': 'Axis Bank Ltd.',
  'ASIANPAINT': 'Asian Paints Ltd.',
  'MARUTI': 'Maruti Suzuki India Ltd.',
  'LT': 'Larsen & Toubro Ltd.',
  'ULTRACEMCO': 'UltraTech Cement Ltd.',
  'BAJFINANCE': 'Bajaj Finance Ltd.',
  'NTPC': 'NTPC Ltd.',
  
  // Additional Popular Stocks
  'TATAMOTORS': 'Tata Motors Ltd.',
  'SUNPHARMA': 'Sun Pharmaceutical Industries Ltd.',
  'BAJAJFINSV': 'Bajaj Finserv Ltd.',
  'TITAN': 'Titan Company Ltd.',
  'ADANIENT': 'Adani Enterprises Ltd.',
  'POWERGRID': 'Power Grid Corporation of India Ltd.',
  'HDFCLIFE': 'HDFC Life Insurance Company Ltd.',
  'DIVISLAB': 'Divi\'s Laboratories Ltd.',
  'TECHM': 'Tech Mahindra Ltd.',
  'BRITANNIA': 'Britannia Industries Ltd.',
  
  // Banking & Financial
  'PNB': 'Punjab National Bank',
  'BANKBARODA': 'Bank of Baroda',
  'CANBK': 'Canara Bank',
  'FEDERALBNK': 'The Federal Bank Ltd.',
  
  // IT Sector
  'MINDTREE': 'MindTree Ltd.',
  'LTTS': 'L&T Technology Services Ltd.',
  'PERSISTENT': 'Persistent Systems Ltd.',
  
  // Automotive
  'TATAPOWER': 'Tata Power Co. Ltd.',
  'M&M': 'Mahindra & Mahindra Ltd.',
  'HEROMOTOCO': 'Hero MotoCorp Ltd.',
  'BAJAJ-AUTO': 'Bajaj Auto Ltd.',
  
  // Pharma & Healthcare
  'CIPLA': 'Cipla Ltd.',
  'DRREDDY': 'Dr. Reddy\'s Laboratories Ltd.',
  'APOLLOHOSP': 'Apollo Hospitals Enterprise Ltd.',
  
  // Consumer Goods
  'NESTLEIND': 'Nestle India Ltd.',
  'DABUR': 'Dabur India Ltd.',
  'MARICO': 'Marico Ltd.',
  
  // Energy & Infrastructure
  'ONGC': 'Oil & Natural Gas Corporation Ltd.',
  'COALINDIA': 'Coal India Ltd.',
  'ADANIPORTS': 'Adani Ports and Special Economic Zone Ltd.',
  
  // Manufacturing & Others
  'TATASTEEL': 'Tata Steel Ltd.',
  'HINDALCO': 'Hindalco Industries Ltd.',
  'VEDL': 'Vedanta Ltd.',
  'JSWSTEEL': 'JSW Steel Ltd.'
};

// Helper function to get popular stock details
const getPopularStockDetails = (symbol) => {
  const cleanSymbol = symbol.toUpperCase().replace('.NS', '');
  if (POPULAR_NSE_STOCKS[cleanSymbol]) {
    return {
      symbol: cleanSymbol,
      name: POPULAR_NSE_STOCKS[cleanSymbol],
      exchange: 'NSE'
    };
  }
  return null;
};

// Update searchNSESymbols function to include popular stocks
const searchNSESymbols = async (query, maxResults = 10) => {
  try {
    const searchQuery = query.toUpperCase();
    
    // First check popular stocks list
    const popularMatches = Object.entries(POPULAR_NSE_STOCKS)
      .filter(([symbol, name]) => 
        symbol.includes(searchQuery) || 
        name.toUpperCase().includes(searchQuery)
      )
      .map(([symbol, name]) => ({
        symbol,
        name,
        exchange: 'NSE',
        type: 'EQUITY',
        isPopular: true
      }));

    // If we have popular matches, prioritize them
    if (popularMatches.length > 0) {
      const popularDetails = await Promise.all(
        popularMatches.slice(0, maxResults).map(async (match) => {
          try {
            const quote = await yahooFinance.quote(`${match.symbol}.NS`);
            return {
              ...match,
              price: quote?.regularMarketPrice || null,
              change: quote?.regularMarketChange || null,
              changePercent: quote?.regularMarketChangePercent || null,
              volume: quote?.regularMarketVolume || null
            };
          } catch (error) {
            console.warn(`Failed to get quote for ${match.symbol}:`, error);
            return match;
          }
        })
      );
      
      return popularDetails.filter(Boolean);
    }

    // If no popular matches, proceed with Yahoo Finance search
    const searchOptions = {
      lang: 'en-US',
      region: 'IN',
      quotesCount: maxResults,
      newsCount: 0,
      enableFuzzyQuery: false,
      quotesQueryId: 'tss_match_phrase_query',
      multiQuoteQueryId: 'multi_quote_single_token_query',
      enableCb: false,
      enableNavLinks: false,
      enableEnhancedTrivialQuery: false
    };

    const results = await yahooFinance.search(query, searchOptions);
    
    if (!results?.quotes?.length) {
      return [];
    }

    // Filter and format NSE results
    const yahooResults = results.quotes
      .filter(quote => 
        quote.exchange === 'NSE' || 
        (quote.symbol && quote.symbol.endsWith('.NS'))
      )
      .map(quote => ({
        symbol: quote.symbol.replace('.NS', ''),
        name: quote.shortname || quote.longname || quote.symbol.replace('.NS', ''),
        exchange: 'NSE',
        type: quote.quoteType || 'EQUITY',
        isPopular: !!POPULAR_NSE_STOCKS[quote.symbol.replace('.NS', '')]
      }));

    // Combine and deduplicate results
    const allResults = [...popularMatches, ...yahooResults];
    const uniqueResults = Array.from(new Map(
      allResults.map(item => [item.symbol, item])
    ).values());

    return uniqueResults.slice(0, maxResults);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

// Update validateAndFormatNSESymbol to check popular stocks
const validateAndFormatNSESymbol = (symbol) => {
  if (!symbol) return null;
  
  // Remove any existing suffix and whitespace
  let cleanSymbol = symbol.trim().toUpperCase().replace(/\.(NS|BO)$/, '');
  
  // Check if it's a popular stock
  if (POPULAR_NSE_STOCKS[cleanSymbol]) {
    return `${cleanSymbol}.NS`;
  }
  
  // Basic validation for NSE symbol format
  const validSymbolPattern = /^[A-Z0-9\-&]{2,20}$/;
  if (!validSymbolPattern.test(cleanSymbol)) {
    return null;
  }
  
  return `${cleanSymbol}.NS`;
};

// Symbol search endpoint
app.get('/api/search-symbols', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid Input',
        message: 'Search query is required'
      });
    }

    // Try direct symbol lookup first
    const directQuote = await getNSEQuoteDetails(q);
    if (directQuote) {
      return res.json([{
        symbol: directQuote.symbol,
        name: directQuote.name,
        exchange: 'NSE',
        price: directQuote.price,
        change: directQuote.change,
        changePercent: directQuote.changePercent
      }]);
    }

    // If direct lookup fails, perform search
    const searchResults = await searchNSESymbols(q);
    
    // If search found results, get additional details for top matches
    if (searchResults.length > 0) {
      const detailedResults = await Promise.all(
        searchResults.slice(0, 5).map(async (result) => {
          const details = await getNSEQuoteDetails(result.symbol);
          return details ? {
            symbol: result.symbol,
            name: result.name,
            exchange: 'NSE',
            price: details.price,
            change: details.change,
            changePercent: details.changePercent
          } : result;
        })
      );

      return res.json(detailedResults.filter(Boolean));
    }

    // No results found
    return res.json([]);

  } catch (error) {
    console.error('Symbol search error:', error);
    res.status(500).json({
      error: 'Search Failed',
      message: 'Failed to search for symbols',
      details: error.message
    });
  }
});

// Symbol lookup endpoint
app.get('/api/lookup-symbol', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        error: 'Invalid Input',
        message: 'Symbol query is required'
      });
    }

    // Try direct symbol lookup first
    const directQuote = await getNSEQuoteDetails(q);
    if (directQuote) {
      return res.json(directQuote);
    }

    // If direct lookup fails, try search
    const searchResults = await searchNSESymbols(q, 1);
    if (searchResults.length > 0) {
      const details = await getNSEQuoteDetails(searchResults[0].symbol);
      if (details) {
        return res.json(details);
      }
    }

    // No match found
    return res.status(404).json({
      error: 'Not Found',
      message: 'No matching NSE symbol found',
      searchQuery: q
    });

  } catch (error) {
    console.error('Symbol lookup error:', error);
    res.status(500).json({
      error: 'Lookup Failed',
      message: 'Failed to lookup symbol',
      details: error.message
    });
  }
});

// Add sentiment endpoint
app.get('/api/sentiment/market/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const formattedSymbol = formatSymbol(symbol);
    
    // Get news data
    const news = await yahooFinance.news(formattedSymbol, { count: 10 });
    
    // Calculate sentiment scores
    const sentimentScores = news.map(article => {
      // Simple sentiment analysis based on title and content
      const text = `${article.title} ${article.content}`.toLowerCase();
      const positiveWords = ['up', 'rise', 'gain', 'positive', 'bullish', 'growth', 'profit'];
      const negativeWords = ['down', 'fall', 'loss', 'negative', 'bearish', 'decline', 'risk'];
      
      let score = 0;
      positiveWords.forEach(word => {
        if (text.includes(word)) score += 1;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) score -= 1;
      });
      
      return {
        sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
        title: article.title,
        description: article.content,
        date: article.providerPublishTime,
        baseScore: Math.abs(score) / (positiveWords.length + negativeWords.length),
        weight: 1.0,
        totalScore: Math.abs(score) / (positiveWords.length + negativeWords.length)
      };
    });
    
    // Calculate overall sentiment
    const positive = sentimentScores.filter(s => s.sentiment === 'positive').length;
    const neutral = sentimentScores.filter(s => s.sentiment === 'neutral').length;
    const negative = sentimentScores.filter(s => s.sentiment === 'negative').length;
    const total = sentimentScores.length;
    
    const sentimentData = {
      sentiment: {
        news: {
          positive: (positive / total) * 100,
          neutral: (neutral / total) * 100,
          negative: (negative / total) * 100
        },
        overall: positive > negative ? 'Bullish' : negative > positive ? 'Bearish' : 'Neutral'
      },
      sentimentScore: ((positive - negative) / total) * 100,
      marketImpact: {
        volume: positive > negative ? 'High' : 'Low',
        price: positive > negative ? 'Positive' : 'Negative'
      },
      confidence: 75,
      signalStrength: positive > negative ? 'Strong Buy' : negative > positive ? 'Strong Sell' : 'Neutral',
      totalArticles: total
    };
    
    res.json(sentimentData);
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    res.status(500).json({
      error: 'Failed to fetch sentiment data',
      message: error.message
    });
  }
});

// Technical data endpoint
app.get('/api/portfolio/technical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const formattedSymbol = formatSymbol(symbol);
    console.log(`Fetching technical data for ${formattedSymbol}`);

    // Get historical data for calculations
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    console.log('Fetching historical data...');
    // Get historical data
    const historicalData = await yahooFinance.historical(formattedSymbol, {
      period1: startDate.toISOString(),
      period2: endDate.toISOString(),
      interval: '1d'
    });
    
    if (!historicalData || historicalData.length === 0) {
      console.error(`No historical data found for ${formattedSymbol}`);
      return res.status(404).json({ error: 'No historical data available' });
    }

    console.log(`Got ${historicalData.length} historical data points`);

    // Extract close prices and volumes
    const closePrices = historicalData
      .map(q => q.close)
      .filter(price => price !== null && !isNaN(price));

    if (closePrices.length === 0) {
      console.error(`No valid price data for ${formattedSymbol}`);
      return res.status(404).json({ error: 'No valid price data available' });
    }

    console.log(`Got ${closePrices.length} valid close prices`);

    // Get current quote
    console.log('Fetching current quote...');
    const quote = await yahooFinance.quote(formattedSymbol);
    if (!quote) {
      console.error(`No quote data found for ${formattedSymbol}`);
      return res.status(404).json({ error: 'No quote data available' });
    }

    console.log('Calculating technical indicators...');
    // Calculate technical indicators
    const rsi = calculateRSI(closePrices);
    console.log('RSI calculated:', rsi[rsi.length - 1]);
    const macd = calculateMACD(closePrices);
    console.log('MACD calculated:', macd);

    // Get the latest values
    const latestRSI = rsi[rsi.length - 1];

    if (!latestRSI || !macd) {
      console.error(`Failed to calculate technical indicators for ${formattedSymbol}`);
      console.error('Latest values:', { latestRSI, macd });
      return res.status(500).json({ error: 'Failed to calculate technical indicators' });
    }

    // Prepare response
    const response = {
      rsi: latestRSI,
      macd: {
        macd: macd.macd,
        signal: macd.signal,
        histogram: macd.histogram
      },
      currentPrice: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow
    };

    console.log(`Successfully calculated technical indicators for ${formattedSymbol}`);
    res.json(response);
  } catch (error) {
    console.error('Error in technical data endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to fetch technical data',
      details: error.message 
    });
  }
});

// Technical Indicator Calculations
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) {
    return [50]; // Return neutral RSI if not enough data
  }

  const changes = prices.map((price, i) => i === 0 ? 0 : price - prices[i - 1]);
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? -change : 0);
  
  const avgGain = [];
  const avgLoss = [];
  const rsi = [];

  // Calculate initial averages
  let sumGain = 0;
  let sumLoss = 0;
  for (let i = 1; i <= period; i++) {
    sumGain += gains[i];
    sumLoss += losses[i];
  }
  avgGain[period] = sumGain / period;
  avgLoss[period] = sumLoss / period;

  // Calculate RSI
  for (let i = period + 1; i < prices.length; i++) {
    avgGain[i] = (avgGain[i - 1] * (period - 1) + gains[i]) / period;
    avgLoss[i] = (avgLoss[i - 1] * (period - 1) + losses[i]) / period;
    
    const rs = avgLoss[i] === 0 ? 100 : avgGain[i] / avgLoss[i];
    rsi[i] = 100 - (100 / (1 + rs));
  }
  
  return rsi;
}

function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (prices.length < slowPeriod + signalPeriod) {
    return {
      macd: 0,
      signal: 0,
      histogram: 0
    };
  }

  // Calculate EMAs
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  // Calculate MACD line
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
  
  // Calculate Signal line
  const signalLine = calculateEMA(macdLine.slice(slowPeriod - fastPeriod), signalPeriod);
  
  // Calculate Histogram
  const histogram = macdLine.slice(slowPeriod - fastPeriod).map((macd, i) => macd - signalLine[i]);
  
  // Return the latest values
  const lastIndex = histogram.length - 1;
  return {
    macd: macdLine[macdLine.length - 1] || 0,
    signal: signalLine[lastIndex] || 0,
    histogram: histogram[lastIndex] || 0
  };
}

function calculateEMA(prices, period) {
  if (prices.length < period) {
    return Array(prices.length).fill(prices[0] || 0);
  }

  const k = 2 / (period + 1);
  const ema = [prices[0]];
  
  for (let i = 1; i < prices.length; i++) {
    if (i < period) {
      // Use SMA for initial period
      const sma = prices.slice(0, i + 1).reduce((a, b) => a + b, 0) / (i + 1);
      ema.push(sma);
    } else {
    ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
  }
  
  return ema;
}

// Sector Performance Endpoint
app.get('/api/sector-performance', async (req, res) => {
  try {
    console.log('Fetching sector performance data...');
    
    const sectorPromises = Object.entries(SECTOR_SYMBOLS).map(async ([name, symbol]) => {
      try {
        console.log(`Processing ${name} (${symbol})...`);
        const result = await yahooFinance.quote(symbol, {
          fields: [
            'regularMarketPrice',
            'regularMarketChangePercent',
            'regularMarketOpen',
            'regularMarketDayHigh',
            'regularMarketDayLow',
            'regularMarketVolume',
            'regularMarketPreviousClose',
            'marketCap',
            'shortName',
            'longName',
            'currency',
            'exchange',
            'quoteType'
          ]
        });

        if (!result) {
          throw new Error(`No data received for ${name}`);
        }
        
        return {
          name,
          symbol,
          data: {
            price: result.regularMarketPrice || 0,
            change_percent: result.regularMarketChangePercent || 0,
            timestamp: Math.floor(Date.now() / 1000),
            open: result.regularMarketOpen || 0,
            high: result.regularMarketDayHigh || 0,
            low: result.regularMarketDayLow || 0,
            volume: result.regularMarketVolume || 0,
            previousClose: result.regularMarketPreviousClose || 0,
            marketCap: result.marketCap || 0,
            shortName: result.shortName || name,
            longName: result.longName || name,
            currency: result.currency || 'USD',
            exchange: result.exchange || 'NMS',
            quoteType: result.quoteType || 'EQUITY'
          }
        };
      } catch (error) {
        console.error(`Error processing ${name} (${symbol}):`, error.message);
        return {
          name,
          symbol,
          data: {
            price: 0,
            change_percent: 0,
            timestamp: Math.floor(Date.now() / 1000),
            open: 0,
            high: 0,
            low: 0,
            volume: 0,
            previousClose: 0,
            marketCap: 0,
            shortName: name,
            longName: name,
            currency: 'USD',
            exchange: 'NMS',
            quoteType: 'EQUITY',
            error: error.message
          }
        };
      }
    });

    const results = await Promise.all(sectorPromises);
    const sectorData = results.reduce((acc, { name, symbol, data }) => {
      acc[name] = Object.assign({ symbol }, data);
      return acc;
    }, {});

    console.log('Successfully fetched sector performance data');
    res.json({
      status: 'success',
      timestamp: Math.floor(Date.now() / 1000),
      data: sectorData
    });
  } catch (error) {
    console.error('Error fetching sector performance:', error.message);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to fetch sector performance data',
      message: error.message,
      timestamp: Math.floor(Date.now() / 1000)
    });
  }
});

// Sector Trends Endpoint
app.get('/api/sector-trends', async (req, res) => {
  try {
    console.log('Fetching sector trends data...');
    
    const sectorPromises = Object.entries(SECTOR_SYMBOLS).map(async ([name, symbol]) => {
      try {
        console.log(`Processing ${name} (${symbol})...`);
        const result = await yahooFinance.chart(symbol, {
          range: '1mo',
          interval: '1d'
        });

        if (!result || !result.quotes || !Array.isArray(result.quotes) || result.quotes.length === 0) {
          throw new Error('No historical data available');
        }

        // Get current sector data
        const currentData = await yahooFinance.quote(symbol, {
          fields: [
            'regularMarketPrice',
            'regularMarketChangePercent',
            'regularMarketVolume',
            'regularMarketDayHigh',
            'regularMarketDayLow',
            'regularMarketOpen'
          ]
        });

        // Get top companies data
        const sectorCompanies = SECTOR_COMPANIES[name] || [];
        const companyPromises = sectorCompanies.map(async (companySymbol) => {
          try {
            const companyResult = await yahooFinance.quote(companySymbol, {
              fields: [
                'regularMarketPrice',
                'regularMarketChangePercent',
                'shortName',
                'longName'
              ]
            });
            
            if (!companyResult) {
              return null;
            }

            return {
              symbol: companySymbol,
              name: companyResult.shortName || companyResult.longName || companySymbol.replace('.NS', ''),
              price: companyResult.regularMarketPrice || 0,
              change_percent: companyResult.regularMarketChangePercent || 0
            };
          } catch (error) {
            console.error(`Error processing company ${companySymbol}:`, error.message);
            return null;
          }
        });

        const companies = (await Promise.all(companyPromises)).filter(Boolean);
        const sortedCompanies = companies.sort((a, b) => b.change_percent - a.change_percent);

        return {
          name,
          data: {
            historical: result.quotes.map(quote => ({
              date: quote.date,
              price: quote.close || 0,
              volume: quote.volume || 0,
              high: quote.high || 0,
              low: quote.low || 0,
              open: quote.open || 0
            })),
            current: {
              price: currentData.regularMarketPrice || 0,
              change_percent: currentData.regularMarketChangePercent || 0,
              volume: currentData.regularMarketVolume || 0,
              high: currentData.regularMarketDayHigh || 0,
              low: currentData.regularMarketDayLow || 0,
              open: currentData.regularMarketOpen || 0
            },
            topGainers: sortedCompanies.slice(0, 3),
            topLosers: sortedCompanies.slice(-3).reverse(),
            timestamp: Math.floor(Date.now() / 1000)
          }
        };
      } catch (error) {
        console.error(`Error processing ${name}:`, error.message);
        return {
          name,
          data: {
            historical: [],
            current: {
              price: 0,
              change_percent: 0,
              volume: 0,
              high: 0,
              low: 0,
              open: 0
            },
            topGainers: [],
            topLosers: [],
            timestamp: Math.floor(Date.now() / 1000),
            error: error.message
          }
        };
      }
    });

    const results = await Promise.all(sectorPromises);
    const sectorData = results.reduce((acc, { name, data }) => {
      acc[name] = data;
      return acc;
    }, {});

    console.log('Successfully fetched sector trends data');
    res.json({
      status: 'success',
      timestamp: Math.floor(Date.now() / 1000),
      data: sectorData
    });
  } catch (error) {
    console.error('Error fetching sector trends:', error.message);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to fetch sector trends data',
      message: error.message,
      timestamp: Math.floor(Date.now() / 1000)
    });
  }
});

// Sector Specific Indices Endpoint
app.get('/api/sector-indices', async (req, res) => {
  try {
    console.log('Fetching sector indices data...');
    
    const sectorPromises = Object.entries(SECTOR_SYMBOLS).map(async ([name, symbol]) => {
      try {
        console.log(`Processing ${name} (${symbol})...`);
        const result = await yahooFinance.quote(symbol, {
          fields: [
            'regularMarketPrice',
            'regularMarketChangePercent',
            'marketCap',
            'shortName'
          ]
        });
        
        // Get top gainers and losers for the sector
        const sectorCompanies = SECTOR_COMPANIES[name] || [];
        const companyPromises = sectorCompanies.map(async (companySymbol) => {
          try {
            const companyResult = await yahooFinance.quote(companySymbol, {
              fields: [
                'regularMarketPrice',
                'regularMarketChangePercent',
                'shortName',
                'longName'
              ]
            });
            
            if (!companyResult) {
              return null;
            }

            return {
              symbol: companySymbol,
              name: companyResult.shortName || companyResult.longName || companySymbol.replace('.NS', ''),
              price: companyResult.regularMarketPrice || 0,
              change_percent: companyResult.regularMarketChangePercent || 0
            };
          } catch (error) {
            console.error(`Error processing company ${companySymbol}:`, error.message);
            return null;
          }
        });

        const companies = (await Promise.all(companyPromises)).filter(Boolean);
        const sortedCompanies = companies.sort((a, b) => b.change_percent - a.change_percent);
        
        return {
          name,
          data: {
            price: result.regularMarketPrice || 0,
            change_percent: result.regularMarketChangePercent || 0,
            timestamp: Math.floor(Date.now() / 1000),
            marketCap: result.marketCap || 0,
            topGainers: sortedCompanies.slice(0, 3),
            topLosers: sortedCompanies.slice(-3).reverse()
          }
        };
      } catch (error) {
        console.error(`Error processing ${name}:`, error.message);
        return {
          name,
          data: {
            price: 0,
            change_percent: 0,
            timestamp: Math.floor(Date.now() / 1000),
            marketCap: 0,
            topGainers: [],
            topLosers: [],
            error: error.message
          }
        };
      }
    });

    const results = await Promise.all(sectorPromises);
    const sectorData = results.reduce((acc, { name, data }) => {
      acc[name] = data;
      return acc;
    }, {});

    console.log('Successfully fetched sector indices data');
    res.json({
      status: 'success',
      timestamp: Math.floor(Date.now() / 1000),
      data: sectorData
    });
  } catch (error) {
    console.error('Error fetching sector indices:', error.message);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to fetch sector indices data',
      message: error.message,
      timestamp: Math.floor(Date.now() / 1000)
    });
  }
});

// Portfolio Endpoints
const PORTFOLIO_FILE = path.join(__dirname, 'data', 'portfolio.json');

// Ensure portfolio data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize portfolio file if it doesn't exist
if (!fs.existsSync(PORTFOLIO_FILE)) {
  fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify({
    transactions: [],
    holdings: {},
    goals: [],
    notes: {}
  }));
}

// Load portfolio data
function loadPortfolio() {
  try {
    const data = fs.readFileSync(PORTFOLIO_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading portfolio:', error);
    return {
      transactions: [],
      holdings: {},
      goals: [],
      notes: {}
    };
  }
}

// Save portfolio data
function savePortfolio(data) {
  try {
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving portfolio:', error);
    return false;
  }
}

// Add transaction endpoint
app.post('/api/portfolio/transaction', async (req, res) => {
  try {
    const { symbol, quantity, price, date, type, notes } = req.body;
    
    // Validate input
    if (!symbol || !quantity || !price || !date || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format symbol
    const formattedSymbol = formatSymbol(symbol);
    
    // Validate stock exists
    try {
      const quote = await yahooFinance.quote(formattedSymbol);
      if (!quote) {
        return res.status(400).json({ error: 'Invalid stock symbol' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid stock symbol' });
    }

    const portfolio = loadPortfolio();
    
    // Create transaction
    const transaction = {
      symbol: formattedSymbol,
      quantity: type === 'BUY' ? quantity : -quantity,
      price,
      date,
      type,
      notes: notes || '',
      timestamp: Date.now()
    };

    // Add transaction
    portfolio.transactions.push(transaction);

    // Update holdings
    if (formattedSymbol in portfolio.holdings) {
      const holding = portfolio.holdings[formattedSymbol];
      const newQuantity = holding.quantity + transaction.quantity;
      
      if (newQuantity < 0) {
        return res.status(400).json({ error: 'Cannot sell more shares than owned' });
      }
      
      if (newQuantity === 0) {
        delete portfolio.holdings[formattedSymbol];
      } else {
        if (type === 'BUY') {
          holding.avgPrice = ((holding.avgPrice * holding.quantity) + (price * quantity)) / newQuantity;
        }
        holding.quantity = newQuantity;
      }
    } else {
      if (type === 'SELL') {
        return res.status(400).json({ error: 'Cannot sell shares that are not owned' });
      }
      portfolio.holdings[formattedSymbol] = {
        quantity,
        avgPrice: price
      };
    }

    if (savePortfolio(portfolio)) {
      res.json({ success: true, transaction });
    } else {
      res.status(500).json({ error: 'Failed to save transaction' });
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Delete transaction endpoint
app.delete('/api/portfolio/transaction/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) {
      return res.status(400).json({ error: 'Invalid transaction index' });
    }
    const portfolio = loadPortfolio();
    if (!portfolio.transactions || index < 0 || index >= portfolio.transactions.length) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    // Remove the transaction
    portfolio.transactions.splice(index, 1);
    // Rebuild holdings from scratch
    portfolio.holdings = {};
    for (const t of portfolio.transactions) {
      const symbol = t.symbol;
      if (!(symbol in portfolio.holdings)) {
        if (t.type === 'SELL') continue; // Can't sell what you don't own
        portfolio.holdings[symbol] = { quantity: 0, avgPrice: 0 };
      }
      const holding = portfolio.holdings[symbol];
      if (t.type === 'BUY') {
        const newQty = holding.quantity + t.quantity;
        holding.avgPrice = ((holding.avgPrice * holding.quantity) + (t.price * t.quantity)) / (newQty || 1);
        holding.quantity = newQty;
      } else if (t.type === 'SELL') {
        holding.quantity -= t.quantity;
        if (holding.quantity <= 0) delete portfolio.holdings[symbol];
      }
    }
    if (savePortfolio(portfolio)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get portfolio overview endpoint
app.get('/api/portfolio/overview', async (req, res) => {
  try {
    const portfolio = loadPortfolio();
    const holdings = portfolio.holdings;
    
    // Get current prices for all holdings
    const symbols = Object.keys(holdings);
    const quotes = await Promise.all(
      symbols.map(symbol => yahooFinance.quote(symbol))
    );

    // Calculate portfolio metrics
    let totalValue = 0;
    let totalInvested = 0;
    const holdingsData = [];

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      const quote = quotes[i];
      const holding = holdings[symbol];
      
      const currentPrice = quote.regularMarketPrice;
      const currentValue = currentPrice * holding.quantity;
      const invested = holding.avgPrice * holding.quantity;
      
      totalValue += currentValue;
      totalInvested += invested;

      holdingsData.push({
        symbol: symbol.replace('.NS', ''),
        name: quote.shortName || symbol,
        quantity: holding.quantity,
        avgPrice: holding.avgPrice,
        currentPrice,
        invested,
        currentValue,
        pnl: currentValue - invested,
        pnlPercent: ((currentValue - invested) / invested) * 100,
        changePercent: quote.regularMarketChangePercent
      });
    }

    // Calculate portfolio metrics
    const totalPnl = totalValue - totalInvested;
    const totalPnlPercent = (totalPnl / totalInvested) * 100;

    // Calculate Beta and Sharpe Ratio (simplified)
    const beta = 1.0; // This should be calculated based on market data
    const sharpeRatio = 1.5; // This should be calculated based on returns and risk-free rate

    res.json({
      totalValue,
      totalInvested,
      totalPnl,
      totalPnlPercent,
      beta,
      sharpeRatio,
      holdings: holdingsData
    });
  } catch (error) {
    console.error('Error getting portfolio overview:', error);
    res.status(500).json({ error: 'Failed to get portfolio overview' });
  }
});

// Portfolio performance endpoint
app.get('/api/portfolio/performance', async (req, res) => {
  try {
    // Read portfolio data from the main portfolio file (not portfolio_data.json)
    const portfolioData = loadPortfolio();
    const { transactions, holdings } = portfolioData;

    if (!transactions || transactions.length === 0) {
      return res.json({
        portfolioValueHistory: [],
        assetAllocation: [],
        totalPortfolioValue: 0,
        currentPrices: {},
        transactions: []
      });
    }

    // Get unique symbols from transactions
    const symbols = [...new Set(transactions.map(t => t.symbol))];
    // Fetch current prices for all symbols
    const currentPrices = {};
    for (const symbol of symbols) {
      try {
        const quote = await yahooFinance.quote(symbol);
        if (quote && quote.regularMarketPrice) {
          currentPrices[symbol] = quote.regularMarketPrice;
        }
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
      }
    }

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate portfolio value over time
    const portfolioValueHistory = [];
    const runningHoldings = new Map();
    for (const symbol of symbols) {
      runningHoldings.set(symbol, 0);
    }
    let currentDate = new Date(transactions[0].date);
    const endDate = new Date();
    while (currentDate <= endDate) {
      // Process transactions for current date
      const dayTransactions = transactions.filter(t => 
        new Date(t.date).toDateString() === currentDate.toDateString()
      );
      for (const transaction of dayTransactions) {
        const { symbol, type, quantity } = transaction;
        const currentHoldings = runningHoldings.get(symbol) || 0;
        if (type === 'BUY') {
          runningHoldings.set(symbol, currentHoldings + quantity);
        } else if (type === 'SELL') {
          runningHoldings.set(symbol, currentHoldings - quantity);
        }
      }
      // Calculate portfolio value for current date
      let totalValue = 0;
      const dailyHoldings = {};
      for (const [symbol, quantity] of runningHoldings.entries()) {
        if (quantity > 0) {
          // For historical dates, use transaction price if available
          let price = currentPrices[symbol];
          const dayTransaction = dayTransactions.find(t => t.symbol === symbol);
          if (dayTransaction) {
            price = dayTransaction.price;
          }
          if (price) {
            const value = quantity * price;
            totalValue += value;
            dailyHoldings[symbol] = {
              quantity,
              value,
              price
            };
          }
        }
      }
      portfolioValueHistory.push({
        date: currentDate.toISOString().split('T')[0],
        value: totalValue,
        holdings: dailyHoldings
      });
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate current asset allocation
    const assetAllocation = [];
    let totalPortfolioValue = 0;
    let missingPrices = [];
    for (const [symbol, quantity] of Object.entries(holdings)) {
      if (quantity > 0) {
        let price = currentPrices[symbol];
        if (typeof price !== 'number' || isNaN(price)) {
          price = 0;
          missingPrices.push(symbol);
        }
        const value = quantity * price;
        totalPortfolioValue += value;
        assetAllocation.push({
          symbol,
          quantity,
          value,
          price
        });
      }
    }
    // Calculate allocation percentages
    if (totalPortfolioValue > 0) {
      assetAllocation.forEach(asset => {
        asset.percentage = (asset.value / totalPortfolioValue) * 100;
      });
    } else {
      assetAllocation.forEach(asset => {
        asset.percentage = 0;
      });
    }
    // Sort asset allocation by value
    assetAllocation.sort((a, b) => b.value - a.value);

    // Debug logging for diagnosis
    console.log('Asset Allocation:', assetAllocation);
    console.log('Current Prices:', currentPrices);
    console.log('Holdings:', holdings);
    console.log('Transactions:', transactions);

    res.json({
      portfolioValueHistory,
      assetAllocation,
      totalPortfolioValue,
      currentPrices,
      transactions,
      allocationWarning: missingPrices.length > 0 ? `Price unavailable for: ${missingPrices.join(', ')}` : undefined
    });
  } catch (error) {
    console.error('Error in portfolio performance endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to calculate portfolio performance',
      details: error.message 
    });
  }
});

// Fundamental data endpoint
app.get('/api/portfolio/fundamental/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const formattedSymbol = formatSymbol(symbol);
    console.log(`Fetching fundamental data for ${formattedSymbol}`);

    const quote = await yahooFinance.quote(formattedSymbol, {
      fields: [
        'marketCap',
        'trailingPE',
        'forwardPE',
        'trailingAnnualDividendYield',
        'beta',
        'fiftyTwoWeekHigh',
        'fiftyTwoWeekLow',
        'fiftyDayAverage',
        'twoHundredDayAverage',
        'profitMargins',
        'operatingMargins',
        'revenueGrowth',
        'earningsQuarterlyGrowth',
        'earningsAnnualGrowth',
        'earningsQuarterlyGrowthRate',
        'earningsAnnualGrowthRate',
        'priceToBook',
        'priceToSales',
        'enterpriseValue',
        'returnOnEquity',
        'returnOnAssets'
      ]
    });

    if (!quote) {
      console.error(`No fundamental data found for ${formattedSymbol}`);
      return res.status(404).json({ error: 'No fundamental data available' });
    }

    console.log(`Successfully fetched fundamental data for ${formattedSymbol}`);
    res.json({
      marketCap: quote.marketCap || 0,
      trailingPE: quote.trailingPE || 0,
      forwardPE: quote.forwardPE || 0,
      dividendYield: quote.trailingAnnualDividendYield || 0,
      beta: quote.beta || 0,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
      fiftyDayAverage: quote.fiftyDayAverage || 0,
      twoHundredDayAverage: quote.twoHundredDayAverage || 0,
      profitMargins: quote.profitMargins || 0,
      operatingMargins: quote.operatingMargins || 0,
      revenueGrowth: quote.revenueGrowth || 0,
      earningsQuarterlyGrowth: quote.earningsQuarterlyGrowth || 0,
      earningsAnnualGrowth: quote.earningsAnnualGrowth || 0,
      earningsQuarterlyGrowthRate: quote.earningsQuarterlyGrowthRate || 0,
      earningsAnnualGrowthRate: quote.earningsAnnualGrowthRate || 0,
      priceToBook: quote.priceToBook || 0,
      priceToSales: quote.priceToSales || 0,
      enterpriseValue: quote.enterpriseValue || 0,
      returnOnEquity: quote.returnOnEquity || 0,
      returnOnAssets: quote.returnOnAssets || 0
    });
  } catch (error) {
    console.error('Error in fundamental data endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to fetch fundamental data',
      details: error.message 
    });
  }
});

// Get asset allocation endpoint
app.get('/api/portfolio/asset-allocation', async (req, res) => {
  try {
    const portfolio = loadPortfolio();
    const holdings = portfolio.holdings;
    
    // Get current prices for all holdings
    const symbols = Object.keys(holdings);
    const quotes = await Promise.all(
      symbols.map(symbol => yahooFinance.quote(symbol))
    );
    
    // Calculate total portfolio value
    let totalValue = 0;
    const sectorValues = {};
    
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      const quote = quotes[i];
      const holding = holdings[symbol];
      
      const currentPrice = quote.regularMarketPrice;
      const currentValue = currentPrice * holding.quantity;
      
      totalValue += currentValue;
      
      // Get sector from quote
      const sector = quote.sector || 'Unknown';
      
      if (sector in sectorValues) {
        sectorValues[sector] += currentValue;
      } else {
        sectorValues[sector] = currentValue;
      }
    }
    
    // Calculate allocation percentages
    const allocation = Object.entries(sectorValues).map(([sector, value]) => ({
      sector,
      value,
      percentage: (value / totalValue) * 100
    }));
    
    res.json(allocation);
  } catch (error) {
    console.error('Error getting asset allocation:', error);
    res.status(500).json({ error: 'Failed to get asset allocation' });
  }
});

// Store connected clients and their subscriptions
const clients = new Map();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  // Set a heartbeat to keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  clients.set(ws, { 
    symbol: null,
    pingInterval
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'subscribe' && data.symbol) {
        const clientData = clients.get(ws);
        clientData.symbol = data.symbol;
        console.log(`Client subscribed to symbol: ${data.symbol}`);
        
        // Send initial data
        try {
          const stockData = await getStockData(data.symbol);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'stockUpdate',
              data: stockData
            }));
          }
        } catch (error) {
          console.error(`Error sending initial data for ${data.symbol}:`, error);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to fetch initial data'
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    const clientData = clients.get(ws);
    if (clientData && clientData.pingInterval) {
      clearInterval(clientData.pingInterval);
    }
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    const clientData = clients.get(ws);
    if (clientData && clientData.pingInterval) {
      clearInterval(clientData.pingInterval);
    }
    clients.delete(ws);
  });

  // Send initial connection success message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Successfully connected to server'
  }));
});

// Real-time data broadcaster
async function broadcastStockData() {
  if (!isIndianMarketOpen()) return;

  for (const [ws, clientData] of clients.entries()) {
    if (!clientData.symbol) continue;

    try {
      const stockData = await getStockData(clientData.symbol);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'stockUpdate',
          data: stockData
        }));
      }
    } catch (error) {
      console.error(`Error broadcasting ${clientData.symbol} data:`, error);
    }
  }
}

// Start broadcasting if market is open
setInterval(broadcastStockData, 2000);

// Helper function to get stock data
async function getStockData(symbol) {
  try {
    const formattedSymbol = formatSymbol(symbol);
    const quote = await yahooFinance.quote(formattedSymbol);
    return {
      symbol: symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      open: quote.regularMarketOpen,
      previousClose: quote.regularMarketPreviousClose
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 