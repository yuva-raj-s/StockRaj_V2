import React, { useEffect, useState } from 'react';

interface VixData {
  price: number;
    change: number;
  change_percent: number;
  timestamp: string;
}

const VolatilityMeter: React.FC = () => {
  const [vix, setVix] = useState<VixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/volatility')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error || 'Failed to fetch VIX');
        } else {
          setVix(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch VIX');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-white/60">Loading India VIX...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!vix) return null;

  const changeSign = vix.change > 0 ? '+' : vix.change < 0 ? '-' : '';
  const percentSign = vix.change_percent > 0 ? '+' : vix.change_percent < 0 ? '-' : '';

  return (
    <div className="rounded-xl bg-[#10191f] border border-[#23313d] p-6 flex flex-col items-start">
      <span className="text-xs font-bold text-white/70 tracking-widest uppercase mb-2">India VIX</span>
      <span className="text-3xl font-extrabold text-white mb-2">{vix.price?.toFixed(2)}</span>
      <span className={`text-base font-medium ${vix.change >= 0 ? 'text-green-400' : 'text-red-400'}`}> 
        {changeSign}{Math.abs(vix.change).toFixed(2)} ({percentSign}{Math.abs(vix.change_percent).toFixed(2)}%)
      </span>
      <span className="text-xs text-white/40 mt-1">Last updated: {vix.timestamp}</span>
    </div>
  );
};

export default VolatilityMeter;