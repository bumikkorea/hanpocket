import { useState, useEffect, lazy, Suspense } from 'react'
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
  first: 'from-sky-400 to-blue-500',
  kpop: 'from-violet-400 to-purple-500',
  food: 'from-orange-400 to-red-500',
  shopping: 'from-pink-400 to-rose-500',
  nature: 'from-green-400 to-emerald-500',
  history: 'from-amber-500 to-yellow-600',
  busan: 'from-cyan-400 to-teal-500',
  jeju: 'from-lime-400 to-green-500',
  other_region: 'from-slate-400 to-slate-600',
}

// ── 상황별 한국어 데이터 ──
const SCENE_PHRASES = [
  { scene: { ko: '식당', zh: '餐厅', en: 'Restaurant' }, phrase: { ko: '이거 주세요', zh: '请给我这个' }, gradient: 'from-orange-300 to-orange-500', pocket: 'restaurant' },
  { scene: { ko: '카페', zh: '咖啡厅', en: 'Cafe' }, phrase: { ko: '아이스 아메리카노 주세요', zh: '请给我冰美式' }, gradient: 'from-amber-300 to-amber-500', pocket: 'cafe' },
  { scene: { ko: '교통', zh: '交通', en: 'Transport' }, phrase: { ko: '여기 가 주세요', zh: '请去这里' }, gradient: 'from-blue-300 to-blue-500', pocket: 'transport' },
  { scene: { ko: '편의점', zh: '便利店', en: 'Store' }, phrase: { ko: '봉투 주세요', zh: '请给我袋子' }, gradient: 'from-green-300 to-green-500', pocket: 'convenience' },
  { scene: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, phrase: { ko: '좀 깎아 주세요', zh: '请便宜一点' }, gradient: 'from-pink-300 to-pink-500', pocket: 'shopping' },
  { scene: { ko: '숙소', zh: '住宿', en: 'Hotel' }, phrase: { ko: '체크인 하려고요', zh: '我要办入住' }, gradient: 'from-indigo-300 to-indigo-500', pocket: 'accommodation' },
  { scene: { ko: '긴급', zh: '紧急', en: 'Emergency' }, phrase: { ko: '도와주세요!', zh: '请帮帮我！' }, gradient: 'from-red-300 to-red-500', pocket: 'emergency' },
]

export default function HomeTab({ profile, lang, exchangeRate, setTab }) {
  const weather = useWeatherData()
  const koreaTime = useKoreaTime()
  const todayExpr = getTodayExpression()

  // 환율: prop에서 CNY 환율 추출
  const cnyRate = exchangeRate?.CNY || 191

  // 코스 데이터 (test 카테고리 제외, 첫 6개)
  const courses = RECOMMENDED_COURSES.filter(c => c.category !== 'test').slice(0, 6)

  // 시간대별 인사말
  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = profile?.name
    let greet
    if (hour >= 6 && hour < 12) greet = L(lang, { ko: '좋은 아침이에요', zh: '早上好', en: 'Good morning' })
    else if (hour >= 12 && hour < 18) greet = L(lang, { ko: '좋은 오후예요', zh: '下午好', en: 'Good afternoon' })
    else if (hour >= 18 && hour < 22) greet = L(lang, { ko: '좋은 저녁이에요', zh: '晚上好', en: 'Good evening' })
    else greet = L(lang, { ko: '좋은 밤이에요', zh: '晚安', en: 'Good night' })

    if (name) {
      return lang === 'ko' ? `${name}님, ${greet}` : lang === 'zh' ? `${name}，${greet}` : `${greet}, ${name}`
    }
    return greet
  }

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
      className="bg-[#FCFCFA] overflow-y-auto px-4 pt-4 pb-24"
      style={{ fontFamily: 'Inter, sans-serif', height: 'calc(100vh - 140px)' }}
    >
      {/* ─── 0. 시간대별 인사말 ─── */}
      <p className="text-2xl font-light text-gray-800 mb-4">{getGreeting()}</p>

      {/* ─── 1. 상단 유틸리티 칩 바 ─── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8">
        <div
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: '#E8F4FD', color: '#1E3A5F' }}
        >
          {L(lang, { ko: '서울', zh: '首尔', en: 'Seoul' })} {weather ? `${weather.temp}°C` : '—°C'}
        </div>
        <div
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: '#FFF3E0', color: '#7C4700' }}
        >
          ¥1 = ₩{Math.round(cnyRate)}
        </div>
        <div
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: '#F3E5F5', color: '#4A148C' }}
        >
          {L(lang, { ko: '한국', zh: '韩国', en: 'Korea' })} {koreaTime}
        </div>
      </div>

      {/* ─── 2. 추천 코스 섹션 ─── */}
      <div className="mb-8">
        <button
          onClick={() => setTab('course')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h2 className="text-lg font-bold text-[#111827]">
            {L(lang, { ko: '추천 코스', zh: '推荐路线', en: 'Recommended Courses' })}
          </h2>
          <span className="text-[#9CA3AF] text-lg">&rarr;</span>
        </button>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setTab('course')}
              className="snap-start flex-shrink-0 rounded-2xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform"
              style={{ width: 220 }}
            >
              <div
                className={`bg-gradient-to-br ${COURSE_GRADIENTS[course.category] || 'from-gray-400 to-gray-600'} flex items-end p-4`}
                style={{ height: 196 }}
              >
                <p className="text-white text-xl font-bold leading-tight text-left">
                  {L(lang, course.name)}
                </p>
              </div>
              <div className="bg-white p-3" style={{ height: 84 }}>
                <p className="text-xs text-[#6B7280] line-clamp-2 text-left">
                  {L(lang, course.description)}
                </p>
                <p className="text-[10px] text-[#9CA3AF] mt-2 text-left">
                  {course.stops.length}{L(lang, { ko: '개 장소', zh: '个地点', en: ' spots' })} · {course.duration}
                </p>
              </div>
            </button>
          ))}
          {/* 더보기 카드 */}
          <button
            onClick={() => setTab('course')}
            className="snap-start flex-shrink-0 rounded-2xl border-2 border-dashed border-[#D1D5DB] flex items-center justify-center active:scale-[0.98] transition-transform"
            style={{ width: 220, height: 280 }}
          >
            <div className="text-center">
              <p className="text-2xl text-[#9CA3AF] mb-2">&rarr;</p>
              <p className="text-sm font-medium text-[#6B7280]">
                {L(lang, { ko: '더보기', zh: '查看更多', en: 'View More' })}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ─── 3. 오늘의 한국어 배너 ─── */}
      <div
        className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 mb-8 active:scale-[0.98] transition-transform cursor-pointer"
        style={{ height: 140 }}
        onClick={() => setTab('learn')}
      >
        <p className="text-white/70 text-xs font-medium mb-2">
          {L(lang, { ko: '오늘의 한국어', zh: '今日韩语', en: "Today's Korean" })}
        </p>
        <p className="text-white text-3xl font-bold mb-1">{todayExpr.korean}</p>
        <p className="text-white/80 text-sm">{todayExpr.chinese} · {todayExpr.english}</p>
        <p className="text-white/60 text-xs mt-2">
          {L(lang, { ko: '매일 새로운 표현', zh: '每天新表达', en: 'New expression daily' })} &rarr;
        </p>
      </div>

      {/* ─── 4. 여행 필수 가이드 ─── */}
      <div className="mb-8">
        <button
          onClick={() => setTab('travel')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h2 className="text-lg font-bold text-[#111827]">
            {L(lang, { ko: '여행 필수', zh: '旅行必备', en: 'Travel Essentials' })}
          </h2>
          <span className="text-[#9CA3AF] text-lg">&rarr;</span>
        </button>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: { ko: '입국카드', zh: '入境卡填写', en: 'Arrival Card' }, gradient: 'from-blue-400 to-blue-600', guide: 'arrival-card' },
            { title: { ko: 'SIM/eSIM', zh: 'SIM/eSIM', en: 'SIM/eSIM' }, gradient: 'from-green-400 to-emerald-600', guide: 'sim' },
            { title: { ko: '세금환급', zh: '退税指南', en: 'Tax Refund' }, gradient: 'from-amber-400 to-orange-500', guide: 'tax-refund' },
            { title: { ko: '면세한도', zh: '免税限额', en: 'Duty Free' }, gradient: 'from-rose-400 to-pink-600', guide: 'duty-free' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveGuide(item.guide)}
              className={`rounded-2xl bg-gradient-to-br ${item.gradient} p-4 flex items-end active:scale-[0.98] transition-transform`}
              style={{ height: 120 }}
            >
              <p className="text-white text-base font-bold leading-tight text-left">
                {L(lang, item.title)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 5. 긴급 연락처 배너 ─── */}
      <button
        onClick={() => setTab('sos')}
        className="w-full rounded-2xl bg-red-50 border border-red-200 px-4 py-4 mb-8 active:scale-[0.98] transition-transform text-left"
        style={{ minHeight: 80 }}
      >
        <p className="text-red-700 text-sm font-bold mb-1">
          {L(lang, { ko: '긴급 상황?', zh: '紧急情况？', en: 'Emergency?' })}
        </p>
        <p className="text-red-600 text-xs">
          112({L(lang, { ko: '경찰', zh: '警察', en: 'Police' })}) · 119({L(lang, { ko: '소방/구급', zh: '消防/急救', en: 'Fire/Ambulance' })}) · 1345({L(lang, { ko: '외국인상담', zh: '外国人咨询', en: 'Foreigner Help' })})
        </p>
      </button>

      {/* ─── 6. 상황별 한국어 ─── */}
      <div className="mb-8">
        <button
          onClick={() => setTab('learn')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h2 className="text-lg font-bold text-[#111827]">
            {L(lang, { ko: '상황별 한국어', zh: '场景韩语', en: 'Korean by Situation' })}
          </h2>
          <span className="text-[#9CA3AF] text-lg">&rarr;</span>
        </button>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
          {SCENE_PHRASES.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (item.pocket === 'shopping') setTab('shopping')
                else if (item.pocket === 'emergency') setTab('sos')
                else setTab('learn')
              }}
              className="snap-start flex-shrink-0 rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
              style={{ width: 160 }}
            >
              <div
                className={`bg-gradient-to-br ${item.gradient} flex items-end p-3`}
                style={{ height: 120 }}
              >
                <p className="text-white text-base font-bold text-left">
                  {L(lang, item.scene)}
                </p>
              </div>
              <div className="bg-white p-3" style={{ height: 80 }}>
                <p className="text-sm font-medium text-[#111827] text-left">{item.phrase.ko}</p>
                <p className="text-xs text-[#6B7280] mt-1 text-left">{item.phrase.zh}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 7. 인기 서비스 ─── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#111827] mb-4">
          {L(lang, { ko: '인기 서비스', zh: '热门服务', en: 'Popular Services' })}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: { ko: '맛집', zh: '美食', en: 'Food' }, gradient: 'from-orange-400 to-red-500', tab: 'food' },
            { title: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, gradient: 'from-pink-400 to-rose-500', tab: 'shopping' },
            { title: { ko: '한류', zh: '韩流', en: 'Hallyu' }, gradient: 'from-violet-400 to-purple-500', tab: 'hallyu' },
            { title: { ko: '의료', zh: '医疗', en: 'Medical' }, gradient: 'from-teal-400 to-cyan-600', tab: 'medical' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setTab(item.tab)}
              className={`rounded-2xl bg-gradient-to-br ${item.gradient} p-4 flex items-end active:scale-[0.98] transition-transform`}
              style={{ height: 100 }}
            >
              <p className="text-white text-base font-bold text-left">
                {L(lang, item.title)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 가이드 오버레이 ─── */}
      {activeGuide && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-white flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" /></div>}>
          {activeGuide === 'arrival-card' && <ArrivalCardGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'sim' && <SimGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'tax-refund' && <TaxRefundGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'duty-free' && <DutyFreeGuide lang={lang} onClose={() => setActiveGuide(null)} />}
        </Suspense>
      )}

      {/* ─── 토스트 ─── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-sm px-6 py-3 rounded-full shadow-lg z-50 animate-pulse">
          {toast}
        </div>
      )}
    </div>
  )
}

export { TreeSection, LucideIcon, WidgetContent, getEnabledPocketsForSection, trackActivity }
