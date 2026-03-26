/**
 * NEAR Popup Auto-Collector (Cloudflare Worker + Cron Trigger)
 * 
 * 수집 소스:
 * 1. 네이버 블로그 검색 API — "서울 팝업스토어" 키워드로 최신 팝업 정보 추출
 * 2. 네이버 지역검색 API — 팝업명으로 좌표/주소 확보
 * 
 * 크론: 매일 09:00 KST 자동 실행
 * 결과: D1 popup_stores 테이블에 upsert
 */

const SEARCH_QUERIES = [
  '서울 팝업스토어 오픈', '성수 팝업스토어', '더현대 팝업',
  '홍대 팝업스토어', '강남 팝업스토어', '여의도 팝업',
  '잠실 팝업스토어', '명동 팝업', '팝업스토어 신규 오픈'
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 네이버 블로그 검색
async function searchBlogs(query, clientId, clientSecret) {
  const url = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=20&sort=date`;
  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

// 블로그 제목에서 팝업명 추출
function extractPopupNames(items) {
  const names = new Set();
  const stopwords = ['팝업스토어','팝업','오픈','후기','방문','리뷰','추천','서울','성수','홍대','강남','더현대','여의도','잠실','명동','2025','2026','신규','최신','이번주','지금'];
  
  for (const item of items) {
    const title = item.title.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
    // 따옴표 안의 이름 추출
    const quoted = title.match(/[「」『』""''【】\[\]]([\uac00-\ud7a3\w\s&×·]+)[」』""''】\]]/);
    if (quoted && quoted[1].length >= 2 && quoted[1].length <= 30) {
      names.add(quoted[1].trim());
      continue;
    }
    // 브랜드명 패턴: "XX 팝업스토어" → XX 추출
    const brand = title.match(/([\uac00-\ud7a3A-Za-z0-9\s&]+?)\s*팝업/);
    if (brand) {
      const name = brand[1].trim();
      if (name.length >= 2 && !stopwords.some(s => name === s)) {
        names.add(name);
      }
    }
  }
  return [...names];
}

// 네이버 지역검색으로 팝업 정보 확인
async function searchLocal(query, clientId, clientSecret) {
  const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=1&sort=comment`;
  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0] || null;
}

// D1에 upsert
async function upsertPopup(db, popup) {
  await db.prepare(`
    INSERT INTO popups (title_ko, address, lat, lng, category, source, district, is_active, updated_at)
    VALUES (?, ?, ?, ?, 'popup', 'naver_auto', ?, 1, datetime('now'))
    ON CONFLICT(title_ko, address) DO UPDATE SET
      is_active = 1, updated_at = datetime('now')
  `).bind(
    popup.name,
    popup.address,
    popup.lat,
    popup.lng,
    popup.district || 'unknown'
  ).run();
}

async function collectPopups(env) {
  const clientId = env.NAVER_CLIENT_ID;
  const clientSecret = env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { error: 'Missing Naver API credentials' };

  const allNames = new Set();
  const results = [];
  
  // Step 1: 블로그 검색으로 팝업명 수집
  for (const query of SEARCH_QUERIES) {
    const blogs = await searchBlogs(query, clientId, clientSecret);
    const names = extractPopupNames(blogs);
    names.forEach(n => allNames.add(n));
    await new Promise(r => setTimeout(r, 200));
  }

  // Step 2: 각 팝업명으로 지역검색 → 좌표/주소 확보
  for (const name of allNames) {
    const local = await searchLocal(`서울 ${name} 팝업`, clientId, clientSecret);
    if (local) {
      const cleanName = local.title.replace(/<[^>]+>/g, '');
      const addr = local.roadAddress || local.address;
      if (addr && addr.includes('서울')) {
        const popup = {
          name: cleanName,
          address: addr,
          lat: local.mapy ? (parseInt(local.mapy) / 10000000).toFixed(7) : null,
          lng: local.mapx ? (parseInt(local.mapx) / 10000000).toFixed(7) : null,
          district: addr.match(/서울[특별시\s]*([\uac00-\ud7a3]+구)/)?.[1] || 'unknown',
        };
        results.push(popup);
        
        // D1에 저장
        if (env.POPUPS_DB) {
          try { await upsertPopup(env.POPUPS_DB, popup); } catch(e) { /* skip */ }
        }
      }
    }
    await new Promise(r => setTimeout(r, 150));
  }

  return {
    searched: SEARCH_QUERIES.length,
    namesFound: allNames.size,
    popupsGeocoded: results.length,
    popups: results,
  };
}

export default {
  // HTTP 요청 (수동 트리거)
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    
    const url = new URL(request.url);
    
    if (url.pathname === '/collect') {
      const result = await collectPopups(env);
      return new Response(JSON.stringify(result, null, 2), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ status: 'ok', endpoints: ['/collect'] }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  },
  
  // Cron Trigger (자동 실행)
  async scheduled(event, env, ctx) {
    ctx.waitUntil(collectPopups(env));
  },
};
