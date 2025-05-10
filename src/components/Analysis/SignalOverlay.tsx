import React from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Signal {
  type: 'buy' | 'sell';
  price: number;
  confidence: number;
  timestamp: string;
}

interface SignalOverlayProps {
  signals: Signal[];
}

export const SignalOverlay: React.FC<SignalOverlayProps> = ({ signals }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {signals.map((signal, index) => (
        <div
          key={index}
          className={`absolute transform -translate-y-1/2 ${
            signal.type === 'buy' ? 'text-green-400' : 'text-red-400'
          }`}
          style={{
            left: `${(index + 1) * 20}%`,
            top: '50%'
          }}
        >
          {signal.type === 'buy' ? (
            <ArrowUpCircle className="w-6 h-6" />
          ) : (
            <ArrowDownCircle className="w-6 h-6" />
          )}
          <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
            ₹{signal.price.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};