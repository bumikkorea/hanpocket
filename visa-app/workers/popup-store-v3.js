// HanPocket Popup Store API v3
// Cloudflare Worker + D1
// 3차원 설계: 리스트 필터 + 체크인 + 리뷰 + 추천
// ─────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

const isAdmin = (req, env) =>
  req.headers.get('Authorization') === `Bearer ${env.ADMIN_TOKEN}`

// cn_score 계산 (D1 트리거 없으므로 앱 레벨에서)
function calcCnScore(p) {
  return Math.min(10,
    (p.cn_alipay ? 2.0 : 0) +
    (p.cn_wechatpay ? 2.0 : 0) +
    (p.cn_staff ? 2.0 : 0) +
    (p.cn_brochure ? 1.0 : 0) +
    (p.cn_no_kr_phone_ok ? 1.5 : 0) +
    (p.has_freebies ? 0.5 : 0) +
    (p.has_photozone ? 0.5 : 0) +
    (p.tax_free ? 0.5 : 0)
  )
}

// days_left 계산
function daysLeft(end_date) {
  if (!end_date) return null
  const diff = (new Date(end_date) - new Date()) / 86400000
  return Math.max(0, Math.ceil(diff))
}

// Haversine 거리 (km)
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}


// ── 라우터 ────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })

    const url = new URL(request.url)
    const path = url.pathname
    const q = url.searchParams
    const DB = env.POPUPS_DB

    try {

      // ================================================================
      //  1. 팝업 리스트 조회 + 필터
      // ================================================================

      // ── GET /api/v3/popups — 메인 리스트 (12종 필터 + 중국인 결정 필터)
      if (request.method === 'GET' && path === '/api/v3/popups') {
        const where = []
        const binds = []

        // 상태 필터 (기본: active + 기간 내)
        const statusFilter = q.get('status') || 'active'
        if (statusFilter === 'active') {
          where.push("p.status = 'active'")
          where.push("p.start_date <= date('now','localtime')")
          where.push("(p.end_date IS NULL OR p.end_date >= date('now','localtime'))")
        } else if (statusFilter === 'upcoming') {
          where.push("p.status IN ('active','upcoming')")
          where.push("p.start_date > date('now','localtime')")
        } else if (statusFilter === 'all') {
          where.push("p.status IN ('active','upcoming','expired')")
        }

        // 카테고리 (다중 가능: category=BEAUTY,IDOL)
        if (q.get('category')) {
          const cats = q.get('category').split(',').map(c => c.trim().toUpperCase())
          where.push(`p.category IN (${cats.map(() => '?').join(',')})`)
          binds.push(...cats)
        }

        // 지역 (다중 가능)
        if (q.get('district')) {
          const dists = q.get('district').split(',').map(d => d.trim())
          where.push(`p.district IN (${dists.map(() => '?').join(',')})`)
          binds.push(...dists)
        }

        // 중국인 결정 필터
        if (q.get('cn_pay') === '1')     where.push('(p.cn_alipay = 1 OR p.cn_wechatpay = 1)')
        if (q.get('alipay') === '1')     where.push('p.cn_alipay = 1')
        if (q.get('wechatpay') === '1')  where.push('p.cn_wechatpay = 1')
        if (q.get('cn_staff') === '1')   where.push('p.cn_staff = 1')
        if (q.get('tax_free') === '1')   where.push('p.tax_free = 1')
        if (q.get('cn_no_phone') === '1') where.push('p.cn_no_kr_phone_ok = 1')

        // 입장 필터
        if (q.get('free') === '1')          where.push('p.is_free = 1')
        if (q.get('no_reservation') === '1') where.push('(p.reservation_required = 0 OR p.reservation_required IS NULL)')

        // HOT / 마감 임박
        if (q.get('hot') === '1')           where.push('p.is_hot = 1')
        if (q.get('closing_soon') === '1')  where.push("p.end_date <= date('now','localtime','+7 days') AND p.end_date >= date('now','localtime')")

        // cn_score 최소값
        if (q.get('min_cn_score')) {
          where.push('p.cn_score >= ?')
          binds.push(parseFloat(q.get('min_cn_score')))
        }

        // 키워드 검색 (이름/브랜드)
        if (q.get('q')) {
          where.push('(p.name_ko LIKE ? OR p.name_cn LIKE ? OR p.name_en LIKE ? OR p.brand_name LIKE ?)')
          const kw = `%${q.get('q')}%`
          binds.push(kw, kw, kw, kw)
        }

        // 브랜드 ID
        if (q.get('brand_id')) {
          where.push('p.brand_id = ?')
          binds.push(parseInt(q.get('brand_id')))
        }

        // 정렬
        const sortMap = {
          closing:   'p.end_date ASC',
          newest:    'p.created_at DESC',
          cn_score:  'p.cn_score DESC',
          popular:   '(p.wishlist_count + p.check_in_count + p.review_count) DESC',
          rating:    'p.avg_rating DESC',
          hot:       'p.is_hot DESC, p.super_like_count DESC, p.created_at DESC',
        }
        const sort = sortMap[q.get('sort')] || sortMap.hot

        const limit  = Math.min(parseInt(q.get('limit') || '30'), 100)
        const offset = parseInt(q.get('offset') || '0')

        const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''

        // 카운트
        const countStmt = DB.prepare(`SELECT COUNT(*) AS total FROM popups_v3 p ${whereClause}`)
        const countRow = await (binds.length > 0 ? countStmt.bind(...binds) : countStmt).first()

        // 데이터
        const dataSQL = `
          SELECT p.*,
            CASE WHEN p.end_date IS NOT NULL
              THEN CAST(julianday(p.end_date) - julianday(date('now','localtime')) AS INTEGER)
              ELSE NULL
            END AS days_left
          FROM popups_v3 p
          ${whereClause}
          ORDER BY ${sort}
          LIMIT ? OFFSET ?
        `
        const dataStmt = DB.prepare(dataSQL)
        const { results } = await (binds.length > 0
          ? dataStmt.bind(...binds, limit, offset)
          : dataStmt.bind(limit, offset)
        ).all()

        return json({
          popups: results,
          total: countRow?.total || 0,
          limit,
          offset,
          has_more: offset + limit < (countRow?.total || 0),
        })
      }


      // ── GET /api/v3/popups/map — 지도 핀 전용 (경량) ─────────

      if (request.method === 'GET' && path === '/api/v3/popups/map') {
        const where = [
          "p.status = 'active'",
          "p.start_date <= date('now','localtime')",
          "(p.end_date IS NULL OR p.end_date >= date('now','localtime'))",
          'p.lat != 0',
          'p.lng != 0',
        ]
        const binds = []

        if (q.get('category')) {
          const cats = q.get('category').split(',')
          where.push(`p.category IN (${cats.map(() => '?').join(',')})`)
          binds.push(...cats)
        }

        if (q.get('cn_pay') === '1') where.push('(p.cn_alipay = 1 OR p.cn_wechatpay = 1)')

        // 바운드 박스 필터 (지도 뷰포트)
        if (q.get('swLat') && q.get('neLat') && q.get('swLng') && q.get('neLng')) {
          where.push('p.lat BETWEEN ? AND ? AND p.lng BETWEEN ? AND ?')
          binds.push(
            parseFloat(q.get('swLat')), parseFloat(q.get('neLat')),
            parseFloat(q.get('swLng')), parseFloat(q.get('neLng'))
          )
        }

        const sql = `
          SELECT p.id, p.name_ko, p.name_cn, p.category, p.lat, p.lng,
            p.emoji, p.color, p.district, p.end_date, p.cn_score,
            p.cn_alipay, p.cn_wechatpay, p.cn_staff, p.is_hot, p.is_free,
            CASE WHEN p.end_date IS NOT NULL
              THEN CAST(julianday(p.end_date) - julianday(date('now','localtime')) AS INTEGER)
              ELSE NULL
            END AS days_left
          FROM popups_v3 p
          WHERE ${where.join(' AND ')}
          LIMIT 200
        `
        const stmt = DB.prepare(sql)
        const { results } = await (binds.length > 0 ? stmt.bind(...binds) : stmt).all()

        return json(results)
      }


      // ── GET /api/v3/popups/nearby — 현재 위치 기반 근처 팝업 ─

      if (request.method === 'GET' && path === '/api/v3/popups/nearby') {
        const lat = parseFloat(q.get('lat'))
        const lng = parseFloat(q.get('lng'))
        const radius = parseFloat(q.get('radius') || '2')  // km, 기본 2km
        if (!lat || !lng) return json({ error: 'lat, lng 필수' }, 400)

        // 대략적인 바운드 박스로 1차 필터 (성능)
        const latDelta = radius / 111
        const lngDelta = radius / (111 * Math.cos(lat * Math.PI / 180))

        const { results } = await DB.prepare(`
          SELECT *,
            CASE WHEN end_date IS NOT NULL
              THEN CAST(julianday(end_date) - julianday(date('now','localtime')) AS INTEGER)
              ELSE NULL
            END AS days_left
          FROM popups_v3
          WHERE status = 'active'
            AND start_date <= date('now','localtime')
            AND (end_date IS NULL OR end_date >= date('now','localtime'))
            AND lat BETWEEN ? AND ?
            AND lng BETWEEN ? AND ?
          ORDER BY cn_score DESC
          LIMIT 50
        `).bind(lat - latDelta, lat + latDelta, lng - lngDelta, lng + lngDelta).all()

        // 정확한 거리 계산 + 필터
        const nearby = results
          .map(p => ({ ...p, distance_km: Math.round(distKm(lat, lng, p.lat, p.lng) * 100) / 100 }))
          .filter(p => p.distance_km <= radius)
          .sort((a, b) => a.distance_km - b.distance_km)

        return json(nearby)
      }


      // ── GET /api/v3/popups/:id — 상세 조회 ──────────────────

      const detailMatch = path.match(/^\/api\/v3\/popups\/(\d+)$/)
      if (request.method === 'GET' && detailMatch) {
        const id = parseInt(detailMatch[1])

        const popup = await DB.prepare(`
          SELECT *,
            CASE WHEN end_date IS NOT NULL
              THEN CAST(julianday(end_date) - julianday(date('now','localtime')) AS INTEGER)
              ELSE NULL
            END AS days_left
          FROM popups_v3 WHERE id = ?
        `).bind(id).first()
        if (!popup) return json({ error: 'Not found' }, 404)

        // 조회수 +1
        await DB.prepare('UPDATE popups_v3 SET view_count = view_count + 1 WHERE id = ?').bind(id).run()

        // 최근 리뷰 5개
        const { results: recentReviews } = await DB.prepare(`
          SELECT rating, crowd_level, comment, lang, tags, review_tier, created_at
          FROM reviews WHERE popup_id = ? ORDER BY created_at DESC LIMIT 5
        `).bind(id).all()

        // 혼잡도 집계
        const crowdDist = await DB.prepare(`
          SELECT crowd_level, COUNT(*) AS cnt FROM reviews WHERE popup_id = ? GROUP BY crowd_level
        `).bind(id).all()

        // 반응 집계
        const reactionCounts = await DB.prepare(`
          SELECT reaction_type, COUNT(*) AS cnt FROM reactions WHERE popup_id = ? GROUP BY reaction_type
        `).bind(id).all()

        return json({
          ...popup,
          recent_reviews: recentReviews,
          crowd_distribution: Object.fromEntries((crowdDist.results || []).map(c => [c.crowd_level, c.cnt])),
          reactions: Object.fromEntries((reactionCounts.results || []).map(r => [r.reaction_type, r.cnt])),
        })
      }


      // ================================================================
      //  2. 체크인
      // ================================================================

      // ── POST /api/v3/popups/:id/checkin — 체크인 (geofence/QR/수동) ──

      const checkinMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/checkin$/)
      if (request.method === 'POST' && checkinMatch) {
        const popupId = parseInt(checkinMatch[1])
        const { user_token, method, lat, lng } = await request.json()
        if (!user_token) return json({ error: 'user_token 필수' }, 400)

        // 팝업 존재 확인
        const popup = await DB.prepare('SELECT id, category, district, lat, lng FROM popups_v3 WHERE id = ?').bind(popupId).first()
        if (!popup) return json({ error: 'Popup not found' }, 404)

        // geofence 검증: 200m 이내인지 (method=geofence일 때)
        if (method === 'geofence' && lat && lng && popup.lat && popup.lng) {
          const dist = distKm(lat, lng, popup.lat, popup.lng)
          if (dist > 0.2) return json({ error: '팝업 위치에서 200m 이상 떨어져 있습니다', distance_km: dist }, 400)
        }

        // 중복 체크 (같은 팝업 1회)
        const existing = await DB.prepare(
          'SELECT id FROM checkins_v3 WHERE user_token = ? AND popup_id = ?'
        ).bind(user_token, popupId).first()

        if (existing) {
          return json({ ok: true, already_checked_in: true, message: '이미 체크인했습니다' })
        }

        // 체크인 INSERT
        await DB.prepare(`
          INSERT INTO checkins_v3 (user_token, popup_id, method, checkin_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(user_token, popupId, method || 'manual').run()

        // 팝업 집계
        await DB.prepare('UPDATE popups_v3 SET check_in_count = check_in_count + 1 WHERE id = ?').bind(popupId).run()

        // 사용자 취향 갱신
        await DB.prepare(`
          INSERT INTO user_taste (user_token, visit_count, last_active)
          VALUES (?, 1, CURRENT_TIMESTAMP)
          ON CONFLICT(user_token) DO UPDATE SET
            visit_count = visit_count + 1,
            last_active = CURRENT_TIMESTAMP
        `).bind(user_token).run()

        // 취향 카테고리 갱신
        const taste = await DB.prepare('SELECT fav_categories, fav_districts FROM user_taste WHERE user_token = ?').bind(user_token).first()
        if (taste) {
          try {
            const cats = JSON.parse(taste.fav_categories || '[]')
            if (!cats.includes(popup.category)) {
              cats.push(popup.category)
              if (cats.length > 5) cats.shift()
            }
            const dists = JSON.parse(taste.fav_districts || '[]')
            if (popup.district && !dists.includes(popup.district)) {
              dists.push(popup.district)
              if (dists.length > 5) dists.shift()
            }
            await DB.prepare('UPDATE user_taste SET fav_categories = ?, fav_districts = ? WHERE user_token = ?')
              .bind(JSON.stringify(cats), JSON.stringify(dists), user_token).run()
          } catch {}
        }

        // 지오트리거 로그
        await DB.prepare(`
          INSERT INTO geo_triggers (user_token, popup_id, trigger_type, lat, lng)
          VALUES (?, ?, 'checkin', ?, ?)
        `).bind(user_token, popupId, lat || 0, lng || 0).run()

        return json({
          ok: true,
          popup_id: popupId,
          category: popup.category,
          district: popup.district,
        })
      }


      // ── POST /api/v3/popups/:id/checkout — 체크아웃 (체류시간 기록) ──

      const checkoutMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/checkout$/)
      if (request.method === 'POST' && checkoutMatch) {
        const popupId = parseInt(checkoutMatch[1])
        const { user_token } = await request.json()
        if (!user_token) return json({ error: 'user_token 필수' }, 400)

        const checkin = await DB.prepare(
          'SELECT id, checkin_at FROM checkins_v3 WHERE user_token = ? AND popup_id = ?'
        ).bind(user_token, popupId).first()

        if (!checkin) return json({ error: 'Not checked in' }, 400)

        const dwellMin = Math.round((Date.now() - new Date(checkin.checkin_at).getTime()) / 60000)

        await DB.prepare(`
          UPDATE checkins_v3 SET checkout_at = CURRENT_TIMESTAMP, dwell_minutes = ? WHERE id = ?
        `).bind(dwellMin, checkin.id).run()

        return json({ ok: true, dwell_minutes: dwellMin })
      }


      // ================================================================
      //  3. 리뷰 + 반응 + 보상
      // ================================================================

      // ── POST /api/v3/popups/:id/reaction — 왕좋아요 / 좋아요 ──

      const reactionMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/reaction$/)
      if (request.method === 'POST' && reactionMatch) {
        const popupId = parseInt(reactionMatch[1])
        const { user_token, reaction_type } = await request.json()
        if (!user_token || !['super_like', 'like'].includes(reaction_type))
          return json({ error: 'user_token, reaction_type(super_like|like) 필수' }, 400)

        await DB.prepare(`
          INSERT INTO reactions (user_token, popup_id, reaction_type)
          VALUES (?, ?, ?)
          ON CONFLICT(user_token, popup_id) DO UPDATE SET
            reaction_type = excluded.reaction_type,
            reacted_at = CURRENT_TIMESTAMP
        `).bind(user_token, popupId, reaction_type).run()

        // 집계
        const counts = await DB.prepare(`
          SELECT
            SUM(CASE WHEN reaction_type = 'super_like' THEN 1 ELSE 0 END) AS super_likes,
            SUM(CASE WHEN reaction_type = 'like' THEN 1 ELSE 0 END) AS likes
          FROM reactions WHERE popup_id = ?
        `).bind(popupId).first()

        await DB.prepare(
          'UPDATE popups_v3 SET super_like_count = ?, like_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(counts?.super_likes || 0, counts?.likes || 0, popupId).run()

        return json({ ok: true, reaction_type, super_likes: counts?.super_likes || 0, likes: counts?.likes || 0 })
      }


      // ── POST /api/v3/popups/:id/review — 리뷰 작성 + 보상 ──

      const reviewMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/review$/)
      if (request.method === 'POST' && reviewMatch) {
        const popupId = parseInt(reviewMatch[1])
        const body = await request.json()
        const {
          user_token, rating, crowd_level, comment,
          lang: reviewLang, photos, tags,
          review_tier, reward_type, reward_detail, reward_source,
        } = body

        if (!user_token || !rating || rating < 1 || rating > 5)
          return json({ error: 'user_token, rating(1~5) 필수' }, 400)

        // 리뷰 UPSERT
        await DB.prepare(`
          INSERT INTO reviews (
            user_token, popup_id, rating, crowd_level, comment, lang,
            photos, tags, review_tier, reward_type, reward_detail, reward_source
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_token, popup_id) DO UPDATE SET
            rating = excluded.rating, crowd_level = excluded.crowd_level,
            comment = excluded.comment, photos = excluded.photos,
            tags = excluded.tags, review_tier = excluded.review_tier,
            created_at = CURRENT_TIMESTAMP
        `).bind(
          user_token, popupId, rating,
          crowd_level || 'medium', comment || '', reviewLang || 'zh',
          JSON.stringify(photos || []), JSON.stringify(tags || []),
          review_tier || 'mini',
          reward_type || 'points', reward_detail || '', reward_source || 'system'
        ).run()

        // 팝업 집계
        const stats = await DB.prepare(`
          SELECT COUNT(*) AS cnt, ROUND(AVG(rating), 1) AS avg_r FROM reviews WHERE popup_id = ?
        `).bind(popupId).first()

        await DB.prepare(
          'UPDATE popups_v3 SET review_count = ?, avg_rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(stats?.cnt || 0, stats?.avg_r || 0, popupId).run()

        // 보상 로그
        if (reward_type) {
          await DB.prepare(`
            INSERT INTO rewards_log (user_token, popup_id, reward_type, reward_detail, reward_source)
            VALUES (?, ?, ?, ?, ?)
          `).bind(user_token, popupId, reward_type, reward_detail || '', reward_source || 'system').run()
        }

        // 사용자 취향 갱신
        await DB.prepare(`
          INSERT INTO user_taste (user_token, review_count, visit_count, last_active)
          VALUES (?, 1, 0, CURRENT_TIMESTAMP)
          ON CONFLICT(user_token) DO UPDATE SET
            review_count = review_count + 1,
            last_active = CURRENT_TIMESTAMP
        `).bind(user_token).run()

        return json({
          ok: true,
          popup_id: popupId,
          review_count: stats?.cnt || 0,
          avg_rating: stats?.avg_r || 0,
        })
      }


      // ── GET /api/v3/popups/:id/reviews — 리뷰 목록 ──────────

      const reviewsGetMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/reviews$/)
      if (request.method === 'GET' && reviewsGetMatch) {
        const popupId = parseInt(reviewsGetMatch[1])
        const limit = Math.min(parseInt(q.get('limit') || '20'), 50)
        const offset = parseInt(q.get('offset') || '0')

        const { results } = await DB.prepare(`
          SELECT rating, crowd_level, comment, lang, photos, tags, review_tier, created_at
          FROM reviews WHERE popup_id = ?
          ORDER BY created_at DESC LIMIT ? OFFSET ?
        `).bind(popupId, limit, offset).all()

        // 사진 JSON 파싱
        const parsed = results.map(r => ({
          ...r,
          photos: (() => { try { return JSON.parse(r.photos || '[]') } catch { return [] } })(),
          tags: (() => { try { return JSON.parse(r.tags || '[]') } catch { return [] } })(),
        }))

        return json(parsed)
      }


      // ================================================================
      //  4. 리뷰 후 추천 (핵심 3차원)
      // ================================================================

      // ── GET /api/v3/popups/:id/recommend — 리뷰 후 맞춤 추천 ─

      const recommendMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/recommend$/)
      if (request.method === 'GET' && recommendMatch) {
        const popupId = parseInt(recommendMatch[1])
        const userToken = q.get('user_token') || ''
        const userLat = parseFloat(q.get('lat') || '0')
        const userLng = parseFloat(q.get('lng') || '0')

        // 방금 리뷰한 팝업 정보
        const source = await DB.prepare('SELECT * FROM popups_v3 WHERE id = ?').bind(popupId).first()
        if (!source) return json({ error: 'Not found' }, 404)

        // 사용자 취향 (있으면)
        let taste = null
        if (userToken) {
          taste = await DB.prepare('SELECT * FROM user_taste WHERE user_token = ?').bind(userToken).first()
        }
        const favCats = taste ? (() => { try { return JSON.parse(taste.fav_categories || '[]') } catch { return [] } })() : []

        // ─── 1차: 같은 카테고리 팝업 (70%) ───

        const latDelta = 2 / 111  // ~2km
        const lngDelta = 2 / (111 * Math.cos((source.lat || 37.55) * Math.PI / 180))
        const baseLat = userLat || source.lat || 37.55
        const baseLng = userLng || source.lng || 126.97

        const { results: sameCat } = await DB.prepare(`
          SELECT id, name_ko, name_cn, category, district, lat, lng,
            emoji, cover_image, cn_score, is_free, end_date, walk_minutes,
            CASE WHEN end_date IS NOT NULL
              THEN CAST(julianday(end_date) - julianday(date('now','localtime')) AS INTEGER)
              ELSE NULL
            END AS days_left
          FROM popups_v3
          WHERE id != ?
            AND category = ?
            AND status = 'active'
            AND start_date <= date('now','localtime')
            AND (end_date IS NULL OR end_date >= date('now','localtime'))
            AND lat BETWEEN ? AND ?
            AND lng BETWEEN ? AND ?
          ORDER BY cn_score DESC, days_left ASC
          LIMIT 5
        `).bind(
          popupId, source.category,
          baseLat - latDelta, baseLat + latDelta,
          baseLng - lngDelta, baseLng + lngDelta
        ).all()

        // 거리 계산
        const sameCatWithDist = sameCat.map(p => ({
          ...p,
          distance_km: Math.round(distKm(baseLat, baseLng, p.lat, p.lng) * 100) / 100,
          walk_minutes_est: Math.round(distKm(baseLat, baseLng, p.lat, p.lng) / 0.08), // 5km/h 도보
          recommend_reason: 'same_category',
        })).sort((a, b) => a.distance_km - b.distance_km).slice(0, 2)


        // ─── 2차: 과거 취향 기반 다른 카테고리 (30%) ───

        let tastePicks = []
        if (favCats.length > 0) {
          const otherCats = favCats.filter(c => c !== source.category).slice(0, 2)
          if (otherCats.length > 0) {
            const placeholders = otherCats.map(() => '?').join(',')
            const { results } = await DB.prepare(`
              SELECT id, name_ko, name_cn, category, district, lat, lng,
                emoji, cover_image, cn_score, is_free, end_date,
                CASE WHEN end_date IS NOT NULL
                  THEN CAST(julianday(end_date) - julianday(date('now','localtime')) AS INTEGER)
                  ELSE NULL
                END AS days_left
              FROM popups_v3
              WHERE id != ?
                AND category IN (${placeholders})
                AND status = 'active'
                AND start_date <= date('now','localtime')
                AND (end_date IS NULL OR end_date >= date('now','localtime'))
                AND lat BETWEEN ? AND ?
                AND lng BETWEEN ? AND ?
              ORDER BY cn_score DESC
              LIMIT 3
            `).bind(
              popupId, ...otherCats,
              baseLat - latDelta, baseLat + latDelta,
              baseLng - lngDelta, baseLng + lngDelta
            ).all()

            tastePicks = results.map(p => ({
              ...p,
              distance_km: Math.round(distKm(baseLat, baseLng, p.lat, p.lng) * 100) / 100,
              walk_minutes_est: Math.round(distKm(baseLat, baseLng, p.lat, p.lng) / 0.08),
              recommend_reason: 'taste_match',
            })).slice(0, 1)
          }
        }


        // ─── 3차: 날씨 조건 반영 힌트 ───

        // 실제 날씨 API 호출 대신 시간대 기반 힌트
        const hour = new Date().getHours()
        let timeHint = 'afternoon'
        if (hour < 11) timeHint = 'morning'
        else if (hour >= 17) timeHint = 'evening'
        else if (hour >= 14) timeHint = 'late_afternoon'

        const weatherHint = q.get('weather') || 'sunny'  // 클라이언트에서 전달
        const indoorPreferred = ['rainy', 'snowy', 'cold'].includes(weatherHint)


        // ─── 응답 구성 ───

        return json({
          source_popup: {
            id: source.id,
            name_cn: source.name_cn,
            category: source.category,
            district: source.district,
          },
          recommendations: {
            same_category: sameCatWithDist,
            taste_based: tastePicks,
          },
          context: {
            time_hint: timeHint,
            weather: weatherHint,
            indoor_preferred: indoorPreferred,
            user_fav_categories: favCats,
          },
          meta: {
            same_category_reason: `方才看的${source.category}，附近还有`,
            taste_reason: tastePicks.length > 0 ? '根据你的喜好推荐' : null,
          },
        })
      }


      // ── POST /api/v3/popups/:id/geo-trigger — 지오펜스 로그 ──

      const geoMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/geo-trigger$/)
      if (request.method === 'POST' && geoMatch) {
        const { user_token, trigger_type, lat, lng } = await request.json()
        if (!user_token) return json({ error: 'user_token 필수' }, 400)

        await DB.prepare(`
          INSERT INTO geo_triggers (user_token, popup_id, trigger_type, lat, lng)
          VALUES (?, ?, ?, ?, ?)
        `).bind(user_token, parseInt(geoMatch[1]), trigger_type || 'enter', lat || 0, lng || 0).run()

        return json({ ok: true })
      }


      // ── POST /api/v3/post-review-click — 추천 클릭 추적 ─────

      if (request.method === 'POST' && path === '/api/v3/post-review-click') {
        const { user_token, source_popup, clicked_type, clicked_id, card_position } = await request.json()
        if (!user_token || !source_popup || !clicked_type || !clicked_id)
          return json({ error: 'user_token, source_popup, clicked_type, clicked_id 필수' }, 400)

        await DB.prepare(`
          INSERT INTO post_review_clicks (user_token, source_popup, clicked_type, clicked_id, card_position)
          VALUES (?, ?, ?, ?, ?)
        `).bind(user_token, source_popup, clicked_type, clicked_id, card_position || 0).run()

        return json({ ok: true })
      }


      // ── POST /api/v3/popups/:id/wishlist — 위시리스트 토글 ──

      const wishlistMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/wishlist$/)
      if (request.method === 'POST' && wishlistMatch) {
        const popupId = parseInt(wishlistMatch[1])
        const { user_token } = await request.json()
        if (!user_token) return json({ error: 'user_token 필수' }, 400)

        const exists = await DB.prepare(
          'SELECT popup_id FROM popup_wishlist_v3 WHERE popup_id = ? AND user_token = ?'
        ).bind(popupId, user_token).first()

        if (exists) {
          await DB.prepare('DELETE FROM popup_wishlist_v3 WHERE popup_id = ? AND user_token = ?').bind(popupId, user_token).run()
          await DB.prepare('UPDATE popups_v3 SET wishlist_count = MAX(0, wishlist_count - 1) WHERE id = ?').bind(popupId).run()
          return json({ ok: true, saved: false })
        } else {
          await DB.prepare('INSERT INTO popup_wishlist_v3 (popup_id, user_token) VALUES (?, ?)').bind(popupId, user_token).run()
          await DB.prepare('UPDATE popups_v3 SET wishlist_count = wishlist_count + 1 WHERE id = ?').bind(popupId).run()
          return json({ ok: true, saved: true })
        }
      }


      // ── GET /api/v3/user/:token/taste — 사용자 취향 ─────────

      const tasteMatch = path.match(/^\/api\/v3\/user\/([^/]+)\/taste$/)
      if (request.method === 'GET' && tasteMatch) {
        const token = tasteMatch[1]
        const row = await DB.prepare('SELECT * FROM user_taste WHERE user_token = ?').bind(token).first()
        if (!row) return json({ user_token: token, fav_categories: [], fav_districts: [], visit_count: 0, review_count: 0, explorer_level: 1, total_points: 0 })

        return json({
          ...row,
          fav_categories: (() => { try { return JSON.parse(row.fav_categories || '[]') } catch { return [] } })(),
          fav_districts: (() => { try { return JSON.parse(row.fav_districts || '[]') } catch { return [] } })(),
          badges: (() => { try { return JSON.parse(row.badges || '[]') } catch { return [] } })(),
        })
      }


      // ── GET /api/v3/user/:token/wishlists — 내 위시리스트 ───

      const myWishMatch = path.match(/^\/api\/v3\/user\/([^/]+)\/wishlists$/)
      if (request.method === 'GET' && myWishMatch) {
        const { results } = await DB.prepare(`
          SELECT p.*, w.added_at,
            CASE WHEN p.end_date IS NOT NULL
              THEN CAST(julianday(p.end_date) - julianday(date('now','localtime')) AS INTEGER)
              ELSE NULL
            END AS days_left
          FROM popup_wishlist_v3 w
          JOIN popups_v3 p ON w.popup_id = p.id
          WHERE w.user_token = ?
          ORDER BY w.added_at DESC
        `).bind(myWishMatch[1]).all()

        return json(results)
      }


      // ── GET /api/v3/user/:token/reviews — 내 리뷰 ──────────

      const myReviewMatch = path.match(/^\/api\/v3\/user\/([^/]+)\/reviews$/)
      if (request.method === 'GET' && myReviewMatch) {
        const { results } = await DB.prepare(`
          SELECT r.*, p.name_ko, p.name_cn, p.category, p.district, p.cover_image
          FROM reviews r
          JOIN popups_v3 p ON r.popup_id = p.id
          WHERE r.user_token = ?
          ORDER BY r.created_at DESC
        `).bind(myReviewMatch[1]).all()

        return json(results)
      }


      // ================================================================
      //  5. 관리자 API
      // ================================================================

      // ── POST /api/v3/popups — 팝업 등록 (관리자) ────────────

      if (request.method === 'POST' && path === '/api/v3/popups') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
        const b = await request.json()
        if (!b.name_ko || !b.start_date || !b.category)
          return json({ error: 'name_ko, start_date, category 필수' }, 400)

        // cn_score 자동 계산
        const cn_score = calcCnScore(b)

        const result = await DB.prepare(`
          INSERT INTO popups_v3 (
            name_ko, name_cn, name_en, category, subcategory,
            description_ko, description_cn,
            brand_id, brand_name,
            start_date, end_date, open_time, close_time, last_entry_time, closed_days,
            address_ko, address_cn, district, lat, lng,
            nearest_station, station_exit, walk_minutes, floor_info,
            cn_alipay, cn_wechatpay, cn_unionpay, accepts_cash, accepts_card,
            is_free, price, reservation_required, reservation_method,
            cn_no_kr_phone_ok, walk_in_available,
            cn_staff, cn_brochure, en_available,
            has_freebies, freebies_limited, has_photozone, tax_free,
            has_locker, wheelchair_ok, has_wifi,
            cn_score,
            source, source_url, verified, verified_by,
            url_official, url_instagram, url_xhs, url_douyin,
            cover_image, images, emoji, color,
            status, is_hot
          ) VALUES (
            ?,?,?,?,?, ?,?,
            ?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,
            ?,?,
            ?,?,?,
            ?,?,?,?,
            ?,?,?,
            ?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?
          )
        `).bind(
          b.name_ko, b.name_cn || '', b.name_en || '',
          b.category, b.subcategory || '',
          b.description_ko || '', b.description_cn || '',
          b.brand_id || null, b.brand_name || '',
          b.start_date, b.end_date || null,
          b.open_time || '10:00', b.close_time || '20:00',
          b.last_entry_time || '', b.closed_days || '',
          b.address_ko || '', b.address_cn || '',
          b.district || 'other',
          b.lat || 0, b.lng || 0,
          b.nearest_station || '', b.station_exit || '',
          b.walk_minutes || 0, b.floor_info || '',
          b.cn_alipay ?? null, b.cn_wechatpay ?? null, b.cn_unionpay ?? null,
          b.accepts_cash ?? null, b.accepts_card ?? 1,
          b.is_free ?? 1, b.price || '',
          b.reservation_required ?? null, b.reservation_method || '',
          b.cn_no_kr_phone_ok ?? null, b.walk_in_available ?? 1,
          b.cn_staff ?? null, b.cn_brochure ?? null, b.en_available ?? null,
          b.has_freebies ?? null, b.freebies_limited ?? null,
          b.has_photozone ?? null, b.tax_free ?? null,
          b.has_locker ?? null, b.wheelchair_ok ?? null, b.has_wifi ?? null,
          cn_score,
          b.source || 'manual', b.source_url || '',
          b.verified ?? 0, b.verified_by || '',
          b.url_official || '', b.url_instagram || '',
          b.url_xhs || '', b.url_douyin || '',
          b.cover_image || '', JSON.stringify(b.images || []),
          b.emoji || '📌', b.color || '#000000',
          b.status || 'active', b.is_hot || 0
        ).run()

        return json({ ok: true, id: result.meta.last_row_id, cn_score })
      }


      // ── PUT /api/v3/popups/:id — 팝업 수정 (관리자) ─────────

      const putMatch = path.match(/^\/api\/v3\/popups\/(\d+)$/)
      if (request.method === 'PUT' && putMatch) {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
        const b = await request.json()
        const id = parseInt(putMatch[1])

        const fields = Object.keys(b).filter(k => !['id', 'created_at', 'view_count', 'wishlist_count', 'check_in_count', 'review_count', 'avg_rating', 'super_like_count', 'like_count'].includes(k))
        if (fields.length === 0) return json({ error: 'No fields to update' }, 400)

        // cn_score 재계산 필요 여부
        const cnFields = ['cn_alipay', 'cn_wechatpay', 'cn_staff', 'cn_brochure', 'cn_no_kr_phone_ok', 'has_freebies', 'has_photozone', 'tax_free']
        const needRecalc = fields.some(f => cnFields.includes(f))

        if (needRecalc) {
          const current = await DB.prepare('SELECT * FROM popups_v3 WHERE id = ?').bind(id).first()
          if (current) {
            const merged = { ...current, ...b }
            b.cn_score = calcCnScore(merged)
            if (!fields.includes('cn_score')) fields.push('cn_score')
          }
        }

        const sets = fields.map(f => `${f} = ?`).join(', ')
        const vals = fields.map(f => {
          const v = b[f]
          if (Array.isArray(v) || (typeof v === 'object' && v !== null)) return JSON.stringify(v)
          return v
        })

        await DB.prepare(
          `UPDATE popups_v3 SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(...vals, id).run()

        return json({ ok: true, cn_score: b.cn_score })
      }


      // ── GET /api/v3/popups/:id/stats — 팝업 통계 (관리자/브랜드) ──

      const statsMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/stats$/)
      if (request.method === 'GET' && statsMatch) {
        const popupId = parseInt(statsMatch[1])

        const popup = await DB.prepare('SELECT * FROM popups_v3 WHERE id = ?').bind(popupId).first()
        if (!popup) return json({ error: 'Not found' }, 404)

        // 리뷰 태그 집계
        const { results: reviewRows } = await DB.prepare('SELECT tags FROM reviews WHERE popup_id = ?').bind(popupId).all()
        const tagCounts = {}
        for (const r of reviewRows) {
          try {
            for (const tag of JSON.parse(r.tags || '[]')) tagCounts[tag] = (tagCounts[tag] || 0) + 1
          } catch {}
        }

        // 혼잡도
        const { results: crowds } = await DB.prepare(
          'SELECT crowd_level, COUNT(*) AS cnt FROM reviews WHERE popup_id = ? GROUP BY crowd_level'
        ).bind(popupId).all()

        // 반응
        const { results: reactions } = await DB.prepare(
          'SELECT reaction_type, COUNT(*) AS cnt FROM reactions WHERE popup_id = ? GROUP BY reaction_type'
        ).bind(popupId).all()

        // 지오트리거
        const { results: geos } = await DB.prepare(
          'SELECT trigger_type, COUNT(*) AS cnt FROM geo_triggers WHERE popup_id = ? GROUP BY trigger_type'
        ).bind(popupId).all()

        // 체류시간
        const dwell = await DB.prepare(
          'SELECT AVG(dwell_minutes) AS avg_dwell FROM checkins_v3 WHERE popup_id = ? AND dwell_minutes > 0'
        ).bind(popupId).first()

        // 리뷰 후 클릭 전환
        const { results: clickStats } = await DB.prepare(
          'SELECT clicked_type, COUNT(*) AS cnt FROM post_review_clicks WHERE source_popup = ? GROUP BY clicked_type'
        ).bind(popupId).all()

        return json({
          popup_id: popupId,
          name: popup.name_ko,
          category: popup.category,
          views: popup.view_count || 0,
          wishlists: popup.wishlist_count || 0,
          checkins: popup.check_in_count || 0,
          reviews: popup.review_count || 0,
          avg_rating: popup.avg_rating || 0,
          cn_score: popup.cn_score || 0,
          super_likes: popup.super_like_count || 0,
          likes: popup.like_count || 0,
          avg_dwell_minutes: Math.round(dwell?.avg_dwell || 0),
          reactions: Object.fromEntries(reactions.map(r => [r.reaction_type, r.cnt])),
          tag_counts: tagCounts,
          crowd_distribution: Object.fromEntries(crowds.map(c => [c.crowd_level, c.cnt])),
          geo_triggers: Object.fromEntries(geos.map(g => [g.trigger_type, g.cnt])),
          post_review_clicks: Object.fromEntries(clickStats.map(c => [c.clicked_type, c.cnt])),
        })
      }


      // ================================================================
      //  6. 위챗 미니샵 — 방한 후 구매 흐름
      //  "현장에서 못 샀다 / 귀국 후에도 사고 싶다"
      //  → 위챗방 문의 → 미니샵 → 사전주문 → 확정 시 결제/배송
      // ================================================================

      // ── GET /api/v3/popups/:id/products — 팝업별 상품 목록 ──

      const productsMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/products$/)
      if (request.method === 'GET' && productsMatch) {
        const popupId = parseInt(productsMatch[1])
        const statusFilter = q.get('status') || 'active'

        const where = ['popup_id = ?']
        const binds = [popupId]

        if (statusFilter !== 'all') {
          where.push('status = ?')
          binds.push(statusFilter)
        }

        const { results } = await DB.prepare(`
          SELECT * FROM popup_products
          WHERE ${where.join(' AND ')}
          ORDER BY is_limited DESC, sold_count DESC, created_at DESC
        `).bind(...binds).all()

        // 이미지 JSON 파싱
        const parsed = results.map(p => ({
          ...p,
          images: (() => { try { return JSON.parse(p.images || '[]') } catch { return [] } })(),
        }))

        return json(parsed)
      }


      // ── GET /api/v3/products/:id — 상품 상세 ────────────────

      const productDetailMatch = path.match(/^\/api\/v3\/products\/(\d+)$/)
      if (request.method === 'GET' && productDetailMatch) {
        const productId = parseInt(productDetailMatch[1])
        const product = await DB.prepare('SELECT * FROM popup_products WHERE id = ?').bind(productId).first()
        if (!product) return json({ error: 'Product not found' }, 404)

        // 조회수 +1
        await DB.prepare('UPDATE popup_products SET view_count = view_count + 1 WHERE id = ?').bind(productId).run()

        // 이 상품의 팝업 기본 정보
        const popup = await DB.prepare(
          'SELECT id, name_ko, name_cn, category, district, cover_image, end_date FROM popups_v3 WHERE id = ?'
        ).bind(product.popup_id).first()

        return json({
          ...product,
          images: (() => { try { return JSON.parse(product.images || '[]') } catch { return [] } })(),
          popup,
        })
      }


      // ── POST /api/v3/products/:id/preorder — 사전주문 ───────
      // 흐름: preorder → (재고 확보) → confirmed → (결제) → paid → shipped → delivered

      const preorderMatch = path.match(/^\/api\/v3\/products\/(\d+)\/preorder$/)
      if (request.method === 'POST' && preorderMatch) {
        const productId = parseInt(preorderMatch[1])
        const { user_token, quantity, receiver_name, receiver_phone, receiver_address, receiver_city, source } = await request.json()
        if (!user_token || !quantity || quantity < 1)
          return json({ error: 'user_token, quantity 필수' }, 400)

        // 상품 확인
        const product = await DB.prepare('SELECT * FROM popup_products WHERE id = ?').bind(productId).first()
        if (!product) return json({ error: 'Product not found' }, 404)
        if (product.status === 'soldout') return json({ error: '품절된 상품입니다' }, 400)

        // 재고 체크 (사전주문제면 재고 0이어도 OK)
        if (!product.is_preorder && product.stock < quantity)
          return json({ error: `재고 부족 (남은 수량: ${product.stock})` }, 400)

        // 주문번호 생성
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const seq = Math.floor(Math.random() * 999) + 1
        const orderNo = `HP-${today}-${String(seq).padStart(3, '0')}`

        // 가격 계산
        const unitCny = product.price_cny || Math.round(product.price_krw / 190 * 100) / 100
        const shippingCny = product.shipping_fee_cny || 0
        const totalCny = Math.round((unitCny * quantity + shippingCny) * 100) / 100
        const commissionCny = Math.round(totalCny * (product.commission_pct || 10) / 100 * 100) / 100

        const result = await DB.prepare(`
          INSERT INTO product_orders (
            order_no, user_token, product_id, popup_id,
            quantity, unit_price_cny, shipping_cny, total_cny, commission_cny,
            receiver_name, receiver_phone, receiver_address, receiver_city,
            status, source
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'preorder', ?)
        `).bind(
          orderNo, user_token, productId, product.popup_id,
          quantity, unitCny, shippingCny, totalCny, commissionCny,
          receiver_name || '', receiver_phone || '', receiver_address || '', receiver_city || '',
          source || 'minishop'
        ).run()

        // 판매수 업데이트
        await DB.prepare('UPDATE popup_products SET sold_count = sold_count + ? WHERE id = ?').bind(quantity, productId).run()

        // 재고 차감 (사전주문 아닐 때만)
        if (!product.is_preorder) {
          await DB.prepare('UPDATE popup_products SET stock = MAX(0, stock - ?) WHERE id = ?').bind(quantity, productId).run()
        }

        return json({
          ok: true,
          order_no: orderNo,
          order_id: result.meta.last_row_id,
          total_cny: totalCny,
          status: 'preorder',
          message: product.is_preorder
            ? '사전주문 접수 완료. 재고 확보 후 결제 안내드립니다.'
            : '주문 접수 완료. 결제를 진행해주세요.',
        })
      }


      // ── GET /api/v3/orders/:orderNo — 주문 조회 ────────────

      const orderMatch = path.match(/^\/api\/v3\/orders\/([A-Z0-9-]+)$/)
      if (request.method === 'GET' && orderMatch) {
        const order = await DB.prepare(`
          SELECT o.*, p.name_cn AS product_name, p.cover_image AS product_image,
            pp.name_cn AS popup_name
          FROM product_orders o
          JOIN popup_products p ON o.product_id = p.id
          JOIN popups_v3 pp ON o.popup_id = pp.id
          WHERE o.order_no = ?
        `).bind(orderMatch[1]).first()

        if (!order) return json({ error: 'Order not found' }, 404)
        return json(order)
      }


      // ── PUT /api/v3/orders/:orderNo/status — 주문 상태 변경 (관리자) ──

      const orderStatusMatch = path.match(/^\/api\/v3\/orders\/([A-Z0-9-]+)\/status$/)
      if (request.method === 'PUT' && orderStatusMatch) {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
        const { status, tracking_no, payment_id, note } = await request.json()
        if (!status) return json({ error: 'status 필수' }, 400)

        const validStatuses = ['preorder', 'confirmed', 'paid', 'shipping', 'delivered', 'cancelled', 'refunded']
        if (!validStatuses.includes(status)) return json({ error: `유효하지 않은 상태: ${status}` }, 400)

        const updates = ['status = ?', 'updated_at = CURRENT_TIMESTAMP']
        const binds = [status]

        if (status === 'paid' && payment_id) { updates.push('payment_id = ?', 'paid_at = CURRENT_TIMESTAMP'); binds.push(payment_id) }
        if (status === 'shipping' && tracking_no) { updates.push('tracking_no = ?', 'shipped_at = CURRENT_TIMESTAMP'); binds.push(tracking_no) }
        if (status === 'delivered') { updates.push('delivered_at = CURRENT_TIMESTAMP') }
        if (note) { updates.push('note = ?'); binds.push(note) }

        binds.push(orderStatusMatch[1])

        await DB.prepare(
          `UPDATE product_orders SET ${updates.join(', ')} WHERE order_no = ?`
        ).bind(...binds).run()

        // 취소 시 재고 복구
        if (status === 'cancelled' || status === 'refunded') {
          const order = await DB.prepare('SELECT product_id, quantity FROM product_orders WHERE order_no = ?').bind(orderStatusMatch[1]).first()
          if (order) {
            await DB.prepare('UPDATE popup_products SET stock = stock + ?, sold_count = MAX(0, sold_count - ?) WHERE id = ?')
              .bind(order.quantity, order.quantity, order.product_id).run()
          }
        }

        return json({ ok: true, status })
      }


      // ── GET /api/v3/user/:token/orders — 내 주문 목록 ──────

      const myOrdersMatch = path.match(/^\/api\/v3\/user\/([^/]+)\/orders$/)
      if (request.method === 'GET' && myOrdersMatch) {
        const { results } = await DB.prepare(`
          SELECT o.*, p.name_cn AS product_name, p.cover_image AS product_image,
            pp.name_cn AS popup_name, pp.category AS popup_category
          FROM product_orders o
          JOIN popup_products p ON o.product_id = p.id
          JOIN popups_v3 pp ON o.popup_id = pp.id
          WHERE o.user_token = ?
          ORDER BY o.created_at DESC
        `).bind(myOrdersMatch[1]).all()

        return json(results)
      }


      // ── POST /api/v3/wechat/inquiry — 위챗방 문의 등록 ─────

      if (request.method === 'POST' && path === '/api/v3/wechat/inquiry') {
        const { popup_id, product_id, question_type, question_text, wechat_group, wechat_user } = await request.json()
        if (!question_type) return json({ error: 'question_type 필수' }, 400)

        const result = await DB.prepare(`
          INSERT INTO wechat_inquiries (popup_id, product_id, question_type, question_text, wechat_group, wechat_user)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          popup_id || null, product_id || null,
          question_type, question_text || '',
          wechat_group || '', wechat_user || ''
        ).run()

        return json({ ok: true, inquiry_id: result.meta.last_row_id })
      }


      // ── PUT /api/v3/wechat/inquiry/:id/answer — 문의 답변 ──

      const answerMatch = path.match(/^\/api\/v3\/wechat\/inquiry\/(\d+)\/answer$/)
      if (request.method === 'PUT' && answerMatch) {
        const { answer_text, answered_by, convert_to_order, order_id } = await request.json()

        const updates = ['answer_text = ?', 'answered_by = ?', 'answered_at = CURRENT_TIMESTAMP']
        const binds = [answer_text || '', answered_by || 'admin']

        if (convert_to_order) {
          updates.push('converted_to_order = 1')
          if (order_id) { updates.push('order_id = ?'); binds.push(order_id) }
        }

        binds.push(parseInt(answerMatch[1]))

        await DB.prepare(
          `UPDATE wechat_inquiries SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...binds).run()

        return json({ ok: true })
      }


      // ── GET /api/v3/wechat/inquiries — 문의 목록 (관리자) ──

      if (request.method === 'GET' && path === '/api/v3/wechat/inquiries') {
        const statusFilter = q.get('unanswered') === '1' ? "AND answered_at IS NULL" : ''
        const typeFilter = q.get('type') ? 'AND question_type = ?' : ''
        const limit = Math.min(parseInt(q.get('limit') || '50'), 100)

        let sql = `
          SELECT wi.*, p.name_cn AS popup_name, pp.name_cn AS product_name
          FROM wechat_inquiries wi
          LEFT JOIN popups_v3 p ON wi.popup_id = p.id
          LEFT JOIN popup_products pp ON wi.product_id = pp.id
          WHERE 1=1 ${statusFilter} ${typeFilter}
          ORDER BY wi.asked_at DESC
          LIMIT ?
        `
        const binds = []
        if (q.get('type')) binds.push(q.get('type'))
        binds.push(limit)

        const { results } = await DB.prepare(sql).bind(...binds).all()
        return json(results)
      }


      // ── POST /api/v3/popups/:id/share — SNS 공유 추적 ─────

      const shareMatch = path.match(/^\/api\/v3\/popups\/(\d+)\/share$/)
      if (request.method === 'POST' && shareMatch) {
        const { user_token, platform, action, hashtag } = await request.json()
        if (!user_token || !platform) return json({ error: 'user_token, platform 필수' }, 400)

        await DB.prepare(`
          INSERT INTO sns_shares (user_token, popup_id, platform, action, hashtag_used)
          VALUES (?, ?, ?, ?, ?)
        `).bind(user_token, parseInt(shareMatch[1]), platform, action || 'copy_tag', hashtag || '').run()

        return json({ ok: true })
      }


      // ── 관리자: 상품 등록 ──────────────────────────────────────

      if (request.method === 'POST' && path === '/api/v3/products') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
        const b = await request.json()
        if (!b.popup_id || !b.name_cn || !b.price_krw)
          return json({ error: 'popup_id, name_cn, price_krw 필수' }, 400)

        const priceCny = b.price_cny || Math.round(b.price_krw / 190 * 100) / 100

        const result = await DB.prepare(`
          INSERT INTO popup_products (
            popup_id, brand_id, name_cn, name_ko, description_cn, category,
            price_krw, price_cny, commission_pct,
            stock, is_preorder, is_limited, is_seoul_edition, is_exclusive,
            images, cover_image,
            ships_to_china, shipping_fee_cny, shipping_days,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          b.popup_id, b.brand_id || null,
          b.name_cn, b.name_ko || '', b.description_cn || '', b.category || 'goods',
          b.price_krw, priceCny, b.commission_pct || 10,
          b.stock || 0, b.is_preorder ?? 1, b.is_limited || 0, b.is_seoul_edition || 0, b.is_exclusive || 0,
          JSON.stringify(b.images || []), b.cover_image || '',
          b.ships_to_china ?? 1, b.shipping_fee_cny || 0, b.shipping_days || 7,
          b.status || 'active'
        ).run()

        return json({ ok: true, id: result.meta.last_row_id, price_cny: priceCny })
      }


      // ── 관리자: 미니샵 매출 요약 ───────────────────────────────

      if (request.method === 'GET' && path === '/api/v3/admin/shop-stats') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)

        const total = await DB.prepare(`
          SELECT
            COUNT(*) AS total_orders,
            SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_orders,
            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders,
            SUM(CASE WHEN status = 'preorder' THEN 1 ELSE 0 END) AS pending_preorders,
            ROUND(SUM(CASE WHEN status IN ('paid','shipping','delivered') THEN total_cny ELSE 0 END), 2) AS total_revenue_cny,
            ROUND(SUM(CASE WHEN status IN ('paid','shipping','delivered') THEN commission_cny ELSE 0 END), 2) AS total_commission_cny
          FROM product_orders
        `).first()

        // 위챗 문의 → 주문 전환율
        const inquiryStats = await DB.prepare(`
          SELECT
            COUNT(*) AS total_inquiries,
            SUM(CASE WHEN question_type = 'purchase' THEN 1 ELSE 0 END) AS purchase_inquiries,
            SUM(converted_to_order) AS converted_orders
          FROM wechat_inquiries
        `).first()

        // SNS 공유 집계
        const shareStats = await DB.prepare(`
          SELECT platform, COUNT(*) AS cnt FROM sns_shares GROUP BY platform
        `).all()

        return json({
          orders: total,
          wechat: {
            ...inquiryStats,
            conversion_rate: inquiryStats?.purchase_inquiries > 0
              ? Math.round((inquiryStats.converted_orders / inquiryStats.purchase_inquiries) * 100) + '%'
              : '0%',
          },
          sns_shares: Object.fromEntries((shareStats.results || []).map(s => [s.platform, s.cnt])),
        })
      }


      // ── v1/v2 호환 (기존 엔드포인트 유지) ─────────────────────
      // 기존 /api/popups 경로는 기존 popup-store.js에서 처리
      // v3는 /api/v3/ 프리픽스

      return json({ error: 'Not found', hint: 'v3 엔드포인트는 /api/v3/ 프리픽스 사용' }, 404)

    } catch (e) {
      console.error(e)
      return json({ error: e.message }, 500)
    }
  },
}
