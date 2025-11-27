import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface AIAnalystProps {
  symbol: string;
  price: number;
  onAnalyze: (symbol: string, price: number) => Promise<string>;
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ symbol, price, onAnalyze }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    const result = await onAnalyze(symbol, price);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-700 rounded-lg">
           <Bot className="w-6 h-6 text-indigo-200" />
        </div>
        <h3 className="text-xl font-bold">AlphaCore 智能顧問</h3>
      </div>

      <p className="text-indigo-200 text-sm mb-6">
        使用 Gemini AI 模型針對 <span className="text-white font-bold">{symbol}</span> 進行即時基本面與技術面分析。
      </p>

      {!analysis && (
        <button
          onClick={handleClick}
          disabled={isLoading}
          className="w-full py-3 bg-white text-indigo-900 rounded-lg font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>分析中...</>
          ) : (
             <>
               <Sparkles className="w-4 h-4" />
               產生分析報告
             </>
          )}
        </button>
      )}

      {analysis && (
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 animate-fade-in">
          <div className="text-sm leading-relaxed whitespace-pre-wrap font-light text-gray-100">
            {analysis}
          </div>
          <button 
            onClick={() => setAnalysis(null)}
            className="mt-4 text-xs text-indigo-300 hover:text-white underline"
          >
            清除結果
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAnalyst;