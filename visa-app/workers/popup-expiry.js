// popup-expiry.js — 자동 만료 Cron Worker
// 매일 KST 10:00 (UTC 01:00) 실행

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runExpiry(env))
  },

  // 로컬 테스트용
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/run') {
      await runExpiry(env)
      return new Response('Done', { status: 200 })
    }
    return new Response('Popup Expiry Worker', { status: 200 })
  },
}

async function runExpiry(env) {
  const today = new Date().toISOString().split('T')[0]

  // 1. 만료된 팝업 처리
  const { meta: expMeta } = await env.POPUPS_DB.prepare(`
    UPDATE popups
    SET is_expired = 1, is_active = 0,
        expires_processed_at = CURRENT_TIMESTAMP
    WHERE is_expired = 0
      AND end_date < date('now', 'localtime')
  `).run()

  console.log(`[Expiry] ${today}: ${expMeta.changes}개 만료 처리`)

  // 2. 오늘 오픈 팝업 — start_date = today (is_active 자동 활성화)
  const { meta: openMeta } = await env.POPUPS_DB.prepare(`
    UPDATE popups
    SET is_active = 1
    WHERE is_active = 0
      AND is_expired = 0
      AND start_date = date('now', 'localtime')
  `).run()

  console.log(`[Expiry] ${today}: ${openMeta.changes}개 오늘 오픈`)

  // 3. 7일 이내 마감 팝업 목록 (Push 알림용 — 추후 연동)
  const { results: closingSoon } = await env.POPUPS_DB.prepare(`
    SELECT id, title_ko, title_zh, end_date,
           CAST(julianday(end_date) - julianday(date('now','localtime')) AS INTEGER) AS days_left
    FROM popups
    WHERE is_active = 1 AND is_expired = 0
      AND end_date <= date('now', 'localtime', '+7 days')
    ORDER BY end_date ASC
  `).all()

  console.log(`[Expiry] 마감 임박 ${closingSoon.length}개:`, closingSoon.map(p => `${p.title_ko}(D-${p.days_left})`).join(', '))

  return {
    expired: expMeta.changes,
    opened: openMeta.changes,
    closing_soon: closingSoon.length,
  }
}
