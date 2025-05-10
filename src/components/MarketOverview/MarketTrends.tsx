import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useData } from '../../context/DataContext.tsx';

const INDIAN_SECTORS = {
  'BANKNIFTY.NS': 'Banking',
  'NIFTYAUTO.NS': 'Automobile',
  'NIFTYFMCG.NS': 'FMCG',
  'NIFTYIT.NS': 'IT',
  'NIFTYPHARMA.NS': 'Pharmaceutical',
  'NIFTYREALTY.NS': 'Real Estate',
  'NIFTYMETAL.NS': 'Metal',
  'NIFTYENERGY.NS': 'Energy',
};

interface SectorData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
}

export const MarketTrends: React.FC = () => {
  const { stocks, refreshStocks } = useData();
  const [sectors, setSectors] = useState<SectorData[]>([]);

  useEffect(() => {
    refreshStocks(Object.keys(INDIAN_SECTORS));
  }, []);

  useEffect(() => {
    const updatedSectors = Object.entries(INDIAN_SECTORS).map(([symbol, name]) => {
      const stock = stocks[symbol];
      return {
        symbol,
        name,
        price: stock?.currentPrice || 0,
        change: stock?.changePercent || 0,
        volume: stock?.volume || 0,
      };
    });
    setSectors(updatedSectors);
  }, [stocks]);

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-6">Sector Performance</h2>
      <div className="space-y-6">
        {sectors.map((sector) => (
          <div 
            key={sector.symbol} 
            className="flex justify-between items-center py-3 pl-4 pr-6 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <div>
              <h3 className="text-white text-lg font-semibold mb-1">{sector.name}</h3>
              <p className="text-sm text-gray-400">Volume: {sector.volume.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-white text-xl font-bold mb-1">₹{sector.price.toFixed(2)}</p>
              <div className={`flex items-center justify-end ${
                sector.change >= 0 ? 'text-success' : 'text-danger'
              } font-medium`}>
                {sector.change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                <span>{Math.abs(sector.change).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};