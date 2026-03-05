import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { ChevronLeft, ChevronRight, Plus, Pencil } from 'lucide-react'
import { RECOMMENDED_COURSES } from '../data/recommendedCourses'

const ArrivalCardGuide = lazy(() => import('./guides/ArrivalCardGuide'))
const SimGuide = lazy(() => import('./guides/SimGuide'))
const TaxRefundGuide = lazy(() => import('./guides/TaxRefundGuide'))
const DutyFreeGuide = lazy(() => import('./guides/DutyFreeGuide'))
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
    id: 'move',
    emoji: '🚕',
    label: { ko: '이동하고 싶어요', zh: '想去某个地方', en: 'Want to move' },
    sub: { ko: '택시, 지하철, 버스', zh: '出租车、地铁、公交', en: 'Taxi, subway, bus' },
    color: '#1A3A28',
  },
  {
    id: 'sick',
    emoji: '🏥',
    label: { ko: '아파요 / 긴급', zh: '生病了/紧急', en: 'Sick / Emergency' },
    sub: { ko: '병원, 약국, 경찰, 대사관', zh: '医院、药店、警察、大使馆', en: 'Hospital, pharmacy, police' },
    color: '#DC2626',
  },
  {
    id: 'shopping',
    emoji: '🛍️',
    label: { ko: '쇼핑하고 싶어요', zh: '想购物', en: 'Want to shop' },
    sub: { ko: '면세, 환급, 올리브영', zh: '免税、退税、Olive Young', en: 'Duty-free, tax refund' },
    color: '#6B4C3B',
  },
]

export default function HomeTab({ lang, exchangeRate, setTab, widgetSettings = {} }) {
  const isVisible = (key) => widgetSettings[key] !== false
  const weather = useWeatherData()
  const { kst: koreaTime, extras: extraTimezones, refresh: refreshTimezones } = useMultiTimezone()
  const todayExpr = getTodayExpression()

  // 환율: prop에서 CNY 환율 추출
  const cnyRate = exchangeRate?.CNY || 191

  // 코스 데이터 (test 카테고리 제외, 첫 6개)
  const courses = RECOMMENDED_COURSES.filter(c => c.category !== 'test').slice(0, 6)

  // 가이드 오버레이 상태
  const [activeGuide, setActiveGuide] = useState(null)

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
      <div className="px-4 mb-4 flex items-center gap-2 text-xs flex-wrap" style={{ color: '#999999' }}>
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
        <h2 className="text-base font-bold px-4 mb-3" style={{ color: '#1A1A1A' }}>
          {L(lang, { ko: '지금 뭐 하고 싶어요?', zh: '现在想做什么？', en: 'What do you need?' })}
        </h2>
        <div className="pl-4 pr-0 flex gap-3 overflow-x-auto scroll-indicator snap-x snap-mandatory scroll-pl-4 pb-2">
          {INTENT_CARDS.map(card => (
            <button
              key={card.id}
              onClick={() => {
                if (card.id === 'just-arrived') { setArrivalStep('splash'); setShowArrivalFlow(true) }
                else if (card.id === 'hungry') setTab('food')
                else if (card.id === 'move') setTab('transport')
                else if (card.id === 'sick') setTab('sos')
                else if (card.id === 'shopping') setTab('shopping')
              }}
              className="snap-start flex-shrink-0 bg-white rounded-2xl border border-[#E5E7EB] p-3 active:scale-[0.97] transition-transform duration-150 text-left"
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

      {/* ─── 3. 여행 필수 가이드 (4x2 그리드) ─── */}
      <div className="mb-8 px-4">
        <button
          onClick={() => setTab('travel')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '여행 필수', zh: '旅行必备', en: 'Travel Essentials' })}
          </h2>
          <span className="text-sm" style={{ color: '#666666' }}>&rarr;</span>
        </button>
        <div className="grid grid-cols-2 gap-2">
          {[
            { title: { ko: '입국카드', zh: '入境卡填写', en: 'Arrival Card' }, sub: { ko: '한국 여행 외국인 누구나 작성', zh: '所有来韩外国人必填', en: 'Required for all foreign visitors' }, gradient: 'from-[#2D5A3D] to-[#1A3A28]', guide: 'arrival-card', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=200&fit=crop' },
            { title: { ko: 'SIM/eSIM', zh: 'SIM/eSIM', en: 'SIM/eSIM' }, sub: { ko: '미리 로밍 못했다면?', zh: '没提前开通漫游？', en: "Didn't set up roaming?" }, gradient: 'from-[#4A8A5A] to-[#2D5A3D]', guide: 'sim', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=200&fit=crop' },
            { title: { ko: '세금환급', zh: '退税指南', en: 'Tax Refund' }, sub: { ko: '어디서/어떻게 돌려받죠?', zh: '在哪里/怎么退税？', en: 'Where/how to get refund?' }, gradient: 'from-[#B8860B] to-[#8B6914]', guide: 'tax-refund', img: 'https://images.unsplash.com/photo-1554672408-730436b60dde?w=400&h=200&fit=crop' },
            { title: { ko: '면세한도', zh: '免税限额', en: 'Duty Free' }, sub: { ko: '쇼핑 후 출국 시 반드시 체크', zh: '购물后出境必查', en: 'Must check before departure' }, gradient: 'from-[#A0865A] to-[#7A6840]', guide: 'duty-free', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=200&fit=crop' },
            { title: { ko: '택시 잡기', zh: '叫出租车', en: 'Get a Taxi' }, sub: { ko: '한국 번호 없어도 돼요', zh: '不需要韩国手机号', en: 'No Korean number needed' }, gradient: 'from-[#2D5A3D] to-[#1A3A28]', guide: null, action: 'taxi', img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=200&fit=crop' },
            { title: { ko: '교통카드', zh: '交通卡/车票', en: 'Transit Card' }, sub: { ko: '현금 안 받는 버스 많아요!', zh: '很多公交不收现金！', en: "Many buses don't accept cash!" }, gradient: 'from-[#4A8A5A] to-[#2D5A3D]', guide: 'transit', img: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&h=200&fit=crop' },
            { title: { ko: '한국지도', zh: '韩国地图', en: 'Korea Map' }, sub: { ko: '카카오맵 필수 설치', zh: '必装KakaoMap', en: 'Must install KakaoMap' }, gradient: 'from-[#B8860B] to-[#8B6914]', guide: 'map-guide', action: 'map', img: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69c07a?w=400&h=200&fit=crop' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (item.action === 'map') setActiveGuide('map-guide')
                else if (item.guide) setActiveGuide(item.guide)
                else if (item.action === 'taxi') {
                  const iframe = document.createElement('iframe')
                  iframe.style.display = 'none'
                  iframe.src = 'kakaot://'
                  document.body.appendChild(iframe)
                  setTimeout(() => {
                    document.body.removeChild(iframe)
                    window.open('https://t.kakao.com', '_blank')
                  }, 1500)
                }
                else if (item.action === 'sos') setTab('sos')
              }}
              className="rounded-2xl overflow-hidden active:scale-[0.97] transition-transform duration-150 border border-[#E5E7EB]"
            >
              <div className="relative h-[80px]">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
                {item.img && <img src={item.img} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.style.display = 'none' }} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-2.5 bg-white text-left">
                <p className="text-sm font-bold leading-tight" style={{ color: '#1A1A1A' }}>
                  {L(lang, item.title)}
                </p>
                <p className="text-[10px] mt-0.5 leading-tight line-clamp-1" style={{ color: '#999999' }}>{L(lang, item.sub)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 5. 상황별 한국어 ─── */}
      <div className="mb-8">
        <div className="flex items-center justify-between w-full mb-3 px-4">
          <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '상황별 한국어', zh: '场景韩语', en: 'Korean by Situation' })}
          </h2>
        </div>
        <div className="pl-4 pr-0 flex gap-2 overflow-x-auto scroll-indicator snap-x snap-mandatory scroll-pl-4 pb-2">
          {SCENE_PHRASES.map((item, i) => (
            <button
              key={i}
              onClick={() => setTab(item.pocket)}
              className={`snap-start flex-shrink-0 rounded-2xl overflow-hidden active:scale-[0.97] transition-transform duration-150 border ${item.pocket === 'emergency' ? 'border-red-400 border-2' : 'border-[#E5E7EB]'}`}
              style={{ width: 130 }}
            >
              <div className="relative" style={{ height: 84 }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
                <img src={item.img} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.style.display = 'none' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-2.5 left-2.5 text-white text-sm font-bold text-left z-10">
                  {L(lang, item.scene)}
                </p>
              </div>
              <div className="p-2.5" style={{ backgroundColor: '#FFFFFF', height: 56 }}>
                <p className="text-xs font-medium text-left" style={{ color: '#1A1A1A' }}>{item.phrase.ko}</p>
                <p className="text-[11px] mt-0.5 text-left" style={{ color: '#666666' }}>{item.phrase.zh}</p>
              </div>
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
          <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '추천 코스', zh: '推荐路线', en: 'Recommended Courses' })}
          </h2>
          <span className="text-sm" style={{ color: '#666666' }}>&rarr;</span>
        </button>
        <div className="pl-4 pr-0 flex gap-3 overflow-x-auto scroll-indicator snap-x snap-mandatory scroll-pl-4 pb-2">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setTab('course')}
              className="snap-start flex-shrink-0 rounded-2xl overflow-hidden active:scale-[0.97] transition-transform duration-150 border border-[#E5E7EB]"
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
      {activeGuide && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-white flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" /></div>}>
          {activeGuide === 'map-guide' && (
            <GuideLayout title={{ ko: '한국 지도 앱', zh: '韩国地图APP', en: 'Korea Map Apps' }} lang={lang} onClose={() => setActiveGuide(null)}>
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
          {activeGuide === 'transit' && (
            <GuideLayout
              title={{ ko: '교통카드 & 표 구매', zh: '交通卡 & 购票指南', en: 'Transit Card & Tickets' }}
              lang={lang}
              onClose={() => setActiveGuide(null)}
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
          {activeGuide === 'arrival-card' && <ArrivalCardGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'sim' && <SimGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'tax-refund' && <TaxRefundGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'duty-free' && <DutyFreeGuide lang={lang} onClose={() => setActiveGuide(null)} />}
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
              { id: 'immigration', emoji: '🛬', label: { ko: '입국신고할게요', zh: '入境申报', en: 'Immigration forms' }, sub: { ko: '전자/실물 입국신고서, 세관신고', zh: '电子/纸质入境卡、海关申报', en: 'E-form, paper form, customs' } },
              { id: 'transport', emoji: '🚕', label: { ko: '택시/대중교통 이용할래요', zh: '坐出租车/公共交通', en: 'Taxi / Public transit' }, sub: { ko: '공항택시, RIDE앱, AREX, 교통카드', zh: '机场出租车、RIDE APP、AREX、交通卡', en: 'Airport taxi, RIDE app, AREX, transit card' } },
              { id: 'sim-exchange', emoji: '💱', label: { ko: 'SIM카드 구매 & 환전할래요', zh: '买SIM卡 & 换钱', en: 'Buy SIM & Exchange money' }, sub: { ko: 'eSIM, 공항 환전, 명동 환전소', zh: 'eSIM、机场换钱、明洞换钱所', en: 'eSIM, airport exchange, Myeongdong' } },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setArrivalStep(item.id)}
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
              {L(lang, { ko: '🛬 입국신고', zh: '🛬 入境申报', en: '🛬 Immigration' })}
            </h2>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <button
              onClick={() => { setActiveGuide('arrival-card'); setShowArrivalFlow(false) }}
              className="rounded-2xl border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform"
            >
              <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '전자 입국신고서 작성', zh: '电子入境卡填写', en: 'Electronic Arrival Card' })}</p>
              <p className="text-xs text-[#666666] leading-relaxed mt-1">
                {L(lang, { ko: 'Q-CODE 앱이나 사이트에서 미리 작성 가능. 비행기 안에서도 Wi-Fi로 가능!', zh: '可在Q-CODE APP或网站提前填写。飞机上也可用Wi-Fi填写！', en: 'Fill in advance via Q-CODE app or website. Also possible on the plane via Wi-Fi!' })}
              </p>
            </button>
            <button
              onClick={() => { setActiveGuide('arrival-card'); setShowArrivalFlow(false) }}
              className="rounded-2xl border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform"
            >
              <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '실물 입국신고서 작성', zh: '纸质入境卡填写', en: 'Paper Arrival Card' })}</p>
              <p className="text-xs text-[#666666] leading-relaxed mt-1">
                {L(lang, { ko: '기내에서 나눠주는 종이 입국신고서. 영문 이름, 여권번호, 체류주소 등 기재.', zh: '飞机上发的纸质入境卡。填写英文姓名、护照号、住宿地址等。', en: 'Paper form distributed on the plane. Fill in English name, passport number, accommodation address, etc.' })}
              </p>
            </button>
            <button
              onClick={() => { setActiveGuide('duty-free'); setShowArrivalFlow(false) }}
              className="rounded-2xl border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform"
            >
              <p className="text-sm font-bold text-[#1A1A1A]">{L(lang, { ko: '세관신고서 작성 (필요 시)', zh: '海关申报单（如需）', en: 'Customs Declaration (if needed)' })}</p>
              <p className="text-xs text-[#666666] leading-relaxed mt-1">
                {L(lang, { ko: '$10,000 이상 현금, 면세 초과 물품 등이 있을 때만 작성. 없으면 패스!', zh: '仅携带超过$10,000现金或超额免税品时需填写。没有就不用！', en: 'Only needed if carrying over $10,000 cash or excess duty-free goods. Skip if not!' })}
              </p>
            </button>
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
                    onClick={() => { setActiveGuide('sim'); setShowArrivalFlow(false) }}
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

      {/* ─── 플로팅 SOS 버튼 ─── */}
      {isVisible('emergency') && (
        <button
          onClick={() => setTab('sos')}
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
