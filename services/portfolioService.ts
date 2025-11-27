import { Asset, TradeRecord, TradeType, PortfolioSummary } from '../types';
import { MOCK_PORTFOLIO_INIT } from '../constants';

// NOTE: In a real "Hybrid" production app, we would initialize Firebase here.
// For this single-file output constraint and preview environment stability,
// we will prioritize a robust LocalStorage implementation that mimics a backend.
// If VITE_FIREBASE_CONFIG_STRING exists, we would parse it and connect.

const STORAGE_KEY_ASSETS = 'alphacore_assets';
const STORAGE_KEY_TRADES = 'alphacore_trades';

export const getAssets = async (isRealMode: boolean): Promise<Asset[]> => {
  // Simulating async network call
  await new Promise(resolve => setTimeout(resolve, 300));

  if (isRealMode) {
     // Placeholder for real Firestore logic
     // const snapshot = await getDocs(collection(db, "assets"));
     // return snapshot.docs.map(...)
     // For this demo, we fall back to local storage even in "Real Mode" UI if no actual DB is connected
  }

  const stored = localStorage.getItem(STORAGE_KEY_ASSETS);
  if (!stored) {
    // Initialize mock data
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(MOCK_PORTFOLIO_INIT));
    return MOCK_PORTFOLIO_INIT as Asset[];
  }
  return JSON.parse(stored);
};

export const executeTrade = async (
  trade: Omit<TradeRecord, 'id' | 'timestamp'>,
  currentAssets: Asset[],
  isRealMode: boolean
): Promise<{ success: boolean; message: string; newAssets?: Asset[] }> => {
  
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency

  let assets = [...currentAssets];
  const cashAsset = assets.find(a => a.type === 'CASH');
  const cashIndex = assets.findIndex(a => a.type === 'CASH');

  if (!cashAsset && trade.type === TradeType.BUY) {
    return { success: false, message: '找不到現金帳戶' };
  }

  const totalCost = trade.price * trade.quantity;

  if (trade.type === TradeType.BUY) {
    if (cashAsset!.quantity < totalCost) {
      return { success: false, message: '現金餘額不足' };
    }

    // Deduct Cash
    assets[cashIndex] = { ...cashAsset!, quantity: cashAsset!.quantity - totalCost };

    // Add Stock
    const existingStockIndex = assets.findIndex(a => a.symbol === trade.symbol && a.type === 'STOCK');
    if (existingStockIndex >= 0) {
      const stock = assets[existingStockIndex];
      const newQty = stock.quantity + trade.quantity;
      const newAvg = ((stock.averageCost * stock.quantity) + totalCost) / newQty;
      assets[existingStockIndex] = { ...stock, quantity: newQty, averageCost: newAvg };
    } else {
      assets.push({
        id: Date.now().toString(),
        symbol: trade.symbol,
        name: trade.symbol, // In real app, fetch name
        quantity: trade.quantity,
        averageCost: trade.price,
        type: 'STOCK'
      });
    }

  } else {
    // SELL
    const stockIndex = assets.findIndex(a => a.symbol === trade.symbol && a.type === 'STOCK');
    if (stockIndex < 0 || assets[stockIndex].quantity < trade.quantity) {
      return { success: false, message: '持股不足' };
    }

    // Add Cash
    assets[cashIndex] = { ...cashAsset!, quantity: cashAsset!.quantity + totalCost };

    // Reduce Stock
    const stock = assets[stockIndex];
    const newQty = stock.quantity - trade.quantity;
    if (newQty === 0) {
      assets.splice(stockIndex, 1);
    } else {
      assets[stockIndex] = { ...stock, quantity: newQty };
    }
  }

  // Persist
  localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
  
  // Record Trade
  const newTrade: TradeRecord = {
    ...trade,
    id: Date.now().toString(),
    timestamp: Date.now()
  };
  const existingTrades = JSON.parse(localStorage.getItem(STORAGE_KEY_TRADES) || '[]');
  localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify([newTrade, ...existingTrades]));

  return { success: true, message: '交易成功', newAssets: assets };
};

export const getTrades = (): TradeRecord[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_TRADES) || '[]');
};

export const addManualAsset = (asset: Asset) => {
  const assets = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSETS) || '[]');
  assets.push({ ...asset, id: Date.now().toString() });
  localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
  return assets;
};