-- ============================================================
-- HanPocket Popup Store DB v3 — D1 (SQLite) 마이그레이션
-- 3차원 설계: 카테고리 12종 + 수집 소스 + 현장 반응 루프
-- ============================================================
-- D1은 PostgreSQL이 아님. UUID 대신 INTEGER PK, BOOLEAN 대신 INTEGER.


-- ── 1) brands ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brands (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,

  name_ko         TEXT NOT NULL,
  name_cn         TEXT DEFAULT '',
  name_en         TEXT DEFAULT '',

  -- 브랜드 레벨 (0=자동수집, 1=클레임, 2=파트너, 3=프리미엄)
  level           INTEGER DEFAULT 0,

  -- 유통 채널 입점 여부 (수집 자격 판별)
  in_shinsegae    INTEGER DEFAULT 0,
  in_lotte        INTEGER DEFAULT 0,
  in_hyundai      INTEGER DEFAULT 0,
  in_ipark        INTEGER DEFAULT 0,
  in_musinsa      INTEGER DEFAULT 0,
  in_29cm         INTEGER DEFAULT 0,
  in_wconcept     INTEGER DEFAULT 0,
  in_ably         INTEGER DEFAULT 0,
  in_zigzag       INTEGER DEFAULT 0,
  in_oliveyoung   INTEGER DEFAULT 0,
  in_aland        INTEGER DEFAULT 0,

  -- 아이돌 소속사
  entertainment_company TEXT DEFAULT '',

  -- 파트너 정보 (Level 2+)
  contact_name    TEXT DEFAULT '',
  contact_email   TEXT DEFAULT '',
  contact_wechat  TEXT DEFAULT '',
  contract_start  TEXT,       -- YYYY-MM-DD
  contract_end    TEXT,
  monthly_fee     INTEGER DEFAULT 0,

  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_brands_level ON brands(level);
CREATE INDEX IF NOT EXISTS idx_brands_name  ON brands(name_ko);


-- ── 2) popups (v3 — 핵심 테이블) ────────────────────────────

-- 기존 popups 테이블을 드롭하지 않고 v3 전용 테이블 생성
-- 운영 중 전환 시 데이터 마이그레이션 스크립트 별도 실행

CREATE TABLE IF NOT EXISTS popups_v3 (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,

  -- 기본 정보
  name_ko         TEXT NOT NULL,
  name_cn         TEXT DEFAULT '',
  name_en         TEXT DEFAULT '',
  category        TEXT NOT NULL DEFAULT 'LIFESTYLE',
  -- FASHION/BEAUTY/SPORTS/EXHIBITION/LIFESTYLE/IDOL/ANIME/HANGANG/SEOUL_CITY/FESTIVAL/DDP/FNB
  subcategory     TEXT DEFAULT '',
  description_ko  TEXT DEFAULT '',
  description_cn  TEXT DEFAULT '',

  -- 브랜드 연결
  brand_id        INTEGER REFERENCES brands(id),
  brand_name      TEXT DEFAULT '',       -- 빠른 조회용 비정규화

  -- 일정
  start_date      TEXT NOT NULL,          -- YYYY-MM-DD
  end_date        TEXT,                   -- NULL = 상시
  open_time       TEXT DEFAULT '10:00',
  close_time      TEXT DEFAULT '20:00',
  last_entry_time TEXT DEFAULT '',        -- 마지막 입장시간
  closed_days     TEXT DEFAULT '',        -- "월,화" or "mon,tue"

  -- 위치
  address_ko      TEXT NOT NULL DEFAULT '',
  address_cn      TEXT DEFAULT '',
  district        TEXT DEFAULT 'other',
  -- seongsu/hongdae/gangnam/myeongdong/hannam/yeouido/jongno/coex/ddp/hangang/other/outside
  lat             REAL DEFAULT 0,
  lng             REAL DEFAULT 0,
  nearest_station TEXT DEFAULT '',
  station_exit    TEXT DEFAULT '',
  walk_minutes    INTEGER DEFAULT 0,
  floor_info      TEXT DEFAULT '',

  -- ─── 검수 체크리스트 (cn_ = 중국인 특화) ───
  -- NULL = 미확인, 0 = 아니오, 1 = 예

  -- 결제
  cn_alipay       INTEGER,               -- 알리페이
  cn_wechatpay    INTEGER,               -- 위챗페이
  cn_unionpay     INTEGER,               -- 은련카드
  accepts_cash    INTEGER,
  accepts_card    INTEGER DEFAULT 1,

  -- 입장
  is_free         INTEGER DEFAULT 1,
  price           TEXT DEFAULT '',
  reservation_required INTEGER,
  reservation_method   TEXT DEFAULT '',
  cn_no_kr_phone_ok    INTEGER,          -- 한국번호 없이 예약 가능?
  walk_in_available    INTEGER DEFAULT 1,
  avg_wait_weekday     TEXT DEFAULT '',
  avg_wait_weekend     TEXT DEFAULT '',

  -- 언어
  cn_staff        INTEGER,               -- 중문 가능 스태프
  cn_brochure     INTEGER,               -- 중문 안내물
  en_available    INTEGER,

  -- 혜택
  has_freebies    INTEGER,               -- 사은품/굿즈
  freebies_limited INTEGER,              -- 한정 수량
  has_photozone   INTEGER,               -- 포토존
  tax_free        INTEGER,               -- 면세

  -- 실용
  has_locker      INTEGER,
  wheelchair_ok   INTEGER,
  has_wifi        INTEGER,

  -- 점수
  cn_score        REAL DEFAULT 0,        -- 중국인 친화도 (0~10, 자동 계산)

  -- 수집 메타
  source          TEXT DEFAULT 'manual',  -- popply/popga/instagram/manual/brand
  source_url      TEXT DEFAULT '',
  verified        INTEGER DEFAULT 0,
  verified_by     TEXT DEFAULT '',
  verified_at     DATETIME,

  -- 외부 링크
  url_official    TEXT DEFAULT '',
  url_instagram   TEXT DEFAULT '',
  url_xhs         TEXT DEFAULT '',        -- 小红书
  url_douyin      TEXT DEFAULT '',        -- 抖音
  cover_image     TEXT DEFAULT '',
  images          TEXT DEFAULT '[]',      -- JSON array
  emoji           TEXT DEFAULT '📌',
  color           TEXT DEFAULT '#000000',

  -- 집계 (캐시)
  view_count      INTEGER DEFAULT 0,
  wishlist_count  INTEGER DEFAULT 0,
  check_in_count  INTEGER DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  avg_rating      REAL DEFAULT 0,
  super_like_count INTEGER DEFAULT 0,
  like_count      INTEGER DEFAULT 0,

  -- 상태
  status          TEXT DEFAULT 'active',  -- active/expired/upcoming/draft
  is_hot          INTEGER DEFAULT 0,

  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_v3_category   ON popups_v3(category);
CREATE INDEX IF NOT EXISTS idx_v3_district   ON popups_v3(district);
CREATE INDEX IF NOT EXISTS idx_v3_status     ON popups_v3(status);
CREATE INDEX IF NOT EXISTS idx_v3_dates      ON popups_v3(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_v3_cn_score   ON popups_v3(cn_score);
CREATE INDEX IF NOT EXISTS idx_v3_brand      ON popups_v3(brand_id);
CREATE INDEX IF NOT EXISTS idx_v3_geo        ON popups_v3(lat, lng);
CREATE INDEX IF NOT EXISTS idx_v3_hot        ON popups_v3(is_hot, status);


-- ── 3) reactions (왕좋아요/좋아요) ───────────────────────────

CREATE TABLE IF NOT EXISTS reactions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token      TEXT NOT NULL,
  popup_id        INTEGER NOT NULL,
  reaction_type   TEXT NOT NULL,          -- 'super_like' or 'like'
  reacted_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_token, popup_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_popup ON reactions(popup_id);


-- ── 4) reviews (리뷰) ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token      TEXT NOT NULL,
  popup_id        INTEGER NOT NULL,
  rating          INTEGER NOT NULL,       -- 1~5
  crowd_level     TEXT DEFAULT 'medium',  -- low/medium/high/packed
  comment         TEXT DEFAULT '',
  lang            TEXT DEFAULT 'zh',      -- zh/ko/en
  photos          TEXT DEFAULT '[]',      -- JSON array of URLs
  tags            TEXT DEFAULT '[]',      -- JSON array of tag codes
  review_tier     TEXT DEFAULT 'mini',    -- mini/normal/premium
  reward_type     TEXT DEFAULT '',
  reward_detail   TEXT DEFAULT '',
  reward_source   TEXT DEFAULT 'system',  -- system/brand
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_token, popup_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_popup ON reviews(popup_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user  ON reviews(user_token);


-- ── 5) geo_triggers (위치 감지 로그) ─────────────────────────

CREATE TABLE IF NOT EXISTS geo_triggers (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token      TEXT NOT NULL,
  popup_id        INTEGER NOT NULL,
  trigger_type    TEXT NOT NULL DEFAULT 'enter', -- enter/exit/dwell_5min/dwell_15min
  lat             REAL DEFAULT 0,
  lng             REAL DEFAULT 0,
  triggered_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_geo_popup    ON geo_triggers(popup_id);
CREATE INDEX IF NOT EXISTS idx_geo_user     ON geo_triggers(user_token);
CREATE INDEX IF NOT EXISTS idx_geo_type     ON geo_triggers(trigger_type);


-- ── 6) checkins (체크인 — 수동/QR 포함) ─────────────────────

CREATE TABLE IF NOT EXISTS checkins_v3 (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token      TEXT NOT NULL,
  popup_id        INTEGER NOT NULL,
  method          TEXT DEFAULT 'geofence', -- geofence/qr/manual
  checkin_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  checkout_at     DATETIME,
  dwell_minutes   INTEGER,
  UNIQUE(user_token, popup_id)            -- 같은 팝업 1회만
);

CREATE INDEX IF NOT EXISTS idx_checkins_v3_popup ON checkins_v3(popup_id);
CREATE INDEX IF NOT EXISTS idx_checkins_v3_user  ON checkins_v3(user_token);


-- ── 7) rewards_log (보상 이력) ───────────────────────────────

CREATE TABLE IF NOT EXISTS rewards_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token      TEXT NOT NULL,
  popup_id        INTEGER,
  reward_type     TEXT NOT NULL,           -- points/coupon/brand_sample/random_box
  reward_detail   TEXT DEFAULT '',          -- "150P", "스타벅스 쿠폰" 등
  reward_source   TEXT DEFAULT 'system',   -- system/brand
  claimed         INTEGER DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rewards_user ON rewards_log(user_token);


-- ── 8) post_review_clicks (리뷰 후 추천 클릭) ───────────────

CREATE TABLE IF NOT EXISTS post_review_clicks (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token      TEXT NOT NULL,
  source_popup    INTEGER NOT NULL,        -- 리뷰한 팝업
  clicked_type    TEXT NOT NULL,           -- same_category_popup/restaurant/cafe/attraction
  clicked_id      TEXT NOT NULL,           -- 클릭한 아이템 ID
  card_position   INTEGER DEFAULT 0,       -- 카드 위치 (0-indexed)
  clicked_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prc_source ON post_review_clicks(source_popup);
CREATE INDEX IF NOT EXISTS idx_prc_type   ON post_review_clicks(clicked_type);


-- ── 9) user_taste (사용자 취향 프로필) ───────────────────────

CREATE TABLE IF NOT EXISTS user_taste (
  user_token      TEXT PRIMARY KEY,
  fav_categories  TEXT DEFAULT '[]',       -- JSON: ["BEAUTY","IDOL"]
  fav_districts   TEXT DEFAULT '[]',       -- JSON: ["seongsu","hongdae"]
  visit_count     INTEGER DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  total_points    INTEGER DEFAULT 0,
  explorer_level  INTEGER DEFAULT 1,
  badges          TEXT DEFAULT '[]',
  last_active     DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ── 10) popup_wishlist (위시리스트) ──────────────────────────

CREATE TABLE IF NOT EXISTS popup_wishlist_v3 (
  popup_id        INTEGER NOT NULL,
  user_token      TEXT NOT NULL,
  added_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(popup_id, user_token)
);


-- ── 11) collection_sources (수집 소스) ───────────────────────

CREATE TABLE IF NOT EXISTS collection_sources (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  type            TEXT DEFAULT 'crawl',    -- crawl/api/rss/instagram/manual
  url             TEXT DEFAULT '',
  category_scope  TEXT DEFAULT 'all',
  frequency       TEXT DEFAULT 'daily',    -- daily/3x_week/weekly/event
  priority        INTEGER DEFAULT 2,       -- 1=Tier1, 2=Tier2, 3=Tier3
  last_crawled_at DATETIME,
  item_count      INTEGER DEFAULT 0,
  is_active       INTEGER DEFAULT 1,
  notes           TEXT DEFAULT '',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ── 12) brand_reports (브랜드 가치 리포트) ───────────────────

CREATE TABLE IF NOT EXISTS brand_reports (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_id        INTEGER NOT NULL,
  popup_id        INTEGER,

  -- Level 1 (클레임)
  views           INTEGER DEFAULT 0,
  wishlist_adds   INTEGER DEFAULT 0,
  interest_by_city TEXT DEFAULT '{}',      -- JSON

  -- Level 2 (파트너)
  actual_visits   INTEGER DEFAULT 0,
  reviews_count   INTEGER DEFAULT 0,
  reviews_raw     TEXT DEFAULT '[]',       -- JSON
  avg_dwell_min   REAL,
  super_like_pct  REAL,
  visit_flow      TEXT DEFAULT '{}',       -- JSON
  wechat_questions TEXT DEFAULT '{}',

  -- Level 3 (프리미엄)
  competitor_compare TEXT DEFAULT '{}',
  optimal_timing  TEXT DEFAULT '',
  sns_tracking    TEXT DEFAULT '{}',

  report_period   TEXT,                    -- '2026-03' or '2026-Q1'
  report_type     TEXT DEFAULT 'popup_single',
  generated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_breports_brand ON brand_reports(brand_id);


-- ── 13) popup_products (위챗 미니샵 상품) ────────────────────
-- 방한 후 구매 흐름: 현장 못 산 굿즈 → 위챗방 문의 → 미니샵 사전주문

CREATE TABLE IF NOT EXISTS popup_products (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  popup_id        INTEGER NOT NULL,
  brand_id        INTEGER,

  -- 상품 정보 (중국어 우선)
  name_cn         TEXT NOT NULL,
  name_ko         TEXT DEFAULT '',
  description_cn  TEXT DEFAULT '',
  category        TEXT DEFAULT 'goods',   -- goods/beauty/fashion/food/ticket/other
  price_krw       INTEGER NOT NULL,       -- 한국 원가
  price_cny       REAL,                   -- 위안화 판매가 (환율 적용)
  commission_pct  REAL DEFAULT 10,        -- NEAR 수수료율 %

  -- 재고/상태
  stock           INTEGER DEFAULT 0,      -- 0 = 재고 미확인(사전주문만)
  is_preorder     INTEGER DEFAULT 1,      -- 1 = 사전주문제 (확정 시 구매)
  is_limited      INTEGER DEFAULT 0,      -- 한정판
  is_seoul_edition INTEGER DEFAULT 0,     -- 서울 에디션 (현지 한정)
  is_exclusive    INTEGER DEFAULT 0,      -- 팝업 현장 전용 (온라인 X)

  -- 이미지
  images          TEXT DEFAULT '[]',      -- JSON array of URLs
  cover_image     TEXT DEFAULT '',

  -- 배송
  ships_to_china  INTEGER DEFAULT 1,      -- 중국 배송 가능
  shipping_fee_cny REAL DEFAULT 0,        -- 배송비 (위안)
  shipping_days   INTEGER DEFAULT 7,      -- 예상 배송일

  -- 판매
  sold_count      INTEGER DEFAULT 0,
  wishlist_count  INTEGER DEFAULT 0,
  view_count      INTEGER DEFAULT 0,

  status          TEXT DEFAULT 'active',  -- active/soldout/upcoming/closed
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_popup  ON popup_products(popup_id);
CREATE INDEX IF NOT EXISTS idx_products_brand  ON popup_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON popup_products(status);


-- ── 14) product_orders (미니샵 주문) ─────────────────────────
-- 주문 흐름: inquiry → preorder → confirmed → paid → shipped → delivered

CREATE TABLE IF NOT EXISTS product_orders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no        TEXT UNIQUE NOT NULL,    -- 주문번호 "HP-20260316-001"
  user_token      TEXT NOT NULL,
  product_id      INTEGER NOT NULL,
  popup_id        INTEGER NOT NULL,

  -- 주문 정보
  quantity        INTEGER DEFAULT 1,
  unit_price_cny  REAL NOT NULL,
  shipping_cny    REAL DEFAULT 0,
  total_cny       REAL NOT NULL,           -- (unit_price × qty) + shipping
  commission_cny  REAL DEFAULT 0,          -- NEAR 수수료

  -- 결제
  payment_method  TEXT DEFAULT '',         -- wechat/alipay/bank
  payment_id      TEXT DEFAULT '',         -- 외부 결제 ID
  paid_at         DATETIME,

  -- 배송
  receiver_name   TEXT DEFAULT '',
  receiver_phone  TEXT DEFAULT '',
  receiver_address TEXT DEFAULT '',
  receiver_city   TEXT DEFAULT '',
  tracking_no     TEXT DEFAULT '',
  shipped_at      DATETIME,
  delivered_at    DATETIME,

  -- 상태
  status          TEXT DEFAULT 'preorder',
  -- preorder  : 사전주문 접수 (재고 미확정)
  -- confirmed : 재고 확보 완료 → 결제 요청
  -- paid      : 결제 완료
  -- shipping  : 배송 중
  -- delivered : 배송 완료
  -- cancelled : 취소
  -- refunded  : 환불

  -- 소스
  source          TEXT DEFAULT 'minishop', -- minishop/wechat_group/app
  wechat_inquiry_id INTEGER,              -- 위챗 문의에서 전환된 경우

  note            TEXT DEFAULT '',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user    ON product_orders(user_token);
CREATE INDEX IF NOT EXISTS idx_orders_product ON product_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_popup   ON product_orders(popup_id);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON product_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_no      ON product_orders(order_no);


-- ── 15) wechat_inquiries (위챗방 문의) ───────────────────────
-- 위챗방에서 들어온 질문 → 답변 → 구매 전환 추적

CREATE TABLE IF NOT EXISTS wechat_inquiries (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  popup_id        INTEGER,
  product_id      INTEGER,                 -- 특정 상품 문의일 때

  -- 문의 분류
  question_type   TEXT NOT NULL DEFAULT 'other',
  -- payment       : 결제수단
  -- wait_time     : 대기시간
  -- freebies      : 사은품/재고
  -- location      : 위치/교통
  -- reservation   : 예약 방법
  -- language      : 중문 서비스
  -- purchase      : 구매 대행 요청 ← 미니샵 전환 대상
  -- stock         : 재고 확인
  -- shipping      : 배송 문의
  -- other

  question_text   TEXT DEFAULT '',         -- 원문 (중국어)
  answer_text     TEXT DEFAULT '',
  answered_by     TEXT DEFAULT '',         -- admin/bot/brand_staff

  -- 전환 추적
  converted_to_order INTEGER DEFAULT 0,    -- 주문으로 전환?
  order_id        INTEGER,                 -- 전환된 주문 ID

  -- 메타
  wechat_group    TEXT DEFAULT '',
  wechat_user     TEXT DEFAULT '',         -- 문의자 (위챗 닉네임 or 해시)
  asked_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  answered_at     DATETIME
);

CREATE INDEX IF NOT EXISTS idx_wechat_popup   ON wechat_inquiries(popup_id);
CREATE INDEX IF NOT EXISTS idx_wechat_type    ON wechat_inquiries(question_type);
CREATE INDEX IF NOT EXISTS idx_wechat_convert ON wechat_inquiries(converted_to_order);


-- ── 16) sns_shares (SNS 공유 추적) ──────────────────────────
-- 小红书/抖音 해시태그 복사 + 방문 기록 공유

CREATE TABLE IF NOT EXISTS sns_shares (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token      TEXT NOT NULL,
  popup_id        INTEGER NOT NULL,
  platform        TEXT NOT NULL,           -- xhs/douyin/wechat_moment/instagram
  action          TEXT DEFAULT 'copy_tag', -- copy_tag/deeplink/share_card
  hashtag_used    TEXT DEFAULT '',         -- 복사한 해시태그
  shared_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sns_popup    ON sns_shares(popup_id);
CREATE INDEX IF NOT EXISTS idx_sns_platform ON sns_shares(platform);


-- ── 초기 수집 소스 데이터 ────────────────────────────────────

INSERT OR IGNORE INTO collection_sources (name, type, url, category_scope, frequency, priority, notes) VALUES
-- Tier 1
('popga.co.kr',       'crawl', 'https://popga.co.kr',            'all',                        'daily',   1, '포괄적 팝업 캘린더'),
('popply.co.kr',      'crawl', 'https://popply.co.kr',           'all',                        'daily',   1, '큐레이션형 인기 팝업'),
('성수동고릴라',       'crawl', 'https://seongsu-gorilla.com',    'EXHIBITION,LIFESTYLE',       'daily',   1, '성수 전시 특화'),
('데이포유',           'crawl', 'https://dayforyou.com',          'EXHIBITION',                 'daily',   1, '전시 전문'),
('더현대 서울',        'crawl', 'https://www.thehyundai.com',     'FASHION,BEAUTY,LIFESTYLE',   'daily',   1, '더현대 팝업'),
('롯데백화점',         'crawl', 'https://www.lotteshopping.com',  'FASHION,BEAUTY,LIFESTYLE',   'daily',   1, '롯데 팝업'),
('신세계백화점',       'crawl', 'https://www.shinsegae.com',      'FASHION,BEAUTY,LIFESTYLE',   'daily',   1, '신세계 팝업'),
('현대백화점',         'crawl', 'https://www.ehyundai.com',       'FASHION,BEAUTY,LIFESTYLE',   'daily',   1, '현대 팝업'),
('아이파크백화점',     'crawl', 'https://www.iparkmall.co.kr',    'FASHION,BEAUTY,LIFESTYLE',   'daily',   1, '아이파크 팝업'),
('DDP 공식',          'crawl', 'https://www.ddp.or.kr',          'DDP',                        'daily',   1, 'DDP 전시/행사'),
('@ddp_seoul',        'instagram','https://instagram.com/ddp_seoul','DDP',                      'daily',   1, 'DDP 인스타'),
('visitseoul.net',    'crawl', 'https://www.visitseoul.net',     'HANGANG,SEOUL_CITY',         'daily',   1, '서울관광재단'),
('visitkorea.or.kr',  'crawl', 'https://www.visitkorea.or.kr',   'HANGANG,SEOUL_CITY,FESTIVAL','daily',   1, '한국관광공사'),
('HYBE 공식',         'crawl', 'https://www.hybecorp.com',       'IDOL',                       'daily',   1, 'BTS, 세븐틴, 뉴진스 등'),
('SM엔터 공식',       'crawl', 'https://www.smentertainment.com','IDOL',                       'daily',   1, 'aespa, NCT 등'),
('JYP 공식',          'crawl', 'https://www.jype.com',           'IDOL',                       'daily',   1, 'TWICE, Stray Kids 등'),
('YG 공식',           'crawl', 'https://www.ygfamily.com',       'IDOL',                       'daily',   1, 'BLACKPINK, TREASURE 등'),
-- Tier 2
('인터파크 티켓',      'crawl', 'https://ticket.interpark.com',   'FESTIVAL',                   '3x_week', 2, '축제 태그'),
('YES24 공연',        'crawl', 'https://ticket.yes24.com',       'FESTIVAL',                   '3x_week', 2, '축제/페스티벌'),
('TourAPI 축제',      'api',   'https://apis.data.go.kr/B551011','FESTIVAL',                   '3x_week', 2, 'contentTypeId=85'),
('@visitseoul',       'instagram','https://instagram.com/visitseoul_official','HANGANG,SEOUL_CITY','3x_week',2, '서울관광재단 인스타'),
('네이버웹툰',        'crawl', 'https://www.webtoons.com/ko',    'ANIME',                      '3x_week', 2, '웹툰 연계 팝업'),
-- Tier 3
('小红书',            'manual','https://www.xiaohongshu.com',    'all',                        'weekly',  3, '"首尔快闪" 역추적'),
('네이버 블로그',      'manual','https://blog.naver.com',         'all',                        'weekly',  3, '"팝업스토어 후기"');
