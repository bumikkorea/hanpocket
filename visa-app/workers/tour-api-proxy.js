/**
 * TourAPI Proxy Worker
 * - CORS 해결 + API 키 서버사이드 보관
 * - 5분 캐시
 * - Rate limiting (IP당 60req/min)
 */

const ALLOWED_ORIGINS = ['https://hanpocket.com', 'https://www.hanpocket.com', 'http://localhost:3000', 'http://172.30.1.1:3000']
const TOUR_API_BASE = 'https://apis.data.go.kr/B551011'
const RATE_LIMIT = 60 // per minute per IP

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) })
    }

    // Only allow /tour/* paths
    if (!url.pathname.startsWith('/tour/')) {
      return new Response('Not Found', { status: 404 })
    }

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const rateLimitKey = `rate:${ip}:${Math.floor(Date.now() / 60000)}`
    const count = parseInt(await env.KV?.get(rateLimitKey) || '0')
    if (count >= RATE_LIMIT) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      })
    }
    await env.KV?.put(rateLimitKey, String(count + 1), { expirationTtl: 120 })

    // Build TourAPI URL
    const service = url.searchParams.get('service') || 'ChsService2'
    const operation = url.pathname.replace('/tour/', '')
    const apiUrl = new URL(`${TOUR_API_BASE}/${service}/${operation}`)

    // Forward all query params except 'service', inject API key
    for (const [key, value] of url.searchParams) {
      if (key !== 'service') apiUrl.searchParams.set(key, value)
    }
    apiUrl.searchParams.set('serviceKey', env.TOUR_API_KEY)
    apiUrl.searchParams.set('_type', 'json')
    apiUrl.searchParams.set('MobileOS', 'ETC')
    apiUrl.searchParams.set('MobileApp', 'HanPocket')

    // Check cache
    const cache = caches.default
    const cacheKey = new Request(apiUrl.toString(), request)
    const cached = await cache.match(cacheKey)
    if (cached) {
      const resp = new Response(cached.body, cached)
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => resp.headers.set(k, v))
      return resp
    }

    // Fetch from TourAPI
    try {
      const apiResp = await fetch(apiUrl.toString())
      const body = await apiResp.text()

      const response = new Response(body, {
        status: apiResp.status,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5min
        },
      })

      // Cache successful responses
      if (apiResp.ok) {
        const cacheResp = response.clone()
        await cache.put(cacheKey, cacheResp)
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

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}
