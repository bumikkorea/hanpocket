// HanPocket Popup Store API v2
// Cloudflare Worker + D1
// ─────────────────────────────────────────────────────────────────

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

// ── 라우터 ────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })

    const url = new URL(request.url)
    const path = url.pathname
    const q = url.searchParams

    try {
      // ── GET /api/popups/map — 지도 핀 전용 경량 쿼리
      if (request.method === 'GET' && path === '/api/popups/map') {
        const { results } = await env.POPUPS_DB.prepare(`
          SELECT id, title_ko, title_zh, title_en, lat, lng, emoji, color,
                 popup_type, venue_type, district, end_date,
                 payment_alipay, payment_wechatpay, is_hot
          FROM popups
          WHERE is_active = 1 AND is_expired = 0
            AND end_date >= date('now','localtime')
        `).all()
        return json(results)
      }

      // ── GET /api/popups/collections — 컬렉션 목록
      if (request.method === 'GET' && path === '/api/popups/collections') {
        const { results } = await env.POPUPS_DB.prepare(`
          SELECT * FROM popup_collections WHERE is_active = 1 ORDER BY sort_order ASC
        `).all()
        return json(results)
      }

      // ── GET /api/popups/collections/:slug
      const colMatch = path.match(/^\/api\/popups\/collections\/(.+)$/)
      if (request.method === 'GET' && colMatch) {
        const slug = colMatch[1]
        const col = await env.POPUPS_DB.prepare(
          'SELECT * FROM popup_collections WHERE slug = ? AND is_active = 1'
        ).bind(slug).first()
        if (!col) return json({ error: 'Not found' }, 404)

        const { results } = await env.POPUPS_DB.prepare(`
          SELECT p.* FROM popups p
          JOIN popup_collection_items ci ON p.id = ci.popup_id
          WHERE ci.collection_id = ? AND p.is_active = 1 AND p.is_expired = 0
          ORDER BY ci.sort_order ASC
        `).bind(col.id).all()

        return json({ ...col, popups: results })
      }

      // ── GET /api/popups/venues — 장소 마스터
      if (request.method === 'GET' && path === '/api/popups/venues') {
        const { results } = await env.POPUPS_DB.prepare(
          'SELECT * FROM popup_venues WHERE is_active = 1 ORDER BY name_ko ASC'
        ).all()
        return json(results)
      }

      // ── GET /api/popups/staging — 검토 대기 큐 (관리자)
      if (request.method === 'GET' && path === '/api/popups/staging') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
        const { results } = await env.POPUPS_DB.prepare(
          "SELECT * FROM popup_staging WHERE status = 'pending' ORDER BY created_at DESC"
        ).all()
        return json(results)
      }

      // ── GET /api/popups/:id/checkins
      const checkinGetMatch = path.match(/^\/api\/popups\/(\d+)\/checkins$/)
      if (request.method === 'GET' && checkinGetMatch) {
        const id = checkinGetMatch[1]
        const { results } = await env.POPUPS_DB.prepare(`
          SELECT crowd_level, queue_minutes, comment_zh, checked_at
          FROM popup_checkins WHERE popup_id = ?
          ORDER BY checked_at DESC LIMIT 20
        `).bind(id).all()

        // 최근 체크인 기반 혼잡도 요약
        const summary = results.reduce((acc, r) => {
          acc[r.crowd_level] = (acc[r.crowd_level] || 0) + 1
          return acc
        }, {})
        const avgWait = results.filter(r => r.queue_minutes).reduce((a, r, i, arr) =>
          i === arr.length - 1 ? (a + r.queue_minutes) / arr.length : a + r.queue_minutes, 0)

        return json({ checkins: results, summary, avg_wait_minutes: Math.round(avgWait) })
      }

      // ── GET /api/popups/:id
      const idMatch = path.match(/^\/api\/popups\/(\d+)$/)
      if (request.method === 'GET' && idMatch) {
        const row = await env.POPUPS_DB.prepare(
          'SELECT * FROM popups WHERE id = ?'
        ).bind(idMatch[1]).first()
        if (!row) return json({ error: 'Not found' }, 404)
        return json(row)
      }

      // ── GET /api/popups — 필터 지원 목록
      if (request.method === 'GET' && path === '/api/popups') {
        let where = ["p.is_active = 1", "p.is_expired = 0", "p.end_date >= date('now','localtime')"]
        const binds = []

        if (q.get('district'))      { where.push('p.district = ?');      binds.push(q.get('district')) }
        if (q.get('venue_type'))    { where.push('p.venue_type = ?');    binds.push(q.get('venue_type')) }
        if (q.get('popup_type'))    { where.push('p.popup_type = ?');    binds.push(q.get('popup_type')) }
        if (q.get('cn_pay') === '1') where.push('(p.payment_alipay = 1 OR p.payment_wechatpay = 1)')
        if (q.get('cn_staff') === '1') where.push('p.chinese_staff = 1')
        if (q.get('tax_refund') === '1') where.push('p.tax_refund_available = 1')
        if (q.get('hot') === '1')   where.push('p.is_hot = 1')
        if (q.get('closing_soon') === '1')
          where.push("p.end_date <= date('now','localtime','+7 days')")

        const limit  = Math.min(parseInt(q.get('limit') || '50'), 100)
        const offset = parseInt(q.get('offset') || '0')
        const sort   = q.get('sort') === 'closing' ? 'p.end_date ASC' : 'p.is_hot DESC, p.created_at DESC'

        const sql = `SELECT p.* FROM popups p WHERE ${where.join(' AND ')} ORDER BY ${sort} LIMIT ? OFFSET ?`
        const stmt = env.POPUPS_DB.prepare(sql).bind(...binds, limit, offset)
        const { results } = await stmt.all()
        return json(results)
      }

      // ── POST /api/popups/:id/checkin — 체크인 등록
      const checkinMatch = path.match(/^\/api\/popups\/(\d+)\/checkin$/)
      if (request.method === 'POST' && checkinMatch) {
        const { user_token, queue_minutes, crowd_level, comment_zh } = await request.json()
        if (!user_token) return json({ error: 'user_token 필수' }, 400)

        await env.POPUPS_DB.prepare(`
          INSERT INTO popup_checkins (popup_id, user_token, queue_minutes, crowd_level, comment_zh)
          VALUES (?, ?, ?, ?, ?)
        `).bind(checkinMatch[1], user_token, queue_minutes || null, crowd_level || 'medium', comment_zh || '').run()

        await env.POPUPS_DB.prepare(
          'UPDATE popups SET check_in_count = check_in_count + 1 WHERE id = ?'
        ).bind(checkinMatch[1]).run()

        return json({ ok: true })
      }

      // ── POST /api/popups/:id/wishlist — 위시리스트 토글
      const wishlistMatch = path.match(/^\/api\/popups\/(\d+)\/wishlist$/)
      if (request.method === 'POST' && wishlistMatch) {
        const { user_token } = await request.json()
        if (!user_token) return json({ error: 'user_token 필수' }, 400)

        const exists = await env.POPUPS_DB.prepare(
          'SELECT id FROM popup_wishlist WHERE popup_id = ? AND user_token = ?'
        ).bind(wishlistMatch[1], user_token).first()

        if (exists) {
          await env.POPUPS_DB.prepare(
            'DELETE FROM popup_wishlist WHERE popup_id = ? AND user_token = ?'
          ).bind(wishlistMatch[1], user_token).run()
          await env.POPUPS_DB.prepare(
            'UPDATE popups SET wishlist_count = MAX(0, wishlist_count - 1) WHERE id = ?'
          ).bind(wishlistMatch[1]).run()
          return json({ ok: true, saved: false })
        } else {
          await env.POPUPS_DB.prepare(
            'INSERT INTO popup_wishlist (popup_id, user_token) VALUES (?, ?)'
          ).bind(wishlistMatch[1], user_token).run()
          await env.POPUPS_DB.prepare(
            'UPDATE popups SET wishlist_count = wishlist_count + 1 WHERE id = ?'
          ).bind(wishlistMatch[1]).run()
          return json({ ok: true, saved: true })
        }
      }

      // ── POST /api/popups/submit — 브랜드 직접 제출
      if (request.method === 'POST' && path === '/api/popups/submit') {
        const body = await request.json()
        if (!body.title_ko || !body.start_date || !body.end_date)
          return json({ error: 'title_ko, start_date, end_date 필수' }, 400)

        await env.POPUPS_DB.prepare(`
          INSERT INTO popup_staging (data_json, source_type, source_url)
          VALUES (?, 'brand_submit', ?)
        `).bind(JSON.stringify(body), body.official_url || '').run()

        return json({ ok: true, message: '제출 완료. 24시간 내 검토 후 게시됩니다.' })
      }

      // ── POST /api/popups — 관리자 직접 추가
      if (request.method === 'POST' && path === '/api/popups') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
        const b = await request.json()
        if (!b.title_ko || !b.start_date || !b.end_date || !b.lat || !b.lng)
          return json({ error: 'title_ko, start_date, end_date, lat, lng 필수' }, 400)

        const slug = b.slug || `${b.brand || 'popup'}-${b.start_date}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 80)

        const result = await env.POPUPS_DB.prepare(`
          INSERT INTO popups (
            slug, brand, name_ko, name_zh, name_en, title_ko, title_zh, title_en,
            description_ko, description_zh,
            venue_type, popup_type, district,
            venue_name, address_ko, address_zh,
            floor_ko, floor_zh, floor_en,
            lat, lng, start_date, end_date,
            open_time, close_time, entry_type, entry_fee_krw,
            reservation_url, daily_capacity, daily_visitor_estimate,
            queue_info_ko, queue_info_zh,
            payment_alipay, payment_wechatpay, payment_unionpay,
            payment_card, payment_cash,
            chinese_staff, chinese_signage, chinese_brochure,
            tax_refund_available, tax_refund_min_krw, duty_free_eligible,
            cn_sns_tag_zh, cover_image, emoji, color,
            tags_ko, tags_zh,
            source_type, source_url, source_xhs, source_douyin, official_url,
            is_hot, is_verified, is_active
          ) VALUES (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
          )
        `).bind(
          slug, b.brand||'', b.title_ko, b.title_zh||'', b.title_en||'',
          b.title_ko, b.title_zh||'', b.title_en||'',
          b.description_ko||'', b.description_zh||'',
          b.venue_type||'hotplace', b.popup_type||'other', b.district||'other',
          b.venue_name||'', b.address_ko||'', b.address_zh||'',
          b.floor_ko||'', b.floor_zh||'', b.floor_en||'',
          b.lat, b.lng, b.start_date, b.end_date,
          b.open_time||'10:00', b.close_time||'20:00',
          b.entry_type||'free', b.entry_fee_krw||0,
          b.reservation_url||'', b.daily_capacity||0, b.daily_visitor_estimate||0,
          b.queue_info_ko||'', b.queue_info_zh||'',
          b.payment_alipay||0, b.payment_wechatpay||0, b.payment_unionpay||0,
          b.payment_card??1, b.payment_cash??1,
          b.chinese_staff||0, b.chinese_signage||0, b.chinese_brochure||0,
          b.tax_refund_available||0, b.tax_refund_min_krw||30000, b.duty_free_eligible||0,
          b.cn_sns_tag_zh||'', b.cover_image||'', b.emoji||'📌', b.color||'#6366F1',
          JSON.stringify(b.tags_ko||[]), JSON.stringify(b.tags_zh||[]),
          b.source_type||'manual', b.source_url||'', b.source_xhs||'', b.source_douyin||'', b.official_url||'',
          b.is_hot||0, 1, 1
        ).run()

        return json({ id: result.meta.last_row_id, slug, ok: true })
      }

      // ── PUT /api/popups/:id — 관리자 수정
      const putMatch = path.match(/^\/api\/popups\/(\d+)$/)
      if (request.method === 'PUT' && putMatch) {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
        const b = await request.json()
        const id = putMatch[1]

        const fields = Object.keys(b).filter(k => k !== 'id' && k !== 'created_at')
        if (fields.length === 0) return json({ error: 'No fields to update' }, 400)

        const sets = fields.map(f => `${f} = ?`).join(', ')
        const vals = fields.map(f => b[f])

        await env.POPUPS_DB.prepare(
          `UPDATE popups SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(...vals, id).run()

        return json({ ok: true })
      }

      // ── DELETE /api/popups/:id — 관리자 삭제
      const delMatch = path.match(/^\/api\/popups\/(\d+)$/)
      if (request.method === 'DELETE' && delMatch) {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
        await env.POPUPS_DB.prepare('DELETE FROM popups WHERE id = ?').bind(delMatch[1]).run()
        return json({ ok: true })
      }

      // ── PUT /api/popups/staging/:id — 스테이징 승인/거부
      const stageMatch = path.match(/^\/api\/popups\/staging\/(\d+)$/)
      if (request.method === 'PUT' && stageMatch) {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
        const body = await request.json()
        const { action, reject_reason } = body
        const id = stageMatch[1]

        if (action === 'approve') {
          const row = await env.POPUPS_DB.prepare(
            'SELECT * FROM popup_staging WHERE id = ?'
          ).bind(id).first()
          if (!row) return json({ error: 'Not found' }, 404)

          const b = JSON.parse(row.data_json)

          // 관리자가 폼에서 넘긴 override 값 우선 적용
          const override = body.override || {}

          // ── 날짜 파싱 ──
          const today = new Date().toISOString().split('T')[0]
          const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

          let start_date = override.start_date || b.start_date || today
          let end_date   = override.end_date   || b.end_date   || ''

          // end_date_hint 파싱 시도 (예: "~ 3/22", "3월 22일", "2026-03-22")
          if (!end_date && b.end_date_hint) {
            const hint = b.end_date_hint
            const year = new Date().getFullYear()
            let m, d
            const p1 = hint.match(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/)
            const p2 = hint.match(/(\d{1,2})월\s*(\d{1,2})일/)
            const p3 = hint.match(/(\d{1,2})\/(\d{1,2})/)
            if (p1) { end_date = `${p1[1]}-${p1[2].padStart(2,'0')}-${p1[3].padStart(2,'0')}` }
            else if (p2) { end_date = `${year}-${p2[1].padStart(2,'0')}-${p2[2].padStart(2,'0')}` }
            else if (p3) { end_date = `${year}-${p3[1].padStart(2,'0')}-${p3[2].padStart(2,'0')}` }
          }
          if (!end_date) end_date = in30

          // ── 좌표 결정 ──
          let lat = parseFloat(override.lat) || parseFloat(b.lat) || 0
          let lng = parseFloat(override.lng) || parseFloat(b.lng) || 0
          const venueName = override.venue_name || b.venue_name || ''
          const district  = override.district   || b.district   || 'other'

          // 1순위: popup_venues 마스터에서 지역/이름으로 매칭
          if ((!lat || !lng) && (venueName || district !== 'other')) {
            const venueRow = await env.POPUPS_DB.prepare(
              'SELECT lat, lng FROM popup_venues WHERE district = ? AND is_active = 1 LIMIT 1'
            ).bind(district).first()
            if (venueRow) { lat = venueRow.lat; lng = venueRow.lng }
          }

          // 2순위: Kakao 지오코딩 API
          if ((!lat || !lng) && venueName && env.KAKAO_REST_KEY) {
            try {
              const geoRes = await fetch(
                `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(venueName + ' 서울')}&size=1`,
                { headers: { Authorization: `KakaoAK ${env.KAKAO_REST_KEY}` } }
              )
              const geoData = await geoRes.json()
              if (geoData.documents?.[0]) {
                lat = parseFloat(geoData.documents[0].y)
                lng = parseFloat(geoData.documents[0].x)
              }
            } catch(e) { console.error('Geocoding 실패:', e.message) }
          }

          // 3순위: 지역 중심 좌표 fallback
          if (!lat || !lng) {
            const districtCenter = {
              seongsu:    [37.5443, 127.0563], gangnam:  [37.5172, 127.0473],
              hannam:     [37.5355, 127.0052], hongdae:  [37.5575, 126.9245],
              myeongdong: [37.5635, 126.9845], yeouido:  [37.5260, 126.9289],
              jongno:     [37.5651, 126.9815], itaewon:  [37.5345, 126.9946],
              coex:       [37.5130, 127.0587], hangang:  [37.5284, 126.9330],
            }
            const center = districtCenter[district] || [37.5665, 126.9780]
            lat = center[0]; lng = center[1]
          }

          const slug = `popup-${Date.now()}`.slice(0, 60)

          const result = await env.POPUPS_DB.prepare(`
            INSERT INTO popups (
              slug, brand, title_ko, title_zh, title_en,
              description_ko, venue_type, popup_type, district,
              venue_name, address_ko, lat, lng,
              start_date, end_date, emoji, color,
              source_type, source_url, is_verified, is_active
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,1)
          `).bind(
            slug,
            override.brand || b.brand || '',
            override.title_ko || b.title_ko || '',
            override.title_zh || b.title_zh || override.title_ko || b.title_ko || '',
            override.title_en || b.title_en || override.title_ko || b.title_ko || '',
            b.description_ko || '',
            override.venue_type || b.venue_type || 'hotplace',
            override.popup_type || b.popup_type || 'other',
            district,
            venueName,
            override.address_ko || b.address_ko || '',
            lat, lng,
            start_date, end_date,
            override.emoji || b.emoji || '📌',
            override.color || b.color || '#6366F1',
            row.source_type || 'manual',
            row.source_url || ''
          ).run()

          await env.POPUPS_DB.prepare(
            "UPDATE popup_staging SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?"
          ).bind(id).run()

          return json({ ok: true, action: 'approved', popup_id: result.meta.last_row_id, lat, lng, end_date })
        }

        if (action === 'reject') {
          await env.POPUPS_DB.prepare(
            "UPDATE popup_staging SET status = 'rejected', reject_reason = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?"
          ).bind(reject_reason || '', id).run()
          return json({ ok: true, action: 'rejected' })
        }

        return json({ error: 'action must be approve or reject' }, 400)
      }

      // ════════════════════════════════════════════════════════
      // v3 엔드포인트 — 3차원 현장 반응 루프
      // ════════════════════════════════════════════════════════

      // ── POST /api/popups/:id/reaction — 왕좋아요/좋아요
      const reactionMatch = path.match(/^\/api\/popups\/([^/]+)\/reaction$/)
      if (request.method === 'POST' && reactionMatch) {
        const { user_token, reaction_type } = await request.json()
        if (!user_token || !['super_like', 'like'].includes(reaction_type))
          return json({ error: 'user_token, reaction_type(super_like|like) 필수' }, 400)

        const popupId = reactionMatch[1]

        // UPSERT — 같은 유저+팝업은 덮어쓰기
        await env.POPUPS_DB.prepare(`
          INSERT INTO reactions (user_token, popup_id, reaction_type)
          VALUES (?, ?, ?)
          ON CONFLICT(user_token, popup_id) DO UPDATE SET reaction_type = excluded.reaction_type, reacted_at = CURRENT_TIMESTAMP
        `).bind(user_token, popupId, reaction_type).run()

        // 집계 갱신
        const counts = await env.POPUPS_DB.prepare(`
          SELECT
            SUM(CASE WHEN reaction_type = 'super_like' THEN 1 ELSE 0 END) AS super_likes,
            SUM(CASE WHEN reaction_type = 'like' THEN 1 ELSE 0 END) AS likes
          FROM reactions WHERE popup_id = ?
        `).bind(popupId).first()

        await env.POPUPS_DB.prepare(
          'UPDATE popups SET super_like_count = ?, like_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(counts?.super_likes || 0, counts?.likes || 0, popupId).run()

        return json({ ok: true, reaction_type, super_likes: counts?.super_likes || 0, likes: counts?.likes || 0 })
      }

      // ── POST /api/popups/:id/review — 리뷰 작성
      const reviewMatch = path.match(/^\/api\/popups\/([^/]+)\/review$/)
      if (request.method === 'POST' && reviewMatch) {
        const body = await request.json()
        const { user_token, rating, crowd_level, comment, lang: reviewLang, photos, tags, review_tier, reward_type, reward_detail, reward_source } = body
        if (!user_token || !rating) return json({ error: 'user_token, rating 필수' }, 400)

        const popupId = reviewMatch[1]

        await env.POPUPS_DB.prepare(`
          INSERT INTO reviews (user_token, popup_id, rating, crowd_level, comment, lang, photos, tags, review_tier, reward_type, reward_detail, reward_source)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_token, popup_id) DO UPDATE SET
            rating = excluded.rating, crowd_level = excluded.crowd_level,
            comment = excluded.comment, photos = excluded.photos, tags = excluded.tags,
            review_tier = excluded.review_tier, created_at = CURRENT_TIMESTAMP
        `).bind(
          user_token, popupId, rating,
          crowd_level || 'medium', comment || '', reviewLang || 'zh',
          JSON.stringify(photos || []), JSON.stringify(tags || []),
          review_tier || 'mini',
          reward_type || '', reward_detail || '', reward_source || 'system'
        ).run()

        // 팝업 집계 갱신
        const stats = await env.POPUPS_DB.prepare(`
          SELECT COUNT(*) AS cnt, AVG(rating) AS avg_r FROM reviews WHERE popup_id = ?
        `).bind(popupId).first()

        await env.POPUPS_DB.prepare(
          'UPDATE popups SET review_count = ?, avg_rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(stats?.cnt || 0, Math.round((stats?.avg_r || 0) * 10) / 10, popupId).run()

        // 보상 로그
        if (reward_type) {
          await env.POPUPS_DB.prepare(`
            INSERT INTO rewards_log (user_token, popup_id, reward_type, reward_detail, reward_source)
            VALUES (?, ?, ?, ?, ?)
          `).bind(user_token, popupId, reward_type, reward_detail || '', reward_source || 'system').run()
        }

        // 사용자 취향 갱신
        await env.POPUPS_DB.prepare(`
          INSERT INTO user_taste (user_token, review_count, visit_count, last_active)
          VALUES (?, 1, 1, CURRENT_TIMESTAMP)
          ON CONFLICT(user_token) DO UPDATE SET
            review_count = review_count + 1,
            visit_count = visit_count + 1,
            last_active = CURRENT_TIMESTAMP
        `).bind(user_token).run()

        return json({ ok: true, review_count: stats?.cnt || 0, avg_rating: stats?.avg_r || 0 })
      }

      // ── GET /api/popups/:id/reviews — 리뷰 목록
      const reviewsGetMatch = path.match(/^\/api\/popups\/([^/]+)\/reviews$/)
      if (request.method === 'GET' && reviewsGetMatch) {
        const popupId = reviewsGetMatch[1]
        const limit = Math.min(parseInt(q.get('limit') || '20'), 50)
        const { results } = await env.POPUPS_DB.prepare(`
          SELECT rating, crowd_level, comment, lang, photos, tags, review_tier, created_at
          FROM reviews WHERE popup_id = ?
          ORDER BY created_at DESC LIMIT ?
        `).bind(popupId, limit).all()

        return json(results)
      }

      // ── POST /api/popups/:id/geo-trigger — 위치 감지 로그
      const geoMatch = path.match(/^\/api\/popups\/([^/]+)\/geo-trigger$/)
      if (request.method === 'POST' && geoMatch) {
        const { user_token, trigger_type, lat, lng } = await request.json()
        if (!user_token) return json({ error: 'user_token 필수' }, 400)

        await env.POPUPS_DB.prepare(`
          INSERT INTO geo_triggers (user_token, popup_id, trigger_type, lat, lng)
          VALUES (?, ?, ?, ?, ?)
        `).bind(user_token, geoMatch[1], trigger_type || 'enter', lat || 0, lng || 0).run()

        return json({ ok: true })
      }

      // ── POST /api/popups/post-review-click — 리뷰 후 추천 클릭 추적
      if (request.method === 'POST' && path === '/api/popups/post-review-click') {
        const { user_token, source_popup, clicked_type, clicked_id, card_position } = await request.json()
        if (!user_token || !source_popup || !clicked_type || !clicked_id)
          return json({ error: 'user_token, source_popup, clicked_type, clicked_id 필수' }, 400)

        await env.POPUPS_DB.prepare(`
          INSERT INTO post_review_clicks (user_token, source_popup, clicked_type, clicked_id, card_position)
          VALUES (?, ?, ?, ?, ?)
        `).bind(user_token, source_popup, clicked_type, clicked_id, card_position || 0).run()

        return json({ ok: true })
      }

      // ── GET /api/popups/:id/stats — 팝업별 통계 (관리자/브랜드)
      const statsMatch = path.match(/^\/api\/popups\/([^/]+)\/stats$/)
      if (request.method === 'GET' && statsMatch) {
        const popupId = statsMatch[1]

        const popup = await env.POPUPS_DB.prepare('SELECT * FROM popups WHERE id = ?').bind(popupId).first()
        if (!popup) return json({ error: 'Not found' }, 404)

        // 반응 집계
        const reactions = await env.POPUPS_DB.prepare(`
          SELECT reaction_type, COUNT(*) AS cnt FROM reactions WHERE popup_id = ? GROUP BY reaction_type
        `).bind(popupId).all()

        // 리뷰 태그 집계
        const reviews = await env.POPUPS_DB.prepare(`
          SELECT tags FROM reviews WHERE popup_id = ?
        `).bind(popupId).all()

        const tagCounts = {}
        for (const r of reviews.results || []) {
          try {
            const tags = JSON.parse(r.tags || '[]')
            for (const tag of tags) tagCounts[tag] = (tagCounts[tag] || 0) + 1
          } catch {}
        }

        // 혼잡도 분포
        const crowds = await env.POPUPS_DB.prepare(`
          SELECT crowd_level, COUNT(*) AS cnt FROM reviews WHERE popup_id = ? GROUP BY crowd_level
        `).bind(popupId).all()

        // 지오트리거 집계
        const geoStats = await env.POPUPS_DB.prepare(`
          SELECT trigger_type, COUNT(*) AS cnt FROM geo_triggers WHERE popup_id = ? GROUP BY trigger_type
        `).bind(popupId).all()

        return json({
          popup_id: popupId,
          views: popup.view_count || 0,
          wishlists: popup.wishlist_count || 0,
          checkins: popup.check_in_count || 0,
          reviews: popup.review_count || 0,
          avg_rating: popup.avg_rating || 0,
          super_likes: popup.super_like_count || 0,
          likes: popup.like_count || 0,
          cn_score: popup.cn_score || 0,
          reactions: Object.fromEntries((reactions.results || []).map(r => [r.reaction_type, r.cnt])),
          tag_counts: tagCounts,
          crowd_distribution: Object.fromEntries((crowds.results || []).map(c => [c.crowd_level, c.cnt])),
          geo_triggers: Object.fromEntries((geoStats.results || []).map(g => [g.trigger_type, g.cnt])),
        })
      }

      // ── GET /api/user/:token/taste — 사용자 취향 프로필
      const tasteMatch = path.match(/^\/api\/user\/([^/]+)\/taste$/)
      if (request.method === 'GET' && tasteMatch) {
        const row = await env.POPUPS_DB.prepare(
          'SELECT * FROM user_taste WHERE user_token = ?'
        ).bind(tasteMatch[1]).first()

        if (!row) return json({ user_token: tasteMatch[1], fav_categories: [], fav_districts: [], visit_count: 0, review_count: 0, explorer_level: 1 })
        return json(row)
      }

      return json({ error: 'Not found' }, 404)

    } catch (e) {
      console.error(e)
      return json({ error: e.message }, 500)
    }
  },
}
