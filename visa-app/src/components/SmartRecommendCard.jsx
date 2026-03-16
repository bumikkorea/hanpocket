import { useState, useEffect } from 'react'
import { MapPin, Coffee, CloudRain, Sun, Moon, Sunset, Thermometer, UtensilsCrossed, X, RefreshCw } from 'lucide-react'
import { getSmartRecommendation } from '../api/smartRecommendApi'
import { getWeatherLabel } from '../api/weatherApi'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const ICON_MAP = {
  'coffee': Coffee,
  'sun': Sun,
  'cloud-rain': CloudRain,
  'map-pin': MapPin,
  'sunset': Sunset,
  'moon': Moon,
  'utensils': UtensilsCrossed,
  'thermometer': Thermometer,
}

const TEXTS = {
  poweredBy: { ko: '지금 서울', zh: '现在的首尔', en: 'Seoul Now', ja: '今のソウル' },
  dismiss: { ko: '닫기', zh: '关闭', en: 'Dismiss', ja: '閉じる' },
  refresh: { ko: '새로고침', zh: '刷新', en: 'Refresh', ja: '更新' },
}

export default function SmartRecommendCard({ lang, userArea }) {
  const [recommendation, setRecommendation] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  async function loadRecommendation() {
    setLoading(true)
    try {
      const rec = await getSmartRecommendation(userArea)
      setRecommendation(rec)
    } catch (e) {
      console.error('Failed to load recommendation:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadRecommendation()
    // Refresh every 30 minutes
    const interval = setInterval(loadRecommendation, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [userArea])

  if (dismissed || (!loading && !recommendation)) return null

  const Icon = recommendation?.icon ? ICON_MAP[recommendation.icon] || MapPin : MapPin
  const weather = recommendation?.weather

  return (
    <div className="bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl overflow-hidden text-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <Icon size={12} className="text-white" />
          </div>
          <span className="text-xs font-medium text-white/70">{L(lang, TEXTS.poweredBy)}</span>
          {weather && (
            <span className="text-xs text-white/50">
              {weather.temp}° · {getWeatherLabel(weather, lang)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={loadRecommendation} className="p-1 rounded-full hover:bg-white/10">
            <RefreshCw size={12} className={`text-white/40 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setDismissed(true)} className="p-1 rounded-full hover:bg-white/10">
            <X size={12} className="text-white/40" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="px-4 pb-4 pt-2">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse" />
        </div>
      ) : recommendation && (
        <>
          {/* Title */}
          <div className="px-4 pb-3">
            <h3 className="text-sm font-bold leading-snug">{L(lang, recommendation.title)}</h3>
          </div>

          {/* Items */}
          <div className="px-4 pb-4 space-y-2">
            {recommendation.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/8 backdrop-blur-sm">
                <span className="text-xs font-bold text-white/40 w-4 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{L(lang, item.name)}</p>
                  {item.area && (
                    <p className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                      <MapPin size={8} />
                      {item.area}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
