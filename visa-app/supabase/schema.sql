CREATE TABLE brands (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh      TEXT NOT NULL,
  name_ko      TEXT,
  name_en      TEXT,
  industry     TEXT,
  brand_level  INTEGER DEFAULT 0 CHECK (brand_level BETWEEN 0 AND 3),
  logo_url     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE popups (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id         UUID REFERENCES brands(id),
  name_zh          TEXT NOT NULL,
  name_ko          TEXT,
  name_en          TEXT,
  category         TEXT DEFAULT 'fashion',
  description_zh   TEXT,
  address_ko       TEXT,
  address_zh       TEXT,
  lat              DECIMAL(10,7),
  lng              DECIMAL(10,7),
  district         TEXT,
  start_date       DATE,
  end_date         DATE,
  is_temporary     BOOLEAN DEFAULT TRUE,
  open_time        TIME,
  close_time       TIME,
  closed_days      TEXT[],
  has_chinese_staff   BOOLEAN DEFAULT FALSE,
  has_chinese_menu    BOOLEAN DEFAULT FALSE,
  has_alipay          BOOLEAN DEFAULT FALSE,
  has_wechat_pay      BOOLEAN DEFAULT FALSE,
  has_union_pay       BOOLEAN DEFAULT FALSE,
  has_visa            BOOLEAN DEFAULT FALSE,
  has_tax_refund      BOOLEAN DEFAULT FALSE,
  has_reservation     BOOLEAN DEFAULT FALSE,
  cn_score INTEGER GENERATED ALWAYS AS (
    (CASE WHEN has_chinese_staff THEN 20 ELSE 0 END) +
    (CASE WHEN has_chinese_menu  THEN 15 ELSE 0 END) +
    (CASE WHEN has_alipay        THEN 20 ELSE 0 END) +
    (CASE WHEN has_wechat_pay    THEN 20 ELSE 0 END) +
    (CASE WHEN has_union_pay     THEN  5 ELSE 0 END) +
    (CASE WHEN has_visa          THEN  5 ELSE 0 END) +
    (CASE WHEN has_tax_refund    THEN 10 ELSE 0 END) +
    (CASE WHEN has_reservation   THEN  5 ELSE 0 END)
  ) STORED,
  view_count     INTEGER DEFAULT 0,
  view_count_7d  INTEGER DEFAULT 0,
  image_url      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE popup_services (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id     UUID REFERENCES popups(id) ON DELETE CASCADE,
  name_zh      TEXT NOT NULL,
  name_ko      TEXT,
  price_krw    INTEGER NOT NULL,
  duration_min INTEGER DEFAULT 60,
  sort_order   INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number  TEXT UNIQUE NOT NULL,
  popup_id        UUID REFERENCES popups(id),
  service_id      UUID REFERENCES popup_services(id),
  device_id       TEXT NOT NULL,
  customer_name   TEXT,
  booking_date    DATE NOT NULL,
  booking_time    TIME NOT NULL,
  guests          INTEGER DEFAULT 1,
  deposit_krw     INTEGER DEFAULT 0,
  total_krw       INTEGER DEFAULT 0,
  payment_method  TEXT,
  payment_status  TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  status          TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed','completed','cancelled','noshow')),
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id     TEXT UNIQUE NOT NULL,
  device_model  TEXT,
  os            TEXT,
  language      TEXT DEFAULT 'zh-CN',
  taste_tags    TEXT[],
  visit_purpose TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ DEFAULT NOW(),
  session_count INTEGER DEFAULT 1
);

CREATE TABLE user_interactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id),
  popup_id         UUID REFERENCES popups(id),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view','checkin','like','unlike','review','share')),
  review_text      TEXT,
  review_rating    INTEGER CHECK (review_rating BETWEEN 1 AND 5),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE popup_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id    UUID REFERENCES popups(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  source      TEXT DEFAULT 'user' CHECK (source IN ('user','brand','admin')),
  uploaded_by UUID REFERENCES users(id),
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_zh        TEXT NOT NULL,
  title_ko        TEXT,
  description_zh  TEXT,
  course_type     TEXT DEFAULT 'walking' CHECK (course_type IN ('city_tour','kpop','walking','food','custom')),
  poi_ids         UUID[] NOT NULL,
  estimated_hours DECIMAL(3,1),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wechat_inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id    UUID REFERENCES popups(id),
  question_zh TEXT NOT NULL,
  answer_zh   TEXT,
  answered_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE checklist_reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id       UUID REFERENCES popups(id),
  user_id        UUID REFERENCES users(id),
  field_name     TEXT NOT NULL,
  reported_value TEXT NOT NULL,
  confidence     TEXT DEFAULT 'single' CHECK (confidence IN ('single','confirmed','admin')),
  source         TEXT DEFAULT 'app',
  applied        BOOLEAN DEFAULT FALSE,
  applied_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_popups_district    ON popups(district);
CREATE INDEX idx_popups_category    ON popups(category);
CREATE INDEX idx_popups_dates       ON popups(start_date, end_date);
CREATE INDEX idx_popups_location    ON popups(lat, lng);
CREATE INDEX idx_popups_cn_score    ON popups(cn_score DESC);
CREATE INDEX idx_bookings_device    ON bookings(device_id);
CREATE INDEX idx_bookings_popup     ON bookings(popup_id);
CREATE INDEX idx_bookings_date      ON bookings(booking_date);
CREATE INDEX idx_bookings_status    ON bookings(status);
CREATE INDEX idx_users_device       ON users(device_id);
CREATE INDEX idx_interactions_user  ON user_interactions(user_id);
CREATE INDEX idx_interactions_popup ON user_interactions(popup_id);

INSERT INTO brands (id, name_zh, name_ko, name_en, industry, brand_level) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'GENTLE MONSTER', '젠틀몬스터', 'GENTLE MONSTER', 'fashion', 3),
  ('b0000001-0000-0000-0000-000000000002', 'BLACKPINK', '블랙핑크', 'BLACKPINK', 'kpop', 3),
  ('b0000001-0000-0000-0000-000000000003', 'Nike × SKIMS', '나이키×스킴스', 'Nike × SKIMS', 'fashion', 2);

INSERT INTO popups (id, brand_id, name_zh, name_ko, category, address_ko, address_zh, lat, lng, district, start_date, end_date, is_temporary, open_time, close_time, has_alipay, has_wechat_pay, has_visa, has_reservation, image_url) VALUES
  ('p0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'GENTLE MONSTER Circuit Collection', '젠틀몬스터 서킷 컬렉션', 'fashion', '서울 성동구 성수이로 7길 8', '首尔 城东区 圣水二路7街 8号', 37.5445, 127.0567, 'seongsu', '2026-03-01', '2026-04-30', true, '11:00', '21:00', true, false, true, false, NULL),
  ('p0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', 'BLACKPINK DEADLINE POP-UP', '블랙핑크 데드라인 팝업', 'kpop', '서울 성동구 연무장 5가길 7', '首尔 城东区 延武场5街7号', 37.5440, 127.0590, 'seongsu', '2026-02-15', '2026-04-15', true, '10:00', '20:00', true, true, true, true, NULL),
  ('p0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003', 'NikeSKIMS 限时店', '나이키스킴스 팝업', 'fashion', '서울 강남구 압구정로 46길 50', '首尔 江南区 狎鸥亭路46街 50号', 37.5270, 127.0370, 'gangnam', '2026-03-10', '2026-03-31', true, '11:00', '20:00', true, false, true, false, NULL);

INSERT INTO popups (id, name_zh, name_ko, category, address_ko, address_zh, lat, lng, district, is_temporary, open_time, close_time, has_alipay, has_wechat_pay, has_visa, has_reservation) VALUES
  ('p0000001-0000-0000-0000-000000000101', '圣水洞美容院', '성수동 미용실', 'beauty', '서울 성동구 성수이로 14길 20', '首尔 城东区 圣水二路14街 20号', 37.5448, 127.0560, 'seongsu', false, '10:00', '20:00', true, true, true, true),
  ('p0000001-0000-0000-0000-000000000102', '弘大皮肤管理', '홍대 피부관리', 'beauty', '서울 마포구 와우산로 29길 12', '首尔 麻浦区 卧牛山路29街 12号', 37.5563, 126.9220, 'hongdae', false, '10:00', '21:00', true, true, true, true),
  ('p0000001-0000-0000-0000-000000000103', '江南美甲店', '강남 네일샵', 'beauty', '서울 강남구 강남대로 102길 15', '首尔 江南区 江南大路102街 15号', 37.5172, 127.0286, 'gangnam', false, '10:00', '20:00', true, false, true, true);

INSERT INTO popup_services (popup_id, name_zh, name_ko, price_krw, duration_min, sort_order) VALUES
  ('p0000001-0000-0000-0000-000000000101', '剪发', '커트', 35000, 40, 1),
  ('p0000001-0000-0000-0000-000000000101', '染发', '염색', 80000, 90, 2),
  ('p0000001-0000-0000-0000-000000000101', '头皮护理', '두피 클리닉', 60000, 60, 3),
  ('p0000001-0000-0000-0000-000000000102', '基础护肤', '기초관리', 50000, 60, 1),
  ('p0000001-0000-0000-0000-000000000102', '补水护理', '수분관리', 70000, 75, 2),
  ('p0000001-0000-0000-0000-000000000102', '提升护理', '리프팅', 90000, 90, 3),
  ('p0000001-0000-0000-0000-000000000103', '基础美甲', '기본 네일', 30000, 40, 1),
  ('p0000001-0000-0000-0000-000000000103', '凝胶美甲', '젤 네일', 50000, 60, 2),
  ('p0000001-0000-0000-0000-000000000103', '美甲艺术', '네일 아트', 70000, 75, 3);

INSERT INTO courses (title_zh, title_ko, description_zh, course_type, poi_ids, estimated_hours) VALUES
  ('圣水洞快闪路线', '성수동 팝업 코스', '성수동 인기 팝업 3곳을 한번에', 'walking',
   ARRAY['p0000001-0000-0000-0000-000000000001'::UUID, 'p0000001-0000-0000-0000-000000000002'::UUID, 'p0000001-0000-0000-0000-000000000101'::UUID],
   2.5);
