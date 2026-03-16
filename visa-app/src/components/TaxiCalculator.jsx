import { useState, useMemo } from 'react'
import { Car, MapPin, Moon, Sun, ChevronRight, ExternalLink, Navigation, Clock, DollarSign, Info, Minus, Plus } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const TAXI_TYPES = [
  {
    id: 'regular',
    name: { ko: '일반택시', zh: '普通出租车', en: 'Regular Taxi' },
    color: 'bg-orange-500',
    baseFare: 4800,
    baseDistance: 1.6,       // km
    distanceFare: 131,       // won per 100m
    distanceUnit: 100,       // meters
    timeFare: 131,           // won per 30s
    timeUnit: 30,            // seconds
    nightSurcharge: 0.2,     // 20%
    icon: '🟠',
  },
  {
    id: 'deluxe',
    name: { ko: '모범택시', zh: '模范出租车', en: 'Deluxe Taxi' },
    color: 'bg-black',
    baseFare: 7000,
    baseDistance: 3.0,
    distanceFare: 205,
    distanceUnit: 151,
    timeFare: 205,
    timeUnit: 36,
    nightSurcharge: 0,
    icon: '⚫',
  },
  {
    id: 'jumbo',
    name: { ko: '대형택시', zh: '大型出租车', en: 'Jumbo Taxi' },
    color: 'bg-black',
    baseFare: 7000,
    baseDistance: 3.0,
    distanceFare: 205,
    distanceUnit: 151,
    timeFare: 205,
    timeUnit: 36,
    nightSurcharge: 0,
    icon: '🚐',
  },
]

function calculateFare(type, distanceKm, isNight) {
  const distanceM = distanceKm * 1000
  let fare = type.baseFare
  const baseDistanceM = type.baseDistance * 1000

  if (distanceM > baseDistanceM) {
    const extraM = distanceM - baseDistanceM
    const units = Math.floor(extraM / type.distanceUnit)
    fare += units * type.distanceFare
  }

  if (isNight && type.nightSurcharge > 0) {
    fare = Math.round(fare * (1 + type.nightSurcharge))
  }

  return fare
}

function formatWon(amount) {
  return '₩' + amount.toLocaleString()
}

export default function TaxiCalculator({ lang }) {
  const [distance, setDistance] = useState(5)
  const [isNight, setIsNight] = useState(false)
  const [inputMode, setInputMode] = useState('slider') // slider | manual

  const t = {
    title: { ko: '택시 요금 계산기', zh: '出租车费用计算器', en: 'Taxi Fare Calculator' },
    subtitle: { ko: '서울 기준 예상 요금', zh: '首尔标准预估费用', en: 'Estimated fare (Seoul)' },
    distance: { ko: '거리', zh: '距离', en: 'Distance' },
    km: { ko: 'km', zh: '公里', en: 'km' },
    nightMode: { ko: '심야 할증', zh: '深夜加价', en: 'Late Night' },
    nightTime: { ko: '00:00 ~ 04:00', zh: '00:00 ~ 04:00', en: '00:00 ~ 04:00' },
    nightOn: { ko: '심야 20% 할증 적용', zh: '深夜加收20%', en: '20% late-night surcharge applied' },
    nightOff: { ko: '일반 요금', zh: '正常费率', en: 'Normal rate' },
    baseFare: { ko: '기본요금', zh: '起步价', en: 'Base fare' },
    baseDistance: { ko: '기본거리', zh: '起步距离', en: 'Base distance' },
    perDistance: { ko: '거리요금', zh: '里程费', en: 'Distance fare' },
    nightNote: { ko: '심야할증 없음', zh: '无深夜加价', en: 'No night surcharge' },
    nightApplied: { ko: '심야 20% 할증', zh: '深夜加收20%', en: '20% night surcharge' },
    estimated: { ko: '예상 요금', zh: '预估费用', en: 'Estimated Fare' },
    callTaxi: { ko: '택시 호출', zh: '叫车', en: 'Call Taxi' },
    kakaoT: { ko: '카카오T', zh: 'Kakao T', en: 'Kakao T' },
    uber: { ko: '우버', zh: 'Uber', en: 'Uber' },
    disclaimer: { ko: '※ 실제 요금은 교통 상황, 경로에 따라 달라질 수 있습니다', zh: '※ 实际费用可能因交通状况和路线而异', en: '※ Actual fare may vary depending on traffic and route' },
    manual: { ko: '직접 입력', zh: '手动输入', en: 'Manual' },
    slider: { ko: '슬라이더', zh: '滑块', en: 'Slider' },
    per: { ko: '당', zh: '每', en: 'per' },
  }

  const fares = useMemo(() => {
    return TAXI_TYPES.map(type => ({
      ...type,
      fare: calculateFare(type, distance, isNight),
    }))
  }, [distance, isNight])

  const handleDistanceInput = (e) => {
    const val = parseFloat(e.target.value)
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setDistance(Math.round(val * 10) / 10)
    }
  }

  const adjustDistance = (delta) => {
    setDistance(prev => {
      const next = Math.round((prev + delta) * 10) / 10
      return Math.max(0.5, Math.min(100, next))
    })
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 font-[Inter]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Car className="w-5 h-5" />
          <h2 className="text-xl font-bold tracking-tight">{L(lang, t.title)}</h2>
        </div>
        <p className="text-sm text-gray-500">{L(lang, t.subtitle)}</p>
      </div>

      {/* Distance Input */}
      <div className="mb-6 p-4 border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold">{L(lang, t.distance)}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setInputMode('slider')}
              className={`px-2.5 py-1 text-xs rounded-full transition ${inputMode === 'slider' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {L(lang, t.slider)}
            </button>
            <button
              onClick={() => setInputMode('manual')}
              className={`px-2.5 py-1 text-xs rounded-full transition ${inputMode === 'manual' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {L(lang, t.manual)}
            </button>
          </div>
        </div>

        {inputMode === 'slider' ? (
          <div>
            <input
              type="range"
              min="0.5"
              max="60"
              step="0.5"
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">0.5km</span>
              <span className="text-lg font-bold">{distance} km</span>
              <span className="text-xs text-gray-400">60km</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => adjustDistance(-0.5)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 active:bg-gray-100"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={distance}
                onChange={handleDistanceInput}
                min="0.5"
                max="100"
                step="0.5"
                className="w-20 text-center text-2xl font-bold border-b-2 border-black outline-none bg-transparent"
              />
              <span className="text-sm text-gray-500">{L(lang, t.km)}</span>
            </div>
            <button
              onClick={() => adjustDistance(0.5)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 active:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Night Mode Toggle */}
      <div className="mb-6 p-4 border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isNight ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <div>
              <span className="text-sm font-semibold">{L(lang, t.nightMode)}</span>
              <p className="text-xs text-gray-400">{t.nightTime}</p>
            </div>
          </div>
          <button
            onClick={() => setIsNight(!isNight)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isNight ? 'bg-indigo-500' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isNight ? 'translate-x-6' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
        <p className="text-xs mt-2 text-gray-500">
          {isNight ? L(lang, t.nightOn) : L(lang, t.nightOff)}
        </p>
      </div>

      {/* Fare Results */}
      <div className="space-y-3 mb-6">
        {fares.map((taxi) => (
          <div key={taxi.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{taxi.icon}</span>
                <span className="font-semibold text-sm">{L(lang, taxi.name)}</span>
              </div>
              <span className="text-xl font-bold">{formatWon(taxi.fare)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>{L(lang, t.baseFare)}: {formatWon(taxi.baseFare)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                <span>{L(lang, t.baseDistance)}: {taxi.baseDistance}km</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{formatWon(taxi.distanceFare)}/{taxi.distanceUnit}m</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatWon(taxi.timeFare)}/{taxi.timeUnit}{L(lang, { ko: '초', zh: '秒', en: 's' })}</span>
              </div>
            </div>

            {isNight && (
              <div className="mt-2 text-xs">
                {taxi.nightSurcharge > 0 ? (
                  <span className="text-indigo-600 font-medium">🌙 {L(lang, t.nightApplied)}</span>
                ) : (
                  <span className="text-gray-400">{L(lang, t.nightNote)}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Call Taxi Buttons */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">{L(lang, t.callTaxi)}</p>
        <div className="flex gap-2">
          <a
            href="kakaot://launch"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FEE500] text-black font-semibold text-sm rounded-xl active:opacity-80 transition"
          >
            <span>🚕</span>
            {L(lang, t.kakaoT)}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="uber://"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white font-semibold text-sm rounded-xl active:opacity-80 transition"
          >
            <Car className="w-4 h-4" />
            {L(lang, t.uber)}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-1.5 text-xs text-gray-400">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <p>{L(lang, t.disclaimer)}</p>
      </div>
    </div>
  )
}
