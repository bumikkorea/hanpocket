# CLAUDE.md — HanPocket Codebase Guide

## Project Overview

**HanPocket** (韩口袋) is a "super app" for Chinese nationals living in or visiting South Korea. It aggregates visa guidance, travel info, food/restaurant discovery, K-culture, Korean language learning, shopping, healthcare, housing, jobs, finance, and emergency services into a single mobile-first PWA.

- **App ID:** `kr.hanpocket.app`
- **Target users:** Chinese speakers (primary), with Korean and English support
- **Languages:** Korean (ko), Chinese (zh), English (en) — trilingual throughout
- **Design language:** 29CM-style minimalism — Inter font, black on white, clean spacing

## Repository Structure

```
hanpocket/
├── visa-app/              # Main application (React + Vite PWA)
│   ├── src/
│   │   ├── App.jsx        # Root component (~104K lines, monolithic — contains all tab routing and state)
│   │   ├── main.jsx       # Entry point
│   │   ├── index.css      # Global styles
│   │   ├── styles/theme.css  # CSS variables for dark mode theming
│   │   ├── components/    # Tab components and UI
│   │   │   ├── HomeTab.jsx         # Home/dashboard tab
│   │   │   ├── MapTab.jsx          # KakaoMap integration
│   │   │   ├── TravelTab.jsx       # Travel guides
│   │   │   ├── FoodTab.jsx         # Restaurant/food discovery
│   │   │   ├── ShoppingTab.jsx     # Shopping guides
│   │   │   ├── HallyuTab.jsx       # K-pop/K-drama/Korean culture
│   │   │   ├── EducationTab.jsx    # Korean language learning
│   │   │   ├── LifeToolsTab.jsx    # Daily life tools
│   │   │   ├── SOSTab.jsx          # Emergency services
│   │   │   ├── CommunityTab.jsx    # Community forum
│   │   │   ├── TranslatorTab.jsx   # Translation tool
│   │   │   ├── OnboardingFlow.jsx  # First-run user setup
│   │   │   ├── home/              # Home tab sub-components
│   │   │   │   ├── widgets/       # Dashboard widgets (exchange rate, weather, etc.)
│   │   │   │   ├── common/        # Shared UI (LucideIcon, TreeSection, WidgetContent)
│   │   │   │   └── utils/         # Constants and helpers for home
│   │   │   ├── pockets/          # "Pocket" quick-access modules
│   │   │   │   ├── RestaurantPocket.jsx
│   │   │   │   ├── CafePocket.jsx
│   │   │   │   ├── TransportPocket.jsx
│   │   │   │   ├── ShoppingPocket.jsx
│   │   │   │   ├── AccommodationPocket.jsx
│   │   │   │   ├── ConveniencePocket.jsx
│   │   │   │   └── EmergencyPocket.jsx
│   │   │   ├── cards/            # Widget cards (Apple-style, idol schedule, etc.)
│   │   │   ├── modals/           # Modal overlays (SearchModal)
│   │   │   ├── TravelDiary/      # Travel diary feature
│   │   │   └── widgets/          # Standalone widgets (calendar, K-pop chart, etc.)
│   │   ├── data/              # Static data and content databases
│   │   │   ├── i18n.js           # Trilingual translations (ko/zh/en)
│   │   │   ├── koreanFoodDB.js   # 300 Korean dishes database
│   │   │   ├── visaData.js       # Visa types, requirements, categories
│   │   │   ├── visaTransitions.js # Visa change pathways
│   │   │   ├── pockets.js        # Pocket categories and feature definitions
│   │   │   ├── idolData.js       # K-pop idol information
│   │   │   ├── hospitalData.js   # Hospital locations/info
│   │   │   └── ...               # Other content DBs
│   │   ├── hooks/             # React custom hooks
│   │   │   ├── useDarkMode.js
│   │   │   ├── useExchangeRate.js
│   │   │   ├── useLanguage.js
│   │   │   ├── useNotification.js
│   │   │   └── useProfile.js
│   │   ├── utils/             # Utility modules
│   │   │   ├── kakaoAuth.js      # Kakao login/OAuth
│   │   │   ├── appleAuth.js      # Apple login/OAuth
│   │   │   ├── analytics.js      # GA4 tracking
│   │   │   ├── affiliateLinks.js # Affiliate link management
│   │   │   ├── appLinks.js       # Deep links to external Korean apps
│   │   │   ├── pushNotification.js # Push notification setup
│   │   │   └── sw-update.js      # Service worker update logic
│   │   └── pages/             # Page-level components
│   │       ├── HomePage.jsx
│   │       ├── PocketsPage.jsx
│   │       └── VisaPage.jsx
│   ├── server/               # Express backend (lightweight)
│   │   ├── server.js
│   │   └── api/              # API routes (e.g., alipay.js)
│   ├── contracts/            # Service contract templates (Korean legal docs)
│   ├── docs/                 # Feature specs, monetization ideas, research
│   ├── android/              # Capacitor Android native wrapper
│   ├── workers/              # Cloudflare Workers (inside visa-app)
│   ├── public/               # Static assets (icons, manifest, offline.html)
│   ├── dist/                 # Build output
│   ├── package.json
│   ├── vite.config.js        # Vite config with PWA, proxy, code splitting
│   ├── tailwind.config.js    # Tailwind v4 with CSS variable theming
│   ├── eslint.config.js      # ESLint flat config
│   ├── capacitor.config.ts   # Capacitor for native Android builds
│   └── .env.example          # Required env vars template
│
├── workers/                  # Cloudflare Workers (standalone)
│   ├── translate-proxy.js    # DeepSeek API translation proxy
│   ├── schema.sql            # D1 database schema (community, users, posts)
│   ├── wrangler.toml         # Wrangler config
│   └── package.json
│
├── wechat-miniprogram/       # WeChat Mini Program wrapper
│   ├── hanpocket-miniprogram/  # Actual mini program code
│   │   ├── app.js / app.json
│   │   ├── pages/webview/    # WebView wrapper for HanPocket web app
│   │   ├── utils/            # Bridge, API, common utils
│   │   └── components/
│   └── docs/                 # Registration and deployment guides
│
├── memory/                   # Daily memory logs (구월 AI context)
├── AGENTS.md                 # AI agent behavior guidelines
├── SOUL.md                   # AI personality definition
├── USER.md                   # User profile (범범뻠/Kelly)
├── IDENTITY.md               # AI identity (구월)
├── MEMORY.md                 # Long-term AI memory
├── HEARTBEAT.md              # Autonomous task scheduler rules
├── TASKQUEUE.md              # Task queue and completion log
├── SCHEDULE.md               # Development priority schedule
├── TOOLS.md                  # Environment-specific tool notes
├── BOOTSTRAP.md              # First-run AI setup instructions
└── package.json              # Root package (jsdom, md-to-pdf utilities)
```

## Tech Stack

### Frontend (visa-app)
- **React 19** with JSX (no TypeScript in components — `.jsx` files)
- **Vite 7** — dev server, build, HMR
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin, CSS variable theming
- **lucide-react** — icon library (sole icon source)
- **PWA** — `vite-plugin-pwa` with Workbox service worker, offline support
- **Capacitor 8** — native Android app wrapper (`cap sync`, `cap build`)

### Backend / Infrastructure
- **Cloudflare Workers** — translation proxy (DeepSeek API), future API proxies
- **Cloudflare D1** — planned community database (schema ready in `workers/schema.sql`)
- **Express server** — lightweight backend in `visa-app/server/` for Alipay OAuth
- **KakaoMap JavaScript API** — map features, dynamically loaded
- **Kakao JavaScript SDK** — login, map, social features

### External APIs & Services
- **Kakao** — login OAuth, map API (300K requests/day free)
- **Apple** — Sign in with Apple
- **Google Analytics 4** — event tracking with consent management
- **DeepSeek API** — AI-powered translation (via Cloudflare Workers proxy)
- **data.go.kr** — Korean government open data APIs (weather, transit, hospitals, etc.)
- **Apple Music RSS** — K-pop chart data (proxied via Vite dev server)

### WeChat Mini Program
- Native WeChat mini program framework
- WebView-based wrapper embedding the HanPocket web app
- Bridge communication layer for native WeChat features

## Development Commands

### visa-app (main application)
```bash
cd visa-app
npm run dev          # Start dev server (port 3000, host 0.0.0.0)
npm run build        # Production build
npm run lint         # ESLint check
npm run preview      # Preview production build
npm run cap:sync     # Sync Capacitor plugins
npm run cap:build    # Build + sync for native
npm run android:build  # Full Android build pipeline
```

### workers (Cloudflare Workers)
```bash
cd workers
npm run dev          # Local dev (wrangler dev)
npm run deploy       # Deploy to Cloudflare
npm run deploy:prod  # Deploy to production
npm run deploy:dev   # Deploy to development
npm run tail         # Stream live logs
```

## Environment Variables

Required in `visa-app/.env` (see `.env.example`):
```
VITE_KAKAO_MAP_API_KEY=    # KakaoMap JavaScript API key
VITE_KAKAO_JS_KEY=         # Kakao login JS key
VITE_APPLE_CLIENT_ID=      # Apple Sign-In client ID (com.hanpocket.signin)
VITE_GOOGLE_ANALYTICS_ID=  # GA4 measurement ID
```

Workers secrets (set via `wrangler secret put`):
```
DEEPSEEK_API_KEY           # DeepSeek API key for translation proxy
```

## Code Conventions

### File Naming
- Components: `PascalCase.jsx` (e.g., `FoodTab.jsx`, `HomeTab.jsx`)
- Hooks: `camelCase.js` with `use` prefix (e.g., `useDarkMode.js`)
- Data files: `camelCase.js` (e.g., `koreanFoodDB.js`, `visaData.js`)
- Utils: `camelCase.js` (e.g., `kakaoAuth.js`, `analytics.js`)

### Component Patterns
- **Tab components** are the primary UI units, lazy-loaded via `React.lazy()` in `App.jsx`
- **Pocket components** are quick-access feature modules inside `components/pockets/`
- **Widget components** are dashboard cards in `components/widgets/` and `components/home/widgets/`
- **Trilingual text** uses the `t` object from `data/i18n.js` with `{ko, zh, en}` keys
- Helper function `L(lang, data)` in App.jsx resolves language-specific strings
- State is primarily managed via React `useState` in App.jsx (no Redux/Zustand)

### Styling
- Tailwind utility classes are the primary styling method
- Dark mode via CSS variables defined in `styles/theme.css` and `.dark` class
- Inter font (Google Fonts) — weights 300-700
- Design follows 29CM aesthetic: minimal, black-on-white, generous whitespace

### Code Splitting
- Vite manual chunks configured in `vite.config.js` for optimal bundle splitting
- Tab components are lazy-loaded: `const FoodTab = lazy(() => import('./components/FoodTab'))`
- Data files bundled into a separate `data` chunk
- Vendor libraries split: `vendor-react`, `vendor-icons`, `vendor-libs`

### i18n Pattern
- All user-facing text should support ko/zh/en
- Translation object structure: `{ ko: '한국어', zh: '中文', en: 'English' }`
- Language cycling order: ko → zh → en → ko

### Authentication
- Kakao OAuth (primary) — `utils/kakaoAuth.js`
- Apple Sign-In — `utils/appleAuth.js`
- WeChat login (planned, for mini program)
- Alipay login (planned)
- Profile stored in `localStorage` via `visa_profile` key

## Architecture Notes

### App.jsx Monolith
`App.jsx` is the central hub (~104K lines). It contains:
- All tab routing and navigation state
- User profile management
- Authentication flows
- Bottom navigation bar
- Onboarding flow
- Sidebar/menu
- Language management

A backup exists at `App_BACKUP.jsx`. Be cautious with large changes to this file.

### "Pockets" Concept
Pockets are quick-access modules that aggregate related services:
- Restaurant, Cafe, Transport, Shopping, Accommodation, Convenience Store, Emergency
- Each pocket has KakaoMap integration and deep links to Korean apps
- Defined in `data/pockets.js`, rendered by components in `components/pockets/`

### PWA Configuration
- Service worker with offline fallback (`offline.html`)
- Cache strategies: CacheFirst for app shell/assets, NetworkFirst for APIs
- Auto-update on new deployments
- Manifest configured for standalone portrait display

### Database (D1 Schema)
`workers/schema.sql` defines the community database:
- Users, profiles, authentication tokens
- Posts, comments, likes, bookmarks
- Categories with multilingual support
- Reports and moderation system
- Full-text search indexes

## Key Files to Read First

1. `visa-app/src/App.jsx` — Central application logic (large file, read top ~100 lines for structure)
2. `visa-app/src/data/i18n.js` — Translation system
3. `visa-app/src/data/pockets.js` — Pocket feature definitions
4. `visa-app/vite.config.js` — Build configuration and code splitting
5. `visa-app/package.json` — Dependencies and scripts
6. `SCHEDULE.md` — Current development priorities (P0-P3)
7. `TASKQUEUE.md` — Completed and pending tasks

## Development Priorities (Current)

See `SCHEDULE.md` for full details. Summary:

- **P0 (Now):** Real data API integration (data.go.kr), translation (DeepSeek), visa simulator, SOS features
- **P1 (1-2 weeks):** Content quality — Korean learning, K-pop live data, community CRUD, multilingual completion
- **P2 (2-3 weeks):** UX — search, push notifications, dark mode expansion, performance
- **P3 (Pre-launch):** Ops — login flows, domain purchase, Vercel deploy, app store prep, WeChat mini program registration

## Pending User Actions (Blockers)

These require 범범뻠 (Kelly) to complete before development can proceed:
- `data.go.kr` API keys (15 keys needed) — blocks most P0 real data work
- DeepSeek API key — blocks real-time translation
- Domain purchase (hanpocket.kr) — blocks production deployment
- Naver login review request — blocks Naver OAuth
- `law.go.kr` API key — blocks visa legal data

## Important Safety Rules

- **Never expose API keys** — use `.env` files and Cloudflare secrets
- **Never send business ideas/confidential data** to external bots or chat rooms
- **Sub-agents must never directly call external bot APIs** — results go to files or return to main session only
- **Cost awareness** — notify before actions that incur API costs
- **Prefer `trash` over `rm`** for file deletion
- **Ask before external actions** — emails, public posts, any outbound communication
