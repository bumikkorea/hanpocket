import { useState, useEffect } from 'react'
import { TIMEZONE_COUNTRIES } from '../utils/constants'
import { L, getTimeInOffset } from '../utils/helpers'

export default function TimezoneWidget({ lang, compact }) {
  const [selected, setSelected] = useState(() => {
    try { return localStorage.getItem('tz_country') || 'china' } catch { return 'china' }
  })
  const [, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const country = TIMEZONE_COUNTRIES.find(c => c.id === selected) || TIMEZONE_COUNTRIES[0]
  const koreaTime = getTimeInOffset(9)
  const countryTime = getTimeInOffset(country.offset)
  const diff = country.offset - 9
  const diffStr = diff === 0 
    ? lang === 'ko' ? '시차 없음' : lang === 'zh' ? '无时差' : 'No difference' 
    : diff > 0 ? `+${diff}h` : `${diff}h`

  if (compact) return (
    <div>
      <span className="text-[10px] font-semibold text-[#6B7280] block mb-2">
        {lang === 'ko' ? '시간' : lang === 'zh' ? '时间' : 'Time'}
      </span>
      <select 
        value={selected} 
        onChange={e => { 
          setSelected(e.target.value)
          localStorage.setItem('tz_country', e.target.value) 
        }}
        className="w-full mb-2 text-[10px] font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1 border-none outline-none"
      >
        {TIMEZONE_COUNTRIES.map(c => 
          <option key={c.id} value={c.id}>{c.flag} {L(lang, c.name)}</option>
        )}
      </select>
      <div className="text-center mb-1">
        <div className="text-[9px] text-[#6B7280]">{country.flag} {L(lang, country.name)}</div>
        <div className="text-lg font-black text-[#111827]">{countryTime}</div>
      </div>
      <div className="text-center text-[10px] text-[#111827] font-bold mb-1">{diffStr}</div>
      <div className="text-center">
        <div className="text-[9px] text-[#6B7280]">
          {lang === 'ko' ? '한국' : lang === 'zh' ? '韩国' : 'Korea'}
        </div>
        <div className="text-lg font-black text-[#111827]">{koreaTime}</div>
      </div>
    </div>
  )

  return (
    <div>
      <select 
        value={selected} 
        onChange={e => { 
          setSelected(e.target.value)
          localStorage.setItem('tz_country', e.target.value) 
        }}
        className="w-full mb-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#111827] font-medium"
      >
        {TIMEZONE_COUNTRIES.map(c => (
          <option key={c.id} value={c.id}>{c.flag} {L(lang, c.name)}</option>
        ))}
      </select>
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="text-[10px] text-[#6B7280] mb-1">{country.flag} {L(lang, country.name)}</div>
          <div className="text-2xl font-black text-[#111827]">{countryTime}</div>
        </div>
        <div className="px-3 text-center">
          <div className="text-[10px] text-[#111827] font-bold">{diffStr}</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-[10px] text-[#6B7280] mb-1">
            {lang === 'ko' ? '한국' : lang === 'zh' ? '韩国' : 'Korea'}
          </div>
          <div className="text-2xl font-black text-[#111827]">{koreaTime}</div>
        </div>
      </div>
    </div>
  )
}