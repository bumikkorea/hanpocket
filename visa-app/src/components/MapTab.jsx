import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Search, Filter, Navigation, Info, ArrowUpDown, Route, X, ExternalLink, Globe } from 'lucide-react'
import { translateBrandName, smartTranslate } from '../data/brandMapping.js'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'

// 네이티브 or 브라우저 위치 가져오기 통합 함수
const getPosition = async (options = {}) => {
  // Capacitor 네이티브 환경이면 네이티브 GPS 사용
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.checkPermissions()
    if (perm.location === 'denied') {
      const requested = await Geolocation.requestPermissions()
      if (requested.location === 'denied') {
        throw { code: 1, message: 'Permission denied' }
      }
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: options.timeout || 15000,
      ...options
    })
    return pos
  }
  // 웹 브라우저 fallback
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: options.timeout || 15000,
      maximumAge: 0,
      ...options
    })
  })
}

// 네이티브 watchPosition 래퍼
const watchPositionCompat = (successCb, errorCb, options = {}) => {
  if (Capacitor.isNativePlatform()) {
    let callbackId = null
    Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 15000, ...options },
      (position, err) => {
        if (err) {
          errorCb(err)
        } else if (position) {
          successCb(position)
        }
      }
    ).then(id => { callbackId = id })
    // clearWatch 함수 반환
    return () => {
      if (callbackId !== null) {
        Geolocation.clearWatch({ id: callbackId })
      }
    }
  }
  // 웹 브라우저 fallback
  const id = navigator.geolocation.watchPosition(successCb, errorCb, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
    ...options
  })
  return () => navigator.geolocation.clearWatch(id)
}

export default function MapTab({ lang }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [locatingUser, setLocatingUser] = useState(false)
  const [locationAccuracy, setLocationAccuracy] = useState(null)
  const userMarkerRef = useRef(null)
  const watchIdRef = useRef(null)
  const [currentTheme, setCurrentTheme] = useState('hanpocket')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [geocoder, setGeocoder] = useState(null)
  const [clusterer, setClusterer] = useState(null)
  const [showRoutePanel, setShowRoutePanel] = useState(false)
  const [startLocation, setStartLocation] = useState('')
  const [endLocation, setEndLocation] = useState('')
  const [startCoords, setStartCoords] = useState(null)
  const [endCoords, setEndCoords] = useState(null)
  const [startResults, setStartResults] = useState([])
  const [endResults, setEndResults] = useState([])
  const [showStartResults, setShowStartResults] = useState(false)
  const [showEndResults, setShowEndResults] = useState(false)
  const [showKakaoWebView, setShowKakaoWebView] = useState(false)
  const [kakaoWebViewQuery, setKakaoWebViewQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)  // 검색 중 상태
  const mapRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const startSearchTimeoutRef = useRef(null)
  const endSearchTimeoutRef = useRef(null)

  // 🗺️ 여행계획 관련 상태
  const [showTripPlanner, setShowTripPlanner] = useState(false)
  const [tripPlans, setTripPlans] = useState([])
  const [currentTripPlan, setCurrentTripPlan] = useState(null)
  const [editingTripIndex, setEditingTripIndex] = useState(-1)
  const [newDestinationQuery, setNewDestinationQuery] = useState('')
  const [destinationSearchResults, setDestinationSearchResults] = useState([])
  const [showDestinationResults, setShowDestinationResults] = useState(false)

  // 🚌 시티투어버스 관련 상태
  const [selectedBusRoute, setSelectedBusRoute] = useState('all') // 'all' | 'downtown' | 'night' | 'traditional' | 'panorama'
  const [busPolylines, setBusPolylines] = useState([])

  const L = (data) => {
    if (typeof data === 'string') return data
    return data?.[lang] || data?.ko || ''
  }

  // 🗺️ 여행계획 관련 함수들
  const loadTripPlans = useCallback(() => {
    try {
      const stored = localStorage.getItem('hanpocket_trip_plans')
      if (stored) {
        const plans = JSON.parse(stored)
        setTripPlans(Array.isArray(plans) ? plans : [])
      }
    } catch (error) {
      console.error('여행계획 로드 실패:', error)
      setTripPlans([])
    }
  }, [])

  const saveTripPlans = useCallback((plans) => {
    try {
      localStorage.setItem('hanpocket_trip_plans', JSON.stringify(plans))
      setTripPlans(plans)
    } catch (error) {
      console.error('여행계획 저장 실패:', error)
    }
  }, [])

  const createNewTripPlan = () => {
    const newPlan = {
      id: Date.now(),
      name: L({ ko: '새 여행계획', zh: '新旅行计划', en: 'New Trip Plan' }),
      destinations: [],
      createdAt: new Date().toISOString()
    }
    setCurrentTripPlan(newPlan)
    setEditingTripIndex(-1) // -1은 새 계획
  }

  const saveTripPlan = () => {
    if (!currentTripPlan) return
    
    let updatedPlans = [...tripPlans]
    
    if (editingTripIndex === -1) {
      // 새 계획 추가 (최대 10개)
      if (updatedPlans.length >= 10) {
        alert(L({ ko: '최대 10개의 여행계획만 저장할 수 있습니다', zh: '最多只能保存10个旅行计划', en: 'Maximum 10 trip plans allowed' }))
        return
      }
      updatedPlans.unshift(currentTripPlan)
    } else {
      // 기존 계획 수정
      updatedPlans[editingTripIndex] = currentTripPlan
    }
    
    saveTripPlans(updatedPlans)
    setCurrentTripPlan(null)
    setEditingTripIndex(-1)
  }

  const deleteTripPlan = (index) => {
    const updatedPlans = tripPlans.filter((_, i) => i !== index)
    saveTripPlans(updatedPlans)
  }

  const addDestination = (place) => {
    if (!currentTripPlan) return
    
    if (currentTripPlan.destinations.length >= 10) {
      alert(L({ ko: '한 계획당 최대 10개의 목적지만 추가할 수 있습니다', zh: '每个计划最多只能添加10个目的地', en: 'Maximum 10 destinations per plan' }))
      return
    }
    
    const destination = {
      id: Date.now(),
      name: place.name || place.place_name,
      address: place.address || place.address_name,
      lat: parseFloat(place.y || place.lat),
      lng: parseFloat(place.x || place.lng),
      phone: place.phone,
      category: place.category
    }
    
    setCurrentTripPlan(prev => ({
      ...prev,
      destinations: [...prev.destinations, destination]
    }))
    
    setNewDestinationQuery('')
    setShowDestinationResults(false)
  }

  const removeDestination = (destinationId) => {
    if (!currentTripPlan) return
    
    setCurrentTripPlan(prev => ({
      ...prev,
      destinations: prev.destinations.filter(d => d.id !== destinationId)
    }))
  }

  const searchDestinations = (query) => {
    if (!query || query.length < 2 || !geocoder) return
    
    geocoder.addressSearch(query, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const places = result.slice(0, 5).map(place => ({
          id: place.address_name,
          name: place.address_name,
          address: place.address_name,
          x: place.x,
          y: place.y,
          type: 'address'
        }))
        setDestinationSearchResults(places)
        setShowDestinationResults(true)
      }
    })

    const ps = new window.kakao.maps.services.Places()
    ps.keywordSearch(query, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const places = result.slice(0, 5).map(place => ({
          id: place.id,
          name: place.place_name,
          address: place.address_name,
          x: place.x,
          y: place.y,
          phone: place.phone,
          category: place.category_name,
          type: 'place'
        }))
        setDestinationSearchResults(prev => [...prev, ...places])
        setShowDestinationResults(true)
      }
    })
  }

  const startNavigation = (plan) => {
    if (!plan.destinations || plan.destinations.length === 0) {
      alert(L({ ko: '목적지가 없습니다', zh: '没有目的地', en: 'No destinations' }))
      return
    }

    // 카카오맵 길찾기 URL 생성 (경유지 포함)
    const destinations = plan.destinations.slice(0, 10) // 최대 10개
    const firstDest = destinations[0]
    
    if (destinations.length === 1) {
      // 목적지가 1개인 경우
      const url = `https://map.kakao.com/link/to/${encodeURIComponent(firstDest.name)},${firstDest.lat},${firstDest.lng}`
      window.open(url, '_blank')
    } else {
      // 다중 경유지가 있는 경우 - 카카오맵 길찾기로 연결
      const params = new URLSearchParams()
      params.set('destination', `${firstDest.name},${firstDest.lat},${firstDest.lng}`)
      
      // 경유지 추가 (2번째부터)
      if (destinations.length > 1) {
        const waypoints = destinations.slice(1, 6).map(dest => `${dest.name},${dest.lat},${dest.lng}`).join('|')
        params.set('waypoints', waypoints)
      }
      
      const url = `https://map.kakao.com/link/route?${params.toString()}`
      window.open(url, '_blank')
    }
  }

  // 여행계획 로드 (컴포넌트 마운트 시)
  useEffect(() => {
    loadTripPlans()
  }, [loadTripPlans])

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

  // 카카오맵 API 동적 로드 (라이브러리 포함)
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

      // 카카오맵 로드 전 언어 설정
      const currentLang = getCurrentLanguage()
      const originalLang = document.documentElement.lang
      document.documentElement.lang = currentLang

      const script = document.createElement('script')
      script.type = 'text/javascript'
      // 외국인 대상 서비스 — 항상 영어로 로드
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer&autoload=false&hl=en`
      script.onload = () => {
        window.kakao.maps.load(() => {
          // 원래 언어로 복원
          document.documentElement.lang = originalLang
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

        // 줌 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl()
        kakaoMap.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

        // Services 라이브러리 - 주소 검색용
        const geoCoderInstance = new window.kakao.maps.services.Geocoder()
        setGeocoder(geoCoderInstance)

        // Clusterer 라이브러리 - 마커 클러스터링
        const clustererInstance = new window.kakao.maps.MarkerClusterer({
          map: kakaoMap,
          averageCenter: true,  // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
          minLevel: 10         // 클러스터 할 최소 지도 레벨
        })
        setClusterer(clustererInstance)

        // 사용자 위치 가져오기 (네이티브 GPS 우선)
        getPosition({ timeout: 10000 }).then((position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(userPos)

          // 한국 내 위치인 경우 지도 중심 이동
          if (userPos.lat > 33 && userPos.lat < 39 && userPos.lng > 125 && userPos.lng < 132) {
            const moveLatLng = new window.kakao.maps.LatLng(userPos.lat, userPos.lng)
            kakaoMap.setCenter(moveLatLng)

            // 기존 마커 제거
            if (userMarkerRef.current) {
              userMarkerRef.current.setMap(null)
            }
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
            userMarkerRef.current = userMarker
          }
        }).catch((error) => console.log('위치 정보를 가져올 수 없습니다:', error))

      } catch (error) {
        console.error('지도 초기화 실패:', error)
        setMapReady(false)
      }
    }

    initMap()
  }, [])

  // 컴포넌트 언마운트 시 타이머 클리어
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      if (startSearchTimeoutRef.current) {
        clearTimeout(startSearchTimeoutRef.current)
      }
      if (endSearchTimeoutRef.current) {
        clearTimeout(endSearchTimeoutRef.current)
      }
      // watchPosition 정리
      if (watchIdRef.current) {
        watchIdRef.current()
        watchIdRef.current = null
      }
    }
  }, [])

  // 지도 크기 재조정 (화면 크기 변경 시)
  useEffect(() => {
    const handleResize = () => {
      if (map && window.kakao) {
        // 약간의 지연 후 크기 재조정
        setTimeout(() => {
          map.relayout()
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    // 초기 로드 시에도 크기 조정
    if (map) {
      setTimeout(() => map.relayout(), 100)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [map])

  // 스타일 패널 토글 시 지도 크기 재조정
  useEffect(() => {
    if (map && mapReady) {
      setTimeout(() => {
        map.relayout()
      }, 300) // 애니메이션 완료 후 크기 재조정
    }
  }, [map, mapReady])

  // 검색 결과 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSearchResults(false)
      }
      if (!event.target.closest('.route-search-start')) {
        setShowStartResults(false)
      }
      if (!event.target.closest('.route-search-end')) {
        setShowEndResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 마커 렌더링 (클러스터링 포함)
  useEffect(() => {
    if (!map || !mapReady || !window.kakao || !clusterer) return

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null))
    clusterer.clear() // 클러스터러에서 모든 마커 제거

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

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedMarker(markerData)
      })

      return marker
    })

    // 마커들을 클러스터러에 추가
    if (newMarkers.length > 0) {
      clusterer.addMarkers(newMarkers)
    }

    setMarkers(newMarkers)
  }, [map, selectedCategory, mapReady, clusterer])

  // 지도 이동 시 제로페이/화장실 마커 자동 갱신
  useEffect(() => {
    if (!map || !mapReady || !window.kakao) return

    const handleIdle = () => {
      if (selectedCategory === 'zeropay' || selectedCategory === 'toilet') {
        searchByCategory(selectedCategory)
      }
    }

    window.kakao.maps.event.addListener(map, 'idle', handleIdle)
    return () => {
      window.kakao.maps.event.removeListener(map, 'idle', handleIdle)
    }
  }, [map, mapReady, selectedCategory])

  // 카테고리별 마커 이미지 생성
  const getCategoryMarkerImage = (category) => {
    const iconMap = {
      restaurant: { emoji: '🍜', color: '#FF6B6B' },
      medical: { emoji: '🏥', color: '#4ECDC4' },
      transport: { emoji: '🚇', color: '#45B7D1' },
      shopping: { emoji: '🛍️', color: '#96CEB4' },
      tourism: { emoji: '🏛️', color: '#FECA57' },
      zeropay: { emoji: '💳', color: '#7C3AED' },
      city_tour_bus: { emoji: '🚌', color: '#E53935' }
    }
    
    const { emoji, color } = iconMap[category] || { emoji: '📍', color: '#111827' }
    
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
        <circle cx="15" cy="15" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="15" y="20" text-anchor="middle" font-size="14">${emoji}</text>
      </svg>
    `)
  }

  // 장소 검색 함수
  const searchPlace = async (query) => {
    if (!geocoder || !query.trim()) return

    setIsSearching(true)  // 검색 시작
    setSearchResults([]) // 기존 검색 결과 초기화

    // 🧠 스마트 통합 번역 적용 (전체 DB)
    const translatedQuery = await smartTranslate(query.trim())
    console.log(`🔄 스마트 번역: "${query}" → "${translatedQuery}"`)

    // 주소로 검색
    geocoder.addressSearch(translatedQuery, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const results = result.map(place => ({
          id: `address_${place.x}_${place.y}`,
          name: place.address_name,
          x: place.x,
          y: place.y,
          type: 'address'
        }))
        setSearchResults(prev => [...prev, ...results])
        setShowSearchResults(true)
      }
      setIsSearching(false)  // 검색 완료
    })

    // 키워드로 장소 검색 (Places 서비스)
    const ps = new window.kakao.maps.services.Places()
    ps.keywordSearch(translatedQuery, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const results = result.slice(0, 5).map(place => ({
          id: place.id,
          name: place.place_name,
          address: place.address_name,
          x: place.x,
          y: place.y,
          phone: place.phone,
          category: place.category_name,
          type: 'place'
        }))
        setSearchResults(prev => [...prev, ...results])
        setShowSearchResults(true)
      }
      setIsSearching(false)  // 검색 완료
    })
  }

  // 검색 결과 선택
  const selectSearchResult = (result) => {
    if (!map) return

    const moveLatLng = new window.kakao.maps.LatLng(result.y, result.x)
    map.setCenter(moveLatLng)
    map.setLevel(3) // 확대

    // 검색 결과 마커 추가
    const marker = new window.kakao.maps.Marker({
      position: moveLatLng,
      map: map
    })

    // 검색 결과를 selectedMarker로 설정 (정보 패널 표시용)
    setSelectedMarker({
      id: result.id,
      category: 'search',
      name: { ko: result.name, zh: result.name, en: result.name },
      description: { ko: result.address || '검색 결과', zh: result.address || '搜索结果', en: result.address || 'Search Result' },
      lat: parseFloat(result.y),
      lng: parseFloat(result.x),
      phone: result.phone,
      categoryName: result.category
    })

    setShowSearchResults(false)
    setSearchQuery('')
  }

  // 카카오맵 크게보기 URL 생성
  const getKakaoMapUrl = (marker) => {
    const name = encodeURIComponent(L(marker.name))
    return `https://map.kakao.com/link/map/${name},${marker.lat},${marker.lng}`
  }

  // 카카오맵 길찾기 URL 생성
  const getKakaoDirectionUrl = (marker) => {
    const name = encodeURIComponent(L(marker.name))
    return `https://map.kakao.com/link/to/${name},${marker.lat},${marker.lng}`
  }

  // 출발지/도착지 스마트 검색
  const searchLocation = async (query, isStart = true) => {
    if (!geocoder || !query.trim()) return

    const setResults = isStart ? setStartResults : setEndResults
    const setShowResults = isStart ? setShowStartResults : setShowEndResults

    setResults([]) // 기존 검색 결과 초기화

    // 🧠 스마트 통합 번역 적용 (전체 DB)
    const translatedQuery = await smartTranslate(query.trim())
    console.log(`🔄 네비게이션 번역: "${query}" → "${translatedQuery}"`)

    // 주소로 검색
    geocoder.addressSearch(translatedQuery, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const results = result.map(place => ({
          id: `address_${place.x}_${place.y}`,
          name: place.address_name,
          x: place.x,
          y: place.y,
          type: 'address'
        }))
        setResults(prev => [...prev, ...results])
        setShowResults(true)
      }
    })

    // 키워드로 장소 검색
    const ps = new window.kakao.maps.services.Places()
    ps.keywordSearch(translatedQuery, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const results = result.slice(0, 5).map(place => ({
          id: place.id,
          name: place.place_name,
          address: place.address_name,
          x: place.x,
          y: place.y,
          phone: place.phone,
          category: place.category_name,
          type: 'place'
        }))
        setResults(prev => [...prev, ...results])
        setShowResults(true)
      }
    })
  }

  // 출발지/도착지 선택
  const selectLocation = (result, isStart = true) => {
    const setLocation = isStart ? setStartLocation : setEndLocation
    const setCoords = isStart ? setStartCoords : setEndCoords
    const setShowResults = isStart ? setShowStartResults : setShowEndResults

    setLocation(result.name)
    setCoords({ x: result.x, y: result.y })
    setShowResults(false)

    // 지도 이동 + 마커 + 장소정보 표시 (메인 검색과 동일)
    if (map) {
      const moveLatLng = new window.kakao.maps.LatLng(result.y, result.x)
      map.setCenter(moveLatLng)
      map.setLevel(3)

      new window.kakao.maps.Marker({
        position: moveLatLng,
        map: map
      })

      setSelectedMarker({
        id: result.id,
        category: 'search',
        name: { ko: result.name, zh: result.name, en: result.name },
        description: { ko: result.address || (isStart ? '출발지' : '도착지'), zh: result.address || (isStart ? '出发地' : '目的地'), en: result.address || (isStart ? 'Departure' : 'Destination') },
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
        phone: result.phone,
        categoryName: result.category
      })
    }
  }

  // 출발지/도착지 위치 바꾸기
  const switchLocations = () => {
    const temp = startLocation
    const tempCoords = startCoords
    setStartLocation(endLocation)
    setStartCoords(endCoords)
    setEndLocation(temp)
    setEndCoords(tempCoords)
  }

  // 좌표로 카카오맵 길찾기 URL 열기
  const openNavigationUrl = (sName, sCoords, eName, eCoords) => {
    const startName = encodeURIComponent(sName)
    const endName = encodeURIComponent(eName)

    // 모바일에서 카카오맵 앱 딥링크 시도
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      const appUrl = `kakaomap://route?sp=${sCoords.y},${sCoords.x}&ep=${eCoords.y},${eCoords.x}&by=CAR`
      window.location.href = appUrl
      // 앱이 없으면 웹으로 fallback (1.5초 후)
      setTimeout(() => {
        const webUrl = `https://map.kakao.com/link/from/${startName},${sCoords.y},${sCoords.x}/to/${endName},${eCoords.y},${eCoords.x}`
        window.open(webUrl, '_blank')
      }, 1500)
      return
    }

    // PC/웹에서는 카카오맵 웹 링크
    const navigationUrl = `https://map.kakao.com/link/from/${startName},${sCoords.y},${sCoords.x}/to/${endName},${eCoords.y},${eCoords.x}`
    window.open(navigationUrl, '_blank')
  }

  // 장소명으로 좌표 자동 검색 (Promise)
  const resolveCoords = (query) => {
    return new Promise((resolve) => {
      if (!geocoder || !query.trim()) {
        resolve(null)
        return
      }

      const ps = new window.kakao.maps.services.Places()
      // 키워드 검색 우선 (장소명에 더 적합)
      ps.keywordSearch(query.trim(), (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          resolve({ x: result[0].x, y: result[0].y })
          return
        }
        // 키워드 검색 실패 시 주소 검색
        geocoder.addressSearch(query.trim(), (addrResult, addrStatus) => {
          if (addrStatus === window.kakao.maps.services.Status.OK && addrResult.length > 0) {
            resolve({ x: addrResult[0].x, y: addrResult[0].y })
          } else {
            resolve(null)
          }
        })
      })
    })
  }

  // 카카오맵 길찾기 실행
  const startRouteNavigation = async () => {
    if (!startLocation || !endLocation) {
      alert(L({
        ko: '출발지와 도착지를 모두 입력해주세요.',
        zh: '请输入出发地和目的地。',
        en: 'Please enter both start and destination.'
      }))
      return
    }

    let finalStartCoords = startCoords
    let finalEndCoords = endCoords

    // 좌표가 없으면 자동으로 검색해서 찾기
    if (!finalStartCoords) {
      finalStartCoords = await resolveCoords(startLocation)
    }
    if (!finalEndCoords) {
      finalEndCoords = await resolveCoords(endLocation)
    }

    if (!finalStartCoords || !finalEndCoords) {
      alert(L({
        ko: '출발지 또는 도착지를 찾을 수 없습니다. 다른 검색어를 입력해주세요.',
        zh: '无法找到出发地或目的地，请输入其他搜索词。',
        en: 'Could not find start or destination. Please try different search terms.'
      }))
      return
    }

    // 좌표 저장 (다음 번 검색 시 재사용)
    if (!startCoords) setStartCoords(finalStartCoords)
    if (!endCoords) setEndCoords(finalEndCoords)

    openNavigationUrl(startLocation, finalStartCoords, endLocation, finalEndCoords)
  }

  // 현재 앱 언어 감지 함수
  const getCurrentLanguage = () => {
    // HanPocket 앱의 언어 설정 확인 (localStorage)
    const savedLang = localStorage.getItem('hanpocket-language')
    if (savedLang) return savedLang
    
    // URL에서 언어 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang')
    if (urlLang && ['ko', 'zh', 'en'].includes(urlLang)) return urlLang
    
    // 브라우저 언어 감지
    const browserLang = navigator.language || navigator.userLanguage
    if (browserLang.startsWith('zh')) return 'zh'
    if (browserLang.startsWith('en')) return 'en'
    return 'ko'  // 기본값
  }

  // 카카오맵 웹뷰에서 검색 (언어 설정 포함)
  const openKakaoWebView = (query) => {
    setKakaoWebViewQuery(query)
    setShowKakaoWebView(true)
  }

  // 현재 앱 언어에 맞는 카카오맵 웹뷰 URL 생성
  const getKakaoMapWebViewUrl = (query) => {
    const baseUrl = 'https://map.kakao.com'
    const params = new URLSearchParams({
      q: query
    })
    
    // 앱 언어 설정에 따른 파라미터 추가
    const currentLang = getCurrentLanguage()
    if (currentLang === 'en') {
      params.append('hl', 'en')  // 영어 인터페이스
      params.append('region', 'KR')  // 한국 지역 데이터
    } else if (currentLang === 'zh') {
      params.append('hl', 'zh-CN')  // 중국어 인터페이스
      params.append('region', 'KR')  // 한국 지역 데이터
    }
    // 한국어는 기본값이므로 파라미터 추가하지 않음
    
    return `${baseUrl}?${params.toString()}`
  }



  // 웹뷰 닫기
  const closeKakaoWebView = () => {
    setShowKakaoWebView(false)
    setKakaoWebViewQuery('')
  }
  // 언어별 최소 글자수 검사 함수
  const getMinimumSearchLength = (query) => {
    // 한글 감지 (자음/모음/완성형 한글)
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(query)) {
      return 2  // 한글: 2글자
    }
    
    // 중국어 감지 (중국어 유니코드 범위)
    if (/[u4e00-u9fff]/.test(query)) {
      return 2  // 중국어: 2글자
    }
    
    // 영어 감지 (라틴 문자)
    if (/[a-zA-Z]/.test(query)) {
      return 4  // 영어: 4글자
    }
    
    // 기타 언어: 기본값 3글자
    return 3
  }

  // 실시간 자동완성 검색 (Debounced)
  const debouncedSearch = useCallback((query) => {
    // 이전 타이머 클리어
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // 언어별 최소 글자수 확인
    const minLength = getMinimumSearchLength(query)
    if (!query || query.length < minLength) {
      setSearchResults([])
      setShowSearchResults(false)
      setIsSearching(false)
      return
    }

    // 800ms 후 검색 실행 (API 사용량 최적화)
    searchTimeoutRef.current = setTimeout(() => {
      searchPlace(query)
    }, 800)
  }, [searchPlace])

  // 검색어 변경 핸들러
  const handleSearchQueryChange = (newQuery) => {
    setSearchQuery(newQuery)
    debouncedSearch(newQuery) // 실시간 자동완성
  }

  // 출발지 실시간 자동완성 검색 (Debounced)
  const debouncedStartSearch = useCallback((query) => {
    if (startSearchTimeoutRef.current) {
      clearTimeout(startSearchTimeoutRef.current)
    }

    // 언어별 최소 글자수 확인
    const minLength = getMinimumSearchLength(query)
    if (!query || query.length < minLength) {
      setStartResults([])
      setShowStartResults(false)
      return
    }

    startSearchTimeoutRef.current = setTimeout(() => {
      searchLocation(query, true)
    }, 800)
  }, [searchLocation])
  const debouncedEndSearch = useCallback((query) => {
    if (endSearchTimeoutRef.current) {
      clearTimeout(endSearchTimeoutRef.current)
    }

    // 언어별 최소 글자수 확인
    const minLength = getMinimumSearchLength(query)
    if (!query || query.length < minLength) {
      setEndResults([])
      setShowEndResults(false)
      return
    }

    endSearchTimeoutRef.current = setTimeout(() => {
      searchLocation(query, false)
    }, 800)
  }, [searchLocation])

  // 출발지 검색어 변경 핸들러
  const handleStartLocationChange = (newQuery) => {
    setStartLocation(newQuery)
    setStartCoords(null) // 텍스트 변경 시 이전 좌표 초기화
    debouncedStartSearch(newQuery)
  }

  // 도착지 검색어 변경 핸들러
  const handleEndLocationChange = (newQuery) => {
    setEndLocation(newQuery)
    setEndCoords(null) // 텍스트 변경 시 이전 좌표 초기화
    debouncedEndSearch(newQuery)
  }

  // 카카오 카테고리 검색
  const searchByCategory = (categoryId) => {
    setSelectedCategory(categoryId)

    // 시티투어 폴리라인 정리 (다른 카테고리로 전환 시)
    if (categoryId !== 'city_tour_bus' && busPolylines.length > 0) {
      busPolylines.forEach(pl => pl.setMap(null))
      setBusPolylines([])
    }

    if (categoryId === 'all') {
      // 전체 카테고리는 기존 마커들 표시
      return
    }

    const category = mapCategories.find(cat => cat.id === categoryId)
    if (!category) return

    // 제로페이 카테고리 처리
    if (category.isZeropay) {
      if (!map) return
      markers.forEach(marker => marker.setMap(null))
      if (clusterer) clusterer.clear()
      setMarkers([])
      import('../data/zeropay/zeropayData.js').then(({ zeropayStores }) => {
        if (!zeropayStores || zeropayStores.length === 0) return
        const bounds = map.getBounds()
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()
        const visible = zeropayStores.filter(s =>
          s.lat && s.lng &&
          s.lat >= sw.getLat() && s.lat <= ne.getLat() &&
          s.lng >= sw.getLng() && s.lng <= ne.getLng()
        ).slice(0, 100)

        const markerImg = new window.kakao.maps.MarkerImage(
          'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
            <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
              <circle cx="15" cy="15" r="15" fill="#7C3AED" stroke="white" stroke-width="2"/>
              <text x="15" y="20" text-anchor="middle" font-size="14">💳</text>
            </svg>
          `),
          new window.kakao.maps.Size(30, 30)
        )

        const newMarkers = []
        visible.forEach(s => {
          const position = new window.kakao.maps.LatLng(s.lat, s.lng)
          const marker = new window.kakao.maps.Marker({ position, map, image: markerImg })
          window.kakao.maps.event.addListener(marker, 'click', () => {
            map.setCenter(position)
            setSelectedMarker({
              id: `zeropay-${s.lat}-${s.lng}`,
              name: { ko: s.name, zh: s.name, en: s.name },
              description: { ko: s.address, zh: s.address, en: s.address },
              lat: s.lat, lng: s.lng,
              category: 'zeropay',
              phone: s.phone || null,
              categoryName: s.biz_type || L({ ko: '제로페이 가맹점', zh: 'ZeroPay商户', en: 'ZeroPay Store' })
            })
          })
          newMarkers.push(marker)
        })
        setMarkers(newMarkers)
      })
      return
    }

    // 화장실 카테고리 처리
    if (category.isToilet) {
      if (!map) return
      markers.forEach(marker => marker.setMap(null))
      setMarkers([])
      import('../data/toiletData.js').then(({ SEOUL_TOILETS }) => {
        const bounds = map.getBounds()
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()
        const visible = SEOUL_TOILETS.filter(t =>
          t.lat >= sw.getLat() && t.lat <= ne.getLat() &&
          t.lng >= sw.getLng() && t.lng <= ne.getLng()
        ).slice(0, 100) // 성능을 위해 최대 100개

        const newMarkers = []
        visible.forEach(t => {
          const position = new window.kakao.maps.LatLng(t.lat, t.lng)
          const marker = new window.kakao.maps.Marker({ position, map })
          window.kakao.maps.event.addListener(marker, 'click', () => {
            map.setCenter(position)
            const features = [
              t.d === 'Y' ? '♿ ' + L({ ko: '장애인용', zh: '无障碍', en: 'Accessible' }) : '',
              t.dp === 'Y' ? '👶 ' + L({ ko: '기저귀교환대', zh: '换尿台', en: 'Diaper' }) : '',
              t.cc === 'Y' ? '📹 CCTV' : '',
              t.bl === 'Y' ? '🔔 ' + L({ ko: '비상벨', zh: '紧急铃', en: 'Emergency Bell' }) : '',
            ].filter(Boolean).join(' · ')
            setSelectedMarker({
              id: `toilet-${t.lat}-${t.lng}`,
              name: { ko: t.n, zh: t.n, en: t.n },
              description: { ko: `${t.a}\n🕐 ${t.h || '정보없음'}\n${features}`, zh: `${t.a}\n🕐 ${t.h || '暂无信息'}\n${features}`, en: `${t.a}\n🕐 ${t.h || 'N/A'}\n${features}` },
              lat: t.lat, lng: t.lng,
              category: 'toilet',
              phone: t.p,
            })
          })
          newMarkers.push(marker)
        })
        setMarkers(newMarkers)
      })
      return
    }

    // 🚌 시티투어버스 카테고리 처리
    if (category.isCityTourBus) {
      if (!map) return
      markers.forEach(marker => marker.setMap(null))
      setMarkers([])
      // 기존 폴리라인 제거
      busPolylines.forEach(pl => pl.setMap(null))
      setBusPolylines([])

      import('../data/cityTourBusData.js').then(({ CITY_TOUR_ROUTES, CITY_TOUR_STOPS, ROUTE_COLORS }) => {
        const routeFilter = selectedBusRoute
        const routes = routeFilter === 'all' ? CITY_TOUR_ROUTES : CITY_TOUR_ROUTES.filter(r => r.id === routeFilter)
        const stops = routeFilter === 'all' ? CITY_TOUR_STOPS : CITY_TOUR_STOPS.filter(s => s.route === routeFilter)

        const newMarkers = []
        const newPolylines = []

        // 노선별 폴리라인 그리기
        routes.forEach(route => {
          const routeStops = CITY_TOUR_STOPS.filter(s => s.route === route.id).sort((a, b) => a.order - b.order)
          if (routeStops.length < 2) return
          const path = routeStops.map(s => new window.kakao.maps.LatLng(s.lat, s.lng))
          // 순환 노선은 시작점으로 돌아오기
          if (route.id === 'downtown') path.push(path[0])
          const polyline = new window.kakao.maps.Polyline({
            path,
            strokeWeight: 4,
            strokeColor: route.color,
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            map
          })
          newPolylines.push(polyline)
        })

        // 정류소 마커 생성
        stops.forEach(stop => {
          const routeColor = ROUTE_COLORS[stop.route] || '#E53935'
          const isStart = stop.isStart
          const markerSize = isStart ? 36 : 28
          const markerImg = new window.kakao.maps.MarkerImage(
            'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
              <svg viewBox="0 0 ${markerSize} ${markerSize}" xmlns="http://www.w3.org/2000/svg" width="${markerSize}" height="${markerSize}">
                <circle cx="${markerSize/2}" cy="${markerSize/2}" r="${markerSize/2 - 1}" fill="${routeColor}" stroke="white" stroke-width="2"/>
                <text x="${markerSize/2}" y="${markerSize/2 + 5}" text-anchor="middle" font-size="${isStart ? 16 : 13}" fill="white" font-weight="bold">${isStart ? '🚌' : stop.order}</text>
              </svg>
            `),
            new window.kakao.maps.Size(markerSize, markerSize)
          )

          const position = new window.kakao.maps.LatLng(stop.lat, stop.lng)
          const marker = new window.kakao.maps.Marker({ position, map, image: markerImg })
          const routeInfo = CITY_TOUR_ROUTES.find(r => r.id === stop.route)

          window.kakao.maps.event.addListener(marker, 'click', () => {
            map.setCenter(position)
            setSelectedMarker({
              id: `citytour-${stop.route}-${stop.order}`,
              name: stop.name,
              description: {
                ko: `🚌 ${L(routeInfo.name)} ${stop.order}번 정류소\n📍 ${L(stop.landmark)}\n🕐 ${L(routeInfo.hours)} · ${L(routeInfo.interval)}\n💰 ${L(routeInfo.price)}`,
                zh: `🚌 ${stop.name.zh} — ${routeInfo.name.zh} #${stop.order}\n📍 ${stop.landmark.zh}\n🕐 ${routeInfo.hours.zh} · ${routeInfo.interval.zh}\n💰 ${routeInfo.price.zh}`,
                en: `🚌 ${routeInfo.name.en} Stop #${stop.order}\n📍 ${stop.landmark.en}\n🕐 ${routeInfo.hours.en} · ${routeInfo.interval.en}\n💰 ${routeInfo.price.en}`
              },
              lat: stop.lat, lng: stop.lng,
              category: 'city_tour_bus',
              categoryName: L(routeInfo.name)
            })
          })
          newMarkers.push(marker)
        })

        setMarkers(newMarkers)
        setBusPolylines(newPolylines)

        // 전체 보기일 때 서울 중심으로 줌
        if (routeFilter === 'all' && stops.length > 0) {
          const bounds = new window.kakao.maps.LatLngBounds()
          stops.forEach(s => bounds.extend(new window.kakao.maps.LatLng(s.lat, s.lng)))
          map.setBounds(bounds, 50)
        }
      })
      return
    }

    // TourAPI 카테고리 처리
    if (category.tourApiType) {
      if (!map) return
      markers.forEach(marker => marker.setMap(null))
      setMarkers([])
      const center = map.getCenter()
      import('../api/tourApi').then(({ getLocationBasedList }) => {
        getLocationBasedList({
          mapX: center.getLng(), mapY: center.getLat(),
          radius: 10000, contentTypeId: category.tourApiType, numOfRows: 30,
        }).then(result => {
          const newMarkers = []
          ;(result.items || []).forEach(item => {
            if (!item.mapx || !item.mapy) return
            const position = new window.kakao.maps.LatLng(parseFloat(item.mapy), parseFloat(item.mapx))
            const marker = new window.kakao.maps.Marker({ position, map })
            window.kakao.maps.event.addListener(marker, 'click', () => {
              map.setCenter(position)
              setSelectedMarker({
                id: item.contentid,
                name: { ko: item.title, zh: item.title, en: item.title },
                description: { ko: item.addr1 || '', zh: item.addr1 || '', en: item.addr1 || '' },
                lat: parseFloat(item.mapy),
                lng: parseFloat(item.mapx),
                category: categoryId,
                phone: item.tel,
                image: item.firstimage,
                tourApiItem: item,
              })
            })
            newMarkers.push(marker)
          })
          setMarkers(newMarkers)
        })
      })
      return
    }

    if (!category.kakaoCode) return

    if (!map) return

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])

    const ps = new window.kakao.maps.services.Places()
    const center = map.getCenter()
    
    ps.categorySearch(category.kakaoCode, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const newMarkers = []
        
        result.forEach((place, index) => {
          const position = new window.kakao.maps.LatLng(place.y, place.x)
          const marker = new window.kakao.maps.Marker({
            position: position,
            map: map
          })

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, 'click', () => {
            // 클릭한 마커 위치로 지도 중심 이동
            map.setCenter(position)

            setSelectedMarker({
              id: place.id,
              name: { ko: place.place_name, zh: place.place_name, en: place.place_name },
              description: { ko: place.address_name, zh: place.address_name, en: place.address_name },
              lat: parseFloat(place.y),
              lng: parseFloat(place.x),
              category: categoryId,
              phone: place.phone,
              categoryName: place.category_name,
              url: place.place_url
            })
          })

          newMarkers.push(marker)
        })
        
        setMarkers(newMarkers)
      }
    }, {
      location: center,
      radius: 1000, // 1km 반경
      sort: window.kakao.maps.services.SortBy.DISTANCE
    })
  }

  // 지도 테마 (카카오맵은 기본 스타일만 제공)
  const mapThemes = [
    {
      id: 'normal',
      name: { ko: '기본', zh: '默认', en: 'Normal' },
      color: '#4285F4',
      description: { ko: '카카오맵 기본 스타일', zh: '카카오맵默认样式', en: 'KakaoMap Default Style' },
      mapType: window.kakao?.maps?.MapTypeId?.ROADMAP
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
  // 카카오맵 순정 카테고리 (categorySearch API 코드 기반)
  const mapCategories = [
    { 
      id: 'all', 
      name: { ko: '전체', zh: '全部', en: 'All' },
      color: '#111827',
      kakaoCode: null
    },
    { 
      id: 'restaurant', 
      name: { ko: '음식점', zh: '餐厅', en: 'Restaurant' },
      color: '#FF6B6B',
      kakaoCode: 'FD6'
    },
    { 
      id: 'cafe', 
      name: { ko: '카페', zh: '咖啡店', en: 'Cafe' },
      color: '#FFA726',
      kakaoCode: 'CE7'
    },
    { 
      id: 'convenience', 
      name: { ko: '편의점', zh: '便利店', en: 'Conv Store' },
      color: '#42A5F5',
      kakaoCode: 'CS2'
    },
    { 
      id: 'gas', 
      name: { ko: '주유소', zh: '加油站', en: 'Gas' },
      color: '#66BB6A',
      kakaoCode: 'OL7'
    },
    { 
      id: 'hospital', 
      name: { ko: '병원', zh: '医院', en: 'Hospital' },
      color: '#EF5350',
      kakaoCode: 'HP8'
    },
    { 
      id: 'pharmacy', 
      name: { ko: '약국', zh: '药店', en: 'Pharmacy' },
      color: '#AB47BC',
      kakaoCode: 'PM9'
    },
    { 
      id: 'bank', 
      name: { ko: '은행', zh: '银行', en: 'Bank' },
      color: '#26A69A',
      kakaoCode: 'BK9'
    },
    { 
      id: 'mart', 
      name: { ko: '마트', zh: '超市', en: 'Mart' },
      color: '#FF7043',
      kakaoCode: 'MT1'
    },
    {
      id: 'toilet',
      name: { ko: '화장실', zh: '洗手间', en: 'Toilet' },
      color: '#8D6E63',
      kakaoCode: null,
      isToilet: true
    },
    {
      id: 'tour_spot',
      name: { ko: '관광지', zh: '景点', en: 'Attractions' },
      color: '#7C4DFF',
      kakaoCode: null,
      tourApiType: 76
    },
    {
      id: 'tour_festival',
      name: { ko: '축제', zh: '庆典', en: 'Festivals' },
      color: '#FF4081',
      kakaoCode: null,
      tourApiType: 85
    },
    {
      id: 'tour_stay',
      name: { ko: '숙박', zh: '住宿', en: 'Stay' },
      color: '#00BCD4',
      kakaoCode: null,
      tourApiType: 80
    },
    {
      id: 'zeropay',
      name: { ko: '제로페이', zh: 'ZeroPay', en: 'ZeroPay' },
      color: '#7C3AED',
      kakaoCode: null,
      isZeropay: true
    },
    {
      id: 'city_tour_bus',
      name: { ko: '시티투어', zh: '观光巴士', en: 'City Tour' },
      color: '#E53935',
      kakaoCode: null,
      isCityTourBus: true
    }
  ]

  return (
    <div className="bg-white" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* 검색 헤더 */}
      <div className="bg-white sticky top-0 z-40 ">
        <div className="px-3 py-2.5 flex items-center gap-2">
          {/* 검색 입력창 */}
          <div className="flex-1 relative search-container">
            <div className="flex items-center bg-[var(--bg)] rounded-[var(--radius-pill)] px-3 py-2">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                onKeyPress={(e) => { if (e.key === "Enter") searchPlace(searchQuery) }}
                placeholder={L({ ko: "장소, 주소 검색", zh: "搜索地点、地址", en: "Search places" })}
                className="flex-1 bg-transparent outline-none text-sm ml-2 placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => { handleSearchQueryChange(''); setShowSearchResults(false) }} className="p-0.5">
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>

            {/* 검색 결과 드롭다운 */}
            {(showSearchResults || isSearching) && (
              isSearching ? (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-[var(--radius-pill)]  z-50">
                  <div className="px-3 py-3 text-center flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                    <span className="text-sm text-gray-400">{L({ ko: "검색 중...", zh: "搜索中...", en: "Searching..." })}</span>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-[var(--radius-pill)]  max-h-60 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <button key={result.id} onClick={() => selectSearchResult(result)}
                      className="w-full px-3 py-2.5 text-left hover:bg-[var(--surface)] border-b border-gray-50 last:border-0">
                      <div className="font-medium text-sm text-gray-900">{result.name}</div>
                      {result.address && <div className="text-xs text-gray-400 mt-0.5">{result.address}</div>}
                      {result.category && <div className="text-[10px] text-blue-500 mt-0.5">{result.category}</div>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-[var(--radius-pill)]  z-50">
                  <div className="px-3 py-4 text-center text-sm text-gray-400">
                    {L({ ko: "검색 결과가 없습니다", zh: "没有搜索结果", en: "No results" })}
                  </div>
                </div>
              )
            )}
          </div>


        </div>
      </div>

      {/* 카테고리 탭 — 지도 밖 고정, 침범 안 함 */}
      <div className="bg-white border-b border-[var(--border)] z-30 relative">
        <div className="px-4 py-2">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {mapCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => searchByCategory(category.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full border transition-all text-xs ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white border-gray-900'
                    : 'bg-white text-gray-600 border-[var(--border)] hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{L(category.name)}</span>
              </button>
            ))}
            
            {/* 내 여행계획 버튼 */}
            <button
              onClick={() => setShowTripPlanner(true)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border transition-all text-xs bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
            >
              <span className="font-medium">🗺️ {L({ ko: '내 여행계획', zh: '我的旅行计划', en: 'My Trip Plans' })}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚌 시티투어 노선 서브필터 — city_tour_bus 선택 시에만 표시 */}
      {selectedCategory === 'city_tour_bus' && (
        <div className="bg-white border-b border-[var(--border)] z-30 relative">
          <div className="px-4 py-1.5">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] text-gray-400 flex-shrink-0 mr-1">🚌</span>
              {[
                { id: 'all',         name: { ko: '전체노선', zh: '全部路线', en: 'All Routes' }, color: '#374151' },
                { id: 'downtown',    name: { ko: '🔴 도심순환', zh: '🔴 市中心', en: '🔴 Downtown' }, color: '#E53935' },
                { id: 'night',       name: { ko: '🔵 야경', zh: '🔵 夜景', en: '🔵 Night' }, color: '#1E88E5' },
                { id: 'traditional', name: { ko: '🟢 전통문화', zh: '🟢 传统文化', en: '🟢 Traditional' }, color: '#43A047' },
                { id: 'panorama',    name: { ko: '🟠 파노라마', zh: '🟠 全景', en: '🟠 Panorama' }, color: '#FB8C00' },
              ].map(route => (
                <button
                  key={route.id}
                  onClick={() => {
                    setSelectedBusRoute(route.id)
                    // 노선 변경 시 다시 그리기
                    setTimeout(() => searchByCategory('city_tour_bus'), 50)
                  }}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full border transition-all text-[11px] font-medium ${
                    selectedBusRoute === route.id
                      ? 'text-white border-transparent'
                      : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-gray-300'
                  }`}
                  style={selectedBusRoute === route.id ? { backgroundColor: route.color, borderColor: route.color } : {}}
                >
                  {L(route.name)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 지도 영역 */}
      <div className="relative flex-1 bg-[var(--surface)]" style={{ flex: 1, minHeight: 0 }}>
        {/* 카카오 지도 컨테이너 */}
        <div
          ref={mapRef}
          className="w-full h-full"
        />



        {/* 현재위치 버튼 */}
        <button
          onClick={() => {
            if (!map || locatingUser) return
            if (!navigator.geolocation && !Capacitor.isNativePlatform()) {
              alert(L({
                ko: '이 브라우저에서는 위치 서비스를 지원하지 않습니다.',
                zh: '此浏览器不支持位置服务。',
                en: 'Geolocation is not supported by this browser.'
              }))
              return
            }

            // 이전 watch 정리
            if (watchIdRef.current) {
              watchIdRef.current()
              watchIdRef.current = null
            }

            setLocatingUser(true)
            setLocationAccuracy(null)
            let settled = false

            const updateLocation = (position) => {
              const lat = position.coords.latitude
              const lng = position.coords.longitude
              const accuracy = position.coords.accuracy // 미터 단위
              const moveLatLng = new window.kakao.maps.LatLng(lat, lng)

              map.setCenter(moveLatLng)
              if (!settled) {
                map.setLevel(3)
              }
              setUserLocation({ lat, lng })
              setLocationAccuracy(Math.round(accuracy))

              // 기존 내 위치 마커 제거 후 새로 추가
              if (userMarkerRef.current) {
                userMarkerRef.current.setMap(null)
              }
              const marker = new window.kakao.maps.Marker({
                position: moveLatLng,
                map: map,
                image: new window.kakao.maps.MarkerImage(
                  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                      <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
                    </svg>
                  `),
                  new window.kakao.maps.Size(24, 24)
                )
              })
              userMarkerRef.current = marker

              // GPS 정확도 50m 이내면 충분히 정확 → watch 중단
              if (accuracy <= 50) {
                if (watchIdRef.current) {
                  watchIdRef.current()
                  watchIdRef.current = null
                }
                setLocatingUser(false)
              }
              settled = true
            }

            const handleError = (error) => {
              if (watchIdRef.current) {
                watchIdRef.current()
                watchIdRef.current = null
              }
              setLocatingUser(false)
              let msg
              if (error.code === 1) {
                msg = L({
                  ko: '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.',
                  zh: '位置权限被拒绝。请在浏览器设置中允许位置权限。',
                  en: 'Location permission denied. Please allow location access in browser settings.'
                })
              } else if (error.code === 2) {
                msg = L({
                  ko: '위치 정보를 사용할 수 없습니다. GPS를 확인해주세요.',
                  zh: '无法获取位置信息。请检查GPS。',
                  en: 'Location unavailable. Please check your GPS.'
                })
              } else {
                msg = L({
                  ko: '위치 요청 시간이 초과되었습니다. 다시 시도해주세요.',
                  zh: '位置请求超时。请重试。',
                  en: 'Location request timed out. Please try again.'
                })
              }
              alert(msg)
            }

            // watchPosition으로 GPS 정확도가 높아질 때까지 위치 업데이트 (네이티브 GPS 우선)
            watchIdRef.current = watchPositionCompat(
              updateLocation,
              handleError,
              { enableHighAccuracy: true, timeout: 15000 }
            )

            // 최대 15초 후 자동 중단 (GPS 못 잡아도 마지막 결과 사용)
            setTimeout(() => {
              if (watchIdRef.current) {
                watchIdRef.current()
                watchIdRef.current = null
                setLocatingUser(false)
              }
            }, 15000)
          }}
          className={`absolute top-[130px] right-[6px] z-40 w-9 h-9 bg-white rounded  flex items-center justify-center hover:bg-[var(--surface)] active:bg-[var(--bg)] transition-colors border border-gray-300 ${locatingUser ? 'animate-pulse' : ''}`}
          title={L({ ko: '내 위치', zh: '我的位置', en: 'My Location' })}
        >
          {locatingUser
            ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            : <Navigation size={18} className="text-blue-500" />
          }
        </button>
        {/* 위치 정확도 표시 */}
        {locationAccuracy && (
          <div className="absolute top-16 left-3 z-40 bg-white/90 rounded-full px-2 py-0.5 shadow text-xs text-[var(--text-secondary)] border border-[var(--border)]">
            ±{locationAccuracy}m
          </div>
        )}

        {/* 마커 상세 정보 패널 */}
        {selectedMarker && (
          <div className="absolute bottom-16 left-3 right-3 z-50 bg-white rounded-[var(--radius-pill)] shadow-xl px-3 py-2.5">
            {/* 헤더: 이름 + 닫기 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-[13px] leading-tight">{L(selectedMarker.name)}</h3>
                <p className="text-[var(--text-secondary)] text-[11px] leading-tight mt-0.5 line-clamp-2">{L(selectedMarker.description)}</p>
              </div>
              <button onClick={() => setSelectedMarker(null)} className="p-0.5 hover:bg-[var(--bg)] rounded shrink-0 mt-0.5">
                <X size={14} className="text-gray-400" />
              </button>
            </div>

            {/* 부가 정보 (한 줄로 압축) */}
            <div className="flex flex-wrap gap-x-3 gap-y-0 mt-1 text-[11px] text-[var(--text-secondary)]">
              {selectedMarker.chineseSupport && <span className="text-red-500">🇨🇳</span>}
              {selectedMarker.phone && <span>📞 {selectedMarker.phone}</span>}
              {selectedMarker.priceRange && <span>💰 {selectedMarker.priceRange}</span>}
              {selectedMarker.categoryName && <span>🏷️ {selectedMarker.categoryName}</span>}
            </div>

            {/* 길찾기 영역 */}
            <div className="mt-2 pt-2 border-t border-[var(--border)]">
              {!showRoutePanel ? (
                <button
                  onClick={() => {
                    setEndLocation(L(selectedMarker.name))
                    setEndCoords({ x: String(selectedMarker.lng), y: String(selectedMarker.lat) })
                    setShowRoutePanel(true)
                  }}
                  className="w-full py-2 text-[13px] font-medium text-white bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] rounded-[var(--radius-pill)]"
                >
                  {L({ ko: '길찾기', zh: '导航', en: 'Directions' })}
                </button>
              ) : (
                <div className="space-y-1.5">
                  {/* 출발지 */}
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <input
                        type="text"
                        value={startLocation}
                        onChange={(e) => handleStartLocationChange(e.target.value)}
                        placeholder={L({ ko: "출발지", zh: "出发地", en: "Start" })}
                        className="flex-1 px-2.5 py-1.5 text-[13px] bg-[var(--bg)] rounded-[var(--radius-pill)] outline-none focus:bg-[var(--surface)] focus:ring-1 focus:ring-[var(--y2k-lavender)]/30"
                      />
                    </div>
                    {showStartResults && startResults.length > 0 && (
                      <div className="absolute bottom-full left-5 right-0 mb-1 bg-white border border-[var(--border)] rounded-[var(--radius-pill)]  max-h-28 overflow-y-auto z-50">
                        {startResults.map(r => (
                          <button key={r.id} onClick={() => selectLocation(r, true)}
                            className="w-full px-2.5 py-1.5 text-left hover:bg-[var(--surface)] text-[11px] border-b border-gray-50 last:border-0">
                            <div className="font-medium">{r.name}</div>
                            {r.address && <div className="text-gray-400">{r.address}</div>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* 도착지 */}
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <input
                        type="text"
                        value={endLocation}
                        onChange={(e) => handleEndLocationChange(e.target.value)}
                        placeholder={L({ ko: "도착지", zh: "目的地", en: "Destination" })}
                        className="flex-1 px-2.5 py-1.5 text-[13px] bg-[var(--bg)] rounded-[var(--radius-pill)] outline-none focus:bg-[var(--surface)] focus:ring-1 focus:ring-[var(--y2k-lavender)]/30"
                      />
                    </div>
                    {showEndResults && endResults.length > 0 && (
                      <div className="absolute bottom-full left-5 right-0 mb-1 bg-white border border-[var(--border)] rounded-[var(--radius-pill)]  max-h-28 overflow-y-auto z-50">
                        {endResults.map(r => (
                          <button key={r.id} onClick={() => selectLocation(r, false)}
                            className="w-full px-2.5 py-1.5 text-left hover:bg-[var(--surface)] text-[11px] border-b border-gray-50 last:border-0">
                            <div className="font-medium">{r.name}</div>
                            {r.address && <div className="text-gray-400">{r.address}</div>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Go + 닫기 */}
                  <div className="flex gap-2">
                    <button onClick={startRouteNavigation}
                      className="flex-1 py-1.5 text-[13px] font-medium text-white bg-blue-500 rounded-[var(--radius-pill)]">
                      Go
                    </button>
                    <button onClick={() => { setShowRoutePanel(false); setShowStartResults(false); setShowEndResults(false) }}
                      className="px-3 py-1.5 text-[var(--text-secondary)] bg-[var(--bg)] rounded-[var(--radius-pill)]">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* API 키 없을 때 메시지 */}
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-yellow-200 rounded-full flex items-center justify-center">
                <Info size={24} className="text-yellow-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">
                  {L({ ko: '카카오맵 API 키 필요', zh: '需要카카오맵API密钥', en: 'KakaoMap API Key Required' })}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
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

      {/* 카카오맵 웹뷰 모달 */}
      {showKakaoWebView && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full h-full max-w-lg max-h-[90vh] rounded-[var(--radius-pill)] flex flex-col">
            {/* 웹뷰 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center space-x-2">
                <Globe size={20} className="text-blue-500" />
                <h3 className="text-lg font-semibold">
                  {L({ ko: '카카오맵 검색', zh: 'Kakao地图搜索', en: 'Kakao Map Search' })}
                </h3>
              </div>
              <button
                onClick={closeKakaoWebView}
                className="p-2 hover:bg-[var(--bg)] rounded-[var(--radius-pill)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 검색어 표시 */}
            <div className="px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)]">
              <div className="flex items-center space-x-2">
                <Search size={16} className="text-[var(--text-secondary)]" />
                <span className="text-sm text-gray-700">
                  {L({ ko: '검색어', zh: '搜索词', en: 'Query' })}: <strong>{kakaoWebViewQuery}</strong>
                </span>
              </div>
            </div>

            {/* 카카오맵 iframe */}
            <div className="flex-1 relative">
              <iframe
                src={getKakaoMapWebViewUrl(kakaoWebViewQuery)}
                className="w-full h-full border-0"
                title="Kakao Map Search"
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* 웹뷰 푸터 */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[var(--text-secondary)]">
                  {L({ 
                    ko: '카카오맵 순정 검색 결과', 
                    zh: 'Kakao地图原生搜索结果', 
                    en: 'Native Kakao Map Results' 
                  })}
                </div>
                <button
                  onClick={() => window.open(getKakaoMapWebViewUrl(kakaoWebViewQuery), '_blank')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-[var(--radius-pill)] transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>{L({ ko: '새 창', zh: '新窗口', en: 'New Tab' })}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🗺️ 여행계획 모달 */}
      {showTripPlanner && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-[var(--radius-pill)] flex flex-col overflow-hidden">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold">
                🗺️ {L({ ko: '내 여행계획', zh: '我的旅行计划', en: 'My Trip Plans' })}
              </h2>
              <button
                onClick={() => {
                  setShowTripPlanner(false)
                  setCurrentTripPlan(null)
                  setEditingTripIndex(-1)
                }}
                className="p-2 hover:bg-[var(--bg)] rounded-[var(--radius-pill)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 콘텐츠 */}
            <div className="flex-1 overflow-y-auto">
              {currentTripPlan ? (
                // 여행계획 편집 모드
                <div className="p-4 space-y-4">
                  {/* 계획명 입력 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {L({ ko: '계획명', zh: '计划名称', en: 'Plan Name' })}
                    </label>
                    <input
                      type="text"
                      value={currentTripPlan.name}
                      onChange={(e) => setCurrentTripPlan(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-[var(--radius-pill)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={L({ ko: '여행계획 이름을 입력하세요', zh: '请输入旅行计划名称', en: 'Enter plan name' })}
                    />
                  </div>

                  {/* 목적지 목록 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {L({ ko: '목적지', zh: '目的地', en: 'Destinations' })} ({currentTripPlan.destinations.length}/10)
                    </label>
                    
                    {currentTripPlan.destinations.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {currentTripPlan.destinations.map((dest, index) => (
                          <div key={dest.id} className="flex items-center gap-3 p-3 bg-[var(--surface)] rounded-[var(--radius-pill)]">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{dest.name}</div>
                              <div className="text-xs text-[var(--text-secondary)] truncate">{dest.address}</div>
                            </div>
                            <button
                              onClick={() => removeDestination(dest.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-[var(--text-secondary)]">
                        <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{L({ ko: '목적지를 추가해보세요', zh: '请添加目的地', en: 'Add destinations' })}</p>
                      </div>
                    )}

                    {/* 목적지 추가 */}
                    {currentTripPlan.destinations.length < 10 && (
                      <div className="relative">
                        <input
                          type="text"
                          value={newDestinationQuery}
                          onChange={(e) => {
                            setNewDestinationQuery(e.target.value)
                            if (e.target.value.length > 1) {
                              searchDestinations(e.target.value)
                            } else {
                              setShowDestinationResults(false)
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-[var(--radius-pill)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={L({ ko: '목적지를 검색하세요', zh: '搜索目的地', en: 'Search destinations' })}
                        />
                        
                        {showDestinationResults && destinationSearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-[var(--radius-pill)]  max-h-60 overflow-y-auto z-10">
                            {destinationSearchResults.map((result) => (
                              <button
                                key={result.id}
                                onClick={() => addDestination(result)}
                                className="w-full px-3 py-2.5 text-left hover:bg-[var(--surface)] border-b border-[var(--border)] last:border-0"
                              >
                                <div className="font-medium text-sm">{result.name}</div>
                                <div className="text-xs text-[var(--text-secondary)]">{result.address}</div>
                                {result.category && <div className="text-xs text-blue-500">{result.category}</div>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 저장/취소 버튼 */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setCurrentTripPlan(null)
                        setEditingTripIndex(-1)
                      }}
                      className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-[var(--radius-pill)] hover:bg-[var(--surface)]"
                    >
                      {L({ ko: '취소', zh: '取消', en: 'Cancel' })}
                    </button>
                    <button
                      onClick={saveTripPlan}
                      disabled={!currentTripPlan.name.trim() || currentTripPlan.destinations.length === 0}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-[var(--radius-pill)] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {L({ ko: '저장', zh: '保存', en: 'Save' })}
                    </button>
                  </div>
                </div>
              ) : (
                // 여행계획 목록 모드
                <div className="p-4">
                  {tripPlans.length > 0 ? (
                    <div className="space-y-3">
                      {tripPlans.map((plan, index) => (
                        <div key={plan.id} className="border border-[var(--border)] rounded-[var(--radius-pill)] p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{plan.name}</h3>
                              <p className="text-xs text-[var(--text-secondary)] mt-1">
                                {L({ ko: '목적지', zh: '目的地', en: 'Destinations' })}: {plan.destinations.length}개
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(plan.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setCurrentTripPlan(plan)
                                  setEditingTripIndex(index)
                                }}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full"
                                title={L({ ko: '편집', zh: '编辑', en: 'Edit' })}
                              >
                                <Route size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(L({ ko: '이 여행계획을 삭제하시겠습니까?', zh: '确定要删除此旅行计划吗？', en: 'Delete this trip plan?' }))) {
                                    deleteTripPlan(index)
                                  }
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                                title={L({ ko: '삭제', zh: '删除', en: 'Delete' })}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                          
                          {plan.destinations.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {plan.destinations.slice(0, 3).map((dest, i) => (
                                  <span key={dest.id} className="text-xs bg-[var(--bg)] px-2 py-1 rounded-full">
                                    {i + 1}. {dest.name.length > 10 ? dest.name.substring(0, 10) + '...' : dest.name}
                                  </span>
                                ))}
                                {plan.destinations.length > 3 && (
                                  <span className="text-xs bg-[var(--bg)] px-2 py-1 rounded-full">
                                    +{plan.destinations.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <button
                            onClick={() => startNavigation(plan)}
                            disabled={plan.destinations.length === 0}
                            className="w-full px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-[var(--radius-pill)] hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Navigation size={16} />
                            {L({ ko: '카카오맵으로 길찾기', zh: 'Kakao地图导航', en: 'Navigate with KakaoMap' })}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Route size={48} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        {L({ ko: '저장된 여행계획이 없습니다', zh: '没有保存的旅行计划', en: 'No saved trip plans' })}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-6">
                        {L({ ko: '새 여행계획을 만들어보세요', zh: '创建新的旅行计划', en: 'Create a new trip plan' })}
                      </p>
                    </div>
                  )}

                  {/* 새 계획 만들기 버튼 */}
                  {tripPlans.length < 10 && (
                    <button
                      onClick={createNewTripPlan}
                      className="w-full mt-4 px-4 py-3 bg-blue-500 text-white font-medium rounded-[var(--radius-pill)] hover:bg-blue-600 flex items-center justify-center gap-2"
                    >
                      <Route size={18} />
                      {L({ ko: '새 여행계획 만들기', zh: '创建新旅行计划', en: 'Create New Trip Plan' })}
                    </button>
                  )}
                  
                  {tripPlans.length >= 10 && (
                    <p className="text-center text-xs text-[var(--text-secondary)] mt-4">
                      {L({ ko: '최대 10개의 여행계획을 저장할 수 있습니다', zh: '最多可保存10个旅行计划', en: 'Maximum 10 trip plans allowed' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
