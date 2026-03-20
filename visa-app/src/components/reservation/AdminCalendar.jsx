// NEAR 관리자 — 캘린더 탭 (스타일리스트별 세로 컬럼)
import { useState, useMemo } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { STATUS_CONFIG, MOCK_STYLISTS, MOCK_CUSTOMERS, COUNTRY_FLAGS, generateTimeSlots } from '../../data/reservationData'
import useReservationAdmin from '../../hooks/useReservationAdmin'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminCalendar({ lang }) {
  const { getReservationsByDate } = useReservationAdmin()
  const [viewMode, setViewMode] = useState('day') // day | week
  const [currentDate, setCurrentDate] = useState(new Date())

  const dateStr = currentDate.toISOString().split('T')[0]
  const todayStr = new Date().toISOString().split('T')[0]

  const prevDay = () => setCurrentDate(new Date(currentDate.getTime() - 86400000))
  const nextDay = () => setCurrentDate(new Date(currentDate.getTime() + 86400000))
  const goToday = () => setCurrentDate(new Date())

  const dayReservations = useMemo(() => getReservationsByDate(dateStr), [dateStr, getReservationsByDate])

  // shop-001 기준 스타일리스트
  const stylists = MOCK_STYLISTS.filter(s => s.shopId === 'shop-001')
  const timeSlots = generateTimeSlots('10:00', '21:00', 30)

  // 예약을 스타일리스트별로 그룹화
  const reservationGrid = useMemo(() => {
    const grid = {}
    stylists.forEach(s => { grid[s.id] = {} })
    grid['unassigned'] = {}

    dayReservations.forEach(res => {
      const key = res.stylistId || 'unassigned'
      if (!grid[key]) grid[key] = {}
      grid[key][res.time] = res
    })
    return grid
  }, [dayReservations, stylists])

  const formatDate = (d) => {
    const weekday = T.weekdays[lang][d.getDay()]
    return `${d.getMonth() + 1}/${d.getDate()} (${weekday})`
  }

  return (
    <div className="px-5">
      {/* 날짜 네비 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevDay} className="p-1"><ChevronLeft size={18} color="#666" /></button>
        <div className="text-center">
          <span className="text-[15px] font-semibold" style={{ color: '#111' }}>{formatDate(currentDate)}</span>
          {dateStr !== todayStr && (
            <button onClick={goToday} className="ml-2 text-[11px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#F3F4F6', color: '#666' }}>
              {T.today[lang]}
            </button>
          )}
        </div>
        <button onClick={nextDay} className="p-1"><ChevronRight size={18} color="#666" /></button>
      </div>

      {/* 뷰 토글 */}
      <div className="flex gap-1 mb-4 card-glass rounded-lg p-0.5" style={{ width: 'fit-content', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        {['day', 'week'].map(m => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            className="px-3 py-1 rounded-md text-[12px] font-semibold transition-all active:scale-95"
            style={{
              background: viewMode === m ? 'var(--gradient-dream)' : 'transparent',
              color: viewMode === m ? 'white' : 'var(--y2k-text-sub)',
              boxShadow: viewMode === m ? '0 2px 8px rgba(255, 133, 179, 0.2)' : 'none',
            }}
          >
            {m === 'day' ? T.dayView[lang] : T.weekView[lang]}
          </button>
        ))}
      </div>

      {/* 살롱보드 스타일 그리드 */}
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* 스타일리스트 헤더 */}
          <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `60px repeat(${stylists.length}, 1fr)` }}>
            <div /> {/* 시간 컬럼 */}
            {stylists.map(s => (
              <div key={s.id} className="text-center">
                <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ backgroundColor: s.color }} />
                <span className="text-[11px] font-medium" style={{ color: '#111' }}>{s.name}</span>
              </div>
            ))}
          </div>

          {/* 시간 행 */}
          <div className="space-y-0">
            {timeSlots.map(slot => (
              <div key={slot.time} className="grid gap-1"
                style={{
                  gridTemplateColumns: `60px repeat(${stylists.length}, 1fr)`,
                  height: '36px',
                }}>
                {/* 시간 라벨 */}
                <div className="flex items-center justify-end pr-2">
                  <span className="text-[10px]" style={{ color: '#999' }}>{slot.time}</span>
                </div>

                {/* 스타일리스트별 셀 */}
                {stylists.map(s => {
                  const res = reservationGrid[s.id]?.[slot.time]
                  if (!res) {
                    return (
                      <div key={s.id} className="rounded"
                        style={{ backgroundColor: slot.available ? '#FAFAFA' : '#F3F4F6', border: '1px solid #F0F0F0' }} />
                    )
                  }

                  const statusCfg = STATUS_CONFIG[res.status]
                  const customer = MOCK_CUSTOMERS.find(c => c.id === res.customerId)
                  const flag = customer ? COUNTRY_FLAGS[customer.countryCode] || '' : ''
                  // 예약 블록은 duration 기반 높이
                  const blocks = Math.ceil(res.totalDuration / 30)

                  return (
                    <div key={s.id}
                      className="rounded px-1.5 py-0.5 overflow-hidden cursor-pointer"
                      style={{
                        backgroundColor: statusCfg.bg,
                        border: `1.5px solid ${statusCfg.color}`,
                        height: `${blocks * 36 - 2}px`,
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <p className="text-[10px] font-medium truncate" style={{ color: statusCfg.color }}>
                        {flag} {customer?.name || '고객'}
                      </p>
                      <p className="text-[9px] truncate" style={{ color: statusCfg.color }}>
                        {res.services[0]?.name?.ko}
                      </p>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
