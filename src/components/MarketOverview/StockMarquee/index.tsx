import React from 'react';
import { StockMarqueeItem } from './StockMarqueeItem';
import { nifty50Stocks } from './data';

export const StockMarquee: React.FC = () => {
  return (
    <div className="glass py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {[...nifty50Stocks, ...nifty50Stocks].map((stock, index) => (
          <StockMarqueeItem
            key={`${stock.symbol}-${index}`}
            {...stock}
          />
        ))}
      </div>
    </div>
  );
};