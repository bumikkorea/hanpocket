import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { visaTypes } from '../../data/visaData'
import { t } from '../../data/i18n'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

function SearchBar({ query, setQuery, lang }) {
  return (
    <div className="relative">
      <input 
        type="text" 
        placeholder={t[lang].search} 
        value={query} 
        onChange={e => setQuery(e.target.value)}
        className="w-full glass rounded-lg px-5 py-3.5 pl-11 text-sm border-0 focus:ring-2 focus:ring-[#111827]/30 outline-none transition-all placeholder:text-[#9CA3AF]" 
      />
      <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#9CA3AF]" />
    </div>
  )
}

function SearchResults({ query, region, onSelectVisa, lang }) {
  const s = t[lang]
  const q = query.toLowerCase()
  const results = visaTypes.filter(v => {
    const nm = L('ko',v.name) + L('zh',v.name) + L('en',v.name)
    const sm = L('ko',v.summary) + L('zh',v.summary) + L('en',v.summary)
    const m = v.code.toLowerCase().includes(q) || 
             nm.toLowerCase().includes(q) || 
             sm.toLowerCase().includes(q) || 
             v.tags?.some(t => t.toLowerCase().includes(q))
    return m && (region === 'mainland' ? v.forMainland : v.forHkMoTw)
  })

  if (!results.length) {
    return <div className="text-center text-[#6B7280] py-12">{s.noResults}</div>
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-[#6B7280]">{results.length} {s.results}</div>
      {results.map(v => (
        <button 
          key={v.id} 
          onClick={() => onSelectVisa(v.id)} 
          className="w-full text-left glass rounded-lg p-4 card-hover btn-press"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[#111827]">{v.code}</span>
            <span className="font-semibold text-[#374151] text-sm">{L(lang, v.name)}</span>
          </div>
          <div className="text-[#6B7280] text-xs">{L(lang, v.summary)}</div>
        </button>
      ))}
    </div>
  )
}

export default function SearchModal({ isOpen, onClose, onSelectVisa, lang }) {
  const [searchQuery, setSearchQuery] = useState('')
  const region = 'mainland' // TODO: 실제 region 값을 props로 받거나 context에서 가져오기

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-up mt-8 mx-4">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111827]">
              {lang === 'ko' ? '비자 검색' : lang === 'zh' ? '签证搜索' : 'Search Visa'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <SearchBar query={searchQuery} setQuery={setSearchQuery} lang={lang} />
        </div>

        {/* Search Results */}
        <div className="p-4 overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {searchQuery ? (
            <SearchResults 
              query={searchQuery} 
              region={region} 
              onSelectVisa={(visaId) => {
                onSelectVisa(visaId)
                onClose()
              }} 
              lang={lang} 
            />
          ) : (
            <div className="text-center text-[#6B7280] py-12">
              {lang === 'ko' ? '검색어를 입력하세요' : 
               lang === 'zh' ? '请输入搜索词' : 'Enter search term'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}