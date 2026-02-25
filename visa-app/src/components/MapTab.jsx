import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, Filter, Navigation, Info } from 'lucide-react'

export default function MapTab({ lang }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapReady, setMapReady] = useState(false)
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

  // 네이버지도 API 동적 로드
  const loadNaverMapAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.naver) {
        resolve(window.naver)
        return
      }

      const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
      if (!clientId) {
        console.warn('네이버 지도 API 클라이언트 ID가 설정되지 않았습니다.')
        reject(new Error('API 키가 필요합니다'))
        return
      }

      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`
      script.onload = () => resolve(window.naver)
      script.onerror = () => reject(new Error('네이버 지도 API 로드 실패'))
      document.head.appendChild(script)
    })
  }

  // 지도 초기화
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadNaverMapAPI()
        if (!mapRef.current) return

        // 서울 중심으로 지도 초기화
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5665, 126.9780),
          zoom: 13,
          minZoom: 10,
          maxZoom: 18,
          mapTypeControl: true,
          zoomControl: true
        }

        const naverMap = new window.naver.maps.Map(mapRef.current, mapOptions)
        setMap(naverMap)
        setMapReady(true)

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
                naverMap.setCenter(new window.naver.maps.LatLng(userPos.lat, userPos.lng))
                
                // 사용자 위치 마커
                new window.naver.maps.Marker({
                  position: new window.naver.maps.LatLng(userPos.lat, userPos.lng),
                  map: naverMap,
                  icon: {
                    content: '<div style="background: #4285F4; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                    anchor: new window.naver.maps.Point(10, 10)
                  }
                })
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
    if (!map || !mapReady) return

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null))

    // 카테고리 필터링
    const filteredMarkers = selectedCategory === 'all' 
      ? sampleMarkers 
      : sampleMarkers.filter(marker => marker.category === selectedCategory)

    // 새 마커 생성
    const newMarkers = filteredMarkers.map(markerData => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(markerData.lat, markerData.lng),
        map: map,
        icon: {
          content: getCategoryIcon(markerData.category),
          anchor: new window.naver.maps.Point(15, 30)
        }
      })

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        setSelectedMarker(markerData)
      })

      return marker
    })

    setMarkers(newMarkers)
  }, [map, selectedCategory, mapReady])

  // 카테고리별 아이콘 생성
  const getCategoryIcon = (category) => {
    const iconMap = {
      restaurant: { emoji: '🍜', color: '#FF6B6B' },
      medical: { emoji: '🏥', color: '#4ECDC4' }, 
      transport: { emoji: '🚇', color: '#45B7D1' },
      shopping: { emoji: '🛍️', color: '#96CEB4' },
      tourism: { emoji: '🏛️', color: '#FECA57' }
    }
    
    const { emoji, color } = iconMap[category] || { emoji: '📍', color: '#111827' }
    
    return `
      <div style="
        background: ${color}; 
        color: white; 
        border: 2px solid white; 
        border-radius: 20px; 
        width: 30px; 
        height: 30px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      ">${emoji}</div>
    `
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
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Filter size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="bg-white border-b border-gray-100 sticky top-[70px] z-30">
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
        {/* 네이버 지도 컨테이너 */}
        <div 
          ref={mapRef}
          className="h-[calc(100vh-140px)] w-full"
          style={{ minHeight: '400px' }}
        />

        {/* 사용자 위치 버튼 */}
        {userLocation && mapReady && (
          <button
            onClick={() => {
              if (map && userLocation) {
                map.setCenter(new window.naver.maps.LatLng(userLocation.lat, userLocation.lng))
                map.setZoom(15)
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
                  {L({ ko: '네이버 지도 API 키 필요', zh: '需要Naver地图API密钥', en: 'Naver Map API Key Required' })}
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  {L({ 
                    ko: '네이버 클라우드 플랫폼에서 Maps API 키를 발급받으세요.',
                    zh: '请从Naver云平台获取Maps API密钥。',
                    en: 'Please get Maps API key from Naver Cloud Platform.'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}