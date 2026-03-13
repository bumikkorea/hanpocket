import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { ChevronLeft, ChevronRight, Plus, Pencil } from 'lucide-react'
import { RECOMMENDED_COURSES } from '../data/recommendedCourses'
import { POPUP_STORES, DISTRICTS, isClosingSoon, getDdayLabel, isActiveOrUpcoming } from '../data/popupData'
import { MICHELIN_RESTAURANTS } from '../data/restaurantData'
import { getClothingRecommendation } from '../data/clothingGuide'
import { getCurrentSeasonContent } from '../data/seasonalContent'
import { trackEvent } from '../utils/analytics'

const TranslatorTab = lazy(() => import('./TranslatorTab'))
const ArrivalCardGuide = lazy(() => import('./guides/ArrivalCardGuide'))
const SimGuide = lazy(() => import('./guides/SimGuide'))
const TaxRefundGuide = lazy(() => import('./guides/TaxRefundGuide'))
const DutyFreeGuide = lazy(() => import('./guides/DutyFreeGuide'))
const HalalGuide = lazy(() => import('./guides/HalalGuide'))
const DietaryCardGuide = lazy(() => import('./guides/DietaryCardGuide'))
const KidsGuide = lazy(() => import('./guides/KidsGuide'))
const DutyFreeLimitGuide = lazy(() => import('./guides/DutyFreeLimitGuide'))
const PetTab = lazy(() => import('./PetTab'))
const PocketContent = lazy(() => import('./pockets/PocketContent'))
const ImmigrationWaitTime = lazy(() => import('./ImmigrationWaitTime'))
import GuideLayout from './guides/GuideLayout'

// Re-export 의존성 (App.jsx 등에서 사용)
import LucideIcon from './home/common/LucideIcon'
import TreeSection from './home/common/TreeSection'
import WidgetContent from './home/common/WidgetContent'
import { trackActivity, L } from './home/utils/helpers'

function getEnabledPocketsForSection() { return [] }

// useWeatherData removed — replaced by useWeather (Open-Meteo)

// ── 시간대 데이터 ──
const TIMEZONE_OPTIONS = [
  { id: 'CST', code: 'CN', flag: '\u{1F1E8}\u{1F1F3}', name: { ko: '중국', zh: '中国', en: 'China' }, abbr: 'CST', offset: 8 , lat: 35.7, lon: 139.7 },
  { id: 'JST', code: 'JP', flag: '\u{1F1EF}\u{1F1F5}', name: { ko: '일본', zh: '日本', en: 'Japan' }, abbr: 'JST', offset: 9 , lat: 40.7, lon: -74.0 },
  { id: 'EST', code: 'US', flag: '\u{1F1FA}\u{1F1F8}', name: { ko: '미국 동부', zh: '美国东部', en: 'US East' }, abbr: 'EST', offset: -5 , lat: 34.1, lon: -118.2 },
  { id: 'PST', code: 'US', flag: '\u{1F1FA}\u{1F1F8}', name: { ko: '미국 서부', zh: '美国西部', en: 'US West' }, abbr: 'PST', offset: -8 , lat: 51.5, lon: -0.1 },
  { id: 'GMT', code: 'GB', flag: '\u{1F1EC}\u{1F1E7}', name: { ko: '영국', zh: '英国', en: 'UK' }, abbr: 'GMT', offset: 0 , lat: 1.35, lon: 103.8 },
  { id: 'SGT', code: 'SG', flag: '\u{1F1F8}\u{1F1EC}', name: { ko: '싱가포르', zh: '新加坡', en: 'Singapore' }, abbr: 'SGT', offset: 8 , lat: -33.9, lon: 151.2 },
  { id: 'AEST', code: 'AU', flag: '\u{1F1E6}\u{1F1FA}', name: { ko: '호주(시드니)', zh: '悉尼', en: 'Sydney' }, abbr: 'AEST', offset: 11 , lat: 13.8, lon: 100.5 },
  { id: 'ICT_TH', code: 'TH', flag: '\u{1F1F9}\u{1F1ED}', name: { ko: '태국', zh: '泰国', en: 'Thailand' }, abbr: 'ICT', offset: 7 , lat: 21.0, lon: 105.9 },
    { id: 'ICT_VN', code: 'VN', flag: '\u{1F1FB}\u{1F1F3}', name: { ko: '베트남', zh: '越南', en: 'Vietnam' }, abbr: 'ICT', offset: 7, lat: 21.0, lon: 105.9 },
  { id: 'PHT', code: 'PH', flag: '\u{1F1F5}\u{1F1ED}', name: { ko: '필리핀', zh: '菲律宾', en: 'Philippines' }, abbr: 'PHT', offset: 8, lat: 14.6, lon: 121.0 },
]

// Seoul coordinates for Korea weather
const SEOUL_COORDS = { lat: 37.57, lon: 126.98 }

// WMO weather code → emoji
function weatherEmoji(code) {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 86) return '❄️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

// Open-Meteo weather hook (free, no API key, 30min cache)
const _weatherCache = { data: {}, ts: 0 }
function useWeather(tzIds) {
  const [data, setData] = useState(_weatherCache.data)

  useEffect(() => {
    // Build list of points to fetch
    const points = [{ id: 'KST', lat: SEOUL_COORDS.lat, lon: SEOUL_COORDS.lon }]
    tzIds.forEach(tzId => {
      const tz = TIMEZONE_OPTIONS.find(t => t.id === tzId)
      if (tz?.lat) points.push({ id: tz.id, lat: tz.lat, lon: tz.lon })
    })

    // Use cache if fresh (30 min)
    const cacheKey = points.map(p => p.id).sort().join(',')
    if (_weatherCache.key === cacheKey && Date.now() - _weatherCache.ts < 30 * 60 * 1000) {
      setData(_weatherCache.data)
      return
    }

    Promise.all(points.map(p =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code&timezone=auto`)
        .then(r => r.json())
        .then(j => ({ id: p.id, temp: Math.round(j.current?.temperature_2m ?? 0), emoji: weatherEmoji(j.current?.weather_code ?? 0) }))
        .catch(() => ({ id: p.id, temp: null, emoji: '' }))
    )).then(results => {
      const map = {}
      results.forEach(r => { map[r.id] = { temp: r.temp, emoji: r.emoji } })
      _weatherCache.data = map
      _weatherCache.key = cacheKey
      _weatherCache.ts = Date.now()
      setData(map)
    })
  }, [tzIds.join(',')])

  return data
}

function getTimeForOffset(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const t = new Date(utc + offset * 3600000)
  return t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// 한국(KST +9) 대비 날짜 차이 표시: -1d / +1d / 빈값
function getDayDiffLabel(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const kstDate = new Date(utc + 9 * 3600000).getDate()
  const tzDate = new Date(utc + offset * 3600000).getDate()
  if (tzDate > kstDate) return '+1d'
  if (tzDate < kstDate) return '-1d'
  return ''
}

// ── 멀티 시간대 훅 ──
function useMultiTimezone() {
  const [times, setTimes] = useState(() => {
    const saved = localStorage.getItem('hanpocket_extra_timezones')
    const extras = saved ? JSON.parse(saved) : []
    const kst = getTimeForOffset(9)
    const extraTimes = extras.map(id => {
      const tz = TIMEZONE_OPTIONS.find(t => t.id === id)
      return tz ? { ...tz, time: getTimeForOffset(tz.offset) } : null
    }).filter(Boolean)
    return { kst, extras: extraTimes }
  })

  useEffect(() => {
    const update = () => {
      const saved = localStorage.getItem('hanpocket_extra_timezones')
      const extras = saved ? JSON.parse(saved) : []
      const kst = getTimeForOffset(9)
      const extraTimes = extras.map(id => {
        const tz = TIMEZONE_OPTIONS.find(t => t.id === id)
        return tz ? { ...tz, time: getTimeForOffset(tz.offset) } : null
      }).filter(Boolean)
      setTimes({ kst, extras: extraTimes })
    }
    const t = setInterval(update, 30000)
    return () => clearInterval(t)
  }, [])

  const refresh = useCallback(() => {
    const saved = localStorage.getItem('hanpocket_extra_timezones')
    const extras = saved ? JSON.parse(saved) : []
    const kst = getTimeForOffset(9)
    const extraTimes = extras.map(id => {
      const tz = TIMEZONE_OPTIONS.find(t => t.id === id)
      return tz ? { ...tz, time: getTimeForOffset(tz.offset) } : null
    }).filter(Boolean)
    setTimes({ kst, extras: extraTimes })
  }, [])

  return { ...times, refresh }
}

// ── 오늘의 한국어 데이터 ──
const EXPRESSIONS = [
  { korean: '안녕하세요', chinese: '你好', english: 'Hello', roman: 'an-nyeong-ha-se-yo' },
  { korean: '감사합니다', chinese: '谢谢', english: 'Thank you', roman: 'gam-sa-ham-ni-da' },
  { korean: '죄송합니다', chinese: '对不起', english: 'I\'m sorry', roman: 'joe-song-ham-ni-da' },
  { korean: '이거 주세요', chinese: '请给我这个', english: 'This please', roman: 'i-geo ju-se-yo' },
  { korean: '얼마예요?', chinese: '多少钱？', english: 'How much?', roman: 'eol-ma-ye-yo' },
  { korean: '화장실 어디예요?', chinese: '洗手间在哪里？', english: 'Where is the restroom?', roman: 'hwa-jang-sil eo-di-ye-yo' },
  { korean: '계산해 주세요', chinese: '请结账', english: 'Check please', roman: 'gye-san-hae ju-se-yo' },
  { korean: '여기 가 주세요', chinese: '请去这里', english: 'Please go here', roman: 'yeo-gi ga ju-se-yo' },
  { korean: '맵지 않게 해주세요', chinese: '请做不辣的', english: 'Not spicy please', roman: 'maep-ji an-ke hae-ju-se-yo' },
  { korean: '카드 돼요?', chinese: '可以刷卡吗？', english: 'Card OK?', roman: 'ka-deu dwae-yo' },
  { korean: '도와주세요', chinese: '请帮帮我', english: 'Please help me', roman: 'do-wa-ju-se-yo' },
  { korean: '맛있어요!', chinese: '好吃！', english: 'Delicious!', roman: 'ma-si-sseo-yo' },
  { korean: '추천해 주세요', chinese: '请推荐', english: 'Recommend please', roman: 'chu-cheon-hae ju-se-yo' },
  { korean: '여기요!', chinese: '服务员！', english: 'Excuse me!', roman: 'yeo-gi-yo' },
  { korean: '포장해 주세요', chinese: '请打包', english: 'Takeaway please', roman: 'po-jang-hae ju-se-yo' },
  { korean: '네 / 아니요', chinese: '是 / 不是', english: 'Yes / No', roman: 'ne / a-ni-yo' },
]

function getTodayExpression() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return EXPRESSIONS[dayOfYear % EXPRESSIONS.length]
}

// ── 코스 그라디언트 매핑 ──
const COURSE_GRADIENTS = {
  first: 'from-[#2D5A3D] to-[#1A3A28]',
  kpop: 'from-[#B8860B] to-[#8B6914]',
  food: 'from-[#8B4513] to-[#5C2D0E]',
  shopping: 'from-[#6B4C3B] to-[#4A3228]',
  nature: 'from-[#3A7D5C] to-[#2D5A3D]',
  history: 'from-[#A0865A] to-[#7A6840]',
  busan: 'from-[#4A8A5A] to-[#2D5A3D]',
  jeju: 'from-[#5A8A6A] to-[#3A6A4A]',
  other_region: 'from-[#6A6A5A] to-[#4A4A3A]',
}

// ── 코스 배경 이미지 ──
const COURSE_IMAGES = {
  'first-day-seoul': 'https://images.unsplash.com/photo-1583167625297-fe5e39ebb0f5?w=400&h=300&fit=crop',
  'kpop-pilgrimage': 'https://images.unsplash.com/photo-1598394820342-3f06e4c84e04?w=400&h=300&fit=crop',
  'hongdae-yeonnam': 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
  'traditional-culture': 'https://images.unsplash.com/photo-1578037571214-25e07a2bfb89?w=400&h=300&fit=crop',
  'hangang-healing': 'https://images.unsplash.com/photo-1601312644655-433b9e0e0c48?w=400&h=300&fit=crop',
  'euljiro-retro': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=300&fit=crop',
  'jeju-east': 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=400&h=300&fit=crop',
  'busan-haeundae': 'https://images.unsplash.com/photo-1590228947235-d4770e03fb26?w=400&h=300&fit=crop',
  'mukbang-tour': 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop',
  'gangnam-cafe': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
}

// ── 상황별 한국어 데이터 ──
const SCENE_PHRASES = [
  { scene: { ko: '식당', zh: '餐厅', en: 'Restaurant' }, phrase: { ko: '이거 주세요', zh: '请给我这个' }, gradient: 'from-[#8B4513] to-[#5C2D0E]', pocket: 'restaurant', img: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=300&h=200&fit=crop' },
  { scene: { ko: '카페', zh: '咖啡厅', en: 'Cafe' }, phrase: { ko: '아이스 아메리카노 주세요', zh: '请给我冰美式' }, gradient: 'from-[#B8860B] to-[#8B6914]', pocket: 'cafe', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop' },
  { scene: { ko: '교통', zh: '交通', en: 'Transport' }, phrase: { ko: '여기 가 주세요', zh: '请去这里' }, gradient: 'from-[#2D5A3D] to-[#1A3A28]', pocket: 'transport', img: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=300&h=200&fit=crop' },
  { scene: { ko: '편의점', zh: '便利店', en: 'Store' }, phrase: { ko: '봉투 주세요', zh: '请给我袋子' }, gradient: 'from-[#4A8A5A] to-[#2D5A3D]', pocket: 'convenience', img: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&h=200&fit=crop' },
  { scene: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, phrase: { ko: '좀 깎아 주세요', zh: '请便宜一点' }, gradient: 'from-[#6B4C3B] to-[#4A3228]', pocket: 'shopping', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop' },
  { scene: { ko: '숙소', zh: '住宿', en: 'Hotel' }, phrase: { ko: '체크인 하려고요', zh: '我要办入住' }, gradient: 'from-[#A0865A] to-[#7A6840]', pocket: 'accommodation', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop' },
  { scene: { ko: '긴급', zh: '紧急', en: 'Emergency' }, phrase: { ko: '도와주세요!', zh: '请帮帮我！' }, gradient: 'from-[#8B2500] to-[#5C1A00]', pocket: 'emergency', img: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=300&h=200&fit=crop' },
]

// ── Intent 카드 데이터 ──
const INTENT_CARDS = [
  {
    id: 'just-arrived',
    label: { ko: '입국하기', zh: '入境', en: 'Arrival' },
    sub: { ko: '입국심사, SIM, 교통, 숙소', zh: '入境审查、SIM卡、交通、住宿', en: 'Immigration, SIM, transport, hotel' },
  },
  {
    id: 'departure',
    label: { ko: '출국하기', zh: '出境', en: 'Departure' },
    sub: { ko: '면세, 세금환급, 택배, 공항', zh: '免税、退税、快递、机场', en: 'Duty-free, tax refund, parcel, airport' },
  },
  {
    id: 'interpret',
    label: { ko: '번역&통역', zh: '翻译&口译', en: 'Translate' },
    sub: { ko: '식당, 카페, 쇼핑, 교통, 긴급', zh: '餐厅、咖啡厅、购物、交通、紧急', en: 'Restaurant, cafe, shop, transit, emergency' },
  },
]

// ── 입국 3단계 경로 ──
const ARRIVAL_PHASES = [
  { id: 'entry', label: { ko: '입국하기', zh: '入境', en: 'Arrival' } },
  { id: 'move', label: { ko: '숙소로 이동', zh: '前往住宿', en: 'To Hotel' } },
  { id: 'hotel', label: { ko: '숙소 도착', zh: '到达住宿', en: 'At Hotel' } },
]

// ── 포켓걸 미니 SVG (경로바용) ──
function PocketGirlMini({ size = 24 }) {
  return (
    <svg viewBox="0 0 40 60" width={size} height={size * 1.5} fill="none">
      <circle cx="20" cy="12" r="10" fill="#FFE4CC" />
      <ellipse cx="20" cy="8" rx="11" ry="6" fill="#2C1810" />
      <circle cx="16" cy="13" r="1.5" fill="#1A1A1A" />
      <circle cx="24" cy="13" r="1.5" fill="#1A1A1A" />
      <path d="M18 17 Q20 19 22 17" stroke="#E88" strokeWidth="1" fill="none" />
      <rect x="14" y="22" width="12" height="16" rx="4" fill="#FF6B6B" />
      <rect x="12" y="38" width="5" height="12" rx="2" fill="#FFE4CC" />
      <rect x="23" y="38" width="5" height="12" rx="2" fill="#FFE4CC" />
      <rect x="30" y="30" width="6" height="8" rx="2" fill="#E5E7EB" />
      <rect x="32" y="38" width="2" height="6" rx="1" fill="#9CA3AF" />
    </svg>
  )
}

// ── 포켓걸 인사 SVG (입국 팝업용) ──
function PocketGirlBow() {
  return (
    <svg viewBox="0 0 200 240" width={160} height={192} fill="none">
      <g transform="translate(60, 20)">
        <ellipse cx="40" cy="30" rx="28" ry="12" fill="#2C1810" />
        <ellipse cx="40" cy="40" rx="22" ry="24" fill="#FFE4CC" />
        <circle cx="33" cy="38" r="3" fill="#1A1A1A" /><circle cx="32" cy="36" r="1.2" fill="white" />
        <circle cx="47" cy="38" r="3" fill="#1A1A1A" /><circle cx="46" cy="36" r="1.2" fill="white" />
        <path d="M37 45 Q40 48 43 45" stroke="#FF8888" strokeWidth="1.5" fill="none" />
        <ellipse cx="28" cy="42" rx="4" ry="3" fill="#FFCCCC" opacity="0.5" />
        <ellipse cx="52" cy="42" rx="4" ry="3" fill="#FFCCCC" opacity="0.5" />
      </g>
      <g transform="translate(40, 90)">
        <rect x="20" y="0" width="40" height="50" rx="12" fill="#FF6B6B" />
        <rect x="10" y="10" width="15" height="6" rx="3" fill="#FFE4CC" transform="rotate(-30, 10, 10)" />
        <rect x="55" y="10" width="15" height="6" rx="3" fill="#FFE4CC" transform="rotate(30, 70, 10)" />
        <rect x="25" y="50" width="12" height="30" rx="4" fill="#FFE4CC" />
        <rect x="43" y="50" width="12" height="30" rx="4" fill="#FFE4CC" />
      </g>
      <g transform="translate(110, 100)">
        <rect x="0" y="0" width="18" height="24" rx="4" fill="#E5E7EB" />
        <rect x="3" y="24" width="4" height="14" rx="2" fill="#9CA3AF" />
        <rect x="11" y="24" width="4" height="14" rx="2" fill="#9CA3AF" />
      </g>
    </svg>
  )
}

// ── 포켓걸 우는 SVG (출국 팝업용) ──
function PocketGirlCry() {
  return (
    <svg viewBox="0 0 200 240" width={160} height={192} fill="none">
      <g transform="translate(60, 20)">
        <ellipse cx="40" cy="30" rx="28" ry="12" fill="#2C1810" />
        <ellipse cx="40" cy="40" rx="22" ry="24" fill="#FFE4CC" />
        <path d="M30 36 Q33 33 36 36" stroke="#1A1A1A" strokeWidth="2" fill="none" />
        <path d="M44 36 Q47 33 50 36" stroke="#1A1A1A" strokeWidth="2" fill="none" />
        <path d="M37 48 Q40 46 43 48" stroke="#CC6666" strokeWidth="1.5" fill="none" />
        <path d="M31 40 Q30 52 29 56" stroke="#88CCFF" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M49 40 Q50 52 51 56" stroke="#88CCFF" strokeWidth="1.5" fill="none" opacity="0.7" />
      </g>
      <g transform="translate(40, 90)">
        <rect x="20" y="0" width="40" height="50" rx="12" fill="#6B8CFF" />
        <rect x="15" y="15" width="12" height="6" rx="3" fill="#FFE4CC" />
        <rect x="53" y="15" width="12" height="6" rx="3" fill="#FFE4CC" />
        <rect x="25" y="50" width="12" height="30" rx="4" fill="#FFE4CC" />
        <rect x="43" y="50" width="12" height="30" rx="4" fill="#FFE4CC" />
      </g>
    </svg>
  )
}

// ── 공휴일 + 기념일 캘린더 (한국 + 중국/대만/홍콩 토글) ──
// type: 'holiday'(공휴일, 빨간색) | 'special'(기념일, 파란색) — 날짜 확정 이벤트만 수록
// 2026년 기준, timeanddate.com 검증 완료
const HOLIDAYS_BY_COUNTRY = {
  kr: [
    // ── 공휴일 ──
    { date: '2026-01-01', name: { ko: '신정', zh: '元旦', en: "New Year's Day" } },
    { date: '2026-02-16', name: { ko: '설날 연휴', zh: '春节假期', en: 'Seollal Holiday' } },
    { date: '2026-02-17', name: { ko: '설날', zh: '春节', en: 'Seollal (Lunar New Year)' } },
    { date: '2026-02-18', name: { ko: '설날 연휴', zh: '春节假期', en: 'Seollal Holiday' } },
    { date: '2026-03-01', name: { ko: '삼일절', zh: '三一节', en: 'Independence Movement Day' } },
    { date: '2026-03-02', name: { ko: '대체공휴일(삼일절)', zh: '补休(三一节)', en: 'Substitute Holiday' } },
    { date: '2026-05-01', name: { ko: '근로자의 날', zh: '劳动节', en: 'Labor Day' }, type: 'special' },
    { date: '2026-05-05', name: { ko: '어린이날', zh: '儿童节', en: "Children's Day" } },
    { date: '2026-05-24', name: { ko: '부처님오신날', zh: '佛诞节', en: "Buddha's Birthday" } },
    { date: '2026-05-25', name: { ko: '대체공휴일(석가탄신일)', zh: '补休(佛诞节)', en: 'Substitute Holiday' } },
    { date: '2026-06-03', name: { ko: '지방선거일', zh: '地方选举日', en: 'Local Election Day' } },
    { date: '2026-06-06', name: { ko: '현충일', zh: '显忠日', en: 'Memorial Day' } },
    { date: '2026-08-15', name: { ko: '광복절', zh: '光复节', en: 'Liberation Day' } },
    { date: '2026-08-17', name: { ko: '대체공휴일(광복절)', zh: '补休(光复节)', en: 'Substitute Holiday' } },
    { date: '2026-09-24', name: { ko: '추석 연휴', zh: '中秋假期', en: 'Chuseok Holiday' } },
    { date: '2026-09-25', name: { ko: '추석', zh: '中秋节', en: 'Chuseok' } },
    { date: '2026-09-26', name: { ko: '추석 연휴', zh: '中秋假期', en: 'Chuseok Holiday' } },
    { date: '2026-10-03', name: { ko: '개천절', zh: '开天节', en: 'National Foundation Day' } },
    { date: '2026-10-05', name: { ko: '대체공휴일(개천절)', zh: '补休(开天节)', en: 'Substitute Holiday' } },
    { date: '2026-10-09', name: { ko: '한글날', zh: '韩文日', en: 'Hangul Day' } },
    { date: '2026-12-25', name: { ko: '성탄절', zh: '圣诞节', en: 'Christmas' } },
    // ── 기념일 (고정 날짜) ──
    { date: '2026-02-14', name: { ko: '발렌타인데이', zh: '情人节', en: "Valentine's Day" }, type: 'special' },
    { date: '2026-03-14', name: { ko: '화이트데이', zh: '白色情人节', en: 'White Day' }, type: 'special' },
    { date: '2026-04-14', name: { ko: '블랙데이', zh: '黑色情人节', en: 'Black Day' }, type: 'special' },
    { date: '2026-05-08', name: { ko: '어버이날', zh: '父母节', en: "Parents' Day" }, type: 'special' },
    { date: '2026-05-15', name: { ko: '스승의 날', zh: '教师节', en: "Teachers' Day" }, type: 'special' },
    { date: '2026-10-31', name: { ko: '할로윈', zh: '万圣节', en: 'Halloween' }, type: 'special' },
    { date: '2026-11-11', name: { ko: '빼빼로데이', zh: 'Pepero Day', en: 'Pepero Day' }, type: 'special' },
    { date: '2026-12-24', name: { ko: '크리스마스 이브', zh: '平安夜', en: 'Christmas Eve' }, type: 'special' },
    { date: '2026-12-31', name: { ko: '연말', zh: '跨年夜', en: "New Year's Eve" }, type: 'special' },
  ],
  cn: [
    // ── 공휴일 ──
    { date: '2026-01-01', name: { ko: '원단', zh: '元旦', en: "New Year's Day" } },
    { date: '2026-02-15', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Spring Festival Holiday' } },
    { date: '2026-02-16', name: { ko: '춘절(제석)', zh: '除夕', en: 'Spring Festival Eve' } },
    { date: '2026-02-17', name: { ko: '춘절(초하루)', zh: '春节(初一)', en: 'Chinese New Year' } },
    { date: '2026-02-18', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Spring Festival Holiday' } },
    { date: '2026-02-19', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Spring Festival Holiday' } },
    { date: '2026-02-20', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Spring Festival Holiday' } },
    { date: '2026-02-21', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Spring Festival Holiday' } },
    { date: '2026-02-22', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Spring Festival Holiday' } },
    { date: '2026-02-23', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Spring Festival Holiday' } },
    { date: '2026-04-05', name: { ko: '청명절', zh: '清明节', en: 'Qingming Festival' } },
    { date: '2026-04-06', name: { ko: '청명절 연휴', zh: '清明节假期', en: 'Qingming Holiday' } },
    { date: '2026-05-01', name: { ko: '노동절', zh: '劳动节', en: 'Labor Day' } },
    { date: '2026-05-02', name: { ko: '노동절 연휴', zh: '劳动节假期', en: 'Labor Day Holiday' } },
    { date: '2026-05-03', name: { ko: '노동절 연휴', zh: '劳动节假期', en: 'Labor Day Holiday' } },
    { date: '2026-05-04', name: { ko: '노동절 연휴', zh: '劳动节假期', en: 'Labor Day Holiday' } },
    { date: '2026-05-05', name: { ko: '노동절 연휴', zh: '劳动节假期', en: 'Labor Day Holiday' } },
    { date: '2026-06-19', name: { ko: '단오절', zh: '端午节', en: 'Dragon Boat Festival' } },
    { date: '2026-06-20', name: { ko: '단오절 연휴', zh: '端午节假期', en: 'Dragon Boat Holiday' } },
    { date: '2026-06-21', name: { ko: '단오절 연휴', zh: '端午节假期', en: 'Dragon Boat Holiday' } },
    { date: '2026-09-25', name: { ko: '중추절', zh: '中秋节', en: 'Mid-Autumn Festival' } },
    { date: '2026-09-26', name: { ko: '중추절 연휴', zh: '中秋节假期', en: 'Mid-Autumn Holiday' } },
    { date: '2026-09-27', name: { ko: '중추절 연휴', zh: '中秋节假期', en: 'Mid-Autumn Holiday' } },
    { date: '2026-10-01', name: { ko: '국경절', zh: '国庆节', en: 'National Day' } },
    { date: '2026-10-02', name: { ko: '국경절 연휴', zh: '国庆假期', en: 'National Day Holiday' } },
    { date: '2026-10-03', name: { ko: '국경절 연휴', zh: '国庆假期', en: 'National Day Holiday' } },
    { date: '2026-10-04', name: { ko: '국경절 연휴', zh: '国庆假期', en: 'National Day Holiday' } },
    { date: '2026-10-05', name: { ko: '국경절 연휴', zh: '国庆假期', en: 'National Day Holiday' } },
    { date: '2026-10-06', name: { ko: '국경절 연휴', zh: '国庆假期', en: 'National Day Holiday' } },
    { date: '2026-10-07', name: { ko: '국경절 연휴', zh: '国庆假期', en: 'National Day Holiday' } },
    // ── 기념일 (중국인에게 중요한 고정 날짜) ──
    { date: '2026-02-14', name: { ko: '발렌타인데이', zh: '情人节', en: "Valentine's Day" }, type: 'special' },
    { date: '2026-03-03', name: { ko: '원소절(정월대보름)', zh: '元宵节', en: 'Lantern Festival' }, type: 'special' },
    { date: '2026-03-08', name: { ko: '세계 여성의 날', zh: '三八妇女节', en: "Int'l Women's Day" }, type: 'special' },
    { date: '2026-03-12', name: { ko: '식목일(중국)', zh: '植树节', en: 'Arbor Day (CN)' }, type: 'special' },
    { date: '2026-03-14', name: { ko: '화이트데이', zh: '白色情人节', en: 'White Day' }, type: 'special' },
    { date: '2026-05-04', name: { ko: '청년절', zh: '五四青年节', en: 'Youth Day' }, type: 'special' },
    { date: '2026-05-10', name: { ko: '어머니의 날', zh: '母亲节', en: "Mother's Day" }, type: 'special' },
    { date: '2026-05-20', name: { ko: '520 사랑의 날', zh: '520表白日', en: '520 Love Day' }, type: 'special' },
    { date: '2026-06-01', name: { ko: '아동절(중국)', zh: '六一儿童节', en: "Children's Day (CN)" }, type: 'special' },
    { date: '2026-06-21', name: { ko: '아버지의 날', zh: '父亲节', en: "Father's Day" }, type: 'special' },
    { date: '2026-07-01', name: { ko: '중국공산당 창당일', zh: '建党节', en: 'CPC Founding Day' }, type: 'special' },
    { date: '2026-08-01', name: { ko: '건군절', zh: '建军节', en: 'Army Day' }, type: 'special' },
    { date: '2026-08-19', name: { ko: '칠석(중국 발렌타인)', zh: '七夕节', en: 'Qixi (Chinese Valentine)' }, type: 'special' },
    { date: '2026-09-10', name: { ko: '교사절(중국)', zh: '教师节', en: "Teachers' Day (CN)" }, type: 'special' },
    { date: '2026-10-18', name: { ko: '중양절(경로일)', zh: '重阳节', en: 'Double Ninth Festival' }, type: 'special' },
    { date: '2026-10-31', name: { ko: '할로윈', zh: '万圣节', en: 'Halloween' }, type: 'special' },
    { date: '2026-11-11', name: { ko: '광군절(쇼핑축제)', zh: '双十一/光棍节', en: 'Singles Day / 11.11' }, type: 'special' },
    { date: '2026-12-12', name: { ko: '솽스얼(쇼핑축제)', zh: '双十二', en: '12.12 Shopping Day' }, type: 'special' },
    { date: '2026-12-24', name: { ko: '크리스마스 이브', zh: '平安夜', en: 'Christmas Eve' }, type: 'special' },
    { date: '2026-12-25', name: { ko: '성탄절', zh: '圣诞节', en: 'Christmas' }, type: 'special' },
    { date: '2026-12-31', name: { ko: '연말', zh: '跨年夜', en: "New Year's Eve" }, type: 'special' },
  ],
  tw: [
    // ── 공휴일 ──
    { date: '2026-01-01', name: { ko: '개국기념일', zh: '元旦/开国纪念日', en: "New Year's / Republic Day" } },
    { date: '2026-02-14', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' } },
    { date: '2026-02-15', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' } },
    { date: '2026-02-16', name: { ko: '춘절(제석)', zh: '除夕', en: 'Lunar New Year Eve' } },
    { date: '2026-02-17', name: { ko: '춘절(초하루)', zh: '春节', en: 'Lunar New Year' } },
    { date: '2026-02-18', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' } },
    { date: '2026-02-19', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' } },
    { date: '2026-02-20', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' } },
    { date: '2026-02-21', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' } },
    { date: '2026-02-22', name: { ko: '춘절 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' } },
    { date: '2026-02-27', name: { ko: '228 평화기념일 연휴', zh: '228和平纪念日假期', en: '228 Memorial Holiday' } },
    { date: '2026-02-28', name: { ko: '228 평화기념일', zh: '228和平纪念日', en: '228 Peace Memorial Day' } },
    { date: '2026-04-03', name: { ko: '아동절 연휴', zh: '儿童节假期', en: "Children's Day Holiday" } },
    { date: '2026-04-04', name: { ko: '아동절', zh: '儿童节', en: "Children's Day" } },
    { date: '2026-04-05', name: { ko: '청명절', zh: '清明节', en: 'Tomb Sweeping Day' } },
    { date: '2026-04-06', name: { ko: '청명절 연휴', zh: '清明节假期', en: 'Tomb Sweeping Holiday' } },
    { date: '2026-05-01', name: { ko: '노동절', zh: '劳动节', en: 'Labor Day' } },
    { date: '2026-06-19', name: { ko: '단오절', zh: '端午节', en: 'Dragon Boat Festival' } },
    { date: '2026-09-25', name: { ko: '중추절', zh: '中秋节', en: 'Mid-Autumn Festival' } },
    { date: '2026-09-28', name: { ko: '공자탄신일', zh: '教师节/孔子诞辰', en: "Teachers' Day / Confucius" } },
    { date: '2026-10-09', name: { ko: '국경일 연휴', zh: '国庆假期', en: 'National Day Holiday' } },
    { date: '2026-10-10', name: { ko: '쌍십절(국경일)', zh: '双十节/国庆日', en: 'Double Tenth Day' } },
    // ── 기념일 ──
    { date: '2026-02-14', name: { ko: '발렌타인데이', zh: '情人节', en: "Valentine's Day" }, type: 'special' },
    { date: '2026-03-14', name: { ko: '화이트데이', zh: '白色情人节', en: 'White Day' }, type: 'special' },
    { date: '2026-05-10', name: { ko: '어머니의 날', zh: '母亲节', en: "Mother's Day" }, type: 'special' },
    { date: '2026-08-08', name: { ko: '아버지의 날(대만)', zh: '父亲节(88节)', en: "Father's Day (TW)" }, type: 'special' },
    { date: '2026-08-19', name: { ko: '칠석', zh: '七夕情人节', en: 'Qixi Festival' }, type: 'special' },
    { date: '2026-10-18', name: { ko: '중양절', zh: '重阳节', en: 'Double Ninth Festival' }, type: 'special' },
    { date: '2026-10-31', name: { ko: '할로윈', zh: '万圣节', en: 'Halloween' }, type: 'special' },
    { date: '2026-12-24', name: { ko: '크리스마스 이브', zh: '平安夜', en: 'Christmas Eve' }, type: 'special' },
    { date: '2026-12-25', name: { ko: '성탄절', zh: '圣诞节', en: 'Christmas' }, type: 'special' },
    { date: '2026-12-31', name: { ko: '연말', zh: '跨年夜', en: "New Year's Eve" }, type: 'special' },
  ],
  hk: [
    // ── 공휴일 ──
    { date: '2026-01-01', name: { ko: '원단', zh: '元旦', en: "New Year's Day" } },
    { date: '2026-02-17', name: { ko: '춘절', zh: '农历新年初一', en: 'Lunar New Year' } },
    { date: '2026-02-18', name: { ko: '춘절 연휴', zh: '农历新年假期', en: 'Lunar New Year Holiday' } },
    { date: '2026-02-19', name: { ko: '춘절 연휴', zh: '农历新年假期', en: 'Lunar New Year Holiday' } },
    { date: '2026-04-03', name: { ko: '성금요일', zh: '耶稣受难节', en: 'Good Friday' } },
    { date: '2026-04-04', name: { ko: '성토요일', zh: '耶稣受难节翌日', en: 'Holy Saturday' } },
    { date: '2026-04-05', name: { ko: '청명절', zh: '清明节', en: 'Tomb Sweeping Day' } },
    { date: '2026-04-06', name: { ko: '부활절 월요일', zh: '复活节星期一', en: 'Easter Monday' } },
    { date: '2026-04-07', name: { ko: '대체공휴일(부활절)', zh: '补假(复活节)', en: 'Substitute Holiday' } },
    { date: '2026-05-01', name: { ko: '노동절', zh: '劳动节', en: 'Labor Day' } },
    { date: '2026-05-24', name: { ko: '부처님오신날', zh: '佛诞', en: "Buddha's Birthday" } },
    { date: '2026-05-25', name: { ko: '대체공휴일(석가탄신)', zh: '补假(佛诞)', en: 'Substitute Holiday' } },
    { date: '2026-06-19', name: { ko: '단오절', zh: '端午节', en: 'Dragon Boat Festival' } },
    { date: '2026-07-01', name: { ko: '홍콩반환기념일', zh: '香港回归纪念日', en: 'HKSAR Day' } },
    { date: '2026-09-26', name: { ko: '중추절 다음날', zh: '中秋节翌日', en: 'Day after Mid-Autumn' } },
    { date: '2026-10-01', name: { ko: '국경절', zh: '国庆节', en: 'National Day' } },
    { date: '2026-10-18', name: { ko: '중양절', zh: '重阳节', en: 'Chung Yeung Festival' } },
    { date: '2026-10-19', name: { ko: '대체공휴일(중양절)', zh: '补假(重阳节)', en: 'Substitute Holiday' } },
    { date: '2026-12-25', name: { ko: '성탄절', zh: '圣诞节', en: 'Christmas' } },
    { date: '2026-12-26', name: { ko: '성탄절 연휴', zh: '圣诞节假期', en: 'Boxing Day' } },
    // ── 기념일 ──
    { date: '2026-02-14', name: { ko: '발렌타인데이', zh: '情人节', en: "Valentine's Day" }, type: 'special' },
    { date: '2026-03-14', name: { ko: '화이트데이', zh: '白色情人节', en: 'White Day' }, type: 'special' },
    { date: '2026-05-10', name: { ko: '어머니의 날', zh: '母亲节', en: "Mother's Day" }, type: 'special' },
    { date: '2026-06-21', name: { ko: '아버지의 날', zh: '父亲节', en: "Father's Day" }, type: 'special' },
    { date: '2026-08-19', name: { ko: '칠석', zh: '七夕情人节', en: 'Qixi Festival' }, type: 'special' },
    { date: '2026-09-25', name: { ko: '중추절', zh: '中秋节', en: 'Mid-Autumn Festival' }, type: 'special' },
    { date: '2026-10-31', name: { ko: '할로윈', zh: '万圣节', en: 'Halloween' }, type: 'special' },
    { date: '2026-11-11', name: { ko: '광군절', zh: '双十一/光棍节', en: 'Singles Day / 11.11' }, type: 'special' },
    { date: '2026-12-24', name: { ko: '크리스마스 이브', zh: '平安夜', en: 'Christmas Eve' }, type: 'special' },
    { date: '2026-12-31', name: { ko: '연말', zh: '跨年夜', en: "New Year's Eve" }, type: 'special' },
  ],
}

const COUNTRY_LABELS = {
  kr: { ko: '한국', zh: '韩国', en: 'Korea', flag: '🇰🇷' },
  cn: { ko: '중국', zh: '中国', en: 'China', flag: '🇨🇳' },
  tw: { ko: '대만', zh: '台湾', en: 'Taiwan', flag: '🇹🇼' },
  hk: { ko: '홍콩', zh: '香港', en: 'Hong Kong', flag: '🇭🇰' },
}

function HolidayCalendar({ lang }) {
  const [countries, setCountries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hp_holiday_countries')) || ['kr'] } catch { return ['kr'] }
  })
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const year = today.getFullYear()
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const toggleCountry = (c) => {
    setCountries(prev => {
      const next = prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
      const result = next.length === 0 ? ['kr'] : next
      localStorage.setItem('hp_holiday_countries', JSON.stringify(result))
      return result
    })
  }

  const allHolidays = countries.flatMap(c => (HOLIDAYS_BY_COUNTRY[c] || []).map(h => ({ ...h, country: c })))
  const countryColor = { kr: 'bg-red-500', cn: 'bg-red-600', tw: 'bg-green-500', hk: 'bg-pink-500' }
  const specialColor = { kr: 'bg-blue-400', cn: 'bg-blue-500', tw: 'bg-teal-400', hk: 'bg-purple-400' }
  const monthNames = { ko: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'], zh: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] }
  const dayLabels = { ko: ['일','월','화','수','목','금','토'], zh: ['日','一','二','三','四','五','六'], en: ['S','M','T','W','T','F','S'] }

  const firstDay = new Date(year, viewMonth, 1).getDay()
  const daysInMonth = new Date(year, viewMonth + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const holidayMap = new Map()
  allHolidays.filter(h => {
    const d = new Date(h.date)
    return d.getFullYear() === year && d.getMonth() === viewMonth
  }).forEach(h => {
    const day = parseInt(h.date.slice(8, 10))
    if (!holidayMap.has(day)) holidayMap.set(day, [])
    holidayMap.get(day).push({ country: h.country, type: h.type || 'holiday' })
  })

  // 이번 달 일정 목록 — 연속 날짜는 그룹핑 (춘절 02/15~02/23 식)
  const monthItems = []
  const seenH = new Set()
  const rawList = allHolidays.filter(h => {
    const d = new Date(h.date)
    return d.getFullYear() === year && d.getMonth() === viewMonth
  })
  // dedup
  const deduped = []
  rawList.forEach(h => {
    const key = `${h.date}-${h.country}`
    if (!seenH.has(key)) { seenH.add(key); deduped.push(h) }
  })
  // group consecutive days with same country + same base name (연휴/假期 stripped)
  const baseName = (n) => {
    const s = typeof n === 'string' ? n : (n?.ko || '')
    return s.replace(/\s*연휴.*$/, '').replace(/\s*假期.*$/, '').replace(/\s*Holiday.*$/i, '').replace(/\(.*\)/, '').trim()
  }
  const grouped = []
  deduped.forEach(h => {
    const bn = baseName(h.name)
    const last = grouped[grouped.length - 1]
    if (last && last.country === h.country && baseName(last.name) === bn && (last.type || 'holiday') === (h.type || 'holiday')) {
      // check consecutive: last endDate +1 day === h.date
      const lastEnd = new Date(last.endDate || last.date)
      const cur = new Date(h.date)
      const diff = (cur - lastEnd) / 86400000
      if (diff <= 1) {
        last.endDate = h.date
        // keep the most descriptive name (shortest = base name preferred)
        return
      }
    }
    grouped.push({ ...h, endDate: h.date })
  })

  const isCurrentMonth = viewMonth === today.getMonth()

  return (
    <div className="mb-4 px-4">
      {/* 국가 토글 + 범례 */}
      <div className="flex items-center gap-2 mb-3">
        {Object.entries(COUNTRY_LABELS).map(([code, info]) => (
          <button
            key={code}
            onClick={() => toggleCountry(code)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-[6px] transition-all ${
              countries.includes(code)
                ? 'bg-[#111827] text-white'
                : 'bg-[#F3F4F6] text-[#9CA3AF]'
            }`}
          >
            <span>{info.flag}</span>
            <span>{L(lang, info)}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] text-[#999]">{L(lang, { ko: '공휴일', zh: '假日', en: 'Holiday' })}</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-[10px] text-[#999]">{L(lang, { ko: '기념일', zh: '纪念日', en: 'Special' })}</span></div>
        </div>
      </div>

      {/* 월 네비게이션: ◀ 2026년 3월 ▶ */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewMonth(m => Math.max(0, m - 1))} disabled={viewMonth === 0}
          className={`p-1 rounded-[6px] ${viewMonth === 0 ? 'text-[#D1D5DB]' : 'text-[#1A1A1A] hover:bg-[#F3F4F6] active:bg-[#E5E7EB]'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button onClick={() => setViewMonth(today.getMonth())}
          className="text-[15px] font-semibold tracking-wide text-[#1A1A1A]">
          {L(lang, { ko: `${year}년 ${monthNames.ko[viewMonth]}`, zh: `${year}年${monthNames.zh[viewMonth]}`, en: `${monthNames.en[viewMonth]} ${year}` })}
          {isCurrentMonth && <span className="ml-1 text-[10px] font-normal text-[#2D5A3D]">●</span>}
        </button>
        <button onClick={() => setViewMonth(m => Math.min(11, m + 1))} disabled={viewMonth === 11}
          className={`p-1 rounded-[6px] ${viewMonth === 11 ? 'text-[#D1D5DB]' : 'text-[#1A1A1A] hover:bg-[#F3F4F6] active:bg-[#E5E7EB]'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* 캘린더 */}
      <div className="rounded-[6px] border border-[#E5E7EB] p-3 mb-3">
        <div className="grid grid-cols-7 gap-0 text-center mb-1">
          {dayLabels[lang]?.map((d, i) => (
            <span key={i} className={`text-[10px] font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#999]'}`}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0 text-center">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />
            const isToday = isCurrentMonth && d === today.getDate()
            const hc = holidayMap.get(d)
            const hasHoliday = hc?.some(x => x.type === 'holiday')
            const hasSpecial = hc?.some(x => x.type === 'special')
            const dayOfWeek = (firstDay + d - 1) % 7
            return (
              <div key={i} className="flex flex-col items-center">
                <span className={`text-[11px] py-1 rounded-full w-7 ${isToday ? 'bg-[#1A1A1A] text-white font-bold' : hasHoliday ? 'text-red-500 font-bold' : hasSpecial ? 'text-blue-500 font-medium' : dayOfWeek === 0 ? 'text-red-300' : dayOfWeek === 6 ? 'text-blue-300' : 'text-[#666]'}`}>
                  {d}
                </span>
                {hc && (
                  <div className="flex gap-[2px] mt-[1px]">
                    {[...new Map(hc.map(x => [`${x.country}-${x.type}`, x])).values()].map((x, j) => (
                      <div key={j} className={`w-[4px] h-[4px] rounded-full ${x.type === 'special' ? (specialColor[x.country] || 'bg-blue-400') : countryColor[x.country]}`} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 이번 달 일정 (연속 날짜 그룹핑) */}
      {grouped.length > 0 ? (
        <div className="flex flex-col gap-2">
          {grouped.map((h, i) => {
            const startDiff = Math.ceil((new Date(h.date) - today) / 86400000)
            const endDiff = h.endDate !== h.date ? Math.ceil((new Date(h.endDate) - today) / 86400000) : null
            const isSpecial = h.type === 'special'
            const isRange = h.endDate && h.endDate !== h.date
            const dateLabel = isRange
              ? `${h.date.slice(5).replace('-','/')} ~ ${h.endDate.slice(5).replace('-','/')}`
              : h.date.slice(5).replace('-', '/')
            // D-day: show based on start date, or "진행중" if within range
            let dday = null
            if (startDiff > 0) dday = `D-${startDiff}`
            else if (startDiff === 0) dday = L(lang, { ko: '오늘', zh: '今天', en: 'Today' })
            else if (endDiff !== null && endDiff >= 0) dday = L(lang, { ko: '진행중', zh: '进行中', en: 'Ongoing' })
            return (
              <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-[6px] ${isSpecial ? 'bg-[#F0F4FF]' : 'bg-[#F9FAFB]'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px]">{COUNTRY_LABELS[h.country]?.flag}</span>
                  <div>
                    <span className={`text-sm ${isSpecial ? 'font-medium text-[#4B5563]' : 'font-semibold text-[#1A1A1A]'}`}>{L(lang, h.name)}</span>
                    <span className="text-xs text-[#999] ml-2">{dateLabel}</span>
                  </div>
                </div>
                {dday && (
                  <span className={`text-xs font-medium whitespace-nowrap ${isSpecial ? 'text-[#6366F1]' : 'text-[#2D5A3D]'}`}>
                    {dday}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-[#999] text-center py-2">
          {L(lang, { ko: '이번 달 일정 없음', zh: '本月无日程', en: 'Nothing this month' })}
        </p>
      )}

    </div>
  )
}

// ── 프로모 배너 컴포넌트 ──
function PromoBanner({ banners, lang }) {
  const scrollRef = useRef(null)
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx(prev => {
        const next = (prev + 1) % banners.length
        scrollRef.current?.scrollTo({ left: next * scrollRef.current.offsetWidth, behavior: 'smooth' })
        return next
      })
    }, 4000)
    return () => clearInterval(timer)
  }, [banners.length])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth)
    setCurrentIdx(idx)
  }

  return (
    <div className="mb-8 relative">
      <div ref={scrollRef} onScroll={handleScroll} className="flex overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        {banners.map((b, i) => (
          <button key={i} onClick={b.onClick}
            className="snap-start flex-shrink-0 w-full px-4">
            <div className="rounded-[6px] p-5 h-[140px] flex flex-col justify-end relative overflow-hidden "
              style={{ backgroundColor: b.bg }}>
              <span className="text-3xl absolute top-4 right-4">{b.emoji}</span>
              <h3 className="text-white font-bold text-base leading-tight">{L(lang, b.title)}</h3>
              <p className="text-white/80 text-xs mt-1">{L(lang, b.sub)}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="absolute bottom-2 right-8 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full">
        {currentIdx + 1} / {banners.length}
      </div>
    </div>
  )
}

// ── 추천 섹션 컴포넌트 ──
function RecommendSection({ title, subtitle, items, lang, onViewAll }) {
  return (
    <div className="mb-10 px-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[15px] font-semibold tracking-wide text-[#1A1A1A]">{L(lang, title)}</h2>
        {onViewAll && (
          <button onClick={onViewAll} className="text-xs text-[#999]">
            {L(lang, { ko: '전체보기', zh: '查看全部', en: 'View all' })} &gt;
          </button>
        )}
      </div>
      <p className="text-xs text-[#999] mb-3 tracking-wider">{L(lang, subtitle)}</p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <button key={i} onClick={item.onClick} className="text-left active:scale-[0.98] transition-transform">
            <div className="aspect-[4/3] rounded-[6px] overflow-hidden mb-2 bg-[#F3F4F6] ">
              {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" onError={e => { e.target.style.display = 'none' }} />}
            </div>
            <p className="text-sm font-semibold tracking-wide text-[#1A1A1A] leading-tight line-clamp-1">
              {item.name}
              {item.rating && <span className="text-[#F59E0B] ml-1">★ {item.rating}</span>}
            </p>
            {item.tags && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.tags.map((tag, j) => (
                  <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#666]">{tag}</span>
                ))}
              </div>
            )}
            {item.sub && <p className="text-[11px] text-[#999] mt-0.5">{item.sub}</p>}
            {item.review && (
              <div className="mt-1.5 flex items-start gap-1">
                <span className="text-[10px] text-[#2D5A3D] font-medium shrink-0">💬</span>
                <p className="text-[10px] text-[#666] leading-tight line-clamp-2 italic">"{item.review}"</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── 세금환급 계산기 ──
// 한국 Tax Free 환급 구간 (2024년 기준, 부가세 10%)
// 3만원 이상 구매 시 환급 가능, 단일 매장 기준
const TAX_REFUND_TABLE = [
  { min: 30000, max: 49999, refund: 1500 },
  { min: 50000, max: 74999, refund: 3500 },
  { min: 75000, max: 99999, refund: 5000 },
  { min: 100000, max: 124999, refund: 7000 },
  { min: 125000, max: 149999, refund: 9000 },
  { min: 150000, max: 174999, refund: 10000 },
  { min: 175000, max: 199999, refund: 12000 },
  { min: 200000, max: 249999, refund: 14000 },
  { min: 250000, max: 299999, refund: 18000 },
  { min: 300000, max: 399999, refund: 22000 },
  { min: 400000, max: 499999, refund: 30000 },
  { min: 500000, max: 749999, refund: 38000 },
  { min: 750000, max: 999999, refund: 58000 },
]

function calcTaxRefund(amount) {
  if (amount < 30000) return 0
  // 100만원 이상은 부가세 공식 적용 (약 7~8%)
  if (amount >= 1000000) return Math.round(amount / 11 * 0.85)
  const row = TAX_REFUND_TABLE.find(r => amount >= r.min && amount <= r.max)
  return row ? row.refund : Math.round(amount / 11 * 0.85)
}

function TaxRefundCalculator({ lang }) {
  const [amount, setAmount] = useState('')
  const num = parseInt(amount.replace(/,/g, '')) || 0
  const refund = calcTaxRefund(num)

  const format = (n) => n.toLocaleString()

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000]

  return (
    <div className="max-w-[480px] mx-auto px-4 py-6">
      {/* 안내 */}
      <div className="bg-[#F8F9FA] rounded-[6px] p-4 mb-6 border border-[#E5E7EB]">
        <p className="text-xs text-[#6B7280] leading-relaxed">
          {lang === 'ko' ? '외국인 관광객은 1개 매장에서 3만원 이상 구매 시 부가세(VAT)를 환급받을 수 있습니다. 출국 시 공항 Tax Refund 카운터에서 처리하세요.'
          : lang === 'zh' ? '外国游客在单店消费满3万韩元即可申请退税(VAT)。请在出境时于机场退税柜台办理。'
          : 'Foreign tourists can get a VAT refund on purchases over ₩30,000 at a single store. Process at the airport Tax Refund counter before departure.'}
        </p>
      </div>

      {/* 입력 */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-[#6B7280] block mb-2">
          {lang === 'ko' ? '구매 금액 (₩)' : lang === 'zh' ? '购买金额 (₩)' : 'Purchase Amount (₩)'}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] text-lg font-medium">₩</span>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={e => {
              const v = e.target.value.replace(/[^0-9]/g, '')
              setAmount(v ? parseInt(v).toLocaleString() : '')
            }}
            placeholder={lang === 'ko' ? '금액 입력' : lang === 'zh' ? '输入金额' : 'Enter amount'}
            className="w-full pl-10 pr-4 py-4 bg-white border border-[#E5E7EB] rounded-[6px] text-xl font-bold text-[#1A1A1A] outline-none focus:border-[#2D5A3D] transition-colors"
          />
        </div>
      </div>

      {/* 빠른 금액 버튼 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {quickAmounts.map(q => (
          <button
            key={q}
            onClick={() => setAmount(q.toLocaleString())}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#E5E7EB] text-[#374151] active:scale-95 transition-all"
            style={{ backgroundColor: num === q ? '#F0F7F4' : '#fff' }}
          >
            ₩{format(q)}
          </button>
        ))}
      </div>

      {/* 결과 */}
      <div className="bg-white rounded-[6px] border border-[#E5E7EB] overflow-hidden">
        <div className="p-5 text-center border-b border-[#E5E7EB]" style={{ backgroundColor: num >= 30000 ? '#F0F7F4' : '#F9FAFB' }}>
          <p className="text-xs text-[#6B7280] mb-1">
            {lang === 'ko' ? '예상 환급액' : lang === 'zh' ? '预计退税金额' : 'Estimated Refund'}
          </p>
          <p className="text-3xl font-black" style={{ color: num >= 30000 ? '#2D5A3D' : '#D1D5DB' }}>
            ₩{format(refund)}
          </p>
          {num > 0 && num < 30000 && (
            <p className="text-xs text-[#EF4444] mt-2">
              {lang === 'ko' ? '3만원 이상 구매 시 환급 가능' : lang === 'zh' ? '消费满3万韩元才可退税' : 'Min ₩30,000 required for refund'}
            </p>
          )}
        </div>

        {num >= 30000 && (
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{lang === 'ko' ? '구매 금액' : lang === 'zh' ? '购买金额' : 'Purchase'}</span>
              <span className="font-medium text-[#1A1A1A]">₩{format(num)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{lang === 'ko' ? '환급액' : lang === 'zh' ? '退税额' : 'Refund'}</span>
              <span className="font-bold text-[#2D5A3D]">₩{format(refund)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#F0F0F0] pt-2">
              <span className="text-[#6B7280]">{lang === 'ko' ? '실제 부담액' : lang === 'zh' ? '实际支付' : 'Actual cost'}</span>
              <span className="font-bold text-[#1A1A1A]">₩{format(num - refund)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{lang === 'ko' ? '할인율' : lang === 'zh' ? '折扣率' : 'Discount'}</span>
              <span className="font-bold text-[#B8860B]">-{(refund / num * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* 환급 방법 안내 */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-bold text-[#1A1A1A]">
          {lang === 'ko' ? '환급 방법' : lang === 'zh' ? '退税方式' : 'How to get refund'}
        </h3>
        {[
          { step: '1', text: { ko: 'Tax Free 가맹점에서 쇼핑', zh: '在Tax Free加盟店购物', en: 'Shop at Tax Free stores' } },
          { step: '2', text: { ko: '영수증과 Tax Free 서류 보관', zh: '保管好收据和退税单', en: 'Keep receipts & Tax Free forms' } },
          { step: '3', text: { ko: '공항 세관에서 물품 확인 (출국장 전)', zh: '在机场海关确认商品（出境前）', en: 'Customs inspection at airport (before departure)' } },
          { step: '4', text: { ko: '환급 카운터에서 현금/카드 환급', zh: '在退税柜台领取现金/退回卡', en: 'Get cash/card refund at counter' } },
        ].map(s => (
          <div key={s.step} className="flex gap-3 items-start">
            <span className="w-6 h-6 rounded-full bg-[#F0F7F4] text-[#2D5A3D] text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
            <p className="text-sm text-[#374151]">{L(lang, s.text)}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#BCBCBC] mt-6 text-center">
        {lang === 'ko' ? '* 환급액은 예상치이며 실제 금액은 다를 수 있습니다'
        : lang === 'zh' ? '* 退税金额为预估值，实际金额可能有差异'
        : '* Refund amounts are estimates and may vary'}
      </p>
    </div>
  )
}

// ── 브랜드 할인 가로 스크롤 ──
function BrandScrollSection({ lang }) {
  const brands = [
    { name: { ko: '올리브영', zh: 'Olive Young', en: 'Olive Young' }, logoUrl: 'https://www.oliveyoung.co.kr/favicon.ico', discount: { ko: '외국인 할인', zh: '外国人折扣', en: 'Foreigner discount' }, color: '#fff', url: 'https://global.oliveyoung.com' },
    { name: { ko: '무신사', zh: 'MUSINSA', en: 'MUSINSA' }, logoUrl: 'https://image.msscdn.net/favicon.ico', discount: { ko: '시즌 세일', zh: '季节促销', en: 'Season sale' }, color: '#fff', url: 'https://www.musinsa.com' },
    { name: { ko: '롯데면세점', zh: '乐天免税店', en: 'Lotte Duty Free' }, logoUrl: 'https://kor.lottedfs.com/favicon.ico', discount: { ko: '온라인 쿠폰', zh: '在线优惠券', en: 'Online coupon' }, color: '#fff', url: 'https://kor.lottedfs.com' },
    { name: { ko: '신라면세점', zh: '新罗免税店', en: 'Shilla Duty Free' }, logoUrl: 'https://www.shilladfs.com/favicon.ico', discount: { ko: '신규 가입 혜택', zh: '新注册优惠', en: 'New member deal' }, color: '#fff', url: 'https://www.shilladfs.com' },
    { name: { ko: 'Klook', zh: 'Klook', en: 'Klook' }, logoUrl: 'https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_64/v1643011905/blog/oteayx3bstsjopmxjgzy.webp', discount: { ko: '체험 할인', zh: '体验折扣', en: 'Experience deals' }, color: '#fff', url: 'https://www.klook.com/ko/' },
    { name: { ko: '에버랜드', zh: '爱宝乐园', en: 'Everland' }, logoUrl: 'https://www.everland.com/favicon.ico', discount: { ko: '온라인 예매 할인', zh: '在线购票优惠', en: 'Online booking deal' }, color: '#fff', url: 'https://www.everland.com' },
    { name: { ko: '롯데월드', zh: '乐天世界', en: 'Lotte World' }, logoUrl: 'https://www.lotteworld.com/favicon.ico', discount: { ko: '외국인 우대', zh: '外国人优惠', en: 'Foreigner special' }, color: '#fff', url: 'https://www.lotteworld.com' },
  ]

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3 px-4">
        <h2 className="text-[15px] font-semibold tracking-wide text-[#1A1A1A]">
          {L(lang, { ko: '지금 할인하는 브랜드', zh: '正在打折的品牌', en: 'Brands on Sale Now' })}
        </h2>
      </div>
      <div className="pl-4 pr-0 flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-pl-4 pb-2" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {brands.map((b, i) => (
          <a key={i} href={b.url} target="_blank" rel="noopener noreferrer"
            className="snap-start flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-[0.95] transition-transform"
            style={{ width: 80 }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden  border border-[#E5E7EB]"
              style={{ backgroundColor: b.color }}>
              {b.logoUrl ? <img src={b.logoUrl} alt="" className="w-8 h-8 object-contain" onError={e => { e.target.style.display='none'; e.target.parentElement.innerText = L(lang, b.name).charAt(0) }} /> : L(lang, b.name).charAt(0)}
            </div>
            <span className="text-[11px] font-medium text-[#1A1A1A] text-center leading-tight">{L(lang, b.name)}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#DC2626] text-white font-medium">{L(lang, b.discount)}</span>
          </a>
        ))}
        <div className="flex-shrink-0 w-4" />
      </div>
    </div>
  )
}

// ── award 뱃지 텍스트 변환 ──
function getAwardBadge(award) {
  if (award === 'michelin3') return '⭐⭐⭐'
  if (award === 'michelin2') return '⭐⭐'
  if (award === 'michelin1') return '⭐'
  return ''
}

export default function HomeTab({ lang, exchangeRate, setTab, widgetSettings = {}, adminView = false }) {
  const isVisible = (key) => widgetSettings[key] !== false
  // weather now comes from weatherData (useWeather hook)
  const { kst: koreaTime, extras: extraTimezones, refresh: refreshTimezones } = useMultiTimezone()
  const todayExpr = getTodayExpression()

  // 환율: prop에서 CNY 환율 추출
  const cnyRate = exchangeRate?.exchangeRate?.CNY || 191
  const cnyChange = exchangeRate?.rateChanges?.CNY || 0

  // 코스 데이터 (test 카테고리 제외, 첫 6개)
  const courses = RECOMMENDED_COURSES.filter(c => c.category !== 'test').slice(0, 6)

  // 가이드/포켓 오버레이 통합 상태
  // guide: 'map-guide' | 'transit' | 'arrival-card' | 'sim' | 'tax-refund' | 'duty-free' | 'halal' | 'dietary-card' | 'kids' | 'country-duty-free'
  // pocket: 'restaurant' | 'cafe' | 'transport' | 'convenience' | 'shopping' | 'accommodation' | 'emergency'
  const [overlay, setOverlay] = useState(null)
  const POCKET_IDS = ['restaurant', 'cafe', 'transport', 'convenience', 'shopping', 'accommodation', 'emergency']

  // 방금 도착했어요 웰컴 플로우
  const [showArrivalFlow, setShowArrivalFlow] = useState(false)
  const [arrivalStep, setArrivalStep] = useState('menu') // 'menu' | 'immigration' | 'transport' | 'sim-exchange'
  const [arrivalPhase, setArrivalPhase] = useState('entry') // 'entry' | 'move' | 'hotel'
  const [arrivalPopup, setArrivalPopup] = useState(false)
  const [departurePopup, setDeparturePopup] = useState(false)

  // 입국 팝업 → 1.5초 후 경로 화면
  useEffect(() => {
    if (arrivalPopup) {
      const t = setTimeout(() => {
        setArrivalPopup(false)
        setArrivalPhase('entry')
        setArrivalStep('menu')
        setShowArrivalFlow(true)
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [arrivalPopup])

  // 출국 팝업 → 1.5초 후 기존 출국 화면
  useEffect(() => {
    if (departurePopup) {
      const t = setTimeout(() => {
        setDeparturePopup(false)
        setArrivalStep('departure')
        setShowArrivalFlow(true)
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [departurePopup])

  // 시간대 선택 팝업
  const [showTzPicker, setShowTzPicker] = useState(false)
  const [tzSelection, setTzSelection] = useState(() => {
    const saved = localStorage.getItem('hanpocket_extra_timezones')
    return saved ? JSON.parse(saved) : []
  })

  // 날씨 데이터 (Open-Meteo, 30분 캐시)
  const weatherData = useWeather(tzSelection)

  // 환율 팝오버
  const [showExchangePopover, setShowExchangePopover] = useState(false)
  const exchangeRef = useRef(null)

  // 팝오버 외부 클릭 닫기
  useEffect(() => {
    if (!showExchangePopover) return
    const handler = (e) => {
      if (exchangeRef.current && !exchangeRef.current.contains(e.target)) {
        setShowExchangePopover(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [showExchangePopover])

  // 토스트 상태
  const [toast, setToast] = useState(null)
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  // 팝업스토어 지역 필터
  const [popupDistrict, setPopupDistrict] = useState('all')
  const filteredPopups = (popupDistrict === 'all' ? POPUP_STORES : POPUP_STORES.filter(p => p.district === popupDistrict)).filter(isActiveOrUpcoming)
  const [selectedPopup, setSelectedPopup] = useState(null)

  // VPN 배너 상태
  const [showVpnBanner, setShowVpnBanner] = useState(() => {
    return localStorage.getItem('hanpocket_vpn_banner_closed') !== 'true'
  })

  const closeVpnBanner = () => {
    setShowVpnBanner(false)
    localStorage.setItem('hanpocket_vpn_banner_closed', 'true')
  }

  return (
    <div
      className="pt-2 pb-24"
      style={{ backgroundColor: '#FFFFFF' }}
    >
    <div className="mx-auto w-full" style={{ maxWidth: 480 }}>
      {/* ─── 상단 정보 바 ─── */}
      <div className="mb-1 flex items-center gap-2 text-xs tracking-wider flex-wrap" style={{ color: '#999999' }}>
        {isVisible('weather') && <><span>{L(lang, { ko: '서울', zh: '首尔', en: 'Seoul' })} {weatherData.KST ? <span className="transition-opacity duration-500 opacity-100">{weatherData.KST.emoji}{weatherData.KST.temp}°{(() => {
          const clothingRec = getClothingRecommendation(weatherData.KST.temp, 0, 50, lang)
          return clothingRec.temperature ? ` ${clothingRec.temperature.icon}` : ''
        })()}</span> : <span className="inline-block w-8 h-3 bg-[#E5E7EB] rounded animate-pulse align-middle" />}</span><span>·</span></>}
        {isVisible('exchange') && <><span ref={exchangeRef} className="relative">
          {exchangeRate?.exchangeRate?.CNY ? <span
            onClick={() => setShowExchangePopover(!showExchangePopover)}
            className="cursor-pointer underline decoration-dotted transition-opacity duration-500 opacity-100"
          >¥1 = ₩{Math.round(cnyRate)} 
            {cnyChange !== 0 && (
              <span className={`ml-1 text-[10px] ${cnyChange > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {cnyChange > 0 ? '↗️' : '↘️'}{Math.abs(cnyChange)}%
              </span>
            )}
          </span> : <>¥1 = ₩<span className="inline-block w-10 h-3 bg-[#E5E7EB] rounded animate-pulse align-middle" /></>}
          {showExchangePopover && (
            <div className="absolute top-6 left-0 bg-white rounded-[6px] border border-[#E5E7EB] p-3  z-20 min-w-[160px]">
              <p className="text-[10px] text-[#999999] mb-2">{L(lang, { ko: '빠른 환산', zh: '快速换算', en: 'Quick Convert' })}</p>
              {[10000, 50000, 100000].map(won => (
                <div key={won} className="flex justify-between text-xs text-[#1A1A1A] py-1">
                  <span>₩{won.toLocaleString()}</span>
                  <span className="text-[#2D5A3D] font-medium">≈ ¥{Math.round(won / cnyRate)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs text-[#1A1A1A] py-1 border-t border-[#E5E7EB] mt-1 pt-1">
                <span>¥1,000</span>
                <span className="text-[#2D5A3D] font-medium">≈ ₩{Math.round(1000 * cnyRate).toLocaleString()}</span>
              </div>
              <p className="text-[9px] text-[#BCBCBC] mt-2 pt-1 border-t border-[#F0F0F0]">
                {exchangeRate?._date || ''} · exchangerate-api.com
              </p>
            </div>
          )}
        </span><span>·</span></>}
        {isVisible('clock') && <span>KST {koreaTime}</span>}
        {extraTimezones.map(tz => {
          const dd = getDayDiffLabel(tz.offset)
          const w = weatherData[tz.id]
          return (
            <span key={tz.id}>
              <span>·</span>
              {' '}<span style={{ color: '#3B82F6' }}>{tz.abbr} {tz.time}{w ? ` ${w.emoji}${w.temp}°` : ''}</span>
              {dd && <span className="text-[9px] text-[#F59E0B] ml-0.5">{dd}</span>}
            </span>
          )
        })}
        <button
          onClick={() => setShowTzPicker(true)}
          className="ml-0.5 inline-flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ color: '#3B82F6', width: 18, height: 18 }}
        >
          {extraTimezones.length > 0
            ? <Pencil size={11} />
            : <Plus size={13} />
          }
        </button>
      </div>

      {/* ─── Intent 카드 섹션 (풀카드 히어로형) ─── */}
      <div className="mb-2">
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#AAAAAA' }}>
          {L(lang, { ko: '무엇을 도와드릴까요', zh: '需要什么帮助', en: 'How can we help' })}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {/* 입국 */}
          <button
            onClick={() => setArrivalPopup(true)}
            className="flex flex-col items-center justify-center p-4 rounded-[12px] active:scale-[0.98] transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}
          >
            <p className="text-[15px] font-bold text-white">
              {L(lang, { ko: '입국', zh: '入境', en: 'Arrival' })}
            </p>
          </button>

          {/* 출국 */}
          <button
            onClick={() => setDeparturePopup(true)}
            className="flex flex-col items-center justify-center p-4 rounded-[12px] active:scale-[0.98] transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #14532D 0%, #1A6B3A 100%)' }}
          >
            <p className="text-[15px] font-bold text-white">
              {L(lang, { ko: '출국', zh: '出境', en: 'Departure' })}
            </p>
          </button>

          {/* 택시 */}
          <button
            onClick={() => setTab('course')}
            className="flex flex-col items-center justify-center p-4 rounded-[12px] active:scale-[0.98] transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #EA7317 0%, #F59E0B 100%)' }}
          >
            <p className="text-[15px] font-bold text-white">
              {L(lang, { ko: '택시', zh: '出租车', en: 'Taxi' })}
            </p>
          </button>

          {/* 음식배달 */}
          <button
            onClick={() => setTab('tools')}
            className="flex flex-col items-center justify-center p-4 rounded-[12px] active:scale-[0.98] transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' }}
          >
            <p className="text-[15px] font-bold text-white">
              {L(lang, { ko: '음식배달', zh: '外卖', en: 'Food Delivery' })}
            </p>
          </button>
        </div>
      </div>

      {/* ─── 2.5 세금환급 / 여행다이어리 ─── */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setOverlay('tax-refund-calc')}
          className="bg-white rounded-[6px] border border-[#E5E7EB]  p-3 active:scale-[0.97] transition-all duration-150 text-left"
        >
          <p className="text-sm font-bold leading-tight" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '세금환급', zh: '退税计算', en: 'Tax Refund' })}
          </p>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: '#999999' }}>
            {L(lang, { ko: '쇼핑 금액 → 환급액', zh: '购物金额→退税额', en: 'Amount → Refund' })}
          </p>
        </button>
        <button
          onClick={() => setTab('course')}
          className="bg-white rounded-[6px] border border-[#E5E7EB]  p-3 active:scale-[0.97] transition-all duration-150 text-left"
        >
          <p className="text-sm font-bold leading-tight" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '여행다이어리', zh: '旅行日记', en: 'Travel Diary' })}
          </p>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: '#999999' }}>
            {L(lang, { ko: '내 여행코스 만들기', zh: '创建我的路线', en: 'Create my itinerary' })}
          </p>
        </button>
      </div>

      {/* ─── 팝업스토어 큐레이션 ─── */}
      <div className="mb-8">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold tracking-wide" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '이번 주 팝업', zh: '本周快闪店', en: "This Week's Popups" })}
          </h2>
          <span className="text-[11px] font-medium" style={{ color: '#2D5A3D' }}>
            {filteredPopups.length}{L(lang, { ko: '개 운영 중', zh: '家运营中', en: ' open now' })}
          </span>
        </div>

        {/* 지역 필터 */}
        <div className="px-4 flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {DISTRICTS.map(d => (
            <button
              key={d.id}
              onClick={() => setPopupDistrict(d.id)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-colors"
              style={{
                backgroundColor: popupDistrict === d.id ? '#1A1A1A' : '#F3F4F6',
                color: popupDistrict === d.id ? '#FFFFFF' : '#666666',
              }}
            >
              {L(lang, d.label)}
            </button>
          ))}
        </div>

        {/* 팝업 카드 */}
        {filteredPopups.length === 0 ? (
          <div className="mx-4 rounded-[8px] border border-[#E5E7EB] p-6 text-center">
            <p className="text-[13px] text-[#999]">
              {L(lang, { ko: '현재 운영 중인 팝업이 없습니다', zh: '目前没有运营中的快闪店', en: 'No popups running now' })}
            </p>
          </div>
        ) : (
          <div className="pl-4 pr-0 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-pl-4" style={{ scrollbarWidth: 'none' }}>
            {filteredPopups.map(popup => {
              const dday = getDdayLabel(popup, lang)
              const closingSoon = isClosingSoon(popup)
              const districtLabel = { ko: { seongsu: '성수', hongdae: '홍대/연남', hannam: '한남/이태원', gangnam: '강남/압구정', yeouido: '더현대', myeongdong: '명동/롯데', other: '기타' }, zh: { seongsu: '圣水', hongdae: '弘大/延南', hannam: '汉南/梨泰院', gangnam: '江南/狎鸥亭', yeouido: '现代百货', myeongdong: '明洞/乐天', other: '其他' }, en: { seongsu: 'Seongsu', hongdae: 'Hongdae', hannam: 'Hannam', gangnam: 'Gangnam', yeouido: 'The Hyundai', myeongdong: 'Myeongdong', other: 'Other' } }
              return (
                <button
                  key={popup.id}
                  onClick={() => setSelectedPopup(popup)}
                  className="snap-start flex-shrink-0 rounded-[8px] overflow-hidden border border-[#E5E7EB] active:scale-[0.97] transition-all duration-150 bg-white text-left"
                >
                  <div className="relative h-[130px]">
                    <img src={popup.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={e => { e.target.style.display = 'none' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {popup.hot && (
                      <div className="absolute top-2 left-2 bg-[#FF3B30] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                        HOT
                      </div>
                    )}
                    <div
                      className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: closingSoon ? '#FF3B30' : 'rgba(0,0,0,0.5)' }}
                    >
                      {dday}
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <p className="text-white text-[10px] font-semibold tracking-wider uppercase opacity-80">{popup.brand}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-bold text-[#1A1A1A] leading-tight mb-1 line-clamp-1">
                      {L(lang, popup.title)}
                    </p>
                    <p className="text-[11px] text-[#999] mb-1.5">
                      {districtLabel[lang]?.[popup.district] || popup.district} · ~{popup.period.end.slice(5).replace('-', '/')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(popup.tags[lang] || popup.tags.ko).slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#666]">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              )
            })}
            <div className="flex-shrink-0 w-4" />
          </div>
        )}
      </div>

      {/* ─── 팝업 상세 바텀시트 ─── */}
      {selectedPopup && (() => {
        const p = selectedPopup
        const distLabel = { ko: { seongsu: '성수', hongdae: '홍대/연남', hannam: '한남/이태원', gangnam: '강남/압구정', yeouido: '더현대', myeongdong: '명동/롯데', other: '기타' }, zh: { seongsu: '圣水', hongdae: '弘大/延南', hannam: '汉南/梨泰院', gangnam: '江南/狎鸥亭', yeouido: '现代百货', myeongdong: '明洞/乐天', other: '其他' }, en: { seongsu: 'Seongsu', hongdae: 'Hongdae', hannam: 'Hannam', gangnam: 'Gangnam', yeouido: 'The Hyundai', myeongdong: 'Myeongdong', other: 'Other' } }
        return (
          <div className="fixed inset-0 z-[300] flex flex-col justify-end" onClick={() => setSelectedPopup(null)}>
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="relative bg-white rounded-t-[20px] overflow-hidden"
              style={{ maxHeight: '85vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* 이미지 헤더 */}
              <div className="relative h-[200px]">
                <img src={p.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <button
                  onClick={() => setSelectedPopup(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white text-lg leading-none"
                >×</button>
                {p.hot && (
                  <div className="absolute top-4 left-4 bg-[#FF3B30] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">HOT</div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white/70 text-[11px] font-semibold tracking-widest uppercase mb-1">{p.brand}</p>
                  <p className="text-white text-[18px] font-bold leading-tight">{L(lang, p.title)}</p>
                </div>
              </div>

              {/* 본문 */}
              <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 200px)' }}>
                {/* D-day 배지 + 기간 */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: isClosingSoon(p) ? '#FF3B30' : '#1A1A1A' }}
                  >
                    {getDdayLabel(p, lang)}
                  </span>
                  <span className="text-[13px] text-[#666]">
                    {p.period.start.slice(5).replace('-', '/')} ~ {p.period.end.slice(5).replace('-', '/')}
                  </span>
                </div>

                {/* 위치 */}
                <div className="mb-4">
                  <p className="text-[11px] text-[#999] mb-1">{L(lang, { ko: '위치', zh: '地点', en: 'Location' })}</p>
                  <p className="text-[14px] font-medium text-[#1A1A1A]">
                    {distLabel[lang]?.[p.district] || p.district}
                  </p>
                  <p className="text-[13px] text-[#666] mt-0.5">
                    {typeof p.address === 'object' ? L(lang, p.address) : p.address}
                  </p>
                </div>

                {/* 태그 */}
                {p.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {(p.tags[lang] || p.tags.ko || []).map((tag, i) => (
                      <span key={i} className="text-[12px] px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#444]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 지도 버튼 */}
                <div className="flex gap-2">
                  {p.kakaoMapUrl && (
                    <button
                      onClick={() => window.open(p.kakaoMapUrl, '_blank')}
                      className="flex-1 py-3 rounded-[8px] font-bold text-[14px] text-[#1A1A1A] active:scale-[0.97] transition-transform"
                      style={{ backgroundColor: '#FEE500' }}
                    >
                      {L(lang, { ko: '카카오맵으로 보기', zh: '用카카오地图查看', en: 'Open in KakaoMap' })}
                    </button>
                  )}
                  {p.naverMapUrl && (
                    <button
                      onClick={() => window.open(p.naverMapUrl, '_blank')}
                      className="flex-1 py-3 rounded-[8px] font-bold text-[14px] text-white active:scale-[0.97] transition-transform"
                      style={{ backgroundColor: '#03C75A' }}
                    >
                      {L(lang, { ko: '네이버지도', zh: 'Naver地图', en: 'NaverMap' })}
                    </button>
                  )}
                  {!p.kakaoMapUrl && !p.naverMapUrl && (
                    <button
                      onClick={() => {
                        const q = typeof p.address === 'object' ? (p.address.ko || p.address.zh) : p.address
                        window.open(`kakaomap://search?q=${encodeURIComponent(q || L(lang, p.title))}`, '_blank')
                      }}
                      className="flex-1 py-3 rounded-[8px] font-bold text-[14px] text-[#1A1A1A] active:scale-[0.97] transition-transform"
                      style={{ backgroundColor: '#FEE500' }}
                    >
                      {L(lang, { ko: '지도에서 찾기', zh: '在地图中查找', en: 'Find on Map' })}
                    </button>
                  )}
                </div>

                {/* 출처 링크 */}
                {p.sourceUrl && (
                  <button
                    onClick={() => window.open(p.sourceUrl, '_blank')}
                    className="mt-3 w-full py-2.5 rounded-[8px] text-[13px] text-[#666] border border-[#E5E7EB] active:scale-[0.97] transition-transform"
                  >
                    {L(lang, { ko: '원본 보기', zh: '查看原文', en: 'View Source' })}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ─── 가이드 오버레이 ─── */}
      {overlay && !POCKET_IDS.includes(overlay) && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-white flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" /></div>}>
          {overlay === 'map-guide' && (
            <GuideLayout title={{ ko: '한국 지도 앱', zh: '韩国地图APP', en: 'Korea Map Apps' }} lang={lang} onClose={() => { setOverlay(null); setShowArrivalFlow(true); setArrivalStep('menu') }}>
              <div className="p-4 rounded-[6px] border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">📍 KakaoMap ({L(lang, { ko: '카카오맵', zh: '카카오地图', en: 'KakaoMap' })})</h3>
                <p className="text-sm text-[#666666] leading-relaxed mb-3">
                  {L(lang, { ko: '한국에서 가장 많이 쓰는 지도 앱. 길찾기, 대중교통, 맛집, 카페 검색까지 모두 가능합니다. 반드시 설치하세요!', zh: '韩国使用最多的地图APP。找路、公交、美食、咖啡厅搜索全都可以。必须安装！', en: 'The most used map app in Korea. Navigation, transit, restaurants, cafes — all in one. Must install!' })}
                </p>
                <div className="flex gap-2">
                  <a href="https://apps.apple.com/app/id304608425" target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 rounded-[6px] bg-[#FEE500] text-[#1A1A1A] text-sm font-bold active:scale-95 transition-transform">
                    App Store
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=net.daum.android.map" target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 rounded-[6px] bg-[#FEE500] text-[#1A1A1A] text-sm font-bold active:scale-95 transition-transform">
                    Google Play
                  </a>
                </div>
              </div>
              <div className="p-4 rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">🗺️ {L(lang, { ko: '바이두 지도도 사용 가능!', zh: '百度地图也可以用！', en: 'Baidu Maps also works!' })}</h3>
                <p className="text-sm text-[#666666] leading-relaxed mb-3">
                  {L(lang, { ko: '바이두 지도(百度地图)도 한국에서 사용 가능합니다. 중국어로 검색할 수 있어 편리합니다.', zh: '百度地图也可以在韩国使用。可以用中文搜索，很方便。', en: 'Baidu Maps also works in Korea. Convenient for searching in Chinese.' })}
                </p>
                <a href="https://map.baidu.com" target="_blank" rel="noopener noreferrer" className="block text-center py-2.5 rounded-[6px] bg-[#3385FF] text-white text-sm font-bold active:scale-95 transition-transform">
                  {L(lang, { ko: '바이두 지도 열기', zh: '打开百度地图', en: 'Open Baidu Maps' })}
                </a>
              </div>
            </GuideLayout>
          )}
          {overlay === 'transit' && (
            <GuideLayout
              title={{ ko: '교통카드 & 표 구매', zh: '交通卡 & 购票指南', en: 'Transit Card & Tickets' }}
              lang={lang}
              onClose={() => { setOverlay(null); setShowArrivalFlow(true); setArrivalStep('traveling') }}
              tip={{ ko: '💡 T-money 잔액은 편의점에서 환불 가능 (카드 반납 시 잔액 - 수수료 500원)', zh: '💡 T-money余额可在便利店退款（退卡时退余额 - 手续费500韩元）', en: '💡 T-money balance is refundable at convenience stores (balance minus ₩500 fee)' }}
            >
              <div className="p-4 rounded-[6px] bg-red-50 border border-red-200">
                <p className="text-sm font-bold text-red-700 leading-relaxed">
                  {L(lang, { ko: '⚠️ 한국 버스 대부분은 현금을 받지 않습니다. 교통카드 없이는 버스를 탈 수 없어요! 반드시 교통카드를 먼저 구매하세요.', zh: '⚠️ 韩国大部分公交不收现金！没有交通卡无法乘坐公交！请务必先购买交通卡。', en: "⚠️ Most Korean buses don't accept cash. You can't ride without a transit card! Buy one first." })}
                </p>
              </div>
              <div className="p-4 rounded-[6px] border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">🎫 T-money / Cash Bee</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {L(lang, { ko: '편의점(CU, GS25, 세븐일레븐)에서 2,500원에 구매. 충전 후 버스·지하철·택시 모두 사용 가능.', zh: '在便利店(CU、GS25、7-11)花2500韩元购买T-money卡，充值后公交、地铁、出租车都能用。', en: 'Buy at convenience stores (CU, GS25, 7-Eleven) for ₩2,500. After charging, use on buses, subway, and taxis.' })}
                </p>
              </div>
              <div className="p-4 rounded-[6px] border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">🚇 {L(lang, { ko: '지하철 1회권', zh: '地铁单程票', en: 'Single Journey Ticket' })}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {L(lang, { ko: '지하철역 자동발매기에서 구매. 보증금 500원 포함. 하차 후 보증금 환불기에서 500원 돌려받기.', zh: '在地铁站自动售票机购买一次性交通卡。含500韩元押金，下车后在退款机取回。', en: 'Buy at subway station ticket machines. Includes ₩500 deposit. Get the deposit back at refund machines after exiting.' })}
                </p>
              </div>
              <div className="p-4 rounded-[6px] border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">🚌 {L(lang, { ko: '버스 이용법', zh: '乘公交方法', en: 'How to Ride Buses' })}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {L(lang, { ko: '앞문 탑승 → T-money 태그 → 하차 시 뒷문에서 태그.', zh: '前门上车→刷T-money→下车时后门再刷。', en: 'Board at front door → tap T-money → tap again at rear door when exiting.' })}
                </p>
              </div>
              <div className="p-4 rounded-[6px] border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">🔄 {L(lang, { ko: '환승 꿀팁', zh: '换乘小贴士', en: 'Transfer Tips' })}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {L(lang, {
                    ko: '버스/지하철 하차 후 30분 이내에 다른 노선 이용 시 환승 적용!\n→ 두 번째 교통수단의 기본요금이 무료\n→ 단, 거리 추가금은 발생할 수 있음',
                    zh: '下车后30分钟内换乘其他线路，换乘免费！\n→ 第二次乘车的基本费用免费\n→ 但可能产生距离附加费',
                    en: 'Transfer within 30 min after getting off for free transfer!\n→ Base fare of second ride is free\n→ Distance surcharge may still apply'
                  }).split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </p>
              </div>
              <div className="p-4 rounded-[6px] border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">💳 {L(lang, { ko: '교통카드 충전', zh: '交通卡充值', en: 'Transit Card Top-up' })}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {L(lang, { ko: '편의점 또는 지하철역 충전기에서 가능. 1,000원 단위로 충전할 수 있습니다.', zh: '在便利店或地铁站充值机充值。可以按1000韩元为单位充值。', en: 'Available at convenience stores or subway station machines. Can top up in ₩1,000 increments.' })}
                </p>
              </div>
            </GuideLayout>
          )}
          {overlay === 'arrival-card' && <ArrivalCardGuide lang={lang} onClose={() => { setOverlay(null); setShowArrivalFlow(true); setArrivalStep('menu') }} />}
          {overlay === 'sim' && <SimGuide lang={lang} onClose={() => { setOverlay(null); setShowArrivalFlow(true); setArrivalStep('menu') }} />}
          {overlay === 'tax-refund' && <TaxRefundGuide lang={lang} onClose={() => { setOverlay(null); setShowArrivalFlow(true); setArrivalStep('departure') }} />}
          {overlay === 'duty-free' && <DutyFreeGuide lang={lang} onClose={() => { setOverlay(null); setShowArrivalFlow(true); setArrivalStep('traveling') }} />}
          {/* halal guide removed */}
          {overlay === 'dietary-card' && <DietaryCardGuide lang={lang} onClose={() => { setOverlay(null); setShowArrivalFlow(true); setArrivalStep('menu') }} />}
          {overlay === 'kids' && <KidsGuide lang={lang} onClose={() => { setOverlay(null); setShowArrivalFlow(true); setArrivalStep('menu') }} />}
          {overlay === 'pet' && (
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-3">
                <button onClick={() => { setOverlay(null); setShowArrivalFlow(true); setArrivalStep('menu') }} className="p-1"><ChevronLeft size={20} color="#1A1A1A" /></button>
                <h2 className="text-[15px] font-semibold text-[#1A1A1A]">{L(lang, { ko: '펫 입국가이드', zh: '宠物入境指南', en: 'Pet Entry Guide' })}</h2>
              </div>
              <PetTab lang={lang} setTab={() => {}} />
            </div>
          )}
          {overlay === 'country-duty-free' && <DutyFreeLimitGuide lang={lang} onClose={() => { setOverlay(null); setShowArrivalFlow(true); setArrivalStep('departure') }} />}
        </Suspense>
      )}

      {/* ─── 통역&번역 허브 오버레이 — TranslatorTab 임베드 ─── */}
      {overlay === 'interpret-hub' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setOverlay(null)} className="p-1">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-lg font-bold text-[#1A1A1A]">
                {L(lang, { ko: '통역&번역', zh: '口译&翻译', en: 'Interpret & Translate' })}
              </h1>
            </div>
          </div>
          <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" /></div>}>
            <div className="max-w-[480px] mx-auto px-4 py-4">
              <TranslatorTab lang={lang} />
            </div>
          </Suspense>
        </div>
      )}

      {/* ─── 세금환급 계산기 오버레이 ─── */}
      {overlay === 'tax-refund-calc' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setOverlay(null)} className="p-1">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-lg font-bold text-[#1A1A1A]">
                {L(lang, { ko: '세금환급 계산기', zh: '退税计算器', en: 'Tax Refund Calculator' })}
              </h1>
            </div>
          </div>
          <TaxRefundCalculator lang={lang} />
        </div>
      )}

      {/* ─── 상황별 한국어 포켓 오버레이 ─── */}
      {overlay && POCKET_IDS.includes(overlay) && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-white flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" /></div>}>
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setOverlay(null)} className="p-1">
                  <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-[#1A1A1A]">
                  {L(lang, SCENE_PHRASES.find(s => s.pocket === overlay)?.scene || { ko: '', zh: '', en: '' })}
                </h1>
              </div>
            </div>
            <PocketContent pocketId={overlay} lang={lang} setTab={setTab} />
          </div>
        </Suspense>
      )}

      {/* ─── 시간대 선택 팝업 ─── */}
      {showTzPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowTzPicker(false)}>
          <div
            className="rounded-[6px] mx-6 w-full max-w-sm overflow-hidden"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
                {L(lang, { ko: '시간대 추가', zh: '添加时区', en: 'Add Timezone' })}
              </h3>
              <button
                onClick={() => { setTzSelection([]); }}
                className="text-xs"
                style={{ color: '#999999' }}
              >
                {L(lang, { ko: '전체 해제', zh: '全部取消', en: 'Clear all' })}
              </button>
            </div>
            <div className="px-3 pb-2 max-h-80 overflow-y-auto">
              {TIMEZONE_OPTIONS.map(tz => {
                const checked = tzSelection.includes(tz.id)
                const currentTime = getTimeForOffset(tz.offset)
                return (
                  <button
                    key={tz.id}
                    onClick={() => {
                      setTzSelection(prev =>
                        prev.includes(tz.id)
                          ? prev.filter(id => id !== tz.id)
                          : [...prev, tz.id]
                      )
                    }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-[6px] active:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#9CA3AF] w-5">{tz.code}</span>
                      <span className="text-sm text-[#1A1A1A]">{L(lang, tz.name)}</span>
                      <span className="text-xs text-[#999]">{tz.abbr} {currentTime}</span>
                      {(() => { const dd = getDayDiffLabel(tz.offset); return dd ? <span className="text-[10px] text-[#F59E0B] font-medium">{dd}</span> : null })()}
                    </div>
                    <div
                      className="w-5 h-5 rounded-[6px] flex items-center justify-center"
                      style={{
                        border: checked ? 'none' : '1.5px solid #D1D5DB',
                        backgroundColor: checked ? '#3B82F6' : 'transparent',
                      }}
                    >
                      {checked && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="px-5 pb-4 pt-2">
              <button
                onClick={() => {
                  localStorage.setItem('hanpocket_extra_timezones', JSON.stringify(tzSelection))
                  refreshTimezones()
                  setShowTzPicker(false)
                }}
                className="w-full py-2.5 rounded-[6px] text-sm font-medium text-white active:scale-[0.98] transition-transform"
                style={{ backgroundColor: '#3B82F6' }}
              >
                {L(lang, { ko: '확인', zh: '确认', en: 'Confirm' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 입국/출국 환영/이별 팝업 ─── */}
      {arrivalPopup && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-fade-in">
          <p className="text-lg font-bold text-[#1A1A1A] mb-6 text-center px-8" style={{ whiteSpace: 'pre-line' }}>
            {L(lang, { ko: '반가워요.\n한국 혹시 처음이신가요?', zh: '欢迎！\n这是您第一次来韩国吗？', en: 'Welcome!\nIs this your first time in Korea?' })}
          </p>
          <PocketGirlBow />
        </div>
      )}
      {departurePopup && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-fade-in">
          <p className="text-lg font-bold text-[#1A1A1A] mb-6 text-center px-8" style={{ whiteSpace: 'pre-line' }}>
            {L(lang, { ko: '벌써 돌아가세요?\n아쉽지만 다음을 기약해요!', zh: '这么快就要走了？\n虽然不舍，但下次再见！', en: 'Leaving already?\nSee you next time!' })}
          </p>
          <PocketGirlCry />
        </div>
      )}

      {/* ─── 입국하기 플로우 (3단계 경로바) ─── */}
      {showArrivalFlow && arrivalStep === 'menu' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 flex items-center px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => setShowArrivalFlow(false)} className="p-1"><ChevronLeft size={22} color="#1A1A1A" /></button>
            <h2 className="flex-1 text-center text-sm font-bold text-[#1A1A1A] pr-7">
              {L(lang, { ko: '입국하기', zh: '入境', en: 'Arrival' })}
            </h2>
          </div>

          {/* 경로바 — 3단계 + 포켓걸 */}
          <div className="px-6 pt-5 pb-2">
            <div className="relative flex items-center justify-between">
              {/* 연결선 */}
              <div className="absolute top-3 left-[16%] right-[16%] h-[2px] bg-[#E5E7EB]" />
              <div className="absolute top-3 left-[16%] h-[2px] bg-[#1A1A1A] transition-all duration-300" style={{
                width: arrivalPhase === 'entry' ? '0%' : arrivalPhase === 'move' ? '34%' : '68%'
              }} />
              {ARRIVAL_PHASES.map((p, i) => (
                <button key={p.id} onClick={() => setArrivalPhase(p.id)} className="relative flex flex-col items-center z-10" style={{ width: '33%' }}>
                  {arrivalPhase === p.id && (
                    <div className="absolute -top-8">
                      <PocketGirlMini size={18} />
                    </div>
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    arrivalPhase === p.id ? 'bg-[#1A1A1A] text-white' : 'bg-[#E5E7EB] text-[#999]'
                  }`}>{i + 1}</div>
                  <span className={`text-[10px] mt-1.5 text-center leading-tight ${
                    arrivalPhase === p.id ? 'text-[#1A1A1A] font-bold' : 'text-[#999]'
                  }`}>{L(lang, p.label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 단계별 기능 목록 */}
          <div className="p-4 flex flex-col gap-3">
            {arrivalPhase === 'entry' && [
              { id: 'immigration-wait', label: { ko: '입국심사 대기시간 조회', zh: '入境审查等候时间查询', en: 'Immigration Wait Time' }, sub: { ko: '인천공항 T1/T2 실시간', zh: '仁川机场T1/T2实时', en: 'Incheon T1/T2 real-time' }, highlight: true },
              { id: 'immigration', label: { ko: '입국신고서 작성하는 법', zh: '入境申报卡填写方法', en: 'How to Fill Arrival Card' }, sub: { ko: '전자(Q-CODE) / 실물 카드', zh: '电子(Q-CODE) / 纸质卡', en: 'Q-CODE / Physical card' } },
              { id: 'sim-exchange', label: { ko: 'SIM카드 구매 & 환전', zh: '买SIM卡 & 换钱', en: 'Buy SIM & Exchange' }, sub: { ko: 'eSIM, 공항 환전, 명동 환전소', zh: 'eSIM、机场换钱、明洞换钱所', en: 'eSIM, airport, Myeongdong' } },
              { id: 'nav-pet', label: { ko: '펫(반려동물) 입국 가이드', zh: '宠物入境指南', en: 'Pet Entry Guide' }, sub: { ko: '반려동물과 함께 한국으로', zh: '带宠物一起来韩国', en: 'Bring your pet to Korea' }, guide: 'pet' },
              { id: 'airport-facilities', label: { ko: '공항 시설 정보', zh: '机场设施信息', en: 'Airport Facilities' }, sub: { ko: '수유실, 휠체어, 라운지, 편의시설', zh: '母婴室、轮椅、休息室、便利设施', en: 'Nursing room, wheelchair, lounge' } },
              { id: 'dietary-card-guide', label: { ko: '내가 못먹는 음식 등록', zh: '登记不能吃的食物', en: 'Register Dietary Restrictions' }, sub: { ko: '식당에서 한국어로 보여주기', zh: '在餐厅展示韩语卡片', en: 'Show Korean card at restaurants' }, guide: 'dietary-card' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.guide) { setOverlay(item.guide); setShowArrivalFlow(false) }
                  else { setArrivalStep(item.id) }
                }}
                className={`rounded-[6px] p-4 text-left active:scale-[0.98] transition-transform flex items-center gap-3 ${
                  item.highlight ? 'border-2 border-blue-500 bg-blue-50' : 'border border-[#E5E7EB]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${item.highlight ? 'text-blue-700' : 'text-[#1A1A1A]'}`}>{L(lang, item.label)}</p>
                  <p className={`text-xs mt-0.5 ${item.highlight ? 'text-blue-500' : 'text-[#666]'}`}>{L(lang, item.sub)}</p>
                </div>
                <ChevronRight size={18} color={item.highlight ? '#3B82F6' : '#999'} />
              </button>
            ))}

            {arrivalPhase === 'move' && [
              { id: 'transport-bus', label: { ko: '버스 타는 법', zh: '坐公交车', en: 'How to Ride Bus' }, sub: { ko: 'T-money 충전, 찍기, 환승', zh: 'T-money充值、刷卡、换乘', en: 'T-money, tap, transfer' } },
              { id: 'transport-subway', label: { ko: '지하철 타는 법', zh: '坐地铁', en: 'How to Ride Subway' }, sub: { ko: '1회용 표, T-money, 갈아타기', zh: '单程票、T-money、换乘', en: 'Single ticket, T-money, transfer' } },
              { id: 'transport-arex', label: { ko: 'AREX(공항철도) 타는 법', zh: '坐AREX机场铁路', en: 'How to Ride AREX' }, sub: { ko: '인천공항 ↔ 서울역 직통/일반', zh: '仁川机场↔首尔站 直达/普通', en: 'Incheon ↔ Seoul Station' } },
              { id: 'transport-taxi', label: { ko: '택시 타는 법', zh: '坐出租车', en: 'How to Ride Taxi' }, sub: { ko: 'RIDE앱, 짐 크기 확인, 한국어 카드', zh: 'RIDE APP、行李确认、韩语卡片', en: 'RIDE app, luggage check, Korean card' } },
              { id: 'transport-navi', label: { ko: '길찾기', zh: '导航', en: 'Navigation' }, sub: { ko: '공항에서 숙소까지 경로 검색', zh: '从机场到住宿的路线搜索', en: 'Route from airport to hotel' } },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setArrivalStep(item.id)}
                className="rounded-[6px] border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, item.label)}</p>
                  <p className="text-xs text-[#666] mt-0.5">{L(lang, item.sub)}</p>
                </div>
                <ChevronRight size={18} color="#999" />
              </button>
            ))}

            {arrivalPhase === 'hotel' && [
              { id: 'hotel-checkin', label: { ko: '체크인 한국어 카드', zh: '入住韩语卡片', en: 'Check-in Korean Card' }, sub: { ko: '체크인, 짐 맡기기, 번역기', zh: '办入住、寄存行李、翻译', en: 'Check-in, luggage storage, translator' } },
              { id: 'hotel-nearby', label: { ko: '숙소 주변 살펴보기', zh: '查看住宿周边', en: 'Explore Nearby' }, sub: { ko: '편의점, 생활시설 확인', zh: '便利店、生活设施确认', en: 'Convenience store, amenities' } },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setArrivalStep(item.id)}
                className="rounded-[6px] border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, item.label)}</p>
                  <p className="text-xs text-[#666] mt-0.5">{L(lang, item.sub)}</p>
                </div>
                <ChevronRight size={18} color="#999" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입국심사 대기시간 상세 */}
      {showArrivalFlow && arrivalStep === 'immigration-wait' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 flex items-center px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => setArrivalStep('menu')} className="p-1"><ChevronLeft size={22} color="#1A1A1A" /></button>
            <h2 className="flex-1 text-center text-sm font-bold text-[#1A1A1A] pr-7">
              {L(lang, { ko: '입국심사 대기시간', zh: '入境审查等候时间', en: 'Immigration Wait Time' })}
            </h2>
          </div>
          <div className="p-4">
            <Suspense fallback={<div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-gray-200 rounded-full border-t-[#111827] animate-spin" /></div>}>
              <ImmigrationWaitTime lang={lang} />
            </Suspense>
          </div>
        </div>
      )}

      {/* 입국신고 상세 */}
      {/* 입국신고서 — 선택 화면 */}
      {showArrivalFlow && arrivalStep === 'immigration' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 flex items-center px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => setArrivalStep('menu')} className="p-1"><ChevronLeft size={22} color="#1A1A1A" /></button>
            <h2 className="flex-1 text-center text-sm font-bold text-[#1A1A1A] pr-7">
              {L(lang, { ko: '입국신고서 작성', zh: '入境申报卡填写', en: 'Arrival Card' })}
            </h2>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <button
              onClick={() => setArrivalStep('immigration-electronic')}
              className="rounded-[6px] border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '전자 입국신고서 (Q-CODE)', zh: '电子入境卡 (Q-CODE)', en: 'Electronic Arrival Card (Q-CODE)' })}</p>
                <p className="text-xs text-[#666666] mt-0.5">{L(lang, { ko: '온라인으로 미리 작성, 실물 카드 불필요', zh: '在线提前填写，无需纸质卡', en: 'Fill online in advance, no physical card needed' })}</p>
              </div>
              <ChevronRight size={18} color="#999" />
            </button>
            <button
              onClick={() => { setOverlay('arrival-card'); setShowArrivalFlow(false) }}
              className="rounded-[6px] border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '실물 입국카드 작성법', zh: '纸质入境卡填写方法', en: 'Physical Arrival Card Guide' })}</p>
                <p className="text-xs text-[#666666] mt-0.5">{L(lang, { ko: '비행기 안에서 받는 종이 카드 작성 가이드', zh: '飞机上发的纸质卡填写指南', en: 'Guide to filling the paper card from the plane' })}</p>
              </div>
              <ChevronRight size={18} color="#999" />
            </button>
          </div>
        </div>
      )}

      {/* 전자 입국신고서 상세 */}
      {showArrivalFlow && arrivalStep === 'immigration-electronic' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 flex items-center px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => setArrivalStep('immigration')} className="p-1"><ChevronLeft size={22} color="#1A1A1A" /></button>
            <h2 className="flex-1 text-center text-sm font-bold text-[#1A1A1A] pr-7">
              {L(lang, { ko: '전자 입국신고서', zh: '电子入境卡', en: 'Electronic Arrival Card' })}
            </h2>
          </div>
          <div className="p-4">
            <div className="rounded-[6px] bg-[#F0F4FF] p-5">
              <p className="text-[15px] font-bold text-[#1A1A1A] mb-2">{L(lang, { ko: '전자입국신고서 (Q-CODE)', zh: '电子入境卡 (Q-CODE)', en: 'Electronic Arrival Card (Q-CODE)' })}</p>
              <p className="text-xs text-[#666666] leading-relaxed mb-4">
                {L(lang, { ko: '한국 입국 전 온라인으로 미리 작성할 수 있습니다.\n건강상태, 세관신고를 한번에!\n실물 카드를 안 써도 됩니다.', zh: '入韩前可在线提前填写。\n健康状态、海关申报一次搞定！\n不需要纸质卡。', en: 'Fill out online before entering Korea.\nHealth & customs declaration in one go!\nNo physical card needed.' })}
              </p>
              <div className="flex gap-2">
                <a
                  href="https://ciq.korea.go.kr/coview/board/homeland/linkView.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-[6px] text-center text-sm font-bold text-white bg-[#3B5BDB] active:scale-[0.97] transition-transform"
                >
                  {L(lang, { ko: 'Q-CODE 바로가기', zh: 'Q-CODE 前往', en: 'Go to Q-CODE' })}
                </a>
                <a
                  href="https://www.k-eta.go.kr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-[6px] text-center text-sm font-bold text-[#1A1A1A] bg-white border border-[#E5E7EB] active:scale-[0.97] transition-transform"
                >
                  {L(lang, { ko: 'K-ETA (비자면제국)', zh: 'K-ETA（免签国）', en: 'K-ETA (Visa-free)' })}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 택시/대중교통 상세 */}
      {showArrivalFlow && arrivalStep === 'transport' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in">
          <div className="sticky top-0 bg-white z-10 flex items-center px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => setArrivalStep('menu')} className="p-1"><ChevronLeft size={22} color="#1A1A1A" /></button>
            <h2 className="flex-1 text-center text-sm font-bold text-[#1A1A1A] pr-7">
              {L(lang, { ko: '🚕 택시 / 대중교통', zh: '🚕 出租车 / 公共交通', en: '🚕 Taxi / Transit' })}
            </h2>
          </div>
          <div className="p-4 flex flex-col gap-4">
            {/* 택시 섹션 */}
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-2">{L(lang, { ko: '🚕 택시 탈래요', zh: '🚕 坐出租车', en: '🚕 Take a Taxi' })}</h3>
              <div className="flex flex-col gap-3">
                <div className="rounded-[6px] border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '공항에서 택시 바로 잡기', zh: '机场直接打车', en: 'Get a taxi at the airport' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, {
                      ko: '인천공항: 1층 도착 후 8번/4번 게이트 → 택시 승강장. 일반택시 ₩65,000~80,000 (서울 기준).\n김포공항: 1층 출구 → 택시 승강장. 일반택시 ₩20,000~35,000 (서울 기준).\n카드 결제 가능, 기본요금 ₩4,800.',
                      zh: '仁川机场：1层到达后8号/4号门 → 出租车站。普通出租车 ₩65,000~80,000（首尔方向）。\n金浦机场：1层出口 → 出租车站。普通出租车 ₩20,000~35,000（首尔方向）。\n可刷卡，起步价 ₩4,800。',
                      en: 'Incheon Airport: After arrival at 1F, Gate 8/4 → taxi stand. Regular taxi ₩65,000~80,000 (to Seoul).\nGimpo Airport: 1F exit → taxi stand. Regular taxi ₩20,000~35,000 (to Seoul).\nCard payment accepted, base fare ₩4,800.'
                    })}
                  </p>
                </div>
                <div className="rounded-[6px] border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: 'RIDE 앱 사용하기', zh: '使用RIDE APP', en: 'Use RIDE App' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, { ko: '한국 번호 없어도 돼요! I·RIDE 앱으로 외국인도 택시 호출 가능.', zh: '不需要韩国手机号！用I·RIDE APP外国人也能叫车。', en: 'No Korean number needed! Foreigners can call taxis with the I·RIDE app.' })}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <a href="https://apps.apple.com/app/id1596453498" target="_blank" rel="noopener noreferrer" className="rounded-[6px] bg-[#2D5A3D] text-white text-sm font-medium py-2.5 px-4 text-center flex-1">iOS</a>
                    <a href="https://play.google.com/store/apps/details?id=com.iride.passenger" target="_blank" rel="noopener noreferrer" className="rounded-[6px] bg-[#2D5A3D] text-white text-sm font-medium py-2.5 px-4 text-center flex-1">Android</a>
                  </div>
                </div>
              </div>
            </div>

            {/* 대중교통 섹션 */}
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-2">{L(lang, { ko: '🚇 대중교통 이용할래요', zh: '🚇 坐公共交通', en: '🚇 Public Transit' })}</h3>
              <div className="flex flex-col gap-3">
                <div className="rounded-[6px] border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: 'AREX (공항철도)', zh: 'AREX（机场铁路）', en: 'AREX (Airport Railroad)' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, {
                      ko: '인천공항 → 서울역 직통 43분 ₩11,000 / 일반열차 66분 ₩4,750.\n지하 교통센터(B1)에서 탑승.',
                      zh: '仁川机场 → 首尔站 直达43分钟 ₩11,000 / 普通列车66分钟 ₩4,750。\n地下交通中心(B1)乘车。',
                      en: 'Incheon Airport → Seoul Station: Express 43min ₩11,000 / Regular 66min ₩4,750.\nBoard at underground Transit Center (B1).'
                    })}
                  </p>
                </div>
                <div className="rounded-[6px] border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '일회용 교통카드 구매', zh: '购买一次性交通卡', en: 'Single-use Transit Card' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, {
                      ko: '지하철역 자동발매기에서 구매. 보증금 ₩500 포함, 하차 후 환불기에서 돌려받기.',
                      zh: '地铁站自动售票机购买。含₩500押金，下车后在退款机退还。',
                      en: 'Buy at subway station vending machines. Includes ₩500 deposit, refundable at return machines after use.'
                    })}
                  </p>
                </div>
                <div className="rounded-[6px] border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: 'T-money 카드 구매', zh: '购买T-money卡', en: 'Buy T-money Card' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, {
                      ko: '편의점(CU, GS25, 세븐일레븐)에서 ₩2,500에 구매. 충전 후 버스·지하철·택시 모두 사용.',
                      zh: '便利店（CU、GS25、7-11）₩2,500购买。充值后公交·地铁·出租车都能用。',
                      en: 'Buy at convenience stores (CU, GS25, 7-Eleven) for ₩2,500. After charging, use on buses, subway, and taxis.'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIM & 환전 상세 */}
      {showArrivalFlow && arrivalStep === 'sim-exchange' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in">
          <div className="sticky top-0 bg-white z-10 flex items-center px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => setArrivalStep('menu')} className="p-1"><ChevronLeft size={22} color="#1A1A1A" /></button>
            <h2 className="flex-1 text-center text-sm font-bold text-[#1A1A1A] pr-7">
              {L(lang, { ko: '💱 SIM카드 & 환전', zh: '💱 SIM卡 & 换钱', en: '💱 SIM & Exchange' })}
            </h2>
          </div>
          <div className="p-4 flex flex-col gap-4">
            {/* SIM 섹션 */}
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-2">{L(lang, { ko: '📱 한국 SIM카드 구매', zh: '📱 购买韩国SIM卡', en: '📱 Buy a Korean SIM' })}</h3>
              <div className="flex flex-col gap-3">
                <div className="rounded-[6px] border border-[#E5E7EB] p-4">
                  <p className="text-xs text-[#666666] leading-relaxed">
                    {L(lang, {
                      ko: '인천공항 1층에 KT, SKT, LG U+ 로밍센터. eSIM이면 온라인으로도 구매 가능 (Airalo, eSIM Korea 등)',
                      zh: '仁川机场1层有KT、SKT、LG U+漫游中心。eSIM可在线购买（Airalo、eSIM Korea等）',
                      en: 'KT, SKT, LG U+ roaming centers at Incheon Airport 1F. eSIM available online (Airalo, eSIM Korea, etc.)'
                    })}
                  </p>
                  <button
                    onClick={() => { setOverlay('sim'); setShowArrivalFlow(false) }}
                    className="mt-3 rounded-[6px] bg-[#2D5A3D] text-white text-sm font-medium py-2.5 px-4 w-full text-center active:scale-[0.98] transition-transform"
                  >
                    {L(lang, { ko: '자세히 보기', zh: '查看详情', en: 'View Details' })}
                  </button>
                </div>
              </div>
            </div>

            {/* 환전 섹션 */}
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-2">{L(lang, { ko: '💱 환전할래요', zh: '💱 换钱', en: '💱 Exchange Money' })}</h3>
              <div className="flex flex-col gap-3">
                <div className="rounded-[6px] border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '공항 환전소', zh: '机场换钱所', en: 'Airport Exchange' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, {
                      ko: '인천공항 도착층(1층) 곳곳에 환전소 (우리은행, 하나은행, KB국민은행). 소액만 환전 추천 (수수료 높음).',
                      zh: '仁川机场到达层（1层）各处有换钱所（友利银行、韩亚银行、KB国民银行）。建议少量兑换（手续费高）。',
                      en: 'Exchange counters throughout Incheon Airport arrivals (1F) — Woori, Hana, KB Bank. Exchange small amounts only (high fees).'
                    })}
                  </p>
                </div>
                <div className="rounded-[6px] border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '도심 환전소 (더 저렴!)', zh: '市区换钱所（更划算！）', en: 'Downtown Exchange (Cheaper!)' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, {
                      ko: '명동 사설환전소(대사관 앞), MONEYBOX(명동/홍대) 추천. 공항 대비 1~3% 유리.\n위치: MONEYBOX 명동점 — 서울특별시 중구 명동2가 (카카오맵에서 "MONEYBOX 명동" 검색)',
                      zh: '推荐明洞私人换钱所（大使馆前）、MONEYBOX（明洞/弘大）。比机场优惠1~3%。\n位置：MONEYBOX明洞店 — 首尔市中区明洞2街（在KakaoMap搜索"MONEYBOX 명동"）',
                      en: 'Myeongdong private exchanges (near embassy), MONEYBOX (Myeongdong/Hongdae) recommended. 1~3% better than airport.\nLocation: MONEYBOX Myeongdong — Jung-gu, Myeongdong 2-ga (Search "MONEYBOX 명동" on KakaoMap)'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 여행 중 플로우 ─── */}
      {showArrivalFlow && arrivalStep === 'traveling' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 flex items-center px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => setShowArrivalFlow(false)} className="p-1"><ChevronLeft size={22} color="#1A1A1A" /></button>
            <h2 className="flex-1 text-center text-sm font-bold text-[#1A1A1A] pr-7">
              {L(lang, { ko: '여행 중', zh: '旅行中', en: 'Traveling' })}
            </h2>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {[
              { id: 'nav-food', label: { ko: '맛집 & 식당', zh: '美食 & 餐厅', en: 'Food & Restaurants' }, sub: { ko: '미슐랭, 한식, 주문법, 배달', zh: '米其林、韩餐、点餐、外卖', en: 'Michelin, Korean food, ordering, delivery' }, tab: 'food' },
              { id: 'nav-shopping', label: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, sub: { ko: '올리브영, 무신사, 면세점', zh: 'Olive Young、MUSINSA、免税店', en: 'Olive Young, MUSINSA, duty-free' }, tab: 'shopping' },
              { id: 'nav-travel', label: { ko: '여행지 & 코스', zh: '旅游地 & 路线', en: 'Spots & Courses' }, sub: { ko: '서울, 부산, 제주 여행 코스', zh: '首尔、釜山、济州旅行路线', en: 'Seoul, Busan, Jeju courses' }, tab: 'travel' },

              { id: 'nav-medical', label: { ko: '병원 & 약국', zh: '医院 & 药店', en: 'Hospital & Pharmacy' }, sub: { ko: '아프면 어디로? 외국인 진료', zh: '生病了去哪里？外国人就诊', en: 'Where to go when sick?' }, tab: 'medical' },
              { id: 'nav-hallyu', label: { ko: '한류 & 엔터', zh: '韩流 & 娱乐', en: 'Hallyu & Entertainment' }, sub: { ko: 'K-POP, 드라마, 팬이벤트', zh: 'K-POP、韩剧、粉丝活动', en: 'K-POP, dramas, fan events' }, tab: 'hallyu' },
              { id: 'nav-delivery', label: { ko: '배달 주문', zh: '点外卖', en: 'Food Delivery' }, sub: { ko: '배달앱 이용 가이드', zh: '外卖App使用指南', en: 'Delivery app guide' }, tab: 'delivery' },
              { id: 'nav-duty-free', label: { ko: '면세한도', zh: '免税限额', en: 'Duty Free Limit' }, sub: { ko: '쇼핑 전 반드시 체크!', zh: '购物前必查！', en: 'Must check before shopping!' }, guide: 'duty-free' },
              { id: 'nav-transit', label: { ko: '교통카드', zh: '交通卡', en: 'Transit Card' }, sub: { ko: '현금 안 받는 버스 많아요!', zh: '很多公交不收现金！', en: "Many buses don't accept cash!" }, guide: 'transit' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.guide) { setOverlay(item.guide); setShowArrivalFlow(false) }
                  else { setTab(item.tab); setShowArrivalFlow(false) }
                }}
                className="rounded-[6px] border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, item.label)}</p>
                  <p className="text-xs text-[#666666] mt-0.5">{L(lang, item.sub)}</p>
                </div>
                <ChevronRight size={18} color="#999" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── 출국준비 플로우 ─── */}
      {showArrivalFlow && arrivalStep === 'departure' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 flex items-center px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => setShowArrivalFlow(false)} className="p-1"><ChevronLeft size={22} color="#1A1A1A" /></button>
            <h2 className="flex-1 text-center text-sm font-bold text-[#1A1A1A] pr-7">
              {L(lang, { ko: '출국준비', zh: '出境准备', en: 'Departure Prep' })}
            </h2>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {[
              { id: 'dep-tax-refund', label: { ko: '세금환급', zh: '退税指南', en: 'Tax Refund' }, sub: { ko: '공항에서 환급받는 법', zh: '在机场退税的方法', en: 'How to get refund at airport' }, guide: 'tax-refund' },
              { id: 'country-duty-free', label: { ko: '국가별 면세한도', zh: '各国免税限额', en: 'Duty Free Limits by Country' }, sub: { ko: '내 나라로 가져갈 수 있는 한도', zh: '能带回我国的限额', en: 'Limits for bringing back to your country' }, guide: 'country-duty-free' },
              { id: 'dep-parcel', label: { ko: '택배 보내기', zh: '寄快递', en: 'Ship Packages' }, sub: { ko: '짐 먼저 보내고 가볍게 출국', zh: '先寄행이轻松出境', en: 'Ship luggage first, travel light' }, tab: 'parcel' },
              { id: 'dep-airport', label: { ko: '공항 이동', zh: '前往机场', en: 'To Airport' }, sub: { ko: 'AREX, 리무진, 택시 비교', zh: 'AREX、大巴、出租车对比', en: 'AREX, limousine, taxi comparison' }, tab: 'travel' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.guide) { setOverlay(item.guide); setShowArrivalFlow(false) }
                  else if (item.tab) { setTab(item.tab); setShowArrivalFlow(false) }
                }}
                className="rounded-[6px] border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, item.label)}</p>
                  <p className="text-xs text-[#666666] mt-0.5">{L(lang, item.sub)}</p>
                </div>
                <ChevronRight size={18} color="#999" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── 플로팅 SOS 버튼 ─── */}
      {isVisible('emergency') && (
        <button
          onClick={() => setOverlay('emergency')}
          className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-[#DC2626] text-white flex items-center justify-center  active:scale-95 transition-transform"
        >
          <span className="text-lg font-bold">SOS</span>
        </button>
      )}

      {/* ─── 토스트 ─── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 text-white text-sm px-6 py-3 rounded-full  z-50 animate-pulse" style={{ backgroundColor: 'var(--text-primary)' }}>
          {toast}
        </div>
      )}
    </div>{/* /max-width wrapper */}
    </div>
  )
}

export { TreeSection, LucideIcon, WidgetContent, getEnabledPocketsForSection, trackActivity }
