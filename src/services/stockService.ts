import { StockData } from '../context/DataContext.tsx';

interface YahooFinanceResponse {
    chart?: {
        result: Array<{
            meta: {
                previousClose: number;
                regularMarketPrice: number;
                regularMarketVolume: number;
                regularMarketChange: number;
                regularMarketChangePercent: number;
                regularMarketTime: number;
            };
            indicators: {
                quote: Array<{
                    close: number[];
                    volume: number[];
                }>;
            };
        }>;
    };
    quoteResponse?: {
        result: Array<{
            symbol: string;
            regularMarketPrice: number;
            regularMarketChangePercent: number;
            regularMarketVolume: number;
            regularMarketTime: number;
        }>;
    };
}

const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';

const CORS_PROXIES = [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://proxy.cors.sh/",
    "https://corsproxy.org/",
    "https://api.cors.sh/",
    "https://cors.sh/",
    "https://cors.bridged.cc/",
    "https://cors.eu.org/",
    "https://cors.deno.dev/",
    "https://corsproxy.io/raw?url=",
    "https://thingproxy.freeboard.io/fetch/",
    "https://api.scraperapi.com/?url=",
    "https://api.proxyscrape.com/v2/?url=",
    "https://api.scrapingdog.com/proxy?url=",
    "https://proxy.scrapeops.io/v1/?url=",
    "https://api.webscraping.ai/raw?url=",
    "https://cors-proxy.htmldriven.com/?url=",
    "https://crossorigin.me/",
    "https://cors-proxy.taskcluster.net/",
    "https://yacdn.org/proxy/",
    "https://api.scrapingant.com/v2/general?url=",
    "https://proxy.scrapeapi.io/?url="
];

const fetchWithProxy = async (url: string): Promise<YahooFinanceResponse> => {
    let lastError: Error | null = null;
    
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            lastError = error as Error;
            console.warn(`Failed with proxy ${proxy}:`, error);
            continue;
        }
    }
    
    throw lastError || new Error('All proxy attempts failed');
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const fetchWithRetry = async (url: string, retries = MAX_RETRIES): Promise<YahooFinanceResponse> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fetchWithProxy(url);
        } catch (error) {
            lastError = error as Error;
            console.warn(`Attempt ${attempt + 1} failed for ${url}:`, error);
            if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
            }
        }
    }
    
    throw lastError || new Error('All retry attempts failed');
};

const fetchStockQuote = async (symbol: string): Promise<StockData> => {
    try {
        const url = `${QUOTE_URL}?symbols=${symbol}`;
        const response = await fetchWithRetry(url);
        
        if (!response.quoteResponse?.result?.[0]) {
            throw new Error('Invalid response format');
        }

        const result = response.quoteResponse.result[0];
        
        return {
            symbol,
            currentPrice: result.regularMarketPrice || 0,
            changePercent: result.regularMarketChangePercent || 0,
            volume: result.regularMarketVolume || 0,
            isLoading: false,
            lastUpdated: new Date(result.regularMarketTime * 1000).toISOString()
        };
    } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        return {
            symbol,
            currentPrice: 0,
            changePercent: 0,
            volume: 0,
            isLoading: true,
            error: 'Failed to fetch quote'
        };
    }
};

const fetchStockChart = async (symbol: string): Promise<StockData> => {
    try {
        const url = `${BASE_URL}/${symbol}?interval=1m&range=1d`;
        const response = await fetchWithRetry(url);
        
        if (!response.chart?.result?.[0]) {
            throw new Error('Invalid response format');
        }

        const result = response.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        const closePrices = quote.close;
        const volumes = quote.volume;
        
        const currentPrice = closePrices[closePrices.length - 1];
        const previousClose = meta.previousClose;
        const changePercent = ((currentPrice - previousClose) / previousClose) * 100;
        
        return {
            symbol,
            currentPrice,
            changePercent,
            volume: volumes[volumes.length - 1] || 0,
            isLoading: false,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error fetching chart for ${symbol}:`, error);
        return {
            symbol,
            currentPrice: 0,
            changePercent: 0,
            volume: 0,
            isLoading: true,
            error: 'Failed to fetch chart'
        };
    }
};

export const fetchStockData = async (): Promise<Record<string, StockData>> => {
    const symbols = [
        'ASIANPAINT.NS',  // Asian Paints
        'MARUTI.NS',      // Maruti Suzuki
        'TATAMOTORS.NS',  // Tata Motors
        'KOTAKBANK.NS',   // Kotak Mahindra Bank
        'BAJFINANCE.NS',  // Bajaj Finance
        'TCS.NS',         // Tata Consultancy Services
        'RELIANCE.NS',    // Reliance Industries
        'HDFCBANK.NS',    // HDFC Bank
        'INFY.NS',        // Infosys
        'ICICIBANK.NS',   // ICICI Bank
        'HINDUNILVR.NS',  // Hindustan Unilever
        'BHARTIARTL.NS',  // Bharti Airtel
        'SBIN.NS',        // State Bank of India
        'LT.NS',          // Larsen & Toubro
        'WIPRO.NS'        // Wipro
    ];

    const stockData: Record<string, StockData> = {};
    const failedSymbols: string[] = [];

    // First pass - try to fetch quotes (faster, real-time data)
    await Promise.all(
        symbols.map(async (symbol) => {
            try {
                const quoteData = await fetchStockQuote(symbol);
                if (!quoteData.error) {
                stockData[symbol] = {
                        ...quoteData,
                    isLoading: false
                };
                } else {
                    failedSymbols.push(symbol);
                }
            } catch (error) {
                console.error(`Error fetching quote for ${symbol}:`, error);
                failedSymbols.push(symbol);
            }
        })
    );

    // Second pass - try to fetch chart data for failed symbols
    if (failedSymbols.length > 0) {
        console.warn('Retrying failed symbols with chart data:', failedSymbols);
        await Promise.all(
            failedSymbols.map(async (symbol) => {
                try {
                    const chartData = await fetchStockChart(symbol);
                    stockData[symbol] = {
                        ...chartData,
                        isLoading: false
                    };
                } catch (error) {
                    console.error(`Failed to fetch chart data for ${symbol}:`, error);
                    stockData[symbol] = {
                        symbol,
                        currentPrice: 0,
                        changePercent: 0,
                        volume: 0,
                        isLoading: false,
                        error: 'Failed to fetch data after all attempts'
                    };
                }
            })
        );
    }

    return stockData;
};
