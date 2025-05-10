import React from 'react';
import { Bot, User } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
    text: string;
    isBot: boolean;
  type: 'text' | 'analysis' | 'market' | 'error';
  data?: {
    symbol?: string;
    currentPrice?: number;
    changePercent?: number;
    volume?: number;
    lastUpdated?: string;
    nifty?: {
      current: number;
      changePct: number;
    };
    sensex?: {
      current: number;
      changePct: number;
    };
    marketStatus?: string;
    company_name?: string;
    current_price?: number;
    price_change?: number;
    price_change_pct?: number;
    pe_ratio?: number;
    market_cap?: number;
    recommendation?: string;
    fifty_two_week_high?: number;
    fifty_two_week_low?: number;
    sentiment_score?: number;
    positive?: number;
    negative?: number;
    neutral?: number;
    total_news?: number;
    recent_news?: Array<{
      title: string;
      sentiment: string;
      confidence: number;
      date: string;
    }>;
    stocks?: Array<{
      symbol: string;
      current_price: number;
      price_change: number;
      price_change_pct: number;
      volume: number;
      pe_ratio: number;
      market_cap: number;
    }>;
    sector_name?: string;
    industry_name?: string;
    top_stocks?: Array<{
      symbol: string;
      current_price: number;
      price_change: number;
      price_change_pct: number;
    }>;
  };
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formattedTime = format(new Date(message.timestamp), 'HH:mm');

  const renderMessageContent = () => {
    switch (message.type) {
      case 'analysis':
        return (
          <div className="space-y-2">
            <p className="text-white whitespace-pre-line">{message.text}</p>
            {message.data && (
              <div className="bg-[#152028] p-3 rounded-lg space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Company:</span>
                  <span className="text-white font-medium">{message.data.company_name || message.data.symbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white font-medium">₹{message.data.current_price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Change:</span>
                  <span className={`font-medium ${message.data.price_change && message.data.price_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {message.data.price_change?.toFixed(2)} ({message.data.price_change_pct?.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Volume:</span>
                  <span className="text-white font-medium">{message.data.volume?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">P/E Ratio:</span>
                  <span className="text-white font-medium">{message.data.pe_ratio?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Market Cap:</span>
                  <span className="text-white font-medium">₹{message.data.market_cap?.toLocaleString()}</span>
                </div>
                {message.data.recommendation && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Recommendation:</span>
                    <span className="text-white font-medium">{message.data.recommendation.toUpperCase()}</span>
                  </div>
                )}
                {message.data.sentiment_score !== undefined && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Sentiment Score:</span>
                      <span className={`font-medium ${message.data.sentiment_score >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                        {message.data.sentiment_score.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">News:</span>
                      <span className="text-white">
                        {message.data.positive} positive, {message.data.negative} negative, {message.data.neutral} neutral
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'market':
        return (
          <div className="space-y-2">
            <p className="text-white">{message.text}</p>
            {message.data && (
              <div className="bg-[#152028] p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Nifty 50:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">₹{message.data.nifty?.current.toFixed(2)}</span>
                    <span className={`text-sm ${message.data.nifty?.changePct && message.data.nifty.changePct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ({message.data.nifty?.changePct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sensex:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">₹{message.data.sensex?.current.toFixed(2)}</span>
                    <span className={`text-sm ${message.data.sensex?.changePct && message.data.sensex.changePct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ({message.data.sensex?.changePct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white font-medium">{message.data.marketStatus}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="space-y-2">
            <p className="text-red-500">{message.text}</p>
          </div>
        );

      default:
        return <p className="text-white whitespace-pre-line">{message.text}</p>;
    }
  };

  return (
    <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} gap-2`}>
      {message.isBot ? (
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-accent" />
          </div>
          <div className="max-w-[80%]">
            <div className="bg-[#152028] p-3 rounded-lg rounded-tl-none">
              {renderMessageContent()}
            </div>
            <span className="text-xs text-gray-500 mt-1 block">{formattedTime}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <div className="max-w-[80%]">
            <div className="bg-accent/10 p-3 rounded-lg rounded-tr-none">
              {renderMessageContent()}
            </div>
            <span className="text-xs text-gray-500 mt-1 block text-right">{formattedTime}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <User className="w-5 h-5 text-accent" />
      </div>
        </div>
      )}
    </div>
  );
};