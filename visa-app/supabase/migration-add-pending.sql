-- 예약 상태에 pending 추가
-- Supabase 대시보드 SQL Editor에서 실행하세요

-- 1. 기존 status 제약 제거 후 pending 포함 버전으로 재생성
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'noshow'));
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending';

-- 2. customer_memo 컬럼 추가 (사장님 메모용)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_memo TEXT DEFAULT '';

-- 3. Realtime 활성화 (Supabase 대시보드에서도 Table Editor → bookings → Enable Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
