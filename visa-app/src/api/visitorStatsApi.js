/**
 * Visitor Statistics API (Korea Tourism Organization)
 *
 * Phase 1 (MVP): KTO open data for foreign visitor stats by nationality/region
 * Phase 2 (MAU > 10K): Opt-in GPS aggregation from HanPocket users
 *
 * TODO: Register for API key: VITE_KTO_API_KEY
 * API Info: https://datalab.visitkorea.or.kr/
 */

// Mock data: realistic visitor distribution by nationality and region
const VISITOR_DATA = {
  CN: {
    name: { ko: '중국', zh: '中国', en: 'China', ja: '中国' },
    flag: '\u{1F1E8}\u{1F1F3}',
    totalMonthly: 482000,
    spots: [
      { region: 'myeongdong', name: { ko: '명동', zh: '明洞', en: 'Myeongdong', ja: '明洞' }, count: 68500, trend: 'up' },
      { region: 'hongdae', name: { ko: '홍대', zh: '弘大', en: 'Hongdae', ja: 'ホンデ' }, count: 52300, trend: 'up' },
      { region: 'dongdaemun', name: { ko: '동대문', zh: '东大门', en: 'Dongdaemun', ja: '東大門' }, count: 41200, trend: 'stable' },
      { region: 'gangnam', name: { ko: '강남', zh: '江南', en: 'Gangnam', ja: 'カンナム' }, count: 38700, trend: 'up' },
      { region: 'jeju', name: { ko: '제주', zh: '济州', en: 'Jeju', ja: '済州' }, count: 35100, trend: 'down' },
      { region: 'itaewon', name: { ko: '이태원', zh: '梨泰院', en: 'Itaewon', ja: 'イテウォン' }, count: 28400, trend: 'stable' },
      { region: 'insadong', name: { ko: '인사동', zh: '仁寺洞', en: 'Insadong', ja: '仁寺洞' }, count: 24600, trend: 'up' },
      { region: 'bukchon', name: { ko: '북촌', zh: '北村', en: 'Bukchon', ja: '北村' }, count: 21800, trend: 'stable' },
    ],
  },
  JP: {
    name: { ko: '일본', zh: '日本', en: 'Japan', ja: '日本' },
    flag: '\u{1F1EF}\u{1F1F5}',
    totalMonthly: 356000,
    spots: [
      { region: 'hongdae', name: { ko: '홍대', zh: '弘大', en: 'Hongdae', ja: 'ホンデ' }, count: 48200, trend: 'up' },
      { region: 'gangnam', name: { ko: '강남', zh: '江南', en: 'Gangnam', ja: 'カンナム' }, count: 42100, trend: 'up' },
      { region: 'itaewon', name: { ko: '이태원', zh: '梨泰院', en: 'Itaewon', ja: 'イテウォン' }, count: 35600, trend: 'stable' },
      { region: 'myeongdong', name: { ko: '명동', zh: '明洞', en: 'Myeongdong', ja: '明洞' }, count: 31400, trend: 'down' },
      { region: 'seongsu', name: { ko: '성수', zh: '圣水', en: 'Seongsu', ja: 'ソンス' }, count: 28900, trend: 'up' },
    ],
  },
  US: {
    name: { ko: '미국', zh: '美国', en: 'United States', ja: 'アメリカ' },
    flag: '\u{1F1FA}\u{1F1F8}',
    totalMonthly: 198000,
    spots: [
      { region: 'itaewon', name: { ko: '이태원', zh: '梨泰院', en: 'Itaewon', ja: 'イテウォン' }, count: 32100, trend: 'stable' },
      { region: 'gangnam', name: { ko: '강남', zh: '江南', en: 'Gangnam', ja: 'カンナム' }, count: 28400, trend: 'up' },
      { region: 'hongdae', name: { ko: '홍대', zh: '弘大', en: 'Hongdae', ja: 'ホンデ' }, count: 24800, trend: 'up' },
      { region: 'jongno', name: { ko: '종로', zh: '钟路', en: 'Jongno', ja: 'チョンノ' }, count: 18500, trend: 'stable' },
      { region: 'busan', name: { ko: '부산', zh: '釜山', en: 'Busan', ja: '釜山' }, count: 15200, trend: 'up' },
    ],
  },
  TW: {
    name: { ko: '대만', zh: '台湾', en: 'Taiwan', ja: '台湾' },
    flag: '\u{1F1F9}\u{1F1FC}',
    totalMonthly: 145000,
    spots: [
      { region: 'myeongdong', name: { ko: '명동', zh: '明洞', en: 'Myeongdong', ja: '明洞' }, count: 22400, trend: 'stable' },
      { region: 'hongdae', name: { ko: '홍대', zh: '弘大', en: 'Hongdae', ja: 'ホンデ' }, count: 19800, trend: 'up' },
      { region: 'gangnam', name: { ko: '강남', zh: '江南', en: 'Gangnam', ja: 'カンナム' }, count: 16500, trend: 'up' },
      { region: 'jeju', name: { ko: '제주', zh: '济州', en: 'Jeju', ja: '済州' }, count: 14200, trend: 'stable' },
      { region: 'insadong', name: { ko: '인사동', zh: '仁寺洞', en: 'Insadong', ja: '仁寺洞' }, count: 11800, trend: 'up' },
    ],
  },
  TH: {
    name: { ko: '태국', zh: '泰国', en: 'Thailand', ja: 'タイ' },
    flag: '\u{1F1F9}\u{1F1ED}',
    totalMonthly: 112000,
    spots: [
      { region: 'myeongdong', name: { ko: '명동', zh: '明洞', en: 'Myeongdong', ja: '明洞' }, count: 18600, trend: 'up' },
      { region: 'hongdae', name: { ko: '홍대', zh: '弘大', en: 'Hongdae', ja: 'ホンデ' }, count: 15400, trend: 'up' },
      { region: 'dongdaemun', name: { ko: '동대문', zh: '东大门', en: 'Dongdaemun', ja: '東大門' }, count: 12800, trend: 'stable' },
    ],
  },
}

// Cache
let _cache = { data: null, ts: 0 }
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetch visitor statistics by nationality
 */
export async function fetchVisitorStats(nationality = 'CN') {
  const apiKey = import.meta.env.VITE_KTO_API_KEY

  if (apiKey) {
    try {
      // TODO: Real KTO API endpoint
      const res = await fetch(
        `https://datalab.visitkorea.or.kr/api/stats/nationality?key=${apiKey}&nation=${nationality}`
      )
      if (res.ok) return await res.json()
    } catch (e) {
      console.warn('KTO API failed, using mock data:', e)
    }
  }

  return VISITOR_DATA[nationality] || VISITOR_DATA.CN
}

/**
 * Get top spots for a nationality
 */
export async function getTopSpots(nationality = 'CN', limit = 5) {
  const data = await fetchVisitorStats(nationality)
  return {
    nationality: data.name,
    flag: data.flag,
    totalMonthly: data.totalMonthly,
    spots: (data.spots || []).slice(0, limit),
    dataSource: 'KTO monthly statistics',
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Get nationality breakdown for a region
 */
export async function getNationalityBreakdown(region) {
  const result = []
  for (const [code, data] of Object.entries(VISITOR_DATA)) {
    const spot = data.spots.find(s => s.region === region)
    if (spot) {
      result.push({
        nationality: code,
        name: data.name,
        flag: data.flag,
        count: spot.count,
        trend: spot.trend,
      })
    }
  }
  return result.sort((a, b) => b.count - a.count)
}

/**
 * Get all nationalities with data
 */
export function getAllNationalities() {
  return Object.entries(VISITOR_DATA).map(([code, data]) => ({
    code,
    name: data.name,
    flag: data.flag,
    totalMonthly: data.totalMonthly,
  }))
}

export { VISITOR_DATA }
