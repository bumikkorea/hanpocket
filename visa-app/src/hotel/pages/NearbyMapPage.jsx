import { ArrowLeft, MapPin, Phone } from 'lucide-react'

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

const nearbyPlaces = [
  { emoji: '🏪', name: '便利店', ko: '편의점', distance: '200m' },
  { emoji: '💊', name: '药店', ko: '약국', distance: '350m' },
  { emoji: '🏧', name: 'ATM', ko: 'ATM', distance: '150m' },
  { emoji: '🚇', name: '地铁站', ko: '지하철역', distance: '450m' },
  { emoji: '🏥', name: '医院', ko: '병원', distance: '600m' },
  { emoji: '📱', name: '移动服务', ko: '통신사', distance: '300m' }
]

export default function NearbyMapPage({ hotel, onBack }) {
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
        <h1 className="text-2xl font-bold">{L({ ko: '주변지도', zh: '周边地图', en: 'Nearby Map' })}</h1>
      </div>

      {/* 히어로 배너 */}
      <div className="h-32 bg-gradient-to-br from-[var(--info)] to-[color-mix(in_srgb,var(--info)_80%,#000)] flex items-center justify-center">
        <div className="text-center text-white">
          <MapPin size={40} className="mx-auto mb-2" />
          <p className="text-lg font-bold">{L(hotel.name)}</p>
        </div>
      </div>

      {/* 주변 시설 리스트 */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-xl)] py-[var(--spacing-lg)] space-y-[var(--spacing-md)]">
        {nearbyPlaces.map((place, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-[var(--spacing-lg)] bg-[var(--surface)] rounded-[var(--radius-card)] hover:bg-[var(--bg)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{place.emoji}</div>
              <div>
                <p className="font-semibold text-sm">{place.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{place.distance}</p>
              </div>
            </div>
            <a href="#" className="text-[var(--primary)] text-lg">›</a>
          </div>
        ))}
      </div>
    </div>
  )
}
