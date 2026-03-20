// NEAR 예약 Step 2 — 날짜/시간 선택 (동시예약 제한 + 최대기간 + 스타일리스트 근무일)
import { useState, useMemo } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { MOCK_SHOPS, MOCK_STYLISTS, MOCK_RESERVATIONS, generateTimeSlots, checkConcurrentAvailability } from '../../data/reservationData'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DateTimePicker({ lang, shopId, selectedServices, onSelect, selectedDate, selectedTime, selectedStylist, onNext, onBack }) {
  const shop = MOCK_SHOPS.find(s => s.id === shopId)
  const allStylists = MOCK_STYLISTS.filter(s => s.shopId === shopId && s.isActive)

  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [date, setDate] = useState(selectedDate)
  const [time, setTime] = useState(selectedTime)
  const [stylistId, setStylistId] = useState(selectedStylist)

  const totalDuration = selectedServices?.reduce((sum, s) => sum + s.duration, 0) || 60

  // 최대 예약 가능 날짜
  const maxDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + (shop?.maxAdvanceDays || 30))
    return d
  }, [shop])

  // 선택한 스타일리스트가 가능한 서비스를 제공하는 스타일리스트만 필터
  const availableStylists = useMemo(() => {
    if (!selectedServices?.length) return allStylists
    const svcIds = selectedServices.map(s => s.id || s.serviceId)
    return allStylists.filter(st =>
      svcIds.every(svcId => st.services.includes(svcId))
    )
  }, [allStylists, selectedServices])

  // 캘린더 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const days = []

    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d)
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const isClosed = shop?.closedDays?.includes(dateObj.getDay())
      const isBeyondMax = dateObj > maxDate

      // 스타일리스트 근무일 체크
      let stylistOff = false
      if (stylistId) {
        const st = allStylists.find(s => s.id === stylistId)
        if (st?.workingDays && !st.workingDays.includes(dateObj.getDay())) {
          stylistOff = true
        }
      }

      days.push({
        day: d,
        date: dateStr,
        isPast,
        isClosed,
        isBeyondMax,
        stylistOff,
        disabled: isPast || isClosed || isBeyondMax || stylistOff,
      })
    }
    return days
  }, [viewYear, viewMonth, shop, today, maxDate, stylistId, allStylists])

  // 타임슬롯 (매장 설정 간격 사용)
  const timeSlots = useMemo(() => {
    if (!shop) return []
    const interval = shop.slotIntervalMin || 30
    return generateTimeSlots(shop.operatingHours.open, shop.operatingHours.close, interval, shop.breakTime)
  }, [shop])

  // 슬롯별 동시 예약 가능 여부 체크
  const slotAvailability = useMemo(() => {
    if (!date || !shop) return {}
    const maxConcurrent = shop.maxConcurrentBookings || 3
    const avail = {}
    for (const slot of timeSlots) {
      if (!slot.available) {
        avail[slot.time] = false
        continue
      }
      avail[slot.time] = checkConcurrentAvailability(
        MOCK_RESERVATIONS, shopId, date, slot.time, totalDuration, maxConcurrent
      )
    }
    return avail
  }, [date, shop, shopId, timeSlots, totalDuration])

  const canProceed = date && time

  const handleSelectDate = (d) => {
    setDate(d)
    setTime(null)
  }

  const handleConfirm = () => {
    onSelect(date, time, stylistId)
    onNext()
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  return (
    <div>
      {/* 스타일리스트 선택 (날짜 전에 선택 → 근무일 필터링) */}
      {availableStylists.length > 0 && (
        <>
          <p className="text-[13px] font-medium mb-3" style={{ color: '#111' }}>{T.selectStylist[lang]}</p>
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setStylistId(null)}
              className="px-4 py-2 rounded-xl text-[13px] whitespace-nowrap transition-all"
              style={{
                backgroundColor: stylistId === null ? '#111' : '#fff',
                color: stylistId === null ? '#fff' : '#666',
                border: '1px solid #E5E7EB',
              }}
            >
              {T.anyStylist[lang]}
            </button>
            {availableStylists.map(s => (
              <button
                key={s.id}
                onClick={() => { setStylistId(s.id); setDate(null); setTime(null) }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] whitespace-nowrap transition-all"
                style={{
                  backgroundColor: stylistId === s.id ? '#111' : '#fff',
                  color: stylistId === s.id ? '#fff' : '#666',
                  border: '1px solid #E5E7EB',
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
                {s.role && (
                  <span className="text-[10px]" style={{ color: stylistId === s.id ? '#9CA3AF' : '#999' }}>
                    {s.role[lang] || s.role.ko}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1"><ChevronLeft size={18} color="#666" /></button>
        <span className="text-[15px] font-semibold" style={{ color: '#111' }}>
          {T.months[lang][viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1"><ChevronRight size={18} color="#666" /></button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {T.weekdays[lang].map((d, i) => (
          <div key={i} className="text-center text-[11px] font-medium py-1"
            style={{ color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#999' }}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((d, i) => {
          if (!d) return <div key={i} />
          const isToday = d.date === today.toISOString().split('T')[0]
          const isSelected = d.date === date
          return (
            <button
              key={i}
              disabled={d.disabled}
              onClick={() => handleSelectDate(d.date)}
              className="aspect-square flex flex-col items-center justify-center rounded-xl text-[13px] transition-all"
              style={{
                background: isSelected ? 'var(--gradient-dream)' : isToday ? 'var(--y2k-bg)' : 'transparent',
                color: d.disabled ? '#D1D5DB' : isSelected ? 'white' : 'var(--y2k-text)',
                fontWeight: isSelected || isToday ? 700 : 400,
                boxShadow: isSelected ? '0 0 20px rgba(255, 133, 179, 0.3)' : 'none',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {d.day}
              {d.stylistOff && !d.isPast && !d.isClosed && (
                <span className="text-[8px] leading-none" style={{ color: '#D1D5DB' }}>
                  {lang === 'zh' ? '休' : lang === 'ko' ? '휴' : 'off'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 최대 예약 기간 안내 */}
      <p className="text-[10px] text-center mb-4" style={{ color: '#D1D5DB' }}>
        {lang === 'zh' ? `最多可提前${shop?.maxAdvanceDays || 30}天预约`
          : lang === 'ko' ? `최대 ${shop?.maxAdvanceDays || 30}일 전 예약 가능`
          : `Bookable up to ${shop?.maxAdvanceDays || 30} days in advance`}
      </p>

      {/* 시간 선택 */}
      {date && (
        <>
          <p className="text-[13px] font-medium mb-3" style={{ color: '#111' }}>{T.selectTime[lang]}</p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {timeSlots.map(slot => {
              const isAvailable = slot.available && slotAvailability[slot.time] !== false
              const isSelected = slot.time === time
              return (
                <button
                  key={slot.time}
                  disabled={!isAvailable}
                  onClick={() => setTime(slot.time)}
                  className="py-2 rounded-full text-[13px] transition-all relative active:scale-95"
                  style={{
                    background: isSelected ? 'var(--gradient-dream)' : isAvailable ? 'var(--y2k-surface)' : 'var(--y2k-bg)',
                    color: isSelected ? 'white' : isAvailable ? 'var(--y2k-text)' : '#D1D5DB',
                    border: isSelected ? 'none' : '1px solid var(--y2k-border)',
                    boxShadow: isSelected ? '0 0 20px rgba(255, 133, 179, 0.3)' : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {slot.time}
                  {!slot.available && (
                    <span className="absolute -top-1 -right-1 text-[8px] px-1 rounded-full"
                      style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                      {lang === 'zh' ? '休' : lang === 'ko' ? '휴식' : 'Break'}
                    </span>
                  )}
                  {slot.available && slotAvailability[slot.time] === false && (
                    <span className="absolute -top-1 -right-1 text-[8px] px-1 rounded-full"
                      style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                      {lang === 'zh' ? '满' : lang === 'ko' ? '만석' : 'Full'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* 하단 버튼 */}
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-all"
          style={{ color: '#666', border: '1px solid #E5E7EB' }}>
          {T.back[lang]}
        </button>
        <button
          onClick={handleConfirm}
          disabled={!canProceed}
          className="flex-1 py-3 rounded-full text-[14px] font-semibold text-white transition-all active:scale-[0.95]"
          style={{
            background: canProceed ? 'var(--gradient-dream)' : '#D1D5DB',
            boxShadow: canProceed ? '0 4px 16px rgba(255, 133, 179, 0.3)' : 'none',
          }}
        >
          {T.next[lang]}
        </button>
      </div>
    </div>
  )
}
