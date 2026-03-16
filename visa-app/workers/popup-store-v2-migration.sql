-- ============================================================
-- HanPocket Popup DB v2 Migration
-- Cloudflare D1 (SQLite) — ALTER TABLE only, no DROP
-- ============================================================

-- ── 기존 popups 테이블에 컬럼 추가 ──────────────────────────
ALTER TABLE popups ADD COLUMN slug                    TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN external_id             TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN brand                   TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN title_ko                TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN title_zh                TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN title_en                TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN description_ko          TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN description_zh          TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN description_en          TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN venue_type              TEXT    DEFAULT 'hotplace';
ALTER TABLE popups ADD COLUMN popup_type              TEXT    DEFAULT 'other';
ALTER TABLE popups ADD COLUMN district                TEXT    DEFAULT 'other';
ALTER TABLE popups ADD COLUMN venue_name              TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN address_ko              TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN address_zh              TEXT    DEFAULT '';
-- floor_en already exists (skipped)
ALTER TABLE popups ADD COLUMN start_date              TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN end_date                TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN open_time               TEXT    DEFAULT '10:00';
ALTER TABLE popups ADD COLUMN close_time              TEXT    DEFAULT '20:00';
ALTER TABLE popups ADD COLUMN closed_days             TEXT    DEFAULT '[]';
ALTER TABLE popups ADD COLUMN open_holiday            INTEGER DEFAULT 1;
ALTER TABLE popups ADD COLUMN entry_type              TEXT    DEFAULT 'free';
ALTER TABLE popups ADD COLUMN entry_fee_krw           INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN reservation_url         TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN daily_capacity          INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN daily_visitor_estimate  INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN queue_info_ko           TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN queue_info_zh           TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN payment_alipay          INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN payment_wechatpay       INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN payment_unionpay        INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN payment_card            INTEGER DEFAULT 1;
ALTER TABLE popups ADD COLUMN payment_cash            INTEGER DEFAULT 1;
ALTER TABLE popups ADD COLUMN chinese_staff           INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN chinese_signage         INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN chinese_brochure        INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN tax_refund_available    INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN tax_refund_min_krw      INTEGER DEFAULT 30000;
ALTER TABLE popups ADD COLUMN duty_free_eligible      INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN cn_sns_tag_zh           TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN cover_image             TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN images                  TEXT    DEFAULT '[]';
ALTER TABLE popups ADD COLUMN thumbnail               TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN tags_ko                 TEXT    DEFAULT '[]';
ALTER TABLE popups ADD COLUMN tags_zh                 TEXT    DEFAULT '[]';
ALTER TABLE popups ADD COLUMN source_type             TEXT    DEFAULT 'manual';
ALTER TABLE popups ADD COLUMN source_url              TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN source_xhs              TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN source_douyin           TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN source_instagram        TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN official_url            TEXT    DEFAULT '';
ALTER TABLE popups ADD COLUMN is_hot                  INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN is_verified             INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN is_sponsored            INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN is_expired              INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN wishlist_count          INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN view_count              INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN check_in_count          INTEGER DEFAULT 0;
ALTER TABLE popups ADD COLUMN expires_processed_at    DATETIME;

-- 기존 샘플 4개 — title_ko/venue_name slug 세팅
UPDATE popups SET
  title_ko   = name_ko,
  title_zh   = name_zh,
  title_en   = name_en,
  venue_name = COALESCE(location_name, '더현대 서울'),
  venue_type = 'department_store',
  district   = 'yeouido',
  start_date = '2026-03-01',
  end_date   = '2026-03-27',
  brand      = name_ko,
  slug       = 'sample-' || CAST(id AS TEXT)
WHERE title_ko = '';

-- ── 신규 테이블: popup_venues (장소 마스터) ──────────────────
CREATE TABLE IF NOT EXISTS popup_venues (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  slug              TEXT UNIQUE NOT NULL,
  name_ko           TEXT NOT NULL,
  name_zh           TEXT DEFAULT '',
  name_en           TEXT DEFAULT '',
  venue_type        TEXT NOT NULL DEFAULT 'department_store',
  district          TEXT NOT NULL DEFAULT 'other',
  address_ko        TEXT NOT NULL DEFAULT '',
  address_zh        TEXT DEFAULT '',
  lat               REAL NOT NULL DEFAULT 0,
  lng               REAL NOT NULL DEFAULT 0,
  cover_image       TEXT DEFAULT '',
  website           TEXT DEFAULT '',
  naver_map_url     TEXT DEFAULT '',
  kakao_map_url     TEXT DEFAULT '',
  parking_available INTEGER DEFAULT 0,
  parking_fee_ko    TEXT DEFAULT '',
  wheelchair_access INTEGER DEFAULT 0,
  default_open      TEXT DEFAULT '10:00',
  default_close     TEXT DEFAULT '20:00',
  chinese_counter   INTEGER DEFAULT 0,
  alipay_accepted   INTEGER DEFAULT 0,
  is_active         INTEGER DEFAULT 1,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 신규 테이블: popup_checkins (혼잡도/체크인) ──────────────
CREATE TABLE IF NOT EXISTS popup_checkins (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  popup_id       INTEGER NOT NULL,
  user_token     TEXT NOT NULL,
  queue_minutes  INTEGER,
  crowd_level    TEXT DEFAULT 'medium',
  comment_zh     TEXT DEFAULT '',
  checked_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (popup_id) REFERENCES popups(id) ON DELETE CASCADE
);

-- ── 신규 테이블: popup_wishlist ───────────────────────────────
CREATE TABLE IF NOT EXISTS popup_wishlist (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  popup_id    INTEGER NOT NULL,
  user_token  TEXT NOT NULL,
  added_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (popup_id, user_token),
  FOREIGN KEY (popup_id) REFERENCES popups(id) ON DELETE CASCADE
);

-- ── 신규 테이블: popup_collections + items ────────────────────
CREATE TABLE IF NOT EXISTS popup_collections (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT UNIQUE NOT NULL,
  title_ko       TEXT NOT NULL,
  title_zh       TEXT NOT NULL DEFAULT '',
  title_en       TEXT NOT NULL DEFAULT '',
  description_zh TEXT DEFAULT '',
  cover_image    TEXT DEFAULT '',
  sort_order     INTEGER DEFAULT 0,
  is_active      INTEGER DEFAULT 1,
  valid_until    TEXT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS popup_collection_items (
  collection_id  INTEGER NOT NULL,
  popup_id       INTEGER NOT NULL,
  sort_order     INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, popup_id),
  FOREIGN KEY (collection_id) REFERENCES popup_collections(id) ON DELETE CASCADE,
  FOREIGN KEY (popup_id) REFERENCES popups(id) ON DELETE CASCADE
);

-- ── 신규 테이블: popup_staging (검토 대기 큐) ─────────────────
CREATE TABLE IF NOT EXISTS popup_staging (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  data_json    TEXT NOT NULL,
  source_type  TEXT DEFAULT 'manual',
  source_url   TEXT DEFAULT '',
  status       TEXT DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected','duplicate')),
  reject_reason TEXT DEFAULT '',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at  DATETIME
);

-- ── 인덱스 ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_popups_dates      ON popups(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_popups_end_date   ON popups(end_date);
CREATE INDEX IF NOT EXISTS idx_popups_active     ON popups(is_active, is_expired);
CREATE INDEX IF NOT EXISTS idx_popups_venue_type ON popups(venue_type);
CREATE INDEX IF NOT EXISTS idx_popups_popup_type ON popups(popup_type);
CREATE INDEX IF NOT EXISTS idx_popups_district   ON popups(district);
CREATE INDEX IF NOT EXISTS idx_popups_geo        ON popups(lat, lng);
CREATE INDEX IF NOT EXISTS idx_popups_hot        ON popups(is_hot, is_active);
CREATE INDEX IF NOT EXISTS idx_checkins_popup    ON popup_checkins(popup_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlist_user     ON popup_wishlist(user_token);
CREATE INDEX IF NOT EXISTS idx_wishlist_popup    ON popup_wishlist(popup_id);

-- ── 초기 popup_venues 데이터 (수도권 주요 장소 15개) ─────────
INSERT OR IGNORE INTO popup_venues (slug, name_ko, name_zh, name_en, venue_type, district, address_ko, address_zh, lat, lng, default_open, default_close, alipay_accepted) VALUES
('thehyundai-seoul',    '더현대 서울',       '当代百货首尔',       'The Hyundai Seoul',      'department_store', 'yeouido',    '서울 영등포구 여의대로 108',     '首尔市永登浦区汝矣大路108号',   37.5260, 126.9289, '10:30', '20:00', 1),
('lotte-main',          '롯데백화점 본점',   '乐天百货总店',       'Lotte Dept Main',        'department_store', 'jongno',     '서울 중구 남대문로 81',          '首尔市中区南大门路81号',         37.5651, 126.9815, '10:30', '20:00', 1),
('shinsegae-main',      '신세계백화점 본점', '新世界百货总店',     'Shinsegae Main',         'department_store', 'jongno',     '서울 중구 소공로 63',            '首尔市中区小公路63号',           37.5606, 126.9784, '10:30', '20:00', 1),
('hyundai-apgujeong',   '현대백화점 압구정', '现代百货狎鸥亭',     'Hyundai Dept Apgujeong', 'department_store', 'gangnam',    '서울 강남구 압구정로 165',       '首尔市江南区狎鸥亭路165号',      37.5272, 127.0289, '10:30', '20:00', 0),
('galleria-west',       '갤러리아백화점 명품관', '嘉禾百货精品馆', 'Galleria WEST',          'department_store', 'gangnam',    '서울 강남구 압구정로 343',       '首尔市江南区狎鸥亭路343号',      37.5279, 127.0397, '10:30', '20:00', 0),
('coex-mall',           'COEX몰',            'COEX商场',           'COEX Mall',              'mall',             'gangnam',    '서울 강남구 영동대로 513',       '首尔市江南区永东大路513号',      37.5130, 127.0587, '10:00', '22:00', 1),
('starfield-hanam',     '스타필드 하남',     '星域广场河南',       'Starfield Hanam',        'mall',             'other',      '경기 하남시 미사대로 750',       '京畿道河南市美沙大路750号',      37.5547, 127.2050, '10:00', '22:00', 1),
('factorial-seongsu',   '팩토리얼 성수',     '工厂成水',           'Factorial Seongsu',      'popup_building',   'seongsu',    '서울 성동구 성수이로 78',        '首尔市城东区圣水二路78号',       37.5437, 127.0563, '11:00', '20:00', 0),
('scene-seongsu',       '씬 성수',           'SCENE成水',          'SCENE Seongsu',          'popup_building',   'seongsu',    '서울 성동구 서울숲2길 32',       '首尔市城东区首尔林2街32号',      37.5441, 127.0421, '11:00', '20:00', 0),
('hannam-the-hill',     '한남더힐 상권',     '汉南The Hill',       'Hannam The Hill',        'hotplace',         'hannam',     '서울 용산구 독서당로 109',       '首尔市龙山区独书堂路109号',      37.5355, 127.0052, '11:00', '21:00', 0),
('hongdae-main',        '홍대 메인거리',     '弘大主街',           'Hongdae Main St',        'hotplace',         'hongdae',    '서울 마포구 와우산로 29길',      '首尔市麻浦区卧牛山路29街',       37.5575, 126.9245, '12:00', '22:00', 0),
('seongsu-main',        '성수동 메인',       '圣水洞主街',         'Seongsu Main',           'hotplace',         'seongsu',    '서울 성동구 성수이로7길',        '首尔市城东区圣水二路7街',        37.5443, 127.0561, '11:00', '21:00', 0),
('hangang-yeouido',     '한강 여의도공원',   '汉江汝矣岛公园',     'Hangang Yeouido Park',   'hangang',          'yeouido',    '서울 영등포구 여의동로 330',     '首尔市永登浦区汝矣东路330号',    37.5284, 126.9330, '06:00', '24:00', 0),
('hangang-banpo',       '한강 반포공원',     '汉江盘浦公园',       'Hangang Banpo Park',     'hangang',          'gangnam',    '서울 서초구 신반포로11길 40',    '首尔市瑞草区新盘浦路11街40号',   37.5049, 126.9944, '06:00', '24:00', 0),
('myeongdong-main',     '명동 메인',         '明洞主街',           'Myeongdong Main',        'hotplace',         'myeongdong', '서울 중구 명동길 74',            '首尔市中区明洞街74号',           37.5635, 126.9845, '10:00', '22:00', 1);

-- ── 초기 컬렉션 ───────────────────────────────────────────────
INSERT OR IGNORE INTO popup_collections (slug, title_ko, title_zh, title_en, description_zh, sort_order) VALUES
('this-week',      '이번 주 추천',         '本周推荐',             'This Week',         '本周精选快闪店，不能错过！',             1),
('cn-friendly',    '중문 가능 팝업',       '支持中文的快闪店',     'Chinese Friendly',  '有中文服务或支持支付宝/微信支付的快闪店', 2),
('kpop-fan',       'K-POP 팬 필수',        'K-POP粉丝必去',        'K-POP Must Visit',  '爱豆周边、签名CD、限定굿즈가 있는 팝업',  3),
('closing-soon',   '곧 종료돼요',          '即将结束',             'Ending Soon',       '7天内结束的快闪店，抓紧时间！',           4),
('beauty-picks',   '뷰티 팝업 모음',       '美妆快闪精选',         'Beauty Popups',     '韩国美妆品牌限定快闪，超多免费体验！',    5),
('tax-refund',     '즉시 환급 가능',       '可退税快闪店',         'Tax Refund Ready',  '购物满额即可现场退税的快闪店',            6);
