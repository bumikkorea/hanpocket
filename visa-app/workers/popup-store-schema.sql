CREATE TABLE IF NOT EXISTS popups (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ko       TEXT NOT NULL,
  name_zh       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  lat           REAL NOT NULL,
  lng           REAL NOT NULL,
  floor_ko      TEXT DEFAULT '',
  floor_zh      TEXT DEFAULT '',
  floor_en      TEXT DEFAULT '',
  period        TEXT DEFAULT '',
  emoji         TEXT DEFAULT '📌',
  color         TEXT DEFAULT '#6366F1',
  location_name TEXT DEFAULT '',
  is_active     INTEGER DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 초기 데이터 (더현대 서울 현재 팝업)
INSERT INTO popups (name_ko, name_zh, name_en, lat, lng, floor_ko, floor_zh, floor_en, period, emoji, color, location_name) VALUES
('명탐정 코난 벚꽃 팝업', '名侦探柯南樱花快闪店', 'Detective Conan Popup', 37.52590, 126.92870, '5층', '5楼', '5F', '~ 3/22', '🌸', '#FF6B9D', '더현대 서울'),
('PLAVE WAY 4 LUV 팝업', 'PLAVE WAY 4 LUV 快闪店', 'PLAVE Popup', 37.52600, 126.92890, '5층 에픽 서울', '5楼 Epic Seoul', '5F Epic Seoul', '~ 3/17', '🎤', '#7C3AED', '더현대 서울'),
('DUNST 팝업', 'DUNST 快闪店', 'DUNST Popup', 37.52570, 126.92850, 'B2 아이코닉 팝업존', 'B2 标志性快闪区', 'B2 Iconic Zone', '~ 3/18', '👗', '#059669', '더현대 서울'),
('나 이거 유튜브에서 봄! 팝업', '我在YouTube上看到的! 快闪店', 'YouTube Creator Popup', 37.52580, 126.92860, 'B2 아이코닉존', 'B2 标志性区', 'B2 Iconic Zone', '3/14 ~ 3/27', '📺', '#DC2626', '더현대 서울');
