/**
 * NearHomeTab — NEAR 앱 홈 탭 (v3)
 * 인사 → 여행카드 → 검색 → 지금 뜨는 곳 → 추천 장소
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../i18n/index.jsx'
import { searchKeyword } from '../api/tourApi'
import { EDITORIALS } from '../data/editorials.js'
import EditorialDetailPage from './EditorialDetailPage.jsx'
import MorePage from './MorePage.jsx'
import NearPageHeader from './NearPageHeader.jsx'
import TravelPlannerTab, { useTravelPlan } from './TravelPlannerTab.jsx'
import { AIRPORTS, AIRLINES, lookupFlight } from '../data/flights.js'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

// ─── 카테고리 ───
const MEITU_CATEGORIES = [
  { id: 'beauty',    zh: '美容',   ko: '미용',   en: 'Beauty'    },
  { id: 'food',      zh: '美食',   ko: '맛집',   en: 'Food'      },
  { id: 'popup',     zh: '快闪店', ko: '팝업',   en: 'Popup'     },
  { id: 'cafe',      zh: '咖啡',   ko: '카페',   en: 'Cafe'      },
  { id: 'nail',      zh: '美甲',   ko: '네일',   en: 'Nail'      },
  { id: 'cosmetics', zh: '化妆品', ko: '화장품', en: 'Cosmetics' },
  { id: 'hotel',     zh: '酒店',   ko: '호텔',   en: 'Hotel'     },
  { id: 'medical',   zh: '医疗',   ko: '의료',   en: 'Medical'   },
  { id: 'shopping',  zh: '购物',   ko: '쇼핑',   en: 'Shopping'  },
  { id: 'more',      zh: '更多',   ko: '더보기', en: 'More'      },
]

const CAT_LABELS = {
  beauty: { zh: '美容', ko: '미용', en: 'Beauty' },
  food: { zh: '美食', ko: '맛집', en: 'Food' },
  popup: { zh: '快闪店', ko: '팝업', en: 'Popup' },
  cafe: { zh: '咖啡', ko: '카페', en: 'Cafe' },
  nail: { zh: '美甲', ko: '네일', en: 'Nail' },
  cosmetics: { zh: '化妆品', ko: '화장품', en: 'Cosmetics' },
  hotel: { zh: '酒店', ko: '호텔', en: 'Hotel' },
  medical: { zh: '医疗', ko: '의료', en: 'Medical' },
  shopping: { zh: '购物', ko: '쇼핑', en: 'Shopping' },
}

// ─── "지금 뜨는 곳" 하드코드 데이터 (가로 스크롤) ───
const TRENDING_SPOTS = [
  { id: 'tr1', title: { ko: '성수 카페거리', zh: '圣水咖啡街', en: 'Seongsu Cafe St' }, tag: { ko: '카페', zh: '咖啡', en: 'Cafe' }, gradient: 'linear-gradient(160deg,#EFEBE9,#D7CCC8)' },
  { id: 'tr2', title: { ko: '망원 한강공원', zh: '望远汉江公园', en: 'Mangwon Hangang' }, tag: { ko: '산책', zh: '散步', en: 'Walk' }, gradient: 'linear-gradient(160deg,#E8F5E9,#C8E6C9)' },
  { id: 'tr3', title: { ko: '을지로 노포', zh: '乙支路老店', en: 'Euljiro Retro' }, tag: { ko: '맛집', zh: '美食', en: 'Food' }, gradient: 'linear-gradient(160deg,#FFF3E0,#FFE0B2)' },
  { id: 'tr4', title: { ko: '한남동 편집샵', zh: '汉南洞买手店', en: 'Hannam Select' }, tag: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, gradient: 'linear-gradient(160deg,#F3E5F5,#E1BEE7)' },
  { id: 'tr5', title: { ko: '연남동 골목', zh: '延南洞胡同', en: 'Yeonnam Alley' }, tag: { ko: '팝업', zh: '快闪', en: 'Popup' }, gradient: 'linear-gradient(160deg,#FFEEF0,#FFD6DC)' },
  { id: 'tr6', title: { ko: '삼청동 한옥', zh: '三清洞韩屋', en: 'Samcheong Hanok' }, tag: { ko: '관광', zh: '景点', en: 'Tour' }, gradient: 'linear-gradient(160deg,#E8F4FF,#BBDEFB)' },
]

// ─── 추천 장소 (피드 데이터) ───
const FEED_DATA = [
  { id: 'fd1', category: 'beauty',   titleKey: 'feed.1.title', locationKey: 'feed.1.location', statusKey: null,            likes: '328',  gradient: 'linear-gradient(160deg,#FFEEF0,#FFD6DC)' },
  { id: 'fd2', category: 'food',     titleKey: 'feed.2.title', locationKey: null,              statusKey: 'feed.2.status', likes: '892',  gradient: 'linear-gradient(160deg,#F3E5F5,#E1BEE7)' },
  { id: 'fd3', category: 'popup',    titleKey: 'feed.3.title', locationKey: 'feed.3.location', statusKey: null,            likes: '1.2k', gradient: 'linear-gradient(160deg,#FFF3E0,#FFE0B2)' },
  { id: 'fd4', category: 'cafe',     titleKey: 'feed.4.title', locationKey: null,              statusKey: 'feed.4.status', likes: '567',  gradient: 'linear-gradient(160deg,#E8F5E9,#C8E6C9)' },
  { id: 'fd5', category: 'shopping', titleKey: 'feed.5.title', locationKey: 'feed.5.location', statusKey: null,            likes: '2.1k', gradient: 'linear-gradient(160deg,#FCE4EC,#F8BBD9)' },
  { id: 'fd6', category: 'nail',     titleKey: 'feed.6.title', locationKey: 'feed.6.location', statusKey: null,            likes: '445',  gradient: 'linear-gradient(160deg,#EFEBE9,#D7CCC8)' },
]

// ─── TourAPI 매핑 ───
const TOUR_CAT_MAP = { '82': 'food', '85': 'shopping', '76': 'beauty', '78': 'popup', '32': 'hotel', '38': 'hotel' }
const TOUR_GRADIENTS = {
  food: 'linear-gradient(160deg,#FFF3E0,#FFE0B2)', shopping: 'linear-gradient(160deg,#FCE4EC,#F8BBD9)',
  beauty: 'linear-gradient(160deg,#FFEEF0,#FFD6DC)', popup: 'linear-gradient(160deg,#F3E5F5,#E1BEE7)',
  hotel: 'linear-gradient(160deg,#E8F5E9,#C8E6C9)', more: 'linear-gradient(160deg,#E8F4FF,#BBDEFB)',
}
function normalizeTourItem(item) {
  const cat = TOUR_CAT_MAP[String(item.contentTypeId)] || 'more'
  return {
    id: `tour_${item.contentid}`, title: item.title,
    image: item.firstimage || item.firstimage2 || null,
    gradient: (!item.firstimage && !item.firstimage2) ? TOUR_GRADIENTS[cat] : undefined,
    url: (item.mapx && item.mapy) ? `https://map.kakao.com/link/map/${encodeURIComponent(item.title)},${item.mapy},${item.mapx}` : null,
    category: cat, tags: [], addr: item.addr1 || '', source: 'tour',
  }
}

// ─── 검색 유틸 ───
const ZH_TO_KO = {
  '美食': '맛집', '咖啡': '카페', '购物': '쇼핑', '明洞': '명동', '弘大': '홍대',
  '江南': '강남', '圣水': '성수', '景福宫': '경복궁', '东大门': '동대문', '梨泰院': '이태원',
  '南山': '남산', '北村': '북촌', '美妆': '뷰티', '快闪店': '팝업', '打卡': '핫플',
  '热门': '인기', '推荐': '추천', '医院': '병원', '便利店': '편의점', 'K-POP': 'K-POP',
}
const ARCHIVE_BASE = 'https://archive.visitseoul.net'

function zhToKo(q) {
  if (!q) return q
  let r = q
  Object.entries(ZH_TO_KO).sort((a,b) => b[0].length - a[0].length).forEach(([zh, ko]) => { r = r.replace(new RegExp(zh, 'g'), ko) })
  return r
}

function parseArchiveResults(html) {
  const items = []
  const cards = html.match(/<li[^>]*class="[^"]*item[^"]*"[^>]*>[\s\S]*?<\/li>/gi) || []
  for (const card of cards) {
    const imgMatch = card.match(/src="([^"]*(?:upload|image)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i)
    const titleMatch = card.match(/<(?:strong|h[2-4]|p|span)[^>]*class="[^"]*(?:tit|title|name)[^"]*"[^>]*>(.*?)<\//i) || card.match(/<(?:strong|h[2-4]|p)[^>]*>(.*?)<\//i)
    const tags = []; const tagRegex = /#([\w가-힣\u4e00-\u9fff]+)/g; let tm
    while ((tm = tagRegex.exec(card)) !== null) tags.push(tm[1])
    const catMatch = card.match(/class="[^"]*(?:cate|badge|tag)[^"]*"[^>]*>([^<]+)/i)
    const linkMatch = card.match(/href="([^"]*\/(?:ko|zh|en)\/[^"]+)"/i)
    if (titleMatch || imgMatch) {
      items.push({
        id: `arch-${items.length}`, title: (titleMatch?.[1] || '').replace(/<[^>]*>/g, '').trim(),
        image: imgMatch?.[1] ? (imgMatch[1].startsWith('http') ? imgMatch[1] : `${ARCHIVE_BASE}${imgMatch[1]}`) : '',
        tags, category: catMatch?.[1]?.trim() || '',
        url: linkMatch?.[1] ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `${ARCHIVE_BASE}${linkMatch[1]}`) : '',
      })
    }
  }
  const totalMatch = html.match(/총\s*([\d,]+)\s*건/i)
  return { items: items.length > 0 ? items : null, total: totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : items.length }
}

async function searchArchive(term, category, page = 1) {
  try {
    const params = new URLSearchParams({ currentPageNo: page, ctgryStr: category || '', orientationStr: '', pubnuriStr: '', sortOrd: term ? 'accuracy' : 'regDttm', befSearchTerm: '', searchTerm: term || '' })
    const res = await fetch(`${ARCHIVE_BASE}/ko/search?${params}`)
    if (!res.ok) throw new Error('err')
    const r = parseArchiveResults(await res.text())
    return { items: r.items || [], total: r.total }
  } catch { return { items: [], total: 0 } }
}

// ─── 날짜/날씨 훅 ───
const _nhWeatherCache = { data: {}, key: '', ts: 0 }
function useNHWeather() {
  const [data, setData] = useState(_nhWeatherCache.data)
  useEffect(() => {
    if (_nhWeatherCache.key && Date.now() - _nhWeatherCache.ts < 30 * 60 * 1000) { setData(_nhWeatherCache.data); return }
    fetch('https://api.open-meteo.com/v1/forecast?latitude=37.57&longitude=126.98&current=temperature_2m,weather_code&timezone=auto')
      .then(r => r.json())
      .then(j => {
        const map = { KST: { temp: Math.round(j.current?.temperature_2m ?? 0) } }
        _nhWeatherCache.data = map; _nhWeatherCache.key = 'KST'; _nhWeatherCache.ts = Date.now()
        setData(map)
      })
      .catch(() => {})
  }, [])
  return data
}

const _nhRateCache = { rate: null, ts: 0 }
function useNHCNYRate() {
  const [rate, setRate] = useState(() => _nhRateCache.rate || 191)
  useEffect(() => {
    if (_nhRateCache.rate && Date.now() - _nhRateCache.ts < 60 * 60 * 1000) { setRate(_nhRateCache.rate); return }
    fetch('https://api.frankfurter.app/latest?from=CNY&to=KRW')
      .then(r => r.json())
      .then(d => { const krw = d.rates?.KRW; if (krw > 100) { _nhRateCache.rate = krw; _nhRateCache.ts = Date.now(); setRate(krw) } })
      .catch(() => {})
  }, [])
  return rate
}

function getNHDateLabel(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const d = new Date(utc + offset * 3600000)
  const DAY = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}/${d.getDate()}(${DAY[d.getDay()]})`
}

function getNHTimeForOffset(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const d = new Date(utc + offset * 3600000)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const TIMEZONE_OPTIONS = [
  { id: 'CST',    name: { ko: '중국',     zh: '中国',     en: 'China'     }, offset: 8  },
  { id: 'JST',    name: { ko: '일본',     zh: '日本',     en: 'Japan'     }, offset: 9  },
  { id: 'EST',    name: { ko: '미국 동부', zh: '美东',     en: 'US East'   }, offset: -5 },
  { id: 'PST',    name: { ko: '미국 서부', zh: '美西',     en: 'US West'   }, offset: -8 },
  { id: 'GMT',    name: { ko: '영국',     zh: '英国',     en: 'UK'        }, offset: 0  },
  { id: 'SGT',    name: { ko: '싱가포르', zh: '新加坡',   en: 'Singapore' }, offset: 8  },
  { id: 'ICT_TH', name: { ko: '태국',     zh: '泰国',     en: 'Thailand'  }, offset: 7  },
  { id: 'ICT_VN', name: { ko: '베트남',   zh: '越南',     en: 'Vietnam'   }, offset: 7  },
]

// ─── 여행 상태 유틸 ───
function strToDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
function dateToStr(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }

function getGreeting(lang) {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return L(lang, { ko: '좋은 아침이에요', zh: '早上好', en: 'Good morning' })
  if (h >= 12 && h < 18) return L(lang, { ko: '좋은 오후에요', zh: '下午好', en: 'Good afternoon' })
  if (h >= 18 && h < 22) return L(lang, { ko: '좋은 저녁이에요', zh: '晚上好', en: 'Good evening' })
  return L(lang, { ko: '좋은 밤이에요', zh: '晚安', en: 'Good night' })
}

function getTripStatusLabel(plan, lang) {
  if (!plan) return ''
  const now = new Date(); now.setHours(0,0,0,0)
  const a = strToDate(plan.arrivalDate)
  const d = strToDate(plan.departureDate)
  const diffA = Math.round((a - now) / 86400000)
  if (diffA > 0) return `D-${diffA}`
  if (now > d) return L(lang, { ko: '완료', zh: '结束', en: 'Done' })
  return L(lang, { ko: 'D-DAY · 오늘', zh: 'D-DAY · 今天', en: 'D-DAY · Today' })
}

function formatTripDate(s, lang) {
  const [, m, d] = s.split('-').map(Number)
  const dt = strToDate(s)
  const DAY_KO = ['일','월','화','수','목','금','토']
  const DAY_ZH = ['日','一','二','三','四','五','六']
  const DAY_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const w = dt.getDay()
  if (lang === 'zh') return `${m}月${d}日(${DAY_ZH[w]})`
  if (lang === 'en') return `${m}/${d}(${DAY_EN[w]})`
  return `${m}.${d}(${DAY_KO[w]})`
}

function getNightsLabel(arrival, departure, lang) {
  const nights = Math.round((strToDate(departure) - strToDate(arrival)) / 86400000)
  const days = nights + 1
  if (lang === 'zh') return `${nights}晚${days}天`
  if (lang === 'en') return `${nights}N ${days}D`
  return `${nights}박 ${days}일`
}

// ─── 더보기 페이지 ───
function DiscoverPage({ lang, t, setSubPage, setTab, onClose, onEditorialClick }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <NearPageHeader onBack={onClose} setTab={setTab} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '20px 0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '0 20px 12px' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>
              {L(lang, { ko: '서울 에디토리얼', zh: '首尔编辑部', en: 'Seoul Editorial' })}
            </span>
          </div>
          <div style={{ overflowX: 'auto', display: 'flex', gap: 10, padding: '0 20px 20px', scrollbarWidth: 'none' }}>
            {EDITORIALS.map(ed => (
              <button key={ed.id} onClick={() => onEditorialClick?.(ed.id)}
                style={{ flexShrink: 0, width: 148, height: 120, borderRadius: 14, overflow: 'hidden', background: ed.gradient, border: 'none', cursor: 'pointer', position: 'relative', textAlign: 'left', padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
              >
                <div style={{ position: 'absolute', right: 8, top: 6, fontSize: 38, fontWeight: 900, lineHeight: 1, color: '#F0F0F0', fontFamily: 'Inter, sans-serif', userSelect: 'none' }}>{ed.number}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '0.08em', marginBottom: 4 }}>SEOUL EDITORIAL</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ed.textDark ? '#111' : 'white', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{L(lang, ed.title)}</div>
              </button>
            ))}
          </div>
        </div>
        <MorePage lang={lang} setTab={setTab} setSubPage={setSubPage} />
      </div>
    </div>
  )
}

// ─── fadeUp 스타일 ───
const fadeUp = (i) => ({
  opacity: 1,
  transform: 'translateY(0)',
  animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
})

// ═══════════════════════════════════════════
// 메인 컴포넌트
// ═══════════════════════════════════════════
export default function NearHomeTab({ setTab, setSubPage }) {
  const { lang, t } = useLanguage()
  const plan = useTravelPlan()
  const weatherData = useNHWeather()
  const cnyRate = useNHCNYRate()

  // ─── 타임존 ───
  const [showTzPicker, setShowTzPicker] = useState(false)
  const [extraTz, setExtraTz] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hanpocket_extra_timezones') || '["CST"]') } catch { return ['CST'] }
  })
  const saveTz = (ids) => { setExtraTz(ids); localStorage.setItem('hanpocket_extra_timezones', JSON.stringify(ids)) }

  // ─── 탑승권 ───
  const [boardingPass, setBoardingPass] = useState(() => {
    try { return JSON.parse(localStorage.getItem('near_boarding_pass') || 'null') } catch { return null }
  })
  const [showBoardingModal, setShowBoardingModal] = useState(false)
  const [bpMode, setBpMode] = useState('oneway') // 'oneway' | 'roundtrip'
  const [bpOutDate, setBpOutDate] = useState('')
  const [bpOutFlight, setBpOutFlight] = useState('')
  const [bpRetDate, setBpRetDate] = useState('')
  const [bpRetFlight, setBpRetFlight] = useState('')
  const [bpOutLookup, setBpOutLookup] = useState(null)
  const [bpRetLookup, setBpRetLookup] = useState(null)

  // 항공편 자동 매칭
  const handleFlightInput = (val, setVal, setLookup) => {
    setVal(val)
    const info = lookupFlight(val)
    setLookup(info)
  }

  const saveBoardingPass = () => {
    if (!bpOutDate || !bpOutFlight) return
    const outInfo = bpOutLookup || lookupFlight(bpOutFlight)
    const outLeg = {
      date: bpOutDate, flight: bpOutFlight.toUpperCase(),
      from: outInfo?.from || 'PVG', to: outInfo?.to || 'ICN',
      depTime: outInfo?.dep || '10:00', arrTime: outInfo?.arr || '12:30',
      flightMin: outInfo?.min || 150, airline: outInfo?.airline || bpOutFlight.slice(0,2).toUpperCase(),
    }
    let retLeg = null
    if (bpMode === 'roundtrip' && bpRetDate && bpRetFlight) {
      const retInfo = bpRetLookup || lookupFlight(bpRetFlight)
      retLeg = {
        date: bpRetDate, flight: bpRetFlight.toUpperCase(),
        from: retInfo?.from || 'ICN', to: retInfo?.to || 'PVG',
        depTime: retInfo?.dep || '14:00', arrTime: retInfo?.arr || '16:00',
        flightMin: retInfo?.min || 150, airline: retInfo?.airline || bpRetFlight.slice(0,2).toUpperCase(),
      }
    }
    const bp = { outbound: outLeg, return: retLeg }
    localStorage.setItem('near_boarding_pass', JSON.stringify(bp))
    setBoardingPass(bp)
    setShowBoardingModal(false)
  }

  const deleteBoardingPass = () => {
    localStorage.removeItem('near_boarding_pass')
    setBoardingPass(null)
  }

  const [bpShowReturn, setBpShowReturn] = useState(false) // 탑승권 가는편/오는편 토글

  // ─── UI 상태 ───
  const [showPlanner, setShowPlanner] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [editorialId, setEditorialId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // ─── 검색 ───
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showSearch, setShowSearch] = useState(false)
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)
  const debounceRef = useRef(null)
  const feedRef = useRef(null)
  const overlayInputRef = useRef(null)

  const getRecentSearches = () => { try { return JSON.parse(localStorage.getItem('near_recent') || '[]') } catch { return [] } }
  const addRecentSearch = (term) => { if (!term.trim()) return; const prev = getRecentSearches().filter(t => t !== term); localStorage.setItem('near_recent', JSON.stringify([term, ...prev].slice(0, 8))) }
  const removeRecentSearch = (term) => { localStorage.setItem('near_recent', JSON.stringify(getRecentSearches().filter(t => t !== term))); setRecentSearches(getRecentSearches()) }
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches())

  const openSearchOverlay = () => { setShowSearchOverlay(true); setRecentSearches(getRecentSearches()); setTimeout(() => overlayInputRef.current?.focus(), 80) }
  const closeSearchOverlay = () => { setShowSearchOverlay(false); setQuery(''); setResults([]); setShowSearch(false) }

  const loadContent = useCallback(async (term, catId, pg = 1) => {
    setLoading(true)
    try {
      const searchTerm = lang === 'zh' ? zhToKo(term) : term
      const [tourRes, archiveRes] = await Promise.allSettled([
        pg === 1 ? searchKeyword(term, { numOfRows: 12, areaCode: 1 }) : Promise.resolve({ items: [] }),
        searchArchive(searchTerm, catId, pg),
      ])
      const tourItems = tourRes.status === 'fulfilled' ? tourRes.value.items.map(normalizeTourItem) : []
      const archiveItems = archiveRes.status === 'fulfilled' ? (archiveRes.value.items || []) : []
      const archiveTotal = archiveRes.status === 'fulfilled' ? (archiveRes.value.total || 0) : 0
      const merged = pg === 1 ? [...tourItems, ...archiveItems] : archiveItems
      if (pg === 1) setResults(merged); else setResults(prev => [...prev, ...merged])
      setTotal(tourItems.length + archiveTotal); setPage(pg)
    } catch { setResults([]) }
    setLoading(false)
  }, [lang])

  const handleSearch = (term) => {
    setQuery(term)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!term.trim()) { setShowSearch(false); setResults([]); return }
    setShowSearch(true)
    debounceRef.current = setTimeout(() => { addRecentSearch(term); setRecentSearches(getRecentSearches()); loadContent(term, null) }, 500)
  }

  const handleCategoryClick = (cat) => {
    if (cat.id === 'more') { setShowMore(true); return }
    setSelectedCategory(prev => prev === cat.id ? null : cat.id)
    setQuery(''); setShowSearch(false)
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filteredFeed = selectedCategory ? FEED_DATA.filter(item => item.category === selectedCategory) : FEED_DATA
  const currentEditorial = editorialId ? EDITORIALS.find(e => e.id === editorialId) : null

  // 여행 카드: 다음 일정 미리보기
  const nextItem = plan ? (() => {
    const now = new Date(); now.setHours(0,0,0,0)
    const todayStr = dateToStr(now)
    const dayData = plan.days?.[todayStr]
    if (!dayData) return null
    const places = dayData.items?.filter(i => i.type === 'place') || []
    return places[0] || null
  })() : null

  return (
    <div style={{ background: '#FAFAFA', fontFamily: '-apple-system, "Pretendard", "Noto Sans SC", sans-serif', paddingBottom: 80, minHeight: '100vh' }}>

      {/* ─── @keyframes ─── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ─── 0. Info Bar (최상단) ─── */}
      <div style={{ fontSize: 11, color: '#A8A8A8', padding: '6px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <span>{getNHDateLabel(9)} · {weatherData.KST ? `${weatherData.KST.temp}°` : '--°'} · ¥1 = ₩{Math.round(cnyRate)}</span>
        {extraTz.map(id => {
          const tz = TIMEZONE_OPTIONS.find(t => t.id === id)
          if (!tz) return null
          const diff = tz.offset - 9
          const diffStr = diff === 0 ? '' : diff > 0 ? ` (+${diff}h)` : ` (${diff}h)`
          return <span key={id} style={{ color: '#C4725A' }}> · {L(lang, tz.name)} {getNHTimeForOffset(tz.offset)}{diffStr}</span>
        })}
        <button onClick={() => setShowTzPicker(true)} style={{ background: 'none', border: '1px solid #F0EDED', borderRadius: 10, cursor: 'pointer', color: '#A8A8A8', fontSize: 10, padding: '0 5px', marginLeft: 4, lineHeight: '16px' }}>+</button>
      </div>
      {showTzPicker && (
        <div style={{ background: '#FFFFFF', border: '1px solid #F0EDED', borderRadius: 12, padding: '12px 16px', margin: '0 20px 8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{L(lang, { ko: '시간대 선택', zh: '选择时区', en: 'Select timezone' })}</span>
            <button onClick={() => setShowTzPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A8A8A8' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TIMEZONE_OPTIONS.map(tz => {
              const isOn = extraTz.includes(tz.id)
              return (
                <button key={tz.id} onClick={() => saveTz(isOn ? extraTz.filter(x => x !== tz.id) : [...extraTz, tz.id])}
                  style={{ padding: '5px 10px', borderRadius: 16, cursor: 'pointer', fontSize: 11, fontWeight: 500, background: isOn ? '#C4725A' : '#FFFFFF', color: isOn ? '#FFFFFF' : '#6B6B6B', border: isOn ? '1px solid #C4725A' : '1px solid #F0EDED' }}>
                  {L(lang, tz.name)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── 1. 인사 ─── */}
      <div style={{ padding: '10px 20px 10px', ...fadeUp(0) }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
          {getGreeting(lang)}
        </div>
      </div>

      {/* ─── 1.5 탑승권 + 일정 카드 (가로 반반) ─── */}
      <div style={{ display: 'flex', gap: 10, padding: '0 20px 24px', ...fadeUp(1) }}>

        {/* 탑승권 (좌 50%) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {boardingPass?.outbound ? (() => {
            const hasReturn = !!boardingPass.return
            const bp = (bpShowReturn && hasReturn) ? boardingPass.return : boardingPass.outbound
            const legLabel = (bpShowReturn && hasReturn)
              ? L(lang, { ko: '오는 편', zh: '回程', en: 'Return' })
              : L(lang, { ko: '가는 편', zh: '去程', en: 'Outbound' })
            const fromAp = AIRPORTS[bp.from]
            const toAp = AIRPORTS[bp.to]
            const now = new Date(); now.setHours(0,0,0,0)
            const dDay = Math.round((strToDate(bp.date) - now) / 86400000)
            const dLabel = dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-DAY' : L(lang, { ko: '출발', zh: '已出发', en: 'Gone' })
            const fH = Math.floor(bp.flightMin / 60), fM = bp.flightMin % 60
            return (
              <div
                onClick={() => hasReturn && setBpShowReturn(v => !v)}
                style={{ background: '#2A2520', borderRadius: 12, padding: '14px 14px 12px', position: 'relative', height: '100%', boxSizing: 'border-box', cursor: hasReturn ? 'pointer' : 'default' }}
              >
                <button onClick={(e) => { e.stopPropagation(); deleteBoardingPass() }} style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', fontSize: 10 }}>✕</button>
                {/* 가는편/오는편 라벨 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 9, color: '#C4725A', fontWeight: 600 }}>{legLabel}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'white', background: '#C4725A', padding: '1px 6px', borderRadius: 8 }}>{dLabel}</span>
                </div>
                <div style={{ fontSize: 10, color: '#A8A8A8', marginBottom: 6 }}>{formatTripDate(bp.date, lang)}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{bp.from}</span>
                  <span style={{ fontSize: 11, color: '#6B6B6B' }}>—</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{bp.to}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: '#A8A8A8' }}>{fromAp ? L(lang, fromAp.city) : bp.from}</span>
                  <span style={{ fontSize: 10, color: '#6B6B6B' }}>{fH}h{fM > 0 ? `${fM}m` : ''}</span>
                  <span style={{ fontSize: 10, color: '#A8A8A8' }}>{toAp ? L(lang, toAp.city) : bp.to}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                  <div><div style={{ fontSize: 9, color: '#6B6B6B' }}>{bp.depTime}</div></div>
                  <div><div style={{ fontSize: 9, color: '#6B6B6B' }}>{bp.flight} · {AIRLINES[bp.airline]?.cn || bp.airline}</div></div>
                  <div><div style={{ fontSize: 9, color: '#6B6B6B' }}>{bp.arrTime}</div></div>
                </div>
                {/* 왕복 인디케이터 */}
                {hasReturn && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                    <div style={{ width: bpShowReturn ? 4 : 12, height: 4, borderRadius: 2, background: bpShowReturn ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }} />
                    <div style={{ width: bpShowReturn ? 12 : 4, height: 4, borderRadius: 2, background: bpShowReturn ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', transition: 'all 0.2s' }} />
                  </div>
                )}
              </div>
            )
          })() : (
            <button onClick={() => setShowBoardingModal(true)} style={{
              width: '100%', height: '100%', borderRadius: 12, padding: '20px 14px',
              border: '1px dashed #F0EDED', background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#A8A8A8', marginBottom: 4 }}>{L(lang, { ko: '탑승권', zh: '登机牌', en: 'Boarding Pass' })}</div>
              <div style={{ fontSize: 11, color: '#CDCDCD' }}>{L(lang, { ko: '등록하기', zh: '登记', en: 'Register' })}</div>
            </button>
          )}
        </div>

        {/* 일정 카드 (우 50%) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setShowPlanner(true)}
            style={{
              width: '100%', height: '100%', background: '#FFFFFF', borderRadius: 12, border: 'none',
              padding: '14px', textAlign: 'left', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
            }}
          >
            {plan ? (
              <>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#C4725A', letterSpacing: '0.5px', marginBottom: 4, textTransform: 'uppercase' }}>
                  {getTripStatusLabel(plan, lang)}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1A', lineHeight: 1, marginBottom: 4 }}>
                  {L(lang, { ko: '서울', zh: '首尔', en: 'Seoul' })}
                </div>
                <div style={{ fontSize: 10, color: '#A8A8A8', marginBottom: 6 }}>
                  {formatTripDate(plan.arrivalDate, lang)} — {formatTripDate(plan.departureDate, lang)}
                </div>
                <div style={{ fontSize: 10, color: '#A8A8A8' }}>{getNightsLabel(plan.arrivalDate, plan.departureDate, lang)}</div>
                {nextItem && (
                  <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #F0EDED' }}>
                    <div style={{ fontSize: 9, color: '#C4725A', fontWeight: 600 }}>{nextItem.time}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nextItem.name_cn || nextItem.name_kr}</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
                  {L(lang, { ko: '일정 만들기', zh: '创建行程', en: 'Create Plan' })}
                </div>
                <div style={{ fontSize: 11, color: '#A8A8A8' }}>
                  {L(lang, { ko: '여행 날짜를 설정하세요', zh: '设置旅行日期', en: 'Set travel dates' })}
                </div>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 탑승권 등록 모달 */}
      {showBoardingModal && (
        <div onClick={() => setShowBoardingModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: 16, padding: '24px 20px', width: 'calc(100% - 40px)', maxWidth: 360 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>
              {L(lang, { ko: '탑승권 등록', zh: '登记登机牌', en: 'Boarding Pass' })}
            </div>

            {/* 편도/왕복 토글 */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: '#F0EDED', borderRadius: 8, padding: 2 }}>
              {['oneway', 'roundtrip'].map(m => (
                <button key={m} onClick={() => setBpMode(m)} style={{
                  flex: 1, padding: '6px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: bpMode === m ? '#FFFFFF' : 'transparent',
                  color: bpMode === m ? '#1A1A1A' : '#A8A8A8',
                  fontSize: 12, fontWeight: 600,
                  boxShadow: bpMode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}>
                  {m === 'oneway' ? L(lang, { ko: '편도', zh: '单程', en: 'One-way' }) : L(lang, { ko: '왕복', zh: '往返', en: 'Round-trip' })}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* 가는 편 */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#C4725A' }}>{L(lang, { ko: '가는 편', zh: '去程', en: 'Outbound' })}</div>
              <input type="date" value={bpOutDate} onChange={e => setBpOutDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #F0EDED', outline: 'none', fontSize: 14, color: '#1A1A1A', boxSizing: 'border-box' }} />
              <div style={{ position: 'relative' }}>
                <input type="text" value={bpOutFlight} onChange={e => handleFlightInput(e.target.value, setBpOutFlight, setBpOutLookup)} placeholder="OZ301"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #F0EDED', outline: 'none', fontSize: 14, color: '#1A1A1A', boxSizing: 'border-box' }} />
                {bpOutLookup && (
                  <div style={{ fontSize: 10, color: '#C4725A', marginTop: 4 }}>
                    {bpOutLookup.from} → {bpOutLookup.to} · {bpOutLookup.dep}-{bpOutLookup.arr} · {bpOutLookup.airlineName?.cn || bpOutLookup.airline}
                  </div>
                )}
              </div>

              {/* 오는 편 */}
              {bpMode === 'roundtrip' && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#C4725A', marginTop: 4 }}>{L(lang, { ko: '오는 편', zh: '回程', en: 'Return' })}</div>
                  <input type="date" value={bpRetDate} onChange={e => setBpRetDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #F0EDED', outline: 'none', fontSize: 14, color: '#1A1A1A', boxSizing: 'border-box' }} />
                  <div style={{ position: 'relative' }}>
                    <input type="text" value={bpRetFlight} onChange={e => handleFlightInput(e.target.value, setBpRetFlight, setBpRetLookup)} placeholder="OZ302"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #F0EDED', outline: 'none', fontSize: 14, color: '#1A1A1A', boxSizing: 'border-box' }} />
                    {bpRetLookup && (
                      <div style={{ fontSize: 10, color: '#C4725A', marginTop: 4 }}>
                        {bpRetLookup.from} → {bpRetLookup.to} · {bpRetLookup.dep}-{bpRetLookup.arr}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <button onClick={saveBoardingPass} disabled={!bpOutDate || !bpOutFlight}
              style={{ width: '100%', marginTop: 16, padding: 14, borderRadius: 12, border: 'none', cursor: bpOutDate && bpOutFlight ? 'pointer' : 'not-allowed', background: bpOutDate && bpOutFlight ? '#C4725A' : '#E0E0E0', color: 'white', fontSize: 15, fontWeight: 700 }}>
              {L(lang, { ko: '등록', zh: '登记', en: 'Register' })}
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. "지금 뜨는 곳" 가로 스크롤 ─── */}
      <div style={{ ...fadeUp(3) }}>
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>
            {L(lang, { ko: '지금 뜨는 곳', zh: '现在热门', en: 'Trending Now' })}
          </span>
        </div>
        <div style={{ overflowX: 'auto', display: 'flex', gap: 12, padding: '0 20px 28px', scrollbarWidth: 'none' }}>
          {TRENDING_SPOTS.map(spot => (
            <div key={spot.id} style={{
              flexShrink: 0, width: 200, borderRadius: 14, overflow: 'hidden',
              background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ height: 140, background: spot.gradient }} />
              <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>
                  {L(lang, spot.title)}
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#C4725A', background: '#FBF7F5', padding: '2px 8px', borderRadius: 10 }}>
                  {L(lang, spot.tag)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. 검색창 (지금 뜨는 곳 아래) ─── */}
      <div style={{ padding: '0 20px 16px', ...fadeUp(4) }}>
        <button onClick={openSearchOverlay}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            padding: '11px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: '#FFFFFF', textAlign: 'left',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: 13, color: '#A8A8A8' }}>
            {L(lang, { ko: '카페, 맛집, 피부과 검색...', zh: '搜索咖啡厅、美食、皮肤科...', en: 'Search cafes, food, clinics...' })}
          </span>
        </button>
      </div>

      {/* ─── 5. 카테고리 탭 바 (가로 스크롤) ─── */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 24, padding: '0 20px 0', scrollbarWidth: 'none', borderBottom: '1px solid #F0EDED', marginBottom: 20, ...fadeUp(4) }}>
        {[
          { id: null, zh: '全部', ko: '전체', en: 'All' },
          ...MEITU_CATEGORIES.filter(c => c.id !== 'more'),
        ].map(cat => {
          const isActive = cat.id === null ? selectedCategory === null : selectedCategory === cat.id
          return (
            <button key={cat.id || 'all'} onClick={() => {
              if (cat.id === null) { setSelectedCategory(null); return }
              handleCategoryClick(cat)
            }}
              style={{
                flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 0 8px', fontSize: 15, fontWeight: 600,
                color: isActive ? '#1A1A1A' : '#A8A8A8',
                borderBottom: isActive ? '2px solid #C4725A' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {L(lang, { zh: cat.zh, ko: cat.ko, en: cat.en })}
            </button>
          )
        })}
      </div>

      {/* ─── 6. 추천 장소 2열 그리드 ─── */}
      <div ref={feedRef} style={{ ...fadeUp(5) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 8px' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>
            {selectedCategory
              ? L(lang, CAT_LABELS[selectedCategory] || { ko: '추천 장소', zh: '推荐地点', en: 'Recommended' })
              : L(lang, { ko: '추천 장소', zh: '推荐地点', en: 'Recommended' })
            }
          </span>
          {selectedCategory && (
            <button onClick={() => setSelectedCategory(null)}
              style={{ fontSize: 11, color: '#A8A8A8', background: '#F0EDED', border: 'none', borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}>
              {L(lang, { ko: '전체', zh: '全部', en: 'All' })}
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px' }}>
          {(showSearch ? results : filteredFeed).map((item) => {
            const isFeed = 'gradient' in item
            return (
              <div key={item.id}
                onClick={() => !isFeed && item.url && window.open(item.url, '_blank')}
                style={{
                  borderRadius: 12, overflow: 'hidden', background: '#FFFFFF',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer',
                }}
              >
                <div style={{ width: '100%', aspectRatio: '4/3', background: isFeed ? item.gradient : (item.image ? 'none' : '#F0EDED'), position: 'relative', overflow: 'hidden' }}>
                  {!isFeed && item.image && (
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} loading="lazy" />
                  )}
                </div>
                <div style={{ padding: '8px 10px 10px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: '#1A1A1A', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {isFeed ? t(item.titleKey) : item.title}
                  </div>
                  <div style={{ fontSize: 10, color: '#A8A8A8', marginTop: 4 }}>
                    {isFeed
                      ? (item.locationKey ? t(item.locationKey) : (item.statusKey ? t(item.statusKey) : 'NEAR'))
                      : (item.addr ? item.addr.replace('서울특별시 ', '').slice(0, 16) : '')
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {showSearch && results.length < total && results.length > 0 && (
          <div style={{ padding: '12px 20px 0' }}>
            <button onClick={() => { const term = lang === 'zh' ? zhToKo(query) : query; loadContent(term, null, page + 1) }}
              disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #F0EDED', background: '#FFFFFF', cursor: 'pointer', fontSize: 13, color: '#6B6B6B', fontWeight: 600 }}>
              {loading ? '...' : L(lang, { ko: '더 보기', zh: '加载更多', en: 'Load more' })}
            </button>
          </div>
        )}

        {!showSearch && selectedCategory && filteredFeed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 14, color: '#A8A8A8' }}>{L(lang, { ko: '아직 준비 중이에요', zh: '即将推出', en: 'Coming soon' })}</p>
          </div>
        )}
      </div>

      {/* ─── 더보기 페이지 ─── */}
      {showMore && (
        <DiscoverPage lang={lang} t={t}
          setSubPage={(sub) => { setSubPage(sub); setShowMore(false) }}
          setTab={(tab) => { setTab(tab); setShowMore(false) }}
          onClose={() => { setShowMore(false); setEditorialId(null) }}
          onEditorialClick={(id) => setEditorialId(id)}
        />
      )}

      {currentEditorial && (
        <EditorialDetailPage editorial={currentEditorial} lang={lang} onClose={() => setEditorialId(null)} setTab={setTab} />
      )}

      {/* ─── 검색 오버레이 ─── */}
      {showSearchOverlay && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9200, background: '#FAFAFA', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, "Pretendard", sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #F0EDED', flexShrink: 0 }}>
            <button onClick={closeSearchOverlay} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: '#A8A8A8', padding: '4px 8px' }}>←</button>
            <div style={{ flex: 1, position: 'relative' }}>
              <input ref={overlayInputRef} type="text" value={query} onChange={e => handleSearch(e.target.value)}
                placeholder={L(lang, { ko: '카페, 맛집, 피부과 검색...', zh: '搜索咖啡厅、美食、皮肤科...', en: 'Search cafes, food, clinics...' })}
                style={{ width: '100%', padding: '11px 16px', borderRadius: 12, border: '1px solid #F0EDED', outline: 'none', fontSize: 15, color: '#1A1A1A', background: '#FFFFFF', boxSizing: 'border-box' }}
              />
              {query && <button onClick={() => handleSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#CDCDCD' }}>✕</button>}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {!query && (
              <div>
                {recentSearches.length > 0 && (
                  <>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#A8A8A8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
                      {L(lang, { ko: '최근 검색', zh: '最近搜索', en: 'Recent' })}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                      {recentSearches.map(term => (
                        <div key={term} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFFFF', borderRadius: 20, padding: '7px 12px', border: '1px solid #F0EDED' }}>
                          <button onClick={() => handleSearch(term)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#1A1A1A', padding: 0 }}>{term}</button>
                          <button onClick={() => removeRecentSearch(term)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#CDCDCD' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <p style={{ fontSize: 11, fontWeight: 700, color: '#A8A8A8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
                  {L(lang, { ko: '추천 검색어', zh: '推荐搜索', en: 'Suggestions' })}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { ko: '홍대 맛집', zh: '弘大美食', en: 'Hongdae food' },
                    { ko: '명동 쇼핑', zh: '明洞购物', en: 'Myeongdong shopping' },
                    { ko: '강남 카페', zh: '江南咖啡', en: 'Gangnam cafe' },
                    { ko: '한복 체험', zh: '韩服体验', en: 'Hanbok experience' },
                    { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung' },
                    { ko: '성수동 팝업', zh: '圣水洞快闪', en: 'Seongsu popup' },
                  ].map(s => (
                    <button key={s.ko} onClick={() => handleSearch(L(lang, s))}
                      style={{ background: '#FFFFFF', border: '1px solid #F0EDED', borderRadius: 20, padding: '7px 14px', fontSize: 13, color: '#C4725A', fontWeight: 600, cursor: 'pointer' }}>
                      {L(lang, s)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query && !loading && results.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 14, color: '#A8A8A8' }}>{L(lang, { ko: '검색 결과가 없습니다', zh: '没有搜索结果', en: 'No results found' })}</div>
              </div>
            )}

            {query && results.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {results.map(item => (
                  <div key={item.id} onClick={() => item.url && window.open(item.url, '_blank')}
                    style={{ borderRadius: 12, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #F0EDED', cursor: 'pointer' }}>
                    <div style={{ width: '100%', aspectRatio: '4/3', background: item.image ? 'none' : '#F0EDED', overflow: 'hidden' }}>
                      {item.image && <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={e => e.target.style.display = 'none'} />}
                    </div>
                    <div style={{ padding: '6px 8px 8px' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TravelPlannerTab 풀스크린 오버레이 ─── */}
      <TravelPlannerTab open={showPlanner} onClose={() => setShowPlanner(false)} setSubPage={setSubPage} setTab={setTab} />
    </div>
  )
}
