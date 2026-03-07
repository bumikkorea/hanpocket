import React, { useState, useEffect } from 'react'
import { ChevronLeft, Star, MapPin, Clock, ExternalLink, Share, Heart, Navigation } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

// 카테고리별 한국어 표현 매핑
const PHRASE_MAPPINGS = {
  food: 'restaurant',
  cafe: 'cafe', 
  shopping: 'shopping',
  attraction: 'tourist',
  experience: 'tourist',
}

// 상황별 한국어 표현 (간소화된 버전)
const KOREAN_PHRASES = {
  restaurant: [
    { ko: '이거 주세요', zh: '请给我这个', en: 'This please', roman: 'i-geo ju-se-yo' },
    { ko: '계산해 주세요', zh: '请结账', en: 'Check please', roman: 'gye-san-hae ju-se-yo' },
    { ko: '맛있어요!', zh: '好吃！', en: 'Delicious!', roman: 'ma-si-sseo-yo' },
    { ko: '추천해 주세요', zh: '请推荐', en: 'Recommend please', roman: 'chu-cheon-hae ju-se-yo' },
  ],
  cafe: [
    { ko: '아이스 아메리카노 주세요', zh: '请给我冰美式', en: 'Iced americano please', roman: 'a-i-seu a-me-ri-ka-no ju-se-yo' },
    { ko: '테이크아웃이요', zh: '打包', en: 'Takeout', roman: 'te-i-keu-a-ut-i-yo' },
    { ko: '와이파이 비밀번호 알려주세요', zh: '请告诉我WiFi密码', en: 'WiFi password please', roman: 'wa-i-pa-i bi-mil-beon-ho al-lyeo-ju-se-yo' },
  ],
  shopping: [
    { ko: '이거 얼마예요?', zh: '这个多少钱？', en: 'How much is this?', roman: 'i-geo eol-ma-ye-yo' },
    { ko: '좀 깎아 주세요', zh: '请便宜一点', en: 'Discount please', roman: 'jom kkak-a ju-se-yo' },
    { ko: '카드 돼요?', zh: '可以刷卡吗？', en: 'Card OK?', roman: 'ka-deu dwae-yo' },
  ],
  tourist: [
    { ko: '사진 찍어 주세요', zh: '请帮我拍照', en: 'Take photo please', roman: 'sa-jin jjig-eo ju-se-yo' },
    { ko: '입장료가 얼마예요?', zh: '门票多少钱？', en: 'How much is admission?', roman: 'ip-jang-ryo-ga eol-ma-ye-yo' },
    { ko: '몇 시까지 열어요?', zh: '开到几点？', en: 'Until what time open?', roman: 'myeot si-kka-ji yeol-eo-yo' },
  ],
}

export default function SpotDetail({ spot, lang, onBack }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const name = L(lang, spot.name)
  const description = L(lang, spot.description)
  const address = L(lang, spot.address)
  
  const images = spot.images || [spot.image]
  const phrases = KOREAN_PHRASES[PHRASE_MAPPINGS[spot.category]] || KOREAN_PHRASES.tourist

  useEffect(() => {
    // 스크롤을 최상단으로 이동
    window.scrollTo(0, 0)
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // 폴백: 클립보드에 복사
      navigator.clipboard.writeText(window.location.href)
      alert(lang === 'ko' ? '링크가 복사되었습니다' : lang === 'zh' ? '链接已复制' : 'Link copied')
    }
  }

  const handleKakaoMap = () => {
    if (spot.kakaoMapUrl) {
      window.open(spot.kakaoMapUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="p-1">
            <ChevronLeft size={24} className="text-[#374151]" />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2"
            >
              <Heart 
                size={20} 
                className={isFavorite ? "text-red-500 fill-current" : "text-[#9CA3AF]"} 
              />
            </button>
            <button onClick={handleShare} className="p-2">
              <Share size={20} className="text-[#9CA3AF]" />
            </button>
          </div>
        </div>
      </div>

      {/* 이미지 갤러리 */}
      <div className="relative h-[300px] bg-[#F9FAFB]">
        <img 
          src={images[currentImageIndex]} 
          alt={name}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* 기본 정보 */}
        <div>
          <h1 className="text-xl font-bold text-[#111827] mb-2">{name}</h1>
          
          {/* 평점 및 리뷰 */}
          {spot.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-[#FCD34D] fill-current" />
                <span className="text-sm font-medium text-[#374151]">{spot.rating}</span>
              </div>
              <span className="text-sm text-[#9CA3AF]">({spot.reviewCount?.toLocaleString() || 0})</span>
              <div className="flex gap-1">
                {spot.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 설명 */}
          <p className="text-[#6B7280] leading-relaxed">{description}</p>
        </div>

        {/* 위치 정보 */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-[#6B7280] mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[#374151] font-medium">{address}</p>
              <button 
                onClick={handleKakaoMap}
                className="inline-flex items-center gap-1 mt-1 text-sm text-[#2563EB] hover:underline"
              >
                <Navigation size={14} />
                {lang === 'ko' ? '길찾기' : lang === 'zh' ? '导航' : 'Directions'}
              </button>
            </div>
          </div>

          {/* 영업시간 */}
          {spot.hours && (
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-[#6B7280] flex-shrink-0" />
              <span className="text-[#374151]">{spot.hours}</span>
            </div>
          )}

          {/* 가격대 */}
          {spot.price && (
            <div className="flex items-center gap-3">
              <span className="text-[#6B7280] font-medium text-lg">₩</span>
              <span className="text-[#374151] font-medium">{spot.price}</span>
            </div>
          )}
        </div>

        {/* 상황별 한국어 회화 */}
        <div className="bg-[#F9FAFB] rounded-xl p-4">
          <h3 className="text-lg font-semibold text-[#111827] mb-3">
            {lang === 'ko' ? '유용한 한국어 표현' : lang === 'zh' ? '实用韩语表达' : 'Useful Korean Phrases'}
          </h3>
          <div className="space-y-3">
            {phrases.map((phrase, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-[#E5E7EB]">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[#111827] font-medium">{phrase.ko}</span>
                  <span className="text-xs text-[#9CA3AF]">{phrase.roman}</span>
                </div>
                <p className="text-sm text-[#6B7280]">
                  {lang === 'zh' ? phrase.zh : phrase.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 여백 */}
        <div className="h-8" />
      </div>
    </div>
  )
}