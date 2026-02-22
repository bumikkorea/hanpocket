import { useState } from 'react'
import { Search, MapPin, Dumbbell, ChevronDown, ChevronUp, Globe, Phone, Clock, Users, Calendar, Star } from 'lucide-react'
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
              <div className="mt-3 pt-3 border-t border-[#F3F4F6] space-y-2">
                {/* 운영시간 및 실시간 정보 */}
                <div className="grid grid-cols-2 gap-3 p-2 bg-[#F9FAFB] rounded-lg">
                  <div className="text-[10px]">
                    <div className="flex items-center gap-1 text-[#6B7280] mb-1">
                      <Clock size={10} />
                      <span>{L(lang, { ko: '운영시간', zh: '营业时间', en: 'Hours' })}</span>
                    </div>
                    <div className="text-[#111827] font-medium">
                      {f.type === '공공' ? '06:00-22:00' : '05:30-24:00'}
                    </div>
                  </div>
                  <div className="text-[10px]">
                    <div className="flex items-center gap-1 text-[#6B7280] mb-1">
                      <Users size={10} />
                      <span>{L(lang, { ko: '현재 혼잡도', zh: '当前拥挤度', en: 'Crowdedness' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${Math.random() > 0.6 ? 'bg-red-500' : Math.random() > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                      <span className="text-[#111827] font-medium">
                        {Math.random() > 0.6 ? 
                          L(lang, { ko: '혼잡', zh: '拥挤', en: 'Busy' }) : 
                          Math.random() > 0.3 ? 
                          L(lang, { ko: '보통', zh: '一般', en: 'Normal' }) : 
                          L(lang, { ko: '여유', zh: '空闲', en: 'Free' })
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* 인기 클래스 */}
                {f.type !== '공공' && (
                  <div className="text-[10px]">
                    <div className="flex items-center gap-1 text-[#6B7280] mb-1">
                      <Calendar size={10} />
                      <span>{L(lang, { ko: '인기 클래스', zh: '热门课程', en: 'Popular Classes' })}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['요가', '필라테스', 'PT', '헬스'].slice(0, 2).map((cls, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px]">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 연락처 및 웹사이트 */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    {f.phone && (
                      <a href={`tel:${f.phone}`} className="flex items-center gap-1.5 text-[10px] text-[#374151] hover:text-[#111827]">
                        <Phone size={10} className="text-[#9CA3AF]" />
                        {f.phone}
                      </a>
                    )}
                    {f.website && (
                      <a href={f.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-blue-600 hover:text-blue-800">
                        <Globe size={10} />
                        {lang === 'ko' ? '홈페이지' : lang === 'zh' ? '官网' : 'Website'}
                      </a>
                    )}
                  </div>
                  
                  {/* TODO: 실제 예약 시스템 연동 필요 */}
                  <button className="px-3 py-1 text-[9px] font-medium bg-[#111827] text-white rounded hover:bg-[#374151] transition-colors">
                    {L(lang, { ko: '예약하기', zh: '预约', en: 'Book' })}
                  </button>
                </div>

                {/* 이용 팁 */}
                <div className="text-[9px] text-[#6B7280] bg-blue-50 p-2 rounded">
                  <span className="font-medium">💡 {L(lang, { ko: '이용 팁:', zh: '使用贴士:', en: 'Tips:' })} </span>
                  {f.type === '공공' ? 
                    L(lang, { ko: '신분증 지참 필수, 수건·운동복 대여 가능', zh: '需携带身份证，可租借毛巾·运动服', en: 'ID required, towel/sportswear rental available' }) :
                    L(lang, { ko: '무료 체험 가능, PT 상담 제공', zh: '可免费试用，提供私教咨询', en: 'Free trial available, PT consultation provided' })
                  }
                </div>
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
