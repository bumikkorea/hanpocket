/**
 * TourSpotSection — 재사용 가능한 TourAPI 관광지/음식점/쇼핑 카드 섹션
 * 여행탭, 맛집탭, 쇼핑탭, 한류탭 등에서 사용
 */
import { useState, useEffect } from 'react'
import { MapPin, ChevronRight, Loader2, Search, Navigation, Filter, Star } from 'lucide-react'
import { getAreaBasedList, getLocationBasedList, searchKeyword, searchFestival, searchStay } from '../api/tourApi'
import { CONTENT_TYPES, AREA_CODES, POPULAR_AREAS } from '../data/tourApiCodes'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

/** 관광지 카드 */
export function SpotCard({ item, lang, darkMode, onClick }) {
  return (
    <div
      onClick={() => onClick?.(item)}
      className={`rounded-xl overflow-hidden cursor-pointer transition-transform active:scale-[0.98] ${
        darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-100'
      } shadow-sm`}
    >
      {item.firstimage ? (
        <img
          src={item.firstimage}
          alt={item.title}
          className="w-full h-36 object-cover"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      ) : (
        <div className={`w-full h-36 flex items-center justify-center ${darkMode ? 'bg-zinc-700' : 'bg-gray-100'}`}>
          <MapPin size={24} className="text-gray-400" />
        </div>
      )}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
        {item.addr1 && (
          <p className="text-xs opacity-60 mt-1 line-clamp-1 flex items-center gap-1">
            <MapPin size={10} /> {item.addr1}
          </p>
        )}
        {item.dist && (
          <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
            <Navigation size={10} />
            {Number(item.dist) < 1000 ? `${Math.round(item.dist)}m` : `${(item.dist / 1000).toFixed(1)}km`}
          </p>
        )}
      </div>
    </div>
  )
}

/** 횡스크롤 카드 리스트 */
export function HorizontalSpotList({ items, lang, darkMode, onItemClick }) {
  if (!items?.length) return null
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {items.map((item, i) => (
        <div key={item.contentid || i} className="min-w-[200px] max-w-[200px]">
          <SpotCard item={item} lang={lang} darkMode={darkMode} onClick={onItemClick} />
        </div>
      ))}
    </div>
  )
}

/** 지역 필터 칩 */
export function AreaFilter({ selected, onChange, lang, darkMode }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
          !selected
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {L(lang, { ko: '전체', zh: '全部', en: 'All' })}
      </button>
      {POPULAR_AREAS.map(code => (
        <button
          key={code}
          onClick={() => onChange(code)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
            selected === code
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {L(lang, AREA_CODES[code])}
        </button>
      ))}
    </div>
  )
}

/** ContentType 필터 칩 */
export function TypeFilter({ types = [76, 78, 82, 79, 85, 80, 75], selected, onChange, lang, darkMode }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
          !selected
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {L(lang, { ko: '전체', zh: '全部', en: 'All' })}
      </button>
      {types.map(tid => (
        <button
          key={tid}
          onClick={() => onChange(tid)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
            selected === tid
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {L(lang, CONTENT_TYPES[tid])}
        </button>
      ))}
    </div>
  )
}

/**
 * 통합 발견(Discover) 섹션
 * - 검색, 지역필터, 타입필터, 주변 관광지, 결과 그리드
 */
export default function TourSpotSection({ lang = 'zh', darkMode, onItemClick, defaultType, showSearch = true, showTypeFilter = true, title }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [areaCode, setAreaCode] = useState(null)
  const [typeId, setTypeId] = useState(defaultType || null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [nearbyItems, setNearbyItems] = useState([])
  const [gps, setGps] = useState(null)

  // Get GPS
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setGps({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  // Fetch nearby
  useEffect(() => {
    if (!gps) return
    getLocationBasedList({
      mapX: gps.lng, mapY: gps.lat, radius: 5000,
      contentTypeId: defaultType || undefined, numOfRows: 10, arrange: 'E',
    }).then(r => setNearbyItems(r.items || []))
  }, [gps, defaultType])

  // Fetch list
  useEffect(() => {
    setLoading(true)
    const params = {
      numOfRows: 20, pageNo: page, arrange: 'R',
      areaCode: areaCode || undefined,
      contentTypeId: typeId || undefined,
    }

    const fetcher = query.length >= 2
      ? searchKeyword(query, params)
      : getAreaBasedList(params)

    fetcher
      .then(r => { setItems(r.items || []); setTotal(r.totalCount || 0) })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [areaCode, typeId, page, query])

  const sectionTitle = title || L(lang, { ko: '발견', zh: '发现', en: 'Discover' })

  return (
    <div className="space-y-4">
      {/* Section title */}
      <h2 className="text-lg font-bold">{sectionTitle}</h2>

      {/* Search */}
      {showSearch && (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${
          darkMode ? 'bg-zinc-800' : 'bg-gray-100'
        }`}>
          <Search size={16} className="opacity-40" />
          <input
            type="text"
            placeholder={L(lang, { ko: '관광지, 맛집, 쇼핑...', zh: '搜索景点、美食、购物...', en: 'Search spots, food, shops...' })}
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      )}

      {/* Filters */}
      <AreaFilter selected={areaCode} onChange={v => { setAreaCode(v); setPage(1) }} lang={lang} darkMode={darkMode} />
      {showTypeFilter && (
        <TypeFilter selected={typeId} onChange={v => { setTypeId(v); setPage(1) }} lang={lang} darkMode={darkMode} />
      )}

      {/* Nearby */}
      {nearbyItems.length > 0 && !query && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <Navigation size={14} className="text-blue-500" />
            {L(lang, { ko: '내 주변', zh: '我附近', en: 'Nearby' })}
          </h3>
          <HorizontalSpotList items={nearbyItems} lang={lang} darkMode={darkMode} onItemClick={onItemClick} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* Grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, i) => (
            <SpotCard key={item.contentid || i} item={item} lang={lang} darkMode={darkMode} onClick={onItemClick} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="text-center py-8 text-sm opacity-50">
          {L(lang, { ko: '결과가 없습니다', zh: '暂无结果', en: 'No results' })}
        </div>
      )}

      {/* Load more */}
      {!loading && items.length > 0 && items.length < total && (
        <button
          onClick={() => setPage(p => p + 1)}
          className={`w-full py-2.5 rounded-xl text-sm font-medium ${
            darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {L(lang, { ko: '더보기', zh: '加载更多', en: 'Load More' })} ({items.length}/{total})
        </button>
      )}
    </div>
  )
}
