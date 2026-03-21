/**
 * NearHomeTab — NEAR 앱 홈 탭 (首页)
 * 인사 + 검색바 + 퀵 액션 + 히어로 배너 + 카테고리 그리드 + 피드
 * (DiscoverTab 내용 통합)
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Car, Phone, Calendar, MapPin, X, ChevronRight, Heart, Scissors, Utensils, ShoppingBag, Coffee, Train, ShoppingCart, Smartphone, MoreHorizontal } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

// ─── 퀵 액션 (1행) ───
const QUICK_ACTIONS = [
  { id: 'beauty', icon: Calendar, bg: '#FDF3F1', color: '#C4725A', action: 'booking'  },
  { id: 'taxi',   icon: Car,      bg: '#FFF9E6', color: '#F9A825', action: 'taxi'     },
  { id: 'map',    icon: MapPin,   bg: '#EDF5FF', color: '#007AFF', action: 'near-map' },
  { id: 'sos',    icon: Phone,    bg: '#FFF0F0', color: '#FF3B30', action: 'sos'      },
]

const QUICK_ACTION_LABEL_KEYS = {
  beauty: 'home.quick.beauty',
  taxi:   'home.quick.taxi',
  map:    'home.quick.explore',
  sos:    'home.quick.emergency',
}

// ─── 美团 스타일 카테고리 그리드 (10개) ───
const MEITU_CATEGORIES = [
  { id: 'beauty',   icon: Scissors,       bg: '#FFEEF0', color: '#E57373', zh: '美容',   ko: '미용',   en: 'Beauty',    searchTerm: { zh: '美妆', ko: '뷰티', en: 'beauty' },     archiveCat: '7'  },
  { id: 'food',     icon: Utensils,       bg: '#FFF3E0', color: '#FF9800', zh: '美食',   ko: '맛집',   en: 'Food',      searchTerm: { zh: '美食', ko: '맛집', en: 'food' },       archiveCat: '2'  },
  { id: 'popup',    icon: ShoppingBag,    bg: '#F3E5F5', color: '#9C27B0', zh: '快闪店', ko: '팝업',   en: 'Popup',     searchTerm: { zh: '快闪店', ko: '팝업', en: 'popup' },    archiveCat: null },
  { id: 'cafe',     icon: Coffee,         bg: '#EFEBE9', color: '#795548', zh: '咖啡',   ko: '카페',   en: 'Cafe',      searchTerm: { zh: '咖啡厅', ko: '카페', en: 'cafe' },     archiveCat: '14' },
  { id: 'taxi',     icon: Car,            bg: '#FFF8E1', color: '#F57F17', zh: '出租车', ko: '택시',   en: 'Taxi',      searchTerm: null, archiveCat: null, tab: 'near-map'       },
  { id: 'medical',  icon: Heart,          bg: '#E8F5E9', color: '#4CAF50', zh: '医疗',   ko: '의료',   en: 'Medical',   searchTerm: { zh: '医院', ko: '병원', en: 'hospital' },   archiveCat: '8'  },
  { id: 'ktx',      icon: Train,          bg: '#E3F2FD', color: '#2196F3', zh: 'KTX',    ko: 'KTX',    en: 'KTX',       searchTerm: { zh: '地铁', ko: '지하철', en: 'metro' },    archiveCat: null },
  { id: 'shopping', icon: ShoppingCart,   bg: '#FCE4EC', color: '#E91E63', zh: '购物',   ko: '쇼핑',   en: 'Shopping',  searchTerm: { zh: '购物', ko: '쇼핑', en: 'shopping' },   archiveCat: '1'  },
  { id: 'simcard',  icon: Smartphone,     bg: '#E0F7FA', color: '#00BCD4', zh: '电话卡', ko: 'SIM',    en: 'SIM',       searchTerm: null, archiveCat: null, sub: 'sim-guide'      },
  { id: 'more',     icon: MoreHorizontal, bg: '#F7F7F7', color: '#999999', zh: '更多',   ko: '더보기', en: 'More',      searchTerm: null, archiveCat: null                        },
]

// ─── 小红书 스타일 피드 고정 데이터 ───
const FEED_DATA = [
  { id: 'fd1', title: '韩国烫染一站式，效果绝了',   location: '圣水洞', status: null,       likes: '328',  gradient: 'linear-gradient(160deg,#FFEEF0,#FFD6DC)' },
  { id: 'fd2', title: 'GENTLE MONSTER 限时快闪',    location: null,     status: 'D-5 结束', likes: '892',  gradient: 'linear-gradient(160deg,#F3E5F5,#E1BEE7)' },
  { id: 'fd3', title: '本地人都去的弘大烤肉店',     location: '弘大',   status: null,       likes: '1.2k', gradient: 'linear-gradient(160deg,#FFF3E0,#FFE0B2)' },
  { id: 'fd4', title: '江南皮肤管理，中文OK',       location: null,     status: '需预约',   likes: '567',  gradient: 'linear-gradient(160deg,#E8F5E9,#C8E6C9)' },
  { id: 'fd5', title: 'BLACKPINK周边快闪',          location: '明洞',   status: null,       likes: '2.1k', gradient: 'linear-gradient(160deg,#FCE4EC,#F8BBD9)' },
  { id: 'fd6', title: '首尔最火的拍照咖啡厅',       location: '圣水',   status: null,       likes: '445',  gradient: 'linear-gradient(160deg,#EFEBE9,#D7CCC8)' },
]

// ─── 폴백 데이터 ───
const FALLBACK_ITEMS = [
  { id: 'f1', title: '경복궁', image: '', tags: ['경복궁', '고궁', '종로'], category: '역사/문화', url: '' },
  { id: 'f2', title: '명동 거리', image: '', tags: ['명동', '쇼핑', '중구'], category: '쇼핑/시장', url: '' },
  { id: 'f3', title: '북촌한옥마을', image: '', tags: ['북촌', '한옥', '종로'], category: '역사/문화', url: '' },
  { id: 'f4', title: '홍대 걷고싶은거리', image: '', tags: ['홍대', '카페', '마포'], category: '놀이/체험', url: '' },
  { id: 'f5', title: 'N서울타워', image: '', tags: ['남산', '야경', '용산'], category: '자연풍경', url: '' },
  { id: 'f6', title: '성수동 카페거리', image: '', tags: ['성수', '카페', '성동'], category: '식당/까페', url: '' },
]

// ─── 중국어→한국어 매핑 ───
const ZH_TO_KO = {
  '美食': '맛집', '咖啡': '카페', '购物': '쇼핑', '明洞': '명동', '弘大': '홍대',
  '江南': '강남', '圣水': '성수', '景福宫': '경복궁', '东大门': '동대문', '梨泰院': '이태원',
  '南山': '남산', '北村': '북촌', '美妆': '뷰티', '快闪店': '팝업', '打卡': '핫플',
  '热门': '인기', '推荐': '추천', '医院': '병원', '便利店': '편의점', 'K-POP': 'K-POP',
}

// ─── 긴급 전화 ───
const SOS_NUMBERS = [
  { labelKey: 'sos.police',   num: '112' },
  { labelKey: 'sos.ambulance', num: '119' },
  { labelKey: 'sos.travel',   num: '1330' },
  { labelKey: 'sos.embassy',  num: '02-738-1038' },
]

const ARCHIVE_BASE = 'https://archive.visitseoul.net'

function zhToKo(q) {
  if (!q) return q
  let r = q
  Object.entries(ZH_TO_KO).sort((a,b) => b[0].length - a[0].length).forEach(([zh, ko]) => {
    r = r.replace(new RegExp(zh, 'g'), ko)
  })
  return r
}

function parseArchiveResults(html) {
  const items = []
  const cards = html.match(/<li[^>]*class="[^"]*item[^"]*"[^>]*>[\s\S]*?<\/li>/gi) || []
  for (const card of cards) {
    const imgMatch = card.match(/src="([^"]*(?:upload|image)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i)
    const titleMatch = card.match(/<(?:strong|h[2-4]|p|span)[^>]*class="[^"]*(?:tit|title|name)[^"]*"[^>]*>(.*?)<\//i)
      || card.match(/<(?:strong|h[2-4]|p)[^>]*>(.*?)<\//i)
    const tags = []; const tagRegex = /#([\w가-힣\u4e00-\u9fff]+)/g; let tm
    while ((tm = tagRegex.exec(card)) !== null) tags.push(tm[1])
    const catMatch = card.match(/class="[^"]*(?:cate|badge|tag)[^"]*"[^>]*>([^<]+)/i)
    const linkMatch = card.match(/href="([^"]*\/(?:ko|zh|en)\/[^"]+)"/i)
    if (titleMatch || imgMatch) {
      items.push({
        id: `arch-${items.length}`,
        title: (titleMatch?.[1] || '').replace(/<[^>]*>/g, '').trim(),
        image: imgMatch?.[1] ? (imgMatch[1].startsWith('http') ? imgMatch[1] : `${ARCHIVE_BASE}${imgMatch[1]}`) : '',
        tags, category: catMatch?.[1]?.trim() || '',
        url: linkMatch?.[1] ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `${ARCHIVE_BASE}${linkMatch[1]}`) : '',
      })
    }
  }
  const totalMatch = html.match(/총\s*([\d,]+)\s*건/i)
  return { items: items.length > 0 ? items : FALLBACK_ITEMS, total: totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : items.length }
}

async function searchArchive(term, category, page = 1) {
  try {
    const params = new URLSearchParams({ currentPageNo: page, ctgryStr: category || '', orientationStr: '', pubnuriStr: '', sortOrd: term ? 'accuracy' : 'regDttm', befSearchTerm: '', searchTerm: term || '' })
    const res = await fetch(`${ARCHIVE_BASE}/ko/search?${params}`)
    if (!res.ok) throw new Error('err')
    return parseArchiveResults(await res.text())
  } catch {
    return { items: FALLBACK_ITEMS, total: FALLBACK_ITEMS.length }
  }
}

export default function NearHomeTab({ setTab, setSubPage }) {
  const { lang, t } = useLanguage()
  const [sosOpen, setSosOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [showFeed, setShowFeed] = useState(true)    // true = 피드 모드, false = 검색결과
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const debounceRef = useRef(null)
  const feedRef = useRef(null)

  const loadContent = useCallback(async (term, catId, pg = 1) => {
    setLoading(true)
    try {
      const searchTerm = lang === 'zh' ? zhToKo(term) : term
      const { items, total: t } = await searchArchive(searchTerm, catId, pg)
      if (pg === 1) setResults(items); else setResults(prev => [...prev, ...items])
      setTotal(t); setPage(pg)
    } catch { setResults(FALLBACK_ITEMS) }
    setLoading(false)
    setShowFeed(false)
  }, [lang])

  const handleSearch = (term) => {
    setQuery(term); setActiveCategory(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!term.trim()) { setShowFeed(true); setResults([]); return }
    debounceRef.current = setTimeout(() => loadContent(term, null), 500)
  }

  const handleCategoryClick = (cat) => {
    if (cat.tab && setTab) { setTab(cat.tab); return }
    if (cat.sub && setSubPage) { setSubPage(cat.sub); return }
    if (!cat.searchTerm) return
    setActiveCategory(cat.id); setQuery('')
    loadContent(L(lang, cat.searchTerm), cat.archiveCat)
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleQuickAction = (action) => {
    if (action === 'sos') { setSosOpen(true); return }
    if (action === 'taxi' || action === 'near-map') { setTab('near-map'); return }
    setTab(action)
  }

  const handleItemClick = (item) => {
    if (item.url) window.open(item.url, '_blank')
    else window.open(`https://map.kakao.com/link/search/${encodeURIComponent(item.title || item.tags?.[0] || '')}`, '_blank')
  }

  return (
    <div style={{ background: 'white', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif', paddingBottom: 24 }}>

      {/* ─── 1. 상단 인사 + 검색바 ─── */}
      <div style={{ padding: '20px 20px 16px' }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.3 }}>
          {t('home.greeting')} 👋
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 14px' }}>
          {t('home.subtitle')}
        </p>
        {/* 검색바 — pill shape */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)', flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder={t('home.search')}
            style={{
              width: '100%', padding: '12px 36px', borderRadius: 50,
              background: 'var(--surface)', border: '1px solid var(--border)',
              outline: 'none', fontSize: 14, color: 'var(--text-primary)', boxSizing: 'border-box',
            }}
          />
          {query && (
            <button onClick={() => handleSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={14} color="var(--text-muted)" />
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. 퀵 액션 (4개 1행) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '0 20px 20px' }}>
        {QUICK_ACTIONS.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleQuickAction(item.action)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px', borderRadius: 'var(--radius-card)', background: item.bg, border: 'none', cursor: 'pointer' }}
              onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
              onTouchEnd={e => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={item.color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: item.color, textAlign: 'center', lineHeight: 1.3 }}>
                {t(QUICK_ACTION_LABEL_KEYS[item.id])}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── 3. 히어로 배너 ─── */}
      {showFeed && !query && (
        <div style={{ margin: '0 20px 20px', height: 140, borderRadius: 'var(--radius-card)', background: 'linear-gradient(135deg, #C4725A, #E8956F)', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', right: 60, top: 10, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{t('home.banner.title')}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{t('home.banner.desc')}</div>
        </div>
      )}

      {/* ─── 4. 카테고리 그리드 (美团 스타일 2행x5열) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: '0 20px', marginBottom: 20 }}>
        {MEITU_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id
          const Icon = cat.icon
          return (
            <button key={cat.id} onClick={() => handleCategoryClick(cat)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 4px', cursor: 'pointer', borderRadius: 12, background: isActive ? 'var(--surface)' : 'transparent', border: 'none', transition: 'all 0.15s' }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={cat.color} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>
                {L(lang, { zh: cat.zh, ko: cat.ko, en: cat.en })}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── 5. 热门推荐 피드 ─── */}
      <div ref={feedRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
            {showFeed && !query
              ? t('home.trending')
              : total > 0
                ? L(lang, { ko: `${total}건`, zh: `共${total}条`, en: `${total} results` })
                : L(lang, { ko: '검색 결과', zh: '搜索结果', en: 'Results' })
            }
          </span>
          <a href="https://archive.visitseoul.net" target="_blank" rel="noreferrer"
            style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            {t('home.more')} <ChevronRight size={14} />
          </a>
        </div>

        {/* 2열 피드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px' }}>
          {loading && (showFeed ? false : results.length === 0) ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
                <div className="skeleton" style={{ width: '100%', aspectRatio: '3/4' }} />
                <div style={{ padding: '10px 12px' }}>
                  <div className="skeleton" style={{ height: 12, marginBottom: 6, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 10, width: '60%', borderRadius: 4 }} />
                </div>
              </div>
            ))
          ) : (showFeed && !query ? FEED_DATA : results).map((item, idx) => {
            const isFeed = 'gradient' in item
            return (
              <div
                key={item.id}
                onClick={() => !isFeed && handleItemClick(item)}
                style={{
                  borderRadius: 'var(--radius-card)', overflow: 'hidden',
                  background: 'var(--card)', boxShadow: 'var(--shadow-card)',
                  cursor: 'pointer', transition: 'transform 0.2s',
                  animationDelay: `${idx * 0.05}s`,
                }}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* 이미지 영역 */}
                <div style={{ width: '100%', aspectRatio: '3/4', background: isFeed ? item.gradient : (item.image ? 'none' : 'var(--surface)'), position: 'relative', overflow: 'hidden' }}>
                  {!isFeed && item.image && (
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none' }} loading="lazy" />
                  )}
                  <button onClick={e => e.stopPropagation()}
                    style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={14} color="white" />
                  </button>
                  {(isFeed ? item.location || item.status : item.category) && (
                    <span style={{ position: 'absolute', bottom: 8, left: 8, padding: '3px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 11, backdropFilter: 'blur(4px)' }}>
                      {isFeed ? (item.status || item.location) : item.category}
                    </span>
                  )}
                </div>
                {/* 텍스트 */}
                <div style={{ padding: '10px 12px 14px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {isFeed ? (item.location || 'NEAR') : (item.tags?.[0] ? `#${item.tags[0]}` : 'NEAR')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Heart size={12} /> {isFeed ? item.likes : ''}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 더보기 */}
        {!showFeed && results.length < total && results.length > 0 && (
          <div style={{ padding: '12px 20px 0' }}>
            <button onClick={() => { const t = lang === 'zh' ? zhToKo(query) : query; const c = MEITU_CATEGORIES.find(c => c.id === activeCategory)?.archiveCat || null; loadContent(t, c, page + 1) }}
              disabled={loading}
              className="btn btn-outline"
              style={{ width: '100%' }}>
              {loading ? '...' : t('common.loadMore')}
            </button>
          </div>
        )}
      </div>

      {/* ─── SOS 모달 ─── */}
      {sosOpen && (
        <div onClick={() => setSosOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FF3B30', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={18} color="#FF3B30" />
              {t('sos.title')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SOS_NUMBERS.map(s => (
                <a key={s.num} href={`tel:${s.num}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 'var(--radius-card)', background: '#FFF0F0', textDecoration: 'none' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t(s.labelKey)}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#FF3B30', fontFamily: 'Inter, sans-serif' }}>{s.num}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
