import { createClient } from '@supabase/supabase-js'

const scraperUrl = import.meta.env.VITE_SCRAPER_SUPABASE_URL || 'https://jwnnmauwweicvdkltdao.supabase.co'
const scraperAnonKey = import.meta.env.VITE_SCRAPER_SUPABASE_ANON_KEY

if (!scraperAnonKey || scraperAnonKey === 'REPLACE_ME') {
  console.warn('[supabaseScraper] VITE_SCRAPER_SUPABASE_ANON_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.')
}

/**
 * 팝업 스크래퍼 DB 클라이언트
 * 프로젝트: jwnnmauwweicvdkltdao
 * 테이블: popup_stores (181건, dayforyou/popply/instagram 소스)
 */
export const supabaseScraper = createClient(scraperUrl, scraperAnonKey || '')
