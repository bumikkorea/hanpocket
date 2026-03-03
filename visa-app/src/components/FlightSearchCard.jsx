import { useState } from 'react'
import { Plane, Search, Clock, ArrowRight, AlertTriangle, Info, ChevronDown, Loader2, Phone, Luggage } from 'lucide-react'
import { useFlightSearch } from '../hooks/useFlightSearch'
import { guessAircraftType, AIRCRAFT_TYPES } from '../data/aircraftData'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const card = "bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow"

// 운항 상태 매핑 (중국어 + 한국어 + 영어 API 응답 모두 대응)
const STATUS_MAP = {
  '到达': { color: 'green', label: { ko: '도착', zh: '到达', en: 'Arrived' } },
  '出发': { color: 'blue', label: { ko: '출발', zh: '出发', en: 'Departed' } },
  '延误': { color: 'amber', label: { ko: '지연', zh: '延误', en: 'Delayed' } },
  '取消': { color: 'red', label: { ko: '결항', zh: '取消', en: 'Cancelled' } },
  '着陆': { color: 'green', label: { ko: '착륙', zh: '着陆', en: 'Landed' } },
  '返航': { color: 'orange', label: { ko: '회항', zh: '返航', en: 'Returned' } },
  '도착': { color: 'green', label: { ko: '도착', zh: '到达', en: 'Arrived' } },
  '출발': { color: 'blue', label: { ko: '출발', zh: '出发', en: 'Departed' } },
  '지연': { color: 'amber', label: { ko: '지연', zh: '延误', en: 'Delayed' } },
  '결항': { color: 'red', label: { ko: '결항', zh: '取消', en: 'Cancelled' } },
  '착륙': { color: 'green', label: { ko: '착륙', zh: '着陆', en: 'Landed' } },
  '회항': { color: 'orange', label: { ko: '회항', zh: '返航', en: 'Returned' } },
  '탑승중': { color: 'blue', label: { ko: '탑승중', zh: '登机中', en: 'Boarding' } },
  '登机中': { color: 'blue', label: { ko: '탑승중', zh: '登机中', en: 'Boarding' } },
  '마감': { color: 'gray', label: { ko: '마감', zh: '截止', en: 'Closed' } },
  '截止': { color: 'gray', label: { ko: '마감', zh: '截止', en: 'Closed' } },
}

const STATUS_COLORS = {
  green: 'bg-green-100 text-green-700 border-green-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
}

// 터미널 ID 매핑
const TERMINAL_MAP = {
  'P01': { ko: '제1터미널', zh: '第1航站楼 (T1)', en: 'Terminal 1' },
  'P02': { ko: '탑승동', zh: '登机楼', en: 'Concourse' },
  'P03': { ko: '제2터미널', zh: '第2航站楼 (T2)', en: 'Terminal 2' },
}

function formatTime(t) {
  if (!t || t.length < 4) return '--:--'
  return `${t.substring(0, 2)}:${t.substring(2, 4)}`
}

export default function FlightSearchCard({ lang }) {
  const [query, setQuery] = useState('')
  const [searchTrigger, setSearchTrigger] = useState('')
  const [expandedIdx, setExpandedIdx] = useState(null)

  const { results, loading, error, limitWarning, remainingRequests } = useFlightSearch(searchTrigger, {
    enabled: searchTrigger.length >= 3,
  })

  const allFlights = [
    ...(results.arrivals || []).map(f => ({ ...f, _dir: 'arrival' })),
    ...(results.departures || []).map(f => ({ ...f, _dir: 'departure' })),
  ]

  const handleSearch = () => {
    if (query.length >= 2) {
      setSearchTrigger(query.trim())
      setExpandedIdx(null)
    }
  }

  return (
    <div className={card}>
      {/* 헤더 */}
      <h3 className="text-sm font-bold text-[#111827] mb-1 flex items-center gap-2">
        <Plane size={16} />
        {L(lang, { ko: '실시간 항공편 조회', zh: '实时航班查询', en: 'Real-time Flight Search' })}
      </h3>
      <p className="text-[10px] text-[#9CA3AF] mb-3">
        {L(lang, {
          ko: '인천공항 출발·도착 항공편을 실시간으로 조회합니다 (당일)',
          zh: '实时查询仁川机场出发·到达航班（当日）',
          en: 'Search real-time Incheon Airport departures & arrivals (today)',
        })}
      </p>

      {/* 검색 입력 */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={L(lang, { ko: '편명 (예: KE123)', zh: '航班号（例：KE123）', en: 'Flight (e.g. KE123)' })}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#111827] uppercase tracking-wider font-mono"
          maxLength={10}
        />
        <button
          onClick={handleSearch}
          disabled={query.length < 2 || loading}
          className="px-4 py-2.5 bg-[#111827] text-white text-xs font-bold rounded-lg disabled:opacity-30 active:opacity-80 flex items-center gap-1.5 shrink-0"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          {L(lang, { ko: '조회', zh: '查询', en: 'Search' })}
        </button>
      </div>

      {/* 일일 한도 경고 */}
      {limitWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
          <p className="text-[10px] text-amber-700 flex items-center gap-1">
            <AlertTriangle size={10} />
            {L(lang, {
              ko: `오늘 남은 조회: ${remainingRequests}회 / 1,000회`,
              zh: `今日剩余查询：${remainingRequests}次 / 1,000次`,
              en: `Remaining today: ${remainingRequests} / 1,000`,
            })}
          </p>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex justify-center items-center py-6 gap-2 text-xs text-[#9CA3AF]">
          <Loader2 size={16} className="animate-spin" />
          {L(lang, { ko: '항공편 조회 중...', zh: '正在查询航班...', en: 'Searching flights...' })}
        </div>
      )}

      {/* 에러: 일일 한도 초과 */}
      {!loading && error === 'DAILY_LIMIT_EXCEEDED' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2 text-xs text-red-600">
          {L(lang, { ko: '일일 조회 한도(1,000회)를 초과했습니다', zh: '已超过每日查询限额（1,000次）', en: 'Daily query limit (1,000) exceeded' })}
        </div>
      )}

      {/* 에러: API 실패 → 인천공항 홈페이지 링크 + 기종 폴백 */}
      {!loading && error && error !== 'DAILY_LIMIT_EXCEEDED' && searchTrigger && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-700 space-y-1.5">
            <p className="flex items-start gap-1.5">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              <span>{L(lang, {
                ko: '일시적으로 조회할 수 없습니다. 아래에서 직접 확인해주세요.',
                zh: '暂时无法查询，请通过以下链接直接确认。',
                en: 'Temporarily unavailable. Please check directly below.',
              })}</span>
            </p>
            <a
              href="https://www.airport.kr/ap/ko/dep/depPasSchFind.do"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 underline font-medium"
            >
              {L(lang, { ko: '인천공항 운항정보 →', zh: '仁川机场航班信息 →', en: 'Incheon Airport Flights →' })}
            </a>
          </div>
          <StaticAircraftFallback flightId={searchTrigger} lang={lang} />
        </div>
      )}

      {/* 결과 없음 (API 성공했지만 결과 0건) */}
      {!loading && !error && searchTrigger && allFlights.length === 0 && (
        <div className="text-center py-6 text-xs text-[#9CA3AF]">
          <Plane size={24} className="mx-auto mb-2 opacity-30" />
          <p>{L(lang, { ko: '현재 시간대 운항편이 없습니다', zh: '当前时段没有航班', en: 'No flights in current time slot' })}</p>
          <p className="mt-1 text-[10px]">{L(lang, { ko: '당일 운항편만 조회 가능합니다', zh: '仅可查询当日航班', en: 'Only today\'s flights are available' })}</p>
        </div>
      )}

      {/* 결과 목록 */}
      {!loading && allFlights.length > 0 && (
        <div className="space-y-2">
          {allFlights.map((flight, i) => (
            <FlightCard
              key={`${flight.flightId}-${flight._dir}-${i}`}
              flight={flight}
              lang={lang}
              expanded={expandedIdx === i}
              onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FlightCard({ flight, lang, expanded, onToggle }) {
  const remark = flight.remark || flight.remarkKor || ''
  const status = STATUS_MAP[remark] || {
    color: 'gray',
    label: { ko: remark || '-', zh: remark || '-', en: remark || '-' },
  }
  const isArrival = flight._dir === 'arrival'
  const terminal = TERMINAL_MAP[flight.terminalId]
  const aircraftGuess = guessAircraftType(flight.flightId, flight.elapsetime)

  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
      {/* 메인 (클릭 시 토글) */}
      <button onClick={onToggle} className="w-full text-left p-3 active:bg-gray-50">
        {/* 편명 + 방향 + 상태 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#111827] tracking-wide">{flight.flightId}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isArrival ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
              {isArrival
                ? L(lang, { ko: '도착', zh: '到达', en: 'ARR' })
                : L(lang, { ko: '출발', zh: '出发', en: 'DEP' })}
            </span>
          </div>
          {remark && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[status.color] || STATUS_COLORS.gray}`}>
              {L(lang, status.label)}
            </span>
          )}
        </div>

        {/* 시간 + 노선 */}
        <div className="flex items-center gap-2 text-xs">
          {/* 예정 시간 */}
          <div className="text-center min-w-[44px]">
            <p className="font-bold text-[#111827] text-sm">{formatTime(flight.scheduleDateTime)}</p>
            <p className="text-[9px] text-[#9CA3AF]">{L(lang, { ko: '예정', zh: '计划', en: 'Plan' })}</p>
          </div>

          {/* 변경 시간 (있으면) */}
          {flight.estimatedDateTime && flight.estimatedDateTime !== flight.scheduleDateTime && (
            <>
              <ArrowRight size={12} className="text-[#D1D5DB] shrink-0" />
              <div className="text-center min-w-[44px]">
                <p className="font-bold text-amber-600 text-sm">{formatTime(flight.estimatedDateTime)}</p>
                <p className="text-[9px] text-amber-500">{L(lang, { ko: '변경', zh: '预计', en: 'Est' })}</p>
              </div>
            </>
          )}

          {/* 항공사 + 공항 */}
          <div className="ml-auto text-right">
            <p className="text-[10px] text-[#9CA3AF]">{flight.airline}</p>
            <p className="font-semibold text-[#111827]">{flight.airport}</p>
          </div>

          {/* 펼침 화살표 */}
          <ChevronDown size={14} className="text-[#9CA3AF] shrink-0 transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }} />
        </div>
      </button>

      {/* 상세 정보 (펼침) */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-[#F3F4F6]">
          <div className="pt-2.5 space-y-1.5 text-xs">
            {/* 터미널 */}
            {terminal && (
              <DetailRow
                label={L(lang, { ko: '터미널', zh: '航站楼', en: 'Terminal' })}
                value={L(lang, terminal)}
              />
            )}

            {/* 탑승구 */}
            {flight.gatenumber && (
              <DetailRow
                label={L(lang, { ko: '탑승구', zh: '登机口', en: 'Gate' })}
                value={flight.gatenumber}
              />
            )}

            {/* 수하물 벨트 (도착편만) */}
            {isArrival && flight.carousel && (
              <DetailRow
                label={L(lang, { ko: '수하물', zh: '行李转盘', en: 'Carousel' })}
                value={flight.carousel}
                icon={<Luggage size={12} className="text-[#9CA3AF]" />}
              />
            )}

            {/* 소요시간 */}
            {flight.elapsetime && (
              <DetailRow
                label={L(lang, { ko: '소요시간', zh: '飞行时间', en: 'Duration' })}
                value={formatTime(flight.elapsetime)}
                icon={<Clock size={12} className="text-[#9CA3AF]" />}
              />
            )}

            {/* 코드쉐어 */}
            {flight.codeshare && (
              <DetailRow
                label={L(lang, { ko: '코드쉐어', zh: '代码共享', en: 'Codeshare' })}
                value={flight.masterflightid || flight.codeshare}
              />
            )}

            {/* 경유지 */}
            {flight.firstopovername && (
              <DetailRow
                label={L(lang, { ko: '경유', zh: '经停', en: 'Via' })}
                value={`${flight.firstopovername}${flight.secstopovername ? ` → ${flight.secstopovername}` : ''}`}
              />
            )}

            {/* 예상 기종 */}
            {aircraftGuess && (
              <div className="mt-2 bg-[#F9FAFB] rounded-lg p-2.5">
                <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1 mb-1">
                  <Info size={10} />
                  {L(lang, { ko: '예상 기종 (참고용)', zh: '预估机型（仅供参考）', en: 'Estimated aircraft (reference)' })}
                </p>
                <p className="text-xs font-semibold text-[#374151]">{aircraftGuess.hint}</p>
                {aircraftGuess.aircraft && (
                  <div className="mt-1 flex gap-3 text-[10px] text-[#6B7280]">
                    <span>{L(lang, { ko: '좌석', zh: '座位', en: 'Seats' })}: {aircraftGuess.aircraft.seats}</span>
                    <span>{L(lang, { ko: '항속', zh: '航程', en: 'Range' })}: {aircraftGuess.aircraft.range}</span>
                    <span>{L(lang, aircraftGuess.aircraft.type)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6B7280] flex items-center gap-1">{icon}{label}</span>
      <span className="font-semibold text-[#111827]">{value}</span>
    </div>
  )
}

// API 에러 시 정적 기종 정보 폴백 카드
function StaticAircraftFallback({ flightId, lang }) {
  const airlineCode = flightId.replace(/[0-9]/g, '').substring(0, 2)
  // 소요시간 없이 3가지 범위 모두 추정
  const short = guessAircraftType(airlineCode, '0200')
  const medium = guessAircraftType(airlineCode, '0400')
  const long = guessAircraftType(airlineCode, '0800')
  const guesses = [short, medium, long].filter(Boolean)

  // 중복 hint 제거
  const seen = new Set()
  const unique = guesses.filter(g => {
    if (seen.has(g.hint)) return false
    seen.add(g.hint)
    return true
  })

  if (unique.length === 0) {
    return (
      <div className="text-center py-4 text-xs text-[#9CA3AF]">
        <Plane size={20} className="mx-auto mb-1.5 opacity-30" />
        <p>{L(lang, {
          ko: `${airlineCode} 항공사의 기종 정보가 없습니다`,
          zh: `暂无${airlineCode}航空公司的机型信息`,
          en: `No aircraft data for ${airlineCode}`,
        })}</p>
      </div>
    )
  }

  const rangeLabels = {
    short: { ko: '단거리', zh: '短途', en: 'Short' },
    medium: { ko: '중거리', zh: '中程', en: 'Medium' },
    long: { ko: '장거리', zh: '远程', en: 'Long' },
  }

  return (
    <div className="border border-[#E5E7EB] rounded-xl p-3 space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-black text-[#111827] tracking-wide">{flightId}</span>
        <span className="text-[10px] text-[#9CA3AF]">
          {L(lang, { ko: '예상 기종', zh: '预估机型', en: 'Estimated aircraft' })}
        </span>
      </div>
      {unique.map((g, i) => (
        <div key={i} className="bg-[#F9FAFB] rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#374151]">{g.hint}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-[#6B7280] font-medium">
              {L(lang, rangeLabels[g.rangeType] || rangeLabels.short)}
            </span>
          </div>
          {g.aircraft && (
            <div className="flex gap-3 text-[10px] text-[#6B7280]">
              <span>{L(lang, { ko: '좌석', zh: '座位', en: 'Seats' })}: {g.aircraft.seats}</span>
              <span>{L(lang, { ko: '항속', zh: '航程', en: 'Range' })}: {g.aircraft.range}</span>
              <span>{L(lang, g.aircraft.type)}</span>
            </div>
          )}
        </div>
      ))}
      <p className="text-[9px] text-[#9CA3AF] flex items-center gap-1">
        <Info size={9} />
        {L(lang, {
          ko: '노선 거리에 따라 실제 기종이 달라질 수 있습니다',
          zh: '实际机型可能因航线距离不同而有所变化',
          en: 'Actual aircraft may vary by route distance',
        })}
      </p>
    </div>
  )
}
