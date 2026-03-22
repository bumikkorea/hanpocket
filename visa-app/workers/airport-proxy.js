/**
 * 인천공항 출발 항공편 Proxy Worker
 * - API 키 서버사이드 보관 (클라이언트에 노출 안됨)
 * - 5분 캐시 → 1,000명 접속해도 5분에 1회만 data.go.kr 호출
 * - CORS 처리
 */

const ALLOWED_ORIGINS = [
  'https://hanpocket.com',
  'https://www.hanpocket.com',
  'https://hanpocket.pages.dev',
  'http://localhost:3000',
  'http://172.30.1.1:3000',
]
const AIRPORT_API_BASE = 'https://apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp'
const CACHE_TTL = 300 // 5분

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) })
    }

    if (url.pathname !== '/departures') {
      return new Response('Not Found', { status: 404 })
    }

    const apiKey = env.AIRPORT_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 503,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      })
    }

    // 쿼리 파라미터 전달 (날짜, numOfRows 등)
    const searchday = url.searchParams.get('searchday') || todayKST()
    const numOfRows = url.searchParams.get('numOfRows') || '200'

    const apiUrl = `${AIRPORT_API_BASE}/getPassengerDeparturesOdp?serviceKey=${apiKey}&numOfRows=${numOfRows}&pageNo=1&searchday=${searchday}&type=json`

    // 캐시 확인 (캐시 키: 날짜+numOfRows)
    const cache = caches.default
    const cacheKey = new Request(`https://cache.airport/${searchday}/${numOfRows}`)
    const cached = await cache.match(cacheKey)
    if (cached) {
      const resp = new Response(cached.body, cached)
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => resp.headers.set(k, v))
      resp.headers.set('X-Cache', 'HIT')
      return resp
    }

    // data.go.kr 실제 호출
    try {
      const apiResp = await fetch(apiUrl)
      const body = await apiResp.text()

      const response = new Response(body, {
        status: apiResp.status,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${CACHE_TTL}`,
          'X-Cache': 'MISS',
        },
      })

      if (apiResp.ok) {
        await cache.put(cacheKey, response.clone())
      }

      return response
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      })
    }
  },
}

function todayKST() {
  // KST = UTC+9
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return now.toISOString().slice(0, 10).replace(/-/g, '')
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}
