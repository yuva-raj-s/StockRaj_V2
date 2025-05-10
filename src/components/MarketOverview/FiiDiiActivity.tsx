import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { institutionalActivity } from './data/marketData';

type TimeframeType = 'today' | 'week' | 'month';

export const FiiDiiActivity: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeType>('today');
  
  const fiiData = institutionalActivity.fii[activeTimeframe];
  const diiData = institutionalActivity.dii[activeTimeframe];
  
  const maxValue = Math.max(
    fiiData.bought, 
    fiiData.sold, 
    diiData.bought, 
    diiData.sold
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">FII/DII Activity</h3>
        <div className="flex space-x-2">
          {(['today', 'week', 'month'] as TimeframeType[]).map((timeframe) => (
            <button
              key={timeframe}
              className={`text-xs px-3 py-1 rounded-full transition-all ${
                activeTimeframe === timeframe 
                  ? 'bg-accent-primary/20 text-accent-primary' 
                  : 'text-gray-300 hover:bg-primary-light'
              }`}
              onClick={() => setActiveTimeframe(timeframe)}
            >
              {timeframe === 'today' ? 'Today' : timeframe === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* FII Section */}
        <div className="glass p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-white">Foreign Institutional Investors (FII)</h4>
            <div className={`flex items-center ${fiiData.netPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
              {fiiData.netPercentage >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              <span className="font-bold">{Math.abs(fiiData.netPercentage).toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Bought</div>
              <div className="text-xl font-bold text-success">₹{(fiiData.bought / 1000).toFixed(2)}K Cr</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Sold</div>
              <div className="text-xl font-bold text-danger">₹{(fiiData.sold / 1000).toFixed(2)}K Cr</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-400 mb-1">Net Value</div>
            <div className={`text-xl font-bold ${fiiData.netValue >= 0 ? 'text-success' : 'text-danger'}`}>
              {fiiData.netValue >= 0 ? '+' : ''}₹{(fiiData.netValue / 1000).toFixed(2)}K Cr
            </div>
            
            {/* Bar Chart */}
            <div className="relative h-6 bg-primary-light/30 rounded-full mt-3">
              <div 
                className="absolute h-full bg-success/70 rounded-l-full"
                style={{ width: `${(fiiData.bought / maxValue) * 100}%` }}
              />
              <div 
                className="absolute h-full bg-danger/70 rounded-r-full right-0"
                style={{ width: `${(fiiData.sold / maxValue) * 100}%` }}
              />
              <div className="absolute inset-0 flex justify-center items-center text-xs font-medium text-white">
                Buy vs Sell Ratio
              </div>
            </div>
          </div>
        </div>
        
        {/* DII Section */}
        <div className="glass p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-white">Domestic Institutional Investors (DII)</h4>
            <div className={`flex items-center ${diiData.netPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
              {diiData.netPercentage >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              <span className="font-bold">{Math.abs(diiData.netPercentage).toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Bought</div>
              <div className="text-xl font-bold text-success">₹{(diiData.bought / 1000).toFixed(2)}K Cr</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Sold</div>
              <div className="text-xl font-bold text-danger">₹{(diiData.sold / 1000).toFixed(2)}K Cr</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-400 mb-1">Net Value</div>
            <div className={`text-xl font-bold ${diiData.netValue >= 0 ? 'text-success' : 'text-danger'}`}>
              {diiData.netValue >= 0 ? '+' : ''}₹{(diiData.netValue / 1000).toFixed(2)}K Cr
            </div>
            
            {/* Bar Chart */}
            <div className="relative h-6 bg-primary-light/30 rounded-full mt-3">
              <div 
                className="absolute h-full bg-success/70 rounded-l-full"
                style={{ width: `${(diiData.bought / maxValue) * 100}%` }}
              />
              <div 
                className="absolute h-full bg-danger/70 rounded-r-full right-0"
                style={{ width: `${(diiData.sold / maxValue) * 100}%` }}
              />
              <div className="absolute inset-0 flex justify-center items-center text-xs font-medium text-white">
                Buy vs Sell Ratio
              </div>
            </div>
          </div>
        </div>
        
        {/* FII vs DII Net Investment Comparison */}
        <div className="glass p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-3">Net Investment Comparison</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">FII</span>
                <span className={fiiData.netValue >= 0 ? 'text-success' : 'text-danger'}>
                  {fiiData.netValue >= 0 ? '+' : ''}₹{(fiiData.netValue / 1000).toFixed(2)}K Cr
                </span>
              </div>
              <div className="h-3 bg-primary-light/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${fiiData.netValue >= 0 ? 'bg-success' : 'bg-danger'} rounded-full`}
                  style={{ 
                    width: `${Math.min(Math.abs(fiiData.netValue) / Math.max(Math.abs(fiiData.netValue), Math.abs(diiData.netValue)) * 100, 100)}%`,
                    marginLeft: fiiData.netValue < 0 ? 'auto' : 0,
                  }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">DII</span>
                <span className={diiData.netValue >= 0 ? 'text-success' : 'text-danger'}>
                  {diiData.netValue >= 0 ? '+' : ''}₹{(diiData.netValue / 1000).toFixed(2)}K Cr
                </span>
              </div>
              <div className="h-3 bg-primary-light/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${diiData.netValue >= 0 ? 'bg-success' : 'bg-danger'} rounded-full`}
                  style={{ 
                    width: `${Math.min(Math.abs(diiData.netValue) / Math.max(Math.abs(fiiData.netValue), Math.abs(diiData.netValue)) * 100, 100)}%`,
                    marginLeft: diiData.netValue < 0 ? 'auto' : 0,
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 mt-4 italic">
            {activeTimeframe === 'today' 
              ? 'Data as of today, 3:30 PM' 
              : activeTimeframe === 'week' 
                ? 'Data for the last 7 trading days' 
                : 'Data for the last 30 trading days'}
          </div>
        </div>
      </div>
    </div>
  );
}; 