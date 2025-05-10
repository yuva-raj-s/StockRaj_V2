import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketPulseProps {
  data: {
    [key: string]: {
      price: number;
      change_percent: number;
    };
  };
}

const INDEX_KEYS = [
  'NIFTY 50',
  'SENSEX',
  'NIFTY BANK',
];

export const MarketPulse: React.FC<MarketPulseProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {INDEX_KEYS.map((name) => {
        const info = data[name];
        if (!info) {
    return (
            <div key={name} className="rounded-2xl px-8 py-7 min-h-[170px] bg-[#10191f] border border-[#23313d] flex items-center justify-center text-white/40">
              No data
      </div>
    );
  }
        return (
          <div
            key={name}
            className="relative flex flex-col justify-start bg-[#10191f] border border-[#23313d] rounded-2xl px-8 py-7 min-h-[170px] overflow-hidden"
          >
            {/* Accent lines */}
            <div className="absolute left-6 top-6 w-12 h-0.5 bg-accent-primary/60 rounded-full" />
            <div className="absolute right-6 bottom-6 w-12 h-0.5 bg-accent-primary/20 rounded-full rotate-90" />
            <div className="flex flex-col gap-2 z-10">
              {/* Index name */}
              <span className="text-xs font-bold text-white/70 tracking-widest uppercase text-left mb-2">{name}</span>
              {/* Price */}
              <span className="text-4xl md:text-5xl font-extrabold text-white tracking-wider text-left mb-3" style={{ letterSpacing: '0.04em', fontFamily: "Mukta, Hind, Poppins, system-ui, sans-serif" }}>{info.price.toLocaleString()}</span>
              {/* Change % */}
              <span className={`flex items-center gap-1 w-fit px-4 py-1 rounded-lg text-base font-medium text-left ${
                info.change_percent >= 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
              }`}>
                {info.change_percent >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                {Math.abs(info.change_percent).toFixed(2)}%
                  </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};