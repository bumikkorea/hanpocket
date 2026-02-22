import { useState } from 'react'
import { L } from '../HomeTab'

// ─── Korean Holiday Calendar ───

const KOREAN_HOLIDAYS = [
  { m: 1, d: 1, ko: '신정', zh: '元旦', en: "New Year's Day" },
  { m: 3, d: 1, ko: '삼일절', zh: '三一节', en: 'Independence Movement Day' },
  { m: 5, d: 5, ko: '어린이날', zh: '儿童节', en: "Children's Day" },
  { m: 6, d: 6, ko: '현충일', zh: '显忠日', en: 'Memorial Day' },
  { m: 8, d: 15, ko: '광복절', zh: '光复节', en: 'Liberation Day' },
  { m: 10, d: 3, ko: '개천절', zh: '开天节', en: 'National Foundation Day' },
  { m: 10, d: 9, ko: '한글날', zh: '韩文日', en: 'Hangul Day' },
  { m: 12, d: 25, ko: '성탄절', zh: '圣诞节', en: 'Christmas' },
  { m: 2, d: 17, ko: '설날', zh: '春节', en: 'Lunar New Year' },
  { m: 2, d: 16, ko: '설날 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' },
  { m: 2, d: 18, ko: '설날 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' },
  { m: 5, d: 24, ko: '부처님오신날', zh: '佛诞节', en: "Buddha's Birthday" },
  { m: 9, d: 25, ko: '추석', zh: '中秋节', en: 'Chuseok' },
  { m: 9, d: 24, ko: '추석 연휴', zh: '中秋假期', en: 'Chuseok Holiday' },
  { m: 9, d: 26, ko: '추석 연휴', zh: '中秋假期', en: 'Chuseok Holiday' },
]

export default function CalendarWidget({ lang }) {
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
        <button onClick={prevMonth} className="text-xs text-[#6B7280] px-2 py-1 rounded hover:bg-[#F3F4F6]">&lsaquo;</button>
        <span className="text-sm font-bold text-[#111827]">{monthNames[lang] || monthNames.en}</span>
        <button onClick={nextMonth} className="text-xs text-[#6B7280] px-2 py-1 rounded hover:bg-[#F3F4F6]">&rsaquo;</button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {dayLabels.map((d, i) => (
          <div key={d} className={`text-center text-[8px] font-bold py-0.5 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#6B7280]'}`}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className="h-5" />
          const hol = holidayMap[day]
          const isSun = (i % 7) === 0
          const isSat = (i % 7) === 6
          const isToday = isCurrentMonth && day === today
          return (
            <div key={day} className={`relative h-5 flex flex-col items-center justify-center rounded text-[10px]
              ${isToday ? 'bg-[#111827] text-white font-black' : hol || isSun ? 'text-red-500 font-bold' : isSat ? 'text-blue-500' : 'text-[#6B7280]'}
            `} title={hol ? L(lang, hol) : ''}>
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
              <span className="text-[10px] text-red-500 font-semibold">{viewMonth + 1}/{h.d} {L(lang, h)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}