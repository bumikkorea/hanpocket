import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Search, Filter, Navigation, Info, ArrowUpDown, Route, X, ExternalLink, Globe } from 'lucide-react'
import { translateBrandName, smartTranslate } from '../data/brandMapping.js'

export default function MapTab({ lang }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('hanpocket')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [geocoder, setGeocoder] = useState(null)
  const [clusterer, setClusterer] = useState(null)
  const [showRoutePanel, setShowRoutePanel] = useState(false)
  const [startLocation, setStartLocation] = useState('')
  const [endLocation, setEndLocation] = useState('')
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
      // services, clusterer 라이브러리 추가 + 언어 파라미터 시도
      const langParam = currentLang !== 'ko' ? `&hl=${currentLang}` : ''
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer&autoload=false${langParam}`
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

        // 지도 타입 컨트롤 추가
        const mapTypeControl = new window.kakao.maps.MapTypeControl()
        kakaoMap.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT)

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
      window.kakao.maps.event.addListener(marker, "click", () => {
        console.log("마커 클릭됨:", markerData.name)
        // 이벤트 전파 중단
        if (event) {
          event.stopPropagation()
        }
        map.setCenter(position)
        map.setLevel(3)
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
    const setShowResults = isStart ? setShowStartResults : setShowEndResults

    setLocation(result.name)
    setShowResults(false)
  }

  // 출발지/도착지 위치 바꾸기
  const switchLocations = () => {
    const temp = startLocation
    setStartLocation(endLocation)
    setEndLocation(temp)
  }

  // 카카오맵 길찾기 실행
  const startNavigation = () => {
    if (!startLocation || !endLocation) {
      alert(L({ 
        ko: '출발지와 도착지를 모두 입력해주세요.', 
        zh: '请输入出发地和目的地。', 
        en: 'Please enter both start and destination.' 
      }))
      return
    }

    const startQuery = encodeURIComponent(startLocation)
    const endQuery = encodeURIComponent(endLocation)
    const navigationUrl = `https://map.kakao.com/link/from/${startQuery}/to/${endQuery}`
    
    window.open(navigationUrl, '_blank')
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
    debouncedStartSearch(newQuery)
  }

  // 도착지 검색어 변경 핸들러
  const handleEndLocationChange = (newQuery) => {
    setEndLocation(newQuery)
    debouncedEndSearch(newQuery)
  }

  // 카카오 카테고리 검색
  const searchByCategory = (categoryId) => {
    setSelectedCategory(categoryId)
    setSelectedMarker(null) // 카테고리 변경 시 선택된 마커 초기화
    
    if (categoryId === 'all') {
      // 전체 카테고리는 기존 마커들 표시
      return
    }

    const category = mapCategories.find(cat => cat.id === categoryId)
    if (!category || !category.kakaoCode) return

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
          window.kakao.maps.event.addListener(marker, "click", () => {
        console.log("마커 클릭됨:", markerData.name)
        // 이벤트 전파 중단
        if (event) {
          event.stopPropagation()
        }
        map.setCenter(position)
        map.setLevel(3)
            setSelectedMarker({
              id: place.id,
              name: { ko: place.place_name, zh: place.place_name, en: place.place_name },
              description: { ko: place.address_name, zh: place.address_name, en: place.address_name },
              lat: place.y,
              lng: place.x,
              category: categoryId,
              phone: place.phone,
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
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      {/* 헤더 + 검색창 통합 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            {/* 어디가? 제목 */}
            <h1 className="text-lg font-bold text-gray-900 flex-shrink-0">
              {L({ ko: "어디가?", zh: "去哪里?", en: "Where to?" })}
            </h1>
            
            {/* 검색창 */}
            <div className="flex-1 relative search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    searchPlace(searchQuery)
                  }
                }}
                placeholder={L({ ko: "장소, 주소 검색", zh: "搜索地点、地址", en: "Search places, addresses" })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button 
                  onClick={() => openKakaoWebView(searchQuery)}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  title={L({ ko: "카카오맵에서 검색", zh: "在Kakao地图搜索", en: "Search in Kakao Map" })}
                >
                  <Globe size={14} />
                </button>
                <button 
                  onClick={() => searchPlace(searchQuery)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title={L({ ko: "검색", zh: "搜索", en: "Search" })}
                >
                  <Search size={14} />
                </button>
              </div>

              {/* 검색 결과 드롭다운 */}
              {(showSearchResults || isSearching) && (
                isSearching ? (
                  /* 검색 중 로딩 */
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="px-3 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span className="text-sm text-gray-500">
                          {L({ ko: "검색 중...", zh: "搜索中...", en: "Searching..." })}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => selectSearchResult(result)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm">{result.name}</div>
                      {result.address && (
                        <div className="text-xs text-gray-500">{result.address}</div>
                      )}
                      {result.category && (
                        <div className="text-xs text-blue-600">{result.category}</div>
                      )}
                    </button>
                  ))}
                  
                  {/* 카카오맵에서 더 보기 */}
                  <button
                    onClick={() => openKakaoWebView(searchQuery)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 border-t border-gray-200 text-blue-600 font-medium text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Globe size={12} />
                      <span>{L({ ko: "카카오맵에서 더 보기", zh: "在Kakao地图查看更多", en: "More in Kakao Map" })}</span>
                    </div>
                  </button>
                </div>
                ) : (
                  /* 검색 결과 없을 때 */
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="px-3 py-4 text-center">
                      <div className="text-sm text-gray-500 mb-3">
                        {L({ 
                          ko: "검색 결과가 없습니다", 
                          zh: "没有搜索结果", 
                          en: "No results found" 
                        })}
                      </div>
                      <button
                        onClick={() => openKakaoWebView(searchQuery)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Globe size={14} />
                        <span>{L({ ko: "카카오맵에서 검색", zh: "在Kakao地图搜索", en: "Search in Kakao Map" })}</span>
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
            
            {/* 길찾기 버튼 */}
            <button
              onClick={() => setShowRoutePanel(!showRoutePanel)}
              className={`p-2 transition-colors flex-shrink-0 ${showRoutePanel ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              title={L({ ko: "길찾기", zh: "导航", en: "Navigation" })}
            >
              <Route size={20} />
            </button>
          </div>
        </div>
      </div>


      {/* 출발지/도착지 입력 패널 */}
      {showRoutePanel && (
        <div className="bg-white border-b border-gray-100 sticky top-[70px] z-30">
          <div className="px-4 py-3">
            <div className="flex items-start space-x-3">
              {/* 출발지 + 도착지 입력창들 */}
              <div className="flex-1 space-y-3">
                {/* 출발지 입력 */}
                <div className="relative route-search-start">
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => handleStartLocationChange(e.target.value)}
                    placeholder={L({ ko: "출발지", zh: "出发地", en: "Start" })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  
                  {/* 출발지 검색 결과 */}
                  {showStartResults && startResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50">
                      {startResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => selectLocation(result, true)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-xs">{result.name}</div>
                          {result.address && (
                            <div className="text-xs text-gray-500">{result.address}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 도착지 입력 */}
                <div className="relative route-search-end">
                  <input
                    type="text"
                    value={endLocation}
                    onChange={(e) => handleEndLocationChange(e.target.value)}
                    placeholder={L({ ko: "도착지", zh: "目的地", en: "Destination" })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />

                  {/* 도착지 검색 결과 */}
                  {showEndResults && endResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50">
                      {endResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => selectLocation(result, false)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-xs">{result.name}</div>
                          {result.address && (
                            <div className="text-xs text-gray-500">{result.address}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 우측 버튼들 (세로 배치: Go 위, 전환 버튼 아래) */}
              <div className="flex flex-col space-y-2 pt-1">
                {/* Go 버튼 */}
                <button
                  onClick={startNavigation}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {L({ ko: "Go", zh: "출발", en: "Go" })}
                </button>

                {/* 전환 버튼 */}
                <button
                  onClick={switchLocations}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={L({ ko: "출발지/도착지 바꾸기", zh: "交换出发地和目的地", en: "Switch locations" })}
                >
                  <ArrowUpDown size={16} />
                </button>

                {/* 닫기 버튼 */}
                <button
                  onClick={() => {
                    setShowRoutePanel(false)
                    setShowStartResults(false)
                    setShowEndResults(false)
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 카테고리 탭 */}
      <div className={`bg-white border-b border-gray-100 sticky z-30 ${showRoutePanel ? 'top-[200px]' : 'top-[70px]'}`}>
        <div className="px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {mapCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => searchByCategory(category.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-full border transition-all text-sm ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{L(category.name)}</span>
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
          className={`w-full ${
            showRoutePanel 
              ? 'h-[calc(100vh-340px)] md:h-[calc(100vh-300px)]'
              : 'h-[calc(100vh-200px)] md:h-[calc(100vh-160px)]'
          }`}
          style={{ 
            minHeight: '300px',
            maxHeight: 'calc(100vh - 150px)'
          }}
        />



        {/* 마커 상세 정보 패널 */}
        {selectedMarker && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 max-h-48 overflow-y-auto z-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
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
                  {selectedMarker.phone && (
                    <div className="text-gray-500">📞 {selectedMarker.phone}</div>
                  )}
                  {selectedMarker.categoryName && (
                    <div className="text-gray-500">🏷️ {selectedMarker.categoryName}</div>
                  )}
                </div>

                {/* 출발지/도착지 지정 버튼들 */}
                <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setStartLocation(L(selectedMarker.name))
                      setShowRoutePanel(true)
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {L({ ko: '출발지로', zh: '设为起点', en: 'Set Start' })}
                  </button>
                  <button
                    onClick={() => {
                      setEndLocation(L(selectedMarker.name))
                      setShowRoutePanel(true)
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    {L({ ko: '도착지로', zh: '设为终点', en: 'Set End' })}
                  </button>
                </div>

                {/* 카카오맵 연동 버튼들 */}
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => window.open(getKakaoMapUrl(selectedMarker), '_blank')}
                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    {L({ ko: '크게보기', zh: '放大查看', en: 'View Large' })}
                  </button>
                  <button
                    onClick={() => window.open(getKakaoDirectionUrl(selectedMarker), '_blank')}
                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {L({ ko: '길찾기', zh: '导航', en: 'Directions' })}
                  </button>
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

      {/* 카카오맵 웹뷰 모달 */}
      {showKakaoWebView && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full h-full max-w-lg max-h-[90vh] rounded-lg flex flex-col">
            {/* 웹뷰 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Globe size={20} className="text-blue-500" />
                <h3 className="text-lg font-semibold">
                  {L({ ko: '카카오맵 검색', zh: 'Kakao地图搜索', en: 'Kakao Map Search' })}
                </h3>
              </div>
              <button
                onClick={closeKakaoWebView}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 검색어 표시 */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Search size={16} className="text-gray-500" />
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
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {L({ 
                    ko: '카카오맵 순정 검색 결과', 
                    zh: 'Kakao地图原生搜索结果', 
                    en: 'Native Kakao Map Results' 
                  })}
                </div>
                <button
                  onClick={() => window.open(getKakaoMapWebViewUrl(kakaoWebViewQuery), '_blank')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>{L({ ko: '새 창', zh: '新窗口', en: 'New Tab' })}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
