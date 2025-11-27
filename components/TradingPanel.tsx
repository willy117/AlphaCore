import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { StockQuote, TradeType } from '../types';

interface TradingPanelProps {
  currentQuote: StockQuote | null;
  symbol: string;
  onSymbolChange: (s: string) => void;
  onRefreshQuote: () => void;
  onTrade: (type: TradeType, qty: number, price: number) => Promise<void>;
  isLoading: boolean;
}

const TradingPanel: React.FC<TradingPanelProps> = ({ 
  currentQuote, symbol, onSymbolChange, onRefreshQuote, onTrade, isLoading 
}) => {
  const [qty, setQty] = useState<number>(1);
  const [tradeLoading, setTradeLoading] = useState(false);

  const handleTrade = async (type: TradeType) => {
    if (!currentQuote) return;
    setTradeLoading(true);
    await onTrade(type, qty, currentQuote.c);
    setTradeLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">模擬交易下單</h3>
      
      {/* Symbol Input */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="股票代號 (如 AAPL)"
          />
        </div>
        <button 
          onClick={onRefreshQuote}
          disabled={isLoading}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition font-medium text-sm"
        >
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : '詢價'}
        </button>
      </div>

      {/* Quote Display */}
      {currentQuote && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-sm">市場現價</span>
            <span className={`text-xl font-bold ${currentQuote.d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${currentQuote.c.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">漲跌幅</span>
            <span className={currentQuote.dp >= 0 ? 'text-green-600' : 'text-red-600'}>
              {currentQuote.dp > 0 ? '+' : ''}{currentQuote.dp.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Order Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">交易股數</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="pt-2 text-sm text-gray-500 flex justify-between">
            <span>預估總額</span>
            <span className="font-bold text-gray-900">
                ${currentQuote ? (currentQuote.c * qty).toFixed(2) : '0.00'}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleTrade(TradeType.BUY)}
            disabled={!currentQuote || tradeLoading || qty <= 0}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {tradeLoading ? <Loader2 className="animate-spin w-4 h-4" /> : '買進 BUY'}
          </button>
          <button
            onClick={() => handleTrade(TradeType.SELL)}
            disabled={!currentQuote || tradeLoading || qty <= 0}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
             {tradeLoading ? <Loader2 className="animate-spin w-4 h-4" /> : '賣出 SELL'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingPanel;