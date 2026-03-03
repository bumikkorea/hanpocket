/**
 * 인천공항 여객편 운항현황 API
 * Incheon Airport Passenger Flight Status (multilingual)
 * lang=C (中文) primary → lang=K (한국어) fallback
 *
 * 일일 1,000건 제한 — 5분 캐시 + 클라이언트 카운터
 */

const BASE_URL = 'https://apis.data.go.kr/B551177/StatusOfPassengerFlightsOd498'
const API_KEY = import.meta.env.VITE_AIRPORT_API_KEY

// In-memory cache (5min TTL) — tourApi.js 패턴 동일
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

function getCached(key) {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data
  cache.delete(key)
  return null
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() })
  if (cache.size > 200) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)
    for (let i = 0; i < 50; i++) cache.delete(oldest[i][0])
  }
}

// 일일 요청 카운터 (in-memory, 페이지 리로드 시 리셋)
let dailyCount = 0
let lastResetDate = new Date().toDateString()
const DAILY_LIMIT = 1000
const DAILY_WARN = 900

function checkDailyLimit() {
  const today = new Date().toDateString()
  if (today !== lastResetDate) {
    dailyCount = 0
    lastResetDate = today
  }
  if (dailyCount >= DAILY_LIMIT) return { exceeded: true, warning: true }
  if (dailyCount >= DAILY_WARN) return { exceeded: false, warning: true }
  return { exceeded: false, warning: false }
}

async function fetchFlightApi(endpoint, params = {}, { lang = 'C', retries = 2 } = {}) {
  const limit = checkDailyLimit()
  if (limit.exceeded) {
    return { items: [], totalCount: 0, error: 'DAILY_LIMIT_EXCEEDED', limitWarning: true }
  }

  const url = new URL(`${BASE_URL}/${endpoint}`)
  const allParams = {
    serviceKey: API_KEY,
    type: 'json',
    lang,
    numOfRows: 10,
    pageNo: 1,
    ...params,
  }
  Object.entries(allParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })

  const cacheKey = url.toString()
  const cached = getCached(cacheKey)
  if (cached) return { ...cached, limitWarning: limit.warning }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      const header = json?.response?.header
      if (header?.resultCode && header.resultCode !== '00') {
        throw new Error(`API ${header.resultCode}: ${header.resultMsg}`)
      }

      const body = json?.response?.body
      const rawItems = body?.items || []
      const items = Array.isArray(rawItems) ? rawItems : [rawItems]

      const result = {
        items,
        totalCount: body?.totalCount || items.length,
        limitWarning: limit.warning,
      }

      dailyCount++
      setCache(cacheKey, result)
      return result
    } catch (err) {
      // 마지막 재시도에서 중국어 실패 → 한국어 폴백
      if (attempt === retries && lang === 'C') {
        console.warn('[AirportAPI] Chinese failed, fallback to Korean:', err.message)
        return fetchFlightApi(endpoint, params, { lang: 'K', retries: 1 })
      }
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
      } else {
        console.error(`[AirportAPI] ${endpoint} failed:`, err)
        return { items: [], totalCount: 0, error: err.message, limitWarning: limit.warning }
      }
    }
  }
}

/** 도착편 조회 */
export async function getArrivals(params = {}) {
  return fetchFlightApi('getPassengerArrivals', params)
}

/** 출발편 조회 */
export async function getDepartures(params = {}) {
  return fetchFlightApi('getPassengerDepartures', params)
}

/**
 * 편명으로 도착+출발 동시 검색 (오늘 + 내일 새벽, 자정 넘는 항공편 대응)
 * @param {string} flightId - 편명 (예: 'KE123')
 * @returns {{ arrivals: [], departures: [], limitWarning: boolean }}
 */
export async function searchFlight(flightId) {
  const id = flightId.toUpperCase().replace(/\s+/g, '')

  // 오늘 전체 + 내일 새벽(00:00~06:00) 조회 → 자정 넘는 편 대응
  const [arrToday, depToday, arrEarly, depEarly] = await Promise.all([
    getArrivals({ flight_id: id }),
    getDepartures({ flight_id: id }),
    getArrivals({ flight_id: id, from_time: '0000', to_time: '0600' }),
    getDepartures({ flight_id: id, from_time: '0000', to_time: '0600' }),
  ])

  // 중복 제거: flightId + scheduleDateTime 기준
  const dedup = (items) => {
    const seen = new Set()
    return items.filter(item => {
      const key = `${item.flightId}-${item.scheduleDateTime}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  return {
    arrivals: dedup([...(arrToday.items || []), ...(arrEarly.items || [])]),
    departures: dedup([...(depToday.items || []), ...(depEarly.items || [])]),
    limitWarning: arrToday.limitWarning || depToday.limitWarning || arrEarly.limitWarning || depEarly.limitWarning,
    error: arrToday.error || depToday.error || arrEarly.error || depEarly.error || null,
  }
}

/** 남은 일일 조회 횟수 */
export function getRemainingRequests() {
  const today = new Date().toDateString()
  if (today !== lastResetDate) return DAILY_LIMIT
  return Math.max(0, DAILY_LIMIT - dailyCount)
}
