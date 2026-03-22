/**
 * 인천공항 여객기 운항정보 API (data.go.kr B551177)
 * - VITE_AIRPORT_PROXY_URL 있으면 CF Worker 프록시 사용 (5분 캐시, API키 서버보관)
 * - 없으면 직접 호출 (개발용 fallback, VITE_AIRPORT_API_KEY 필요)
 */
const BASE = 'https://apis.data.go.kr/B551177'

// remark(한국어) → { color, zh, en }
const REMARK_MAP = {
  '출발':      { color: '#6B7280', zh: '已出发',    en: 'Departed'   },
  '출발완료':  { color: '#6B7280', zh: '已出发',    en: 'Departed'   },
  '탑승중':    { color: '#60A5FA', zh: '登机中',    en: 'Boarding'   },
  '탑승마감':  { color: '#9CA3AF', zh: '停止登机',  en: 'Closed'     },
  '지연':      { color: '#FBBF24', zh: '延误',      en: 'Delayed'    },
  '결항':      { color: '#F87171', zh: '取消',      en: 'Cancelled'  },
  '게이트변경':{ color: '#FBBF24', zh: '登机口变更', en: 'Gate Chg'  },
  '출발준비':  { color: '#4ADE80', zh: '准备出发',  en: 'Preparing'  },
}
const DEFAULT_REMARK = { color: '#4ADE80', zh: '准时', en: 'On Time' }

export function getRemarkInfo(remark) {
  return REMARK_MAP[remark?.trim()] || DEFAULT_REMARK
}

function toKSTDate() {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return now.toISOString().slice(0, 10).replace(/-/g, '')
}

// Legacy stubs (used by useDepartureCountdown)
export async function fetchFlightStatus() { return null }
export async function getAirportCongestion() { return null }
export function estimateGateWalkTime() { return null }

export async function fetchDepartureFlights({ date, numOfRows = 200 } = {}) {
  const proxyUrl = import.meta.env.VITE_AIRPORT_PROXY_URL
  const directKey = import.meta.env.VITE_AIRPORT_API_KEY
  if (!proxyUrl && !directKey) return null
  try {
    const today = date || toKSTDate()
    let url
    if (proxyUrl) {
      // CF Worker 프록시 (5분 캐시, API키 노출 없음)
      url = `${proxyUrl}/departures?searchday=${today}&numOfRows=${numOfRows}`
    } else {
      // 직접 호출 (개발용)
      url = `${BASE}/StatusOfPassengerFlightsOdp/getPassengerDeparturesOdp?serviceKey=${directKey}&numOfRows=${numOfRows}&pageNo=1&searchday=${today}&type=json`
    }
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const items = json?.response?.body?.items
    if (!items) return []
    return (Array.isArray(items) ? items : [items]).map(f => ({
      flightId:      f.flightId || '',
      airline:       f.airline || '',
      destination:   f.airport || '',
      airportCode:   f.airportCode || '',
      scheduledTime: f.scheduleDateTime || '',   // 이미 HHMM 형식
      actualTime:    f.estimatedDateTime || '',  // 이미 HHMM 형식
      terminal:      f.terminalId || '',
      gate:          f.gatenumber || '-',
      chkinrange:    f.chkinrange || '',
      remark:        f.remark || '',
    }))
  } catch {
    return null
  }
}
