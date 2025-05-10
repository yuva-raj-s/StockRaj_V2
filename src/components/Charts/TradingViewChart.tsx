import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  Time,
  LineData,
  HistogramData,
  SeriesOptionsMap,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  BaselineSeries,
  HistogramSeries
} from 'lightweight-charts';
import {
  ArrowUp,
  ArrowDown,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  AlertTriangle,
  LineChart,
  BarChart2,
  CandlestickChart,
} from 'lucide-react';
import { isIndianMarketOpen } from '../../utils/marketHours';

// Define the data structure that matches your backend response
interface BackendData {
  data: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  symbol: string;
  interval: string;
  range: string;
}

interface TradingViewBar {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartResponse {
  data: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  symbol: string;
  interval: string;
  range: string;
  message?: string;
}

export interface ChartData {
  data: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  symbol: string;
  interval: string;
  range: string;
}

export interface TradingViewChartProps {
  symbol: string;
  onHistoricalData?: (historicalData: ChartData | null) => void;
}

type ChartType = 'candles' | 'line' | 'area' | 'baseline';

const TIMEFRAMES = [
  { id: '1D', label: '1D', interval: '1d', range: '1d' },
  { id: '1W', label: '1W', interval: '1d', range: '5d' },
  { id: '1M', label: '1M', interval: '1d', range: '1mo' },
  { id: '3M', label: '3M', interval: '1d', range: '3mo' },
  { id: '1Y', label: '1Y', interval: '1d', range: '1y' },
  { id: 'ALL', label: 'ALL', interval: '1wk', range: 'max' }
];

const CHART_TYPES = [
  {
    id: 'line',
    label: 'Line',
    icon: <LineChart className="w-4 h-4" />,
  },
  {
    id: 'area',
    label: 'Area',
    icon: <BarChart2 className="w-4 h-4" />,
  },
  {
    id: 'baseline',
    label: 'Baseline',
    icon: <LineChart className="w-4 h-4" />,
  },
  {
    id: 'candles',
    label: 'Candles',
    icon: <CandlestickChart className="w-4 h-4" />,
  },
];

// Helper function to validate numeric value
const isValidNumber = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

// Helper function to convert UTC to IST timestamp
const convertToIST = (utcTimestamp: number): number => {
  // Add 5 hours and 30 minutes to convert to IST
  return utcTimestamp + (5.5 * 60 * 60);
};

// Helper function to validate candlestick data
const validateCandlestickData = (data: BackendData): TradingViewBar[] => {
  if (!data?.data || !Array.isArray(data.data)) {
    console.warn('Invalid data structure:', data);
    return [];
  }

  return data.data
    .filter(bar => {
      const isValid = (
        bar &&
        isValidNumber(bar.open) &&
        isValidNumber(bar.high) &&
        isValidNumber(bar.low) &&
        isValidNumber(bar.close) &&
        isValidNumber(bar.timestamp)
      );
      if (!isValid) {
        console.warn('Invalid candlestick data:', bar);
      }
      return isValid;
    })
    .map(bar => ({
      time: convertToIST(bar.timestamp) as Time,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume
    }));
};

// Helper function to validate line/area/baseline data
const validateLineData = (data: BackendData): LineData[] => {
  if (!data?.data || !Array.isArray(data.data)) {
    console.warn('Invalid data structure:', data);
    return [];
  }

  return data.data
    .filter(bar => {
      const isValid = bar && isValidNumber(bar.close) && isValidNumber(bar.timestamp);
      if (!isValid) {
        console.warn('Invalid line data:', bar);
      }
      return isValid;
    })
    .map(bar => ({
      time: convertToIST(bar.timestamp) as Time,
      value: bar.close
    }));
};

// Helper function to validate histogram data
const validateHistogramData = (data: BackendData): HistogramData[] => {
  if (!data?.data || !Array.isArray(data.data)) {
    console.warn('Invalid data structure:', data);
    return [];
  }

  return data.data
    .filter(bar => {
      const isValid = bar && isValidNumber(bar.volume) && isValidNumber(bar.timestamp);
      if (!isValid) {
        console.warn('Invalid histogram data:', bar);
      }
      return isValid;
    })
    .map(bar => ({
      time: convertToIST(bar.timestamp) as Time,
      value: bar.volume,
      color: bar.close >= bar.open ? 'rgba(0,255,127,0.5)' : 'rgba(255,50,50,0.5)'
    }));
};

// Add helper function to get market close time
const getLastMarketCloseTime = (): string => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  
  // If it's before 9:15 AM IST, show previous day's close time
  if (istTime.getHours() < 9 || (istTime.getHours() === 9 && istTime.getMinutes() < 15)) {
    istTime.setDate(istTime.getDate() - 1);
  }
  
  // Set to 3:30 PM IST
  istTime.setHours(15, 30, 0, 0);
  
  return istTime.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Add helper function to format NSE symbol
const formatNSESymbol = (symbol: string): string => {
  return symbol.trim().toUpperCase().replace(/\.NS$/, '') + '.NS';
};

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, onHistoricalData }) => {
  // State hooks
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bars, setBars] = useState<TradingViewBar[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [currentChange, setCurrentChange] = useState<number | null>(null);
  const seriesRefs = useRef<ISeriesApi<keyof SeriesOptionsMap>[]>([]);
  const [lastCloseTime, setLastCloseTime] = useState<string>(getLastMarketCloseTime());

  // Callback hooks
  const handleChartData = useCallback((data: BackendData | null) => {
    if (data && Array.isArray(data.data)) {
      const candleData = validateCandlestickData(data);
      setBars(candleData);
      
      // Update price info
      if (candleData.length > 1) {
        const last = candleData[candleData.length - 1];
        const prev = candleData[candleData.length - 2];
        setCurrentPrice(last.close);
        setCurrentChange(last.close - prev.close);
      } else if (candleData.length === 1) {
        setCurrentPrice(candleData[0].close);
        setCurrentChange(0);
      } else {
        setCurrentPrice(null);
        setCurrentChange(null);
      }

      if (onHistoricalData) {
        onHistoricalData(data);
      }
    } else {
      setBars([]);
      setCurrentPrice(null);
      setCurrentChange(null);
      if (onHistoricalData) {
        onHistoricalData(null);
      }
    }
  }, [onHistoricalData]);

  // Update fetchData to use formatted symbol
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedSymbol = formatNSESymbol(symbol);
      const tf = TIMEFRAMES.find((t) => t.id === timeframe);
      if (!tf) throw new Error('Invalid timeframe');
      
      const res = await fetch(`/api/market-indices/historical/${formattedSymbol}?interval=${tf.interval}&range=${tf.range}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();
      handleChartData(json);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      handleChartData(null);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe, handleChartData]);

  // Fetch data on mount and when symbol/timeframe changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeframe]);

  // Chart setup and cleanup
  useEffect(() => {
    if (!chartContainerRef.current) return;
    // Remove previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'rgba(10, 17, 24, 0.9)' },
        textColor: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontFamily: 'Inter, Mukta, Hind, Poppins, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.08)' },
        horzLines: { color: 'rgba(255,255,255,0.08)' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: 'rgba(255,255,255,0.3)', width: 1, style: 1, visible: true, labelBackgroundColor: 'rgba(0,0,0,0.8)' },
        horzLine: { color: 'rgba(255,255,255,0.3)', width: 1, style: 1, visible: true, labelBackgroundColor: 'rgba(0,0,0,0.8)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.15)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.15)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 0,
        barSpacing: 6,
        minBarSpacing: 4,
        fixLeftEdge: true,
        fixRightEdge: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          if (timeframe === '1D') {
            return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
          }
          return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: timeframe === 'ALL' ? 'numeric' : undefined });
        },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });
    chartRef.current = chart;
    // Hide watermark if any
    if (chartContainerRef.current) {
      const style = document.createElement('style');
      style.textContent = `.tv-lightweight-charts > div > div > div:last-child { display: none !important; }`;
      chartContainerRef.current.appendChild(style);
    }
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [timeframe]);

  // Draw chart series when data or chartType changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !bars?.length) {
      console.warn('No chart or data available');
      return;
    }

    // Remove previous series - Fix the error by checking for valid series
    try {
      const currentSeries = seriesRefs.current;
      if (currentSeries && currentSeries.length > 0) {
        currentSeries.forEach((series) => {
          if (series && chart) {
            try {
              chart.removeSeries(series);
            } catch (e) {
              console.warn('Error removing individual series:', e);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error removing series:', error);
    }
    seriesRefs.current = [];

    // Convert bars to BackendData format
    const chartData: BackendData = {
      data: bars.map(bar => ({
        timestamp: Number(bar.time),
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume
      })),
      symbol: symbol,
      interval: TIMEFRAMES.find(tf => tf.id === timeframe)?.interval || '1d',
      range: TIMEFRAMES.find(tf => tf.id === timeframe)?.range || '1d'
    };

    // Get the base price for baseline chart
    const basePrice = bars[0]?.close || 0;

    try {
      // Main price series
      let mainSeries: ISeriesApi<keyof SeriesOptionsMap>;
      switch (chartType) {
        case 'candles': {
          const candleData = validateCandlestickData(chartData);
          if (candleData.length === 0) {
            console.error('No valid candlestick data available');
            return;
          }
          const series = chart.addSeries(CandlestickSeries, {
            upColor: '#00ff7f',
            downColor: '#ff3232',
            borderUpColor: '#00ff7f',
            borderDownColor: '#ff3232',
            wickUpColor: '#00ff7f',
            wickDownColor: '#ff3232',
            borderVisible: true,
            wickVisible: true,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
          });
          series.setData(candleData);
          mainSeries = series;
          break;
        }
        case 'area': {
          const areaData = validateLineData(chartData);
          if (areaData.length === 0) {
            console.error('No valid area data available');
            return;
          }
          const series = chart.addSeries(AreaSeries, {
            lineColor: (currentChange ?? 0) >= 0 ? '#00ff7f' : '#ff3232',
            topColor: (currentChange ?? 0) >= 0 ? 'rgba(0,255,127,0.4)' : 'rgba(255,50,50,0.4)',
            bottomColor: (currentChange ?? 0) >= 0 ? 'rgba(0,255,127,0.1)' : 'rgba(255,50,50,0.1)',
            lineWidth: 2,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
          });
          series.setData(areaData);
          mainSeries = series;
          break;
        }
        case 'baseline': {
          const baselineData = validateLineData(chartData);
          if (baselineData.length === 0) {
            console.error('No valid baseline data available');
            return;
          }
          const series = chart.addSeries(BaselineSeries, {
            baseValue: { type: 'price', price: basePrice },
            topLineColor: '#00ff7f',
            topFillColor1: 'rgba(0,255,127,0.2)',
            topFillColor2: 'rgba(0,255,127,0.1)',
            bottomLineColor: '#ff3232',
            bottomFillColor1: 'rgba(255,50,50,0.2)',
            bottomFillColor2: 'rgba(255,50,50,0.1)',
            lineWidth: 2,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
          });
          series.setData(baselineData);
          mainSeries = series;
          break;
        }
        case 'line':
        default: {
          const lineData = validateLineData(chartData);
          if (lineData.length === 0) {
            console.error('No valid line data available');
            return;
          }
          const series = chart.addSeries(LineSeries, {
            color: (currentChange ?? 0) >= 0 ? '#00ff7f' : '#ff3232',
            lineWidth: 2,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
          });
          series.setData(lineData);
          mainSeries = series;
          break;
        }
      }

      seriesRefs.current.push(mainSeries);

      // Volume series
      const volumeData = validateHistogramData(chartData);
      if (volumeData.length > 0) {
        const volumeSeries = chart.addSeries(HistogramSeries, {
          color: '#26a69a',
          priceFormat: { type: 'price', precision: 0, minMove: 1 },
          priceScaleId: ''
        });
        volumeSeries.setData(volumeData);
        chart.priceScale('').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
        seriesRefs.current.push(volumeSeries);
      }

      // Fit content
      chart.timeScale().fitContent();
    } catch (error) {
      console.error('Error creating chart series:', error);
    }
  }, [bars, chartType, currentChange, symbol, timeframe]);

  // Update real-time data handling
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const updateData = async () => {
      try {
        const formattedSymbol = formatNSESymbol(symbol);
        const currentTimeframe = TIMEFRAMES.find(tf => tf.id === timeframe) || TIMEFRAMES[0];
        const res = await fetch(`/api/market-indices/historical/${formattedSymbol}?interval=${currentTimeframe.interval}&range=${currentTimeframe.range}`);
        const json = await res.json();
        
        if (!res.ok) {
          throw new Error(json.message || `HTTP ${res.status}`);
        }
        
        if (json.data && Array.isArray(json.data)) {
          if (json.data.length === 0) {
            console.warn(`No data available for ${formattedSymbol}`);
            return;
          }

          const arr = json.data.map((d: {
            timestamp: number;
            open: number;
            high: number;
            low: number;
            close: number;
            volume: number;
          }) => ({
            time: convertToIST(d.timestamp) as Time,
            open: Number(d.open),
            high: Number(d.high),
            low: Number(d.low),
            close: Number(d.close),
            volume: Number(d.volume)
          }));

          setBars(arr);
          
          if (onHistoricalData) {
            onHistoricalData({
              data: json.data.map((d: {
                timestamp: number;
                open: number;
                high: number;
                low: number;
                close: number;
                volume: number;
              }) => ({
                ...d,
                timestamp: convertToIST(d.timestamp)
              })),
              symbol: formattedSymbol,
              interval: json.interval,
              range: json.range
            });
          }
        }
      } catch (error) {
        console.error('Error updating chart data:', error);
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    // Initial update
    updateData();

    // Set up interval based on timeframe
    if (timeframe === '1D' && isIndianMarketOpen()) {
      interval = setInterval(updateData, 15000); // Update every 15 seconds for 1D
    } else if (timeframe === '1W') {
      interval = setInterval(updateData, 30000); // Update every 30 seconds for 1W
    } else {
      interval = setInterval(updateData, 60000); // Update every minute for other timeframes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [symbol, timeframe, onHistoricalData]);

  // Update last close time when market status changes
  useEffect(() => {
    if (!isIndianMarketOpen()) {
      setLastCloseTime(getLastMarketCloseTime());
    }
  }, []);

  // Chart controls
  const handleZoomIn = () => {
    const chart = chartRef.current;
    if (chart) chart.timeScale().scrollToPosition(-5, false);
  };
  const handleZoomOut = () => {
    const chart = chartRef.current;
    if (chart) chart.timeScale().scrollToPosition(5, false);
  };
  const handleResetZoom = () => {
    const chart = chartRef.current;
    if (chart) chart.timeScale().fitContent();
  };
  const handlePanMode = () => {
    setIsPanning((prev) => !prev);
    const chart = chartRef.current;
    if (chart) {
      chart.applyOptions({
        handleScroll: {
          mouseWheel: !isPanning,
          pressedMouseMove: isPanning,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: isPanning,
          mouseWheel: !isPanning,
          pinch: true,
        },
      });
    }
  };

  // UI
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{symbol}</h2>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${
              (currentChange ?? 0) >= 0 ? 'text-[#00ff7f]' : 'text-[#ff3232]'
            }`}>
              ₹{currentPrice?.toFixed(2) ?? '--'}
            </span>
            <span
              className={`flex items-center ${
                (currentChange ?? 0) >= 0 ? 'text-[#00ff7f]' : 'text-[#ff3232]'
              }`}
            >
              {(currentChange ?? 0) >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {currentChange !== null ? `${currentChange.toFixed(2)} (${((currentChange / (currentPrice ?? 1)) * 100).toFixed(2)}%)` : '--'}
            </span>
            {timeframe === '1D' && !isIndianMarketOpen() && (
              <span className="text-sm text-gray-400 ml-2">
                Last close: {lastCloseTime}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 bg-black/20 p-1 rounded-lg backdrop-blur-sm border border-white/5">
            {CHART_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id as ChartType)}
                className={`px-4 py-1.5 rounded-md transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                  chartType === type.id
                    ? 'bg-accent text-black shadow-lg shadow-accent/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                aria-label={type.label}
                type="button"
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 bg-black/20 p-1 rounded-lg backdrop-blur-sm border border-white/5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm font-medium ${
                  timeframe === tf.id
                    ? 'bg-accent text-black shadow-lg shadow-accent/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                aria-label={tf.label}
                type="button"
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/10 via-purple-500/10 to-accent/10 rounded-xl blur-lg opacity-75" />
        <div className="relative h-[400px] w-full bg-[#0A1118]/90 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
          {/* Chart Controls */}
          <div className="absolute top-4 left-4 flex items-center space-x-2 z-10 bg-black/20 backdrop-blur-sm p-2 rounded-lg border border-white/10">
            <button
              onClick={handleZoomIn}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                isPanning ? 'bg-white/5 text-gray-400' : 'bg-white/10 text-white hover:bg-accent hover:text-black'
              }`}
              title="Zoom In"
              type="button"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={handleZoomOut}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                isPanning ? 'bg-white/5 text-gray-400' : 'bg-white/10 text-white hover:bg-accent hover:text-black'
              }`}
              title="Zoom Out"
              type="button"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={handlePanMode}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                isPanning ? 'bg-accent text-black' : 'bg-white/10 text-white hover:bg-accent hover:text-black'
              }`}
              title="Pan Mode"
              type="button"
            >
              <Move size={14} />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-md bg-white/10 text-white hover:bg-accent hover:text-black transition-all duration-200"
              title="Reset View"
              type="button"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          {/* Chart Area */}
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-400">Loading chart...</div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-red-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {error}
              </div>
            </div>
          ) : (
            <div
              ref={chartContainerRef}
              className="h-full w-full overflow-hidden"
              style={{ margin: 0, padding: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingViewChart; 