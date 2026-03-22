-- 스크래퍼 DB (jwnnmauwweicvdkltdao) popup_stores 테이블에 검수 상태 컬럼 추가
-- 실행 위치: https://supabase.com/dashboard/project/jwnnmauwweicvdkltdao/sql/new

ALTER TABLE popup_stores ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending'
  CHECK (review_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE popup_stores ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE popup_stores ADD COLUMN IF NOT EXISTS review_note TEXT;

-- 기존 데이터 전부 pending으로 초기화 (이미 DEFAULT 'pending'이지만 명시)
UPDATE popup_stores SET review_status = 'pending' WHERE review_status IS NULL;

-- 확인
SELECT review_status, COUNT(*) FROM popup_stores GROUP BY review_status;
