import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { List, Plus, X, Search, Check, RefreshCw } from 'lucide-react';
import { WatchlistTable } from '../components/Watchlist/WatchlistTable';
import { WatchlistAlerts } from '../components/Watchlist/WatchlistAlerts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Skeleton } from '../components/ui/Skeleton';

interface Symbol {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
}

interface WatchList {
  id: string;
  name: string;
  symbols: Symbol[];
}

// --- LocalStorage hooks and data model for pin-to-pin migration ---

// Utility to load from localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

// Utility to save to localStorage
function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Define types for alerts and watchlistData
interface Alert {
  symbol: string;
  price: number;
  type: 'Above' | 'Below';
  status: 'active' | 'triggered';
  created_at: string;
  triggered_at?: string | null;
  triggered_price?: number | null;
}

interface WatchlistStockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
}

// 1. Add the static sector-based stock list
const staticStocksBySector: Record<string, Symbol[]> = {
  IT: [
    { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT' },
    { symbol: 'INFY', name: 'Infosys', exchange: 'NSE', sector: 'IT' },
    { symbol: 'HCLTECH', name: 'HCL Technologies', exchange: 'NSE', sector: 'IT' },
    { symbol: 'WIPRO', name: 'Wipro', exchange: 'NSE', sector: 'IT' },
    { symbol: 'TECHM', name: 'Tech Mahindra', exchange: 'NSE', sector: 'IT' },
    { symbol: 'LTIM', name: 'LTIMindtree', exchange: 'NSE', sector: 'IT' },
    { symbol: 'PERSISTENT', name: 'Persistent Systems', exchange: 'NSE', sector: 'IT' },
    { symbol: 'OFSS', name: 'Oracle Financial Services Software', exchange: 'NSE', sector: 'IT' },
    { symbol: 'COFORGE', name: 'Coforge', exchange: 'NSE', sector: 'IT' },
    { symbol: 'MPHASIS', name: 'Mphasis', exchange: 'NSE', sector: 'IT' },
    { symbol: 'LTTS', name: 'L&T Technology Services', exchange: 'NSE', sector: 'IT' },
    { symbol: 'TATAELXSI', name: 'Tata Elxsi', exchange: 'NSE', sector: 'IT' },
    { symbol: 'KPITTECH', name: 'KPIT Technologies', exchange: 'NSE', sector: 'IT' },
    { symbol: 'ZENSARTECH', name: 'Zensar Technologies', exchange: 'NSE', sector: 'IT' },
    { symbol: 'HAPPSTMNDS', name: 'Happiest Minds Technologies', exchange: 'NSE', sector: 'IT' },
  ],
  Banking: [
    { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'AXISBANK', name: 'Axis Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'BANKBARODA', name: 'Bank of Baroda', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'PNB', name: 'Punjab National Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'CANBK', name: 'Canara Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'UNIONBANK', name: 'Union Bank of India', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'FEDERALBNK', name: 'Federal Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'BANDHANBNK', name: 'Bandhan Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'AUBANK', name: 'AU Small Finance Bank', exchange: 'NSE', sector: 'Banking' },
    { symbol: 'YESBANK', name: 'Yes Bank', exchange: 'NSE', sector: 'Banking' },
  ],
  Energy: [
    { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'NTPC', name: 'NTPC', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'POWERGRID', name: 'Power Grid Corporation of India', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'COALINDIA', name: 'Coal India', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'ADANIPOWER', name: 'Adani Power', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'IOC', name: 'Indian Oil Corporation', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'BPCL', name: 'Bharat Petroleum Corporation', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'GAIL', name: 'GAIL (India)', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'TATAPOWER', name: 'Tata Power Company', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'ADANIGREEN', name: 'Adani Green Energy', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'HINDPETRO', name: 'Hindustan Petroleum Corporation', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'JSWENERGY', name: 'JSW Energy', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'TORNTPOWER', name: 'Torrent Power', exchange: 'NSE', sector: 'Energy' },
    { symbol: 'OIL', name: 'Oil India', exchange: 'NSE', sector: 'Energy' },
  ],
  Telecom: [
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'IDEA', name: 'Vodafone Idea', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'INDUSTOWER', name: 'Indus Towers', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'TATACOMM', name: 'Tata Communications', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'BHARTIHEXA', name: 'Bharti Hexacom', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'RAILTEL', name: 'RailTel Corporation of India', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'HFCL', name: 'HFCL', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'ITI', name: 'ITI Limited', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'MTNL', name: 'Mahanagar Telephone Nigam Limited', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'TEJASNET', name: 'Tejas Networks', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'STRTECH', name: 'Sterlite Technologies', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'ROUTEMOBILE', name: 'Route Mobile', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'TANLA', name: 'Tanla Platforms', exchange: 'NSE', sector: 'Telecom' },
    { symbol: 'GTLINFRA', name: 'GTL Infrastructure', exchange: 'NSE', sector: 'Telecom' },
  ],
  Consumer: [
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'ITC', name: 'ITC', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'NESTLEIND', name: 'Nestle India', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'BRITANNIA', name: 'Britannia Industries', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'GODREJCP', name: 'Godrej Consumer Products', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'MARICO', name: 'Marico', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'DABUR', name: 'Dabur India', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'COLPAL', name: 'Colgate-Palmolive (India)', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'PGHH', name: 'Procter & Gamble Hygiene and Health Care', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'TATACONSUM', name: 'Tata Consumer Products', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'VBL', name: 'Varun Beverages', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'MCDOWELL-N', name: 'United Spirits', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'UBL', name: 'United Breweries', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'EMAMILTD', name: 'Emami', exchange: 'NSE', sector: 'Consumer' },
    { symbol: 'PATANJALI', name: 'Patanjali Foods', exchange: 'NSE', sector: 'Consumer' },
  ],
  Metal: [
    { symbol: 'TATASTEEL', name: 'Tata Steel', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'HINDALCO', name: 'Hindalco Industries', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'VEDL', name: 'Vedanta Limited', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'HINDZINC', name: 'Hindustan Zinc', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'NATIONALUM', name: 'National Aluminium Company', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'SAIL', name: 'SAIL', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'NMDC', name: 'NMDC', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'APLAPOLLO', name: 'APL Apollo Tubes', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'JSL', name: 'Jindal Stainless', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'WELCORP', name: 'Welspun Corp', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'HINDCOPPER', name: 'Hindustan Copper', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'RATNAMANI', name: 'Ratnamani Metals & Tubes', exchange: 'NSE', sector: 'Metal' },
    { symbol: 'COALINDIA', name: 'Coal India', exchange: 'NSE', sector: 'Metal' },
  ],
  Healthcare: [
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'DIVISLAB', name: "Divi's Laboratories", exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'CIPLA', name: 'Cipla', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'DRREDDY', name: 
"Dr. Reddy's Laboratories", exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'MANKIND', name: 'Mankind Pharma', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'MAXHEALTH', name: 'Max Healthcare Institute', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'LUPIN', name: 'Lupin', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'ZYDUSLIFE', name: 'Zydus Lifesciences', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'ABBOTINDIA', name: 'Abbott India', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'ALKEM', name: 'Alkem Laboratories', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'FORTIS', name: 'Fortis Healthcare', exchange: 'NSE', sector: 'Healthcare' },
    { symbol: 'BIOCON', name: 'Biocon', exchange: 'NSE', sector: 'Healthcare' },
  ],
};

const allStaticStocks = Object.values(staticStocksBySector).flat();

export const Watchlist: React.FC = () => {
  const [showAddSymbols, setShowAddSymbols] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newListName, setNewListName] = useState('');
  const [selectedSymbols, setSelectedSymbols] = useState<Symbol[]>([]);
  const [watchlists, setWatchlists] = useState<WatchList[]>(() => loadFromStorage('watchlists', [
    { id: 'default', name: 'Default', symbols: [] }
  ]));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [alerts, setAlerts] = useState<Alert[]>(() => loadFromStorage('alerts', [])); // Will be used for alerts logic
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [watchlistData, setWatchlistData] = useState<WatchlistStockData[]>([]); // Will be used for table and summary metrics
  const [activeWatchlist, setActiveWatchlist] = useState<string>('default');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbolSearchResults, setSymbolSearchResults] = useState<Symbol[]>([]);
  const [symbolSearchLoading, setSymbolSearchLoading] = useState(false);

  // Save to localStorage on change
  useEffect(() => {
    saveToStorage('watchlists', watchlists);
  }, [watchlists]);
  useEffect(() => {
    saveToStorage('alerts', alerts);
  }, [alerts]);

  // Update searchSymbols to use live API
  const searchSymbols = async (query: string) => {
    if (!query) {
      setSymbolSearchResults([]);
      return;
    }
    setSymbolSearchLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/search-symbols?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSymbolSearchResults(data);
    } catch {
      setSymbolSearchResults([]);
    } finally {
      setSymbolSearchLoading(false);
    }
  };

  const sectors = ['all', 'IT', 'Banking', 'Energy', 'Telecom', 'Consumer', 'Metal', 'Healthcare'];

  const handleAddSymbols = () => {
    setWatchlists(lists => lists.map(list => {
      if (list.id === activeWatchlist) {
        return {
          ...list,
          symbols: [...list.symbols, ...selectedSymbols]
        };
      }
      return list;
    }));
    setSelectedSymbols([]);
    setShowAddSymbols(false);
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      const newList: WatchList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        symbols: []
      };
      setWatchlists([...watchlists, newList]);
      setNewListName('');
      setShowCreateList(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleDeleteSymbol = (symbol: Symbol) => {
      setWatchlists(lists => lists.map(list => {
        if (list.id === activeWatchlist) {
          return {
            ...list,
          symbols: list.symbols.filter(s => s.symbol !== symbol.symbol)
          };
        }
        return list;
      }));
  };

  // When searchQuery is empty, show static list for selectedSector (or all if 'all')
  // When searchQuery is not empty, merge static and API results, deduplicate by symbol
  const filteredStatic = searchQuery
    ? allStaticStocks.filter(s =>
        (selectedSector === 'all' || s.sector === selectedSector) &&
        (s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (selectedSector === 'all' ? allStaticStocks : staticStocksBySector[selectedSector] || []);

  const mergedResults = [
    ...filteredStatic,
    ...symbolSearchResults.filter(apiRes =>
      !filteredStatic.some(staticRes => staticRes.symbol === apiRes.symbol)
    )
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <List className="w-6 h-6 mr-2 text-accent" />
          Your Watchlist
        </h2>
        <div className="flex space-x-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="glass-button p-2" onClick={handleRefresh} title="Refresh watchlist data">
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh watchlist data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="glass-button px-4 py-2 flex items-center"
                  onClick={() => setShowAddSymbols(true)}
                  title="Add symbols to watchlist"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Symbols
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add new symbols to your watchlist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="glass-button px-4 py-2"
                  onClick={() => setShowCreateList(true)}
                  title="Create new watchlist"
                >
                  Create List
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new watchlist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Watchlist selector */}
      <div className="flex gap-3">
        {watchlists.map(list => (
          <button
            key={list.id}
            onClick={() => setActiveWatchlist(list.id)}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeWatchlist === list.id
                ? 'bg-accent/20 text-accent shadow-neon-sm'
                : 'text-gray-400 bg-white/5 hover:bg-white/10'
            }`}
            title={`Switch to ${list.name} watchlist`}
          >
            {list.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card glowEffect>
            {isLoading ? (
              <div className="p-6">
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : (
              <WatchlistTable 
                symbols={watchlists.find(l => l.id === activeWatchlist)?.symbols.map(s => s.symbol) || []}
                onDeleteSymbol={(symbol: string) => handleDeleteSymbol({ symbol, name: '', exchange: '', sector: '' })}
              />
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <WatchlistAlerts />
          </Card>
        </div>
      </div>

      {/* Add Symbols Modal */}
      {showAddSymbols && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#101c24]/80 border border-accent/20 shadow-[0_0_24px_0_rgba(0,255,200,0.08)] rounded-2xl p-6 w-full max-w-2xl animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white">Add Symbols</h3>
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowAddSymbols(false)}
                aria-label="Close add symbols modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent">
              {sectors.map(sector => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                    selectedSector === sector
                      ? 'bg-accent text-black shadow-[0_0_10px_rgba(0,200,150,0.3)]'
                      : 'text-gray-400 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {sector.charAt(0).toUpperCase() + sector.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                className="futuristic-input bg-[#101c24]/80 border border-accent/20 rounded-xl px-4 py-2 text-white/90 focus:ring-2 focus:ring-accent/60 focus:shadow-[0_0_10px_rgba(0,200,150,0.2)] transition-all"
                placeholder="Search symbols or companies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchSymbols(e.target.value);
                }}
              />
            </div>

            {symbolSearchLoading && <div className="text-xs text-gray-400 mt-1">Searching...</div>}

            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 pr-2 mb-4 scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent">
              {mergedResults.map(symbol => {
                const isSelected = selectedSymbols.some(s => s.symbol === symbol.symbol);
                return (
                  <div
                    key={`${symbol.symbol}-${symbol.sector}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSymbols(selectedSymbols.filter(s => s.symbol !== symbol.symbol));
                      } else {
                        setSelectedSymbols([...selectedSymbols, symbol]);
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (isSelected) {
                          setSelectedSymbols(selectedSymbols.filter(s => s.symbol !== symbol.symbol));
                        } else {
                          setSelectedSymbols([...selectedSymbols, symbol]);
                        }
                      }
                    }}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'selected-glow' 
                        : 'hover:bg-white/5 hover:border-accent/20 border border-transparent'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 transition-colors ${
                      isSelected ? 'bg-accent' : 'border border-gray-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-black" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{symbol.symbol}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                          {symbol.sector || symbol.exchange}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                          {symbol.exchange}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{symbol.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <div className="text-sm text-gray-500">
                {selectedSymbols.length} {selectedSymbols.length === 1 ? 'symbol' : 'symbols'} selected
              </div>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm"
                  onClick={() => setShowAddSymbols(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-lg bg-accent text-black font-medium transition-all text-sm ${
                    selectedSymbols.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_10px_rgba(0,200,150,0.3)]'
                  }`}
                  onClick={handleAddSymbols}
                  disabled={selectedSymbols.length === 0}
                >
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="glass p-6 rounded-xl w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-text-primary">Create New List</h3>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowCreateList(false)}
                aria-label="Close create list modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              className="futuristic-input w-full mb-4"
              placeholder="List name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                onClick={() => setShowCreateList(false)}
              >
                Cancel
              </button>
              <button
                className="glass-button px-4 py-2"
                onClick={handleCreateList}
                disabled={!newListName.trim()}
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};