import { useState, useEffect, useRef, useCallback } from 'react'
import { RECOMMENDED_COURSES, COURSE_CATEGORIES } from '../data/recommendedCourses'
import { useUserPopups, PLATFORM_INFO } from '../hooks/useUserPopups'
import { getDdayLabel, isActiveOrUpcoming } from '../data/popupData'
import { estimateTravel, estimateAllModes, kakaoDirectionLink, getDirectionLinks } from '../utils/travelTime'
import { searchLocalPlaces } from '../data/hanpocketPlaceDB'
import PlaceDetail from './PlaceDetail'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

// ─── KakaoMap loader ───
function loadKakaoMapAPI() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) { resolve(window.kakao); return }
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY
    if (!apiKey) { reject(new Error('No API key')); return }
    // Use English labels for non-Korean users (Chinese not supported by Kakao Maps)
    const savedLang = localStorage.getItem('hp_lang') || navigator.language?.slice(0, 2) || 'ko'
    const mapLang = savedLang === 'ko' ? '' : '&language=en'
    const s = document.createElement('script')
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false${mapLang}`
    s.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    s.onerror = () => reject(new Error('KakaoMap load failed'))
    document.head.appendChild(s)
  })
}

// ─── NaverMap loader ───
// App lang (ko/zh/en) → Naver Maps language param
const NAVER_LANG_MAP = { ko: 'ko', zh: 'zh-Hans', en: 'en' }

function loadNaverMapAPI(lang = 'ko') {
  const naverLang = NAVER_LANG_MAP[lang] || 'ko'
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
    if (!clientId) { reject(new Error('No Naver Map client ID')); return }

    // Already loaded with the correct language → reuse
    if (window.naver && window.naver.maps && window.__naverMapLang === naverLang) {
      resolve(window.naver); return
    }

    // Language mismatch (user switched app language) → unload old SDK, reload fresh
    if (window.__naverMapLang && window.__naverMapLang !== naverLang) {
      const oldScript = document.querySelector('script[src*="oapi.map.naver.com"]')
      if (oldScript) oldScript.remove()
      try { window.naver = undefined } catch (_) {}
      window.__naverMapLang = null
    }

    // Script already loading (no mismatch) → wait for it
    if (document.querySelector('script[src*="oapi.map.naver.com"]')) {
      const check = setInterval(() => {
        if (window.naver?.maps) { clearInterval(check); resolve(window.naver) }
      }, 200)
      setTimeout(() => { clearInterval(check); if (window.naver?.maps) resolve(window.naver); else reject(new Error('Naver timeout')) }, 8000)
      return
    }

    // Fresh load — callback 방식으로 초기화 완료 후 resolve
    window.__naverMapLang = naverLang
    window.__naverMapResolve = resolve
    window.__naverMapCallback = () => {
      window.__naverMapResolve?.(window.naver)
      delete window.__naverMapCallback
      delete window.__naverMapResolve
    }
    const s = document.createElement('script')
    s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&language=${naverLang}&callback=__naverMapCallback`
    s.onerror = () => reject(new Error('NaverMap load failed'))
    document.head.appendChild(s)
  })
}

// ─── Constants ───
const STOP_TYPE_BG = { cafe: '#F9DEBB', exhibition: '#FFD4BC', park: '#D4EDDA', walk: '#E8E8E8', food: '#FFECD2', shopping: '#E8D5F5', tourism: '#D4E6F1', nature: '#D4EDDA' }
const STOP_TYPE_LABEL = {
  cafe: { ko: '카페', zh: '咖啡', en: 'Cafe' },
  exhibition: { ko: '전시', zh: '展览', en: 'Exhibition' },
  park: { ko: '공원', zh: '公园', en: 'Park' },
  food: { ko: '맛집', zh: '美食', en: 'Food' },
  shopping: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
  tourism: { ko: '관광', zh: '观光', en: 'Tourism' },
  walk: { ko: '산책', zh: '散步', en: 'Walk' },
  nature: { ko: '자연', zh: '自然', en: 'Nature' },
}
const FEATURE_LABEL = {
  card: { ko: '카드결제', zh: '刷卡', en: 'Card' },
  english_menu: { ko: '영어메뉴', zh: '英文菜单', en: 'Eng. menu' },
  free: { ko: '무료', zh: '免费', en: 'Free' },
}
const DIFF_LABEL = { easy: { ko: '쉬움', zh: '轻松', en: 'Easy' }, medium: { ko: '보통', zh: '适中', en: 'Medium' }, hard: { ko: '힘듦', zh: '较累', en: 'Hard' } }
const TRANSPORT_LABEL = {
  walk: { ko: '도보', zh: '步行', en: 'Walk' },
  subway: { ko: '지하철', zh: '地铁', en: 'Subway' },
  bus: { ko: '버스', zh: '公交', en: 'Bus' },
  taxi: { ko: '택시', zh: '出租车', en: 'Taxi' },
  car: { ko: '차량', zh: '开车', en: 'Drive' },
}
const PIN_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const PHRASE_DATA = {
  shopping: [
    { ko: '이거 얼마예요?', zh: '这个多少钱？', en: 'How much?', pr: 'igeo eolmayeyo?' },
    { ko: '카드 돼요?', zh: '可以刷卡吗？', en: 'Can I use card?', pr: 'kadeu dwaeyo?' },
    { ko: '면세 되나요?', zh: '可以免税吗？', en: 'Tax free?', pr: 'myeonse doenayo?' },
    { ko: '좀 깎아주세요', zh: '便宜一点吧', en: 'Discount please', pr: 'jom kkakkajuseyo' },
    { ko: '영수증 주세요', zh: '请给我小票', en: 'Receipt please', pr: 'yeongsujeung juseyo' },
    { ko: '교환할 수 있어요?', zh: '可以换吗？', en: 'Can I exchange?', pr: 'gyohwanhal su isseoyo?' },
  ],
  food: [
    { ko: '메뉴판 주세요', zh: '请给我菜单', en: 'Menu please', pr: 'menyupan juseyo' },
    { ko: '이거 주세요', zh: '我要这个', en: 'This one please', pr: 'igeo juseyo' },
    { ko: '안 맵게 해주세요', zh: '请做不辣的', en: 'Not spicy please', pr: 'an maepge haejuseyo' },
    { ko: '계산이요', zh: '买单', en: 'Check please', pr: 'gyesanniyo' },
    { ko: '물 주세요', zh: '请给我水', en: 'Water please', pr: 'mul juseyo' },
    { ko: '포장해주세요', zh: '请打包', en: 'To go please', pr: 'pojanghae juseyo' },
  ],
  tourism: [
    { ko: '사진 찍어주세요', zh: '请帮我拍照', en: 'Photo please', pr: 'sajin jjigeojuseyo' },
    { ko: '입장료가 얼마예요?', zh: '门票多少钱？', en: 'Ticket price?', pr: 'ipjangnyo-ga eolmayeyo?' },
    { ko: '화장실 어디예요?', zh: '洗手间在哪？', en: 'Where is restroom?', pr: 'hwajangsil eodiyeyo?' },
    { ko: '몇 시에 닫아요?', zh: '几点关门？', en: 'What time close?', pr: 'myeot sie dadayo?' },
    { ko: '오디오 가이드 있어요?', zh: '有语音导览吗？', en: 'Audio guide?', pr: 'odio gaideu isseoyo?' },
    { ko: '여기서 가까워요?', zh: '离这里近吗？', en: 'Is it close?', pr: 'yeogiseo gakkawayo?' },
  ],
  cafe: [
    { ko: '아메리카노 한잔 주세요', zh: '请给我一杯美式咖啡', en: 'Americano please', pr: 'amerikano hanjan juseyo' },
    { ko: '여기서 먹을게요', zh: '在这里喝', en: 'For here', pr: 'yeogiseo meogeulgeyo' },
    { ko: '포장이요', zh: '打包', en: 'To go', pr: 'pojang-iyo' },
    { ko: '와이파이 비밀번호가 뭐예요?', zh: 'Wi-Fi密码是多少？', en: 'Wi-Fi password?', pr: 'waipai bimilbeonhoga mwoyeyo?' },
    { ko: '콘센트 있어요?', zh: '有插座吗？', en: 'Power outlet?', pr: 'konsenteu isseoyo?' },
    { ko: '디카페인 있어요?', zh: '有无咖啡因的吗？', en: 'Decaf?', pr: 'dikape-in isseoyo?' },
  ],
  default: [
    { ko: '화장실 어디예요?', zh: '洗手间在哪？', en: 'Where is restroom?', pr: 'hwajangsil eodiyeyo?' },
    { ko: '사진 찍어도 돼요?', zh: '可以拍照吗？', en: 'Can I take photo?', pr: 'sajin jjigeodo dwaeyo?' },
    { ko: '입장료가 얼마예요?', zh: '门票多少钱？', en: 'Ticket price?', pr: 'ipjangnyo eolmayeyo?' },
    { ko: '도와주세요', zh: '请帮帮我', en: 'Help please', pr: 'dowajuseyo' },
    { ko: '감사합니다', zh: '谢谢', en: 'Thank you', pr: 'gamsahamnida' },
    { ko: '여기서 가까워요?', zh: '离这里近吗？', en: 'Is it close?', pr: 'yeogiseo gakkawayo?' },
  ],
}
PHRASE_DATA.nature = PHRASE_DATA.default
PHRASE_DATA.park = PHRASE_DATA.default
PHRASE_DATA.walk = PHRASE_DATA.default
PHRASE_DATA.exhibition = PHRASE_DATA.default

function parseDuration(dur) {
  if (!dur) return 60
  const s = dur.toString().toLowerCase()
  if (s.includes('h')) return Math.round(parseFloat(s) * 60)
  const m = parseInt(s)
  return isNaN(m) ? 60 : m
}

// ─── Scoring Engine ───
function scoreCourse(course, profile) {
  if (!profile) return 0
  let score = 0
  const interests = profile.interests || []
  const catMap = {
    first: ['sightseeing', 'culture'], kpop: ['kpop', 'culture'], food: ['food'],
    shopping: ['shopping'], nature: ['nature'], history: ['history', 'culture'],
    busan: ['sightseeing', 'nature'], jeju: ['sightseeing', 'nature'], other_region: ['sightseeing', 'history'],
  }
  if ((catMap[course.category] || []).some(m => interests.includes(m))) score += 10
  const diffMap = { low: 'easy', medium: 'medium', high: 'hard' }
  if (course.difficulty === diffMap[profile.walkingAbility]) score += 5
  else if (
    (course.difficulty === 'easy' && profile.walkingAbility === 'medium') ||
    (course.difficulty === 'medium' && profile.walkingAbility === 'high')
  ) score += 3
  if (profile.travelType === 'family' && course.difficulty === 'easy') score += 3
  if (profile.travelType === 'couple' && ['kpop', 'food'].includes(course.category)) score += 2
  if (profile.travelType === 'friends' && ['kpop', 'shopping'].includes(course.category)) score += 2
  return score
}

function getTopCourseIds(profile, topN = 5) {
  if (!profile) return new Set()
  const scored = RECOMMENDED_COURSES.map(c => ({ id: c.id, score: scoreCourse(c, profile) }))
  scored.sort((a, b) => b.score - a.score)
  return new Set(scored.filter(s => s.score >= 5).slice(0, topN).map(s => s.id))
}


// ═══════════════════════════════════════════════
// CourseMap — 200px mini map with A-D pins
// ═══════════════════════════════════════════════
function CourseMap({ stops, lang }) {
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadKakaoMapAPI()
        if (cancelled || !mapRef.current) return
        const kakao = window.kakao
        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(stops[0].lat, stops[0].lng), level: 7
        })
        const bounds = new kakao.maps.LatLngBounds()
        const path = []
        stops.forEach((stop, i) => {
          const pos = new kakao.maps.LatLng(stop.lat, stop.lng)
          bounds.extend(pos)
          path.push(pos)
          const label = PIN_LABELS[i] || String(i + 1)
          const svg = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#111827" stroke="white" stroke-width="2"/><text x="16" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Inter,sans-serif">${label}</text></svg>`
          new kakao.maps.Marker({
            map, position: pos,
            image: new kakao.maps.MarkerImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), new kakao.maps.Size(32, 32))
          })
        })
        if (path.length > 1) {
          new kakao.maps.Polyline({ map, path, strokeWeight: 3, strokeColor: '#111827', strokeOpacity: 0.5, strokeStyle: 'dash' })
        }
        map.setBounds(bounds, 50)
        setMapReady(true)
      } catch (e) { console.warn('CourseMap:', e) }
    })()
    return () => { cancelled = true }
  }, [stops])

  return (
    <div className="relative rounded-[20px] overflow-hidden border border-[var(--y2k-border)]" style={{ height: 280 }}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapReady && (
        <div className="absolute inset-0 bg-[var(--y2k-bg)] flex items-center justify-center">
          <span className="text-xs text-[var(--y2k-text-sub)]">Loading map...</span>
        </div>
      )}
    </div>
  )
}


// ═══════════════════════════════════════════════
// NaverCourseMap — Naver Maps mini map with pins & route
// ═══════════════════════════════════════════════
function NaverCourseMap({ stops, lang, onSwitchToKakao }) {
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setMapReady(false)
    setMapError(null)
    ;(async () => {
      try {
        await loadNaverMapAPI(lang)
        if (cancelled || !mapRef.current) return
        const naver = window.naver
        // Clear previous map instance
        mapRef.current.innerHTML = ''
        const map = new naver.maps.Map(mapRef.current, {
          center: new naver.maps.LatLng(stops[0].lat, stops[0].lng),
          zoom: 13,
          mapTypeControl: false,
          zoomControl: false,
          logoControl: false,
          scaleControl: false,
        })
        // Build bounds and path
        let swLat = stops[0].lat, swLng = stops[0].lng, neLat = stops[0].lat, neLng = stops[0].lng
        const path = []
        stops.forEach((stop, i) => {
          const lat = stop.lat, lng = stop.lng
          if (lat < swLat) swLat = lat; if (lng < swLng) swLng = lng
          if (lat > neLat) neLat = lat; if (lng > neLng) neLng = lng
          path.push(new naver.maps.LatLng(lat, lng))
          const label = PIN_LABELS[i] || String(i + 1)
          new naver.maps.Marker({
            map,
            position: new naver.maps.LatLng(lat, lng),
            icon: {
              content: `<div style="width:30px;height:30px;border-radius:50%;background:#111827;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:700;font-family:Inter,sans-serif;box-shadow:0 2px 4px rgba(0,0,0,.3)">${label}</div>`,
              size: new naver.maps.Size(30, 30),
              anchor: new naver.maps.Point(15, 15),
            },
          })
        })
        if (path.length > 1) {
          new naver.maps.Polyline({
            map,
            path,
            strokeColor: '#111827',
            strokeWeight: 3,
            strokeOpacity: 0.5,
            strokeStyle: 'dash',
          })
        }
        const bounds = new naver.maps.LatLngBounds(
          new naver.maps.LatLng(swLat, swLng),
          new naver.maps.LatLng(neLat, neLng)
        )
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
        setMapReady(true)
      } catch (e) {
        if (!cancelled) setMapError(e.message)
      }
    })()
    return () => { cancelled = true }
  }, [stops, lang])

  if (mapError) {
    return (
      <div className="rounded-[20px] border border-[var(--y2k-border)] bg-[var(--y2k-bg)] flex flex-col items-center justify-center gap-3" style={{ height: 280 }}>
        <span className="text-3xl">🗺️</span>
        <p className="text-xs text-[var(--y2k-text-sub)] text-center px-6 leading-relaxed whitespace-pre-line">
          {L(lang, { ko: '네이버 지도를 불러올 수 없어요.\n카카오 지도로 확인해 보세요.', zh: 'Naver地图加载失败。\n请使用Kakao地图查看。', en: 'Naver Maps unavailable.\nPlease use Kakao Maps instead.' })}
        </p>
        {onSwitchToKakao && (
          <button
            onClick={onSwitchToKakao}
            className="text-xs font-bold px-4 py-2 rounded-[20px] bg-[#FEE500] text-[var(--y2k-text)] active:scale-95 transition-transform"
          >
            {L(lang, { ko: '카카오 지도로 보기', zh: '使用Kakao地图', en: 'Use Kakao Maps' })}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative rounded-[20px] overflow-hidden border border-[var(--y2k-border)]" style={{ height: 280 }}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapReady && (
        <div className="absolute inset-0 bg-[var(--y2k-bg)] flex items-center justify-center gap-2">
          <span className="animate-spin w-4 h-4 border-2 border-[#03C75A] border-t-transparent rounded-full" />
          <span className="text-xs text-[var(--y2k-text-sub)]">Naver Maps...</span>
        </div>
      )}
      {/* Naver Maps branding */}
      {mapReady && (
        <div className="absolute bottom-1 right-1 bg-white/80 rounded px-1 py-0.5">
          <span className="text-[9px] font-bold text-[#03C75A]">N</span>
        </div>
      )}
    </div>
  )
}

// ─── Map Provider Toggle ───
function MapProviderToggle({ provider, onChange, lang }) {
  return (
    <div className="flex items-center justify-end gap-1 mb-2">
      <span className="text-[10px] text-[var(--y2k-text-sub)]">
        {L(lang, { ko: '지도', zh: '地图', en: 'Map' })}
      </span>
      <button
        onClick={() => onChange('kakao')}
        className={`text-[11px] font-bold px-2 py-0.5 rounded-l-[6px] border transition-colors ${
          provider === 'kakao'
            ? 'bg-[#FEE500] text-[var(--y2k-text)] border-[#FEE500]'
            : 'bg-white text-[var(--y2k-text-sub)] border-[var(--y2k-border)]'
        }`}
      >K</button>
      <button
        onClick={() => onChange('naver')}
        className={`text-[11px] font-bold px-2 py-0.5 rounded-r-[6px] border-t border-b border-r transition-colors ${
          provider === 'naver'
            ? 'bg-[#03C75A] text-white border-[#03C75A]'
            : 'bg-white text-[var(--y2k-text-sub)] border-[var(--y2k-border)]'
        }`}
      >N</button>
    </div>
  )
}

// ═══════════════════════════════════════════════
// OnboardingQuiz — 14-question vibe/personality quiz (MBTI-style)
// 심리학 기반 취향 파악 → 맞춤 코스 추천
// ═══════════════════════════════════════════════
const VIBE_QUESTIONS = [
  {
    id: 'energy',
    q: { ko: '오늘 서울에서 어떤 하루를 보내고 싶어?', zh: '今天想在首尔度过怎样的一天？', en: 'What kind of Seoul day do you want?' },
    options: [
      { id: 'active', emoji: '🔥', title: { ko: '달리는 하루', zh: '全力冲刺型', en: 'Full speed ahead' }, desc: { ko: '많이 보고, 많이 걷고, 기억에 남는 하루', zh: '多看多走，留下难忘的一天', en: 'See more, walk more, make it count' } },
      { id: 'slow', emoji: '🌿', title: { ko: '여유로운 하루', zh: '慢节奏享受型', en: 'Slow & savour' }, desc: { ko: '한 곳을 깊이, 서두르지 않는 하루', zh: '深入一个地方，不急不躁', en: 'Go deep, no rush, feel everything' } },
    ],
  },
  {
    id: 'cafe',
    q: { ko: '카페를 고를 때 내 기준은?', zh: '你选咖啡厅的标准是？', en: 'How do you pick a cafe?' },
    options: [
      { id: 'trendy', emoji: '✨', title: { ko: '줄 서도 가는 핫플', zh: '排队也要去的网红店', en: 'Worth the wait, Instagram-famous' }, desc: { ko: 'SNS에서 봤던 그 카페, 사진 각도 완벽', zh: '社媒爆款，拍照角度完美', en: 'The one from your feed, perfect shots' } },
      { id: 'local', emoji: '🪴', title: { ko: '동네 단골집', zh: '街坊常去的小店', en: 'Local hidden gem' }, desc: { ko: '화려하진 않지만 진짜 그 동네 분위기', zh: '不华丽，但有真实的街区气息', en: 'Quiet, real neighborhood energy' } },
    ],
  },
  {
    id: 'food',
    q: { ko: '음식 모험, 얼마나 할 수 있어?', zh: '你的饮食冒险度有多高？', en: "How adventurous are you with food?" },
    options: [
      { id: 'bold', emoji: '🐙', title: { ko: '현지 오리지널 도전', zh: '勇尝本地原味', en: 'Go local & bold' }, desc: { ko: '곱창, 순대, 포장마차... 현지인 먹는 찐 음식', zh: '猪肠、血肠、路边摊……吃最本地的', en: 'Gopchang, sundae, street tents — the real deal' } },
      { id: 'safe', emoji: '🍽️', title: { ko: '검증된 맛으로', zh: '选经过验证的美食', en: 'Stick to tried & true' }, desc: { ko: '미슐랭, 유행하는 퓨전 — 보장된 맛', zh: '米其林、流行融合餐厅——有保障的口味', en: 'Michelin or trendy fusion — quality assured' } },
    ],
  },
  {
    id: 'shopping',
    q: { ko: '쇼핑할 때 나는?', zh: '你的购物风格是？', en: "What's your shopping personality?" },
    options: [
      { id: 'brand', emoji: '🛍️', title: { ko: '브랜드 / 면세 / 백화점', zh: '品牌/免税店/百货店', en: 'Brands & department stores' }, desc: { ko: '인정받은 것들로, 클래식하게', zh: '选经典品牌，有品质保障', en: 'Trusted names, classic choices' } },
      { id: 'indie', emoji: '🧶', title: { ko: '빈티지 / 로컬 편집숍', zh: '古着/独立买手店', en: 'Vintage & indie boutiques' }, desc: { ko: '아는 사람만 아는 나만의 취향', zh: '只有懂的人才知道的独特品味', en: 'Unique finds only locals know about' } },
    ],
  },
  {
    id: 'afternoon',
    q: { ko: '오후 3시, 어디 있고 싶어?', zh: '下午3点，你想在哪里？', en: 'Where do you want to be at 3 PM?' },
    options: [
      { id: 'culture', emoji: '🎨', title: { ko: '갤러리 / 전시 / 팝업', zh: '画廊/展览/快闪店', en: 'Gallery / Exhibition / Pop-up' }, desc: { ko: '뭔가 배우고 느끼고 싶어', zh: '想感受些什么，获得一些启发', en: 'Something to discover and feel' } },
      { id: 'outdoor', emoji: '🌿', title: { ko: '한강 / 공원 / 골목 산책', zh: '汉江/公园/小巷漫步', en: 'Han River / Park / Street walk' }, desc: { ko: '그냥 거닐고 싶어, 자유롭게', zh: '就想随意走走，自由自在', en: 'Just wander freely, wherever the mood takes' } },
    ],
  },
  {
    id: 'photo',
    q: { ko: '사진 찍는 이유가 뭐야?', zh: '你拍照是为了什么？', en: "Why do you take photos?" },
    options: [
      { id: 'landmark', emoji: '📍', title: { ko: '인증샷 — 나 여기 왔다', zh: '打卡照——到此一游', en: '"I was here" at famous spots' }, desc: { ko: '랜드마크 앞에서 여기 왔다는 사진', zh: '在地标前留下到访的记录', en: 'Landmarks, views — proof you were there' } },
      { id: 'vibe', emoji: '🎞️', title: { ko: '감성 스냅 — 내가 좋아서', zh: '氛围感拍照——有感觉就拍', en: 'Mood shots — whatever moves you' }, desc: { ko: '빛, 음식, 골목... 내가 끌리면 찍는 사진', zh: '光影、食物、小巷……有感觉就拍', en: 'Light, food, alleys — snap what catches your eye' } },
    ],
  },
  {
    id: 'evening',
    q: { ko: '저녁 이후 계획은?', zh: '晚上之后你的计划是？', en: "What's the evening plan?" },
    options: [
      { id: 'night', emoji: '🍺', title: { ko: '서울 밤 즐기기', zh: '享受首尔夜生活', en: "Enjoy Seoul's night scene" }, desc: { ko: '루프탑 바, 이자카야, 한강 야식 — 밤을 불태워', zh: '屋顶酒吧、居酒屋、汉江夜宵——燃烧夜晚', en: 'Rooftop bar, izakaya, Han River snacks — burn the night' } },
      { id: 'rest', emoji: '🌙', title: { ko: '충전하고 내일 또 달리기', zh: '休息储能，明天再出发', en: 'Recharge for tomorrow' }, desc: { ko: '맛있는 디저트 먹고 호텔로, 내일도 바쁘니까', zh: '吃个甜点回酒店——明天还要继续', en: 'Dessert then hotel — busy day tomorrow too' } },
    ],
  },
  {
    id: 'scope',
    q: { ko: '오늘 여행 범위는?', zh: '今天的出行范围是？', en: "What's your travel scope today?" },
    options: [
      { id: 'deep', emoji: '🔭', title: { ko: '한 동네를 제대로', zh: '深入一个街区', en: 'One area, deeply' }, desc: { ko: '성수 하나만 파도 충분해, 깊게 느끼고 싶어', zh: '只逛一个地方也足够，想深入体验', en: 'Exploring one spot deeply is enough' } },
      { id: 'wide', emoji: '⚡', title: { ko: '여러 동네 다 찍기', zh: '多个区域都要逛到', en: 'Cover many areas' }, desc: { ko: '오늘 최대한 많은 곳 가보고 싶어', zh: '今天想去尽可能多的地方', en: 'See as many places as possible today' } },
    ],
  },
  {
    id: 'avoid',
    q: { ko: '이거 있으면 의욕이 뚝 떨어져', zh: '遇到这个就完全提不起劲', en: 'This instantly kills your vibe' },
    options: [
      { id: 'crowds', emoji: '😮‍💨', title: { ko: '긴 줄 / 관광객 인파', zh: '长队/人山人海', en: 'Long queues & tourist crowds' }, desc: { ko: '사람 많으면 그냥 다른 데 가고 말지', zh: '人太多就去别的地方算了', en: 'Too crowded → I just find another place' } },
      { id: 'quiet', emoji: '😶', title: { ko: '너무 조용한 곳', zh: '太安静、没人气的地方', en: 'Too quiet & empty' }, desc: { ko: '활기가 없으면 심심해, 사람 있는 곳이 좋아', zh: '没有活力就无聊，喜欢有人气的地方', en: 'No energy feels boring — I need life around me' } },
    ],
  },
  {
    id: 'planning',
    q: { ko: '여행 계획, 나는 이런 스타일', zh: '我的旅行计划风格是这样的', en: 'My travel planning style' },
    options: [
      { id: 'planner', emoji: '📋', title: { ko: '미리 다 정해야 마음 편해', zh: '提前计划好才安心', en: 'Plan everything in advance' }, desc: { ko: '동선부터 식당 예약까지, 꼼꼼하게', zh: '从路线到餐厅预约，一丝不苟', en: 'Routes, reservations — all locked in beforehand' } },
      { id: 'free', emoji: '🎲', title: { ko: '걷다가 끌리면 들어가', zh: '走着走着进感兴趣的地方', en: 'Spontaneous & flexible' }, desc: { ko: '계획은 참고만, 발길 따라가는 여행', zh: '计划只是参考，随脚步而行', en: 'Plans are just suggestions — go with the flow' } },
    ],
  },
  {
    id: 'goal',
    q: { ko: '이번 여행의 핵심은?', zh: '这次旅行的重点是什么？', en: "What's the main point of this trip?" },
    options: [
      { id: 'food', emoji: '🍖', title: { ko: '먹으러 왔다', zh: '来吃的', en: "I'm here to eat" }, desc: { ko: '서울 맛집투어가 이번 여행의 하이라이트', zh: '首尔美食之旅才是这次的重头戏', en: 'Seoul food tour is the real highlight' } },
      { id: 'shopping', emoji: '🛒', title: { ko: '사러 왔다', zh: '来买的', en: "I'm here to shop" }, desc: { ko: '보따리 가득 들고 가는 게 꿈, 쇼핑이 여행', zh: '满载而归才是目标，购物就是旅行', en: 'Bags full = perfect trip. Shopping is travel' } },
    ],
  },
  {
    id: 'culture',
    q: { ko: '한국에서 가장 끌리는 건?', zh: '在韩国最吸引你的是什么？', en: 'What draws you most to Korea?' },
    options: [
      { id: 'hallyu', emoji: '🎤', title: { ko: 'K-드라마 / K-POP 성지', zh: 'K剧/K-POP圣地', en: 'K-Drama / K-POP scenes' }, desc: { ko: '드라마 촬영지, 아이돌 핫플, 한류 문화', zh: '拍摄地、爱豆打卡点、韩流文化', en: 'Drama locations, idol spots, Hallyu culture' } },
      { id: 'history', emoji: '🏛️', title: { ko: '진짜 한국의 역사', zh: '真正的韩国历史文化', en: 'Real Korean history & tradition' }, desc: { ko: '경복궁, 북촌, 전통시장 — 깊이 있는 한국', zh: '景福宫、北村、传统市场——有深度的韩国', en: 'Gyeongbokgung, Bukchon, traditional markets' } },
    ],
  },
  {
    id: 'travelType',
    q: { ko: '지금 누구랑 여행 중이야?', zh: '现在和谁一起旅行？', en: 'Who are you traveling with?' },
    multi: true,
    options: [
      { id: 'solo', emoji: '🎒', title: { ko: '혼자', zh: '独自一人', en: 'Solo' } },
      { id: 'couple', emoji: '💑', title: { ko: '커플', zh: '情侣', en: 'Couple' } },
      { id: 'friends', emoji: '🎉', title: { ko: '친구', zh: '朋友', en: 'Friends' } },
      { id: 'family', emoji: '👨‍👩‍👧', title: { ko: '가족', zh: '家庭', en: 'Family' } },
    ],
  },
  {
    id: 'tripDuration',
    q: { ko: '이번 여행은 며칠이야?', zh: '这次旅行几天？', en: 'How long is your trip?' },
    multi: true,
    options: [
      { id: '1-2', emoji: '⚡', title: { ko: '1-2일', zh: '1-2天', en: '1-2 days' } },
      { id: '3-4', emoji: '🗓️', title: { ko: '3-4일', zh: '3-4天', en: '3-4 days' } },
      { id: '5-7', emoji: '📅', title: { ko: '5-7일', zh: '5-7天', en: '5-7 days' } },
      { id: '8+', emoji: '🏠', title: { ko: '8일 이상', zh: '8天以上', en: '8+ days' } },
    ],
  },
]

function OnboardingQuiz({ lang, onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const total = VIBE_QUESTIONS.length
  const q = VIBE_QUESTIONS[step]
  const ans = answers[q.id]
  const canNext = !!ans

  const buildProfile = (finalAnswers) => {
    const a = finalAnswers
    // interests — derived from multiple answers
    const interests = []
    if (a.afternoon === 'culture') interests.push('culture')
    if (a.afternoon === 'outdoor') interests.push('nature')
    if (a.goal === 'food') interests.push('food')
    if (a.goal === 'shopping') interests.push('shopping')
    if (a.culture === 'hallyu') interests.push('kpop')
    if (a.culture === 'history') interests.push('history')
    if (a.photo === 'landmark') interests.push('sightseeing')
    if (a.cafe === 'local') interests.push('culture')
    if (interests.length === 0) interests.push('sightseeing')
    // walkingAbility
    const walkingAbility =
      a.energy === 'active' && a.scope === 'wide' ? 'high'
      : a.energy === 'slow' && a.scope === 'deep' ? 'low'
      : 'medium'
    // budget
    const budget =
      a.shopping === 'brand' && a.evening === 'night' ? 'high'
      : a.shopping === 'indie' && a.evening === 'rest' ? 'low'
      : 'medium'
    return {
      ...a,
      interests: [...new Set(interests)],
      walkingAbility,
      budget,
      travelType: a.travelType || 'couple',
      tripDuration: a.tripDuration || '3-4',
    }
  }

  const selectAnswer = (qid, optId) => {
    const newAnswers = { ...answers, [qid]: optId }
    setAnswers(newAnswers)
    if (!q.multi) {
      // auto-advance after short delay for binary questions
      setTimeout(() => {
        if (step < total - 1) {
          setStep(s => s + 1)
        } else {
          const profile = buildProfile(newAnswers)
          localStorage.setItem('hp_course_profile', JSON.stringify(profile))
          onComplete(profile)
        }
      }, 320)
    }
  }

  const handleNext = () => {
    if (step < total - 1) {
      setStep(step + 1)
    } else {
      const profile = buildProfile(answers)
      localStorage.setItem('hp_course_profile', JSON.stringify(profile))
      onComplete(profile)
    }
  }

  return (
    <div className="bg-white rounded-[20px] border border-[var(--y2k-border)] overflow-hidden">
      {/* Progress */}
      <div className="px-4 pt-4 pb-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[var(--y2k-text-sub)] font-medium">{step + 1} / {total}</span>
          <span className="text-[10px] text-[var(--y2k-text-sub)]">{Math.round(((step + 1) / total) * 100)}%</span>
        </div>
        <div className="h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-4 pt-3 pb-4">
        <h3 className="text-sm font-bold text-[var(--y2k-text)] mb-3 leading-snug">{L(lang, q.q)}</h3>

        {/* Binary A/B options — large tap cards */}
        {!q.multi && (
          <div className="space-y-2">
            {q.options.map(opt => {
              const selected = ans === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => selectAnswer(q.id, opt.id)}
                  className={`w-full text-left p-3.5 rounded-[8px] border-2 transition-all active:scale-95 ${
                    selected
                      ? 'bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] border-[var(--y2k-pink)]'
                      : 'bg-white border-[var(--y2k-border)] active:border-[var(--y2k-pink)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-tight ${selected ? 'text-white' : 'text-[var(--y2k-text)]'}`}>
                        {L(lang, opt.title)}
                      </p>
                      {opt.desc && (
                        <p className={`text-[11px] mt-0.5 leading-relaxed ${selected ? 'text-white/70' : 'text-[var(--y2k-text-sub)]'}`}>
                          {L(lang, opt.desc)}
                        </p>
                      )}
                    </div>
                    {selected && <span className="text-white shrink-0 mt-1">✓</span>}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Multi-chip options (travelType, tripDuration) */}
        {q.multi && (
          <div className="grid grid-cols-2 gap-2">
            {q.options.map(opt => {
              const selected = ans === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => selectAnswer(q.id, opt.id)}
                  className={`p-3.5 rounded-[8px] border-2 text-center transition-all active:scale-95 ${
                    selected ? 'bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] border-[var(--y2k-pink)]' : 'bg-white border-[var(--y2k-border)]'
                  }`}
                >
                  <p className={`text-xs font-semibold ${selected ? 'text-white' : 'text-[var(--y2k-text)]'}`}>
                    {L(lang, opt.title)}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2 mt-4">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-[20px] text-xs font-medium text-[var(--y2k-text-sub)] border border-[var(--y2k-border)] active:bg-[var(--y2k-bg)]"
            >
              {L(lang, { ko: '이전', zh: '上一步', en: 'Back' })}
            </button>
          )}
          {/* Only show Next button for multi-choice questions (binary auto-advances) */}
          {q.multi && (
            <button
              onClick={handleNext}
              disabled={!canNext}
              className="flex-1 py-2 rounded-[20px] text-xs font-semibold bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white disabled:bg-[var(--y2k-border)] disabled:text-[var(--y2k-text-sub)] active:scale-95 transition-colors"
            >
              {step < total - 1
                ? L(lang, { ko: '다음', zh: '下一步', en: 'Next' })
                : L(lang, { ko: '내 취향 찾기 ✨', zh: '发现我的偏好 ✨', en: 'Find my style ✨' })
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════
// CourseCard — list card with optional badge
// ═══════════════════════════════════════════════
function CourseCard({ course, lang, onPress, isBestForYou }) {
  return (
    <button
      onClick={onPress}
      className="w-full bg-white rounded-[20px] border border-[var(--y2k-border)] p-4 text-left active:scale-95 transition-transform"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-[20px] bg-[var(--y2k-bg)] flex items-center justify-center shrink-0">
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-sm text-[var(--y2k-text)] leading-tight truncate">{L(lang, course.name)}</p>
            {isBestForYou && (
              <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-[20px] shrink-0">
                {L(lang, { ko: '추천', zh: '推荐', en: 'For you' })}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--y2k-text-sub)] mt-0.5 line-clamp-1">{L(lang, course.description)}</p>
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {course.stops.map((s, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white text-[8px] font-bold flex items-center justify-center shrink-0">{PIN_LABELS[i]}</span>
                <span className="text-[10px] text-[#374151] font-medium">{L(lang, s.name)}</span>
                {i < course.stops.length - 1 && <span className="text-[var(--y2k-text-sub)] mx-0.5">→</span>}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-[var(--y2k-text-sub)]">
              {course.duration}
            </span>
            <span className="text-[10px] text-[var(--y2k-text-sub)]">{L(lang, DIFF_LABEL[course.difficulty] || {})}</span>
            <span className="text-[10px] text-[var(--y2k-text-sub)]">{L(lang, course.estimatedCost)}</span>
          </div>
        </div>
      </div>
    </button>
  )
}


// ═══════════════════════════════════════════════
// ShareCard
// ═══════════════════════════════════════════════
function ShareCard({ course, lang, onClose }) {
  const isRecommended = !!course.coverEmoji
  const totalDuration = (course.stops || []).reduce((sum, s) => sum + parseDuration(s.duration), 0)
  const totalCost = (course.stops || []).reduce((sum, s) => sum + (s.cost || 0), 0)
  const stopLabel = (s) => typeof s.name === 'string' ? s.name : s.name?.[lang] || s.name?.en || s.name?.ko || ''

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-sm">
        <div className="bg-white rounded-[20px] p-6 border border-[var(--y2k-border)]">
          <p className="text-xs font-bold tracking-widest text-gray-400 mb-4">HANPOCKET</p>
          <h2 className="text-xl font-bold text-[var(--y2k-text)] mb-4">
            {isRecommended ? L(lang, course.name) : course.name}
          </h2>
          <div className="space-y-2 mb-4">
            {(course.stops || []).map((stop, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white text-[10px] flex items-center justify-center font-bold shrink-0">{PIN_LABELS[i]}</span>
                <span className="text-sm text-[#374151]">{stopLabel(stop)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-gray-500 mb-4">
            <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}min</span>
            {totalCost > 0 && <span>{L(lang, { ko: '₩', zh: '₩', en: '₩' })}{totalCost.toLocaleString()}</span>}
          </div>
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-400">{L(lang, { ko: '한국 여행은 HanPocket', zh: '韩国旅行就用HanPocket', en: 'Travel Korea with HanPocket' })}</p>
            <p className="text-[10px] text-gray-300">hanpocket.pages.dev</p>
          </div>
        </div>
        <p className="text-center text-xs text-white/80 mt-3">
          {L(lang, { ko: '스크린샷을 찍어 공유하세요', zh: '截图分享吧', en: 'Take a screenshot to share' })}
        </p>
        <button onClick={onClose} className="w-full mt-2 bg-white rounded-[20px] py-3 text-sm font-medium text-[var(--y2k-text)]">
          {L(lang, { ko: '닫기', zh: '关闭', en: 'Close' })}
        </button>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════
// CourseDetail — map above timeline, flex blocks
// ═══════════════════════════════════════════════
// PhraseCard bottom sheet
function PhraseCard({ type, stopName, lang, onClose }) {
  const phrases = PHRASE_DATA[type] || PHRASE_DATA.default
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-t-[16px] max-h-[60vh] flex flex-col max-w-[480px] mx-auto w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--y2k-border)]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[var(--y2k-text)]">{stopName}</span>
            {STOP_TYPE_LABEL[type] && <span className="text-[10px] bg-[#F3F4F6] text-[var(--y2k-text-sub)] px-1.5 py-px rounded-[4px]">{L(lang, STOP_TYPE_LABEL[type])}</span>}
          </div>
          <button onClick={onClose} className="p-1"><span className="text-[var(--y2k-text-sub)]">✕</span></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {phrases.map((p, i) => (
            <div key={i} className="px-4 py-3 border-b border-[#F3F4F6] last:border-0">
              <p className="text-[16px] font-bold text-[var(--y2k-text)]">{p.ko}</p>
              <p className="text-[12px] text-[var(--y2k-text-sub)] italic mt-0.5">{p.pr}</p>
              <p className="text-[14px] text-[#374151] mt-1">{p.zh}</p>
              <p className="text-[12px] text-[var(--y2k-text-sub)] mt-0.5">{p.en}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CourseDetail({ course, lang, onBack, onSave, isSaved }) {
  const isRecommended = !!course.coverEmoji
  const [startHour, setStartHour] = useState(9)
  const [showShareCard, setShowShareCard] = useState(false)
  const [phraseCard, setPhraseCard] = useState(null)
  const [mapProvider, setMapProvider] = useState(() => localStorage.getItem('hp_map_provider') || 'kakao')

  const handleMapProvider = (p) => {
    setMapProvider(p)
    localStorage.setItem('hp_map_provider', p)
  }

  const stopName = (s, preferLang) => {
    if (typeof s.name === 'string') return s.name
    return s.name?.[preferLang] || s.name?.en || s.name?.ko || ''
  }

  const openGoogleMaps = () => {
    const stops = course.stops
    if (!stops?.length) return
    const origin = stopName(stops[0], 'ko')
    const dest = stopName(stops[stops.length - 1], 'ko')
    const middle = stops.slice(1, -1).slice(0, 9)
    const waypoints = middle.length > 0 ? middle.map(s => stopName(s, 'ko')).join('|') : ''
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
    if (waypoints) url += `&waypoints=${waypoints}`
    window.open(url, '_blank')
  }

  const openBaidu = () => {
    const lastStop = course.stops?.slice(-1)[0]
    if (!lastStop) return
    window.open(`baidumap://map/direction?destination=${encodeURIComponent(stopName(lastStop, 'zh'))}&coord_type=wgs84&mode=transit`, '_blank')
  }

  const openNaverMaps = () => {
    const stops = course.stops
    if (!stops?.length) return
    const parts = stops.map(s => `${s.lng},${s.lat},${stopName(s, 'ko')}`)
    window.open(`https://map.naver.com/v5/directions/${parts.join('/')}/transit`, '_blank')
  }

  const openKakaoMap = () => {
    const stops = course.stops
    if (!stops?.length) return
    window.open(`https://map.kakao.com/?sName=${stopName(stops[0], 'ko')}&eName=${stopName(stops[stops.length - 1], 'ko')}`, '_blank')
  }

  return (
    <div className="h-full flex flex-col max-w-[480px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--y2k-border)]">
        <button onClick={onBack} className="p-1"><span className="text-[var(--y2k-text)]">←</span></button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[var(--y2k-text)] truncate">
            {isRecommended ? L(lang, course.name) : course.name}
          </p>
          {isRecommended && course.name?.en && lang !== 'en' && (
            <p className="text-[11px] text-[var(--y2k-text-sub)] truncate">{course.name.en}</p>
          )}
        </div>
        <button className="text-[11px] text-[var(--y2k-text)] font-semibold border border-[var(--y2k-pink)] rounded-[20px] px-3 py-1 shrink-0">
          {L(lang, { ko: '실시간', zh: '实时', en: 'Live' })}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Map — above timeline */}
        {course.stops?.length > 0 && course.stops[0].lat && (
          <div className="px-4 pt-4">
            <MapProviderToggle provider={mapProvider} onChange={handleMapProvider} lang={lang} />
            {mapProvider === 'naver'
              ? <NaverCourseMap stops={course.stops} lang={lang} onSwitchToKakao={() => handleMapProvider('kakao')} />
              : <CourseMap stops={course.stops} lang={lang} />
            }
          </div>
        )}

        {/* Start time picker */}
        <div className="flex items-center gap-2 px-4 mt-4 mb-3">
          <span className="text-xs text-[var(--y2k-text-sub)]">{L(lang, { ko: '시작시간', zh: '开始时间', en: 'Start time' })}</span>
          <select
            value={startHour}
            onChange={e => setStartHour(Number(e.target.value))}
            className="text-sm font-bold text-[var(--y2k-text)] bg-[var(--y2k-bg)] rounded-[20px] px-2 py-1 outline-none"
          >
            {Array.from({ length: 17 }, (_, i) => i + 6).map(h => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
            ))}
          </select>
        </div>

        {/* Timeline with flex blocks */}
        <div className="px-4 pb-4">
          {course.stops?.map((stop, i) => {
            // Compute cumulative time
            let cumMinutes = startHour * 60
            for (let j = 0; j < i; j++) {
              cumMinutes += parseDuration(course.stops[j].duration)
              // Add transport time
              if (course.transport?.[j]) cumMinutes += parseDuration(course.transport[j].duration)
              // Add flex time (50% of stop duration)
              const flex = Math.max(10, Math.round(parseDuration(course.stops[j].duration) * 0.5 / 5) * 5)
              cumMinutes += flex
            }
            const hh = String(Math.floor(cumMinutes / 60) % 24).padStart(2, '0')
            const mm = String(cumMinutes % 60).padStart(2, '0')
            const label = PIN_LABELS[i]
            const flexMin = Math.max(10, Math.round(parseDuration(stop.duration) * 0.5 / 5) * 5)

            return (
              <div key={i}>
                {/* Stop block — compact */}
                <div className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[var(--y2k-text)] shrink-0"
                      style={{ backgroundColor: STOP_TYPE_BG[stop.type] || '#F3F4F6' }}
                    >
                      {label}
                    </div>
                    {(i < course.stops.length - 1) && <div className="flex-1 w-px bg-[#E5E7EB]" />}
                  </div>

                  <div className="flex-1 pb-2 min-w-0">
                    {/* Time + type + duration — single line */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[var(--y2k-text)]">{stop.startTime || `${hh}:${mm}`}</span>
                      {STOP_TYPE_LABEL[stop.type] && (
                        <span className="text-[10px] bg-[#F3F4F6] text-[var(--y2k-text-sub)] px-1.5 py-px rounded-[4px]">
                          {L(lang, STOP_TYPE_LABEL[stop.type])}
                        </span>
                      )}

                    </div>

                    {/* Name */}
                    <p className="font-bold text-[14px] text-[var(--y2k-text)] mt-0.5 leading-tight">{isRecommended ? L(lang, stop.name) : stop.name}</p>

                    {/* Ratings inline */}
                    {(stop.naverRating || stop.hpRating) && (
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                        {stop.naverRating && <span className="text-[var(--y2k-text-sub)]">{stop.naverRating}</span>}
                        {stop.hpRating && <span className="text-[var(--y2k-text-sub)]">{stop.hpRating}</span>}
                      </div>
                    )}

                    {/* Action buttons — small inline */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        onClick={() => {
                          if (stop.lat && stop.lng) {
                            const name = encodeURIComponent(isRecommended ? (stop.name?.ko || L('ko', stop.name)) : stop.name)
                            window.open(`https://map.kakao.com/link/to/${name},${stop.lat},${stop.lng}`, '_blank')
                          }
                        }}
                        className="flex items-center gap-1 bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white text-[10px] font-semibold px-2.5 py-1 rounded-[5px] active:scale-95"
                      >
                        {L(lang, { ko: '길찾기', zh: '导航', en: 'Nav' })}
                      </button>
                      <button
                        onClick={() => setPhraseCard({ type: stop.type || 'default', name: isRecommended ? L(lang, stop.name) : stop.name })}
                        className="flex items-center gap-1 bg-white border border-[var(--y2k-border)] text-[var(--y2k-text)] text-[10px] font-semibold px-2.5 py-1 rounded-[5px] active:scale-95"
                      >
                        {L(lang, { ko: '회화카드', zh: '会话卡', en: 'Phrase' })}
                      </button>
                      {stop.tip && (
                        <span className="text-[10px] text-[var(--y2k-text-sub)] ml-1 truncate flex-1">
                          {isRecommended ? L(lang, stop.tip) : stop.tip}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transport time — 4 modes like KakaoMap */}
                {i < course.stops.length - 1 && (() => {
                  const modes = estimateAllModes(stop, course.stops[i + 1])
                  if (!modes) return null
                  const dLinks = getDirectionLinks(stop, course.stops[i + 1])
                  const MAP_LINKS = [
                    { label: 'Naver', url: dLinks.naver, color: '#03C75A' },
                    { label: 'Kakao', url: dLinks.kakao, color: '#3396FF' },
                    { label: 'Google', url: dLinks.google, color: '#34A853' },
                    { label: L(lang, { ko: '百度', zh: '百度地图', en: 'Baidu' }), url: dLinks.baidu, color: '#3385FF' },
                    { label: L(lang, { ko: '高德', zh: '高德地图', en: 'Amap' }), url: dLinks.amap, color: '#2B6BFF' },
                  ]
                  const MODE_DISPLAY = [
                    { key: 'taxi', icon: '🚕', label: { ko: '택시', zh: '出租车', en: 'Taxi' } },
                    { key: 'transit', icon: '🚇', label: { ko: '대중교통', zh: '公共交通', en: 'Transit' } },
                    { key: 'walk', icon: '🚶', label: { ko: '도보', zh: '步行', en: 'Walk' } },
                    { key: 'bicycle', icon: '🚲', label: { ko: '자전거', zh: '自行车', en: 'Bike' } },
                  ]
                  return (
                    <div className="flex gap-2.5 ml-0.5">
                      <div className="w-8 flex justify-center">
                        <div className="w-px bg-[#E5E7EB]" />
                      </div>
                      <div className="flex-1 py-1.5">
                        <div className="flex items-center gap-3 text-[10px]">
                          {MODE_DISPLAY.map(m => (
                            <span key={m.key} className="text-[var(--y2k-text-sub)] whitespace-nowrap">
                              {m.icon} {modes[m.key].minMinutes && modes[m.key].maxMinutes && modes[m.key].minMinutes !== modes[m.key].maxMinutes ? `${modes[m.key].minMinutes}~${modes[m.key].maxMinutes}` : modes[m.key].minutes}{L(lang, { ko: '분', zh: '分', en: 'm' })}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {MAP_LINKS.filter(l => l.url).map((l, idx) => (
                            <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-medium" style={{ color: l.color }}>
                              {l.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>

        {/* Tags */}
        {course.tags && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-4">
            {course.tags.map((tag, i) => (
              <span key={i} className="text-[10px] text-[var(--y2k-text-sub)] bg-[var(--y2k-bg)] px-2 py-0.5 rounded-[20px]">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="px-4 py-3 border-t border-[var(--y2k-border)] space-y-2">
        {isRecommended && (
          <button
            onClick={onSave}
            disabled={isSaved}
            className={`w-full py-2.5 rounded-[20px] text-sm font-semibold transition-colors ${
              isSaved ? 'bg-[var(--y2k-bg)] text-[var(--y2k-text-sub)]' : 'bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white active:scale-95'
            }`}
          >
            {isSaved
              ? L(lang, { ko: '추가됨', zh: '已添加', en: 'Added' })
              : L(lang, { ko: '내 코스에 추가', zh: '添加到我的路线', en: 'Add to My Courses' })}
          </button>
        )}
        {/* 지도 앱 아이콘 + 공유 — 한 줄 */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={openBaidu} className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center active:scale-90 transition-transform" title="Baidu">
            <span className="text-[13px] font-bold text-[#3385FF]">B</span>
          </button>
          <button onClick={openNaverMaps} className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center active:scale-90 transition-transform" title="Naver">
            <span className="text-[13px] font-bold text-[#03C75A]">N</span>
          </button>
          <button onClick={openGoogleMaps} className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center active:scale-90 transition-transform" title="Google">
            <span className="text-[13px] font-bold text-[#4285F4]">G</span>
          </button>
          <button onClick={openKakaoMap} className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center active:scale-90 transition-transform" title="Kakao">
            <span className="text-[13px] font-bold text-[#FEE500]">K</span>
          </button>
          <div className="w-px h-6 bg-[#E5E7EB]" />
          <button onClick={() => setShowShareCard(true)} className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center active:scale-90 transition-transform" title="Share">
            <span className="text-xs text-[var(--y2k-text-sub)]">공유</span>
          </button>
        </div>
      </div>

      {showShareCard && <ShareCard course={course} lang={lang} onClose={() => setShowShareCard(false)} />}
      {phraseCard && <PhraseCard type={phraseCard.type} stopName={phraseCard.name} lang={lang} onClose={() => setPhraseCard(null)} />}
    </div>
  )
}


// ═══════════════════════════════════════════════
// CreateCourse — redesigned with place search + reverse geocoding
// ═══════════════════════════════════════════════

// Kakao JS SDK place search (uses already-loaded kakao.maps)
function ensureKakaoServices() {
  return new Promise((resolve) => {
    if (window.kakao?.maps?.services) { resolve(); return }
    // coord2Address requires the Maps API key (not the JS login key)
    const key = import.meta.env.VITE_KAKAO_MAP_API_KEY || import.meta.env.VITE_KAKAO_JS_KEY || 'd93decd524c15c3455ff05983ca07fac'
    if (document.querySelector(`script[src*="dapi.kakao.com/v2/maps/sdk.js"]`)) {
      // Already loading, wait
      const check = setInterval(() => {
        if (window.kakao?.maps?.services) { clearInterval(check); resolve() }
      }, 200)
      setTimeout(() => { clearInterval(check); resolve() }, 5000)
      return
    }
    const s = document.createElement('script')
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`
    s.onload = () => {
      window.kakao.maps.load(() => resolve())
    }
    document.head.appendChild(s)
  })
}

// 입력 텍스트 언어 자동 감지
function detectLang(text) {
  if (/[\u3400-\u9FFF]/.test(text)) {
    // CJK 통합한자 — 중국어 or 일본어 한자
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja' // 히라가나/카타카나 있으면 일본어
    return 'zh'
  }
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja'
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'
  return 'en'
}

async function searchPlace(query) {
  if (!query || query.length < 1) return []

  const inputLang = detectLang(query)

  // ━━━ 1. 먼저 로컬 DB 검색 (모든 언어) ━━━
  const local = searchLocalPlaces(query, 7).map(p => ({
    ...p, // 확장 데이터 포함
    name: p.ko,
    koName: p.ko,
    nameZh: p.zh,
    nameEn: p.en,
    nameJa: p.ja || '',
    address: p.address_zh || p.address_ko || '',
    source: 'local',
    inputLang,
  }))

  // ━━━ 2. 한국어 or 영어: 카카오맵 보강 (확장 장소가 있으면 생략) ━━━
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
              name: doc.place_name, address: doc.address_name,
              lat: parseFloat(doc.y), lng: parseFloat(doc.x),
              category: doc.category_group_name, source: 'kakao',
              koName: doc.place_name,
            })))
          })
        })
      }
    } catch(e) {}
    return [...local, ...kakao].slice(0, 7)
  }

  // ━━━ 3. 중국어 or 일본어: 로컬 매칭만 ━━━
  return local
}

async function reverseGeocode(lat, lng) {
  await ensureKakaoServices()
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services) { resolve(null); return }
    const gc = new window.kakao.maps.services.Geocoder()
    gc.coord2Address(lng, lat, (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK || !result?.[0]) { resolve(null); return }
      const doc = result[0]
      resolve(doc.road_address?.building_name || doc.road_address?.address_name || doc.address?.address_name || null)
    })
  })
}

export function CreateCourse({ lang, onBack, onSave }) {
  const [name, setName] = useState('')
  const [stops, setStops] = useState([{ name: '', lat: 0, lng: 0, confirmed: false }])
  const [activeIdx, setActiveIdx] = useState(0) // which stop is being edited
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [detailPlace, setDetailPlace] = useState(null) // PlaceDetail modal
  const [mapProvider, setMapProvider] = useState(() => localStorage.getItem('hp_map_provider') || 'kakao')
  const searchTimerRef = useRef(null)

  const handleMapProvider = (p) => {
    setMapProvider(p)
    localStorage.setItem('hp_map_provider', p)
  }

  // Debounced search
  const handleSearch = (q) => {
    setSearchQuery(q)
    clearTimeout(searchTimerRef.current)
    if (q.length < 1) { setSearchResults([]); return }
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true)
      const results = await searchPlace(q)
      setSearchResults(results)
      setSearching(false)
    }, 300)
  }

  // Select a search result
  const selectResult = (result) => {
    // 확장 데이터가 있는 장소 → PlaceDetail 표시
    if (result.category) {
      setDetailPlace(result)
      return
    }
    // 기존 로직 — 코스에 바로 추가
    const next = [...stops]
    // 항상 한국어 이름으로 저장 (카카오맵 호환)
    const koName = result.koName || result.name
    next[activeIdx] = { name: koName, lat: result.lat, lng: result.lng, confirmed: true, address: result.address }
    setStops(next)
    setSearchQuery('')
    setSearchResults([])
    // Auto-add next stop if this was the last one
    if (activeIdx === next.length - 1 && next.length < 10) {
      next.push({ name: '', lat: 0, lng: 0, confirmed: false })
      setStops(next)
      setActiveIdx(activeIdx + 1)
    } else {
      // Move to next unconfirmed
      const nextUnconfirmed = next.findIndex((s, i) => i > activeIdx && !s.confirmed)
      if (nextUnconfirmed >= 0) setActiveIdx(nextUnconfirmed)
    }
  }

  // GPS → reverse geocode → fill stop
  const handleGPS = async () => {
    if (!navigator.geolocation) {
      alert(L(lang, { ko: '이 브라우저에서 위치 서비스를 사용할 수 없습니다', zh: '此浏览器不支持定位服务', en: 'Geolocation not supported' }))
      return
    }
    // Geolocation requires HTTPS (except localhost)
    if (location.protocol === 'http:' && !location.hostname.match(/^(localhost|127\.)/)) {
      alert(L(lang, { ko: 'HTTPS 환경에서만 GPS를 사용할 수 있습니다. 장소 검색을 이용해주세요.', zh: '仅在HTTPS环境下可使用GPS，请使用搜索功能。', en: 'GPS requires HTTPS. Please use the search instead.' }))
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords
      let placeName = null
      try { placeName = await reverseGeocode(lat, lng) } catch(e) {}
      const next = [...stops]
      next[activeIdx] = {
        name: placeName || L(lang, { ko: '내 현재 위치', zh: '我的当前位置', en: 'My Current Location' }),
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
        confirmed: true,
        address: placeName
      }
      // Auto-add next stop
      if (activeIdx === next.length - 1 && next.length < 10) {
        next.push({ name: '', lat: 0, lng: 0, confirmed: false })
        setActiveIdx(activeIdx + 1)
      }
      setStops(next)
      setGpsLoading(false)
    }, (err) => {
      setGpsLoading(false)
      const msgs = {
        1: L(lang, { ko: '위치 권한이 거부되었습니다. 설정에서 허용해주세요.', zh: '位置权限被拒绝，请在设置中允许。', en: 'Location permission denied.' }),
        2: L(lang, { ko: '현재 위치를 확인할 수 없습니다. 장소 검색을 이용해주세요.', zh: '无法获取位置，请使用搜索功能。', en: 'Position unavailable. Use search instead.' }),
        3: L(lang, { ko: '위치 확인 시간이 초과되었습니다. 다시 시도하거나 검색을 이용해주세요.', zh: '定位超时，请重试或使用搜索。', en: 'Location timed out. Try again or use search.' }),
      }
      alert(msgs[err.code] || msgs[2])
    }, { enableHighAccuracy: true, timeout: 8000 })
  }

  const removeStop = (i) => {
    if (stops.length <= 1) {
      // 마지막 1개면 초기화
      setStops([{ name: '', lat: 0, lng: 0, confirmed: false }])
      setActiveIdx(0)
      return
    }
    const next = stops.filter((_, idx) => idx !== i)
    setStops(next)
    if (activeIdx >= next.length) setActiveIdx(next.length - 1)
    else if (activeIdx > i) setActiveIdx(activeIdx - 1)
  }

  const moveStop = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= stops.length) return
    const next = [...stops];
    [next[i], next[j]] = [next[j], next[i]]
    setStops(next)
    if (activeIdx === i) setActiveIdx(j)
    else if (activeIdx === j) setActiveIdx(i)
  }

  const stopsWithCoords = stops.filter(s => s.confirmed && s.lat && s.lng)

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const validStops = stops.filter(s => s.confirmed && s.name.trim()).map(s => ({
      name: s.name, lat: s.lat, lng: s.lng, duration: '1h', type: 'tourism'
    }))
    if (validStops.length < 2) return
    onSave({ id: `custom-${Date.now()}`, name: trimmed, stops: validStops, transport: [], tags: [], createdAt: new Date().toISOString() })
  }

  const stopLabel = (i) => {
    const confirmed = stops.filter(s => s.confirmed)
    if (i === 0) return L(lang, { ko: '출발', zh: '出发', en: 'Start' })
    const lastConfirmed = stops.length - 1 === i || (i === stops.filter(s => s.confirmed).length - 1 && stops[stops.length-1]?.confirmed)
    if (i === stops.length - 1 && stops[i].confirmed) return L(lang, { ko: '도착', zh: '到达', en: 'End' })
    return PIN_LABELS[i] || String(i + 1)
  }

  const confirmedCount = stops.filter(s => s.confirmed).length

  // PlaceDetail modal
  if (detailPlace) {
    return <PlaceDetail place={detailPlace} onBack={() => setDetailPlace(null)} lang={lang} isStart={activeIdx === 0} onAddStop={(place) => {
      const next = [...stops]
      next[activeIdx] = { name: place.name, lat: place.lat, lng: place.lng, confirmed: true, address: place.address }
      // 다음 빈 stop 추가
      if (activeIdx === next.length - 1 && next.length < 10) {
        next.push({ name: '', lat: 0, lng: 0, confirmed: false })
        setActiveIdx(activeIdx + 1)
      }
      setStops(next)
      setDetailPlace(null)
      setSearchQuery('')
      setSearchResults([])
    }} onSetDestination={(place) => {
      const next = [...stops]
      next[activeIdx] = { name: place.name, lat: place.lat, lng: place.lng, confirmed: true, address: place.address }
      // 빈 stop 제거 — 더 이상 추가 안 함
      const cleaned = next.filter(s => s.confirmed)
      setStops(cleaned)
      setActiveIdx(-1)
      setDetailPlace(null)
      setSearchQuery('')
      setSearchResults([])
      // 이름 입력란 반짝임
      setTimeout(() => {
        const nameInput = document.querySelector('[data-name-input]')
        if (nameInput) {
          nameInput.focus()
          nameInput.classList.add('flash-highlight')
          setTimeout(() => nameInput.classList.remove('flash-highlight'), 1500)
        }
      }, 300)
    }} />
  }

  return (
    <div className="h-full flex flex-col max-w-[480px] mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--y2k-border)]">
        <button onClick={onBack} className="p-1"><span className="text-[var(--y2k-text)]">←</span></button>
        <p className="font-bold text-sm text-[var(--y2k-text)]">
          {L(lang, { ko: '새 코스 만들기', zh: '创建新路线', en: 'Create New Course' })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Course name — 미니맵 위 */}
        <input
          type="text" value={name} onChange={e => setName(e.target.value)} maxLength={50}
          data-name-input
          placeholder={L(lang, { ko: 'Trip name (Day 1, Day 2, ...)', zh: 'Trip name (Day 1, Day 2, ...)', en: 'Trip name (Day 1, Day 2, ...)' })}
          className="w-full bg-[var(--y2k-bg)] rounded-[20px] px-3 py-2.5 text-sm text-[var(--y2k-text)] outline-none placeholder:text-[var(--y2k-text-sub)]"
          style={{ transition: 'box-shadow 0.3s ease' }}
        />

        {/* Mini Map */}
        {stopsWithCoords.length >= 2 ? (
          <>
            <MapProviderToggle provider={mapProvider} onChange={handleMapProvider} lang={lang} />
            {mapProvider === 'naver'
              ? <NaverCourseMap stops={stopsWithCoords} lang={lang} onSwitchToKakao={() => handleMapProvider('kakao')} />
              : <CourseMap stops={stopsWithCoords} lang={lang} />
            }
          </>
        ) : stopsWithCoords.length === 1 ? (
          <div className="rounded-[20px] border border-[var(--y2k-border)] bg-[#F0F7F4] flex items-center justify-center" style={{ height: 120 }}>
            <p className="text-xs text-[#2D5A3D]">📍 {stopsWithCoords[0].name} {L(lang, { ko: '— 다음 장소를 추가하세요', zh: '— 请添加下一个地点', en: '— add next place' })}</p>
          </div>
        ) : (
          <div className="rounded-[20px] border border-[var(--y2k-border)] bg-[var(--y2k-bg)] flex items-center justify-center" style={{ height: 100 }}>
            <p className="text-xs text-[var(--y2k-text-sub)]">{L(lang, { ko: '출발지를 먼저 선택하세요', zh: '请先选择出发地', en: 'Select your starting point' })}</p>
          </div>
        )}

        {/* Confirmed stops list */}
        <div className="space-y-1">
          {stops.map((stop, i) => {
            const isActive = i === activeIdx
            const nextStop = stops[i + 1]
            const hasBothCoords = stop.confirmed && nextStop?.confirmed && stop.lat && nextStop?.lat

            return (
              <div key={i}>
                {/* Confirmed stop card */}
                {stop.confirmed ? (
                  <div
                    className={`rounded-[20px] p-3 border transition-colors ${isActive ? 'border-[#2D5A3D] bg-[#F0F7F4]' : 'border-[var(--y2k-border)] bg-white'}`}
                    onClick={() => setActiveIdx(i)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {stopLabel(i)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--y2k-text)] truncate">{stop.name}</p>
                        {stop.address && stop.address !== stop.name && (
                          <p className="text-[10px] text-[var(--y2k-text-sub)] truncate">{stop.address}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); moveStop(i, -1) }} disabled={i === 0} className="text-[var(--y2k-text-sub)] disabled:opacity-20 p-0.5"><span>↑</span></button>
                        <button onClick={(e) => { e.stopPropagation(); moveStop(i, 1) }} disabled={i === stops.length - 1} className="text-[var(--y2k-text-sub)] disabled:opacity-20 p-0.5"><span>↓</span></button>
                        <button onClick={(e) => { e.stopPropagation(); removeStop(i) }} className="text-[var(--y2k-text-sub)] hover:text-red-500 p-0.5"><span>삭제</span></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Active search input for unconfirmed stop */
                  <div className="rounded-[20px] p-3 border-2 border-dashed border-[#2D5A3D] bg-[#F0F7F4]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-[#2D5A3D] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {i === 0 ? (L(lang, { ko: '출발', zh: '出发', en: 'Start' })) : '+'}
                      </span>
                      <p className="text-xs font-medium text-[#2D5A3D]">
                        {i === 0
                          ? L(lang, { ko: '어디서 출발하시나요?', zh: '从哪里出发？', en: 'Where do you start?' })
                          : L(lang, { ko: '다음 장소를 검색하세요', zh: '搜索下一个地点', en: 'Search next place' })
                        }
                      </p>
                    </div>

                    {/* GPS button (first stop only) */}
                    {i === 0 && (
                      <button
                        onClick={handleGPS}
                        disabled={gpsLoading}
                        className="w-full mb-2 py-2.5 rounded-[20px] bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        {gpsLoading ? (
                          <span className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
                        ) : '📍'}
                        {gpsLoading
                          ? L(lang, { ko: '위치 확인 중...', zh: '定位中...', en: 'Locating...' })
                          : L(lang, { ko: '현재 위치에서 출발', zh: '从当前位置出发', en: 'Start from my location' })
                        }
                      </button>
                    )}

                    {/* Search input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder={L(lang, { ko: '장소명, 주소, 상호명 검색', zh: '搜索地名、地址、商号', en: 'Search place, address, name' })}
                        className="w-full pl-3 pr-3 py-2.5 bg-white rounded-[20px] text-sm text-[var(--y2k-text)] outline-none border border-[var(--y2k-border)] placeholder:text-[var(--y2k-text-sub)] focus:border-[#2D5A3D]"
                        autoFocus={i > 0}
                      />
                      {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin w-3 h-3 border border-[#9CA3AF] border-t-transparent rounded-full" />}
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                      <div className="mt-1 bg-white rounded-[20px] border border-[var(--y2k-border)] overflow-hidden max-h-48 overflow-y-auto">
                        {searchResults.map((r, ri) => (
                          <button
                            key={ri}
                            onClick={() => selectResult(r)}
                            className="w-full text-left px-3 py-2.5 border-b border-[#F5F5F5] last:border-0 active:bg-[var(--y2k-bg)] transition-colors"
                          >
                            {r.source === 'local' ? (
                              <>
                                <p className="text-sm font-medium text-[var(--y2k-text)]">
                                  {r.inputLang === 'ja' ? (r.nameJa || r.nameZh) : r.nameZh}
                                  <span className="text-[#2D5A3D] text-xs ml-1.5 font-medium">→ {r.koName}</span>
                                </p>
                                <p className="text-[10px] text-[var(--y2k-text-sub)] mt-0.5">
                                  {r.nameEn}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-medium text-[var(--y2k-text)]">{r.name}</p>
                            )}
                            <p className="text-[10px] text-[var(--y2k-text-sub)] mt-0.5">{r.address}{r.category ? ` · ${r.category}` : ''}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Travel time + transport mode selector between confirmed stops */}
                {i < stops.length - 1 && hasBothCoords && (() => {
                  const s1 = { lat: stop.lat, lng: stop.lng, name: stop.name }
                  const s2 = { lat: nextStop.lat, lng: nextStop.lng, name: nextStop.name }
                  const modes = estimateAllModes(s1, s2)
                  if (!modes) return null
                  const dLinks2 = getDirectionLinks(s1, s2)
                  const MAP_LINKS2 = [
                    { label: 'Naver', url: dLinks2.naver, color: '#03C75A' },
                    { label: 'Kakao', url: dLinks2.kakao, color: '#3396FF' },
                    { label: 'Google', url: dLinks2.google, color: '#34A853' },
                    { label: L(lang, { ko: '百度', zh: '百度地图', en: 'Baidu' }), url: dLinks2.baidu, color: '#3385FF' },
                    { label: L(lang, { ko: '高德', zh: '高德地图', en: 'Amap' }), url: dLinks2.amap, color: '#2B6BFF' },
                  ]
                  const MODE_DISPLAY = [
                    { key: 'taxi', icon: '🚕' },
                    { key: 'transit', icon: '🚇' },
                    { key: 'walk', icon: '🚶' },
                    { key: 'bicycle', icon: '🚲' },
                  ]
                  return (
                    <div className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 flex justify-center"><div className="w-px h-3 bg-[#E5E7EB]" /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 text-[10px]">
                            {MODE_DISPLAY.map(m => (
                              <span key={m.key} className="text-[var(--y2k-text-sub)] whitespace-nowrap">
                                {m.icon} {modes[m.key].minMinutes && modes[m.key].maxMinutes && modes[m.key].minMinutes !== modes[m.key].maxMinutes ? `${modes[m.key].minMinutes}~${modes[m.key].maxMinutes}` : modes[m.key].minutes}{L(lang, { ko: '분', zh: '분', en: 'm' })}
                              </span>
                            ))}
                            <span className="text-[var(--y2k-text-sub)]">({modes.km}km)</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 ml-8">
                            {MAP_LINKS2.filter(l => l.url).map((l, idx) => (
                              <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-medium" style={{ color: l.color }}>
                                {l.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
                {i < stops.length - 1 && !hasBothCoords && stop.confirmed && (
                  <div className="flex items-center gap-2 py-1 px-3">
                    <div className="w-6 flex justify-center"><div className="w-px h-3 bg-[#E5E7EB]" /></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Manual add stop button (if last stop is confirmed) */}
        {stops.length < 10 && stops[stops.length - 1]?.confirmed && (
          <button
            onClick={() => { setStops([...stops, { name: '', lat: 0, lng: 0, confirmed: false }]); setActiveIdx(stops.length) }}
            className="w-full py-2 rounded-[20px] border border-dashed border-[#D1D5DB] text-xs text-[var(--y2k-text-sub)] font-medium flex items-center justify-center gap-1 active:bg-[var(--y2k-bg)]"
          >
            + {L(lang, { ko: '경유지 추가', zh: '添加经停点', en: 'Add Stop' })}
          </button>
        )}
      </div>

      <div className="px-4 py-3 border-t border-[var(--y2k-border)]">
        <button onClick={handleSave}
          disabled={!name.trim() || confirmedCount < 2}
          className="w-full py-2.5 rounded-[20px] text-sm font-semibold bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white disabled:bg-[var(--y2k-border)] disabled:text-[var(--y2k-text-sub)] active:scale-95 transition-colors"
        >
          {L(lang, { ko: '저장', zh: '保存', en: 'Save' })}
          {confirmedCount >= 2 && <span className="ml-1 text-xs opacity-70">({confirmedCount}{L(lang, { ko: '곳', zh: '处', en: ' stops' })})</span>}
        </button>
      </div>
    </div>
  )
}


// ─── User-added Popup Card ───
function UserPopupCard({ popup, lang, onDelete }) {
  const info = PLATFORM_INFO[popup.platform] || PLATFORM_INFO.web
  const dday = getDdayLabel(popup, lang)
  const closing = popup.period?.end && (new Date(popup.period.end) - new Date()) / 86400000 <= 7 && (new Date(popup.period.end) - new Date()) >= 0

  return (
    <div className="flex items-start gap-3">
      {popup.image ? (
        <img src={popup.image} alt="" className="w-14 h-14 rounded-[20px] object-cover shrink-0 bg-[#F3F4F6]" />
      ) : (
        <div className="w-14 h-14 rounded-[20px] shrink-0 flex items-center justify-center text-2xl" style={{ backgroundColor: (info.color || '#E5E7EB') + '20' }}>
          {info.icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold" style={{ color: info.color }}>{popup.brand || info.name}</p>
            <p className="text-[13px] font-semibold text-[#1A1A1A] leading-snug truncate">{popup.title || popup.brand || L(lang, { ko: '팝업스토어', zh: '快闪店', en: 'Popup Store' })}</p>
            {popup.address && <p className="text-[11px] text-[var(--y2k-text-sub)] mt-0.5 truncate">{popup.address}</p>}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${closing ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F3F4F6] text-[var(--y2k-text-sub)]'}`}>{dday}</span>
            <button onClick={() => onDelete(popup.id)} className="p-0.5 text-[#D1D5DB] hover:text-[#EF4444]"><span>✕</span></button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[10px] text-[var(--y2k-text-sub)]">{info.icon} {info.name}</span>
          {popup.tags?.slice(0, 2).map(t => (
            <span key={t} className="text-[10px] bg-[#F3F4F6] text-[var(--y2k-text-sub)] px-1.5 py-0.5 rounded-[4px]">#{t}</span>
          ))}
          {popup.sourceUrl && (
            <a href={popup.sourceUrl} target="_blank" rel="noreferrer" className="ml-auto text-[var(--y2k-text-sub)]">
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// CourseTab — main component
// ═══════════════════════════════════════════════
// ─── Editorial Column Data ───────────────────────────────────────────
export const EDITORIAL_COLUMNS = [
  {
    id: 'seongsu',
    area: { ko: '성수동', zh: '圣水洞', en: 'Seongsu-dong' },
    tag: { ko: '🏭 공장 감성', zh: '🏭 工厂美学', en: '🏭 Industrial Chic' },
    title: { ko: '성수, 서울이 가장 뜨겁게 식는 곳', zh: '圣水洞，首尔最炙手可热的地方', en: 'Seongsu: Where Seoul Burns Brightest' },
    excerpt: {
      ko: '구두 공장이 카페로, 인쇄소가 갤러리로. 성수동은 낡은 것을 버리지 않는다. 그것을 다시 태어나게 한다. 서울에서 가장 빠르게 변하는 동네, 그러나 어쩐지 가장 오래된 것들이 살아남는 곳.',
      zh: '鞋厂变咖啡馆，印刷厂变画廊。圣水洞不丢弃旧事物，而是让它们重生。首尔变化最快的街区，却又是最古老的东西得以留存的地方。',
      en: "Old shoe factories turned into caf\u00e9s. Print shops become galleries. Seongsu doesn\u2019t discard the past \u2014 it reincarnates it. The fastest-changing neighborhood in Seoul, yet somehow the oldest things survive here.",
    },
    body: {
      ko: '성수동에 처음 온 중국 여행자라면, 일단 놀랄 것이다. 여기가 정말 서울인가? 낡은 구두 공장의 벽돌벽 앞에서 사람들이 라떼를 마시고, 인쇄소였던 건물 안에서 전시회가 열린다. 성수동은 "힙"이라는 단어가 가장 자연스러운 곳이다.\n\n🔥 꼭 가야 하는 이유:\n• 대림창고 — 창고를 개조한 초대형 카페+갤러리. 천장이 10m, 커피 한 잔에 예술 전시를 볼 수 있다.\n• 어니언 성수 — 폐공장을 그대로 살린 베이커리. 시그니처 "팥 크루아상"은 줄을 서서라도 먹을 가치가 있다.\n• 성수연방 — 편집샵, 팝업스토어, 루프탑이 한 건물에. 매주 새로운 브랜드가 들어온다.\n• 서울숲 — 도심 한가운데 거대한 공원. 사슴을 만날 수 있다(진짜로!).\n\n💡 꿀팁: 성수동은 걸어 다녀야 제맛이다. 골목골목에 숨어있는 카페와 편집샵을 발견하는 재미가 있다. 2호선 성수역 3번 출구에서 시작하면 된다.',
      zh: '如果你是第一次来圣水洞的中国游客，一定会震惊。这真的是首尔吗？人们在旧鞋厂的砖墙前喝拿铁，印刷厂里办起了展览。圣水洞是"潮"这个字最自然的所在。\n\n🔥 必去理由：\n• 大林仓库 — 仓库改造的超大咖啡馆+画廊。天花板10米高，一杯咖啡就能看艺术展。\n• Onion圣水 — 保留废工厂原貌的面包店。招牌"红豆牛角包"值得排队。\n• 圣水联邦 — 集合店、快闪店、天台一栋搞定。每周都有新品牌入驻。\n• 首尔森林 — 市中心的巨大公园。可以遇到鹿（真的！）。\n\n💡 小贴士：圣水洞一定要走着逛。每条小巷都藏着惊喜咖啡馆和集合店。从2号线圣水站3号出口开始就对了。',
      en: "If you're visiting Seongsu-dong for the first time, prepare to be surprised. Is this really Seoul? People sip lattes in front of old shoe factory brick walls, and exhibitions open inside former print shops. Seongsu is where 'hip' feels most natural.\n\n🔥 Must-visit highlights:\n• Daelim Warehouse — A massive café+gallery in a converted warehouse. 10m ceilings, art exhibition with your coffee.\n• Onion Seongsu — A bakery preserving the original factory look. The signature 'red bean croissant' is worth the queue.\n• Seongsu Yeonbang — Select shops, pop-ups, and rooftop in one building. New brands arrive weekly.\n• Seoul Forest — A huge park in the city center. You can actually meet deer!\n\n💡 Pro tip: Seongsu is best explored on foot. Hidden cafés and select shops await in every alley. Start from Line 2 Seongsu Station Exit 3.",
    },
    readTime: { ko: '3분', zh: '3分钟', en: '3 min' },
    stops: [
      { name: { ko: '대림창고', zh: '大林仓库', en: 'Daelim Warehouse' }, duration: 45, tip: { ko: '대형 창고 갤러리+카페', zh: '大型仓库画廊+咖啡馆', en: 'Warehouse gallery+café' }, type: 'cafe', lat: 37.5432, lng: 127.0557 },
      { name: { ko: '성수연방', zh: '圣水联邦', en: 'Seongsu Yeonbang' }, duration: 40, tip: { ko: '편집샵+팝업 복합공간', zh: '集合店+快闪复合空间', en: 'Select shop+popup complex' }, type: 'shopping', lat: 37.5441, lng: 127.0565 },
      { name: { ko: '서울숲', zh: '首尔森林', en: 'Seoul Forest' }, duration: 60, tip: { ko: '도심 속 힐링 공원', zh: '都市疗愈公园', en: 'Urban healing park' }, type: 'park', lat: 37.5449, lng: 127.0374 },
      { name: { ko: '어니언 성수', zh: 'Onion圣水', en: 'Onion Seongsu' }, duration: 50, tip: { ko: '시그니처 베이글+공장 감성 인테리어', zh: '招牌贝果+工厂风格装潢', en: 'Signature bagel+industrial interior' }, type: 'cafe', lat: 37.5430, lng: 127.0561 },
    ],
    transport: [{ mode: 'walk', detail: { ko: '도보 이동 가능', zh: '步行可达', en: 'Walkable' } }],
    tags: ['성수', '카페', '편집샵', '팝업'],
    duration: '3-4시간',
  },
  {
    id: 'hongdae',
    area: { ko: '홍대·합정', zh: '弘大·合井', en: 'Hongdae·Hapjeong' },
    tag: { ko: '🎸 인디 씬', zh: '🎸 独立乐队', en: '🎸 Indie Scene' },
    title: { ko: '홍대 앞, 밤이 시작되는 문법', zh: '弘大，夜晚开始的语法', en: 'Hongdae: The Grammar of Beginning Night' },
    excerpt: {
      ko: '낮의 홍대는 연습이다. 진짜 홍대는 해가 지고 나서야 시작된다. 클럽과 라이브 무대, 새벽 두 시의 포장마차, 길거리 퍼포먼스. 여기선 누구나 주인공이 될 수 있고, 관객이 될 수 있다.',
      zh: '白天的弘大只是彩排。真正的弘大在日落之后才开始。夜店和现场舞台，凌晨两点的路边摊，街头表演。在这里，每个人都可以是主角，也可以是观众。',
      en: 'Daytime Hongdae is just rehearsal. The real Hongdae begins after sunset. Clubs, live stages, 2AM street stalls, impromptu performances. Here, anyone can be the star — or the audience.',
    },
    body: {
      ko: '홍대를 낮에만 갔다면, 홍대를 모르는 것이다. 오후 6시가 넘으면 홍대는 완전히 다른 도시가 된다. 거리의 버스커들이 노래를 시작하고, 라이브 클럽에서 음악이 새어나오고, 포장마차에서 소주잔이 부딪힌다.\n\n🎸 홍대 완벽 동선:\n• 걷고싶은거리 (17:00~) — 버스킹 공연 감상. 실력이 아이돌급인 아마추어들이 수두룩하다.\n• 연남동 경의선숲길 (15:00~) — 폐철도를 개조한 산책로. 양쪽에 카페, 맛집, 소품샵이 줄지어 있다. 피크닉 세트를 빌려서 잔디에 앉아보자.\n• 합정 카페거리 — 인디 감성 카페의 성지. "어디가 좋아?"라고 물으면 합정이라고 대답하는 서울 사람이 많다.\n• 상수동 바거리 (21:00~) — 이자카야, 와인바, 칵테일바가 밀집. 늦은 밤 분위기 최고.\n\n💡 꿀팁: 금요일/토요일 밤이 최고. 하지만 혼잡해서 소매치기 주의! 지하철 막차는 자정 즈음이니 시간 체크.',
      zh: '如果你只在白天去过弘大，那你还不了解弘大。下午6点以后，弘大变成完全不同的城市。街头艺人开始唱歌，现场音乐从Live House传出，路边摊的烧酒杯碰撞作响。\n\n🎸 弘大完美路线：\n• 步行街 (17:00~) — 欣赏街头表演。水平堪比偶像的业余歌手比比皆是。\n• 延南洞京义线林荫道 (15:00~) — 废弃铁路改造的散步道。两旁咖啡馆、美食店、杂货店一字排开。可以租野餐套装在草坪上坐坐。\n• 合井咖啡街 — 独立感性咖啡馆的圣地。问首尔人"哪里好？"很多人会回答合井。\n• 上水洞酒吧街 (21:00~) — 居酒屋、红酒吧、鸡尾酒吧密集。深夜氛围最棒。\n\n💡 小贴士：周五/周六晚最佳。但人多要注意扒手！地铁末班车在午夜左右，注意时间。',
      en: "If you've only visited Hongdae during the day, you don't know Hongdae. After 6PM, it transforms into a completely different city.\n\n🎸 Perfect Hongdae Route:\n• Walking Street (17:00~) — Watch buskers perform. Amateur singers with idol-level talent are everywhere.\n• Yeonnam-dong Forest Path (15:00~) — A converted railway walking path. Cafés, restaurants, and shops line both sides.\n• Hapjeong Café Street — The holy ground of indie cafés.\n• Sangsu Bar Street (21:00~) — Izakayas, wine bars, cocktail bars. Best late-night vibes.\n\n💡 Pro tip: Friday/Saturday nights are peak. Watch out for pickpockets in crowds! Last subway is around midnight.",
    },
    readTime: { ko: '4분', zh: '4分钟', en: '4 min' },
    stops: [
      { name: { ko: '홍대 걷고싶은거리', zh: '弘大步行街', en: 'Hongdae Walking Street' }, duration: 50, tip: { ko: '버스킹 핫스팟', zh: '街头表演热门地点', en: 'Busking hotspot' }, type: 'tourism', lat: 37.5559, lng: 126.9228 },
      { name: { ko: '연남동 경의선숲길', zh: '延南洞京义线林荫道', en: 'Yeonnam-dong Forest Path' }, duration: 60, tip: { ko: '피크닉+카페 거리', zh: '野餐+咖啡街道', en: 'Picnic+café street' }, type: 'walk', lat: 37.5627, lng: 126.9238 },
      { name: { ko: '합정 카페거리', zh: '合井咖啡街', en: 'Hapjeong Café Street' }, duration: 45, tip: { ko: '감각적인 인디 카페들', zh: '有品位的独立咖啡馆', en: 'Indie café gems' }, type: 'cafe', lat: 37.5497, lng: 126.9144 },
      { name: { ko: '상수동 바거리', zh: '上水洞酒吧街', en: 'Sangsu Bar Street' }, duration: 60, tip: { ko: '이자카야+와인바 밀집', zh: '居酒屋+红酒吧聚集地', en: 'Izakaya+wine bar cluster' }, type: 'food', lat: 37.5502, lng: 126.9218 },
    ],
    transport: [{ mode: 'subway', detail: { ko: '2호선 홍대입구역', zh: '2号线弘大入口站', en: 'Line 2 Hongik Univ. Station' } }],
    tags: ['홍대', '카페', '라이브', '야간'],
    duration: '저녁~밤',
  },
  {
    id: 'myeongdong',
    area: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
    tag: { ko: '💄 뷰티 성지', zh: '💄 美妆圣地', en: '💄 Beauty Mecca' },
    title: { ko: '명동, 쇼핑의 왕좌는 아직 비어있지 않다', zh: '明洞，购物的宝座仍未空置', en: 'Myeongdong: The Throne of Shopping Still Stands' },
    excerpt: {
      ko: '명동이 죽었다는 말을 들은 게 몇 번인지 모른다. 그런데 명동은 매번 다시 살아났다. K-뷰티의 최전선, 가성비와 트렌드가 공존하는 곳. 외국인 관광객이 가장 많은 거리, 그러나 그것이 명동의 아이러니한 매력이다.',
      zh: '不知道听过多少次"明洞已死"。但明洞每次都又复活了。K-beauty的最前沿，性价比与潮流并存之地。外国游客最多的街道，但这正是明洞矛盾的魅力所在。',
      en: "I\u2019ve lost count of how many times people said Myeongdong was dead. But it keeps coming back. The frontline of K-beauty, where value meets trend. The street with the most foreign tourists \u2014 and that\u2019s exactly the ironic charm.",
    },
    body: {
      ko: '명동이 관광객만 가는 곳이라고? 반은 맞고 반은 틀리다. 명동은 K-뷰티의 최전선이다. 올리브영 본점이 있고, 이니스프리·미샤·에뛰드 같은 한국 화장품 로드샵이 50m 간격으로 있다. 그리고 무엇보다 — 세금 환급이 가장 쉬운 곳이다.\n\n💄 명동 쇼핑 공략:\n• 올리브영 명동 본점 — 한국 최대 드럭스토어. 외국인 전용 할인+면세 카운터가 따로 있다.\n• 명동 메인거리 — 양쪽으로 화장품 가게, 옷 가게, 액세서리 숍이 쭉. 시식/샘플을 막 나눠준다.\n• 명동 성당 — 100년 넘은 고딕 성당. 쇼핑 중간에 잠깐 쉬기 좋다.\n• 남대문시장 — 새벽 4시부터 여는 전통시장. 도매 가격으로 쇼핑 가능. 김, 인삼, 화장품이 명동보다 싸다.\n• N서울타워 — 명동에서 남산 케이블카를 타고 올라가면 서울 전체 야경이 펼쳐진다. 커플 자물쇠도 걸 수 있다.\n\n💡 꿀팁: 환율이 좋은 환전소는 명동 골목 안에 있다. 은행보다 10~20원 더 좋다. "환전"이라고 적힌 작은 부스를 찾아보자.',
      zh: '有人说明洞只有游客去？一半对一半错。明洞是K-beauty的最前线。有OLIVE YOUNG旗舰店，Innisfree、MISSHA、Etude等韩妆品牌每50米就有一家。最重要的是——这里退税最方便。\n\n💄 明洞购物攻略：\n• OLIVE YOUNG明洞旗舰店 — 韩国最大药妆店。有外国人专用折扣+免税柜台。\n• 明洞主街 — 两旁化妆品店、服装店、饰品店一字排开。免费试吃/试用到处都有。\n• 明洞圣堂 — 百年哥特式教堂。购物中途休息的好去处。\n• 南大门市场 — 凌晨4点开门的传统市场。批发价购物。海苔、人参、化妆品比明洞便宜。\n• N首尔塔 — 从明洞坐南山缆车上去，首尔全景夜景尽收眼底。还可以挂情侣锁。\n\n💡 小贴士：汇率最好的换钱所在明洞小巷里。比银行好10~20韩元。找写着"换钱"的小店就对了。',
      en: "People say Myeongdong is just for tourists? Half true, half wrong. Myeongdong is the frontline of K-beauty.\n\n💄 Myeongdong Shopping Guide:\n• Olive Young Flagship — Korea's biggest drugstore. Has foreign-exclusive discount counter.\n• Main Street — Cosmetics, clothing, accessories shops lined up. Free samples everywhere.\n• Myeongdong Cathedral — 100+ year Gothic cathedral. Great rest stop while shopping.\n• Namdaemun Market — Opens 4AM, wholesale prices. Seaweed, ginseng, cosmetics cheaper than Myeongdong.\n• N Seoul Tower — Cable car from Myeongdong reveals Seoul's full nightscape.\n\n💡 Pro tip: Best exchange rates are in small booths inside Myeongdong alleys, 10-20 won better than banks.",
    },
    readTime: { ko: '3분', zh: '3分钟', en: '3 min' },
    stops: [
      { name: { ko: '명동 메인거리', zh: '明洞主街', en: 'Myeongdong Main Street' }, duration: 60, tip: { ko: '올리브영+로드샵 밀집', zh: 'OLIVE YOUNG+路边店聚集', en: 'Olive Young+road shops' }, type: 'shopping', lat: 37.5636, lng: 126.9845 },
      { name: { ko: '명동성당', zh: '明洞圣堂', en: 'Myeongdong Cathedral' }, duration: 20, tip: { ko: '고딕 건축 포토스팟', zh: '哥特式建筑打卡地', en: 'Gothic architecture photo spot' }, type: 'tourism', lat: 37.5656, lng: 126.9876 },
      { name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun Market' }, duration: 60, tip: { ko: '새벽 4시 오픈, 도매가격', zh: '凌晨4点开始营业，批发价格', en: 'Opens 4AM, wholesale prices' }, type: 'shopping', lat: 37.5597, lng: 126.9760 },
      { name: { ko: 'N서울타워 야경', zh: 'N首尔塔夜景', en: 'N Seoul Tower Night View' }, duration: 60, tip: { ko: '남산케이블카+탑 야경', zh: '南山缆车+塔夜景', en: 'Namsan cable car+tower night view' }, type: 'tourism', lat: 37.5512, lng: 126.9882 },
    ],
    transport: [{ mode: 'subway', detail: { ko: '4호선 명동역', zh: '4号线明洞站', en: 'Line 4 Myeongdong Station' } }],
    tags: ['명동', '쇼핑', '뷰티', '야경'],
    duration: '4-5시간',
  },
  {
    id: 'hannam',
    area: { ko: '한남동', zh: '汉南洞', en: 'Hannam-dong' },
    tag: { ko: '🖼 아트 앤 라이프스타일', zh: '🖼 艺术与生活方式', en: '🖼 Art & Lifestyle' },
    title: { ko: '한남동, 조용한 호사의 언어', zh: '汉南洞，静默奢华的语言', en: 'Hannam: The Language of Quiet Luxury' },
    excerpt: {
      ko: '소리 지르지 않아도 알 수 있는 브랜드들이 있다. 한남동은 그런 곳이다. 갤러리와 편집샵, 프리미엄 레스토랑, 조용히 앉아서 책을 읽는 카페. 서울에서 가장 소문 없이 아름다운 동네.',
      zh: '有些品牌不需要大声说出来。汉南洞就是这样的地方。画廊和集合店，高档餐厅，安静地坐下来读书的咖啡馆。首尔最低调美丽的街区。',
      en: 'Some brands don\'t need to announce themselves. Hannam-dong is that kind of place. Galleries, select shops, premium restaurants, cafés where people quietly read. Seoul\'s most quietly beautiful neighborhood.',
    },
    body: {
      ko: '한남동은 서울의 "조용한 럭셔리"다. 인스타에 올려도 아는 사람만 아는 곳들. 여기서는 쇼핑백보다 미술관 티켓이 더 멋있고, 가격표 없는 옷이 더 비싸다.\n\n🖼 한남동 아트 코스:\n• 리움미술관 — 삼성 이건희 컬렉션의 본거지. 국보급 한국 미술과 앤디 워홀, 자코메티가 한 건물에. 입장료 없음(무료!).\n• 한남 플래그십 거리 — APC, 꼼데가르송, 아크네 스튜디오, 팀버랜드... 글로벌 브랜드 플래그십이 한 블록 안에 모여있다. 인테리어만 구경해도 가치 있다.\n• 블루보틀 한남 — 한국 1호 블루보틀. 미니멀한 공간에서 드립커피 한 잔. 줄이 길지만 그만한 경험.\n• 독립서점 거리 — 큐레이션된 서점들. 한국 인디 출판물, 아트북, 사진집을 만날 수 있다.\n\n💡 꿀팁: 한남동은 이태원과 바로 연결된다. 한남동에서 아트를 보고, 이태원으로 넘어가서 글로벌 음식을 먹으면 완벽한 하루.',
      zh: '汉南洞是首尔的"静奢"。发到Instagram上只有懂行的人才知道的地方。在这里，美术馆门票比购物袋更酷，没有标价的衣服反而更贵。\n\n🖼 汉南洞艺术路线：\n• 三星美术馆Leeum — 三星李健熙收藏的大本营。国宝级韩国美术和安迪·沃霍尔、贾科梅蒂在同一栋楼。免费入场！\n• 汉南旗舰店街 — APC、Comme des Garçons、Acne Studios、Timberland... 全球品牌旗舰店集中在一个街区。光看装修就值得。\n• 蓝瓶咖啡汉南 — 韩国第一家蓝瓶。极简空间里的手冲咖啡。\n• 独立书店街 — 策展书店。可以发现韩国独立出版物、艺术书和摄影集。\n\n💡 小贴士：汉南洞紧邻梨泰院。在汉南看完艺术，走到梨泰院吃全球美食，完美的一天。',
      en: "Hannam-dong is Seoul's 'quiet luxury'. Places that only those in-the-know recognize on Instagram.\n\n🖼 Hannam Art Route:\n• Leeum Museum — Home of Samsung's Lee Kun-hee Collection. Korean national treasures alongside Andy Warhol and Giacometti. Free admission!\n• Hannam Flagship Street — APC, CDG, Acne Studios, Timberland flagships in one block.\n• Blue Bottle Hannam — Korea's first Blue Bottle. Minimalist space, drip coffee perfection.\n• Independent Bookstore Strip — Curated bookshops with Korean indie publications and art books.\n\n💡 Pro tip: Hannam connects directly to Itaewon. Art in Hannam, then walk to Itaewon for global cuisine.",
    },
    readTime: { ko: '4분', zh: '4分钟', en: '4 min' },
    stops: [
      { name: { ko: '리움미술관', zh: '三星美术馆Leeum', en: 'Leeum Museum of Art' }, duration: 90, tip: { ko: '삼성 컬렉션 세계적 수준', zh: '三星收藏品达世界级水准', en: 'World-class Samsung collection' }, type: 'exhibition', lat: 37.5378, lng: 126.9990 },
      { name: { ko: '한남 플래그십 거리', zh: '汉南旗舰店街', en: 'Hannam Flagship Street' }, duration: 50, tip: { ko: 'APC/꼼데가르송/팀버랜드 등', zh: 'APC/Comme des Garçons/Timberland等', en: 'APC/CDG/Timberland flagships' }, type: 'shopping', lat: 37.5375, lng: 126.9967 },
      { name: { ko: '블루보틀 한남', zh: '蓝瓶咖啡汉南', en: 'Blue Bottle Hannam' }, duration: 40, tip: { ko: '글로벌 스페셜티 커피', zh: '全球精品咖啡', en: 'Global specialty coffee' }, type: 'cafe', lat: 37.5374, lng: 126.9985 },
      { name: { ko: '독립서점 거리', zh: '独立书店街', en: 'Independent Bookstore Strip' }, duration: 40, tip: { ko: '큐레이션 서점+아트북', zh: '策展书店+艺术书籍', en: 'Curated bookshops+art books' }, type: 'tourism', lat: 37.5382, lng: 126.9955 },
    ],
    transport: [{ mode: 'subway', detail: { ko: '6호선 한강진역', zh: '6号线汉江镇站', en: 'Line 6 Hangangjin Station' } }],
    tags: ['한남', '갤러리', '편집샵', '럭셔리'],
    duration: '3-4시간',
  },
  {
    id: 'bukchon',
    area: { ko: '북촌·인사동', zh: '北村·仁寺洞', en: 'Bukchon·Insadong' },
    tag: { ko: '🏯 600년 도시의 기억', zh: '🏯 600年都城的记忆', en: '🏯 600 Years of City Memory' },
    title: { ko: '북촌, 시간이 멈춘 것처럼 보이지만 사실은', zh: '北村，看似时间停止，实则…', en: 'Bukchon: Time Seems Still, But Actually—' },
    excerpt: {
      ko: '기와지붕 아래 카페가 있다. 돌담 옆에 갤러리가 있다. 북촌은 과거와 현재가 어색하지 않게 공존하는 방법을 알고 있다. 서울에서 가장 사진이 많이 찍히는 골목, 그러나 아직도 사람이 살고 있다.',
      zh: '瓦屋顶下有咖啡馆。石墙旁边有画廊。北村懂得如何让过去与现在自然共存。首尔被拍照最多的小巷，但至今仍有人居住。',
      en: 'A café beneath tiled roofs. A gallery beside stone walls. Bukchon knows how to let past and present coexist without awkwardness. Seoul\'s most-photographed alley — yet people still live here.',
    },
    body: {
      ko: '북촌에 가면 600년 전 조선 시대의 한옥 마을을 걸을 수 있다. 하지만 북촌의 매력은 "낡음" 자체가 아니라, 낡은 것과 새 것이 자연스럽게 섞여있다는 것이다.\n\n🏯 북촌·인사동 완벽 코스:\n• 북촌 8경 뷰포인트 — 한옥 지붕이 끝없이 펼쳐진 풍경. 인스타 인생샷 1순위. 아침 일찍 가면 관광객 없이 찍을 수 있다.\n• 경복궁 — 조선 최고의 궁궐. 한복을 입으면 입장 무료! 한복 대여점은 궁궐 주변에 수십 개 있고, 2시간 5,000~15,000원.\n• 인사동 쌈지길 — 나선형 구조의 아트몰. 한국 전통 공예품, 빈티지 소품, 수제 액세서리를 살 수 있다.\n• 삼청동 카페거리 — 한옥을 개조한 카페들. 기와지붕 아래서 라떼를 마시는 독특한 경험.\n\n⚠️ 중요한 매너:\n북촌은 실제로 사람이 살고 있는 동네다. 큰 소리를 내거나 주택 마당에 들어가지 마세요. 오전 10시~오후 5시 사이에 방문하는 것이 좋다.',
      zh: '去北村可以走在600年前朝鲜时代的韩屋村里。但北村的魅力不在于"古老"本身，而在于古老与新潮自然融合。\n\n🏯 北村·仁寺洞完美路线：\n• 北村八景观景点 — 韩屋屋顶无尽延展的风景。Instagram人生照第一名。早上去就能避开游客。\n• 景福宫 — 朝鲜最高级的宫殿。穿韩服免费入场！韩服租赁店在宫殿周围几十家，2小时5000~15000韩元。\n• 仁寺洞麻袋路 — 螺旋形结构的艺术商场。可以买韩国传统工艺品、复古小物、手工饰品。\n• 三清洞咖啡街 — 韩屋改造的咖啡馆。在瓦屋顶下喝拿铁的独特体验。\n\n⚠️ 重要礼仪：\n北村是真正有人居住的社区。请不要大声喧哗或擅自进入住宅院子。建议上午10点至下午5点之间访问。',
      en: "Bukchon lets you walk through a 600-year-old Joseon-era hanok village. But the charm isn't the oldness itself — it's how old and new blend naturally.\n\n🏯 Bukchon·Insadong Perfect Route:\n• Bukchon 8 Views — Endless hanok rooftop landscape. #1 Instagram spot. Go early morning to avoid crowds.\n• Gyeongbokgung Palace — Joseon's greatest palace. Free entry in hanbok! Rental shops nearby, 2hrs for ₩5-15K.\n• Insadong Ssamziegil — Spiral art mall with traditional crafts and handmade accessories.\n• Samcheong-dong Café Street — Cafés in converted hanok buildings.\n\n⚠️ Important etiquette: Bukchon is a residential area. Please keep quiet and don't enter private yards. Visit between 10AM-5PM.",
    },
    readTime: { ko: '4분', zh: '4分钟', en: '4 min' },
    stops: [
      { name: { ko: '북촌 8경 뷰포인트', zh: '北村八景观景点', en: 'Bukchon 8 Views Lookout' }, duration: 40, tip: { ko: '한옥 마을 최고 전망', zh: '韩屋村最佳视角', en: 'Best view of hanok village' }, type: 'tourism', lat: 37.5816, lng: 126.9829 },
      { name: { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung Palace' }, duration: 90, tip: { ko: '한복 대여 후 입장 필수', zh: '穿韩服入场体验更佳', en: 'Rent hanbok before entering' }, type: 'tourism', lat: 37.5796, lng: 126.9770 },
      { name: { ko: '인사동 쌈지길', zh: '仁寺洞麻袋路', en: 'Insadong Ssamziegil' }, duration: 60, tip: { ko: '나선형 아트몰+공예품', zh: '螺旋形艺术商场+工艺品', en: 'Spiral art mall+crafts' }, type: 'shopping', lat: 37.5742, lng: 126.9848 },
      { name: { ko: '광장시장', zh: '广藏市场', en: 'Gwangjang Market' }, duration: 50, tip: { ko: '빈대떡+육회+마약김밥 필수', zh: '必吃绿豆煎饼+生拌牛肉+紫菜包饭', en: 'Bindaetteok+yukhoe+gimbap must-try' }, type: 'food', lat: 37.5699, lng: 126.9997 },
    ],
    transport: [{ mode: 'subway', detail: { ko: '3호선 경복궁역', zh: '3号线景福宫站', en: 'Line 3 Gyeongbokgung Station' } }],
    tags: ['북촌', '한옥', '인사동', '전통'],
    duration: '4-5시간',
  },
]

// ─── EditorialColumns Component ─────────────────────────────────────
export function EditorialColumns({ lang, savedIds, onSave, onCreateCourse }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <section className="mt-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[var(--y2k-text)]">
          {L(lang, { ko: '서울 에디토리얼', zh: '首尔专题', en: 'Seoul Editorial' })}
        </h2>
        <span className="text-[10px] text-[var(--y2k-text-sub)] font-medium">
          {L(lang, { ko: '작가가 직접 쓴 지역 가이드', zh: '作者亲笔撰写的地区指南', en: 'Written by local authors' })}
        </span>
      </div>

      <div className="space-y-3">
        {EDITORIAL_COLUMNS.map(col => {
          const isOpen = expanded === col.id
          const isSaved = savedIds.includes(col.id)
          return (
            <div key={col.id} className="bg-white rounded-[12px] border border-[var(--y2k-border)] overflow-hidden">
              {/* Header — always visible */}
              <button
                data-editorial={col.id}
                className="w-full text-left p-4 active:bg-[var(--y2k-bg)] transition-colors"
                onClick={() => setExpanded(isOpen ? null : col.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-[var(--y2k-text-sub)] bg-[var(--y2k-bg)] px-2 py-0.5 rounded-full">
                        {L(lang, col.area)}
                      </span>
                      <span className="text-[10px] text-[var(--y2k-text-sub)]">
                        {L(lang, col.tag)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[var(--y2k-text)] leading-snug line-clamp-2">
                      {L(lang, col.title)}
                    </p>
                    {!isOpen && (
                      <p className="text-[11px] text-[var(--y2k-text-sub)] mt-1.5 line-clamp-1">
                        {L(lang, col.excerpt)}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 mt-0.5">
                    <span className={`text-[var(--y2k-text-sub)] transition-transform duration-200 inline-block ${isOpen ? 'rotate-180' : ''}`}>↓</span>
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-4">
                  {/* Read time + excerpt */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[10px] text-[var(--y2k-text-sub)]">
                      {L(lang, { ko: '읽는 시간', zh: '阅读时间', en: 'Read time' })} {L(lang, col.readTime)}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#374151] leading-relaxed mb-4">
                    {L(lang, col.excerpt)}
                  </p>

                  {/* 본문 (body) */}
                  {col.body && (
                    <div className="text-[13px] text-[#444] leading-[1.8] mb-4 whitespace-pre-line">
                      {L(lang, col.body)}
                    </div>
                  )}

                  {/* Key stops preview */}
                  <div className="bg-[var(--y2k-bg)] rounded-[8px] p-3 mb-4">
                    <p className="text-[10px] font-bold text-[var(--y2k-text-sub)] uppercase tracking-wider mb-2">
                      {L(lang, { ko: '이 코스의 핵심 스팟', zh: '路线核心景点', en: 'Key Spots' })}
                    </p>
                    <div className="space-y-1.5">
                      {col.stops.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-white bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-[11px] text-[#374151] font-medium">{L(lang, s.name)}</span>
                          <span className="text-[10px] text-[var(--y2k-text-sub)] ml-auto">{s.duration}min</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSave(col.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all ${
                        isSaved
                          ? 'bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white border-[var(--y2k-pink)]'
                          : 'bg-white text-[#374151] border-[var(--y2k-border)] active:border-[var(--y2k-pink)]'
                      }`}
                    >
                      {isSaved ? (
                        <>✓ {L(lang, { ko: '관심 등록됨', zh: '已收藏', en: 'Saved' })}</>
                      ) : (
                        <>+ {L(lang, { ko: '관심 등록', zh: '收藏专栏', en: 'Save Column' })}</>
                      )}
                    </button>
                    <button
                      onClick={() => onCreateCourse(col)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--y2k-bg)] text-[var(--y2k-text)] text-xs font-semibold rounded-[8px] active:bg-[#E5E7EB] transition-colors"
                    >
                      {L(lang, { ko: '이 코스 만들기', zh: '生成此路线', en: 'Create this course' })}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}


export default function CourseTab({ lang, deepLink, onDeepLinkConsumed, adminView = false, onBack }) {
  const [view, setView] = useState('list')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [filter, setFilter] = useState('all')

  // My courses — migrate from old key
  const [myCourses, setMyCourses] = useState(() => {
    try {
      const hp = localStorage.getItem('hp_saved_courses')
      if (hp) return JSON.parse(hp) || []
      const old = localStorage.getItem('my_courses')
      if (old) {
        const parsed = JSON.parse(old) || []
        localStorage.setItem('hp_saved_courses', JSON.stringify(parsed))
        localStorage.removeItem('my_courses')
        return parsed
      }
      return []
    } catch { return [] }
  })

  // Course profile (quiz)
  const [courseProfile, setCourseProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hp_course_profile')) } catch { return null }
  })
  const [showQuiz, setShowQuiz] = useState(false)

  // 내가 추가한 팝업
  const { userPopups, parsing, parseError, parseUrl, addPopup, removePopup } = useUserPopups()
  const [showAddPopup, setShowAddPopup] = useState(false)
  const [pastedUrl, setPastedUrl] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [editFields, setEditFields] = useState({})

  // 에디토리얼 칼럼 — 저장된 관심 칼럼
  const [savedColumnIds, setSavedColumnIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hp_col_interests') || '[]') } catch { return [] }
  })
  const [columnCoursePrompt, setColumnCoursePrompt] = useState(null) // { column }
  const saveColumnInterest = (colId) => {
    const next = savedColumnIds.includes(colId)
      ? savedColumnIds.filter(id => id !== colId)
      : [...savedColumnIds, colId]
    setSavedColumnIds(next)
    localStorage.setItem('hp_col_interests', JSON.stringify(next))
  }

  // Scoring
  const topIds = getTopCourseIds(courseProfile)

  // Deep link
  useEffect(() => {
    if (!deepLink) return
    const course = deepLink.itemData
      || RECOMMENDED_COURSES.find(c => c.id === deepLink.itemId)
      || myCourses.find(c => c.id === deepLink.itemId)
    if (course) { setSelectedCourse(course); setView('detail') }
    onDeepLinkConsumed?.()
  }, [deepLink])

  const saveMyCourses = useCallback((courses) => {
    setMyCourses(courses)
    localStorage.setItem('hp_saved_courses', JSON.stringify(courses))
  }, [])

  const MAX_MY_COURSES = 10
  const addToMyCourses = (course) => {
    if (myCourses.some(c => c.id === course.id)) return
    if (myCourses.length >= MAX_MY_COURSES) {
      alert(L(lang, { ko: `내 코스는 최대 ${MAX_MY_COURSES}개까지 저장할 수 있어요.`, zh: `最多可保存${MAX_MY_COURSES}条路线。`, en: `You can save up to ${MAX_MY_COURSES} courses.` }))
      return
    }
    const saved = {
      id: course.id,
      name: typeof course.name === 'object' ? L(lang, course.name) : course.name,
      stops: course.stops?.map(s => ({
        name: typeof s.name === 'object' ? L(lang, s.name) : s.name,
        duration: s.duration, tip: typeof s.tip === 'object' ? L(lang, s.tip) : s.tip,
        type: s.type, lat: s.lat, lng: s.lng,
      })) || [],
      transport: course.transport?.map(t => ({
        ...t, detail: typeof t.detail === 'object' ? L(lang, t.detail) : t.detail,
      })) || [],
      tags: course.tags || [],
      duration: course.duration,
      createdAt: new Date().toISOString(),
    }
    saveMyCourses([saved, ...myCourses])
  }

  const deleteMyCourse = (id) => saveMyCourses(myCourses.filter(c => c.id !== id))

  const saveCustomCourse = (course) => {
    saveMyCourses([course, ...myCourses])
    setView('list')
  }

  const filtered = filter === 'all'
    ? RECOMMENDED_COURSES
    : RECOMMENDED_COURSES.filter(c => c.category === filter)

  // ─── Detail View ───
  if (view === 'detail' && selectedCourse) {
    return (
      <div className="h-full" style={{ height: 'calc(100vh - 140px)', background: '#FAFAFA' }}>
        <CourseDetail
          course={selectedCourse}
          lang={lang}
          onBack={() => { setView('list'); setSelectedCourse(null) }}
          onSave={() => addToMyCourses(selectedCourse)}
          isSaved={myCourses.some(c => c.id === selectedCourse.id)}
        />
      </div>
    )
  }

  // ─── Create View ───
  if (view === 'create') {
    return (
      <div className="h-full" style={{ height: 'calc(100vh - 140px)', background: '#FAFAFA' }}>
        <CreateCourse lang={lang} onBack={() => setView('list')} onSave={saveCustomCourse} />
      </div>
    )
  }

  // ─── List View ───
  return (
    <div className="overflow-y-auto px-4 py-4 max-w-[480px] mx-auto" style={{
      height: 'calc(100vh - 140px)',
      background: '#FAFAFA',
      '--y2k-bg': '#FFFFFF',
      '--y2k-card': '#FAFAFA',
      '--y2k-text': '#1A1A1A',
      '--y2k-text-sub': '#888888',
      '--y2k-border': 'rgba(200,200,200,0.3)',
    }}>

      {/* 뒤로가기 헤더 */}
      {onBack && (
        <div className="flex items-center mb-4 -mx-1">
          <button onClick={onBack} className="flex items-center gap-1 p-1 text-[var(--y2k-text)]">
            <span>←</span>
            <span className="text-sm font-medium">{L(lang, { ko: '홈', zh: '首页', en: 'Home' })}</span>
          </button>
        </div>
      )}

      {/* A) My Courses — horizontal scroll */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[var(--y2k-text)]">
            {L(lang, { ko: '내 코스', zh: '我的路线', en: 'My Courses' })}
          </h2>
          <button onClick={() => setView('create')}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--y2k-text)] bg-[var(--y2k-bg)] px-3 py-1.5 rounded-[20px] active:bg-[#E5E7EB] transition-colors"
          >
            +
            {L(lang, { ko: '만들기', zh: '创建', en: 'Create' })}
          </button>
        </div>

        {myCourses.length === 0 ? (
          <div className="bg-[var(--y2k-bg)] rounded-[20px] border border-dashed border-[var(--y2k-border)] p-6 text-center">
            <p className="text-xs text-[var(--y2k-text-sub)]">
              {L(lang, { ko: '저장된 코스가 없습니다. 추천 코스로 시작해보세요', zh: '暂无保存的路线。从推荐路线开始吧', en: 'No saved courses yet. Start with a recommended one' })}
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {myCourses.map(course => (
              <div key={course.id} className="relative shrink-0 w-40">
                <button
                  onClick={() => { setSelectedCourse(course); setView('detail') }}
                  className="w-full bg-white rounded-[20px] border border-[var(--y2k-border)] p-3 text-left active:scale-95 transition-transform"
                >
                  <p className="font-bold text-xs text-[var(--y2k-text)] truncate">{course.name}</p>
                  <p className="text-[10px] text-[var(--y2k-text-sub)] mt-1.5">
                    {course.stops?.length || 0} {L(lang, { ko: '곳', zh: '处', en: 'stops' })}
                    {course.duration ? ` · ${course.duration}` : ''}
                  </p>
                </button>
                <button
                  onClick={() => deleteMyCourse(course.id)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-[var(--y2k-bg)] rounded-full flex items-center justify-center hover:bg-[#E5E7EB]"
                >
                  <span className="text-[var(--y2k-text-sub)] text-[10px]">✕</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>



      {/* B) Onboarding Quiz */}
      {(!courseProfile || showQuiz) && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--y2k-text)]">
              {L(lang, { ko: '맞춤 추천', zh: '个性推荐', en: 'Personalize' })}
            </h2>
            {showQuiz && courseProfile && (
              <button onClick={() => setShowQuiz(false)} className="text-xs text-[var(--y2k-text-sub)]">
                {L(lang, { ko: '취소', zh: '取消', en: 'Cancel' })}
              </button>
            )}
          </div>
          <OnboardingQuiz lang={lang} onComplete={(profile) => { setCourseProfile(profile); setShowQuiz(false) }} />
        </section>
      )}

      {courseProfile && !showQuiz && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--y2k-text-sub)]">
              {L(lang, { ko: '맞춤 추천 활성화됨', zh: '个性推荐已开启', en: 'Personalized recommendations on' })}
            </span>
          </div>
          <button onClick={() => setShowQuiz(true)} className="text-xs text-[var(--y2k-text-sub)] underline">
            {L(lang, { ko: '다시하기', zh: '重新测试', en: 'Retake' })}
          </button>
        </div>
      )}

      {/* C) Recommended Courses */}
      <section>
        <h2 className="text-base font-bold text-[var(--y2k-text)] mb-3">
          {L(lang, { ko: '추천 코스', zh: '推荐路线', en: 'Recommended' })}
        </h2>

        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {COURSE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-[20px] text-xs font-semibold transition-colors ${
                filter === cat.id ? 'bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white' : 'bg-[var(--y2k-bg)] text-[var(--y2k-text-sub)] active:bg-[#E5E7EB]'
              }`}
            >
              {L(lang, cat.name)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              lang={lang}
              onPress={() => { setSelectedCourse(course); setView('detail') }}
              isBestForYou={topIds.has(course.id)}
            />
          ))}
        </div>
      </section>

      {/* D-0) 에디토리얼 칼럼 */}
      <EditorialColumns lang={lang} savedIds={savedColumnIds} onSave={saveColumnInterest} onCreateCourse={(col) => setColumnCoursePrompt({ column: col })} />

      {/* Column → 코스 만들기 확인 모달 */}
      {columnCoursePrompt && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-end" onClick={(e) => { if (e.target === e.currentTarget) setColumnCoursePrompt(null) }}>
          <div className="bg-white rounded-t-[20px] w-full max-w-[480px] mx-auto p-6 pb-10">
            <div className="w-8 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-5" />
            <p className="text-sm font-bold text-[var(--y2k-text)] mb-1">
              {L(lang, {
                ko: `"${L(lang, columnCoursePrompt.column.title)}" 칼럼 기반으로`,
                zh: `根据「${L(lang, columnCoursePrompt.column.title)}」专栏`,
                en: `Based on "${L(lang, columnCoursePrompt.column.title)}"`,
              })}
            </p>
            <p className="text-base font-bold text-[var(--y2k-text)] mb-4">
              {L(lang, { ko: '근처 추천 코스를 만들까요?', zh: '为您生成附近推荐路线？', en: 'Create a nearby course for you?' })}
            </p>
            <p className="text-xs text-[var(--y2k-text-sub)] mb-6 leading-relaxed">
              {L(lang, {
                ko: `${L(lang, columnCoursePrompt.column.area)} 지역의 핵심 스팟들을 이어 맞춤 코스를 저장합니다.`,
                zh: `将${L(lang, columnCoursePrompt.column.area)}地区的精华景点连成专属路线并保存。`,
                en: `We'll connect the key spots in ${L(lang, columnCoursePrompt.column.area)} into a custom course.`,
              })}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setColumnCoursePrompt(null)}
                className="flex-1 py-3 border border-[var(--y2k-border)] text-sm font-semibold text-[#374151] rounded-[10px]">
                {L(lang, { ko: '취소', zh: '取消', en: 'Cancel' })}
              </button>
              <button
                onClick={() => {
                  const col = columnCoursePrompt.column
                  const newCourse = {
                    id: `col_${col.id}_${Date.now()}`,
                    name: L(lang, col.title),
                    stops: col.stops.map(s => ({
                      name: L(lang, s.name),
                      duration: s.duration,
                      tip: L(lang, s.tip),
                      type: s.type,
                      lat: s.lat,
                      lng: s.lng,
                    })),
                    transport: col.transport || [],
                    tags: col.tags || [],
                    duration: col.duration,
                    createdAt: new Date().toISOString(),
                  }
                  saveMyCourses([newCourse, ...myCourses])
                  setColumnCoursePrompt(null)
                }}
                className="flex-1 py-3 bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white text-sm font-semibold rounded-[10px]">
                {L(lang, { ko: '코스 만들기', zh: '生成路线', en: 'Create Course' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Popup Modal */}
      {showAddPopup && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end" onClick={(e) => { if (e.target === e.currentTarget) setShowAddPopup(false) }}>
          <div className="bg-white rounded-t-[16px] w-full max-w-[480px] mx-auto p-5 pb-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--y2k-text)]">
                {L(lang, { ko: '팝업 URL 추가', zh: '添加快闪店链接', en: 'Add Popup URL' })}
              </h3>
              <button onClick={() => setShowAddPopup(false)} className="p-1 text-[var(--y2k-text-sub)]"><span>✕</span></button>
            </div>

            {!parsedData ? (
              <>
                <p className="text-xs text-[var(--y2k-text-sub)] mb-3 leading-relaxed">
                  {L(lang, {
                    ko: '샤오홍슈(小红书), 인스타그램, 페이스북에서 팝업스토어 게시물 URL을 복사해서 붙여넣으세요.',
                    zh: '从小红书、Instagram、Facebook复制快闪店帖子链接并粘贴到下面。',
                    en: 'Copy and paste the URL of a popup store post from Xiaohongshu, Instagram, or Facebook.',
                  })}
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={pastedUrl}
                    onChange={e => setPastedUrl(e.target.value)}
                    placeholder="https://www.xiaohongshu.com/... 또는 instagram.com/..."
                    className="flex-1 text-sm border border-[var(--y2k-border)] rounded-[8px] px-3 py-2.5 outline-none focus:border-[var(--y2k-pink)]"
                    autoFocus
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!pastedUrl.trim()) return
                    const result = await parseUrl(pastedUrl.trim())
                    setParsedData(result)
                    setEditFields({
                      brand: result.brand || '',
                      title: result.title || '',
                      address: result.address || '',
                      startDate: result.period?.start || '',
                      endDate: result.period?.end || '',
                    })
                  }}
                  disabled={parsing || !pastedUrl.trim()}
                  className="w-full py-3 bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white text-sm font-semibold rounded-[8px] disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {parsing ? <>{L(lang, { ko: '로딩중 분석 중...', zh: '로딩중 分析中...', en: 'Analyzing...' })}</> : L(lang, { ko: '분석하기', zh: '分析链接', en: 'Analyze' })}
                </button>
                {parseError && <p className="text-xs text-[#EF4444] mt-2">{L(lang, { ko: '자동 분석 실패. 아래에서 직접 입력하세요.', zh: '自动分析失败，请手动填写。', en: 'Auto-parse failed. Please fill in manually.' })}</p>}
              </>
            ) : (
              <>
                {/* 분석 결과 + 수정 폼 */}
                {parsedData.image && (
                  <div className="w-full h-32 rounded-[8px] overflow-hidden mb-4 bg-[#F3F4F6]">
                    <img src={parsedData.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--y2k-text-sub)] uppercase tracking-wide">
                      {L(lang, { ko: '브랜드명', zh: '品牌名', en: 'Brand' })}
                    </label>
                    <input
                      type="text"
                      value={editFields.brand || ''}
                      onChange={e => setEditFields(p => ({ ...p, brand: e.target.value }))}
                      placeholder={L(lang, { ko: '예: Nike, 올리브영', zh: '例：Nike, Olive Young', en: 'e.g. Nike, Olive Young' })}
                      className="w-full mt-1 text-sm border border-[var(--y2k-border)] rounded-[8px] px-3 py-2 outline-none focus:border-[var(--y2k-pink)]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--y2k-text-sub)] uppercase tracking-wide">
                      {L(lang, { ko: '팝업 이름', zh: '活动名称', en: 'Event Title' })}
                    </label>
                    <input
                      type="text"
                      value={editFields.title || ''}
                      onChange={e => setEditFields(p => ({ ...p, title: e.target.value }))}
                      placeholder={L(lang, { ko: '예: 나이키 에어맥스 팝업', zh: '例：Nike Air Max快闪', en: 'e.g. Nike Air Max Popup' })}
                      className="w-full mt-1 text-sm border border-[var(--y2k-border)] rounded-[8px] px-3 py-2 outline-none focus:border-[var(--y2k-pink)]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--y2k-text-sub)] uppercase tracking-wide">
                      {L(lang, { ko: '주소', zh: '地址', en: 'Address' })}
                    </label>
                    <input
                      type="text"
                      value={editFields.address || ''}
                      onChange={e => setEditFields(p => ({ ...p, address: e.target.value }))}
                      placeholder={L(lang, { ko: '예: 서울 성동구 연무장길 83', zh: '例：首尔城东区연무장길83', en: 'e.g. 83 Yeonmujang-gil' })}
                      className="w-full mt-1 text-sm border border-[var(--y2k-border)] rounded-[8px] px-3 py-2 outline-none focus:border-[var(--y2k-pink)]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] font-semibold text-[var(--y2k-text-sub)] uppercase tracking-wide">{L(lang, { ko: '시작일', zh: '开始日期', en: 'Start' })}</label>
                      <input type="date" value={editFields.startDate || ''} onChange={e => setEditFields(p => ({ ...p, startDate: e.target.value }))} className="w-full mt-1 text-sm border border-[var(--y2k-border)] rounded-[8px] px-3 py-2 outline-none focus:border-[var(--y2k-pink)]" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] font-semibold text-[var(--y2k-text-sub)] uppercase tracking-wide">{L(lang, { ko: '종료일', zh: '结束日期', en: 'End' })}</label>
                      <input type="date" value={editFields.endDate || ''} onChange={e => setEditFields(p => ({ ...p, endDate: e.target.value }))} className="w-full mt-1 text-sm border border-[var(--y2k-border)] rounded-[8px] px-3 py-2 outline-none focus:border-[var(--y2k-pink)]" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-5">
                  <button onClick={() => setParsedData(null)} className="flex-1 py-2.5 border border-[var(--y2k-border)] text-sm font-semibold text-[#374151] rounded-[8px]">
                    {L(lang, { ko: '다시 입력', zh: '重新输入', en: 'Re-enter' })}
                  </button>
                  <button
                    onClick={() => {
                      addPopup(parsedData, {
                        brand: editFields.brand,
                        title: editFields.title,
                        address: editFields.address,
                        period: { start: editFields.startDate, end: editFields.endDate },
                      })
                      setShowAddPopup(false)
                    }}
                    disabled={!editFields.brand && !editFields.title}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] text-white text-sm font-semibold rounded-[8px] disabled:opacity-40"
                  >
                    {L(lang, { ko: '저장', zh: '保存', en: 'Save' })}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* E) Suggested Itineraries */}
      <section className="mt-6">
        <h2 className="text-base font-bold text-[var(--y2k-text)] mb-3">
          {L(lang, { ko: '추천 일정', zh: '推荐行程', en: 'Suggested Itineraries' })}
        </h2>
        <div className="space-y-3">
          {[
            { name: { ko: '3일 서울 집중', zh: '3天首尔深度游', en: '3-Day Seoul Focus' }, days: [
              { day: 1, plan: { ko: '경복궁 → 북촌한옥마을 → 인사동 → 광장시장', zh: '景福宫→北村韩屋村→仁寺洞→广藏市场', en: 'Gyeongbokgung → Bukchon → Insadong → Gwangjang Market' } },
              { day: 2, plan: { ko: '명동 쇼핑 → N서울타워 → 이태원 → 한강공원', zh: '明洞购物→N首尔塔→梨泰院→汉江公园', en: 'Myeongdong → N Seoul Tower → Itaewon → Hangang Park' } },
              { day: 3, plan: { ko: '홍대 거리 → 연남동 카페 → 여의도 → DDP', zh: '弘大街区→延南洞咖啡→汝矣岛→DDP', en: 'Hongdae → Yeonnam-dong → Yeouido → DDP' } },
            ]},
            { name: { ko: '5일 서울+부산', zh: '5天首尔+釜山', en: '5-Day Seoul+Busan' }, days: [
              { day: 1, plan: { ko: '서울: 경복궁 → 북촌 → 명동', zh: '首尔：景福宫→北村→明洞', en: 'Seoul: Gyeongbokgung → Bukchon → Myeongdong' } },
              { day: 2, plan: { ko: '서울: 홍대 → N서울타워 → 한강', zh: '首尔：弘大→N首尔塔→汉江', en: 'Seoul: Hongdae → N Seoul Tower → Hangang' } },
              { day: 3, plan: { ko: '서울: 이태원 → 성수동 카페 → DDP', zh: '首尔：梨泰院→圣水洞咖啡→DDP', en: 'Seoul: Itaewon → Seongsu cafes → DDP' } },
              { day: 4, plan: { ko: 'KTX→부산 → 해운대 → 광안리', zh: 'KTX→釜山→海云台→广安里', en: 'KTX→Busan → Haeundae → Gwangalli' } },
              { day: 5, plan: { ko: '감천문화마을 → 자갈치시장 → 해동용궁사', zh: '甘川文化村→扎嘎其市场→海东龙宫寺', en: 'Gamcheon → Jagalchi → Haedong Yonggungsa' } },
            ]},
            { name: { ko: '7일 전국일주', zh: '7天全国环游', en: '7-Day Korea Tour' }, days: [
              { day: 1, plan: { ko: '서울 도착 → 명동/광장시장', zh: '到达首尔→明洞/广藏市场', en: 'Arrive Seoul → Myeongdong/Gwangjang' } },
              { day: 2, plan: { ko: '서울: 경복궁 → 북촌 → N서울타워', zh: '首尔：景福宫→北村→N首尔塔', en: 'Seoul: Gyeongbokgung → Bukchon → N Tower' } },
              { day: 3, plan: { ko: 'KTX→대전 → 유성온천 → 성심당', zh: 'KTX→大田→儒城温泉→圣心堂', en: 'KTX→Daejeon → Yuseong → Sungsimdang' } },
              { day: 4, plan: { ko: '경주 → 불국사 → 석굴암 → 안압지', zh: '庆州→佛国寺→石窟庵→雁鸭池', en: 'Gyeongju → Bulguksa → Seokguram → Anapji' } },
              { day: 5, plan: { ko: '부산 → 해운대 → 감천문화마을', zh: '釜山→海云台→甘川文化村', en: 'Busan → Haeundae → Gamcheon Village' } },
              { day: 6, plan: { ko: '부산: 자갈치 → 광안리 → 해동용궁사', zh: '釜山：扎嘎其→广安里→海东龙宫寺', en: 'Busan: Jagalchi → Gwangalli → Yonggungsa' } },
              { day: 7, plan: { ko: '제주 → 성산일출봉 → 협재해변', zh: '济州→城山日出峰→挟才海滩', en: 'Jeju → Seongsan → Hyeopjae Beach' } },
            ]},
          ].map((it, i) => (
            <div key={i} className="bg-white rounded-[20px] border border-[var(--y2k-border)] p-4">
              <h3 className="text-sm font-bold text-[var(--y2k-text)] mb-3">{L(lang, it.name)}</h3>
              <div className="space-y-2">
                {it.days.map(d => (
                  <div key={d.day} className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-white bg-gradient-to-r from-[var(--y2k-pink)] to-[var(--y2k-lavender)] w-7 h-5 rounded-[20px] flex items-center justify-center shrink-0">D{d.day}</span>
                    <p className="text-xs text-[#374151]">{L(lang, d.plan)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
