import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { ChevronLeft, ChevronRight, Plus, Pencil } from 'lucide-react'
import { RECOMMENDED_COURSES } from '../data/recommendedCourses'
import { MICHELIN_RESTAURANTS } from '../data/restaurantData'

const ArrivalCardGuide = lazy(() => import('./guides/ArrivalCardGuide'))
const SimGuide = lazy(() => import('./guides/SimGuide'))
const TaxRefundGuide = lazy(() => import('./guides/TaxRefundGuide'))
const DutyFreeGuide = lazy(() => import('./guides/DutyFreeGuide'))
const PocketContent = lazy(() => import('./pockets/PocketContent'))
import GuideLayout from './guides/GuideLayout'

// Re-export 의존성 (App.jsx 등에서 사용)
import LucideIcon from './home/common/LucideIcon'
import TreeSection from './home/common/TreeSection'
import WidgetContent from './home/common/WidgetContent'
import { trackActivity, L } from './home/utils/helpers'

function getEnabledPocketsForSection() { return [] }

// ── 날씨 데이터 훅 ──
function useWeatherData() {
  const [weather, setWeather] = useState(null)
  useEffect(() => {
    const city = localStorage.getItem('weather_city') || 'Seoul'
    fetch(`https://wttr.in/${city}?format=j1`)
      .then(r => r.json())
      .then(data => {
        const cc = data.current_condition?.[0]
        if (cc) setWeather({ temp: cc.temp_C, desc: cc.weatherDesc?.[0]?.value || '' })
      })
      .catch(() => {})
  }, [])
  return weather
}

// ── 시간대 데이터 ──
const TIMEZONE_OPTIONS = [
  { id: 'CST', flag: '\u{1F1E8}\u{1F1F3}', name: '中国', abbr: 'CST', offset: 8 },
  { id: 'JST', flag: '\u{1F1EF}\u{1F1F5}', name: '日本', abbr: 'JST', offset: 9 },
  { id: 'EST', flag: '\u{1F1FA}\u{1F1F8}', name: '美国东部', abbr: 'EST', offset: -5 },
  { id: 'PST', flag: '\u{1F1FA}\u{1F1F8}', name: '美国西部', abbr: 'PST', offset: -8 },
  { id: 'GMT', flag: '\u{1F1EC}\u{1F1E7}', name: '英国', abbr: 'GMT', offset: 0 },
  { id: 'SGT', flag: '\u{1F1F8}\u{1F1EC}', name: '新加坡', abbr: 'SGT', offset: 8 },
  { id: 'AEST', flag: '\u{1F1E6}\u{1F1FA}', name: '悉尼', abbr: 'AEST', offset: 11 },
  { id: 'ICT_TH', flag: '\u{1F1F9}\u{1F1ED}', name: '泰国', abbr: 'ICT', offset: 7 },
  { id: 'ICT_VN', flag: '\u{1F1FB}\u{1F1F3}', name: '越南', abbr: 'ICT', offset: 7 },
  { id: 'PHT', flag: '\u{1F1F5}\u{1F1ED}', name: '菲律宾', abbr: 'PHT', offset: 8 },
]

function getTimeForOffset(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const t = new Date(utc + offset * 3600000)
  return t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
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
    emoji: '🛬',
    label: { ko: '방금 도착했어요', zh: '刚到韩国', en: 'Just arrived' },
    sub: { ko: 'SIM, 교통카드, 환전', zh: 'SIM卡、交通卡、换钱', en: 'SIM, transit card, exchange' },
    color: '#2D5A3D',
  },
  {
    id: 'hungry',
    emoji: '🍜',
    label: { ko: '밥 먹고 싶어요', zh: '想吃饭', en: 'Want to eat' },
    sub: { ko: '식당 추천, 주문법, 배달', zh: '餐厅推荐、点餐、外卖', en: 'Restaurants, ordering, delivery' },
    color: '#B8860B',
  },

  {
    id: 'sick',
    emoji: '🏥',
    label: { ko: '아파요 / 긴급', zh: '生病了/紧急', en: 'Sick / Emergency' },
    sub: { ko: '병원, 약국, 경찰, 대사관', zh: '医院、药店、警察、大使馆', en: 'Hospital, pharmacy, police' },
    color: '#DC2626',
  },
]

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
            <div className="rounded-2xl p-5 h-[140px] flex flex-col justify-end relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
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
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-[#F3F4F6] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
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

// ── 브랜드 할인 가로 스크롤 ──
function BrandScrollSection({ lang }) {
  const brands = [
    { name: { ko: '올리브영', zh: 'Olive Young', en: 'Olive Young' }, logoUrl: 'https://www.oliveyoung.co.kr/favicon.ico', discount: { ko: '외국인 할인', zh: '外国人折扣', en: 'Foreigner discount' }, color: '#fff', url: 'https://global.oliveyoung.com' },
    { name: { ko: '무신사', zh: 'MUSINSA', en: 'MUSINSA' }, logoUrl: 'https://image.msscdn.net/favicon.ico', discount: { ko: '시즌 세일', zh: '季节促销', en: 'Season sale' }, color: '#fff', url: 'https://www.musinsa.com' },
    { name: { ko: '롯데면세점', zh: '乐天免税店', en: 'Lotte Duty Free' }, logoUrl: 'https://kor.lottedfs.com/favicon.ico', discount: { ko: '온라인 쿠폰', zh: '在线优惠券', en: 'Online coupon' }, color: '#fff', url: 'https://kor.lottedfs.com' },
    { name: { ko: '신라면세점', zh: '新罗免税店', en: 'Shilla Duty Free' }, logoUrl: 'https://www.shilladfs.com/favicon.ico', discount: { ko: '신규 가입 혜택', zh: '新注册优惠', en: 'New member deal' }, color: '#fff', url: 'https://www.shilladfs.com' },
    { name: { ko: 'Klook', zh: 'Klook', en: 'Klook' }, logoUrl: 'https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_64/v1643011905/blog/oteayx3bstsjopmxjgzy.webp', discount: { ko: '체험 할인', zh: '体验折扣', en: 'Experience deals' }, color: '#fff', url: 'https://www.klook.com/ko/' },
    { name: { ko: '에버랜드', zh: '爱宝乐园', en: 'Everland' }, logoUrl: 'https://www.everland.com/favicon.ico', discount: { ko: '온라인 예매 할인', zh: '在线购票优惠', en: 'Online booking deal' }, color: '#fff', url: 'https://www.everland.com' },
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
            <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-[#E5E7EB]"
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

export default function HomeTab({ lang, exchangeRate, setTab, widgetSettings = {} }) {
  const isVisible = (key) => widgetSettings[key] !== false
  const weather = useWeatherData()
  const { kst: koreaTime, extras: extraTimezones, refresh: refreshTimezones } = useMultiTimezone()
  const todayExpr = getTodayExpression()

  // 환율: prop에서 CNY 환율 추출
  const cnyRate = exchangeRate?.CNY || 191

  // 코스 데이터 (test 카테고리 제외, 첫 6개)
  const courses = RECOMMENDED_COURSES.filter(c => c.category !== 'test').slice(0, 6)

  // 가이드/포켓 오버레이 통합 상태
  // guide: 'map-guide' | 'transit' | 'arrival-card' | 'sim' | 'tax-refund' | 'duty-free'
  // pocket: 'restaurant' | 'cafe' | 'transport' | 'convenience' | 'shopping' | 'accommodation' | 'emergency'
  const [overlay, setOverlay] = useState(null)
  const POCKET_IDS = ['restaurant', 'cafe', 'transport', 'convenience', 'shopping', 'accommodation', 'emergency']

  // 방금 도착했어요 웰컴 플로우
  const [showArrivalFlow, setShowArrivalFlow] = useState(false)
  const [arrivalStep, setArrivalStep] = useState('splash') // 'splash' | 'menu' | 'immigration' | 'transport' | 'sim-exchange'

  useEffect(() => {
    if (showArrivalFlow && arrivalStep === 'splash') {
      const timer = setTimeout(() => setArrivalStep('menu'), 1500)
      return () => clearTimeout(timer)
    }
  }, [showArrivalFlow, arrivalStep])

  // 시간대 선택 팝업
  const [showTzPicker, setShowTzPicker] = useState(false)
  const [tzSelection, setTzSelection] = useState(() => {
    const saved = localStorage.getItem('hanpocket_extra_timezones')
    return saved ? JSON.parse(saved) : []
  })

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

  return (
    <div
      className="pt-4 pb-24"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* ─── 상단 정보 바 ─── */}
      <div className="px-4 mb-4 flex items-center gap-2 text-xs tracking-wider flex-wrap" style={{ color: '#999999' }}>
        {isVisible('weather') && <><span>{L(lang, { ko: '서울', zh: '首尔', en: 'Seoul' })} {weather ? <span className="transition-opacity duration-500 opacity-100">{weather.temp}°C</span> : <span className="inline-block w-8 h-3 bg-[#E5E7EB] rounded animate-pulse align-middle" />}</span><span>·</span></>}
        {isVisible('exchange') && <><span ref={exchangeRef} className="relative">
          {exchangeRate?.CNY ? <span
            onClick={() => setShowExchangePopover(!showExchangePopover)}
            className="cursor-pointer underline decoration-dotted transition-opacity duration-500 opacity-100"
          >¥1 = ₩{Math.round(cnyRate)}</span> : <>¥1 = ₩<span className="inline-block w-10 h-3 bg-[#E5E7EB] rounded animate-pulse align-middle" /></>}
          {showExchangePopover && (
            <div className="absolute top-6 left-0 bg-white rounded-2xl border border-[#E5E7EB] p-3 shadow-lg z-20 min-w-[160px]">
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
            </div>
          )}
        </span><span>·</span></>}
        {isVisible('clock') && <span>KST {koreaTime}</span>}
        {extraTimezones.map(tz => (
          <span key={tz.id}>
            <span>·</span>
            {' '}<span style={{ color: '#3B82F6' }}>{tz.abbr} {tz.time}</span>
          </span>
        ))}
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

      {/* ─── Intent 카드 섹션 ─── */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold tracking-wide px-4 mb-3" style={{ color: '#1A1A1A' }}>
          {L(lang, { ko: '한국 처음이신가요?', zh: '第一次来韩国吗？', en: 'First time in Korea?' })}
        </h2>
        <div className="pl-4 pr-0 flex gap-3 overflow-x-auto scroll-indicator snap-x snap-mandatory scroll-pl-4 pb-2">
          {INTENT_CARDS.map(card => (
            <button
              key={card.id}
              onClick={() => {
                if (card.id === 'just-arrived') { setArrivalStep('splash'); setShowArrivalFlow(true) }
                else if (card.id === 'hungry') setTab('food')
                else if (card.id === 'sick') setTab('medical')
              }}
              className="snap-start flex-shrink-0 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-3 active:scale-[0.97] active:shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-150 text-left"
              style={{ width: 140, height: 100 }}
            >
              <span className="text-2xl block active:scale-110 transition-transform">{card.emoji}</span>
              <p className="text-xs font-bold mt-1.5 leading-tight" style={{ color: '#1A1A1A' }}>
                {L(lang, card.label)}
              </p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: '#999999' }}>
                {L(lang, card.sub)}
              </p>
            </button>
          ))}
          <div className="flex-shrink-0 w-4" />
        </div>
      </div>

      {/* ─── 3. 한국 모든 여행지 ─── */}
      <div className="mb-8 px-4">
        <button
          onClick={() => setTab('travel')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h2 className="text-[15px] font-semibold tracking-wide" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '한국 모든 여행지', zh: '韩国所有旅游地', en: 'All Korea Destinations' })}
          </h2>
          <span className="text-sm" style={{ color: '#666666' }}>&rarr;</span>
        </button>
        <button
          onClick={() => setTab('travel')}
          className="w-full rounded-2xl overflow-hidden active:scale-[0.97] active:shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-150 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
        >
          <div className="relative h-[120px]">
            <img src="https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&h=300&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white text-lg font-bold text-left">{L(lang, { ko: '찾기', zh: '搜索', en: 'Search' })}</p>
            </div>
          </div>
        </button>
      </div>

      {/* ─── 5. 상황별 한국어 ─── */}
      <div className="mb-8">
        <div className="flex items-center justify-between w-full mb-3 px-4">
          <h2 className="text-[15px] font-semibold tracking-wide" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '상황별 한국어', zh: '场景韩语', en: 'Korean by Situation' })}
          </h2>
        </div>
        <div className="pl-4 pr-0 flex gap-4 overflow-x-auto scroll-indicator scroll-pl-4 pb-2">
          {SCENE_PHRASES.map((item, i) => (
            <button
              key={i}
              onClick={() => setOverlay(item.pocket)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-[0.95] transition-transform"
              style={{ width: 64 }}
            >
              <div className={`w-14 h-14 rounded-full overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] ${item.pocket === 'emergency' ? 'ring-2 ring-red-400' : ''}`}>
                <img src={item.img} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.parentElement.style.backgroundColor = '#F3F4F6' }} />
              </div>
              <span className="text-[11px] font-medium text-center leading-tight" style={{ color: '#1A1A1A' }}>
                {L(lang, item.scene)}
              </span>
            </button>
          ))}
          <div className="flex-shrink-0 w-4" />
        </div>
      </div>

      {/* ─── 5. 추천 코스 섹션 ─── */}
      {isVisible('course') && <div className="mb-8">
        <button
          onClick={() => setTab('course')}
          className="flex items-center justify-between w-full mb-3 px-4"
        >
          <h2 className="text-[15px] font-semibold tracking-wide" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '추천 코스', zh: '推荐路线', en: 'Recommended Courses' })}
          </h2>
          <span className="text-sm" style={{ color: '#666666' }}>&rarr;</span>
        </button>
        <div className="pl-4 pr-0 flex gap-3 overflow-x-auto scroll-indicator snap-x snap-mandatory scroll-pl-4 pb-2">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setTab('course')}
              className="snap-start flex-shrink-0 rounded-2xl overflow-hidden active:scale-[0.97] active:shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-150 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              style={{ width: 180 }}
            >
              <div
                className="relative flex items-end p-3"
                style={{ height: 150 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${COURSE_GRADIENTS[course.category] || 'from-[#6A6A5A] to-[#4A4A3A]'}`} />
                {COURSE_IMAGES[course.id] && (
                  <img
                    src={COURSE_IMAGES[course.id]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <p className="relative text-white text-sm font-bold leading-tight text-left z-10">
                  {L(lang, course.name)}
                </p>
              </div>
              <div className="p-2.5" style={{ backgroundColor: '#FFFFFF', height: 64 }}>
                <p className="text-[11px] line-clamp-2 text-left leading-relaxed" style={{ color: '#666666' }}>
                  {L(lang, course.description)}
                </p>
                <p className="text-[10px] mt-1 text-left" style={{ color: '#666666' }}>
                  {course.stops.length}{L(lang, { ko: '개 장소', zh: '个地点', en: ' spots' })} · {course.duration}
                </p>
              </div>
            </button>
          ))}
          {/* 더보기 카드 */}
          <button
            onClick={() => setTab('course')}
            className="snap-start flex-shrink-0 rounded-2xl border-2 border-dashed flex items-center justify-center active:scale-[0.97] transition-transform duration-150"
            style={{ width: 180, height: 214, borderColor: '#B2DFDB' }}
          >
            <div className="text-center">
              <p className="text-lg mb-1" style={{ color: '#666666' }}>&rarr;</p>
              <p className="text-xs font-medium" style={{ color: '#666666' }}>
                {L(lang, { ko: '더보기', zh: '查看更多', en: 'View More' })}
              </p>
            </div>
          </button>
          <div className="flex-shrink-0 w-4" />
        </div>
      </div>}

      {/* ─── 가이드 오버레이 ─── */}
      {overlay && !POCKET_IDS.includes(overlay) && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-white flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" /></div>}>
          {overlay === 'map-guide' && (
            <GuideLayout title={{ ko: '한국 지도 앱', zh: '韩国地图APP', en: 'Korea Map Apps' }} lang={lang} onClose={() => setOverlay(null)}>
              <div className="p-4 rounded-2xl border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">📍 KakaoMap ({L(lang, { ko: '카카오맵', zh: '카카오地图', en: 'KakaoMap' })})</h3>
                <p className="text-sm text-[#666666] leading-relaxed mb-3">
                  {L(lang, { ko: '한국에서 가장 많이 쓰는 지도 앱. 길찾기, 대중교통, 맛집, 카페 검색까지 모두 가능합니다. 반드시 설치하세요!', zh: '韩国使用最多的地图APP。找路、公交、美食、咖啡厅搜索全都可以。必须安装！', en: 'The most used map app in Korea. Navigation, transit, restaurants, cafes — all in one. Must install!' })}
                </p>
                <div className="flex gap-2">
                  <a href="https://apps.apple.com/app/id304608425" target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 rounded-xl bg-[#FEE500] text-[#1A1A1A] text-sm font-bold active:scale-95 transition-transform">
                    App Store
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=net.daum.android.map" target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 rounded-xl bg-[#FEE500] text-[#1A1A1A] text-sm font-bold active:scale-95 transition-transform">
                    Google Play
                  </a>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">🗺️ {L(lang, { ko: '바이두 지도도 사용 가능!', zh: '百度地图也可以用！', en: 'Baidu Maps also works!' })}</h3>
                <p className="text-sm text-[#666666] leading-relaxed mb-3">
                  {L(lang, { ko: '바이두 지도(百度地图)도 한국에서 사용 가능합니다. 중국어로 검색할 수 있어 편리합니다.', zh: '百度地图也可以在韩国使用。可以用中文搜索，很方便。', en: 'Baidu Maps also works in Korea. Convenient for searching in Chinese.' })}
                </p>
                <a href="https://map.baidu.com" target="_blank" rel="noopener noreferrer" className="block text-center py-2.5 rounded-xl bg-[#3385FF] text-white text-sm font-bold active:scale-95 transition-transform">
                  {L(lang, { ko: '바이두 지도 열기', zh: '打开百度地图', en: 'Open Baidu Maps' })}
                </a>
              </div>
            </GuideLayout>
          )}
          {overlay === 'transit' && (
            <GuideLayout
              title={{ ko: '교통카드 & 표 구매', zh: '交通卡 & 购票指南', en: 'Transit Card & Tickets' }}
              lang={lang}
              onClose={() => setOverlay(null)}
              tip={{ ko: '💡 T-money 잔액은 편의점에서 환불 가능 (카드 반납 시 잔액 - 수수료 500원)', zh: '💡 T-money余额可在便利店退款（退卡时退余额 - 手续费500韩元）', en: '💡 T-money balance is refundable at convenience stores (balance minus ₩500 fee)' }}
            >
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <p className="text-sm font-bold text-red-700 leading-relaxed">
                  {L(lang, { ko: '⚠️ 한국 버스 대부분은 현금을 받지 않습니다. 교통카드 없이는 버스를 탈 수 없어요! 반드시 교통카드를 먼저 구매하세요.', zh: '⚠️ 韩国大部分公交不收现金！没有交通卡无法乘坐公交！请务必先购买交通卡。', en: "⚠️ Most Korean buses don't accept cash. You can't ride without a transit card! Buy one first." })}
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">🎫 T-money / Cash Bee</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {L(lang, { ko: '편의점(CU, GS25, 세븐일레븐)에서 2,500원에 구매. 충전 후 버스·지하철·택시 모두 사용 가능.', zh: '在便利店(CU、GS25、7-11)花2500韩元购买T-money卡，充值后公交、地铁、出租车都能用。', en: 'Buy at convenience stores (CU, GS25, 7-Eleven) for ₩2,500. After charging, use on buses, subway, and taxis.' })}
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">🚇 {L(lang, { ko: '지하철 1회권', zh: '地铁单程票', en: 'Single Journey Ticket' })}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {L(lang, { ko: '지하철역 자동발매기에서 구매. 보증금 500원 포함. 하차 후 보증금 환불기에서 500원 돌려받기.', zh: '在地铁站自动售票机购买一次性交通卡。含500韩元押金，下车后在退款机取回。', en: 'Buy at subway station ticket machines. Includes ₩500 deposit. Get the deposit back at refund machines after exiting.' })}
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">🚌 {L(lang, { ko: '버스 이용법', zh: '乘公交方法', en: 'How to Ride Buses' })}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {L(lang, { ko: '앞문 탑승 → T-money 태그 → 하차 시 뒷문에서 태그.', zh: '前门上车→刷T-money→下车时后门再刷。', en: 'Board at front door → tap T-money → tap again at rear door when exiting.' })}
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">🔄 {L(lang, { ko: '환승 꿀팁', zh: '换乘小贴士', en: 'Transfer Tips' })}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {L(lang, {
                    ko: '버스/지하철 하차 후 30분 이내에 다른 노선 이용 시 환승 적용!\n→ 두 번째 교통수단의 기본요금이 무료\n→ 단, 거리 추가금은 발생할 수 있음',
                    zh: '下车后30分钟内换乘其他线路，换乘免费！\n→ 第二次乘车的基本费用免费\n→ 但可能产生距离附加费',
                    en: 'Transfer within 30 min after getting off for free transfer!\n→ Base fare of second ride is free\n→ Distance surcharge may still apply'
                  }).split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">💳 {L(lang, { ko: '교통카드 충전', zh: '交通卡充值', en: 'Transit Card Top-up' })}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {L(lang, { ko: '편의점 또는 지하철역 충전기에서 가능. 1,000원 단위로 충전할 수 있습니다.', zh: '在便利店或地铁站充值机充值。可以按1000韩元为单位充值。', en: 'Available at convenience stores or subway station machines. Can top up in ₩1,000 increments.' })}
                </p>
              </div>
            </GuideLayout>
          )}
          {overlay === 'arrival-card' && <ArrivalCardGuide lang={lang} onClose={() => setOverlay(null)} />}
          {overlay === 'sim' && <SimGuide lang={lang} onClose={() => setOverlay(null)} />}
          {overlay === 'tax-refund' && <TaxRefundGuide lang={lang} onClose={() => setOverlay(null)} />}
          {overlay === 'duty-free' && <DutyFreeGuide lang={lang} onClose={() => setOverlay(null)} />}
        </Suspense>
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
            className="rounded-2xl mx-6 w-full max-w-sm overflow-hidden"
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
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl active:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{tz.flag}</span>
                      <span className="text-sm" style={{ color: '#1A1A1A' }}>{tz.name}</span>
                      <span className="text-xs" style={{ color: '#999999' }}>{tz.abbr} {currentTime}</span>
                    </div>
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center"
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
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white active:scale-[0.98] transition-transform"
                style={{ backgroundColor: '#3B82F6' }}
              >
                {L(lang, { ko: '확인', zh: '确认', en: 'Confirm' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 방금 도착했어요 웰컴 플로우 ─── */}
      {showArrivalFlow && arrivalStep === 'splash' && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center animate-fade-in-out">
          <div className="text-center">
            <p className="text-4xl mb-4">👋</p>
            <h1 className="text-xl font-bold text-[#1A1A1A]">
              {L(lang, { ko: '한국에 오신 걸 환영해요!', zh: '欢迎来到韩国！', en: 'Welcome to Korea!' })}
            </h1>
          </div>
        </div>
      )}

      {showArrivalFlow && arrivalStep === 'menu' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in">
          <div className="sticky top-0 bg-white z-10 flex items-center px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => setShowArrivalFlow(false)} className="p-1"><ChevronLeft size={22} color="#1A1A1A" /></button>
            <h2 className="flex-1 text-center text-sm font-bold text-[#1A1A1A] pr-7">
              {L(lang, { ko: '무엇을 도와드릴까요?', zh: '需要什么帮助？', en: 'How can we help?' })}
            </h2>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {[
              { id: 'immigration', emoji: '🛬', label: { ko: '전자 입국신고서 작성', zh: '电子入境卡填写', en: 'Electronic Arrival Card' }, sub: { ko: 'Q-CODE로 미리 작성하세요', zh: '用Q-CODE提前填写', en: 'Fill in advance with Q-CODE' } },
              { id: 'transport', emoji: '🚕', label: { ko: '택시/대중교통 이용할래요', zh: '坐出租车/公共交通', en: 'Taxi / Public transit' }, sub: { ko: '공항택시, RIDE앱, AREX, 교통카드', zh: '机场出租车、RIDE APP、AREX、交通卡', en: 'Airport taxi, RIDE app, AREX, transit card' } },
              { id: 'sim-exchange', emoji: '💱', label: { ko: 'SIM카드 구매 & 환전할래요', zh: '买SIM卡 & 换钱', en: 'Buy SIM & Exchange money' }, sub: { ko: 'eSIM, 공항 환전, 명동 환전소', zh: 'eSIM、机场换钱、明洞换钱所', en: 'eSIM, airport exchange, Myeongdong' } },
              { id: 'guide-tax-refund', emoji: '💸', label: { ko: '세금환급', zh: '退税指南', en: 'Tax Refund' }, sub: { ko: '어디서/어떻게 돌려받죠?', zh: '在哪里/怎么退税？', en: 'Where/how to get refund?' }, guide: 'tax-refund' },
              { id: 'guide-duty-free', emoji: '🛍️', label: { ko: '면세한도', zh: '免税限额', en: 'Duty Free Limit' }, sub: { ko: '쇼핑 후 출국 시 반드시 체크', zh: '购物后出境必查', en: 'Must check before departure' }, guide: 'duty-free' },
              { id: 'guide-transit', emoji: '💳', label: { ko: '교통카드', zh: '交通卡', en: 'Transit Card' }, sub: { ko: '현금 안 받는 버스 많아요!', zh: '很多公交不收现金！', en: "Many buses don't accept cash!" }, guide: 'transit' },
              { id: 'guide-map', emoji: '🗺️', label: { ko: '한국지도', zh: '韩国地图', en: 'Korea Map' }, sub: { ko: '카카오맵 필수 설치', zh: '必装KakaoMap', en: 'Must install KakaoMap' }, guide: 'map-guide' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { if (item.guide) { setOverlay(item.guide); setShowArrivalFlow(false) } else { setArrivalStep(item.id) } }}
                className="rounded-2xl border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform flex items-center gap-3"
              >
                <span className="text-3xl">{item.emoji}</span>
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

      {/* 입국신고 상세 */}
      {showArrivalFlow && arrivalStep === 'immigration' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in">
          <div className="sticky top-0 bg-white z-10 flex items-center px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => setArrivalStep('menu')} className="p-1"><ChevronLeft size={22} color="#1A1A1A" /></button>
            <h2 className="flex-1 text-center text-sm font-bold text-[#1A1A1A] pr-7">
              {L(lang, { ko: '전자 입국신고서', zh: '电子入境卡', en: 'Electronic Arrival Card' })}
            </h2>
          </div>
          <div className="p-4">
            {/* Q-CODE 카드 */}
            <div className="rounded-2xl bg-[#F0F4FF] p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">✈️</span>
                <div>
                  <p className="text-[15px] font-bold text-[#1A1A1A]">{L(lang, { ko: '전자입국신고서 (Q-CODE)', zh: '电子入境卡 (Q-CODE)', en: 'Electronic Arrival Card (Q-CODE)' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, { ko: '한국 입국 전 온라인으로 미리 작성할 수 있습니다.\n건강상태, 세관신고를 한번에!\n실물 카드를 안 써도 됩니다.', zh: '入韩前可在线提前填写。\n健康状态、海关申报一次搞定！\n不需要纸质卡。', en: 'Fill out online before entering Korea.\nHealth & customs declaration in one go!\nNo physical card needed.' })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="https://ciq.korea.go.kr/coview/board/homeland/linkView.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl text-center text-sm font-bold text-white bg-[#3B5BDB] active:scale-[0.97] transition-transform"
                >
                  {L(lang, { ko: 'Q-CODE 바로가기', zh: 'Q-CODE 前往', en: 'Go to Q-CODE' })}
                </a>
                <a
                  href="https://www.k-eta.go.kr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl text-center text-sm font-bold text-[#1A1A1A] bg-white border border-[#E5E7EB] active:scale-[0.97] transition-transform"
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
                <div className="rounded-2xl border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '공항에서 택시 바로 잡기', zh: '机场直接打车', en: 'Get a taxi at the airport' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, {
                      ko: '인천공항: 1층 도착 후 8번/4번 게이트 → 택시 승강장. 일반택시 ₩65,000~80,000 (서울 기준).\n김포공항: 1층 출구 → 택시 승강장. 일반택시 ₩20,000~35,000 (서울 기준).\n카드 결제 가능, 기본요금 ₩4,800.',
                      zh: '仁川机场：1层到达后8号/4号门 → 出租车站。普通出租车 ₩65,000~80,000（首尔方向）。\n金浦机场：1层出口 → 出租车站。普通出租车 ₩20,000~35,000（首尔方向）。\n可刷卡，起步价 ₩4,800。',
                      en: 'Incheon Airport: After arrival at 1F, Gate 8/4 → taxi stand. Regular taxi ₩65,000~80,000 (to Seoul).\nGimpo Airport: 1F exit → taxi stand. Regular taxi ₩20,000~35,000 (to Seoul).\nCard payment accepted, base fare ₩4,800.'
                    })}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: 'RIDE 앱 사용하기', zh: '使用RIDE APP', en: 'Use RIDE App' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, { ko: '한국 번호 없어도 돼요! I·RIDE 앱으로 외국인도 택시 호출 가능.', zh: '不需要韩国手机号！用I·RIDE APP外国人也能叫车。', en: 'No Korean number needed! Foreigners can call taxis with the I·RIDE app.' })}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <a href="https://apps.apple.com/app/id1596453498" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#2D5A3D] text-white text-sm font-medium py-2.5 px-4 text-center flex-1">iOS</a>
                    <a href="https://play.google.com/store/apps/details?id=com.iride.passenger" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#2D5A3D] text-white text-sm font-medium py-2.5 px-4 text-center flex-1">Android</a>
                  </div>
                </div>
              </div>
            </div>

            {/* 대중교통 섹션 */}
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-2">{L(lang, { ko: '🚇 대중교통 이용할래요', zh: '🚇 坐公共交通', en: '🚇 Public Transit' })}</h3>
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: 'AREX (공항철도)', zh: 'AREX（机场铁路）', en: 'AREX (Airport Railroad)' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, {
                      ko: '인천공항 → 서울역 직통 43분 ₩11,000 / 일반열차 66분 ₩4,750.\n지하 교통센터(B1)에서 탑승.',
                      zh: '仁川机场 → 首尔站 直达43分钟 ₩11,000 / 普通列车66分钟 ₩4,750。\n地下交通中心(B1)乘车。',
                      en: 'Incheon Airport → Seoul Station: Express 43min ₩11,000 / Regular 66min ₩4,750.\nBoard at underground Transit Center (B1).'
                    })}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '일회용 교통카드 구매', zh: '购买一次性交通卡', en: 'Single-use Transit Card' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, {
                      ko: '지하철역 자동발매기에서 구매. 보증금 ₩500 포함, 하차 후 환불기에서 돌려받기.',
                      zh: '地铁站自动售票机购买。含₩500押金，下车后在退款机退还。',
                      en: 'Buy at subway station vending machines. Includes ₩500 deposit, refundable at return machines after use.'
                    })}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] p-4">
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
                <div className="rounded-2xl border border-[#E5E7EB] p-4">
                  <p className="text-xs text-[#666666] leading-relaxed">
                    {L(lang, {
                      ko: '인천공항 1층에 KT, SKT, LG U+ 로밍센터. eSIM이면 온라인으로도 구매 가능 (Airalo, eSIM Korea 등)',
                      zh: '仁川机场1层有KT、SKT、LG U+漫游中心。eSIM可在线购买（Airalo、eSIM Korea等）',
                      en: 'KT, SKT, LG U+ roaming centers at Incheon Airport 1F. eSIM available online (Airalo, eSIM Korea, etc.)'
                    })}
                  </p>
                  <button
                    onClick={() => { setOverlay('sim'); setShowArrivalFlow(false) }}
                    className="mt-3 rounded-xl bg-[#2D5A3D] text-white text-sm font-medium py-2.5 px-4 w-full text-center active:scale-[0.98] transition-transform"
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
                <div className="rounded-2xl border border-[#E5E7EB] p-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '공항 환전소', zh: '机场换钱所', en: 'Airport Exchange' })}</p>
                  <p className="text-xs text-[#666666] leading-relaxed mt-1">
                    {L(lang, {
                      ko: '인천공항 도착층(1층) 곳곳에 환전소 (우리은행, 하나은행, KB국민은행). 소액만 환전 추천 (수수료 높음).',
                      zh: '仁川机场到达层（1层）各处有换钱所（友利银行、韩亚银行、KB国民银行）。建议少量兑换（手续费高）。',
                      en: 'Exchange counters throughout Incheon Airport arrivals (1F) — Woori, Hana, KB Bank. Exchange small amounts only (high fees).'
                    })}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] p-4">
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

      {/* ─── 광고/프로모 배너 ─── */}
      <PromoBanner
        lang={lang}
        banners={[
          {
            emoji: '🛬',
            bg: '#2D5A3D',
            title: { ko: '한국 입국 가이드', zh: '韩国入境指南', en: 'Korea Arrival Guide' },
            sub: { ko: '입국카드부터 교통카드까지 한번에!', zh: '入境卡到交通卡一次搞定！', en: 'Arrival card to transit card in one go!' },
            onClick: () => { setArrivalStep('menu'); setShowArrivalFlow(true) },
          },
          {
            emoji: '💱',
            bg: '#B8860B',
            title: { ko: '환전 꿀팁', zh: '换钱攻略', en: 'Exchange Tips' },
            sub: { ko: '공항보다 명동이 1~3% 저렴!', zh: '明洞比机场便宜1~3%！', en: 'Myeongdong is 1~3% cheaper than airport!' },
            onClick: () => {},
          },
          {
            emoji: '🎊',
            bg: '#8B4513',
            title: { ko: '봄 축제 시즌', zh: '春季庆典', en: 'Spring Festival Season' },
            sub: { ko: '진해 벚꽃, 여의도 벚꽃, 서울랜턴', zh: '镇海樱花、汝矣岛樱花、首尔灯笼', en: 'Jinhae Cherry Blossom, Yeouido, Seoul Lantern' },
            onClick: () => setTab('course'),
          },
        ]}
      />

      {/* ─── 추천 피드 섹션들 ─── */}
      {(() => {
        // 데이터 준비
        const topRestaurants = MICHELIN_RESTAURANTS.filter(r => r.award === 'michelin3' || r.award === 'michelin2').slice(0, 2)
        const popularRestaurants = MICHELIN_RESTAURANTS.filter(r => r.cuisine === 'korean' && r.area?.city === '서울' && r.priceRange <= 2).slice(0, 2)
        const dinnerRestaurants = MICHELIN_RESTAURANTS.filter(r => r.priceRange >= 3 && r.award?.includes('michelin')).slice(0, 2)
        const samgyeopRestaurants = MICHELIN_RESTAURANTS.filter(r => r.cuisine === 'korean' && (r.name?.ko?.includes('삼겹') || r.name?.ko?.includes('고기')))
        const samgyeop = samgyeopRestaurants.length >= 2 ? samgyeopRestaurants.slice(0, 2) : MICHELIN_RESTAURANTS.filter(r => r.cuisine === 'korean' && r.priceRange >= 1 && r.priceRange <= 2).slice(0, 2)
        const michelin1 = MICHELIN_RESTAURANTS.filter(r => r.award === 'michelin1')
        const allCourses = RECOMMENDED_COURSES.filter(c => c.category !== 'test')
        const walkCourses = allCourses.filter(c => c.category === 'first' || c.category === 'history').slice(0, 2)
        const springCourses = allCourses.filter(c => c.category === 'jeju' || c.category === 'busan').slice(0, 2)

        // 닉네임 & 최근 클릭
        let nickname = '여행자'
        try { const p = JSON.parse(localStorage.getItem('hanpocket_profile') || '{}'); if (p.nickname) nickname = p.nickname } catch {}
        let recentTab = 'food'
        let personalItems
        try {
          const clicks = JSON.parse(localStorage.getItem('hp_recent_clicks') || '[]')
          if (clicks.length > 0) recentTab = clicks[0]
        } catch {}
        if (!personalItems) {
          const shuffled = [...michelin1].sort(() => 0.5 - Math.random()).slice(0, 2)
          personalItems = shuffled.map(r => ({
            name: L(lang, r.name),
            image: r.images?.[0] || 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop',
            tags: [r.area?.gu, r.cuisine, getAwardBadge(r.award)].filter(Boolean),
            sub: r.area?.gu,
            onClick: () => setTab('food', { itemId: r.id, itemData: r }),
          }))
        }

        const SAMPLE_REVIEWS = {
          michelin3: { ko: '인생 레스토랑, 다시 와도 감동', zh: '人生餐厅，再来也感动', en: 'Life-changing restaurant' },
          michelin2: { ko: '분위기와 맛 모두 완벽!', zh: '氛围和味道都完美！', en: 'Perfect ambience and taste!' },
          michelin1: { ko: '가격 대비 최고의 선택', zh: '性价比最高的选择', en: 'Best value for money' },
          blueribbon: { ko: '현지인이 줄 서는 맛집', zh: '当地人排队的餐厅', en: 'Locals line up for this' },
        }

        const makeRestaurantItem = (r) => ({
          name: L(lang, r.name),
          image: r.images?.[0] || 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop',
          tags: [[r.area?.city, r.area?.gu, r.area?.dong].filter(Boolean).join(' '), r.cuisine, getAwardBadge(r.award)].filter(Boolean),
          sub: [r.area?.city, r.area?.gu, r.area?.dong].filter(Boolean).join(' '),
          review: L(lang, SAMPLE_REVIEWS[r.award] || SAMPLE_REVIEWS.blueribbon),
          onClick: () => setTab('food', { itemId: r.id, itemData: r }),
        })

        const makeCourseItem = (c) => ({
          name: L(lang, c.name),
          image: COURSE_IMAGES[c.id] || 'https://images.unsplash.com/photo-1583167625297-fe5e39ebb0f5?w=400&h=300&fit=crop',
          tags: [c.duration, c.stops.length + L(lang, { ko: '개 장소', zh: '个地点', en: ' spots' })],
          sub: L(lang, c.description),
          onClick: () => setTab('course', { itemId: c.id, itemData: c }),
        })

        // 시간대별 추천 섹션
        const kstHour = new Date(Date.now() + (9 - new Date().getTimezoneOffset() / -60) * 3600000).getHours()
        let timeSection = null
        if (kstHour >= 6 && kstHour < 11) {
          timeSection = {
            title: { ko: '좋은 아침! 아침식사 추천 🌅', zh: '早安！早餐推荐 🌅', en: 'Good morning! Breakfast picks 🌅' },
            subtitle: { ko: '든든한 한국식 아침으로 시작하세요', zh: '从丰盛的韩式早餐开始吧', en: 'Start with a hearty Korean breakfast' },
            items: [
              { name: L(lang, { ko: '광장시장 빈대떡', zh: '广藏市场绿豆饼', en: 'Gwangjang Market Bindaetteok' }), image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop', tags: [L(lang, { ko: '종로', zh: '钟路', en: 'Jongno' }), L(lang, { ko: '전통시장', zh: '传统市场', en: 'Traditional Market' })], review: L(lang, { ko: '새벽부터 줄 서는 전설의 맛', zh: '凌晨就排队的传奇味道', en: 'Legendary taste worth lining up for' }), onClick: () => setTab('food') },
              { name: L(lang, { ko: '이삭토스트', zh: 'Isaac Toast', en: 'Isaac Toast' }), image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', tags: [L(lang, { ko: '전국 체인', zh: '全国连锁', en: 'Nationwide' }), L(lang, { ko: '₩3,000~', zh: '₩3,000~', en: '₩3,000~' })], review: L(lang, { ko: '한국 길거리 토스트의 정석', zh: '韩国街头吐司的经典', en: 'Classic Korean street toast' }), onClick: () => setTab('food') },
            ],
          }
        } else if (kstHour >= 11 && kstHour < 17) {
          timeSection = {
            title: { ko: '점심 인기 메뉴 🍱', zh: '午餐热门菜单 🍱', en: 'Popular Lunch Picks 🍱' },
            subtitle: { ko: '지금 가면 딱 좋은 맛집', zh: '现在去刚刚好的餐厅', en: 'Perfect time to visit these spots' },
            items: MICHELIN_RESTAURANTS.filter(r => r.cuisine === 'korean' && r.priceRange <= 2).slice(2, 4).map(r => ({
              ...makeRestaurantItem(r),
              review: L(lang, { ko: '점심특선이 가성비 최고!', zh: '午餐套餐性价比最高！', en: 'Lunch special is the best value!' }),
            })),
          }
        } else {
          timeSection = {
            title: { ko: '저녁엔 여기 어때요? 🌙', zh: '晚上去这里怎么样？🌙', en: 'How about here tonight? 🌙' },
            subtitle: { ko: '오늘 하루 마무리는 맛있게', zh: '美味地结束今天', en: 'End the day with great food' },
            items: MICHELIN_RESTAURANTS.filter(r => r.priceRange >= 2).slice(2, 4).map(r => ({
              ...makeRestaurantItem(r),
              review: L(lang, { ko: '저녁 분위기 최고, 데이트 추천', zh: '晚上氛围最好，推荐约会', en: 'Great evening vibe, perfect for dates' }),
            })),
          }
        }

        return (
          <>
            {/* 시간대별 추천 */}
            {timeSection && timeSection.items.length >= 2 && (
              <RecommendSection
                lang={lang}
                title={timeSection.title}
                subtitle={timeSection.subtitle}
                items={timeSection.items}
                onViewAll={() => setTab('food')}
              />
            )}

            {/* 섹션 1: 한포켓이 선정한 추천 맛집 */}
            {topRestaurants.length >= 2 && (
              <RecommendSection
                lang={lang}
                title={{ ko: '한포켓이 선정한 추천 맛집 ⭐', zh: '韩口袋精选推荐餐厅 ⭐', en: 'HanPocket Top Picks ⭐' }}
                subtitle={{ ko: '미슐랭 & 블루리본 검증된 맛집', zh: '米其林 & 蓝丝带认证餐厅', en: 'Michelin & Blue Ribbon verified' }}
                items={topRestaurants.map(makeRestaurantItem)}
                onViewAll={() => setTab('food')}
              />
            )}

            {/* 섹션 2: 중국인이 많이 찾는 맛집 */}
            {popularRestaurants.length >= 2 && (
              <RecommendSection
                lang={lang}
                title={{ ko: '중국인이 많이 찾는 맛집 🇨🇳', zh: '中国游客常去的餐厅 🇨🇳', en: 'Popular with Chinese Tourists 🇨🇳' }}
                subtitle={{ ko: '중국 관광객 방문 인증 맛집', zh: '中国游客打卡热门餐厅', en: 'Chinese tourist verified restaurants' }}
                items={popularRestaurants.map(makeRestaurantItem)}
                onViewAll={() => setTab('food')}
              />
            )}

            {/* 섹션 3: 요즘 HOT한 카페 */}
            <RecommendSection
              lang={lang}
              title={{ ko: '요즘 HOT한 카페 ☕', zh: '最近很火的咖啡厅 ☕', en: 'Trending Cafes ☕' }}
              subtitle={{ ko: '인스타 감성 카페 모음', zh: 'INS风咖啡厅合集', en: 'Instagram-worthy cafe collection' }}
              items={[
                { name: L(lang, { ko: '성수동 카페거리', zh: '圣水洞咖啡街', en: 'Seongsu Cafe Street' }), image: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=400&h=300&fit=crop', tags: [L(lang, { ko: '서울 성동구', zh: '首尔城东区', en: 'Seongdong-gu' })], review: L(lang, { ko: '인스타 사진 맛집, 커피도 맛있어요', zh: '拍照圣地，咖啡也好喝', en: 'Insta-worthy, great coffee too' }), onClick: () => setTab('cafe') },
                { name: L(lang, { ko: '연남동 카페거리', zh: '延南洞咖啡街', en: 'Yeonnam Cafe Street' }), image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', tags: [L(lang, { ko: '서울 마포구', zh: '首尔麻浦区', en: 'Mapo-gu' })], review: L(lang, { ko: '산책+커피의 최고 조합', zh: '散步+咖啡的最佳组合', en: 'Best combo: walk + coffee' }), onClick: () => setTab('cafe') },
              ]}
              onViewAll={() => setTab('cafe')}
            />

            {/* 섹션 4: 가볍게 둘러볼 수 있는 곳 */}
            {walkCourses.length >= 2 && (
              <RecommendSection
                lang={lang}
                title={{ ko: '가볍게 둘러볼 수 있는 곳 🚶', zh: '轻松逛逛的好地方 🚶', en: 'Easy Places to Explore 🚶' }}
                subtitle={{ ko: '산책하기 좋은 무료 명소', zh: '适合散步的免费景点', en: 'Free attractions great for walking' }}
                items={walkCourses.map(makeCourseItem)}
                onViewAll={() => setTab('course')}
              />
            )}

            {/* 섹션 5: 맞춤 추천 */}
            <RecommendSection
              lang={lang}
              title={{ ko: `${nickname}님을 위한 맞춤 추천 👤`, zh: `为${nickname}推荐 👤`, en: `Picks for ${nickname} 👤` }}
              subtitle={{ ko: '최근 관심사 기반 추천', zh: '根据最近兴趣推荐', en: 'Based on your recent interests' }}
              items={personalItems}
              onViewAll={() => setTab(recentTab)}
            />

            {/* 섹션 6: 삼겹살 맛집 추천 */}
            {samgyeop.length >= 2 && (
              <RecommendSection
                lang={lang}
                title={{ ko: '삼겹살 맛집 추천 🥩', zh: '五花肉美食推荐 🥩', en: 'Samgyeopsal Restaurants 🥩' }}
                subtitle={{ ko: '한국 와서 삼겹살은 필수!', zh: '来韩国一定要吃五花肉！', en: 'Samgyeopsal is a must in Korea!' }}
                items={samgyeop.map(makeRestaurantItem)}
                onViewAll={() => setTab('food')}
              />
            )}

            {/* 브랜드 할인 가로 스크롤 */}
            <BrandScrollSection lang={lang} />

            {/* 섹션 7: 할인 중인 패션 브랜드 */}
            <RecommendSection
              lang={lang}
              title={{ ko: '할인 중인 패션 브랜드 🛍️', zh: '折扣时尚品牌 🛍️', en: 'Fashion Brands on Sale 🛍️' }}
              subtitle={{ ko: '면세 + 시즌 세일 브랜드', zh: '免税 + 季节折扣品牌', en: 'Duty-free + seasonal sale brands' }}
              items={[
                { name: L(lang, { ko: '무신사 스토어', zh: 'MUSINSA', en: 'MUSINSA Store' }), image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', tags: [L(lang, { ko: '최대 70% OFF', zh: '最高70%折扣', en: 'Up to 70% OFF' })], sub: L(lang, { ko: '한국 최대 패션 플랫폼', zh: '韩国最大时尚平台', en: "Korea's largest fashion platform" }), review: L(lang, { ko: '한국 패션 트렌드 한눈에!', zh: '韩国时尚趋势一目了然', en: 'Korean fashion trends at a glance!' }), onClick: () => setTab('shopping') },
                { name: L(lang, { ko: '올리브영', zh: 'Olive Young', en: 'Olive Young' }), image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop', tags: [L(lang, { ko: '외국인 할인', zh: '外国人折扣', en: 'Foreigner discount' })], sub: L(lang, { ko: 'K-뷰티 쇼핑 성지', zh: 'K-Beauty购物圣地', en: 'K-Beauty shopping mecca' }), review: L(lang, { ko: 'K-뷰티 원픽! 면세보다 쌀 때도 있어요', zh: 'K-Beauty首选！有时比免税店还便宜', en: 'K-Beauty #1 pick! Sometimes cheaper than duty-free' }), onClick: () => setTab('shopping') },
              ]}
              onViewAll={() => setTab('shopping')}
            />

            {/* 섹션 8: 저녁 레스토랑 추천 */}
            {dinnerRestaurants.length >= 2 && (
              <RecommendSection
                lang={lang}
                title={{ ko: '저녁 레스토랑 추천 🌙', zh: '晚餐餐厅推荐 🌙', en: 'Dinner Restaurant Picks 🌙' }}
                subtitle={{ ko: '오늘 저녁은 여기 어때요?', zh: '今晚去这里怎么样？', en: 'How about here for dinner tonight?' }}
                items={dinnerRestaurants.map(makeRestaurantItem)}
                onViewAll={() => setTab('food')}
              />
            )}

            {/* 섹션 9: 봄철 여행지 추천 */}
            {springCourses.length >= 2 && (
              <RecommendSection
                lang={lang}
                title={{ ko: '봄철 여행지 추천 🌸', zh: '春季旅游推荐 🌸', en: 'Spring Travel Picks 🌸' }}
                subtitle={{ ko: '3~5월 벚꽃 시즌 필수 코스', zh: '3~5月樱花季必去路线', en: 'Must-visit during cherry blossom season' }}
                items={springCourses.map(makeCourseItem)}
                onViewAll={() => setTab('course')}
              />
            )}

            {/* 섹션 10: 해외 배송 서비스 */}
            <RecommendSection
              lang={lang}
              title={{ ko: '해외 배송 서비스 📦', zh: '国际快递服务 📦', en: 'International Shipping 📦' }}
              subtitle={{ ko: '한국에서 산 것, 집까지 배송!', zh: '在韩国买的东西寄回家！', en: 'Ship your Korean purchases home!' }}
              items={[
                { name: 'EMS', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop', tags: [L(lang, { ko: '한국우체국', zh: '韩国邮局', en: 'Korea Post' }), L(lang, { ko: '3~7일', zh: '3~7天', en: '3~7 days' })], sub: L(lang, { ko: 'EMS 국제특송', zh: 'EMS国际快递', en: 'EMS International Express' }), review: L(lang, { ko: '귀국 전 택배 보내면 빈손 여행 가능!', zh: '回国前寄快递，空手旅行！', en: 'Ship before departure, travel light!' }), onClick: () => setTab('parcel') },
                { name: L(lang, { ko: 'SF Express (顺丰)', zh: '顺丰快递', en: 'SF Express' }), image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop', tags: [L(lang, { ko: '중국 배송 전문', zh: '中国配送专家', en: 'China delivery' }), L(lang, { ko: '2~5일', zh: '2~5天', en: '2~5 days' })], review: L(lang, { ko: '중국 배송은 순풍이 가장 빠르고 안전', zh: '寄中国顺丰最快最安全', en: 'Fastest & safest for China delivery' }), onClick: () => setTab('parcel') },
              ]}
              onViewAll={() => setTab('parcel')}
            />

            {/* 섹션 11: 베지테리언 맛집 */}
            <RecommendSection
              lang={lang}
              title={{ ko: '베지테리언 맛집 🥬', zh: '素食餐厅 🥬', en: 'Vegetarian Restaurants 🥬' }}
              subtitle={{ ko: '채식주의자도 걱정 없는 한국 여행', zh: '素食者也能放心的韩国之旅', en: 'Worry-free Korea trip for vegetarians' }}
              items={[
                { name: L(lang, { ko: '플랜트', zh: 'Plant', en: 'Plant' }), image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', tags: [L(lang, { ko: '이태원', zh: '梨泰院', en: 'Itaewon' }), L(lang, { ko: '비건', zh: '纯素', en: 'Vegan' })], sub: L(lang, { ko: '서울 이태원, 비건 레스토랑', zh: '首尔梨泰院 纯素餐厅', en: 'Vegan restaurant in Itaewon, Seoul' }), review: L(lang, { ko: '채식주의자 천국, 맛까지 보장', zh: '素食者天堂，味道也有保障', en: 'Vegetarian paradise with guaranteed taste' }), onClick: () => setTab('food') },
                { name: L(lang, { ko: '오세계향', zh: '五世界香', en: 'Osegyehyang' }), image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&h=300&fit=crop', tags: [L(lang, { ko: '종로구', zh: '钟路区', en: 'Jongno' }), L(lang, { ko: '사찰 음식', zh: '寺庙料理', en: 'Temple food' })], sub: L(lang, { ko: '서울 종로구, 사찰 음식', zh: '首尔钟路区 寺庙料理', en: 'Temple cuisine in Jongno, Seoul' }), review: L(lang, { ko: '사찰 음식의 정수, 마음이 편안해져요', zh: '寺庙料理的精髓，让心灵平静', en: 'Essence of temple food, soothes the soul' }), onClick: () => setTab('food') },
              ]}
              onViewAll={() => setTab('food')}
            />

            {/* 섹션 12: 뷰티케어 몰아사기 */}
            <RecommendSection
              lang={lang}
              title={{ ko: '뷰티케어 몰아사기 💄', zh: 'K-Beauty大采购 💄', en: 'K-Beauty Haul 💄' }}
              subtitle={{ ko: '한국에서만 살 수 있는 K-뷰티', zh: '只有在韩国才能买到的K-Beauty', en: 'K-Beauty you can only get in Korea' }}
              items={[
                { name: L(lang, { ko: '올리브영 명동 본점', zh: 'Olive Young 明洞总店', en: 'Olive Young Myeongdong' }), image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop', tags: [L(lang, { ko: 'K-뷰티 성지', zh: 'K-Beauty圣地', en: 'K-Beauty mecca' }), L(lang, { ko: '외국인 15% 할인', zh: '外国人85折', en: '15% off for foreigners' })], onClick: () => setTab('shopping') },
                { name: L(lang, { ko: '시코르 신세계 강남점', zh: 'CHICOR 新世界江南店', en: 'CHICOR Shinsegae Gangnam' }), image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop', tags: [L(lang, { ko: '프리미엄 뷰티', zh: '高端美妆', en: 'Premium beauty' })], sub: L(lang, { ko: '프리미엄 뷰티 편집숍', zh: '高端美妆编辑店', en: 'Premium beauty select shop' }), onClick: () => setTab('shopping') },
              ]}
              onViewAll={() => setTab('shopping')}
            />
          </>
        )
      })()}

      {/* ─── 플로팅 SOS 버튼 ─── */}
      {isVisible('emergency') && (
        <button
          onClick={() => setOverlay('emergency')}
          className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-[#DC2626] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          style={{ boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)' }}
        >
          <span className="text-lg font-bold">SOS</span>
        </button>
      )}

      {/* ─── 토스트 ─── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 text-white text-sm px-6 py-3 rounded-full shadow-lg z-50 animate-pulse" style={{ backgroundColor: 'var(--text-primary)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

export { TreeSection, LucideIcon, WidgetContent, getEnabledPocketsForSection, trackActivity }
