/**
 * Weather API (OpenWeatherMap)
 * Used for context-aware smart recommendations
 *
 * Free tier: 1,000 calls/day, current weather + 5-day forecast
 * TODO: Register for API key: VITE_OPENWEATHER_API_KEY
 * https://openweathermap.org/api
 */

// Seoul area coordinates
const AREA_COORDS = {
  hongdae: { lat: 37.5563, lon: 126.9236, name: { ko: '홍대', zh: '弘大', en: 'Hongdae', ja: 'ホンデ' } },
  myeongdong: { lat: 37.5636, lon: 126.9860, name: { ko: '명동', zh: '明洞', en: 'Myeongdong', ja: '明洞' } },
  gangnam: { lat: 37.4979, lon: 127.0276, name: { ko: '강남', zh: '江南', en: 'Gangnam', ja: 'カンナム' } },
  itaewon: { lat: 37.5345, lon: 126.9946, name: { ko: '이태원', zh: '梨泰院', en: 'Itaewon', ja: 'イテウォン' } },
  jongno: { lat: 37.5704, lon: 126.9920, name: { ko: '종로', zh: '钟路', en: 'Jongno', ja: 'チョンノ' } },
  seongsu: { lat: 37.5447, lon: 127.0557, name: { ko: '성수', zh: '圣水', en: 'Seongsu', ja: 'ソンス' } },
  insadong: { lat: 37.5748, lon: 126.9868, name: { ko: '인사동', zh: '仁寺洞', en: 'Insadong', ja: '仁寺洞' } },
  yeouido: { lat: 37.5219, lon: 126.9245, name: { ko: '여의도', zh: '汝矣岛', en: 'Yeouido', ja: 'ヨイド' } },
}

// Cache: 30 min TTL
let _cache = { data: null, ts: 0, key: '' }
const CACHE_TTL = 30 * 60 * 1000

/**
 * Fetch current weather for Seoul
 */
export async function fetchCurrentWeather(lat = 37.5665, lon = 126.9780) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
  const cacheKey = `${lat},${lon}`

  if (_cache.key === cacheKey && Date.now() - _cache.ts < CACHE_TTL) {
    return _cache.data
  }

  if (apiKey) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`
      )
      if (res.ok) {
        const data = await res.json()
        const result = {
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          condition: data.weather[0]?.main || 'Clear',
          conditionId: data.weather[0]?.id || 800,
          description: data.weather[0]?.description || '',
          icon: data.weather[0]?.icon || '01d',
          windSpeed: data.wind?.speed || 0,
          isRaining: [2, 3, 5].includes(Math.floor((data.weather[0]?.id || 800) / 100)),
          isSnowing: Math.floor((data.weather[0]?.id || 800) / 100) === 6,
          isClear: (data.weather[0]?.id || 800) === 800,
          isCloudy: Math.floor((data.weather[0]?.id || 800) / 100) === 8 && (data.weather[0]?.id || 800) !== 800,
          timestamp: new Date().toISOString(),
        }
        _cache = { data: result, ts: Date.now(), key: cacheKey }
        return result
      }
    } catch (e) {
      console.warn('Weather API failed:', e)
    }
  }

  // Fallback: mock weather based on season
  const month = new Date().getMonth()
  const hour = new Date().getHours()
  let temp, condition, isRaining
  if (month >= 2 && month <= 4) { temp = 12; condition = 'Clear'; isRaining = false }
  else if (month >= 5 && month <= 8) { temp = 27; condition = month >= 6 && month <= 7 ? 'Rain' : 'Clear'; isRaining = month >= 6 && month <= 7 }
  else if (month >= 9 && month <= 10) { temp = 15; condition = 'Clear'; isRaining = false }
  else { temp = -2; condition = 'Clear'; isRaining = false }

  const result = {
    temp,
    feels_like: temp - 2,
    humidity: 60,
    condition,
    conditionId: isRaining ? 500 : 800,
    description: condition,
    icon: isRaining ? '10d' : hour >= 18 || hour < 6 ? '01n' : '01d',
    windSpeed: 3,
    isRaining,
    isSnowing: temp < 0 && month >= 11,
    isClear: !isRaining,
    isCloudy: false,
    timestamp: new Date().toISOString(),
  }
  _cache = { data: result, ts: Date.now(), key: cacheKey }
  return result
}

/**
 * Get weather condition label
 */
export function getWeatherLabel(weather, lang = 'ko') {
  if (!weather) return ''
  if (weather.isRaining) return { ko: '비', zh: '雨', en: 'Rain', ja: '雨' }[lang] || 'Rain'
  if (weather.isSnowing) return { ko: '눈', zh: '雪', en: 'Snow', ja: '雪' }[lang] || 'Snow'
  if (weather.isCloudy) return { ko: '흐림', zh: '多云', en: 'Cloudy', ja: '曇り' }[lang] || 'Cloudy'
  return { ko: '맑음', zh: '晴', en: 'Clear', ja: '晴れ' }[lang] || 'Clear'
}

export { AREA_COORDS }
