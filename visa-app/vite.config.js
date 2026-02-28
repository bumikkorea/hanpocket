import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(), 
    basicSsl(),
    tailwindcss(),
    // PWA 비활성화 - 서비스워커 캐시/업데이트 문제 해결
    // VitePWA({...})
  ],
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
          // Vendor chunks: 외부 라이브러리들을 기능별로 분리
          if (id.includes('node_modules')) {
            // React 관련
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // 아이콘 라이브러리
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // 기타 vendor
            return 'vendor-libs';
          }
          
          // 화장실 데이터 별도 청크 (409KB, lazy load)
          if (id.includes('toiletData')) {
            return 'data-toilet';
          }
          
          // 큰 데이터 파일들을 별도 청크로 분리
          if (id.includes('/src/data/')) {
            return 'data';
          }
          
          // 각 탭 컴포넌트들을 기능별로 분리
          // Travel & Tourism related
          if (id.includes('TravelTab.jsx') || id.includes('/TravelDiary/')) {
            return 'tab-travel';
          }
          
          // Food & Culture related
          if (id.includes('FoodTab.jsx') || id.includes('HallyuTab.jsx') || 
              id.includes('CultureTab.jsx')) {
            return 'tab-culture';
          }
          
          // Shopping & Finance related
          if (id.includes('ShoppingTab.jsx') || id.includes('FinanceTab.jsx') || 
              id.includes('DigitalWalletTab.jsx')) {
            return 'tab-commerce';
          }
          
          // Education & Jobs related
          if (id.includes('EducationTab.jsx') || id.includes('JobsTab.jsx') || 
              id.includes('ResumeTab.jsx')) {
            return 'tab-career';
          }
          
          // Life & Health related
          if (id.includes('MedicalTab.jsx') || id.includes('FitnessTab.jsx') || 
              id.includes('LifeToolsTab.jsx') || id.includes('HousingTab.jsx') ||
              id.includes('PetTab.jsx')) {
            return 'tab-lifestyle';
          }
          
          // Communication & Social
          if (id.includes('CommunityTab.jsx') || id.includes('TranslatorTab.jsx') || 
              id.includes('ARTranslateTab.jsx')) {
            return 'tab-social';
          }
          
          // Services & Support
          if (id.includes('SOSTab.jsx') || id.includes('AgencyTab.jsx') || 
              id.includes('VisaAlertTab.jsx')) {
            return 'tab-services';
          }
          
          // Home 관련 (순환 의존성 방지를 위해 가장 먼저 체크)
          if (id.includes('/home/')) {
            return 'home-components';
          }
          
          // Widgets (home 다음에 체크)
          if (id.includes('/widgets/') || id.includes('/cards/')) {
            return 'widgets';
          }
          
          // Pocket 관련 컴포넌트들 (위젯과 분리)
          if (id.includes('/pockets/')) {
            return 'pockets';
          }
        }
      }
    }
  }
})
