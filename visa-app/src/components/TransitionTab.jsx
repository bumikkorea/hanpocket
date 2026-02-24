import React from 'react'
import { t } from '../data/i18n'
import { visaTransitions } from '../data/visaTransitions'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

export default function TransitionTab({ profile, lang }) {
  const s = t[lang]
  const data = visaTransitions[profile?.currentVisa || 'none']
  const rgn = ['china_hk','china_macau','china_taiwan'].includes(profile?.nationality) ? 'hkMoTw' : 'mainland'
  
  if (!data) {
    return (
      <div className="text-center text-[#6B7280] py-12">
        {lang==='ko'?'비자 변경 정보가 없습니다.':lang==='zh'?'没有签证变更信息。':'No transition info.'}
      </div>
    )
  }
  
  const trans = data.transitions.filter(tr => rgn==='mainland' ? !tr.hkMoTwOnly : !tr.mainlandOnly)
  
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E5E7EB]">
        <div className="text-xs text-[#111827] tracking-wider">{s.myStatus}</div>
        <div className="text-lg font-bold mt-2">{L(lang, data.label)}</div>
        <div className="text-sm text-[#6B7280] mt-1">{s.nationality}: {s[profile?.nationality]}</div>
      </div>
      
      <h2 className="text-base font-bold text-[#111827]">{s.changeOptions}</h2>
      <p className="text-sm text-[#6B7280]">{s.transitionDesc}</p>
      
      {!trans.length ? (
        <div className="glass rounded-lg p-8 text-center text-[#6B7280]">
          {lang==='ko'?'변경 가능한 비자가 없습니다.':lang==='zh'?'没有可变更的签证。':'No transitions.'}
        </div>
      ) : (
        trans.map((tr, i) => (
          <div key={i} className="glass rounded-lg p-4 animate-fade-up" style={{animationDelay:`${i*0.05}s`}}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-[#111827]/10 rounded-full flex items-center justify-center text-[#111827] text-xs">→</span>
              <span className="font-bold text-[#111827] text-sm">{L(lang, tr.label)}</span>
            </div>
            {tr.conditions[lang]?.map((c, j) => (
              <div key={j} className="flex gap-2 text-sm text-[#6B7280] mb-1">
                <span className="text-[#111827] shrink-0">✓</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        ))
      )}
      
      {data.notes && (
        <div className="bg-[#111827]/5 rounded-lg p-4 border border-[#111827]/20">
          <p className="text-sm text-[#6B7280]">{data.notes[lang]}</p>
        </div>
      )}
    </div>
  )
}