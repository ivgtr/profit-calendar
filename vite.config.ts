import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/profit-calendar/' : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Chart.jsを独立したチャンクに分割
          'chart-libs': ['chart.js', 'react-chartjs-2'],
          // その他の大きなライブラリがあればここに追加
        }
      }
    }
  }
})
