# HanPocket QA Inspection Report

**Inspector:** AI QA Panel  
**Date:** 2026-02-21  
**Version:** Source code review (pre-build)  
**Codebase:** ~20,000 lines across 39 files (JSX + JS data)

---

## 1. Executive Summary

### Overall Grade: **B-** (71/100)

HanPocket is an **impressively ambitious** super-app that attempts to be an all-in-one companion for Chinese nationals in Korea. The breadth is genuinely remarkable — 19+ features spanning visa guidance, food, healthcare, education, finance, SOS, and more. However, **breadth has come at the cost of depth**. Several advertised features are outright **empty placeholders**, critical real-time features depend on **unreliable or GFW-blocked APIs**, and the single-file architecture (3,243-line HomeTab.jsx) is a maintenance nightmare.

### Key Findings

| Finding | Severity |
|---------|----------|
| **3 tabs are completely empty placeholders** (Travel, Food, Hallyu — just show "Loading...") | 🔴 Critical |
| **GFW blocks core features** for China-based users (Google Speech API, Apple Music RSS, exchangerate-api.com) | 🔴 Critical |
| **No backend whatsoever** — all data is hardcoded JSON or localStorage | 🟡 Major |
| **HomeTab.jsx is 3,243 lines** — single monolithic component, unmaintainable | 🟡 Major |
| **Restaurant data is real** (259 Michelin scraped 2026-02-19) — best data asset | 🟢 Strength |
| **Wallet/name transliteration** (90+ surnames) is genuinely unique and useful | 🟢 Strength |
| **Visa data is comprehensive** (A~H series with trilingual descriptions) | 🟢 Strength |
| **AR translation is dictionary-matching, not actual OCR** — misleading name | 🟡 Major |
| **Community is localStorage-only** — no shared posts between users | 🟡 Major |
| **Exchange rates are hardcoded fallbacks** pretending to be live | 🟡 Major |

---

## 2. Feature-by-Feature Inspection

### Grading: A (excellent) | B (good) | C (mediocre) | D (poor) | F (broken/useless)

### Scenarios:
- **A** = Chinese person in Korea (primary)
- **B** = Chinese person in China (GFW)
- **C** = Korean person in Korea (secondary)

| # | Feature | Completeness | Data Accuracy | UX/UI | Practical Value | Tech Constraints | Notes |
|---|---------|:---:|:---:|:---:|:---:|:---:|-------|
| 1 | **홈 (Home)** | B | B | A- | B+ | C | 3,243 lines. InfoBar with weather/exchange/date works. Widget system is well-designed. Exchange rates have hardcoded fallbacks (CNY=191.52). Weather uses external API (GFW-blocked). |
| 2 | **비자 (Visa)** | A- | A- | B+ | A | B | Best feature. Comprehensive A~H series visa data with trilingual support. Visa transitions graph (866 lines of data). AI chatbot is keyword-matching, not actual AI. |
| 3 | **여행 (Travel)** | **F** | F | F | F | — | **EMPTY PLACEHOLDER.** Just renders "Loading..." forever. Zero content. |
| 4 | **맛집 (Food)** | **F** | F | F | F | — | **EMPTY PLACEHOLDER.** Same "Loading..." stub. But restaurantData.js has 6,847 lines of real Michelin data that's never displayed in this tab! |
| 5 | **쇼핑 (Shopping)** | B- | B | B+ | B | B | Accordion-style widget display. Content from widget system (K-beauty, tax refund, etc.). Functional but shallow — links to external sites. |
| 6 | **한류 (Hallyu)** | **F** | F | F | F | — | **EMPTY PLACEHOLDER.** "Loading..." stub. Meanwhile idolData.js (434 lines) and K-POP chart widget exist in HomeTab but not accessible here. |
| 7 | **한국어 (Korean/Education)** | A- | B+ | A- | A | B | 400-line EducationTab. 7 sessions, 120 lessons, gamification with XP/streaks. University search with 118 universities. Genuinely usable. |
| 8 | **생활 (Life Tools)** | B | B | B | B | C | Wrapper around HomeTab widgets (timezone, parcel, delivery, currency). Functional. Timezone widget is nice. Parcel tracking links to external sites. |
| 9 | **구직 (Jobs)** | B+ | B | B | B+ | B | 179 lines. Job listings guide with part-time/full-time categories. Links to Saramin, WorkNet, etc. |
| 10 | **이력서 (Resume Builder)** | A- | A | A- | A | A | 537 lines. 60+ job title zh→ko translations. Generate formatted resume. Genuinely unique and useful for Chinese job seekers. |
| 11 | **부동산 (Housing)** | B | B- | B | B | B | 203 lines. Rent guide, jeonse/wolse explanation, real estate price check links. Solid informational content. |
| 12 | **의료 (Medical)** | B+ | B+ | B | A- | B | 179 lines with 173-line hospital database (85 hospitals). Foreign language support filter. Emergency room info. Very practical. |
| 13 | **운동 (Fitness)** | B | B | B | B- | B | 127 lines. 65 facilities from fitnessData.js (83 lines). Location filters. Basic but functional. |
| 14 | **통역 (Translator)** | A- | A | A- | A | C | 286 lines. 7 situation categories (hospital, pharmacy, police, real estate, shopping, restaurant, immigration) with 10-12 phrases each. Pronunciation guides. TTS via speechSynthesis. **Blocked in China (Web Speech API).** |
| 15 | **AR 번역 (AR Translate)** | C | B | C | C | D | 271 lines. **NOT actual AR/OCR.** It's a camera view + manual search through a 50+ sign dictionary. User must visually match signs themselves. Misleading "AR" branding. Camera access may fail on many mobile browsers. |
| 16 | **SOS** | A- | A | A | A | B- | 206 lines. Emergency numbers (112/119/1345), geolocation, situation description generator with Korean pronunciation, embassy contacts (4 consulates). One-tap calling via `tel:` links. Excellent for emergencies. |
| 17 | **커뮤니티 (Community)** | C+ | B | B | D | D | 262 lines. Community + marketplace + sharing tabs. 7 sample posts. **localStorage only — users can never see each other's posts.** This is a single-player community, which defeats the entire purpose. |
| 18 | **금융 (Finance)** | B | B | B | B | B | 225 lines. Bank account opening guide (5 banks), remittance comparison, credit building. Informational. |
| 19 | **월렛 (Wallet)** | A- | A | B+ | A | A | 555 lines. Document storage (8 types: ARC, passport, visa, insurance, license, bank, card, telecom). **90+ Chinese surname transliterations** — genuinely unique feature. Institution-specific name management. D-day tracking. Masked display. All localStorage — secure from network but lost on clear. |
| 20 | **내정보 (Profile)** | B | B | B | B | B | Embedded in App.jsx onboarding. Nationality selector (mainland/HK/Macau/Taiwan). Visa type. D-day tracker. |
| 21 | **실시간 통역 (Voice Translator)** | B- | B | B | B+ | D | In HomeTab. Uses Web Speech API for recognition. Dictionary-based translation (NOT neural MT). **Completely broken in China** (Google Speech API blocked by GFW). Limited vocabulary. |
| 22 | **대행 서비스 (Agency)** | B+ | B | B+ | B | B | 485 lines. Document agency service matching. Detailed. |
| 23 | **반려동물 (Pet)** | B | B | B- | C+ | B | 232 lines. Pet-related services in Korea. Niche but present. |

---

## 3. Critical Issues (Must-Fix)

### 🔴 P0 — Ship Blockers

1. **Three tabs are empty placeholders (Travel, Food, Hallyu)**
   - FoodTab.jsx, TravelTab.jsx, HallyuTab.jsx are all 15-line stubs that just display "Loading..."
   - **Food is especially egregious**: restaurantData.js has 6,847 lines of real Michelin data (259 restaurants) that's imported by HomeTab but completely inaccessible from the Food tab
   - Hallyu: idolData.js (434 lines, 114 idols) exists but the dedicated tab shows nothing
   - **Fix:** Connect existing data to their dedicated tabs. This is likely a 2-hour fix.

2. **GFW kills core features for China-based users**
   - Web Speech API (Google) → Voice translator completely broken
   - exchangerate-api.com → May be blocked
   - Apple Music RSS → Blocked
   - Various external links (Google Maps, YouTube) → Blocked
   - **Fix:** Add fallback services (Baidu Speech, domestic APIs) or at minimum show graceful degradation messages instead of silent failures.

3. **Community is single-player localStorage**
   - Users literally cannot see other users' posts. The 7 sample posts are the only content anyone will ever see (unless they write their own, visible only to themselves).
   - **Fix:** Either add a backend (Firebase, Supabase) or remove the feature entirely. A fake community is worse than no community.

### 🟡 P1 — Major Issues

4. **"AR Translation" is not AR**
   - It's a camera view + manual dictionary search. No OCR, no image recognition, no actual augmented reality.
   - Rename to "Sign Dictionary" or "Visual Phrase Book" to set honest expectations.

5. **Exchange rates are hardcoded with unreliable live fallback**
   - Hardcoded: CNY=191.52, HKD=177.80, etc.
   - Fetches from exchangerate-api.com but falls back silently to hardcoded values
   - No "as of" timestamp shown — users may think they're seeing live rates

6. **AI Chatbot is keyword matching, not AI**
   - chatResponses.js (275 lines) is pattern-matched responses
   - Marketing it as "AI chatbot" is misleading

7. **HomeTab.jsx is 3,243 lines — architectural debt**
   - Contains widget rendering, exchange rate card, timezone widget, holiday calendar, parcel widget, K-POP chart, idol database viewer, restaurant browser, voice translator, and more
   - This is unmaintainable. One misplaced bracket crashes everything.

8. **No data persistence beyond localStorage**
   - Wallet documents, community posts, widget configs, learning progress — all in localStorage
   - Browser clear = everything gone. No sync across devices.

### 🟢 P2 — Improvements

9. Holiday calendar has hardcoded 2026 lunar dates — will be wrong in 2027
10. Hospital data (85 hospitals) has no verification date
11. No offline support / PWA — critical for travelers with spotty connectivity
12. No dark mode despite cream background being hard on eyes at night
13. Splash screen SVG is custom but no app icon or PWA manifest

---

## 4. Ten Juror Evaluations

---

### Juror 1: 小红 (10세, 부모와 한국 여행 온 어린이)

**Overall Score: 6/10**

**좋은 점:**
1. SOS 버튼이 크고 빨간색이라 무서울 때 바로 누를 수 있어요
2. 한국어 배우기에 게임처럼 XP 포인트가 있어서 재미있어요
3. 화장실, 출구 같은 간판 번역이 있어서 길 잃었을 때 도움될 것 같아요

**개선 필요:**
1. 글씨가 너무 작아요. 어린이 모드가 있으면 좋겠어요
2. 여행 탭을 눌렀는데 아무것도 없어요 — 놀이공원 정보가 보고 싶었는데!
3. 그림이 하나도 없어요. 너무 글자만 있어서 심심해요

**한마디:** "엄마가 쓰는 앱인데 놀이공원 정보가 없어서 아쉬워요."

---

### Juror 2: 张伟 (20세, 한국 유학생, D-2 비자)

**Overall Score: 8/10**

**좋은 점:**
1. 비자 전환 경로 기능이 신의 한수 — D-2에서 E-7으로 변경 시 필요한 서류를 한눈에 볼 수 있음
2. 이력서 빌더의 직종 중한 번역이 아르바이트 구할 때 진짜 유용
3. 월렛의 성씨 한글 음역이 은행 계좌 개설할 때 매번 헷갈리던 걸 해결해줌

**개선 필요:**
1. 커뮤니티가 완전 가짜 — 글을 써도 나만 볼 수 있다니 이게 뭐야
2. 한류 탭이 빈 화면 — 이게 K-POP 앱 아니었어? 홈에는 차트가 있는데 전용 탭은 비어있음
3. 음성 번역이 중국에서 쓰려고 VPN 켰는데도 안 됨 (Web Speech API 문제)

**한마디:** "비자 기능은 유학생 필수앱 감인데, 빈 탭 3개는 출시 전에 꼭 채워야 합니다."

---

### Juror 3: 李娜 (30세, E-7 비자 직장인, 3년 거주)

**Overall Score: 7/10**

**좋은 점:**
1. 월렛의 기관별 이름 관리가 정말 실용적 — 출입국, 은행, 통신사마다 이름이 다르게 등록되어 있는 문제를 해결
2. 의료 탭의 외국어 지원 병원 필터가 실제로 유용 — 아플 때 중국어 가능한 병원 찾기가 항상 문제였음
3. 통역 탭의 상황별 템플릿이 실전적 — 특히 부동산, 병원 상황이 정확함

**개선 필요:**
1. 맛집 탭이 비어있는데 데이터는 6,847줄이나 있다고? 이해 불가
2. 환율이 실시간인 척하지만 실제로는 하드코딩된 값일 수 있음 — 무역 업무에 쓰기엔 신뢰도 부족
3. 세금 가이드가 너무 기초적 — E-7 근로자의 연말정산, 원천징수 등 실질적 정보 부족

**한마디:** "3년 살면서 이런 앱 찾고 있었는데, 절반만 완성된 느낌이라 아쉽습니다."

---

### Juror 4: 王芳 (40세, 사업가, 한중 무역)

**Overall Score: 5/10**

**좋은 점:**
1. 다중 통화 지원 (CNY, HKD, TWD, MOP 등 9개 통화)이 무역업에 기본적으로 필요한 기능
2. 비자 대행 서비스 매칭이 시간 절약에 도움
3. 삼국어 지원이 한국 거래처와 소통 시 참고할 수 있음

**개선 필요:**
1. 금융 탭에 기업 계좌 개설, 법인 비자 정보가 전혀 없음 — 개인 관점에만 치우침
2. 중국에서 앱을 열면 환율 API, 날씨 API, 음성 인식이 전부 안 됨 — 출장 중 중국에서 쓸 수 없음
3. 부동산이 원룸/쉐어하우스 위주 — 사무실 임대 정보 없음

**한마디:** "학생과 여행객 위주로 만들어서 사업가에게는 쓸모의 절반이 없습니다."

---

### Juror 5: 陈大妈 (50세, 자녀 방문 어머니, C-3 비자)

**Overall Score: 6/10**

**좋은 점:**
1. SOS 버튼이 크고 간단해서 긴급 상황에 아이 도움 없이도 쓸 수 있을 것 같아요
2. 통역 탭에서 병원/약국 상황의 중국어-한국어 대조가 실용적
3. 비자 D-day 알림이 체류 기간 관리에 도움

**개선 필요:**
1. 글씨가 너무 작아요 — 노안인 사람을 위한 글자 크기 조절이 없음
2. 여행 탭이 비어있어서 관광 정보를 찾을 수 없어요 — 이게 제일 필요한 건데
3. 중국에서 미리 설치해서 정보를 볼 수 없음 (GFW 문제) — 출국 전 준비가 불가능

**한마디:** "아들이 설치해줬는데 글씨가 너무 작고 여행 정보가 없어서 결국 샤오홍슈를 봤어요."

---

### Juror 6: 김민준 (10세, 초등학생)

**Overall Score: 5/10**

**좋은 점:**
1. 한국어 배우기가 게임처럼 되어있어서 중국인 친구한테 알려주면 같이 할 수 있을 것 같아요
2. K-POP 차트가 있어서 좋은데 홈에서만 보여요
3. SOS 버튼이 멋있어요

**개선 필요:**
1. 재미있는 게 없어요. 게임이나 퀴즈가 더 있으면 좋겠어요
2. 한류 탭 눌렀는데 아무것도 안 나와요
3. 이모지가 하나도 없어서 밋밋해요

**한마디:** "어른들 앱이에요. 제가 쓸 건 별로 없어요."

---

### Juror 7: 이서연 (20세, 대학생, 중국인 룸메이트)

**Overall Score: 7/10**

**좋은 점:**
1. 통역 탭을 룸메이트와 같이 쓸 수 있을 것 같아요 — 약국에서 약 살 때 같이 보여주면 됨
2. 맛집 데이터가 미슐랭 259개 + 블루리본 30개나 있다는데, 이걸 같이 보면서 어디 갈지 고를 수 있을 것 같아요
3. 커뮤니티에서 정보 공유가 가능하면 좋겠는데... (아, localStorage라 안 되는구나)

**개선 필요:**
1. 맛집 탭이 비어있으니까 맛집 데이터를 볼 수가 없어요 — 홈에서 위젯으로 일부만 보임
2. 한국어 인터페이스가 좀 딱딱해요 — 20대가 쓰기엔 너무 '관공서 느낌'
3. 공유 기능이 없어서 룸메이트한테 링크를 보낼 수 없음

**한마디:** "데이터는 엄청 풍부한데 포장이 아쉬워요. 맛집 탭 좀 살려주세요!"

---

### Juror 8: 박지훈 (30세, IT 개발자)

**Overall Score: 6/10**

**좋은 점:**
1. 위젯 시스템 설계가 나름 체계적 — widgetCategories로 분류하고 재사용하는 구조
2. 삼국어 지원의 L() 함수 패턴이 일관적
3. 복주머니 SVG 로고 디테일이 좋음 — 브랜딩 감각 있음

**개선 필요:**
1. **HomeTab.jsx 3,243줄은 범죄 수준** — 컴포넌트 분리가 시급. Exchange rate card, timezone widget, calendar 등 최소 15개 컴포넌트로 분리 필요
2. **AR Translate는 사기** — canvas에 카메라 보여주고 수동으로 사전 검색하는 건 AR이 아님. OCR 없이 AR이라고 부르면 안 됨
3. **에러 핸들링 전무** — API 실패 시 조용히 하드코딩 값으로 대체. 사용자에게 "오프라인 데이터" 알림 없음
4. 보너스: `try { return JSON.parse(...) } catch { return null }` 패턴이 10곳 이상 반복 — 유틸 함수로 추출하세요

**한마디:** "아키텍처가 MVP 급인데 기능은 프로덕션을 표방하고 있어서 괴리가 심합니다."

---

### Juror 9: 최수진 (40세, 다문화가정지원센터 직원)

**Overall Score: 8/10**

**좋은 점:**
1. 이런 종합 앱이 실제로 필요했어요 — 상담 시 매번 다른 사이트를 찾아야 했는데 하나로 모여있으면 좋겠다고 생각했음
2. 비자 전환 경로 + 서류 안내가 상담 업무에 바로 활용 가능
3. SOS + 통역 + 의료 조합이 실제 긴급 상황에서 생명을 살릴 수 있는 수준

**개선 필요:**
1. 다문화가정 관련 정보가 없음 — F-6 결혼비자 이후의 생활 정보, 자녀 교육, 사회통합프로그램 등
2. 센터에서 추천하려면 빈 탭이 있으면 곤란 — 신뢰도가 떨어져서 다른 것도 의심하게 됨
3. 인쇄 기능이 없어서 오프라인 상담 자료로 활용 불가

**한마디:** "완성되면 우리 센터에서 공식 추천 앱으로 쓰고 싶을 정도입니다. 제발 빈 탭을 채워주세요."

---

### Juror 10: 정영호 (50세, 출입국관리사무소 공무원)

**Overall Score: 7/10**

**좋은 점:**
1. 비자 데이터의 정확도가 인상적 — A-1부터 H-2까지 체계적으로 정리되어 있고, 대체로 현행법과 일치
2. 비자 전환 경로가 866줄의 데이터로 상세하게 매핑됨 — 민원인에게 설명 시 참고 가능
3. 여권 요건, 승인 팁 등 실무에서 자주 묻는 질문을 정리해놓은 점

**개선 필요:**
1. 법적 면책 조항이 없음 — "이 정보는 참고용이며 법적 효력이 없습니다" 문구 필수
2. 비자 정보의 최종 업데이트 날짜가 표시되지 않음 — 정책은 수시로 변경됨
3. "AI 상담" 기능이 부정확한 답변을 줄 경우 민원이 우리 사무소로 올 수 있음 — 정확도 검증 필요

**한마디:** "비자 정보 품질은 합격이지만, 법적 면책 없이 배포하면 문제될 수 있습니다."

---

## 5. Recommendations (Priority Ordered)

### Immediate (이번 주)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | **FoodTab을 restaurantData.js에 연결** — 데이터가 이미 있음, 렌더링만 하면 됨 | 2시간 | 🔴 Critical |
| 2 | **HallyuTab을 idolData.js + K-POP widget에 연결** | 2시간 | 🔴 Critical |
| 3 | **TravelTab 최소 기능 구현** — HomeTab의 교통/숙박/놀이공원 위젯 연결 | 3시간 | 🔴 Critical |
| 4 | **법적 면책 조항 추가** — 모든 정보 페이지 하단에 disclaimer | 30분 | 🔴 Critical |

### Short-term (2주 내)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 5 | **HomeTab.jsx 분리** — 최소 15개 컴포넌트로 리팩토링 | 1일 | 🟡 Major |
| 6 | **GFW 대응 전략 수립** — 중국 CDN/API 대안 조사, 최소한 graceful degradation 메시지 | 2일 | 🟡 Major |
| 7 | **"AR 번역"을 "간판 사전"으로 리브랜딩** — 또는 실제 OCR 구현 (Tesseract.js) | 1일 | 🟡 Major |
| 8 | **환율/날씨 데이터에 "마지막 업데이트" 타임스탬프 표시** | 2시간 | 🟡 Major |
| 9 | **커뮤니티 백엔드 구축** (Firebase/Supabase) 또는 기능 제거 | 3일 | 🟡 Major |

### Medium-term (1개월)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 10 | **PWA 지원** — 오프라인 캐싱, 앱 아이콘, install prompt | 2일 | 🟢 Important |
| 11 | **접근성 개선** — 글씨 크기 조절, 고대비 모드 | 1일 | 🟢 Important |
| 12 | **월렛 데이터 암호화** — localStorage에 평문 저장은 보안 위험 | 1일 | 🟢 Important |
| 13 | **실제 번역 API 연동** — 사전 매칭 대신 DeepL/Papago API | 2일 | 🟢 Important |
| 14 | **데이터 업데이트 파이프라인** — 미슐랭/병원/대학 데이터 자동 갱신 스크립트 | 3일 | 🟢 Important |

---

## Appendix: File Size Summary

| File | Lines | Status |
|------|------:|--------|
| HomeTab.jsx | 3,243 | ⚠️ Monolithic |
| restaurantData.js | 6,847 | ✅ Rich data, unused in FoodTab |
| visaTransitions.js | 866 | ✅ Comprehensive |
| visaData.js | 548 | ✅ Good |
| education.js | 544 | ✅ Good |
| DigitalWalletTab.jsx | 555 | ✅ Well-built |
| ResumeTab.jsx | 537 | ✅ Well-built |
| AgencyTab.jsx | 485 | ✅ Good |
| idolData.js | 434 | ✅ Rich data, unused in HallyuTab |
| App.jsx | 1,475 | ⚠️ Large root |
| FoodTab.jsx | 15 | 🔴 Empty placeholder |
| TravelTab.jsx | 15 | 🔴 Empty placeholder |
| HallyuTab.jsx | 15 | 🔴 Empty placeholder |
| **Total** | **~20,000** | |

---

*Report generated 2026-02-21 by AI QA Inspector. All assessments based on source code review without runtime testing.*
