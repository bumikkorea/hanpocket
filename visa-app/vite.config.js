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
})
