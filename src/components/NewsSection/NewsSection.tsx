import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { NewsItem } from '../../services/marketData';

interface NewsSectionProps {
  data: NewsItem[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {data.map((news, index) => (
        <a
          key={index}
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2">{news.title}</h3>
              <p className="text-white/60 text-sm mb-2">{news.description}</p>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <span>{news.source}</span>
                <span>•</span>
                <span>{new Date(news.pubDate).toLocaleString()}</span>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-white/40" />
          </div>
        </a>
      ))}
    </div>
  );
}; 