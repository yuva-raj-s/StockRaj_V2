import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ZoomIn, ZoomOut, Move, RotateCcw, AlertTriangle, LineChart, BarChart2, CandlestickChart } from 'lucide-react';
import { Line, Chart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TooltipItem,
  ChartOptions,
  ChartType
} from 'chart.js';
import { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin, { AnnotationPluginOptions } from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType> {
    zoom: ZoomPluginOptions;
    annotation: AnnotationPluginOptions;
  }
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  CandlestickController,
  CandlestickElement,
  zoomPlugin,
  annotationPlugin
);

interface YahooFinanceData {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

interface ChartData {
  timestamp: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

interface StockChartProps {
  symbol: string;
  data: {
    price: number;
    change: number;
    changePercent: number;
  };
  onRealtimeUpdate?: (data: { 
    price: number; 
    change: number; 
    changePercent: number; 
    symbol: string;
  }) => void;
  onHistoricalData?: (historicalData: ChartData | null) => void;
}

interface CandlestickData {
  o: number;
  h: number;
  l: number;
  c: number;
}

type AdvancedChartType = 'line' | 'area' | 'baseline' | 'candles';

interface HeikinAshiData {
  timestamp: number;
  ha_open: number;
  ha_high: number;
  ha_low: number;
  ha_close: number;
}

const isIndianMarketOpen = (): boolean => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);

  // Check if it's a weekday (0 = Sunday, 6 = Saturday)
  if (istTime.getUTCDay() === 0 || istTime.getUTCDay() === 6) {
    return false;
  }

  // Convert to hours and minutes in IST
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Market hours: 9:15 AM to 3:30 PM IST
  const marketOpenTime = 9 * 60 + 15;  // 9:15 AM
  const marketCloseTime = 15 * 60 + 30; // 3:30 PM

  return timeInMinutes >= marketOpenTime && timeInMinutes <= marketCloseTime;
};

const calculateHeikinAshi = (data: ChartData): HeikinAshiData[] => {
  const results: HeikinAshiData[] = [];
  
  for (let i = 0; i < data.timestamp.length; i++) {
    const current_open = data.open[i];
    const current_high = data.high[i];
    const current_low = data.low[i];
    const current_close = data.close[i];
    
    const ha_close = (current_open + current_high + current_low + current_close) / 4;
    
    const ha_open = i === 0 
      ? (current_open + current_close) / 2 
      : (results[i-1].ha_open + results[i-1].ha_close) / 2;
    
    const ha_high = Math.max(current_high, ha_open, ha_close);
    const ha_low = Math.min(current_low, ha_open, ha_close);
    
    results.push({
      timestamp: data.timestamp[i],
      ha_open,
      ha_high,
      ha_low,
      ha_close
    });
  }
  
  return results;
};

const StockChart: React.FC<StockChartProps> = ({ symbol, data, onRealtimeUpdate, onHistoricalData }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<AdvancedChartType>('candles');
  const [historicalData, setHistoricalData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(data.price);
  const [currentChange, setCurrentChange] = useState(data.change);
  const [currentChangePercent, setCurrentChangePercent] = useState(data.changePercent);
  const [ohlcData, setOhlcData] = useState({ open: 0, high: 0, low: 0 });
  const isPositive = currentChange >= 0;
  const candlestickChartRef = useRef<ChartJS<'candlestick'>>(null);
  const lineChartRef = useRef<ChartJS<'line'>>(null);
  const [isPanning, setIsPanning] = useState(false);

  const timeframes = [
    { id: '1D', label: '1D', interval: '1m', range: '1d' },
    { id: '1W', label: '1W', interval: '1d', range: '7d' },
    { id: '1M', label: '1M', interval: '1d', range: '1mo' },
    { id: '3M', label: '3M', interval: '1d', range: '3mo' },
    { id: '1Y', label: '1Y', interval: '1wk', range: '1y' },
    { id: 'ALL', label: 'ALL', interval: '1mo', range: 'max' }
  ];

  const fetchHistoricalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const selectedTimeframe = timeframes.find(tf => tf.id === timeframe);
      if (!selectedTimeframe) return;

      const formattedSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

      const response = await fetch(
        `http://localhost:3001/api/market-indices/historical/${formattedSymbol}?interval=${selectedTimeframe.interval}&range=${selectedTimeframe.range}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }
      
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        const histData: ChartData = {
          timestamp: result.data.map((d: YahooFinanceData) => d.timestamp),
          open: result.data.map((d: YahooFinanceData) => d.open),
          high: result.data.map((d: YahooFinanceData) => d.high),
          low: result.data.map((d: YahooFinanceData) => d.low),
          close: result.data.map((d: YahooFinanceData) => d.close),
          volume: result.data.map((d: YahooFinanceData) => d.volume)
        };

        const validData = histData.close.some(price => price !== null && price !== undefined);
        
        if (!validData) {
          throw new Error('No valid price data available');
        }

        setHistoricalData(histData);
        if (onHistoricalData) onHistoricalData(histData);
        
        // Update current price and OHLC data
        const latestPrice = histData.close[histData.close.length - 1];
        const previousPrice = histData.close[histData.close.length - 2] || result.meta.chartPreviousClose;
        const change = latestPrice - previousPrice;
        const changePercent = (change / previousPrice) * 100;
        
        // Update OHLC data for the current timeframe
        const currentOpen = histData.open[histData.open.length - 1];
        const dayHigh = Math.max(...histData.high.filter(h => h !== null));
        const dayLow = Math.min(...histData.low.filter(l => l !== null));
        
        setOhlcData({
          open: currentOpen,
          high: dayHigh,
          low: dayLow
        });
        
        setCurrentPrice(latestPrice);
        setCurrentChange(change);
        setCurrentChangePercent(changePercent);
        
        if (onRealtimeUpdate) {
          onRealtimeUpdate({
            price: latestPrice,
            change,
            changePercent,
            symbol
          });
        }
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch historical data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistoricalData();

    // Set up real-time updates only during market hours and only for 1D timeframe
    let interval: ReturnType<typeof setInterval> | null = null;

    const setupInterval = () => {
      if (isIndianMarketOpen() && timeframe === '1D') {
        // During market hours and 1D timeframe, update every 5 seconds
        interval = setInterval(fetchHistoricalData, 5000);
      } else {
        // Clear interval if market is closed or not in 1D timeframe
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    // Initial setup
    setupInterval();

    // Check market status every minute
    const marketCheckInterval = setInterval(() => {
      setupInterval();
    }, 60000);

    return () => {
      if (interval) clearInterval(interval);
      clearInterval(marketCheckInterval);
    };
  }, [symbol, timeframe]);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
      axis: 'x' as const
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        position: 'nearest' as const,
        backgroundColor: 'rgba(0, 8, 20, 0.95)',
        titleColor: '#00ffff',
        titleFont: { weight: 'bold' as const, size: 14 },
        bodyColor: '#ffffff',
        bodyFont: { size: 13 },
        borderColor: 'rgba(0, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        caretSize: 8,
        cornerRadius: 4,
        titleMarginBottom: 8,
        bodySpacing: 6,
        boxPadding: 4
      }
    }
  };

  const formatVolume = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getCandlestickScaling = () => {
    if (!historicalData) return null;
    
    const prices = [
      ...historicalData.high,
      ...historicalData.low,
      ...historicalData.open,
      ...historicalData.close
    ].filter(p => p !== null && !isNaN(p));
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.05; // 5% padding

    return {
      min: minPrice - padding,
      max: maxPrice + padding,
      stepSize: priceRange / 8
    };
  };

  const getCommonScaleOptions = (timeframe: string) => {
    const is1DayTimeframe = timeframe === '1D';
    
    return {
      x: {
        type: 'time' as const,
        time: {
          unit: is1DayTimeframe ? 'hour' as const : 'day' as const,
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy'
          },
          tooltipFormat: is1DayTimeframe ? 'HH:mm' : 'MMM dd, yyyy'
        },
        grid: {
          color: 'rgba(0, 255, 255, 0.05)',
          tickColor: 'rgba(0, 255, 255, 0.1)',
          borderColor: 'rgba(0, 255, 255, 0.1)',
          lineWidth: 1
        },
        ticks: {
          color: 'rgba(0, 255, 255, 0.7)',
          font: {
            family: 'monospace',
            size: 11
          },
          maxRotation: 0,
          autoSkip: true,
          padding: 8
        }
      },
      y: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 255, 255, 0.05)',
          tickColor: 'rgba(0, 255, 255, 0.1)',
          borderColor: 'rgba(0, 255, 255, 0.1)',
          lineWidth: 1
        },
        ticks: {
          color: 'rgba(0, 255, 255, 0.7)',
          font: {
            family: 'monospace',
            size: 11
          },
          padding: 8
        }
      }
    };
  };

  const getCandlestickOptions = (timeframe: string): ChartOptions<'candlestick'> => {
    const baseOptions = { ...defaultOptions };
    const commonScaleOptions = getCommonScaleOptions(timeframe);
    const scaling = getCandlestickScaling();

    return {
      ...baseOptions,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        ...commonScaleOptions,
        y: {
          ...commonScaleOptions.y,
          position: 'right',
          min: scaling?.min,
          max: scaling?.max,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            display: true
          },
          border: {
            display: true,
            color: 'rgba(255, 255, 255, 0.3)'
          },
          ticks: {
            ...commonScaleOptions.y.ticks,
            count: 8,
            stepSize: scaling?.stepSize,
            padding: 8,
            callback(tickValue) {
              return `₹${Number(tickValue).toFixed(2)}`;
            }
          }
        },
        x: {
          ...commonScaleOptions.x,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            display: true
          },
          border: {
            display: true,
            color: 'rgba(255, 255, 255, 0.3)'
          },
          ticks: {
            ...commonScaleOptions.x.ticks,
            maxRotation: 0,
            autoSkip: true,
            padding: 8
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          ...baseOptions.plugins.tooltip,
          callbacks: {
            label(context: TooltipItem<'candlestick'>) {
              if (!context.raw) return '';
              const data = context.raw as CandlestickData;
              return [
                `Open: ₹${data.o?.toFixed(2)}`,
                `High: ₹${data.h?.toFixed(2)}`,
                `Low: ₹${data.l?.toFixed(2)}`,
                `Close: ₹${data.c?.toFixed(2)}`
              ];
            },
            labelTextColor: () => '#fff'
          }
        },
        zoom: {
          pan: {
            enabled: false,
            mode: 'x',
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            mode: 'x',
          },
          limits: {
            x: {min: 'original', max: 'original'},
            y: {min: 'original', max: 'original'}
          }
        }
      }
    };
  };

  const getVolumeOptions = (timeframe: string): ChartOptions<'bar'> => {
    const baseOptions = { ...defaultOptions };
    const commonScaleOptions = getCommonScaleOptions(timeframe);

    return {
      ...baseOptions,
      scales: {
        ...commonScaleOptions,
        y: {
          ...commonScaleOptions.y,
          position: 'right',
          ticks: {
            ...commonScaleOptions.y.ticks,
            callback(tickValue) {
              return formatVolume(Number(tickValue));
            }
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          ...baseOptions.plugins.tooltip,
          callbacks: {
            title(context) {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: timeframe === '1D' ? 'numeric' : undefined,
                minute: timeframe === '1D' ? 'numeric' : undefined
              });
            },
            label(context: TooltipItem<'bar'>) {
              if (!context.raw) return '';
              return `Volume: ${formatVolume(Number(context.raw))}`;
            },
            labelTextColor: () => '#fff'
          }
        }
      }
    };
  };

  const getLineOptions = (timeframe: string): ChartOptions<'line'> => {
    const baseOptions = { ...defaultOptions };
    const commonScaleOptions = getCommonScaleOptions(timeframe);

    return {
      ...baseOptions,
      scales: {
        ...commonScaleOptions,
        y: {
          ...commonScaleOptions.y,
          position: 'right',
          ticks: {
            ...commonScaleOptions.y.ticks,
            callback(tickValue) {
              return `₹${Number(tickValue).toFixed(2)}`;
            }
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          ...baseOptions.plugins.tooltip,
          callbacks: {
            title(context) {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: timeframe === '1D' ? 'numeric' : undefined,
                minute: timeframe === '1D' ? 'numeric' : undefined
              });
            },
            label(context: TooltipItem<'line'>) {
              if (!context.raw) return '';
              return `Price: ₹${Number(context.raw).toFixed(2)}`;
            },
            labelTextColor: () => '#fff'
          }
        }
      }
    };
  };

  const getChartOptions = (type: AdvancedChartType, timeframe: string): ChartOptions<ChartType> => {
    switch (type) {
      case 'candles':
        return getCandlestickOptions(timeframe) as ChartOptions<ChartType>;
      case 'volume':
        return getVolumeOptions(timeframe) as ChartOptions<ChartType>;
      case 'line':
        return getLineOptions(timeframe) as ChartOptions<ChartType>;
      default:
        return getLineOptions(timeframe) as ChartOptions<ChartType>;
    }
  };

  const handleZoomIn = () => {
    const currentChart = chartType === 'candles' 
      ? candlestickChartRef.current 
      : lineChartRef.current;

    if (currentChart) {
      currentChart.zoom(1.1);
    }
  };

  const handleZoomOut = () => {
    const currentChart = chartType === 'candles' 
      ? candlestickChartRef.current 
      : lineChartRef.current;

    if (currentChart) {
      currentChart.zoom(0.9);
    }
  };

  const handlePanMode = () => {
    const currentChart = chartType === 'candles' 
      ? candlestickChartRef.current 
      : lineChartRef.current;

    if (currentChart) {
      setIsPanning(!isPanning);
      const options = currentChart.options;
      if (options.plugins?.zoom?.pan) {
        options.plugins.zoom.pan.enabled = !isPanning;
      }
      currentChart.update();
    }
  };

  const handleResetZoom = () => {
    const currentChart = chartType === 'candles' 
      ? candlestickChartRef.current 
      : lineChartRef.current;

    if (currentChart) {
      currentChart.resetZoom();
    }
  };

  const renderChartControls = () => {
    if (!symbol) return null;

    return (
      <div className="absolute top-4 left-4 flex items-center space-x-2 z-10 bg-black/20 backdrop-blur-sm p-2 rounded-lg border border-white/10">
        <button
          onClick={handleZoomIn}
          className={`p-1.5 rounded-md transition-all duration-200 ${
            isPanning ? 'bg-white/5 text-gray-400' : 'bg-white/10 text-white hover:bg-accent hover:text-black'
          }`}
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={handleZoomOut}
          className={`p-1.5 rounded-md transition-all duration-200 ${
            isPanning ? 'bg-white/5 text-gray-400' : 'bg-white/10 text-white hover:bg-accent hover:text-black'
          }`}
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={handlePanMode}
          className={`p-1.5 rounded-md transition-all duration-200 ${
            isPanning ? 'bg-accent text-black' : 'bg-white/10 text-white hover:bg-accent hover:text-black'
          }`}
          title="Pan Mode"
        >
          <Move size={14} />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 rounded-md bg-white/10 text-white hover:bg-accent hover:text-black transition-all duration-200"
          title="Reset View"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    );
  };

  const chartTypes = [
    { id: 'line', label: 'Line', icon: <LineChart className="w-4 h-4" /> },
    { id: 'area', label: 'Area', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'baseline', label: 'Baseline', icon: <LineChart className="w-4 h-4" /> },
    { id: 'candles', label: 'Candles', icon: <CandlestickChart className="w-4 h-4" /> }
  ];

  const renderChart = () => {
    if (!historicalData) return null;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
      plugins: {
        zoom: {
          pan: {
            enabled: isPanning,
            mode: 'x' as 'x' | 'y' | 'xy'
          },
          zoom: {
            wheel: {
              enabled: !isPanning,
            },
            pinch: {
              enabled: !isPanning
            },
            mode: 'x' as 'x' | 'y' | 'xy',
          },
          limits: {
            x: {min: 'original' as const, max: 'original' as const},
            y: {min: 'original' as const, max: 'original' as const}
          }
        }
      }
    };

    switch (chartType) {
      case 'line': {
        const options = {
          ...getLineOptions(timeframe),
          ...commonOptions
        };

        return (
          <Line 
            height={350}
            ref={lineChartRef}
            data={{
              labels: historicalData.timestamp.map(t => new Date(t * 1000).getTime()),
              datasets: [{
                label: 'Price',
                data: historicalData.close,
                borderColor: isPositive ? '#00ff7f' : '#ff3232',
                backgroundColor: 'transparent',
                tension: 0.1,
                pointRadius: timeframe === '1D' ? 1 : 0,
                pointHoverRadius: 4,
                borderWidth: 2
              }]
            }}
            options={options}
          />
        );
      }
      
      case 'area': {
        const options = {
          ...getLineOptions(timeframe),
          ...commonOptions,
          fill: true,
          elements: {
            point: {
              radius: 3,
              backgroundColor: '#fff',
              borderColor: isPositive ? '#00ff7f' : '#ff3232',
              borderWidth: 2,
              hoverRadius: 5,
              hoverBorderWidth: 3
            }
          }
        };

        return (
          <Line 
            height={350}
            ref={lineChartRef}
            data={{
              labels: historicalData.timestamp.map(t => new Date(t * 1000).getTime()),
              datasets: [{
                label: 'Price',
                data: historicalData.close,
                borderColor: isPositive ? '#00ff7f' : '#ff3232',
                backgroundColor: (context) => {
                  const ctx = context.chart.ctx;
                  const gradient = ctx.createLinearGradient(0, 0, 0, 350);
                  if (isPositive) {
                    gradient.addColorStop(0, 'rgba(0, 255, 127, 0.2)');
                    gradient.addColorStop(0.5, 'rgba(0, 255, 127, 0.05)');
                    gradient.addColorStop(1, 'rgba(0, 255, 127, 0)');
                  } else {
                    gradient.addColorStop(0, 'rgba(255, 50, 50, 0.2)');
                    gradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.05)');
                    gradient.addColorStop(1, 'rgba(255, 50, 50, 0)');
                  }
                  return gradient;
                },
                fill: true,
                tension: 0.2,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: isPositive ? '#00ff7f' : '#ff3232',
                pointBorderWidth: 2,
                pointHitRadius: 10,
                pointStyle: 'circle',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: isPositive ? '#00ff7f' : '#ff3232',
                pointHoverBorderWidth: 3
              }]
            }}
            options={options}
          />
        );
      }

      case 'baseline': {
        const options = {
          ...getLineOptions(timeframe),
          ...commonOptions,
          fill: true,
          plugins: {
            ...commonOptions.plugins,
            annotation: {
              annotations: {
                baseline: {
                  type: 'line' as const,
                  yMin: historicalData.close[0],
                  yMax: historicalData.close[0],
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 1,
                  borderDash: [5, 5]
                }
              }
            }
          }
        };

        return (
          <Line 
            height={350}
            ref={lineChartRef}
            data={{
              labels: historicalData.timestamp.map(t => new Date(t * 1000).getTime()),
              datasets: [{
                label: 'Price',
                data: historicalData.close,
                borderColor: (context) => {
                  const value = context.raw as number;
                  return value >= historicalData.close[0] ? '#00ff7f' : '#ff3232';
                },
                backgroundColor: (context) => {
                  const value = context.raw as number;
                  return value >= historicalData.close[0] 
                    ? 'rgba(0, 255, 127, 0.1)'
                    : 'rgba(255, 50, 50, 0.1)';
                },
                fill: 'origin',
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 2,
                segment: {
                  borderColor: (context) => {
                    const value = context.p1.parsed.y;
                    return value >= historicalData.close[0] ? '#00ff7f' : '#ff3232';
                  }
                }
              }]
            }}
            options={options}
          />
        );
      }

      case 'candles': {
        const options = {
          ...getCandlestickOptions(timeframe),
          ...commonOptions
        };

        const candlestickData = historicalData.timestamp.map((t, i) => ({
          x: new Date(t * 1000).getTime(),
          o: historicalData.open[i],
          h: historicalData.high[i],
          l: historicalData.low[i],
          c: historicalData.close[i]
        }));

        return (
          <Chart 
            type="candlestick"
            height={350}
            ref={candlestickChartRef}
            data={{
              datasets: [{
                label: 'OHLC',
                data: candlestickData,
                backgroundColor: (ctx) => {
                  const candlestick = ctx.raw as { o: number; c: number };
                  return candlestick.o <= candlestick.c ? 
                    'rgba(0, 255, 127, 0.5)' : 
                    'rgba(255, 50, 50, 0.5)';
                },
                borderColor: (ctx) => {
                  const candlestick = ctx.raw as { o: number; c: number };
                  return candlestick.o <= candlestick.c ? 
                    '#00ff7f' : 
                    '#ff3232';
                },
                borderWidth: 1.5,
                borderSkipped: false
              }]
            }}
            options={options}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{symbol}</h2>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${isPositive ? 'text-[#00ff7f]' : 'text-[#ff3232]'}`}>
              ₹{currentPrice.toFixed(2)}
            </span>
            <span className={`flex items-center ${isPositive ? 'text-[#00ff7f]' : 'text-[#ff3232]'}`}>
              {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {currentChange.toFixed(2)} ({currentChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {/* Chart Type Buttons - Left Side */}
          <div className="flex gap-2 bg-black/20 p-1 rounded-lg backdrop-blur-sm border border-white/5">
            {chartTypes.map(type => (
            <button
                key={type.id}
                onClick={() => setChartType(type.id as AdvancedChartType)}
                className={`px-4 py-1.5 rounded-md transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                  chartType === type.id
                    ? 'bg-accent text-black shadow-lg shadow-accent/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {type.icon}
                {type.label}
            </button>
            ))}
          </div>

          {/* Timeframe Buttons - Right Side */}
          <div className="flex gap-2 bg-black/20 p-1 rounded-lg backdrop-blur-sm border border-white/5">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm font-medium ${
                  timeframe === tf.id
                    ? 'bg-accent text-black shadow-lg shadow-accent/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/10 via-purple-500/10 to-accent/10 rounded-xl blur-lg opacity-75"></div>
        <div className="relative h-[400px] w-full bg-[#0A1118]/90 backdrop-blur-sm border border-white/10 rounded-lg p-4 transition-all duration-300">
          {renderChartControls()}
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-2"></div>
              <div className="text-gray-400">Loading chart data...</div>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-red-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {error}
              </div>
            </div>
          ) : historicalData ? (
            <div className="h-full w-full">
              {renderChart()}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-400">No data available</div>
            </div>
          )}
        </div>
      </div>

      {/* OHLC Data Display */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass p-3 rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm transition-colors duration-200 hover:bg-black/30">
          <div className="text-sm text-gray-400 mb-1">Open</div>
          <div className="text-base font-medium text-white">
            ₹{ohlcData.open.toFixed(2)}
          </div>
        </div>
        <div className="glass p-3 rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm transition-colors duration-200 hover:bg-black/30">
          <div className="text-sm text-gray-400 mb-1">High</div>
          <div className="text-base font-medium text-[#00ff7f]">
            ₹{ohlcData.high.toFixed(2)}
          </div>
        </div>
        <div className="glass p-3 rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm transition-colors duration-200 hover:bg-black/30">
          <div className="text-sm text-gray-400 mb-1">Low</div>
          <div className="text-base font-medium text-[#ff3232]">
            ₹{ohlcData.low.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;