import { useState } from 'react'
import { Plane } from 'lucide-react'
import { L } from '../home/utils/helpers'

export default function FlightMiniWidget({ lang, setTab }) {
  const [flightNo, setFlightNo] = useState('')

  const handleSearch = () => {
    if (flightNo.trim()) {
      localStorage.setItem('pending_flight_search', flightNo.trim().toUpperCase())
    }
    setTab('travel')
  }

  return (
    <div>
      <p className="text-[10px] font-semibold text-[#6B7280] mb-2">
        {L(lang, { ko: '항공편 조회', zh: '航班查询', en: 'Flight Search' })}
      </p>
      <div className="flex items-center gap-2">
        <Plane size={16} className="text-[#6B7280] shrink-0" />
        <input
          type="text"
          value={flightNo}
          onChange={e => setFlightNo(e.target.value.toUpperCase())}
          placeholder="CA135"
          className="flex-1 bg-[#F3F4F6] rounded-lg px-3 py-2 text-sm font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          maxLength={10}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-[#111827] text-white text-xs font-semibold px-4 py-2 rounded-lg shrink-0 active:scale-95 transition-transform"
        >
          {L(lang, { ko: '조회', zh: '查询', en: 'Search' })}
        </button>
      </div>
    </div>
  )
}
