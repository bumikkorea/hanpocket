/**
 * HanPocket Popup Parser Worker
 * 소셜미디어 URL (Instagram, 小红书, Facebook) → 팝업 정보 추출
 *
 * GET /parse?url=<encoded_url>
 *
 * 동작:
 * 1. URL에서 플랫폼 감지
 * 2. 페이지 HTML 페치 (브라우저 헤더)
 * 3. OpenGraph 메타 + 날짜/장소 패턴 추출
 * 4. JSON 반환
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// 플랫폼 감지
function detectPlatform(url) {
  const u = url.toLowerCase()
  if (u.includes('instagram.com') || u.includes('instagr.am')) return 'instagram'
  if (u.includes('xiaohongshu.com') || u.includes('xhslink.com') || u.includes('xhs.cn')) return 'xiaohongshu'
  if (u.includes('facebook.com') || u.includes('fb.com') || u.includes('fb.me')) return 'facebook'
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter'
  return 'web'
}

// 플랫폼별 색상
const PLATFORM_COLORS = {
  instagram: '#E1306C',
  xiaohongshu: '#FF2442',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  web: '#374151',
}

// OpenGraph 메타 추출
function extractOGMeta(html) {
  const meta = {}
  const ogRegex = /<meta[^>]+property="og:([^"]+)"[^>]+content="([^"]*)"[^>]*>/gi
  const twitterRegex = /<meta[^>]+name="twitter:([^"]+)"[^>]+content="([^"]*)"[^>]*>/gi
  const titleRegex = /<title[^>]*>([^<]+)<\/title>/i

  let m
  while ((m = ogRegex.exec(html)) !== null) {
    meta[`og_${m[1].replace(':', '_')}`] = decodeHTML(m[2])
  }
  while ((m = twitterRegex.exec(html)) !== null) {
    if (!meta[`og_${m[1]}`]) meta[`og_${m[1]}`] = decodeHTML(m[2])
  }
  const titleMatch = titleRegex.exec(html)
  if (titleMatch && !meta.og_title) meta.og_title = decodeHTML(titleMatch[1])

  return meta
}

// HTML 엔티티 디코딩
function decodeHTML(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
}

// 날짜 패턴 추출 (한국어/중국어/숫자 포맷)
function extractDates(text) {
  const patterns = [
    // 2026년 3월 1일 ~ 3월 31일
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*[~–—]\s*(\d{1,2})월\s*(\d{1,2})일/,
    // 3월 1일 ~ 31일
    /(\d{1,2})월\s*(\d{1,2})일\s*[~–—]\s*(\d{1,2})월?\s*(\d{1,2})일/,
    // 2026.03.01 ~ 2026.03.31
    /(\d{4})\.(\d{1,2})\.(\d{1,2})\s*[~–—]\s*(\d{4})\.(\d{1,2})\.(\d{1,2})/,
    // 03/01-03/31
    /(\d{1,2})\/(\d{1,2})\s*[-~]\s*(\d{1,2})\/(\d{1,2})/,
    // 3.1~3.31
    /(\d{1,2})\.(\d{1,2})\s*[~–—]\s*(\d{1,2})\.(\d{1,2})/,
    // 2026-03-01 ~ 2026-03-31
    /(\d{4}-\d{1,2}-\d{1,2})\s*[~–—]\s*(\d{4}-\d{1,2}-\d{1,2})/,
  ]

  const now = new Date()
  const year = now.getFullYear()

  for (const pat of patterns) {
    const m = text.match(pat)
    if (!m) continue

    try {
      if (pat.source.includes('4})\.(\d{4}')) {
        // Full date format
        return { start: m[1], end: m[4] }
      }
      if (pat === patterns[0]) {
        const sy = m[1], sm = m[2].padStart(2,'0'), sd = m[3].padStart(2,'0')
        const em = m[4].padStart(2,'0'), ed = m[5].padStart(2,'0')
        return { start: `${sy}-${sm}-${sd}`, end: `${sy}-${em}-${ed}` }
      }
      if (pat === patterns[1]) {
        const sm = m[1].padStart(2,'0'), sd = m[2].padStart(2,'0')
        const em = m[3].padStart(2,'0'), ed = m[4].padStart(2,'0')
        return { start: `${year}-${sm}-${sd}`, end: `${year}-${em}-${ed}` }
      }
      if (pat === patterns[5]) {
        return { start: m[1], end: m[2] }
      }
    } catch (_) {}
  }
  return null
}

// 주소 패턴 추출 (서울 지역)
function extractAddress(text) {
  const patterns = [
    /서울\s+[가-힣]+구\s+[가-힣\d\s\-]+\d+/,
    /[가-힣]+동\s+\d+[-\d]*/,
    /성수동|홍대|한남동|이태원|압구정|청담|강남|여의도|명동|신촌|연남동/,
  ]
  for (const pat of patterns) {
    const m = text.match(pat)
    if (m) return m[0].trim()
  }
  return null
}

// 성수/홍대/한남 등 지역 감지
function detectDistrict(text) {
  const t = text.toLowerCase()
  if (t.includes('성수') || t.includes('seongsu')) return 'seongsu'
  if (t.includes('홍대') || t.includes('연남') || t.includes('hongdae')) return 'hongdae'
  if (t.includes('한남') || t.includes('이태원') || t.includes('hannam')) return 'hannam'
  if (t.includes('압구정') || t.includes('청담') || t.includes('강남') || t.includes('gangnam')) return 'gangnam'
  if (t.includes('여의도') || t.includes('더현대') || t.includes('yeouido')) return 'yeouido'
  return 'other'
}

// 태그 추출 (키워드 기반)
function extractTags(text) {
  const keywords = {
    '패션': ['fashion', '패션', '의류', '스타일'],
    '뷰티': ['beauty', '뷰티', '화장품', '스킨케어', '메이크업'],
    'K팝': ['kpop', 'k-pop', 'idol', '아이돌', '굿즈'],
    '음식': ['food', '음식', '맛집', '디저트', '카페'],
    '럭셔리': ['luxury', '럭셔리', '명품', 'lv', 'gucci', 'chanel'],
    '게임': ['game', '게임', '팝업'],
    '아트': ['art', '아트', '전시', '갤러리'],
    '스포츠': ['nike', '나이키', 'adidas', '스포츠', '운동'],
    '캐릭터': ['캐릭터', 'character', '굿즈', 'merch'],
  }
  const found = []
  const t = text.toLowerCase()
  for (const [tag, words] of Object.entries(keywords)) {
    if (words.some(w => t.includes(w))) found.push(tag)
  }
  return found.slice(0, 4)
}

// 소셜 링크 확인용 헤더
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,zh-CN;q=0.8,en;q=0.7',
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    // GET /parse?url=<encoded>
    if (url.pathname === '/parse') {
      const targetUrl = url.searchParams.get('url')
      if (!targetUrl) {
        return json({ error: 'url parameter required' }, 400)
      }

      let resolvedUrl = targetUrl
      const platform = detectPlatform(targetUrl)

      try {
        // xhslink.com 같은 단축 URL 해결
        if (targetUrl.includes('xhslink.com') || targetUrl.includes('fb.me') || targetUrl.includes('instagr.am')) {
          const headResp = await fetch(targetUrl, {
            method: 'GET',
            headers: BROWSER_HEADERS,
            redirect: 'follow',
          })
          resolvedUrl = headResp.url
        }

        // 페이지 페치
        const resp = await fetch(resolvedUrl, {
          headers: BROWSER_HEADERS,
          redirect: 'follow',
        })

        if (!resp.ok) {
          return json({ error: `Fetch failed: ${resp.status}`, platform, sourceUrl: targetUrl })
        }

        const html = await resp.text()
        const meta = extractOGMeta(html)
        const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 5000)

        const dates = extractDates(textContent + ' ' + (meta.og_description || ''))
        const address = extractAddress(textContent + ' ' + (meta.og_description || ''))
        const allText = [meta.og_title, meta.og_description, meta.og_site_name].filter(Boolean).join(' ')
        const district = detectDistrict(allText + ' ' + textContent.slice(0, 1000))
        const tags = extractTags(allText)

        const result = {
          platform,
          sourceUrl: targetUrl,
          resolvedUrl,
          title: meta.og_title || '',
          description: meta.og_description || '',
          image: meta.og_image || meta['og_image:secure_url'] || '',
          brand: extractBrand(meta.og_title || '', meta.og_site_name || '', platform),
          address: address || '',
          district,
          period: dates || { start: '', end: '' },
          tags,
          color: PLATFORM_COLORS[platform] || '#374151',
        }

        return json(result)
      } catch (err) {
        // 페치 실패 시 부분 결과 반환 (사용자가 수동 입력)
        return json({
          platform,
          sourceUrl: targetUrl,
          error: err.message,
          title: '',
          description: '',
          image: '',
          brand: '',
          address: '',
          district: 'other',
          period: { start: '', end: '' },
          tags: [],
          color: PLATFORM_COLORS[platform] || '#374151',
        })
      }
    }

    // GET /popups/live — popga.co.kr 최신 성수 팝업 목록
    if (url.pathname === '/popups/live') {
      try {
        // 캐시 확인 (KV)
        const cacheKey = 'popups_seongsu_v1'
        if (env.KV) {
          const cached = await env.KV.get(cacheKey)
          if (cached) {
            return new Response(cached, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } })
          }
        }

        // popga.co.kr에서 실시간 데이터 시도
        const resp = await fetch('https://popga.co.kr/content/magazine/117', {
          headers: {
            ...BROWSER_HEADERS,
            'Accept': 'application/json, text/html, */*',
          }
        })

        const html = await resp.text()
        // OpenGraph에서 기본 정보만 추출 (SPA이므로 실제 목록은 JS 렌더)
        const meta = extractOGMeta(html)
        const liveData = {
          source: 'popga.co.kr',
          fetched_at: new Date().toISOString(),
          og_title: meta.og_title || '',
          og_description: meta.og_description || '',
          og_image: meta.og_image || '',
          note: 'Full list requires JS rendering. Use static data as fallback.',
        }

        const result = JSON.stringify(liveData)

        if (env.KV) {
          await env.KV.put(cacheKey, result, { expirationTtl: 21600 }) // 6시간 캐시
        }

        return new Response(result, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } })
      } catch (err) {
        return json({ error: err.message, source: 'popga.co.kr', note: 'Use static data' })
      }
    }

    return new Response('Not Found', { status: 404 })
  }
}

function extractBrand(title, site, platform) {
  // 소셜미디어 타이틀에서 브랜드명 추출 시도
  if (platform === 'instagram') {
    // "Brand Name on Instagram: ..." 패턴
    const m = title.match(/^(@?[\w.]+)\s+on Instagram/) || title.match(/^([^:]+)/)
    if (m) return m[1].replace('@', '').trim()
  }
  if (platform === 'xiaohongshu') {
    const m = title.match(/^([^|#@\n]+)/)
    if (m) return m[1].trim().slice(0, 30)
  }
  return title.slice(0, 30) || site || ''
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
