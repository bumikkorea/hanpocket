import { useState, useEffect } from 'react'
import { trackEvent } from '../../../utils/analytics'

// WMO weather code → emoji
function weatherEmoji(code) {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 86) return '❄️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

// Seoul coordinates for Korea weather
const SEOUL_COORDS = { lat: 37.57, lon: 126.98 }

// 시간대 데이터
const TIMEZONE_OPTIONS = [
  { id: 'CST', code: 'CN', flag: '🇨🇳', name: { ko: '중국', zh: '中国', en: 'China' }, offset: 8 },
  { id: 'JST', code: 'JP', flag: '🇯🇵', name: { ko: '일본', zh: '日本', en: 'Japan' }, offset: 9 },
  { id: 'EST', code: 'US', flag: '🇺🇸', name: { ko: '미국 동부', zh: '美国东部', en: 'US East' }, offset: -5 },
  { id: 'PST', code: 'US', flag: '🇺🇸', name: { ko: '미국 서부', zh: '美国西部', en: 'US West' }, offset: -8 },
  { id: 'GMT', code: 'GB', flag: '🇬🇧', name: { ko: '영국', zh: '英国', en: 'UK' }, offset: 0 },
  { id: 'SGT', code: 'SG', flag: '🇸🇬', name: { ko: '싱가포르', zh: '新加坡', en: 'Singapore' }, offset: 8 },
  { id: 'AEST', code: 'AU', flag: '🇦🇺', name: { ko: '호주(시드니)', zh: '悉尼', en: 'Sydney' }, offset: 11 },
]

// Open-Meteo weather cache (30min)
const _weatherCache = { data: {}, ts: 0 }

function useWeather(tzIds) {
  const [data, setData] = useState(_weatherCache.data)

  useEffect(() => {
    const points = [{ id: 'KST', lat: SEOUL_COORDS.lat, lon: SEOUL_COORDS.lon }]
    tzIds.forEach(tzId => {
      const tz = TIMEZONE_OPTIONS.find(t => t.id === tzId)
      if (tz?.offset !== undefined) {
        // Use Seoul coords for now - could be improved with actual city coords
        points.push({ id: tz.id, lat: SEOUL_COORDS.lat, lon: SEOUL_COORDS.lon })
      }
    })

    const cacheKey = points.map(p => p.id).sort().join(',')
    if (_weatherCache.key === cacheKey && Date.now() - _weatherCache.ts < 30 * 60 * 1000) {
      setData(_weatherCache.data)
      return
    }

    Promise.all(points.map(p =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code&timezone=auto`)
        .then(r => r.json())
        .then(j => ({ 
          id: p.id, 
          temp: Math.round(j.current?.temperature_2m ?? 0), 
          emoji: weatherEmoji(j.current?.weather_code ?? 0) 
        }))
        .catch(() => ({ id: p.id, temp: null, emoji: '' }))
    )).then(results => {
      const map = {}
      results.forEach(r => { map[r.id] = { temp: r.temp, emoji: r.emoji } })
      _weatherCache.data = map
      _weatherCache.key = cacheKey
      _weatherCache.ts = Date.now()
      setData(map)
    })
  }, [tzIds.join(',')])

  return data
}

export default function WeatherWidget({ 
  language, 
  L, 
  selectedTimezones, 
  onTimezoneToggle,
  onWeatherClick 
}) {
  const weather = useWeather(selectedTimezones)
  
  const handleWeatherClick = () => {
    trackEvent('weather_check', { timezones: selectedTimezones })
    onWeatherClick?.()
  }

  return (
    <div className="space-y-4">
      {/* 날씨 섹션 */}
      <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-[#111827]">
            {L(language, { ko: '날씨', zh: '天气', en: 'Weather' })}
          </h3>
          <button
            onClick={handleWeatherClick}
            className="text-sm text-[#2D5A3D] hover:text-[#1F2937] transition-colors"
          >
            {L(language, { ko: '새로고침', zh: '刷新', en: 'Refresh' })}
          </button>
        </div>
        
        {/* 서울 날씨 */}
        <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-[6px] mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇰🇷</span>
            <span className="font-medium text-[#111827]">
              {L(language, { ko: '서울', zh: '首尔', en: 'Seoul' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{weather.KST?.emoji || '🌡️'}</span>
            <span className="text-lg font-semibold text-[#111827]">
              {weather.KST?.temp ? `${weather.KST.temp}°C` : '--°C'}
            </span>
          </div>
        </div>

        {/* 다른 도시들 */}
        {selectedTimezones.length > 0 && (
          <div className="space-y-2">
            {selectedTimezones.map(tzId => {
              const tz = TIMEZONE_OPTIONS.find(t => t.id === tzId)
              if (!tz) return null
              
              return (
                <div key={tzId} className="flex items-center justify-between p-2 rounded-[6px] hover:bg-[#F3F4F6] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{tz.flag}</span>
                    <span className="text-sm text-[#374151]">{L(language, tz.name)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{weather[tzId]?.emoji || '🌡️'}</span>
                    <span className="text-sm font-medium text-[#111827]">
                      {weather[tzId]?.temp ? `${weather[tzId].temp}°C` : '--°C'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 시간대 선택 */}
        <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
          <p className="text-xs text-[#6B7280] mb-2">
            {L(language, { ko: '추가 도시 선택', zh: '选择其他城市', en: 'Select other cities' })}
          </p>
          <div className="flex flex-wrap gap-2">
            {TIMEZONE_OPTIONS.map(tz => (
              <button
                key={tz.id}
                onClick={() => onTimezoneToggle(tz.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-[6px] transition-all ${
                  selectedTimezones.includes(tz.id)
                    ? 'bg-[#111827] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                }`}
              >
                <span>{tz.flag}</span>
                <span>{L(language, tz.name)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}