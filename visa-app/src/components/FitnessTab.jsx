import { useState } from 'react'
import { Search, MapPin, Dumbbell, ChevronDown, ChevronUp, Globe, Phone } from 'lucide-react'
import { FITNESS_FACILITIES, FITNESS_TYPES, FITNESS_CITIES } from '../data/fitnessData'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

const TYPE_COLORS = {
  '공공': 'bg-blue-50 text-blue-700',
  '헬스장': 'bg-orange-50 text-orange-700',
  '수영장': 'bg-cyan-50 text-cyan-700',
  '요가/필라테스': 'bg-purple-50 text-purple-700',
  '크로스핏': 'bg-red-50 text-red-700',
  '복합': 'bg-green-50 text-green-700',
}

export default function FitnessTab({ lang }) {
  const [query, setQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('전체')
  const [typeFilter, setTypeFilter] = useState('전체')
  const [expanded, setExpanded] = useState(null)

  const filtered = FITNESS_FACILITIES.filter(f => {
    if (cityFilter !== '전체' && f.city !== cityFilter) return false
    if (typeFilter !== '전체' && f.type !== typeFilter) return false
    if (query) {
      const q = query.toLowerCase()
      const name = (L(lang, f.name) || '').toLowerCase()
      const district = (f.district || '').toLowerCase()
      const facilities = (f.facilities || []).join(' ').toLowerCase()
      if (!name.includes(q) && !district.includes(q) && !facilities.includes(q)) return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={lang === 'ko' ? '시설명, 지역, 종목 검색...' : lang === 'zh' ? '搜索设施名、地区、项目...' : 'Search facility, area, sport...'}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#F3F4F6] border-none outline-none focus:ring-2 focus:ring-[#111827]/10"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-full bg-[#F3F4F6] text-[#374151] border-none outline-none">
          {FITNESS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-full bg-[#F3F4F6] text-[#374151] border-none outline-none">
          {FITNESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Count */}
      <p className="text-[10px] text-[#9CA3AF]">
        {lang === 'ko' ? `${filtered.length}개 시설` : lang === 'zh' ? `${filtered.length}个设施` : `${filtered.length} facilities`}
      </p>

      {/* Results */}
      <div className="space-y-2.5">
        {filtered.slice(0, 30).map(f => (
          <div key={f.id} className="bg-white border border-[#E5E7EB] rounded-lg p-4 card-glow">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[f.type] || 'bg-gray-50 text-gray-600'}`}>{f.type}</span>
                  {f.foreignFriendly && <Globe size={10} className="text-blue-500" />}
                </div>
                <p className="text-sm font-bold text-[#111827] truncate">{L(lang, f.name)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={10} className="text-[#9CA3AF]" />
                  <p className="text-[10px] text-[#6B7280] truncate">{L(lang, f.address)}</p>
                </div>
              </div>
              <button onClick={() => setExpanded(expanded === f.id ? null : f.id)} className="ml-2 mt-1">
                {expanded === f.id ? <ChevronUp size={14} className="text-[#9CA3AF]" /> : <ChevronDown size={14} className="text-[#9CA3AF]" />}
              </button>
            </div>

            {/* Facilities pills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {f.facilities.map((fac, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280]">{fac}</span>
              ))}
            </div>

            {/* Price */}
            <p className="text-[10px] text-[#374151] mt-1.5">{L(lang, f.priceRange)}</p>

            {/* Expanded */}
            {expanded === f.id && (
              <div className="mt-3 pt-3 border-t border-[#F3F4F6] space-y-1.5">
                {f.phone && (
                  <a href={`tel:${f.phone}`} className="flex items-center gap-1.5 text-[10px] text-[#374151]">
                    <Phone size={10} className="text-[#9CA3AF]" />
                    {f.phone}
                  </a>
                )}
                {f.website && (
                  <a href={f.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-blue-600">
                    <Globe size={10} />
                    {lang === 'ko' ? '홈페이지' : lang === 'zh' ? '官网' : 'Website'}
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length > 30 && (
        <p className="text-center text-[10px] text-[#9CA3AF]">
          {lang === 'ko' ? `외 ${filtered.length - 30}개 더...` : `+${filtered.length - 30} more...`}
        </p>
      )}
    </div>
  )
}
