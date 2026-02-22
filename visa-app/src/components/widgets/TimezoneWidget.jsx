import { useState, useEffect } from 'react'
import { L } from '../home/utils/helpers'

// ─── World Clock Widget ───

const TIMEZONE_COUNTRIES = [
  { id: 'china', name: { ko: '중국', zh: '中国', en: 'China' }, offset: 8, flag: 'CN' },
  { id: 'japan', name: { ko: '일본', zh: '日本', en: 'Japan' }, offset: 9, flag: 'JP' },
  { id: 'vietnam', name: { ko: '베트남', zh: '越南', en: 'Vietnam' }, offset: 7, flag: 'VN' },
  { id: 'philippines', name: { ko: '필리핀', zh: '菲律宾', en: 'Philippines' }, offset: 8, flag: 'PH' },
  { id: 'thailand', name: { ko: '태국', zh: '泰国', en: 'Thailand' }, offset: 7, flag: 'TH' },
  { id: 'indonesia', name: { ko: '인도네시아', zh: '印度尼西亚', en: 'Indonesia' }, offset: 7, flag: 'ID' },
  { id: 'usa_east', name: { ko: '미국(동부)', zh: '美国(东部)', en: 'USA (East)' }, offset: -5, flag: 'US' },
  { id: 'usa_west', name: { ko: '미국(서부)', zh: '美国(西部)', en: 'USA (West)' }, offset: -8, flag: 'US' },
  { id: 'uk', name: { ko: '영국', zh: '英国', en: 'UK' }, offset: 0, flag: 'GB' },
  { id: 'australia', name: { ko: '호주', zh: '澳大利亚', en: 'Australia' }, offset: 11, flag: 'AU' },
]

function getTimeInOffset(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const city = new Date(utc + offset * 3600000)
  return city.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

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
  const diffStr = diff === 0 ? lang === 'ko' ? '시차 없음' : lang === 'zh' ? '无时差' : 'No difference' : diff > 0 ? `+${diff}h` : `${diff}h`

  if (compact) return (
    <div>
      <span className="text-[10px] font-semibold text-[#6B7280] block mb-2">{lang === 'ko' ? '시간' : lang === 'zh' ? '时间' : 'Time'}</span>
      <select value={selected} onChange={e => { setSelected(e.target.value); localStorage.setItem('tz_country', e.target.value) }}
        className="w-full mb-2 text-[10px] font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1 border-none outline-none">
        {TIMEZONE_COUNTRIES.map(c => <option key={c.id} value={c.id}>{c.flag} {L(lang, c.name)}</option>)}
      </select>
      <div className="text-center mb-1">
        <div className="text-[9px] text-[#6B7280]">{country.flag} {L(lang, country.name)}</div>
        <div className="text-lg font-black text-[#111827]">{countryTime}</div>
      </div>
      <div className="text-center text-[10px] text-[#111827] font-bold mb-1">{diffStr}</div>
      <div className="text-center">
        <div className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '한국' : lang === 'zh' ? '韩国' : 'Korea'}</div>
        <div className="text-lg font-black text-[#111827]">{koreaTime}</div>
      </div>
    </div>
  )

  return (
    <div>
      <select value={selected} onChange={e => { setSelected(e.target.value); localStorage.setItem('tz_country', e.target.value) }}
        className="w-full mb-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#111827] font-medium">
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
          <div className="text-[10px] text-[#6B7280] mb-1">{lang === 'ko' ? '한국' : lang === 'zh' ? '韩国' : 'Korea'}</div>
          <div className="text-2xl font-black text-[#111827]">{koreaTime}</div>
        </div>
      </div>
    </div>
  )
}