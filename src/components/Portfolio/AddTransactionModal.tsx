import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';

interface Symbol {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string, quantity: number, price: number, date: string, type: string) => void;
}

// Static sector-based stock list
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
    { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories", exchange: 'NSE', sector: 'Healthcare' },
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
const sectors = ['all', 'IT', 'Banking', 'Energy', 'Telecom', 'Consumer', 'Metal', 'Healthcare'];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<Symbol | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // Filter static stocks based on selected sector
  const filteredStatic = selectedSector === 'all' ? allStaticStocks : staticStocksBySector[selectedSector] || [];

  const handleSelectStock = (stock: Symbol) => {
    setSelectedStock(stock);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStock) {
      setError('Please select a valid stock');
      return;
    }

    if (quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    // Format the symbol to include .NS suffix if not present
    const formattedSymbol = selectedStock.symbol.includes('.') 
      ? selectedStock.symbol 
      : `${selectedStock.symbol}.NS`;

    onAdd(formattedSymbol, quantity, price, date, type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full">
          <Card glowEffect>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <Dialog.Title className="text-xl font-semibold text-white">
                  Add Transaction
                </Dialog.Title>
          <button
            onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close modal"
            aria-label="Close modal"
          >
                  <X className="h-5 w-5" />
          </button>
        </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent">
                    {sectors.map(sector => (
                <button
                        key={sector}
                  type="button"
                        onClick={() => setSelectedSector(sector)}
                        className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                          selectedSector === sector
                            ? 'bg-accent text-black font-medium shadow-[0_0_10px_rgba(0,200,150,0.3)]'
                            : 'text-gray-400 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {sector.charAt(0).toUpperCase() + sector.slice(1)}
                </button>
                    ))}
                  </div>

                  {/* Stock selection list */}
                  <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent border border-accent/20 rounded-xl bg-[#101c24]/80">
                    {filteredStatic.map((result) => (
                <button
                        key={result.symbol}
                  type="button"
                        onClick={() => handleSelectStock(result)}
                        className={`w-full px-4 py-2.5 text-left text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${selectedStock?.symbol === result.symbol ? 'bg-accent/10' : ''}`}
                        title={`Select ${result.symbol} - ${result.name}`}
                        aria-label={`Select ${result.symbol} - ${result.name}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.symbol}</span>
                          {result.sector && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                              {result.sector}
                            </span>
                          )}
                          <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                            {result.exchange}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-0.5">{result.name}</div>
                </button>
                    ))}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Transaction Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'BUY' | 'SELL')}
                      className="w-full px-3 py-2.5 bg-[#101c24]/80 border border-accent/20 rounded-xl text-white/90 focus:ring-2 focus:ring-accent/60 focus:shadow-[0_0_10px_rgba(0,200,150,0.2)] transition-all"
                      aria-label="Transaction type"
                      title="Select transaction type"
                    >
                      <option value="BUY">Buy</option>
                      <option value="SELL">Sell</option>
                    </select>
            </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Date
              </label>
              <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#101c24]/80 border border-accent/20 rounded-xl text-white/90 focus:ring-2 focus:ring-accent/60 focus:shadow-[0_0_10px_rgba(0,200,150,0.2)] transition-all"
                      aria-label="Transaction date"
                      title="Select transaction date"
                    />
                  </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-[#101c24]/80 border border-accent/20 rounded-xl text-white/90 focus:ring-2 focus:ring-accent/60 focus:shadow-[0_0_10px_rgba(0,200,150,0.2)] transition-all"
                  min="1"
                      aria-label="Quantity"
                      title="Enter quantity"
                  placeholder="Enter quantity"
                />
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Price
                </label>
                <input
                  type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-[#101c24]/80 border border-accent/20 rounded-xl text-white/90 focus:ring-2 focus:ring-accent/60 focus:shadow-[0_0_10px_rgba(0,200,150,0.2)] transition-all"
                  min="0.01"
                  step="0.01"
                      aria-label="Price"
                      title="Enter price"
                  placeholder="Enter price"
              />
            </div>
          </div>

            <button
              type="submit"
                  className="w-full px-4 py-2.5 bg-accent text-black font-medium rounded-xl hover:shadow-[0_0_10px_rgba(0,200,150,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedStock || quantity <= 0 || price <= 0}
            >
              Add Transaction
            </button>
              </form>
          </div>
          </Card>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 