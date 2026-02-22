// 헬퍼 함수들
export function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

export function getDaysUntil(d) {
  if (!d) return null
  const t = new Date(d), n = new Date()
  t.setHours(0,0,0,0); n.setHours(0,0,0,0)
  return Math.ceil((t - n) / 864e5)
}

export function loadWidgetConfig() {
  try { return JSON.parse(localStorage.getItem('home_widgets')) } catch { return null }
}

export function saveWidgetConfig(cfg) {
  localStorage.setItem('home_widgets', JSON.stringify(cfg))
}

export function getDefaultConfig() {
  const enabled = {}
  const order = widgetCategories.map(c => c.id)
  widgetCategories.forEach(cat => {
    cat.widgets.forEach(w => { enabled[w.id] = true })
  })
  return { enabled, order }
}

export function trackActivity(type, data) {
  console.log('[Activity]', type, data)
  // TODO: Analytics 연동
}

export function getTimeInOffset(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const city = new Date(utc + offset * 3600000)
  return city.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}