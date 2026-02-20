import { useState, useEffect, useRef } from 'react'
import { Stamp, FileText, BookOpen, ArrowLeftRight, Home, X, User, PawPrint, Newspaper, Music, TrendingUp, Cloud, MapPin, Settings, Calendar, Clock, DollarSign, Package, Utensils, ShoppingBag, Sparkles, Heart, Plane, Star, Play, Volume2, Flame, Train, Check, Tag, Bike, Wrench, GraduationCap, Users, Clapperboard, Shirt, Siren, Coins, MessageCircle, HelpCircle, Globe, Tv, Mic, Thermometer, Landmark, Briefcase, Building2, Dog, ChevronRight, ChevronDown, Plus } from 'lucide-react'
import { widgetCategories, widgetMockData } from '../data/widgets'
import { idolDatabase, IDOL_GENERATIONS, IDOL_COMPANIES } from '../data/idolData'
import { MICHELIN_RESTAURANTS, BLUE_RIBBON_RESTAURANTS, FOOD_CATEGORIES as RESTAURANT_CATEGORIES, LOCATION_FILTERS } from '../data/restaurantData'

const LUCIDE_ICON_MAP = { Stamp, FileText, BookOpen, ArrowLeftRight, Home, X, PawPrint, Newspaper, Music, TrendingUp, Cloud, MapPin, Settings, Calendar, Clock, DollarSign, Package, Utensils, ShoppingBag, Sparkles, Heart, Plane, Star, Play, Volume2, Flame, Train, Check, Tag, Bike, Wrench, GraduationCap, Users, Clapperboard, Shirt, Siren, Coins, MessageCircle, HelpCircle, Globe, Tv, Mic, Thermometer, Landmark, Briefcase, Building2, Dog }
function LucideIcon({ name, size = 16, className = '' }) {
  const Icon = LUCIDE_ICON_MAP[name]
  if (!Icon) return <span className={className}>{name}</span>
  return <Icon size={size} className={className} />
}

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

function getDaysUntil(d) {
  if (!d) return null
  const t = new Date(d), n = new Date()
  t.setHours(0,0,0,0); n.setHours(0,0,0,0)
  return Math.ceil((t - n) / 864e5)
}

function loadWidgetConfig() {
  try { return JSON.parse(localStorage.getItem('home_widgets')) } catch { return null }
}

function saveWidgetConfig(cfg) {
  localStorage.setItem('home_widgets', JSON.stringify(cfg))
}

function getDefaultConfig() {
  const enabled = {}
  const order = widgetCategories.map(c => c.id)
  widgetCategories.forEach(cat => {
    cat.widgets.forEach(w => { enabled[w.id] = true })
  })
  return { enabled, order }
}

// ─── Multi-Currency Exchange Rate Card ───

const CURRENCIES = [
  { code: 'CNY', flag: 'CN', name: '人民币', rate: 191.52 },
  { code: 'HKD', flag: 'HK', name: '港币', rate: 177.80 },
  { code: 'TWD', flag: 'TW', name: '新台币', rate: 42.50 },
  { code: 'MOP', flag: 'MO', name: '澳门元', rate: 171.20 },
  { code: 'USD', flag: 'US', name: '美元', rate: 1384.50 },
  { code: 'JPY', flag: 'JP', name: '日元', rate: 9.21 },
  { code: 'VND', flag: 'VN', name: '越南盾', rate: 0.055 },
  { code: 'PHP', flag: 'PH', name: '比索', rate: 24.10 },
  { code: 'THB', flag: 'TH', name: '泰铢', rate: 39.80 },
]

function ExchangeRateCard({ exchangeRate, lang, compact }) {
  const [amount, setAmount] = useState('1000')
  const [selectedCurrency, setSelectedCurrency] = useState('CNY')
  const curr = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0]
  const rate = exchangeRate?.[selectedCurrency] || curr.rate
  const converted = (parseFloat(amount) || 0) * rate

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#6B7280]">{lang === 'ko' ? '환전 계산기' : lang === 'zh' ? '汇率计算器' : 'Currency Converter'}</span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <select
          value={selectedCurrency}
          onChange={e => setSelectedCurrency(e.target.value)}
          className="text-[11px] font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-1.5 py-1.5 outline-none border-none shrink-0"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
          ))}
        </select>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-0 flex-1 min-w-0 text-right text-sm font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1.5 outline-none"
        />
      </div>
      <div className="text-center text-[#9CA3AF] text-xs my-1">&darr;</div>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-[#111827] shrink-0 px-1.5">KRW</span>
        <div className="w-0 flex-1 min-w-0 text-right text-sm font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1.5 truncate">
          {converted.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
        </div>
      </div>
      <p className="text-[8px] text-[#9CA3AF] text-center mt-1">Last: {exchangeRate?._date || '-'}</p>
    </div>
  )
}

// ─── World Clock Widget ───

const TIMEZONE_COUNTRIES = [
  { id: 'china', name: { ko: '중국', zh: '中国', en: 'China' }, offset: 8, flag: 'CN' },
  { id: 'japan', name: { ko: '일본', zh: '日本', en: 'Japan' }, offset: 9, flag: 'JP' },
  { id: 'vietnam', name: { ko: '베트남', zh: '越南', en: 'Vietnam' }, offset: 7, flag: 'VN' },
  { id: 'philippines', name: { ko: '필리핀', zh: '菲律宾', en: 'Philippines' }, offset: 8, flag: 'PH' },
  { id: 'thailand', name: { ko: '태국', zh: '泰国', en: 'Thailand' }, offset: 7, flag: 'TH' },
  { id: 'indonesia', name: { ko: '인도네시아', zh: '印度尼西亚', en: 'Indonesia' }, offset: 7, flag: 'ID' },
  { id: 'usa_east', name: { ko: '미국(동부)', zh: '美国(东部)', en: 'USA (East)' }, offset: -5, flag: 'US' },
  { id: 'usa_west', name: { ko: '미국(서부)', zh: '美国(西部)', en: 'USA (West)' }, offset: -8, flag: 'US' },
  { id: 'uk', name: { ko: '영국', zh: '英国', en: 'UK' }, offset: 0, flag: 'GB' },
  { id: 'australia', name: { ko: '호주', zh: '澳大利亚', en: 'Australia' }, offset: 11, flag: 'AU' },
]

function getTimeInOffset(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const city = new Date(utc + offset * 3600000)
  return city.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function TimezoneWidget({ lang, compact }) {
  const [selected, setSelected] = useState(() => {
    try { return localStorage.getItem('tz_country') || 'china' } catch { return 'china' }
  })
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const country = TIMEZONE_COUNTRIES.find(c => c.id === selected) || TIMEZONE_COUNTRIES[0]
  const koreaTime = getTimeInOffset(9)
  const countryTime = getTimeInOffset(country.offset)
  const diff = country.offset - 9
  const diffStr = diff === 0 ? lang === 'ko' ? '시차 없음' : lang === 'zh' ? '无时差' : 'No difference' : diff > 0 ? `+${diff}h` : `${diff}h`

  if (compact) return (
    <div>
      <span className="text-[10px] font-semibold text-[#6B7280] block mb-2">{lang === 'ko' ? '시간' : lang === 'zh' ? '时间' : 'Time'}</span>
      <select value={selected} onChange={e => { setSelected(e.target.value); localStorage.setItem('tz_country', e.target.value) }}
        className="w-full mb-2 text-[10px] font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1 border-none outline-none">
        {TIMEZONE_COUNTRIES.map(c => <option key={c.id} value={c.id}>{c.flag} {L(lang, c.name)}</option>)}
      </select>
      <div className="text-center mb-1">
        <div className="text-[9px] text-[#6B7280]">{country.flag} {L(lang, country.name)}</div>
        <div className="text-lg font-black text-[#111827]">{countryTime}</div>
      </div>
      <div className="text-center text-[10px] text-[#111827] font-bold mb-1">{diffStr}</div>
      <div className="text-center">
        <div className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '한국' : lang === 'zh' ? '韩国' : 'Korea'}</div>
        <div className="text-lg font-black text-[#111827]">{koreaTime}</div>
      </div>
    </div>
  )

  return (
    <div>
      <select value={selected} onChange={e => { setSelected(e.target.value); localStorage.setItem('tz_country', e.target.value) }}
        className="w-full mb-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#111827] font-medium">
        {TIMEZONE_COUNTRIES.map(c => (
          <option key={c.id} value={c.id}>{c.flag} {L(lang, c.name)}</option>
        ))}
      </select>
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="text-[10px] text-[#6B7280] mb-1">{country.flag} {L(lang, country.name)}</div>
          <div className="text-2xl font-black text-[#111827]">{countryTime}</div>
        </div>
        <div className="px-3 text-center">
          <div className="text-[10px] text-[#111827] font-bold">{diffStr}</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-[10px] text-[#6B7280] mb-1">{lang === 'ko' ? '한국' : lang === 'zh' ? '韩国' : 'Korea'}</div>
          <div className="text-2xl font-black text-[#111827]">{koreaTime}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Korean Holiday Calendar ───

const KOREAN_HOLIDAYS = [
  { m: 1, d: 1, ko: '신정', zh: '元旦', en: "New Year's Day" },
  { m: 3, d: 1, ko: '삼일절', zh: '三一节', en: 'Independence Movement Day' },
  { m: 5, d: 5, ko: '어린이날', zh: '儿童节', en: "Children's Day" },
  { m: 6, d: 6, ko: '현충일', zh: '显忠日', en: 'Memorial Day' },
  { m: 8, d: 15, ko: '광복절', zh: '光复节', en: 'Liberation Day' },
  { m: 10, d: 3, ko: '개천절', zh: '开天节', en: 'National Foundation Day' },
  { m: 10, d: 9, ko: '한글날', zh: '韩文日', en: 'Hangul Day' },
  { m: 12, d: 25, ko: '성탄절', zh: '圣诞节', en: 'Christmas' },
  { m: 2, d: 17, ko: '설날', zh: '春节', en: 'Lunar New Year' },
  { m: 2, d: 16, ko: '설날 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' },
  { m: 2, d: 18, ko: '설날 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' },
  { m: 5, d: 24, ko: '부처님오신날', zh: '佛诞节', en: "Buddha's Birthday" },
  { m: 9, d: 25, ko: '추석', zh: '中秋节', en: 'Chuseok' },
  { m: 9, d: 24, ko: '추석 연휴', zh: '中秋假期', en: 'Chuseok Holiday' },
  { m: 9, d: 26, ko: '추석 연휴', zh: '中秋假期', en: 'Chuseok Holiday' },
]

function HolidayCalendarWidget({ lang }) {
  const now = new Date()
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [viewYear, setViewYear] = useState(now.getFullYear())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const today = now.getDate()
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const monthHolidays = KOREAN_HOLIDAYS.filter(h => h.m === viewMonth + 1)
  const holidayMap = {}
  monthHolidays.forEach(h => { holidayMap[h.d] = h })

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']
  const monthNames = {
    ko: `${viewYear}년 ${viewMonth + 1}월`,
    zh: `${viewYear}年${viewMonth + 1}月`,
    en: new Date(viewYear, viewMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const cells = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="text-xs text-[#6B7280] px-2 py-1 rounded hover:bg-[#F3F4F6]">&lsaquo;</button>
        <span className="text-sm font-bold text-[#111827]">{monthNames[lang] || monthNames.en}</span>
        <button onClick={nextMonth} className="text-xs text-[#6B7280] px-2 py-1 rounded hover:bg-[#F3F4F6]">&rsaquo;</button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {dayLabels.map((d, i) => (
          <div key={d} className={`text-center text-[8px] font-bold py-0.5 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#6B7280]'}`}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className="h-5" />
          const hol = holidayMap[day]
          const isSun = (i % 7) === 0
          const isSat = (i % 7) === 6
          const isToday = isCurrentMonth && day === today
          return (
            <div key={day} className={`relative h-5 flex flex-col items-center justify-center rounded text-[10px]
              ${isToday ? 'bg-[#111827] text-white font-black' : hol || isSun ? 'text-red-500 font-bold' : isSat ? 'text-blue-500' : 'text-[#6B7280]'}
            `} title={hol ? L(lang, hol) : ''}>
              {day}
              {hol && !isToday && <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-red-400" />}
            </div>
          )
        })}
      </div>
      {monthHolidays.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#E5E7EB] space-y-0.5">
          {monthHolidays.filter((h, i, a) => a.findIndex(x => x.d === h.d && x.ko === h.ko) === i).map((h, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[10px] text-red-500 font-semibold">{viewMonth + 1}/{h.d} {L(lang, h)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Package/Delivery Widget ───

const SEND_COURIERS = [
  { name: 'CU 편의점택배', zh: 'CU便利店快递', en: 'CU Convenience', url: 'https://www.cupost.co.kr/', badge: '' },
  { name: 'GS25 반값택배', zh: 'GS25半价快递', en: 'GS25 Half-price', url: 'https://www.cvsnet.co.kr/', badge: '' },
  { name: '세븐일레븐 택배', zh: '7-11快递', en: '7-Eleven Parcel', url: 'https://www.7-eleven.co.kr/', badge: '' },
  { name: '이마트24 택배', zh: 'emart24快递', en: 'emart24 Parcel', url: 'https://www.emart24.co.kr/', badge: '' },
  { name: '가까운 편의점 찾기', zh: '查找附近便利店', en: 'Find nearby store', url: 'https://map.kakao.com/link/search/편의점택배', badge: '' },
]

const TRACK_COURIERS = [
  { name: '우체국택배', zh: '邮局快递', en: 'Korea Post', url: 'https://service.epost.go.kr/iservice/usr/trace/usrtrc001k01.jsp', badge: 'API' },
  { name: 'CJ대한통운', zh: 'CJ大韩通运', en: 'CJ Logistics', url: 'https://www.cjlogistics.com/ko/tool/parcel/tracking', badge: '' },
  { name: '한진택배', zh: '韩进快递', en: 'Hanjin', url: 'https://www.hanjin.com/kor/CMS/DeliveryMgr/inquiry.do', badge: '' },
  { name: '롯데택배', zh: '乐天快递', en: 'Lotte', url: 'https://www.lotteglogis.com/home/reservation/tracking/index', badge: '' },
  { name: '로젠택배', zh: '路仁快递', en: 'Logen', url: 'https://www.ilogen.com/', badge: '' },
  { name: 'SF Express', zh: '顺丰快递', en: 'SF Express', url: 'https://www.sf-express.com/kr/ko/dynamic_function/waybill', badge: '' },
  { name: '圆通快递', zh: '圆通快递', en: 'YTO Express', url: 'https://www.yto.net.cn/', badge: '' },
  { name: '中通快递', zh: '中通快递', en: 'ZTO Express', url: 'https://www.zto.com/', badge: '' },
  { name: '韵达快递', zh: '韵达快递', en: 'Yunda Express', url: 'https://www.yundaex.com/', badge: '' },
]

function ParcelWidget({ lang }) {
  const [popup, setPopup] = useState(null)

  const couriers = popup === 'send' ? SEND_COURIERS : TRACK_COURIERS

  return (
    <div>
      {!popup && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setPopup('send')}
            className="flex flex-col items-center gap-2 p-4 bg-blue-900/20 rounded-lg hover:bg-blue-900/30 transition-all btn-press border border-blue-800/30">
            <Package size={28} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-700">
              {lang === 'ko' ? '택배 보내기' : lang === 'zh' ? '寄快递' : 'Send Package'}
            </span>
          </button>
          <button onClick={() => setPopup('track')}
            className="flex flex-col items-center gap-2 p-4 bg-green-900/20 rounded-lg hover:bg-green-900/30 transition-all btn-press border border-green-800/30">
            <TrendingUp size={28} className="text-green-600" />
            <span className="text-xs font-bold text-green-700">
              {lang === 'ko' ? '택배 조회' : lang === 'zh' ? '查快递' : 'Track Package'}
            </span>
          </button>
        </div>
      )}
      {popup && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#111827]">
              {popup === 'send'
                ? (lang === 'ko' ? '어떤 택배로 보낼래?' : lang === 'zh' ? '选择快递公司寄送' : 'Choose courier to send')
                : (lang === 'ko' ? '어떤 택배를 조회할래?' : lang === 'zh' ? '选择快递公司查询' : 'Choose courier to track')
              }
            </span>
            <button onClick={() => setPopup(null)} className="text-[10px] text-[#6B7280] px-2 py-1 rounded-full bg-[#F3F4F6]">
              <X size={10} />
            </button>
          </div>
          <div className="space-y-1.5">
            {couriers.map((c, i) => (
              <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all">
                <span className="text-xs text-[#6B7280]">{lang === 'zh' ? c.zh : lang === 'en' ? (c.en || c.name) : c.name}</span>
                <span className="flex items-center gap-1.5">
                  {c.badge && <span className="text-[10px] text-[#111827] font-bold">{c.badge}</span>}
                  <ArrowLeftRight size={10} className="text-[#111827]" />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Travel Curation Widget ───

function TravelCurationWidget({ lang }) {
  const data = widgetMockData.trip

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
        {data.items.map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
            className="relative min-w-[160px] max-w-[180px] shrink-0 bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all btn-press"
            style={{ scrollSnapAlign: 'start' }}>
            {item.badge && (
              <span className="absolute top-2 right-2 text-[8px] font-bold bg-[#111827] text-[#111827] px-1.5 py-0.5 rounded-full z-10">
                {L(lang, item.badge)}
              </span>
            )}
            <div className={`h-16 ${item.bgColor} flex items-center justify-center`}>
              <Plane size={28} className="text-[#111827]/40" />
            </div>
            <div className="p-2.5">
              <p className="text-[11px] font-bold leading-tight mb-1.5">{L(lang, item.name)}</p>
              <div className="mb-2">
                {item.originalPrice ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#6B7280] line-through">{item.originalPrice}</span>
                    <span className="text-xs font-black text-[#111827]">{item.price}</span>
                  </div>
                ) : (
                  <span className="text-xs font-black text-[#111827]">{item.price}</span>
                )}
              </div>
              <span className="block text-center text-[9px] font-bold bg-[#111827] text-[#111827] rounded-lg py-1">
                {lang === 'ko' ? '예약하기' : lang === 'zh' ? '预订' : 'Book'}
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        {data.platforms.map((p, i) => (
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all border border-[#E5E7EB]">
            <span className="text-xs font-bold text-[#111827]">{p.name}</span>
            <span className="text-[8px] text-green-600 font-semibold">{p.badge}</span>
          </a>
        ))}
      </div>

      <p className="text-[9px] text-[#9CA3AF] text-center mt-2">
        {lang === 'ko' ? '제휴 파트너를 통해 예약하면 HanPocket 서비스 개선에 도움이 됩니다'
          : lang === 'zh' ? '通过合作伙伴预订有助于改善HanPocket服务'
          : 'Booking through our partners helps improve HanPocket'}
      </p>
    </div>
  )
}

// ─── Festival Widget ───

function FestivalWidget({ lang }) {
  const data = widgetMockData.festival
  const now = new Date()
  now.setHours(0,0,0,0)

  function getStatus(start, end) {
    const s = new Date(start), e = new Date(end)
    s.setHours(0,0,0,0); e.setHours(0,0,0,0)
    if (now >= s && now <= e) return { label: { ko: '진행중', zh: '进行中', en: 'Ongoing' }, color: 'bg-green-900/200 text-white' }
    const diff = Math.ceil((s - now) / 864e5)
    if (diff > 0) return { label: { ko: `D-${diff}`, zh: `D-${diff}`, en: `D-${diff}` }, color: diff <= 7 ? 'bg-red-900/200 text-white' : 'bg-[#111827] text-[#111827]' }
    return { label: { ko: '종료', zh: '已结束', en: 'Ended' }, color: 'bg-gray-300 text-gray-600' }
  }

  function fmtDate(start, end) {
    const s = new Date(start), e = new Date(end)
    return `${s.getMonth()+1}/${s.getDate()} - ${e.getMonth()+1}/${e.getDate()}`
  }

  return (
    <div>
      <div className="space-y-2.5">
        {data.items.map((ev, i) => {
          const st = getStatus(ev.dateStart, ev.dateEnd)
          return (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all">
              <MapPin size={20} className="text-[#111827] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ev.categoryColor}`}>{L(lang, ev.category)}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${st.color}`}>{L(lang, st.label)}</span>
                </div>
                <p className="text-xs font-bold text-[#111827] truncate">{L(lang, ev.name)}</p>
                <p className="text-[10px] text-[#6B7280]">{fmtDate(ev.dateStart, ev.dateEnd)} · {L(lang, ev.location)}</p>
                {ev.ticketLink && (
                  <a href={ev.ticketLink} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-1 text-[9px] font-bold text-[#111827] bg-[#111827]/10 px-2 py-0.5 rounded-full hover:bg-[#111827]/20 transition-all">
                    {lang === 'ko' ? '티켓 예매' : lang === 'zh' ? '购票' : 'Get Tickets'}
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <a href="https://korean.visitkorea.or.kr" target="_blank" rel="noopener noreferrer"
        className="block mt-3 text-center text-xs font-bold text-[#111827] bg-[#F3F4F6] rounded-xl py-2 hover:bg-[#E5E7EB] transition-all">
        {lang === 'ko' ? '더보기' : lang === 'zh' ? '查看更多' : 'See more'}
      </a>
    </div>
  )
}

// ─── Editor's Pick Widget (에디터 PICK) ───
// TODO: 新红(xh.newrank.cn) API 연동 → Cloudflare Workers로 주간 자동 크롤링
const EDITOR_PICKS = [
  { id: 1, title: { ko: '성수동 카페거리', zh: '圣水洞咖啡街', en: 'Seongsu Cafe Street' }, tag: { ko: '핫플', zh: '热门', en: 'Hot' }, desc: { ko: '요즘 가장 핫한 서울 카페 거리', zh: '最近首尔最火的咖啡街', en: 'Seoul\'s hottest cafe street right now' }, link: 'https://map.naver.com/p/search/성수동카페' },
  { id: 2, title: { ko: '광장시장 먹방', zh: '广藏市场美食', en: 'Gwangjang Market Food' }, tag: { ko: '맛집', zh: '美食', en: 'Food' }, desc: { ko: '외국인 필수코스 전통시장', zh: '外国人必去传统市场', en: 'Must-visit traditional market' }, link: 'https://map.naver.com/p/search/광장시장' },
  { id: 3, title: { ko: '올리브영 2월 세일', zh: 'Olive Young 2月大促', en: 'Olive Young Feb Sale' }, tag: { ko: '뷰티', zh: '美妆', en: 'Beauty' }, desc: { ko: '최대 50% 할인 진행 중', zh: '最高5折优惠进行中', en: 'Up to 50% off now' }, link: 'https://www.oliveyoung.co.kr' },
  { id: 4, title: { ko: '한강 겨울 피크닉', zh: '汉江冬季野餐', en: 'Han River Winter Picnic' }, tag: { ko: '체험', zh: '体验', en: 'Experience' }, desc: { ko: '겨울에도 한강은 핫플', zh: '冬天汉江也是热门地', en: 'Han River stays hot even in winter' }, link: 'https://map.naver.com/p/search/한강공원' },
  { id: 5, title: { ko: '다이소 신상템', zh: 'Daiso新品', en: 'Daiso New Items' }, tag: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, desc: { ko: '1000원으로 득템하는 법', zh: '1000韩元淘好物', en: 'Best finds for 1000 won' }, link: 'https://www.daiso.co.kr' },
]

const TAG_COLORS = {
  '핫플': 'bg-red-50 text-red-600', '热门': 'bg-red-50 text-red-600', 'Hot': 'bg-red-50 text-red-600',
  '맛집': 'bg-orange-50 text-orange-600', '美食': 'bg-orange-50 text-orange-600', 'Food': 'bg-orange-50 text-orange-600',
  '뷰티': 'bg-pink-50 text-pink-600', '美妆': 'bg-pink-50 text-pink-600', 'Beauty': 'bg-pink-50 text-pink-600',
  '체험': 'bg-blue-50 text-blue-600', '体验': 'bg-blue-50 text-blue-600', 'Experience': 'bg-blue-50 text-blue-600',
  '쇼핑': 'bg-purple-50 text-purple-600', '购物': 'bg-purple-50 text-purple-600', 'Shopping': 'bg-purple-50 text-purple-600',
}

function EditorPickWidget({ lang }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Flame size={14} className="text-[#111827]" />
        <span className="text-xs font-bold text-[#111827]">EDITOR'S PICK</span>
      </div>
      <div className="space-y-2.5">
        {EDITOR_PICKS.map((item, i) => {
          const tag = L(lang, item.tag)
          return (
            <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#F9FAFB] transition-colors group">
              <span className="text-sm font-bold text-[#D1D5DB] mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TAG_COLORS[tag] || 'bg-gray-50 text-gray-600'}`}>{tag}</span>
                  <span className="text-xs font-semibold text-[#111827] truncate">{L(lang, item.title)}</span>
                </div>
                <p className="text-[10px] text-[#6B7280] truncate">{L(lang, item.desc)}</p>
              </div>
              <ChevronRight size={14} className="text-[#D1D5DB] mt-1 shrink-0 group-hover:text-[#111827] transition-colors" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

// ─── Convenience Store New Items Widget (편의점 신상) ───
// TODO: CU/GS25/세븐일레븐 크롤링 → Cloudflare Workers 주간 자동화
const CVS_ITEMS = [
  { id: 1, store: 'CU', name: { ko: '연세우유 크림빵 딸기', zh: '延世牛奶草莓奶油面包', en: 'Yonsei Milk Strawberry Cream Bread' }, price: '2,500', tag: { ko: '간식', zh: '零食', en: 'Snack' }, hot: true },
  { id: 2, store: 'GS25', name: { ko: '넷플릭스 팝콘 버터맛', zh: 'Netflix黄油味爆米花', en: 'Netflix Butter Popcorn' }, price: '3,000', tag: { ko: '간식', zh: '零食', en: 'Snack' }, hot: true },
  { id: 3, store: 'CU', name: { ko: '헤이루 흑당 버블티', zh: 'Heiru黑糖珍珠奶茶', en: 'Heiru Brown Sugar Bubble Tea' }, price: '2,800', tag: { ko: '음료', zh: '饮料', en: 'Drink' }, hot: false },
  { id: 4, store: '7-ELEVEN', name: { ko: '참치마요 삼각김밥 리뉴얼', zh: '金枪鱼蛋黄酱三角饭团(改良版)', en: 'Tuna Mayo Onigiri Renewal' }, price: '1,500', tag: { ko: '식사', zh: '正餐', en: 'Meal' }, hot: false },
  { id: 5, store: 'GS25', name: { ko: '유어스 딸기 샌드위치', zh: 'Yours草莓三明治', en: 'Yours Strawberry Sandwich' }, price: '3,200', tag: { ko: '간식', zh: '零食', en: 'Snack' }, hot: true },
  { id: 6, store: 'CU', name: { ko: '백종원 도시락 제육', zh: '白钟元便当(辣炒猪肉)', en: 'Baek Jongwon Spicy Pork Bento' }, price: '5,500', tag: { ko: '도시락', zh: '便当', en: 'Bento' }, hot: true },
]

const STORE_COLORS = { 'CU': 'bg-purple-600', 'GS25': 'bg-blue-600', '7-ELEVEN': 'bg-green-600' }

function ConvenienceStoreWidget({ lang }) {
  const [filter, setFilter] = useState('ALL')
  const stores = ['ALL', 'CU', 'GS25', '7-ELEVEN']
  const filtered = filter === 'ALL' ? CVS_ITEMS : CVS_ITEMS.filter(i => i.store === filter)

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <ShoppingBag size={14} className="text-[#111827]" />
        <span className="text-xs font-bold text-[#111827]">{lang === 'ko' ? '편의점 신상' : lang === 'zh' ? '便利店新品' : 'CVS New Items'}</span>
      </div>
      <div className="flex gap-1.5 mb-3">
        {stores.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${filter === s ? 'bg-[#111827] text-white font-bold' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
            {s === 'ALL' ? (lang === 'ko' ? '전체' : lang === 'zh' ? '全部' : 'All') : s}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors">
            <span className={`text-[8px] text-white font-bold px-1.5 py-0.5 rounded ${STORE_COLORS[item.store]}`}>{item.store}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-[#111827] truncate">{L(lang, item.name)}</span>
                {item.hot && <Flame size={10} className="text-red-500 shrink-0" />}
              </div>
              <span className="text-[10px] text-[#6B7280]">{item.price}W</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Beauty New Arrivals Widget (뷰티 신상) ───
// TODO: 올리브영 글로벌 크롤링 → Cloudflare Workers + Puppeteer 주간 자동화
const BEAUTY_NEW_ITEMS = [
  { id: 1, brand: 'COSRX', name: { ko: '스네일 뮤신 에센스 리뉴얼', zh: '蜗牛精华液(改良版)', en: 'Snail Mucin Essence Renewal' }, price: '23,000', category: { ko: '에센스', zh: '精华', en: 'Essence' }, hot: true, link: 'https://global.oliveyoung.com' },
  { id: 2, brand: 'Torriden', name: { ko: '다이브인 세럼 대용량', zh: 'DIVE-IN精华液大容量', en: 'DIVE-IN Serum Large' }, price: '28,000', category: { ko: '세럼', zh: '精华', en: 'Serum' }, hot: true, link: 'https://global.oliveyoung.com' },
  { id: 3, brand: 'rom&nd', name: { ko: '듀이풀 워터 틴트 신규 컬러', zh: 'Dewyful Water Tint新色', en: 'Dewyful Water Tint New Colors' }, price: '13,000', category: { ko: '립', zh: '唇', en: 'Lip' }, hot: true, link: 'https://global.oliveyoung.com' },
  { id: 4, brand: 'Anua', name: { ko: '어성초 77 토너 미니', zh: '鱼腥草77爽肤水迷你', en: 'Heartleaf 77 Toner Mini' }, price: '12,000', category: { ko: '토너', zh: '爽肤水', en: 'Toner' }, hot: false, link: 'https://global.oliveyoung.com' },
  { id: 5, brand: 'Beauty of Joseon', name: { ko: '맑은쌀 선크림 SPF50+', zh: '清米防晒霜SPF50+', en: 'Rice Sunscreen SPF50+' }, price: '18,000', category: { ko: '선케어', zh: '防晒', en: 'Sun' }, hot: true, link: 'https://global.oliveyoung.com' },
  { id: 6, brand: 'TIRTIR', name: { ko: '마스크핏 쿠션 미니 세트', zh: 'Mask Fit气垫迷你套装', en: 'Mask Fit Cushion Mini Set' }, price: '25,000', category: { ko: '쿠션', zh: '气垫', en: 'Cushion' }, hot: false, link: 'https://global.oliveyoung.com' },
]

const BEAUTY_CATS = { '에센스': 'bg-violet-50 text-violet-600', '精华': 'bg-violet-50 text-violet-600', 'Essence': 'bg-violet-50 text-violet-600', '세럼': 'bg-violet-50 text-violet-600', 'Serum': 'bg-violet-50 text-violet-600', '립': 'bg-rose-50 text-rose-600', '唇': 'bg-rose-50 text-rose-600', 'Lip': 'bg-rose-50 text-rose-600', '토너': 'bg-sky-50 text-sky-600', '爽肤水': 'bg-sky-50 text-sky-600', 'Toner': 'bg-sky-50 text-sky-600', '선케어': 'bg-amber-50 text-amber-600', '防晒': 'bg-amber-50 text-amber-600', 'Sun': 'bg-amber-50 text-amber-600', '쿠션': 'bg-pink-50 text-pink-600', '气垫': 'bg-pink-50 text-pink-600', 'Cushion': 'bg-pink-50 text-pink-600' }

function BeautyNewWidget({ lang }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={14} className="text-[#111827]" />
        <span className="text-xs font-bold text-[#111827]">{lang === 'ko' ? 'K-뷰티 신상' : lang === 'zh' ? 'K-Beauty新品' : 'K-Beauty New'}</span>
      </div>
      <div className="space-y-2">
        {BEAUTY_NEW_ITEMS.map(item => {
          const cat = L(lang, item.category)
          return (
            <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${BEAUTY_CATS[cat] || 'bg-gray-50 text-gray-600'}`}>{cat}</span>
                  <span className="text-[10px] font-bold text-[#6B7280]">{item.brand}</span>
                  {item.hot && <Flame size={10} className="text-red-500 shrink-0" />}
                </div>
                <p className="text-xs font-medium text-[#111827] truncate">{L(lang, item.name)}</p>
                <span className="text-[10px] text-[#6B7280]">{item.price}W</span>
              </div>
              <ChevronRight size={14} className="text-[#D1D5DB] shrink-0 group-hover:text-[#111827] transition-colors" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

// ─── K-POP Chart Widget ───

function KpopChartWidget({ lang }) {
  const [chart, setChart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      fetch('https://rss.applemarketingtools.com/api/v2/kr/music/most-played/10/songs.json')
        .then(r => r.json())
        .then(data => {
          if (data?.feed?.results) {
            setChart({
              items: data.feed.results.map((song, i) => ({
                rank: i + 1,
                title: song.name,
                artist: song.artistName,
                artwork: song.artworkUrl100,
                url: song.url,
              })),
              updated: data.feed.updated ? new Date(data.feed.updated).toLocaleDateString('ko-KR') : '',
            })
          }
        })
        .catch(() => {
          console.warn('Apple Music RSS API unavailable')
          setError(true)
        })
        .finally(() => setLoading(false))
    } catch (err) {
      console.warn('Apple Music RSS API not accessible:', err)
      setError(true)
      setLoading(false)
    }
  }, [])

  if (loading) return <p className="text-xs text-[#9CA3AF] text-center py-4">Loading...</p>
  if (error || !chart) return <p className="text-xs text-[#9CA3AF] text-center py-4">{lang === 'ko' ? '차트 데이터를 불러올 수 없습니다' : lang === 'zh' ? '无法加载榜单数据' : 'Chart data unavailable'}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-[#6B7280]">Apple Music Korea TOP 10</span>
        <span className="text-[9px] text-[#9CA3AF]">{chart.updated}</span>
      </div>
      <div className="space-y-1">
        {chart.items.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[#F3F4F6] transition-all">
            <span className={`text-sm font-black w-6 text-center ${item.rank <= 3 ? 'text-[#111827]' : 'text-[#6B7280]'}`}>{item.rank}</span>
            {item.artwork && <img src={item.artwork} alt="" className="w-8 h-8 rounded-md shrink-0" />}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-[#111827] truncate block">{item.title}</span>
              <span className="text-[10px] text-[#6B7280]">{item.artist}</span>
            </div>
            <Play size={14} strokeWidth={1} className="text-[#111827] shrink-0" />
          </a>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
        <span className="text-[9px] text-[#9CA3AF]">Source: Apple Music</span>
        <span className="text-[9px] text-[#9CA3AF]">
          {lang === 'ko' ? '실시간 차트' : lang === 'zh' ? '实时榜单' : 'Live chart'}
        </span>
      </div>
    </div>
  )
}

// ─── Fan Event / Idol Widget ───

function FanEventIdolWidget({ lang }) {
  const [myIdols, setMyIdols] = useState(() => {
    try { return JSON.parse(localStorage.getItem('my_idols')) || [] } catch { return [] }
  })
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState('')
  const [filterGen, setFilterGen] = useState('All')
  const [filterGender, setFilterGender] = useState('All')
  const [filterCompany, setFilterCompany] = useState('All')
  const [filterChinese, setFilterChinese] = useState(false)

  function saveIdols(ids) {
    setMyIdols(ids)
    localStorage.setItem('my_idols', JSON.stringify(ids))
  }

  function addIdol(id) {
    if (myIdols.length >= 10 || myIdols.includes(id)) return
    saveIdols([...myIdols, id])
    setShowSearch(false)
    setSearch('')
  }

  function removeIdol(id) {
    saveIdols(myIdols.filter(x => x !== id))
  }

  const filtered = idolDatabase.filter(g => {
    const matchText = g.name.toLowerCase().includes(search.toLowerCase()) || g.company.toLowerCase().includes(search.toLowerCase())
    const matchGen = filterGen === 'All' || g.gen === filterGen
    const matchGender = filterGender === 'All' ||
      (filterGender === 'Boy' && (g.gender === 'boy' || g.gender === 'solo_m')) ||
      (filterGender === 'Girl' && (g.gender === 'girl' || g.gender === 'solo_f')) ||
      (filterGender === 'Solo' && (g.gender === 'solo_m' || g.gender === 'solo_f'))
    const matchCompany = filterCompany === 'All' ||
      (filterCompany === 'Others' ? !['HYBE', 'SM', 'JYP', 'YG'].some(c => g.company.toUpperCase().includes(c)) : g.company.toUpperCase().includes(filterCompany))
    const matchChinese = !filterChinese || g.chinese
    return matchText && matchGen && matchGender && matchCompany && matchChinese
  })

  const registeredIdols = myIdols.map(id => idolDatabase.find(g => g.id === id)).filter(Boolean)

  function nextSchedule(idol) {
    const now = new Date()
    return idol.schedules?.filter(s => new Date(s.date) >= now).sort((a,b) => new Date(a.date) - new Date(b.date))[0]
  }

  const pillBase = "shrink-0 px-2 py-0.5 rounded-full text-[9px] font-medium transition-all cursor-pointer select-none"
  const pillActive = "bg-[#111827] text-white"
  const pillInactive = "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"

  if (showSearch) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-[#111827]">
            {lang === 'ko' ? '내 최애 등록' : lang === 'zh' ? '注册我的爱豆' : 'Register My Idol'}
          </span>
          <button onClick={() => { setShowSearch(false); setSearch(''); setFilterGen('All'); setFilterGender('All'); setFilterCompany('All'); setFilterChinese(false) }} className="text-[10px] text-[#6B7280] px-2 py-1 rounded-full bg-[#F3F4F6]">
            <X size={10} />
          </button>
        </div>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'ko' ? '그룹명/소속사 검색...' : lang === 'zh' ? '搜索组合名/公司...' : 'Search name/company...'}
          className="w-full text-xs bg-[#F3F4F6] rounded-xl px-3 py-1.5 mb-1.5 outline-none focus:ring-2 focus:ring-[#111827]/30"
        />
        {/* Generation filter */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar mb-1">
          {['All', '1st', '2nd', '3rd', '4th', '5th'].map(g => (
            <button key={g} onClick={() => setFilterGen(g)} className={`${pillBase} ${filterGen === g ? pillActive : pillInactive}`}>{g}</button>
          ))}
        </div>
        {/* Gender + Company + Chinese filters */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar mb-1.5">
          {['All', 'Boy', 'Girl', 'Solo'].map(g => (
            <button key={g} onClick={() => setFilterGender(g)} className={`${pillBase} ${filterGender === g ? pillActive : pillInactive}`}>{g}</button>
          ))}
          <span className="text-[#D1D5DB] text-[9px] shrink-0 px-0.5">|</span>
          {['All', 'HYBE', 'SM', 'JYP', 'YG', 'Others'].map(c => (
            <button key={c} onClick={() => setFilterCompany(c)} className={`${pillBase} ${filterCompany === c ? pillActive : pillInactive}`}>{c}</button>
          ))}
          <span className="text-[#D1D5DB] text-[9px] shrink-0 px-0.5">|</span>
          <button onClick={() => setFilterChinese(!filterChinese)} className={`${pillBase} ${filterChinese ? pillActive : pillInactive}`}>
            {lang === 'zh' ? '中国关联' : '中 중국'}
          </button>
        </div>
        <p className="text-[9px] text-[#9CA3AF] mb-1">{lang === 'ko' ? '검색 결과' : lang === 'zh' ? '搜索结果' : 'Results'} {filtered.length}{lang === 'ko' ? '개' : lang === 'zh' ? '个' : ''}</p>
        <div className="max-h-36 overflow-y-auto space-y-1">
          {filtered.map(g => (
            <button key={g.id} onClick={() => addIdol(g.id)} disabled={myIdols.includes(g.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left transition-all ${
                myIdols.includes(g.id) ? 'bg-[#F3F4F6] opacity-50' : 'bg-[#F3F4F6] hover:bg-[#E5E7EB]'
              }`}>
              <Star size={14} className="text-[#111827] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-[#111827] truncate">{g.name}</span>
                  {g.chinese && <span className="text-[7px] font-bold text-red-500 bg-red-50 px-1 rounded shrink-0">CN</span>}
                  <span className="text-[8px] text-[#9CA3AF] shrink-0">{g.gen}</span>
                </div>
                <p className="text-[9px] text-[#6B7280] truncate">{g.company}{g.members > 1 ? ` · ${g.members}명` : ''}</p>
              </div>
              {myIdols.includes(g.id) && <Check size={12} className="text-green-500 shrink-0" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-[10px] text-[#9CA3AF] text-center py-3">{lang === 'ko' ? '결과 없음' : lang === 'zh' ? '无结果' : 'No results'}</p>
          )}
        </div>
        <p className="text-[9px] text-[#9CA3AF] mt-1.5 text-center">{myIdols.length}/10 {lang === 'ko' ? '등록됨' : lang === 'zh' ? '已注册' : 'registered'}</p>
      </div>
    )
  }

  if (registeredIdols.length === 0) {
    return (
      <div className="text-center py-4">
        <Star size={32} className="text-[#111827] mx-auto" />
        <p className="text-xs text-[#6B7280] mt-2 mb-3">
          {lang === 'ko' ? '좋아하는 아이돌을 등록하세요!' : lang === 'zh' ? '注册你喜欢的爱豆！' : 'Register your favorite idols!'}
        </p>
        <button onClick={() => setShowSearch(true)}
          className="text-xs font-bold text-[#111827] bg-[#F3F4F6] px-4 py-2 rounded-xl hover:bg-[#E5E7EB] transition-all">
          {lang === 'ko' ? '내 최애 등록' : lang === 'zh' ? '注册我的爱豆' : 'Register My Idol'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-2">
        {registeredIdols.map(idol => {
          const next = nextSchedule(idol)
          return (
            <div key={idol.id} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-[#111827]" />
                  <div>
                    <p className="text-xs font-bold">{idol.name}</p>
                    <p className="text-[9px] text-[#6B7280]">{idol.company}</p>
                  </div>
                </div>
                <button onClick={() => removeIdol(idol.id)} className="text-[9px] text-[#6B7280] hover:text-red-400">
                  <X size={10} />
                </button>
              </div>
              {idol.schedules?.length > 0 ? (
                <div className="space-y-1 mb-2">
                  {idol.schedules.slice(0, 2).map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-[9px] text-[#111827] font-mono shrink-0">{s.date.slice(5)}</span>
                      <span className="text-[10px] text-gray-300">{L(lang, s.name)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-[#6B7280] mb-2">{lang === 'ko' ? '예정된 일정 없음' : lang === 'zh' ? '暂无日程' : 'No upcoming events'}</p>
              )}
              <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
                {idol.socials.weverse && <a href={idol.socials.weverse} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#6B7280] hover:text-[#111827]">Weverse</a>}
                {idol.socials.instagram && <a href={idol.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#6B7280] hover:text-[#111827]">IG</a>}
                {idol.socials.weibo && <a href={idol.socials.weibo} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#6B7280] hover:text-[#111827]">Weibo</a>}
                {idol.socials.youtube && <a href={idol.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#6B7280] hover:text-[#111827]">YT</a>}
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={() => setShowSearch(true)}
        className={`w-full mt-2 text-center text-[10px] font-bold text-[#111827] bg-[#F3F4F6] rounded-xl py-1.5 hover:bg-[#E5E7EB] transition-all ${myIdols.length >= 10 ? 'opacity-50 pointer-events-none' : ''}`}>
        + {lang === 'ko' ? '아이돌 추가' : lang === 'zh' ? '添加爱豆' : 'Add Idol'} ({myIdols.length}/10)
      </button>
    </div>
  )
}

// ─── Beauty Widget (5-category with dot navigation) ───

const BEAUTY_CAT_LABELS = [
  { ko: '뷰티제품', zh: '美妆产品', en: 'Beauty Products' },
  { ko: '메이크업', zh: '化妆', en: 'Makeup' },
  { ko: '헤어', zh: '美发', en: 'Hair' },
  { ko: '문신', zh: '纹身', en: 'Tattoo' },
  { ko: '피부과', zh: '皮肤科', en: 'Dermatology' },
]

const BEAUTY_FLAGSHIP_STORES = [
  { name: { ko: '이니스프리 강남', zh: 'innisfree 江南', en: 'innisfree Gangnam' }, url: 'https://map.naver.com/v5/search/이니스프리+강남+플래그십' },
  { name: { ko: '설화수 북촌', zh: '雪花秀 北村', en: 'Sulwhasoo Bukchon' }, url: 'https://map.naver.com/v5/search/설화수+북촌+플래그십' },
  { name: { ko: '라네즈 명동', zh: 'Laneige 明洞', en: 'Laneige Myeongdong' }, url: 'https://map.naver.com/v5/search/라네즈+명동+플래그십' },
  { name: { ko: '에뛰드 명동', zh: 'Etude 明洞', en: 'Etude Myeongdong' }, url: 'https://map.naver.com/v5/search/에뛰드+명동' },
  { name: { ko: '3CE 홍대', zh: '3CE 弘大', en: '3CE Hongdae' }, url: 'https://map.naver.com/v5/search/3CE+홍대' },
]

const BEAUTY_SKINCARE_AREAS = [
  { name: { ko: '강남', zh: '江南', en: 'Gangnam' }, url: 'https://map.naver.com/v5/search/강남+피부과+추천' },
  { name: { ko: '명동', zh: '明洞', en: 'Myeongdong' }, url: 'https://map.naver.com/v5/search/명동+피부과' },
  { name: { ko: '홍대', zh: '弘大', en: 'Hongdae' }, url: 'https://map.naver.com/v5/search/홍대+피부관리' },
]

const MAKEUP_SHOPS = [
  { name: { ko: '강남 메이크업', zh: '江南化妆店', en: 'Gangnam Makeup' }, url: 'https://map.naver.com/v5/search/강남+메이크업숍' },
  { name: { ko: '홍대 메이크업', zh: '弘大化妆店', en: 'Hongdae Makeup' }, url: 'https://map.naver.com/v5/search/홍대+메이크업숍' },
  { name: { ko: '명동 메이크업', zh: '明洞化妆店', en: 'Myeongdong Makeup' }, url: 'https://map.naver.com/v5/search/명동+메이크업숍' },
]

const HAIR_SALONS = [
  { name: { ko: '강남 헤어살롱', zh: '江南美发沙龙', en: 'Gangnam Hair Salon' }, url: 'https://map.naver.com/v5/search/강남+헤어살롱' },
  { name: { ko: '홍대 헤어살롱', zh: '弘大美发沙龙', en: 'Hongdae Hair Salon' }, url: 'https://map.naver.com/v5/search/홍대+헤어살롱' },
  { name: { ko: '청담 헤어살롱', zh: '清潭美发沙龙', en: 'Cheongdam Hair Salon' }, url: 'https://map.naver.com/v5/search/청담+헤어살롱' },
]

const TATTOO_SHOPS = [
  { name: { ko: '홍대 타투', zh: '弘大纹身', en: 'Hongdae Tattoo' }, url: 'https://map.naver.com/v5/search/홍대+타투' },
  { name: { ko: '이태원 타투', zh: '梨泰院纹身', en: 'Itaewon Tattoo' }, url: 'https://map.naver.com/v5/search/이태원+타투' },
  { name: { ko: '강남 타투', zh: '江南纹身', en: 'Gangnam Tattoo' }, url: 'https://map.naver.com/v5/search/강남+타투' },
]

const DERMA_CLINICS = [
  { name: { ko: '강남 피부과', zh: '江南皮肤科', en: 'Gangnam Derma' }, url: 'https://map.naver.com/v5/search/강남+피부과' },
  { name: { ko: '신사 피부과', zh: '新沙皮肤科', en: 'Sinsa Derma' }, url: 'https://map.naver.com/v5/search/신사+피부과' },
  { name: { ko: '압구정 피부과', zh: '狎鸥亭皮肤科', en: 'Apgujeong Derma' }, url: 'https://map.naver.com/v5/search/압구정+피부과' },
]

function BeautyWidget({ lang }) {
  const [activeCat, setActiveCat] = useState(0)
  const [subView, setSubView] = useState(null)
  const [showShipPopup, setShowShipPopup] = useState(false)

  const renderLocationList = (items) => (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all">
          <span className="text-xs text-[#111827] font-medium">{L(lang, item.name)}</span>
          <MapPin size={12} className="text-[#111827] shrink-0" />
        </a>
      ))}
    </div>
  )

  const renderCategory = () => {
    switch (activeCat) {
      case 0: // Beauty Products
        if (showShipPopup) return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#111827]">{lang === 'ko' ? '해외배송' : lang === 'zh' ? '海外配送' : 'Ship Overseas'}</span>
              <button onClick={() => setShowShipPopup(false)} className="text-[10px] text-[#6B7280] px-2 py-1 rounded-full bg-[#F3F4F6]"><X size={10} /></button>
            </div>
            <div className="space-y-1.5">
              <a href="https://global.oliveyoung.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all">
                <span className="text-xs text-[#111827]">{lang === 'ko' ? '올리브영 글로벌몰' : lang === 'zh' ? 'Olive Young全球商城' : 'Olive Young Global'}</span>
                <ArrowLeftRight size={10} className="text-[#111827]" />
              </a>
              <a href="https://www.xiaohongshu.com/search_result?keyword=oliveyoung" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all">
                <span className="text-xs text-[#111827]">{lang === 'zh' ? '小红书 Olive Young' : 'Xiaohongshu Olive Young'}</span>
                <ArrowLeftRight size={10} className="text-[#111827]" />
              </a>
            </div>
          </div>
        )
        if (subView === 'flagship') return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#111827]">{lang === 'ko' ? '플래그십 스토어' : lang === 'zh' ? '旗舰店' : 'Flagship Stores'}</span>
              <button onClick={() => setSubView(null)} className="text-[10px] text-[#6B7280] px-2 py-1 rounded-full bg-[#F3F4F6]"><X size={10} /></button>
            </div>
            {renderLocationList(BEAUTY_FLAGSHIP_STORES)}
          </div>
        )
        if (subView === 'skincare') return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#111827]">{lang === 'ko' ? '관리받기' : lang === 'zh' ? '护理服务' : 'Get Treated'}</span>
              <button onClick={() => setSubView(null)} className="text-[10px] text-[#6B7280] px-2 py-1 rounded-full bg-[#F3F4F6]"><X size={10} /></button>
            </div>
            {renderLocationList(BEAUTY_SKINCARE_AREAS)}
          </div>
        )
        return (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <a href="https://map.naver.com/v5/search/올리브영" target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 bg-[#F3F4F6] rounded-lg hover:shadow-md transition-all btn-press border border-[#111827]/20">
                <ShoppingBag size={28} className="text-[#111827]" />
                <span className="text-xs font-bold text-[#111827]">
                  {lang === 'ko' ? '한국에서 사기' : lang === 'zh' ? '在韩国购买' : 'Buy in Korea'}
                </span>
                <span className="text-[10px] text-[#6B7280] text-center leading-tight">
                  {lang === 'ko' ? '올리브영 매장 찾기' : lang === 'zh' ? '查找Olive Young门店' : 'Find Olive Young'}
                </span>
              </a>
              <button onClick={() => setShowShipPopup(true)}
                className="flex flex-col items-center gap-2 p-4 bg-[#F3F4F6] rounded-lg hover:shadow-md transition-all btn-press border border-[#111827]/20">
                <Plane size={28} className="text-[#111827]" />
                <span className="text-xs font-bold text-[#111827]">
                  {lang === 'ko' ? '해외 배송' : lang === 'zh' ? '海外配送' : 'Ship Overseas'}
                </span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSubView('flagship')}
                className="text-[10px] font-bold text-[#6B7280] bg-[#F3F4F6] hover:bg-[#F3F4F6] px-3 py-2 rounded-lg border border-[#E5E7EB] transition-all">
                {lang === 'ko' ? '플래그십 스토어' : lang === 'zh' ? '旗舰店' : 'Flagship Stores'}
              </button>
              <button onClick={() => setSubView('skincare')}
                className="text-[10px] font-bold text-[#6B7280] bg-[#F3F4F6] hover:bg-[#F3F4F6] px-3 py-2 rounded-lg border border-[#E5E7EB] transition-all">
                {lang === 'ko' ? '관리받기' : lang === 'zh' ? '护理服务' : 'Get Treated'}
              </button>
            </div>
          </div>
        )
      case 1: // Makeup
        return (
          <div>
            <p className="text-xs font-bold text-[#111827] mb-2">{lang === 'ko' ? '메이크업 숍' : lang === 'zh' ? '化妆店推荐' : 'Makeup Shops'}</p>
            {renderLocationList(MAKEUP_SHOPS)}
            <p className="text-xs font-bold text-[#111827] mt-3 mb-1.5">{lang === 'ko' ? '인기 브랜드' : lang === 'zh' ? '热门品牌' : 'Popular Brands'}</p>
            <div className="flex flex-wrap gap-1.5">
              {['MAC', 'NARS', '3CE', lang === 'zh' ? 'Etude' : '에뛰드', lang === 'zh' ? 'CLIO' : '클리오'].map((b, i) => (
                <span key={i} className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-1 rounded-full border border-[#E5E7EB]">{b}</span>
              ))}
            </div>
          </div>
        )
      case 2: // Hair
        return (
          <div>
            <p className="text-xs font-bold text-[#111827] mb-2">{lang === 'ko' ? '헤어살롱 추천' : lang === 'zh' ? '美发沙龙推荐' : 'Hair Salons'}</p>
            {renderLocationList(HAIR_SALONS)}
          </div>
        )
      case 3: // Tattoo
        return (
          <div>
            <p className="text-xs font-bold text-[#111827] mb-2">{lang === 'ko' ? '타투숍' : lang === 'zh' ? '纹身店' : 'Tattoo Shops'}</p>
            {renderLocationList(TATTOO_SHOPS)}
            <div className="mt-3 px-3 py-2 rounded-xl bg-amber-900/20 border border-amber-200">
              <span className="text-[10px] text-amber-700">
                {L(lang, { ko: '※ 한국에서 타투는 의료법상 의료인만 시술 가능합니다.', zh: '※ 在韩国纹身属于医疗行为，仅限医疗从业者操作。', en: '※ Tattoos in Korea are legally restricted to medical professionals.' })}
              </span>
            </div>
          </div>
        )
      case 4: // Dermatology
        return (
          <div>
            <p className="text-xs font-bold text-[#111827] mb-2">{lang === 'ko' ? '피부과 추천' : lang === 'zh' ? '皮肤科推荐' : 'Dermatology Clinics'}</p>
            {renderLocationList(DERMA_CLINICS)}
            <p className="text-xs font-bold text-[#111827] mt-3 mb-1.5">{lang === 'ko' ? '인기 시술' : lang === 'zh' ? '热门项目' : 'Popular Treatments'}</p>
            <p className="text-[11px] text-[#6B7280]">
              {L(lang, { ko: '레이저토닝 / 물광주사 / 보톡스', zh: '激光美白 / 水光针 / 肉毒素', en: 'Laser toning / Skin booster / Botox' })}
            </p>
          </div>
        )
      default: return null
    }
  }

  return (
    <div>
      {renderCategory()}
      <div className="flex justify-center gap-2 mt-3">
        {BEAUTY_CAT_LABELS.map((cat, i) => (
          <button key={i} onClick={() => { setActiveCat(i); setSubView(null); setShowShipPopup(false) }}
            className={`h-2 rounded-full transition-all ${activeCat === i ? 'bg-[#111827] w-4' : 'bg-[#AEAEB2] w-2'}`} />
        ))}
      </div>
      <p className="text-[10px] text-[#6B7280] text-center mt-1">{L(lang, BEAUTY_CAT_LABELS[activeCat])}</p>
    </div>
  )
}

// ─── Accommodation Widget ───

const ACCOMMODATION_KOREA = [
  { name: '야놀자', zh: '夜猫子', url: 'https://www.yanolja.com/', deepLink: 'yanolja://', badge: '한국카드', badgeColor: 'bg-blue-100 text-blue-700' },
  { name: '여기어때', zh: '这里如何', url: 'https://www.goodchoice.kr/', deepLink: 'goodchoice://', badge: '한국카드', badgeColor: 'bg-blue-100 text-blue-700' },
]

const ACCOMMODATION_ABROAD = [
  { name: 'Booking.com', zh: 'Booking.com', url: 'https://www.booking.com/', badge: 'Visa/Master/PayPal', badgeColor: 'bg-indigo-100 text-indigo-700' },
  { name: 'Trip.com (携程)', zh: '携程 Trip.com', url: 'https://www.trip.com/', badge: 'Alipay/WeChat Pay/UnionPay', badgeColor: 'bg-red-100 text-red-700', highlight: true },
  { name: 'Agoda', zh: 'Agoda', url: 'https://www.agoda.com/', badge: 'Visa/Master/Alipay', badgeColor: 'bg-purple-100 text-purple-700' },
]

function AccommodationWidget({ lang }) {
  const [popup, setPopup] = useState(null)

  const options = popup === 'korea' ? ACCOMMODATION_KOREA : ACCOMMODATION_ABROAD

  return (
    <div>
      {!popup && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setPopup('korea')}
            className="flex flex-col items-center gap-2 p-4 bg-[#F3F4F6] rounded-lg hover:shadow-md transition-all btn-press border border-[#111827]/20">
            <Home size={28} className="text-[#111827]" />
            <span className="text-xs font-bold text-[#111827]">
              {lang === 'ko' ? '한국에서 예약' : lang === 'zh' ? '在韩国预订' : 'Book in Korea'}
            </span>
          </button>
          <button onClick={() => setPopup('abroad')}
            className="flex flex-col items-center gap-2 p-4 bg-[#F3F4F6] rounded-lg hover:shadow-md transition-all btn-press border border-[#111827]/20">
            <Plane size={28} className="text-[#111827]" />
            <span className="text-xs font-bold text-[#111827]">
              {lang === 'ko' ? '해외에서 예약' : lang === 'zh' ? '从海外预订' : 'Book from Abroad'}
            </span>
          </button>
        </div>
      )}
      {popup && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#111827]">
              {popup === 'korea'
                ? (lang === 'ko' ? '한국 숙박 앱' : lang === 'zh' ? '韩国住宿App' : 'Korean Booking Apps')
                : (lang === 'ko' ? '해외 예약 사이트' : lang === 'zh' ? '海外预订网站' : 'International Booking Sites')
              }
            </span>
            <button onClick={() => setPopup(null)} className="text-[10px] text-[#6B7280] px-2 py-1 rounded-full bg-[#F3F4F6]">
              <X size={10} />
            </button>
          </div>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <a key={i} href={opt.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${opt.highlight ? 'bg-red-900/20 hover:bg-red-900/30 border border-red-200' : 'bg-[#F3F4F6] hover:bg-[#F3F4F6]'}`}>
                <span className="text-xs font-semibold text-[#111827]">{lang === 'zh' ? opt.zh : opt.name}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${opt.badgeColor}`}>{opt.badge}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Food Delivery Widget ───

const DELIVERY_APPS = [
  { name: '배달의민족', zh: '外卖民族', url: 'https://www.baemin.com/', deepLink: 'baemin://' },
  { name: '쿠팡이츠', zh: '酷澎Eats', url: 'https://www.coupangeats.com/', deepLink: 'coupangeats://' },
  { name: '요기요', zh: 'Yogiyo', url: 'https://www.yogiyo.co.kr/', deepLink: 'yogiyo://' },
]

const DELIVERY_GUIDE_STEPS = [
  { icon: '1', text: { ko: '한국 휴대폰 번호 필요', zh: '需要韩国手机号', en: 'Korean phone number needed' } },
  { icon: '2', text: { ko: '한국 카드 또는 계좌 등록', zh: '注册韩国银行卡或账户', en: 'Register Korean card or account' } },
  { icon: '3', text: { ko: '주소 등록 (한국어로)', zh: '注册地址(用韩语)', en: 'Register address (in Korean)' } },
  { icon: '4', text: { ko: '주문하기!', zh: '下单!', en: 'Order!' } },
]

function DeliveryWidget({ lang }) {
  const [view, setView] = useState(null)

  return (
    <div>
      {!view && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setView('order')}
            className="flex flex-col items-center gap-2 p-4 bg-[#F3F4F6] rounded-lg hover:shadow-md transition-all btn-press border border-[#111827]/20">
            <Utensils size={28} className="text-[#111827]" />
            <span className="text-xs font-bold text-[#111827]">
              {lang === 'ko' ? '배달 주문' : lang === 'zh' ? '点外卖' : 'Order Delivery'}
            </span>
          </button>
          <button onClick={() => setView('guide')}
            className="flex flex-col items-center gap-2 p-4 bg-[#F3F4F6] rounded-lg hover:shadow-md transition-all btn-press border border-[#111827]/20">
            <BookOpen size={28} className="text-[#111827]" />
            <span className="text-xs font-bold text-[#111827]">
              {lang === 'ko' ? '이용 가이드' : lang === 'zh' ? '使用指南' : 'How to Use'}
            </span>
          </button>
        </div>
      )}
      {view === 'order' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#111827]">
              {lang === 'ko' ? '배달 앱 선택' : lang === 'zh' ? '选择外卖App' : 'Choose Delivery App'}
            </span>
            <button onClick={() => setView(null)} className="text-[10px] text-[#6B7280] px-2 py-1 rounded-full bg-[#F3F4F6]">
              <X size={10} />
            </button>
          </div>
          <div className="space-y-1.5">
            {DELIVERY_APPS.map((app, i) => (
              <a key={i} href={app.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all">
                <span className="text-xs font-semibold text-[#111827]">{lang === 'zh' ? app.zh : app.name}</span>
                <ArrowLeftRight size={10} className="text-[#111827]" />
              </a>
            ))}
          </div>
        </div>
      )}
      {view === 'guide' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#111827]">
              {lang === 'ko' ? '배달앱 이용 가이드' : lang === 'zh' ? '外卖App使用指南' : 'Delivery App Guide'}
            </span>
            <button onClick={() => setView(null)} className="text-[10px] text-[#6B7280] px-2 py-1 rounded-full bg-[#F3F4F6]">
              <X size={10} />
            </button>
          </div>
          <div className="space-y-2 mb-3">
            {DELIVERY_GUIDE_STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-[#F3F4F6]">
                <span className="text-xs font-black text-[#111827] w-5 h-5 rounded-full bg-[#111827]/10 flex items-center justify-center shrink-0">{step.icon}</span>
                <span className="text-xs text-[#6B7280]">{L(lang, step.text)}</span>
              </div>
            ))}
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-amber-900/20 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700">Tip: </span>
            <span className="text-[10px] text-amber-700">
              {lang === 'ko' ? '번역 앱을 켜고 메뉴를 촬영하면 중국어로 볼 수 있어요'
                : lang === 'zh' ? '打开翻译App拍摄菜单即可看到中文'
                : 'Use camera translation for menus'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── K-Fashion Widget ───

function FashionWidget({ lang }) {
  const [fashionCat, setFashionCat] = useState(0)

  const cats = [
    { ko: '온라인 스토어', zh: '线上商店', en: 'Online Stores' },
    { ko: '오프라인 스토어', zh: '线下门店', en: 'Offline Stores' },
  ]

  const onlineStores = [
    {
      name: { ko: '무신사', zh: 'MUSINSA', en: 'MUSINSA' },
      desc: { ko: '한국 최대 패션 플랫폼', zh: '韩国最大时尚平台', en: "Korea's largest fashion platform" },
      url: 'https://www.musinsa.com',
      badge: { ko: '중국 매장 운영 중', zh: '运营中国站', en: 'China store available' },
    },
    {
      name: { ko: 'W컨셉', zh: 'W CONCEPT', en: 'W CONCEPT' },
      desc: { ko: '디자이너 브랜드 편집샵', zh: '设计师品牌集合店', en: 'Designer brand select shop' },
      url: 'https://www.wconcept.co.kr',
    },
    {
      name: { ko: '29CM', zh: '29CM', en: '29CM' },
      desc: { ko: '감성 라이프스타일 편집샵', zh: '感性生活方式集合店', en: 'Lifestyle select shop' },
      url: 'https://www.29cm.co.kr',
    },
  ]

  const offlineStores = [
    {
      name: { ko: '무신사 스탠다드', zh: 'MUSINSA Standard', en: 'MUSINSA Standard' },
      badge: { ko: '네컷사진 촬영 가능', zh: '可拍四格照片', en: '4-cut photo available' },
      locations: [
        { label: { ko: '홍대점', zh: '弘大店', en: 'Hongdae' }, url: 'https://map.naver.com/v5/search/무신사스탠다드+홍대' },
        { label: { ko: '강남점', zh: '江南店', en: 'Gangnam' }, url: 'https://map.naver.com/v5/search/무신사스탠다드+강남' },
        { label: { ko: '성수점', zh: '圣水店', en: 'Seongsu' }, url: 'https://map.naver.com/v5/search/무신사스탠다드+성수' },
      ],
    },
    {
      name: { ko: 'W컨셉 오프라인', zh: 'W CONCEPT 线下', en: 'W CONCEPT Offline' },
      locations: [
        { label: { ko: '신세계 백화점', zh: '新世界百货', en: 'Shinsegae Dept.' }, url: 'https://map.naver.com/v5/search/W컨셉+신세계' },
      ],
    },
    {
      name: { ko: '29CM 팝업', zh: '29CM 快闪店', en: '29CM Pop-up' },
      locations: [
        { label: { ko: '현재 위치 확인', zh: '查看当前位置', en: 'Check current location' }, url: 'https://map.naver.com/v5/search/29CM+팝업스토어' },
      ],
    },
  ]

  const openLabel = { ko: '열기', zh: '打开', en: 'Open' }

  return (
    <div>
      {fashionCat === 0 && (
        <div>
          {onlineStores.map((store, i) => (
            <div key={i} className={`flex items-center justify-between py-3 ${i < onlineStores.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#111827]">{L(lang, store.name)}</span>
                  {store.badge && (
                    <span className="text-[9px] bg-[#111827]/10 text-[#111827] px-1.5 py-0.5 rounded-full font-semibold">{L(lang, store.badge)}</span>
                  )}
                </div>
                <p className="text-[10px] text-[#6B7280] mt-0.5">{L(lang, store.desc)}</p>
              </div>
              <a href={store.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#111827] shrink-0">
                {L(lang, openLabel)} →
              </a>
            </div>
          ))}
        </div>
      )}

      {fashionCat === 1 && (
        <div>
          {offlineStores.map((store, i) => (
            <div key={i} className={`py-2 ${i < offlineStores.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-[#111827]">{L(lang, store.name)}</span>
                {store.badge && (
                  <span className="text-[9px] bg-[#111827]/10 text-[#111827] px-1.5 py-0.5 rounded-full font-semibold">{L(lang, store.badge)}</span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {store.locations.map((loc, j) => (
                  <a key={j} href={loc.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#6B7280] underline">
                    {L(lang, loc.label)}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-3">
        {cats.map((cat, i) => (
          <button key={i} onClick={() => setFashionCat(i)}
            className={`w-2 h-2 rounded-full transition-all ${fashionCat === i ? 'bg-[#111827] w-4' : 'bg-[#AEAEB2]'}`} />
        ))}
      </div>
    </div>
  )
}

// ─── Tax Refund Widget ───

function TaxRefundWidget({ lang }) {
  const [amount, setAmount] = useState('')

  function calcRefund(val) {
    if (!val || val < 30000) return 0
    if (val < 50000) return Math.round(val * 0.05)
    if (val < 200000) return Math.round(val * 0.06)
    return Math.round(val * 0.075)
  }

  const refund = calcRefund(parseFloat(amount) || 0)

  const airports = [
    { name: { ko: '인천공항 T1', zh: '仁川机场T1', en: 'Incheon T1' }, loc: { ko: '28번 게이트 근처', zh: '28号登机口附近', en: 'Near Gate 28' }, hours: '24h', mapUrl: 'https://map.google.com/maps?q=인천국제공항+제1여객터미널+세관+환급' },
    { name: { ko: '인천공항 T2', zh: '仁川机场T2', en: 'Incheon T2' }, loc: { ko: '중앙 환급 구역', zh: '中央退税区', en: 'Central refund zone' }, hours: '24h', mapUrl: 'https://map.google.com/maps?q=인천국제공항+제2여객터미널+세관+환급' },
    { name: { ko: '김포공항', zh: '金浦机场', en: 'Gimpo' }, loc: { ko: '국제선 2층', zh: '国际航站楼2楼', en: 'Intl Terminal 2F' }, hours: '06:00-21:00', mapUrl: 'https://map.google.com/maps?q=김포국제공항+국제선+세관' },
    { name: { ko: '김해공항', zh: '金海机场', en: 'Gimhae' }, loc: { ko: '국제선 3층', zh: '国际航站楼3楼', en: 'Intl Terminal 3F' }, hours: '06:00-21:00', mapUrl: 'https://map.google.com/maps?q=김해국제공항+국제선+세관' },
    { name: { ko: '제주공항', zh: '济州机场', en: 'Jeju' }, loc: { ko: '국제선 3층', zh: '国际航站楼3楼', en: 'Intl Terminal 3F' }, hours: '07:00-19:00', mapUrl: 'https://map.google.com/maps?q=제주국제공항+국제선+세관' },
  ]

  const instantVsPost = [
    { label: { ko: '', zh: '', en: '' },
      instant: { ko: '즉시환급 (매장)', zh: '即时退税 (店铺)', en: 'Instant (In-store)' },
      post: { ko: '사후환급 (공항)', zh: '事后退税 (机场)', en: 'Post (Airport)' }, isHeader: true },
    { label: { ko: '금액', zh: '金额', en: 'Amount' },
      instant: { ko: '1건 50만원 이하', zh: '单笔50万以下', en: 'Under 500K/item' },
      post: { ko: '제한 없음', zh: '无限制', en: 'No limit' } },
    { label: { ko: '한도', zh: '限额', en: 'Limit' },
      instant: { ko: '연 250만원', zh: '年250万', en: '2.5M/year' },
      post: { ko: '한도 없음', zh: '无限额', en: 'No cap' } },
    { label: { ko: '매장', zh: '店铺', en: 'Store' },
      instant: { ko: '즉시환급 가맹점만', zh: '仅即时退税加盟店', en: 'Instant refund stores only' },
      post: { ko: 'Tax Free 가맹점 전체', zh: '所有Tax Free加盟店', en: 'All Tax Free stores' } },
    { label: { ko: '방법', zh: '方式', en: 'Method' },
      instant: { ko: '계산대에서 바로 차감', zh: '收银台直接扣除', en: 'Deducted at checkout' },
      post: { ko: '공항 키오스크/카운터', zh: '机场自助机/柜台', en: 'Airport kiosk/counter' } },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#E5E7EB]">
        <p className="text-xs font-bold text-[#111827] mb-3">{lang === 'ko' ? '환급 예상 계산기' : lang === 'zh' ? '预估退税计算器' : 'Refund Calculator'}</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-[#6B7280]">₩</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={lang === 'ko' ? '구매 금액 입력' : lang === 'zh' ? '输入购买金额' : 'Enter amount'}
            className="w-full text-right text-base font-black text-[#111827] bg-[#F3F4F6] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#111827]/50 placeholder:text-[#6B7280] placeholder:text-xs"
          />
        </div>
        <div className="w-full text-center py-2 bg-[#F3F4F6] rounded-xl">
          <p className="text-[11px] text-[#6B7280] mb-1">{lang === 'ko' ? '예상 환급액' : lang === 'zh' ? '预估退税金额' : 'Estimated Refund'}</p>
          <p className="text-xl font-black text-[#111827]">₩{refund.toLocaleString('ko-KR')}</p>
        </div>
        <p className="text-[9px] text-[#6B7280] text-center mt-2">
          {lang === 'ko' ? '※ 실제 환급액은 물품 종류에 따라 다를 수 있습니다' : lang === 'zh' ? '※ 实际退税金额可能因商品种类而异' : '※ Actual refund may vary by product type'}
        </p>
      </div>

      <div className="glass rounded-lg p-4">
        <p className="text-xs font-bold text-[#111827] mb-2">{lang === 'ko' ? '즉시환급 vs 사후환급' : lang === 'zh' ? '即时退税 vs 事后退税' : 'Instant vs Post Refund'}</p>
        <div className="space-y-0">
          {instantVsPost.map((row, i) => (
            <div key={i} className={`grid grid-cols-2 gap-1.5 ${row.isHeader ? 'mb-1' : ''}`}>
              <div className={`px-2 py-1.5 rounded-l-lg ${row.isHeader ? 'bg-[#111827]/20' : 'bg-[#F3F4F6]'}`}>
                <p className={`text-[10px] ${row.isHeader ? 'font-bold text-[#111827]' : 'text-[#6B7280]'}`}>{L(lang, row.instant)}</p>
              </div>
              <div className={`px-2 py-1.5 rounded-r-lg ${row.isHeader ? 'bg-[#E5E7EB]' : 'bg-[#F3F4F6]'}`}>
                <p className={`text-[10px] ${row.isHeader ? 'font-bold text-[#111827]' : 'text-[#6B7280]'}`}>{L(lang, row.post)}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-[#6B7280] mt-2 leading-relaxed">
          {L(lang, { ko: '※ 백화점 내에서도 브랜드별 가맹 사업자(글로벌택스프리/KTP/글로벌블루)가 다릅니다. 즉시환급 가맹이면 매장에서 바로, 아니면 키오스크에서 사후환급 신청합니다.', zh: '※ 即使在百货商店内，各品牌的退税运营商（Global Tax Free/KTP/Global Blue）也不同。如果是即时退税加盟店可在店内直接办理，否则需在自助机申请事后退税。', en: '※ Even within department stores, different brands use different tax refund operators (Global Tax Free/KTP/Global Blue). If the store supports instant refund, get it at checkout; otherwise, apply at the airport kiosk.' })}
        </p>
      </div>

      <div className="glass rounded-lg p-4">
        <p className="text-xs font-bold text-[#111827] mb-2">{lang === 'ko' ? '공항별 환급 안내' : lang === 'zh' ? '各机场退税指南' : 'Airport Refund Guide'}</p>
        <div className="space-y-1.5">
          {airports.map((a, i) => (
            <a key={i} href={a.mapUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-[#111827]">{L(lang, a.name)}</span>
                <span className="text-[10px] text-[#6B7280] ml-1.5">{L(lang, a.loc)}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-[#111827]">{a.hours}</span>
                <MapPin size={10} className="text-[#111827]" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="glass rounded-lg p-4">
        <p className="text-[11px] text-[#6B7280] leading-relaxed">
          {L(lang, { ko: '구매 최소 금액: 1회 3만원 이상 (부가세 포함)', zh: '最低购买金额: 单次3万韩元以上(含增值税)', en: 'Min purchase: ₩30,000+ per transaction (VAT incl.)' })}
        </p>
      </div>
    </div>
  )
}

// ─── Korean Traditional Experience Widget ───

function TraditionWidget({ lang }) {
  const data = widgetMockData.tradition
  const [activeTab, setActiveTab] = useState('cooking')

  const filtered = data.items.filter(item => item.category === activeTab)

  function getBookingUrl(item) {
    return item.bookUrl || `https://www.klook.com/ko/search?query=${encodeURIComponent(item.name.en)}` // TODO: replace with affiliate link
  }

  function getCtripUrl(item) {
    return item.tripUrl || `https://www.trip.com/travel-guide/south-korea/?keyword=${encodeURIComponent(item.name.en)}` // TODO: replace with affiliate link
  }

  return (
    <div>
      <div className="flex gap-1.5 mb-3 bg-[#F3F4F6] rounded-xl p-1">
        {data.categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveTab(cat.id)}
            className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all ${
              activeTab === cat.id
                ? 'bg-[#111827] text-[#111827] shadow'
                : 'text-[#6B7280] hover:text-[#6B7280]'
            }`}>
            {L(lang, cat.label)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item, i) => (
          <div key={i} className="p-3 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all">
            <div className="flex items-start gap-2.5">
              <Sparkles size={20} className="text-[#111827] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#111827] mb-0.5">{L(lang, item.name)}</p>
                <p className="text-[10px] text-[#6B7280] mb-1">{L(lang, item.location)}</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-semibold text-[#111827]">{item.price}</span>
                  <span className="text-[10px] text-[#6B7280]">{L(lang, item.duration)}</span>
                </div>
                <div className="flex gap-1.5">
                  <a href={getBookingUrl(item)} target="_blank" rel="noopener noreferrer"
                    className="text-[9px] font-bold text-white bg-[#111827] px-2.5 py-1 rounded-lg hover:bg-[#111827] transition-all">
                    {lang === 'ko' ? '예약하기' : lang === 'zh' ? '预订' : 'Book'}
                  </a>
                  <a href={getCtripUrl(item)} target="_blank" rel="noopener noreferrer"
                    className="text-[9px] font-bold text-[#111827] bg-[#111827]/10 px-2.5 py-1 rounded-lg hover:bg-[#111827]/20 transition-all">
                    Trip.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <a href="https://korean.visitkorea.or.kr/experience/experience_list.do" target="_blank" rel="noopener noreferrer"
        className="block mt-3 text-center text-xs font-bold text-[#111827] bg-[#F3F4F6] rounded-xl py-2 hover:bg-[#E5E7EB] transition-all">
        {lang === 'ko' ? '더 많은 체험 보기' : lang === 'zh' ? '查看更多体验' : 'See more experiences'}
      </a>
    </div>
  )
}

// ─── News Widget ───

function NewsWidget({ data, lang }) {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = expanded ? data.items : data.items.slice(0, 3)

  return (
    <div>
      <div className="space-y-2">
        {visibleItems.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
            className="block p-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all">
            <p className="text-xs font-semibold text-[#111827] leading-relaxed">{L(lang, item.title)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[#6B7280]">{L(lang, item.source)}</span>
              <span className="text-[10px] text-[#9CA3AF]">{item.date}</span>
            </div>
          </a>
        ))}
      </div>
      {data.items.length > 3 && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 text-center text-xs font-bold text-[#111827] bg-[#F3F4F6] rounded-xl py-2 hover:bg-[#E5E7EB] transition-all">
          {expanded
            ? (lang === 'ko' ? '접기' : lang === 'zh' ? '收起' : 'Show less')
            : (lang === 'ko' ? '더보기' : lang === 'zh' ? '查看更多' : 'Show more')
          }
        </button>
      )}
    </div>
  )
}

// ─── Olive Young Sale Widget ───

const OY_SALE_SCHEDULE = [
  { month: 1, label: { ko: '신년 올영세일', zh: '新年Olive Young大促', en: 'New Year Sale' }, discount: '~50%' },
  { month: 3, label: { ko: '봄 올영세일', zh: '春季Olive Young大促', en: 'Spring Sale' }, discount: '~50%' },
  { month: 6, label: { ko: '여름 올영세일', zh: '夏季Olive Young大促', en: 'Summer Sale' }, discount: '~50%' },
  { month: 9, label: { ko: '가을 올영세일', zh: '秋季Olive Young大促', en: 'Fall Sale' }, discount: '~50%' },
  { month: 11, label: { ko: '블랙프라이데이', zh: '黑五大促', en: 'Black Friday' }, discount: '~70%' },
  { month: 12, label: { ko: '연말 올영세일', zh: '年末Olive Young大促', en: 'Year-end Sale' }, discount: '~50%' },
]

function OliveYoungSaleWidget({ lang }) {
  const [promos, setPromos] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to fetch from Olive Young global promotions page
    // Since direct fetch will likely fail (CORS), we use the sale schedule as primary
    // and attempt to check if global.oliveyoung.com/promotions has active sales
    fetch('https://global.oliveyoung.com/promotions', { mode: 'no-cors' })
      .then(() => {
        // no-cors won't give us data, but at least confirms site is up
        setPromos(null)
      })
      .catch(() => setPromos(null))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const currentMonth = now.getMonth() + 1

  // Find next upcoming sale
  const upcomingSales = OY_SALE_SCHEDULE.filter(s => s.month >= currentMonth)
  const pastSales = OY_SALE_SCHEDULE.filter(s => s.month < currentMonth)
  const sortedSales = [...upcomingSales, ...pastSales]

  const nextSale = sortedSales[0]
  const monthsUntil = nextSale.month >= currentMonth
    ? nextSale.month - currentMonth
    : 12 - currentMonth + nextSale.month

  return (
    <div>
      {/* Next sale highlight */}
      <div className="bg-gradient-to-r from-[#111827]/10 to-[#111827]/5 rounded-xl p-3 mb-3 border border-[#111827]/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-[#111827]">
            {lang === 'ko' ? '다음 세일' : lang === 'zh' ? '下次大促' : 'Next Sale'}
          </span>
          <span className="text-[10px] font-bold text-[#111827]">
            {monthsUntil === 0
              ? (lang === 'ko' ? '이번 달!' : lang === 'zh' ? '本月！' : 'This month!')
              : `${monthsUntil}${lang === 'ko' ? '개월 후' : lang === 'zh' ? '个月后' : ' months'}`
            }
          </span>
        </div>
        <p className="text-sm font-bold text-[#111827]">{L(lang, nextSale.label)}</p>
        <p className="text-xs text-[#111827] font-semibold">{lang === 'ko' ? '최대' : lang === 'zh' ? '最高' : 'Up to'} {nextSale.discount} OFF</p>
      </div>

      {/* Annual sale calendar */}
      <p className="text-[10px] font-semibold text-[#6B7280] mb-2">
        {lang === 'ko' ? '연간 세일 일정' : lang === 'zh' ? '年度大促日程' : 'Annual Sale Schedule'}
      </p>
      <div className="space-y-1">
        {OY_SALE_SCHEDULE.map((sale, i) => {
          const isPast = sale.month < currentMonth
          const isCurrent = sale.month === currentMonth
          return (
            <div key={i} className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${
              isCurrent ? 'bg-[#111827]/10 font-bold' : isPast ? 'opacity-40' : ''
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-6 text-center font-mono text-[10px] ${isCurrent ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
                  {sale.month}{lang === 'ko' ? '월' : lang === 'zh' ? '月' : ''}
                </span>
                <span className={isCurrent ? 'text-[#111827]' : 'text-[#6B7280]'}>{L(lang, sale.label)}</span>
              </div>
              <span className="text-[10px] text-[#111827]">{sale.discount}</span>
            </div>
          )
        })}
      </div>

      {/* Links */}
      <div className="flex gap-2 mt-3">
        <a href="https://global.oliveyoung.com/promotions" target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center text-[10px] font-bold text-white bg-[#111827] py-2 rounded-lg hover:bg-[#1F2937] transition-all">
          {lang === 'ko' ? '글로벌몰' : lang === 'zh' ? '全球商城' : 'Global Mall'}
        </a>
        <a href="https://www.oliveyoung.co.kr/store/main/main.do" target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center text-[10px] font-bold text-[#111827] bg-[#111827]/10 py-2 rounded-lg hover:bg-[#111827]/20 transition-all">
          {lang === 'ko' ? '한국몰' : lang === 'zh' ? '韩国商城' : 'Korea Mall'}
        </a>
      </div>
    </div>
  )
}

// ─── Theme Park Discount Widget ───

const THEME_PARKS = [
  {
    name: { ko: '롯데월드', zh: '乐天世界', en: 'Lotte World' },
    location: { ko: '서울 잠실', zh: '首尔蚕室', en: 'Seoul Jamsil' },
    regular: { adult: '62,000', child: '48,000' },
    tips: [
      { method: { ko: 'Klook 사전예약', zh: 'Klook提前预订', en: 'Klook advance booking' }, discount: '~30%', url: 'https://www.klook.com/ko/activity/225-lotte-world-ticket/', best: true },
      { method: { ko: '카카오톡 쿠폰', zh: 'KakaoTalk优惠券', en: 'KakaoTalk coupon' }, discount: '~20%', url: 'https://gift.kakao.com/search/result?query=롯데월드' },
      { method: { ko: '연간이용권 소지자 동반할인', zh: '年卡持有者同行折扣', en: 'Annual pass companion' }, discount: '~50%', url: 'https://adventure.lotteworld.com/' },
      { method: { ko: '오후 4시 이후 입장', zh: '下午4点后入场', en: 'After 4PM entry' }, discount: '~40%', url: 'https://adventure.lotteworld.com/' },
      { method: { ko: '통신사 멤버십 (T/KT/U+)', zh: '运营商会员(T/KT/U+)', en: 'Carrier membership' }, discount: '~30%', url: 'https://adventure.lotteworld.com/' },
    ]
  },
  {
    name: { ko: '에버랜드', zh: '爱宝乐园', en: 'Everland' },
    location: { ko: '경기 용인', zh: '京畿龙仁', en: 'Yongin, Gyeonggi' },
    regular: { adult: '64,000', child: '51,000' },
    tips: [
      { method: { ko: 'Klook 사전예약', zh: 'Klook提前预订', en: 'Klook advance booking' }, discount: '~35%', url: 'https://www.klook.com/ko/activity/226-everland-ticket/', best: true },
      { method: { ko: 'Trip.com 예약', zh: 'Trip.com预订', en: 'Trip.com booking' }, discount: '~30%', url: 'https://www.trip.com/travel-guide/attraction/yongin/everland/' },
      { method: { ko: '카카오톡 쿠폰', zh: 'KakaoTalk优惠券', en: 'KakaoTalk coupon' }, discount: '~20%', url: 'https://gift.kakao.com/search/result?query=에버랜드' },
      { method: { ko: '오후 5시 이후 야간권', zh: '下午5点后夜间票', en: 'After 5PM night ticket' }, discount: '~50%', url: 'https://www.everland.com/' },
      { method: { ko: '삼성카드 할인', zh: '三星卡折扣', en: 'Samsung Card discount' }, discount: '~30%', url: 'https://www.everland.com/' },
    ]
  },
]

function ThemeParkWidget({ lang }) {
  const [activePark, setActivePark] = useState(0)
  const park = THEME_PARKS[activePark]

  return (
    <div>
      {/* Park selector */}
      <div className="flex gap-2 mb-3">
        {THEME_PARKS.map((p, i) => (
          <button key={i} onClick={() => setActivePark(i)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
              activePark === i ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}>
            {L(lang, p.name)}
          </button>
        ))}
      </div>

      {/* Park info */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#6B7280]">{L(lang, park.location)}</span>
          <span className="text-[10px] text-[#9CA3AF]">
            {lang === 'ko' ? '정가' : lang === 'zh' ? '原价' : 'Regular'}: {park.regular.adult}
          </span>
        </div>
      </div>

      {/* Discount methods */}
      <p className="text-[10px] font-semibold text-[#6B7280] mb-1.5">
        {lang === 'ko' ? '할인받는 법' : lang === 'zh' ? '折扣方法' : 'How to get discounts'}
      </p>
      <div className="space-y-1.5">
        {park.tips.map((tip, i) => (
          <a key={i} href={tip.url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg transition-all ${
              tip.best ? 'bg-[#111827]/10 border border-[#111827]/20' : 'bg-[#F3F4F6] hover:bg-[#E5E7EB]'
            }`}>
            <div className="flex items-center gap-2">
              {tip.best && <span className="text-[8px] font-bold text-white bg-[#111827] px-1.5 py-0.5 rounded">BEST</span>}
              <span className="text-xs text-[#111827]">{L(lang, tip.method)}</span>
            </div>
            <span className="text-xs font-bold text-[#111827]">{tip.discount}</span>
          </a>
        ))}
      </div>

      {/* Affiliate note */}
      <p className="text-[8px] text-[#9CA3AF] text-center mt-2">
        {lang === 'ko' ? 'Klook/Trip.com 링크를 통해 예약하면 HanPocket 서비스 개선에 도움이 됩니다'
          : lang === 'zh' ? '通过Klook/Trip.com链接预订有助于改善HanPocket服务'
          : 'Booking via Klook/Trip.com helps improve HanPocket'}
      </p>
    </div>
  )
}

// ─── Korean Food Category Widget ───

function RestaurantWidget({ lang }) {
  const [cityFilter, setCityFilter] = useState('all')
  const [guFilter, setGuFilter] = useState('all')
  const [cuisineFilter, setCuisineFilter] = useState('all')
  const [photoIndices, setPhotoIndices] = useState({})
  const [page, setPage] = useState(0)
  const CARDS_PER_PAGE = 6

  const allRestaurants = [...MICHELIN_RESTAURANTS, ...BLUE_RIBBON_RESTAURANTS]

  const filtered = allRestaurants.filter(r => {
    if (cityFilter !== 'all' && r.area.city !== cityFilter) return false
    if (guFilter !== 'all' && r.area.gu !== guFilter) return false
    if (cuisineFilter !== 'all' && r.cuisine !== cuisineFilter) return false
    return true
  })

  const paged = filtered.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE)
  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE)

  const availableGus = cityFilter === 'all'
    ? []
    : (LOCATION_FILTERS.find(l => l.city === cityFilter)?.gus || [])

  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndices(prev => {
        const next = { ...prev }
        paged.forEach(r => { next[r.id] = ((prev[r.id] || 0) + 1) })
        return next
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [page, cityFilter, guFilter, cuisineFilter])

  useEffect(() => { setPage(0) }, [cityFilter, guFilter, cuisineFilter])
  useEffect(() => { setGuFilter('all') }, [cityFilter])

  const awardBadge = (award, count) => {
    if (award === 'michelin3') return { text: '\u2605\u2605\u2605 Michelin', bg: '#C41D21' }
    if (award === 'michelin2') return { text: '\u2605\u2605 Michelin', bg: '#C41D21' }
    if (award === 'michelin1') return { text: '\u2605 Michelin', bg: '#C41D21' }
    if (award === 'bib') return { text: 'Bib Gourmand', bg: '#C41D21' }
    if (award === 'blueribbon') return { text: `Blue Ribbon \u00D7${count || 1}`, bg: '#1A56DB' }
    return { text: 'Selected', bg: '#111827' }
  }

  const priceLabel = (n) => Array(n).fill('\u20A9').join('')

  return (
    <div>
      {/* Location filters */}
      <div className="flex gap-1.5 mb-2">
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
          className="text-[9px] font-semibold px-1.5 py-1 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] outline-none">
          <option value="all">{lang === 'ko' ? '\uC804\uCCB4 \uB3C4\uC2DC' : lang === 'zh' ? '\u5168\u90E8\u57CE\u5E02' : 'All Cities'}</option>
          {LOCATION_FILTERS.map(l => <option key={l.city} value={l.city}>{l.city}</option>)}
        </select>
        {cityFilter !== 'all' && (
          <select value={guFilter} onChange={e => setGuFilter(e.target.value)}
            className="text-[9px] font-semibold px-1.5 py-1 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] outline-none">
            <option value="all">{lang === 'ko' ? '\uC804\uCCB4 \uAD6C' : lang === 'zh' ? '\u5168\u90E8\u533A' : 'All Districts'}</option>
            {availableGus.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        )}
        <span className="text-[8px] text-[#9CA3AF] self-center ml-auto">{filtered.length}{lang === 'ko' ? '\uACF3' : lang === 'zh' ? '\u5BB6' : ''}</span>
      </div>

      {/* Cuisine pills */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {RESTAURANT_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCuisineFilter(cat.id)}
            className={`text-[9px] font-semibold px-2 py-1 rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
              cuisineFilter === cat.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}>
            {L(lang, cat.label)}
          </button>
        ))}
      </div>

      {/* Restaurant cards — 텍스트 리스트 (이미지 데이터 부정확하여 제거) */}
      <div className="space-y-2">
        {paged.map(r => {
          const badge = awardBadge(r.award, r.awardCount)
          return (
            <a key={r.id}
              href={r.michelinUrl || r.naverMapUrl}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E7EB] hover:border-[#111827] transition-all group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: badge.bg + '18' }}>
                <Utensils size={16} style={{ color: badge.bg }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#111827] truncate">{L(lang, r.name)}</span>
                  <span className="text-[8px] font-bold text-white px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: badge.bg }}>
                    {badge.text}
                  </span>
                </div>
                <p className="text-[9px] text-[#9CA3AF] mt-0.5">
                  {r.area.city} {r.area.gu}{r.area.dong ? ` ${r.area.dong}` : ''}{r.cuisine !== 'other' ? ` · ${r.cuisine}` : ''}
                </p>
              </div>
              <ChevronRight size={14} className="text-[#D1D5DB] shrink-0 group-hover:text-[#111827] transition-colors" />
            </a>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="text-[9px] font-bold px-2 py-1 rounded-lg bg-[#F3F4F6] text-[#6B7280] disabled:opacity-30">
            <ChevronRight size={10} className="rotate-180 inline" />
          </button>
          <span className="text-[9px] text-[#9CA3AF]">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="text-[9px] font-bold px-2 py-1 rounded-lg bg-[#F3F4F6] text-[#6B7280] disabled:opacity-30">
            <ChevronRight size={10} className="inline" />
          </button>
        </div>
      )}

      {/* Guide links */}
      <div className="mt-3 pt-2 border-t border-[#E5E7EB] flex gap-2">
        <a href="https://guide.michelin.com/kr/ko/restaurants" target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center text-[9px] font-bold text-white bg-[#C41D21] py-1.5 rounded-lg hover:bg-[#A01820] transition-all">
          Michelin Guide
        </a>
        <a href="https://www.bluer.co.kr" target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center text-[9px] font-bold text-[#1A56DB] bg-[#1A56DB]/10 py-1.5 rounded-lg hover:bg-[#1A56DB]/20 transition-all">
          {lang === 'ko' ? '\uBE14\uB8E8\uB9AC\uBCF8' : 'Blue Ribbon'}
        </a>
      </div>
    </div>
  )
}

// ─── Widget Content Renderers ───

function WidgetContent({ widgetId, lang, setTab }) {
  const data = widgetMockData[widgetId]
  if (!data && !['timezone','holiday','parcel','accommodation','beauty','delivery','taxrefund','editorpick','cvsnew','beautynew'].includes(widgetId)) return <p className="text-xs text-[#9CA3AF]">—</p>

  switch (widgetId) {
    case 'news':
      return <NewsWidget data={data} lang={lang} />

    case 'oliveyoung':
      return <OliveYoungSaleWidget lang={lang} />

    case 'themepark':
      return <ThemeParkWidget lang={lang} />

    case 'delivery':
      return <DeliveryWidget lang={lang} />

    case 'transport':
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-900/200 text-white px-2 py-0.5 rounded-full font-bold">{data.line}</span>
            <span className="text-xs text-[#6B7280]">{L(lang, data.status)}</span>
          </div>
          <span className="text-xs font-bold text-[#111827]">
            <Train size={14} className="inline mr-1" />{data.nextTrain}
          </span>
        </div>
      )

    case 'restaurant':
      return <RestaurantWidget lang={lang} />

    case 'currency':
      return (
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[#6B7280]">CN 1 CNY</span>
            <span className="text-sm font-black text-[#111827]">{data.cnyToKrw} KRW</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[#6B7280]">US 1 USD</span>
            <span className="text-sm font-bold text-[#6B7280]">{data.usdToKrw} KRW</span>
          </div>
          <p className="text-[10px] text-[#6B7280] mt-1">{lang === 'ko' ? '업데이트' : lang === 'zh' ? '更新于' : 'Updated'} {data.updated}</p>
        </div>
      )

    case 'timezone':
      return <TimezoneWidget lang={lang} />

    case 'holiday':
      return <HolidayCalendarWidget lang={lang} />

    case 'parcel':
      return <ParcelWidget lang={lang} />

    case 'accommodation':
      return <AccommodationWidget lang={lang} />

    case 'korean':
      return (
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-[#6B7280]">{lang === 'ko' ? '오늘의 한국어 표현' : lang === 'zh' ? '今日韩语表达' : "Today's Korean"}</p>
            {data.day && (
              <span className="text-[10px] font-bold text-white bg-[#111827] px-2 py-0.5 rounded-full">
                Day {data.day}
              </span>
            )}
          </div>
          {data.word ? (
            <>
              <p className="text-xl font-black text-[#111827] mt-1">{L('ko', data.word)}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">{L(lang, data.word)} <span className="text-[#9CA3AF]">/{data.pronunciation}/</span></p>
              <p className="text-[10px] text-[#6B7280] mt-1">{L(lang, data.meaning)}</p>
              {data.example?.sentence && (
                <div className="flex items-center gap-1.5 mt-2 bg-[#F3F4F6] px-2.5 py-1.5 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-[#111827] font-mono">"{L('ko', data.example.sentence)}"</p>
                    {data.example.pronunciation && <p className="text-[9px] text-[#9CA3AF] mt-0.5">/{data.example.pronunciation}/</p>}
                  </div>
                  <button onClick={() => {
                    try {
                      if (!('speechSynthesis' in window)) {
                        throw new Error('speechSynthesis not supported')
                      }
                      const u = new SpeechSynthesisUtterance(L('ko', data.example.sentence))
                      u.lang = 'ko-KR'; u.rate = 0.8; speechSynthesis.speak(u)
                    } catch (err) {
                      console.warn('Web Speech API unavailable:', err)
                      alert(lang === 'ko' ? '음성 기능은 이 환경에서 사용할 수 없습니다' : lang === 'zh' ? '语音功能在此环境中不可用' : 'Voice feature unavailable in this environment')
                    }
                  }} className="shrink-0 w-7 h-7 rounded-full bg-[#111827]/10 flex items-center justify-center hover:bg-[#111827]/20 transition-all">
                    <Volume2 size={14} className="text-[#111827]" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-[#111827]">{L(lang, data.expression)}</p>
              <p className="text-[10px] text-[#6B7280] mt-1">{L(lang, data.meaning)}</p>
            </>
          )}
        </div>
      )

    case 'streak':
      return (
        <div className="cursor-pointer" onClick={() => setTab && setTab('learn')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={28} className="text-orange-500" />
              <div>
                <p className="text-lg font-black text-[#111827]">{data.days}{lang === 'ko' ? '일' : lang === 'zh' ? '天' : ' days'}</p>
                <p className="text-[10px] text-[#6B7280]">
                  {lang === 'ko' ? `연속 ${data.days}일 학습 중` : lang === 'zh' ? `连续${data.days}天学习中` : `${data.days} day streak`}
                </p>
              </div>
            </div>
            {data.todayDone ? (
              <span className="text-xs font-bold text-green-600 bg-green-500 px-2 py-1.5 rounded-full"><Check size={14} className="text-white" /></span>
            ) : (
              <span className="text-xs font-bold text-[#111827] bg-amber-900/20 px-3 py-1.5 rounded-full animate-pulse">
                {lang === 'ko' ? '오늘 학습' : lang === 'zh' ? '今日学习' : 'Study today'}
              </span>
            )}
          </div>
          <p className="text-[9px] text-[#9CA3AF] mt-1">
            {lang === 'ko' ? '최고 기록' : lang === 'zh' ? '最高纪录' : 'Best'}: {data.longest}{lang === 'ko' ? '일' : lang === 'zh' ? '天' : ' days'} · {lang === 'ko' ? '탭하여 학습하기' : lang === 'zh' ? '点击去学习' : 'Tap to study'}
          </p>
        </div>
      )

    case 'visaqa':
      return (
        <div className="space-y-2">
          {data.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              {item.hot && <span className="text-[10px] font-bold text-red-500 bg-red-900/20 px-1.5 py-0.5 rounded shrink-0">HOT</span>}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#6B7280] truncate">{L(lang, item.q)}</p>
                <p className="text-[10px] text-[#6B7280]">{item.answers}{lang === 'ko' ? '개 답변' : lang === 'zh' ? '个回答' : ' answers'}</p>
              </div>
            </div>
          ))}
        </div>
      )

    case 'expat':
      return (
        <div className="space-y-2">
          {data.items.map((item, i) => (
            <div key={i}>
              <p className="text-xs font-semibold text-[#111827]">{L(lang, item.title)}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-[#6B7280]">{item.replies}</span>
                <span className="text-[10px] text-[#6B7280]">{item.likes}</span>
              </div>
            </div>
          ))}
        </div>
      )

    case 'trending':
      return (
        <div className="space-y-1.5">
          {data.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#111827] w-4">{i + 1}</span>
                <span className="text-xs text-[#6B7280]">{L(lang, item.label)}</span>
              </div>
              <span className="text-[10px] text-[#6B7280]">{item.viewers.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )

    case 'idol':
      return (
        <div>
          <p className="text-xs font-bold text-[#111827] mb-1.5">{data.name}</p>
          {data.schedule.map((s, i) => <p key={i} className="text-xs text-[#6B7280]">• {L(lang, s)}</p>)}
        </div>
      )

    case 'drama':
      return (
        <div className="space-y-2">
          {data.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#111827]">{L(lang, item.name)}</p>
                <p className="text-[10px] text-[#6B7280]">{item.time}</p>
              </div>
              {item.rating && (
                <span className="text-[10px] font-bold text-[#111827] bg-amber-900/20 px-2 py-0.5 rounded-full">{item.rating}</span>
              )}
            </div>
          ))}
        </div>
      )

    case 'editorpick':
      return <EditorPickWidget lang={lang} />

    case 'cvsnew':
      return <ConvenienceStoreWidget lang={lang} />

    case 'beautynew':
      return <BeautyNewWidget lang={lang} />

    case 'kpop':
      return <KpopChartWidget lang={lang} />

    case 'fanevent':
      return <FanEventIdolWidget lang={lang} />

    case 'taxrefund':
      return <TaxRefundWidget lang={lang} />

    case 'beauty':
      return <BeautyWidget lang={lang} />

    case 'fashiontrend':
      return <FashionWidget lang={lang} />

    case 'trip':
      return <TravelCurationWidget lang={lang} />


    case 'tradition':
      return <TraditionWidget lang={lang} />

    case 'festival':
      return <FestivalWidget lang={lang} />

    case 'pet': {
      const petData = widgetMockData.pet
      const [petChecked, setPetChecked] = useState(() => {
        try { return JSON.parse(localStorage.getItem('pet_checklist')) || {} } catch { return {} }
      })
      const togglePet = (id) => {
        const updated = { ...petChecked, [id]: !petChecked[id] }
        setPetChecked(updated)
        localStorage.setItem('pet_checklist', JSON.stringify(updated))
      }
      const doneCount = petData.checklist.filter(c => petChecked[c.id]).length
      const total = petData.checklist.length
      const pct = Math.round((doneCount / total) * 100)
      return (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#111827]">{lang === 'ko' ? '준비 체크리스트' : lang === 'zh' ? '准备清单' : 'Preparation Checklist'}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pct === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {pct}%
            </span>
          </div>
          <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 mb-3">
            <div className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-green-900/200' : 'bg-[#111827]'}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="space-y-1.5">
            {petData.checklist.map(item => (
              <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                <button onClick={() => togglePet(item.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs transition-all ${petChecked[item.id] ? 'bg-[#111827] border-[#111827] text-white' : 'border-[#E5E7EB]'}`}>
                  {petChecked[item.id] && <Check size={12} className="text-white" />}
                </button>
                <LucideIcon name={item.icon} size={16} className="text-[#111827]" />
                <span className={`text-xs ${petChecked[item.id] ? 'text-[#6B7280] line-through' : 'text-[#6B7280]'}`}>{L(lang, item.label)}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setTab && setTab('pet')}
              className="flex-1 text-[10px] font-bold text-[#111827] bg-[#F3F4F6] py-2 rounded-xl hover:bg-[#E5E7EB] transition-all btn-press">
              {lang === 'ko' ? '상세 가이드 보기' : lang === 'zh' ? '查看详细指南' : 'View Full Guide'}
            </button>
            <button onClick={() => setTab && setTab('agency')}
              className="flex-1 text-[10px] font-bold text-white bg-[#111827] py-2 rounded-xl hover:bg-[#111827] transition-all btn-press">
              {lang === 'ko' ? '대행 서비스 신청' : lang === 'zh' ? '申请代办服务' : 'Request Service'}
            </button>
          </div>
        </div>
      )
    }

    case 'weatherCompare':
      return (
        <div className="flex items-center justify-around">
          <div className="text-center">
            <LucideIcon name={data.korea.icon} size={28} className="text-[#111827]" />
            <p className="text-xs font-bold text-[#111827]">{L(lang, data.korea.city)}</p>
            <p className="text-sm font-black text-[#111827]">{data.korea.temp}</p>
          </div>
          <span className="text-xs text-[#6B7280] font-bold">vs</span>
          <div className="text-center">
            <LucideIcon name={data.china.icon} size={28} className="text-[#111827]" />
            <p className="text-xs font-bold text-[#111827]">{L(lang, data.china.city)}</p>
            <p className="text-sm font-black text-[#111827]">{data.china.temp}</p>
          </div>
        </div>
      )

    case 'realestate':
      return <div className="space-y-1">{data.items.map((item, i) => (
        <p key={i} className="text-xs text-[#6B7280]">{L(lang, item)}</p>
      ))}</div>

    case 'newsTranslated':
      return (
        <div className="space-y-2">
          {data.items.map((item, i) => (
            <div key={i}>
              <p className="text-xs font-semibold text-[#111827]">{L(lang, item)}</p>
              <p className="text-[10px] text-[#6B7280]">{item.source}</p>
            </div>
          ))}
        </div>
      )

    case 'emergency':
      return (
        <div className="grid grid-cols-3 gap-2">
          {data.items.map((item, i) => (
            <div key={i} className="text-center">
              <LucideIcon name={item.icon} size={20} className="text-[#111827]" />
              <p className="text-sm font-black text-[#111827]">{item.label}</p>
              <p className="text-[10px] text-[#6B7280]">{L(lang, item.desc)}</p>
            </div>
          ))}
        </div>
      )

    default:
      return <p className="text-xs text-[#9CA3AF]">—</p>
  }
}

// ─── Customize Modal ───

function CustomizeModal({ config, setConfig, lang, onClose }) {
  const [localConfig, setLocalConfig] = useState({ ...config })
  const labels = {
    ko: '나만의 홈 꾸미기', zh: '自定义首页', en: 'Customize Home',
  }

  const toggleWidget = (id) => {
    setLocalConfig(prev => ({
      ...prev,
      enabled: { ...prev.enabled, [id]: !prev.enabled[id] },
    }))
  }

  const moveCategory = (idx, dir) => {
    const newOrder = [...localConfig.order]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= newOrder.length) return
    ;[newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]]
    setLocalConfig(prev => ({ ...prev, order: newOrder }))
  }

  const save = () => {
    setConfig(localConfig)
    saveWidgetConfig(localConfig)
    onClose()
  }

  const orderedCategories = localConfig.order.map(id => widgetCategories.find(c => c.id === id)).filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 bg-[#F3F4F6] overflow-y-auto animate-fade-in">
      <div className="bg-white border-b border-[#E5E7EB] px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{labels[lang]}</h1>
          <button onClick={onClose} className="text-[#6B7280] text-sm px-3 py-1.5 rounded-full border border-[#3A3A3C]">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="px-4 pt-4 pb-24 space-y-4">
        {orderedCategories.map((cat, idx) => (
          <div key={cat.id} className="glass rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F3F4F6] border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <LucideIcon name={cat.icon} size={18} className="text-[#111827]" />
                <span className="font-bold text-[#111827] text-sm">{L(lang, cat.name)}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => moveCategory(idx, -1)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${idx === 0 ? 'text-[#D1D1D6]' : 'text-[#6B7280] bg-[#F3F4F6] hover:bg-[#4A1525] btn-press'}`}
                  disabled={idx === 0}>▲</button>
                <button onClick={() => moveCategory(idx, 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${idx === orderedCategories.length - 1 ? 'text-[#D1D1D6]' : 'text-[#6B7280] bg-[#F3F4F6] hover:bg-[#4A1525] btn-press'}`}
                  disabled={idx === orderedCategories.length - 1}>▼</button>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {cat.widgets.map(w => (
                <label key={w.id} className="flex items-center justify-between py-1.5 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <LucideIcon name={w.icon} size={16} className="text-[#6B7280]" />
                    <div>
                      <span className="text-sm text-[#111827]">{L(lang, w.name)}</span>
                      <p className="text-[10px] text-[#9CA3AF]">{L(lang, w.description)}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleWidget(w.id)}
                    className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${localConfig.enabled[w.id] ? 'bg-[#111827]' : 'bg-[#4A1525]'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${localConfig.enabled[w.id] ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F3F4F6] border-t border-[#E5E7EB]">
        <button onClick={save}
          className="w-full bg-[#111827] text-[#111827] font-bold py-3.5 rounded-lg hover:bg-[#111827] transition-all btn-press">
          {lang === 'ko' ? '저장' : lang === 'zh' ? '保存' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ─── Apple Store Feature Bar ───

function FeatureBar({ lang, setTab }) {
  const features = [
    { icon: Stamp, label: { ko: '체류 비자 안내\n한눈에 확인', zh: '签证信息\n一目了然', en: 'Visa info\nat a glance' }, tab: 'transition' },
    { icon: FileText, label: { ko: '번역, 공증부터\n인증까지', zh: '翻译、公证\n到认证', en: 'Translation to\ncertification' }, tab: 'agency' },
    { icon: BookOpen, label: { ko: '매일 10분\n쉬운 한국어', zh: '每天10分钟\n轻松韩语', en: '10 min daily\nKorean' }, tab: 'learn' },
    { icon: ArrowLeftRight, label: { ko: '실시간\n환율 계산', zh: '实时\n汇率计算', en: 'Live exchange\nrates' }, tab: null },
    { icon: Home, label: { ko: '월세, 전세\n매매 정보', zh: '月租、全租\n买卖信息', en: 'Rent &\nhousing info' }, tab: null },
    { icon: X, label: { ko: '가까운\n병원 찾기', zh: '查找\n附近医院', en: 'Find nearby\nhospitals' }, tab: null },
    { icon: PawPrint, label: { ko: '반려동물\n입국 가이드', zh: '宠物\n入境指南', en: 'Pet import\nguide' }, tab: 'pet' },
  ]

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1" style={{ scrollSnapType: 'x mandatory' }}>
      {features.map((f, i) => {
        const Icon = f.icon
        return (
          <button
            key={i}
            onClick={() => f.tab && setTab(f.tab)}
            className="min-w-[140px] h-[90px] shrink-0 bg-white rounded-xl border border-[#E5E7EB] flex flex-col items-center justify-center gap-2 px-3 transition-all btn-press hover:shadow-sm"
            style={{ scrollSnapAlign: 'start' }}
          >
            <Icon size={16} strokeWidth={1} className="text-[#111827]" />
            <span className="text-[10px] text-[#111827] font-medium leading-tight text-center whitespace-pre-line">{L(lang, f.label)}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Apple Store Section Header ───

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <span className="text-xl font-bold text-[#111827] tracking-tight">{title}</span>
      {subtitle && <span className="text-sm text-[#6B7280] ml-2">{subtitle}</span>}
    </div>
  )
}

// ─── Apple Store Horizontal Card Scroll ───

function HScrollSection({ children }) {
  const ref = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0 })

  const checkScroll = () => {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => { checkScroll() }, [children])

  const scroll = (dir) => {
    const el = ref.current
    if (!el) return
    const card = el.querySelector(':scope > *')
    const w = card ? card.offsetWidth + 16 : 300
    el.scrollBy({ left: dir * w, behavior: 'smooth' })
  }

  const onMouseDown = (e) => {
    const el = ref.current
    if (!el) return
    dragState.current = { isDragging: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft }
    el.style.cursor = 'grabbing'
    el.style.scrollSnapType = 'none'
  }
  const onMouseMove = (e) => {
    if (!dragState.current.isDragging) return
    e.preventDefault()
    const el = ref.current
    const x = e.pageX - el.offsetLeft
    el.scrollLeft = dragState.current.scrollLeft - (x - dragState.current.startX)
  }
  const onMouseUp = () => {
    dragState.current.isDragging = false
    const el = ref.current
    if (el) { el.style.cursor = 'grab'; el.style.scrollSnapType = 'x mandatory' }
  }

  return (
    <div className="relative group">
      {canLeft && (
        <button onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#111827] hover:bg-[#F3F4F6] transition-all opacity-0 group-hover:opacity-100">
          ‹
        </button>
      )}
      <div ref={ref} onScroll={checkScroll}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 cursor-grab select-none"
        style={{ scrollSnapType: 'x mandatory', touchAction: 'pan-x' }}>
        {children}
      </div>
      {canRight && (
        <button onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#111827] hover:bg-[#F3F4F6] transition-all opacity-0 group-hover:opacity-100">
          ›
        </button>
      )}
    </div>
  )
}

// ─── Key Services Section (Section 2) ───

const KEY_CURRENCIES = [
  { code: 'CNY', flag: 'CN', symbol: '¥' },
  { code: 'HKD', flag: 'HK', symbol: 'HK$' },
  { code: 'TWD', flag: 'TW', symbol: 'NT$' },
  { code: 'MOP', flag: 'MO', symbol: 'MOP$' },
  { code: 'USD', flag: 'US', symbol: '$' },
  { code: 'JPY', flag: 'JP', symbol: '¥' },
]

function ExchangeCard({ lang, exchangeRate }) {
  const [calcMode, setCalcMode] = useState(false)
  const [amount, setAmount] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    try { return localStorage.getItem('exchange_currency') || 'CNY' } catch { return 'CNY' }
  })
  const curr = KEY_CURRENCIES.find(c => c.code === selectedCurrency) || KEY_CURRENCIES[0]
  const rate = exchangeRate?.[selectedCurrency] || exchangeRate?.CNY || 0
  const converted = amount ? Math.round(parseFloat(amount) * rate) : 0

  const handleCurrencyChange = (e) => {
    e.stopPropagation()
    const code = e.target.value
    setSelectedCurrency(code)
    localStorage.setItem('exchange_currency', code)
  }

  if (!exchangeRate?.CNY) return null

  return (
    <div onClick={() => !calcMode && setCalcMode(true)}
      className={`w-[200px] h-[180px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col justify-between cursor-pointer transition-all shadow-sm`} style={{ scrollSnapAlign: 'start' }}>
      {!calcMode ? (
        <>
          <div>
            <p className="text-xs text-[#6B7280] font-medium">{lang === 'ko' ? '환율' : lang === 'zh' ? '汇率' : 'Exchange'}</p>
            <select value={selectedCurrency} onClick={e => e.stopPropagation()} onChange={handleCurrencyChange}
              className="mt-1 text-[10px] font-bold text-[#111827] bg-transparent outline-none cursor-pointer [&>option]:text-[#111827]">
              {KEY_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
          <div>
            <p className="text-3xl font-black text-white tracking-tighter">{Math.round(rate)}</p>
            <p className="text-[10px] text-[#6B7280] mt-1">1 {selectedCurrency} = {Math.round(rate)} KRW</p>
            <p className="text-[8px] text-[#111827] mt-0.5">{lang === 'ko' ? '탭하여 계산기' : lang === 'zh' ? '点击计算' : 'Tap to calculate'}</p>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <select value={selectedCurrency} onClick={e => e.stopPropagation()} onChange={handleCurrencyChange}
              className="text-[10px] font-bold text-[#111827] bg-transparent outline-none cursor-pointer [&>option]:text-[#111827]">
              {KEY_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
            <button onClick={e => { e.stopPropagation(); setCalcMode(false); setAmount('') }} className="text-[10px] text-[#111827] font-bold"><X size={12} /></button>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#6B7280]">{curr.symbol}</span>
              <input type="number" value={amount} onClick={e => e.stopPropagation()} onChange={e => setAmount(e.target.value)}
                placeholder={selectedCurrency} className="flex-1 text-right text-lg font-black text-[#111827] bg-transparent outline-none placeholder:text-[#6B7280] placeholder:text-sm" autoFocus />
            </div>
            <div className="text-center text-xs text-[#111827]">↓ ×{rate.toFixed(1)}</div>
            <div className="text-center">
              <span className="text-2xl font-black text-[#111827]">₩{converted.toLocaleString('ko-KR')}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const WEATHER_CITIES = [
  { id: 'Seoul', name: { ko: '서울', zh: '首尔', en: 'Seoul' } },
  { id: 'Busan', name: { ko: '부산', zh: '釜山', en: 'Busan' } },
  { id: 'Jeju', name: { ko: '제주', zh: '济州', en: 'Jeju' } },
  { id: 'Incheon', name: { ko: '인천', zh: '仁川', en: 'Incheon' } },
  { id: 'Daegu', name: { ko: '대구', zh: '大邱', en: 'Daegu' } },
]

function WeatherCard({ lang }) {
  const [city, setCity] = useState(() => {
    try { return localStorage.getItem('weather_city') || 'Seoul' } catch { return 'Seoul' }
  })
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`https://wttr.in/${city}?format=j1`)
      .then(r => r.json())
      .then(data => {
        const cc = data.current_condition?.[0]
        if (cc) {
          setWeather({ temp: cc.temp_C, desc: cc.weatherDesc?.[0]?.value || '' })
        }
      })
      .catch(() => setWeather(null))
      .finally(() => setLoading(false))
  }, [city])

  const handleCity = (e) => {
    setCity(e.target.value)
    localStorage.setItem('weather_city', e.target.value)
  }

  const cityObj = WEATHER_CITIES.find(c => c.id === city) || WEATHER_CITIES[0]
  const temp = weather?.temp ?? '—'
  const desc = weather?.desc || (loading ? (lang === 'ko' ? '로딩중...' : lang === 'zh' ? '加载中...' : 'Loading...') : (lang === 'ko' ? '날씨 정보를 불러올 수 없습니다' : lang === 'zh' ? '无法加载天气信息' : 'Weather unavailable'))

  return (
    <div className="w-[200px] h-[180px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col justify-between shadow-sm" style={{ scrollSnapAlign: 'start' }}>
      <div>
        <p className="text-[10px] text-[#6B7280] font-medium">{lang === 'ko' ? '날씨' : lang === 'zh' ? '天气' : 'Weather'}</p>
        <select value={city} onChange={handleCity}
          className="mt-0.5 text-[9px] font-bold text-[#111827] bg-transparent outline-none cursor-pointer [&>option]:text-[#111827]">
          {WEATHER_CITIES.map(c => <option key={c.id} value={c.id}>{L(lang, c.name)}</option>)}
        </select>
      </div>
      <div>
        <p className="text-4xl font-black text-[#111827] tracking-tighter">{loading ? '...' : `${temp}°`}</p>
        <p className="text-xs text-[#6B7280] mt-2">{loading ? '' : desc}</p>
      </div>
    </div>
  )
}

// ─── Compact Info Bar (Weather / Exchange / Time — one line each) ───

function InfoBar({ lang, exchangeRate }) {
  const [tzSelected] = useState(() => {
    try { return localStorage.getItem('tz_country') || 'china' } catch { return 'china' }
  })
  const [weatherCity] = useState(() => {
    try { return localStorage.getItem('weather_city') || 'Seoul' } catch { return 'Seoul' }
  })
  const [weather, setWeather] = useState(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    fetch(`https://wttr.in/${weatherCity}?format=j1`)
      .then(r => r.json())
      .then(data => {
        const cc = data.current_condition?.[0]
        if (cc) setWeather({ temp: cc.temp_C, desc: cc.weatherDesc?.[0]?.value || '' })
      }).catch(() => {})
  }, [weatherCity])

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const tzCountry = TIMEZONE_COUNTRIES.find(c => c.id === tzSelected) || TIMEZONE_COUNTRIES[0]
  const countryTime = getTimeInOffset(tzCountry.offset)
  const koreaTime = getTimeInOffset(9)
  const diff = tzCountry.offset - 9
  const diffStr = diff === 0 ? '' : diff > 0 ? ` (+${diff}h)` : ` (${diff}h)`

  const cityName = WEATHER_CITIES.find(c => c.id === weatherCity)?.name || { ko: '서울', zh: '首尔', en: 'Seoul' }

  const selectedCurrency = (() => { try { return localStorage.getItem('exchange_currency') || 'CNY' } catch { return 'CNY' } })()
  const rate = exchangeRate?.[selectedCurrency] || 0

  const now = new Date()
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`
  const dayNames = { ko: ['일','월','화','수','목','금','토'], zh: ['日','一','二','三','四','五','六'], en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] }
  const dayName = (dayNames[lang] || dayNames.en)[now.getDay()]

  // Multi-currency rates
  const currencies = [
    { code: 'CNY', label: { ko: '중국 위안', zh: '人民币', en: 'CNY' } },
    { code: 'HKD', label: { ko: '홍콩 달러', zh: '港币', en: 'HKD' } },
    { code: 'TWD', label: { ko: '대만 달러', zh: '新台币', en: 'TWD' } },
  ]

  // China time
  const chinaTime = getTimeInOffset(8)
  const chinaDiff = 8 - 9 // always -1h from Korea

  // Weather description translations
  const weatherDescMap = {
    'Clear':        { ko: '맑음', zh: '晴' },
    'Sunny':        { ko: '맑음', zh: '晴' },
    'Partly cloudy':{ ko: '구름 조금', zh: '多云' },
    'Cloudy':       { ko: '흐림', zh: '阴' },
    'Overcast':     { ko: '흐림', zh: '阴天' },
    'Mist':         { ko: '안개', zh: '薄雾' },
    'Fog':          { ko: '안개', zh: '雾' },
    'Light rain':   { ko: '가벼운 비', zh: '小雨' },
    'Rain':         { ko: '비', zh: '雨' },
    'Heavy rain':   { ko: '폭우', zh: '大雨' },
    'Snow':         { ko: '눈', zh: '雪' },
    'Light snow':   { ko: '가벼운 눈', zh: '小雪' },
    'Heavy snow':   { ko: '폭설', zh: '大雪' },
    'Thunderstorm': { ko: '천둥번개', zh: '雷暴' },
    'Drizzle':      { ko: '이슬비', zh: '毛毛雨' },
    'Patchy rain possible': { ko: '비 가능성', zh: '可能有雨' },
    'Patchy snow possible': { ko: '눈 가능성', zh: '可能有雪' },
    'Light drizzle':{ ko: '가벼운 이슬비', zh: '小毛毛雨' },
    'Moderate rain': { ko: '보통 비', zh: '中雨' },
    'Light rain shower': { ko: '가벼운 소나기', zh: '小阵雨' },
    'Moderate or heavy rain shower': { ko: '소나기', zh: '阵雨' },
  }
  const getWeatherDesc = (desc) => {
    const m = weatherDescMap[desc]
    if (!m) return desc
    return lang === 'en' ? desc : (m[lang] || m.ko || desc)
  }
  const weatherText = weather
    ? `${getWeatherDesc(weather.desc)} ${weather.temp}°C`
    : '...'

  const krLabel = lang === 'ko' ? '서울' : lang === 'zh' ? '首尔' : 'Seoul'
  const cnLabel = lang === 'ko' ? '중국' : lang === 'zh' ? '中国' : 'China'

  return (
    <div className="text-right text-[10px] text-[#6B7280] font-mono leading-relaxed">
      <div>{dateStr} ({dayName}) · {krLabel} {koreaTime} · {cnLabel} {chinaTime} · {weatherText}</div>
      <div className="flex flex-wrap justify-end gap-x-2">
        {currencies.map(c => {
          const r = exchangeRate?.[c.code]
          return r ? <span key={c.code}>1{c.code}={Math.round(r)}₩</span> : null
        })}
        <span className="text-[8px] text-[#9CA3AF]">KRW{lang === 'ko' ? '기준' : lang === 'zh' ? '基准' : 'base'}</span>
        {exchangeRate?._date && <span className="text-[8px] text-[#9CA3AF]">({exchangeRate._date})</span>}
      </div>
    </div>
  )
}

// ─── Tax Refund Mini Card ───

function TaxRefundMiniCard({ lang }) {
  const [amount, setAmount] = useState('')
  function calcRefund(val) {
    if (!val || val < 30000) return 0
    if (val < 50000) return Math.round(val * 0.05)
    if (val < 200000) return Math.round(val * 0.06)
    return Math.round(val * 0.075)
  }
  const refund = calcRefund(parseFloat(amount) || 0)
  const card = "w-[220px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow"

  return (
    <div className={card} style={{ scrollSnapAlign: 'start' }}>
      <p className="text-[10px] text-[#6B7280] font-medium mb-1">{lang === 'ko' ? '택스리펀 계산기' : lang === 'zh' ? '退税计算器' : 'Tax Refund Calc'}</p>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[10px] text-[#6B7280]">₩</span>
        <input type="text" inputMode="numeric" pattern="[0-9]*" value={amount} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setAmount(v) }}
          placeholder={lang === 'ko' ? '금액 입력' : lang === 'zh' ? '输入金额' : 'Amount'}
          className="w-full text-right text-sm font-bold text-[#111827] bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#111827]/20 placeholder:text-[#9CA3AF] placeholder:text-[10px]"
        />
      </div>
      <div className="text-center py-1.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg flex-1 flex flex-col justify-center">
        <p className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '예상 환급액' : lang === 'zh' ? '预估退税' : 'Est. Refund'}</p>
        <p className="text-xl font-black text-[#111827]">₩{refund.toLocaleString('ko-KR')}</p>
      </div>
      <p className="text-[8px] text-[#9CA3AF] text-center mt-1">{lang === 'ko' ? '최소 3만원 이상 구매' : lang === 'zh' ? '最低消费3万韩元' : 'Min ₩30,000'}</p>
    </div>
  )
}

// ─── Memo Card ───

function MemoCard({ lang }) {
  const MAX_MEMOS = 5
  const MAX_CHARS = 30
  const [memos, setMemos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hp_memos')) || [] } catch { return [] }
  })
  const [editing, setEditing] = useState(null) // index being edited
  const [draft, setDraft] = useState('')

  const save = (updated) => {
    setMemos(updated)
    localStorage.setItem('hp_memos', JSON.stringify(updated))
  }

  const addMemo = () => {
    if (memos.length >= MAX_MEMOS) return
    setEditing(memos.length)
    setDraft('')
  }

  const confirmMemo = () => {
    if (!draft.trim()) { setEditing(null); return }
    const updated = [...memos]
    if (editing === memos.length) updated.push(draft.trim().slice(0, MAX_CHARS))
    else updated[editing] = draft.trim().slice(0, MAX_CHARS)
    save(updated)

    setEditing(null)
    setDraft('')
  }

  const deleteMemo = (idx) => {
    save(memos.filter((_, i) => i !== idx))
  }

  const card = "w-[220px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow"

  return (
    <div className={card} style={{ scrollSnapAlign: 'start' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-[#6B7280] font-medium">{lang === 'ko' ? '오늘의 계획' : lang === 'zh' ? '今日计划' : "Today's Plan"}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-[#9CA3AF]">({memos.length}/{MAX_MEMOS})</span>
          {memos.length < MAX_MEMOS && (
            <button onClick={addMemo}
              className="w-5 h-5 rounded-md bg-[#111827]/10 text-[#111827] flex items-center justify-center hover:bg-[#111827]/20 transition-all">
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {memos.length === 0 && editing === null && (
          <p className="text-[10px] text-[#9CA3AF] text-center mt-4">{lang === 'ko' ? '+ 버튼으로 메모 추가' : lang === 'zh' ? '点击+添加备忘' : 'Tap + to add memo'}</p>
        )}
        {memos.map((memo, i) => (
          <div key={i} className="flex items-center gap-1.5 group">
            {editing === i ? (
              <div className="flex items-center gap-1 flex-1">
                <input type="text" value={draft} onChange={e => setDraft(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={e => e.key === 'Enter' && confirmMemo()}
                  autoFocus
                  className="flex-1 text-[10px] text-[#111827] bg-[#F3F4F6] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#111827]/50"
                  placeholder={`${MAX_CHARS}${lang === 'ko' ? '자 이내' : lang === 'zh' ? '字以内' : ' chars'}`}
                />
                <button onClick={confirmMemo} className="text-[#111827]"><Check size={12} /></button>
              </div>
            ) : (
              <>
                <span className="text-[10px] text-[#111827] font-mono w-3 shrink-0">{i + 1}</span>
                <span className="text-[10px] text-[#111827] flex-1 truncate cursor-pointer"
                  onClick={() => { setEditing(i); setDraft(memo) }}>{memo}</span>
                <button onClick={() => deleteMemo(i)}
                  className="opacity-0 group-hover:opacity-100 text-[#9CA3AF] hover:text-red-400 transition-all">
                  <X size={10} />
                </button>
              </>
            )}
          </div>
        ))}
        {editing === memos.length && (
          <div className="flex items-center gap-1">
            <input type="text" value={draft} onChange={e => setDraft(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={e => e.key === 'Enter' && confirmMemo()}
              autoFocus
              className="flex-1 text-[10px] text-[#111827] bg-[#F3F4F6] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#111827]/50"
              placeholder={`${MAX_CHARS}${lang === 'ko' ? '자 이내' : lang === 'zh' ? '字以内' : ' chars'}`}
            />
            <button onClick={confirmMemo} className="text-[#111827]"><Check size={12} /></button>
          </div>
        )}
      </div>
      <p className="text-[7px] text-[#9CA3AF] text-right mt-1">
        {memos.length === MAX_MEMOS
          ? (lang === 'ko' ? '메모 가득 참' : lang === 'zh' ? '备忘已满' : 'Memos full')
          : `${MAX_MEMOS - memos.length}${lang === 'ko' ? '개 추가 가능' : lang === 'zh' ? '个可添加' : ' slots left'}`
        }
      </p>
    </div>
  )
}

// ─── My Status Card ───

// ─── Activity Tracker (global) ───
// Call trackActivity(label, lang) from anywhere to record last action
const ACTIVITY_KEY = 'hp_last_activity'
function trackActivity(label) {
  try {
    const now = new Date()
    const ts = `${now.getMonth()+1}/${now.getDate()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify({ label, ts }))
  } catch {}
}
function getLastActivity() {
  try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY)) } catch { return null }
}

function MyStatusCard({ profile, lang, setTab }) {
  const days = getDaysUntil(profile?.expiryDate)
  const card = "w-[220px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow"

  const nationality = profile?.nationality || ''
  const visa = profile?.currentVisa || ''
  const subscription = profile?.subscription || 'free'
  const lastActivity = getLastActivity()

  const subLabel = {
    free: { color: 'bg-[#F3F4F6] text-[#6B7280]', text: 'Free' },
    premium: { color: 'bg-[#111827]/20 text-[#111827]', text: 'Premium' },
  }
  const sub = subLabel[subscription] || subLabel.free

  const visaDisplay = visa ? (days !== null && days > 0 ? `${visa} · D-${days}` : visa) : ''
  const dDayColor = days <= 30 ? 'text-red-500' : days <= 90 ? 'text-amber-500' : 'text-[#111827]'

  return (
    <div className={card} style={{ scrollSnapAlign: 'start' }}>
      <p className="text-[10px] text-[#6B7280] font-medium mb-2">{lang === 'ko' ? '내 정보' : lang === 'zh' ? '我的信息' : 'My Info'}</p>
      <div className="space-y-1.5 flex-1">
        {/* Subscription */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '구독' : lang === 'zh' ? '订阅' : 'Plan'}</span>
          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${sub.color}`}>{sub.text}</span>
        </div>
        {/* Nationality */}
        {nationality && (
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '국적' : lang === 'zh' ? '国籍' : 'Nationality'}</span>
            <span className="text-[9px] font-semibold text-[#111827]">{nationality}</span>
          </div>
        )}
        {/* Visa + D-Day */}
        {visaDisplay && (
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '비자' : lang === 'zh' ? '签证' : 'Visa'}</span>
            <span className={`text-[9px] font-bold ${dDayColor}`}>{visaDisplay}</span>
          </div>
        )}
        {/* Korean progress */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '한국어' : lang === 'zh' ? '韩语' : 'Korean'}</span>
          <span className="text-[9px] font-bold text-[#111827]">Day {widgetMockData.korean?.day || 1}</span>
        </div>
        {/* Login method */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '로그인' : lang === 'zh' ? '登录方式' : 'Login'}</span>
          <span className="text-[9px] font-semibold text-[#111827]">{profile?.loginMethod || (lang === 'ko' ? '게스트' : lang === 'zh' ? '游客' : 'Guest')}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E7EB] my-1" />

        {/* Recent Activity */}
        <div>
          <p className="text-[8px] text-[#9CA3AF] mb-1">{lang === 'ko' ? '최근 결제' : lang === 'zh' ? '最近消费' : 'Recent Payment'}</p>
          {lastActivity ? (
            <div className="bg-[#F8F9FA] rounded-lg px-2 py-1.5">
              <p className="text-[9px] text-[#111827] truncate">{lastActivity.label}</p>
              <p className="text-[7px] text-[#9CA3AF] text-right">{lastActivity.ts}</p>
            </div>
          ) : (
            <p className="text-[8px] text-[#9CA3AF] italic">{lang === 'ko' ? '결제 내역이 없습니다' : lang === 'zh' ? '暂无消费记录' : 'No payments yet'}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Personal Cards Section ───

// ─── Voice Translator Card (실시간 음성 통역) ───
function VoiceTranslatorCard({ lang }) {
  const [conversations, setConversations] = useState([])
  const [isListening, setIsListening] = useState(null) // 'zh' | 'ko' | null
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef(null)

  const startListening = (sourceLang) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(lang === 'ko' ? '이 브라우저는 음성 인식을 지원하지 않습니다.' : lang === 'zh' ? '此浏览器不支持语音识别' : 'Speech recognition not supported')
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = sourceLang === 'zh' ? 'zh-CN' : 'ko-KR'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.onresult = (event) => {
      let final = '', inter = ''
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript
        else inter += event.results[i][0].transcript
      }
      if (final) {
        setInterim('')
        const translated = simpleTranslate(final, sourceLang)
        setConversations(prev => [...prev, { source: sourceLang, original: final, translated }])
        // Speak the translation
        try {
          if ('speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance(translated)
            u.lang = sourceLang === 'zh' ? 'ko-KR' : 'zh-CN'
            u.rate = 0.85
            speechSynthesis.speak(u)
          }
        } catch (err) {
          console.warn('Web Speech API unavailable:', err)
        }
      } else if (inter) {
        setInterim(inter)
      }
    }
    recognition.onend = () => { setIsListening(null); setInterim('') }
    recognition.onerror = () => {
      setIsListening(null); setInterim('')
      setConversations(prev => [...prev, { source: sourceLang, original: lang === 'ko' ? '음성 인식을 사용할 수 없습니다. 텍스트로 입력해주세요.' : lang === 'zh' ? '无法使用语音识别。请使用文字输入。' : 'Speech recognition unavailable. Please use text input.', translated: '' }])
    }
    recognitionRef.current = recognition
    try {
      recognition.start()
      setIsListening(sourceLang)
    } catch (e) {
      setIsListening(null)
      setConversations(prev => [...prev, { source: sourceLang, original: lang === 'ko' ? '음성 인식을 사용할 수 없습니다. 텍스트로 입력해주세요.' : lang === 'zh' ? '无法使用语音识别。请使用文字输入。' : 'Speech recognition unavailable. Please use text input.', translated: '' }])
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Simple phrase-based translation dictionary
  const simpleTranslate = (text, from) => {
    const zhToKo = {
      '你好': '안녕하세요', '谢谢': '감사합니다', '对不起': '죄송합니다', '请问': '실례합니다',
      '多少钱': '얼마예요?', '在哪里': '어디예요?', '我要这个': '이거 주세요',
      '帮帮我': '도와주세요', '不好意思': '실례합니다', '请等一下': '잠시만요',
      '我听不懂': '못 알아듣겠어요', '可以吗': '괜찮아요?', '我是中国人': '저는 중국 사람이에요',
      '洗手间在哪里': '화장실이 어디예요?', '请给我菜单': '메뉴판 주세요',
      '我想要': '주세요', '太贵了': '너무 비싸요', '便宜一点': '좀 깎아주세요',
      '这是什么': '이게 뭐예요?', '好吃': '맛있어요', '结账': '계산이요',
      '一个': '하나', '两个': '둘', '三个': '셋', '我要点餐': '주문할게요',
      '打包': '포장해 주세요', '堂食': '여기서 먹을게요', '不要辣': '안 맵게 해주세요',
      '我肚子疼': '배가 아파요', '我头疼': '머리가 아파요', '我发烧了': '열이 나요',
      '请叫救护车': '구급차 불러주세요', '请叫警察': '경찰 불러주세요',
      '我迷路了': '길을 잃었어요', '请带我去这个地址': '이 주소로 데려다주세요',
      '地铁站在哪': '지하철역이 어디예요?', '公交车站': '버스 정류장',
      '我要去': '가고 싶어요', '请停车': '세워주세요',
    }
    const koToZh = {}
    Object.entries(zhToKo).forEach(([zh, ko]) => { koToZh[ko] = zh; koToZh[ko.replace('?','')] = zh })

    const dict = from === 'zh' ? zhToKo : koToZh
    // Exact match first
    if (dict[text]) return dict[text]
    // Partial match - find longest matching phrase
    let result = text
    let matched = false
    for (const [key, val] of Object.entries(dict).sort((a, b) => b[0].length - a[0].length)) {
      if (text.includes(key)) {
        result = result.replace(key, val)
        matched = true
      }
    }
    if (!matched) {
      // Return with a note
      return from === 'zh'
        ? `[${text}] — (사전에 없는 표현입니다)`
        : `[${text}] — (词典中没有此表达)`
    }
    return result
  }

  const card = "w-[280px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow"

  return (
    <div className={card} style={{ scrollSnapAlign: 'start' }}>
      <p className="text-[10px] text-[#6B7280] font-medium mb-2">
        {lang === 'ko' ? '실시간 통역' : lang === 'zh' ? '实时翻译' : 'Live Translator'}
      </p>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 mb-2 min-h-[100px] max-h-[130px]">
        {conversations.length === 0 && (
          <p className="text-[10px] text-[#9CA3AF] text-center mt-6">
            {lang === 'ko' ? '버튼을 꾹 누르고 말하세요' : lang === 'zh' ? '按住按钮说话' : 'Hold button and speak'}
          </p>
        )}
        {conversations.map((c, i) => (
          <div key={i} className="space-y-0.5">
            <p className={`text-[11px] font-semibold ${c.source === 'zh' ? 'text-red-500' : 'text-blue-500'}`}>
              {c.source === 'zh' ? '中' : '韩'}: {c.original}
            </p>
            <p className={`text-[11px] font-semibold ${c.source === 'zh' ? 'text-blue-500' : 'text-red-500'} ml-3`}>
              → {c.translated}
            </p>
          </div>
        ))}
        {interim && (
          <p className={`text-[11px] italic ${isListening === 'zh' ? 'text-red-300' : 'text-blue-300'}`}>
            {interim}...
          </p>
        )}
      </div>

      {/* Mic buttons */}
      <div className="flex gap-2">
        <button
          onMouseDown={() => startListening('zh')}
          onMouseUp={stopListening}
          onTouchStart={(e) => { e.preventDefault(); startListening('zh') }}
          onTouchEnd={(e) => { e.preventDefault(); stopListening() }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all select-none ${
            isListening === 'zh'
              ? 'bg-red-500 text-white scale-95 shadow-lg shadow-red-500/30'
              : 'bg-red-50 text-red-500 hover:bg-red-100 active:bg-red-500 active:text-white'
          }`}
        >
          <Mic size={16} />
          <span>中</span>
        </button>
        <button
          onMouseDown={() => startListening('ko')}
          onMouseUp={stopListening}
          onTouchStart={(e) => { e.preventDefault(); startListening('ko') }}
          onTouchEnd={(e) => { e.preventDefault(); stopListening() }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all select-none ${
            isListening === 'ko'
              ? 'bg-blue-500 text-white scale-95 shadow-lg shadow-blue-500/30'
              : 'bg-blue-50 text-blue-500 hover:bg-blue-100 active:bg-blue-500 active:text-white'
          }`}
        >
          <Mic size={16} />
          <span>韩</span>
        </button>
      </div>

      {/* Clear button */}
      {conversations.length > 0 && (
        <button onClick={() => setConversations([])}
          className="mt-1.5 text-[9px] text-[#9CA3AF] hover:text-[#6B7280] text-center">
          {lang === 'ko' ? '대화 지우기' : lang === 'zh' ? '清除对话' : 'Clear'}
        </button>
      )}
    </div>
  )
}

function PersonalSection({ profile, lang, setTab, exchangeRate }) {
  const koreanData = widgetMockData.korean
  const card = "w-[220px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow"
  const snapStyle = { scrollSnapAlign: 'start' }

  return (
    <HScrollSection>
      {/* 0. Voice Translator */}
      <VoiceTranslatorCard lang={lang} />

      {/* 1. My Status */}
      <MyStatusCard profile={profile} lang={lang} setTab={setTab} />

      {/* 2. Memo / Today's Plan */}
      <MemoCard lang={lang} />

      {/* 3. Korean Calendar */}
      <div className={card + " overflow-hidden"} style={snapStyle}>
        <p className="text-[10px] text-[#6B7280] font-medium mb-1">{lang === 'ko' ? '한국 달력' : lang === 'zh' ? '韩国日历' : 'Korean Calendar'}</p>
        <div className="overflow-y-auto no-scrollbar flex-1">
          <HolidayCalendarWidget lang={lang} />
        </div>
      </div>

      {/* 4. Today's Korean Expression */}
      {koreanData && (
        <div className={card} style={snapStyle}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-[#6B7280] font-medium">{lang === 'ko' ? '오늘의 한국어 표현' : lang === 'zh' ? '今日韩语表达' : "Today's Korean Expression"}</p>
            {koreanData.day && <span className="text-[8px] font-bold text-[#111827]">Day {koreanData.day}</span>}
          </div>
          <div className="flex flex-col flex-1">
            {/* Word section — top half */}
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-lg font-black text-[#111827] leading-tight">{koreanData.word ? L('ko', koreanData.word) : ''}</p>
              {koreanData.word && <p className="text-[10px] text-[#6B7280] mt-0.5">{L(lang === 'ko' ? 'zh' : lang, koreanData.word)}</p>}
              {koreanData.pronunciation && <p className="text-[9px] text-[#9CA3AF] font-mono mt-0.5">[{koreanData.pronunciation}]</p>}
            </div>
            {koreanData.example?.sentence && (
              <>
                {/* Centered divider */}
                <div className="border-t border-[#E5E7EB] my-2" />
                {/* Example section — bottom half */}
                <div className="flex-1 flex flex-col justify-center">
                <p className="text-xs font-bold text-[#111827] leading-snug">"{L('ko', koreanData.example.sentence)}"</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5">"{L(lang === 'ko' ? 'zh' : lang, koreanData.example.sentence)}"</p>
                {koreanData.example.pronunciation && (
                  <p className="text-[9px] text-[#9CA3AF] font-mono mt-0.5">[{koreanData.example.pronunciation}]</p>
                )}
                <button onClick={() => {
                  try {
                    if (!('speechSynthesis' in window)) {
                      throw new Error('speechSynthesis not supported')
                    }
                    const text = L('ko', koreanData.example.sentence)
                    const u = new SpeechSynthesisUtterance(text)
                    u.lang = 'ko-KR'; u.rate = 0.75
                    if (text.endsWith('?') || text.endsWith('요?')) u.pitch = 1.2
                    speechSynthesis.speak(u)
                  } catch (err) {
                    console.warn('Web Speech API unavailable:', err)
                    alert(lang === 'ko' ? '음성 기능은 이 환경에서 사용할 수 없습니다' : lang === 'zh' ? '语音功能在此环境中不可用' : 'Voice feature unavailable in this environment')
                  }
                }} className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827]/10 text-[#111827] hover:bg-[#111827]/20 transition-all">
                  <Volume2 size={12} />
                  <span className="text-[10px] font-semibold">{lang === 'ko' ? '발음 듣기' : lang === 'zh' ? '听发음' : 'Listen'}</span>
                </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. Tax Refund Calculator */}
      <TaxRefundMiniCard lang={lang} />

      {/* 6. Exchange Rate Calculator */}
      <div className={card} style={snapStyle}>
        <p className="text-[10px] text-[#6B7280] font-medium mb-2">{lang === 'ko' ? '환율 계산기' : lang === 'zh' ? '汇率计算器' : 'Currency Converter'}</p>
        <ExchangeRateCard exchangeRate={exchangeRate} lang={lang} compact />
      </div>
    </HScrollSection>
  )
}

// ─── Widget Section Groupings ───

const SECTION_TODAY = ['editorpick', 'cvsnew', 'beautynew', 'kpop', 'fanevent', 'restaurant']
const SECTION_SHOPPING = ['oliveyoung', 'themepark', 'beauty', 'fashiontrend']
const SECTION_CULTURE = ['tradition', 'festival', 'trip']
const SECTION_TOOLS = ['timezone', 'parcel', 'delivery', 'currency']

function getEnabledWidgetsForSection(sectionIds, config) {
  const allWidgets = []
  widgetCategories.forEach(cat => {
    cat.widgets.forEach(w => {
      if (sectionIds.includes(w.id) && config.enabled[w.id]) {
        allWidgets.push(w)
      }
    })
  })
  return allWidgets
}

// ─── Widget Card (Apple style) ───

function AppleWidgetCard({ widget, lang, setTab, dark }) {
  return (
    <div className={`w-[300px] h-[360px] shrink-0 rounded-lg p-5 flex flex-col bg-white border border-[#E5E7EB]`} style={{ scrollSnapAlign: 'start', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04), 0 12px 36px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 20px rgba(255,255,255,0.3)' }}>
      <div className="mb-3 shrink-0">
        <span className={`text-[10px] font-semibold text-[#6B7280]`}>{L(lang, widget.name)}</span>
      </div>
      <div
        className="flex-1 overflow-y-auto no-scrollbar min-h-0"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain', touchAction: 'pan-y' }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => {
          const el = e.currentTarget
          if (el.scrollHeight > el.clientHeight) e.stopPropagation()
        }}
      >
        <WidgetContent widgetId={widget.id} lang={lang} setTab={setTab} />
      </div>
    </div>
  )
}

// ─── Collapsible Tree Section ───

function TreeSection({ title, widgets, lang, setTab, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const [activeWidget, setActiveWidget] = useState(null)

  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
      <button
        onClick={() => { setOpen(!open); setActiveWidget(null) }}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-[#F9FAFB] transition-all"
      >
        <span className="text-sm font-semibold text-[#111827]">{title}</span>
        {open ? <ChevronDown size={18} className="text-[#111827]" /> : <ChevronRight size={18} className="text-[#9CA3AF]" />}
      </button>
      {open && (
        <div className="border-t border-[#E5E7EB]">
          {widgets.map(w => (
            <div key={w.id}>
              <button
                onClick={() => { const next = activeWidget === w.id ? null : w.id; setActiveWidget(next) }}
                className={`w-full flex items-center justify-between px-4 py-3 pl-8 text-left transition-all border-b border-[#F3F4F6] last:border-b-0 ${
                  activeWidget === w.id ? 'bg-[#FFFBF5]' : 'hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LucideIcon name={w.icon} size={16} className={activeWidget === w.id ? 'text-[#111827]' : 'text-[#9CA3AF]'} />
                  <span className={`text-sm ${activeWidget === w.id ? 'text-[#111827] font-medium' : 'text-[#374151]'}`}>{L(lang, w.name)}</span>
                </div>
                {activeWidget === w.id ? <ChevronDown size={14} className="text-[#111827]" /> : <ChevronRight size={14} className="text-[#D1D5DB]" />}
              </button>
              {activeWidget === w.id && (
                <div className="px-4 py-4 pl-8 bg-[#FAFAFA] border-b border-[#E5E7EB] max-h-[400px] overflow-y-auto no-scrollbar">
                  <WidgetContent widgetId={w.id} lang={lang} setTab={setTab} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main HomeTab Component ───

export { trackActivity, WidgetContent, TreeSection, LucideIcon, SECTION_SHOPPING, SECTION_CULTURE, SECTION_TOOLS, getEnabledWidgetsForSection }

export default function HomeTab({ profile, lang, exchangeRate, setTab }) {
  const [config, setConfig] = useState(() => loadWidgetConfig() || getDefaultConfig())
  const [showCustomize, setShowCustomize] = useState(false)

  // Ensure config has all categories
  useEffect(() => {
    const allIds = widgetCategories.map(c => c.id)
    const missing = allIds.filter(id => !config.order.includes(id))
    if (missing.length) {
      const newEnabled = { ...config.enabled }
      widgetCategories.forEach(cat => {
        cat.widgets.forEach(w => {
          if (!(w.id in newEnabled)) newEnabled[w.id] = true
        })
      })
      const updated = { ...config, order: [...config.order, ...missing], enabled: newEnabled }
      setConfig(updated)
      saveWidgetConfig(updated)
    }
  }, [])

  const todayWidgets = getEnabledWidgetsForSection(SECTION_TODAY, config)
  const shoppingWidgets = getEnabledWidgetsForSection(SECTION_SHOPPING, config)
  const cultureWidgets = getEnabledWidgetsForSection(SECTION_CULTURE, config)
  const toolsWidgets = getEnabledWidgetsForSection(SECTION_TOOLS, config)

  return (
    <div className="space-y-6 animate-fade-up pb-4">
      {showCustomize && (
        <CustomizeModal config={config} setConfig={setConfig} lang={lang} onClose={() => setShowCustomize(false)} />
      )}

      {/* ─── Info Bar: Weather / Exchange / Time ─── */}
      <div className="mt-2 px-1">
        <InfoBar lang={lang} exchangeRate={exchangeRate} />
      </div>

      {/* ─── Personal Cards: D-Day, Calendar, Korean Expression ─── */}
      <div className="mt-4">
        <SectionHeader
          title={L(lang, { ko: '나만의 서비스.', zh: '我的服务。', en: 'My Services.' })}
          subtitle=""
        />
        <PersonalSection profile={profile} lang={lang} setTab={setTab} exchangeRate={exchangeRate} />
      </div>

      {/* ─── Section 2: 오늘의 한국 (kept as horizontal cards) ─── */}
      {todayWidgets.length > 0 && (
        <div className="mt-8">
          <SectionHeader
            title={L(lang, { ko: '오늘의 한국.', zh: '今日韩国。', en: "Today's Korea." })}
            subtitle={L(lang, { ko: '매일 새로운 한국 소식.', zh: '每天新的韩国资讯。', en: 'Fresh Korean updates daily.' })}
          />
          <HScrollSection>
            {todayWidgets.map(w => (
              <AppleWidgetCard key={w.id} widget={w} lang={lang} setTab={setTab} />
            ))}
          </HScrollSection>
        </div>
      )}

    </div>
  )
}