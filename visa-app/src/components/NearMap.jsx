import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { useNearPins } from '../hooks/usePopupStores'
import TaxiCardView from './TaxiCardView.jsx'
import PlaceDetail from './PlaceDetail.jsx'
import { searchLocalPlaces } from '../data/hanpocketPlaceDB.js'
import { CATEGORY_CONFIG } from '../data/poiData'
import { MICHELIN_RESTAURANTS, BLUE_RIBBON_RESTAURANTS } from '../data/restaurantData.js'
import { FOOD_CATEGORIES, TV_CHANNELS } from '../data/foodCategories.js'
import { TOURBUS_ROUTES_V2 as TOURBUS_ROUTES, getActiveRoutes, getNextArrival, formatFee, getRouteDisplayLabel } from '../data/tourBusRoutes.js'
import { t, tLang } from '../locales/index.js'
import { useLanguage } from '../i18n/index.jsx'
import NavScreen from './NavScreen.jsx'
import { getLocalizedName, getLocalizedAddress } from '../utils/localize.js'
import { addPin, removePin, isPinSaved, getMySeoul } from '../utils/mySeoul.js'
import { useToast } from './Toast.jsx'

const IS_DEV = import.meta.env.DEV

// ─── 카테고리 칩 ───
const CATEGORY_CHIPS = [
  { id: 'popup',   key: 'cat_popup'   },
  { id: 'fashion', key: 'cat_fashion' },
  { id: 'food',    key: 'cat_food'    },
  { id: 'cafe',    key: 'cat_cafe'    },
  { id: 'utility', key: 'cat_utility' },
]

// ─── 미슐랭 핀 설정 ───
const MICHELIN_PIN_CONFIG = {
  michelin3: { color: '#DC2626', emoji: '⭐⭐⭐', label: '3★' },
  michelin2: { color: '#DC2626', emoji: '⭐⭐', label: '2★' },
  michelin1: { color: '#DC2626', emoji: '⭐', label: '1★' },
  bib:       { color: '#EA580C', emoji: '😋', label: 'Bib' },
  blue:      { color: '#2563EB', emoji: '🎗️', label: 'BR' },
}

// ─── 전체 식당 데이터 (좌표 있는 것만) ───
const ALL_RESTAURANTS = [
  ...MICHELIN_RESTAURANTS.filter(r => r.lat && r.lng),
  ...BLUE_RIBBON_RESTAURANTS.filter(r => r.lat && r.lng).map(r => ({ ...r, award: 'blue' })),
]

const PH_KEYS = ['search.placeholder.0','search.placeholder.1','search.placeholder.2','search.placeholder.3','search.placeholder.4']

// ─── 지역 빠른 이동 ───
const QUICK_AREAS = [
  { id: 'all',        key: 'district.all',    lat: 37.5665, lng: 126.9780, zoom: 7, district: null       },
  { id: 'hongdae',    key: 'area_hongdae',    lat: 37.5563, lng: 126.9220, zoom: 4, district: 'hongdae'   },
  { id: 'seongsu',    key: 'area_seongsu',    lat: 37.5445, lng: 127.0560, zoom: 4, district: 'seongsu'   },
  { id: 'gangnam',    key: 'area_gangnam',    lat: 37.5172, lng: 127.0286, zoom: 4, district: 'gangnam'   },
  { id: 'myeongdong', key: 'area_myeongdong', lat: 37.5636, lng: 126.9860, zoom: 4, district: 'myeongdong'},
  { id: 'itaewon',    key: 'area_itaewon',    lat: 37.5340, lng: 126.9940, zoom: 4, district: 'itaewon'  },
  { id: 'jamsil',     key: 'district.jamsil', lat: 37.5133, lng: 127.1001, zoom: 4, district: 'jamsil'   },
]

// 앱 딥링크 열기 — 앱이 열리면 타이머 취소 (앱스토어 오발화 방지)
function openDeepLink(url, fallbackUrl) {
  window.location.href = url
  const timer = setTimeout(() => { window.location.href = fallbackUrl }, 2000)
  // 앱이 열려 화면이 숨겨지면 타이머 취소
  const cancel = () => clearTimeout(timer)
  document.addEventListener('visibilitychange', cancel, { once: true })
  window.addEventListener('pagehide', cancel, { once: true })
}

// 카카오맵 딥링크 — 길찾기
function openKakaoMapRoute(lat, lng, name, by = 'PUBLICTRANSIT') {
  const latNum = Number(lat)
  const lngNum = Number(lng)
  if (isNaN(latNum) || isNaN(lngNum) || !latNum || !lngNum) return

  const n = encodeURIComponent(name || '')
  const isAndroid = /Android/i.test(navigator.userAgent)

  if (isAndroid) {
    const fallback = encodeURIComponent('https://play.google.com/store/apps/details?id=net.daum.android.map')
    window.location.href = `intent://route?ep=${latNum.toFixed(6)},${lngNum.toFixed(6)}&edt=${n}&by=${by}#Intent;scheme=kakaomap;package=net.daum.android.map;S.browser_fallback_url=${fallback};end`
  } else {
    openDeepLink(
      `kakaomap://route?ep=${latNum.toFixed(6)},${lngNum.toFixed(6)}&edt=${n}&by=${by}`,
      'https://apps.apple.com/kr/app/id304608425'
    )
  }
}

// 카카오T 딥링크 — 택시 호출
function openKakaoTaxi(destLat, destLng, destName, userPos) {
  const dLat = Number(destLat)
  const dLng = Number(destLng)
  if (isNaN(dLat) || isNaN(dLng) || !dLat || !dLng) {
    window.location.href = 'kakaot://'
    return
  }

  const dn = encodeURIComponent(destName || '')
  const isIOS = /iPhone|iPad/i.test(navigator.userAgent)
  // 카카오 내부 좌표계: X = 경도(lng), Y = 위도(lat)
  openDeepLink(
    `kakaot://taxi/call?destX=${dLng.toFixed(6)}&destY=${dLat.toFixed(6)}&destName=${dn}`,
    isIOS
      ? 'https://apps.apple.com/kr/app/kakaot/id981110422'
      : 'https://play.google.com/store/apps/details?id=com.kakao.taxi'
  )
}

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
function calcTags(poi, lang) {
  const tags = []
  const daysLeft = poi.end_date
    ? Math.ceil((new Date(poi.end_date) - new Date()) / 86400000)
    : null
  if (daysLeft !== null && daysLeft <= 14 && daysLeft >= 0)
    tags.push({ label: `D-${daysLeft} ${tLang('tag_closing', lang)}`, bg: '#FEF2F2', color: '#DC2626' })
  if (poi.tags?.includes('limited'))
    tags.push({ label: tLang('tag_limited', lang), bg: '#EFF6FF', color: '#2563EB' })
  if (poi.tags?.includes('free'))
    tags.push({ label: tLang('tag_free', lang), bg: '#F0FDF4', color: '#16A34A' })
  if (poi.has_reservation)
    tags.push({ label: tLang('tag_reservation', lang), bg: '#FFFBEB', color: '#D97706' })
  if ((poi.view_count_7d || 0) > 1000)
    tags.push({ label: tLang('tag_popular', lang), bg: '#F5F3FF', color: '#7C3AED' })
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
  utility:     `<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 22v-4a3 3 0 0 0-6 0v4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.25 13h19.5" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  convenience: `<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 22v-4a3 3 0 0 0-6 0v4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.25 13h19.5" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
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

// ─── 투어버스 매표소 핀 HTML (⭐ 펄싱 글로우) ───
function buildTourbusTicketPinHTML(number, color, stopId) {
  return `
    <div data-poi="${stopId}" style="transition:transform 200ms ease,opacity 200ms ease;display:inline-block;position:relative">
      <div style="position:absolute;inset:-4px;border-radius:50%;background:${color}33;animation:tourbus-glow 1.5s ease-in-out infinite"></div>
      <div style="
        width:36px;height:36px;
        background:${color};
        border-radius:50%;
        border:3px solid #FFD700;
        box-shadow:0 2px 10px ${color}66;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;color:white;font-size:12px;font-weight:700;
        position:relative;
      "><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg></div>
    </div>
  `
}

// ─── 미슐랭 핀 HTML ───
function buildMichelinPinHTML(award, poiId) {
  const cfg = MICHELIN_PIN_CONFIG[award] || MICHELIN_PIN_CONFIG.michelin1
  return `
    <div data-poi="${poiId}" style="transition:transform 200ms ease,opacity 200ms ease;display:inline-block">
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="
          min-width:36px;height:36px;
          background:${cfg.color};
          border-radius:18px;
          border:2.5px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.2);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;padding:0 6px;
          font-size:${award === 'michelin3' ? '10' : '12'}px;line-height:1;
        ">${cfg.emoji}</div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${cfg.color};margin-top:-1px;"></div>
      </div>
    </div>
  `
}

// ─── Magic Pill 지역 셀렉터 ───
function MagicPillSelector({ areas, lang, onSelect }) {
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
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: '#FFFFFF', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: expanded ? '0 0 0 1.5px rgba(0,0,0,0.15) inset' : '0 2px 8px rgba(0,0,0,0.12)',
          transition: 'box-shadow 0.15s ease',
          fontSize: 10, color: '#555',
        }}
      >
        {expanded ? '▲' : '▼'}
      </button>

      {expanded && (
        <>
          <div className="fixed inset-0 z-30" onClick={closeDropdown} onTouchEnd={closeDropdown} />
          <div
            className="absolute top-full right-0 mt-2 z-40 rounded-[16px] py-1 overflow-hidden"
            style={{ background: '#FFFFFF', boxShadow: '8px 8px 18px rgba(200,200,200,0.5), -8px -8px 18px #FFFFFF', minWidth: 120 }}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {areas.map((area) => {
              const isCurrent = selected.id === area.id
              return (
                <button
                  key={area.id}
                  onClick={(e) => handleSelect(area, e)}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 flex items-center gap-1.5 cursor-pointer select-none transition-colors duration-100"
                  style={{ background: isCurrent ? 'rgba(49,130,246,0.06)' : 'transparent', color: isCurrent ? '#3182F6' : '#191F28' }}
                >
                  <span className={`text-[12px] ${isCurrent ? 'font-bold' : 'font-medium'}`}>
                    {tLang(area.key, lang)}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── 메인 컴포넌트 ───
export default function NearMap() {
  const { lang } = useLanguage()
  const { showToast } = useToast()
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const overlaysRef = useRef([])        // { overlay, el, poi }[]
  const tourbusOverlaysRef = useRef([])  // { overlay, el, stop }[]
  const tourbusPolylinesRef = useRef([])  // kakao.maps.Polyline[]
  const tempSearchMarkerRef = useRef(null) // 검색 결과 임시 핀

  // ── 바텀 시트 드래그 ──
  const sheetRef = useRef(null)
  const dragRef = useRef(null)   // null = not dragging
  const skipSnapRef = useRef(false)
  const SHEET_PEEK = 124 // compact 상태에서 보이는 높이(px)

  const [mapReady, setMapReady] = useState(false)
  const [phIdx, setPhIdx] = useState(0)
  const [phVisible, setPhVisible] = useState(true)
  useEffect(() => {
    const iv = setInterval(() => {
      setPhVisible(false)
      setTimeout(() => { setPhIdx(i => (i + 1) % PH_KEYS.length); setPhVisible(true) }, 300)
    }, 3000)
    return () => clearInterval(iv)
  }, [])
  const [activeCategory, setActiveCategory] = useState('all')
  const [michelinFilter, setMichelinFilter] = useState('all')
  const [foodCategoryFilter, setFoodCategoryFilter] = useState('all')  // 음식 서브카테고리
  const michelinOverlaysRef = useRef([])  // 미슐랭 전용 오버레이
  const [selectedDistrict, setSelectedDistrict] = useState(null) // null = 서울 전체
  const [activePopup, setActivePopup] = useState(null)
  const [showAreaPicker, setShowAreaPicker] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const getMapRecent = () => { try { return JSON.parse(localStorage.getItem('near_map_recent') || '[]') } catch { return [] } }
  const addMapRecent = (term) => { if (!term?.trim()) return; const prev = getMapRecent().filter(t => t !== term); localStorage.setItem('near_map_recent', JSON.stringify([term, ...prev].slice(0, 20))) }
  // 매장 방문(클릭) 히스토리
  const PLACE_HISTORY_KEY = 'near_place_history'
  const getPlaceHistory = () => { try { return JSON.parse(localStorage.getItem(PLACE_HISTORY_KEY) || '[]') } catch { return [] } }
  const addPlaceHistory = (poi) => {
    if (!poi?.id) return
    const entry = {
      id: poi.id,
      name: poi.name_ko || poi.name?.ko || poi.name_zh || '',
      name_zh: poi.name_zh || poi.name?.zh || '',
      name_en: poi.name_en || poi.name?.en || '',
      category: poi.category || '',
      subCategory: poi.subCategory || poi.cuisine || '',
      area: poi.area?.gu || poi.gu || '',
      lat: poi.lat, lng: poi.lng,
      award: poi.award || '',
      image: poi.image || poi.photo_url || poi.thumbnail || '',
      ts: Date.now()
    }
    const prev = getPlaceHistory().filter(p => p.id !== poi.id)
    localStorage.setItem(PLACE_HISTORY_KEY, JSON.stringify([entry, ...prev].slice(0, 20)))
  }
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [navPoi, setNavPoi] = useState(null)
  const [bookmarks, setBookmarks] = useState(() => getMySeoul().pins.map(p => p.id))
  const [showSearch, setShowSearch] = useState(false)
  const [showList, setShowList] = useState(false)
  const [listSort, setListSort] = useState('all')
  const [tourbusMode, setTourbusMode] = useState(false)
  const [activeRouteIds, setActiveRouteIds] = useState([])  // [] = all routes
  const [showMyPanel, setShowMyPanel] = useState(false)
  const [showAllPanel, setShowAllPanel] = useState(false)
  const [reservationPoi, setReservationPoi] = useState(null)
  const [statusTick, setStatusTick] = useState(0)      // 1분 간격 영업상태 갱신
  const [mapMoveStamp, setMapMoveStamp] = useState(0)  // 지도 이동 시 핀 재조회

  const { pins: allPins, loading: pinsLoading, error: pinsError, userPos } = useNearPins()
  const [taxiPoi, setTaxiPoi] = useState(null)
  const [taxiFromFab, setTaxiFromFab] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const filteredPins = allPins.filter(p => {
    const notExpired = !(p.is_temporary && p.end_date && p.end_date < today)
    if (!notExpired) return false

    // 지역 필터
    if (selectedDistrict && p.district !== selectedDistrict) return false

    // 전체
    if (activeCategory === 'all') return true

    // 快闪店: is_temporary=true 인 것만
    if (activeCategory === 'popup') return p.is_temporary === true

    // 편의(utility) 칩 → DB의 'convenience' 카테고리
    if (activeCategory === 'utility') return p.category === 'convenience'

    // 나머지 (food, cafe, fashion): category 직접 매칭
    return p.category === activeCategory
  })
  const isExpanded = !!activePopup

  // ── 안드로이드 뒤로가기: NearMap 내부 서브뷰 순차 닫기 ──
  useEffect(() => {
    const handler = () => {
      if (navPoi)    { setNavPoi(null);                          window.history.pushState({}, ''); return }
      if (taxiPoi)   { setTaxiPoi(null); setTaxiFromFab(false); window.history.pushState({}, ''); return }
      if (showSearch){ setShowSearch(false);                     window.history.pushState({}, ''); return }
      if (isExpanded){ setActivePopup(null);                     window.history.pushState({}, ''); return }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [navPoi, taxiPoi, showSearch, isExpanded])

  // ── 내 서울 핀 토글 ──
  const toggleBookmark = useCallback((poi) => {
    const id = typeof poi === 'object' ? poi.id : poi
    const isSaved = isPinSaved(id)
    if (isSaved) {
      removePin(id)
    } else if (typeof poi === 'object') {
      addPin(poi)
    }
    setBookmarks(getMySeoul().pins.map(p => p.id))
    showToast({ type: 'success', message: tLang(isSaved ? 'mySeoul.removed' : 'mySeoul.added', lang) })
  }, [lang, showToast])

  // ── 바텀 시트 닫기 ──
  const closeSheet = useCallback(() => {
    setActivePopup(null)
    overlaysRef.current.forEach(({ el }) => {
      const wrapper = el?.querySelector('[data-poi]')
      if (wrapper) { wrapper.style.transform = 'scale(1)'; wrapper.style.opacity = '1' }
    })
    michelinOverlaysRef.current.forEach(({ el }) => {
      const wrapper = el?.querySelector('[data-poi]')
      if (wrapper) { wrapper.style.transform = 'scale(1)'; wrapper.style.opacity = '1' }
    })
    // 임시 검색 핀 제거
    if (tempSearchMarkerRef.current) {
      tempSearchMarkerRef.current.setMap(null)
      tempSearchMarkerRef.current = null
    }
  }, [])

  // ── 핀 선택 ──
  const selectPin = useCallback((poi) => {
    setActivePopup(poi)
    addPlaceHistory(poi)
    navigator.vibrate?.(10)  // 햅틱 피드백
    if (mapInstance.current) {
      mapInstance.current.panTo(new window.kakao.maps.LatLng(poi.lat, poi.lng))
    }
    // 일반 핀 하이라이트
    overlaysRef.current.forEach(({ el, poi: p }) => {
      const wrapper = el?.querySelector('[data-poi]')
      if (!wrapper) return
      wrapper.style.transform = p.id === poi.id ? 'scale(1.2)' : 'scale(1)'
      wrapper.style.opacity = p.id === poi.id ? '1' : '0.4'
    })
    // 미슐랭 핀 하이라이트
    michelinOverlaysRef.current.forEach(({ el, poi: p }) => {
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
          level: 7,
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

  // ── 확장/축소/투어버스 시 map relayout ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return
    const t1 = setTimeout(() => mapInstance.current.relayout(), 50)
    const t2 = setTimeout(() => mapInstance.current.relayout(), 320)
    const t3 = setTimeout(() => mapInstance.current.relayout(), 600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [isExpanded, tourbusMode, mapReady])

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
    if (tourbusMode) return  // 투어버스 모드: 별도 핀 렌더
    if (activeCategory === 'michelin') return  // 미슐랭 모드: 별도 렌더

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
  }, [mapReady, filteredPins, selectPin, tourbusMode, mapMoveStamp, activeCategory])

  // ── 미슐랭 핀 렌더 ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return
    michelinOverlaysRef.current.forEach(o => o.overlay.setMap(null))
    michelinOverlaysRef.current = []
    if (activeCategory !== 'michelin') return

    const map = mapInstance.current
    const filtered = ALL_RESTAURANTS.filter(r => {
      if (michelinFilter === 'all') return true
      if (michelinFilter === 'blue') return r.award === 'blue'
      if (michelinFilter === 'bib') return r.award === 'bib'
      return r.award === michelinFilter
    })

    const inBounds = filtered.filter(r => {
      try {
        return map.getBounds().contain(new window.kakao.maps.LatLng(r.lat, r.lng))
      } catch { return true }
    }).slice(0, 50)

    michelinOverlaysRef.current = inBounds.map(r => {
      const el = document.createElement('div')
      el.innerHTML = buildMichelinPinHTML(r.award, r.id)
      const overlay = new window.kakao.maps.CustomOverlay({
        map, position: new window.kakao.maps.LatLng(r.lat, r.lng),
        content: el, yAnchor: 1.3, zIndex: 2,
      })
      // 미슐랭 식당을 POI 형태로 변환
      const poi = {
        id: r.id,
        lat: r.lat, lng: r.lng,
        name_ko: r.name?.ko, name_zh: r.name?.zh, name_en: r.name?.en,
        address_ko: (r.area?.gu || '') + ' ' + (r.area?.dong || ''),
        category: 'michelin',
        image_url: r.images?.[0] || null,
        _restaurant: r,  // 원본 데이터 참조
      }
      el.addEventListener('click', () => selectPin(poi))
      return { overlay, el, poi }
    })
  }, [mapReady, activeCategory, michelinFilter, selectPin, mapMoveStamp])

  // ── 투어버스 핀 + 폴리라인 ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return
    // 기존 투어버스 오버레이 제거
    tourbusOverlaysRef.current.forEach(o => o.overlay.setMap(null))
    tourbusOverlaysRef.current = []
    tourbusPolylinesRef.current.forEach(p => p.setMap(null))
    tourbusPolylinesRef.current = []

    if (!tourbusMode) return

    const map = mapInstance.current
    const routes = activeRouteIds.length > 0
      ? TOURBUS_ROUTES.filter(r => activeRouteIds.includes(r.id))
      : TOURBUS_ROUTES

    const allOverlays = []

    routes.forEach(route => {
      const visibleStops = route.stops.filter(s => !s.noStop)

      // 번호 핀
      let stopNum = 0
      route.stops.forEach((stop) => {
        if (stop.noStop) return
        stopNum++
        const el = document.createElement('div')
        if (stop.isTicketStop) {
          el.innerHTML = buildTourbusTicketPinHTML(stopNum, route.color, stop.id)
        } else {
          el.innerHTML = buildCoursePinHTML(stopNum, route.color, stop.id)
        }
        const overlay = new window.kakao.maps.CustomOverlay({
          map, position: new window.kakao.maps.LatLng(stop.lat, stop.lng),
          content: el, yAnchor: 1.2, zIndex: stop.isTicketStop ? 5 : 3,
        })
        el.addEventListener('click', () => {
          setActivePopup({ ...stop, _tourbusRoute: route, _stopNum: stopNum, id: stop.id, name_ko: stop.name.ko, name_zh: stop.name.zh, name_en: stop.name.en, lat: stop.lat, lng: stop.lng, category: 'tourbus' })
        })
        allOverlays.push({ overlay, el, stop })
      })

      // 폴리라인 — noStop 구간은 dashed
      const segments = []
      let currentSegment = { points: [], dashed: false }
      route.stops.forEach((stop, i) => {
        const isDashed = stop.noStop || false
        if (i === 0) {
          currentSegment.dashed = isDashed
          currentSegment.points.push(new window.kakao.maps.LatLng(stop.lat, stop.lng))
        } else if (isDashed !== currentSegment.dashed) {
          // transition — share the boundary point
          currentSegment.points.push(new window.kakao.maps.LatLng(stop.lat, stop.lng))
          segments.push(currentSegment)
          currentSegment = { points: [new window.kakao.maps.LatLng(stop.lat, stop.lng)], dashed: isDashed }
        } else {
          currentSegment.points.push(new window.kakao.maps.LatLng(stop.lat, stop.lng))
        }
      })
      if (currentSegment.points.length >= 2) segments.push(currentSegment)

      segments.forEach(seg => {
        if (seg.points.length < 2) return
        const polyline = new window.kakao.maps.Polyline({
          map,
          path: seg.points,
          strokeWeight: 3,
          strokeColor: route.color,
          strokeOpacity: 0.7,
          strokeStyle: seg.dashed ? 'shortdash' : 'solid',
        })
        tourbusPolylinesRef.current.push(polyline)
      })
    })

    tourbusOverlaysRef.current = allOverlays

    // 광화문 (공통 시작점)으로 이동
    map.panTo(new window.kakao.maps.LatLng(37.5760, 126.9769))
    map.setLevel(5)
  }, [mapReady, tourbusMode, activeRouteIds])


  const moveToArea = (area) => {
    if (!mapReady || !mapInstance.current) return
    mapInstance.current.setCenter(new window.kakao.maps.LatLng(area.lat, area.lng))
    mapInstance.current.setLevel(area.zoom ?? 4)
    setSelectedDistrict(area.district ?? null)
    setShowList(false)
  }

  const exitTourbusMode = useCallback(() => {
    setTourbusMode(false)
    setActiveRouteIds([])
  }, [])

  const sheetPoi = activePopup || null
  const hotFallback = filteredPins.length === 0 && !pinsLoading
    ? [...allPins].sort((a, b) => b.view_count_7d - a.view_count_7d).slice(0, 3)
    : []

  // ── 시트 스냅 (transform 기반, GPU 가속) ──
  const snapSheet = useCallback((expanded, velPxS = 0) => {
    const el = sheetRef.current
    if (!el) return
    const dur = Math.abs(velPxS) > 500 ? 0.32 : 0.6
    el.style.transition = `transform ${dur}s cubic-bezier(0.16, 1, 0.3, 1)`
    el.style.transform = expanded ? 'translateY(0)' : `translateY(${el.offsetHeight - SHEET_PEEK}px)`
  }, [SHEET_PEEK])

  // isExpanded 상태가 드래그 없이 바뀔 때 (핀 클릭, X 버튼 등)
  useLayoutEffect(() => {
    if (skipSnapRef.current) { skipSnapRef.current = false; return }
    snapSheet(isExpanded)
  }, [isExpanded, snapSheet])

  // 지도 로드 완료 후 초기 위치 세팅 — sheetPoi 없으면 완전 숨김
  useEffect(() => {
    if (!mapReady) return
    const el = sheetRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.transform = 'translateY(100%)'
  }, [mapReady])

  // sheetPoi 변경 시 시트 애니메이션
  useEffect(() => {
    const el = sheetRef.current
    if (!el) return
    el.style.transition = 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
    if (sheetPoi) {
      // 모든 장소: 화면의 38% 높이로 올라옴 (주소+버튼 바로 보이게)
      const peekHeight = Math.max(window.innerHeight * 0.38, SHEET_PEEK)
      el.style.transform = `translateY(${Math.max(0, el.offsetHeight - peekHeight)}px)`
      // 핀이 시트에 가리지 않도록 지도 카메라를 위로 이동
      if (mapInstance.current && sheetPoi.lat) {
        setTimeout(() => mapInstance.current?.panBy(0, -120), 100)
      }
    } else {
      el.style.transform = 'translateY(100%)'
    }
  }, [sheetPoi, SHEET_PEEK])

  // ── 드래그 핸들러 ──
  const onDragStart = useCallback((e) => {
    const el = sheetRef.current
    if (!el) return
    el.style.transition = 'none'
    const ty = new DOMMatrix(getComputedStyle(el).transform).m42
    dragRef.current = { sy: e.touches[0].clientY, stTY: ty, ly: e.touches[0].clientY, lt: Date.now(), vel: 0 }
  }, [])

  const onDragMove = useCallback((e) => {
    const d = dragRef.current
    if (!d) return
    const y = e.touches[0].clientY
    const now = Date.now()
    const dt = now - d.lt
    if (dt > 0) d.vel = (y - d.ly) / dt * 1000
    d.ly = y; d.lt = now
    const el = sheetRef.current
    if (!el) return
    el.style.transform = `translateY(${Math.max(0, d.stTY + y - d.sy)}px)`
  }, [])

  const onDragEnd = useCallback(() => {
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    const el = sheetRef.current
    if (!el) return
    const ty = new DOMMatrix(getComputedStyle(el).transform).m42
    const h = el.offsetHeight
    const goExpand = d.vel < -300 || (!isExpanded && ty < (h - SHEET_PEEK) * 0.5)
    const goCollapse = d.vel > 300 || (isExpanded && ty > 80)

    if (goExpand && sheetPoi && !isExpanded) {
      skipSnapRef.current = true
      snapSheet(true, d.vel)
      selectPin(sheetPoi)
    } else if (goCollapse && isExpanded) {
      skipSnapRef.current = true
      snapSheet(false, d.vel)
      closeSheet()
    } else {
      snapSheet(isExpanded)
    }
  }, [isExpanded, sheetPoi, snapSheet, selectPin, closeSheet, SHEET_PEEK])

  return (
    <div style={{ position: 'fixed', top: 48, left: 0, right: 0, bottom: 0, overflow: 'hidden', background: 'var(--surface)', transition: 'opacity 0.2s ease', fontFamily: "'Noto Sans KR', 'Noto Sans SC', 'Noto Sans', sans-serif" }}>

      {/* ─── 카카오맵 (풀 커버) ─── */}
      <div
        ref={mapRef}
        style={{
          position: 'absolute', top: 48, left: 0, right: 0,
          bottom: 0,
          transition: 'bottom 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          touchAction: 'manipulation',
          willChange: 'transform',
        }}
      />

      {/* ─── 지도 탭 클릭 → 바텀 시트 닫기 (backdrop) ─── */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 8,
          pointerEvents: sheetPoi ? 'auto' : 'none',
          background: sheetPoi ? 'rgba(0,0,0,0.15)' : 'transparent',
          transition: 'background 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={() => { closeSheet(); setShowAreaPicker(false) }}
      />

      {/* ─── 메인 카테고리 바 (지도 밖 상단 고정) ─── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: '#FFFFFF', borderBottom: '0.5px solid #F2F4F6' }}>
        <div className="map-cat-bar" style={{ display: 'flex', alignItems: 'center', gap: 24, height: 48, padding: '0 16px', overflowX: 'auto', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <style>{`.map-cat-bar::-webkit-scrollbar { display: none; }`}</style>
          {[
            { id: '_search', label: lang === 'zh' ? '搜索' : lang === 'en' ? 'Search' : '검색', action: () => setShowSearch(true), hasIcon: true },
            { id: '_bookmark', label: lang === 'zh' ? '关注' : lang === 'en' ? 'Liked' : '관심', action: () => { setShowHistoryPanel(true); setShowAreaPicker(false) } },
            ...CATEGORY_CHIPS.map(c => ({ id: c.id, label: tLang(c.key, lang), action: () => { setActiveCategory(c.id); if (c.id !== 'michelin') setMichelinFilter('all'); if (c.id !== 'food') setFoodCategoryFilter('all'); closeSheet(); exitTourbusMode(); setShowAllPanel(false) } })),
            { id: '_tourbus', label: 'Tourbus', action: () => { if (tourbusMode) exitTourbusMode(); else { setTourbusMode(true); closeSheet() } } },
          ].map(item => {
            const isActive = item.id === '_tourbus' ? tourbusMode
              : item.id === '_search' || item.id === '_bookmark' ? false
              : activeCategory === item.id && !tourbusMode
            return (
              <button key={item.id} onClick={item.action}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '14px 0', flexShrink: 0,
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#191F28' : '#8B95A1',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, whiteSpace: 'nowrap',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.hasIcon && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>}
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>


        {/* ─── 투어버스 노선 서브필터 (플로팅) ─── */}
        {tourbusMode && (
          <div style={{ position: 'absolute', top: 52, left: 0, right: 0, zIndex: 9, display: 'flex', gap: 6, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveRouteIds([])}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 20,
                background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: 'none',
                color: activeRouteIds.length === 0 ? '#191F28' : '#8B95A1',
                fontSize: 12, fontWeight: activeRouteIds.length === 0 ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {lang === 'zh' ? '全部' : lang === 'en' ? 'All' : '전체'}
            </button>
            {TOURBUS_ROUTES.map(route => {
              const active = activeRouteIds.includes(route.id)
              return (
                <button
                  key={route.id}
                  onClick={() => setActiveRouteIds(prev => active ? prev.filter(id => id !== route.id) : [...prev, route.id])}
                  style={{
                    flexShrink: 0, padding: '8px 14px', borderRadius: 20,
                    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: active ? `2px solid ${route.color}` : 'none',
                    color: active ? '#191F28' : '#8B95A1',
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                  }}
                >
                  {(() => { const l = getRouteDisplayLabel(route); return l[lang] || l.ko })()}
                </button>
              )
            })}
          </div>
        )}

        {/* ─── Food 서브카테고리 필터 (플로팅) ─── */}
        {activeCategory === 'food' && !tourbusMode && (
          <div style={{ position: 'absolute', top: 52, left: 0, right: 0, zIndex: 9, display: 'flex', gap: 6, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}>
            {/* 미슐랭 */}
            {[
              { id: 'michelin', icon: '⭐', label: { ko: '미슐랭', zh: '米其林', en: 'Michelin' }, color: '#DC2626' },
              { id: 'blueribbon', icon: '🎗️', label: { ko: '블루리본', zh: '蓝带', en: 'Blue Ribbon' }, color: '#2563EB' },
            ].map(special => {
              const active = foodCategoryFilter === special.id
              return (
                <button
                  key={special.id}
                  onClick={() => setFoodCategoryFilter(active ? 'all' : special.id)}
                  style={{
                    flexShrink: 0, padding: '8px 14px', borderRadius: 20,
                    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: active ? `2px solid ${special.color}` : 'none',
                    color: active ? '#191F28' : '#8B95A1',
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    transition: 'all 0.2s', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {special.label?.[lang] || special.label?.ko}
                </button>
              )
            })}
            {/* 일반 음식 카테고리 — 토글 방식 (선택 해제 = 전체) */}
            {FOOD_CATEGORIES.map(cat => {
              const active = foodCategoryFilter === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setFoodCategoryFilter(active ? 'all' : cat.id)}
                  style={{
                    flexShrink: 0, padding: '8px 14px', borderRadius: 20,
                    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: 'none',
                    color: active ? '#191F28' : '#8B95A1',
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    boxShadow: active ? '0 2px 6px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'all 0.15s ease', cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.icon} {cat.label?.[lang] || cat.label?.ko || ''}
                </button>
              )
            })}
          </div>
        )}

      {/* ─── 찜 목록 왼쪽 슬라이드 패널 ─── */}
      {showHistoryPanel && (
        <>
          {/* 오버레이 — 지도 영역 안에서만 */}
          <div
            onClick={() => setShowHistoryPanel(false)}
            style={{ position: 'absolute', top: 48, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.15)', zIndex: 15, transition: 'opacity 0.2s' }}
          />
          {/* 관심 장소 패널 — 상단탭 아래, 하단탭 위 */}
          <div style={{
            position: 'absolute', top: 48, left: 0, bottom: 0, width: '72%', maxWidth: 300,
            background: '#FFFFFF', zIndex: 16, borderTopRightRadius: 16, borderBottomRightRadius: 16,
            boxShadow: '4px 0 20px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column',
            animation: 'nearSlideInLeft 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #F2F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#191F28' }}>
                {lang === 'zh' ? '我的关注' : lang === 'en' ? 'Liked Places' : '관심 장소'}
              </span>
              <button onClick={() => setShowHistoryPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#8B95A1', padding: 4 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
              {bookmarks.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: '#8B95A1', fontSize: 13 }}>
                  {lang === 'zh' ? '还没有关注的地点' : lang === 'en' ? 'No liked places yet' : '아직 관심 장소가 없어요'}
                </div>
              ) : allPins.filter(p => bookmarks.includes(p.id)).map((place, i) => {
                const placeName = getLocalizedName(place, lang)
                const catLabel = place.category ? tLang(`cat_${place.category}`, lang) : ''
                const breadcrumb = catLabel || ''

                return (
                  <button
                    key={`${place.id}-${i}`}
                    onClick={() => {
                      // 패널은 유지 — 지도 이동 + 상세 카드 열기
                      if (place.lat && place.lng && mapInstance.current) {
                        mapInstance.current.panTo(new window.kakao.maps.LatLng(place.lat, place.lng))
                      }
                      selectPin(place)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                      padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
                      borderBottom: '1px solid #F5F5F5', transition: 'background 0.1s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#FFFFFF'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                  >
                    {/* 썸네일 */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                      background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {place.image ? (
                        <img src={place.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      ) : (
                        <span style={{ fontSize: 20 }}>
                          {place.award?.startsWith('michelin') ? '⭐' : place.award === 'bib' ? '🍽️' : place.award === 'blueribbon' ? '🎗️' : place.category === 'food' ? '🍴' : place.category === 'fashion' ? '👗' : place.category === 'cafe' ? '☕' : place.category === 'popup' ? '🎪' : '📍'}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#191F28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{placeName}</div>
                      {breadcrumb && (
                        <div style={{ fontSize: 11, color: '#ABABAB', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {breadcrumb}
                        </div>
                      )}
                      {place.area && (
                        <div style={{ fontSize: 10, color: '#8B95A1', marginTop: 1 }}>{place.area}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          <style>{`@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } } @keyframes nearSlideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes tourbus-glow { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.5); opacity: 0; } }`}</style>
        </>
      )}

      {/* B/% 버튼은 투어버스 서브필터 바로 이동됨 */}


      {/* ─── 좌상단: 지역 선택 (서브필터 있으면 아래로 밀림) ─── */}
      <div style={{ position: 'absolute', top: (tourbusMode || (activeCategory === 'food' && !tourbusMode)) ? 92 : 56, left: 12, zIndex: 9, transition: 'top 0.3s ease' }}>
        <div style={{ position: 'relative' }}>
          {/* > 버튼 — 열리면 90도 회전 */}
          <button
            onClick={() => { setShowAreaPicker(v => !v); setShowRecent(false) }}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: selectedDistrict ? '#3182F6' : 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              color: selectedDistrict ? 'white' : '#191F28',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: showAreaPicker ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
          {/* 지역 목록 — slideDown + fadeIn */}
          <div style={{
            position: 'absolute', top: 46, left: 0, zIndex: 99, minWidth: 150,
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            padding: '6px 0',
            opacity: showAreaPicker ? 1 : 0,
            transform: showAreaPicker ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
            pointerEvents: showAreaPicker ? 'auto' : 'none',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}>
            {QUICK_AREAS.map(area => (
              <button key={area.id} onClick={() => { moveToArea(area); setShowAreaPicker(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: selectedDistrict === area.district ? 600 : 400,
                  color: selectedDistrict === area.district ? '#3182F6' : '#191F28',
                  transition: 'all 0.15s',
                }}
              >
                {t(area.key)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 좌하단: 내 위치 ─── */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10 }}>
        {/* 내 위치 */}
        <button
          onClick={() => {
            if (!navigator.geolocation) return
            navigator.geolocation.getCurrentPosition(
              p => {
                if (!mapInstance.current) return
                mapInstance.current.setCenter(new window.kakao.maps.LatLng(p.coords.latitude, p.coords.longitude))
                mapInstance.current.setLevel(3)
              },
              () => {}
            )
          }}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#191F28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l19-9-9 19-2-8-8-2z"/>
          </svg>
        </button>
      </div>


      {/* ─── 전체 슬라이드 패널 ─── */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '40%',
          background: 'white', zIndex: 12,
          transform: showAllPanel ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '6px 0 24px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column',
        }}
        onTouchEnd={e => e.stopPropagation()}
      >
        <div style={{ padding: '72px 14px 10px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8B95A1', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            {tLang('cat_all', lang)}
          </p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredPins.slice(0, 40).map(pin => (
            <button
              key={pin.id}
              onClick={() => { selectPin(pin); setShowAllPanel(false) }}
              style={{
                width: '100%', padding: '11px 14px', textAlign: 'left',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, color: '#191F28', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pin.name_ko || pin.name_zh}
              </p>
              {pin.category && (
                <p style={{ fontSize: 11, color: '#8B95A1', margin: '2px 0 0' }}>
                  {pin.category}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
      {showAllPanel && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 11 }}
          onClick={() => setShowAllPanel(false)}
        />
      )}

      {/* ─── 바텀 시트 ─── */}
      <div
        ref={sheetRef}
        onTouchStart={tourbusMode ? undefined : onDragStart}
        onTouchMove={tourbusMode ? undefined : onDragMove}
        onTouchEnd={tourbusMode ? undefined : onDragEnd}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
          maxHeight: '50vh',
          height: tourbusMode ? '50dvh' : '68dvh',
          willChange: 'transform',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          background: '#FFFFFF', borderRadius: '16px 16px 0 0',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
          overflowX: 'hidden',
          overflowY: isExpanded || tourbusMode ? 'auto' : 'hidden',
        }}
      >
        {/* 투어버스 정류장 바텀시트 — 최우선 */}
        {tourbusMode && sheetPoi?.category === 'tourbus' ? (
          <TourbusStopSheet
            stop={sheetPoi}
            route={sheetPoi._tourbusRoute}
            stopNum={sheetPoi._stopNum}
            lang={lang}
            onClose={closeSheet}
            onExit={exitTourbusMode}
          />
        ) : isExpanded && sheetPoi ? (
          sheetPoi._restaurant ? (
            <MichelinSheetContent
              poi={sheetPoi}
              restaurant={sheetPoi._restaurant}
              lang={lang}
              onClose={closeSheet}
              userPos={userPos}
            />
          ) : (
          <ExpandedSheetContent
            poi={sheetPoi}
            lang={lang}
            bookmarks={bookmarks}
            onBookmark={toggleBookmark}
            onClose={closeSheet}
            onNavigate={(p) => setNavPoi(p)}
            onReserve={(p) => setReservationPoi(p)}
            onTaxi={(p) => setTaxiPoi(p)}
            userPos={userPos}
            statusTick={statusTick}
          />
          )
        ) : tourbusMode ? (
          <TourbusRouteList
            routes={activeRouteIds.length > 0 ? TOURBUS_ROUTES.filter(r => activeRouteIds.includes(r.id)) : TOURBUS_ROUTES}
            lang={lang}
            onSelectStop={(stop, route, num) => {
              setActivePopup({ ...stop, _tourbusRoute: route, _stopNum: num, id: stop.id, name_ko: stop.name.ko, name_zh: stop.name.zh, name_en: stop.name.en, lat: stop.lat, lng: stop.lng, category: 'tourbus' })
              if (mapInstance.current) mapInstance.current.panTo(new window.kakao.maps.LatLng(stop.lat, stop.lng))
            }}
            onExit={exitTourbusMode}
          />
        ) : (
          <>
            {/* 핸들바 + 목록 버튼 */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 6px' }}>
              <div style={{ flex: 1 }} />
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--text-hint)' }} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowList(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 8px', fontSize: 12, fontWeight: 600, color: '#8B95A1', display: 'flex', alignItems: 'center', gap: 3 }}
                >
                  {lang === 'zh' ? '列表' : lang === 'en' ? 'List' : '목록'} ›
                </button>
              </div>
            </div>

            {pinsError ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{tLang('net_error', lang)}</div>
                <button
                  onClick={() => window.location.reload()}
                  style={{ fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--text-primary)', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
                >{tLang('retry', lang)}</button>
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
                lang={lang}
                onExpand={() => { selectPin(sheetPoi); snapSheet(true) }}
              />
            ) : (
              <NearbyHotFallback pins={hotFallback} lang={lang} onSelect={selectPin} />
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
          lang={lang}
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
          lang={lang}
          onSelectPoi={(poi) => {
            setShowSearch(false)
            if (poi.name || poi.place_name) addMapRecent(poi.name || poi.place_name)
            if (taxiFromFab) {
              setTaxiFromFab(false)
              setTaxiPoi(poi)
              return
            }
            // 임시 검색 핀 추가 (allPins에 없는 외부 검색 결과)
            const isExternalResult = poi.source === 'local' || poi.source === 'kakao'
            if (isExternalResult && poi.lat && poi.lng && mapInstance.current && window.kakao?.maps) {
              // 기존 임시 핀 제거
              if (tempSearchMarkerRef.current) {
                tempSearchMarkerRef.current.setMap(null)
                tempSearchMarkerRef.current = null
              }
              // 기존 오버레이 opacity 초기화
              overlaysRef.current.forEach(({ el }) => {
                const wrapper = el?.querySelector('[data-poi]')
                if (wrapper) { wrapper.style.transform = 'scale(1)'; wrapper.style.opacity = '1' }
              })
              // 새 임시 핀 생성
              const pos = new window.kakao.maps.LatLng(poi.lat, poi.lng)
              const el = document.createElement('div')
              el.innerHTML = `<div style="width:22px;height:22px;background:#3182F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(49,130,246,0.5);transform:scale(1);transition:transform 0.2s"></div>`
              const overlay = new window.kakao.maps.CustomOverlay({ position: pos, content: el, zIndex: 5 })
              overlay.setMap(mapInstance.current)
              tempSearchMarkerRef.current = overlay
              mapInstance.current.panTo(pos)
            }
            selectPin(poi)
          }}
          onClose={() => { setShowSearch(false); setTaxiFromFab(false) }}
        />
      )}

      {/* ─── 예약 시트 ─── */}
      {reservationPoi && (
        <ReservationSheet
          poi={reservationPoi}
          lang={lang}
          onClose={() => setReservationPoi(null)}
        />
      )}

      {/* ─── 내 정보 패널 ─── */}
      {showMyPanel && (
        <NearMyPanel
          lang={lang}
          bookmarks={bookmarks}
          allPins={allPins}
          onClose={() => setShowMyPanel(false)}
          onSelectPoi={selectPin}
        />
      )}

      {/* ─── 길찾기 화면 ─── */}
      {navPoi && (
        <NavScreen poi={navPoi} onClose={() => setNavPoi(null)} lang={lang} />
      )}

      {/* ─── 택시 카드 화면 ─── */}
      {taxiPoi && (
        <TaxiCardView
          poi={taxiPoi}
          lang={lang}
          userPos={userPos}
          onClose={() => { setTaxiPoi(null); setTaxiFromFab(false) }}
        />
      )}
    </div>
  )
}

// ─── 미슐랭 바텀 시트 ───
function MichelinSheetContent({ poi, restaurant, lang, onClose, userPos }) {
  const r = restaurant
  const pinCfg = MICHELIN_PIN_CONFIG[r.award] || MICHELIN_PIN_CONFIG.michelin1
  const name = lang === 'zh' ? r.name?.zh : lang === 'en' ? r.name?.en : r.name?.ko
  const priceLabel = r.priceRange ? '₩'.repeat(r.priceRange) : ''

  const awardLabel = {
    michelin3: { ko: '미슐랭 3스타', zh: '米其林三星', en: 'Michelin 3-Star' },
    michelin2: { ko: '미슐랭 2스타', zh: '米其林二星', en: 'Michelin 2-Star' },
    michelin1: { ko: '미슐랭 1스타', zh: '米其林一星', en: 'Michelin 1-Star' },
    bib:       { ko: '빕 구르망',    zh: '必比登推荐', en: 'Bib Gourmand' },
    blue:      { ko: '블루리본',     zh: '蓝带推荐',   en: 'Blue Ribbon' },
  }[r.award] || {}

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* 핸들바 + 닫기 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px 8px' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#DDDDDD' }} />
        </div>
        <button onClick={onClose} style={{ color: '#8B95A1', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 8px', lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {/* 이름 */}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#191F28', margin: '0 0 6px' }}>
          {name || r.name?.ko}
        </h2>

        {/* 수상 뱃지 + 가격대 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: 'white', background: pinCfg.color,
            borderRadius: 6, padding: '3px 8px',
          }}>
            {pinCfg.emoji} {awardLabel[lang] || awardLabel.en}
          </span>
          {priceLabel && (
            <span style={{ fontSize: 12, color: '#8B95A1', fontWeight: 600 }}>{priceLabel}</span>
          )}
        </div>

        {/* 지역 */}
        <div style={{ fontSize: 13, color: '#8B95A1', marginBottom: 14 }}>
          📍 {r.area?.city} {r.area?.gu} {r.area?.dong || ''}
        </div>

        {/* 이미지 */}
        {r.images?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, scrollbarWidth: 'none' }}>
            {r.images.slice(0, 3).map((img, i) => (
              <div key={i} style={{ width: 120, height: 90, borderRadius: 12, overflow: 'hidden', flexShrink: 0, boxShadow: '4px 4px 10px rgba(200,200,200,0.4)' }}>
                <img src={img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}

        {/* CTA 버튼 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => openKakaoMapRoute(r.lat, r.lng, r.name?.ko || '', 'PUBLICTRANSIT')}
            style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#191F28', color: 'white', border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 10px rgba(0,0,0,0.15)', transition: 'transform 0.15s ease' }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {{ ko: '길찾기', zh: '导航', en: 'Navigate' }[lang] || 'Navigate'}
          </button>
          <button
            onClick={() => openKakaoTaxi(r.lat, r.lng, r.name?.ko || '', userPos)}
            style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: pinCfg.color, color: 'white', border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `4px 4px 10px ${pinCfg.color}40`, transition: 'transform 0.15s ease' }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {{ ko: '택시', zh: '打车', en: 'Taxi' }[lang] || 'Taxi'}
          </button>
          {r.catchTableUrl && (
            <button
              onClick={() => window.open(r.catchTableUrl, '_blank')}
              style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#FFFFFF', color: pinCfg.color, border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF', transition: 'transform 0.15s ease' }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {tLang('michelin_reserve', lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 확장 바텀 시트 내용 ───
function ExpandedSheetContent({ poi, lang, bookmarks, onBookmark, onClose, onNavigate, onReserve, onTaxi, userPos, statusTick }) {
  const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
  const tags = calcTags(poi, lang)
  // statusTick이 변할 때마다 재계산 (lint: eslint-disable-next-line no-unused-expressions)
  void statusTick
  const status = getBusinessStatus(poi)
  const isBookmarked = bookmarks.includes(poi.id)
  const dist = distLabel(poi)
  const [copied, setCopied] = useState(false)
  const [addrLang, setAddrLang] = useState('ko')

  const handleCopyAddress = () => {
    const addr = addrLang === 'zh'
      ? (poi.address_zh || poi.address_ko || '')
      : (poi.address_ko || poi.address_zh || '')
    const text = addr || poi.name_ko || ''
    const doWrite = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }
    navigator.clipboard?.writeText(text).then(doWrite).catch(() => {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el)
      doWrite()
    })
  }

  const handleNavigate = () => onNavigate(poi)

  const address = getLocalizedAddress(poi, lang) || poi.address_ko || poi.address_zh || poi.address || ''
  const catLabel = poi.category ? (CATEGORY_CONFIG[poi.category]?.letter || poi.category) : ''

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* 핸들바 + 닫기 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px 8px' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#DDDDDD' }} />
        </div>
        <button onClick={onClose} style={{ color: '#8B95A1', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 8px', lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        {/* 이름 + NEW 뱃지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#191F28', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getLocalizedName(poi, lang)}
          </h2>
          {isNewPoi(poi.created_at) && (
            <span style={{ fontSize: 9, background: '#FF3141', color: 'white', borderRadius: 4, padding: '1px 5px', fontWeight: 700, flexShrink: 0 }}>
              {tLang('badge_new', lang)}
            </span>
          )}
        </div>

        {/* 종류 + 거리 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: address ? 6 : 8 }}>
          {poi.category && (
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.color + '18', borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>
              {catLabel}
            </span>
          )}
          {dist && <span style={{ fontSize: 12, color: '#8B95A1' }}>{dist}</span>}
        </div>

        {/* 주소 — 한 번만 */}
        {address ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#8B95A1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📍 {address}
            </span>
            <button
              onClick={handleCopyAddress}
              style={{
                flexShrink: 0, padding: '5px 10px', borderRadius: 10,
                background: copied ? 'rgba(22,163,74,0.1)' : '#FFFFFF',
                border: 'none',
                boxShadow: copied ? 'none' : '3px 3px 8px rgba(200,200,200,0.5), -3px -3px 8px #FFFFFF',
                color: copied ? '#16A34A' : '#8B95A1',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? '✓' : lang === 'zh' ? '复制' : '복사'}
            </button>
          </div>
        ) : null}

        {/* 운영 기간 */}
        {poi.is_temporary && poi.start_date && poi.end_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#8B95A1' }}>{poi.start_date} – {poi.end_date}</span>
          </div>
        )}

        {/* 영업 시간 */}
        {poi.open_time && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#444' }}>{poi.open_time}–{poi.close_time}</span>
            {status === 'open' && <span style={{ fontSize: 10, background: '#DCFCE7', color: '#16A34A', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>{tLang('status_open', lang)}</span>}
            {status === 'closed' && <span style={{ fontSize: 10, background: '#FEE2E2', color: '#DC2626', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>{tLang('status_closed', lang)}</span>}
            {status === 'coming' && <span style={{ fontSize: 10, background: '#FFFBEB', color: '#D97706', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>{tLang('status_coming', lang)}</span>}
          </div>
        )}

        {/* 웨이팅 */}
        {poi.wait_minutes != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>⏳</span>
            <span style={{ fontSize: 13, color: '#444' }}>{tLang('wait_prefix', lang)}{poi.wait_minutes}{tLang('wait_suffix', lang)}</span>
          </div>
        )}

        {/* 태그 */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {tags.map(tag => <TagPill key={tag.label} label={tag.label} bg={tag.bg} color={tag.color} />)}
          </div>
        )}

        {/* CTA 버튼 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => openKakaoMapRoute(poi.lat, poi.lng, poi.name_ko || poi.name_zh || '', 'PUBLICTRANSIT')}
            style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#191F28', color: 'white', border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 10px rgba(0,0,0,0.15)', transition: 'transform 0.15s ease' }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {{ ko: '대중교통', zh: '公共交通', en: 'Bus/Subway' }[lang] || 'Bus/Subway'}
          </button>
          <button
            onClick={() => openKakaoTaxi(poi.lat, poi.lng, poi.name_ko || poi.name_zh || '', userPos)}
            style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#3182F6', color: 'white', border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 10px rgba(49,130,246,0.3)', transition: 'transform 0.15s ease' }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {tLang('taxi_mode', lang)}
          </button>
          {poi.has_reservation && (
            <button
              onClick={() => onReserve(poi)}
              style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#FFFFFF', color: '#3182F6', border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF', transition: 'transform 0.15s ease' }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {tLang('reserve', lang)}
            </button>
          )}
          <button
            onClick={() => onBookmark(poi)}
            style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', border: 'none', borderRadius: 14, cursor: 'pointer', flexShrink: 0, boxShadow: isBookmarked ? 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)' : '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF', transition: 'box-shadow 0.15s ease', fontSize: 15, color: isBookmarked ? '#FF3B30' : '#8B95A1' }}
          >
            {isBookmarked ? '♥' : '♡'}
          </button>
        </div>

        {/* 이미지 — 아래쪽, 있을 때만 */}
        {poi.image_url && (
          <div style={{ marginTop: 14, height: 130, borderRadius: 16, overflow: 'hidden', boxShadow: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF' }}>
            <img src={poi.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 축소 상태 카드 ───
function CompactSheetCard({ poi, lang, onExpand }) {
  const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
  const tags = calcTags(poi, lang)
  const dist = distLabel(poi)

  return (
    <button
      onClick={onExpand}
      style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '4px 20px 20px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
    >
      {/* 썸네일 */}
      <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: '#F0F0F0', boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF' }}>
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
            {getLocalizedName(poi, lang)}
          </span>
          {isNewPoi(poi.created_at) && (
            <span style={{ fontSize: 9, background: '#FF3141', color: 'white', borderRadius: 4, padding: '1px 4px', fontWeight: 700, flexShrink: 0 }}>
              {tLang('badge_new', lang)}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getLocalizedAddress(poi, lang)}{dist ? ` · ${dist}` : ''}
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

// ─── 카카오 서비스 로드 ───
function ensureKakaoServices() {
  return new Promise((resolve) => {
    if (window.kakao?.maps?.services) { resolve(); return }
    const key = import.meta.env.VITE_KAKAO_MAP_API_KEY || 'd93decd524c15c3455ff05983ca07fac'
    if (document.querySelector(`script[src*="dapi.kakao.com/v2/maps/sdk.js"]`)) {
      const check = setInterval(() => {
        if (window.kakao?.maps?.services) { clearInterval(check); resolve() }
      }, 200)
      setTimeout(() => { clearInterval(check); resolve() }, 5000)
      return
    }
    const s = document.createElement('script')
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`
    s.onload = () => { window.kakao.maps.load(() => resolve()) }
    document.head.appendChild(s)
  })
}

function detectLang(text) {
  if (/[\u3400-\u9FFF]/.test(text)) {
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja'
    return 'zh'
  }
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja'
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'
  return 'en'
}

async function searchPlacesCombined(query) {
  if (!query || query.length < 1) return []
  const inputLang = detectLang(query)
  const local = searchLocalPlaces(query, 7).map(p => ({
    ...p,
    name: p.ko,
    koName: p.ko,
    nameZh: p.zh,
    nameEn: p.en,
    address: p.address_zh || p.address_ko || '',
    source: 'local',
  }))

  if (inputLang === 'ko' || inputLang === 'en') {
    const hasExtended = local.some(p => p.category)
    if (hasExtended && local.length >= 3) return local
    let kakao = []
    try {
      await ensureKakaoServices()
      if (window.kakao?.maps?.services) {
        kakao = await new Promise((resolve) => {
          const ps = new window.kakao.maps.services.Places()
          ps.keywordSearch(query, (data, status) => {
            if (status !== window.kakao.maps.services.Status.OK) { resolve([]); return }
            resolve((data || []).slice(0, 7).map(doc => ({
              ko: doc.place_name, zh: doc.place_name, en: doc.place_name,
              name: doc.place_name, koName: doc.place_name, nameZh: doc.place_name, nameEn: doc.place_name,
              address: doc.address_name, address_zh: doc.address_name, address_ko: doc.address_name,
              lat: parseFloat(doc.y), lng: parseFloat(doc.x),
              category: doc.category_group_name || null,
              phone: doc.phone || null,
              source: 'kakao',
              kakaoUrl: doc.place_url,
            })))
          })
        })
      }
    } catch(e) {}
    return [...local, ...kakao].slice(0, 10)
  }
  return local
}

// ─── 검색 오버레이 ───
function SearchOverlay({ allPins, lang, onSelectPoi, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('near_searches') || '[]') } catch { return [] }
  })
  const [phIdx, setPhIdx] = useState(0)
  const [phVisible, setPhVisible] = useState(true)
  const inputRef = useRef(null)
  const searchTimerRef = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50) }, [])
  useEffect(() => {
    const iv = setInterval(() => {
      setPhVisible(false)
      setTimeout(() => { setPhIdx(i => (i + 1) % PH_KEYS.length); setPhVisible(true) }, 300)
    }, 3000)
    return () => clearInterval(iv)
  }, [])

  // 300ms 디바운스 비동기 검색
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!query.trim()) { setResults([]); setSearching(false); return }
    setSearching(true)
    searchTimerRef.current = setTimeout(async () => {
      const res = await searchPlacesCombined(query.trim())
      setResults(res)
      setSearching(false)
    }, 300)
    return () => clearTimeout(searchTimerRef.current)
  }, [query])

  const hotPins = [...allPins].sort((a, b) => (b.view_count_7d || 0) - (a.view_count_7d || 0)).slice(0, 5)

  const addRecent = (text) => {
    const next = [text, ...recent.filter(r => r !== text)].slice(0, 5)
    setRecent(next)
    localStorage.setItem('near_searches', JSON.stringify(next))
  }

  const handleSelect = (place) => {
    const displayName = (lang === 'zh' ? place.nameZh || place.zh : lang === 'ko' ? place.ko : place.nameEn || place.en) || place.name || place.ko || ''
    addRecent(displayName)
    // 항상 지도로 이동 — name_ko/name_zh/address_ko/address_zh 필드로 정규화
    onSelectPoi({
      ...place,
      name_ko: place.ko || place.name || place.koName || '',
      name_zh: place.zh || place.nameZh || place.ko || '',
      name_en: place.en || place.nameEn || '',
      address_ko: place.address_ko || place.address || '',
      address_zh: place.address_zh || place.address || '',
    })
  }

  const handlePoiRow = (poi) => {
    addRecent(getLocalizedName(poi, lang))
    onSelectPoi(poi)
  }

  const PoiRow = ({ poi, rank }) => {
    const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
    return (
      <button
        onClick={() => handlePoiRow(poi)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
      >
        <span style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', fontWeight: 700, flexShrink: 0 }}>
          {cfg.letter}
        </span>
        <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getLocalizedName(poi, lang)}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getLocalizedAddress(poi, lang)}</div>
        </div>
        {rank != null && <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>#{rank + 1}</span>}
        {rank == null && <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{distLabel(poi)}</span>}
      </button>
    )
  }

  // 검색 결과 행 (로컬 DB + 카카오)
  const SearchResultRow = ({ place, idx }) => {
    const isLocal = place.source === 'local'
    const isKakao = place.source === 'kakao'
    const hasDetail = place.category && place.lat
    let name = lang === 'zh' ? (place.nameZh || place.zh || place.name) :
                 lang === 'ko' ? (place.ko || place.name) :
                 (place.nameEn || place.en || place.name)
    // '카카오' 등 무성의한 텍스트 치환
    if (!name || name === '카카오' || name === 'kakao') name = lang === 'zh' ? '选择的地点' : lang === 'en' ? 'Selected location' : '선택하신 지점'
    const addr = place.address_zh || place.address_ko || place.address || ''

    return (
      <button
        onClick={() => handleSelect(place)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #F1F1F1', textAlign: 'left' }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0, marginRight: 15,
          background: '#F8F8F8', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#191F28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#000', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </div>
          {addr && <div style={{ fontSize: 13, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addr}</div>}
        </div>
        <span style={{ color: '#CCC', fontSize: 14, flexShrink: 0, marginLeft: 8 }}>›</span>
      </button>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans KR', 'Noto Sans SC', 'Noto Sans', sans-serif" }}>
      {/* 검색 헤더 — 풀 너비 통합 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 20px 10px', background: '#FFFFFF', flexShrink: 0 }}>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          color: '#191F28', display: 'flex', alignItems: 'center',
          fontSize: 18,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{
          flex: 1, background: '#F8F8F8', borderRadius: 22,
          display: 'flex', alignItems: 'center', padding: '0 20px', height: 44,
        }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'zh' ? '想去哪里？' : lang === 'en' ? 'Where to?' : '어디로 떠나고 싶으신가요?'}
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 15, color: '#191F28' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B95A1', padding: 0, fontSize: 14, lineHeight: 1 }}>✕</button>
          )}
        </div>
      </div>

      {/* 결과 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
        {query.trim() === '' ? (
          <>
            {/* 최근 검색 — 정갈한 태그 */}
            {recent.length > 0 && (
              <div style={{ paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#191F28' }}>{tLang('search_recent', lang)}</span>
                  <button
                    onClick={() => { setRecent([]); localStorage.removeItem('near_searches') }}
                    style={{ fontSize: 12, color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}
                  >{tLang('search_clear', lang)}</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {recent.map((r, i) => (
                    <button key={i} onClick={() => setQuery(r)} style={{
                      background: '#F2F2F2', border: 'none', borderRadius: 15,
                      padding: '6px 14px', fontSize: 13, color: '#444', cursor: 'pointer',
                    }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* 인기 장소 — 랭킹 강조형 */}
            <div style={{ paddingTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>{tLang('search_hot', lang)}</div>
              {hotPins.map((poi, i) => (
                <button key={poi.id} onClick={() => handlePoiRow(poi)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #F9F9F9', textAlign: 'left' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#191F28', width: 30, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#191F28', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getLocalizedName(poi, lang)}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{getLocalizedAddress(poi, lang)}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : searching ? (
          <div style={{ paddingTop: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8B95A1' }}>{lang === 'zh' ? '搜索中...' : lang === 'ko' ? '검색 중...' : 'Searching...'}</div>
          </div>
        ) : results.length > 0 ? (
          <div style={{ paddingTop: 8 }}>
            {results.map((place, i) => <SearchResultRow key={`${place.ko || place.name}_${i}`} place={place} idx={i} />)}
          </div>
        ) : (
          <div style={{ paddingTop: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{tLang('search_no_result', lang)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>"{query}"</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🔥 {tLang('nearby_hot', lang)}</div>
              {hotPins.slice(0, 3).map((poi, i) => <PoiRow key={poi.id} poi={poi} rank={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 리스트 뷰 ───
function ListView({ pins, lang, listSort, onSortChange, onSelectPoi, onBack }) {
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
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, "Pretendard", sans-serif' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', background: '#FFFFFF', flexShrink: 0, boxShadow: '0 4px 10px rgba(200,200,200,0.25)' }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#191F28' }}>{tLang('list_title', lang)}</span>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#FFFFFF', border: 'none', borderRadius: 24, padding: '8px 18px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#191F28',
            boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
            transition: 'box-shadow 0.15s ease',
          }}
          onTouchStart={e => e.currentTarget.style.boxShadow = 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)'}
          onTouchEnd={e => e.currentTarget.style.boxShadow = '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF'}
        >
          {tLang('list_back_map', lang)}
        </button>
      </div>
      {/* 정렬 칩 */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 20px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0, background: '#FFFFFF' }}>
        {SORTS.map(s => (
          <button
            key={s.id}
            onClick={() => onSortChange(s.id)}
            style={{
              flexShrink: 0,
              background: '#FFFFFF',
              color: listSort === s.id ? '#3182F6' : '#666666',
              border: 'none', borderRadius: 24, padding: '7px 16px',
              fontSize: 13, fontWeight: listSort === s.id ? 700 : 600, cursor: 'pointer',
              boxShadow: listSort === s.id
                ? 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)'
                : '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
              transition: 'all 0.15s ease',
            }}
          >
            {tLang(s.key, lang)}
          </button>
        ))}
      </div>
      {/* 카드 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
        {sorted.map((poi) => {
          const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
          const tags = calcTags(poi, lang)
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
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getLocalizedName(poi, lang)}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {getLocalizedAddress(poi, lang)}{distLabel(poi) ? ` · ${distLabel(poi)}` : ''}
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

// ─── 투어버스 노선 리스트 (기본 시트) ───
function TourbusRouteList({ routes, lang, onSelectStop, onExit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 10px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>🚌 Seoul City Tour Bus</span>
        </div>
        <button onClick={onExit} style={{ fontSize: 12, color: '#DC2626', background: 'none', border: '1px solid #FCA5A5', borderRadius: 100, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
          {lang === 'zh' ? '关闭' : lang === 'en' ? 'Close' : '닫기'}
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px' }}>
        {routes.map(route => {
          let stopNum = 0
          return (
            <div key={route.id} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: route.color }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#191F28' }}>{(() => { const l = getRouteDisplayLabel(route); return l[lang] || l.ko })()}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, paddingLeft: 20 }}>
                {route.duration?.[lang] || route.duration?.ko || ''}{route.interval ? ` · ${route.interval}${lang === 'zh' ? '分钟间隔' : lang === 'en' ? 'min interval' : '분 간격'}` : ''}
              </div>
              <div style={{ fontSize: 11, color: route.color, fontWeight: 600, marginBottom: 8, paddingLeft: 20 }}>
                {formatFee(route.fee, lang)}
              </div>
              {route.stops.filter(s => !s.noStop).map(stop => {
                stopNum++
                const num = stopNum
                return (
                  <button
                    key={stop.id}
                    onClick={() => onSelectStop(stop, route, num)}
                    style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F3F4F6', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: route.color, color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {stop.isTicketStop ? '⭐' : num}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: stop.isTicketStop ? 700 : 500, color: 'var(--text-primary)' }}>
                      {stop.name[lang] || stop.name.ko}
                    </span>
                    {stop.isTicketStop && (
                      <span style={{ fontSize: 9, background: '#FFD700', color: '#191F28', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>
                        {lang === 'zh' ? '售票处' : lang === 'en' ? 'Ticket' : '매표소'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 투어버스 정거장 상세 시트 ───
function TourbusStopSheet({ stop, route, stopNum, lang, onClose, onExit }) {
  const [showStory, setShowStory] = useState(false)
  if (!stop || !route) return null
  const routeLabel = getRouteDisplayLabel(route)
  const nextArr = getNextArrival(stop)
  const sm = stop.summary
  const storyText = stop.story?.[lang] || stop.story?.ko
  return (
    <div style={{ padding: '12px 20px 24px', maxHeight: '50vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#8B95A1' }} />
      </div>
      {/* 헤더: 정류장명 + 다음 도착 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: route.color, color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stopNum}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#191F28' }}>{stop.name[lang] || stop.name.ko}</div>
            <div style={{ fontSize: 11, color: route.color, fontWeight: 600 }}>{routeLabel[lang] || routeLabel.ko}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: '#8B95A1', padding: 4 }}>✕</button>
      </div>
      {/* 다음 버스 */}
      {nextArr && (
        <div style={{ background: 'rgba(49,130,246,0.1)', borderRadius: 10, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#8B95A1' }}>{lang === 'zh' ? '下一班' : lang === 'en' ? 'Next bus' : '다음 버스'}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#3182F6', transition: 'all 0.2s' }}>{nextArr}</span>
        </div>
      )}
      {/* 매표소 */}
      {stop.isTicketStop && (
        <div style={{ background: '#FEF3C7', borderRadius: 10, padding: '8px 12px', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>{lang === 'zh' ? '售票处' : lang === 'en' ? 'Ticket Office' : '매표소'}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#78350F' }}>{formatFee(route.fee, lang)}</div>
        </div>
      )}
      {/* 요약정보 */}
      {sm && (
        <div style={{ marginBottom: 10 }}>
          {sm.stop && <div style={{ fontSize: 16, color: '#191F28', marginBottom: 3 }}>{sm.stop[lang] || sm.stop.ko}</div>}
          {sm.subway && <div style={{ fontSize: 16, color: '#191F28', marginBottom: 3 }}>{sm.subway[lang] || sm.subway.ko}</div>}
          {sm.address && <div style={{ fontSize: 13, color: '#8B95A1', marginBottom: 3 }}>{sm.address[lang] || sm.address.ko}</div>}
        </div>
      )}
      {/* 주변 관광지 */}
      {stop.nearbySpots?.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#8B95A1', marginBottom: 4 }}>{lang === 'zh' ? '周边景点' : lang === 'en' ? 'Nearby' : '주변 관광지'}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {stop.nearbySpots.map((s, i) => (
              <span key={i} style={{ fontSize: 11, color: '#3182F6', background: 'rgba(49,130,246,0.1)', padding: '3px 8px', borderRadius: 10, fontWeight: 500, transition: 'all 0.2s' }}>{s.name[lang] || s.name.ko}</span>
            ))}
          </div>
        </div>
      )}
      {/* 자세히 보기 (story) */}
      {storyText && (
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setShowStory(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#8B95A1', padding: 0, transition: 'all 0.2s' }}>
            {showStory ? (lang === 'zh' ? '收起' : lang === 'en' ? 'Less' : '접기') : (lang === 'zh' ? '详细' : lang === 'en' ? 'More' : '자세히 보기')} {showStory ? '▲' : '▼'}
          </button>
          {showStory && <div style={{ fontSize: 12, color: '#8B95A1', lineHeight: 1.6, marginTop: 6 }}>{storyText}</div>}
        </div>
      )}
      {/* 전체 정류장 */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#8B95A1', marginBottom: 4 }}>{lang === 'zh' ? '全部站点' : lang === 'en' ? 'All Stops' : '전체 정류장'}</div>
        {route.stops.filter(s => !s.noStop).map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #F0EDED', opacity: s.id === stop.id ? 1 : 0.5 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.id === stop.id ? route.color : '#F2F4F6', color: s.id === stop.id ? 'white' : '#8B95A1', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
            <span style={{ fontSize: 11, color: '#191F28', fontWeight: s.id === stop.id ? 700 : 400, flex: 1 }}>{s.name[lang] || s.name.ko}</span>
            {s.timetable?.[0] && <span style={{ fontSize: 9, color: '#8B95A1' }}>{s.timetable[0]}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 예약 시트 ───
function ReservationSheet({ poi, lang, onClose }) {
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
      poi_name: getLocalizedName(poi, lang),
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
      <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ fontSize: 52 }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{tLang('reserve_success', lang)}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{getLocalizedName(poi, lang)} · {selDate} {selTime} · {count}{tLang('res_people', lang)}</div>
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, "Pretendard", sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FFFFFF', flexShrink: 0, boxShadow: '0 4px 10px rgba(200,200,200,0.25)' }}>
        <button onClick={onClose} style={{ background: '#FFFFFF', border: 'none', cursor: 'pointer', padding: 10, borderRadius: '50%', color: '#191F28', display: 'flex', boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF', transition: 'box-shadow 0.15s ease', fontSize: 20, fontWeight: 'bold' }}>
          ←
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>{getLocalizedName(poi, lang)} · {tLang('reserve', lang)}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 16px' }}>
        {/* 날짜 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{tLang('reserve_date', lang)}</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {dates.map(d => {
              const dt = new Date(d); const active = selDate === d
              return (
                <button key={d} onClick={() => setSelDate(d)} style={{
                  flexShrink: 0, width: 52, padding: '8px 0', borderRadius: 16, textAlign: 'center',
                  background: '#FFFFFF',
                  color: active ? '#3182F6' : '#374151',
                  border: 'none', cursor: 'pointer',
                  boxShadow: active
                    ? 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)'
                    : '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
                  fontWeight: active ? 700 : 400,
                  transition: 'all 0.15s ease',
                }}>
                  <div style={{ fontSize: 10, color: '#8B95A1' }}>{DAY_ZH[dt.getDay()]}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{dt.getDate()}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 시간 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{tLang('reserve_time', lang)}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {timeSlots.map(slot => (
              <button key={slot} onClick={() => setSelTime(slot)} style={{
                padding: '8px 16px', borderRadius: 24,
                background: '#FFFFFF',
                color: selTime === slot ? '#3182F6' : '#374151',
                border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: selTime === slot ? 700 : 500,
                boxShadow: selTime === slot
                  ? 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)'
                  : '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
                transition: 'all 0.15s ease',
              }}>{slot}</button>
            ))}
          </div>
        </div>

        {/* 인원 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{tLang('reserve_people', lang)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setCount(c => Math.max(1, c - 1))} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#FFFFFF', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF', transition: 'box-shadow 0.15s ease', color: '#191F28' }}>−</button>
            <span style={{ fontSize: 20, fontWeight: 700, minWidth: 28, textAlign: 'center', color: '#191F28' }}>{count}</span>
            <button onClick={() => setCount(c => Math.min(6, c + 1))} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#FFFFFF', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF', transition: 'box-shadow 0.15s ease', color: '#191F28' }}>+</button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{count} {tLang('res_people', lang)}</span>
          </div>
        </div>

        <button onClick={handleConfirm} style={{ width: '100%', height: 52, borderRadius: 16, background: '#3182F6', color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '6px 6px 14px rgba(49,130,246,0.3), -4px -4px 10px rgba(255,255,255,0.8)', transition: 'box-shadow 0.15s ease, transform 0.15s ease' }}>
          {tLang('reserve_confirm', lang)}
        </button>
      </div>
    </div>
  )
}

// ─── 내 정보 패널 (업그레이드: 예약 3탭 + near_bookings_v2 통합) ───
function NearMyPanel({ lang, bookmarks, allPins, onClose, onSelectPoi }) {
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
    <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, "Pretendard", sans-serif' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FFFFFF', flexShrink: 0, boxShadow: '0 4px 10px rgba(200,200,200,0.25)' }}>
        <button onClick={onClose} style={{ background: '#FFFFFF', border: 'none', cursor: 'pointer', padding: 10, borderRadius: '50%', color: '#191F28', display: 'flex', boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF', transition: 'box-shadow 0.15s ease', fontSize: 20, fontWeight: 'bold' }}>
          ←
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>{tLang('my_panel', lang)}</span>
      </div>

      {/* 섹션 탭 */}
      <div style={{ display: 'flex', background: '#FFFFFF', flexShrink: 0, padding: '8px 16px 0', gap: 4 }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            flex: 1, padding: '10px 4px', fontSize: 12, fontWeight: 600,
            background: '#FFFFFF', border: 'none', cursor: 'pointer',
            color: activeSection === s.id ? '#3182F6' : '#9CA3AF',
            borderBottom: activeSection === s.id ? '2px solid #3182F6' : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}>
            {tLang(s.key, lang)}
          </button>
        ))}
      </div>

      {/* 내용 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>

        {activeSection === 'reservations' && (
          <>
            {/* 예약 상태 필터 */}
            <div style={{ display: 'flex', gap: 6, padding: '12px 0 8px', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              {RES_FILTERS.map(f => (
                <button key={f.id} onClick={() => setResFilter(f.id)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: resFilter === f.id ? '#191F28' : '#F3F4F6', color: resFilter === f.id ? 'white' : '#6B7280', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
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
                          <div style={{ fontSize: 11, color: '#3182F6', marginTop: 2, fontWeight: 600 }}>
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
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{tLang('bookmark_empty', lang)}</div>
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
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getLocalizedName(poi, lang)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{getLocalizedAddress(poi, lang)}</div>
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
                {localLang === lang.code && <span style={{ fontSize: 16, color: '#191F28', fontWeight: 700 }}>✓</span>}
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
function NearbyHotFallback({ pins, lang, onSelect }) {
  return (
    <div style={{ padding: '4px 16px 20px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.02em' }}>
        🔥 {tLang('nearby_hot', lang)}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pins.map(poi => {
          const cfg = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.popup
          const tags = calcTags(poi, lang)
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
                  {getLocalizedName(poi, lang)}
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
