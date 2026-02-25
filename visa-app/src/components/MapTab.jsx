import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, Filter, Navigation, Info, Palette, Sun, Moon, Minimize2 } from 'lucide-react'

export default function MapTab({ lang }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('hanpocket')
  const [showStylePanel, setShowStylePanel] = useState(false)
  const mapRef = useRef(null)

  const L = (data) => {
    if (typeof data === 'string') return data
    return data?.[lang] || data?.ko || ''
  }

  // 샘플 마커 데이터
  const sampleMarkers = [
    {
      id: 'restaurant_1',
      category: 'restaurant',
      name: { ko: '명동교자', zh: '明洞饺子', en: 'Myeongdong Gyoza' },
      description: { ko: '중국인이 좋아하는 만두집', zh: '中国人喜爱的饺子店', en: 'Chinese-style dumpling restaurant' },
      lat: 37.5665,
      lng: 126.9780,
      chineseSupport: true,
      priceRange: '₩10,000-15,000'
    },
    {
      id: 'restaurant_2', 
      category: 'restaurant',
      name: { ko: '하동관', zh: '河东馆', en: 'Hadongkwan' },
      description: { ko: '전통 한국 냉면', zh: '传统韩式冷面', en: 'Traditional Korean cold noodles' },
      lat: 37.5665,
      lng: 126.9750,
      chineseSupport: false,
      priceRange: '₩12,000-18,000'
    },
    {
      id: 'medical_1',
      category: 'medical', 
      name: { ko: '서울아산병원', zh: '首尔峨山医院', en: 'Asan Medical Center' },
      description: { ko: '중국어 통역 서비스', zh: '提供中文翻译服务', en: 'Chinese interpretation service' },
      lat: 37.5262,
      lng: 127.1076,
      chineseSupport: true,
      specialty: { ko: '종합병원', zh: '综合医院', en: 'General Hospital' }
    },
    {
      id: 'transport_1',
      category: 'transport',
      name: { ko: '명동역', zh: '明洞站', en: 'Myeongdong Station' },
      description: { ko: '지하철 4호선', zh: '地铁4号线', en: 'Subway Line 4' },
      lat: 37.5636,
      lng: 126.9794,
      lines: ['4호선']
    },
    {
      id: 'shopping_1', 
      category: 'shopping',
      name: { ko: '롯데면세점 명동점', zh: '乐天免税店明洞店', en: 'Lotte Duty Free Myeongdong' },
      description: { ko: '중국 관광객 할인', zh: '中国游客折扣', en: 'Discount for Chinese tourists' },
      lat: 37.5659,
      lng: 126.9781,
      chineseSupport: true,
      discount: '5-15%'
    },
    {
      id: 'tourism_1',
      category: 'tourism', 
      name: { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung Palace' },
      description: { ko: '조선시대 정궁', zh: '朝鲜王朝正宫', en: 'Main royal palace of Joseon Dynasty' },
      lat: 37.5796,
      lng: 126.9770,
      chineseSupport: true,
      ticketPrice: { ko: '성인 3,000원', zh: '成人3,000韩元', en: 'Adult ₩3,000' }
    }
  ]

  // 카카오맵 API 동적 로드
  const loadKakaoMapAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) {
        resolve(window.kakao)
        return
      }

      const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY
      if (!apiKey) {
        console.warn('카카오맵 API 키가 설정되지 않았습니다. 데모 모드로 실행합니다.')
        reject(new Error('API 키가 필요합니다'))
        return
      }

      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
      script.onload = () => {
        window.kakao.maps.load(() => {
          resolve(window.kakao)
        })
      }
      script.onerror = () => reject(new Error('카카오맵 API 로드 실패'))
      document.head.appendChild(script)
    })
  }

  // 지도 초기화
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadKakaoMapAPI()
        if (!mapRef.current) return

        // 서울 중심으로 지도 초기화
        const container = mapRef.current
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 명동
          level: 3 // 확대 레벨 (1~14)
        }

        const kakaoMap = new window.kakao.maps.Map(container, options)
        setMap(kakaoMap)
        setMapReady(true)

        // 지도 타입 컨트롤 추가
        const mapTypeControl = new window.kakao.maps.MapTypeControl()
        kakaoMap.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT)

        // 줌 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl()
        kakaoMap.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

        // 사용자 위치 가져오기
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
              setUserLocation(userPos)

              // 한국 내 위치인 경우 지도 중심 이동
              if (userPos.lat > 33 && userPos.lat < 39 && userPos.lng > 125 && userPos.lng < 132) {
                const moveLatLng = new window.kakao.maps.LatLng(userPos.lat, userPos.lng)
                kakaoMap.setCenter(moveLatLng)
                
                // 사용자 위치 마커
                const userMarker = new window.kakao.maps.Marker({
                  position: moveLatLng,
                  image: new window.kakao.maps.MarkerImage(
                    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                        <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
                      </svg>
                    `),
                    new window.kakao.maps.Size(20, 20)
                  )
                })
                userMarker.setMap(kakaoMap)
              }
            },
            (error) => console.log('위치 정보를 가져올 수 없습니다:', error),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          )
        }

      } catch (error) {
        console.error('지도 초기화 실패:', error)
        setMapReady(false)
      }
    }

    initMap()
  }, [])

  // 마커 렌더링
  useEffect(() => {
    if (!map || !mapReady || !window.kakao) return

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null))

    // 카테고리 필터링
    const filteredMarkers = selectedCategory === 'all' 
      ? sampleMarkers 
      : sampleMarkers.filter(marker => marker.category === selectedCategory)

    // 새 마커 생성
    const newMarkers = filteredMarkers.map(markerData => {
      const position = new window.kakao.maps.LatLng(markerData.lat, markerData.lng)
      
      // 커스텀 마커 이미지
      const markerImage = new window.kakao.maps.MarkerImage(
        getCategoryMarkerImage(markerData.category),
        new window.kakao.maps.Size(30, 30)
      )

      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage
      })

      marker.setMap(map)

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedMarker(markerData)
      })

      return marker
    })

    setMarkers(newMarkers)
  }, [map, selectedCategory, mapReady])

  // 카테고리별 마커 이미지 생성
  const getCategoryMarkerImage = (category) => {
    const iconMap = {
      restaurant: { emoji: '🍜', color: '#FF6B6B' },
      medical: { emoji: '🏥', color: '#4ECDC4' }, 
      transport: { emoji: '🚇', color: '#45B7D1' },
      shopping: { emoji: '🛍️', color: '#96CEB4' },
      tourism: { emoji: '🏛️', color: '#FECA57' }
    }
    
    const { emoji, color } = iconMap[category] || { emoji: '📍', color: '#111827' }
    
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
        <circle cx="15" cy="15" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="15" y="20" text-anchor="middle" font-size="14">${emoji}</text>
      </svg>
    `)
  }

  // 지도 테마 (카카오맵은 기본 스타일만 제공)
  const mapThemes = [
    {
      id: 'normal',
      name: { ko: '기본', zh: '默认', en: 'Normal' },
      icon: <MapPin size={16} />,
      color: '#4285F4',
      description: { ko: '카카오맵 기본 스타일', zh: '카카오맵默认样式', en: 'KakaoMap Default Style' },
      mapType: window.kakao?.maps?.MapTypeId?.ROADMAP
    },
    {
      id: 'satellite', 
      name: { ko: '위성', zh: '卫星', en: 'Satellite' },
      icon: <Sun size={16} />,
      color: '#FF9800',
      description: { ko: '위성 이미지', zh: '卫星图像', en: 'Satellite Image' },
      mapType: window.kakao?.maps?.MapTypeId?.SKYVIEW
    },
    {
      id: 'hybrid',
      name: { ko: '위성+라벨', zh: '卫星+标签', en: 'Hybrid' },
      icon: <Palette size={16} />,
      color: '#9C27B0', 
      description: { ko: '위성 + 도로명', zh: '卫星 + 道路名', en: 'Satellite + Roads' },
      mapType: window.kakao?.maps?.MapTypeId?.HYBRID
    }
  ]

  // 테마 변경 함수
  const changeMapTheme = (themeId) => {
    if (!map || !window.kakao) return
    
    const theme = mapThemes.find(t => t.id === themeId)
    if (!theme || !theme.mapType) return
    
    setCurrentTheme(themeId)
    map.setMapTypeId(theme.mapType)
    setShowStylePanel(false)
  }

  // 지도 카테고리
  const mapCategories = [
    { 
      id: 'all', 
      name: { ko: '전체', zh: '全部', en: 'All' },
      icon: '📍',
      color: '#111827'
    },
    { 
      id: 'restaurant', 
      name: { ko: '맛집', zh: '美食', en: 'Food' },
      icon: '🍜',
      color: '#FF6B6B'
    },
    { 
      id: 'medical', 
      name: { ko: '의료', zh: '医疗', en: 'Medical' },
      icon: '🏥',
      color: '#4ECDC4'
    },
    { 
      id: 'transport', 
      name: { ko: '교통', zh: '交通', en: 'Transport' },
      icon: '🚇',
      color: '#45B7D1'
    },
    { 
      id: 'shopping', 
      name: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
      icon: '🛍️',
      color: '#96CEB4'
    },
    { 
      id: 'tourism', 
      name: { ko: '관광', zh: '旅游', en: 'Tourism' },
      icon: '🏛️',
      color: '#FECA57'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              {L({ ko: '한국 지도', zh: '韩国地图', en: 'Korea Map' })}
            </h1>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Search size={20} />
              </button>
              <button 
                onClick={() => setShowStylePanel(!showStylePanel)}
                className={`p-2 transition-colors ${showStylePanel ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Palette size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 스타일 선택 패널 */}
      {showStylePanel && (
        <div className="bg-white border-b border-gray-100 sticky top-[70px] z-30">
          <div className="px-4 py-3">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                {L({ ko: '지도 타입', zh: '地图类型', en: 'Map Type' })}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {mapThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => changeMapTheme(theme.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                    currentTheme === theme.id
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className={currentTheme === theme.id ? 'text-white' : 'text-gray-500'}>
                      {theme.icon}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{L(theme.name)}</div>
                    <div className="text-xs opacity-70">{L(theme.description)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className={`bg-white border-b border-gray-100 sticky z-30 ${showStylePanel ? 'top-[190px]' : 'top-[70px]'}`}>
        <div className="px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {mapCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm">{category.icon}</span>
                  <span className="text-sm font-medium">{L(category.name)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="relative flex-1 bg-gray-50">
        {/* 카카오 지도 컨테이너 */}
        <div 
          ref={mapRef}
          className={`w-full ${showStylePanel ? 'h-[calc(100vh-260px)]' : 'h-[calc(100vh-140px)]'}`}
          style={{ minHeight: '400px' }}
        />

        {/* 사용자 위치 버튼 */}
        {userLocation && mapReady && (
          <button
            onClick={() => {
              if (map && userLocation && window.kakao) {
                const moveLatLng = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng)
                map.setCenter(moveLatLng)
                map.setLevel(3) // 줌 레벨 3 (가까이)
              }
            }}
            className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Navigation size={20} className="text-gray-700" />
          </button>
        )}

        {/* 마커 상세 정보 패널 */}
        {selectedMarker && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 max-h-48 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">
                    {mapCategories.find(cat => cat.id === selectedMarker.category)?.icon}
                  </span>
                  <h3 className="font-bold text-gray-900">{L(selectedMarker.name)}</h3>
                  {selectedMarker.chineseSupport && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {L({ ko: '중국어 지원', zh: '中文支持', en: 'Chinese Support' })}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{L(selectedMarker.description)}</p>
                
                {/* 카테고리별 추가 정보 */}
                <div className="space-y-1 text-sm">
                  {selectedMarker.priceRange && (
                    <div className="text-gray-500">💰 {selectedMarker.priceRange}</div>
                  )}
                  {selectedMarker.specialty && (
                    <div className="text-gray-500">🏥 {L(selectedMarker.specialty)}</div>
                  )}
                  {selectedMarker.lines && (
                    <div className="text-gray-500">🚇 {selectedMarker.lines.join(', ')}</div>
                  )}
                  {selectedMarker.discount && (
                    <div className="text-green-600">
                      🎁 {L({ ko: '할인', zh: '折扣', en: 'Discount' })}: {selectedMarker.discount}
                    </div>
                  )}
                  {selectedMarker.ticketPrice && (
                    <div className="text-gray-500">🎫 {L(selectedMarker.ticketPrice)}</div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedMarker(null)}
                className="ml-2 p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* API 키 없을 때 메시지 */}
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-yellow-200 rounded-full flex items-center justify-center">
                <Info size={24} className="text-yellow-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">
                  {L({ ko: '카카오맵 API 키 필요', zh: '需要카카오맵API密钥', en: 'KakaoMap API Key Required' })}
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  {L({ 
                    ko: 'Kakao Developers에서 Maps API 키를 발급받으세요. 일 30만회 무료!',
                    zh: '请从Kakao Developers获取Maps API密钥。每日30万次免费！',
                    en: 'Get Maps API key from Kakao Developers. 300K requests/day free!'
                  })}
                </p>
                <div className="text-xs text-blue-600">
                  https://developers.kakao.com
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}