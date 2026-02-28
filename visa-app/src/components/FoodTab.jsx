import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
import { Search, MapPin, Star, ChevronDown, ArrowUpDown, ExternalLink, Award, Filter, Navigation, Loader2 } from 'lucide-react'
import { MICHELIN_RESTAURANTS, BLUE_RIBBON_RESTAURANTS, FOOD_CATEGORIES, LOCATION_FILTERS, LOCATION_HIERARCHY } from '../data/restaurantData'
import { trackSearch, trackEvent } from '../utils/analytics'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

const AWARD_LABELS = {
  michelin3: { ko: '3 Stars', zh: '3 Stars', en: '3 Stars', stars: 3 },
  michelin2: { ko: '2 Stars', zh: '2 Stars', en: '2 Stars', stars: 2 },
  michelin1: { ko: '1 Star', zh: '1 Star', en: '1 Star', stars: 1 },
  bib: { ko: 'Bib Gourmand', zh: 'Bib Gourmand', en: 'Bib Gourmand', stars: 0 },
  blueribbon: { ko: 'Blue Ribbon', zh: 'Blue Ribbon', en: 'Blue Ribbon', stars: 0 },
}

const PAGE_SIZE = 20

export default function FoodTab({ lang }) {
  const [tab, setTab] = useState('all') // 'michelin' | 'blueribbon' | 'all'
  const [search, setSearch] = useState('')
  const [selectedSi, setSelectedSi] = useState('') // 시 (서울특별시, 부산광역시, 경기도 등)
  const [selectedGu, setSelectedGu] = useState('') // 구
  const [selectedDong, setSelectedDong] = useState('') // 동
  const [cuisine, setCuisine] = useState('all')
  const [sortBy, setSortBy] = useState('name') // 'name' | 'location' | 'award'
  const [shown, setShown] = useState(PAGE_SIZE)

  const allRestaurants = useMemo(() => [...MICHELIN_RESTAURANTS, ...BLUE_RIBBON_RESTAURANTS], [])

  const sourceList = tab === 'michelin' ? MICHELIN_RESTAURANTS
    : tab === 'blueribbon' ? BLUE_RIBBON_RESTAURANTS
    : allRestaurants

  // Get available districts for selected city
  const gusForSi = selectedSi ? Object.keys(LOCATION_HIERARCHY[selectedSi] || {}) : []
  
  // Get available neighborhoods for selected district
  const dongsForGu = selectedSi && selectedGu ? (LOCATION_HIERARCHY[selectedSi]?.[selectedGu] || []) : []

  // Helper function to match city names (handle legacy data format)
  const matchesCity = (restaurant, targetSi) => {
    if (!targetSi) return true
    const city = restaurant.area.city
    
    // Map legacy city names to new format
    const cityMapping = {
      '서울': '서울특별시',
      '부산': '부산광역시', 
      '제주': '제주특별자치도'
    }
    
    const mappedCity = cityMapping[city] || city
    return mappedCity === targetSi
  }

  const filtered = useMemo(() => {
    let list = [...sourceList]
    
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(r =>
        r.name.ko.toLowerCase().includes(q) ||
        r.name.en.toLowerCase().includes(q) ||
        r.name.zh.toLowerCase().includes(q)
      )
    }
    
    if (selectedSi) list = list.filter(r => matchesCity(r, selectedSi))
    if (selectedGu) list = list.filter(r => r.area.gu === selectedGu)
    if (selectedDong) list = list.filter(r => r.area.dong === selectedDong)
    if (cuisine !== 'all') list = list.filter(r => r.cuisine === cuisine)

    list.sort((a, b) => {
      if (sortBy === 'name') return L(lang, a.name).localeCompare(L(lang, b.name), lang === 'zh' ? 'zh' : lang === 'ko' ? 'ko' : 'en')
      if (sortBy === 'location') return (a.area.city + a.area.gu).localeCompare(b.area.city + b.area.gu, 'ko')
      // award
      const order = { michelin3: 0, michelin2: 1, michelin1: 2, bib: 3, blueribbon: 4 }
      return (order[a.award] ?? 9) - (order[b.award] ?? 9)
    })
    return list
  }, [sourceList, search, selectedSi, selectedGu, selectedDong, cuisine, sortBy, lang])

  const visible = filtered.slice(0, shown)
  const hasMore = shown < filtered.length

  function renderBadge(r) {
    const info = AWARD_LABELS[r.award]
    if (!info) return null
    if (r.award === 'blueribbon') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
          <Award size={12} />
          {Array.from({ length: r.awardCount }, (_, i) => (
            <Star key={i} size={10} className="fill-blue-500 text-blue-500" />
          ))}
        </span>
      )
    }
    if (info.stars > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
          {Array.from({ length: info.stars }, (_, i) => (
            <Star key={i} size={10} className="fill-amber-500 text-amber-500" />
          ))}
        </span>
      )
    }
    // bib gourmand
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
        Bib Gourmand
      </span>
    )
  }

  const michelinCount = MICHELIN_RESTAURANTS.length
  const blueCount = BLUE_RIBBON_RESTAURANTS.length

  return (
    <div className="space-y-4">
      {/* Header count */}
      <div className="flex items-center gap-3 text-xs text-[#6B7280]">
        <span className="font-semibold text-amber-600">{michelinCount}{lang === 'ko' ? '개' : ''} {lang === 'ko' ? '미슐랭' : lang === 'zh' ? '米其林' : 'Michelin'}</span>
        <span>|</span>
        <span className="font-semibold text-blue-600">{blueCount}{lang === 'ko' ? '개' : ''} {lang === 'ko' ? '블루리본' : lang === 'zh' ? '蓝带' : 'Blue Ribbon'}</span>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: { ko: '전체', zh: '全部', en: 'All' } },
          { id: 'michelin', label: { ko: '미슐랭', zh: '米其林', en: 'Michelin' } },
          { id: 'blueribbon', label: { ko: '블루리본', zh: '蓝带', en: 'Blue Ribbon' } },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { 
              setTab(t.id)
              setSelectedSi('')
              setSelectedGu('')
              setSelectedDong('')
              setShown(PAGE_SIZE)
              
              // 맛집 탭 전환 이벤트 추적
              trackEvent('restaurant_tab_switch', {
                tab: t.id,
                event_category: 'restaurant_search',
                event_label: `switch_to_${t.id}`
              })
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              tab === t.id
                ? 'bg-[#111827] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}
          >
            {L(lang, t.label)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={search}
          onChange={e => { 
            const value = e.target.value
            setSearch(value)
            setShown(PAGE_SIZE)
            
            // 검색 이벤트 추적 (3글자 이상일 때만)
            if (value.trim().length >= 3) {
              trackSearch(value.trim(), 'restaurant', 0) // results_count는 나중에 업데이트됨
            }
          }}
          placeholder={lang === 'ko' ? '레스토랑 검색...' : lang === 'zh' ? '搜索餐厅...' : 'Search restaurants...'}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#111827] hover:border-[#9CA3AF] transition-colors text-[#111827] placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        {/* 시/도 (Level 1) */}
        <div className="relative">
          <select
            value={selectedSi}
            onChange={e => { 
              const value = e.target.value
              setSelectedSi(value)
              setSelectedGu('')
              setSelectedDong('')
              setShown(PAGE_SIZE)
              
              // 지역 필터 변경 이벤트 추적
              if (value) {
                trackEvent('restaurant_location_filter', {
                  filter_type: 'si',
                  filter_value: value,
                  event_category: 'restaurant_search',
                  event_label: `filter_si_${value}`
                })
              }
            }}
            className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none hover:border-[#9CA3AF] focus:border-[#111827] transition-colors"
          >
            <option value="">{lang === 'ko' ? '시/도 전체' : lang === 'zh' ? '全部省市' : 'All Regions'}</option>
            {Object.keys(LOCATION_HIERARCHY).map(si => (
              <option key={si} value={si}>{si}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>

        {/* 구/군 (Level 2) */}
        {selectedSi && gusForSi.length > 0 && (
          <div className="relative">
            <select
              value={selectedGu}
              onChange={e => { 
                const value = e.target.value
                setSelectedGu(value)
                setSelectedDong('')
                setShown(PAGE_SIZE)
                
                // 구/군 필터 변경 이벤트 추적
                if (value) {
                  trackEvent('restaurant_location_filter', {
                    filter_type: 'gu',
                    filter_value: value,
                    parent_si: selectedSi,
                    event_category: 'restaurant_search',
                    event_label: `filter_gu_${value}`
                  })
                }
              }}
              className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none hover:border-[#9CA3AF] focus:border-[#111827] transition-colors"
            >
              <option value="">{lang === 'ko' ? '구/군 전체' : lang === 'zh' ? '全部区县' : 'All Districts'}</option>
              {gusForSi.map(gu => (
                <option key={gu} value={gu}>{gu}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          </div>
        )}

        {/* 동/읍/면 (Level 3) */}
        {selectedSi && selectedGu && dongsForGu.length > 0 && (
          <div className="relative">
            <select
              value={selectedDong}
              onChange={e => { 
                const value = e.target.value
                setSelectedDong(value)
                setShown(PAGE_SIZE)
                
                // 동 필터 변경 이벤트 추적
                if (value) {
                  trackEvent('restaurant_location_filter', {
                    filter_type: 'dong',
                    filter_value: value,
                    parent_si: selectedSi,
                    parent_gu: selectedGu,
                    event_category: 'restaurant_search',
                    event_label: `filter_dong_${value}`
                  })
                }
              }}
              className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none hover:border-[#9CA3AF] focus:border-[#111827] transition-colors"
            >
              <option value="">{lang === 'ko' ? '동/읍/면 전체' : lang === 'zh' ? '全部街道' : 'All Areas'}</option>
              {dongsForGu.map(dong => (
                <option key={dong} value={dong}>{dong}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          </div>
        )}

        {/* Cuisine */}
        <div className="relative">
          <select
            value={cuisine}
            onChange={e => { setCuisine(e.target.value); setShown(PAGE_SIZE) }}
            className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none hover:border-[#9CA3AF] focus:border-[#111827] transition-colors"
          >
            {FOOD_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{L(lang, c.label)}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none hover:border-[#9CA3AF] focus:border-[#111827] transition-colors"
          >
            <option value="name">{lang === 'ko' ? '이름순' : lang === 'zh' ? '按名称' : 'By Name'}</option>
            <option value="location">{lang === 'ko' ? '지역순' : lang === 'zh' ? '按地区' : 'By Location'}</option>
            <option value="award">{lang === 'ko' ? '등급순' : lang === 'zh' ? '按等级' : 'By Award'}</option>
          </select>
          <ArrowUpDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-[#9CA3AF]">
        {filtered.length}{lang === 'ko' ? '개 결과' : lang === 'zh' ? ' 个结果' : ' results'}
      </p>

      {/* Cards */}
      <div className="space-y-3">
        {visible.map(r => (
          <div key={r.id} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-bold text-[#111827]">{L(lang, r.name)}</h3>
                  {renderBadge(r)}
                </div>
                {lang !== 'ko' && (
                  <p className="text-xs text-[#9CA3AF] mb-1">{r.name.ko}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-[#6B7280] mb-1">
                  <MapPin size={12} className="shrink-0" />
                  <span>{r.area.city} {r.area.gu}{r.area.dong ? ' ' + r.area.dong : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                  <span>{L(lang, FOOD_CATEGORIES.find(c => c.id === r.cuisine)?.label || { ko: r.cuisine })}</span>
                  <span>{'$'.repeat(r.priceRange)}</span>
                </div>
              </div>
              <a
                href={r.naverMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] px-3 py-2 rounded-lg transition-colors"
              >
                <MapPin size={12} />
                {lang === 'ko' ? '지도' : lang === 'zh' ? '地图' : 'Map'}
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => setShown(s => s + PAGE_SIZE)}
          className="w-full py-3 text-sm font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-xl transition-colors"
        >
          {lang === 'ko' ? '더보기' : lang === 'zh' ? '加载更多' : 'Load More'} ({filtered.length - shown}{lang === 'ko' ? '개 남음' : lang === 'zh' ? ' 剩余' : ' remaining'})
        </button>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-[#9CA3AF]">
          {lang === 'ko' ? '검색 결과가 없습니다' : lang === 'zh' ? '没有搜索结果' : 'No results found'}
        </div>
      )}

      {/* TourAPI 맛집 더보기 */}
      <TourApiFoodSection lang={lang} />
    </div>
  )
}

/** TourAPI 음식점 섹션 */
const TourDetailModal = lazy(() => import('./TourDetailModal'))

function TourApiFoodSection({ lang }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailItem, setDetailItem] = useState(null)
  const [gps, setGps] = useState(null)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setGps({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {
        // No GPS: fetch by area (Seoul)
        import('../api/tourApi').then(({ getAreaBasedList }) => {
          getAreaBasedList({ contentTypeId: 82, areaCode: 1, numOfRows: 10, arrange: 'R' })
            .then(r => setItems(r.items || []))
            .finally(() => setLoading(false))
        })
      },
      { timeout: 5000 }
    )
  }, [])

  useEffect(() => {
    if (!gps) return
    import('../api/tourApi').then(({ getLocationBasedList }) => {
      getLocationBasedList({ mapX: gps.lng, mapY: gps.lat, radius: 3000, contentTypeId: 82, numOfRows: 10, arrange: 'E' })
        .then(r => setItems(r.items || []))
        .finally(() => setLoading(false))
    })
  }, [gps])

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
        <Navigation size={14} className="text-blue-500" />
        {L(lang, { ko: '맛집 더보기', zh: '更多美食', en: 'More Restaurants' })}
        <span className="text-xs font-normal text-[#9CA3AF] ml-1">
          {L(lang, { ko: '한국관광공사', zh: '韩国观光公社', en: 'KTO' })}
        </span>
      </h3>

      {loading && <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-blue-500" /></div>}

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item, i) => (
          <div
            key={item.contentid || i}
            onClick={() => setDetailItem(item)}
            className="min-w-[180px] max-w-[180px] rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm cursor-pointer"
          >
            {item.firstimage ? (
              <img src={item.firstimage} alt={item.title} className="w-full h-28 object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-28 bg-gray-100 flex items-center justify-center"><MapPin size={20} className="text-gray-400" /></div>
            )}
            <div className="p-2.5">
              <h4 className="text-xs font-semibold line-clamp-1">{item.title}</h4>
              {item.addr1 && <p className="text-[10px] text-[#9CA3AF] mt-0.5 line-clamp-1">{item.addr1}</p>}
              {item.dist && <p className="text-[10px] text-blue-500 mt-0.5">{Number(item.dist) < 1000 ? `${Math.round(item.dist)}m` : `${(item.dist/1000).toFixed(1)}km`}</p>}
            </div>
          </div>
        ))}
      </div>

      {detailItem && (
        <Suspense fallback={null}>
          <TourDetailModal item={detailItem} lang={lang} darkMode={false} onClose={() => setDetailItem(null)} />
        </Suspense>
      )}
    </div>
  )
}
