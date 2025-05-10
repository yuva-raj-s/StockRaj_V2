import React, { useState, useEffect } from 'react';
import { AddTransactionModal } from '../components/Portfolio/AddTransactionModal';
import { Card } from '../components/ui/Card';
import { PortfolioChart } from '../components/Portfolio/PortfolioChart';
import TechnicalSignals from '../components/Portfolio/TechnicalSignals';
import { AssetAllocation } from '../components/Portfolio/AssetAllocation';

interface PortfolioMetrics {
  totalValue: number;
  totalInvested: number;
  totalPnl: number;
  totalPnlPercent: number;
  beta: number;
  sharpeRatio: number;
  holdings: Array<{
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
    changePercent: number;
  }>;
}

interface PerformanceData {
  date: string;
  value: number;
}

interface PortfolioPerformance {
  portfolioValueHistory: PerformanceData[];
  assetAllocation: Array<{
    symbol: string;
    quantity: number;
    value: number;
    price: number;
    percentage: number;
  }>;
  totalPortfolioValue: number;
  currentPrices: Record<string, number>;
}

interface Transaction {
  symbol: string;
  quantity: number;
  price: number;
  date: string;
  type: string;
  notes?: string;
}

export const Portfolio: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [assetAllocation, setAssetAllocation] = useState<PortfolioPerformance['assetAllocation']>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [refreshKey, setRefreshKey] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allocationWarning, setAllocationWarning] = useState<string | undefined>(undefined);
  const transactionsRef = React.useRef<HTMLDivElement>(null);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [metricsResponse, performanceResponse] = await Promise.all([
        fetch('http://localhost:3001/api/portfolio/overview'),
        fetch('http://localhost:3001/api/portfolio/performance')
      ]);

      if (!metricsResponse.ok) {
        throw new Error(`Failed to fetch portfolio metrics: ${metricsResponse.statusText}`);
      }
      if (!performanceResponse.ok) {
        throw new Error(`Failed to fetch portfolio performance: ${performanceResponse.statusText}`);
      }

      const [metricsData, performanceData] = await Promise.all([
        metricsResponse.json(),
        performanceResponse.json()
      ]);

      setMetrics(metricsData);
      
      // Update performance data and asset allocation
      if (performanceData.portfolioValueHistory) {
        setPerformanceData(performanceData.portfolioValueHistory);
      }
      if (performanceData.assetAllocation) {
        setAssetAllocation(performanceData.assetAllocation);
      }
      // Set transactions if available
      setTransactions(performanceData.transactions || []);
      setAllocationWarning(performanceData.allocationWarning);
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleAddTransaction = async (symbol: string, quantity: number, price: number, date: string, type: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/portfolio/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, quantity, price, date, type }),
      });

      if (!response.ok) {
        throw new Error('Failed to add transaction');
      }

      // Refresh portfolio data after adding transaction
      await fetchPortfolioData();
      setRefreshKey(prev => prev + 1); // Force refresh of child components
      // Scroll to transactions table
      setTimeout(() => {
        transactionsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const response = await fetch(`http://localhost:3001/api/portfolio/transaction/${index}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      await fetchPortfolioData();
      // Scroll to transactions table
      setTimeout(() => {
        transactionsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
        <div className="h-96 bg-gray-700 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="text-gray-400">No portfolio data available. Add your first transaction to get started.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1118] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Portfolio</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-accent text-black font-medium rounded-xl hover:shadow-[0_0_10px_rgba(0,200,150,0.3)] transition-all"
          >
            Add Transaction
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card glowEffect>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-300 mb-2">Total Value</h2>
              <div className="text-3xl font-semibold">₹{metrics.totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Current portfolio value</div>
            </div>
          </Card>

          <Card glowEffect>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-300 mb-2">Total Investment</h2>
              <div className="text-3xl font-semibold">₹{metrics.totalInvested.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Total amount invested</div>
            </div>
          </Card>

          <Card glowEffect>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-300 mb-2">Total P&L</h2>
              <div className={`text-3xl font-semibold ${metrics.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.totalPnl >= 0 ? '+' : ''}₹{metrics.totalPnl.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 mt-1">Profit and Loss</div>
            </div>
          </Card>

          <Card glowEffect>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-300 mb-2">Risk Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Beta</div>
                  <div className="text-lg font-medium">{metrics.beta.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Sharpe Ratio</div>
                  <div className="text-lg font-medium">{metrics.sharpeRatio.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card glowEffect>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Portfolio Performance</h2>
                  <div className="flex gap-2">
                    {['1W', '1M', '3M', '6M', '1Y', 'ALL'].map((timeframe) => (
                      <button
                        key={timeframe}
                        onClick={() => setSelectedTimeframe(timeframe)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          selectedTimeframe === timeframe
                            ? 'bg-accent text-black'
                            : 'text-gray-400 hover:text-white bg-white/5'
                        }`}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[400px]">
                  <PortfolioChart 
                    performanceData={performanceData} 
                    timeframe={selectedTimeframe} 
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card glowEffect>
              <div className="p-6">
                {allocationWarning && (
                  <div className="mb-2 p-2 bg-yellow-900/60 border border-yellow-400/40 text-yellow-200 rounded">
                    {allocationWarning}
                  </div>
                )}
                <AssetAllocation data={assetAllocation} />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.holdings.map((holding) => (
            <div key={holding.symbol}>
              <Card glowEffect>
                <div className="p-4 md:p-3 bg-[#151e28] rounded-xl border border-[#222f3e] shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{holding.symbol}</h3>
                      <p className="text-xs text-gray-400">{holding.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold text-accent">₹{holding.currentValue.toLocaleString()}</div>
                      <div className={`text-xs ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toLocaleString()} ({holding.pnlPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                  <TechnicalSignals key={holding.symbol + '-' + refreshKey} symbol={holding.symbol} />
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="mb-8" ref={transactionsRef}>
          <Card glowEffect>
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Transactions</h2>
              {transactions.length === 0 ? (
                <div className="text-gray-400">No transactions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-[#151e28] text-gray-300">
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Quantity</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Notes</th>
                        <th className="px-3 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => (
                        <tr key={idx} className="border-b border-[#222f3e]">
                          <td className="px-3 py-2">{idx + 1}</td>
                          <td className="px-3 py-2">{tx.symbol}</td>
                          <td className="px-3 py-2">{tx.type}</td>
                          <td className="px-3 py-2">{tx.quantity}</td>
                          <td className="px-3 py-2">₹{tx.price}</td>
                          <td className="px-3 py-2">{tx.date}</td>
                          <td className="px-3 py-2">{tx.notes || '-'}</td>
                          <td className="px-3 py-2">
                            <button
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              onClick={() => handleDeleteTransaction(idx)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
};