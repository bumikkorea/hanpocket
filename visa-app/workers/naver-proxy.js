/**
 * Cloudflare Workers — 네이버 API 프록시
 * 네이버 검색 API + OAuth 토큰 교환
 * 
 * Environment Variables (Cloudflare Secrets):
 *   NAVER_CLIENT_ID = PzqPsRDvonSey7gqsGBO
 *   NAVER_CLIENT_SECRET = KpON4Cn7Ms
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // 네이버 검색 API 프록시 — /search?type=news&query=비자
      if (path === '/search') {
        const type = url.searchParams.get('type') || 'news' // news, blog, shop, image
        const query = url.searchParams.get('query')
        const display = url.searchParams.get('display') || '10'
        const start = url.searchParams.get('start') || '1'
        const sort = url.searchParams.get('sort') || 'sim' // sim(정확도) or date(최신)

        if (!query) {
          return new Response(JSON.stringify({ error: 'query parameter required' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          })
        }

        const apiUrl = `https://openapi.naver.com/v1/search/${type}?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`
        const resp = await fetch(apiUrl, {
          headers: {
            'X-Naver-Client-Id': env.NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET,
          }
        })
        const data = await resp.json()

        return new Response(JSON.stringify(data), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        })
      }

      // 네이버 OAuth 토큰 교환 — /oauth/token
      if (path === '/oauth/token') {
        const body = await request.json()
        const { code, state } = body

        if (!code) {
          return new Response(JSON.stringify({ error: 'code required' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          })
        }

        const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${env.NAVER_CLIENT_ID}&client_secret=${env.NAVER_CLIENT_SECRET}&code=${code}&state=${state}`
        const tokenResp = await fetch(tokenUrl)
        const tokenData = await tokenResp.json()

        if (tokenData.access_token) {
          // Get user profile
          const profileResp = await fetch('https://openapi.naver.com/v1/nid/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          })
          const profileData = await profileResp.json()

          return new Response(JSON.stringify({
            access_token: tokenData.access_token,
            user: profileData.response
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify(tokenData), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        })
      }

      // 파파고 번역 API — /translate
      if (path === '/translate') {
        const body = await request.json()
        const { source, target, text } = body

        const resp = await fetch('https://openapi.naver.com/v1/papago/n2mt', {
          method: 'POST',
          headers: {
            'X-Naver-Client-Id': env.NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `source=${source || 'zh-CN'}&target=${target || 'ko'}&text=${encodeURIComponent(text)}`
        })
        const data = await resp.json()

        return new Response(JSON.stringify(data), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        service: 'HanPocket Naver API Proxy',
        endpoints: ['/search', '/oauth/token', '/translate']
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    }
  }
}
