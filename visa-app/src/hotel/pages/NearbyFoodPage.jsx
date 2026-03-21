import { ArrowLeft, Heart, Star } from 'lucide-react'

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

const nearbyRestaurants = [
  {
    id: 1,
    name: '老字号烤肉',
    emoji: '🥩',
    category: { ko: '구이', zh: '烤肉', en: 'BBQ' },
    distance: 200,
    rating: 4.8,
    reviews: 128,
    image: 'linear-gradient(135deg, #FF6B6B, #FF8E72)'
  },
  {
    id: 2,
    name: '韩式炸鸡',
    emoji: '🍗',
    category: { ko: '치킨', zh: '炸鸡', en: 'Chicken' },
    distance: 350,
    rating: 4.6,
    reviews: 95,
    image: 'linear-gradient(135deg, #FFA500, #FFB84D)'
  },
  {
    id: 3,
    name: '海鲜烤串',
    emoji: '🦐',
    category: { ko: '해물', zh: '海鲜', en: 'Seafood' },
    distance: 450,
    rating: 4.9,
    reviews: 156,
    image: 'linear-gradient(135deg, #4ECDC4, #44A08D)'
  },
  {
    id: 4,
    name: '中华面馆',
    emoji: '🍜',
    category: { ko: '면', zh: '面食', en: 'Noodles' },
    distance: 280,
    rating: 4.5,
    reviews: 87,
    image: 'linear-gradient(135deg, #F5A623, #F78E69)'
  },
  {
    id: 5,
    name: '胡同小食',
    emoji: '🥟',
    category: { ko: '만두', zh: '小食', en: 'Snacks' },
    distance: 320,
    rating: 4.7,
    reviews: 112,
    image: 'linear-gradient(135deg, #A8EDEA, #FED6E3)'
  },
  {
    id: 6,
    name: '日式料理',
    emoji: '🍱',
    category: { ko: '일식', zh: '日本', en: 'Japanese' },
    distance: 480,
    rating: 4.8,
    reviews: 143,
    image: 'linear-gradient(135deg, #FF6B9D, #C06C84)'
  }
]

export default function NearbyFoodPage({ hotel, onBack }) {
  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] mb-4"
        >
          <ArrowLeft size={20} />
          {L({ ko: '돌아가기', zh: '返回', en: 'Back' })}
        </button>
        <h1 className="text-2xl font-bold">{L({ ko: '주변 맛집', zh: '周边美食', en: 'Nearby Restaurants' })}</h1>
      </div>

      {/* 히어로 배너 */}
      <div
        className="h-40 flex flex-col items-center justify-center text-white px-4"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))'
        }}
      >
        <h2 className="text-3xl font-bold mb-2">🍽️</h2>
        <p className="text-lg font-bold text-center">{L({ ko: '호텔 근처 맛집', zh: '酒店周边美食', en: 'Nearby Restaurants' })}</p>
        <p className="text-sm text-white/80 mt-1">{L({ ko: '거리순 정렬', zh: '按距离排序', en: 'Sorted by distance' })}</p>
      </div>

      {/* 섹션 헤더 */}
      <div className="px-[var(--spacing-xl)] py-[var(--spacing-lg)] flex items-center justify-between">
        <h3 className="text-base font-bold">{L({ ko: '인기 맛집', zh: '热门推荐', en: 'Popular' })}</h3>
        <a href="#" className="text-xs text-[var(--text-muted)] font-medium">
          {L({ ko: '전체보기 >', zh: '查看更多 >', en: 'See more >' })}
        </a>
      </div>

      {/* 맛집 그리드 (2열) */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-xl)] pb-[var(--spacing-2xl)]">
        <div className="grid grid-cols-2 gap-[var(--spacing-md)]">
          {nearbyRestaurants.map(restaurant => (
            <div
              key={restaurant.id}
              className="rounded-[16px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {/* 이미지 영역 */}
              <div
                className="relative aspect-[3/4] flex flex-col items-center justify-center group"
                style={{ background: restaurant.image }}
              >
                {/* 이모지 */}
                <div className="text-5xl mb-2">{restaurant.emoji}</div>

                {/* 오버레이 — 좌하단 태그 */}
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {L(restaurant.category)}
                </div>

                {/* 우상단 하트 */}
                <button className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors">
                  <Heart size={18} className="text-white" fill="white" />
                </button>
              </div>

              {/* 텍스트 영역 */}
              <div className="bg-white p-[var(--spacing-lg)] space-y-[var(--spacing-md)]">
                <h4 className="text-sm font-bold text-[var(--text-primary)] line-clamp-2">
                  {restaurant.name}
                </h4>

                {/* 메타 정보 */}
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500" fill="currentColor" />
                    <span className="font-semibold text-[var(--text-primary)]">{restaurant.rating}</span>
                  </div>
                  <span>{restaurant.distance}m</span>
                </div>

                <div className="text-xs text-[var(--text-muted)]">
                  좋아요 {restaurant.reviews}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
