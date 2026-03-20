/**
 * 🔍 발견 탭 — Visit Seoul 아카이브 검색 + 스마트 카테고리
 * 중국 여성 관광객이 1~3터치로 원하는 장소를 찾는 핵심 탭
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, MapPin, ExternalLink, ChevronRight } from 'lucide-react'

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

  return (
    <div className="pb-0 animate-fade-up">
      {/* 검색바 — 고정 상단 */}
      <div className="sticky top-0 z-20 bg-white px-4 pt-3 pb-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--y2k-text-sub)]" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => !query && setShowTrending(true)}
            placeholder={L(lang, { ko: '맛집, 카페, K-POP, 명동...', zh: '搜索美食、咖啡、K-POP、明洞...', en: 'Search food, cafe, K-POP, Myeongdong...' })}
            className="w-full pl-10 pr-10 py-3 rounded-[20px] bg-white text-[14px] text-[var(--y2k-text)] placeholder:text-[var(--y2k-text-sub)] outline-none focus:ring-2 focus:ring-[var(--y2k-lavender)]/30"
            style={{ boxShadow: '0 4px 16px rgba(255,133,179,0.08)' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setShowTrending(true); setResults(FALLBACK_ITEMS); setActiveCategory(null) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              <X size={16} className="text-[var(--y2k-text-sub)]" />
            </button>
          )}
        </div>
      </div>

      {/* 1터치 카테고리 그리드 */}
      <div className="px-4 pt-2 pb-1">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id
            return (
              <button key={cat.id} onClick={() => handleCategoryClick(cat)}
                className="flex items-center justify-center py-2 rounded-full transition-all active:scale-95"
                style={{ background: isActive ? 'linear-gradient(135deg, var(--y2k-pink), var(--y2k-lavender))' : '#FFF', boxShadow: isActive ? '0 4px 16px rgba(255,133,179,0.2)' : '0 4px 16px rgba(255,133,179,0.08)' }}>
                <span className="text-[11px] font-medium" style={{ color: isActive ? '#FFF' : 'var(--y2k-text-sub)' }}>
                  {L(lang, cat.label)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 인기 검색어 — 검색창 포커스 시 */}
      {showTrending && !query && (
        <div className="px-4 pt-3">
          <p className="text-[12px] font-bold text-[var(--y2k-text)] mb-2">
            🔥 {L(lang, { ko: '지금 인기 검색어', zh: '热门搜索', en: 'Trending Searches' })}
          </p>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map((t, i) => (
              <button key={i} onClick={() => handleTrendingClick(t)}
                className="px-3 py-1.5 rounded-full bg-white text-[12px] text-[var(--y2k-text-sub)] font-medium active:bg-[var(--y2k-bg)] transition-colors"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {L(lang, t)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 검색 결과 / 콘텐츠 그리드 */}
      <div className="px-4 pt-3">
        {loading && results.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#C4725A] rounded-full" />
          </div>
        ) : (
          <>
            {total > 0 && !showTrending && (
              <p className="text-[11px] text-[var(--y2k-text-sub)] mb-2">
                {L(lang, { ko: `${total}건의 결과`, zh: `共${total}条结果`, en: `${total} results` })}
              </p>
            )}

            {/* 이미지 그리드 (2열) */}
            <div className="grid grid-cols-2 gap-2.5">
              {results.map(item => (
                <div key={item.id} className="bg-white rounded-[20px] overflow-hidden active:scale-95 transition-all hover:-translate-y-1"
                  style={{ boxShadow: '0 4px 20px rgba(255,133,179,0.08)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,133,179,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,133,179,0.08)'}>
                  {/* 이미지 */}
                  <button onClick={() => handleItemClick(item)} className="w-full text-left">
                    <div className="w-full aspect-[4/3] bg-[var(--y2k-bg)] relative overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none' }}
                          loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">📷</div>
                      )}
                      {item.category && (
                        <span className="absolute top-2 left-2 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-[13px] font-bold text-[var(--y2k-text)] line-clamp-1">{item.title}</p>
                      {item.tags?.length > 0 && (
                        <p className="text-[11px] text-[var(--y2k-text-sub)] mt-0.5 line-clamp-1 font-medium">
                          {item.tags.map(t => `#${t}`).join(' ')}
                        </p>
                      )}
                    </div>
                  </button>
                  {/* 지도 버튼 */}
                  <div className="px-2.5 pb-2">
                    <button onClick={() => handleViewOnMap(item)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#FEE500] text-[10px] font-bold text-[var(--y2k-text)] active:scale-95 transition-transform">
                      <MapPin size={12} /> {L(lang, { ko: '지도', zh: '地图', en: 'Map' })}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 더보기 */}
            {results.length < total && results.length > 0 && (
              <button onClick={handleLoadMore}
                disabled={loading}
                className="w-full mt-4 py-3 rounded-[20px] bg-white text-[13px] font-medium text-[var(--y2k-text-sub)] active:bg-[var(--y2k-bg)] transition-colors"
                style={{ boxShadow: '0 4px 16px rgba(255,133,179,0.08)' }}>
                {loading ? '...' : L(lang, { ko: '더보기', zh: '加载更多', en: 'Load More' })}
              </button>
            )}
          </>
        )}
      </div>

      {/* Visit Seoul 아카이브 원본 링크 */}
      <div className="px-4 mt-4">
        <a href="https://archive.visitseoul.net" target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[var(--y2k-bg)] text-[11px] text-[var(--y2k-text-sub)] font-medium">
          <ExternalLink size={12} />
          {L(lang, { ko: 'Visit Seoul 아카이브에서 더 보기', zh: '在Visit Seoul存档查看更多', en: 'Browse Visit Seoul Archive' })}
        </a>
      </div>
    </div>
  )
}
