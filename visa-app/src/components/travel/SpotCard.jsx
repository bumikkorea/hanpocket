/**
 * SpotCard — 클룩 스타일 카드 컴포넌트 (재사용)
 * 이미지 + 카테고리 태그 + 이름 + 평점 + 가격
 */
import { Star, Heart, MapPin } from 'lucide-react'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../data/travelData'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

export default function SpotCard({ spot, lang, areaName, onClick, isFavorite, onToggleFavorite }) {
  const catLabel = CATEGORY_LABELS[spot.category] || {}
  const catColor = CATEGORY_COLORS[spot.category] || 'bg-gray-50 text-gray-700'

  return (
    <div
      onClick={() => onClick?.(spot)}
      className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white cursor-pointer transition-transform active:scale-[0.98]"
    >
      {/* 이미지 */}
      <div className="relative h-[160px]">
        <img
          src={spot.image}
          alt={L(lang, spot.name)}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div>`
          }}
        />
        {/* 카테고리 태그 */}
        <span className={`absolute top-2.5 left-2.5 text-[10px] px-2 py-0.5 rounded-full font-semibold ${catColor}`}>
          {L(lang, catLabel)}
        </span>
        {/* 찜 버튼 */}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(spot.id) }}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm"
          >
            <Heart
              size={16}
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
          </button>
        )}
      </div>

      {/* 정보 */}
      <div className="p-3">
        {/* 카테고리 · 지역 */}
        <p className="text-[11px] text-[#999] leading-none">
          {L(lang, catLabel)}{areaName ? ` · ${areaName}` : ''}
        </p>

        {/* 이름 */}
        <p className="text-sm font-bold text-[#1A1A1A] mt-1 line-clamp-1">
          {L(lang, spot.name)}
        </p>

        {/* 평점 + 태그 */}
        <div className="flex items-center gap-1 mt-1.5 text-xs text-[#666]">
          <Star size={12} className="fill-yellow-400 text-yellow-400 shrink-0" />
          <span className="font-medium">{spot.rating}</span>
          <span className="text-[#999]">({spot.reviewCount?.toLocaleString()})</span>
          {spot.tags?.[0] && (
            <>
              <span className="text-[#D1D5DB]">·</span>
              <span className="truncate">{L(lang, spot.tags[0])}</span>
            </>
          )}
        </div>

        {/* 가격 */}
        <p className="text-sm font-bold text-[#1A1A1A] mt-1.5">
          {L(lang, spot.price)}
        </p>
      </div>
    </div>
  )
}
