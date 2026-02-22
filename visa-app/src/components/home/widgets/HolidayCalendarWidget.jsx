import { useState } from 'react'
import { KOREAN_HOLIDAYS } from '../utils/constants'
import { L } from '../utils/helpers'

export default function HolidayCalendarWidget({ lang }) {
  const now = new Date()
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [viewYear, setViewYear] = useState(now.getFullYear())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const today = now.getDate()
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const monthHolidays = KOREAN_HOLIDAYS.filter(h => h.m === viewMonth + 1)
  const holidayMap = {}
  monthHolidays.forEach(h => { holidayMap[h.d] = h })

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']
  const monthNames = {
    ko: `${viewYear}년 ${viewMonth + 1}월`,
    zh: `${viewYear}年${viewMonth + 1}月`,
    en: new Date(viewYear, viewMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const cells = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="text-xs text-[#6B7280] px-2 py-1 rounded hover:bg-[#F3F4F6]">
          &lsaquo;
        </button>
        <span className="text-sm font-bold text-[#111827]">{monthNames[lang] || monthNames.en}</span>
        <button onClick={nextMonth} className="text-xs text-[#6B7280] px-2 py-1 rounded hover:bg-[#F3F4F6]">
          &rsaquo;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {dayLabels.map((d, i) => (
          <div 
            key={d} 
            className={`text-center text-[8px] font-bold py-0.5 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#6B7280]'
            }`}
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className="h-5" />
          const hol = holidayMap[day]
          const isSun = (i % 7) === 0
          const isSat = (i % 7) === 6
          const isToday = isCurrentMonth && day === today
          return (
            <div 
              key={day} 
              className={`relative h-5 flex flex-col items-center justify-center rounded text-[10px]
                ${isToday ? 'bg-[#111827] text-white font-black' 
                  : hol || isSun ? 'text-red-500 font-bold' 
                  : isSat ? 'text-blue-500' 
                  : 'text-[#6B7280]'}
              `} 
              title={hol ? L(lang, hol) : ''}
            >
              {day}
              {hol && !isToday && <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-red-400" />}
            </div>
          )
        })}
      </div>
      {monthHolidays.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#E5E7EB] space-y-0.5">
          {monthHolidays.filter((h, i, a) => a.findIndex(x => x.d === h.d && x.ko === h.ko) === i).map((h, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[10px] text-red-500 font-semibold">
                {viewMonth + 1}/{h.d} {L(lang, h)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}