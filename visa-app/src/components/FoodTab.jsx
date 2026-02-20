import { useState, useMemo } from 'react'
import { Search, MapPin, Star, ChevronDown, ArrowUpDown, ExternalLink, Award, Filter } from 'lucide-react'
import { MICHELIN_RESTAURANTS, BLUE_RIBBON_RESTAURANTS, FOOD_CATEGORIES, LOCATION_FILTERS } from '../data/restaurantData'

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
  const [city, setCity] = useState('')
  const [gu, setGu] = useState('')
  const [cuisine, setCuisine] = useState('all')
  const [sortBy, setSortBy] = useState('name') // 'name' | 'location' | 'award'
  const [shown, setShown] = useState(PAGE_SIZE)

  const allRestaurants = useMemo(() => [...MICHELIN_RESTAURANTS, ...BLUE_RIBBON_RESTAURANTS], [])

  const sourceList = tab === 'michelin' ? MICHELIN_RESTAURANTS
    : tab === 'blueribbon' ? BLUE_RIBBON_RESTAURANTS
    : allRestaurants

  const gusForCity = city ? (LOCATION_FILTERS.find(f => f.city === city)?.gus || []) : []

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
    if (city) list = list.filter(r => r.area.city === city)
    if (gu) list = list.filter(r => r.area.gu === gu)
    if (cuisine !== 'all') list = list.filter(r => r.cuisine === cuisine)

    list.sort((a, b) => {
      if (sortBy === 'name') return L(lang, a.name).localeCompare(L(lang, b.name), lang === 'zh' ? 'zh' : lang === 'ko' ? 'ko' : 'en')
      if (sortBy === 'location') return (a.area.city + a.area.gu).localeCompare(b.area.city + b.area.gu, 'ko')
      // award
      const order = { michelin3: 0, michelin2: 1, michelin1: 2, bib: 3, blueribbon: 4 }
      return (order[a.award] ?? 9) - (order[b.award] ?? 9)
    })
    return list
  }, [sourceList, search, city, gu, cuisine, sortBy, lang])

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
            onClick={() => { setTab(t.id); setShown(PAGE_SIZE) }}
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
          onChange={e => { setSearch(e.target.value); setShown(PAGE_SIZE) }}
          placeholder={lang === 'ko' ? '레스토랑 검색...' : lang === 'zh' ? '搜索餐厅...' : 'Search restaurants...'}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#111827] text-[#111827] placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        {/* City */}
        <div className="relative">
          <select
            value={city}
            onChange={e => { setCity(e.target.value); setGu(''); setShown(PAGE_SIZE) }}
            className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none"
          >
            <option value="">{lang === 'ko' ? '도시 전체' : lang === 'zh' ? '全部城市' : 'All Cities'}</option>
            {LOCATION_FILTERS.map(f => (
              <option key={f.city} value={f.city}>{f.city}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>

        {/* Gu */}
        {city && gusForCity.length > 0 && (
          <div className="relative">
            <select
              value={gu}
              onChange={e => { setGu(e.target.value); setShown(PAGE_SIZE) }}
              className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none"
            >
              <option value="">{lang === 'ko' ? '구 전체' : lang === 'zh' ? '全部区' : 'All Districts'}</option>
              {gusForCity.map(g => (
                <option key={g} value={g}>{g}</option>
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
            className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none"
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
            className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none"
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
    </div>
  )
}
