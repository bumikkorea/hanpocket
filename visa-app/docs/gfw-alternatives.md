# GFW (Great Firewall) 대체방안 정리

## 현재 차단되는 서비스 & 대체안

### 1. Google Fonts → 중국 미러
- **현재**: `fonts.googleapis.com`
- **대체**: `fonts.googleapis.cnpmjs.org` (이미 index.html에 onerror 폴백 적용)
- **최종**: `fonts.font.im` 또는 self-host Inter font (public/fonts/)
- **상태**: ✅ 폴백 적용됨

### 2. Google Speech API (Web Speech API)
- **현재**: `speechSynthesis` + `SpeechRecognition` (Chrome only, Google 서버)
- **대체안 A**: Baidu Speech Recognition API (¥0.15/call, 중국 서버)
- **대체안 B**: DeepSeek API + 자체 TTS (이미 번역 백엔드로 선정)
- **대체안 C**: 클라이언트 측 TTS (브라우저 내장, OS 음성 사용)
- **임시 조치**: try-catch + "음성 기능 사용 불가" 메시지 (✅ 이미 적용)
- **최종**: Cloudflare Workers → Baidu/DeepSeek Speech API 프록시

### 3. Apple Music RSS (K-POP Chart)
- **현재**: `rss.applemarketingtools.com`
- **대체안 A**: QQ音乐/网易云音乐 한국 차트 API
- **대체안 B**: Spotify Charts API (also blocked in China)
- **대체안 C**: 자체 크롤링 → Cloudflare D1 캐시 → API 제공
- **임시 조치**: 하드코딩 인기곡 목록 (주 1회 수동 업데이트)
- **최종**: Cloudflare Workers Cron → Apple Music RSS 크롤링 → D1 캐시 → 앱에서 자체 API 호출

### 4. YouTube Embeds
- **현재**: 사용 안 함 (이미 제거됨 ✅)
- **대체**: Bilibili iframe / 腾讯视频 embed (중국 사용자)
- **한국 내 사용자**: YouTube 정상 동작 (GFW 밖)

### 5. Google Maps
- **현재**: Naver Map 링크만 사용 (✅ Google Maps 미사용)
- **대체**: 高德地图 (Amap) API — 중국 본토용
- **결론**: 현재 상태 OK

### 6. exchangerate-api.com
- **현재**: GFW에서 불안정 (간헐 차단)
- **대체안 A**: 中国银行汇率 API
- **대체안 B**: Fixer.io (EU 기반)
- **대체안 C**: Cloudflare Workers에서 프록시 + D1 캐시
- **최종**: Workers Cron → 1시간마다 환율 가져와서 D1 저장 → 앱은 자체 API 호출

## 아키텍처 결론

```
[중국 사용자] → [Cloudflare CDN (전 세계)] → [HanPocket SPA]
                                                    ↓
                                          [Cloudflare Workers API]
                                                    ↓
                                    ┌───────────────┼───────────────┐
                                    ↓               ↓               ↓
                              [DeepSeek]     [Baidu Speech]    [D1 Cache]
                              (번역)          (음성인식)       (환율/차트)
```

- **핵심 원칙**: 모든 외부 API는 Cloudflare Workers에서 프록시
- **중국 사용자**: Workers를 통해 GFW 우회 (Cloudflare는 중국에서 접근 가능)
- **한국 사용자**: Google/Apple API 직접 사용 가능, Workers도 가능
- **비용**: Cloudflare Workers Free Tier (10만 요청/일) 충분

## 우선순위

1. 🔴 **Cloudflare Workers 백엔드 세팅** — 모든 API 프록시의 기반
2. 🔴 **DeepSeek 번역 API 연동** — 번역기 품질 향상의 핵심
3. 🟡 **환율 캐시** — Workers Cron + D1
4. 🟡 **K-POP 차트 캐시** — Workers Cron + D1
5. 🟢 **Baidu Speech** — 음성 기능은 부가가치
6. 🟢 **폰트 self-host** — Inter 폰트 파일 직접 포함
