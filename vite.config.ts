import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // 重要：為了 GitHub Pages，base 必須設定為 /<repo-name>/
    // 如果你在本地開發，這個值會被忽略或設為 '/'
    base: process.env.GITHUB_PAGES_BASE_URL || '/',
    define: {
      // 為了符合 Google GenAI SDK 使用 process.env.API_KEY 的要求
      // 我們在此將編譯時的環境變數注入到程式碼中
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.VITE_FINNHUB_API_KEY': JSON.stringify(env.VITE_FINNHUB_API_KEY || ''),
      'process.env.VITE_FIREBASE_CONFIG_STRING': JSON.stringify(env.VITE_FIREBASE_CONFIG_STRING || ''),
    },
  };
});