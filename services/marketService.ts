import { StockCandle, StockQuote } from '../types';
import { MOCK_CANDLES, MOCK_QUOTE } from '../constants';

const API_KEY = process.env.VITE_FINNHUB_API_KEY;

export const fetchStockQuote = async (symbol: string, isRealMode: boolean): Promise<StockQuote> => {
  if (isRealMode && API_KEY) {
    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      if (data.c === 0 && data.h === 0) throw new Error('Symbol not found'); // Finnhub often returns 0s for invalid symbols
      return data;
    } catch (e) {
      console.warn("Falling back to mock quote due to error:", e);
      // Fallback to mock with slight randomization for "simulated" feel
      return { ...MOCK_QUOTE, c: MOCK_QUOTE.c + (Math.random() * 2 - 1) };
    }
  }
  
  // Simulation Mode logic: generate slightly different numbers based on symbol length to feel "dynamic"
  const variation = symbol.length * 1.5;
  return { 
    ...MOCK_QUOTE, 
    c: 100 + variation + Math.random() * 5,
    h: 105 + variation,
    l: 95 + variation 
  };
};

export const fetchStockCandles = async (symbol: string, resolution: string, isRealMode: boolean): Promise<StockCandle[]> => {
  if (isRealMode && API_KEY) {
    try {
      // Get timestamps for past year
      const to = Math.floor(Date.now() / 1000);
      const from = to - (365 * 24 * 60 * 60); 
      const resMap: Record<string, string> = { '1D': 'D', '1W': 'W', '1M': 'M' };
      const apiRes = resMap[resolution] || 'D';

      const response = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${apiRes}&from=${from}&to=${to}&token=${API_KEY}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();

      if (data.s === 'ok') {
        return data.t.map((t: number, i: number) => ({
          t: t * 1000,
          o: data.o[i],
          h: data.h[i],
          l: data.l[i],
          c: data.c[i],
          v: data.v[i]
        }));
      }
    } catch (e) {
      console.warn("Falling back to mock candles");
    }
  }

  // Return Mock Data if real fails or in mock mode
  return MOCK_CANDLES.map(c => ({
    ...c,
    // Add random variation based on symbol to make it look different for different stocks
    c: c.c + (symbol.charCodeAt(0) % 10), 
    o: c.o + (symbol.charCodeAt(0) % 10)
  }));
};