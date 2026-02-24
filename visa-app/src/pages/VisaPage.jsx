import React, { useState } from 'react'
import { t } from '../data/i18n'
import { visaCategories, visaTypes, quickGuide, regionComparison, documentAuth, passportRequirements, immigrationQuestions, approvalTips } from '../data/visaData'
import { visaTransitions } from '../data/visaTransitions'
import TransitionTab from '../components/TransitionTab'
import AgencyTab from '../components/AgencyTab'
import VisaSimulator from '../components/VisaSimulator'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

function SearchBar({ query, setQuery, lang }) {
  return (
    <div className="relative">
      <input type="text" placeholder={t[lang].search} value={query} onChange={e => setQuery(e.target.value)}
        className="w-full glass rounded-lg px-5 py-3.5 pl-11 text-sm border-0 focus:ring-2 focus:ring-[#111827]/30 outline-none transition-all placeholder:text-[#9CA3AF]" />
      <span className="absolute left-4 top-3.5 text-[#9CA3AF]">🔍</span>
    </div>
  )
}

function QuickGuideSection({ region, onSelectVisa, lang }) {
  const items = quickGuide[region] || []
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-[#111827] tracking-tight">{t[lang].faq}</h2>
      {items.map((item, i) => (
        <button key={i} onClick={() => onSelectVisa(item.visaId)}
          style={{ animationDelay: `${i * 0.05}s` }}
          className="w-full text-left glass rounded-lg p-4 card-hover btn-press animate-fade-up">
          <div className="font-semibold text-[#111827] text-sm">{L(lang, item.question)}</div>
          <div className="text-[#6B7280] text-xs mt-1">{L(lang, item.answer)}</div>
        </button>
      ))}
    </div>
  )
}

function ComparisonTable({ lang }) {
  const { headers, rows } = regionComparison
  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#E5E7EB]">
        <h2 className="text-base font-bold text-[#111827]">{t[lang].comparison}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-[#F3F4F6]">
            {headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-semibold text-[#111827] text-xs">{L(lang, h)}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((row, i) => <tr key={i} className="border-t border-[#E5E7EB]">
              {row.map((c, j) => <td key={j} className="px-3 py-2 text-[#6B7280] text-xs">{L(lang, c)}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CategoryCards({ onSelect, lang }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {visaCategories.filter(c => c.id !== 'overview').map((cat, i) => (
        <button key={cat.id} onClick={() => onSelect(cat.id)}
          style={{ animationDelay: `${i * 0.06}s` }}
          className="glass rounded-lg p-4 card-hover btn-press text-left animate-fade-up">
          <div className="text-2xl mb-2">{cat.icon}</div>
          <div className="font-bold text-[#111827] text-sm">{L(lang, cat.name)}</div>
          <div className="text-xs text-[#6B7280] mt-1">{L(lang, cat.description)}</div>
        </button>
      ))}
    </div>
  )
}

function VisaList({ categoryId, region, onSelectVisa, onBack, lang }) {
  const s = t[lang]; const cat = visaCategories.find(c => c.id === categoryId)
  const filtered = visaTypes.filter(v => v.category === categoryId && (region === 'mainland' ? v.forMainland : v.forHkMoTw))
  return (
    <div className="space-y-4 animate-fade-up">
      <button onClick={onBack} className="text-[#111827] text-sm font-medium">{s.back}</button>
      <h2 className="text-lg font-bold text-[#111827]">{cat?.icon} {L(lang, cat?.name)}</h2>
      {!filtered.length ? <div className="glass rounded-lg p-8 text-center text-[#6B7280]">{s.noVisaForRegion}</div> :
        filtered.map((visa, i) => (
          <button key={visa.id} onClick={() => onSelectVisa(visa.id)}
            style={{ animationDelay: `${i * 0.05}s` }}
            className="w-full text-left glass rounded-lg p-4 card-hover btn-press animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#111827]">{visa.code}</span>
              <span className="text-xs bg-[#111827] text-[#111827] px-2.5 py-1 rounded-full">{L(lang, visa.duration)}</span>
            </div>
            <div className="font-semibold text-[#374151] text-sm">{L(lang, visa.name)}</div>
            <div className="text-[#6B7280] text-xs mt-1 line-clamp-2">{L(lang, visa.summary)}</div>
          </button>
        ))
      }
    </div>
  )
}

function VisaDetail({ visaId, onBack, lang }) {
  const s = t[lang]; const visa = visaTypes.find(v => v.id === visaId)
  if (!visa) return null
  return (
    <div className="space-y-4 animate-fade-up">
      <button onClick={onBack} className="text-[#111827] text-sm font-medium">{s.back}</button>
      <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E5E7EB]">
        <div className="text-xs text-[#111827] tracking-wider">{visa.code}</div>
        <div className="text-xl font-bold mt-2">{L(lang, visa.name)}</div>
        <div className="text-sm text-[#6B7280] mt-1">{L(lang === 'ko' ? 'zh' : 'ko', visa.name)}</div>
        <div className="flex gap-4 mt-4 text-sm text-[#9CA3AF]">
          <span>⏱ {L(lang, visa.duration)}</span><span>💰 {L(lang, visa.fee)}</span>
        </div>
      </div>
      <Section title={s.overview}><p className="text-sm text-[#6B7280]">{L(lang, visa.summary)}</p></Section>
      {visa.subtypes && (
        <Section title={s.subtypes}>
          {visa.subtypes.map(st => (
            <div key={st.code} className="flex items-center gap-2 text-sm mb-1.5">
              <span className="font-mono text-[#111827] bg-[#111827] px-2 py-0.5 rounded text-xs">{st.code}</span>
              <span className="text-[#6B7280]">{L(lang, st.name)}</span>
            </div>
          ))}
        </Section>
      )}
      <Section title={s.requirements}>
        <ul className="space-y-2">{visa.requirements.map((r, i) => (
          <li key={i} className="flex gap-2 text-sm text-[#6B7280]"><span className="text-[#111827]">•</span><span>{L(lang, r)}</span></li>
        ))}</ul>
      </Section>
      <Section title={s.processingTime}><p className="text-sm text-[#6B7280]">{L(lang, visa.processingTime)}</p></Section>
      <Section title={s.applicableRegion}>
        <div className="flex gap-2">
          <Tag active={visa.forMainland}>{visa.forMainland ? '✅' : '❌'} {lang === 'en' ? 'Mainland' : lang === 'ko' ? '중국 본토' : '中国大陆'}</Tag>
          <Tag active={visa.forHkMoTw}>{visa.forHkMoTw ? '✅' : '❌'} {lang === 'en' ? 'HK/Macau/TW' : lang === 'ko' ? '홍콩/마카오/대만' : '港澳台'}</Tag>
        </div>
      </Section>
      {visa.notes && (
        <div className="bg-[#111827]/5 rounded-lg p-4 border border-[#111827]/20">
          <h3 className="font-bold text-[#111827] text-sm mb-2">{s.tips}</h3>
          <p className="text-sm text-[#6B7280]">{L(lang, visa.notes)}</p>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="glass rounded-lg p-4">
      <h3 className="font-bold text-[#111827] text-sm mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Tag({ active, children }) {
  return <span className={`text-xs px-3 py-1 rounded-full ${active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{children}</span>
}

function SearchResults({ query, region, onSelectVisa, lang }) {
  const s = t[lang]; const q = query.toLowerCase()
  const results = visaTypes.filter(v => {
    const nm = L('ko',v.name)+L('zh',v.name)+L('en',v.name)
    const sm = L('ko',v.summary)+L('zh',v.summary)+L('en',v.summary)
    const m = v.code.toLowerCase().includes(q)||nm.toLowerCase().includes(q)||sm.toLowerCase().includes(q)||v.tags?.some(t=>t.toLowerCase().includes(q))
    return m && (region === 'mainland' ? v.forMainland : v.forHkMoTw)
  })
  if (!results.length) return <div className="text-center text-[#6B7280] py-12">{s.noResults}</div>
  return (
    <div className="space-y-3">
      <div className="text-sm text-[#6B7280]">{results.length} {s.results}</div>
      {results.map(v => (
        <button key={v.id} onClick={() => onSelectVisa(v.id)} className="w-full text-left glass rounded-lg p-4 card-hover btn-press">
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

function DocumentAuthGuide({ lang, onBack }) {
  const d = documentAuth
  const s = t[lang]
  return (
    <div className="space-y-4 animate-fade-up">
      <button onClick={onBack} className="text-[#111827] text-sm font-medium">{s.back}</button>
      <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E5E7EB]">
        <h1 className="text-xl font-bold text-[#111827]">{L(lang, d.title)}</h1>
        <p className="text-sm text-[#6B7280] mt-2">{L(lang, d.subtitle)}</p>
      </div>
      <Section title={L(lang, d.process.title)}>
        <div className="space-y-4">
          {d.process.steps.map((s, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-[#111827]/10 rounded-full flex items-center justify-center text-sm shrink-0">{s.icon}</div>
              <div>
                <div className="font-semibold text-[#111827] text-sm">{s.step}. {L(lang, s.title)}</div>
                <div className="text-xs text-[#6B7280] mt-1">{L(lang, s.desc)}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title={lang==='ko'?'비자별 필요 서류':lang==='zh'?'各签证所需文件':'Documents by Visa Type'}>
        <div className="space-y-3">
          {d.byVisaType.map((item, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="font-mono text-[#111827] bg-[#111827] px-2 py-0.5 rounded text-xs shrink-0">{item.visa}</span>
              <div>
                <div className="font-semibold text-[#111827] text-xs">{L(lang, item.label)}</div>
                <div className="text-xs text-[#6B7280]">{L(lang, item.docs)}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

export default function VisaPage({ profile, lang, view, setView, selCat, setSelCat, selVisa, setSelVisa, sq, setSq }) {
  const s = t[lang]
  const [showDocAuth, setShowDocAuth] = useState(false)
  const [subTab, setSubTab] = useState(view === 'agency' ? 'agency' : 'browse')
  const rgn = ['china_hk','china_macau','china_taiwan'].includes(profile?.nationality) ? 'hkMoTw' : 'mainland'
  
  const selCategory = c => { setSelCat(c); setView('category'); setSq('') }
  const selVisaFn = v => { setSelVisa(v); setView('detail'); setSq('') }
  const back = () => { 
    if (view==='detail' && selCat) { 
      setView('category'); setSelVisa(null) 
    } else { 
      setView('home'); setSelCat(null); setSelVisa(null); setShowDocAuth(false) 
    } 
  }

  if (showDocAuth) {
    return (
      <div className="space-y-5">
        <DocumentAuthGuide lang={lang} onBack={() => setShowDocAuth(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Sub-tabs: Browse / Transition / Agency */}
      <div className="flex gap-2">
        <button onClick={() => setSubTab('browse')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${subTab === 'browse' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
          {lang === 'ko' ? '비자 정보' : lang === 'zh' ? '签证信息' : 'Visa Info'}
        </button>
        <button onClick={() => setSubTab('transition')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${subTab === 'transition' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
          {lang === 'ko' ? '시뮬레이터' : lang === 'zh' ? '模拟器' : 'Simulator'}
        </button>
        <button onClick={() => setSubTab('agency')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${subTab === 'agency' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
          {lang === 'ko' ? '서류 대행' : lang === 'zh' ? '文件代办' : 'Docs'}
        </button>
      </div>

      {subTab === 'agency' ? (
        <AgencyTab profile={profile} lang={lang} />
      ) : subTab === 'transition' ? (
        <VisaSimulator profile={profile} lang={lang} />
      ) : (
        <>
          <SearchBar query={sq} setQuery={setSq} lang={lang} />
          {sq ? <SearchResults query={sq} region={rgn} onSelectVisa={selVisaFn} lang={lang} />
            : view==='detail' ? <VisaDetail visaId={selVisa} onBack={back} lang={lang} />
            : view==='category' ? <VisaList categoryId={selCat} region={rgn} onSelectVisa={selVisaFn} onBack={back} lang={lang} />
            : <>
                <QuickGuideSection region={rgn} onSelectVisa={selVisaFn} lang={lang} />
                <button onClick={() => setShowDocAuth(true)}
                  className="w-full text-left bg-[#F8F9FA] rounded-lg p-5 card-hover border border-[#E5E7EB] btn-press animate-fade-up">
                  <div className="text-lg font-bold text-[#111827]">{L(lang, documentAuth.title)}</div>
                  <div className="text-sm text-[#6B7280] mt-1">{L(lang, documentAuth.subtitle)}</div>
                  <div className="text-xs text-[#111827] mt-2">{lang==='ko'?'공증 · 번역 · 아포스티유 안내 →':lang==='zh'?'公证 · 翻译 · 海牙认证指南 →':'Notarization · Translation · Apostille Guide →'}</div>
                </button>
                <ComparisonTable lang={lang} />
                <CategoryCards onSelect={selCategory} lang={lang} />

                {/* 출입국 심사 가이드 */}
                {immigrationQuestions?.length > 0 && (
                <div className="bg-[#F8F9FA] rounded-lg p-5 border border-[#E5E7EB] space-y-3">
                  <h3 className="text-base font-bold text-[#111827]">{lang === 'ko' ? '출입국 심사 예상 질문' : lang === 'zh' ? '入境审查常见问题' : 'Immigration Q&A'}</h3>
                  <div className="space-y-2.5">
                    {immigrationQuestions.map((q, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-[#E5E7EB]">
                        <p className="text-xs font-bold text-[#111827] mb-1">Q. {L(lang, q.question)}</p>
                        <p className="text-xs text-[#374151] mb-1">A. {L(lang, q.answer)}</p>
                        <p className="text-[10px] text-[#6B7280] italic mb-1">EN: &quot;{q.english}&quot;</p>
                        <p className="text-[10px] text-[#9CA3AF]">{L(lang, q.tip)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* 여권 요건 */}
                {passportRequirements?.length > 0 && (
                <div className="bg-[#F8F9FA] rounded-lg p-5 border border-[#E5E7EB] space-y-2">
                  <h3 className="text-base font-bold text-[#111827]">{lang === 'ko' ? '여권 요건' : lang === 'zh' ? '护照要求' : 'Passport Requirements'}</h3>
                  {passportRequirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs text-[#111827] mt-0.5">•</span>
                      <p className="text-xs text-[#374151]">{L(lang, req)}</p>
                    </div>
                  ))}
                </div>
                )}
            </>
          }
        </>
      )}
    </div>
  )
}