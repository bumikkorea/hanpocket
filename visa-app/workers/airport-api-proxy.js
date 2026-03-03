/**
 * Incheon Airport Flight API Proxy Worker
 * - CORS 처리 + 서버사이드 API 키
 * - Cloudflare Cache API (5분 TTL)
 * - IP 기반 Rate Limiting (60/min)
 */

const ALLOWED_ORIGINS = [
  'https://hanpocket.com',
  'https://www.hanpocket.com',
  'http://localhost:3000',
  'http://172.30.1.1:3000',
]

const AIRPORT_API_BASE = 'https://apis.data.go.kr/B551177/StatusOfPassengerFlightsOd498'
const RATE_LIMIT = 60

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) })
    }

    // Path validation: /airport/getPassengerArrivals or /airport/getPassengerDepartures
    if (!url.pathname.startsWith('/airport/')) {
      return new Response('Not Found', { status: 404 })
    }

    // Rate limiting (IP per minute)
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

    // Build upstream API URL
    const operation = url.pathname.replace('/airport/', '')
    const apiUrl = new URL(`${AIRPORT_API_BASE}/${operation}`)

    // Forward query params + inject API key
    for (const [key, value] of url.searchParams) {
      apiUrl.searchParams.set(key, value)
    }
    apiUrl.searchParams.set('serviceKey', env.AIRPORT_API_KEY)
    apiUrl.searchParams.set('type', 'json')

    // Check Cloudflare Cache
    const cfCache = caches.default
    const cacheKey = new Request(apiUrl.toString(), request)
    const cached = await cfCache.match(cacheKey)
    if (cached) {
      const resp = new Response(cached.body, cached)
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => resp.headers.set(k, v))
      return resp
    }

    // Fetch from upstream
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

      if (apiResp.ok) {
        await cfCache.put(cacheKey, response.clone())
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
