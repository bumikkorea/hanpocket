import { useState, useEffect, useCallback } from 'react'
import { Plane, MapPin, Clock, Gauge, AlertCircle, RefreshCw, Target } from 'lucide-react'
import GuideLayout from './GuideLayout'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const card = 'bg-white rounded-2xl p-5 border border-[#E5E7EB]'

// 일반적인 아시아 → 한국 항공편 ICAO24 코드 매핑
const FLIGHT_MAPPINGS = {
  // 중국 항공편
  'CZ3066': { icao24: '780ad6', route: { from: '광저우', to: '인천', fromCode: 'CAN', toCode: 'ICN' }},
  'CZ6079': { icao24: '780b12', route: { from: '베이징', to: '인천', fromCode: 'PEK', toCode: 'ICN' }},
  'CA123': { icao24: '780a43', route: { from: '베이징', to: '인천', fromCode: 'PEK', toCode: 'ICN' }},
  'MU5042': { icao24: '781234', route: { from: '상하이', to: '인천', fromCode: 'PVG', toCode: 'ICN' }},
  
  // 태국 항공편
  'TG658': { icao24: '86804b', route: { from: '방콕', to: '인천', fromCode: 'BKK', toCode: 'ICN' }},
  'TG656': { icao24: '86805c', route: { from: '방콕', to: '인천', fromCode: 'BKK', toCode: 'ICN' }},
  
  // 인도네시아 항공편
  'GA870': { icao24: '8a0123', route: { from: '자카르타', to: '인천', fromCode: 'CGK', toCode: 'ICN' }},
  
  // 일본 항공편
  'JL950': { icao24: '86f234', route: { from: '도쿄', to: '인천', fromCode: 'NRT', toCode: 'ICN' }},
  'NH864': { icao24: '86f567', route: { from: '도쿄', to: '인천', fromCode: 'NRT', toCode: 'ICN' }},
  
  // 베트남 항공편
  'VN421': { icao24: '8a8123', route: { from: '호치민', to: '인천', fromCode: 'SGN', toCode: 'ICN' }},
}

// 공항 좌표 (SVG 지도상의 위치)
const AIRPORTS = {
  'ICN': { lat: 37.4602, lon: 126.4407, name: '인천국제공항' },
  'PEK': { lat: 39.5098, lon: 116.4105, name: '베이징 서우두' },
  'PVG': { lat: 31.1443, lon: 121.8083, name: '상하이 푸둥' },
  'CAN': { lat: 23.1291, lon: 113.3004, name: '광저우 바이윈' },
  'BKK': { lat: 13.6900, lon: 100.7501, name: '방콕 수완나품' },
  'CGK': { lat: -6.1256, lon: 106.6559, name: '자카르타 수카르노-하타' },
  'NRT': { lat: 35.7647, lon: 140.3864, name: '도쿄 나리타' },
  'SGN': { lat: 10.8188, lon: 106.6519, name: '호치민 탄선녓' },
}

// 한국 영공 경계
const KOREA_AIRSPACE = {
  north: 39,
  south: 33,
  west: 124,
  east: 132
}

export default function FlightTracker({ lang, onClose }) {
  const [flightNumber, setFlightNumber] = useState('')
  const [flightData, setFlightData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [inKoreaAirspace, setInKoreaAirspace] = useState(false)

  // 거리 계산 함수 (Haversine formula)
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371 // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  // 진행률 계산
  const calculateProgress = useCallback((currentLat, currentLon, fromAirport, toAirport) => {
    if (!fromAirport || !toAirport) return 0
    
    const totalDistance = calculateDistance(
      fromAirport.lat, fromAirport.lon,
      toAirport.lat, toAirport.lon
    )
    const remainingDistance = calculateDistance(
      currentLat, currentLon,
      toAirport.lat, toAirport.lon
    )
    
    const progress = Math.max(0, Math.min(100, ((totalDistance - remainingDistance) / totalDistance) * 100))
    return Math.round(progress)
  }, [calculateDistance])

  // 항공편 데이터 조회
  const fetchFlightData = async (icao24) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`https://opensky-network.org/api/states/all?icao24=${icao24}`)
      
      if (!response.ok) {
        throw new Error('항공편 정보를 가져올 수 없습니다')
      }
      
      const data = await response.json()
      
      if (!data.states || data.states.length === 0) {
        throw new Error('해당 항공편을 찾을 수 없습니다')
      }
      
      const state = data.states[0]
      const [
        icao24_resp, callsign, origin_country, time_position, last_contact,
        longitude, latitude, baro_altitude, on_ground, velocity,
        true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source
      ] = state

      // 한국 영공 확인
      const isInKorea = latitude >= KOREA_AIRSPACE.south && 
                       latitude <= KOREA_AIRSPACE.north &&
                       longitude >= KOREA_AIRSPACE.west && 
                       longitude <= KOREA_AIRSPACE.east
      
      setInKoreaAirspace(isInKorea)
      
      const processedData = {
        icao24: icao24_resp,
        callsign: callsign?.trim(),
        longitude,
        latitude,
        altitude: baro_altitude ? Math.round(baro_altitude) : null,
        velocity: velocity ? Math.round(velocity * 3.6) : null, // m/s to km/h
        onGround: on_ground,
        lastContact: new Date(last_contact * 1000),
        isInKorea
      }
      
      setFlightData(processedData)
      setLastUpdate(new Date())
      
    } catch (err) {
      setError(err.message)
      setFlightData(null)
    } finally {
      setLoading(false)
    }
  }

  // 항공편 검색
  const searchFlight = () => {
    const upperFlightNumber = flightNumber.toUpperCase().trim()
    const mapping = FLIGHT_MAPPINGS[upperFlightNumber]
    
    if (!mapping) {
      setError(L(lang, {
        ko: '지원하지 않는 항공편입니다. 현재 아시아 주요 항공편만 지원됩니다.',
        zh: '不支持的航班。目前仅支持亚洲主要航班。',
        en: 'Unsupported flight. Currently only major Asian flights are supported.'
      }))
      return
    }
    
    fetchFlightData(mapping.icao24)
  }

  // SVG 지도 좌표 변환 (경도/위도 → SVG 좌표)
  const latLonToSVG = (lat, lon, width = 400, height = 300) => {
    // 아시아 지역 범위 설정
    const bounds = {
      north: 45,
      south: -10,
      west: 90,
      east: 150
    }
    
    const x = ((lon - bounds.west) / (bounds.east - bounds.west)) * width
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * height
    
    return { x: Math.max(0, Math.min(width, x)), y: Math.max(0, Math.min(height, y)) }
  }

  // 현재 항공편의 경로 정보
  const currentRoute = flightNumber.toUpperCase().trim() ? FLIGHT_MAPPINGS[flightNumber.toUpperCase().trim()]?.route : null
  const fromAirport = currentRoute ? AIRPORTS[currentRoute.fromCode] : null
  const toAirport = AIRPORTS['ICN'] // 항상 인천공항이 목적지

  // 진행률 계산
  let progress = 0
  let remainingDistance = 0
  if (flightData && fromAirport && toAirport) {
    progress = calculateProgress(flightData.latitude, flightData.longitude, fromAirport, toAirport)
    remainingDistance = Math.round(calculateDistance(
      flightData.latitude, flightData.longitude,
      toAirport.lat, toAirport.lon
    ))
  }

  // 진행률 바 생성
  const createProgressBar = (progress) => {
    const filledLength = Math.round(progress / 10)
    const emptyLength = 10 - filledLength
    return '━'.repeat(filledLength) + '✈️' + '━'.repeat(emptyLength)
  }

  // 감성 메시지 생성
  const getEmotionalMessage = (progress, isInKorea) => {
    if (isInKorea) {
      return L(lang, {
        ko: '🇰🇷 한국에 도착했습니다! 곧 인천공항에 착륙해요!',
        zh: '🇰🇷 已到达韩国！即将降落仁川机场！',
        en: '🇰🇷 Welcome to Korea! Landing at Incheon soon!'
      })
    } else if (progress > 80) {
      return L(lang, {
        ko: '거의 다 왔어요! 한국이 바로 앞에 있어요! ✨',
        zh: '快到了！韩国就在前方！✨',
        en: 'Almost there! Korea is just ahead! ✨'
      })
    } else if (progress > 50) {
      return L(lang, {
        ko: '한국이 점점 가까워지고 있어요! 💫',
        zh: '离韩国越来越近了！💫',
        en: 'Getting closer to Korea! 💫'
      })
    } else if (progress > 20) {
      return L(lang, {
        ko: '순조롭게 비행 중이에요! 🌟',
        zh: '飞行顺利！🌟',
        en: 'Flying smoothly! 🌟'
      })
    } else {
      return L(lang, {
        ko: '여행이 시작되었어요! 한국으로 출발! 🛫',
        zh: '旅程开始了！出发去韩国！🛫',
        en: 'Journey started! Off to Korea! 🛫'
      })
    }
  }

  return (
    <GuideLayout
      title={{ ko: '실시간 항공편 추적', zh: '实时航班跟踪', en: 'Real-time Flight Tracker' }}
      lang={lang}
      onClose={onClose}
      tip={{
        ko: '💡 팁: 현재 아시아 주요 항공편만 지원됩니다. 항공편이 검색되지 않으면 대표적인 예시 항공편(CZ3066, TG658 등)을 시도해보세요.',
        zh: '💡 提示：目前仅支持亚洲主要航班。如果搜索不到航班，请尝试典型示例航班（CZ3066、TG658等）。',
        en: '💡 Tip: Currently only major Asian flights are supported. If your flight isn\'t found, try sample flights like CZ3066, TG658, etc.'
      }}
    >
      {/* 항공편 검색 */}
      <div className={card}>
        <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
          <Plane size={16} />
          {L(lang, { ko: '항공편 번호 입력', zh: '输入航班号', en: 'Enter Flight Number' })}
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            placeholder="CZ3066, TG658, GA870..."
            className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#111827]"
            onKeyDown={(e) => e.key === 'Enter' && searchFlight()}
          />
          <button
            onClick={searchFlight}
            disabled={!flightNumber.trim() || loading}
            className="px-4 py-2 bg-[#111827] text-white rounded-xl text-sm font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#374151] transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Target size={14} />}
            {loading ? L(lang, { ko: '검색중...', zh: '搜索中...', en: 'Searching...' }) : L(lang, { ko: '추적', zh: '追踪', en: 'Track' })}
          </button>
        </div>
      </div>

      {/* 지원되는 항공편 목록 */}
      <div className={card}>
        <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
          <MapPin size={16} />
          {L(lang, { ko: '지원되는 항공편', zh: '支持的航班', en: 'Supported Flights' })}
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(FLIGHT_MAPPINGS).slice(0, 8).map(([flight, data]) => (
            <button
              key={flight}
              onClick={() => {
                setFlightNumber(flight)
                setTimeout(() => searchFlight(), 100)
              }}
              className="text-left p-2 rounded-lg bg-[#F8F9FA] hover:bg-[#E5E7EB] transition-all duration-200"
            >
              <div className="font-semibold text-[#111827]">{flight}</div>
              <div className="text-[#6B7280]">{data.route.from} → {data.route.to}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-bold text-red-700">
                {L(lang, { ko: '검색 실패', zh: '搜索失败', en: 'Search Failed' })}
              </p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 항공편 정보 & 지도 */}
      {flightData && (
        <>
          {/* 감성 메시지 */}
          <div className={`${card} bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200`}>
            <div className="text-center">
              <p className="text-lg font-bold text-[#111827] mb-2">
                {getEmotionalMessage(progress, inKoreaAirspace)}
              </p>
              <p className="text-sm text-[#6B7280]">
                {createProgressBar(progress)} {progress}%
              </p>
            </div>
          </div>

          {/* 간단한 SVG 지도 */}
          <div className={card}>
            <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
              <MapPin size={16} />
              {L(lang, { ko: '항공편 위치', zh: '航班位置', en: 'Flight Position' })}
            </h3>
            <div className="bg-[#F8F9FA] rounded-xl p-4 overflow-hidden">
              <svg viewBox="0 0 400 300" className="w-full h-48 border border-[#E5E7EB] rounded-lg bg-gradient-to-b from-sky-100 to-blue-200">
                {/* 배경 */}
                <defs>
                  <linearGradient id="ocean" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#87CEEB" />
                    <stop offset="100%" stopColor="#4682B4" />
                  </linearGradient>
                </defs>
                <rect width="400" height="300" fill="url(#ocean)" />
                
                {/* 아시아 대륙 윤곽 (간단화) */}
                <path d="M50,80 Q80,60 120,70 Q160,65 200,80 Q240,75 280,90 Q320,85 360,100 L380,120 Q370,140 350,160 Q330,180 300,190 Q270,200 240,190 Q210,185 180,180 Q150,175 120,170 Q90,165 70,150 Q50,135 50,120 Z" fill="#90EE90" stroke="#228B22" strokeWidth="1" opacity="0.7" />
                
                {/* 한국 영역 표시 */}
                <rect 
                  x={latLonToSVG(37, 124).x} 
                  y={latLonToSVG(39, 124).y} 
                  width={latLonToSVG(37, 132).x - latLonToSVG(37, 124).x} 
                  height={latLonToSVG(33, 124).y - latLonToSVG(39, 124).y} 
                  fill="rgba(255,0,0,0.1)" 
                  stroke="#ff0000" 
                  strokeWidth="1" 
                  strokeDasharray="3,3"
                />
                
                {/* 공항들 */}
                {fromAirport && (
                  <circle 
                    cx={latLonToSVG(fromAirport.lat, fromAirport.lon).x} 
                    cy={latLonToSVG(fromAirport.lat, fromAirport.lon).y} 
                    r="4" 
                    fill="#666666" 
                  />
                )}
                <circle 
                  cx={latLonToSVG(toAirport.lat, toAirport.lon).x} 
                  cy={latLonToSVG(toAirport.lat, toAirport.lon).y} 
                  r="4" 
                  fill="#ff0000" 
                />
                
                {/* 경로 라인 */}
                {fromAirport && (
                  <line 
                    x1={latLonToSVG(fromAirport.lat, fromAirport.lon).x} 
                    y1={latLonToSVG(fromAirport.lat, fromAirport.lon).y} 
                    x2={latLonToSVG(toAirport.lat, toAirport.lon).x} 
                    y2={latLonToSVG(toAirport.lat, toAirport.lon).y} 
                    stroke="#cccccc" 
                    strokeWidth="2" 
                    strokeDasharray="5,5" 
                  />
                )}
                
                {/* 현재 항공기 위치 */}
                <circle 
                  cx={latLonToSVG(flightData.latitude, flightData.longitude).x} 
                  cy={latLonToSVG(flightData.latitude, flightData.longitude).y} 
                  r="6" 
                  fill="#0066ff" 
                  className="animate-pulse" 
                />
                <text 
                  x={latLonToSVG(flightData.latitude, flightData.longitude).x + 10} 
                  y={latLonToSVG(flightData.latitude, flightData.longitude).y - 10} 
                  fontSize="10" 
                  fill="#111827" 
                  fontWeight="bold"
                >
                  ✈️ {flightNumber.toUpperCase()}
                </text>
                
                {/* 범례 */}
                <g transform="translate(10,250)">
                  <circle cx="5" cy="5" r="3" fill="#666666" />
                  <text x="15" y="8" fontSize="8" fill="#666666">{L(lang, { ko: '출발지', zh: '出发地', en: 'Origin' })}</text>
                  
                  <circle cx="5" cy="20" r="3" fill="#ff0000" />
                  <text x="15" y="23" fontSize="8" fill="#666666">{L(lang, { ko: '인천공항', zh: '仁川机场', en: 'Incheon' })}</text>
                  
                  <circle cx="5" cy="35" r="4" fill="#0066ff" />
                  <text x="15" y="38" fontSize="8" fill="#666666">{L(lang, { ko: '현재 위치', zh: '当前位置', en: 'Current' })}</text>
                </g>
              </svg>
            </div>
          </div>

          {/* 상세 정보 카드 */}
          <div className={card}>
            <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
              <Plane size={16} />
              {L(lang, { ko: '비행 정보', zh: '飞行信息', en: 'Flight Info' })}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">{L(lang, { ko: '출발지', zh: '出发地', en: 'From' })}</p>
                  <p className="text-sm font-semibold text-[#111827]">
                    {currentRoute ? `${currentRoute.from} (${currentRoute.fromCode})` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">{L(lang, { ko: '도착지', zh: '目的地', en: 'To' })}</p>
                  <p className="text-sm font-semibold text-[#111827]">인천국제공항 (ICN)</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Gauge size={16} className="text-[#6B7280]" />
                  <div>
                    <p className="text-xs text-[#6B7280]">{L(lang, { ko: '고도', zh: '高度', en: 'Altitude' })}</p>
                    <p className="text-sm font-semibold text-[#111827]">
                      {flightData.altitude ? `${flightData.altitude.toLocaleString()}m` : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge size={16} className="text-[#6B7280]" />
                  <div>
                    <p className="text-xs text-[#6B7280]">{L(lang, { ko: '속도', zh: '速度', en: 'Speed' })}</p>
                    <p className="text-sm font-semibold text-[#111827]">
                      {flightData.velocity ? `${flightData.velocity} km/h` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#6B7280]" />
                    <span className="text-xs text-[#6B7280]">{L(lang, { ko: '한국까지 남은 거리', zh: '距韩国剩余距离', en: 'Distance to Korea' })}</span>
                  </div>
                  <span className="text-sm font-bold text-[#111827]">{remainingDistance} km</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#6B7280]" />
                  <span className="text-xs text-[#6B7280]">{L(lang, { ko: '마지막 업데이트', zh: '最后更新', en: 'Last updated' })}</span>
                </div>
                <span className="text-xs text-[#6B7280]">
                  {lastUpdate?.toLocaleTimeString(lang === 'ko' ? 'ko-KR' : lang === 'zh' ? 'zh-CN' : 'en-US')}
                </span>
              </div>
            </div>
          </div>

          {/* 새로고침 버튼 */}
          <div className="text-center">
            <button
              onClick={() => {
                const mapping = FLIGHT_MAPPINGS[flightNumber.toUpperCase().trim()]
                if (mapping) fetchFlightData(mapping.icao24)
              }}
              disabled={loading}
              className="px-6 py-2.5 bg-[#111827] text-white rounded-xl text-sm font-semibold hover:bg-[#374151] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {L(lang, { ko: '정보 새로고침', zh: '刷新信息', en: 'Refresh Data' })}
            </button>
          </div>
        </>
      )}

      {/* API 정보 */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#111827] mb-1">
              {L(lang, { ko: '실시간 데이터 정보', zh: '实时数据信息', en: 'Real-time Data Info' })}
            </p>
            <p className="text-xs text-[#374151]">
              {L(lang, { 
                ko: '• OpenSky Network API를 사용한 실시간 항공편 추적\n• 데이터는 약 10-15초마다 업데이트됩니다\n• 일부 항공편은 추적이 불가능할 수 있습니다', 
                zh: '• 使用OpenSky Network API进行实时航班追踪\n• 数据大约每10-15秒更新一次\n• 部分航班可能无法追踪', 
                en: '• Real-time flight tracking using OpenSky Network API\n• Data updates approximately every 10-15 seconds\n• Some flights may not be trackable'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <p className="text-xs text-gray-400 text-center mt-8">
        {L(lang, { ko: '실시간 항공편 추적 by HanPocket | 데이터 제공: OpenSky Network', zh: '实时航班追踪 by HanPocket | 数据提供: OpenSky Network', en: 'Real-time Flight Tracking by HanPocket | Data: OpenSky Network' })}
      </p>
    </GuideLayout>
  )
}