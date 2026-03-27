/**
 * 🔍 발견 탭 — Visit Seoul 아카이브 검색 + 스마트 카테고리
 * 중국 여성 관광객이 1~3터치로 원하는 장소를 찾는 핵심 탭
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, MapPin, ExternalLink, ChevronRight, Scissors, Utensils, ShoppingBag, Coffee, Car, Heart, Train, ShoppingCart, Smartphone, MoreHorizontal } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

// ─── Visit Seoul 아카이브 카테고리 매핑 ───
const ARCHIVE_CATEGORIES = {
  1: 'shopping',
  2: 'food',
  3: 'nature',
  4: 'play',
  5: 'sports',
  6: 'culture',
  7: 'fashion',
  8: 'medical',
  9: 'people',
  10: 'kpop',
  11: 'transport',
  12: 'museum',
  13: 'palace',
  14: 'restaurant',
  15: 'accommodation',
  16: 'event',
  17: 'season',
  18: 'other',
}

// ─── 중국 여성 관광객 기준 1터치 카테고리 ───
const QUICK_CATEGORIES = [
  { id: 'hot',       emoji: '🔥', label: { ko: '인기', zh: '热门', en: 'Hot' }, searchTerm: { zh: '热门景点', ko: '인기', en: 'popular' }, archiveCat: null },
  { id: 'food',      emoji: '🍽', label: { ko: '맛집', zh: '美食', en: 'Food' }, searchTerm: { zh: '美食', ko: '맛집', en: 'food' }, archiveCat: '2' },
  { id: 'cafe',      emoji: '☕', label: { ko: '카페', zh: '咖啡', en: 'Cafe' }, searchTerm: { zh: '咖啡厅', ko: '카페', en: 'cafe' }, archiveCat: '14' },
  { id: 'shopping',  emoji: '🛍', label: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, searchTerm: { zh: '购物', ko: '쇼핑', en: 'shopping' }, archiveCat: '1' },
  { id: 'beauty',    emoji: '💄', label: { ko: '뷰티', zh: '美妆', en: 'Beauty' }, searchTerm: { zh: '美妆', ko: '뷰티', en: 'beauty' }, archiveCat: '7' },
  { id: 'kpop',      emoji: '🎤', label: { ko: 'K-POP', zh: 'K-POP', en: 'K-POP' }, searchTerm: { zh: 'K-POP', ko: 'K-POP', en: 'K-POP' }, archiveCat: '10' },
  { id: 'photo',     emoji: '📸', label: { ko: '핫플', zh: '打卡地', en: 'Photo Spots' }, searchTerm: { zh: '打卡', ko: '핫플', en: 'photo spot' }, archiveCat: null },
  { id: 'popup',     emoji: '🎪', label: { ko: '팝업', zh: '快闪店', en: 'Popup' }, searchTerm: { zh: '快闪店', ko: '팝업', en: 'popup' }, archiveCat: null },
  { id: 'palace',    emoji: '🏛', label: { ko: '관광지', zh: '景点', en: 'Attractions' }, searchTerm: { zh: '景点', ko: '관광지', en: 'attractions' }, archiveCat: '13' },
  { id: 'perform',   emoji: '🎭', label: { ko: '공연', zh: '演出', en: 'Shows' }, searchTerm: { zh: '公演', ko: '공연', en: 'performance' }, archiveCat: '16' },
  { id: 'store',     emoji: '🏪', label: { ko: '편의점', zh: '便利店', en: 'CVS' }, searchTerm: { zh: '便利店', ko: '편의점', en: 'convenience store' }, archiveCat: null },
  { id: 'hospital',  emoji: '🏥', label: { ko: '병원', zh: '医院', en: 'Hospital' }, searchTerm: { zh: '医院', ko: '병원', en: 'hospital' }, archiveCat: '8' },
]

// ─── 인기 검색어 ───
const TRENDING = [
  { zh: '明洞美食', ko: '명동 맛집', en: 'Myeongdong food' },
  { zh: '弘大咖啡厅', ko: '홍대 카페', en: 'Hongdae cafe' },
  { zh: '圣水打卡', ko: '성수 핫플', en: 'Seongsu hot spots' },
  { zh: '景福宫韩服', ko: '경복궁 한복', en: 'Gyeongbokgung hanbok' },
  { zh: '江南购物', ko: '강남 쇼핑', en: 'Gangnam shopping' },
  { zh: 'Olive Young', ko: '올리브영', en: 'Olive Young' },
]

// ─── Visit Seoul 아카이브 검색 API ───
const ARCHIVE_BASE = 'https://archive.visitseoul.net'

async function searchArchive(term, category, page = 1, pageSize = 15) {
  try {
    const params = new URLSearchParams({
      currentPageNo: page,
      ctgryStr: category || '',
      orientationStr: '',
      pubnuriStr: '',
      sortOrd: term ? 'accuracy' : 'regDttm',
      befSearchTerm: '',
      searchTerm: term || '',
    })
    const res = await fetch(`${ARCHIVE_BASE}/ko/search?${params}`)
    if (!res.ok) throw new Error('Archive API error')
    const html = await res.text()
    return parseArchiveResults(html)
  } catch (e) {
    console.warn('Archive search fallback:', e.message)
    return { items: FALLBACK_ITEMS, total: FALLBACK_ITEMS.length }
  }
}

function parseArchiveResults(html) {
  const items = []
  // 이미지 카드 파싱 — <div class="img_wrap"> 패턴
  const cardRegex = /<li[^>]*class="[^"]*item[^"]*"[^>]*>[\s\S]*?<\/li>/gi
  const cards = html.match(cardRegex) || []

  for (const card of cards) {
    // 이미지 URL
    const imgMatch = card.match(/src="([^"]*(?:upload|image)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i)
    // 제목
    const titleMatch = card.match(/<(?:strong|h[2-4]|p|span)[^>]*class="[^"]*(?:tit|title|name)[^"]*"[^>]*>(.*?)<\//i)
      || card.match(/<(?:strong|h[2-4]|p)[^>]*>(.*?)<\//i)
    // 해시태그
    const tags = []
    const tagRegex = /#([\w가-힣\u4e00-\u9fff]+)/g
    let tagMatch
    while ((tagMatch = tagRegex.exec(card)) !== null) {
      tags.push(tagMatch[1])
    }
    // 카테고리
    const catMatch = card.match(/class="[^"]*(?:cate|badge|tag)[^"]*"[^>]*>([^<]+)/i)
    // 링크
    const linkMatch = card.match(/href="([^"]*\/(?:ko|zh|en)\/[^"]+)"/i)

    if (titleMatch || imgMatch) {
      items.push({
        id: `arch-${items.length}`,
        title: (titleMatch?.[1] || '').replace(/<[^>]*>/g, '').trim(),
        image: imgMatch?.[1] ? (imgMatch[1].startsWith('http') ? imgMatch[1] : `${ARCHIVE_BASE}${imgMatch[1]}`) : '',
        tags,
        category: catMatch?.[1]?.trim() || '',
        url: linkMatch?.[1] ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `${ARCHIVE_BASE}${linkMatch[1]}`) : '',
      })
    }
  }

  // total count
  const totalMatch = html.match(/총\s*([\d,]+)\s*건/i) || html.match(/([\d,]+)\s*(?:items|results)/i)
  const total = totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : items.length

  return { items: items.length > 0 ? items : FALLBACK_ITEMS, total }
}

// 폴백 인기 콘텐츠
const FALLBACK_ITEMS = [
  { id: 'f1', title: '경복궁', image: '', tags: ['경복궁', '고궁', '종로'], category: '역사/문화', url: '' },
  { id: 'f2', title: '명동 거리', image: '', tags: ['명동', '쇼핑', '중구'], category: '쇼핑/시장', url: '' },
  { id: 'f3', title: '북촌한옥마을', image: '', tags: ['북촌', '한옥', '종로'], category: '역사/문화', url: '' },
  { id: 'f4', title: '홍대 걷고싶은거리', image: '', tags: ['홍대', '카페', '마포'], category: '놀이/체험', url: '' },
  { id: 'f5', title: 'N서울타워', image: '', tags: ['남산', '야경', '용산'], category: '자연풍경', url: '' },
  { id: 'f6', title: '성수동 카페거리', image: '', tags: ['성수', '카페', '성동'], category: '식당/까페', url: '' },
  { id: 'f7', title: '광장시장', image: '', tags: ['광장시장', '음식', '종로'], category: '음식', url: '' },
  { id: 'f8', title: '이태원', image: '', tags: ['이태원', '맛집', '용산'], category: '음식', url: '' },
  { id: 'f9', title: '잠실 롯데월드타워', image: '', tags: ['잠실', '전망대', '송파'], category: '놀이/체험', url: '' },
  { id: 'f10', title: 'COEX 별마당도서관', image: '', tags: ['코엑스', '강남', '핫플'], category: '문화', url: '' },
  { id: 'f11', title: '청계천', image: '', tags: ['청계천', '산책', '중구'], category: '자연풍경', url: '' },
  { id: 'f12', title: '여의도 한강공원', image: '', tags: ['여의도', '한강', '치맥'], category: '자연풍경', url: '' },
]

// ─── 중국어→한국어 검색어 매핑 (자주 검색하는 단어) ───
const ZH_TO_KO = {
  '美食': '맛집', '咖啡': '카페', '购物': '쇼핑', '明洞': '명동',
  '弘大': '홍대', '江南': '강남', '圣水': '성수', '景福宫': '경복궁',
  '东大门': '동대문', '梨泰院': '이태원', '汝矣岛': '여의도',
  '南山': '남산', '北村': '북촌', '仁寺洞': '인사동', '钟路': '종로',
  '乐天': '롯데', '免税店': '면세점', '韩服': '한복', '烤肉': '고기',
  '炸鸡': '치킨', '拌饭': '비빔밥', '冷面': '냉면', '部队锅': '부대찌개',
  '便利店': '편의점', '药店': '약국', '医院': '병원', '地铁': '지하철',
  '化妆品': '화장품', '打卡': '핫플', '快闪店': '팝업', '夜景': '야경',
  '汉江': '한강', '市场': '시장', '烧酒': '소주', '年糕': '떡볶이',
  '饺子': '만두', 'K-POP': 'K-POP', '偶像': '아이돌', '演唱会': '콘서트',
  '清潭洞': '청담동', '狎鸥亭': '압구정', '益善洞': '익선동',
  '汉阳大': '한양대', '延南洞': '연남동', '望远洞': '망원동',
  '合井': '합정', '三清洞': '삼청동', '光化门': '광화문',
  '热门': '인기', '推荐': '추천', '附近': '근처',
}

// ─── 美团 스타일 카테고리 그리드 (10개) ───
const MEITU_CATEGORIES = [
  { id: 'beauty',   icon: Scissors,      bg: '#FFEEF0', color: '#E57373', zh: '美容',  ko: '미용',  en: 'Beauty',   searchTerm: { zh: '美妆', ko: '뷰티', en: 'beauty' },    archiveCat: '7' },
  { id: 'food',     icon: Utensils,      bg: '#FFF3E0', color: '#FF9800', zh: '美食',  ko: '맛집',  en: 'Food',     searchTerm: { zh: '美食', ko: '맛집', en: 'food' },      archiveCat: '2' },
  { id: 'popup',    icon: ShoppingBag,   bg: '#F3E5F5', color: '#9C27B0', zh: '快闪店',ko: '팝업',  en: 'Popup',    searchTerm: { zh: '快闪店', ko: '팝업', en: 'popup' },  archiveCat: null },
  { id: 'cafe',     icon: Coffee,        bg: '#EFEBE9', color: '#795548', zh: '咖啡',  ko: '카페',  en: 'Cafe',     searchTerm: { zh: '咖啡厅', ko: '카페', en: 'cafe' },    archiveCat: '14' },
  { id: 'taxi',     icon: Car,           bg: '#FFF8E1', color: '#F57F17', zh: '出租车',ko: '택시',  en: 'Taxi',     searchTerm: null, archiveCat: null, tab: 'near-map' },
  { id: 'medical',  icon: Heart,         bg: '#E8F5E9', color: '#4CAF50', zh: '医疗',  ko: '의료',  en: 'Medical',  searchTerm: { zh: '医院', ko: '병원', en: 'hospital' }, archiveCat: '8' },
  { id: 'ktx',      icon: Train,         bg: '#E3F2FD', color: '#2196F3', zh: 'KTX',   ko: 'KTX',   en: 'KTX',      searchTerm: { zh: '地铁', ko: '지하철', en: 'metro' },  archiveCat: null },
  { id: 'shopping', icon: ShoppingCart,  bg: '#FCE4EC', color: '#E91E63', zh: '购物',  ko: '쇼핑',  en: 'Shopping', searchTerm: { zh: '购物', ko: '쇼핑', en: 'shopping' },  archiveCat: '1' },
  { id: 'simcard',  icon: Smartphone,    bg: '#E0F7FA', color: '#00BCD4', zh: '电话卡',ko: 'SIM',   en: 'SIM',      searchTerm: null, archiveCat: null, sub: 'sim-guide' },
  { id: 'more',     icon: MoreHorizontal,bg: '#F7F7F7', color: '#999999', zh: '更多',  ko: '더보기',en: 'More',     searchTerm: null, archiveCat: null },
]

// ─── 小红书 스타일 피드 고정 데이터 ───
const FEED_DATA = [
  { id: 'fd1', title: '韩国烫染一站式，效果绝了',      location: '圣水洞',  status: null,       likes: '328',  gradient: 'linear-gradient(160deg,#FFEEF0,#FFD6DC)' },
  { id: 'fd2', title: 'GENTLE MONSTER 限时快闪',       location: null,      status: 'D-5 结束', likes: '892',  gradient: 'linear-gradient(160deg,#F3E5F5,#E1BEE7)' },
  { id: 'fd3', title: '本地人都去的弘大烤肉店',        location: '弘大',    status: null,       likes: '1.2k', gradient: 'linear-gradient(160deg,#FFF3E0,#FFE0B2)' },
  { id: 'fd4', title: '江南皮肤管理，中文OK',          location: null,      status: '需预约',   likes: '567',  gradient: 'linear-gradient(160deg,#E8F5E9,#C8E6C9)' },
  { id: 'fd5', title: 'BLACKPINK周边快闪',             location: '明洞',    status: null,       likes: '2.1k', gradient: 'linear-gradient(160deg,#FCE4EC,#F8BBD9)' },
  { id: 'fd6', title: '首尔最火的拍照咖啡厅',          location: '圣水',    status: null,       likes: '445',  gradient: 'linear-gradient(160deg,#EFEBE9,#D7CCC8)' },
]

function zhToKo(query) {
  if (!query) return query
  let result = query
  // 긴 단어 먼저 매칭
  const sorted = Object.entries(ZH_TO_KO).sort((a, b) => b[0].length - a[0].length)
  for (const [zh, ko] of sorted) {
    result = result.replace(new RegExp(zh, 'g'), ko)
  }
  return result
}

export default function DiscoverTab({ lang, setTab, setSubPage }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [showTrending, setShowTrending] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // 초기 인기 콘텐츠 로드
  useEffect(() => {
    loadContent('', null)
  }, [])

  const loadContent = useCallback(async (term, catId, pg = 1) => {
    setLoading(true)
    try {
      const searchTerm = lang === 'zh' ? zhToKo(term) : term
      const { items, total: t } = await searchArchive(searchTerm, catId, pg)
      if (pg === 1) {
        setResults(items)
      } else {
        setResults(prev => [...prev, ...items])
      }
      setTotal(t)
      setPage(pg)
    } catch {
      setResults(FALLBACK_ITEMS)
    }
    setLoading(false)
    setShowTrending(false)
  }, [lang])

  const handleSearch = (term) => {
    setQuery(term)
    setActiveCategory(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!term.trim()) {
      setShowTrending(true)
      setResults(FALLBACK_ITEMS)
      return
    }
    debounceRef.current = setTimeout(() => {
      loadContent(term, null)
    }, 500)
  }

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.id)
    setQuery('')
    setShowTrending(false)
    loadContent(L(lang, cat.searchTerm), cat.archiveCat)

    // 팝업 카테고리는 NearMap 팝업 레이어로 이동
    if (cat.id === 'popup' && setSubPage) {
      setSubPage('near-map')
      return
    }
  }

  const handleTrendingClick = (term) => {
    const t = L(lang, term)
    setQuery(t)
    setShowTrending(false)
    loadContent(t, null)
  }

  const handleLoadMore = () => {
    const searchTerm = lang === 'zh' ? zhToKo(query) : query
    const catId = activeCategory ? QUICK_CATEGORIES.find(c => c.id === activeCategory)?.archiveCat : null
    loadContent(searchTerm, catId, page + 1)
  }

  // 장소 클릭 → 카카오맵 검색으로 연결
  const handleItemClick = (item) => {
    if (item.url) {
      window.open(item.url, '_blank')
    } else {
      // 카카오맵에서 검색
      const searchName = item.title || item.tags?.[0] || ''
      window.open(`https://map.kakao.com/link/search/${encodeURIComponent(searchName)}`, '_blank')
    }
  }

  // 지도에서 보기
  const handleViewOnMap = (item) => {
    const searchName = item.title || item.tags?.[0] || ''
    window.open(`https://map.kakao.com/link/search/${encodeURIComponent(searchName)}`, '_blank')
  }

  const handleMeituClick = (cat) => {
    if (cat.tab && setTab) { setTab(cat.tab); return }
    if (cat.sub && setSubPage) { setSubPage(cat.sub); return }
    if (!cat.searchTerm) return
    setActiveCategory(cat.id)
    setQuery('')
    setShowTrending(false)
    loadContent(L(lang, cat.searchTerm), cat.archiveCat)
  }

  return (
    <div style={{ paddingBottom: 0 }}>
      {/* ─── 검색바 — 고정 상단 ─── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'white', padding: '12px 20px 10px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => !query && setShowTrending(true)}
            placeholder={L(lang, { ko: '맛집, 카페, K-POP, 명동...', zh: '搜索美食、咖啡、K-POP、明洞...', en: 'Search food, cafe, K-POP...' })}
            style={{
              width: '100%', padding: '10px 36px', borderRadius: 'var(--radius-pill)',
              background: 'var(--surface)', border: 'none', outline: 'none',
              fontSize: 14, color: 'var(--text-primary)', boxSizing: 'border-box',
            }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setShowTrending(true); setResults(FALLBACK_ITEMS); setActiveCategory(null) }}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={14} color="var(--text-muted)" />
            </button>
          )}
        </div>
      </div>

      {/* ─── 히어로 배너 ─── */}
      {showTrending && !query && (
        <div style={{ margin: '4px 20px 0', height: 160, borderRadius: 'var(--radius-card)', background: 'linear-gradient(135deg, #3182F6, #6BA8F8)', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>首尔弹窗情报站</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>发现最新限时快闪店 · 美食 · 美容</div>
        </div>
      )}

      {/* ─── 美团 스타일 카테고리 그리드 ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: '0 20px', margin: '20px 0 24px' }}>
        {MEITU_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id
          const Icon = cat.icon
          return (
            <button key={cat.id} onClick={() => handleMeituClick(cat)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 4px', cursor: 'pointer', borderRadius: 12, background: isActive ? 'var(--surface)' : 'transparent', border: 'none', transition: 'all 0.15s' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
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

      {/* ─── 인기 검색어 (검색창 포커스 시) ─── */}
      {showTrending && !query && (
        <div style={{ padding: '0 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TRENDING.map((tr, i) => (
              <button key={i} onClick={() => handleTrendingClick(tr)}
                style={{ padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--surface)', border: 'none', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}>
                {L(lang, tr)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── 섹션 헤더 ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: 12 }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
          {showTrending && !query
            ? L(lang, { ko: '인기 추천', zh: '热门推荐', en: 'Trending' })
            : total > 0 ? L(lang, { ko: `${total}건`, zh: `共${total}条`, en: `${total} results` })
            : L(lang, { ko: '검색 결과', zh: '搜索结果', en: 'Results' })}
        </span>
        <a href="https://archive.visitseoul.net" target="_blank" rel="noreferrer"
          style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          {L(lang, { ko: '더 보기', zh: '查看更多', en: 'More' })} <ChevronRight size={14} />
        </a>
      </div>

      {/* ─── 피드 그리드 (小红书 스타일 2열) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 20px' }}>
        {loading && results.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--surface)' }}>
              <div style={{ width: '100%', aspectRatio: '3/4' }} />
              <div style={{ padding: '10px 12px 14px' }}>
                <div style={{ height: 12, background: 'var(--border)', borderRadius: 6, marginBottom: 6 }} />
                <div style={{ height: 10, background: 'var(--border)', borderRadius: 6, width: '60%' }} />
              </div>
            </div>
          ))
        ) : (showTrending && !query ? FEED_DATA : results).map((item, idx) => {
          const isFeed = 'gradient' in item
          return (
            <div
              key={item.id}
              onClick={() => !isFeed && handleItemClick(item)}
              style={{
                borderRadius: 'var(--radius-card)', overflow: 'hidden',
                background: 'var(--card)', boxShadow: 'var(--shadow-card)',
                cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                animation: `fadeUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
                animationDelay: `${idx * 0.05}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
            >
              {/* 이미지 영역 */}
              <div style={{ width: '100%', aspectRatio: '3/4', background: isFeed ? item.gradient : (item.image ? 'none' : 'var(--surface)'), position: 'relative', overflow: 'hidden' }}>
                {!isFeed && item.image && (
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none' }} loading="lazy" />
                )}
                {/* 우상단 하트 */}
                <button
                  onClick={e => e.stopPropagation()}
                  style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={14} color="white" />
                </button>
                {/* 좌하단 태그 */}
                {(isFeed ? item.location || item.status : item.category) && (
                  <span style={{ position: 'absolute', bottom: 8, left: 8, padding: '3px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 11, backdropFilter: 'blur(4px)' }}>
                    {isFeed ? (item.status || item.location) : item.category}
                  </span>
                )}
              </div>
              {/* 텍스트 영역 */}
              <div style={{ padding: '10px 12px 14px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {isFeed ? item.location || 'NEAR' : (item.tags?.[0] ? `#${item.tags[0]}` : 'NEAR')}
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
      {!showTrending && results.length < total && results.length > 0 && (
        <div style={{ padding: '0 20px 20px' }}>
          <button onClick={handleLoadMore} disabled={loading}
            className="btn btn-outline"
            style={{ width: '100%' }}>
            {loading ? '...' : L(lang, { ko: '더보기', zh: '加载更多', en: 'Load More' })}
          </button>
        </div>
      )}
    </div>
  )
}
