import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { SearchSuggestions } from './SearchSuggestions';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full glass pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-accent-primary"
            placeholder="Search stocks (e.g., RELIANCE, TCS, INFY)"
          />
        </div>
      </form>
      {showSuggestions && query.length > 0 && (
        <SearchSuggestions
          query={query}
          onSelect={(stock) => {
            setQuery(stock);
            setShowSuggestions(false);
            onSearch(stock);
          }}
          onClickOutside={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};