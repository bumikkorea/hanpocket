# 팝업스토어 DB 설계 v2 — 백지 설계

**작성일:** 2026-03-16
**전제:** 기존 DB 없음. 처음부터 설계.

---

## 0. 이 설계의 출발점

팝업스토어는 **한시적 공간**이다.
열리고, 닫히고, 사라진다.
그런데 그 짧은 기간 동안 브랜드와 사람 사이에 생기는 것들은 사라지지 않는다.

HanPocket이 팝업을 다루는 이유는 단순히 "어디서 열려요"를 알려주는 게 아니라,
**중국인이 한국에서 겪는 브랜드 경험의 밀도를 높이는 것**이다.

그래서 DB 설계의 기준은 이것이다:

> **"이 데이터가 있으면 중국인 관광객의 행동이 바뀌는가?"**
> **"이 데이터가 쌓이면 브랜드에게 팔 수 있는 인사이트가 되는가?"**

둘 다 아니면 수집하지 않는다.

---

## 1. 수집 — 무엇을, 어디서, 어떤 기준으로

### 1-1. 수집 대상 정의

팝업스토어의 범위를 먼저 좁힌다.

| 포함 | 제외 |
|------|------|
| 브랜드가 의도적으로 기획한 한시적 공간 | 상설 매장의 기간한정 할인 |
| 전시·체험·판매 중 하나 이상 포함 | 단순 샘플링 부스 (시식 테이블 등) |
| 물리적 장소가 있음 | 온라인 전용 팝업 |
| 최소 3일 이상 운영 | 하루짜리 이벤트 (페스티벌 부스 등) |
| 서울·수도권 (1차), 부산·제주 (2차) | 그 외 지방 (3차 이후) |

**핵심 판단 기준:** 중국인 관광객이 "일부러 찾아갈 만한가?"
→ 찾아갈 이유가 없으면 수집하지 않는다.

### 1-2. 수집 소스와 우선순위

```
[Tier 1 — 자동 수집, 매일]
├── popga.co.kr        가장 포괄적인 팝업 캘린더
├── popply.co.kr       큐레이션형, 인기 팝업 위주
└── 백화점 공식 사이트   더현대/롯데/신세계 팝업 코너

[Tier 2 — 반자동, 주 2-3회]
├── 小红书 #서울팝업     중국인이 직접 올린 후기에서 역추적
├── Instagram #popup    한국 인플루언서 게시물에서 발견
└── 네이버 블로그         "팝업스토어 후기"로 검색

[Tier 3 — 수동, 비정기]
├── 브랜드 직접 제출      B2B 채널로 접수
├── 사용자 제보           앱 내 "팝업 제보" 기능
└── 편집팀 현장 답사      직접 가서 중국인 특화 정보 확인
```

**Tier 1이 물량, Tier 3이 품질을 담당한다.**
Tier 1으로 일단 잡고, Tier 3으로 중국인 특화 필드(알리페이, 중문직원)를 채운다.

### 1-3. 분류 체계

분류는 **사용자가 찾는 방식**을 기준으로 설계한다.
"이 팝업이 뭐냐"가 아니라 "사용자가 뭘 찾고 있냐"에서 출발.

#### 카테고리 (사용자 관심사 기반)

```
kpop        — 아이돌/K-POP (에스파, BTS, 뉴진스...)
drama       — 드라마/영화 IP (더 글로리, 오징어게임...)
character   — 캐릭터/IP (산리오, 잔망루피, 짱구...)
beauty      — 뷰티/화장품 (이니스프리, 설화수...)
fashion     — 패션/의류 (자라, 무신사...)
food        — 식품/음료 (스타벅스, 노티드...)
luxury      — 럭셔리/명품 (샤넬, 디올...)
art         — 전시/아트 (미디어아트, 사진전...)
game        — 게임 (원신, 블루아카이브...)
lifestyle   — 생활/잡화 (다이소, 이케아...)
collab      — 2개 이상 브랜드 협업
```

#### 지역 (관광객 동선 기반)

```
seongsu     — 성수 (팝업 메카)
hongdae     — 홍대/연남/합정
gangnam     — 강남/신사/압구정
myeongdong  — 명동/을지로
hannam      — 한남/이태원
jongno      — 종로/광화문/북촌
yeouido     — 여의도/영등포
coex        — 삼성/코엑스
etc         — 기타 서울
outside     — 서울 외 (부산, 제주 등)
```

#### 장소 유형 (공간 기반)

```
department_store  — 백화점 (더현대, 롯데, 신세계)
mall              — 복합몰 (코엑스, 스타필드, 타임스퀘어)
popup_building    — 전용 팝업 빌딩 (팩토리얼, 씬성수, 하우스도산)
street            — 가로변 독립 공간
park              — 공원/야외 (한강, 올림픽공원)
cultural          — 문화시설 (미술관, 갤러리)
```

### 1-4. 필터 기준 — 사용자가 실제로 거르는 것

필터는 "있으면 좋겠다"가 아니라 "이거 아니면 안 간다"로 선정.

```
[필수 필터]
지역          — "성수 근처 있는 거"
카테고리       — "K-POP 팝업만"
기간          — "이번 주 안에 끝나는 거" / "지금 열려있는 거"

[중국인 결정 필터]
알리페이 결제   — "알리페이 되는 데만"
중국어 소통     — "중국어 되는 데"
세금환급       — "환급 되는 데"

[편의 필터]
무료 입장      — "돈 안 드는 거"
예약 불필요    — "그냥 가면 되는 거"
혼잡도        — "지금 한산한 데"
```

---

## 2. 사용자 가치 — 중국인 관광객에게 보여줄 것

### 2-1. 사용자 여정별 가치 맵

팝업 정보가 필요한 시점은 세 번이다.

```
[방한 전 — 계획 단계]
├── "다음 주에 서울 가는데 뭐 열려있어?"
├── 가치: 일정 겹치는 팝업 자동 매칭
├── 데이터: start_date, end_date, 카테고리, 지역
└── UI: 여행일정 ↔ 팝업 캘린더 오버레이

[방한 중 — 발견 단계]
├── "지금 근처에 뭐 있어?"
├── 가치: 현재 위치 기반 실시간 추천
├── 데이터: lat/lng, 혼잡도, 운영시간, 알리페이
└── UI: 지도 핀 + 거리순 리스트 + 결제수단 배지

[방한 후 — 공유 단계]
├── "小红书에 올려야지"
├── 가치: SNS 태그 복사, 방문 인증, 후기 연결
├── 데이터: cn_sns_tag, source_xhs, 체크인 기록
└── UI: 방문 기록 카드 + 해시태그 복사 + 小红书 딥링크
```

### 2-2. 중국인 관광객만의 페인포인트

일반 팝업 앱(popga, 팝플리)과 HanPocket의 차별점은 여기에 있다.

| 페인포인트 | 기존 앱 | HanPocket |
|-----------|---------|-----------|
| 알리페이 되냐? | 정보 없음 | ✅ 결제수단 명시 |
| 중국어 통하냐? | 정보 없음 | ✅ 중문 직원/안내판 표시 |
| 줄 얼마나 서냐? | 정보 없음 | ✅ 실시간 혼잡도 (체크인 기반) |
| 세금환급 되냐? | 정보 없음 | ✅ 환급 가능 여부 + 최소금액 |
| 小红书 후기 있냐? | 연결 없음 | ✅ 小红书/抖音 직접 링크 |
| 한국어 설명 못 읽겠다 | 한국어만 | ✅ 중국어 간체 기본 |
| 여행 일정에 넣고 싶다 | 별도 관리 | ✅ 여행계획과 통합 |

### 2-3. 사용자에게 전달하는 정보의 계층

```
[1층 — 한 눈에 (카드)]
  브랜드명 + 한줄 소개(중국어) + 대표 이미지
  남은 일수 배지 ("D-3") + 결제수단 아이콘 + 무료/유료

[2층 — 살짝 더 (상세)]
  운영시간 + 휴무일 + 위치(지도) + 입장방식
  중국어 소통 여부 + 세금환급 + 예약 링크
  혼잡도 게이지 + 추천 방문 시간대

[3층 — 깊게 (연결)]
  小红书 후기 링크 + 抖音 영상
  주변 맛집/카페 연계 추천
  SNS 해시태그 복사
  체크인 → 방문 기록 저장
```

---

## 3. 브랜드 가치 — 팝업을 연 브랜드가 얻는 것

### 3-1. 브랜드가 HanPocket에서 얻는 데이터

팝업을 운영하는 브랜드 입장에서, HanPocket은 **"중국인 고객만 따로 볼 수 있는 돋보기"**다.

```
[기본 노출 데이터 — 무료]
  조회수        — 이 팝업을 몇 명이 봤는가
  위시리스트 수  — 몇 명이 "가고 싶다"를 눌렀는가
  체크인 수     — 실제로 몇 명이 왔는가

[인사이트 데이터 — 유료 리포트]
  방문자 국적 분포       — 중국 본토 vs 대만 vs 기타
  방문 시간대 패턴       — 언제 가장 많이 왔는가
  결제수단별 전환율       — 알리페이 있으면 체크인이 몇 % 높은가
  여정 내 위치           — 이 팝업 전후로 어디를 갔는가
  위시리스트→체크인 전환  — "관심"이 "방문"으로 바뀐 비율
  SNS 공유율            — 체크인 후 小红书 링크를 탭한 비율
```

### 3-2. 브랜드 등급 체계

브랜드와의 관계를 단계적으로 발전시킨다.

```
[Level 0 — 자동 수집]
  크롤링으로 수집된 팝업. 브랜드와 접점 없음.
  기본 정보만 노출. 중국인 특화 필드는 비어있을 수 있음.

[Level 1 — 브랜드 클레임]
  "이 팝업은 우리 거예요" — 브랜드가 소유권 주장.
  직접 정보 수정 가능. 정확한 운영시간, 이벤트 정보 제공.
  무료.

[Level 2 — 파트너]
  HanPocket과 데이터 공유 계약.
  실시간 재고/대기시간 API 연동.
  중국인 방문 인사이트 리포트 월간 수령.
  유료 (월 구독 or 건별).

[Level 3 — 프리미엄]
  홈화면 추천 슬롯, 푸시 알림 대상 포함.
  중국어 마케팅 소재 제작 지원.
  小红书 인플루언서 연결.
  유료 (캠페인 단위).
```

### 3-3. 브랜드에게 전달하는 핵심 메시지

> "한국 팝업에 중국인이 연간 XX만 명 방문합니다.
> 그런데 당신의 팝업에는 알리페이도, 중국어 안내도 없었습니다.
> HanPocket 데이터에 따르면, 알리페이를 도입한 팝업은
> 중국인 체크인이 평균 3.2배 높습니다.
> 다음 팝업에는 저희와 함께 준비하시겠습니까?"

이 메시지를 뒷받침하는 데이터가 DB에서 나와야 한다.

---

## 4. 경험·노하우 축적 — 데이터가 쌓여서 되는 것

### 4-1. 축적 대상

팝업은 사라지지만, **패턴은 남는다.**

```
[장소 패턴]
  "더현대 서울 B1F 팝업은 평균 2주 운영, 일 방문객 3,000명"
  "성수 거리 팝업은 주말 오후 2-5시 피크"
  "코엑스 팝업은 중국인 비율이 강남 대비 2배"
  → popup_venues 테이블에 누적 통계

[카테고리 패턴]
  "K-POP 팝업은 중국인 위시리스트 전환율 최고 (42%)"
  "뷰티 팝업은 알리페이 유무에 따라 체크인 3배 차이"
  "럭셔리 팝업은 중국어 직원이 매출에 직결"
  → 카테고리별 집계 View

[시간 패턴]
  "3월은 졸업여행 시즌 → 캐릭터/K-POP 수요 급증"
  "10월 국경절 연휴 → 럭셔리/뷰티 집중"
  "여름 한강 팝업 → 식품/음료 카테고리 강세"
  → 월별/시즌별 트렌드 집계

[브랜드 패턴]
  "이 브랜드는 연 4회 팝업, 매번 성수, 평균 10일 운영"
  "이 브랜드의 중국인 재방문율 28%"
  → brand 필드 기반 브랜드별 히스토리
```

### 4-2. 축적 구조

```
[Raw Layer — 원본 그대로]
  popups 테이블          — 모든 팝업 (만료 포함, 삭제 안 함)
  popup_checkins 테이블  — 모든 체크인 로그
  popup_views 테이블     — 조회 로그 (집계용)

[Aggregated Layer — 주기적 집계]
  venue_stats            — 장소별 누적 통계
  category_stats         — 카테고리별 월간 통계
  brand_stats            — 브랜드별 누적 통계
  seasonal_trends        — 월별 트렌드

[Insight Layer — 분석 결과]
  팝업 성과 스코어       — 조회 × 위시리스트 × 체크인 가중합
  중국인 친화도 점수     — 알리페이 + 중문직원 + 환급 가중합
  추천 알고리즘 피드     — 사용자 관심사 × 팝업 매칭 스코어
```

### 4-3. 만료된 팝업의 가치

**만료 팝업 ≠ 쓸모없는 데이터**

```
만료 팝업 활용:
  1. "이 브랜드의 과거 팝업" — 브랜드 페이지에서 히스토리 표시
  2. "이 장소에서 열렸던 팝업들" — 장소 페이지에서 과거 목록
  3. "작년 이맘때 인기였던 팝업" — 시즌별 트렌드 예측
  4. "비슷한 팝업이 곧 열립니다" — 과거 데이터 기반 추천
  5. 브랜드 리포트 — "지난 6개월간 귀사의 팝업 성과 요약"
```

---

## 5. 브랜드 가치 제고 — 기대효과

### 5-1. HanPocket이 만드는 선순환

```
                    ┌─────────────────────┐
                    │  중국인 관광객이      │
                    │  팝업을 발견한다      │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │  방문하고 체크인한다   │
                    │  (데이터 생성)        │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │  小红书에 공유한다     │
                    │  (UGC 생성)          │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │  더 많은 중국인이      │
                    │  관심을 갖는다        │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │  브랜드가 데이터를     │
                    │  보고 투자한다        │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │  더 나은 중국인 경험   │
                    │  (알리페이, 중문직원)  │
                    └──────────┬──────────┘
                               │
                               └──────→ (처음으로 돌아감)
```

### 5-2. 정량 기대효과

| 지표 | 현재 (팝업 앱 없음) | Phase 1 (3개월) | Phase 2 (6개월) | Phase 3 (12개월) |
|------|---------------------|-----------------|-----------------|------------------|
| 등록 팝업 수 | 0 | 100+ | 300+ | 500+/월 |
| 월간 조회 (중국인) | 0 | 5,000 | 30,000 | 100,000 |
| 체크인 수 | 0 | 200 | 2,000 | 10,000/월 |
| 파트너 브랜드 | 0 | 5 | 20 | 50+ |
| 월 수익 (KRW) | 0 | 0 (무료기) | 200만 | 1,000만+ |

### 5-3. 수익화 모델 연결

```
[무료 — 기본 노출]
  모든 팝업은 무료로 등록·노출됨.
  기본 통계 (조회수, 위시리스트) 무료 제공.
  → 생태계 규모 확보 우선

[유료 — 프리미엄 노출]
  홈화면 추천 슬롯            50만/주
  푸시 알림 타겟팅            30만/회
  "HOT" 배지 부여             20만/주
  → CPM 기반, 중국인 DAU에 연동

[유료 — 인사이트 리포트]
  월간 중국인 방문 분석        100만/월
  경쟁 브랜드 비교 리포트       200만/건
  시즌별 트렌드 예측 리포트     150만/건
  → 구독 모델

[유료 — 마케팅 서비스]
  중국어 마케팅 소재 제작       300만~/건
  小红书 인플루언서 연결        500만~/캠페인
  팝업 현장 중국어 운영 컨설팅  협의
  → 에이전시 모델
```

### 5-4. 브랜드에게 증명할 것

HanPocket이 브랜드에게 보여줘야 하는 숫자:

```
1. "당신의 팝업을 중국인 X명이 봤습니다"
   → view_count (국적 필터)

2. "그 중 Y명이 '가고 싶다'를 눌렀습니다"
   → wishlist_count

3. "실제로 Z명이 방문 인증했습니다"
   → checkin_count

4. "방문자의 W%가 小红书에 공유했습니다"
   → sns_share_rate (체크인 후 xhs 링크 탭 추적)

5. "알리페이를 도입한 경쟁사 대비 당신의 전환율은 N% 낮습니다"
   → 카테고리 평균 대비 비교

6. "다음 팝업에 이것만 추가하면 중국인 방문이 X배 늘 수 있습니다"
   → 중국인 친화도 점수 기반 개선 제안
```

---

## 6. DB 스키마 — 위 설계를 담는 그릇

위의 모든 논의를 반영한 테이블 구조.

### 6-1. `popups` — 핵심

```sql
CREATE TABLE popups (
  -- 식별
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT UNIQUE NOT NULL,

  -- 기본 (삼국어)
  brand           TEXT NOT NULL,
  title_ko        TEXT NOT NULL,
  title_zh        TEXT NOT NULL DEFAULT '',
  title_en        TEXT NOT NULL DEFAULT '',
  desc_ko         TEXT DEFAULT '',
  desc_zh         TEXT DEFAULT '',
  desc_en         TEXT DEFAULT '',

  -- 분류
  category        TEXT NOT NULL DEFAULT 'other',
  district        TEXT NOT NULL DEFAULT 'etc',
  venue_type      TEXT NOT NULL DEFAULT 'street',

  -- 장소
  venue_id        INTEGER REFERENCES venues(id),
  venue_name      TEXT NOT NULL DEFAULT '',
  address_ko      TEXT NOT NULL DEFAULT '',
  address_zh      TEXT DEFAULT '',
  lat             REAL NOT NULL DEFAULT 0,
  lng             REAL NOT NULL DEFAULT 0,
  floor           TEXT DEFAULT '',

  -- 기간
  start_date      TEXT NOT NULL,          -- YYYY-MM-DD
  end_date        TEXT NOT NULL,          -- YYYY-MM-DD
  open_time       TEXT DEFAULT '10:00',
  close_time      TEXT DEFAULT '20:00',
  closed_days     TEXT DEFAULT '[]',      -- JSON ['mon']

  -- 입장
  entry_type      TEXT DEFAULT 'free',    -- free / reservation / ticket / limited
  entry_fee       INTEGER DEFAULT 0,      -- KRW
  reservation_url TEXT DEFAULT '',

  -- ★ 중국인 결정 필드
  pay_alipay      INTEGER DEFAULT 0,
  pay_wechat      INTEGER DEFAULT 0,
  pay_unionpay    INTEGER DEFAULT 0,
  pay_card        INTEGER DEFAULT 1,
  pay_cash        INTEGER DEFAULT 1,
  cn_staff        INTEGER DEFAULT 0,      -- 중국어 직원
  cn_signage      INTEGER DEFAULT 0,      -- 중국어 안내
  tax_refund      INTEGER DEFAULT 0,      -- 세금환급
  tax_refund_min  INTEGER DEFAULT 30000,

  -- SNS 연결
  cn_hashtag      TEXT DEFAULT '',         -- 小红书 해시태그
  url_xhs         TEXT DEFAULT '',         -- 小红书 링크
  url_douyin      TEXT DEFAULT '',         -- 抖音 링크
  url_instagram   TEXT DEFAULT '',
  url_official    TEXT DEFAULT '',

  -- 미디어
  cover_image     TEXT DEFAULT '',
  images          TEXT DEFAULT '[]',
  emoji           TEXT DEFAULT '📌',
  color           TEXT DEFAULT '#000000',

  -- 소스
  source          TEXT DEFAULT 'manual',  -- manual/crawl/brand/user
  source_url      TEXT DEFAULT '',
  source_id       TEXT DEFAULT '',         -- 중복 방지용 원본 ID

  -- 상태
  status          TEXT DEFAULT 'active',  -- active/expired/draft/rejected
  is_hot          INTEGER DEFAULT 0,
  is_verified     INTEGER DEFAULT 0,
  is_sponsored    INTEGER DEFAULT 0,
  brand_level     INTEGER DEFAULT 0,      -- 0=자동수집, 1=클레임, 2=파트너, 3=프리미엄

  -- 집계 (캐시, 주기적 갱신)
  views           INTEGER DEFAULT 0,
  wishlists       INTEGER DEFAULT 0,
  checkins        INTEGER DEFAULT 0,
  cn_score        INTEGER DEFAULT 0,      -- 중국인 친화도 점수 (자동 계산)

  -- 타임스탬프
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_popups_status_date ON popups(status, end_date);
CREATE INDEX idx_popups_category ON popups(category);
CREATE INDEX idx_popups_district ON popups(district);
CREATE INDEX idx_popups_brand ON popups(brand);
CREATE INDEX idx_popups_cn ON popups(pay_alipay, cn_staff, tax_refund);
CREATE INDEX idx_popups_geo ON popups(lat, lng);
```

### 6-2. `venues` — 반복 장소 마스터

```sql
CREATE TABLE venues (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT UNIQUE NOT NULL,
  name_ko         TEXT NOT NULL,
  name_zh         TEXT DEFAULT '',
  name_en         TEXT DEFAULT '',
  venue_type      TEXT NOT NULL,
  district        TEXT NOT NULL,
  address_ko      TEXT NOT NULL,
  lat             REAL NOT NULL,
  lng             REAL NOT NULL,
  website         TEXT DEFAULT '',
  alipay_default  INTEGER DEFAULT 0,      -- 건물 전체 알리페이
  cn_counter      INTEGER DEFAULT 0,      -- 중국어 안내 카운터
  parking         INTEGER DEFAULT 0,

  -- 누적 통계
  total_popups    INTEGER DEFAULT 0,
  avg_duration    INTEGER DEFAULT 0,       -- 평균 운영일수
  avg_daily_visitors INTEGER DEFAULT 0,

  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 6-3. `checkins` — 방문 인증 + 혼잡도

```sql
CREATE TABLE checkins (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  popup_id        INTEGER NOT NULL REFERENCES popups(id),
  user_token      TEXT NOT NULL,           -- 익명 해시
  crowd_level     TEXT DEFAULT 'medium',   -- low/medium/high/packed
  wait_minutes    INTEGER DEFAULT 0,
  comment_zh      TEXT DEFAULT '',
  checked_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checkins_popup ON checkins(popup_id, checked_at);
```

### 6-4. `wishlists` — 가고 싶다

```sql
CREATE TABLE wishlists (
  popup_id        INTEGER NOT NULL REFERENCES popups(id),
  user_token      TEXT NOT NULL,
  added_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (popup_id, user_token)
);
```

### 6-5. `collections` — 큐레이션

```sql
CREATE TABLE collections (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT UNIQUE NOT NULL,
  title_ko        TEXT NOT NULL,
  title_zh        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  desc_zh         TEXT DEFAULT '',
  cover_image     TEXT DEFAULT '',
  sort_order      INTEGER DEFAULT 0,
  is_active       INTEGER DEFAULT 1,
  valid_until     TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collection_items (
  collection_id   INTEGER NOT NULL REFERENCES collections(id),
  popup_id        INTEGER NOT NULL REFERENCES popups(id),
  sort_order      INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, popup_id)
);
```

### 6-6. `popup_views` — 조회 로그 (인사이트용)

```sql
CREATE TABLE popup_views (
  popup_id        INTEGER NOT NULL,
  user_token      TEXT NOT NULL,
  source          TEXT DEFAULT 'list',    -- list/map/search/push/collection
  viewed_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_views_popup ON popup_views(popup_id, viewed_at);
```

### 6-7. 집계 View

```sql
-- 현재 활성 팝업
CREATE VIEW v_active AS
SELECT *,
  CAST(julianday(end_date) - julianday(date('now','localtime')) AS INTEGER) AS days_left
FROM popups
WHERE status = 'active' AND end_date >= date('now','localtime');

-- 마감 임박 (7일 이내)
CREATE VIEW v_closing_soon AS
SELECT * FROM v_active WHERE days_left BETWEEN 0 AND 7
ORDER BY days_left ASC;

-- 중국인 친화
CREATE VIEW v_cn_friendly AS
SELECT * FROM v_active
WHERE pay_alipay = 1 OR pay_wechat = 1 OR cn_staff = 1
ORDER BY cn_score DESC;

-- 인기 (HOT)
CREATE VIEW v_hot AS
SELECT * FROM v_active WHERE is_hot = 1
ORDER BY wishlists DESC;
```

### 6-8. `cn_score` 자동 계산 규칙

```
cn_score = (
  pay_alipay      × 30 +     -- 가장 중요
  pay_wechat      × 20 +
  cn_staff        × 25 +     -- 두 번째로 중요
  cn_signage      × 10 +
  tax_refund      × 10 +
  (url_xhs != '') × 5        -- 小红书 후기 있으면 보너스
)
// 최대 100점
```

---

## 7. 전체 요약 — 한 장으로

```
┌──────────────────────────────────────────────────────────┐
│                    팝업 DB 생태계                          │
│                                                          │
│  [수집]                                                   │
│  popga + popply + 네이버 → 자동 크롤링 → 기본 데이터       │
│  小红书 + 현장 답사 → 수동 보강 → 중국인 특화 데이터        │
│  브랜드 직접 제출 → 검증 → 고품질 데이터                    │
│                                                          │
│  [분류]                                                   │
│  카테고리 11종 × 지역 10종 × 장소유형 6종                   │
│  + 중국인 결정 필터 (알리페이, 중문직원, 환급)              │
│                                                          │
│  [사용자 가치]                                             │
│  방한 전: 일정 매칭    방한 중: 실시간 발견    방한 후: SNS  │
│                                                          │
│  [데이터 축적]                                             │
│  장소 패턴 + 카테고리 패턴 + 시간 패턴 + 브랜드 패턴        │
│  → 만료 팝업도 삭제하지 않음 → 패턴이 자산                  │
│                                                          │
│  [브랜드 가치]                                             │
│  Level 0→3 단계적 관계 발전                                │
│  무료 노출 → 유료 프리미엄 → 인사이트 리포트 → 마케팅 대행  │
│                                                          │
│  [선순환]                                                  │
│  발견 → 방문 → 공유 → 관심 → 투자 → 더 나은 경험 → 발견... │
└──────────────────────────────────────────────────────────┘
```

---

*이 문서는 기술 스키마가 아닌 사업 설계서다. 구현 순서와 코드는 별도 문서에서 다룬다.*
