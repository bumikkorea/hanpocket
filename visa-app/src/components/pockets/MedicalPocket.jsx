import { useState } from 'react'
import { Phone, MapPin, Globe, ChevronDown, Navigation, Building2, Pill } from 'lucide-react'
import { HOSPITALS, HOSPITAL_CITIES, HOSPITAL_TYPES } from '../../data/hospitalData'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

export default function MedicalPocket({ lang }) {
  const [tab, setTab] = useState('hospital') // 'hospital' | 'pharmacy'
  const [cityFilter, setCityFilter] = useState('전체')
  const [typeFilter, setTypeFilter] = useState('전체')

  const filtered = HOSPITALS.filter(h => {
    if (cityFilter !== '전체' && h.city !== cityFilter) return false
    if (typeFilter !== '전체' && h.type !== typeFilter) return false
    return true
  })

  const chineseOnly = filtered.filter(h => h.languages?.includes('zh'))

  return (
    <div className="space-y-4">
      {/* Tab toggle */}
      <div className="flex gap-2">
        <button onClick={() => setTab('hospital')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'hospital' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
          <Building2 size={14} className="inline mr-1" />
          {L(lang, { ko: '병원', zh: '医院', en: 'Hospital' })}
        </button>
        <button onClick={() => setTab('pharmacy')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'pharmacy' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
          <Pill size={14} className="inline mr-1" />
          {L(lang, { ko: '약국', zh: '药店', en: 'Pharmacy' })}
        </button>
      </div>

      {tab === 'pharmacy' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 text-center">
          <Pill size={32} className="mx-auto mb-3 text-[#9CA3AF]" />
          <p className="text-sm text-[#6B7280]">
            {L(lang, { ko: '위치 기반 약국 검색은 준비 중입니다', zh: '基于位置的药店搜索正在准备中', en: 'Location-based pharmacy search coming soon' })}
          </p>
        </div>
      )}

      {tab === 'hospital' && (
        <>
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {HOSPITAL_CITIES.slice(0, 8).map(city => (
              <button key={city} onClick={() => setCityFilter(city)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${cityFilter === city ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                {city}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {HOSPITAL_TYPES.filter(t => t !== '요양병원').map(type => (
              <button key={type} onClick={() => setTypeFilter(type)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${typeFilter === type ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                {type}
              </button>
            ))}
          </div>

          {/* Stats */}
          <p className="text-[10px] text-[#9CA3AF]">
            {L(lang, { ko: `${filtered.length}개 병원`, zh: `${filtered.length}家医院`, en: `${filtered.length} hospitals` })}
            {' · '}
            {L(lang, { ko: `중국어 가능 ${chineseOnly.length}개`, zh: `中文服务 ${chineseOnly.length}家`, en: `${chineseOnly.length} Chinese-speaking` })}
          </p>

          {/* Hospital cards */}
          <div className="space-y-3">
            {filtered.slice(0, 20).map(h => (
              <div key={h.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#111827]">{L(lang, h.name)}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{h.type} · {h.district}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {h.languages?.includes('zh') && (
                      <span className="text-[9px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">中文</span>
                    )}
                    {h.emergency && (
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                        {L(lang, { ko: '응급', zh: '急诊', en: 'ER' })}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#6B7280] flex items-center gap-1 mb-1">
                  <MapPin size={10} className="shrink-0" /> {L(lang, h.address)}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <a href={`tel:${h.phone}`} className="flex items-center gap-1.5 text-xs font-semibold text-[#111827] bg-[#F3F4F6] px-3 py-2 rounded-xl active:scale-[0.98] transition-transform">
                    <Phone size={12} /> {h.phone}
                  </a>
                  <button
                    onClick={() => {
                      const name = encodeURIComponent(L('zh', h.name) || L('ko', h.name))
                      window.open(`baidumap://map/direction?destination=${name}&coord_type=wgs84&mode=transit`, '_blank')
                    }}
                    className="flex items-center gap-1 text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-2 rounded-xl active:scale-[0.98] transition-transform"
                  >
                    <Navigation size={10} />
                    {L(lang, { ko: '百度 길찾기', zh: '百度导航', en: 'Baidu Maps' })}
                  </button>
                  {h.lat && h.lng && (
                    <button
                      onClick={() => {
                        const name = encodeURIComponent(L('zh', h.name) || L('ko', h.name))
                        window.open(`https://uri.amap.com/navigation?to=${h.lng},${h.lat},${name}&mode=bus&coordinate=wgs84&callnative=1`, '_blank')
                      }}
                      className="flex items-center gap-1 text-[10px] font-semibold text-[#2B6BFF] bg-[#EFF4FF] px-2.5 py-2 rounded-xl active:scale-[0.98] transition-transform"
                    >
                      <Navigation size={10} />
                      {L(lang, { ko: '高德 길찾기', zh: '高德导航', en: 'Amap' })}
                    </button>
                  )}
                </div>
                {h.foreignService && h.languages?.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Globe size={10} className="text-[#9CA3AF]" />
                    <span className="text-[9px] text-[#9CA3AF]">{h.languages.join(', ').toUpperCase()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {filtered.length > 20 && (
            <p className="text-center text-[10px] text-[#9CA3AF] pt-2">
              {L(lang, { ko: `+${filtered.length - 20}개 더 있습니다`, zh: `还有${filtered.length - 20}家`, en: `+${filtered.length - 20} more` })}
            </p>
          )}
        </>
      )}
    </div>
  )
}
