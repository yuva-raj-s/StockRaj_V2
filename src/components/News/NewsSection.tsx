import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { Clock, ChevronDown, Filter } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  source: string;
  date?: string;
  imageUrl?: string;
  description?: string;
}

export const NewsSection: React.FC = () => {
  const { news, loading, error, refreshNews } = useData();
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [displayCount, setDisplayCount] = useState(5);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    // Extract unique sources from news
    const uniqueSources = Array.from(new Set(news.map(item => item.source)));
    setSources(uniqueSources);
  }, [news]);

  useEffect(() => {
    // Filter news based on source and Indian financial focus
    let filtered = news;
    
    if (selectedSource) {
      filtered = filtered.filter(item => item.source === selectedSource);
    } else {
      // Default filter for Indian financial news
      filtered = filtered.filter(item => 
      item.title.toLowerCase().includes('india') ||
      item.title.toLowerCase().includes('indian') ||
      item.title.toLowerCase().includes('rupee') ||
      item.title.toLowerCase().includes('sensex') ||
      item.title.toLowerCase().includes('nifty') ||
      item.source.toLowerCase().includes('moneycontrol') ||
        item.source.toLowerCase().includes('economic times') ||
        item.source.toLowerCase().includes('bloomberg') ||
        item.source.toLowerCase().includes('mint') ||
        item.source.toLowerCase().includes('business standard')
      );
    }
    
    setFilteredNews(filtered);
  }, [news, selectedSource]);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const handleSourceChange = (source: string) => {
    setSelectedSource(source === selectedSource ? null : source);
    setDisplayCount(5); // Reset display count when changing source
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Today's Financial News</h2>
            <div className="h-px w-24 bg-gradient-to-r from-accent-primary/50 to-transparent" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="relative overflow-hidden rounded-2xl bg-white/5 animate-pulse">
              <div className="flex gap-4 p-4">
                <div className="w-24 h-24 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="h-4 bg-white/10 rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Today's Financial News</h2>
            <div className="h-px w-24 bg-gradient-to-r from-accent-primary/50 to-transparent" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <p className="text-rose-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-white">Today's Financial News</h2>
          <div className="h-px w-24 bg-gradient-to-r from-accent-primary/50 to-transparent" />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter by Source</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-black/80 backdrop-blur-sm py-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleSourceChange('')}
                className={`w-full px-4 py-2 text-left text-sm ${!selectedSource ? 'text-accent-primary' : 'text-white/60 hover:text-white'}`}
              >
                All Sources
              </button>
              {sources.map(source => (
                <button
                  key={source}
                  onClick={() => handleSourceChange(source)}
                  className={`w-full px-4 py-2 text-left text-sm ${selectedSource === source ? 'text-accent-primary' : 'text-white/60 hover:text-white'}`}
                >
                  {source}
                </button>
              ))}
            </div>
        </div>
        <button
          onClick={refreshNews}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Refresh
        </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNews.slice(0, displayCount).map((item, index) => (
          <div 
            key={index} 
            className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:bg-accent-primary/5"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-accent-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4"
            >
              <div className="flex gap-4">
                {item.imageUrl ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-white/5 flex items-center justify-center">
                    <div className="text-white/20 text-4xl">📰</div>
                  </div>
                )}
                <div className="flex-1 relative">
                  <h3 className="text-white font-medium mb-2 group-hover:text-accent-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-sm text-white/40 mb-2">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{item.source}</span>
                    {item.date && <span className="mx-2">•</span>}
                    {item.date && <span>{item.date}</span>}
                  </div>
                  {item.description && (
                    <p className="text-white/60 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {displayCount < filteredNews.length && (
        <button
          onClick={handleLoadMore}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all duration-300"
        >
          <span>Load More</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};