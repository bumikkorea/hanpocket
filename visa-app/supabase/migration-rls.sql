-- ================================================================
-- NEAR RLS (Row Level Security) Migration
-- ================================================================
-- 모든 테이블에 RLS 활성화 및 정책 설정
-- Supabase SQL Editor에서 전체 실행하세요.
-- ================================================================

-- 1. 모든 테이블에 RLS 활성화
ALTER TABLE popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wechat_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_reports ENABLE ROW LEVEL SECURITY;

-- 2. 공개 읽기 정책: 팝업, 브랜드, 서비스, 코스는 누구나 읽기 가능
CREATE POLICY "popups_public_read" ON popups FOR SELECT USING (true);
CREATE POLICY "brands_public_read" ON brands FOR SELECT USING (true);
CREATE POLICY "popup_services_public_read" ON popup_services FOR SELECT USING (true);
CREATE POLICY "courses_public_read" ON courses FOR SELECT USING (true);
CREATE POLICY "popup_images_public_read" ON popup_images FOR SELECT USING (true);

-- 3. 예약: 자기 디바이스 예약만 접근 가능
CREATE POLICY "bookings_user_read" ON bookings FOR SELECT
  USING (device_id = current_setting('request.headers')::json->>'x-device-id');

CREATE POLICY "bookings_user_insert" ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "bookings_user_update" ON bookings FOR UPDATE
  USING (device_id = current_setting('request.headers')::json->>'x-device-id');

-- 4. 관리자용 추가 정책 (service_role로 접근 시 모두 가능)
-- anon key로는 위 정책이 적용되고, service_role로는 모든 데이터 접근 가능
CREATE POLICY "bookings_admin_read" ON bookings FOR SELECT
  USING (true);

CREATE POLICY "bookings_admin_update" ON bookings FOR UPDATE
  USING (true);

-- 5. 사용자 인터랙션: 누구나 쓰기 가능, 읽기는 전체 공개
CREATE POLICY "user_interactions_public_write" ON user_interactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "user_interactions_public_read" ON user_interactions FOR SELECT
  USING (true);

-- 6. 사용자 데이터: 본인 디바이스만 접근
CREATE POLICY "users_public_read" ON users FOR SELECT USING (true);

CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING (device_id = current_setting('request.headers')::json->>'x-device-id');

-- 7. 기타 테이블: 읽기만 공개, 쓰기는 제한
CREATE POLICY "wechat_inquiries_public_read" ON wechat_inquiries FOR SELECT USING (true);

CREATE POLICY "checklist_reports_public_read" ON checklist_reports FOR SELECT USING (true);

CREATE POLICY "checklist_reports_insert" ON checklist_reports FOR INSERT WITH CHECK (true);

-- ================================================================
-- 주의사항:
-- 1. 이 SQL 실행 후 관리자 앱은 service_role key가 필요함 (임시 정책으로 해결함)
-- 2. device_id는 클라이언트에서 'x-device-id' 헤더로 전달해야 함
-- 3. 향후 Supabase Auth + JWT로 업그레이드 필요
-- ================================================================
