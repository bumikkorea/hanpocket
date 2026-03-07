import React from 'react'
import { Star, Heart } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

// 카테고리 라벨 매핑
const CATEGORY_LABELS = {
  food: { ko: '맛집', zh: '美食', en: 'Restaurant' },
  cafe: { ko: '카페', zh: '咖啡厅', en: 'Cafe' },
  shopping: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
  attraction: { ko: '관광', zh: '观光', en: 'Attraction' },
  experience: { ko: '체험', zh: '体验', en: 'Experience' },
}

// 지역 라벨 매핑  
const AREA_LABELS = {
  myeongdong: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
  gangnam: { ko: '강남', zh: '江南', en: 'Gangnam' },
  hongdae: { ko: '홍대', zh: '弘大', en: 'Hongdae' },
  itaewon: { ko: '이태원', zh: '梨泰院', en: 'Itaewon' },
  seongsu: { ko: '성수', zh: '圣水', en: 'Seongsu' },
  bukchon: { ko: '북촌', zh: '北村', en: 'Bukchon' },
}

export default function SpotCard({ spot, lang, onClick, compact = false }) {
  const categoryLabel = L(lang, CATEGORY_LABELS[spot.category] || { ko: '장소', zh: '地点', en: 'Place' })
  const areaLabel = L(lang, AREA_LABELS[spot.area] || { ko: spot.area, zh: spot.area, en: spot.area })
  const name = L(lang, spot.name)
  const description = L(lang, spot.description)

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="flex-shrink-0 w-[280px] rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white hover:shadow-md transition-all duration-200"
      >
        <div className="relative h-[140px]">
          <img 
            src={spot.image} 
            alt={name}
            className="w-full h-full object-cover" 
          />
          <span className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-0.5 rounded-full font-medium text-[#374151]">
            {categoryLabel}
          </span>
          <button className="absolute top-2 right-2 p-1 bg-white/90 rounded-full">
            <Heart size={14} className="text-[#9CA3AF]" />
          </button>
        </div>
        <div className="p-3">
          <p className="text-[11px] text-[#999] mb-0.5">{categoryLabel} · {areaLabel}</p>
          <p className="text-sm font-bold text-[#1A1A1A] mb-1 line-clamp-1">{name}</p>
          {spot.rating && (
            <div className="flex items-center gap-1 mb-1.5">
              <Star size={12} className="text-[#FCD34D] fill-current" />
              <span className="text-xs text-[#666]">{spot.rating}</span>
              <span className="text-xs text-[#999]">({spot.reviewCount?.toLocaleString() || 0})</span>
              {spot.tags?.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs text-[#999]">· {tag}</span>
              ))}
            </div>
          )}
          <p className="text-sm font-bold text-[#1A1A1A]">{spot.price}</p>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white hover:shadow-md transition-all duration-200"
    >
      <div className="relative h-[160px]">
        <img 
          src={spot.image} 
          alt={name}
          className="w-full h-full object-cover" 
        />
        <span className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-0.5 rounded-full font-medium text-[#374151]">
          {categoryLabel}
        </span>
        <button className="absolute top-2 right-2 p-1 bg-white/90 rounded-full">
          <Heart size={16} className="text-[#9CA3AF]" />
        </button>
      </div>
      <div className="p-3">
        <p className="text-[11px] text-[#999] mb-0.5">{categoryLabel} · {areaLabel}</p>
        <p className="text-sm font-bold text-[#1A1A1A] mb-1">{name}</p>
        {spot.rating && (
          <div className="flex items-center gap-1 mb-1.5">
            <Star size={12} className="text-[#FCD34D] fill-current" />
            <span className="text-xs text-[#666]">{spot.rating}</span>
            <span className="text-xs text-[#999]">({spot.reviewCount?.toLocaleString() || 0})</span>
            {spot.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs text-[#999]">· {tag}</span>
            ))}
          </div>
        )}
        <p className="text-sm font-bold text-[#1A1A1A]">{spot.price}</p>
        {description && (
          <p className="text-xs text-[#666] mt-1 line-clamp-2">{description}</p>
        )}
      </div>
    </button>
  )
}