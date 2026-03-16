import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import { MapPin, Storefront, Bus, ForkKnife, Coffee, Train, Package, Pill, Taxi, FirstAidKit, Bank, Camera, ShoppingBag, Toilet, CurrencyDollar, WifiHigh, AirplaneTakeoff, Sparkle, Hospital, NavigationArrow } from '@phosphor-icons/react'
import { usePopupMap } from '../hooks/usePopupStores'
const PopupReviewForm = lazy(() => import('./PopupReviewForm'))

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const VENUE_FILTERS = [
  { v: 'all',              ko: '전체', zh: '全部', en: 'All', icon: null },
  { v: 'department_store', ko: '백화점', zh: '百货店', en: 'Dept Store', icon: Storefront },
  { v: 'hotplace',         ko: '핫플', zh: '热门地', en: 'Hotplace', icon: Sparkle },
  { v: 'hangang',          ko: '한강', zh: '汉江', en: 'Han River', icon: NavigationArrow },
  { v: 'mall',             ko: '복합몰', zh: '综合商场', en: 'Mall', icon: ShoppingBag },
  { v: 'other',            ko: '기타', zh: '其他', en: 'Other', icon: null },
]

const TYPE_FILTERS = [
  { v: 'all',       ko: '전체', zh: '全部', en: 'All', em: '' },
  { v: 'idol',      ko: '아이돌', zh: '爱豆', en: 'Idol', em: '💜' }, // #49 아이돌 전용
  { v: 'kpop',      ko: 'K-POP', zh: 'K-POP', en: 'K-POP', em: '🎤' },
  { v: 'fashion',   ko: '패션', zh: '时尚', en: 'Fashion', em: '👗' },
  { v: 'beauty',    ko: '뷰티', zh: '美妆', en: 'Beauty', em: '💄' },
  { v: 'character', ko: '캐릭터', zh: '角色', en: 'Character', em: '🧸' },
  { v: 'exhibition',ko: '전시', zh: '展览', en: 'Exhibition', em: '🎨' },
  { v: 'food',      ko: '음식', zh: '美食', en: 'Food', em: '🍽️' },
  { v: 'movie',     ko: '영화', zh: '电影', en: 'Movie', em: '🎬' },
]

// 3.1 퀵 이동 지역 데이터
const QUICK_AREAS = [
  { id: 'seongsu',   label: { ko: '성수', zh: '圣水', en: 'Seongsu' }, lat: 37.5446, lng: 127.0560, zoom: 4 },
  { id: 'hongdae',   label: { ko: '홍대', zh: '弘大', en: 'Hongdae' }, lat: 37.5563, lng: 126.9236, zoom: 4 },
  { id: 'gangnam',   label: { ko: '강남', zh: '江南', en: 'Gangnam' }, lat: 37.4979, lng: 127.0276, zoom: 4 },
  { id: 'myeongdong',label: { ko: '명동', zh: '明洞', en: 'Myeongdong' }, lat: 37.5636, lng: 126.9869, zoom: 4 },
  { id: 'ddp',       label: { ko: 'DDP', zh: 'DDP', en: 'DDP' }, lat: 37.5671, lng: 127.0095, zoom: 4 },
  { id: 'itaewon',   label: { ko: '이태원', zh: '梨泰院', en: 'Itaewon' }, lat: 37.5345, lng: 126.9946, zoom: 4 },
  { id: 'yeouido',   label: { ko: '여의도', zh: '汝矣岛', en: 'Yeouido' }, lat: 37.5219, lng: 126.9245, zoom: 4 },
]

// ─── Magic Pill Selector (토글 드롭다운) ───
function MagicPillSelector({ areas, lang, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState(areas[0])

  const handleSelect = useCallback((area, e) => {
    e.stopPropagation()
    e.preventDefault()
    setSelected(area)
    setExpanded(false)
    onSelect(area)
  }, [onSelect])

  const toggleDropdown = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    setExpanded(v => !v)
  }, [])

  const closeDropdown = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    setExpanded(false)
  }, [])

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        onTouchEnd={(e) => { e.stopPropagation() }}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold text-white"
        style={{
          background: '#1A1A1A',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <MapPin size={14} weight="fill" />
        {L(lang, selected.label)}
        <span className="text-[10px] opacity-60 ml-0.5">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <>
          <div className="fixed inset-0 z-30"
            onClick={closeDropdown}
            onTouchEnd={closeDropdown}
          />
          <div
            className="absolute top-full right-0 mt-1 z-40 bg-white rounded-[14px] py-1 overflow-hidden"
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              minWidth: 140,
              animation: 'pillAppear 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {areas.map((area) => {
              const isCurrent = selected.id === area.id
              return (
                <button
                  key={area.id}
                  onClick={(e) => handleSelect(area, e)}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="w-full px-4 py-2.5 flex items-center gap-2 cursor-pointer select-none active:bg-[#1A1A1A] active:text-white transition-colors duration-100"
                  style={{
                    background: isCurrent ? '#F5F5F5' : 'transparent',
                    color: '#1A1A1A',
                  }}
                >
                  <span className="w-4 flex items-center justify-center">
                    {isCurrent ? <MapPin size={14} weight="duotone" color="#C4725A" /> : null}
                  </span>
                  <span className={`text-[13px] ${isCurrent ? 'font-bold' : 'font-medium'}`}>
                    {L(lang, area.label)}
                  </span>
                  {isCurrent && <span className="text-[10px] text-[#999] ml-auto">현재</span>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// 3.1 레이어 탭 정의
const LAYER_TABS = [
  { id: 'quick',    label: { ko: '주변 찾기', zh: '找附近', en: 'Nearby' }, icon: MapPin },
  { id: 'popup',    label: { ko: '팝업', zh: '快闪店', en: 'Popups' }, icon: Storefront },
  { id: 'citytour', label: { ko: '시티투어', zh: '观光巴士', en: 'City Tour' }, icon: Bus },
]

// 퀵서치 버튼 — 중국 여성 관광객이 가장 많이 찾는 것 (1터치)
const QUICK_SEARCH_PRIMARY = [
  { icon: ForkKnife, label: { ko: '밥', zh: '吃饭', en: 'Food' }, query: '맛집' },
  { icon: Coffee, label: { ko: '카페', zh: '咖啡', en: 'Cafe' }, query: '카페' },
  { icon: Train, label: { ko: '지하철', zh: '地铁', en: 'Subway' }, query: '지하철역' },
  { icon: Package, label: { ko: '편의점', zh: '便利店', en: 'CVS' }, query: '편의점' },
  { icon: Pill, label: { ko: '약국', zh: '药店', en: 'Pharmacy' }, query: '약국' },
  { icon: Taxi, label: { ko: '택시', zh: '出租车', en: 'Taxi' }, query: '택시 승강장' },
]
const QUICK_SEARCH_MORE = [
  { icon: Sparkle, label: { ko: '올리브영', zh: 'Olive Young', en: 'Olive Young' }, query: '올리브영' },
  { icon: Hospital, label: { ko: '병원', zh: '医院', en: 'Hospital' }, query: '병원' },
  { icon: Bank, label: { ko: 'ATM', zh: 'ATM', en: 'ATM' }, query: 'ATM' },
  { icon: Camera, label: { ko: '포토스팟', zh: '打卡地', en: 'Photo Spot' }, query: '포토존' },
  { icon: ShoppingBag, label: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, query: '쇼핑' },
  { icon: Toilet, label: { ko: '화장실', zh: '厕所', en: 'Restroom' }, query: '화장실' },
  { icon: CurrencyDollar, label: { ko: '환전', zh: '换钱', en: 'Exchange' }, query: '환전소' },
  { icon: WifiHigh, label: { ko: '와이파이', zh: 'WiFi', en: 'WiFi' }, query: '무료 와이파이' },
  { icon: AirplaneTakeoff, label: { ko: '공항버스', zh: '机场巴士', en: 'Airport Bus' }, query: '공항버스 정류장' },
]

export default function NearMap({ lang }) {
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const overlaysRef = useRef([])
  const userLocation = useRef(null)
  const [activePopup, setActivePopup] = useState(null)
  const [venueFilter, setVenueFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [cnFilter, setCnFilter] = useState(false)
  const [cityTourActive, setCityTourActive] = useState(false)
  const [busRouteFilter, setBusRouteFilter] = useState('all')
  const busOverlaysRef = useRef([])
  const busPolylinesRef = useRef([])
  const [activeBusStop, setActiveBusStop] = useState(null)
  const [activeLayer, setActiveLayer] = useState('quick') // 기본 레이어: 주변찾기
  const [showMoreQuick, setShowMoreQuick] = useState(false) // 퀵서치 더보기
  const [calendarView, setCalendarView] = useState(null) // #28 null | 'week' | 'month'
  const [showReport, setShowReport] = useState(false) // #33 팝업 제보
  const [showReview, setShowReview] = useState(false) // #34 리뷰 작성
  const [todayOnly, setTodayOnly] = useState(false) // #43 오늘 필터

  const { pins: allPins, loading: pinsLoading } = usePopupMap()

  // 필터 적용 (#43 todayOnly 추가)
  const filteredPins = allPins.filter(p => {
    if (venueFilter !== 'all' && p.venue_type !== venueFilter) return false
    if (typeFilter  !== 'all' && p.popup_type  !== typeFilter)  return false

    if (todayOnly) {
      const today = new Date().toISOString().slice(0, 10)
      if (!(p.period?.start <= today && p.period?.end >= today)) return false
    }
    return true
  })

  // 카카오맵 초기화
  useEffect(() => {
    const loadMap = () => new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) { resolve(); return }
      const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY
      if (!apiKey) { reject(new Error('API 키 없음')); return }
      const script = document.createElement('script')
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false&hl=en`
      script.onload = () => window.kakao.maps.load(resolve)
      script.onerror = reject
      document.head.appendChild(script)
    })

    loadMap().then(() => {
      if (!mapRef.current) return
      const initMap = (lat, lng) => {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(lat, lng),
          level: 5
        })
        mapInstance.current = map
        userLocation.current = { lat, lng }
        // 현재 위치 마커
        const myEl = document.createElement('div')
        myEl.innerHTML = `<div style="width:14px;height:14px;background:#4285F4;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
        new window.kakao.maps.CustomOverlay({ map, position: new window.kakao.maps.LatLng(lat, lng), content: myEl, zIndex: 1 })
        setMapReady(true)
      }
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          p => initMap(p.coords.latitude, p.coords.longitude),
          () => initMap(37.5261, 126.9289)
        )
      } else {
        initMap(37.5261, 126.9289)
      }
    }).catch(() => {})
  }, [])

  // 팝업 마커 — 필터 변경 시 갱신
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return
    overlaysRef.current.forEach(o => o.setMap(null))
    overlaysRef.current = []

    const map = mapInstance.current
    const grouped = {}

    filteredPins.forEach(spot => {
      const key = `${spot.venue_name || 'etc'}`
      if (!grouped[key]) grouped[key] = { lat: spot.lat, lng: spot.lng, name: spot.venue_name, spots: [] }
      grouped[key].spots.push(spot)
    })

    Object.values(grouped).forEach(g => {
      // 장소 그룹 라벨
      const pos = new window.kakao.maps.LatLng(g.lat, g.lng)
      const labelEl = document.createElement('div')
      labelEl.innerHTML = `<div style="background:#111827;color:white;padding:5px 9px;border-radius:18px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer">🏬 ${g.name} · ${g.spots.length}개</div>`
      const labelOverlay = new window.kakao.maps.CustomOverlay({ map, position: pos, content: labelEl, yAnchor: 1.5 })
      overlaysRef.current.push(labelOverlay)

      // 개별 팝업 마커
      g.spots.forEach((spot, i) => {
        const offset = i * 0.0002
        const mPos = new window.kakao.maps.LatLng(spot.lat + offset, spot.lng + offset)
        const el = document.createElement('div')
        el.innerHTML = `
          <div style="background:${spot.color};color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer;border:2px solid white;position:relative">
            ${spot.emoji}

          </div>`
        const overlay = new window.kakao.maps.CustomOverlay({ map, position: mPos, content: el, yAnchor: 1 })
        overlaysRef.current.push(overlay)
        el.addEventListener('click', () => setActivePopup(spot))
      })
    })
  }, [mapReady, filteredPins])

  const searchOnMap = (query) => {
    if (mapReady && mapInstance.current) {
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      const ps = new window.kakao.maps.services.Places()
      const opts = {}
      if (userLocation.current) {
        opts.location = new window.kakao.maps.LatLng(userLocation.current.lat, userLocation.current.lng)
        opts.radius = 1000
        opts.sort = window.kakao.maps.services.SortBy.DISTANCE
      }
      ps.keywordSearch(query, (data, status) => {
        if (status !== window.kakao.maps.services.Status.OK) return
        const bounds = new window.kakao.maps.LatLngBounds()
        data.slice(0, 15).forEach(place => {
          const pos = new window.kakao.maps.LatLng(place.y, place.x)
          markersRef.current.push(new window.kakao.maps.Marker({ map: mapInstance.current, position: pos }))
          bounds.extend(pos)
        })
        mapInstance.current.setBounds(bounds)
      }, opts)
    } else {
      window.open(`https://map.naver.com/p/search/${encodeURIComponent(query)}?lang=zh-Hans`, '_blank')
    }
  }

  // 🚌 시티투어버스 표시
  const showCityTourBus = (routeId = 'all') => {
    if (!mapReady || !mapInstance.current) return
    const map = mapInstance.current

    // 기존 버스 오버레이/폴리라인 제거
    busOverlaysRef.current.forEach(o => o.setMap(null))
    busOverlaysRef.current = []
    busPolylinesRef.current.forEach(p => p.setMap(null))
    busPolylinesRef.current = []
    // 일반 마커도 제거
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    setActiveBusStop(null)

    import('../data/cityTourBusData.js').then(({ CITY_TOUR_ROUTES, CITY_TOUR_STOPS, ROUTE_COLORS }) => {
      const routes = routeId === 'all' ? CITY_TOUR_ROUTES : CITY_TOUR_ROUTES.filter(r => r.id === routeId)
      const stops = routeId === 'all' ? CITY_TOUR_STOPS : CITY_TOUR_STOPS.filter(s => s.route === routeId)

      // 노선별 폴리라인
      routes.forEach(route => {
        const routeStops = CITY_TOUR_STOPS.filter(s => s.route === route.id).sort((a, b) => a.order - b.order)
        if (routeStops.length < 2) return
        const path = routeStops.map(s => new window.kakao.maps.LatLng(s.lat, s.lng))
        // 순환 노선은 시작점으로 닫기
        if (route.hopOnOff) path.push(path[0])
        const polyline = new window.kakao.maps.Polyline({
          path,
          strokeWeight: 4,
          strokeColor: route.color,
          strokeOpacity: 0.7,
          strokeStyle: 'solid',
          map
        })
        busPolylinesRef.current.push(polyline)
      })

      // 정류소 마커 (CustomOverlay)
      stops.forEach(stop => {
        const color = ROUTE_COLORS[stop.route] || '#E53935'
        const isStart = stop.isStart
        const size = isStart ? 38 : 28
        const el = document.createElement('div')
        el.innerHTML = `
          <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:${isStart ? 16 : 11}px;color:white;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer">
            ${isStart ? '🚌' : stop.order}
          </div>`
        const pos = new window.kakao.maps.LatLng(stop.lat, stop.lng)
        const overlay = new window.kakao.maps.CustomOverlay({ map, position: pos, content: el, yAnchor: 0.5 })
        busOverlaysRef.current.push(overlay)

        const routeInfo = CITY_TOUR_ROUTES.find(r => r.id === stop.route)
        el.addEventListener('click', () => {
          map.setCenter(pos)
          map.setLevel(4)
          setActiveBusStop({ ...stop, routeInfo })
          setActivePopup(null)
        })
      })

      // 전체 bounds에 맞추기
      if (stops.length > 0) {
        const bounds = new window.kakao.maps.LatLngBounds()
        stops.forEach(s => bounds.extend(new window.kakao.maps.LatLng(s.lat, s.lng)))
        map.setBounds(bounds, 50)
      }
    })
  }

  // 3.1 퀵 이동 — 해당 지역으로 지도 이동
  const moveToArea = (area) => {
    if (!mapReady || !mapInstance.current) return
    mapInstance.current.setCenter(new window.kakao.maps.LatLng(area.lat, area.lng))
    mapInstance.current.setLevel(area.zoom)
  }

  // 3.1 레이어 전환
  const switchLayer = (layerId) => {
    setActiveLayer(layerId)
    // 다른 레이어로 전환 시 시티투어 정리
    if (layerId !== 'citytour') {
      hideCityTourBus()
    }
    if (layerId === 'citytour') {
      setCityTourActive(true)
      setBusRouteFilter('all')
      showCityTourBus('all')
    }
  }

  // 시티투어 끄기
  const hideCityTourBus = () => {
    busOverlaysRef.current.forEach(o => o.setMap(null))
    busOverlaysRef.current = []
    busPolylinesRef.current.forEach(p => p.setMap(null))
    busPolylinesRef.current = []
    setActiveBusStop(null)
    setCityTourActive(false)
    setBusRouteFilter('all')
  }

  return (
    <div className="px-1 pt-2 pb-4 animate-fade-up">
      {/* ─── 3.1 레이어 탭 + Magic Pill (같은 줄) ─── */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex gap-1 bg-[#F3F4F6] rounded-[10px] p-0.5 flex-1">
          {LAYER_TABS.map(lt => (
            <button key={lt.id} onClick={() => switchLayer(lt.id)}
              className={`flex-1 py-2 rounded-[8px] text-[12px] font-semibold transition-all ${
                activeLayer === lt.id ? 'bg-white text-[#111827]' : 'text-[#888]'
              }`}
              style={activeLayer === lt.id ? { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : {}}>
              {lt.icon && <lt.icon size={14} weight="bold" style={{ display: 'inline', verticalAlign: '-2px', marginRight: 3 }} />}{L(lang, lt.label)}
            </button>
          ))}
        </div>
        <MagicPillSelector
          areas={QUICK_AREAS}
          lang={lang}
          onSelect={(area) => moveToArea(area)}
        />
      </div>

      {/* ─── 퀵서치 레이어 — 1터치로 주변 찾기 ─── */}
      {activeLayer === 'quick' && (
        <div className="mb-2">
          {/* 메인 6개 버튼 — 항상 보임 */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {QUICK_SEARCH_PRIMARY.map(item => (
              <button key={item.query} onClick={() => searchOnMap(item.query)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] bg-white text-left active:scale-95 transition-transform"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <item.icon size={20} weight="duotone" color="#C4725A" />
                <span className="text-[12px] font-semibold text-[#1A1A1A]">{L(lang, item.label)}</span>
              </button>
            ))}
          </div>
          {/* 더보기 토글 */}
          <button onClick={() => setShowMoreQuick(v => !v)}
            className="w-full text-center text-[11px] text-[#9CA3AF] py-1 mb-1">
            {showMoreQuick
              ? L(lang, { ko: '접기 ▲', zh: '收起 ▲', en: 'Less ▲' })
              : L(lang, { ko: '더보기 ▼', zh: '更多 ▼', en: 'More ▼' })}
          </button>
          {showMoreQuick && (
            <div className="grid grid-cols-3 gap-2">
              {QUICK_SEARCH_MORE.map(item => (
                <button key={item.query} onClick={() => searchOnMap(item.query)}
                  className="flex items-center gap-2 px-3 py-2 rounded-[12px] bg-white text-left active:scale-95 transition-transform"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <item.icon size={18} weight="duotone" color="#8B6F5C" />
                  <span className="text-[11px] font-medium text-[#555]">{L(lang, item.label)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 팝업 레이어 필터 ─── */}
      {activeLayer === 'popup' && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1" />
            <span className="text-[10px] text-[#9CA3AF]">
              {pinsLoading ? '...' : `${filteredPins.length} ${L(lang, { ko: '개', zh: '个', en: '' })}`}
            </span>
          </div>

          {/* 장소 유형 필터 */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-1.5" style={{ scrollbarWidth: 'none' }}>
            {VENUE_FILTERS.map(f => (
              <button key={f.v} onClick={() => setVenueFilter(f.v)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-all ${venueFilter === f.v ? 'bg-[#111827] text-white' : 'bg-white text-[#555]'}`}
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {L(lang, f)}
              </button>
            ))}
          </div>

          {/* #32 팝업 유형 필터 + 카테고리별 수 */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {TYPE_FILTERS.map(f => {
              const cnt = f.v === 'all' ? allPins.length : allPins.filter(p => p.popup_type === f.v).length
              return (
                <button key={f.v} onClick={() => setTypeFilter(f.v)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-all ${typeFilter === f.v ? 'bg-[#111827] text-white' : 'bg-white text-[#555]'}`}
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  {f.em} {L(lang, f)} <span className="opacity-60">({cnt})</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── 시티투어 레이어 ─── */}
      {activeLayer === 'citytour' && (
        <div className="mb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {[
              { id: 'all',         label: { ko: '전체노선', zh: '全部路线', en: 'All Routes' }, color: '#374151' },
              { id: 'downtown',    label: { ko: '🔴 도심순환', zh: '🔴 市中心', en: '🔴 Downtown' }, color: '#E53935' },
              { id: 'night',       label: { ko: '🔵 야경', zh: '🔵 夜景', en: '🔵 Night' }, color: '#1E88E5' },
              { id: 'traditional', label: { ko: '🟢 전통문화', zh: '🟢 传统文化', en: '🟢 Traditional' }, color: '#43A047' },
              { id: 'panorama',    label: { ko: '🟠 파노라마', zh: '🟠 全景', en: '🟠 Panorama' }, color: '#FB8C00' },
              { id: 'gangnam',     label: { ko: '🟣 강남', zh: '🟣 江南', en: '🟣 Gangnam' }, color: '#8E24AA' },
            ].map(route => (
              <button key={route.id}
                onClick={() => { setBusRouteFilter(route.id); showCityTourBus(route.id) }}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                  busRouteFilter === route.id ? 'text-white border-transparent' : 'bg-white text-[#666] border-[#E5E7EB]'
                }`}
                style={busRouteFilter === route.id ? { backgroundColor: route.color, borderColor: route.color } : {}}>
                {L(lang, route.label)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 카카오맵 */}
      <div className="rounded-[16px] overflow-hidden relative" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: 400 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F3F4F6]">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#C4725A] rounded-full" />
          </div>
        )}

        {/* 팝업 핀 수 배지 */}
        {mapReady && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-bold text-[#111827]"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            📌 {pinsLoading ? '...' : filteredPins.length}개
          </div>
        )}

        {/* 🚌 버스 정류소 정보 카드 */}
        {activeBusStop && (
          <div className="absolute bottom-3 left-3 right-3 z-10 bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: activeBusStop.routeInfo?.color || '#E53935' }}>
                  {activeBusStop.isStart ? '🚌' : activeBusStop.order}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#111827] truncate">{L(lang, activeBusStop.name)}</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                    {L(lang, activeBusStop.routeInfo?.name)} · #{activeBusStop.order}
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">📍 {L(lang, activeBusStop.landmark)}</p>
                </div>
              </div>
              <button onClick={() => setActiveBusStop(null)} className="text-[#9CA3AF] text-lg leading-none ml-2 shrink-0">✕</button>
            </div>
            <div className="mt-3 flex gap-2 text-[10px]">
              <span className="px-2 py-1 rounded-full bg-[#F3F4F6] text-[#555]">🕐 {L(lang, activeBusStop.routeInfo?.hours)}</span>
              <span className="px-2 py-1 rounded-full bg-[#F3F4F6] text-[#555]">⏱ {L(lang, activeBusStop.routeInfo?.interval)}</span>
              <span className="px-2 py-1 rounded-full bg-[#F3F4F6] text-[#555]">💰 ₩{activeBusStop.routeInfo?.price?.adult?.toLocaleString()}</span>
            </div>
            {activeBusStop.routeInfo?.hopOnOff && (
              <p className="mt-2 text-[10px] text-[#16A34A] font-semibold">
                ✅ Hop-On Hop-Off — {L(lang, { ko: '자유 승하차', zh: '随上随下', en: 'Get on/off freely' })}
              </p>
            )}
          </div>
        )}

        {/* 3.3 팝업 상세 바텀시트 */}
        {activePopup && (
          <div className="morph-enter absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-[20px] overflow-y-auto" style={{ maxHeight: '60%', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}>
            {/* 드래그 핸들 */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#D1D5DB]" />
            </div>

            <div className="px-4 pb-4">
              {/* 헤더: 이모지 + 제목 + 닫기 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-3xl shrink-0">{activePopup.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[#111827] leading-tight">{L(lang, activePopup.title)}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      {activePopup.venue_name} · {activePopup.period?.start?.slice(5).replace('-','/')}~{activePopup.period?.end?.slice(5).replace('-','/')}
                    </p>
                  </div>
                </div>
                <button onClick={() => setActivePopup(null)} className="text-[#9CA3AF] text-xl leading-none ml-2 shrink-0 p-1">✕</button>
              </div>

              {/* D-day + cn_score 뱃지 (#27) */}
              {(() => {
                const cnScore = Math.min(10, (
                  (activePopup.chinese_staff ? 4 : 0) + (activePopup.tax_refund ? 1 : 0) +
                  (activePopup.entry_type !== 'paid' ? 0.5 : 0)
                ))
                const scoreColor = cnScore >= 6 ? '#16A34A' : cnScore >= 3 ? '#EA580C' : '#9CA3AF'
                const scoreBg = cnScore >= 6 ? '#F0FDF4' : cnScore >= 3 ? '#FFF7ED' : '#F3F4F6'
                return (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {/* cn_score 뱃지 */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: scoreBg, color: scoreColor }}>
                      🇨🇳 {cnScore.toFixed(1)}/10
                    </span>
                    {activePopup.isClosingSoon && <span className="text-[10px] bg-[#FEF2F2] text-[#DC2626] px-2 py-0.5 rounded-full font-bold">🔥 D-{activePopup.daysLeft}</span>}

                    {activePopup.chinese_staff     && <span className="text-[10px] bg-[#FFF7ED] text-[#EA580C] px-2 py-0.5 rounded-full">🗣️ {L(lang, { ko: '중문', zh: '中文', en: 'CN' })}</span>}
                    {activePopup.tax_refund        && <span className="text-[10px] bg-[#F0FDF4] text-[#16A34A] px-2 py-0.5 rounded-full">💰 {L(lang, { ko: '환급', zh: '退税', en: 'Refund' })}</span>}
                    {activePopup.entry_type !== 'paid' && <span className="text-[10px] bg-[#F3F4F6] text-[#555] px-2 py-0.5 rounded-full">{L(lang, { ko: '무료', zh: '免费', en: 'Free' })}</span>}
                  </div>
                )
              })()}

              {/* 📋 체크리스트 — 전항목 (#26) */}
              <div className="bg-[#F9FAFB] rounded-[12px] p-3 mb-3">
                <p className="text-[11px] font-bold text-[#374151] mb-2">📋 {L(lang, { ko: '체크리스트', zh: '清单', en: 'Checklist' })}</p>
                <div className="space-y-1.5 text-[11px] text-[#555]">

                  {/* 중국어 서비스 */}
                  <div className="flex items-center gap-2">
                    <span>🗣️</span>
                    <span>{L(lang, { ko: '중국어', zh: '中文服务', en: 'Chinese' })}: {activePopup.chinese_staff
                      ? L(lang, { ko: '직원 가능 ✅', zh: '有中文员工 ✅', en: 'Staff available ✅' })
                      : L(lang, { ko: '없음 (번역앱 추천)', zh: '无 (建议用翻译APP)', en: 'None (use translator)' })}</span>
                  </div>
                  {/* 입장 */}
                  <div className="flex items-center gap-2">
                    <span>🎫</span>
                    <span>{L(lang, { ko: '입장', zh: '入场', en: 'Entry' })}: {
                      activePopup.entry_type === 'paid'
                        ? L(lang, { ko: '유료 💰', zh: '收费 💰', en: 'Paid 💰' })
                        : activePopup.reservation_url
                          ? L(lang, { ko: '무료 (예약 필요)', zh: '免费 (需预约)', en: 'Free (reservation required)' })
                          : L(lang, { ko: '무료 입장 ✅', zh: '免费入场 ✅', en: 'Free entry ✅' })
                    }</span>
                  </div>
                  {/* 영업시간 */}
                  {(activePopup.open_time || activePopup.close_time) && (
                    <div className="flex items-center gap-2">
                      <span>⏰</span>
                      <span>{activePopup.open_time || '10:00'} ~ {activePopup.close_time || '20:00'}</span>
                    </div>
                  )}
                  {/* 기간 */}
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{activePopup.period?.start?.slice(5).replace('-','/')} ~ {activePopup.period?.end?.slice(5).replace('-','/')}
                      {activePopup.daysLeft != null && <span className="ml-1 text-[#DC2626] font-bold">({L(lang, { ko: `D-${activePopup.daysLeft}`, zh: `还剩${activePopup.daysLeft}天`, en: `${activePopup.daysLeft}d left` })})</span>}
                    </span>
                  </div>
                  {/* 위치 / 층 */}
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{activePopup.venue_name}{activePopup.floor ? ` · ${L(lang, activePopup.floor)}` : ''}</span>
                  </div>
                  {/* 주소 */}
                  {activePopup.address && (
                    <div className="flex items-center gap-2">
                      <span>🏠</span>
                      <span className="text-[#9CA3AF]">{L(lang, activePopup.address)}</span>
                    </div>
                  )}
                  {/* 세금환급 */}
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>{L(lang, { ko: '세금환급', zh: '退税', en: 'Tax Refund' })}: {activePopup.tax_refund
                      ? L(lang, { ko: '가능 ✅', zh: '可退税 ✅', en: 'Available ✅' })
                      : L(lang, { ko: '불가', zh: '不可退税', en: 'Not available' })}</span>
                  </div>
                  {/* 대기 정보 */}
                  {activePopup.queue_info_zh && (
                    <div className="flex items-center gap-2">
                      <span>⏳</span>
                      <span>{activePopup.queue_info_zh}</span>
                    </div>
                  )}
                  {/* 예약 링크 */}
                  {activePopup.reservation_url && (
                    <div className="flex items-center gap-2">
                      <span>🔗</span>
                      <a href={activePopup.reservation_url} target="_blank" rel="noreferrer" className="text-[#4F46E5] underline">
                        {L(lang, { ko: '예약하기', zh: '立即预约', en: 'Reserve Now' })}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* #39 크라우드소싱 대기시간 */}
              {(() => {
                const reviews = JSON.parse(localStorage.getItem('hp_popup_reviews') || '[]')
                const recent = reviews.filter(r => r.popupId === activePopup.id && Date.now() - r.ts < 24*60*60*1000)
                if (recent.length === 0) return null
                const crowdMap = { low: { emoji: '😌', label: { ko: '한산', zh: '很空', en: 'Quiet' } }, medium: { emoji: '🙂', label: { ko: '보통', zh: '一般', en: 'Normal' } }, high: { emoji: '😅', label: { ko: '붐빔', zh: '很挤', en: 'Busy' } }, packed: { emoji: '🥵', label: { ko: '줄섰음', zh: '排队', en: 'Packed' } } }
                const latest = recent[recent.length - 1]
                const info = crowdMap[latest.crowd_level]
                if (!info) return null
                const ago = Math.floor((Date.now() - latest.ts) / (60*1000))
                return (
                  <div className="bg-[#FFFBEB] rounded-[10px] px-3 py-2 mb-3 flex items-center gap-2">
                    <span className="text-lg">{info.emoji}</span>
                    <div>
                      <p className="text-[11px] font-bold text-[#92400E]">{L(lang, { ko: '현재 혼잡도', zh: '当前拥挤度', en: 'Current Crowd' })}: {L(lang, info.label)}</p>
                      <p className="text-[9px] text-[#B45309]">{ago < 60 ? `${ago}${L(lang, { ko: '분 전 제보', zh: '分钟前', en: 'min ago' })}` : `${Math.floor(ago/60)}${L(lang, { ko: '시간 전', zh: '小时前', en: 'h ago' })}`} · {recent.length}{L(lang, { ko: '명 제보', zh: '人反馈', en: ' reports' })}</p>
                    </div>
                  </div>
                )
              })()}

              {/* CTA 버튼들 + #34 리뷰 */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const q = activePopup.venue_name || L(lang, activePopup.title)
                    window.open(`https://map.kakao.com/link/search/${encodeURIComponent(q)}`, '_blank')
                  }}
                  className="flex-1 py-2.5 rounded-[10px] text-[12px] font-bold text-[#1A1A1A] active:scale-95 transition-transform"
                  style={{ backgroundColor: '#FEE500' }}>
                  🗺 {L(lang, { ko: '길찾기', zh: '导航', en: 'Navigate' })}
                </button>
                <button onClick={() => setShowReview(true)}
                  className="py-2.5 px-4 rounded-[10px] text-[12px] font-bold text-white active:scale-95 transition-transform"
                  style={{ backgroundColor: '#C4725A' }}>
                  ⭐ {L(lang, { ko: '리뷰', zh: '评价', en: 'Review' })}
                </button>
                <button
                  onClick={() => {
                    // #36 팝업 공유 카드 (위챗/XHS/기본)
                    const title = L(lang, activePopup.title)
                    const venue = activePopup.venue_name || ''
                    const period = `${activePopup.period?.start?.slice(5).replace('-','/')}~${activePopup.period?.end?.slice(5).replace('-','/')}`
                    const badges = [
                      activePopup.chinese_staff && '中文服务✅',
                      activePopup.tax_refund && '退税✅',
                    ].filter(Boolean).join(' ')
                    const shareText = `📍 ${title}\n🏬 ${venue}\n📅 ${period}\n${badges}\n\n#首尔快闪 #韩国旅游 #NEAR`
                    if (navigator.share) {
                      navigator.share({ title, text: shareText })
                    } else {
                      navigator.clipboard?.writeText(shareText)
                      alert(L(lang, { ko: '클립보드에 복사되었습니다!', zh: '已复制到剪贴板！', en: 'Copied to clipboard!' }))
                    }
                  }}
                  className="py-2.5 px-3 rounded-[10px] text-[12px] font-bold text-[#555] border border-[#E5E7EB] active:scale-95 transition-transform">
                  📤
                </button>
              </div>

              {/* 小红书 링크 */}
              {activePopup.source_xhs && (
                <a href={activePopup.source_xhs} target="_blank" rel="noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 bg-[#FEF2F2] text-[#DC2626] text-[12px] font-semibold py-2 rounded-xl active:scale-95 transition-transform">
                  📕 {L(lang, { ko: '小红书 후기', zh: '小红书攻略', en: 'Xiaohongshu Reviews' })}
                </a>
              )}

              {/* #42 방문 인증 스탬프 */}
              {(() => {
                const stamps = JSON.parse(localStorage.getItem('hp_popup_stamps') || '[]')
                const visited = stamps.includes(activePopup.id)
                return (
                  <button onClick={() => {
                    if (visited) return
                    const prev = JSON.parse(localStorage.getItem('hp_popup_stamps') || '[]')
                    localStorage.setItem('hp_popup_stamps', JSON.stringify([...prev, activePopup.id]))
                    alert(L(lang, { ko: '🎉 방문 인증 완료! 스탬프 획득!', zh: '🎉 打卡成功！获得印章！', en: '🎉 Checked in! Stamp earned!' }))
                  }}
                    className={`w-full py-2.5 rounded-[10px] text-[12px] font-bold mb-3 active:scale-95 transition-transform ${
                      visited ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#F3F4F6] text-[#555]'}`}>
                    {visited
                      ? `✅ ${L(lang, { ko: '방문 완료', zh: '已打卡', en: 'Visited' })}`
                      : `📍 ${L(lang, { ko: '방문 인증하기', zh: '打卡', en: 'Check In' })}`}
                  </button>
                )
              })()}

              {/* #38 주변 맛집/카페 추천 */}
              {activePopup.lat && activePopup.lng && (
                <div className="mt-3 flex gap-2">
                  <a href={`https://map.kakao.com/link/search/${encodeURIComponent('맛집')}?q=${activePopup.lat},${activePopup.lng}`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 py-2 rounded-[10px] bg-[#FFF7ED] text-[11px] font-semibold text-[#EA580C] text-center active:scale-95 transition-transform">
                    🍜 {L(lang, { ko: '주변 맛집', zh: '附近美食', en: 'Nearby Food' })}
                  </a>
                  <a href={`https://map.kakao.com/link/search/${encodeURIComponent('카페')}?q=${activePopup.lat},${activePopup.lng}`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 py-2 rounded-[10px] bg-[#FDF4FF] text-[11px] font-semibold text-[#9333EA] text-center active:scale-95 transition-transform">
                    ☕ {L(lang, { ko: '주변 카페', zh: '附近咖啡', en: 'Nearby Cafe' })}
                  </a>
                </div>
              )}

              {/* #37 비슷한 팝업 추천 */}
              {(() => {
                const similar = allPins
                  .filter(p => p.id !== activePopup.id && (p.popup_type === activePopup.popup_type || p.district === activePopup.district))
                  .slice(0, 3)
                if (similar.length === 0) return null
                return (
                  <div className="mt-4">
                    <p className="text-[11px] font-bold text-[#374151] mb-2">💡 {L(lang, { ko: '이것도 좋아할 거예요', zh: '你可能还喜欢', en: 'You might also like' })}</p>
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {similar.map(s => (
                        <button key={s.id} onClick={() => setActivePopup(s)}
                          className="flex-shrink-0 w-[120px] rounded-[10px] bg-[#F9FAFB] p-2.5 text-left active:scale-95 transition-transform">
                          <span className="text-lg">{s.emoji}</span>
                          <p className="text-[11px] font-semibold text-[#111827] truncate mt-1">{L(lang, s.title)}</p>
                          <p className="text-[9px] text-[#9CA3AF] truncate mt-0.5">{s.venue_name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </div>

      {/* #28 캘린더 뷰 토글 + 팝업 리스트 */}
      {filteredPins.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="typo-whisper">
              {L(lang, { ko: '현재 진행 중인 팝업', zh: '正在进行的快闪店', en: 'Active Popups' })}
              <span className="ml-1 text-[#9CA3AF]">({filteredPins.length})</span>
            </p>
            <div className="flex gap-1">
              {/* #43 오늘 필터 */}
              <button onClick={() => setTodayOnly(!todayOnly)}
                className="text-[10px] px-2 py-0.5 rounded-full transition-colors"
                style={{ background: todayOnly ? '#DC2626' : '#F3F4F6', color: todayOnly ? '#FFF' : '#6B7280' }}>
                🔥 {L(lang, { ko: '오늘', zh: '今天', en: 'Today' })}
              </button>
              {[
                { id: null,    label: '☰' },
                { id: 'week',  label: { ko: '주', zh: '周', en: 'W' } },
                { id: 'month', label: { ko: '달', zh: '月', en: 'M' } },
              ].map(v => (
                <button key={String(v.id)}
                  onClick={() => setCalendarView(v.id)}
                  className="text-[10px] px-2 py-0.5 rounded-full transition-colors"
                  style={{ background: calendarView === v.id ? '#111827' : '#F3F4F6', color: calendarView === v.id ? '#FFF' : '#6B7280' }}>
                  {typeof v.label === 'string' ? v.label : L(lang, v.label)}
                </button>
              ))}
            </div>
          </div>

          {/* #28 캘린더 뷰 */}
          {calendarView && (() => {
            const today = new Date()
            const days = []
            if (calendarView === 'week') {
              const start = new Date(today); start.setDate(today.getDate() - today.getDay())
              for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d) }
            } else {
              const y = today.getFullYear(), m = today.getMonth()
              const daysInMonth = new Date(y, m + 1, 0).getDate()
              for (let i = 1; i <= daysInMonth; i++) days.push(new Date(y, m, i))
            }
            const fmt = d => d.toISOString().slice(0, 10)
            const dayNames = lang === 'zh' ? ['日','一','二','三','四','五','六'] : lang === 'en' ? ['S','M','T','W','T','F','S'] : ['일','월','화','수','목','금','토']
            return (
              <div className="bg-white rounded-[12px] p-3 mb-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p className="text-[11px] font-bold text-[#374151] mb-2">
                  📅 {calendarView === 'week'
                    ? L(lang, { ko: '이번 주 팝업', zh: '本周快闪', en: 'This Week' })
                    : L(lang, { ko: `${today.getMonth()+1}월 팝업`, zh: `${today.getMonth()+1}月快闪`, en: `${today.toLocaleString('en',{month:'short'})} Popups` })}
                </p>
                <div className={calendarView === 'week' ? 'grid grid-cols-7 gap-1' : 'grid grid-cols-7 gap-1'}>
                  {calendarView === 'month' && dayNames.map(d => (
                    <span key={d} className="text-[9px] text-[#9CA3AF] text-center">{d}</span>
                  ))}
                  {calendarView === 'month' && Array(new Date(today.getFullYear(), today.getMonth(), 1).getDay()).fill(null).map((_, i) => (
                    <span key={`pad-${i}`} />
                  ))}
                  {days.map(d => {
                    const ds = fmt(d)
                    const count = filteredPins.filter(p => p.period?.start <= ds && p.period?.end >= ds).length
                    const isToday = fmt(d) === fmt(today)
                    return (
                      <div key={ds} className="flex flex-col items-center py-1 rounded-lg" style={{ background: isToday ? '#111827' : 'transparent' }}>
                        {calendarView === 'week' && <span className="text-[9px]" style={{ color: isToday ? '#FFF' : '#9CA3AF' }}>{dayNames[d.getDay()]}</span>}
                        <span className="text-[11px] font-medium" style={{ color: isToday ? '#FFF' : '#374151' }}>{d.getDate()}</span>
                        {count > 0 && <span className="text-[8px] font-bold" style={{ color: isToday ? '#FEE500' : '#C4725A' }}>{count}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}
          <div className="flex flex-col gap-2">
            {/* #29 마감 임박 먼저 정렬 */}
            {[...filteredPins].sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999)).map(spot => (
              <button key={spot.id}
                onClick={() => {
                  setActivePopup(spot)
                  if (mapInstance.current) {
                    mapInstance.current.setCenter(new window.kakao.maps.LatLng(spot.lat, spot.lng))
                    mapInstance.current.setLevel(3)
                  }
                }}
                className="flex items-center gap-3 rounded-[12px] px-4 py-3 text-left active:scale-[0.98] transition-transform"
                style={{
                  boxShadow: spot.isClosingSoon ? '0 0 0 1.5px #DC2626, 0 2px 8px rgba(220,38,38,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
                  background: spot.isClosingSoon ? '#FFFBFB' : '#FFF',
                }}>
                <span className="text-xl shrink-0">{spot.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-semibold text-[#111827] truncate">{L(lang, spot.title)}</p>
                    {spot.isClosingSoon && (
                      <span className="text-[10px] bg-[#DC2626] text-white px-1.5 py-0.5 rounded-full font-bold shrink-0 animate-pulse">
                        🔥 D-{spot.daysLeft}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] text-[#9CA3AF] truncate">{spot.venue_name} · ~{spot.period?.end?.slice(5).replace('-','/')}</p>
                  </div>
                  <div className="flex gap-1 mt-1">

                    {spot.payment_wechatpay && <span className="text-[9px] bg-[#F0FDF4] text-[#16A34A] px-1 py-0.5 rounded">微信</span>}
                    {spot.chinese_staff     && <span className="text-[9px] bg-[#FFF7ED] text-[#EA580C] px-1 py-0.5 rounded">中文</span>}
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: spot.color }} />
              </button>
            ))}
          </div>

          {/* #46 방문 통계 */}
          {(() => {
            const stamps = JSON.parse(localStorage.getItem('hp_popup_stamps') || '[]')
            if (stamps.length === 0) return null
            return (
              <div className="mt-3 bg-[#F0FDF4] rounded-[10px] px-3 py-2 flex items-center gap-2">
                <span className="text-lg">🏆</span>
                <p className="text-[11px] text-[#16A34A] font-medium">
                  {L(lang, { ko: `내가 방문한 팝업 ${stamps.length}개`, zh: `我打卡了 ${stamps.length} 个快闪`, en: `${stamps.length} popups visited` })}
                </p>
              </div>
            )
          })()}

          {/* #50 Coming Soon 카운트다운 */}
          {(() => {
            const today = new Date().toISOString().slice(0, 10)
            const upcoming = allPins.filter(p => p.period?.start > today).sort((a, b) => a.period.start.localeCompare(b.period.start)).slice(0, 3)
            if (upcoming.length === 0) return null
            return (
              <div className="mt-3">
                <p className="text-[11px] font-bold text-[#374151] mb-1.5">⏳ {L(lang, { ko: '오픈 예정', zh: '即将开幕', en: 'Coming Soon' })}</p>
                <div className="flex flex-col gap-1.5">
                  {upcoming.map(p => {
                    const daysUntil = Math.ceil((new Date(p.period.start) - new Date()) / (1000*60*60*24))
                    return (
                      <div key={p.id} className="flex items-center gap-2 bg-[#F9FAFB] rounded-[8px] px-3 py-2">
                        <span>{p.emoji}</span>
                        <p className="text-[11px] text-[#111827] flex-1 truncate">{L(lang, p.title)}</p>
                        <span className="text-[10px] font-bold text-[#C4725A]">D-{daysUntil}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* #33 팝업 제보 버튼 */}
          <button onClick={() => setShowReport(true)}
            className="mt-3 w-full py-3 rounded-[12px] border-2 border-dashed border-[#D1D5DB] text-[12px] text-[#9CA3AF] font-medium active:scale-95 transition-transform">
            ✏️ {L(lang, { ko: '이런 팝업 있어요! 제보하기', zh: '我知道一个快闪店！提交线索', en: 'Know a popup? Submit a tip!' })}
          </button>
        </div>
      )}

      {/* #34-35 리뷰 작성 모달 */}
      {showReview && activePopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowReview(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-[480px] max-h-[85vh] overflow-y-auto bg-white rounded-t-[20px]" onClick={e => e.stopPropagation()}>
            <Suspense fallback={<div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#C4725A] rounded-full mx-auto" /></div>}>
              <PopupReviewForm
                popup={activePopup}
                lang={lang === 'zh' ? 'cn' : lang}
                onSubmit={async (reviewData) => {
                  // #35 체크리스트 태그를 자동으로 팝업 데이터에 반영 (localStorage)
                  const reports = JSON.parse(localStorage.getItem('hp_popup_checklist_reports') || '{}')
                  reports[activePopup.id] = { ...reports[activePopup.id], tags: reviewData.tags, crowd: reviewData.crowd_level, ts: Date.now() }
                  localStorage.setItem('hp_popup_checklist_reports', JSON.stringify(reports))
                  // 리뷰 저장
                  const reviews = JSON.parse(localStorage.getItem('hp_popup_reviews') || '[]')
                  reviews.push({ popupId: activePopup.id, ...reviewData, ts: Date.now() })
                  localStorage.setItem('hp_popup_reviews', JSON.stringify(reviews))
                  return { success: true, reward: { tier: reviewData.photos?.length > 0 ? 'premium' : 'mini', points: reviewData.photos?.length > 0 ? 300 : 50 } }
                }}
                onClose={() => setShowReview(false)}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* #33 팝업 제보 시트 */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowReport(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-[480px] bg-white rounded-t-[20px] p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-3"><div className="w-10 h-1 rounded-full bg-[#D1D5DB]" /></div>
            <p className="text-[15px] font-bold text-[#1A1A1A] mb-3">✏️ {L(lang, { ko: '팝업 제보', zh: '提交快闪线索', en: 'Submit Popup Tip' })}</p>
            <form onSubmit={e => {
              e.preventDefault()
              const fd = new FormData(e.target)
              const data = { name: fd.get('name'), location: fd.get('location'), link: fd.get('link'), ts: Date.now() }
              const prev = JSON.parse(localStorage.getItem('hp_popup_reports') || '[]')
              localStorage.setItem('hp_popup_reports', JSON.stringify([...prev, data]))
              setShowReport(false)
              alert(L(lang, { ko: '감사합니다! 제보가 접수되었습니다 🎉', zh: '谢谢！线索已提交 🎉', en: 'Thanks! Your tip has been submitted 🎉' }))
            }}>
              <input name="name" required placeholder={L(lang, { ko: '팝업 이름 / 브랜드', zh: '快闪店名称/品牌', en: 'Popup name / brand' })}
                className="w-full mb-2 px-3 py-2.5 rounded-[10px] bg-[#F3F4F6] text-[13px] outline-none" />
              <input name="location" placeholder={L(lang, { ko: '위치 (예: 성수 카페거리)', zh: '位置 (如：圣水咖啡街)', en: 'Location (e.g. Seongsu)' })}
                className="w-full mb-2 px-3 py-2.5 rounded-[10px] bg-[#F3F4F6] text-[13px] outline-none" />
              <input name="link" placeholder={L(lang, { ko: '小红书/인스타 링크 (선택)', zh: '小红书/Instagram链接 (可选)', en: 'XHS/Instagram link (optional)' })}
                className="w-full mb-4 px-3 py-2.5 rounded-[10px] bg-[#F3F4F6] text-[13px] outline-none" />
              <button type="submit" className="w-full py-3 rounded-[12px] bg-[#111827] text-white text-[13px] font-bold active:scale-95 transition-transform">
                {L(lang, { ko: '제보하기', zh: '提交', en: 'Submit' })}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
