import { StockCandle } from './types';

export const APP_NAME = "AlphaCore";

// Mock Data for AAPL (Simulation Mode)
export const MOCK_CANDLES: StockCandle[] = Array.from({ length: 30 }).map((_, i) => {
  const basePrice = 150 + Math.sin(i * 0.5) * 10 + (i * 0.5);
  const volatility = Math.random() * 5;
  return {
    t: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
    o: basePrice,
    c: basePrice + (Math.random() - 0.5) * volatility,
    h: basePrice + volatility,
    l: basePrice - volatility,
    v: Math.floor(Math.random() * 1000000) + 500000
  };
});

export const MOCK_QUOTE = {
  c: 175.50,
  d: 2.5,
  dp: 1.45,
  h: 176.20,
  l: 173.10,
  o: 173.50,
  pc: 173.00
};

export const MOCK_ANALYSIS = "【模擬分析結果】\n根據目前的技術指標顯示，AAPL 呈現穩健的上漲趨勢。移動平均線向上發散，RSI 指標位於 65 左右，尚未進入超買區。基本面方面，近期財報顯示服務營收持續增長。\n\n投資建議：建議持有，若回調至支撐位可考慮加碼。止損位建議設於月線下方。";

export const DEFAULT_CASH = 100000; // Initial cash for simulation

export const MOCK_PORTFOLIO_INIT = [
  { id: '1', symbol: 'USD', name: '現金餘額', quantity: DEFAULT_CASH, averageCost: 1, type: 'CASH' },
  { id: '2', symbol: 'AAPL', name: 'Apple Inc.', quantity: 100, averageCost: 145.5, type: 'STOCK' },
  { id: '3', symbol: 'TSLA', name: 'Tesla Inc.', quantity: 20, averageCost: 210.0, type: 'STOCK' },
  { id: '4', symbol: 'NVDA', name: 'NVIDIA Corp', quantity: 10, averageCost: 450.0, type: 'STOCK' }
];