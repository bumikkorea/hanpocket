# HanPocket 팝업스토어 DB 구축 및 자동화 워크플로우 설계서

**버전:** v1.0 | **작성일:** 2026-03-15

---

## 0. 핵심 관점 — 왜 이 설계인가

### 브랜드 주최자(공급) vs 중국인 관광객(소비) 두 관점의 충돌과 통합

팝업스토어를 준비하는 브랜드는 이런 것들을 생각한다:
- 고객 페르소나, 브랜드 스토리, 홍보 문구
- 하루 매출 예측, 재고 전략(SKU별 수량), 고객 동선
- 직원 운영 매뉴얼, CS 스크립트, 이벤트 아이디어, 리스크 관리

중국인 관광객은 이런 것들이 궁금하다:
- **"알리페이 되냐?"** — 해외 카드 없이 알리페이만 있는 경우 많음
- **"중국어로 소통되냐?"** — 고가 굿즈 구매 시 의사소통 문제로 포기하는 경우 빈번
- **"지금 가면 줄 얼마나 서야 하냐?"** — 인기 팝업은 1-2시간 대기
- **"小红书에 후기 있어?"** — 방한 전 정보 수집 1위 플랫폼

이 두 관점이 DB 설계에서 어떻게 연결되는지가 핵심이다.
브랜드가 제공하는 운영 정보(예상 방문객, 입장 방식, 특별 이벤트)는
관광객의 의사결정 정보(줄 서야 하나, 예약 필요한가, 언제 가면 한산한가)로 직결된다.

---

## 1. DB 스키마 설계

### 1-1. 핵심 테이블: `popups`

```sql
CREATE TABLE IF NOT EXISTS popups (
  -- ── 식별자 ──
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                  TEXT UNIQUE NOT NULL,           -- URL ID (예: aespa-sm-hannam-2026-03)
  external_id           TEXT,                           -- 수집 소스 원본 ID (중복 방지)

  -- ── 기본 정보 (삼국어) ──
  brand                 TEXT NOT NULL DEFAULT '',       -- 브랜드명
  title_ko              TEXT NOT NULL,
  title_zh              TEXT NOT NULL DEFAULT '',
  title_en              TEXT NOT NULL DEFAULT '',
  description_ko        TEXT DEFAULT '',
  description_zh        TEXT DEFAULT '',
  description_en        TEXT DEFAULT '',

  -- ── 장소 분류 ──
  venue_type            TEXT NOT NULL DEFAULT 'hotplace'
                        CHECK (venue_type IN (
                          'department_store',   -- 백화점 (더현대, 롯데, 신세계, 현대, 갤러리아)
                          'hangang',            -- 한강공원
                          'hotplace',           -- 성수/한남/홍대/연남/합정
                          'mall',               -- 복합몰 (COEX, 스타필드)
                          'popup_building',     -- 전용 팝업 빌딩 (팩토리얼, 씬 성수)
                          'other'
                        )),

  -- ── 팝업 유형 ──
  popup_type            TEXT NOT NULL DEFAULT 'other'
                        CHECK (popup_type IN (
                          'fashion',     -- 패션/의류
                          'beauty',      -- 뷰티/화장품
                          'exhibition',  -- 전시/아트
                          'comic',       -- 코믹/만화
                          'movie',       -- 영화
                          'drama',       -- 드라마
                          'webtoon',     -- 웹툰/소설
                          'food',        -- 식품/음식
                          'lifestyle',   -- 생활용품
                          'kpop',        -- K-POP/아이돌
                          'game',        -- 게임
                          'art',         -- 순수예술
                          'character',   -- 캐릭터/IP
                          'sports',      -- 스포츠
                          'luxury',      -- 럭셔리/명품
                          'collab',      -- 콜라보레이션
                          'other'
                        )),

  -- ── 지역 ──
  district              TEXT NOT NULL DEFAULT 'other'
                        CHECK (district IN (
                          'seongsu', 'gangnam', 'hannam',
                          'hongdae', 'myeongdong', 'yeouido',
                          'jongno', 'itaewon', 'coex',
                          'hangang', 'other'
                        )),

  -- ── 장소 정보 ──
  venue_name            TEXT NOT NULL DEFAULT '',
  address_ko            TEXT NOT NULL DEFAULT '',
  address_zh            TEXT DEFAULT '',
  floor_ko              TEXT DEFAULT '',
  floor_zh              TEXT DEFAULT '',
  floor_en              TEXT DEFAULT '',
  lat                   REAL NOT NULL DEFAULT 0,
  lng                   REAL NOT NULL DEFAULT 0,
  naver_map_url         TEXT DEFAULT '',
  kakao_map_url         TEXT DEFAULT '',

  -- ── 운영 기간 (자동 만료 핵심) ──
  start_date            TEXT NOT NULL,                  -- YYYY-MM-DD
  end_date              TEXT NOT NULL,                  -- YYYY-MM-DD — 자동 만료 기준
  open_time             TEXT DEFAULT '10:00',
  close_time            TEXT DEFAULT '20:00',
  closed_days           TEXT DEFAULT '[]',              -- JSON ['mon','tue'] 휴무일
  open_holiday          INTEGER DEFAULT 1,

  -- ── 입장/예약 ──
  entry_type            TEXT DEFAULT 'free'
                        CHECK (entry_type IN (
                          'free',         -- 자유 입장
                          'reservation',  -- 사전 예약 필수
                          'ticket',       -- 유료 티켓
                          'limited'       -- 제한적 입장
                        )),
  entry_fee_krw         INTEGER DEFAULT 0,
  reservation_url       TEXT DEFAULT '',
  daily_capacity        INTEGER DEFAULT 0,              -- 일일 최대 수용 인원
  daily_visitor_estimate INTEGER DEFAULT 0,             -- 브랜드 예상 일일 방문객
  queue_info_ko         TEXT DEFAULT '',
  queue_info_zh         TEXT DEFAULT '',

  -- ── 중국인 관광객 특화 (핵심) ──
  payment_alipay        INTEGER DEFAULT 0,              -- 알리페이 가능
  payment_wechatpay     INTEGER DEFAULT 0,              -- 위챗페이 가능
  payment_unionpay      INTEGER DEFAULT 0,              -- 유니온페이 가능
  payment_card          INTEGER DEFAULT 1,              -- 일반 카드
  payment_cash          INTEGER DEFAULT 1,              -- 현금
  chinese_staff         INTEGER DEFAULT 0,              -- 중국어 직원 상주
  chinese_signage       INTEGER DEFAULT 0,              -- 중국어 안내판
  chinese_brochure      INTEGER DEFAULT 0,              -- 중국어 브로슈어
  tax_refund_available  INTEGER DEFAULT 0,              -- 세금환급 가능
  tax_refund_min_krw    INTEGER DEFAULT 30000,
  duty_free_eligible    INTEGER DEFAULT 0,
  cn_sns_tag_zh         TEXT DEFAULT '',                -- 小红书/抖音 해시태그

  -- ── 미디어 ──
  cover_image           TEXT DEFAULT '',
  images                TEXT DEFAULT '[]',             -- JSON array URLs
  thumbnail             TEXT DEFAULT '',
  emoji                 TEXT DEFAULT '📌',
  color                 TEXT DEFAULT '#6366F1',
  tags_ko               TEXT DEFAULT '[]',
  tags_zh               TEXT DEFAULT '[]',

  -- ── 소스/출처 ──
  source_type           TEXT DEFAULT 'manual'
                        CHECK (source_type IN (
                          'manual',        -- 수동 큐레이션
                          'brand_submit',  -- 브랜드 직접 등록
                          'popga',         -- popga.co.kr 자동 수집
                          'popply',        -- popply.co.kr 자동 수집
                          'xhs',           -- 小红书
                          'naver_blog',    -- 네이버 블로그
                          'user_submit'    -- 사용자 제보
                        )),
  source_url            TEXT DEFAULT '',
  source_xhs            TEXT DEFAULT '',               -- 小红书 URL
  source_douyin         TEXT DEFAULT '',               -- 抖音 URL
  source_instagram      TEXT DEFAULT '',
  official_url          TEXT DEFAULT '',

  -- ── 상태 ──
  is_active             INTEGER DEFAULT 1,
  is_hot                INTEGER DEFAULT 0,             -- HOT 배지
  is_verified           INTEGER DEFAULT 0,             -- 관리자 검증
  is_sponsored          INTEGER DEFAULT 0,             -- 스폰서드
  is_expired            INTEGER DEFAULT 0,             -- 만료 여부

  -- ── 통계 ──
  view_count            INTEGER DEFAULT 0,
  wishlist_count        INTEGER DEFAULT 0,
  check_in_count        INTEGER DEFAULT 0,

  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_processed_at  DATETIME
);
```

### 1-2. 장소 마스터: `popup_venues`

더현대 서울처럼 반복 등장하는 장소를 정규화.

```sql
CREATE TABLE IF NOT EXISTS popup_venues (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT UNIQUE NOT NULL,               -- 예: thehyundai-seoul
  name_ko          TEXT NOT NULL,
  name_zh          TEXT DEFAULT '',
  name_en          TEXT DEFAULT '',
  venue_type       TEXT NOT NULL,
  district         TEXT NOT NULL,
  address_ko       TEXT NOT NULL,
  lat              REAL NOT NULL,
  lng              REAL NOT NULL,
  cover_image      TEXT DEFAULT '',
  website          TEXT DEFAULT '',
  parking_available INTEGER DEFAULT 0,
  wheelchair_access INTEGER DEFAULT 0,
  default_open     TEXT DEFAULT '10:00',
  default_close    TEXT DEFAULT '20:00',
  chinese_counter  INTEGER DEFAULT 0,                  -- 중국어 안내 카운터
  alipay_accepted  INTEGER DEFAULT 0,                  -- 건물 전체 알리페이
  is_active        INTEGER DEFAULT 1,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 1-3. 체크인: `popup_checkins`

실시간 혼잡도 수집.

```sql
CREATE TABLE IF NOT EXISTS popup_checkins (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  popup_id       INTEGER NOT NULL,
  user_token     TEXT NOT NULL,                        -- 익명 기기 토큰 해시
  queue_minutes  INTEGER,                              -- 사용자 입력 대기 시간
  crowd_level    TEXT CHECK (crowd_level IN ('low','medium','high','very_high')),
  comment_zh     TEXT DEFAULT '',                      -- 중국어 한줄 후기
  checked_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (popup_id) REFERENCES popups(id) ON DELETE CASCADE
);
```

### 1-4. 위시리스트: `popup_wishlist`

```sql
CREATE TABLE IF NOT EXISTS popup_wishlist (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  popup_id    INTEGER NOT NULL,
  user_token  TEXT NOT NULL,
  added_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (popup_id, user_token),
  FOREIGN KEY (popup_id) REFERENCES popups(id) ON DELETE CASCADE
);
```

### 1-5. 컬렉션: `popup_collections`

편집팀 큐레이션 — "이번 주 추천", "중문 통하는 팝업", "K-POP 팬 필수" 등.

```sql
CREATE TABLE IF NOT EXISTS popup_collections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT UNIQUE NOT NULL,
  title_ko    TEXT NOT NULL,
  title_zh    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  description_zh TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  is_active   INTEGER DEFAULT 1,
  valid_until TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS popup_collection_items (
  collection_id  INTEGER NOT NULL,
  popup_id       INTEGER NOT NULL,
  sort_order     INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, popup_id),
  FOREIGN KEY (collection_id) REFERENCES popup_collections(id) ON DELETE CASCADE,
  FOREIGN KEY (popup_id) REFERENCES popups(id) ON DELETE CASCADE
);
```

### 1-6. 유용한 View

```sql
-- 활성 팝업 (만료 자동 필터)
CREATE VIEW v_active_popups AS
SELECT * FROM popups
WHERE is_active = 1 AND is_expired = 0
  AND end_date >= date('now', 'localtime');

-- 7일 이내 마감 임박
CREATE VIEW v_closing_soon AS
SELECT *,
  CAST(julianday(end_date) - julianday(date('now','localtime')) AS INTEGER) AS days_left
FROM popups
WHERE is_active = 1 AND is_expired = 0
  AND end_date BETWEEN date('now','localtime') AND date('now','localtime','+7 days');

-- 중국인 친화 팝업
CREATE VIEW v_cn_friendly AS
SELECT * FROM popups
WHERE is_active = 1 AND is_expired = 0
  AND end_date >= date('now', 'localtime')
  AND (payment_alipay = 1 OR payment_wechatpay = 1 OR chinese_staff = 1);
```

---

## 2. 중국인 관광객 특화 필드 — 왜 필요한가

| 필드 | 근거 |
|------|------|
| `payment_alipay` | 중국인 관광객 다수가 알리페이만 소지. 결제 불가 시 즉시 이탈 |
| `payment_wechatpay` | 20-30대 유학생 선호. 알리페이와 함께 양대 결제 수단 |
| `chinese_staff` | 고가 굿즈 구매 시 의사소통 문제로 구매 포기 빈번 |
| `chinese_signage` | 길 찾기·입장 방법 안내가 한국어만이면 경험 크게 저하 |
| `tax_refund_available` | 팝업은 즉시환급 가맹 여부 불명확한 경우 많음. 명시 필요 |
| `source_xhs` | 중국인이 방한 전 정보 수집 1위 플랫폼. 연결 시 신뢰도 향상 |
| `source_douyin` | 영상 중심 Z세대. 抖音 링크로 자연스러운 콘텐츠 연결 |
| `cn_sns_tag_zh` | 방문 후 小红书에 올릴 해시태그를 앱에서 복사 버튼으로 제공 → UGC 유도 |
| `queue_info_zh` | 인기 팝업 1-2시간 대기 사전 인지 → 방문 시간대 조정 가능 |
| `reservation_url` | K-POP 팝업 등 사전 예약 없으면 입장 불가인 경우 증가 |
| `daily_visitor_estimate` | 브랜드가 제공 → 앱에서 혼잡도 예측 지표로 활용 |

---

## 3. 데이터 수집 자동화 워크플로우

```
소스 1: popga.co.kr       ─┐
소스 2: popply.co.kr      ─┤→ Cron Worker (매일 02:00 KST)
소스 3: 네이버 블로그       ─┘

소스 4: 小红书 #서울팝업    ─→ 관리자 URL 붙여넣기 (주 2회 수동)
소스 5: Instagram          ─→ 수동 URL 입력 (추후 Graph API 자동화)

소스 6: 브랜드 직접 제출    ─→ POST /api/popups/submit (B2B 채널)
소스 7: 사용자 제보         ─→ 앱 내 "팝업 제보" 버튼

모두 → KV Staging 큐 → 관리자 검토 UI → 승인 → D1 popups 테이블
```

### 3-1. Cron Worker 스케줄

| Worker | 실행 주기 | 대상 |
|--------|-----------|------|
| `popup-crawler.js` | 매일 02:00 KST | popga.co.kr, popply.co.kr |
| `popup-naver.js` | 월/목 09:00 KST | 네이버 블로그 검색 |
| `popup-expiry.js` | 매일 01:00 KST | 만료 팝업 is_expired=1 처리 |

### 3-2. 자동 만료 Worker

```javascript
// popup-expiry.js (Cron: 0 1 * * *)
// 1. end_date 지난 팝업 → is_expired = 1, is_active = 0
// 2. 7일 이내 오픈 예정 팝업 → 위시리스트 저장자에게 Push 알림
// 3. 오늘 만료 건 수 → 관리자 알림
```

### 3-3. 브랜드 직접 제출 채널

```
POST /api/popups/submit
→ source_type = 'brand_submit'
→ is_verified = 0 (관리자 검토 대기)
→ 관리자 Push 알림
→ 48시간 내 미처리 시 자동 승인 또는 자동 거부 (정책 선택)

활용 가능성:
→ 무료 기본 등록 + 유료 프리미엄 노출 패키지로 수익화
```

---

## 4. 데이터 품질 관리

### 3단계 검증 파이프라인

```
[1단계: 자동 검증]
  - slug 중복 확인
  - start_date < end_date 검사
  - lat/lng 서울 바운딩박스 확인 (37.4~37.7°N, 126.8~127.2°E)
  - cover_image URL 접근 가능 여부 (HEAD 요청)
  - 필수 필드 누락 검사
  실패 시: staging 자동 거부, 큐레이터 알림

[2단계: 중복 감지]
  - (brand + venue_name + start_date) 조합 중복 검사
  - 동일 source_url 검사
  - 중복 의심 시 is_duplicate_suspect 플래그

[3단계: 관리자 검토]
  - staging 큐 → 승인 / 거부
  - 중국어 필드 미입력 시 DeepSeek 자동 번역 제안
  - 알리페이/중문 직원 정보는 관리자 직접 확인 후 체크
  - 목표: 등록 후 24시간 이내 처리
```

### 번역 품질 규칙

- `title_zh` 빈 문자열 → DeepSeek 자동 번역 + `is_auto_translated_zh = 1` 플래그
- K-POP 아이돌명, 브랜드명, 고유명사 번역 금지 리스트 관리
- 중국어는 반드시 간체(简体) — 번체 혼용 금지
- `source_xhs` URL 있으면 중국어 원문 발췌를 `description_zh`에 우선 사용

---

## 5. Worker API 확장

```
# 기존
GET    /api/popups           → 전체 목록
POST   /api/popups           → 추가 (관리자)
PUT    /api/popups/:id       → 수정 (관리자)
DELETE /api/popups/:id       → 삭제 (관리자)

# 추가
GET  /api/popups?district=seongsu    → 지역 필터
GET  /api/popups?type=kpop           → 유형 필터
GET  /api/popups?cn_pay=1            → 중국 결제 가능 필터
GET  /api/popups?cn_staff=1          → 중문 직원 필터
GET  /api/popups?closing_soon=1      → 7일 이내 마감
GET  /api/popups/map                 → 지도 핀 전용 (경량)
GET  /api/popups/:id                 → 상세
POST /api/popups/:id/checkin         → 체크인 등록
POST /api/popups/:id/wishlist        → 위시리스트 토글
GET  /api/popups/collections         → 컬렉션 목록
GET  /api/popups/collections/:slug   → 컬렉션 상세
POST /api/popups/submit              → 브랜드 직접 제출
```

---

## 6. 앱 UI 데이터 활용

| 화면 | 활용 필드 |
|------|-----------|
| HomeTab 팝업 위젯 | `is_hot`, closing_soon, `title_zh`, `cover_image` |
| 지도 핀 | `lat`, `lng`, `emoji`, `color`, `title_zh` (경량 쿼리) |
| 팝업 카드 리스트 | 대부분의 필드 + 필터 탭 |
| 팝업 상세 | 전체 + 체크인 혼잡도 |
| 중문 친화 필터 | `payment_alipay`, `chinese_staff`, `tax_refund_available` |
| 컬렉션 페이지 | `popup_collections` JOIN |

### 중국인 특화 UX 포인트

- **결제 배지:** 카드에 알리페이/위챗페이 아이콘 표시
- **혼잡도 게이지:** 체크인 데이터 기반 실시간 crowd_level 평균
- **小红书 바로가기:** source_xhs 있을 때 "小红书 후기 보기" 버튼
- **SNS 태그 복사:** cn_sns_tag_zh 클립보드 복사 버튼 → UGC 유도
- **세금환급 연동:** tax_refund 필드 + 기존 TaxRefundChecker 연동

---

## 7. 구현 로드맵

### Phase 1 — DB 스키마 마이그레이션 (1주)
- `popup-store-schema.sql` 확장 (ALTER TABLE)
- Worker API 필터 쿼리 추가
- PopupAdmin.jsx 신규 필드 폼 추가 (start_date, end_date, popup_type, 결제수단)

### Phase 2 — 자동 만료 + 기본 수집 (2주)
- `popup-expiry.js` Cron Worker
- 네이버 Search API 연동 (`popup-naver.js`)
- Staging 큐(KV) + 관리자 검토 UI

### Phase 3 — 중국인 특화 + 사용자 기능 (3주)
- `popup_checkins` + `popup_wishlist` + `popup_collections` 테이블
- 결제 배지, 혼잡도, 小红书 바로가기 UI
- 브랜드 제출 API

### Phase 4 — 수집 자동화 고도화 (4-6주)
- popga.co.kr / popply.co.kr 크롤러 (Cloudflare Browser Rendering)
- DeepSeek 자동 번역 파이프라인
- `popup_venues` 마스터 30개 장소 입력
- 위시리스트 저장자 만료 임박 Push 알림

---

## 8. 기존 DB 마이그레이션 SQL

```sql
-- 기존 테이블에 컬럼 추가 (ALTER TABLE만 지원)
ALTER TABLE popups ADD COLUMN start_date TEXT DEFAULT '';
ALTER TABLE popups ADD COLUMN end_date   TEXT DEFAULT '';
ALTER TABLE popups ADD COLUMN popup_type TEXT DEFAULT 'other';
ALTER TABLE popups ADD COLUMN venue_type TEXT DEFAULT 'hotplace';
ALTER TABLE popups ADD COLUMN district   TEXT DEFAULT 'other';
ALTER TABLE popups ADD COLUMN brand      TEXT DEFAULT '';
ALTER TABLE popups ADD COLUMN payment_alipay    INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN payment_wechatpay INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN chinese_staff     INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN tax_refund_available INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN source_xhs     TEXT DEFAULT '';
ALTER TABLE popups ADD COLUMN source_douyin  TEXT DEFAULT '';
ALTER TABLE popups ADD COLUMN is_hot         INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN is_verified    INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN is_expired     INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN slug           TEXT DEFAULT '';
ALTER TABLE popups ADD COLUMN open_time      TEXT DEFAULT '10:00';
ALTER TABLE popups ADD COLUMN close_time     TEXT DEFAULT '20:00';
ALTER TABLE popups ADD COLUMN entry_type     TEXT DEFAULT 'free';
ALTER TABLE popups ADD COLUMN cover_image    TEXT DEFAULT '';
ALTER TABLE popups ADD COLUMN wishlist_count INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN view_count     INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN queue_info_zh  TEXT DEFAULT '';
ALTER TABLE popups ADD COLUMN cn_sns_tag_zh  TEXT DEFAULT '';
ALTER TABLE popups ADD COLUMN daily_visitor_estimate INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN reservation_url TEXT DEFAULT '';

-- 기존 period 컬럼 → start_date/end_date 변환은 관리자 패널에서 건별 수동 처리
```
