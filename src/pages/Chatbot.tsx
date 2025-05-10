import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../components/Chatbot/ChatMessage';
import { ChatInput } from '../components/Chatbot/ChatInput';
import { ImageUpload } from '../components/Chatbot/ImageUpload';
import { Brain, Sparkles, Bot, Zap, Loader2 } from 'lucide-react';
import { pythonService } from '../services/pythonService';

interface MessageData {
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
}

interface Message {
  text: string;
  isBot: boolean;
  type: 'text' | 'analysis' | 'market' | 'error';
  data?: MessageData;
  timestamp: string;
}

const SUGGESTIONS = [
  "What is the current price of Reliance?",
  "Show me today's top gainers",
  "What is Nifty 50?",
  "Give me a summary of the market",
  "What is the outlook for TCS?",
  "Show me my portfolio analysis"
];

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Greet user and initialize chatbot only once
  useEffect(() => {
    if (!initialized) {
      setMessages([
        {
          text: "👋 Hello! I'm your AI trading assistant. I can help you with stock prices, market status, and market terms. What would you like to know?",
          isBot: true,
          type: 'text',
          timestamp: new Date().toISOString()
        }
      ]);
      setInitialized(true);
    }
  }, [initialized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMessage: Message = {
      text,
        isBot: false,
      type: 'text',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsBotTyping(true);
    try {
      const response = await pythonService.processQuery(text);
      const botMessage: Message = {
        text: response.text,
        isBot: true,
        type: response.type,
        data: response.data,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        isBot: true,
        type: 'error',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsBotTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleClearChat = () => {
    setMessages([
      {
        text: "👋 Hello! I'm your AI trading assistant. I can help you with stock prices, market status, and market terms. What would you like to know?",
        isBot: true,
        type: 'text',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Bot className="w-6 h-6 text-accent" />
            AI Trading Assistant
          </h1>
          <p className="text-gray-400 text-sm">Get real-time market insights and analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleClearChat} className="px-3 py-1.5 rounded-lg bg-[#152028] border border-accent/20 text-white text-sm">Clear Chat</button>
        </div>
      </div>

      <div className="bg-[#0A1720] rounded-xl border border-white/5">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent" />
            <span className="text-white font-medium">Chat Interface</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-accent/10">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium text-accent">Pro</span>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100vh-16rem)]">
          <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <span className="ml-2 text-accent">Thinking...</span>
              </div>
            )}
            {isBotTyping && !isLoading && (
              <div className="flex items-center p-4">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                <span className="ml-2 text-accent">Bot is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/5 bg-[#0A1720]">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs hover:bg-accent/20 transition"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            <div className="flex items-center gap-2">
                <ImageUpload onImageSelect={() => {}} />
              <div className="flex-1">
                <ChatInput onSend={handleSendMessage} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};