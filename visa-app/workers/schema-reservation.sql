-- NEAR 예약 시스템 D1 스키마 (Cloudflare D1 / SQLite)
-- 네이버 예약 수준 + 중국인 특화

-- ─── 매장 ───
CREATE TABLE IF NOT EXISTS shops (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'beauty',          -- beauty, medical
  subcategory TEXT,                                  -- hair, nail, skin, derma, plastic...
  name_ko TEXT NOT NULL,
  name_zh TEXT,
  name_en TEXT,
  description_ko TEXT,
  description_zh TEXT,
  description_en TEXT,
  photos TEXT DEFAULT '[]',                          -- JSON: [{url, type: exterior|interior|menu|portfolio}]

  -- 위치
  address_ko TEXT,
  address_zh TEXT,
  lat REAL,
  lng REAL,
  nearest_station TEXT,                              -- "청담역 7번출구 도보 3분"
  phone TEXT,

  -- 영업
  operating_hours TEXT DEFAULT '[]',                 -- JSON: [{day:0-6, open, close, break_start, break_end}]
  closed_days TEXT DEFAULT '[]',                     -- JSON: [0,6] (일,토)
  irregular_holidays TEXT DEFAULT '[]',              -- JSON: ["2026-03-01", "2026-05-05"]

  -- 예약 설정
  slot_interval_min INTEGER DEFAULT 30,             -- 10/15/20/30/60
  max_concurrent_bookings INTEGER DEFAULT 3,        -- 동시 예약 수
  min_booking_hours_before INTEGER DEFAULT 2,       -- 최소 N시간 전 예약
  max_booking_days_ahead INTEGER DEFAULT 30,        -- 최대 N일 전 예약
  auto_confirm INTEGER DEFAULT 0,                   -- 0=수동승인, 1=자동승인
  notice_ko TEXT,                                    -- "10분 이상 지각 시 자동 취소"
  notice_zh TEXT,

  -- 시설
  facilities TEXT DEFAULT '[]',                      -- JSON: ["wifi","parking","room","drink","childcare"]
  seat_count INTEGER,
  has_private_room INTEGER DEFAULT 0,
  drink_service TEXT,                                -- "무료 커피/차"

  -- 중국인 특화
  chinese_available TEXT DEFAULT 'none',             -- none, basic, fluent
  chinese_staff_count INTEGER DEFAULT 0,
  languages TEXT DEFAULT '["ZH"]',                   -- JSON: ["ZH","EN","JA"]
  payment_accepts TEXT DEFAULT '[]',                 -- JSON: ["alipay","wechat","unionpay","card","cash"]
  tax_refund_available INTEGER DEFAULT 0,
  xiaohongshu_url TEXT,
  dianping_url TEXT,
  foreign_experience TEXT,                           -- "중국인 고객 월 200명+"

  -- 환불 정책
  deposit_rate REAL DEFAULT 0.30,
  refund_policy TEXT DEFAULT '[]',                   -- JSON: [{hours_before, refund_rate}]
  noshow_refund_rate REAL DEFAULT 0.00,
  noshow_escalation TEXT DEFAULT '[]',               -- JSON: [{count, deposit_rate_or_action}]

  -- 통계
  rating REAL DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  completion_rate REAL DEFAULT 0.0,
  noshow_rate REAL DEFAULT 0.0,

  -- NEAR 운영
  is_verified INTEGER DEFAULT 0,
  partner_tier TEXT DEFAULT 'basic',                 -- basic, partner, premium
  commission_rate REAL DEFAULT 0.10,
  chat_enabled INTEGER DEFAULT 1,

  -- 멀티 지점
  parent_shop_id TEXT,                               -- 본점 ID (체인점인 경우)
  branch_name TEXT,                                  -- "강남점", "홍대점"

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ─── 서비스/시술 메뉴 ───
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL REFERENCES shops(id),
  category TEXT,                                     -- cut, color, perm, clinic, nail...
  name_ko TEXT NOT NULL,
  name_zh TEXT,
  name_en TEXT,
  description_ko TEXT,
  description_zh TEXT,

  -- 가격 (범위 지원)
  price_krw INTEGER NOT NULL,                        -- 기본가 (₩)
  price_krw_max INTEGER,                             -- 최대가 (가격 범위일 때)
  price_cny INTEGER NOT NULL,                        -- 기본가 (¥)
  price_cny_max INTEGER,                             -- 최대가
  price_variable INTEGER DEFAULT 0,                  -- 1이면 "상담 후 변동 가능" 표시

  -- 스타일리스트별 차등 가격
  stylist_prices TEXT DEFAULT '[]',                  -- JSON: [{stylist_id, price_krw, price_cny}]

  duration INTEGER NOT NULL,                         -- 소요시간 (분)
  gender_target TEXT DEFAULT 'all',                  -- all, male, female
  image_url TEXT,
  is_popular INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,

  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 스타일리스트 ───
CREATE TABLE IF NOT EXISTS stylists (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL REFERENCES shops(id),
  name TEXT NOT NULL,
  title TEXT,                                        -- 원장/수석디자이너/디자이너/인턴
  profile_photo TEXT,
  career_years INTEGER,
  specialties TEXT DEFAULT '[]',                     -- JSON: ["발레야쥬","남성커트"]
  awards TEXT DEFAULT '[]',                          -- JSON: [{year, title, org}]
  certifications TEXT DEFAULT '[]',                  -- JSON: ["미용사1급","두피관리사"]
  introduction_ko TEXT,
  introduction_zh TEXT,
  portfolio_photos TEXT DEFAULT '[]',                -- JSON: [{url, caption, service_type}]
  services TEXT DEFAULT '[]',                        -- 담당 가능 서비스 ID 목록

  -- 차등 가격
  rank_surcharge INTEGER DEFAULT 0,                  -- 직급 추가금 (₩)

  -- 스케줄
  work_schedule TEXT DEFAULT '[]',                   -- JSON: [{day:0-6, start, end}]
  color TEXT DEFAULT '#111111',                      -- 캘린더 색상

  -- 중국인 특화
  chinese_available INTEGER DEFAULT 0,
  instagram_url TEXT,
  xiaohongshu_url TEXT,

  -- 통계
  rating REAL DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,

  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 고객 ───
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                                -- 원어 이름
  name_en TEXT,
  phone TEXT,
  email TEXT,
  lang TEXT DEFAULT 'ZH',
  country_code TEXT,                                 -- CN, JP, US...

  -- 인증
  passport_verified INTEGER DEFAULT 0,
  alipay_user_id TEXT,
  wechat_openid TEXT,

  -- 통계
  total_visits INTEGER DEFAULT 0,
  total_spent_krw INTEGER DEFAULT 0,
  noshow_count INTEGER DEFAULT 0,
  last_visit_date TEXT,
  first_visit_date TEXT,

  -- 세그먼트 (자동 계산)
  segment TEXT DEFAULT 'new',                        -- new, returning, vip, dormant
  preferred_stylist_id TEXT,

  -- 상태
  is_blocked INTEGER DEFAULT 0,
  blocked_reason TEXT,
  memo TEXT,                                         -- 관리자 메모 (알레르기 등)

  -- 포인트/쿠폰
  points INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ─── 예약 ───
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  reservation_no TEXT UNIQUE NOT NULL,               -- N-MMDD-NNN
  shop_id TEXT NOT NULL REFERENCES shops(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  stylist_id TEXT REFERENCES stylists(id),

  -- 서비스
  services TEXT NOT NULL DEFAULT '[]',               -- JSON: [{service_id, name_ko, name_zh, duration, price_krw, price_cny}]
  total_price_krw INTEGER NOT NULL,
  total_price_cny INTEGER NOT NULL,
  total_duration INTEGER NOT NULL,

  -- 일시
  date TEXT NOT NULL,
  time TEXT NOT NULL,

  -- 결제
  deposit_cny INTEGER NOT NULL,
  deposit_krw INTEGER NOT NULL,
  deposit_rate REAL DEFAULT 0.30,
  payment_method TEXT NOT NULL,                      -- alipay, wechat, card
  payment_id TEXT,                                   -- Antom 거래 ID
  deposit_paid_at TEXT,

  -- 상태
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending → confirmed → completed
  -- pending → cancelled
  -- confirmed → noshow
  -- confirmed → cancelled

  -- 유형
  booking_type TEXT DEFAULT 'service',               -- service, consultation (첫방문 상담)

  -- 쿠폰/할인
  coupon_id TEXT,
  discount_amount_cny INTEGER DEFAULT 0,
  points_used INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,

  -- 메모
  customer_lang TEXT DEFAULT 'ZH',
  customer_note TEXT,
  shop_note TEXT,

  -- 타임스탬프
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  confirmed_at TEXT,
  completed_at TEXT,
  cancelled_at TEXT,
  cancelled_by TEXT,                                 -- customer, merchant, system
  cancel_reason TEXT,
  noshow_at TEXT,

  -- 환불
  refund_amount_cny INTEGER DEFAULT 0,
  refund_status TEXT,                                -- processing, completed, failed

  -- 예약 변경 이력
  modified_from TEXT                                 -- 이전 예약 ID (변경 시)
);

-- ─── 리뷰 ───
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL REFERENCES shops(id),
  stylist_id TEXT REFERENCES stylists(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  reservation_id TEXT REFERENCES reservations(id),

  -- 평점
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rating_result INTEGER CHECK (rating_result BETWEEN 1 AND 5),     -- 시술 만족도
  rating_value INTEGER CHECK (rating_value BETWEEN 1 AND 5),       -- 가성비
  rating_clean INTEGER CHECK (rating_clean BETWEEN 1 AND 5),       -- 청결/분위기
  rating_friendly INTEGER CHECK (rating_friendly BETWEEN 1 AND 5), -- 친절도
  rating_consult INTEGER CHECK (rating_consult BETWEEN 1 AND 5),   -- 상담 만족도

  -- 내용
  content TEXT,
  photos TEXT DEFAULT '[]',                          -- JSON: [{url}]
  service_name TEXT,                                 -- 이용한 서비스명
  visit_date TEXT,

  -- 인증
  is_verified INTEGER DEFAULT 0,                     -- 예약자 인증 리뷰
  helpful_count INTEGER DEFAULT 0,

  -- 업주 답글
  owner_reply TEXT,
  owner_reply_at TEXT,

  -- 상태
  is_visible INTEGER DEFAULT 1,
  reported INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 쿠폰 정의 ───
CREATE TABLE IF NOT EXISTS coupon_definitions (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL REFERENCES shops(id),
  name_ko TEXT NOT NULL,
  name_zh TEXT,
  type TEXT NOT NULL,                                -- first_visit, revisit, birthday, event, service
  discount_type TEXT NOT NULL,                       -- fixed, percent
  discount_value INTEGER NOT NULL,                   -- 5000(원) or 10(%)
  min_spend_krw INTEGER DEFAULT 0,                   -- 최소 결제 금액
  applicable_services TEXT DEFAULT '[]',             -- JSON: 특정 서비스만 (빈배열=전체)
  target_segment TEXT DEFAULT 'all',                 -- all, new, returning, vip
  max_issue_count INTEGER,                           -- 최대 발급 수
  issued_count INTEGER DEFAULT 0,
  valid_days INTEGER DEFAULT 30,                     -- 발급 후 유효기간 (일)
  valid_from TEXT,
  valid_until TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 쿠폰 발급 ───
CREATE TABLE IF NOT EXISTS coupon_issued (
  id TEXT PRIMARY KEY,
  definition_id TEXT NOT NULL REFERENCES coupon_definitions(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  shop_id TEXT NOT NULL REFERENCES shops(id),
  status TEXT DEFAULT 'active',                      -- active, used, expired
  used_at TEXT,
  used_reservation_id TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 포인트 내역 ───
CREATE TABLE IF NOT EXISTS point_transactions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  shop_id TEXT REFERENCES shops(id),
  type TEXT NOT NULL,                                -- earn_payment, earn_review, spend, expire
  amount INTEGER NOT NULL,                           -- +적립 or -사용
  balance_after INTEGER NOT NULL,
  description TEXT,
  reservation_id TEXT,
  review_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 채팅 ───
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL REFERENCES shops(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  sender TEXT NOT NULL,                              -- customer, shop
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',                  -- text, image, reservation_card
  reservation_id TEXT,                               -- 예약 카드 첨부 시
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 채팅방 ───
CREATE TABLE IF NOT EXISTS chat_rooms (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL REFERENCES shops(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  last_message TEXT,
  last_message_at TEXT,
  unread_shop INTEGER DEFAULT 0,                     -- 매장 측 안 읽은 수
  unread_customer INTEGER DEFAULT 0,                 -- 고객 측 안 읽은 수
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(shop_id, customer_id)
);

-- ─── 매장 소식/이벤트 ───
CREATE TABLE IF NOT EXISTS shop_news (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL REFERENCES shops(id),
  title_ko TEXT,
  title_zh TEXT,
  content_ko TEXT,
  content_zh TEXT,
  image_url TEXT,
  type TEXT DEFAULT 'news',                          -- news, event, holiday, promotion
  event_start TEXT,
  event_end TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 알림 발송 로그 ───
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient_type TEXT NOT NULL,                      -- customer, shop, stylist
  recipient_id TEXT NOT NULL,
  type TEXT NOT NULL,                                -- booking_confirmed, reminder_d1, reminder_d0,
                                                     -- booking_cancelled, review_request, coupon_expiry,
                                                     -- new_booking (shop), new_review (shop)
  channel TEXT,                                      -- push, email, alipay, sms, kakao_alimtalk
  title TEXT,
  body TEXT,
  reservation_id TEXT,
  status TEXT DEFAULT 'pending',                     -- pending, sent, failed
  sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 정산 ───
CREATE TABLE IF NOT EXISTS settlements (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL REFERENCES shops(id),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  noshow_bookings INTEGER DEFAULT 0,
  total_revenue_krw INTEGER DEFAULT 0,
  total_deposits_cny INTEGER DEFAULT 0,
  commission_krw INTEGER DEFAULT 0,
  commission_rate REAL DEFAULT 0.10,
  payout_krw INTEGER DEFAULT 0,
  -- 스타일리스트별 매출
  revenue_by_stylist TEXT DEFAULT '[]',              -- JSON: [{stylist_id, revenue_krw, bookings}]
  -- 서비스별 매출
  revenue_by_service TEXT DEFAULT '[]',              -- JSON: [{service_name, revenue_krw, count}]
  -- 시간대별 통계
  bookings_by_hour TEXT DEFAULT '[]',                -- JSON: [{hour, count}]
  status TEXT DEFAULT 'pending',
  payout_date TEXT,
  payout_account TEXT,                               -- JSON: {bank, account_no, holder}
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 인덱스 ───
CREATE INDEX IF NOT EXISTS idx_services_shop ON services(shop_id);
CREATE INDEX IF NOT EXISTS idx_stylists_shop ON stylists(shop_id);
CREATE INDEX IF NOT EXISTS idx_reservations_shop_date ON reservations(shop_id, date);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_stylist ON reservations(stylist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop ON reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_stylist ON reviews(stylist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(shop_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_coupon_issued_customer ON coupon_issued(customer_id);
CREATE INDEX IF NOT EXISTS idx_shop_news_shop ON shop_news(shop_id);
CREATE INDEX IF NOT EXISTS idx_point_tx_customer ON point_transactions(customer_id);
