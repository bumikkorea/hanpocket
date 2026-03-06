/**
 * CityPage — 도시별 페이지 (클룩 벤치마킹)
 * 히어로 배너 + 지역 카드 + 탭 필터 + 스팟 카드 리스트
 */
import { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Users, Calendar } from 'lucide-react'
import SpotCard from './SpotCard'
import { CATEGORY_LABELS } from '../../data/travelData'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const TAB_FILTERS = [
  { id: 'all', label: { ko: '전체', zh: '全部', en: 'All' } },
  { id: 'food', label: { ko: '맛집', zh: '美食', en: 'Food' } },
  { id: 'attraction', label: { ko: '관광지', zh: '景点', en: 'Sights' } },
  { id: 'experience', label: { ko: '체험', zh: '体验', en: 'Experience' } },
  { id: 'shopping', label: { ko: '쇼핑', zh: '购物', en: 'Shopping' } },
]

export default function CityPage({ city, lang, onBack, onAreaClick, onSpotClick, favorites, onToggleFavorite }) {
  const [filter, setFilter] = useState('all')
  const [selectedArea, setSelectedArea] = useState(null)

  const filteredSpots = city.spots.filter(s => {
    const matchCategory = filter === 'all' || s.category === filter
    const matchArea = !selectedArea || s.area === selectedArea
    return matchCategory && matchArea
  })

  const getAreaName = (areaId) => {
    const area = city.areas.find(a => a.id === areaId)
    return area ? L(lang, area.name) : ''
  }

  return (
    <div className="space-y-4">
      {/* 뒤로가기 */}
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-[#374151] -mb-2">
        <ChevronLeft size={18} />
        {L(lang, { ko: '도시 목록', zh: '城市列表', en: 'Cities' })}
      </button>

      {/* 히어로 */}
      <div className="relative rounded-2xl overflow-hidden h-[200px]">
        <img
          src={city.image}
          alt={L(lang, city.name)}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-2xl font-bold text-white">{L(lang, city.name)}</h1>
          <p className="text-sm text-white/80 mt-1 line-clamp-2">{L(lang, city.description)}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-white/70">
            {city.population && (
              <span className="flex items-center gap-1"><Users size={12} /> {city.population}</span>
            )}
            {city.bestSeason && (
              <span className="flex items-center gap-1"><Calendar size={12} /> {L(lang, city.bestSeason)}</span>
            )}
          </div>
        </div>
      </div>

      {/* 지역 카드 (수평 스크롤) */}
      {city.areas.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[#111827] mb-2.5">
            {L(lang, { ko: '인기 지역', zh: '热门地区', en: 'Popular Areas' })}
          </h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {city.areas.map(area => (
              <button
                key={area.id}
                onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
                className={`shrink-0 rounded-xl overflow-hidden border transition-all ${
                  selectedArea === area.id
                    ? 'border-[#111827] ring-2 ring-[#111827]/10'
                    : 'border-[#E5E7EB]'
                }`}
                style={{ width: '120px' }}
              >
                <div className="relative h-[72px]">
                  <img
                    src={area.image}
                    alt={L(lang, area.name)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-1.5 left-2 text-xs font-bold text-white">
                    {L(lang, area.name)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 카테고리 필터 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {TAB_FILTERS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              filter === tab.id
                ? 'bg-[#111827] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}
          >
            {L(lang, tab.label)}
          </button>
        ))}
      </div>

      {/* 선택된 지역 배너 */}
      {selectedArea && (
        <div className="flex items-center justify-between bg-[#F9FAFB] rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#6B7280]" />
            <span className="text-sm font-medium text-[#374151]">{getAreaName(selectedArea)}</span>
          </div>
          <button
            onClick={() => setSelectedArea(null)}
            className="text-xs text-[#6B7280] underline"
          >
            {L(lang, { ko: '전체 보기', zh: '查看全部', en: 'Show all' })}
          </button>
        </div>
      )}

      {/* 스팟 카드 그리드 */}
      {filteredSpots.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredSpots.map(spot => (
            <SpotCard
              key={spot.id}
              spot={spot}
              lang={lang}
              areaName={getAreaName(spot.area)}
              onClick={onSpotClick}
              isFavorite={favorites?.includes(spot.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin size={32} className="mx-auto text-[#D1D5DB] mb-3" />
          <p className="text-sm text-[#9CA3AF]">
            {L(lang, { ko: '해당 조건의 스팟이 없습니다', zh: '没有符合条件的地点', en: 'No spots match this filter' })}
          </p>
        </div>
      )}

      {/* Coming Soon 메시지 */}
      {city.comingSoon && (
        <div className="text-center py-12 bg-[#F9FAFB] rounded-2xl">
          <p className="text-lg font-bold text-[#374151] mb-1">
            {L(lang, { ko: '준비 중이에요', zh: '即将上线', en: 'Coming Soon' })}
          </p>
          <p className="text-sm text-[#9CA3AF]">
            {L(lang, {
              ko: `${L(lang, city.name)} 콘텐츠를 열심히 준비 중입니다!`,
              zh: `正在努力准备${L(lang, city.name)}内容！`,
              en: `We're working hard on ${L(lang, city.name)} content!`,
            })}
          </p>
        </div>
      )}
    </div>
  )
}
