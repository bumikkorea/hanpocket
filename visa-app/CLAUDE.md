# CLAUDE.md — HanPocket 프로젝트 컨텍스트

## 프로젝트 개요
**HanPocket** — 한국에 오는 중국인을 위한 생활 슈퍼앱 (React SPA)
- 타겟: 중국인 관광객/유학생/거주자
- 언어: 중국어(간체) 우선, 한국어/영어 지원
- 디자인: 29CM 스타일 — Inter 폰트, 검정 단색, 흰 배경, 미니멀

## 기술 스택
- **프론트엔드**: React 19 + Vite 7 + TailwindCSS 4
- **모바일**: Capacitor 8 (Android/iOS)
- **아이콘**: lucide-react
- **배포**: Cloudflare Pages (`npx wrangler pages deploy dist --project-name=hanpocket --branch=main --commit-dirty=true`)
- **백엔드**: Cloudflare Workers (API 프록시)
- **빌드**: `npm run build` → `dist/`
- **로컬 개발**: `npm run dev` (HTTPS, `@vitejs/plugin-basic-ssl`)
- **PWA**: 완전 제거됨 (서비스워커 없음)

## 프로젝트 구조
```
visa-app/
├── src/
│   ├── App.jsx              # 메인 앱 (모노리식, ~3000줄)
│   ├── components/
│   │   ├── MapTab.jsx       # 지도 탭 (1927줄) — 카카오맵, 카테고리 핀, 여행계획
│   │   ├── TravelTab.jsx    # 여행 탭 (776줄) — 입국가이드, 교통, 택시가이드, TourAPI
│   │   ├── HallyuTab.jsx    # 한류 탭 — K-POP, 드라마, 축제(TourAPI)
│   │   ├── ShoppingTab.jsx  # 쇼핑 탭 — 브랜드, TourAPI 쇼핑스팟
│   │   ├── FoodTab.jsx      # 맛집 탭 — 미슐랭, 블루리본, TourAPI 음식점
│   │   ├── PetTab.jsx       # 반려동물 탭 — TourAPI 동반여행지
│   │   ├── OnboardingFlow.jsx # 온보딩/로그인 화면
│   │   ├── TourDetailModal.jsx # TourAPI 상세 모달
│   │   ├── TourSpotSection.jsx # TourAPI 발견 섹션 (재사용)
│   │   ├── SOSTab.jsx       # 긴급/SOS
│   │   ├── VisaAlertTab.jsx # 비자 정보
│   │   └── ...
│   ├── api/
│   │   └── tourApi.js       # TourAPI 12개 엔드포인트 + 캐시 + 재시도
│   ├── hooks/
│   │   └── useTourApi.js    # TourAPI 6개 훅
│   ├── data/
│   │   ├── tourApiCodes.js  # 관광 분류 코드
│   │   ├── toiletData.js    # 서울 공공화장실 2,189개 (409KB)
│   │   ├── zeropay/         # 제로페이 가맹점 데이터
│   │   ├── pockets.js       # 주머니(포켓) 카드 데이터
│   │   ├── visaData.js      # 비자 정보
│   │   ├── i18n.js          # 다국어
│   │   └── ...
│   └── main.jsx
├── workers/
│   ├── tour-api-proxy.js    # Cloudflare Workers TourAPI 프록시
│   └── wrangler-tour.toml
├── docs/
│   └── hanpocket-master-briefing.md  # 마스터 전략 문서 (필독!)
├── .env                     # API 키들
├── vite.config.js
└── package.json
```

## 빌드 & 배포
```bash
# 로컬 개발
npm run dev

# 빌드
npm run build

# Cloudflare Pages 배포
npx wrangler pages deploy dist --project-name=hanpocket --branch=main --commit-dirty=true

# TourAPI 프록시 배포
npx wrangler deploy -c workers/wrangler-tour.toml
```

## 환경변수 (.env)
```
VITE_KAKAO_MAP_API_KEY=d93decd524c15c3455ff05983ca07fac
VITE_KAKAO_JS_KEY=5e0e466ca30c0807b0c563f1d35f43a8
VITE_TOUR_API_KEY=40490c648d17e72faabd00bfc8be9994ee2cc64946edb68f4beb374eae1d482b
VITE_APPLE_CLIENT_ID=com.hanpocket.signin
```

## API 키 (백엔드/스크립트용, .env에 넣지 않음)
- data.go.kr: `2496d2b4a0583b554b287697f93fdb135d8a3def4d9b3358cb5d1a49c96aa3df`
- 서울 열린데이터광장: `725171716a6b656c39317953597056`
- 카카오 REST API: `6afa9f63ce3a224ae93a8f315248d98a`

## 탭 구조 (10개)
홈 | 비자(+서류) | 여행 | 맛집 | 쇼핑 | 한류 | 한국어 | 생활(+펫) | 구직·집 | 내정보

## 제품 철학 (반드시 준수)
1. **사용성**: 위챗/샤오홍슈/카카오 수준으로 익숙하고 편해야 함
2. **이중 시장**: 중국에서도, 한국에서도 쓸 수 있어야 함
3. **트렌드**: 최근 3년 트렌드 (유행 지난 건 OUT)
4. **유일성**: "이런 앱은 전세계에 없다" 수준의 차별화
5. **진심**: 중국인에게 진짜 도움. 마음이 느껴져야 함
6. **수익**: 동시에 돈도 벌 수 있는 구조

## 마스터 전략
- **+layer(급할 때) 먼저** → -layer(관광) 나중
- 🔥🔥🔥 필수: 제로페이, 관광안내소(중국어), 외국인병원, TourAPI, 비짓서울, 인천공항
- 번역비용 0원 (TourAPI ChsService2로 중국어 데이터 직접 사용)
- 80점 빨리 론칭 > 100점 늦게
- 카카오맵에 없는 화면 먼저 (알리페이 되는 곳, 외국인 병원, 중국어 통하는 곳)
- 상세 전략: `docs/hanpocket-master-briefing.md` 참고

## TourAPI 연동
- ChsService2 (중국어간체) 우선, KorService2 (한국어) 폴백
- ContentTypeId: 75=레포츠, 76=관광지, 77=교통, 78=문화시설, 79=쇼핑, 80=숙박, 82=음식점, 85=축제
- 일일 1,000건/엔드포인트 제한
- `src/api/tourApi.js`에 전체 구현 완료

## 주의사항
- ⛔ API 키를 코드에 하드코딩하지 말 것 (.env 사용)
- ⛔ 외부 서비스에 사업 아이디어/기밀 전송 금지
- ⚠️ 과금 발생 가능한 작업은 반드시 사전 고지
- ⚠️ toiletData.js (409KB)는 lazy import 필수 (별도 chunk)
- ⚠️ MapTab 마커는 뷰포트 내 최대 100개로 제한 (성능)

## 현재 진행 상황
### 완료
- TourAPI 전체 연동 (6개 탭)
- 서울 공공화장실 2,189개 지도 표시
- 택시가이드 (타입/요금/잡는법/핫라인/보여주기 카드/안전팁)
- 카카오맵 네비게이션 연동
- 여행계획 기능 (최대 10개 플랜, 각 10개 목적지)
- Cloudflare Pages 배포 완료
- PWA 제거 (서비스워커 충돌 해결)
- 입국심사 대기시간 (ImmigrationWaitTime) — T1/T2 터미널, 외국인/내국인 레인, 시간대별 평균 폴백
- 영수증 세금환급 판별기 (TaxRefundChecker) — OCR + 국세청 Tax Free 조회 + VAT 9.09% 환급계산 + 영수증 기록
- 국적별 여행자 현황 (VisitorHeatmapCard/Full) — 한국관광공사 통계 기반 + 국적/지역별 필터
- 출국 카운트다운 (DepartureCountdown) — 항공편 조회 + 타임라인 알림 + 체크리스트 + 택시/AREX 딥링크
- 다음 여행 위시리스트 (WishlistPage/Prompt/Reengagement) — 장소/음식/체험 저장 + 30일 후 재참여 카드
- 여권 스캔 자동 세팅 (PassportScan) — MRZ 파싱 + 국적별 비자/언어/대사관/팁 자동설정, 로컬 전용
- 맥락 기반 자동 추천 (SmartRecommendCard) — 시간+날씨+지역 조합 추천 카드, 30분 갱신
- 출국 타임어택 쇼핑 동선 (DepartureShoppingRoute) — 남은 시간별 최적 쇼핑루트 + 인기 구매 + 본국배송 CTA

### 신규 API 의존성 (키 등록 필요)
| 환경변수 | 용도 | 등록처 |
|---------|------|--------|
| VITE_AIRPORT_API_KEY | 인천공항 입국심사 대기시간 | https://www.airport.kr/ |
| VITE_CLOVA_OCR_API_KEY | 영수증 OCR | https://www.ncloud.com/product/aiService/ocr |
| VITE_NTS_API_KEY | 국세청 Tax Free 가맹점 조회 | https://www.data.go.kr |
| VITE_KTO_API_KEY | 한국관광공사 방문자 통계 | https://datalab.visitkorea.or.kr/ |
| VITE_FLIGHT_API_KEY | 항공편 상태 조회 | FlightAware or AeroDataBox |
| VITE_OPENWEATHER_API_KEY | 날씨 기반 추천 | https://openweathermap.org/api |
| VITE_NAVER_CLIENT_ID | 네이버 Place API (추천 데이터) | https://developers.naver.com/ |
| VITE_NAVER_CLIENT_SECRET | 네이버 Place API | https://developers.naver.com/ |

### 신규 파일 목록
- `src/api/immigrationApi.js` — 입국심사 대기시간 API + 시간대별 평균 데이터
- `src/api/taxRefundApi.js` — Clova OCR + 국세청 Tax Free + 환급 계산
- `src/api/visitorStatsApi.js` — 한국관광공사 방문자 통계 API
- `src/api/flightApi.js` — 항공편 상태/게이트/혼잡도 API
- `src/api/weatherApi.js` — OpenWeatherMap 날씨 API + 계절별 폴백
- `src/api/smartRecommendApi.js` — 맥락 기반 추천 엔진 (시간+날씨+지역)
- `src/utils/mrzParser.js` — 여권 MRZ 파싱 + 국적별 비자/대사관/팁 데이터
- `src/components/ImmigrationWaitTime.jsx` — 홈탭 입국하기 내 대기시간 카드
- `src/components/TaxRefundChecker.jsx` — 영수증 세금환급 판별 (subPage: taxrefund)
- `src/components/VisitorHeatmapCard.jsx` — 홈화면 방문자 통계 위젯 카드
- `src/components/VisitorHeatmapFull.jsx` — 방문자 통계 상세 (subPage: heatmap)
- `src/components/DepartureCountdown.jsx` — 출국 카운트다운 (subPage: departure)
- `src/components/WishlistPage.jsx` — 위시리스트 전체 페이지 (subPage: wishlist)
- `src/components/WishlistPrompt.jsx` — 출국일 위시리스트 프롬프트 모달
- `src/components/WishlistReengagement.jsx` — 30일 후 재참여 카드 (홈화면용)
- `src/components/PassportScan.jsx` — 여권 스캔/수동입력 (subPage: passport-scan)
- `src/components/SmartRecommendCard.jsx` — 맥락 기반 추천 카드 (홈화면 위젯용)
- `src/components/DepartureShoppingRoute.jsx` — 출국 쇼핑 동선 (subPage: departure-shopping)
- `src/hooks/useDepartureCountdown.js` — 출국 카운트다운 상태 훅
- `src/hooks/useWishlist.js` — 위시리스트 CRUD 훅

### 진행 중
- 제로페이 가맹점 지오코딩 (우체국 API 1,898건 수집 완료, 카카오 지오코딩 진행 중)
- MapTab에 제로페이 💳 핀 추가 예정

### 다음 할 일 (우선순위)
1. 제로페이 💳 핀 MapTab 통합
2. 외국인 병원 데이터 연동
3. 관광안내소(중국어 가능) 데이터 연동
4. 실시간 환율 위젯
5. 공공와이파이 데이터
6. Cloudflare Workers 백엔드 API 프록시 배포
7. 신규 5개 기능 API 키 등록 및 실데이터 연동

## 완료 알림 (필수!)
작업이 끝나면 **반드시** 아래 명령어를 실행해서 알림을 보내야 한다:
```bash
# 성공 시
openclaw system event --text "Done: [작업 요약]" --mode now

# 오류/실패 시
openclaw system event --text "Error: [오류 내용 요약]" --mode now
```
이 알림 없이 세션을 종료하면 안 된다.

## 코딩 규칙
- 컴포넌트는 `src/components/`에 JSX
- 데이터 파일은 `src/data/`에 JS export
- API 호출은 `src/api/`
- 커스텀 훅은 `src/hooks/`
- TailwindCSS 클래스 사용 (인라인 스타일 X)
- lucide-react 아이콘 사용
- 한글 주석 OK
