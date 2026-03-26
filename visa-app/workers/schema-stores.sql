-- ============================================
-- NEAR 매장 DB 스키마 v3 (PostgreSQL)
-- stores + staff 2-테이블 구조
-- 마인디 성수 + 차이 실장 샘플 포함
-- ============================================


-- ── ENUM 정의 ──

CREATE TYPE service_type AS ENUM (
  'photo_studio',    -- 사진스튜디오
  'dermatology',     -- 피부과
  'plastic_surgery', -- 성형외과
  'restaurant',      -- 레스토랑(식당)
  'cafe',            -- 카페
  'hair',            -- 헤어
  'makeup',          -- 메이크업
  'popup',           -- 팝업
  'nail',            -- 네일
  'cosmetics',       -- 화장품
  'hotel',           -- 호텔
  'hospital',        -- 병원(의료)
  'shopping',        -- 쇼핑
  'other'            -- 기타
);

CREATE TYPE reservation_type AS ENUM (
  'near',      -- NEAR 자체 예약 (알리페이/위챗페이 보증금)
  'phone',     -- 전화 예약 (NEAR 예약 메시지 생성)
  'walkin',    -- 예약 불필요 (바로 방문)
  'none'       -- 예약 불가 / 확인 필요
);


-- ============================================
-- stores 테이블 (매장)
-- ============================================

CREATE TABLE stores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_kr         TEXT NOT NULL,
  name_cn         TEXT NOT NULL,
  service_type    service_type NOT NULL,
  description_kr  TEXT,
  description_cn  TEXT,
  address_kr      TEXT NOT NULL,
  address_cn      TEXT,
  latitude        DECIMAL(10,7) NOT NULL,
  longitude       DECIMAL(10,7) NOT NULL,
  nearest_station TEXT,
  station_exit    TEXT,
  walk_minutes    INTEGER,
  phone           TEXT,
  phone_dial      TEXT,
  hours_mon       TEXT,
  hours_tue       TEXT,
  hours_wed       TEXT,
  hours_thu       TEXT,
  hours_fri       TEXT,
  hours_sat       TEXT,
  hours_sun       TEXT,
  hours_holiday   TEXT,
  hours_note      TEXT,
  reservation_type    reservation_type DEFAULT 'none',
  reservation_url     TEXT,
  is_reservable       BOOLEAN DEFAULT false,
  walkin_available    BOOLEAN DEFAULT true,
  walkin_note         TEXT,
  reservation_kr_note TEXT,
  instagram_id      TEXT,
  kakao_channel_id  TEXT,
  pay_alipay        BOOLEAN DEFAULT false,
  pay_wechatpay     BOOLEAN DEFAULT false,
  keywords_cn       TEXT[],
  keywords_xhs      TEXT[],
  naver_place_id     TEXT,
  naver_rating       DECIMAL(2,1),
  naver_review_count INTEGER,
  google_place_id    TEXT,
  google_rating      DECIMAL(2,1),
  google_review_count INTEGER,
  photos             TEXT[],
  price_range        TEXT,
  languages          TEXT[],
  cn_score           INTEGER DEFAULT 0,
  is_siwol_pick     BOOLEAN DEFAULT false,
  siwol_comment     TEXT,
  vibe_tags         TEXT[],
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);


-- ============================================
-- staff 테이블 (담당자/디자이너)
-- ============================================

CREATE TABLE staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name_kr         TEXT NOT NULL,
  name_cn         TEXT,
  role_kr         TEXT,
  role_cn         TEXT,
  phone           TEXT,
  phone_dial      TEXT,
  speaks_cn       BOOLEAN DEFAULT false,
  speaks_en       BOOLEAN DEFAULT false,
  speaks_jp       BOOLEAN DEFAULT false,
  off_days        TEXT[],
  work_hours      TEXT,
  instagram_id    TEXT,
  is_featured     BOOLEAN DEFAULT false,
  featured_note_cn TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);


-- ============================================
-- 인덱스
-- ============================================

CREATE INDEX idx_stores_service_type ON stores(service_type);
CREATE INDEX idx_stores_location ON stores USING gist (point(longitude, latitude));
CREATE INDEX idx_stores_station ON stores(nearest_station);
CREATE INDEX idx_stores_keywords_cn ON stores USING gin(keywords_cn);
CREATE INDEX idx_stores_keywords_xhs ON stores USING gin(keywords_xhs);
CREATE INDEX idx_stores_active ON stores(is_active) WHERE is_active = true;
CREATE INDEX idx_stores_siwol ON stores(is_siwol_pick) WHERE is_siwol_pick = true;
CREATE INDEX idx_stores_vibe ON stores USING gin(vibe_tags);

CREATE INDEX idx_staff_store ON staff(store_id);
CREATE INDEX idx_staff_featured ON staff(is_featured) WHERE is_featured = true;
CREATE INDEX idx_staff_speaks_cn ON staff(speaks_cn) WHERE speaks_cn = true;


-- ============================================
-- 트리거
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================
-- 유틸리티 함수
-- ============================================

CREATE OR REPLACE FUNCTION get_store_hours(p_store_id UUID, p_dow INTEGER)
RETURNS TEXT AS $$
DECLARE result TEXT;
BEGIN
  SELECT CASE p_dow
    WHEN 0 THEN hours_sun WHEN 1 THEN hours_mon WHEN 2 THEN hours_tue
    WHEN 3 THEN hours_wed WHEN 4 THEN hours_thu WHEN 5 THEN hours_fri WHEN 6 THEN hours_sat
  END INTO result FROM stores WHERE id = p_store_id;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_store_open(p_store_id UUID, p_date DATE)
RETURNS BOOLEAN AS $$
BEGIN RETURN get_store_hours(p_store_id, EXTRACT(DOW FROM p_date)::INTEGER) IS NOT NULL; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_staff_available(p_staff_id UUID, p_date DATE)
RETURNS BOOLEAN AS $$
DECLARE day_name TEXT; off TEXT[];
BEGIN
  day_name := LOWER(TO_CHAR(p_date, 'fmday'));
  SELECT off_days INTO off FROM staff WHERE id = p_staff_id;
  IF off IS NULL THEN RETURN true; END IF;
  RETURN NOT (day_name = ANY(off));
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 뷰: 매장 + 추천 담당자
-- ============================================

CREATE OR REPLACE VIEW store_with_staff AS
SELECT
  s.*,
  st.id AS staff_id, st.name_kr AS staff_name_kr, st.name_cn AS staff_name_cn,
  st.role_kr AS staff_role_kr, st.role_cn AS staff_role_cn,
  st.phone AS staff_phone, st.phone_dial AS staff_phone_dial,
  st.speaks_cn AS staff_speaks_cn, st.off_days AS staff_off_days,
  st.work_hours AS staff_work_hours, st.instagram_id AS staff_instagram,
  st.featured_note_cn AS staff_note_cn
FROM stores s
LEFT JOIN staff st ON st.store_id = s.id AND st.is_featured = true AND st.is_active = true
WHERE s.is_active = true;
