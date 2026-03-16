-- ============================================================
-- HanPocket Popup DB v3 — PostgreSQL 마이그레이션
-- 3차원 설계: 카테고리 12종 + 수집 소스 + 현장 반응 루프 + 브랜드 가치
-- ============================================================

-- UUID 확장
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1) brands (브랜드) ───────────────────────────────────────

CREATE TABLE brands (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name_ko               TEXT NOT NULL,
  name_cn               TEXT,
  name_en               TEXT,

  -- 브랜드 레벨
  -- 0: 자동수집 (브랜드 모름)
  -- 1: 클레임 (브랜드가 "이거 우리 팝업" 인증)
  -- 2: 파트너 (월정액/건당 과금, 데이터 제공)
  -- 3: 프리미엄 (커스텀 리포트, 컨설팅)
  level                 INTEGER DEFAULT 0 CHECK (level BETWEEN 0 AND 3),

  -- 유통 채널 입점 여부 (수집 자격 판별용)
  in_shinsegae          BOOLEAN DEFAULT FALSE,
  in_lotte              BOOLEAN DEFAULT FALSE,
  in_hyundai            BOOLEAN DEFAULT FALSE,
  in_ipark              BOOLEAN DEFAULT FALSE,
  in_musinsa            BOOLEAN DEFAULT FALSE,
  in_29cm               BOOLEAN DEFAULT FALSE,
  in_wconcept           BOOLEAN DEFAULT FALSE,
  in_ably               BOOLEAN DEFAULT FALSE,
  in_zigzag             BOOLEAN DEFAULT FALSE,
  in_oliveyoung         BOOLEAN DEFAULT FALSE,
  in_aland              BOOLEAN DEFAULT FALSE,

  -- 아이돌 관련
  entertainment_company TEXT,

  -- 파트너 정보 (Level 2+)
  contact_name          TEXT,
  contact_email         TEXT,
  contact_wechat        TEXT,
  contract_start        DATE,
  contract_end          DATE,
  monthly_fee           INTEGER,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_level ON brands(level);
CREATE INDEX idx_brands_name  ON brands(name_ko);


-- ── 2) popups (핵심 테이블) ──────────────────────────────────

CREATE TABLE popups (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  name_ko               TEXT NOT NULL,
  name_cn               TEXT,
  name_en               TEXT,
  category              TEXT NOT NULL,        -- FASHION/BEAUTY/SPORTS/EXHIBITION/LIFESTYLE/IDOL/ANIME/HANGANG/SEOUL_CITY/FESTIVAL/DDP/FNB
  subcategory           TEXT,
  description_ko        TEXT,
  description_cn        TEXT,

  -- 브랜드 연결
  brand_id              UUID REFERENCES brands(id),

  -- 일정
  start_date            DATE NOT NULL,
  end_date              DATE,                 -- NULL = 상시
  open_time             TIME,
  close_time            TIME,
  last_entry_time       TIME,                 -- 마지막 입장시간
  closed_days           TEXT,                 -- 휴무일

  -- 위치
  address_ko            TEXT NOT NULL,
  address_cn            TEXT,
  district              TEXT,                 -- seongsu/hongdae/gangnam/myeongdong/ddp 등
  latitude              DECIMAL(10,7),
  longitude             DECIMAL(10,7),
  nearest_station       TEXT,
  station_exit          TEXT,
  walk_minutes          INTEGER,
  floor_info            TEXT,

  -- === 검수 체크리스트 (cn_ = 중국인 특화) ===

  -- 결제
  cn_alipay             BOOLEAN DEFAULT NULL,
  cn_wechatpay          BOOLEAN DEFAULT NULL,
  cn_unionpay           BOOLEAN DEFAULT NULL,
  accepts_cash          BOOLEAN DEFAULT NULL,
  accepts_card          BOOLEAN DEFAULT NULL,

  -- 입장
  is_free               BOOLEAN DEFAULT TRUE,
  price                 TEXT,
  reservation_required  BOOLEAN DEFAULT NULL,
  reservation_method    TEXT,
  cn_no_kr_phone_ok     BOOLEAN DEFAULT NULL,  -- 한국번호 없이 예약 가능?
  walk_in_available     BOOLEAN DEFAULT NULL,
  avg_wait_weekday      TEXT,
  avg_wait_weekend      TEXT,

  -- 언어
  cn_staff              BOOLEAN DEFAULT NULL,
  cn_brochure           BOOLEAN DEFAULT NULL,
  en_available          BOOLEAN DEFAULT NULL,

  -- 혜택
  has_freebies          BOOLEAN DEFAULT NULL,
  freebies_limited      BOOLEAN DEFAULT NULL,
  has_photozone         BOOLEAN DEFAULT NULL,
  tax_free              BOOLEAN DEFAULT NULL,

  -- 실용
  has_locker            BOOLEAN DEFAULT NULL,
  wheelchair_ok         BOOLEAN DEFAULT NULL,
  has_wifi              BOOLEAN DEFAULT NULL,

  -- 중국인 친화도 점수 (자동 계산, 0~10)
  cn_score              DECIMAL(3,1) DEFAULT 0,

  -- 수집 메타
  source                TEXT,                 -- popply/popga/instagram/manual 등
  source_url            TEXT,
  verified              BOOLEAN DEFAULT FALSE,
  verified_by           TEXT,
  verified_at           TIMESTAMPTZ,

  -- 상태
  status                TEXT DEFAULT 'active' CHECK (status IN ('active','expired','upcoming','draft')),

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_popups_category   ON popups(category);
CREATE INDEX idx_popups_district   ON popups(district);
CREATE INDEX idx_popups_status     ON popups(status);
CREATE INDEX idx_popups_dates      ON popups(start_date, end_date);
CREATE INDEX idx_popups_end_date   ON popups(end_date);
CREATE INDEX idx_popups_cn_score   ON popups(cn_score DESC);
CREATE INDEX idx_popups_brand      ON popups(brand_id);
CREATE INDEX idx_popups_geo        ON popups(latitude, longitude);
CREATE INDEX idx_popups_verified   ON popups(verified, status);


-- ── 3) user_interactions (3차원 — 현장 반응 루프) ────────────

CREATE TABLE user_interactions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL,
  popup_id              UUID NOT NULL REFERENCES popups(id) ON DELETE CASCADE,

  -- 인터랙션 유형
  type                  TEXT NOT NULL CHECK (type IN (
    'checkin',       -- 위치 도착 감지 (geofence)
    'super_like',    -- 왕좋아요 (관리자에게만 공개)
    'like',          -- 좋아요
    'review',        -- 리뷰 작성
    'wishlist',      -- 위시리스트 추가
    'share',         -- Xiaohongshu/위챗 공유
    'purchase'       -- 굿즈 구매
  )),

  -- 리뷰 데이터 (type='review'일 때)
  review_text           TEXT,
  review_lang           TEXT,                 -- zh/ko/en
  review_photos         TEXT[],

  -- 체크인 데이터 (type='checkin'일 때)
  checkin_at            TIMESTAMPTZ,
  checkout_at           TIMESTAMPTZ,
  dwell_minutes         INTEGER,

  -- 보상
  reward_type           TEXT,                 -- point/coupon/brand_sample/random_box
  reward_value          TEXT,
  reward_claimed        BOOLEAN DEFAULT FALSE,

  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_user     ON user_interactions(user_id);
CREATE INDEX idx_interactions_popup    ON user_interactions(popup_id);
CREATE INDEX idx_interactions_type     ON user_interactions(type);
CREATE INDEX idx_interactions_created  ON user_interactions(created_at DESC);
-- 같은 유저가 같은 팝업에 같은 유형으로 중복 반응 방지 (review, super_like, like, wishlist)
CREATE UNIQUE INDEX idx_interactions_unique_reaction
  ON user_interactions(user_id, popup_id, type)
  WHERE type IN ('super_like','like','review','wishlist');


-- ── 4) wechat_inquiries (위챗방 문의 데이터) ─────────────────

CREATE TABLE wechat_inquiries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id              UUID REFERENCES popups(id) ON DELETE SET NULL,

  question_type         TEXT NOT NULL CHECK (question_type IN (
    'payment',        -- 결제수단
    'wait_time',      -- 대기시간
    'freebies',       -- 사은품/재고
    'location',       -- 위치/교통
    'reservation',    -- 예약 방법
    'language',       -- 중문 서비스
    'purchase',       -- 구매 대행 요청
    'other'
  )),

  question_text         TEXT,
  answer_text           TEXT,
  answered_by           TEXT,                 -- admin/user/brand_staff

  wechat_group          TEXT,
  asked_at              TIMESTAMPTZ DEFAULT NOW(),
  answered_at           TIMESTAMPTZ
);

CREATE INDEX idx_wechat_popup    ON wechat_inquiries(popup_id);
CREATE INDEX idx_wechat_type     ON wechat_inquiries(question_type);
CREATE INDEX idx_wechat_asked    ON wechat_inquiries(asked_at DESC);


-- ── 5) popup_products (위챗 미니샵 상품) ─────────────────────

CREATE TABLE popup_products (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id              UUID NOT NULL REFERENCES popups(id) ON DELETE CASCADE,
  brand_id              UUID REFERENCES brands(id),

  name_cn               TEXT NOT NULL,
  name_ko               TEXT,
  description_cn        TEXT,
  price_krw             INTEGER NOT NULL,
  price_cny             DECIMAL(10,2),

  stock                 INTEGER DEFAULT 0,
  is_preorder           BOOLEAN DEFAULT TRUE,
  is_limited            BOOLEAN DEFAULT FALSE,
  is_seoul_edition      BOOLEAN DEFAULT FALSE,

  images                TEXT[],

  status                TEXT DEFAULT 'active' CHECK (status IN ('active','soldout','upcoming')),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_popup  ON popup_products(popup_id);
CREATE INDEX idx_products_brand  ON popup_products(brand_id);
CREATE INDEX idx_products_status ON popup_products(status);


-- ── 6) popup_patterns (노하우 축적 — 4차원) ─────────────────

CREATE TABLE popup_patterns (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 패턴 축 (4축)
  axis                  TEXT NOT NULL CHECK (axis IN (
    'location',       -- 장소축 (성수=뷰티 강세, 홍대=아이돌 강세)
    'time',           -- 시간축 (3월=뷰티 시즌, 여름=페스티벌)
    'brand',          -- 브랜드축 (A브랜드는 중국인 반응 항상 좋음)
    'category'        -- 카테고리축 (아이돌>뷰티>전시 방문전환율)
  )),

  axis_key              TEXT NOT NULL,        -- 'seongsu', '2026-03', 'brand_xxx', 'IDOL'

  -- 집계 데이터 (Aggregated Layer)
  total_popups          INTEGER DEFAULT 0,
  total_checkins        INTEGER DEFAULT 0,
  total_reviews         INTEGER DEFAULT 0,
  avg_dwell_min         DECIMAL(5,1),
  avg_cn_score          DECIMAL(3,1),
  review_rate           DECIMAL(5,2),         -- 리뷰 전환율 %
  share_rate            DECIMAL(5,2),         -- SNS 공유율 %
  super_like_rate       DECIMAL(5,2),         -- 왕좋아요 비율 %

  -- 인사이트 (Insight Layer)
  insight_text          TEXT,

  period_start          DATE,
  period_end            DATE,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patterns_axis     ON popup_patterns(axis, axis_key);
CREATE INDEX idx_patterns_period   ON popup_patterns(period_start, period_end);
CREATE UNIQUE INDEX idx_patterns_unique
  ON popup_patterns(axis, axis_key, period_start, period_end);


-- ── 7) brand_reports (브랜드 가치 리포트) ────────────────────

CREATE TABLE brand_reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id              UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  popup_id              UUID REFERENCES popups(id) ON DELETE SET NULL,

  -- Level 1 (클레임 이상)
  views                 INTEGER DEFAULT 0,
  wishlist_adds         INTEGER DEFAULT 0,
  interest_by_city      JSONB,                -- {"上海": 45, "北京": 30}

  -- Level 2 (파트너 이상)
  actual_visits         INTEGER DEFAULT 0,
  reviews_count         INTEGER DEFAULT 0,
  reviews_raw           JSONB,
  avg_dwell_min         DECIMAL(5,1),
  super_like_pct        DECIMAL(5,2),
  visit_flow            JSONB,                -- 동선 패턴
  wechat_questions      JSONB,

  -- Level 3 (프리미엄)
  competitor_compare    JSONB,
  optimal_timing        TEXT,
  sns_tracking          JSONB,

  report_period         TEXT,                 -- '2026-03' or '2026-Q1'
  report_type           TEXT CHECK (report_type IN ('popup_single','brand_monthly','brand_quarterly')),
  generated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_brand   ON brand_reports(brand_id);
CREATE INDEX idx_reports_popup   ON brand_reports(popup_id);
CREATE INDEX idx_reports_period  ON brand_reports(report_period);
CREATE INDEX idx_reports_type    ON brand_reports(report_type);


-- ── 8) collection_sources (수집 소스 관리) ───────────────────

CREATE TABLE collection_sources (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  type                  TEXT NOT NULL DEFAULT 'crawl' CHECK (type IN ('crawl','api','rss','instagram','manual')),
  url                   TEXT DEFAULT '',
  category_scope        TEXT DEFAULT 'all',
  frequency             TEXT DEFAULT 'daily' CHECK (frequency IN ('daily','3x_week','weekly','event')),
  priority              INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  last_crawled_at       TIMESTAMPTZ,
  item_count            INTEGER DEFAULT 0,
  is_active             BOOLEAN DEFAULT TRUE,
  notes                 TEXT DEFAULT '',
  created_at            TIMESTAMPTZ DEFAULT NOW()
);


-- ── 9) cn_score 자동 계산 함수 ───────────────────────────────

CREATE OR REPLACE FUNCTION calc_cn_score(p popups)
RETURNS DECIMAL(3,1) AS $$
BEGIN
  RETURN LEAST(10.0, (
    COALESCE(p.cn_alipay::int,       0) * 2.0 +
    COALESCE(p.cn_wechatpay::int,    0) * 2.0 +
    COALESCE(p.cn_staff::int,        0) * 2.0 +
    COALESCE(p.cn_brochure::int,     0) * 1.0 +
    COALESCE(p.cn_no_kr_phone_ok::int,0) * 1.5 +
    COALESCE(p.has_freebies::int,    0) * 0.5 +
    COALESCE(p.has_photozone::int,   0) * 0.5 +
    COALESCE(p.tax_free::int,        0) * 0.5
  ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ── 10) cn_score 자동 갱신 트리거 ────────────────────────────

CREATE OR REPLACE FUNCTION trigger_update_cn_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.cn_score := LEAST(10.0, (
    COALESCE(NEW.cn_alipay::int,       0) * 2.0 +
    COALESCE(NEW.cn_wechatpay::int,    0) * 2.0 +
    COALESCE(NEW.cn_staff::int,        0) * 2.0 +
    COALESCE(NEW.cn_brochure::int,     0) * 1.0 +
    COALESCE(NEW.cn_no_kr_phone_ok::int,0) * 1.5 +
    COALESCE(NEW.has_freebies::int,    0) * 0.5 +
    COALESCE(NEW.has_photozone::int,   0) * 0.5 +
    COALESCE(NEW.tax_free::int,        0) * 0.5
  ));
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_popups_cn_score
  BEFORE INSERT OR UPDATE OF
    cn_alipay, cn_wechatpay, cn_staff, cn_brochure,
    cn_no_kr_phone_ok, has_freebies, has_photozone, tax_free
  ON popups
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_cn_score();


-- ── 11) updated_at 자동 갱신 트리거 ─────────────────────────

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_patterns_updated_at
  BEFORE UPDATE ON popup_patterns
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ── 12) 유용한 뷰 ───────────────────────────────────────────

-- 현재 활성 팝업
CREATE VIEW v_active_popups AS
SELECT *,
  CASE
    WHEN end_date IS NULL THEN NULL
    ELSE (end_date - CURRENT_DATE)
  END AS days_left
FROM popups
WHERE status = 'active'
  AND start_date <= CURRENT_DATE
  AND (end_date IS NULL OR end_date >= CURRENT_DATE);

-- 마감 임박 (7일 이내)
CREATE VIEW v_closing_soon AS
SELECT * FROM v_active_popups
WHERE days_left IS NOT NULL AND days_left BETWEEN 0 AND 7
ORDER BY days_left ASC;

-- 중국인 친화 팝업
CREATE VIEW v_cn_friendly AS
SELECT * FROM v_active_popups
WHERE cn_score >= 4.0
ORDER BY cn_score DESC;

-- 팝업별 인터랙션 집계
CREATE VIEW v_popup_stats AS
SELECT
  p.id,
  p.name_ko,
  p.category,
  p.district,
  p.cn_score,
  COUNT(CASE WHEN i.type = 'checkin'    THEN 1 END) AS checkin_count,
  COUNT(CASE WHEN i.type = 'super_like' THEN 1 END) AS super_like_count,
  COUNT(CASE WHEN i.type = 'like'       THEN 1 END) AS like_count,
  COUNT(CASE WHEN i.type = 'review'     THEN 1 END) AS review_count,
  COUNT(CASE WHEN i.type = 'wishlist'   THEN 1 END) AS wishlist_count,
  COUNT(CASE WHEN i.type = 'share'      THEN 1 END) AS share_count,
  AVG(CASE WHEN i.type = 'checkin' THEN i.dwell_minutes END) AS avg_dwell_min
FROM popups p
LEFT JOIN user_interactions i ON p.id = i.popup_id
GROUP BY p.id, p.name_ko, p.category, p.district, p.cn_score;

-- 브랜드 수집 자격 확인 뷰
CREATE VIEW v_eligible_brands AS
SELECT *,
  (in_shinsegae OR in_lotte OR in_hyundai OR in_ipark OR
   in_musinsa OR in_29cm OR in_wconcept OR in_ably OR
   in_zigzag OR in_oliveyoung OR in_aland) AS is_eligible
FROM brands;


-- ── 13) 초기 수집 소스 데이터 ────────────────────────────────

INSERT INTO collection_sources (name, type, url, category_scope, frequency, priority, notes) VALUES
-- Tier 1: 매일
('popga.co.kr',              'crawl',     'https://popga.co.kr',                     'all',                        'daily',    1, '가장 포괄적인 팝업 캘린더'),
('popply.co.kr',             'crawl',     'https://popply.co.kr',                    'all',                        'daily',    1, '큐레이션형 인기 팝업'),
('성수동고릴라',               'crawl',     'https://seongsu-gorilla.com',             'EXHIBITION,LIFESTYLE',       'daily',    1, '성수 전시/라이프스타일 특화'),
('데이포유',                   'crawl',     'https://dayforyou.com',                   'EXHIBITION',                 'daily',    1, '전시/갤러리 전문'),
('더현대 서울',                'crawl',     'https://www.thehyundai.com',              'FASHION,BEAUTY,LIFESTYLE',   'daily',    1, '더현대 팝업 코너'),
('롯데백화점',                 'crawl',     'https://www.lotteshopping.com',           'FASHION,BEAUTY,LIFESTYLE',   'daily',    1, '롯데 팝업'),
('신세계백화점',               'crawl',     'https://www.shinsegae.com',               'FASHION,BEAUTY,LIFESTYLE',   'daily',    1, '신세계 팝업'),
('현대백화점',                 'crawl',     'https://www.ehyundai.com',                'FASHION,BEAUTY,LIFESTYLE',   'daily',    1, '현대 팝업'),
('아이파크백화점',             'crawl',     'https://www.iparkmall.co.kr',             'FASHION,BEAUTY,LIFESTYLE',   'daily',    1, '아이파크 팝업'),
('DDP 공식',                  'crawl',     'https://www.ddp.or.kr',                   'DDP',                        'daily',    1, 'DDP 전시/행사'),
('@ddp_seoul',               'instagram', 'https://instagram.com/ddp_seoul',          'DDP',                        'daily',    1, 'DDP 공식 인스타'),
('visitseoul.net',           'crawl',     'https://www.visitseoul.net',              'HANGANG,SEOUL_CITY',         'daily',    1, '서울관광재단'),
('visitkorea.or.kr',         'crawl',     'https://www.visitkorea.or.kr',            'HANGANG,SEOUL_CITY,FESTIVAL','daily',    1, '한국관광공사'),
-- 소속사 공식 (Tier 1)
('HYBE 공식',                 'crawl',     'https://www.hybecorp.com',                'IDOL',                       'daily',    1, 'BTS, 세븐틴, 뉴진스 등'),
('SM엔터 공식',               'crawl',     'https://www.smentertainment.com',         'IDOL',                       'daily',    1, 'aespa, NCT, Red Velvet 등'),
('JYP 공식',                  'crawl',     'https://www.jype.com',                    'IDOL',                       'daily',    1, 'TWICE, Stray Kids, NMIXX 등'),
('YG 공식',                   'crawl',     'https://www.ygfamily.com',                'IDOL',                       'daily',    1, 'BLACKPINK, TREASURE 등'),
('큐브 공식',                  'crawl',     'https://www.cubeent.co.kr',               'IDOL',                       'daily',    1, '(여자)아이들 등'),
('스타쉽 공식',                'crawl',     'https://www.starship-ent.com',            'IDOL',                       'daily',    1, 'IVE, 몬스타엑스 등'),
('카카오엔터',                 'crawl',     'https://www.kakaoent.com',                'IDOL',                       'daily',    1, 'ATEEZ 등'),
('RBW 공식',                  'crawl',     'https://www.rbbridge.com',                'IDOL',                       'daily',    1, '마마무 등'),
('플레디스(HYBE)',             'crawl',     'https://www.pledis.co.kr',                'IDOL',                       'daily',    1, '세븐틴 등'),
('빅히트(HYBE)',               'crawl',     'https://ibighit.com',                     'IDOL',                       'daily',    1, 'BTS 등'),
-- Tier 2: 주 3회
('무신사 공식 인스타',          'instagram', 'https://instagram.com/musinsacom',         'FASHION',                    '3x_week',  2, '무신사 팝업 감지'),
('올리브영 공식 인스타',        'instagram', 'https://instagram.com/oliveyoung_official','BEAUTY',                     '3x_week',  2, '올리브영 팝업'),
('29CM 공식 인스타',           'instagram', 'https://instagram.com/29cm_official',      'FASHION,LIFESTYLE',          '3x_week',  2, '29CM 팝업'),
('인터파크 티켓',               'crawl',     'https://ticket.interpark.com',             'FESTIVAL',                   '3x_week',  2, '페스티벌/축제 태그'),
('YES24 공연',                 'crawl',     'https://ticket.yes24.com',                 'FESTIVAL',                   '3x_week',  2, '축제/페스티벌'),
('네이버웹툰 공지',             'crawl',     'https://www.webtoons.com/ko',              'ANIME',                      '3x_week',  2, '웹툰 연계 팝업'),
('카카오웹툰 공지',             'crawl',     'https://webtoon.kakao.com',                'ANIME',                      '3x_week',  2, '웹툰 연계 팝업'),
('TourAPI 축제',               'api',       'https://apis.data.go.kr/B551011',          'FESTIVAL',                   '3x_week',  2, 'contentTypeId=85'),
('@visitseoul_official',      'instagram', 'https://instagram.com/visitseoul_official','HANGANG,SEOUL_CITY',          '3x_week',  2, '서울관광재단 인스타'),
('@seoul_official',           'instagram', 'https://instagram.com/seoul_official',     'SEOUL_CITY',                  '3x_week',  2, '서울시 공식 인스타'),
-- Tier 3: 주 1회
('小红书 키워드',               'manual',    'https://www.xiaohongshu.com',              'all',                        'weekly',   3, '"首尔快闪" "서울팝업" 역추적'),
('빌리빌리 키워드',             'manual',    'https://www.bilibili.com',                 'ANIME',                      'weekly',   3, 'IP명+"韩国" 검색'),
('네이버 블로그',               'manual',    'https://blog.naver.com',                   'all',                        'weekly',   3, '"팝업스토어 후기" 검색'),
('브랜드 입점 DB 갱신',         'crawl',     '',                                          'FASHION,BEAUTY,SPORTS,LIFESTYLE','weekly', 3, '유통채널 입점 목록 크롤링'),
-- F&B 소스
('Xiaohongshu F&B 트렌드',    'manual',    'https://www.xiaohongshu.com',              'FNB',                        'weekly',   3, '카페/음식 팝업 트렌드');
