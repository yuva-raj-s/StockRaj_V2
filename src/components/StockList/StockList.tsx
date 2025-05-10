import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  volume: number;
}

interface StockListProps {
  data: StockData[];
}

export const StockList: React.FC<StockListProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-white/60 border-b border-white/10">
            <th className="pb-4 font-medium">Symbol</th>
            <th className="pb-4 font-medium">Name</th>
            <th className="pb-4 font-medium text-right">Price</th>
            <th className="pb-4 font-medium text-right">Change %</th>
            <th className="pb-4 font-medium text-right">Volume</th>
          </tr>
        </thead>
        <tbody>
          {data.map((stock) => (
            <tr key={stock.symbol} className="text-sm border-b border-white/5 hover:bg-white/5">
              <td className="py-4 font-bold text-white uppercase">{stock.symbol}</td>
              <td className="py-4 text-white/80 capitalize">{stock.name && stock.name.trim() !== '' ? stock.name : stock.symbol.replace('.NS', '')}</td>
              <td className="py-4 text-right font-medium text-white" style={{ fontFamily: "Mukta, Hind, Poppins, system-ui, sans-serif" }}>₹{stock.price.toLocaleString()}</td>
              <td className="py-4 text-right">
                <span className={`inline-flex items-center justify-end gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
                  stock.change_percent > 0
                    ? 'bg-green-600/20 text-green-400'
                    : stock.change_percent < 0
                    ? 'bg-red-600/20 text-red-400'
                    : 'bg-white/10 text-white/80'
                }`}>
                  {stock.change_percent > 0 ? (
                    <TrendingUp className="w-4 h-4 -mt-0.5" style={{ verticalAlign: 'middle' }} />
                  ) : stock.change_percent < 0 ? (
                    <TrendingDown className="w-4 h-4 -mt-0.5" style={{ verticalAlign: 'middle' }} />
                  ) : (
                    <Minus className="w-4 h-4 -mt-0.5" style={{ verticalAlign: 'middle' }} />
                  )}
                  {Math.abs(stock.change_percent).toFixed(2)}%
                </span>
              </td>
              <td className="py-4 text-right text-white/80">{stock.volume.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};