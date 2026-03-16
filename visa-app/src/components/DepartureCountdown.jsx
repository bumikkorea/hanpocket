import { useState } from 'react'
import { Plane, Clock, MapPin, CheckCircle2, Circle, AlertTriangle, Car, Train, RotateCcw, Search, ChevronRight, Users, Footprints } from 'lucide-react'
import useDepartureCountdown from '../hooks/useDepartureCountdown'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const TEXTS = {
  title: { ko: '출국 카운트다운', zh: '出发倒计时', en: 'Departure Countdown', ja: '出発カウントダウン' },
  subtitle: { ko: '항공편 번호를 입력하세요', zh: '请输入航班号', en: 'Enter your flight number', ja: 'フライト番号を入力してください' },
  flightNumber: { ko: '항공편 번호', zh: '航班号', en: 'Flight #', ja: 'フライト番号' },
  date: { ko: '출발일', zh: '出发日期', en: 'Date', ja: '日付' },
  search: { ko: '조회', zh: '查询', en: 'Search', ja: '検索' },
  gate: { ko: '게이트', zh: '登机口', en: 'Gate', ja: 'ゲート' },
  terminal: { ko: '터미널', zh: '航站楼', en: 'Terminal', ja: 'ターミナル' },
  status: { ko: '상태', zh: '状态', en: 'Status', ja: 'ステータス' },
  scheduled: { ko: '정상 운항', zh: '正常运行', en: 'On Time', ja: '定刻' },
  delayed: { ko: '지연', zh: '延误', en: 'Delayed', ja: '遅延' },
  departed: { ko: '출발 완료', zh: '已出发', en: 'Departed', ja: '出発済み' },
  checklist: { ko: '출국 체크리스트', zh: '出境清单', en: 'Departure Checklist', ja: '出国チェックリスト' },
  timeline: { ko: '알림 타임라인', zh: '提醒时间线', en: 'Notification Timeline', ja: '通知タイムライン' },
  congestion: { ko: '공항 혼잡도', zh: '机场拥挤度', en: 'Airport Congestion', ja: '空港混雑度' },
  quiet: { ko: '한산', zh: '空闲', en: 'Quiet', ja: '空いている' },
  normal: { ko: '보통', zh: '一般', en: 'Normal', ja: '普通' },
  busy: { ko: '혼잡', zh: '拥挤', en: 'Busy', ja: '混雑' },
  very_busy: { ko: '매우 혼잡', zh: '非常拥挤', en: 'Very Busy', ja: '非常に混雑' },
  securityWait: { ko: '보안검색 예상', zh: '安检预计', en: 'Security est.', ja: 'セキュリティ予想' },
  gateWalk: { ko: '게이트까지 도보', zh: '步行到登机口', en: 'Walk to gate', ja: 'ゲートまで徒歩' },
  min: { ko: '분', zh: '分钟', en: 'min', ja: '分' },
  hours: { ko: '시간', zh: '小时', en: 'hours', ja: '時間' },
  callTaxi: { ko: '택시 호출', zh: '叫出租车', en: 'Call Taxi', ja: 'タクシーを呼ぶ' },
  arex: { ko: 'AREX 시간표', zh: 'AREX时刻表', en: 'AREX Schedule', ja: 'AREXスケジュール' },
  reset: { ko: '항공편 초기화', zh: '重置航班', en: 'Reset Flight', ja: 'フライトをリセット' },
  loading: { ko: '조회 중...', zh: '查询中...', en: 'Searching...', ja: '検索中...' },
  dHours: { ko: '시간 전', zh: '小时前', en: 'hrs before', ja: '時間前' },
  dMins: { ko: '분 전', zh: '分钟前', en: 'min before', ja: '分前' },
}

const CONGESTION_COLORS = {
  quiet: 'bg-emerald-100 text-emerald-700',
  normal: 'bg-blue-100 text-blue-700',
  busy: 'bg-amber-100 text-amber-700',
  very_busy: 'bg-red-100 text-red-700',
}

function formatCountdown(minutes, lang) {
  if (minutes === null) return '--'
  if (minutes < 0) return L(lang, TEXTS.departed)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}${L(lang, TEXTS.hours)} ${m}${L(lang, TEXTS.min)}`
  return `${m}${L(lang, TEXTS.min)}`
}

export default function DepartureCountdown({ lang, profile }) {
  const {
    flight, flightInfo, congestion, loading, minutesUntil,
    phase, notifications, checklist, gateWalkTime,
    lookupFlight, toggleChecklistItem, updateChecklistInput, resetFlight,
  } = useDepartureCountdown()

  const [inputFlight, setInputFlight] = useState(flight?.flightNumber || '')
  const [inputDate, setInputDate] = useState(flight?.date || new Date().toISOString().split('T')[0])

  function handleSearch() {
    if (!inputFlight.trim()) return
    lookupFlight(inputFlight.trim(), inputDate)
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="text-center pt-2 pb-2">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Plane size={28} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-[#111827]">{L(lang, TEXTS.title)}</h2>
        {!flightInfo && <p className="text-xs text-[#6B7280] mt-1">{L(lang, TEXTS.subtitle)}</p>}
      </div>

      {/* Flight search */}
      {!flightInfo && (
        <div className="mx-4 p-4 rounded-xl border border-[#E5E7EB] space-y-3">
          <div>
            <label className="text-xs text-[#6B7280] mb-1 block">{L(lang, TEXTS.flightNumber)}</label>
            <input
              type="text"
              value={inputFlight}
              onChange={e => setInputFlight(e.target.value.toUpperCase())}
              placeholder="KE123"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#111827]"
            />
          </div>
          <div>
            <label className="text-xs text-[#6B7280] mb-1 block">{L(lang, TEXTS.date)}</label>
            <input
              type="date"
              value={inputDate}
              onChange={e => setInputDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#111827]"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !inputFlight.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111827] text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {L(lang, loading ? TEXTS.loading : TEXTS.search)}
          </button>
        </div>
      )}

      {/* Flight info card */}
      {flightInfo && (
        <>
          {/* Countdown */}
          {minutesUntil !== null && minutesUntil > 0 && (
            <div className="mx-4 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-center">
              <p className="text-xs text-blue-600 mb-2">{flightInfo.flightNumber} · {flightInfo.airline}</p>
              <p className="text-4xl font-light text-blue-700">{formatCountdown(minutesUntil, lang)}</p>
              <p className="text-xs text-blue-500 mt-1">
                {new Date(flightInfo.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}

          {/* Flight details */}
          <div className="mx-4 p-4 rounded-xl border border-[#E5E7EB]">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[10px] text-[#9CA3AF] mb-1">{L(lang, TEXTS.terminal)}</p>
                <p className="text-lg font-semibold text-[#111827]">{flightInfo.departureTerminal}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#9CA3AF] mb-1">{L(lang, TEXTS.gate)}</p>
                <p className="text-lg font-semibold text-[#111827]">{flightInfo.departureGate || '--'}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#9CA3AF] mb-1">{L(lang, TEXTS.status)}</p>
                <p className={`text-sm font-medium ${flightInfo.delay > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {L(lang, flightInfo.delay > 0 ? TEXTS.delayed : TEXTS.scheduled)}
                </p>
              </div>
            </div>
          </div>

          {/* Congestion + Gate walk */}
          {(congestion || gateWalkTime) && (
            <div className="mx-4 flex gap-3">
              {congestion && (
                <div className="flex-1 p-3 rounded-xl border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users size={12} className="text-[#6B7280]" />
                    <span className="text-[10px] text-[#6B7280]">{L(lang, TEXTS.congestion)}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${CONGESTION_COLORS[congestion.level]}`}>
                    {L(lang, TEXTS[congestion.level])}
                  </span>
                  <p className="text-[10px] text-[#9CA3AF] mt-2">{L(lang, TEXTS.securityWait)}: ~{congestion.estimatedSecurityWait}{L(lang, TEXTS.min)}</p>
                </div>
              )}
              {gateWalkTime && (
                <div className="flex-1 p-3 rounded-xl border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Footprints size={12} className="text-[#6B7280]" />
                    <span className="text-[10px] text-[#6B7280]">{L(lang, TEXTS.gateWalk)}</span>
                  </div>
                  <p className="text-xl font-light text-[#111827]">~{gateWalkTime}<span className="text-xs text-[#6B7280]">{L(lang, TEXTS.min)}</span></p>
                </div>
              )}
            </div>
          )}

          {/* Notification timeline */}
          <div className="mx-4">
            <h3 className="text-sm font-bold text-[#111827] mb-3">{L(lang, TEXTS.timeline)}</h3>
            <div className="space-y-0">
              {notifications.map((n, i) => (
                <div key={n.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      n.completed ? 'bg-emerald-500' : n.active ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-[#E5E7EB]'
                    }`}>
                      {n.completed ? (
                        <CheckCircle2 size={14} className="text-white" />
                      ) : (
                        <Circle size={10} className={n.active ? 'text-white' : 'text-[#9CA3AF]'} />
                      )}
                    </div>
                    {i < notifications.length - 1 && (
                      <div className={`w-0.5 h-10 ${n.completed ? 'bg-emerald-300' : 'bg-[#E5E7EB]'}`} />
                    )}
                  </div>
                  <div className={`pb-4 ${n.active ? '' : 'opacity-60'}`}>
                    <p className="text-xs text-[#9CA3AF] mb-0.5">{n.time}</p>
                    <p className={`text-sm font-medium ${n.active ? 'text-[#111827]' : 'text-[#6B7280]'}`}>{L(lang, n.title)}</p>
                    <p className="text-xs text-[#9CA3AF]">{L(lang, n.desc)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="mx-4">
            <h3 className="text-sm font-bold text-[#111827] mb-3">{L(lang, TEXTS.checklist)}</h3>
            <div className="space-y-2">
              {checklist.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E7EB]">
                  <button onClick={() => toggleChecklistItem(item.id)} className="mt-0.5 shrink-0">
                    {item.checked ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <Circle size={20} className="text-[#D1D5DB]" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.checked ? 'line-through text-[#9CA3AF]' : 'text-[#111827]'}`}>
                      {L(lang, item.label)}
                    </p>
                    {item.hasInput && !item.checked && (
                      <input
                        type="number"
                        value={item.inputValue}
                        onChange={e => updateChecklistInput(item.id, e.target.value)}
                        placeholder={item.inputLabel}
                        className="mt-1.5 w-20 px-2 py-1 text-xs border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#111827]"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="mx-4 flex gap-3">
            <a
              href="https://m.kakao.com/taxi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200"
            >
              <Car size={16} />
              {L(lang, TEXTS.callTaxi)}
            </a>
            <a
              href="https://www.arex.or.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200"
            >
              <Train size={16} />
              {L(lang, TEXTS.arex)}
            </a>
          </div>

          {/* Reset */}
          <div className="mx-4 text-center">
            <button
              onClick={resetFlight}
              className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#6B7280]"
            >
              <RotateCcw size={12} />
              {L(lang, TEXTS.reset)}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
