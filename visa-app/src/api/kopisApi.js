/**
 * KOPIS API (공연예술통합전산망) Service Layer
 * http://www.kopis.or.kr/openApi/restful
 * XML 응답 → JSON 파싱
 */

const BASE_URL = 'http://www.kopis.or.kr/openApi/restful'
const API_KEY = import.meta.env.VITE_KOPIS_API_KEY

// 장르코드
export const GENRE_CODES = {
  AAAA: { ko: '연극', zh: '话剧', en: 'Theater' },
  BBBC: { ko: '뮤지컬', zh: '音乐剧', en: 'Musical' },
  CCCA: { ko: '클래식', zh: '古典音乐', en: 'Classical' },
  CCCC: { ko: '국악', zh: '韩国传统音乐', en: 'Korean Traditional' },
  EEEA: { ko: '대중음악', zh: '流行音乐', en: 'Pop Music' },
  EEEB: { ko: '복합', zh: '综合', en: 'Mixed' },
}

// 캐시 (sessionStorage, 1시간)
const CACHE_TTL = 60 * 60 * 1000

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(`kopis_${key}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts < CACHE_TTL) return data
    sessionStorage.removeItem(`kopis_${key}`)
  } catch { /* ignore */ }
  return null
}

function setCache(key, data) {
  try {
    sessionStorage.setItem(`kopis_${key}`, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* storage full 등 무시 */ }
}

// XML → JSON 파싱 (DOMParser)
function parseXmlList(xmlText) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  const items = doc.querySelectorAll('db')
  return Array.from(items).map(db => ({
    mt20id: db.querySelector('mt20id')?.textContent || '',
    prfnm: db.querySelector('prfnm')?.textContent || '',
    prfpdfrom: db.querySelector('prfpdfrom')?.textContent || '',
    prfpdto: db.querySelector('prfpdto')?.textContent || '',
    fcltynm: db.querySelector('fcltynm')?.textContent || '',
    poster: db.querySelector('poster')?.textContent || '',
    genrenm: db.querySelector('genrenm')?.textContent || '',
    prfstate: db.querySelector('prfstate')?.textContent || '',
    openrun: db.querySelector('openrun')?.textContent || '',
  }))
}

function parseXmlDetail(xmlText) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  const db = doc.querySelector('db')
  if (!db) return null

  const styurls = Array.from(db.querySelectorAll('styurl')).map(el => el.textContent)

  return {
    mt20id: db.querySelector('mt20id')?.textContent || '',
    prfnm: db.querySelector('prfnm')?.textContent || '',
    prfpdfrom: db.querySelector('prfpdfrom')?.textContent || '',
    prfpdto: db.querySelector('prfpdto')?.textContent || '',
    fcltynm: db.querySelector('fcltynm')?.textContent || '',
    prfcast: db.querySelector('prfcast')?.textContent || '',
    prfcrew: db.querySelector('prfcrew')?.textContent || '',
    prfruntime: db.querySelector('prfruntime')?.textContent || '',
    prfage: db.querySelector('prfage')?.textContent || '',
    pcseguidance: db.querySelector('pcseguidance')?.textContent || '',
    poster: db.querySelector('poster')?.textContent || '',
    sty: db.querySelector('sty')?.textContent || '',
    genrenm: db.querySelector('genrenm')?.textContent || '',
    prfstate: db.querySelector('prfstate')?.textContent || '',
    dtguidance: db.querySelector('dtguidance')?.textContent || '',
    relates: Array.from(db.querySelectorAll('relate')).map(rel => ({
      relatenm: rel.querySelector('relatenm')?.textContent || '',
      relateurl: rel.querySelector('relateurl')?.textContent || '',
    })),
    styurls,
  }
}

// 날짜 포맷 (yyyyMMdd)
function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

/**
 * 공연목록 조회
 * @param {Object} params
 * @param {string} [params.stdate] - 시작일 (yyyyMMdd), 기본 오늘
 * @param {string} [params.eddate] - 종료일 (yyyyMMdd), 기본 +30일
 * @param {string} [params.shcate] - 장르코드 (AAAA, BBBC 등)
 * @param {string} [params.signgucode] - 지역코드 (11: 서울)
 * @param {number} [params.cpage] - 페이지, 기본 1
 * @param {number} [params.rows] - 행 수, 기본 20
 */
export async function fetchPerformances(params = {}) {
  const today = new Date()
  const monthLater = new Date(today)
  monthLater.setDate(monthLater.getDate() + 30)

  const queryParams = {
    stdate: params.stdate || formatDate(today),
    eddate: params.eddate || formatDate(monthLater),
    cpage: params.cpage || 1,
    rows: params.rows || 20,
    signgucode: params.signgucode || '11',
    ...(params.shcate ? { shcate: params.shcate } : {}),
  }

  const cacheKey = `list_${JSON.stringify(queryParams)}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  if (!API_KEY) {
    console.warn('[KOPIS] API 키 없음 — 폴백 데이터 사용')
    return FALLBACK_PERFORMANCES
  }

  try {
    const url = new URL(`${BASE_URL}/pblprfr`)
    url.searchParams.set('service', API_KEY)
    Object.entries(queryParams).forEach(([k, v]) => url.searchParams.set(k, v))

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xmlText = await res.text()
    const data = parseXmlList(xmlText)

    if (data.length > 0) {
      setCache(cacheKey, data)
    }
    return data.length > 0 ? data : FALLBACK_PERFORMANCES
  } catch (err) {
    console.error('[KOPIS] 공연목록 조회 실패:', err)
    return FALLBACK_PERFORMANCES
  }
}

/**
 * 공연상세 조회
 * @param {string} id - 공연 ID (mt20id)
 */
export async function fetchPerformanceDetail(id) {
  if (!id) return null

  const cacheKey = `detail_${id}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  if (!API_KEY) {
    console.warn('[KOPIS] API 키 없음 — 폴백 상세 데이터 사용')
    const fallback = FALLBACK_PERFORMANCES.find(p => p.mt20id === id)
    return fallback ? { ...fallback, sty: '', prfcast: '', pcseguidance: '', prfruntime: '', relates: [], styurls: [] } : null
  }

  try {
    const url = new URL(`${BASE_URL}/pblprfr/${id}`)
    url.searchParams.set('service', API_KEY)

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xmlText = await res.text()
    const data = parseXmlDetail(xmlText)

    if (data) {
      setCache(cacheKey, data)
    }
    return data
  } catch (err) {
    console.error('[KOPIS] 공연상세 조회 실패:', err)
    return null
  }
}

// 폴백 데이터 — 서울 인기 공연 5개
const FALLBACK_PERFORMANCES = [
  {
    mt20id: 'PF_FALLBACK_01',
    prfnm: '오페라의 유령',
    prfpdfrom: '2026.01.09',
    prfpdto: '2026.06.28',
    fcltynm: '블루스퀘어 신한카드홀',
    poster: 'https://www.kopis.or.kr/upload/pfmPoster/PF_PF254697_250108_135616.gif',
    genrenm: '뮤지컬',
    prfstate: '공연중',
    openrun: 'N',
  },
  {
    mt20id: 'PF_FALLBACK_02',
    prfnm: '시카고',
    prfpdfrom: '2026.02.01',
    prfpdto: '2026.05.31',
    fcltynm: 'D-큐브 링크아트센터',
    poster: '',
    genrenm: '뮤지컬',
    prfstate: '공연중',
    openrun: 'N',
  },
  {
    mt20id: 'PF_FALLBACK_03',
    prfnm: '난타',
    prfpdfrom: '2006.01.01',
    prfpdto: '2026.12.31',
    fcltynm: '명동난타극장',
    poster: '',
    genrenm: '복합',
    prfstate: '공연중',
    openrun: 'Y',
  },
  {
    mt20id: 'PF_FALLBACK_04',
    prfnm: '서울시향 정기연주회',
    prfpdfrom: '2026.03.15',
    prfpdto: '2026.03.15',
    fcltynm: '세종문화회관 대극장',
    poster: '',
    genrenm: '클래식',
    prfstate: '공연예정',
    openrun: 'N',
  },
  {
    mt20id: 'PF_FALLBACK_05',
    prfnm: '데스노트',
    prfpdfrom: '2026.03.01',
    prfpdto: '2026.05.25',
    fcltynm: 'LG아트센터 서울',
    poster: '',
    genrenm: '뮤지컬',
    prfstate: '공연중',
    openrun: 'N',
  },
]
