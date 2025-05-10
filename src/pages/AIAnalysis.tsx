import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Brain, ArrowRight, ArrowUpRight, ArrowDownRight, ArrowDownLeft, LineChart, Activity, BarChart2, Gauge, Newspaper } from 'lucide-react';
import { SearchBar } from '../components/Search/SearchBar';
import TradingViewChart, { ChartData as TradingViewChartData } from '../components/Charts/TradingViewChart';
import { isIndianMarketOpen, getNextMarketOpen } from '../utils/marketHours';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from '../components/ui/toast';

// Keep only the interfaces we're using
interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

interface AIAnalysisData {
  technicalIndicators: {
    rsi: number;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
    };
    sma: number;
    ema: number;
    bb: {
      upper: number;
      middle: number;
      lower: number;
    };
    atr: number;
    vwap: number;
  };
  sentiment: {
    sentimentScore: number;
    confidence: number;
    marketImpact: {
      volume: string;
      price: string;
    };
    signalStrength: string;
    sentiment: {
      news: {
        positive: number;
        neutral: number;
        negative: number;
      };
      overall: string;
    };
  };
  patterns: {
    doubleBottom: { detected: boolean; confidence: number };
    headAndShoulders: { detected: boolean; confidence: number };
  };
  anomalies: Array<{
    date: string;
    type: string;
    value: number;
    zscore: number;
  }>;
}

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

// Card Components
const PriceCard: React.FC<{
  title: string;
  value?: number;
  change?: number;
  changePercent?: number;
}> = ({ title, value, change, changePercent }) => (
  <div className="bg-[#0A1118] border border-[#1E293B] rounded-2xl flex flex-col items-center justify-center min-h-[100px] px-8 py-5 shadow-lg shadow-[#1E293B]/20">
    <div className="text-[15px] text-[#94A3B8] mb-1 font-medium flex items-center gap-2">
      <ArrowRight className="w-5 h-5" />
      {title}
    </div>
    <div className="text-[2rem] font-extrabold text-white leading-tight">
      ₹{value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </div>
    {change !== undefined && changePercent !== undefined && (
      <div className={`text-sm font-medium flex items-center gap-1 ${change >= 0 ? 'text-[#00ffe0]' : 'text-[#ff4d4f]'}`}>
        {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change.toFixed(2)} ({changePercent.toFixed(2)}%)
      </div>
    )}
  </div>
);

const SentimentCard: React.FC<{
  score?: number;
  confidence?: number;
}> = ({ score, confidence }) => (
  <div className="bg-[#0A1118] border border-[#1E293B] rounded-2xl flex flex-col items-center justify-center min-h-[100px] px-8 py-5 shadow-lg shadow-[#1E293B]/20">
    <div className="text-[15px] text-[#94A3B8] mb-1 font-medium flex items-center gap-2">
      <Gauge className="w-5 h-5" />
      Sentiment Score
    </div>
    <div className="text-[2rem] font-extrabold text-[#00ffe0] leading-tight">
      {score !== undefined ? `${Math.round(score)}%` : '--'}
    </div>
    <div className="text-sm text-[#94A3B8]">
      Confidence: {confidence !== undefined ? `${Math.round(confidence)}%` : '--'}
    </div>
  </div>
);

const SignalCard: React.FC<{
  strength?: string;
  impact?: { volume: string; price: string };
}> = ({ strength, impact }) => (
  <div className="bg-[#0A1118] border border-[#1E293B] rounded-2xl flex flex-col items-center justify-center min-h-[100px] px-8 py-5 shadow-lg shadow-[#1E293B]/20">
    <div className="text-[15px] text-[#94A3B8] mb-1 font-medium flex items-center gap-2">
      <Activity className="w-5 h-5" />
      Signal Strength
    </div>
    <div className="text-[2rem] font-extrabold text-[#ffd600] leading-tight">
      {strength || '--'}
    </div>
    {impact && (
      <div className="text-sm text-[#94A3B8]">
        Volume: {impact.volume} | Price Impact: {impact.price}
      </div>
    )}
  </div>
);

// --- Main Component ---
export const AIAnalysis: React.FC = () => {
  // State hooks
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [analysisData, setAnalysisData] = useState<AIAnalysisData | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [chartData, setChartData] = useState<TradingViewChartData | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'prediction'>('current');
  const [isMarketOpen, setIsMarketOpen] = useState(isIndianMarketOpen());
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);

  // Ref hooks
  const marketCheckInterval = useRef<NodeJS.Timeout>();

  // Callback hooks
  const handleWebSocketMessage = useCallback((data: StockData) => {
    setStockData(data);
    setNextUpdate(new Date(Date.now() + 2000));
  }, []);

  const handleChartData = useCallback((data: TradingViewChartData | null) => {
    setChartData(data);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    try {
      const suggestions = await fetch(`/api/search-symbols?q=${encodeURIComponent(query)}`);
      const data = await suggestions.json() as SearchResult[];
      const selected = data.find((s) => s.exchange === 'NSE') || data[0];
      if (selected) {
        setSelectedStock(selected.symbol);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  }, []);

  // Effect hooks
  useEffect(() => {
    const checkMarketHours = () => {
      const marketOpen = isIndianMarketOpen();
      setIsMarketOpen(marketOpen);
      
      if (!marketOpen) {
        setNextUpdate(getNextMarketOpen());
      }
    };

    checkMarketHours();
    marketCheckInterval.current = setInterval(checkMarketHours, 60000);

    return () => {
      if (marketCheckInterval.current) {
        clearInterval(marketCheckInterval.current);
      }
    };
  }, []);

  // WebSocket connection
  useWebSocket(selectedStock, handleWebSocketMessage);

  // Technical data fetching
  useEffect(() => {
    const fetchTechnicalData = async () => {
      try {
        const res = await fetch(`/api/portfolio/technical/${selectedStock}`);
        const data = await res.json();
        
        if (data) {
          setAnalysisData(prevData => prevData ? {
            ...prevData,
            technicalIndicators: {
              rsi: data.rsi,
              macd: data.macd,
              sma: data.sma,
              ema: data.ema,
              bb: data.bb,
              atr: data.atr,
              vwap: data.vwap
            }
          } : {
            technicalIndicators: {
              rsi: data.rsi,
              macd: data.macd,
              sma: data.sma,
              ema: data.ema,
              bb: data.bb,
              atr: data.atr,
              vwap: data.vwap
            },
            sentiment: {
              sentimentScore: 0,
              confidence: 0,
              marketImpact: { volume: '', price: '' },
              signalStrength: '',
              sentiment: {
                news: { positive: 0, neutral: 0, negative: 0 },
                overall: ''
              }
            },
            patterns: {
              doubleBottom: { detected: false, confidence: 0 },
              headAndShoulders: { detected: false, confidence: 0 }
            },
            anomalies: []
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          toast({
            title: 'Error',
            description: `Failed to fetch technical data: ${error.message}`,
            variant: 'destructive'
          });
        }
      }
    };

    if (isMarketOpen) {
      fetchTechnicalData();
      const interval = setInterval(fetchTechnicalData, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedStock, isMarketOpen]);

  // Market status indicator component
  const MarketStatus = () => (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-3 h-3 rounded-full ${isMarketOpen ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
      <span className="text-sm text-[#94A3B8]">
        Market {isMarketOpen ? 'Open' : 'Closed'}
        {!isMarketOpen && nextUpdate && (
          <span className="ml-2">
            • Next open: {nextUpdate.toLocaleString()}
          </span>
        )}
      </span>
    </div>
  );

  // --- Render ---
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-[#101c24] text-white">
      {/* Market Status */}
      <MarketStatus />
      
      {/* SearchBar */}
      <div className="w-full max-w-2xl mx-auto mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Last Updated Timestamp */}
      <div className="text-xs text-[#94A3B8] mb-4">
        Last updated: {new Date().toLocaleTimeString()}
        {nextUpdate && (
          <span className="ml-2">
            • Next update: {nextUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 text-2xl font-bold mb-1">
        <Brain className="w-7 h-7 text-accent" />
        <span className="text-white">{selectedStock}</span>
        <span className="text-[#7a8ca3] text-xl font-normal">&gt;</span>
        <span className="text-accent">AI Analysis</span>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PriceCard
          title="Current Price"
          value={stockData?.price}
          change={stockData?.change}
          changePercent={stockData?.changePercent}
        />
        <SentimentCard
          score={analysisData?.sentiment.sentimentScore}
          confidence={analysisData?.sentiment.confidence}
        />
        <SignalCard
          strength={analysisData?.sentiment.signalStrength}
          impact={analysisData?.sentiment.marketImpact}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 items-center mb-4">
          <button
          className={`px-6 py-2 rounded-full font-bold text-base transition-all duration-150 focus:outline-none ${activeTab === 'current'
            ? 'bg-gradient-to-r from-[#00ffe0] to-[#00bfae] text-black shadow-sm'
            : 'bg-[#223042] text-[#b0bed0]'}`}
          style={{ minWidth: 180 }}
            onClick={() => setActiveTab('current')}
          >
            Current Data
          </button>
          <button
          className={`px-6 py-2 rounded-full font-bold text-base transition-all duration-150 focus:outline-none ${activeTab === 'prediction'
            ? 'bg-gradient-to-r from-[#00ffe0] to-[#00bfae] text-black shadow-sm'
            : 'bg-[#223042] text-[#b0bed0]'}`}
          style={{ minWidth: 180 }}
            onClick={() => setActiveTab('prediction')}
          >
            Prediction & Signals
          </button>
        </div>
      {/* Price Analysis Section (Current Data) */}
      {activeTab === 'current' && (
        <>
          <div className="bg-[#101c24] border border-[#2a3748] rounded-2xl px-8 pt-8 pb-6 mb-8">
            <div className="mb-4">
              <div className="text-[15px] text-[#b0bed0] font-bold mb-1">Price Analysis</div>
              <div className="text-xs text-[#7a8ca3] mb-2">Historical price movements and patterns</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-white">{selectedStock}</span>
                <span className="text-2xl font-extrabold text-[#ff4d4f]">₹1,422.4</span>
                <span className="text-base font-bold text-[#ff4d4f]">-0.10 (-0.01%)</span>
      </div>
            </div>
            {/* Chart */}
            <div className="rounded-xl overflow-hidden mb-8 bg-[#18222e] border border-[#223042]">
              <TradingViewChart 
                symbol={selectedStock} 
                onHistoricalData={handleChartData}
              />
              </div>
            {/* OHLC Rows - modern, glassmorphed, with icons */}
            <div className="flex flex-col gap-4 mb-8">
              {/* Open, High, Low row */}
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <div className="flex-1 min-w-[160px] bg-[#0A1118] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-[#1E293B]/20">
                  <ArrowRight className="w-6 h-6 text-[#94A3B8]" />
                  <div>
                    <div className="text-xs text-[#94A3B8] font-medium">Open</div>
                    <div className="text-lg font-bold text-white">₹1,422.5</div>
          </div>
                </div>
                <div className="flex-1 min-w-[160px] bg-[#0A1118] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-[#1E293B]/20">
                  <ArrowUpRight className="w-6 h-6 text-[#00e6c7]" />
                  <div>
                    <div className="text-xs text-[#94A3B8] font-medium">High</div>
                    <div className="text-lg font-bold text-[#00e6c7]">₹1,450.848</div>
                </div>
                </div>
                <div className="flex-1 min-w-[160px] bg-[#0A1118] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-[#1E293B]/20">
                  <ArrowDownRight className="w-6 h-6 text-[#ff4d4f]" />
                  <div>
                    <div className="text-xs text-[#94A3B8] font-medium">Low</div>
                    <div className="text-lg font-bold text-[#ff4d4f]">₹1,393.952</div>
                </div>
                </div>
              </div>
              {/* Change, Change % row */}
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <div className="flex-1 min-w-[160px] bg-[#0A1118] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-[#1E293B]/20">
                  <ArrowDownLeft className="w-6 h-6 text-[#ff4d4f]" />
                  <div>
                    <div className="text-xs text-[#94A3B8] font-medium">Change</div>
                    <div className="text-lg font-bold text-[#ff4d4f]">-₹0.10</div>
                  </div>
                </div>
                <div className="flex-1 min-w-[160px] bg-[#0A1118] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-[#1E293B]/20">
                  <ArrowDownLeft className="w-6 h-6 text-[#ff4d4f]" />
                  <div>
                    <div className="text-xs text-[#94A3B8] font-medium">Change %</div>
                    <div className="text-lg font-bold text-[#ff4d4f]">-0.01%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Cards and Table below the chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Technical Signals Card */}
            <div className="p-6 bg-[#0A1118] border border-[#1E293B] rounded-xl flex flex-col shadow-lg shadow-[#1E293B]/20">
              <h3 className="text-base font-bold mb-1 text-white flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Technical Signals
              </h3>
              <div className="text-xs text-[#7a8ca3] mb-4">Key technical indicators and patterns</div>
              <div className="space-y-4">
                {/* RSI Card */}
                <div className="bg-[#0A1118] border border-[#1E293B] rounded-lg p-4 flex flex-col gap-2 shadow-lg shadow-[#1E293B]/20">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      RSI
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-[#1E293B] text-[#94A3B8] font-semibold">NEUTRAL</span>
                  </div>
                  <div className="text-xs text-[#94A3B8]">Relative Strength Index<br />Oversold conditions</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#94A3B8]">Signal Strength</span>
                    <span className="text-xs text-white font-bold">0%</span>
                  </div>
                </div>
                {/* MACD Card */}
                <div className="bg-[#0A1118] border border-[#1E293B] rounded-lg p-4 flex flex-col gap-2 shadow-lg shadow-[#1E293B]/20">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold flex items-center gap-2">
                      <BarChart2 className="w-4 h-4" />
                      MACD
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-[#1E293B] text-[#94A3B8] font-semibold">NEUTRAL</span>
                  </div>
                  <div className="text-xs text-[#94A3B8]">Moving Average Convergence Divergence<br />Neutral trend</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#94A3B8]">Signal Strength</span>
                    <span className="text-xs text-white font-bold">0%</span>
                      </div>
                </div>
              </div>
                        </div>
            {/* Market Sentiment Card */}
            <div className="p-6 bg-[#0A1118] border border-[#1E293B] rounded-xl flex flex-col shadow-lg shadow-[#1E293B]/20">
              <h3 className="text-base font-bold mb-1 text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Market Sentiment
              </h3>
              <div className="text-xs text-[#94A3B8] mb-4">News sentiment analysis</div>
              <div className="mb-2">
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className="text-[#00e6c7]">Positive 45%</span>
                  <span className="text-[#94A3B8]">Neutral 30%</span>
                  <span className="text-[#ff4d4f]">Negative 25%</span>
                  <span className="ml-auto text-[#00e6c7] font-bold">Moderately Bullish</span>
                </div>
                {/* Sentiment Bar */}
                <div className="w-full h-2 rounded-full bg-[#1E293B] overflow-hidden mb-2">
                  <div className="h-full bg-[#00e6c7]" style={{ width: '45%' }} />
                  <div className="h-full bg-[#94A3B8]" style={{ width: '30%' }} />
                  <div className="h-full bg-[#ff4d4f]" style={{ width: '25%' }} />
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-[#94A3B8]">Volume Impact</span>
                  <span className="text-white font-bold">High</span>
                  <span className="text-[#94A3B8] ml-4">Price Impact</span>
                  <span className="text-[#00e6c7] font-bold">Positive</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#94A3B8]">Sentiment Trend</span>
                  <div className="flex-1 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00e6c7]" style={{ width: '75%' }} />
                  </div>
                  <span className="text-xs text-white font-bold">75%</span>
                </div>
              </div>
            </div>
            {/* Sentiment Gauge Card */}
            <div className="p-6 bg-[#0A1118] border border-[#1E293B] rounded-xl flex flex-col items-center shadow-lg shadow-[#1E293B]/20">
              <h3 className="text-base font-bold mb-1 text-white flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                Sentiment Gauge
              </h3>
              <div className="text-xs text-[#94A3B8] mb-4">Overall market sentiment indicator</div>
              {/* Gauge SVG Placeholder */}
              <div className="w-full flex flex-col items-center">
                <svg width={180} height={90} style={{ display: 'block' }}>
                  <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#1E293B" strokeWidth={18} />
                  <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="url(#gaugeGradient)" strokeWidth={18} opacity={0.3} />
                  <defs>
                    <linearGradient id="gaugeGradient">
                      <stop offset="0%" stopColor="#00e6c7" />
                      <stop offset="50%" stopColor="#ffd600" />
                      <stop offset="100%" stopColor="#ff4d4f" />
                    </linearGradient>
                  </defs>
                  {/* Needle */}
                  <line x1={90} y1={90} x2={90 + 70 * Math.cos(Math.PI - 1.2)} y2={90 + 70 * Math.sin(Math.PI - 1.2)} stroke="white" strokeWidth={6} strokeLinecap="round" />
                  <circle cx={90} cy={90} r={8} fill="white" />
                </svg>
                <div className="text-3xl font-bold text-white mt-2">72</div>
                <div className="text-xs text-[#94A3B8]">Sentiment Score</div>
                        </div>
              <div className="flex justify-between w-full mt-4">
                <div className="flex flex-col items-center">
                  <div className="text-xs text-[#94A3B8]">Confidence Level</div>
                  <div className="text-lg font-bold text-[#00e6c7]">85%</div>
                      </div>
                <div className="flex flex-col items-center">
                  <div className="text-xs text-[#94A3B8]">Signal Strength</div>
                  <div className="text-lg font-bold text-[#00e6c7]">Strong Buy</div>
                </div>
              </div>
            </div>
          </div>
          {/* Articles and Sentiment Table */}
          <div className="mb-8 bg-[#0A1118] border border-[#1E293B] rounded-xl shadow-lg shadow-[#1E293B]/20">
            <h3 className="text-base font-bold mb-4 px-6 pt-6 text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Articles and Sentiment Analysis
            </h3>
            <div className="overflow-x-auto rounded-xl px-6 pb-6">
              <table className="min-w-full text-sm bg-[#0A1118] rounded-xl">
                <thead className="bg-[#1E293B] text-[#00e6c7]">
                  <tr>
                    <th className="px-3 py-2">Sentiment</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Base Score</th>
                    <th className="px-3 py-2">Weight</th>
                    <th className="px-3 py-2">Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={7} className="text-center text-[#94A3B8] py-4">No articles found.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}
      {activeTab === 'prediction' && (
        <>
          <div className="bg-[#101c24] border border-[#2a3748] rounded-2xl px-8 pt-8 pb-6 mb-8">
            <div className="mb-4">
              <div className="text-[15px] text-[#b0bed0] font-medium mb-1">ML Prediction & Signals</div>
            </div>
            <div className="rounded-xl overflow-hidden mb-8">
              <TradingViewChart symbol={selectedStock} />
            </div>
          </div>
          {/* Cards and Table below the ML Prediction chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Technical Signals Card */}
            <div className="p-6 bg-[#0A1118] border border-[#1E293B] rounded-xl flex flex-col shadow-lg shadow-[#1E293B]/20">
              <h3 className="text-base font-bold mb-1 text-white flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Technical Signals
              </h3>
              <div className="text-xs text-[#7a8ca3] mb-4">Key technical indicators and patterns</div>
              <div className="space-y-4">
                {/* RSI Card */}
                <div className="bg-[#0A1118] border border-[#1E293B] rounded-lg p-4 flex flex-col gap-2 shadow-lg shadow-[#1E293B]/20">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      RSI
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-[#1E293B] text-[#94A3B8] font-semibold">NEUTRAL</span>
                  </div>
                  <div className="text-xs text-[#94A3B8]">Relative Strength Index<br />Oversold conditions</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#94A3B8]">Signal Strength</span>
                    <span className="text-xs text-white font-bold">0%</span>
                  </div>
                </div>
                {/* MACD Card */}
                <div className="bg-[#0A1118] border border-[#1E293B] rounded-lg p-4 flex flex-col gap-2 shadow-lg shadow-[#1E293B]/20">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold flex items-center gap-2">
                      <BarChart2 className="w-4 h-4" />
                      MACD
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-[#1E293B] text-[#94A3B8] font-semibold">NEUTRAL</span>
                  </div>
                  <div className="text-xs text-[#94A3B8]">Moving Average Convergence Divergence<br />Neutral trend</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#94A3B8]">Signal Strength</span>
                    <span className="text-xs text-white font-bold">0%</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Market Sentiment Card */}
            <div className="p-6 bg-[#0A1118] border border-[#1E293B] rounded-xl flex flex-col shadow-lg shadow-[#1E293B]/20">
              <h3 className="text-base font-bold mb-1 text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Market Sentiment
              </h3>
              <div className="text-xs text-[#94A3B8] mb-4">News sentiment analysis</div>
              <div className="mb-2">
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className="text-[#00e6c7]">Positive 45%</span>
                  <span className="text-[#94A3B8]">Neutral 30%</span>
                  <span className="text-[#ff4d4f]">Negative 25%</span>
                  <span className="ml-auto text-[#00e6c7] font-bold">Moderately Bullish</span>
                </div>
                {/* Sentiment Bar */}
                <div className="w-full h-2 rounded-full bg-[#1E293B] overflow-hidden mb-2">
                  <div className="h-full bg-[#00e6c7]" style={{ width: '45%' }} />
                  <div className="h-full bg-[#94A3B8]" style={{ width: '30%' }} />
                  <div className="h-full bg-[#ff4d4f]" style={{ width: '25%' }} />
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-[#94A3B8]">Volume Impact</span>
                  <span className="text-white font-bold">High</span>
                  <span className="text-[#94A3B8] ml-4">Price Impact</span>
                  <span className="text-[#00e6c7] font-bold">Positive</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#94A3B8]">Sentiment Trend</span>
                  <div className="flex-1 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00e6c7]" style={{ width: '75%' }} />
                  </div>
                  <span className="text-xs text-white font-bold">75%</span>
                </div>
              </div>
        </div>
            {/* Sentiment Gauge Card */}
            <div className="p-6 bg-[#0A1118] border border-[#1E293B] rounded-xl flex flex-col items-center shadow-lg shadow-[#1E293B]/20">
              <h3 className="text-base font-bold mb-1 text-white flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                Sentiment Gauge
              </h3>
              <div className="text-xs text-[#94A3B8] mb-4">Overall market sentiment indicator</div>
              {/* Gauge SVG Placeholder */}
              <div className="w-full flex flex-col items-center">
                <svg width={180} height={90} style={{ display: 'block' }}>
                  <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#1E293B" strokeWidth={18} />
                  <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="url(#gaugeGradient)" strokeWidth={18} opacity={0.3} />
                  <defs>
                    <linearGradient id="gaugeGradient">
                      <stop offset="0%" stopColor="#00e6c7" />
                      <stop offset="50%" stopColor="#ffd600" />
                      <stop offset="100%" stopColor="#ff4d4f" />
                    </linearGradient>
                  </defs>
                  {/* Needle */}
                  <line x1={90} y1={90} x2={90 + 70 * Math.cos(Math.PI - 1.2)} y2={90 + 70 * Math.sin(Math.PI - 1.2)} stroke="white" strokeWidth={6} strokeLinecap="round" />
                  <circle cx={90} cy={90} r={8} fill="white" />
                </svg>
                <div className="text-3xl font-bold text-white mt-2">72</div>
                <div className="text-xs text-[#94A3B8]">Sentiment Score</div>
              </div>
              <div className="flex justify-between w-full mt-4">
                <div className="flex flex-col items-center">
                  <div className="text-xs text-[#94A3B8]">Confidence Level</div>
                  <div className="text-lg font-bold text-[#00e6c7]">85%</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xs text-[#94A3B8]">Signal Strength</div>
                  <div className="text-lg font-bold text-[#00e6c7]">Strong Buy</div>
                </div>
              </div>
            </div>
              </div>
          <div className="mb-8 bg-[#0A1118] border border-[#1E293B] rounded-xl shadow-lg shadow-[#1E293B]/20">
            <h3 className="text-base font-bold mb-4 px-6 pt-6 text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Articles and Sentiment Analysis
            </h3>
            <div className="overflow-x-auto rounded-xl px-6 pb-6">
              <table className="min-w-full text-sm bg-[#0A1118] rounded-xl">
                <thead className="bg-[#1E293B] text-[#00e6c7]">
                  <tr>
                    <th className="px-3 py-2">Sentiment</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Base Score</th>
                    <th className="px-3 py-2">Weight</th>
                    <th className="px-3 py-2">Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={7} className="text-center text-[#94A3B8] py-4">No articles found.</td></tr>
                </tbody>
              </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default AIAnalysis;