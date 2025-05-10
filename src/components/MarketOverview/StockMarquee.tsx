import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  active?: boolean;
}

interface StockMarqueeProps {
  data: StockData[];
  loading?: boolean;
}

export const StockMarquee: React.FC<StockMarqueeProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-16">
        <div className="animate-pulse flex space-x-8">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 w-40 bg-white/10 rounded" />
        ))}
        </div>
      </div>
    );
  }

  // Duplicate data for seamless loop
  const loopData = [...data, ...data];

  return (
    <div className="relative flex items-center h-16 overflow-hidden px-2 select-none" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="flex items-center animate-marquee-loop" style={{ minWidth: '200%' }}>
        {loopData.map((stock, idx) => {
          const isActive = stock.active !== false;
          return (
            <React.Fragment key={stock.symbol + idx}>
              <div className="flex items-center gap-4 px-4">
                <div className="flex flex-col justify-center min-w-[80px]">
                  <span className={`text-white/70 text-xs md:text-sm font-medium leading-tight ${!isActive ? 'opacity-50' : ''}`}>{stock.name || stock.symbol}</span>
                  <span className={`text-white text-base md:text-lg font-medium leading-tight ${!isActive ? 'opacity-40' : ''}`} style={{ fontFamily: "Mukta, Hind, Poppins, system-ui, sans-serif" }}>₹{stock.price.toLocaleString()}</span>
          </div>
                <span className={`flex items-center gap-1 px-4 py-1 rounded-lg text-sm font-medium ml-2 ${
                  stock.change_percent > 0
                    ? 'bg-green-600/20 text-green-400'
                    : stock.change_percent < 0
                    ? 'bg-red-600/20 text-red-400'
                    : 'bg-white/10 text-white/80'
                } ${!isActive ? 'opacity-40' : ''}`} style={{ minWidth: 60, justifyContent: 'center' }}>
                  {stock.change_percent > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : stock.change_percent < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                  {stock.change_percent === 0 ? '0.00%' : `${Math.abs(stock.change_percent).toFixed(2)}%`}
            </span>
          </div>
              {idx < loopData.length - 1 && (
                <span className="mx-2 text-white/20 text-lg font-bold select-none">|</span>
              )}
            </React.Fragment>
          );
        })}
        </div>
      <style>{`
        .animate-marquee-loop {
          display: flex;
          animation: marquee-loop 32s linear infinite;
        }
        @keyframes marquee-loop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .select-none { user-select: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};