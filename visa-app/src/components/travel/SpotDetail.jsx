/**
 * SpotDetail — 스팟 상세 페이지 (풀스크린)
 * 이미지 갤러리 + 정보 + 메뉴 + 카카오맵 길찾기
 */
import { useState } from 'react'
import { ChevronLeft, Star, MapPin, Clock, DollarSign, Navigation, ExternalLink, ChevronRight, Heart } from 'lucide-react'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../data/travelData'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const PRICE_LABELS = {
  1: { ko: '저렴해요', zh: '便宜', en: 'Budget' },
  2: { ko: '보통이에요', zh: '适中', en: 'Moderate' },
  3: { ko: '비싸요', zh: '偏贵', en: 'Expensive' },
}

export default function SpotDetail({ spot, lang, city, onBack, isFavorite, onToggleFavorite }) {
  const catLabel = CATEGORY_LABELS[spot.category] || {}
  const catColor = CATEGORY_COLORS[spot.category] || 'bg-gray-50 text-gray-700'
  const priceLabel = PRICE_LABELS[spot.priceRange]

  const openKakaoMap = () => {
    const name = encodeURIComponent(L('ko', spot.name))
    const addr = encodeURIComponent(L('ko', spot.address))
    window.open(`https://map.kakao.com/link/search/${name}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto overscroll-contain">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#F3F4F6]">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-[#374151]">
            <ChevronLeft size={20} />
            {L(lang, { ko: '뒤로', zh: '返回', en: 'Back' })}
          </button>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(spot.id)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <Heart
                size={20}
                className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
              />
            </button>
          )}
        </div>
      </div>

      {/* 히어로 이미지 */}
      <div className="relative h-[240px]">
        <img
          src={spot.image}
          alt={L(lang, spot.name)}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div>`
          }}
        />
      </div>

      {/* 콘텐츠 */}
      <div className="px-5 py-5 space-y-5">
        {/* 카테고리 + 이름 */}
        <div>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${catColor}`}>
            {L(lang, catLabel)}
          </span>
          <h1 className="text-xl font-bold text-[#111827] mt-2">
            {L(lang, spot.name)}
          </h1>
        </div>

        {/* 평점 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={16}
                className={i <= Math.round(spot.rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-[#111827]">{spot.rating}</span>
          <span className="text-sm text-[#6B7280]">({spot.reviewCount?.toLocaleString()})</span>
        </div>

        {/* 태그 */}
        {spot.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {spot.tags.map((tag, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 bg-[#F3F4F6] rounded-full text-[#374151] font-medium">
                {L(lang, tag)}
              </span>
            ))}
          </div>
        )}

        {/* 정보 카드 */}
        <div className="bg-[#F9FAFB] rounded-2xl p-4 space-y-3">
          {/* 주소 */}
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-[#6B7280] mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-[#9CA3AF] font-medium">
                {L(lang, { ko: '주소', zh: '地址', en: 'Address' })}
              </p>
              <p className="text-sm text-[#374151] mt-0.5">{L(lang, spot.address)}</p>
            </div>
          </div>

          {/* 영업시간 */}
          {spot.hours && (
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-[#6B7280] mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-[#9CA3AF] font-medium">
                  {L(lang, { ko: '영업시간', zh: '营业时间', en: 'Hours' })}
                </p>
                <p className="text-sm text-[#374151] mt-0.5">{L(lang, spot.hours)}</p>
              </div>
            </div>
          )}

          {/* 가격대 */}
          <div className="flex items-start gap-3">
            <DollarSign size={16} className="text-[#6B7280] mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-[#9CA3AF] font-medium">
                {L(lang, { ko: '가격대', zh: '价格', en: 'Price' })}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-bold text-[#111827]">{L(lang, spot.price)}</p>
                {priceLabel && (
                  <span className="text-[11px] px-2 py-0.5 bg-[#E5E7EB] rounded-full text-[#6B7280]">
                    {'₩'.repeat(spot.priceRange)}{'₩'.repeat(3 - spot.priceRange).split('').map(() => '').join('')}
                    {' '}{L(lang, priceLabel)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div>
          <h3 className="text-sm font-bold text-[#111827] mb-2">
            {L(lang, { ko: '소개', zh: '介绍', en: 'About' })}
          </h3>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            {L(lang, spot.description)}
          </p>
        </div>

        {/* 메뉴/가격표 */}
        {spot.menu?.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#111827] mb-2">
              {L(lang, { ko: '대표 메뉴', zh: '招牌菜', en: 'Menu Highlights' })}
            </h3>
            <div className="space-y-2">
              {spot.menu.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                  <span className="text-sm text-[#374151]">{L(lang, item.name)}</span>
                  <span className="text-sm font-bold text-[#111827]">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 카카오맵 길찾기 */}
        <button
          onClick={openKakaoMap}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#111827] text-white rounded-xl font-semibold text-sm active:bg-[#374151] transition-colors"
        >
          <Navigation size={16} />
          {L(lang, { ko: '카카오맵에서 길찾기', zh: '在KakaoMap导航', en: 'Navigate on KakaoMap' })}
        </button>
      </div>
    </div>
  )
}
