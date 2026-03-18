import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Navigation, Info } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import {
  POI_DATA,
  POI_CATEGORIES,
  isNewPOI,
  calcDistance,
  formatDistance,
} from '../data/poiData'

// ─── GPS 헬퍼 ────────────────────────────────────────────────────
const getPosition = async (options = {}) => {
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.checkPermissions()
    if (perm.location === 'denied') {
      const req = await Geolocation.requestPermissions()
      if (req.location === 'denied') throw { code: 1, message: 'Permission denied' }
    }
    return Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000, ...options })
  }
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options,
    })
  )
}

// ─── KakaoMap 로더 ───────────────────────────────────────────────
const loadKakaoMap = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => resolve(window.kakao))
      return
    }
    const key = import.meta.env.VITE_KAKAO_MAP_API_KEY
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// ─── 카테고리 칩 설정 ─────────────────────────────────────────────
const CHIPS = [
  { id: 'popup',   zh: '快闪店', ko: '팝업', en: 'Pop-up' },
  { id: 'food',    zh: '美食',   ko: '맛집', en: 'Food' },
  { id: 'fashion', zh: '时尚',   ko: '패션', en: 'Fashion' },
  { id: 'cafe',    zh: '咖啡',   ko: '카페', en: 'Cafe' },
  { id: 'utility', zh: '便利',   ko: '편의', en: 'Utility' },
]

// ─── 핀 SVG HTML 생성 ─────────────────────────────────────────────
function makePinHTML(category, isNew = false) {
  const cat = POI_CATEGORIES[category]
  if (!cat) return ''
  const color = cat.color
  const letter = cat.letter

  const badge = isNew
    ? `<div style="position:absolute;top:-6px;right:-6px;background:#E24B4A;color:#fff;font-size:8px;font-weight:700;padding:1px 4px;border-radius:4px;line-height:14px;white-space:nowrap;z-index:1;">NEW</div>`
    : ''

  return `
    <div style="position:relative;width:36px;height:42px;cursor:pointer;">
      ${badge}
      <div style="
        width:28px;height:28px;
        background:${color};
        border:2px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        position:absolute;top:0;left:4px;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          color:#fff;font-size:11px;font-weight:700;
          font-family:'Inter',sans-serif;
          line-height:1;
        ">${letter}</span>
      </div>
    </div>
  `
}

// ─── 선택된 핀 HTML (크게) ───────────────────────────────────────
function makeActivePinHTML(category, isNew = false) {
  const cat = POI_CATEGORIES[category]
  if (!cat) return ''
  const color = cat.color
  const letter = cat.letter

  const badge = isNew
    ? `<div style="position:absolute;top:-8px;right:-8px;background:#E24B4A;color:#fff;font-size:8px;font-weight:700;padding:1px 4px;border-radius:4px;line-height:14px;white-space:nowrap;z-index:1;">NEW</div>`
    : ''

  return `
    <div style="position:relative;width:44px;height:52px;cursor:pointer;">
      ${badge}
      <div style="
        width:36px;height:36px;
        background:${color};
        border:3px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        position:absolute;top:0;left:4px;
        box-shadow:0 4px 12px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          color:#fff;font-size:14px;font-weight:700;
          font-family:'Inter',sans-serif;
          line-height:1;
        ">${letter}</span>
      </div>
    </div>
  `
}

// ─── 내 위치 마커 HTML ────────────────────────────────────────────
const USER_LOCATION_HTML = `
  <div style="
    width:14px;height:14px;
    background:#378ADD;
    border:3px solid #fff;
    border-radius:50%;
    box-shadow:0 0 0 4px rgba(55,138,221,0.25);
  "></div>
`

// ─── 포맷 헬퍼 ───────────────────────────────────────────────────
function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  return `${h}:${m}`
}

function formatDateRange(start, end) {
  if (!start) return ''
  const s = start.replace(/-/g, '.').slice(5) // MM.DD
  if (!end) return s
  const e = end.replace(/-/g, '.').slice(5)
  return `${s} ~ ${e}`
}

// ─── 바텀시트 스켈레톤 ────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-16 h-16 rounded-[10px] bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2.5 bg-gray-200 rounded w-1/2" />
        <div className="h-2 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────
export default function MapTab({ lang = 'zh' }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const overlaysRef = useRef([]) // 현재 렌더된 핀 overlay 목록
  const userOverlayRef = useRef(null)

  const [mapReady, setMapReady] = useState(false)
  const [userLocation, setUserLocation] = useState(null) // { lat, lng }
  const [selectedCategory, setSelectedCategory] = useState('popup') // 기본: 快闪店
  const [selectedPOI, setSelectedPOI] = useState(null)
  const [nearestPOI, setNearestPOI] = useState(null)
  const [loading, setLoading] = useState(true)

  // 카테고리 필터 + 최대 7개 표시 (거리순 + sort_priority)
  const getVisiblePOIs = useCallback(
    (category, userLat, userLng) => {
      const filtered = POI_DATA.filter((p) => p.category === category)
      if (!userLat || !userLng) {
        return filtered
          .sort((a, b) => b.sort_priority - a.sort_priority)
          .slice(0, 7)
      }
      return filtered
        .map((p) => ({
          ...p,
          _dist: calcDistance(userLat, userLng, p.lat, p.lng),
        }))
        .sort((a, b) => {
          const priorityDiff = b.sort_priority - a.sort_priority
          if (Math.abs(priorityDiff) >= 3) return -priorityDiff
          return a._dist - b._dist
        })
        .slice(0, 7)
    },
    []
  )

  // 지도 초기화
  useEffect(() => {
    let destroyed = false
    async function init() {
      try {
        await loadKakaoMap()
        if (destroyed || !mapContainerRef.current) return
        const kakao = window.kakao
        // 서울 중심 기본 좌표
        const center = new kakao.maps.LatLng(37.5448, 127.0557) // 성수동
        const map = new kakao.maps.Map(mapContainerRef.current, {
          center,
          level: 5,
        })
        mapInstanceRef.current = map
        setMapReady(true)
        setLoading(false)
      } catch (err) {
        console.error('KakaoMap 초기화 실패:', err)
        setLoading(false)
      }
    }
    init()
    return () => {
      destroyed = true
    }
  }, [])

  // GPS 요청 (지도 준비 후)
  useEffect(() => {
    if (!mapReady) return
    async function locate() {
      try {
        const pos = await getPosition()
        const lat = pos.coords?.latitude ?? pos.coords?.lat
        const lng = pos.coords?.longitude ?? pos.coords?.lng
        if (!lat || !lng) return
        setUserLocation({ lat, lng })
        const kakao = window.kakao
        const map = mapInstanceRef.current
        if (!map) return
        const latlng = new kakao.maps.LatLng(lat, lng)
        map.setCenter(latlng)
        // 내 위치 마커
        if (userOverlayRef.current) userOverlayRef.current.setMap(null)
        const overlay = new kakao.maps.CustomOverlay({
          position: latlng,
          content: USER_LOCATION_HTML,
          zIndex: 10,
        })
        overlay.setMap(map)
        userOverlayRef.current = overlay
      } catch (err) {
        console.warn('GPS 실패:', err)
      }
    }
    locate()
  }, [mapReady])

  // 카테고리 변경 시 핀 렌더링
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const map = mapInstanceRef.current
    const kakao = window.kakao

    // 기존 핀 제거
    overlaysRef.current.forEach((o) => o.setMap(null))
    overlaysRef.current = []

    const pois = getVisiblePOIs(
      selectedCategory,
      userLocation?.lat,
      userLocation?.lng
    )

    if (pois.length === 0) return

    // 핀 추가
    const newOverlays = pois.map((poi) => {
      const pos = new kakao.maps.LatLng(poi.lat, poi.lng)
      const isActive = selectedPOI?.id === poi.id
      const html = isActive ? makeActivePinHTML(poi.category, isNewPOI(poi)) : makePinHTML(poi.category, isNewPOI(poi))
      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: html,
        zIndex: isActive ? 20 : 15,
        yAnchor: 1.15,
      })
      overlay.setMap(map)

      // 클릭 이벤트 — DOM 이벤트로 처리
      setTimeout(() => {
        const el = overlay.getContent()
        if (el && el.addEventListener) {
          el.addEventListener('click', () => setSelectedPOI(poi))
        }
      }, 100)

      return overlay
    })

    overlaysRef.current = newOverlays

    // nearest POI 계산
    if (pois.length > 0) setNearestPOI(pois[0])
  }, [mapReady, selectedCategory, userLocation, getVisiblePOIs]) // selectedPOI 제외 (무한루프 방지)

  // selectedPOI 변경 시 핀 갱신 (active 크기 변경)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const map = mapInstanceRef.current
    const kakao = window.kakao

    overlaysRef.current.forEach((o) => o.setMap(null))
    overlaysRef.current = []

    const pois = getVisiblePOIs(
      selectedCategory,
      userLocation?.lat,
      userLocation?.lng
    )

    const newOverlays = pois.map((poi) => {
      const pos = new kakao.maps.LatLng(poi.lat, poi.lng)
      const isActive = selectedPOI?.id === poi.id
      const html = isActive
        ? makeActivePinHTML(poi.category, isNewPOI(poi))
        : makePinHTML(poi.category, isNewPOI(poi))
      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: html,
        zIndex: isActive ? 20 : 15,
        yAnchor: 1.15,
      })
      overlay.setMap(map)
      setTimeout(() => {
        const el = overlay.getContent()
        if (el && el.addEventListener) {
          el.addEventListener('click', () => setSelectedPOI(poi))
        }
      }, 100)
      return overlay
    })

    overlaysRef.current = newOverlays
  }, [selectedPOI]) // eslint-disable-line react-hooks/exhaustive-deps

  // 카카오맵 길찾기
  const openNavigation = (poi) => {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(poi.name_ko)},${poi.lat},${poi.lng}`
    window.open(url, '_blank')
  }

  // 표시할 POI 정보 (선택 > nearest)
  const displayPOI = selectedPOI || nearestPOI

  // 언어 헬퍼
  const L = (poi, field) => {
    if (!poi) return ''
    const key = `${field}_${lang}`
    if (poi[key]) return poi[key]
    return poi[`${field}_ko`] || poi[`${field}_zh`] || ''
  }

  return (
    <div className="relative w-full h-full" style={{ height: '100dvh' }}>
      {/* ── 지도 영역 ─────────────────────────────── */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0"
        style={{ zIndex: 0 }}
      />

      {/* ── 검색바 오버레이 ──────────────────────── */}
      <div
        className="absolute left-4 right-4 z-10"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <div
          className="flex items-center gap-2 bg-white px-4 py-3"
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          }}
        >
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            readOnly
            placeholder="搜索弹窗店、美食、地点..."
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent cursor-pointer"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>
      </div>

      {/* ── 카테고리 칩 ──────────────────────────── */}
      <div
        className="absolute left-0 right-0 z-10 overflow-x-auto flex gap-2 px-4 no-scrollbar"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 70px)',
          scrollbarWidth: 'none',
        }}
      >
        {CHIPS.map((chip) => {
          const active = selectedCategory === chip.id
          return (
            <button
              key={chip.id}
              onClick={() => {
                setSelectedCategory(chip.id)
                setSelectedPOI(null)
              }}
              className="flex-shrink-0 px-4 py-1.5 text-sm font-medium transition-all"
              style={{
                borderRadius: 999,
                background: active ? '#111827' : '#fff',
                color: active ? '#fff' : '#9CA3AF',
                border: active ? '1.5px solid #111827' : '1.5px solid #E5E7EB',
                fontSize: 13,
              }}
            >
              {chip.zh}
            </button>
          )
        })}
      </div>

      {/* ── 바텀시트 ──────────────────────────────── */}
      {/* bottom: 56px = 하단 탭바 높이 위에 위치 */}
      <div
        className="absolute left-0 right-0 bg-white z-20"
        style={{
          bottom: 56,
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -2px 16px rgba(0,0,0,0.10)',
          minHeight: 120,
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: '#E5E7EB',
            }}
          />
        </div>

        {/* 카드 내용 */}
        <div className="px-4 pb-4 pt-2">
          {loading ? (
            <SkeletonCard />
          ) : displayPOI ? (
            <POICard
              poi={displayPOI}
              lang={lang}
              L={L}
              onNavigate={() => openNavigation(displayPOI)}
              onDetail={() => setSelectedPOI(displayPOI)}
              userLocation={userLocation}
            />
          ) : (
            <div className="text-center text-sm text-gray-400 py-4">
              暂无附近地点
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── POI 카드 컴포넌트 ────────────────────────────────────────────
function POICard({ poi, lang, L, onNavigate, onDetail, userLocation }) {
  const catInfo = POI_CATEGORIES[poi.category]
  const dist =
    userLocation
      ? formatDistance(calcDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng))
      : null
  const dateStr = formatDateRange(poi.start_date, poi.end_date)
  const timeStr =
    poi.open_time ? `${formatTime(poi.open_time)}~${formatTime(poi.close_time)}` : ''

  const name = poi[`name_${lang}`] || poi.name_zh || poi.name_ko
  const address = poi[`address_${lang}`] || poi.address_zh || poi.address_ko

  return (
    <div className="flex gap-3 items-start">
      {/* 이미지 */}
      <div
        className="flex-shrink-0 bg-gray-100 overflow-hidden"
        style={{ width: 64, height: 64, borderRadius: 10 }}
      >
        {poi.image_url ? (
          <img
            src={poi.image_url}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xl font-bold"
            style={{ background: catInfo?.color || '#eee', color: '#fff' }}
          >
            {catInfo?.letter}
          </div>
        )}
      </div>

      {/* 텍스트 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {isNewPOI(poi) && (
            <span
              className="text-white font-bold flex-shrink-0"
              style={{ background: '#E24B4A', fontSize: 8, padding: '1px 5px', borderRadius: 4 }}
            >
              NEW
            </span>
          )}
          <span className="text-[13px] font-bold text-gray-900 truncate">{name}</span>
        </div>
        <p className="text-[11px] text-gray-500 truncate">
          {address}
          {dist && <span className="text-gray-400"> · {dist}</span>}
        </p>
        {(dateStr || timeStr) && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {dateStr}
            {dateStr && timeStr ? ' · ' : ''}
            {timeStr}
          </p>
        )}

        {/* CTA 버튼 */}
        <div className="flex gap-2 mt-2.5">
          <button
            onClick={onNavigate}
            className="flex items-center gap-1 px-3 py-1.5 text-white text-[12px] font-semibold rounded-lg flex-shrink-0"
            style={{ background: '#111827', borderRadius: 8 }}
          >
            <Navigation size={12} />
            导航
          </button>
          <button
            onClick={onDetail}
            className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold rounded-lg border border-gray-200 text-gray-700 flex-shrink-0"
            style={{ borderRadius: 8 }}
          >
            <Info size={12} />
            详情
          </button>
        </div>
      </div>
    </div>
  )
}
