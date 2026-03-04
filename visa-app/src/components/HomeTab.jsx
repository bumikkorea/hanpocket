import { useState, useEffect, lazy, Suspense } from 'react'
import { ChevronLeft } from 'lucide-react'
import { RECOMMENDED_COURSES } from '../data/recommendedCourses'

const ArrivalCardGuide = lazy(() => import('./guides/ArrivalCardGuide'))
const SimGuide = lazy(() => import('./guides/SimGuide'))
const TaxRefundGuide = lazy(() => import('./guides/TaxRefundGuide'))
const DutyFreeGuide = lazy(() => import('./guides/DutyFreeGuide'))

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

// ── 한국 시간 훅 ──
function useKoreaTime() {
  const [time, setTime] = useState(() => {
    const now = new Date()
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const kr = new Date(utc + 9 * 3600000)
    return kr.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  })
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date()
      const utc = now.getTime() + now.getTimezoneOffset() * 60000
      const kr = new Date(utc + 9 * 3600000)
      setTime(kr.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }, 30000)
    return () => clearInterval(t)
  }, [])
  return time
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

export default function HomeTab({ lang, exchangeRate, setTab }) {
  const weather = useWeatherData()
  const koreaTime = useKoreaTime()
  const todayExpr = getTodayExpression()

  // 환율: prop에서 CNY 환율 추출
  const cnyRate = exchangeRate?.CNY || 191

  // 코스 데이터 (test 카테고리 제외, 첫 6개)
  const courses = RECOMMENDED_COURSES.filter(c => c.category !== 'test').slice(0, 6)

  // 가이드 오버레이 상태
  const [activeGuide, setActiveGuide] = useState(null)

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
      <div className="px-4 mb-4 flex items-center gap-2 text-xs" style={{ color: '#999999' }}>
        <span>{L(lang, { ko: '서울', zh: '首尔', en: 'Seoul' })} {weather ? `${weather.temp}°C` : '—°C'}</span>
        <span>·</span>
        <span>¥1 = ₩{Math.round(cnyRate)}</span>
        <span>·</span>
        <span>KST {koreaTime}</span>
      </div>

      {/* ─── 3. 추천 코스 섹션 ─── */}
      <div className="mb-8">
        <button
          onClick={() => setTab('course')}
          className="flex items-center justify-between w-full mb-3 px-4"
        >
          <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '추천 코스', zh: '推荐路线', en: 'Recommended Courses' })}
          </h2>
          <span className="text-sm" style={{ color: '#666666' }}>&rarr;</span>
        </button>
        <div className="pl-4 pr-0 flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-pl-4 pb-2">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setTab('course')}
              className="snap-start flex-shrink-0 rounded-xl overflow-hidden active:scale-[0.98] transition-transform border border-[#E5E7EB]"
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
            className="snap-start flex-shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center active:scale-[0.98] transition-transform"
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
      </div>

      {/* ─── 4. 여행 필수 가이드 (4x2 그리드) ─── */}
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
            { title: { ko: '입국카드', zh: '入境卡填写', en: 'Arrival Card' }, gradient: 'from-[#2D5A3D] to-[#1A3A28]', guide: 'arrival-card', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=200&fit=crop' },
            { title: { ko: 'SIM/eSIM', zh: 'SIM/eSIM', en: 'SIM/eSIM' }, gradient: 'from-[#4A8A5A] to-[#2D5A3D]', guide: 'sim', img: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=200&fit=crop' },
            { title: { ko: '세금환급', zh: '退税指南', en: 'Tax Refund' }, gradient: 'from-[#B8860B] to-[#8B6914]', guide: 'tax-refund', img: 'https://images.unsplash.com/photo-1554672408-730436b60dde?w=400&h=200&fit=crop' },
            { title: { ko: '면세한도', zh: '免税限额', en: 'Duty Free' }, gradient: 'from-[#A0865A] to-[#7A6840]', guide: 'duty-free', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=200&fit=crop' },
            { title: { ko: '택시 잡기', zh: '叫出租车', en: 'Get a Taxi' }, gradient: 'from-[#2D5A3D] to-[#1A3A28]', guide: null, action: 'taxi', img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=200&fit=crop' },
            { title: { ko: '교통카드', zh: '交通卡/车票', en: 'Transit Card' }, gradient: 'from-[#4A8A5A] to-[#2D5A3D]', guide: 'transit', img: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&h=200&fit=crop' },
            { title: { ko: '한국지도', zh: '韩国地图', en: 'Korea Map' }, gradient: 'from-[#B8860B] to-[#8B6914]', guide: null, action: 'map', img: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69c07a?w=400&h=200&fit=crop' },
            { title: { ko: '긴급 SOS', zh: '紧急SOS', en: 'Emergency' }, gradient: 'from-[#8B2500] to-[#5C1A00]', guide: null, action: 'sos', img: null },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (item.guide) setActiveGuide(item.guide)
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
                else if (item.action === 'map') {
                  const iframe = document.createElement('iframe')
                  iframe.style.display = 'none'
                  iframe.src = 'baidumap://'
                  document.body.appendChild(iframe)
                  setTimeout(() => {
                    document.body.removeChild(iframe)
                    window.open('https://map.baidu.com', '_blank')
                  }, 1500)
                }
                else if (item.action === 'sos') setTab('sos')
              }}
              className="rounded-xl overflow-hidden relative flex items-end active:scale-[0.98] transition-transform"
              style={{ height: 84 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
              {item.img && <img src={item.img} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.style.display = 'none' }} />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="relative p-3 z-10">
                <p className="text-white text-sm font-bold leading-tight text-left">
                  {L(lang, item.title)}
                </p>
                {item.action === 'map' && (
                  <p className="text-white/70 text-[9px] mt-0.5 text-left">{L(lang, { ko: '바이두 지도로 길찾기', zh: '百度地图找路OK', en: 'Baidu Maps navigation' })}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 5. 상황별 한국어 ─── */}
      <div className="mb-8">
        <button
          onClick={() => setTab('learn')}
          className="flex items-center justify-between w-full mb-3 px-4"
        >
          <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>
            {L(lang, { ko: '상황별 한국어', zh: '场景韩语', en: 'Korean by Situation' })}
          </h2>
          <span className="text-sm" style={{ color: '#666666' }}>&rarr;</span>
        </button>
        <div className="pl-4 pr-0 flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-pl-4 pb-2">
          {SCENE_PHRASES.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (item.pocket === 'shopping') setTab('shopping')
                else if (item.pocket === 'emergency') setTab('sos')
                else setTab('learn')
              }}
              className="snap-start flex-shrink-0 rounded-xl overflow-hidden active:scale-[0.98] transition-transform border border-[#E5E7EB]"
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

      {/* ─── 가이드 오버레이 ─── */}
      {activeGuide && (
        <>
          {activeGuide === 'transit' ? (
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
              <div className="px-4 pt-4 pb-20">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setActiveGuide(null)} className="p-1"><ChevronLeft size={24} /></button>
                  <h1 className="text-lg font-bold text-[#1A1A1A]">{L(lang, { ko: '교통카드 & 표 구매', zh: '交通卡 & 购票指南', en: 'Transit Card & Tickets' })}</h1>
                </div>
                <div className="space-y-4">
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
                      {L(lang, { ko: '앞문 탑승 → T-money 태그 → 하차 시 뒷문에서 태그. 현금(1,450원)도 가능하지만 거스름돈 없음.', zh: '前门上车→刷T-money→下车时后门再刷。可以付现金(1450韩元)但不找零。', en: 'Board at front door → tap T-money → tap again at rear door when exiting. Cash (₩1,450) accepted but no change given.' })}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-[#E5E7EB]">
                    <h3 className="font-bold text-[#1A1A1A] mb-2">💡 {L(lang, { ko: '꿀팁', zh: '实用小贴士', en: 'Tips' })}</h3>
                    <p className="text-sm text-[#666666] leading-relaxed">
                      {L(lang, {
                        ko: '• 환승: 30분 내 버스↔지하철 환승 시 무료\n• 외국인 전용: WOWPASS, NAMANE 카드도 교통카드 기능 있음\n• 충전: 편의점 또는 지하철역 충전기에서 가능',
                        zh: '• 换乘：30分钟内公交↔地铁换乘免费\n• 外国人专用：WOWPASS、NAMANE卡也有交通卡功能\n• 充值：在便利店或地铁站充值机充值',
                        en: '• Transfer: Free transfers between bus↔subway within 30 min\n• Foreigners: WOWPASS, NAMANE cards also work as transit cards\n• Top-up: Available at convenience stores or subway station machines'
                      }).split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Suspense fallback={<div className="fixed inset-0 z-50 bg-white flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" /></div>}>
              {activeGuide === 'arrival-card' && <ArrivalCardGuide lang={lang} onClose={() => setActiveGuide(null)} />}
              {activeGuide === 'sim' && <SimGuide lang={lang} onClose={() => setActiveGuide(null)} />}
              {activeGuide === 'tax-refund' && <TaxRefundGuide lang={lang} onClose={() => setActiveGuide(null)} />}
              {activeGuide === 'duty-free' && <DutyFreeGuide lang={lang} onClose={() => setActiveGuide(null)} />}
            </Suspense>
          )}
        </>
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
