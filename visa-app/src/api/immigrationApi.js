const BASE = 'https://apis.data.go.kr/B551177'

// 입국장 혼잡도 (승객수 기반 — 대기시간 직접 제공 없음)
export async function fetchArrivalCongestion(terminal = 'T1') {
  const apiKey = import.meta.env.VITE_AIRPORT_API_KEY
  if (!apiKey) return null

  try {
    const url = `${BASE}/StatusOfArrivals/getArrivalsCongestion?serviceKey=${apiKey}&numOfRows=50&pageNo=1&terno=${terminal}&type=json`
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const items = json?.response?.body?.items?.item
    if (!items) return null
    const list = Array.isArray(items) ? items : [items]

    // 외국인/내국인 합산
    const foreigner = list.reduce((s, i) => s + (Number(i.foreigner) || 0), 0)
    const korean = list.reduce((s, i) => s + (Number(i.korean) || 0), 0)

    return {
      terminal,
      lastUpdated: new Date().toISOString(),
      foreigner,
      korean,
    }
  } catch {
    return null
  }
}

export function getCongestionLevel(count) {
  if (count <= 100) return 'low'
  if (count <= 300) return 'medium'
  return 'high'
}
