// popup-naver.js — 네이버 블로그 팝업 자동 수집
// Cron: 월/목 09:00 KST (UTC 00:00)
// Naver Search API → 팝업 키워드 검색 → 필터링 → staging 저장

const SEARCH_QUERIES = [
  '팝업스토어 서울 2026 후기',
  '성수 팝업스토어 방문',
  '더현대 팝업 후기',
  '한남 팝업스토어 오픈',
  '홍대 팝업스토어 방문',
  '명동 팝업 오픈',
]

// ── 필터: 팝업 확실 키워드 (2개 이상 매칭돼야 통과) ──
const STRONG_SIGNALS = [
  '팝업스토어', '팝업 스토어', 'popup store', 'pop-up', '快闪店',
  '팝업 오픈', '팝업 방문', '팝업 후기', '팝업 정보',
  '팝업 일정', '팝업 위치', '팝업 예약',
]

// 팝업 장소/브랜드 키워드 (이 중 하나 + "팝업"이면 통과)
const VENUE_BRAND_SIGNALS = [
  // 장소
  '더현대', '현대백화점', '롯데백화점', '신세계', '갤러리아', '코엑스', 'COEX',
  '에비뉴엘', '스타필드', 'AK플라자', '타임스퀘어',
  '성수', '한남', '홍대', '연남', '압구정', '명동', '여의도', '이태원', '삼성동',
  '팩토리얼', '무신사', '카카오프렌즈',
  // 브랜드 (자주 팝업하는)
  'Nike', 'CHANEL', 'Dior', 'LUSH', 'aespa', 'BTS', 'BLACKPINK', 'NewJeans',
  'IVE', 'Stray Kids', '삼성', 'Galaxy', '라부부', '팝마트', 'POPMART',
  '산리오', 'Sanrio', '잔망루피', '짱구', '디즈니', 'Disney',
]

// ── 노이즈 제거: 이 키워드 포함하면 즉시 제외 ──
const NOISE_KEYWORDS = [
  '부동산', '매매', '전세', '월세', '분양', '임대', '투자',
  '대출', '금리', '보험', '재테크', '주식', '코인', '비트코인',
  '다이어트', '살빼기', '운동루틴',
  '일기', '일상기록', '월말정산', '월간정산', '한달정리',
  '사주', '타로', '운세', '도화살',
  '세탁', '수선', '클리닝',
  '맛집추천', '브런치맛집', '카페추천', '디저트맛집',
  '뉴스모음', '속보', '긴급속보',
  '채용', '이직', '면접', '합격',
]

// ── 제목 패턴 필터: 일기/잡담 제목 제외 ──
const NOISE_TITLE_PATTERNS = [
  /^\d{4}[-.]?\d{1,2}[-.]?\d{1,2}/, // "2026-03-16" 시작 = 일기
  /^\d{1,2}월\s*(일기|기록|정리|정산)/, // "3월 일기"
  /^[가-힣]{1,4}\s*[0-9]+\s*(주차|일차)/, // "3월 2주차"
  /일상|일기|회고|돌아보기|한달/, // 일상 포스트
  /쓸\s*제목/, // "쓸 제목도 없다"
  /벌써\s*\d+월/, // "벌써 3월?"
]

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCrawl(env))
  },

  async fetch(request, env) {
    const path = new URL(request.url).pathname
    if (path === '/run') {
      const result = await runCrawl(env)
      return new Response(JSON.stringify(result), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      })
    }
    return new Response('Popup Naver Crawler', { status: 200 })
  },
}

async function runCrawl(env) {
  if (!env.NAVER_CLIENT_ID || !env.NAVER_CLIENT_SECRET) {
    console.log('[Naver] API 키 없음 — 건너뜀')
    return { skipped: true, reason: 'No Naver API keys' }
  }

  let newCount = 0
  let skipped = 0
  const results = []

  for (const query of SEARCH_QUERIES) {
    try {
      const res = await fetch(
        `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=10&sort=date`,
        {
          headers: {
            'X-Naver-Client-Id': env.NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET,
          }
        }
      )
      const data = await res.json()
      if (!data.items) continue

      for (const item of data.items) {
        const title = item.title.replace(/<[^>]+>/g, '')
        const desc  = item.description.replace(/<[^>]+>/g, '')
        const text  = title + ' ' + desc
        const textLower = text.toLowerCase()

        // ── 1단계: 노이즈 키워드 필터 ──
        if (NOISE_KEYWORDS.some(k => textLower.includes(k.toLowerCase()))) {
          skipped++; continue
        }

        // ── 2단계: 제목 패턴 필터 ──
        if (NOISE_TITLE_PATTERNS.some(p => p.test(title))) {
          skipped++; continue
        }

        // ── 3단계: 팝업 관련성 스코어링 ──
        let score = 0

        // 강한 시그널 (팝업스토어, 팝업 후기 등)
        const strongHits = STRONG_SIGNALS.filter(k => textLower.includes(k.toLowerCase()))
        score += strongHits.length * 3

        // "팝업" 단독 언급 (약한 시그널)
        if (textLower.includes('팝업') || textLower.includes('popup')) score += 1

        // 장소/브랜드 매칭
        const venueBrandHits = VENUE_BRAND_SIGNALS.filter(k => textLower.includes(k.toLowerCase()))
        score += venueBrandHits.length * 2

        // 날짜 정보가 있으면 보너스 (기간이 있다 = 팝업일 확률 높음)
        if (/~\s*\d{1,2}[/.]\d{1,2}/.test(text) || /\d{1,2}월\s*\d{1,2}일\s*(까지|종료|마감)/.test(text)) {
          score += 3
        }

        // 제목에 "팝업" + 장소명 동시 → 높은 확률
        if (/팝업/.test(title) && VENUE_BRAND_SIGNALS.some(k => title.includes(k))) {
          score += 5
        }

        // 제목에 "팝업스토어" OR "팝업 후기" 없으면 감점
        if (!/(팝업스토어|팝업\s*(후기|방문|오픈|정보|일정))/.test(title)) {
          score -= 2
        }

        // "쇼룸", "플래그십" = 상시매장 (팝업 아님)
        if (/(쇼룸|플래그십|flagship|showroom)/.test(textLower)) {
          score -= 4
        }

        // 최소 스코어 8점 이상만 통과
        if (score < 8) {
          skipped++; continue
        }

        // ── 최근 7일 이내만 ──
        const pubDate = new Date(item.pubDate)
        const daysDiff = (Date.now() - pubDate.getTime()) / 86400000
        if (daysDiff > 7) continue

        // ── 중복 확인 ──
        const existing = await env.POPUPS_DB.prepare(
          'SELECT id FROM popup_staging WHERE source_url = ?'
        ).bind(item.link).first()
        if (existing) continue

        // ── 날짜 추출 ──
        const datePatterns = [
          /(\d{4})[.-](\d{1,2})[.-](\d{1,2})/g,
          /(\d{1,2})월\s*(\d{1,2})일/g,
          /~\s*(\d{1,2})\/(\d{1,2})/g,
        ]
        let end_date = ''
        for (const pattern of datePatterns) {
          const match = text.match(pattern)
          if (match) { end_date = match[0]; break }
        }

        // ── 지역 추출 ──
        const districts = {
          seongsu:    ['성수', '서울숲', '왕십리'],
          gangnam:    ['강남', '삼성동', '압구정', '청담', '도산대로'],
          hannam:     ['한남', '이태원', '경리단'],
          hongdae:    ['홍대', '합정', '연남', '망원', '상수'],
          myeongdong: ['명동', '을지로', '남대문', '충무로'],
          yeouido:    ['여의도', '더현대'],
          jongno:     ['종로', '북촌', '안국', '광화문', '인사동'],
          coex:       ['코엑스', 'coex', '삼성역'],
        }
        let district = 'other'
        for (const [d, keywords] of Object.entries(districts)) {
          if (keywords.some(k => textLower.includes(k.toLowerCase()))) {
            district = d; break
          }
        }

        const stageData = {
          title_ko: title.slice(0, 100),
          description_ko: desc.slice(0, 300),
          source_url: item.link,
          source_type: 'naver_blog',
          district,
          end_date_hint: end_date,
          pub_date: item.pubDate,
          raw_query: query,
          relevance_score: score,
        }

        await env.POPUPS_DB.prepare(
          'INSERT INTO popup_staging (data_json, source_type, source_url) VALUES (?, ?, ?)'
        ).bind(JSON.stringify(stageData), 'naver_blog', item.link).run()

        newCount++
        results.push({ title: stageData.title_ko, district, score })
      }

      await new Promise(r => setTimeout(r, 200))

    } catch (e) {
      console.error(`[Naver] 쿼리 "${query}" 오류:`, e.message)
    }
  }

  console.log(`[Naver Crawler] 신규 ${newCount}건 저장, ${skipped}건 필터링`)
  return { new_count: newCount, skipped, results }
}
