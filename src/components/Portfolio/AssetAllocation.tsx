import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  TooltipProps
} from 'recharts';

interface AssetAllocationProps {
  data: Array<{
    symbol: string;
    quantity: number;
    value: number;
    price: number;
    percentage: number;
  }>;
}

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
}

const COLORS = ['#00C896', '#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7', '#FF8B94', '#A8E6CF', '#FFD3B6'];

export const AssetAllocation: React.FC<AssetAllocationProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No asset allocation data available
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.symbol,
    value: item.value,
    percentage: item.percentage
  }));

  const formatTooltip = (value: number, name: string, props: TooltipProps<number, string>) => {
    const percentage = (props.payload?.[0]?.payload as ChartDataItem)?.percentage;
    return [
      `₹${value.toLocaleString()} (${percentage?.toFixed(2)}%)`,
      name
    ];
  };

  return (
    <div className="h-[400px]">
      <h3 className="text-lg font-medium mb-4">Asset Allocation</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: '#1a2634',
              border: '1px solid #ffffff20',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#ffffff' }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{
              paddingLeft: '20px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};