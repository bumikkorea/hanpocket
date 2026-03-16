// PostReviewRecommend — 리뷰 완료 후 맞춤 추천 카드
// 1순위: 같은 카테고리 팝업 (뷰티→뷰티)
// 2순위: 주변 맛집/카페 (날씨+시간 반영)
// 3순위: 주변 관광지

import { useState, useEffect } from 'react'
import { MapPin, Clock, Utensils, Coffee, Navigation, ChevronRight, Sparkles } from 'lucide-react'
import { CATEGORY_MAP } from '../data/popupCategories'

const API = 'https://hanpocket-popup-store.bumik-korea.workers.dev/api'

// 날씨에 따른 맛집 추천 문구
function getWeatherHint(weather, lang) {
  if (!weather) return null
  const { temp, condition } = weather // condition: sunny/cloudy/rainy/snowy/cold

  const hints = {
    sunny: {
      cn: `☀️ 今天天气不错 ${temp}°C — 推荐有露台的地方！`,
      ko: `☀️ 오늘 날씨 좋아요 ${temp}°C — 테라스 있는 곳 추천!`,
      en: `☀️ Nice weather ${temp}°C — terrace spots recommended!`,
    },
    rainy: {
      cn: `🌧️ 外面在下雨 — 推荐有氛围的室内餐厅`,
      ko: `🌧️ 비가 와요 — 분위기 좋은 실내 맛집 추천`,
      en: `🌧️ It's raining — cozy indoor spots recommended`,
    },
    cold: {
      cn: `🥶 今天挺冷的 ${temp}°C — 来碗热汤暖暖身？`,
      ko: `🥶 오늘 추워요 ${temp}°C — 따뜻한 국물 어때요?`,
      en: `🥶 Cold today ${temp}°C — how about hot soup?`,
    },
    cloudy: {
      cn: `⛅ 多云 ${temp}°C — 找个舒适的咖啡厅坐坐？`,
      ko: `⛅ 흐림 ${temp}°C — 편한 카페에서 쉬어가요?`,
      en: `⛅ Cloudy ${temp}°C — find a cozy cafe?`,
    },
  }
  return hints[condition]?.[lang] || hints.sunny[lang]
}


export default function PostReviewRecommend({
  popup,                // 방금 리뷰한 팝업
  lang = 'cn',
  weather = null,       // { temp: 18, condition: 'sunny' }
  nearbyPopups = [],    // 같은 카테고리 근처 팝업
  nearbyRestaurants = [],
  nearbyCafes = [],
  onClickItem,          // (type, id, position) => void — 클릭 추적
  onClose,
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  if (!popup) return null

  const t = (obj) => obj?.[lang] || obj?.cn || obj?.ko || ''
  const categoryInfo = CATEGORY_MAP[popup.category]

  // 같은 카테고리 팝업 (반경 2km, 현재 활성, days_left 적은 순)
  const sameCatPopups = nearbyPopups
    .filter(p => p.id !== popup.id && p.category === popup.category)
    .sort((a, b) => (a.days_left ?? 999) - (b.days_left ?? 999))
    .slice(0, 2)

  // 맛집 (상위 3개)
  const topRestaurants = nearbyRestaurants.slice(0, 3)
  const topCafes = nearbyCafes.slice(0, 2)

  const handleClick = (type, item, position) => {
    onClickItem?.(type, item.id, position)
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-amber-500" />
          <span className="text-sm font-bold text-gray-900">
            {lang === 'cn' ? '🎉 感谢评价！为你推荐' : lang === 'ko' ? '🎉 리뷰 감사합니다! 맞춤 추천' : '🎉 Thanks! Here are picks for you'}
          </span>
        </div>
      </div>

      {/* 1순위: 같은 카테고리 팝업 */}
      {sameCatPopups.length > 0 && (
        <div className="px-5 pb-4">
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            {categoryInfo?.emoji}
            {lang === 'cn'
              ? `你喜欢的${t(categoryInfo?.label)}，附近还有`
              : lang === 'ko'
              ? `좋아하신 ${t(categoryInfo?.label)}, 근처에 더 있어요`
              : `More ${t(categoryInfo?.label)} nearby`}
          </div>
          <div className="space-y-2">
            {sameCatPopups.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => handleClick('same_category_popup', p, idx)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-[0.99] transition-all text-left"
              >
                {p.cover_image ? (
                  <img src={p.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                    {categoryInfo?.emoji || '📌'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {p.name_cn || p.name_ko}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={10} />
                    {p.district}
                    {p.walk_minutes && (
                      <span className="ml-1">
                        · {lang === 'cn' ? `步行${p.walk_minutes}分` : lang === 'ko' ? `도보 ${p.walk_minutes}분` : `${p.walk_minutes}min walk`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  {p.days_left !== null && p.days_left <= 7 && (
                    <div className="text-xs font-bold text-red-500">D-{p.days_left}</div>
                  )}
                  <ChevronRight size={14} className="text-gray-400 mt-0.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 구분선 */}
      {sameCatPopups.length > 0 && (topRestaurants.length > 0 || topCafes.length > 0) && (
        <div className="mx-5 border-t border-gray-100" />
      )}

      {/* 2순위: 맛집 (날씨 반영) */}
      {topRestaurants.length > 0 && (
        <div className="px-5 py-4">
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Utensils size={12} />
            {lang === 'cn' ? '饿了吗？附近美食' : lang === 'ko' ? '배고프지 않으세요?' : 'Hungry?'}
          </div>

          {/* 날씨 힌트 */}
          {weather && (
            <div className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5 mb-2">
              {getWeatherHint(weather, lang)}
            </div>
          )}

          <div className="space-y-2">
            {topRestaurants.map((r, idx) => (
              <button
                key={r.id}
                onClick={() => handleClick('restaurant', r, sameCatPopups.length + idx)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 active:scale-[0.99] transition-all text-left"
              >
                <div className="text-xl flex-shrink-0">🍽️</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.category} · {r.distance}</div>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 카페 */}
      {topCafes.length > 0 && (
        <div className="px-5 pb-4">
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Coffee size={12} />
            {lang === 'cn' ? '休息一下？' : lang === 'ko' ? '카페 쉬어가기' : 'Take a break?'}
          </div>
          <div className="space-y-2">
            {topCafes.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => handleClick('cafe', c, sameCatPopups.length + topRestaurants.length + idx)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 active:scale-[0.99] transition-all text-left"
              >
                <div className="text-xl flex-shrink-0">☕</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.distance}</div>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 하단 닫기 */}
      <div className="px-5 pb-4">
        <button
          onClick={onClose}
          className="w-full text-center text-xs text-gray-400 py-2"
        >
          {lang === 'cn' ? '关闭' : lang === 'ko' ? '닫기' : 'Close'}
        </button>
      </div>
    </div>
  )
}
