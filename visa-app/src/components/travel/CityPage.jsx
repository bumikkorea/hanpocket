import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import SpotCard from './SpotCard'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

const TABS = [
  { id: 'overview', label: { ko: '둘러보기', zh: '浏览', en: 'Overview' } },
  { id: 'food', label: { ko: '맛집', zh: '美食', en: 'Food' } },
  { id: 'experience', label: { ko: '체험&입장', zh: '体验&门票', en: 'Experience' } },
  { id: 'shopping', label: { ko: '쇼핑', zh: '购物', en: 'Shopping' } },
  { id: 'transport', label: { ko: '교통', zh: '交通', en: 'Transport' } },
]

export default function CityPage({ city, lang, onBack, onAreaClick, onSpotClick }) {
  const [activeTab, setActiveTab] = useState('overview')

  const cityName = L(lang, city.name)
  const cityDescription = L(lang, city.description)

  // 탭별 필터링된 스팟들
  const getFilteredSpots = () => {
    switch (activeTab) {
      case 'food':
        return city.spots.filter(spot => ['food', 'cafe'].includes(spot.category))
      case 'experience':
        return city.spots.filter(spot => ['attraction', 'experience'].includes(spot.category))
      case 'shopping':
        return city.spots.filter(spot => spot.category === 'shopping')
      case 'transport':
        return [] // 교통 정보는 별도 구현
      default:
        return city.spots // 전체 스팟
    }
  }

  const filteredSpots = getFilteredSpots()

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="p-1">
            <ChevronLeft size={24} className="text-[#374151]" />
          </button>
          <h1 className="text-lg font-semibold text-[#111827]">{cityName}</h1>
        </div>
      </div>

      {/* 히어로 섹션 */}
      <div className="relative h-[200px] bg-[#F9FAFB]">
        <img 
          src={city.image} 
          alt={cityName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-2xl font-bold text-white mb-1">{cityName}</h2>
          <p className="text-white/90 text-sm">{cityDescription}</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="sticky top-[64px] z-10 bg-white border-b border-[#E5E7EB]">
        <div className="flex overflow-x-auto px-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#2D5A3D] text-[#2D5A3D]'
                  : 'border-transparent text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              {L(lang, tab.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* 인기 지역 */}
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-4">
                {lang === 'ko' ? '인기 지역' : lang === 'zh' ? '热门地区' : 'Popular Areas'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {city.areas.map(area => (
                  <button
                    key={area.id}
                    onClick={() => onAreaClick?.(area)}
                    className="group relative h-[120px] rounded-xl overflow-hidden bg-[#F9FAFB] hover:shadow-md transition-all duration-200"
                  >
                    <img 
                      src={area.image} 
                      alt={L(lang, area.name)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 p-3 flex flex-col justify-end">
                      <h4 className="text-white font-semibold text-sm">
                        {L(lang, area.name)}
                      </h4>
                      <p className="text-white/80 text-xs line-clamp-2">
                        {L(lang, area.description)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 인기 스팟 (전체) */}
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-4">
                {lang === 'ko' ? '인기 스팟' : lang === 'zh' ? '热门景点' : 'Popular Spots'}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {city.spots.slice(0, 6).map(spot => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    lang={lang}
                    onClick={() => onSpotClick?.(spot)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'transport' && (
          <div className="text-center py-12">
            <p className="text-[#9CA3AF]">
              {lang === 'ko' ? '교통 정보는 준비 중입니다' : lang === 'zh' ? '交通信息准备中' : 'Transportation info coming soon'}
            </p>
          </div>
        )}

        {activeTab !== 'overview' && activeTab !== 'transport' && (
          <div>
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              {L(lang, TABS.find(t => t.id === activeTab)?.label || '')}
            </h3>
            {filteredSpots.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredSpots.map(spot => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    lang={lang}
                    onClick={() => onSpotClick?.(spot)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#9CA3AF]">
                  {lang === 'ko' ? '준비 중입니다' : lang === 'zh' ? '准备中' : 'Coming soon'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 하단 여백 */}
        <div className="h-8" />
      </div>
    </div>
  )
}