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

// ─── 여행 상태 유틸 ───
function strToDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
function dateToStr(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }

function getGreeting(plan, lang) {
  if (!plan) return L(lang, { ko: '다음 여행을 계획해보세요', zh: '计划您的下一次旅行吧', en: 'Plan your next trip' })
  const now = new Date(); now.setHours(0,0,0,0)
  const a = strToDate(plan.arrivalDate)
  const d = strToDate(plan.departureDate)
  const diffA = Math.round((a - now) / 86400000)
  if (diffA > 0) return L(lang, { ko: `서울까지 D-${diffA}`, zh: `首尔倒计时 D-${diffA}`, en: `D-${diffA} to Seoul` })
  if (now > d) return L(lang, { ko: '서울 여행이 끝났어요', zh: '首尔之旅结束了', en: 'Your Seoul trip has ended' })
  const dayNum = Math.round((now - a) / 86400000) + 1
  if (lang === 'zh') return `在首尔的第${dayNum}天`
  if (lang === 'en') return `Day ${dayNum} in Seoul`
  return `서울에서의 ${dayNum}째 날이에요`
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

      {/* ─── 1. 인사 영역 ─── */}
      <div style={{ padding: '20px 20px 6px', ...fadeUp(0) }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.3, letterSpacing: '-0.5px' }}>
          {getGreeting(plan, lang)}
        </div>
        <div style={{ fontSize: 12, color: '#A8A8A8', marginTop: 6 }}>
          {getNHDateLabel(9)} · {weatherData.KST ? `${weatherData.KST.temp}°` : '--°'} · ¥1 = ₩{Math.round(cnyRate)} · {L(lang, { ko: '중국', zh: '中国', en: 'CN' })} {(() => { const n = new Date(); const utc = n.getTime() + n.getTimezoneOffset() * 60000; const cn = new Date(utc + 8 * 3600000); return `${String(cn.getHours()).padStart(2,'0')}:${String(cn.getMinutes()).padStart(2,'0')}` })()}
        </div>
      </div>

      {/* ─── 2. 여행 카드 ─── */}
      <div style={{ padding: '12px 20px 0', ...fadeUp(1) }}>
        {plan ? (
          <button
            onClick={() => setShowPlanner(true)}
            style={{
              width: '100%', background: '#FFFFFF', borderRadius: 16, border: 'none',
              padding: '18px 20px', textAlign: 'left', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* 상단 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#C4725A', letterSpacing: '1px', marginBottom: 6, textTransform: 'uppercase' }}>
                  {getTripStatusLabel(plan, lang)}
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#1A1A1A', lineHeight: 1, marginBottom: 4 }}>
                  {L(lang, { ko: '서울', zh: '首尔', en: 'Seoul' })}
                </div>
                <div style={{ fontSize: 11, color: '#A8A8A8' }}>
                  {formatTripDate(plan.arrivalDate, lang)} — {formatTripDate(plan.departureDate, lang)} · {getNightsLabel(plan.arrivalDate, plan.departureDate, lang)}
                </div>
              </div>
              <span style={{ fontSize: 20, color: '#CDCDCD', marginTop: 8, flexShrink: 0 }}>›</span>
            </div>

            {/* 구분선 */}
            <div style={{ height: 1, background: '#F0EDED', margin: '14px 0 12px', width: '100%' }} />

            {/* 다음 일정 미리보기 */}
            {nextItem ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <div style={{ width: 3, height: 28, borderRadius: 2, background: '#C4725A', opacity: 0.5, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: '#C4725A', fontWeight: 600 }}>{nextItem.time || ''}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nextItem.name_cn || nextItem.name_kr}</div>
                  {nextItem.addr && <div style={{ fontSize: 10, color: '#A8A8A8', marginTop: 1 }}>{nextItem.addr.replace('서울특별시 ', '').slice(0, 20)}</div>}
                </div>
              </div>
            ) : null}
          </button>
        ) : (
          /* 미설정 카드 */
          <button
            onClick={() => setShowPlanner(true)}
            style={{
              width: '100%', borderRadius: 16, padding: '24px 20px',
              border: '1.5px dashed #F0EDED', background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
                {L(lang, { ko: '다음 여행을 계획해보세요', zh: '计划下一次旅行', en: 'Plan your next trip' })}
              </div>
              <div style={{ fontSize: 12, color: '#A8A8A8' }}>
                {L(lang, { ko: '날짜를 설정하면 일정이 자동으로 생성돼요', zh: '设置日期后自动生成行程', en: 'Set dates to auto-generate itinerary' })}
              </div>
            </div>
            <span style={{ fontSize: 20, color: '#CDCDCD', flexShrink: 0 }}>›</span>
          </button>
        )}
      </div>

      {/* ─── 3. "지금 뜨는 곳" 가로 스크롤 ─── */}
      <div style={{ ...fadeUp(3) }}>
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>
            {L(lang, { ko: '지금 뜨는 곳', zh: '现在热门', en: 'Trending Now' })}
          </span>
        </div>
        <div style={{ overflowX: 'auto', display: 'flex', gap: 12, padding: '0 20px 20px', scrollbarWidth: 'none' }}>
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
      <div style={{ padding: '0 20px 12px', ...fadeUp(4) }}>
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

      {/* ─── 5. 카테고리 필터 ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, padding: '0 14px 6px', ...fadeUp(4) }}>
        {MEITU_CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id
          return (
            <button key={cat.id} onClick={() => handleCategoryClick(cat)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '8px 2px', cursor: 'pointer', borderRadius: 10,
                background: isActive ? '#FBF7F5' : 'transparent', border: 'none',
              }}
            >
              <span style={{ fontSize: 9, color: isActive ? '#C4725A' : '#6B6B6B', fontWeight: isActive ? 700 : 500 }}>
                {L(lang, { zh: cat.zh, ko: cat.ko, en: cat.en })}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── 6. 추천 장소 2열 그리드 ─── */}
      <div ref={feedRef} style={{ ...fadeUp(5) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 8px' }}>
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
