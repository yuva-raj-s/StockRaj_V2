import React, { useState, useEffect } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

interface Alert {
  symbol: string;
  price: number;
  type: 'above' | 'below';
  isTriggered: boolean;
  currentPrice?: number;
  name: string;
}

interface WatchlistAlertsProps {
  symbols?: string[];
}

interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export const WatchlistAlerts: React.FC<WatchlistAlertsProps> = ({ symbols = [] }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stockData, setStockData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    price: '',
    type: 'above' as 'above' | 'below'
  });
  const [symbolSearchQuery, setSymbolSearchQuery] = useState('');
  const [symbolSearchResults, setSymbolSearchResults] = useState<SymbolSearchResult[]>([]);
  const [symbolSearchLoading, setSymbolSearchLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchStockData = async () => {
    if (!symbols || symbols.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formattedSymbols = symbols.map(symbol => 
        symbol.includes('.') ? symbol : `${symbol}.NS`
      );

      const promises = formattedSymbols.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch data for ${symbol}`);
          }

          const data = await response.json();
          const result = data.chart.result[0];
          const meta = result.meta;

          return {
            symbol: symbol.replace('.NS', ''),
            price: meta.regularMarketPrice,
            name: meta.symbol
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter((result): result is { symbol: string; price: number; name: string } => result !== null);
      
      const newStockData: Record<string, number> = {};
      validResults.forEach(result => {
        newStockData[result.symbol] = result.price;
      });

      setStockData(newStockData);
      setAlerts(validResults.map(result => ({
        symbol: result.symbol,
        price: result.price,
        type: 'above',
        isTriggered: false,
        currentPrice: result.price,
        name: result.name
      })));
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to fetch stock data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    
    // Set up interval for real-time updates during market hours
    const interval = setInterval(fetchStockData, 5000);
    
    return () => clearInterval(interval);
  }, [symbols]);

  useEffect(() => {
    // Update alert triggered status when stock data changes
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => {
        const currentPrice = stockData[alert.symbol];
        if (currentPrice === undefined) return alert;

        const isTriggered = alert.type === 'above' 
          ? currentPrice >= alert.price
          : currentPrice <= alert.price;

        return {
          ...alert,
          currentPrice,
          isTriggered
        };
      })
    );
  }, [stockData]);

  const handleAddAlert = async () => {
    let symbol = newAlert.symbol;
    let name = '';
    // If symbol is not set from dropdown, try to resolve from input
    if (!symbol && symbolSearchQuery) {
      try {
        const res = await fetch(`http://localhost:3001/api/lookup-symbol?q=${encodeURIComponent(symbolSearchQuery)}`);
        if (!res.ok) throw new Error('Symbol not found');
        const data = await res.json();
        symbol = data.symbol;
        name = data.name;
      } catch {
        setAddError('Please select a valid symbol.');
        return;
      }
    } else if (symbol) {
      // Get name from dropdown selection
      const selected = symbolSearchResults.find(r => r.symbol === symbol);
      name = selected ? selected.name : symbol;
    } else {
      setAddError('Please select a symbol and enter a price.');
      return;
    }
    if (!newAlert.price) {
      setAddError('Please enter a price.');
      return;
    }
    setAddError(null);
    let currentPrice = stockData[symbol];
    if (currentPrice === undefined) {
      try {
        const response = await fetch(`http://localhost:3001/api/watchlist-data?symbols=${symbol}`);
        const data = await response.json();
        currentPrice = data[0]?.currentPrice || 0;
        setStockData(prev => ({ ...prev, [symbol]: currentPrice }));
      } catch {
        currentPrice = 0;
      }
    }
    const isTriggered = newAlert.type === 'above' ? currentPrice >= parseFloat(newAlert.price) : currentPrice <= parseFloat(newAlert.price);
    setAlerts(prev => [
      ...prev,
      { symbol, price: parseFloat(newAlert.price), type: newAlert.type, isTriggered, currentPrice, name }
    ]);
    setNewAlert({ symbol: '', price: '', type: 'above' });
    setSymbolSearchQuery('');
    setShowAddAlert(false);
  };

  const handleDeleteAlert = (index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  // Symbol search effect
  useEffect(() => {
    if (symbolSearchQuery.length < 2) {
      setSymbolSearchResults([]);
      return;
    }
    setSymbolSearchLoading(true);
    fetch(`http://localhost:3001/api/search-symbols?q=${encodeURIComponent(symbolSearchQuery)}`)
      .then(res => res.json())
      .then(data => setSymbolSearchResults(data))
      .catch(() => setSymbolSearchResults([]))
      .finally(() => setSymbolSearchLoading(false));
  }, [symbolSearchQuery]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-500/10 border-red-500/20">
        <p className="text-red-400">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Price Alerts</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-accent border-accent/20 hover:bg-accent/10"
          onClick={() => setShowAddAlert(!showAddAlert)}
        >
          <Bell className="w-4 h-4 mr-2" />
          Add Alert
        </Button>
      </div>

      {showAddAlert && (
        <Card className="p-4 bg-white/5 border-white/10">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Symbol
              </label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={symbolSearchQuery}
                onChange={e => {
                  setSymbolSearchQuery(e.target.value);
                  setNewAlert(prev => ({ ...prev, symbol: '' }));
                }}
                placeholder="Search symbol or company name..."
                autoFocus
              />
              {symbolSearchLoading && <div className="text-xs text-gray-400 mt-1">Searching...</div>}
              {symbolSearchResults.length > 0 && (
                <div className="bg-[#181f2a] border border-white/10 rounded-lg mt-1 max-h-40 overflow-y-auto z-10 relative">
                  {symbolSearchResults.map(result => (
                    <div
                      key={result.symbol}
                      className={`px-3 py-2 cursor-pointer hover:bg-accent/10 ${newAlert.symbol === result.symbol ? 'bg-accent/20' : ''}`}
                      onClick={() => {
                        setNewAlert(prev => ({ ...prev, symbol: result.symbol }));
                        setSymbolSearchQuery(result.symbol);
                        setSymbolSearchResults([]);
                      }}
                    >
                      <span className="text-white font-medium">{result.symbol}</span>
                      <span className="text-xs text-gray-400 ml-2">{result.name}</span>
                      <span className="text-xs text-accent ml-2">{result.exchange}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Price
              </label>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={newAlert.price}
                onChange={(e) => setNewAlert(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Enter price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Alert Type
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={newAlert.type}
                onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as 'above' | 'below' }))}
                aria-label="Select alert type"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddAlert(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddAlert}
                className="text-accent hover:bg-accent/10"
                disabled={(!newAlert.symbol && !symbolSearchQuery) || !newAlert.price}
              >
                Add Alert
              </Button>
            </div>
            {addError && <div className="text-xs text-red-400 mt-2">{addError}</div>}
          </div>
        </Card>
      )}

      {alerts.length === 0 ? (
        <Card className="p-4 bg-white/5 border-white/10">
          <p className="text-gray-400 text-center">No alerts set</p>
        </Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="bg-[#101c24]/80 border border-accent/10 shadow-[0_0_24px_0_rgba(0,255,200,0.08)] rounded-2xl p-2">
          {alerts.map((alert, index) => (
            <Card 
              key={index}
              className={`p-4 ${
                alert.isTriggered
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-white/5 border-white/10'
                } hover:bg-accent/5 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{alert.symbol}</span>
                      {alert.name && <span className="text-xs text-gray-400 ml-2">{alert.name}</span>}
                    <span className={`text-sm ${
                      alert.type === 'above' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {alert.type === 'above' ? 'Above' : 'Below'} ₹{alert.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Current: ₹{alert.currentPrice?.toLocaleString('en-IN')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAlert(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};