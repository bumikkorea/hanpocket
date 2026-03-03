import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { Search, X, Clock, TrendingUp, ArrowRight, Compass, Grid3x3, BookOpen, Trash2 } from 'lucide-react'
import { pocketCategories, IMPLEMENTED_POCKETS } from '../data/pockets'
import { RECOMMENDED_COURSES } from '../data/recommendedCourses'

const ArrivalCardGuide = lazy(() => import('./guides/ArrivalCardGuide'))
const SimGuide = lazy(() => import('./guides/SimGuide'))
const TaxRefundGuide = lazy(() => import('./guides/TaxRefundGuide'))
const DutyFreeGuide = lazy(() => import('./guides/DutyFreeGuide'))

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

const POPULAR_SEARCHES = [
  { ko: '명동맛집', zh: '明洞美食', en: 'Myeongdong food' },
  { ko: '비자연장', zh: '签证延期', en: 'Visa extension' },
  { ko: '택스리펀드', zh: '退税', en: 'Tax refund' },
  { ko: '인천공항', zh: '仁川机场', en: 'Incheon Airport' },
  { ko: 'SOS', zh: 'SOS', en: 'SOS' },
  { ko: '한국어', zh: '韩语', en: 'Korean' },
  { ko: '쇼핑', zh: '购物', en: 'Shopping' },
  { ko: '환율', zh: '汇率', en: 'Exchange rate' },
  { ko: '병원', zh: '医院', en: 'Hospital' },
  { ko: '코스추천', zh: '路线推荐', en: 'Course picks' },
]

const GUIDES = [
  { id: 'arrival-card', name: { ko: '입국카드 작성법', zh: '入境卡填写指南', en: 'Arrival Card Guide' }, keywords: ['입국카드', '入境卡', 'arrival card', '기내', '飞机'] },
  { id: 'sim', name: { ko: 'SIM/eSIM 가이드', zh: 'SIM/eSIM购买指南', en: 'SIM/eSIM Guide' }, keywords: ['sim', 'esim', '유심', '통신', '와이파이', 'wifi', '网络', '手机卡'] },
  { id: 'tax-refund', name: { ko: '세금 환급 가이드', zh: '退税指南', en: 'Tax Refund Guide' }, keywords: ['세금', '환급', 'tax', 'refund', '退税', '택스리펀드'] },
  { id: 'duty-free', name: { ko: '면세 한도 & 액체류', zh: '免税限额 & 液体规定', en: 'Duty-Free & Liquids' }, keywords: ['면세', '액체', 'duty', 'free', '免税', '液体', '한도', '압수'] },
]

const STORAGE_KEY = 'hanpocket_recent_searches'

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}
function saveRecentSearch(term) {
  const list = getRecentSearches().filter(s => s !== term)
  list.unshift(term)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 10)))
}
function removeRecentSearch(term) {
  const list = getRecentSearches().filter(s => s !== term)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  return list
}
function clearAllRecent() {
  localStorage.removeItem(STORAGE_KEY)
  return []
}

export default function SearchTab({ lang, onNavigate }) {
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState(getRecentSearches)
  const [results, setResults] = useState(null)
  const [activeGuide, setActiveGuide] = useState(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const doSearch = useCallback((term) => {
    if (!term.trim()) { setResults(null); return }
    const q = term.toLowerCase()

    // 포켓 검색 (ko + zh + en)
    const matchedPockets = []
    pocketCategories.forEach(cat => {
      cat.pockets.forEach(p => {
        const text = [
          p.name?.ko, p.name?.zh, p.name?.en,
          p.description?.ko, p.description?.zh, p.description?.en,
        ].filter(Boolean).join(' ').toLowerCase()
        if (text.includes(q)) {
          matchedPockets.push({ ...p, implemented: IMPLEMENTED_POCKETS.has(p.id) })
        }
      })
    })

    // 코스 검색 (ko + zh + en + tags)
    const matchedCourses = RECOMMENDED_COURSES.filter(c => {
      const text = [
        c.name?.ko, c.name?.zh, c.name?.en,
        ...(c.tags || []),
      ].filter(Boolean).join(' ').toLowerCase()
      return text.includes(q)
    })

    // 가이드 검색
    const matchedGuides = GUIDES.filter(g => {
      const text = [g.name?.ko, g.name?.zh, g.name?.en, ...g.keywords].join(' ').toLowerCase()
      return text.includes(q)
    })

    setResults({ pockets: matchedPockets, courses: matchedCourses, guides: matchedGuides })
  }, [])

  // debounce 300ms 실시간 필터링
  const handleInputChange = (value) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    if (!value.trim()) { setResults(null); return }
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      saveRecentSearch(query.trim())
      setRecent(getRecentSearches())
      doSearch(query)
    }
  }

  const handleChipClick = (term) => {
    const text = typeof term === 'string' ? term : L(lang, term)
    setQuery(text)
    saveRecentSearch(text)
    setRecent(getRecentSearches())
    doSearch(text)
  }

  const handleRemoveRecent = (term, e) => {
    e.stopPropagation()
    setRecent(removeRecentSearch(term))
  }

  const handleClearAll = () => setRecent(clearAllRecent())

  const hasResults = results && (results.pockets.length > 0 || results.courses.length > 0 || results.guides.length > 0)
  const noResults = results && results.pockets.length === 0 && results.courses.length === 0 && results.guides.length === 0

  const placeholder = L(lang, { ko: '맛집, 비자, SOS 검색', zh: '搜索美食、签证、SOS', en: 'Search food, visa, SOS' })
  const suggestKeywords = [
    { ko: '맛집', zh: '美食', en: 'Food' },
    { ko: 'SIM카드', zh: 'SIM卡', en: 'SIM card' },
    { ko: '환급', zh: '退税', en: 'Tax refund' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* 가이드 오버레이 */}
      {activeGuide && (
        <Suspense fallback={null}>
          {activeGuide === 'arrival-card' && <ArrivalCardGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'sim' && <SimGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'tax-refund' && <TaxRefundGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'duty-free' && <DutyFreeGuide lang={lang} onClose={() => setActiveGuide(null)} />}
        </Suspense>
      )}

      {/* 검색 입력창 */}
      <form onSubmit={handleSubmit} className="sticky top-0 z-10 bg-white px-5 pt-2 pb-3">
        <div className="flex items-center gap-3 bg-[#F3F4F6] rounded-2xl px-4 py-3">
          <Search size={20} className="text-[#9CA3AF] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[15px] text-[#111827] placeholder-[#9CA3AF] outline-none"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults(null); inputRef.current?.focus() }}
              className="p-0.5 transition-all duration-200 active:scale-[0.9]">
              <X size={18} className="text-[#9CA3AF]" />
            </button>
          )}
        </div>
      </form>

      <div className="px-5 pb-32">
        {/* 검색 전 화면 */}
        {!results && (
          <div className="space-y-8 pt-2">
            <p className="text-center text-[#9CA3AF] text-sm pt-4">
              {L(lang, { ko: '무엇을 찾고 계세요?', zh: '您在找什么？', en: 'What are you looking for?' })}
            </p>

            {/* 인기 검색어 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[#111827]" />
                <h3 className="text-sm font-semibold text-[#111827]">
                  {L(lang, { ko: '인기 검색어', zh: '热门搜索', en: 'Popular' })}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term, i) => (
                  <button key={i} onClick={() => handleChipClick(term)}
                    className="bg-[#F3F4F6] rounded-full px-4 py-2 text-sm text-[#374151] transition-all duration-200 active:scale-[0.98] hover:bg-[#E5E7EB]">
                    {L(lang, term)}
                  </button>
                ))}
              </div>
            </div>

            {/* 최근 검색어 */}
            {recent.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#111827]" />
                    <h3 className="text-sm font-semibold text-[#111827]">
                      {L(lang, { ko: '최근 검색어', zh: '最近搜索', en: 'Recent' })}
                    </h3>
                  </div>
                  <button onClick={handleClearAll} className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                    <Trash2 size={12} />
                    {L(lang, { ko: '전체 삭제', zh: '全部删除', en: 'Clear all' })}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((term, i) => (
                    <button key={i} onClick={() => handleChipClick(term)}
                      className="flex items-center gap-1.5 bg-[#F3F4F6] rounded-full pl-4 pr-2 py-2 text-sm text-[#374151] transition-all duration-200 active:scale-[0.98] hover:bg-[#E5E7EB]">
                      <span>{term}</span>
                      <span onClick={(e) => handleRemoveRecent(term, e)}
                        className="p-0.5 rounded-full hover:bg-[#D1D5DB] transition-colors">
                        <X size={14} className="text-[#9CA3AF]" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 검색 결과 */}
        {hasResults && (
          <div className="space-y-6 pt-2">
            {/* 서비스 (포켓) 결과 */}
            {results.pockets.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Grid3x3 size={16} className="text-[#111827]" />
                  <h3 className="text-sm font-semibold text-[#111827]">
                    {L(lang, { ko: '서비스', zh: '服务', en: 'Services' })}
                  </h3>
                </div>
                <div className="space-y-2">
                  {results.pockets.map(p => (
                    <button key={p.id}
                      onClick={() => p.implemented && onNavigate(p.id)}
                      disabled={!p.implemented}
                      className={`w-full rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-3 text-left transition-all duration-200 ${p.implemented ? 'active:scale-[0.98] hover:border-[#D1D5DB]' : 'opacity-50 cursor-default'}`}>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-[#111827]">{L(lang, p.name)}</span>
                        <p className="text-xs text-[#6B7280] mt-0.5">{L(lang, p.description)}</p>
                      </div>
                      {p.implemented && <ArrowRight size={16} className="text-[#9CA3AF] shrink-0" />}
                      {!p.implemented && <span className="text-[10px] text-red-500 font-medium shrink-0">{L(lang, { ko: '(업데이트중)', zh: '(更新中)', en: '(Updating)' })}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 코스 결과 */}
            {results.courses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Compass size={16} className="text-[#111827]" />
                  <h3 className="text-sm font-semibold text-[#111827]">
                    {L(lang, { ko: '코스', zh: '路线', en: 'Courses' })}
                  </h3>
                </div>
                <div className="space-y-2">
                  {results.courses.map(c => (
                    <button key={c.id}
                      onClick={() => onNavigate('course')}
                      className="w-full rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-3 text-left transition-all duration-200 active:scale-[0.98] hover:border-[#D1D5DB]">
                      <span className="text-2xl">{c.coverEmoji}</span>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-[#111827]">{L(lang, c.name)}</span>
                        <p className="text-xs text-[#6B7280] mt-0.5">{L(lang, c.description)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-[#9CA3AF]">{c.duration}</span>
                          <span className="text-[11px] text-[#9CA3AF]">·</span>
                          <span className="text-[11px] text-[#9CA3AF]">{L(lang, c.estimatedCost)}</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-[#9CA3AF] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 가이드 결과 */}
            {results.guides.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={16} className="text-[#111827]" />
                  <h3 className="text-sm font-semibold text-[#111827]">
                    {L(lang, { ko: '가이드', zh: '指南', en: 'Guides' })}
                  </h3>
                </div>
                <div className="space-y-2">
                  {results.guides.map(g => (
                    <button key={g.id}
                      onClick={() => setActiveGuide(g.id)}
                      className="w-full rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-3 text-left transition-all duration-200 active:scale-[0.98] hover:border-[#D1D5DB]">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-[#111827]">{L(lang, g.name)}</span>
                      </div>
                      <ArrowRight size={16} className="text-[#9CA3AF] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 빈 결과 */}
        {noResults && (
          <div className="flex flex-col items-center justify-center py-20">
            <Search size={48} className="text-[#E5E7EB] mb-4" />
            <p className="text-sm text-[#9CA3AF] mb-4">
              {L(lang, { ko: '검색 결과가 없습니다. 다른 키워드로 검색해보세요.', zh: '没有搜索结果，请尝试其他关键词。', en: 'No results found. Try different keywords.' })}
            </p>
            <div className="flex gap-2">
              {suggestKeywords.map((kw, i) => (
                <button key={i} onClick={() => handleChipClick(kw)}
                  className="bg-[#F3F4F6] rounded-full px-3 py-1.5 text-xs text-[#374151] active:scale-[0.98] transition-all">
                  {L(lang, kw)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
