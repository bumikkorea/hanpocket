import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, MagnifyingGlass, ArrowLeft } from '@phosphor-icons/react'
import { Search, Navigation, Car, Calendar, Heart } from 'lucide-react'
import { useNearPins } from '../hooks/usePopupStores'
import TaxiCardView from './TaxiCardView.jsx'
import { CATEGORY_CONFIG } from '../data/poiData'
import { COURSE_DATA } from '../data/courseData.js'
import { supabase } from '../lib/supabase'
import { t } from '../locales/index.js'
import NavScreen from './NavScreen.jsx'

const IS_DEV = import.meta.env.DEV

// ─── 카테고리 칩 ───
const CATEGORY_CHIPS = [
  { id: 'popup',   key: 'cat_popup'   },
  { id: 'food',    key: 'cat_food'    },
  { id: 'fashion', key: 'cat_fashion' },
  { id: 'cafe',    key: 'cat_cafe'    },
  { id: 'utility', key: 'cat_utility' },
]

// ─── 지역 빠른 이동 ───
const QUICK_AREAS = [
  { id: 'seongsu',    key: 'area_seongsu',    lat: 37.5446, lng: 127.0560, zoom: 4 },
  { id: 'hongdae',    key: 'area_hongdae',    lat: 37.5563, lng: 126.9236, zoom: 4 },
  { id: 'gangnam',    key: 'area_gangnam',    lat: 37.4979, lng: 127.0276, zoom: 4 },
  { id: 'myeongdong', key: 'area_myeongdong', lat: 37.5636, lng: 126.9869, zoom: 4 },
  { id: 'ddp',        key: 'area_ddp',        lat: 37.5671, lng: 127.0095, zoom: 4 },
  { id: 'itaewon',    key: 'area_itaewon',    lat: 37.5345, lng: 126.9946, zoom: 4 },
  { id: 'yeouido',    key: 'area_yeouido',    lat: 37.5219, lng: 126.9245, zoom: 4 },
]

// ─── 영업 상태 판단 ───
function getBusinessStatus(poi) {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  if (poi.is_temporary) {
    if (poi.start_date && today < poi.start_date) return 'coming'
    if (poi.end_date && today > poi.end_date) return 'ended'
  }
  if (!poi.open_time || !poi.close_time) return null
  const [oh, om] = poi.open_time.split(':').map(Number)
  const [ch, cm] = poi.close_time.split(':').map(Number)
  const nowMins = now.getHours() * 60 + now.getMinutes()
  return nowMins >= oh * 60 + om && nowMins < ch * 60 + cm ? 'open' : 'closed'
}

// ─── POI 태그 계산 ───
function calcTags(poi, bilingual) {
  const tags = []
  const daysLeft = poi.end_date
    ? Math.ceil((new Date(poi.end_date) - new Date()) / 86400000)
    : null
  if (daysLeft !== null && daysLeft <= 14 && daysLeft >= 0)
    tags.push({ label: `D-${daysLeft} ${t('tag_closing', bilingual)}`, bg: '#FEF2F2', color: '#DC2626' })
  if (poi.tags?.includes('limited'))
    tags.push({ label: t('tag_limited', bilingual), bg: '#EFF6FF', color: '#2563EB' })
  if (poi.tags?.includes('free'))
    tags.push({ label: t('tag_free', bilingual), bg: '#F0FDF4', color: '#16A34A' })
  if (poi.has_reservation)
    tags.push({ label: t('tag_reservation', bilingual), bg: '#FFFBEB', color: '#D97706' })
  if ((poi.view_count_7d || 0) > 1000)
    tags.push({ label: t('tag_popular', bilingual), bg: '#F5F3FF', color: '#7C3AED' })
  return tags
}

function isNewPoi(createdAt) {
  if (!createdAt) return false
  return (Date.now() - new Date(createdAt).getTime()) < 3 * 24 * 60 * 60 * 1000
}

function getPinsInBounds(pins, map) {
  if (!map) return pins
  try {
    const bounds = map.getBounds()
    return pins.filter(p => bounds.contain(new window.kakao.maps.LatLng(p.lat, p.lng)))
  } catch { return pins }
}

// ─── 거리 라벨 ───
function distLabel(poi) {
  if (poi.distance == null) return ''
  return poi.distance < 1000
    ? `${Math.round(poi.distance)}m`
    : `${(poi.distance / 1000).toFixed(1)}km`
}

// ─── 태그 필 ───
function TagPill({ label, bg, color }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 10, fontWeight: 700,
      background: bg, color, borderRadius: 100,
      padding: '2px 7px', lineHeight: '16px', flexShrink: 0,
    }}>
      {label}
    </span>
  )
}

// ─── 카테고리별 SVG 아이콘 경로 (lucide 스타일) ───
const PIN_ICONS = {
  popup:   `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  food:    `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 2v20" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v-4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  fashion: `<circle cx="6" cy="6" r="3" fill="none" stroke="white" stroke-width="2"/><circle cx="6" cy="18" r="3" fill="none" stroke="white" stroke-width="2"/><line x1="20" y1="4" x2="8.12" y2="15.88" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="14.47" y1="14.48" x2="20" y2="20" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="8.12" y1="8.12" x2="12" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  cafe:    `<path d="M17 8h1a4 4 0 1 1 0 8h-1" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="2" x2="6" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="2" x2="10" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="2" x2="14" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  utility: `<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 22v-4a3 3 0 0 0-6 0v4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.25 13h19.5" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
}

// ─── 원형 핀 HTML (40px circle + triangle tail + SVG icon) ───
function buildPinHTML(category, isNew, poiId) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.popup
  const iconPaths = PIN_ICONS[category] || PIN_ICONS.popup
  const newBadge = isNew
    ? `<div style="position:absolute;top:-2px;right:-2px;background:#FF3141;border-radius:50%;width:10px;height:10px;border:1.5px solid white;"></div>`
    : ''
  return `
    <div data-poi="${poiId}" style="transition:transform 200ms ease,opacity 200ms ease;display:inline-block">
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:40px;height:40px;
          background:${cfg.color};
          border-radius:50%;
          border:2.5px solid white;
          box-shadow:0 1px 3px rgba(0,0,0,0.12);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;position:relative;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">${iconPaths}</svg>
          ${newBadge}
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${cfg.color};margin-top:-1px;"></div>
      </div>
    </div>
  `
}

// ─── 코스 번호 핀 HTML ───
function buildCoursePinHTML(number, color, poiId) {
  return `
    <div data-poi="${poiId}" style="transition:transform 200ms ease,opacity 200ms ease;display:inline-block">
      <div style="
        width:30px;height:30px;
        background:${color};
        border-radius:50%;
        border:2.5px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;color:white;font-size:13px;font-weight:700;
      ">${number}</div>
    </div>
  `
}

// ─── Magic Pill 지역 셀렉터 ───
function MagicPillSelector({ areas, bilingual, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState(areas[0])

  const handleSelect = useCallback((area, e) => {
    e.stopPropagation(); e.preventDefault()
    setSelected(area); setExpanded(false); onSelect(area)
  }, [onSelect])

  const toggleDropdown = useCallback((e) => {
    e.stopPropagation(); e.preventDefault()
    setExpanded(v => !v)
  }, [])

  const closeDropdown = useCallback((e) => {
    e.stopPropagation(); e.preventDefault()
    setExpanded(false)
  }, [])

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        onTouchEnd={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold text-white"
        style={{ background: '#1A1A1A', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
      >
        <MapPin size={14} weight="fill" />
        {t(selected.key, bilingual)}
        <span className="text-[10px] opacity-60 ml-0.5">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <>
          <div className="fixed inset-0 z-30" onClick={closeDropdown} onTouchEnd={closeDropdown} />
          <div
            className="absolute top-full right-0 mt-1 z-40 bg-white rounded-[14px] py-1 overflow-hidden"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: 140 }}
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
                  style={{ background: isCurrent ? '#F5F5F5' : 'transparent', color: '#1A1A1A' }}
                >
                  <span className="w-4 flex items-center justify-center">
                    {isCurrent ? <MapPin size={14} weight="duotone" color="#C4725A" /> : null}
                  </span>
                  <span className={`text-[13px] ${isCurrent ? 'font-bold' : 'font-medium'}`}>
                    {t(area.key, bilingual)}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] text-[#999] ml-auto">
                      {t('area_current', bilingual)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── 개발 전용 bilingual 토글 ───
function DevBilingualToggle({ active, onToggle }) {
  if (!IS_DEV) return null
  return (
    <button
      onClick={onToggle}
      title={active ? 'bilingual ON — 병기 표시 중' : 'bilingual OFF'}
      style={{
        position: 'absolute', top: 70, right: 16, zIndex: 15,
        width: 32, height: 32, borderRadius: 8,
        background: active ? '#1A1A1A' : 'rgba(255,255,255,0.92)',
        border: active ? 'none' : '1px solid #DDD',
        boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
        fontSize: 15, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      🔧
    </button>
  )
}

// ─── 메인 컴포넌트 ───
export default function NearMap({ lang = 'zh' }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const overlaysRef = useRef([])        // { overlay, el, poi }[]
  const courseOverlaysRef = useRef([])  // { overlay, el, poi }[]
  const coursePolylineRef = useRef(null)
  const touchStartY = useRef(0)

  const [mapReady, setMapReady] = useState(false)
  const [activeCategory, setActiveCategory] = useState('popup')
  const [activePopup, setActivePopup] = useState(null)
  const [navPoi, setNavPoi] = useState(null)
  const [bilingual, setBilingual] = useState(false)
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('near_bookmarks') || '[]') } catch { return [] }
  })
  const [showSearch, setShowSearch] = useState(false)
  const [showList, setShowList] = useState(false)
  const [listSort, setListSort] = useState('all')
  const [courseMode, setCourseMode] = useState(false)
  const [activeCourseId, setActiveCourseId] = useState(null)
  const [showMyPanel, setShowMyPanel] = useState(false)
  const [reservationPoi, setReservationPoi] = useState(null)
  const [statusTick, setStatusTick] = useState(0)      // 1분 간격 영업상태 갱신
  const [mapMoveStamp, setMapMoveStamp] = useState(0)  // 지도 이동 시 핀 재조회

  const { pins: allPins, loading: pinsLoading, error: pinsError, userPos } = useNearPins()
  const [taxiPoi, setTaxiPoi] = useState(null)
  const [taxiFromFab, setTaxiFromFab] = useState(false)
  const [courses, setCourses] = useState(COURSE_DATA)

  // 코스 데이터 — Supabase 우선, COURSE_DATA fallback
  useEffect(() => {
    supabase.from('courses').select('*').eq('is_active', true)
      .then(({ data, error }) => {
        if (!error && data?.length) setCourses(data)
      })
      .catch(() => {})
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const filteredPins = allPins.filter(p => {
    const notExpired = !(p.is_temporary && p.end_date && p.end_date < today)
    if (!notExpired) return false

    // "快闪店" (popup): 임시 팝업 전체 표시 (모든 카테고리)
    if (activeCategory === 'popup') return true

    // 나머지 카테고리: 정확히 매칭
    return p.category === activeCategory
  })
  const isExpanded = !!activePopup

  // ── 북마크 토글 ──
  const toggleBookmark = useCallback((id) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('near_bookmarks', JSON.stringify(next))
      return next
    })
  }, [])

  // ── 바텀 시트 닫기 ──
  const closeSheet = useCallback(() => {
    setActivePopup(null)
    overlaysRef.current.forEach(({ el }) => {
      const wrapper = el?.querySelector('[data-poi]')
      if (wrapper) { wrapper.style.transform = 'scale(1)'; wrapper.style.opacity = '1' }
    })
  }, [])

  // ── 핀 선택 ──
  const selectPin = useCallback((poi) => {
    setActivePopup(poi)
    navigator.vibrate?.(10)  // 햅틱 피드백
    if (mapInstance.current) {
      mapInstance.current.panTo(new window.kakao.maps.LatLng(poi.lat, poi.lng))
    }
    overlaysRef.current.forEach(({ el, poi: p }) => {
      const wrapper = el?.querySelector('[data-poi]')
      if (!wrapper) return
      wrapper.style.transform = p.id === poi.id ? 'scale(1.2)' : 'scale(1)'
      wrapper.style.opacity = p.id === poi.id ? '1' : '0.4'
    })
  }, [])

  // ── 카카오맵 초기화 ──
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
          level: 5,
        })
        mapInstance.current = map
        const myEl = document.createElement('div')
        myEl.innerHTML = `<div style="width:14px;height:14px;background:#378ADD;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(55,138,221,0.25);"></div>`
        new window.kakao.maps.CustomOverlay({
          map, position: new window.kakao.maps.LatLng(lat, lng), content: myEl, zIndex: 1,
        })
        setMapReady(true)
      }
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          p => initMap(p.coords.latitude, p.coords.longitude),
          () => initMap(37.5446, 127.0560)
        )
      } else {
        initMap(37.5446, 127.0560)
      }
    }).catch(() => {})
  }, [])

  // ── 확장/축소/코스 시 map relayout ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return
    const timer = setTimeout(() => mapInstance.current.relayout(), 310)
    return () => clearTimeout(timer)
  }, [isExpanded, activeCourseId, mapReady])

  // ── 1분 간격 영업상태 갱신 ──
  useEffect(() => {
    const timer = setInterval(() => setStatusTick(n => n + 1), 60000)
    return () => clearInterval(timer)
  }, [])

  // ── 지도 idle → 핀 재조회 (throttle 500ms) ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return
    let throttleTimer = null
    const onIdle = () => {
      if (throttleTimer) return
      throttleTimer = setTimeout(() => {
        setMapMoveStamp(Date.now())
        throttleTimer = null
      }, 500)
    }
    window.kakao.maps.event.addListener(mapInstance.current, 'idle', onIdle)
    return () => {
      window.kakao.maps.event.removeListener(mapInstance.current, 'idle', onIdle)
      if (throttleTimer) clearTimeout(throttleTimer)
    }
  }, [mapReady])

  // ── 핀 렌더 (코스 활성 시 스킵) ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return
    overlaysRef.current.forEach(o => o.overlay.setMap(null))
    overlaysRef.current = []
    if (activeCourseId) return  // 코스 모드: 코스 핀이 대신 렌더됨

    const map = mapInstance.current
    const inBounds = getPinsInBounds(filteredPins, map)
    const visible = inBounds
      .sort((a, b) => (a.distance || 0) - (b.distance || 0) || b.sort_priority - a.sort_priority)
      .slice(0, 7)

    overlaysRef.current = visible.map(poi => {
      const el = document.createElement('div')
      el.innerHTML = buildPinHTML(poi.category, isNewPoi(poi.created_at), poi.id)
      const overlay = new window.kakao.maps.CustomOverlay({
        map, position: new window.kakao.maps.LatLng(poi.lat, poi.lng),
        content: el, yAnchor: 1.3, zIndex: 2,
      })
      el.addEventListener('click', () => selectPin(poi))
      return { overlay, el, poi }
    })
  }, [mapReady, filteredPins, selectPin, activeCourseId, mapMoveStamp, activeCategory])

  // ── 코스 핀 + 폴리라인 ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return
    // 기존 코스 오버레이 제거
    courseOverlaysRef.current.forEach(o => o.overlay.setMap(null))
    courseOverlaysRef.current = []
    if (coursePolylineRef.current) { coursePolylineRef.current.setMap(null); coursePolylineRef.current = null }

    if (!activeCourseId) return
    const course = courses.find(c => c.id === activeCourseId)
    if (!course) return

    const map = mapInstance.current
    const coursePois = course.poi_ids
      .map(id => allPins.find(p => p.id === id))
      .filter(Boolean)

    // 번호 핀
    courseOverlaysRef.current = coursePois.map((poi, idx) => {
      const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
      const el = document.createElement('div')
      el.innerHTML = buildCoursePinHTML(idx + 1, cfg.color, poi.id)
      const overlay = new window.kakao.maps.CustomOverlay({
        map, position: new window.kakao.maps.LatLng(poi.lat, poi.lng),
        content: el, yAnchor: 1.2, zIndex: 3,
      })
      el.addEventListener('click', () => selectPin(poi))
      return { overlay, el, poi }
    })

    // 점선 연결 폴리라인
    if (coursePois.length >= 2) {
      coursePolylineRef.current = new window.kakao.maps.Polyline({
        map,
        path: coursePois.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
        strokeWeight: 2,
        strokeColor: '#1A1A1A',
        strokeOpacity: 0.5,
        strokeStyle: 'shortdash',
      })
    }

    // 코스 시작점으로 지도 이동
    if (coursePois[0]) {
      map.panTo(new window.kakao.maps.LatLng(coursePois[0].lat, coursePois[0].lng))
      map.setLevel(5)
    }
  }, [mapReady, activeCourseId, selectPin])

  const moveToArea = (area) => {
    if (!mapReady || !mapInstance.current) return
    mapInstance.current.setCenter(new window.kakao.maps.LatLng(area.lat, area.lng))
    mapInstance.current.setLevel(area.zoom)
    setShowList(false)
  }

  const exitCourseMode = useCallback(() => {
    setCourseMode(false)
    setActiveCourseId(null)
  }, [])

  const sheetPoi = activePopup || filteredPins[0] || null
  const hotFallback = filteredPins.length === 0 && !pinsLoading
    ? [...allPins].sort((a, b) => b.view_count_7d - a.view_count_7d).slice(0, 3)
    : []

  // ── 스와이프 제스처 (아래→닫기, 위→리스트) ──
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY }
  const handleTouchEnd = (e) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current
    if (delta > 60 && isExpanded) closeSheet()
    else if (delta < -80 && !isExpanded && !courseMode) setShowList(true)
  }

  return (
    <div style={{ position: 'relative', height: 'calc(100dvh - 116px)', overflow: 'hidden', background: 'var(--surface)' }}>

      {/* ─── 카카오맵 ─── */}
      <div
        ref={mapRef}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          bottom: isExpanded ? '60dvh' : (activeCourseId ? '50dvh' : 0),
          transition: 'bottom 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />

      {/* ─── 지도 탭 클릭 → 바텀 시트 닫기 (확장 상태에서만) ─── */}
      {isExpanded && (
        <div
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40dvh', zIndex: 8 }}
          onClick={closeSheet}
        />
      )}

      {/* ─── 검색바 ─── */}
      <button
        onClick={() => setShowSearch(true)}
        style={{ position: 'absolute', top: 16, left: 16, right: 72, zIndex: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{
          background: 'white', borderRadius: 'var(--radius-pill)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center',
          padding: '0 12px', height: 40, gap: 8,
        }}>
          <Search size={16} color="var(--text-muted)" />
          <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>
            {t('search_placeholder', bilingual)}
          </span>
        </div>
      </button>

      {/* ─── Magic Pill (우상단) ─── */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <MagicPillSelector areas={QUICK_AREAS} bilingual={bilingual} onSelect={moveToArea} />
      </div>

      {/* ─── 개발 전용 bilingual 토글 ─── */}
      <DevBilingualToggle active={bilingual} onToggle={() => setBilingual(v => !v)} />

      {/* ─── 카테고리 칩 ─── */}
      <div style={{
        position: 'absolute', top: 70, left: 0, right: IS_DEV ? 56 : 0, zIndex: 9,
        display: 'flex', gap: 8, overflowX: 'auto',
        padding: '0 20px', scrollbarWidth: 'none',
      }}>
        {CATEGORY_CHIPS.map(chip => {
          const active = activeCategory === chip.id && !courseMode
          return (
            <button
              key={chip.id}
              onClick={() => { setActiveCategory(chip.id); closeSheet(); exitCourseMode() }}
              style={{
                flexShrink: 0,
                height: 32,
                background: active ? 'var(--text-primary)' : 'white',
                color: active ? 'white' : 'var(--text-muted)',
                border: active ? 'none' : '0.5px solid #E8E8E8',
                borderRadius: 'var(--radius-chip)', padding: '0 14px',
                fontSize: 13, fontWeight: 600,
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.08)',
                transition: 'all 0.15s',
              }}
            >
              {t(chip.key, bilingual)}
            </button>
          )
        })}
        {/* 코스 토글 칩 */}
        <button
          onClick={() => { if (courseMode) exitCourseMode(); else { setCourseMode(true); closeSheet() } }}
          style={{
            flexShrink: 0,
            height: 32,
            background: courseMode ? '#DC2626' : 'white',
            color: courseMode ? 'white' : 'var(--text-muted)',
            border: courseMode ? 'none' : '0.5px solid #E8E8E8',
            borderRadius: 'var(--radius-chip)', padding: '0 14px',
            fontSize: 13, fontWeight: 600,
            boxShadow: courseMode ? '0 2px 8px rgba(220,38,38,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {courseMode && <span style={{ fontSize: 8, background: 'rgba(255,255,255,0.3)', borderRadius: 100, padding: '1px 4px' }}>●</span>}
          {t('course_toggle', bilingual)}
        </button>
      </div>

      {/* ─── 바텀 시트 ─── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
          height: isExpanded ? '60dvh' : (activeCourseId ? '50dvh' : 'auto'),
          minHeight: 124,
          transition: 'height 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          background: 'white', borderRadius: '24px 24px 0 0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
          overflowY: (isExpanded || activeCourseId) ? 'auto' : 'hidden',
        }}
      >
        {isExpanded && sheetPoi ? (
          <ExpandedSheetContent
            poi={sheetPoi}
            bilingual={bilingual}
            bookmarks={bookmarks}
            onBookmark={toggleBookmark}
            onClose={closeSheet}
            onNavigate={(p) => setNavPoi(p)}
            onReserve={(p) => setReservationPoi(p)}
            onTaxi={(p) => setTaxiPoi(p)}
            statusTick={statusTick}
          />
        ) : activeCourseId ? (
          <CourseStopList
            course={courses.find(c => c.id === activeCourseId)}
            allPins={allPins}
            bilingual={bilingual}
            onSelectPoi={selectPin}
            onNavigatePoi={(p) => setNavPoi(p)}
            onExit={exitCourseMode}
          />
        ) : courseMode ? (
          <CourseSelectorSheet
            courses={courses}
            bilingual={bilingual}
            onSelectCourse={(id) => setActiveCourseId(id)}
            onExit={exitCourseMode}
          />
        ) : (
          <>
            {/* 핸들바 + 我的 버튼 */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 6px' }}>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--text-hint)' }} />
              </div>
              <button
                onClick={() => setShowMyPanel(true)}
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
              >
                {t('my_panel', bilingual)} ›
              </button>
            </div>

            {pinsError ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{t('net_error', bilingual)}</div>
                <button
                  onClick={() => window.location.reload()}
                  style={{ fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--text-primary)', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
                >{t('retry', bilingual)}</button>
              </div>
            ) : pinsLoading ? (
              <div style={{ padding: '8px 20px 20px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 10, background: 'var(--surface)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, background: 'var(--surface)', borderRadius: 6, marginBottom: 6, width: '70%' }} />
                    <div style={{ height: 11, background: 'var(--surface)', borderRadius: 6, marginBottom: 4, width: '50%' }} />
                    <div style={{ height: 10, background: 'var(--surface)', borderRadius: 6, width: '40%' }} />
                  </div>
                </div>
              </div>
            ) : sheetPoi ? (
              <CompactSheetCard
                poi={sheetPoi}
                bilingual={bilingual}
                onExpand={() => selectPin(sheetPoi)}
              />
            ) : (
              <NearbyHotFallback pins={hotFallback} bilingual={bilingual} onSelect={selectPin} />
            )}
          </>
        )}
      </div>

      {/* ─── 검색 포커스 지도 딤 (opacity 0.3) ─── */}
      {showSearch && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 49,
          background: 'rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          transition: 'opacity 300ms ease-out',
        }} />
      )}

      {/* ─── 리스트 뷰 ─── */}
      {showList && (
        <ListView
          pins={filteredPins}
          bilingual={bilingual}
          listSort={listSort}
          onSortChange={setListSort}
          onSelectPoi={(poi) => { setShowList(false); selectPin(poi) }}
          onBack={() => setShowList(false)}
        />
      )}

      {/* ─── 검색 오버레이 ─── */}
      {showSearch && (
        <SearchOverlay
          allPins={allPins}
          bilingual={bilingual}
          onSelectPoi={(poi) => {
            setShowSearch(false)
            if (taxiFromFab) {
              setTaxiFromFab(false)
              setTaxiPoi(poi)
            } else {
              selectPin(poi)
            }
          }}
          onClose={() => { setShowSearch(false); setTaxiFromFab(false) }}
        />
      )}

      {/* ─── 예약 시트 ─── */}
      {reservationPoi && (
        <ReservationSheet
          poi={reservationPoi}
          bilingual={bilingual}
          onClose={() => setReservationPoi(null)}
        />
      )}

      {/* ─── 내 정보 패널 ─── */}
      {showMyPanel && (
        <NearMyPanel
          bilingual={bilingual}
          bookmarks={bookmarks}
          allPins={allPins}
          onClose={() => setShowMyPanel(false)}
          onSelectPoi={selectPin}
        />
      )}

      {/* ─── FAB: 택시 모드 ─── */}
      <button
        onClick={() => {
          setTaxiFromFab(true)
          setShowSearch(true)
        }}
        style={{
          position: 'absolute',
          right: 16,
          bottom: 140,
          zIndex: 25,
          width: 52, height: 52,
          borderRadius: '50%',
          background: '#F9A825',
          border: 'none',
          boxShadow: '0 4px 16px rgba(249,168,37,0.5)',
          fontSize: 22,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title={t('taxi_mode', bilingual)}
      >
        🚕
      </button>

      {/* ─── 길찾기 화면 ─── */}
      {navPoi && (
        <NavScreen poi={navPoi} onClose={() => setNavPoi(null)} bilingual={bilingual} />
      )}

      {/* ─── 택시 카드 화면 ─── */}
      {taxiPoi && (
        <TaxiCardView
          poi={taxiPoi}
          bilingual={bilingual}
          userPos={userPos}
          onClose={() => { setTaxiPoi(null); setTaxiFromFab(false) }}
        />
      )}
    </div>
  )
}

// ─── 확장 바텀 시트 내용 ───
function ExpandedSheetContent({ poi, bilingual, bookmarks, onBookmark, onClose, onNavigate, onReserve, onTaxi, statusTick }) {
  const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
  const tags = calcTags(poi, bilingual)
  // statusTick이 변할 때마다 재계산 (lint: eslint-disable-next-line no-unused-expressions)
  void statusTick
  const status = getBusinessStatus(poi)
  const isBookmarked = bookmarks.includes(poi.id)
  const dist = distLabel(poi)

  const handleNavigate = () => onNavigate(poi)

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* 핸들바 + 닫기 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px 6px' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--text-hint)' }} />
        </div>
        <button
          onClick={onClose}
          style={{ color: 'var(--text-muted)', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 8px', lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      {/* Hero image */}
      <div style={{ margin: '0 20px 16px', height: 140, borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
        {poi.image_url ? (
          <img src={poi.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontWeight: 700 }}>
            {cfg.letter}
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* 제목 + NEW 뱃지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {poi.name_zh || poi.name_ko}
          </h2>
          {isNewPoi(poi.created_at) && (
            <span style={{ fontSize: 9, background: '#FF3141', color: 'white', borderRadius: 4, padding: '1px 5px', fontWeight: 700, flexShrink: 0 }}>
              {t('badge_new', bilingual)}
            </span>
          )}
        </div>

        {/* 서브타이틀 */}
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          {t('subtitle_city', bilingual)} · {poi.address_zh || poi.address_ko}{dist ? ` · ${dist}` : ''}
        </p>

        {/* 태그 */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {tags.map(tag => <TagPill key={tag.label} label={tag.label} bg={tag.bg} color={tag.color} />)}
          </div>
        )}

        {/* 정보 행 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
          {/* 운영 기간 */}
          {poi.is_temporary && poi.start_date && poi.end_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>📅</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                {poi.start_date} – {poi.end_date}
              </span>
            </div>
          )}

          {/* 영업 시간 + 상태 뱃지 */}
          {poi.open_time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>⏰</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                {poi.open_time}–{poi.close_time}
              </span>
              {status === 'open' && (
                <span style={{ fontSize: 10, background: '#DCFCE7', color: '#16A34A', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>
                  {t('status_open', bilingual)}
                </span>
              )}
              {status === 'closed' && (
                <span style={{ fontSize: 10, background: '#FEE2E2', color: '#DC2626', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>
                  {t('status_closed', bilingual)}
                </span>
              )}
              {status === 'coming' && (
                <span style={{ fontSize: 10, background: '#FFFBEB', color: '#D97706', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>
                  {t('status_coming', bilingual)}
                </span>
              )}
            </div>
          )}

          {/* 웨이팅 */}
          {poi.wait_minutes != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>⏳</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                {t('wait_prefix', bilingual)}{poi.wait_minutes}{t('wait_suffix', bilingual)}
              </span>
            </div>
          )}
        </div>

        {/* CTA 버튼 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handleNavigate}
            style={{ flex: 1.2, minWidth: 80, height: 48, borderRadius: 'var(--radius-btn)', background: '#1A1A1A', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Navigation size={15} />
            {t('navigate_here', bilingual)}
          </button>
          <button
            onClick={() => onTaxi(poi)}
            style={{ flex: 1, minWidth: 72, height: 48, borderRadius: 'var(--radius-btn)', background: '#F9A825', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Car size={15} />
            {t('taxi_mode', bilingual)}
          </button>
          {poi.has_reservation && (
            <button
              onClick={() => onReserve(poi)}
              style={{ flex: 1, minWidth: 60, height: 48, borderRadius: 'var(--radius-btn)', background: '#DC2626', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Calendar size={15} />
              {t('reserve', bilingual)}
            </button>
          )}
          <button
            onClick={() => onBookmark(poi.id)}
            style={{
              flex: 0.6, minWidth: 52, height: 48, borderRadius: 'var(--radius-btn)',
              background: isBookmarked ? '#FFF1F1' : 'white',
              color: isBookmarked ? '#E24B4A' : 'var(--text-primary)',
              fontSize: 13, fontWeight: 600,
              border: isBookmarked ? '1px solid #E24B4A' : '1px solid var(--border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            <Heart size={15} fill={isBookmarked ? '#E24B4A' : 'none'} />
            {isBookmarked ? t('bookmarked', bilingual) : t('bookmark', bilingual)}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 축소 상태 카드 ───
function CompactSheetCard({ poi, bilingual, onExpand }) {
  const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
  const tags = calcTags(poi, bilingual)
  const dist = distLabel(poi)

  return (
    <button
      onClick={onExpand}
      style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '4px 20px 20px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
    >
      {/* 썸네일 */}
      <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'var(--surface)' }}>
        {poi.image_url ? (
          <img src={poi.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 700 }}>
            {cfg.letter}
          </div>
        )}
      </div>

      {/* 텍스트 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {poi.name_zh || poi.name_ko}
          </span>
          {isNewPoi(poi.created_at) && (
            <span style={{ fontSize: 9, background: '#FF3141', color: 'white', borderRadius: 4, padding: '1px 4px', fontWeight: 700, flexShrink: 0 }}>
              {t('badge_new', bilingual)}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {poi.address_zh || poi.address_ko}{dist ? ` · ${dist}` : ''}
        </p>
        {tags.length > 0 ? (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', overflow: 'hidden' }}>
            {tags.map(tag => <TagPill key={tag.label} label={tag.label} bg={tag.bg} color={tag.color} />)}
          </div>
        ) : null}
      </div>

      {/* 화살표 힌트 */}
      <span style={{ color: 'var(--text-hint)', fontSize: 16, flexShrink: 0 }}>›</span>
    </button>
  )
}

// ─── 검색 오버레이 ───
function SearchOverlay({ allPins, bilingual, onSelectPoi, onClose }) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('near_searches') || '[]') } catch { return [] }
  })
  const inputRef = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50) }, [])

  // 300ms 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const results = debouncedQuery.trim().length > 0
    ? allPins.filter(p => {
        const q = debouncedQuery.toLowerCase()
        return (p.name_zh || '').includes(debouncedQuery) ||
               (p.name_ko || '').toLowerCase().includes(q) ||
               (p.name_en || '').toLowerCase().includes(q)
      })
    : []

  const hotPins = [...allPins].sort((a, b) => (b.view_count_7d || 0) - (a.view_count_7d || 0)).slice(0, 5)

  const addRecent = (text) => {
    const next = [text, ...recent.filter(r => r !== text)].slice(0, 5)
    setRecent(next)
    localStorage.setItem('near_searches', JSON.stringify(next))
  }

  const handleSelect = (poi) => {
    addRecent(poi.name_zh || poi.name_ko)
    onSelectPoi(poi)
  }

  const PoiRow = ({ poi, rank }) => {
    const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
    return (
      <button
        onClick={() => handleSelect(poi)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
      >
        <span style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', fontWeight: 700, flexShrink: 0 }}>
          {cfg.letter}
        </span>
        <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poi.name_zh || poi.name_ko}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poi.address_zh}</div>
        </div>
        {rank != null && <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>#{rank + 1}</span>}
        {rank == null && <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{distLabel(poi)}</span>}
      </button>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* 검색 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-primary)', display: 'flex' }}>
          <ArrowLeft size={22} weight="bold" />
        </button>
        <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 14px', height: 44, gap: 8 }}>
          <MagnifyingGlass size={17} color="var(--text-muted)" weight="bold" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search_placeholder', bilingual)}
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 15, color: 'var(--text-primary)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, fontSize: 16, lineHeight: 1 }}>✕</button>
          )}
        </div>
      </div>

      {/* 결과 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 48px' }}>
        {query.trim() === '' ? (
          <>
            {recent.length > 0 && (
              <div style={{ paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{t('search_recent', bilingual)}</span>
                  <button
                    onClick={() => { setRecent([]); localStorage.removeItem('near_searches') }}
                    style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >{t('search_clear', bilingual)}</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {recent.map((r, i) => (
                    <button key={i} onClick={() => setQuery(r)} style={{ background: 'var(--surface)', border: 'none', borderRadius: 100, padding: '6px 14px', fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ paddingTop: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>🔥 {t('search_hot', bilingual)}</div>
              {hotPins.map((poi, i) => <PoiRow key={poi.id} poi={poi} rank={i} />)}
            </div>
          </>
        ) : results.length > 0 ? (
          <div style={{ paddingTop: 8 }}>
            {results.map(poi => <PoiRow key={poi.id} poi={poi} rank={null} />)}
          </div>
        ) : (
          <div style={{ paddingTop: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{t('search_no_result', bilingual)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>"{query}"</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🔥 {t('nearby_hot', bilingual)}</div>
              {hotPins.slice(0, 3).map((poi, i) => <PoiRow key={poi.id} poi={poi} rank={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 리스트 뷰 ───
function ListView({ pins, bilingual, listSort, onSortChange, onSelectPoi, onBack }) {
  const SORTS = [
    { id: 'all',      key: 'sort_all' },
    { id: 'distance', key: 'sort_distance' },
    { id: 'closing',  key: 'sort_closing' },
    { id: 'popular',  key: 'sort_popular' },
  ]

  const sorted = [...pins].sort((a, b) => {
    if (listSort === 'distance') return (a.distance || 9999) - (b.distance || 9999)
    if (listSort === 'closing') {
      const dA = a.end_date ? new Date(a.end_date) : new Date('9999-12-31')
      const dB = b.end_date ? new Date(b.end_date) : new Date('9999-12-31')
      return dA - dB
    }
    if (listSort === 'popular') return (b.view_count_7d || 0) - (a.view_count_7d || 0)
    return b.sort_priority - a.sort_priority
  })

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{t('list_title', bilingual)}</span>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface)', border: 'none', borderRadius: 100, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}
        >
          {t('list_back_map', bilingual)}
        </button>
      </div>
      {/* 정렬 칩 */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 20px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        {SORTS.map(s => (
          <button
            key={s.id}
            onClick={() => onSortChange(s.id)}
            style={{
              flexShrink: 0,
              background: listSort === s.id ? 'var(--text-primary)' : 'var(--surface)',
              color: listSort === s.id ? 'white' : 'var(--text-primary)',
              border: 'none', borderRadius: 100, padding: '6px 16px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t(s.key, bilingual)}
          </button>
        ))}
      </div>
      {/* 카드 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 48px' }}>
        {sorted.map((poi) => {
          const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
          const tags = calcTags(poi, bilingual)
          return (
            <button
              key={poi.id}
              onClick={() => onSelectPoi(poi)}
              style={{ width: '100%', display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'var(--surface)' }}>
                {poi.image_url
                  ? <img src={poi.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700 }}>{cfg.letter}</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{poi.name_zh || poi.name_ko}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {poi.address_zh}{distLabel(poi) ? ` · ${distLabel(poi)}` : ''}
                </div>
                {tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {tags.slice(0, 2).map((tag, i) => <TagPill key={i} {...tag} />)}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── 코스 선택 시트 ───
function CourseSelectorSheet({ courses, bilingual, onSelectCourse, onExit }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--text-hint)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 14px' }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{t('course_select', bilingual)}</span>
        <button onClick={onExit} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>{t('course_exit', bilingual)}</button>
      </div>
      <div style={{ padding: '0 20px' }}>
        {(courses || []).map(course => (
          <button
            key={course.id}
            onClick={() => onSelectCourse(course.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', marginBottom: 10, cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18 }}>🗺</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{course.title_zh}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{course.description_zh} · {course.estimated_hours}{t('course_hours', bilingual)}</div>
            </div>
            <span style={{ color: 'var(--text-hint)', fontSize: 16 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── 코스 정거장 리스트 ───
function CourseStopList({ course, allPins, bilingual, onSelectPoi, onNavigatePoi, onExit }) {
  if (!course) return null
  const coursePois = course.poi_ids.map(id => allPins.find(p => p.id === id)).filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 10px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 8, background: '#DC2626', color: 'white', borderRadius: 4, padding: '2px 6px', fontWeight: 700 }}>
              {t('course_mode', bilingual)}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{course.title_zh}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {course.description_zh} · {course.estimated_hours}{t('course_hours', bilingual)}
          </div>
        </div>
        <button onClick={onExit} style={{ fontSize: 12, color: '#DC2626', background: 'none', border: '1px solid #FCA5A5', borderRadius: 100, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
          {t('course_exit', bilingual)}
        </button>
      </div>
      {/* 정거장 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }}>
        {coursePois.map((poi, idx) => {
          const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
          return (
            <div key={poi.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: idx < coursePois.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              {/* 번호 뱃지 */}
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: cfg.color, color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid white', boxShadow: `0 0 0 2px ${cfg.color}` }}>
                {idx + 1}
              </div>
              {/* 썸네일 */}
              <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--surface)' }}>
                {poi.image_url
                  ? <img src={poi.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700 }}>{cfg.letter}</div>
                }
              </div>
              {/* 텍스트 */}
              <button
                onClick={() => onSelectPoi(poi)}
                style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: 0 }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{poi.name_zh || poi.name_ko}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{distLabel(poi) || poi.address_zh}</div>
              </button>
              {/* 导航 버튼 */}
              <button
                onClick={() => onNavigatePoi(poi)}
                style={{ flexShrink: 0, background: '#1A1A1A', color: 'white', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >
                {t('navigate', bilingual)}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 예약 시트 ───
function ReservationSheet({ poi, bilingual, onClose }) {
  const genDates = () => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1)
    return d.toISOString().slice(0, 10)
  })

  const genTimeSlots = (openTime, closeTime) => {
    const slots = []
    const [oh, om] = (openTime || '10:00').split(':').map(Number)
    const [ch, cm] = (closeTime || '22:00').split(':').map(Number)
    let h = oh, m = om
    while (h * 60 + m < ch * 60 + cm - 30) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      m += 30; if (m >= 60) { h++; m -= 60 }
    }
    return slots
  }

  const dates = genDates()
  const timeSlots = genTimeSlots(poi.open_time, poi.close_time)
  const DAY_ZH = ['日', '一', '二', '三', '四', '五', '六']

  const [selDate, setSelDate] = useState(dates[0])
  const [selTime, setSelTime] = useState(timeSlots[0] || '12:00')
  const [count, setCount] = useState(2)
  const [done, setDone] = useState(false)

  const handleConfirm = () => {
    const list = JSON.parse(localStorage.getItem('near_reservations') || '[]')
    list.unshift({
      id: `res-${Date.now()}`,
      poi_id: poi.id,
      poi_name: poi.name_zh || poi.name_ko,
      poi_image: poi.image_url,
      date: selDate, time: selTime, count,
      created_at: new Date().toISOString(),
      status: 'upcoming',
    })
    localStorage.setItem('near_reservations', JSON.stringify(list))
    setDone(true)
    setTimeout(onClose, 2000)
  }

  if (done) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ fontSize: 52 }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{t('reserve_success', bilingual)}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{poi.name_zh} · {selDate} {selTime} · {count}{t('res_people', bilingual)}</div>
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-primary)', display: 'flex' }}>
          <ArrowLeft size={22} weight="bold" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{poi.name_zh} · {t('reserve', bilingual)}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 48px' }}>
        {/* 날짜 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{t('reserve_date', bilingual)}</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {dates.map(d => {
              const dt = new Date(d); const active = selDate === d
              return (
                <button key={d} onClick={() => setSelDate(d)} style={{
                  flexShrink: 0, width: 52, padding: '8px 0', borderRadius: 12, textAlign: 'center',
                  background: active ? '#1A1A1A' : '#F3F4F6', color: active ? 'white' : '#374151',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{DAY_ZH[dt.getDay()]}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{dt.getDate()}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 시간 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{t('reserve_time', bilingual)}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {timeSlots.map(slot => (
              <button key={slot} onClick={() => setSelTime(slot)} style={{
                padding: '8px 16px', borderRadius: 100,
                background: selTime === slot ? '#1A1A1A' : '#F3F4F6',
                color: selTime === slot ? 'white' : '#374151',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                transition: 'all 0.15s',
              }}>{slot}</button>
            ))}
          </div>
        </div>

        {/* 인원 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{t('reserve_people', bilingual)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setCount(c => Math.max(1, c - 1))} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <span style={{ fontSize: 20, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{count}</span>
            <button onClick={() => setCount(c => Math.min(6, c + 1))} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{count} {t('res_people', bilingual)}</span>
          </div>
        </div>

        <button onClick={handleConfirm} style={{ width: '100%', height: 52, borderRadius: 14, background: '#1A1A1A', color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {t('reserve_confirm', bilingual)}
        </button>
      </div>
    </div>
  )
}

// ─── 내 정보 패널 (업그레이드: 예약 3탭 + near_bookings_v2 통합) ───
function NearMyPanel({ bilingual, bookmarks, allPins, onClose, onSelectPoi }) {
  const [activeSection, setActiveSection] = useState('reservations')
  const [resFilter, setResFilter] = useState('upcoming')  // 'upcoming' | 'done' | 'cancelled'
  const [localLang, setLocalLang] = useState(() => localStorage.getItem('near_lang') || 'zh')

  // near_reservations (지도 팝업 예약) + near_bookings_v2 (BookingView 예약) 통합
  const [allBookings, setAllBookings] = useState(() => {
    try {
      const v1 = JSON.parse(localStorage.getItem('near_reservations') || '[]')
        .map(r => ({ ...r, shopName: r.poi_name, service: '-', deposit: 0, depositCny: 0, guests: r.count }))
      const v2 = JSON.parse(localStorage.getItem('near_bookings_v2') || '[]')
      return [...v2, ...v1]
    } catch { return [] }
  })

  const bookmarkedPois = allPins.filter(p => bookmarks.includes(p.id))

  // 취소 (24시간 전까지)
  const cancelBooking = (id) => {
    const target = allBookings.find(b => b.id === id)
    if (!target) return
    // v2 소스인지 확인
    const v2 = JSON.parse(localStorage.getItem('near_bookings_v2') || '[]')
    const isV2 = v2.some(b => b.id === id)
    if (isV2) {
      const next = v2.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
      localStorage.setItem('near_bookings_v2', JSON.stringify(next))
    } else {
      const v1 = JSON.parse(localStorage.getItem('near_reservations') || '[]')
      const next = v1.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
      localStorage.setItem('near_reservations', JSON.stringify(next))
    }
    setAllBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  }

  // 24시간 취소 가능 여부
  const isCancellable = (booking) => {
    const dt = new Date(`${booking.date}T${booking.time}`)
    return dt - new Date() > 24 * 60 * 60 * 1000
  }

  const LANGS = [
    { code: 'zh', label: '中文（简体）' },
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
  ]

  const SECTIONS = [
    { id: 'reservations', key: 'my_reservations' },
    { id: 'bookmarks',    key: 'my_bookmarks' },
    { id: 'language',     key: 'my_language' },
  ]

  const RES_FILTERS = [
    { id: 'upcoming',  zh: '即将到来', ko: '예정', en: 'Upcoming' },
    { id: 'done',      zh: '已完成',   ko: '완료', en: 'Done' },
    { id: 'cancelled', zh: '已取消',   ko: '취소', en: 'Cancelled' },
  ]

  const filteredBookings = allBookings.filter(b => {
    if (resFilter === 'upcoming') return b.status === 'upcoming' || b.status === 'confirmed'
    if (resFilter === 'done') return b.status === 'done' || b.status === 'completed'
    return b.status === 'cancelled'
  })

  const lang = bilingual ? 'zh' : 'zh'  // bilingual 모드에서도 기본 zh
  const StatusBadge = ({ status }) => {
    const MAP = {
      upcoming:  ['#DCFCE7', '#16A34A', '即将'],
      confirmed: ['#DCFCE7', '#16A34A', '待使用'],
      done:      ['#F3F4F6', '#9CA3AF', '已完成'],
      completed: ['#F3F4F6', '#9CA3AF', '已完成'],
      cancelled: ['#FEE2E2', '#DC2626', '已取消'],
    }
    const [bg, color, label] = MAP[status] || MAP.done
    return <span style={{ fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '2px 6px', background: bg, color }}>{label}</span>
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-primary)', display: 'flex' }}>
          <ArrowLeft size={22} weight="bold" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{t('my_panel', bilingual)}</span>
      </div>

      {/* 섹션 탭 */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            flex: 1, padding: '10px 4px', fontSize: 12, fontWeight: 600,
            background: 'none', border: 'none', cursor: 'pointer',
            color: activeSection === s.id ? '#111827' : '#9CA3AF',
            borderBottom: activeSection === s.id ? '2px solid #1A1A1A' : '2px solid transparent',
            transition: 'all 0.2s',
          }}>
            {t(s.key, bilingual)}
          </button>
        ))}
      </div>

      {/* 내용 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 48px' }}>

        {activeSection === 'reservations' && (
          <>
            {/* 예약 상태 필터 */}
            <div style={{ display: 'flex', gap: 6, padding: '12px 0 8px', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              {RES_FILTERS.map(f => (
                <button key={f.id} onClick={() => setResFilter(f.id)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: resFilter === f.id ? '#1A1A1A' : '#F3F4F6', color: resFilter === f.id ? 'white' : '#6B7280', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {f.zh}
                </button>
              ))}
            </div>
            {filteredBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>还没有预约记录</div>
              </div>
            ) : (
              <div style={{ paddingTop: 4 }}>
                {filteredBookings.map(res => (
                  <div key={res.id} style={{ padding: '12px 0', borderBottom: '1px solid #F9FAFB' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      {/* 아이콘 */}
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>📅</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {res.shopName || res.poi_name}
                        </div>
                        {res.service && res.service !== '-' && (
                          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{res.service}</div>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {res.date} {res.time}
                          {res.guests && ` · ${res.guests}人`}
                        </div>
                        {res.deposit > 0 && (
                          <div style={{ fontSize: 11, color: '#C4725A', marginTop: 2, fontWeight: 600 }}>
                            保证金 ₩{res.deposit?.toLocaleString()} (≈¥{res.depositCny})
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <StatusBadge status={res.status} />
                        {(res.status === 'upcoming' || res.status === 'confirmed') && isCancellable(res) && (
                          <button onClick={() => cancelBooking(res.id)} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}>
                            取消预约
                          </button>
                        )}
                        {(res.status === 'upcoming' || res.status === 'confirmed') && !isCancellable(res) && (
                          <span style={{ fontSize: 9, color: 'var(--text-hint)' }}>不可取消</span>
                        )}
                      </div>
                    </div>
                    {res.id && res.id.startsWith('NEAR-') && (
                      <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-hint)', letterSpacing: '0.3px' }}>{res.id}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeSection === 'bookmarks' && (
          bookmarkedPois.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔖</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{t('bookmark_empty', bilingual)}</div>
            </div>
          ) : (
            <div style={{ paddingTop: 12 }}>
              {bookmarkedPois.map(poi => {
                const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
                return (
                  <button key={poi.id} onClick={() => { onSelectPoi(poi); onClose() }} style={{ width: '100%', display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid #F9FAFB', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--surface)' }}>
                      {poi.image_url
                        ? <img src={poi.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700 }}>{cfg.letter}</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poi.name_zh}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{poi.address_zh}</div>
                    </div>
                    <span style={{ color: 'var(--text-hint)', fontSize: 16, flexShrink: 0 }}>›</span>
                  </button>
                )
              })}
            </div>
          )
        )}

        {activeSection === 'language' && (
          <div style={{ paddingTop: 16 }}>
            {LANGS.map(lang => (
              <button key={lang.code} onClick={() => { setLocalLang(lang.code); localStorage.setItem('near_lang', lang.code) }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: localLang === lang.code ? 700 : 400 }}>{lang.label}</span>
                {localLang === lang.code && <span style={{ fontSize: 16, color: '#1A1A1A', fontWeight: 700 }}>✓</span>}
              </button>
            ))}
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6 }}>
              语言设置将在下次启动时生效。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Rule 5: 附近热门 폴백 ───
function NearbyHotFallback({ pins, bilingual, onSelect }) {
  return (
    <div style={{ padding: '4px 16px 20px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.02em' }}>
        🔥 {t('nearby_hot', bilingual)}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pins.map(poi => {
          const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
          const tags = calcTags(poi, bilingual)
          return (
            <button
              key={poi.id}
              onClick={() => onSelect(poi)}
              style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--surface)' }}>
                {poi.image_url ? (
                  <img src={poi.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700 }}>
                    {cfg.letter}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                  {poi.name_zh || poi.name_ko}
                </p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {tags.slice(0, 2).map(tag => (
                    <TagPill key={tag.label} label={tag.label} bg={tag.bg} color={tag.color} />
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
