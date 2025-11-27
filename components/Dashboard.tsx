import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Asset } from '../types';

interface DashboardProps {
  assets: Asset[];
  prices: Record<string, number>; // Current market prices for valuation
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

const Dashboard: React.FC<DashboardProps> = ({ assets, prices }) => {
  // Calculate total value per asset
  const data = assets.map(asset => {
    const currentPrice = asset.type === 'CASH' ? 1 : (prices[asset.symbol] || asset.averageCost);
    return {
      name: asset.symbol,
      value: asset.quantity * currentPrice,
      type: asset.type
    };
  });

  const totalValue = data.reduce((acc, cur) => acc + cur.value, 0);
  const cashValue = data.find(d => d.type === 'CASH')?.value || 0;
  const stockValue = totalValue - cashValue;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-medium">總資產價值</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          <div className="mt-4 flex gap-2">
             <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
               現金比率: {((cashValue / totalValue) * 100).toFixed(1)}%
             </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
             <p className="text-gray-500 text-sm font-medium">證券市值</p>
             <h2 className="text-2xl font-bold text-blue-600 mt-2">
               ${stockValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
             </h2>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
        <h3 className="text-lg font-bold text-gray-800 mb-4 w-full text-left">資產配置分佈</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;