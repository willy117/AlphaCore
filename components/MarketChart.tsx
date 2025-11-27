import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StockCandle } from '../types';

interface MarketChartProps {
  data: StockCandle[];
  symbol: string;
}

const MarketChart: React.FC<MarketChartProps> = ({ data, symbol }) => {
  // Format date for X-axis
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
  };

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">無數據顯示</div>;
  }

  const lastPrice = data[data.length - 1].c;
  const firstPrice = data[0].o;
  const isBullish = lastPrice >= firstPrice;
  const color = isBullish ? '#10B981' : '#EF4444'; // Tailwind Green-500 : Red-500

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{symbol} 價格走勢</h3>
          <p className="text-sm text-gray-500">時間範圍: 1M</p>
        </div>
        <div className={`text-xl font-bold ${isBullish ? 'text-green-500' : 'text-red-500'}`}>
          ${lastPrice.toFixed(2)}
        </div>
      </div>

      {/* Price Chart */}
      <div className="h-64 w-full mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="t" 
              tickFormatter={formatDate} 
              tick={{fontSize: 12, fill: '#9CA3AF'}}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{fontSize: 12, fill: '#9CA3AF'}}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              labelFormatter={(t) => new Date(t).toLocaleDateString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, '收盤價']}
            />
            <Area 
              type="monotone" 
              dataKey="c" 
              stroke={color} 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
             <XAxis dataKey="t" hide />
             <YAxis hide />
             <Tooltip 
               cursor={{fill: 'transparent'}}
               contentStyle={{ borderRadius: '8px', border: 'none' }}
               formatter={(value: number) => [value.toLocaleString(), '成交量']}
               labelFormatter={() => ''}
             />
             <Bar dataKey="v" fill="#CBD5E1" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketChart;