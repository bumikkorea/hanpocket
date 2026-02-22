import { useState, useEffect } from 'react'
import { L } from '../home/utils/helpers'

// ─── Weather Card ───

const WEATHER_CITIES = [
  { id: 'Seoul', name: { ko: '서울', zh: '首尔', en: 'Seoul' } },
  { id: 'Busan', name: { ko: '부산', zh: '釜山', en: 'Busan' } },
  { id: 'Daegu', name: { ko: '대구', zh: '大邱', en: 'Daegu' } },
  { id: 'Incheon', name: { ko: '인천', zh: '仁川', en: 'Incheon' } },
  { id: 'Gwangju', name: { ko: '광주', zh: '光州', en: 'Gwangju' } },
  { id: 'Daejeon', name: { ko: '대전', zh: '大田', en: 'Daejeon' } },
  { id: 'Ulsan', name: { ko: '울산', zh: '蔚山', en: 'Ulsan' } },
  { id: 'Jeju', name: { ko: '제주', zh: '济州', en: 'Jeju' } },
]

export default function WeatherWidget({ lang }) {
  const [city, setCity] = useState(() => {
    try { return localStorage.getItem('weather_city') || 'Seoul' } catch { return 'Seoul' }
  })
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`https://wttr.in/${city}?format=j1`)
      .then(r => r.json())
      .then(data => {
        const cc = data.current_condition?.[0]
        if (cc) {
          setWeather({ temp: cc.temp_C, desc: cc.weatherDesc?.[0]?.value || '' })
        }
      })
      .catch(() => setWeather(null))
      .finally(() => setLoading(false))
  }, [city])

  const handleCity = (e) => {
    setCity(e.target.value)
    localStorage.setItem('weather_city', e.target.value)
  }

  const cityObj = WEATHER_CITIES.find(c => c.id === city) || WEATHER_CITIES[0]
  const temp = weather?.temp ?? '—'
  const desc = weather?.desc || (loading ? (lang === 'ko' ? '로딩중...' : lang === 'zh' ? '加载中...' : 'Loading...') : (lang === 'ko' ? '날씨 정보를 불러올 수 없습니다' : lang === 'zh' ? '无法加载天气信息' : 'Weather unavailable'))

  return (
    <div className="w-[200px] h-[180px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col justify-between shadow-sm" style={{ scrollSnapAlign: 'start' }}>
      <div>
        <p className="text-[10px] text-[#6B7280] font-medium">{lang === 'ko' ? '날씨' : lang === 'zh' ? '天气' : 'Weather'}</p>
        <select value={city} onChange={handleCity}
          className="mt-0.5 text-[9px] font-bold text-[#111827] bg-transparent outline-none cursor-pointer [&>option]:text-[#111827]">
          {WEATHER_CITIES.map(c => <option key={c.id} value={c.id}>{L(lang, c.name)}</option>)}
        </select>
      </div>
      <div>
        <p className="text-4xl font-black text-[#111827] tracking-tighter">{loading ? '...' : `${temp}°`}</p>
        <p className="text-xs text-[#6B7280] mt-2">{loading ? '' : desc}</p>
      </div>
    </div>
  )
}