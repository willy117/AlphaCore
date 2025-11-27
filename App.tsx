import React, { useState, useEffect } from 'react';
import { LayoutDashboard, LineChart, Wallet, GraduationCap, History, Settings } from 'lucide-react';
import { Asset, StockCandle, StockQuote, TradeType } from './types';
import * as marketService from './services/marketService';
import * as portfolioService from './services/portfolioService';
import * as aiService from './services/aiService';

import MarketChart from './components/MarketChart';
import TradingPanel from './components/TradingPanel';
import Dashboard from './components/Dashboard';
import AIAnalyst from './components/AIAnalyst';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trade' | 'learn'>('dashboard');
  const [symbol, setSymbol] = useState('AAPL');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [candles, setCandles] = useState<StockCandle[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Hybrid Mode Detection
  // If API Keys are present in environment, default to Real, else Mock.
  // Note: Vite uses import.meta.env but user requested standard process.env style or we map it. 
  // We use the variables defined in code above.
  const hasKeys = !!process.env.VITE_FINNHUB_API_KEY;
  const [isRealMode, setIsRealMode] = useState(hasKeys);

  // --- Effects ---

  // Initial Load
  useEffect(() => {
    loadPortfolio();
    handleFetchMarketData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealMode]);

  const loadPortfolio = async () => {
    const data = await portfolioService.getAssets(isRealMode);
    setAssets(data);
    setTrades(portfolioService.getTrades());
  };

  const handleFetchMarketData = async () => {
    setIsLoadingData(true);
    try {
      const q = await marketService.fetchStockQuote(symbol, isRealMode);
      setQuote(q);
      const c = await marketService.fetchStockCandles(symbol, '1D', isRealMode);
      setCandles(c);
    } catch (error) {
      console.error("Error fetching market data", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleTrade = async (type: TradeType, qty: number, price: number) => {
    const result = await portfolioService.executeTrade(
      { symbol, type, quantity: qty, price, total: qty * price },
      assets,
      isRealMode
    );

    if (result.success && result.newAssets) {
      setAssets(result.newAssets);
      setTrades(portfolioService.getTrades());
      alert(`交易成功: ${type === TradeType.BUY ? '買入' : '賣出'} ${symbol} ${qty} 股`);
    } else {
      alert(`交易失敗: ${result.message}`);
    }
  };

  // Build a price map for the dashboard valuation
  const priceMap: Record<string, number> = {};
  assets.forEach(a => {
    if(a.type === 'STOCK') priceMap[a.symbol] = a.symbol === symbol && quote ? quote.c : a.averageCost; // Simplified valuation
  });

  // --- Render Helpers ---

  const renderSidebar = () => (
    <div className="w-64 bg-white h-screen border-r border-gray-200 hidden md:flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">A</div>
          AlphaCore
        </h1>
        <p className="text-xs text-gray-400 mt-1 pl-10 tracking-wider">ASSET MANAGER</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          資產總覽
        </button>
        <button 
          onClick={() => setActiveTab('trade')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'trade' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <LineChart className="w-5 h-5" />
          交易與行情
        </button>
        <button 
          onClick={() => setActiveTab('learn')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'learn' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <GraduationCap className="w-5 h-5" />
          投資學院
        </button>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 p-3 rounded-lg">
           <div className="flex items-center justify-between mb-2">
             <span className="text-xs font-bold text-gray-500 uppercase">系統模式</span>
             <Settings className="w-3 h-3 text-gray-400" />
           </div>
           <button
             onClick={() => setIsRealMode(!isRealMode)}
             className={`w-full text-xs py-1.5 px-3 rounded-md font-bold transition flex items-center justify-center gap-2 ${isRealMode ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
           >
             {isRealMode ? '● 真實連線' : '○ 模擬環境'}
           </button>
           {!hasKeys && isRealMode && (
             <p className="text-[10px] text-red-500 mt-1 text-center">未偵測到 API 金鑰，將使用備用數據</p>
           )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="max-w-5xl mx-auto animate-fade-in">
             <header className="mb-8">
               <h2 className="text-2xl font-bold text-gray-800">資產配置看板</h2>
               <p className="text-gray-500">即時監控您的投資組合表現</p>
             </header>
             <Dashboard assets={assets} prices={priceMap} />
             
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                 <Wallet className="w-5 h-5 text-gray-500" />
                 <h3 className="font-bold text-gray-800">持倉明細</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-gray-50 text-gray-600 font-medium">
                     <tr>
                       <th className="px-6 py-3">資產名稱</th>
                       <th className="px-6 py-3">持有數量</th>
                       <th className="px-6 py-3">平均成本</th>
                       <th className="px-6 py-3">類型</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {assets.map(a => (
                       <tr key={a.id} className="hover:bg-gray-50/50">
                         <td className="px-6 py-3 font-medium text-gray-900">{a.name} <span className="text-gray-400 font-normal">({a.symbol})</span></td>
                         <td className="px-6 py-3">{a.quantity.toLocaleString()}</td>
                         <td className="px-6 py-3">${a.averageCost.toLocaleString()}</td>
                         <td className="px-6 py-3">
                           <span className={`px-2 py-1 rounded-full text-xs ${a.type === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                             {a.type}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        );

      case 'trade':
        return (
          <div className="max-w-6xl mx-auto animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Chart & AI */}
                <div className="lg:col-span-2 space-y-6">
                   <MarketChart data={candles} symbol={symbol} />
                   <AIAnalyst 
                     symbol={symbol} 
                     price={quote?.c || 0} 
                     onAnalyze={(s, p) => aiService.analyzeStockWithGemini(s, p, isRealMode)} 
                   />
                </div>

                {/* Right Column: Trading & History */}
                <div className="space-y-6">
                   <TradingPanel 
                      symbol={symbol}
                      currentQuote={quote}
                      onSymbolChange={setSymbol}
                      onRefreshQuote={handleFetchMarketData}
                      onTrade={handleTrade}
                      isLoading={isLoadingData}
                   />
                   
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                        <History className="w-4 h-4 text-gray-400" />
                        <h4 className="font-bold text-gray-700 text-sm">近期交易紀錄</h4>
                      </div>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {trades.length === 0 && <p className="text-xs text-gray-400 text-center py-4">尚無交易紀錄</p>}
                        {trades.slice(0, 10).map((t: any) => (
                          <div key={t.id} className="flex justify-between items-center text-xs">
                             <div>
                               <span className={`font-bold ${t.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                                 {t.type === 'BUY' ? '買入' : '賣出'}
                               </span>
                               <span className="ml-2 font-medium text-gray-700">{t.symbol}</span>
                             </div>
                             <div className="text-right text-gray-500">
                               <div>{t.quantity} 股 @ {t.price}</div>
                               <div className="text-[10px]">{new Date(t.timestamp).toLocaleDateString()}</div>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'learn':
        return (
          <div className="max-w-3xl mx-auto animate-fade-in">
             <header className="mb-8 text-center">
               <h2 className="text-2xl font-bold text-gray-800">投資新手學院</h2>
               <p className="text-gray-500">掌握基礎知識，做出更明智的決策</p>
             </header>

             <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-blue-700 mb-3">如何閱讀 K 線圖 (Candlestick)？</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    K 線圖（蠟燭圖）記錄了特定時間段內的價格波動。每一根蠟燭包含四個關鍵價格：開盤價 (Open)、收盤價 (Close)、最高價 (High) 和最低價 (Low)。
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li><strong className="text-green-600">紅 K 線 (陽線/Bullish)</strong>：收盤價高於開盤價，代表該時段價格上漲。實體部分底部為開盤，頂部為收盤。</li>
                    <li><strong className="text-red-600">綠 K 線 (陰線/Bearish)</strong>：收盤價低於開盤價，代表該時段價格下跌。實體部分頂部為開盤，底部為收盤。</li>
                    <li><strong>影線 (Shadow/Wick)</strong>：上下延伸的細線，代表該時段曾經到達的最高與最低價。</li>
                  </ul>
                  <div className="mt-4 p-4 bg-gray-50 rounded text-xs text-gray-500">
                    * 註：美股通常綠漲紅跌，台股通常紅漲綠跌。本系統採用國際慣例（綠色上漲，紅色下跌）。
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-blue-700 mb-3">成交量 (Volume) 的意義</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    成交量代表在特定時間內買賣雙方成交的總股數。量是價的先行指標。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                     <div className="bg-blue-50 p-4 rounded-lg">
                       <h4 className="font-bold text-blue-800 text-sm mb-1">價漲量增</h4>
                       <p className="text-xs text-blue-600">表示上漲動能強勁，多頭趨勢可能持續。</p>
                     </div>
                     <div className="bg-orange-50 p-4 rounded-lg">
                       <h4 className="font-bold text-orange-800 text-sm mb-1">價漲量縮</h4>
                       <p className="text-xs text-orange-600">稱為「背離」，可能暗示買盤力道減弱，需小心回檔。</p>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {renderSidebar()}
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-20 px-4 py-3 flex justify-between items-center">
         <span className="font-bold text-gray-900">AlphaCore</span>
         <button onClick={() => setActiveTab(activeTab === 'dashboard' ? 'trade' : 'dashboard')} className="p-2 text-gray-600">
           {activeTab === 'dashboard' ? <LineChart /> : <LayoutDashboard />}
         </button>
      </div>

      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-12 md:mt-0 overflow-y-auto h-screen">
        {renderContent()}
        
        <footer className="mt-12 text-center text-gray-400 text-xs pb-4">
          AlphaCore Trading System © 2024 | Current Mode: {isRealMode ? 'Real Network' : 'Simulation'}
        </footer>
      </main>
    </div>
  );
};

export default App;