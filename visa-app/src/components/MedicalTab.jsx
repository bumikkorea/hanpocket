import { useState, useMemo } from 'react'
import { HOSPITALS, HOSPITAL_TYPES, HOSPITAL_CITIES, HEALTH_INSURANCE_GUIDE } from '../data/hospitalData'
import { Search, ChevronDown, ChevronUp, Phone, Globe, MapPin, Shield, AlertCircle, Languages, Cross, Heart, BookOpen } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

const LABELS = {
  ko: { search: '병원 검색...', city: '도시', type: '병원 유형', emergency: '응급실', foreignSvc: '외국어 서비스', departments: '진료과', phone: '전화', website: '웹사이트', noResults: '검색 결과가 없습니다', insuranceGuide: '건강보험 가이드', allResults: '개 병원' },
  zh: { search: '搜索医院...', city: '城市', type: '医院类型', emergency: '急诊室', foreignSvc: '外语服务', departments: '科室', phone: '电话', website: '网站', noResults: '没有搜索结果', insuranceGuide: '健康保险指南', allResults: '家医院' },
  en: { search: 'Search hospitals...', city: 'City', type: 'Hospital type', emergency: 'Emergency', foreignSvc: 'Foreign language service', departments: 'Departments', phone: 'Phone', website: 'Website', noResults: 'No results found', insuranceGuide: 'Insurance Guide', allResults: 'hospitals' },
}

function InsuranceGuide({ lang }) {
  const [open, setOpen] = useState(false)
  const guide = HEALTH_INSURANCE_GUIDE
  const t = LABELS[lang] || LABELS.en

  return (
    <div className="mb-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <BookOpen size={20} className="text-slate-600" />
          </div>
          <div>
            <p className="font-semibold text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>{L(lang, guide.title)}</p>
            <p className="text-xs text-slate-500">{t.insuranceGuide}</p>
          </div>
        </div>
        {open ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4">
          {guide.sections.map((section, i) => (
            <div key={i} className="border-t border-slate-100 pt-4">
              <h4 className="font-semibold text-sm text-[#111827] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{L(lang, section.title)}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{L(lang, section.content)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HospitalCard({ hospital, lang }) {
  const t = LABELS[lang] || LABELS.en
  const langMap = { en: 'English', zh: '中文', ja: '日本語', ru: 'Русский', ar: 'العربية', vi: 'Tiếng Việt', mn: 'Монгол', fr: 'Français', id: 'Bahasa', th: 'ไทย', uz: "O'zbek" }

  // 가상 데이터 (실제 서비스에서는 API로 받아올 정보)
  const estimatedCost = Math.floor(Math.random() * 100 + 50) * 1000  // 5만~15만원
  const waitTime = Math.floor(Math.random() * 60 + 15) // 15~75분

  return (
    <div className="card-glow bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#111827] text-base truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{L(lang, hospital.name)}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{L(lang, hospital.address)}</p>
        </div>
        <span className="ml-2 shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">{hospital.type}</span>
      </div>

      {hospital.departments && hospital.departments.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {hospital.departments.slice(0, 6).map((dept, i) => (
            <span key={i} className="px-1.5 py-0.5 text-[10px] bg-slate-50 text-slate-600 rounded">{dept}</span>
          ))}
          {hospital.departments.length > 6 && <span className="px-1.5 py-0.5 text-[10px] text-slate-400">+{hospital.departments.length - 6}</span>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
        {hospital.emergency && (
          <span className="flex items-center gap-1 text-red-600 font-medium">
            <AlertCircle size={12} />
            {t.emergency}
          </span>
        )}
        {hospital.foreignService && (
          <span className="flex items-center gap-1 text-blue-600">
            <Languages size={12} />
            {hospital.languages?.map(l => langMap[l] || l).join(', ')}
          </span>
        )}
      </div>

      {/* 추가 정보 (예상 진료비, 대기시간) */}
      <div className="bg-slate-50 rounded-lg p-2 mb-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-600">
              {L(lang, { ko: '예상 진료비', zh: '预计诊疗费', en: 'Est. Cost' })}
            </span>
            <div className="font-medium text-slate-800">₩{estimatedCost.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-slate-600">
              {L(lang, { ko: '예상 대기', zh: '预计等候', en: 'Est. Wait' })}
            </span>
            <div className="font-medium text-slate-800">{waitTime}{L(lang, { ko: '분', zh: '分钟', en: 'min' })}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs">
          {hospital.phone && (
            <a href={`tel:${hospital.phone}`} className="flex items-center gap-1 text-slate-600 hover:text-[#111827] transition-colors">
              <Phone size={12} />
              {hospital.phone}
            </a>
          )}
          {hospital.website && (
            <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-600 hover:text-[#111827] transition-colors">
              <Globe size={12} />
              {t.website}
            </a>
          )}
        </div>
        
        {/* TODO: 실제 예약 시스템 연동 필요 */}
        <button className="px-3 py-1.5 text-xs font-medium bg-[#111827] text-white rounded-lg hover:bg-slate-700 transition-colors">
          {L(lang, { ko: '예약하기', zh: '预约', en: 'Book' })}
        </button>
      </div>
    </div>
  )
}

export default function MedicalTab({ lang = 'ko' }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('전체')
  const [selectedType, setSelectedType] = useState('전체')
  const t = LABELS[lang] || LABELS.en

  const filtered = useMemo(() => {
    return HOSPITALS.filter(h => {
      if (selectedCity !== '전체' && h.city !== selectedCity) return false
      if (selectedType !== '전체' && h.type !== selectedType) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const name = `${h.name.ko} ${h.name.zh} ${h.name.en}`.toLowerCase()
        const addr = `${h.address?.ko || ''} ${h.address?.en || ''}`.toLowerCase()
        const depts = (h.departments || []).join(' ').toLowerCase()
        if (!name.includes(q) && !addr.includes(q) && !depts.includes(q)) return false
      }
      return true
    })
  }, [searchQuery, selectedCity, selectedType])

  return (
    <div className="pb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <InsuranceGuide lang={lang} />

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t.search}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors bg-white"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <select
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-[#111827] bg-white focus:outline-none focus:border-slate-400"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {HOSPITAL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-[#111827] bg-white focus:outline-none focus:border-slate-400"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {HOSPITAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400 mb-3">{filtered.length} {t.allResults}</p>

      {/* Results */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">{t.noResults}</div>
        ) : (
          filtered.map(h => <HospitalCard key={h.id} hospital={h} lang={lang} />)
        )}
      </div>
    </div>
  )
}
