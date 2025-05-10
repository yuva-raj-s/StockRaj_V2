import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendData {
  date: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
}

interface SectorTrend {
  historical: TrendData[];
  current: {
    price: number;
    change_percent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
  };
  topGainers: Array<{
    symbol: string;
    name: string;
    price: number;
    change_percent: number;
  }>;
  topLosers: Array<{
    symbol: string;
    name: string;
    price: number;
    change_percent: number;
  }>;
  timestamp: number;
  error?: string;
}

interface ApiResponse {
  status: string;
  timestamp: number;
  data: {
    [key: string]: SectorTrend;
  }
}

// Color palette for sectors
const sectorColors = {
  'NIFTY IT': 'rgba(75, 192, 192, 1)', // Teal
  'NIFTY PHARMA': 'rgba(153, 102, 255, 1)', // Purple
  'NIFTY AUTO': 'rgba(255, 99, 132, 1)', // Pink
  'NIFTY METAL': 'rgba(255, 159, 64, 1)', // Orange
  'NIFTY FMCG': 'rgba(54, 162, 235, 1)', // Blue
  'NIFTY ENERGY': 'rgba(255, 205, 86, 1)', // Yellow
  'NIFTY PSU BANK': 'rgba(201, 203, 207, 1)', // Gray
  'NIFTY BANK': 'rgba(255, 99, 132, 1)', // Red
  'NIFTY MEDIA': 'rgba(75, 192, 192, 1)', // Green
  'NIFTY INFRA': 'rgba(153, 102, 255, 1)' // Indigo
};

export const SectorTrends: React.FC = () => {
  const [sectorData, setSectorData] = useState<{ [key: string]: TrendData[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set(Object.keys(sectorColors)));

  useEffect(() => {
    const fetchSectorTrends = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<ApiResponse>('/api/sector-trends');
        
        if (response.data.status === 'success') {
          const transformedData: { [key: string]: TrendData[] } = {};
          Object.entries(response.data.data).forEach(([name, sector]) => {
            if (!sector.error && sector.historical && sector.historical.length > 0) {
              transformedData[name] = sector.historical;
            }
          });
          setSectorData(transformedData);
          setSelectedSectors(new Set(Object.keys(transformedData)));
        } else {
          throw new Error('Failed to fetch sector trends data');
        }
      } catch (err) {
        setError('Failed to fetch sector trends data');
        console.error('Error fetching sector trends:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectorTrends();
  }, []);

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sector)) {
        newSet.delete(sector);
      } else {
        newSet.add(sector);
      }
      return newSet;
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y.toFixed(2);
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const getChartData = () => {
    const datasets = Array.from(selectedSectors)
      .filter(sector => sectorData[sector])
      .map(sector => ({
        label: sector,
        data: sectorData[sector].map(d => d.price),
        borderColor: sectorColors[sector as keyof typeof sectorColors],
        backgroundColor: sectorColors[sector as keyof typeof sectorColors].replace('1)', '0.1)'),
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: sectorColors[sector as keyof typeof sectorColors],
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      }));

    return {
      labels: sectorData[Object.keys(sectorData)[0]]?.map(d => new Date(d.date).toLocaleDateString()) || [],
      datasets
    };
  };

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
          <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Sector Trends
          </h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      ) : Object.keys(sectorData).length === 0 ? (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
          No sector trend data available
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(sectorData).map(sector => (
            <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSectors.has(sector)
                    ? 'bg-white/10 text-white'
                    : 'bg-white/5 text-white/40'
                }`}
                style={{
                  border: `1px solid ${selectedSectors.has(sector) ? sectorColors[sector as keyof typeof sectorColors] : 'rgba(255, 255, 255, 0.1)'}`
                }}
            >
                {sector}
            </button>
          ))}
      </div>
      
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="h-[500px]">
              <Line options={chartOptions} data={getChartData()} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 