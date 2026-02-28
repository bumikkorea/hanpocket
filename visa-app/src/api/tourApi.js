/**
 * TourAPI 4.0 Service Layer
 * 한국관광공사 중문간체(ChsService2) + 국문(KorService2) 폴백
 */

const BASE_CHS = 'https://apis.data.go.kr/B551011/ChsService2'
const BASE_KOR = 'https://apis.data.go.kr/B551011/KorService2'
const API_KEY = import.meta.env.VITE_TOUR_API_KEY

// Simple cache (5min TTL)
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
  // Evict old entries if cache grows too large
  if (cache.size > 200) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)
    for (let i = 0; i < 50; i++) cache.delete(oldest[i][0])
  }
}

async function fetchApi(endpoint, params = {}, { useChs = true, retries = 2 } = {}) {
  const base = useChs ? BASE_CHS : BASE_KOR
  const url = new URL(`${base}/${endpoint}`)

  const allParams = {
    serviceKey: API_KEY,
    MobileOS: 'ETC',
    MobileApp: 'HanPocket',
    _type: 'json',
    numOfRows: 20,
    pageNo: 1,
    ...params,
  }

  Object.entries(allParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })

  const cacheKey = url.toString()
  const cached = getCached(cacheKey)
  if (cached) return cached

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      // Check for API error
      const header = json?.response?.header
      if (header?.resultCode && header.resultCode !== '0000') {
        throw new Error(`API Error: ${header.resultCode} ${header.resultMsg}`)
      }

      const body = json?.response?.body
      const items = body?.items?.item || []
      const result = {
        items: Array.isArray(items) ? items : [items],
        totalCount: body?.totalCount || 0,
        pageNo: body?.pageNo || 1,
        numOfRows: body?.numOfRows || 20,
      }

      setCache(cacheKey, result)
      return result
    } catch (err) {
      // On last retry with CHS, try KOR fallback
      if (attempt === retries && useChs) {
        console.warn(`[TourAPI] ChsService2 failed, falling back to KorService2:`, err.message)
        return fetchApi(endpoint, params, { useChs: false, retries: 1 })
      }
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
      } else {
        console.error(`[TourAPI] ${endpoint} failed:`, err)
        return { items: [], totalCount: 0, pageNo: 1, numOfRows: 20, error: err.message }
      }
    }
  }
}

// =================== API Functions ===================

/** 지역기반 관광정보 조회 */
export async function getAreaBasedList(params = {}) {
  return fetchApi('areaBasedList2', params)
}

/** 위치기반 관광정보 조회 */
export async function getLocationBasedList({ mapX, mapY, radius = 5000, ...rest }) {
  return fetchApi('locationBasedList2', { mapX, mapY, radius, ...rest })
}

/** 키워드 검색 */
export async function searchKeyword(keyword, params = {}) {
  return fetchApi('searchKeyword2', { keyword, ...params })
}

/** 행사정보 조회 */
export async function searchFestival(eventStartDate, params = {}) {
  return fetchApi('searchFestival2', { eventStartDate, ...params })
}

/** 숙박정보 조회 */
export async function searchStay(params = {}) {
  return fetchApi('searchStay2', params)
}

/** 공통정보 조회 (상세) */
export async function getDetailCommon(contentId, contentTypeId, opts = {}) {
  return fetchApi('detailCommon2', {
    contentId,
    contentTypeId,
    defaultYN: 'Y',
    firstImageYN: 'Y',
    areacodeYN: 'Y',
    addrinfoYN: 'Y',
    mapinfoYN: 'Y',
    overviewYN: 'Y',
    ...opts,
  })
}

/** 소개정보 조회 */
export async function getDetailIntro(contentId, contentTypeId) {
  return fetchApi('detailIntro2', { contentId, contentTypeId })
}

/** 반복정보 조회 */
export async function getDetailInfo(contentId, contentTypeId) {
  return fetchApi('detailInfo2', { contentId, contentTypeId })
}

/** 이미지정보 조회 */
export async function getDetailImage(contentId, imageYN = 'Y') {
  return fetchApi('detailImage2', { contentId, imageYN })
}

/** 관광정보 동기화 목록 */
export async function getSyncList(params = {}) {
  return fetchApi('areaBasedSyncList2', params)
}

/** 법정동 코드 조회 */
export async function getLdongCode(params = {}) {
  return fetchApi('ldongCode2', params)
}

/** 분류체계 코드 조회 */
export async function getCategoryCode(params = {}) {
  return fetchApi('lclsSystmCode2', params)
}

/** 반려동물 동반여행 정보 조회 */
export async function getPetTour(contentId, contentTypeId) {
  return fetchApi('detailPetTour2', { contentId, contentTypeId })
}

// =================== Combo Fetchers ===================

/** 상세 정보 한번에 가져오기 (공통 + 소개 + 이미지) */
export async function getFullDetail(contentId, contentTypeId) {
  const [common, intro, images] = await Promise.all([
    getDetailCommon(contentId, contentTypeId),
    getDetailIntro(contentId, contentTypeId),
    getDetailImage(contentId),
  ])
  return {
    common: common.items?.[0] || {},
    intro: intro.items?.[0] || {},
    images: images.items || [],
  }
}

/** 주변 관광지 + 음식점 + 쇼핑 한번에 */
export async function getNearbyAll(mapX, mapY, radius = 3000) {
  const [spots, food, shopping] = await Promise.all([
    getLocationBasedList({ mapX, mapY, radius, contentTypeId: 76, numOfRows: 10 }),
    getLocationBasedList({ mapX, mapY, radius, contentTypeId: 82, numOfRows: 10 }),
    getLocationBasedList({ mapX, mapY, radius, contentTypeId: 79, numOfRows: 10 }),
  ])
  return { spots: spots.items, food: food.items, shopping: shopping.items }
}

export default {
  getAreaBasedList,
  getLocationBasedList,
  searchKeyword,
  searchFestival,
  searchStay,
  getDetailCommon,
  getDetailIntro,
  getDetailInfo,
  getDetailImage,
  getSyncList,
  getLdongCode,
  getCategoryCode,
  getPetTour,
  getFullDetail,
  getNearbyAll,
}
