import { useState, useEffect, useCallback } from 'react'
import { Search, Plane, PlaneLanding, Clock, MapPin, Users, RefreshCw, Star, StarOff, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

const L = (lang, text) => text[lang] || text['ko']

// 중국 주요 공항 (검색 자동완성용)
const CHINA_AIRPORTS = [
  { code: 'PVG', name: { ko: '상하이 푸동', zh: '上海浦东', en: 'Shanghai Pudong' } },
  { code: 'SHA', name: { ko: '상하이 홍차오', zh: '上海虹桥', en: 'Shanghai Hongqiao' } },
  { code: 'PEK', name: { ko: '베이징 수도', zh: '北京首都', en: 'Beijing Capital' } },
  { code: 'PKX', name: { ko: '베이징 다싱', zh: '北京大兴', en: 'Beijing Daxing' } },
  { code: 'CAN', name: { ko: '광저우', zh: '广州白云', en: 'Guangzhou' } },
  { code: 'SZX', name: { ko: '선전', zh: '深圳宝安', en: 'Shenzhen' } },
  { code: 'CTU', name: { ko: '청두', zh: '成都双流', en: 'Chengdu' } },
  { code: 'CKG', name: { ko: '충칭', zh: '重庆江北', en: 'Chongqing' } },
  { code: 'HGH', name: { ko: '항저우', zh: '杭州萧山', en: 'Hangzhou' } },
  { code: 'NKG', name: { ko: '난징', zh: '南京禄口', en: 'Nanjing' } },
  { code: 'WUH', name: { ko: '우한', zh: '武汉天河', en: 'Wuhan' } },
  { code: 'DLC', name: { ko: '다롄', zh: '大连周水子', en: 'Dalian' } },
  { code: 'TAO', name: { ko: '칭다오', zh: '青岛胶东', en: 'Qingdao' } },
  { code: 'SHE', name: { ko: '선양', zh: '沈阳桃仙', en: 'Shenyang' } },
  { code: 'HRB', name: { ko: '하얼빈', zh: '哈尔滨太平', en: 'Harbin' } },
  { code: 'XMN', name: { ko: '샤먼', zh: '厦门高崎', en: 'Xiamen' } },
  { code: 'KMG', name: { ko: '쿤밍', zh: '昆明长水', en: 'Kunming' } },
  { code: 'HKG', name: { ko: '홍콩', zh: '香港', en: 'Hong Kong' } },
  { code: 'MFM', name: { ko: '마카오', zh: '澳门', en: 'Macau' } },
]

// 상태별 표시 정보
const STATUS_INFO = {
  SCHEDULED: {
    label: { ko: '예정', zh: '计划中', en: 'Scheduled' },
    color: '#6B7280', bg: '#F3F4F6', step: 0
  },
  DELAYED: {
    label: { ko: '지연', zh: '延误', en: 'Delayed' },
    color: '#F59E0B', bg: '#FEF3C7', step: 0
  },
  DEPARTED: {
    label: { ko: '출발', zh: '已起飞', en: 'Departed' },
    color: '#3B82F6', bg: '#DBEAFE', step: 1
  },
  APPROACHING: {
    label: { ko: '접근중', zh: '即将降落', en: 'Approaching' },
    color: '#8B5CF6', bg: '#EDE9FE', step: 2
  },
  LANDED: {
    label: { ko: '착륙', zh: '已降落', en: 'Landed' },
    color: '#10B981', bg: '#D1FAE5', step: 3
  },
  ARRIVED: {
    label: { ko: '입국장 도착', zh: '已到达入境大厅', en: 'At Immigration' },
    color: '#059669', bg: '#A7F3D0', step: 4
  },
  CANCELLED: {
    label: { ko: '결항', zh: '取消', en: 'Cancelled' },
    color: '#EF4444', bg: '#FEE2E2', step: -1
  },
  DIVERTED: {
    label: { ko: '회항', zh: '备降', en: 'Diverted' },
    color: '#EF4444', bg: '#FEE2E2', step: -1
  },
  UNKNOWN: {
    label: { ko: '확인중', zh: '确认中', en: 'Checking' },
    color: '#9CA3AF', bg: '#F9FAFB', step: -1
  },
}

// 혼잡도 표시
const CONGESTION_INFO = {
  SMOOTH: { label: { ko: '원활', zh: '顺畅', en: 'Smooth' }, color: '#10B981' },
  NORMAL: { label: { ko: '보통', zh: '一般', en: 'Normal' }, color: '#F59E0B' },
  BUSY: { label: { ko: '혼잡', zh: '拥挤', en: 'Busy' }, color: '#EF4444' },
  VERY_BUSY: { label: { ko: '매우혼잡', zh: '非常拥挤', en: 'Very Busy' }, color: '#DC2626' },
  UNKNOWN: { label: { ko: '-', zh: '-', en: '-' }, color: '#9CA3AF' },
}

// 인천공항 API 호출
async function fetchFlightFromAPI(flightNumber) {
  const INCHEON_BASE = 'https://apis.data.go.kr/B551177'
  // API key from env
  const apiKey = import.meta.env.VITE_AIRPORT_API_KEY

  if (!apiKey) return null

  // 입국장현황 API 조회
  try {
    const url = `${INCHEON_BASE}/StatusOfArrivals/getArrivalsCongestion?serviceKey=${encodeURIComponent(apiKey)}&type=json&numOfRows=100&pageNo=1`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()

    const items = data?.response?.body?.items
    let flights = []
    if (Array.isArray(items)) flights = items
    else if (items?.item) flights = Array.isArray(items.item) ? items.item : [items.item]

    // 편명으로 필터
    const normalized = flightNumber.toUpperCase().replace(/\s/g, '')
    const found = flights.find(f => {
      const fNum = (f.flightId || '').toUpperCase().replace(/\s/g, '')
      return fNum === normalized || fNum.replace('-', '') === normalized
    })

    if (!found) return null

    return {
      flightNumber: found.flightId?.trim(),
      airline: found.airFln?.trim() || '',
      origin: found.airport?.trim() || '',
      originCity: found.city?.trim() || '',
      destination: 'ICN',
      terminal: found.terno?.trim() || '',
      gate: found.gateNbr?.trim() || '',
      immigrationGate: found.entGateNbr?.trim() || '',
      scheduledAt: found.estimatedDateTime?.trim() || '',
      actualAt: found.actualDateTime?.trim() || '',
      status: parseStatus(found.actualDateTime, null),
      foreignPassengers: found.waitPCnt2 ? parseInt(found.waitPCnt2) || null : null,
      domesticPassengers: found.waitPCnt1 ? parseInt(found.waitPCnt1) || null : null,
      congestion: found.congestion?.trim() || 'UNKNOWN',
      source: 'LIVE',
    }
  } catch (e) {
    console.error('Flight API error:', e)
    return null
  }
}

function parseStatus(actualAt, remark) {
  if (actualAt && actualAt.trim() !== '') return 'LANDED'
  if (remark) {
    if (remark.includes('지연') || remark === 'DELAYED') return 'DELAYED'
    if (remark.includes('결항') || remark === 'CANCELLED') return 'CANCELLED'
    if (remark.includes('접근') || remark === 'APPROACHING') return 'APPROACHING'
    if (remark.includes('착륙') || remark.includes('도착') || remark === 'ARRIVED') return 'LANDED'
  }
  return 'SCHEDULED'
}

function parseCongestionStr(raw) {
  if (!raw) return 'UNKNOWN'
  if (raw.includes('원활') || raw === 'smooth') return 'SMOOTH'
  if (raw.includes('보통') || raw === 'normal') return 'NORMAL'
  if (raw.includes('매우혼잡') || raw === 'very busy') return 'VERY_BUSY'
  if (raw.includes('혼잡') || raw === 'busy') return 'BUSY'
  return 'UNKNOWN'
}

function formatTime(dateStr) {
  if (!dateStr) return '--:--'
  // YYYYMMDD HHmm or YYYYMMDDHHmm
  const cleaned = dateStr.replace(/\s/g, '')
  if (/^\d{12}$/.test(cleaned)) {
    return `${cleaned.slice(8, 10)}:${cleaned.slice(10, 12)}`
  }
  // ISO format
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
  } catch {}
  return dateStr
}

// 데모용 mock 데이터 생성
function getMockFlight(flightNumber) {
  const now = new Date()
  const statuses = ['SCHEDULED', 'DEPARTED', 'APPROACHING', 'LANDED']
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  const hour = now.getHours()
  const schedHour = hour + (randomStatus === 'SCHEDULED' ? 2 : randomStatus === 'DEPARTED' ? 1 : 0)
  const schedTime = `${String(schedHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // 편명에서 공항 추정
  const code = flightNumber.replace(/[0-9]/g, '').toUpperCase()
  const airlineMap = {
    'CA': { airline: '中国国际航空', origin: 'PEK', city: '北京' },
    'MU': { airline: '中国东方航空', origin: 'PVG', city: '上海' },
    'CZ': { airline: '中国南方航空', origin: 'CAN', city: '广州' },
    'HU': { airline: '海南航空', origin: 'PEK', city: '北京' },
    'ZH': { airline: '深圳航空', origin: 'SZX', city: '深圳' },
    'SC': { airline: '山东航空', origin: 'TAO', city: '青岛' },
    'OZ': { airline: '아시아나항공', origin: 'PVG', city: '上海' },
    'KE': { airline: '대한항공', origin: 'PVG', city: '上海' },
    'TW': { airline: '티웨이항공', origin: 'PVG', city: '上海' },
    'LJ': { airline: '진에어', origin: 'PVG', city: '上海' },
    '7C': { airline: '제주항공', origin: 'PVG', city: '上海' },
  }
  const info = airlineMap[code] || { airline: code + ' Airlines', origin: 'PVG', city: '上海' }

  return {
    flightNumber: flightNumber.toUpperCase(),
    airline: info.airline,
    origin: info.origin,
    originCity: info.city,
    destination: 'ICN',
    terminal: Math.random() > 0.5 ? 'T1' : 'T2',
    gate: randomStatus === 'LANDED' ? `${Math.floor(Math.random() * 50) + 1}` : '',
    immigrationGate: randomStatus === 'LANDED' ? `${Math.floor(Math.random() * 8) + 1}번` : '',
    scheduledAt: schedTime,
    actualAt: randomStatus === 'LANDED' ? schedTime : '',
    status: randomStatus,
    foreignPassengers: randomStatus === 'LANDED' ? Math.floor(Math.random() * 150) + 50 : null,
    domesticPassengers: randomStatus === 'LANDED' ? Math.floor(Math.random() * 100) + 30 : null,
    congestion: randomStatus === 'LANDED' ? ['SMOOTH', 'NORMAL', 'BUSY'][Math.floor(Math.random() * 3)] : 'UNKNOWN',
    source: 'DEMO',
  }
}

// 진행 타임라인 컴포넌트
function FlightTimeline({ status, lang }) {
  const steps = [
    { key: 'SCHEDULED', label: { ko: '예정', zh: '计划', en: 'Scheduled' } },
    { key: 'DEPARTED', label: { ko: '출발', zh: '起飞', en: 'Departed' } },
    { key: 'APPROACHING', label: { ko: '접근', zh: '接近', en: 'Approach' } },
    { key: 'LANDED', label: { ko: '착륙', zh: '降落', en: 'Landed' } },
    { key: 'ARRIVED', label: { ko: '입국장', zh: '入境', en: 'Arrival' } },
  ]

  const info = STATUS_INFO[status] || STATUS_INFO.UNKNOWN
  const currentStep = info.step

  if (currentStep === -1) {
    // 결항/회항/불명
    return (
      <div className="flex items-center justify-center py-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: info.bg }}>
          {status === 'CANCELLED' ? <XCircle size={16} style={{ color: info.color }} /> : <AlertTriangle size={16} style={{ color: info.color }} />}
          <span className="text-sm font-semibold" style={{ color: info.color }}>{L(lang, info.label)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-3">
      <div className="flex items-center justify-between relative">
        {/* 라인 */}
        <div className="absolute top-3 left-4 right-4 h-0.5 bg-gray-200" />
        <div
          className="absolute top-3 left-4 h-0.5 transition-all duration-500"
          style={{
            width: `${Math.min(currentStep / (steps.length - 1) * 100, 100)}%`,
            maxWidth: 'calc(100% - 32px)',
            backgroundColor: info.color
          }}
        />

        {steps.map((step, i) => {
          const isActive = i <= currentStep
          const isCurrent = i === currentStep
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: isActive ? info.color : '#E5E7EB',
                  transform: isCurrent ? 'scale(1.3)' : 'scale(1)',
                  boxShadow: isCurrent ? `0 0 0 4px ${info.bg}` : 'none'
                }}
              >
                {isActive && <CheckCircle size={12} className="text-white" />}
              </div>
              <span
                className="text-[10px] mt-1.5 whitespace-nowrap"
                style={{
                  color: isActive ? info.color : '#9CA3AF',
                  fontWeight: isCurrent ? 700 : 400
                }}
              >
                {L(lang, step.label)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function FlightPocket({ lang }) {
  const [flightInput, setFlightInput] = useState('')
  const [savedFlights, setSavedFlights] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('saved_flights')) || []
    } catch { return [] }
  })
  const [flightResults, setFlightResults] = useState({}) // { flightNumber: flightData }
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    localStorage.setItem('saved_flights', JSON.stringify(savedFlights))
  }, [savedFlights])

  // 저장된 편 자동 조회 (앱 열 때)
  useEffect(() => {
    if (savedFlights.length > 0) {
      refreshAllFlights()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  const searchFlight = useCallback(async (flightNumber) => {
    if (!flightNumber || flightNumber.length < 3) return null
    const normalized = flightNumber.toUpperCase().replace(/\s/g, '')

    setLoading(true)
    try {
      // 실제 API 시도
      const liveResult = await fetchFlightFromAPI(normalized)
      if (liveResult) {
        setFlightResults(prev => ({ ...prev, [normalized]: liveResult }))
        setLastRefresh(new Date())
        return liveResult
      }

      // API 키 없거나 결과 없으면 → 데모 데이터
      const mock = getMockFlight(normalized)
      setFlightResults(prev => ({ ...prev, [normalized]: mock }))
      setLastRefresh(new Date())
      return mock
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshAllFlights = useCallback(async () => {
    setLoading(true)
    try {
      for (const fn of savedFlights) {
        await searchFlight(fn)
      }
    } finally {
      setLoading(false)
    }
  }, [savedFlights, searchFlight])

  const handleSearch = async () => {
    const fn = flightInput.trim().toUpperCase().replace(/\s/g, '')
    if (fn.length < 3) {
      showToast(L(lang, { ko: '편명을 입력하세요 (예: CA123)', zh: '请输入航班号 (如: CA123)', en: 'Enter flight number (e.g. CA123)' }))
      return
    }
    await searchFlight(fn)
    setFlightInput('')
  }

  const toggleSave = (flightNumber) => {
    const fn = flightNumber.toUpperCase()
    setSavedFlights(prev => {
      if (prev.includes(fn)) {
        return prev.filter(f => f !== fn)
      }
      return [...prev, fn]
    })
  }

  const removeFlight = (flightNumber) => {
    setSavedFlights(prev => prev.filter(f => f !== flightNumber))
    setFlightResults(prev => {
      const next = { ...prev }
      delete next[flightNumber]
      return next
    })
  }

  const getAirportName = (code) => {
    const airport = CHINA_AIRPORTS.find(a => a.code === code)
    return airport ? L(lang, airport.name) : code
  }

  return (
    <div className="space-y-4">
      {/* 검색 영역 */}
      <div>
        <p className="text-xs text-gray-500 mb-2">
          {L(lang, {
            ko: '편명을 입력하면 실시간 도착 현황을 확인할 수 있어요',
            zh: '输入航班号即可查看实时到达状态',
            en: 'Enter a flight number to check real-time arrival status'
          })}
        </p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={flightInput}
              onChange={e => setFlightInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={L(lang, { ko: '편명 입력 (CA123)', zh: '航班号 (CA123)', en: 'Flight # (CA123)' })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-white"
              style={{ fontFamily: 'Inter, monospace' }}
              maxLength={10}
            />
            <Plane size={14} className="absolute right-3 top-3 text-gray-300" />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2.5 bg-[#111827] text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {L(lang, { ko: '조회', zh: '查询', en: 'Search' })}
          </button>
        </div>
      </div>

      {/* 새로고침 바 */}
      {savedFlights.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {lastRefresh
              ? `${L(lang, { ko: '마지막 업데이트', zh: '最后更新', en: 'Updated' })} ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : ''}
          </span>
          <button
            onClick={refreshAllFlights}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {L(lang, { ko: '새로고침', zh: '刷新', en: 'Refresh' })}
          </button>
        </div>
      )}

      {/* 저장된 비행편 + 검색 결과 */}
      {Object.keys(flightResults).length === 0 && savedFlights.length === 0 && (
        <div className="text-center py-8">
          <PlaneLanding size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">
            {L(lang, {
              ko: '편명을 검색해보세요',
              zh: '搜索航班号试试',
              en: 'Search for a flight'
            })}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            {L(lang, {
              ko: '예: CA123, MU5041, OZ331',
              zh: '例: CA123, MU5041, OZ331',
              en: 'e.g. CA123, MU5041, OZ331'
            })}
          </p>
        </div>
      )}

      {/* 비행편 카드들 */}
      <div className="space-y-3">
        {/* 저장된 편 먼저, 그 다음 검색 결과 */}
        {[...new Set([...savedFlights, ...Object.keys(flightResults)])].map(fn => {
          const flight = flightResults[fn]
          if (!flight) return null

          const statusInfo = STATUS_INFO[flight.status] || STATUS_INFO.UNKNOWN
          const isSaved = savedFlights.includes(fn)
          const congestionInfo = CONGESTION_INFO[parseCongestionStr(flight.congestion)] || CONGESTION_INFO.UNKNOWN

          return (
            <div key={fn} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: statusInfo.bg }}>
                    <Plane size={14} style={{ color: statusInfo.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ fontFamily: 'Inter, monospace', color: '#111827' }}>
                        {flight.flightNumber}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                      >
                        {L(lang, statusInfo.label)}
                      </span>
                      {flight.source === 'DEMO' && (
                        <span className="text-[9px] text-gray-300 border border-gray-200 rounded px-1">DEMO</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{flight.airline}</span>
                  </div>
                </div>
                <button onClick={() => toggleSave(fn)} className="p-1.5">
                  {isSaved
                    ? <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    : <StarOff size={18} className="text-gray-300" />
                  }
                </button>
              </div>

              {/* 노선 정보 */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold" style={{ color: '#111827' }}>{flight.origin}</p>
                    <p className="text-[11px] text-gray-400">{flight.originCity || getAirportName(flight.origin)}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="flex items-center gap-1 text-gray-300">
                      <div className="w-8 h-px bg-gray-300" />
                      <Plane size={14} className="text-gray-400 rotate-90" style={{ transform: 'rotate(90deg)' }} />
                      <div className="w-8 h-px bg-gray-300" />
                    </div>
                    <span className="text-[10px] text-gray-300 mt-0.5">
                      {flight.destination === 'ICN' ? '인천' : flight.destination === 'GMP' ? '김포' : flight.destination}
                    </span>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold" style={{ color: '#111827' }}>{flight.destination}</p>
                    <p className="text-[11px] text-gray-400">
                      {flight.destination === 'ICN'
                        ? L(lang, { ko: '인천국제공항', zh: '仁川国际机场', en: 'Incheon Intl' })
                        : L(lang, { ko: '김포국제공항', zh: '金浦国际机场', en: 'Gimpo Intl' })
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* 타임라인 */}
              <div className="px-4">
                <FlightTimeline status={flight.status} lang={lang} />
              </div>

              {/* 상세 정보 */}
              <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                {/* 도착 예정 시간 */}
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-gray-500">
                    {L(lang, { ko: '예정', zh: '预计', en: 'ETA' })}
                  </span>
                  <span className="font-semibold" style={{ color: '#111827' }}>
                    {formatTime(flight.scheduledAt)}
                  </span>
                </div>

                {/* 실제 도착 시간 */}
                {flight.actualAt && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-gray-500">
                      {L(lang, { ko: '착륙', zh: '降落', en: 'Actual' })}
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatTime(flight.actualAt)}
                    </span>
                  </div>
                )}

                {/* 터미널 */}
                {flight.terminal && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="text-gray-500">
                      {L(lang, { ko: '터미널', zh: '航站楼', en: 'Terminal' })}
                    </span>
                    <span className="font-semibold" style={{ color: '#111827' }}>{flight.terminal}</span>
                  </div>
                )}

                {/* 게이트 */}
                {flight.gate && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="text-gray-500">
                      {L(lang, { ko: '게이트', zh: '登机口', en: 'Gate' })}
                    </span>
                    <span className="font-semibold" style={{ color: '#111827' }}>{flight.gate}</span>
                  </div>
                )}

                {/* 입국장 게이트 */}
                {flight.immigrationGate && (
                  <div className="flex items-center gap-1.5 text-xs col-span-2">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-gray-500">
                      {L(lang, { ko: '입국장', zh: '入境大厅', en: 'Immigration' })}
                    </span>
                    <span className="font-semibold" style={{ color: '#111827' }}>{flight.immigrationGate}</span>
                    {flight.congestion && flight.congestion !== 'UNKNOWN' && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-1"
                        style={{ backgroundColor: congestionInfo.color + '20', color: congestionInfo.color }}
                      >
                        {L(lang, congestionInfo.label)}
                      </span>
                    )}
                  </div>
                )}

                {/* 대기인원 */}
                {(flight.foreignPassengers || flight.domesticPassengers) && (
                  <div className="flex items-center gap-1.5 text-xs col-span-2">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-gray-500">
                      {L(lang, { ko: '입국심사 대기', zh: '入境审查排队', en: 'Immigration Queue' })}
                    </span>
                    {flight.foreignPassengers && (
                      <span className="text-[11px]">
                        <span className="text-gray-400">{L(lang, { ko: '외국인', zh: '外国人', en: 'Foreign' })}</span>{' '}
                        <span className="font-semibold" style={{ color: '#111827' }}>{flight.foreignPassengers}{L(lang, { ko: '명', zh: '人', en: '' })}</span>
                      </span>
                    )}
                    {flight.domesticPassengers && (
                      <span className="text-[11px] ml-2">
                        <span className="text-gray-400">{L(lang, { ko: '내국인', zh: '韩国人', en: 'Domestic' })}</span>{' '}
                        <span className="font-semibold" style={{ color: '#111827' }}>{flight.domesticPassengers}{L(lang, { ko: '명', zh: '人', en: '' })}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 삭제 버튼 (저장 안 된 검색 결과) */}
              {!isSaved && (
                <div className="border-t border-gray-100 px-4 py-2 flex justify-end">
                  <button
                    onClick={() => removeFlight(fn)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    {L(lang, { ko: '닫기', zh: '关闭', en: 'Close' })}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 도움말 */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-400 space-y-1">
        <p className="font-medium text-gray-500">
          {L(lang, { ko: '💡 이렇게 사용하세요', zh: '💡 使用方法', en: '💡 How to use' })}
        </p>
        <p>
          {L(lang, {
            ko: '1. 가족/친구의 편명 입력 (예: CA123)',
            zh: '1. 输入家人/朋友的航班号 (如: CA123)',
            en: '1. Enter flight number (e.g. CA123)'
          })}
        </p>
        <p>
          {L(lang, {
            ko: '2. ⭐ 눌러 저장하면 앱 열 때마다 자동 조회',
            zh: '2. 点 ⭐ 保存后每次打开自动查询',
            en: '2. Tap ⭐ to save — auto-checks when you open the app'
          })}
        </p>
        <p>
          {L(lang, {
            ko: '3. 착륙 후 입국장 게이트와 혼잡도 확인 가능',
            zh: '3. 降落后可查看入境大厅和拥挤程度',
            en: '3. After landing, see immigration gate & congestion'
          })}
        </p>
      </div>

      {/* 토스트 */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-xs px-4 py-2 rounded-full shadow-lg z-50 animate-pulse">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
