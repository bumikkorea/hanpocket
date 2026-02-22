import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['.trycloudflare.com', '.loca.lt'],
    proxy: {
      '/api/apple-music': {
        target: 'https://rss.marketingtools.apple.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/apple-music/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk: React 및 UI 라이브러리들
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/lucide-react')) {
            return 'vendor';
          }
          
          // Data chunk: 큰 데이터 파일들을 별도 청크로 분리
          if (id.includes('/src/data/')) {
            return 'data';
          }
          
          // Components chunk: Tab 컴포넌트들을 별도 청크로 분리
          if (id.includes('/src/components/') && id.includes('Tab.jsx')) {
            return 'components';
          }
        }
      }
    }
  }
})
