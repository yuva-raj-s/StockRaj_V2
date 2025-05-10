import React, { useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (stock: string) => void;
  onClickOutside: () => void;
}

// Mock data - In production, this would come from an API
const mockStocks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.' },
  { symbol: 'INFY', name: 'Infosys Ltd.' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.' },
  { symbol: 'ITC', name: 'ITC Ltd.' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd.' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd.' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.' },
  { symbol: 'SBIN', name: 'State Bank of India' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd.' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.' },
  { symbol: 'NTPC', name: 'NTPC Ltd.' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.' },
  { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories Ltd.' },
  { symbol: 'CIPLA', name: 'Cipla Ltd.' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.' },
  { symbol: 'TITAN', name: 'Titan Company Ltd.' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd.' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd.' },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories Ltd.' },
  { symbol: 'UPL', name: 'UPL Ltd.' },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd.' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd.' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd.' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd.' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd.' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd.' },
  { symbol: 'IOC', name: 'Indian Oil Corporation Ltd.' }
];

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onSelect,
  onClickOutside,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClickOutside]);

  const filteredStocks = mockStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      ref={ref}
      className="absolute z-50 w-full mt-2 glass rounded-lg shadow-lg overflow-hidden"
    >
      <div className="max-h-60 overflow-y-auto">
        {filteredStocks.map((stock) => (
          <button
            key={stock.symbol}
            onClick={() => onSelect(stock.symbol)}
            className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-white/5 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent-primary" />
            <div className="text-left">
              <div className="text-white font-medium">{stock.symbol}</div>
              <div className="text-sm text-gray-400">{stock.name}</div>
            </div>
          </button>
        ))}
        {filteredStocks.length === 0 && (
          <div className="px-4 py-3 text-gray-400 text-center">
            No stocks found matching "{query}"
          </div>
        )}
      </div>
    </div>
  );
};