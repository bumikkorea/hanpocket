/**
 * 건강보험심사평가원 약국 API
 * 24시간 캐시 + 위치 기반 필터링
 */

const BASE_URL = 'https://apis.data.go.kr/B551182/pharmacyInfoService/getParmacyBasisList'
const SERVICE_KEY = '2496d2b4a0583b554b287697f93fdb135d8a3def4d9b3358cb5d1a49c96aa3df'

const CACHE_KEY = 'hanpocket_pharmacy_cache'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24시간

// 시도 코드 매핑
export const SIDO_CODES = {
  '서울': '110000',
  '부산': '210000',
  '대구': '220000',
  '인천': '230000',
  '광주': '240000',
  '대전': '250000',
  '울산': '260000',
  '세종': '290000',
  '경기': '310000',
  '강원': '320000',
  '충북': '330000',
  '충남': '340000',
  '전북': '350000',
  '전남': '360000',
  '경북': '370000',
  '경남': '380000',
  '제주': '390000',
}

function loadCache(sidoCd) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${sidoCd}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts < CACHE_TTL) return data
    localStorage.removeItem(`${CACHE_KEY}_${sidoCd}`)
    return null
  } catch { return null }
}

function saveCache(sidoCd, data) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${sidoCd}`, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

/**
 * 약국 리스트 조회
 * @param {{ sidoCd?: string, sgguCd?: string, numOfRows?: number, pageNo?: number }} params
 */
export async function getPharmacyList(params = {}) {
  const sidoCd = params.sidoCd || SIDO_CODES['서울']
  const cached = loadCache(sidoCd)
  if (cached && !params.sgguCd) return cached

  const url = new URL(BASE_URL)
  url.searchParams.set('serviceKey', SERVICE_KEY)
  url.searchParams.set('_type', 'json')
  url.searchParams.set('numOfRows', String(params.numOfRows || 100))
  url.searchParams.set('pageNo', String(params.pageNo || 1))
  url.searchParams.set('sidoCd', sidoCd)
  if (params.sgguCd) url.searchParams.set('sgguCd', params.sgguCd)

  try {
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const body = json?.response?.body
    const rawItems = body?.items?.item || []
    const items = Array.isArray(rawItems) ? rawItems : [rawItems]

    const result = {
      items: items.map(item => ({
        name: item.yadmNm || '',
        address: item.addr || '',
        phone: item.telno || '',
        lat: item.YPos ? parseFloat(item.YPos) : null,
        lng: item.XPos ? parseFloat(item.XPos) : null,
        sidoCd: item.sidoCdNm || '',
        sgguCd: item.sgguCdNm || '',
      })),
      totalCount: body?.totalCount || items.length,
    }

    if (!params.sgguCd) saveCache(sidoCd, result)
    return result
  } catch (err) {
    console.error('[PharmacyAPI] Failed:', err)
    return { items: [], totalCount: 0, error: err.message }
  }
}

/**
 * GPS 위치 기반 가까운 약국 필터 (이미 로드된 데이터에서)
 */
export function sortByDistance(items, lat, lng) {
  if (!lat || !lng) return items
  return items
    .map(item => {
      if (!item.lat || !item.lng) return { ...item, dist: Infinity }
      const dLat = item.lat - lat
      const dLng = item.lng - lng
      const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111000 // 대략적인 미터 변환
      return { ...item, dist: Math.round(dist) }
    })
    .sort((a, b) => a.dist - b.dist)
}
