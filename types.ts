export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface StockCandle {
  t: number; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High of day
  l: number; // Low of day
  o: number; // Open of day
  pc: number; // Previous close
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  type: 'STOCK' | 'CASH' | 'CRYPTO' | 'OTHER';
}

export interface TradeRecord {
  id: string;
  symbol: string;
  type: TradeType;
  quantity: number;
  price: number;
  total: number;
  timestamp: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  profitPercent: number;
  cashBalance: number;
}

export interface AIAnalysisResult {
  symbol: string;
  analysis: string;
  timestamp: number;
}