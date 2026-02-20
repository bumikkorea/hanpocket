import { useState, useRef, useEffect, Component } from 'react'
import { MessageCircle, X, Moon, Sun } from 'lucide-react'
import { visaCategories, visaTypes, quickGuide, regionComparison, documentAuth, passportRequirements, immigrationQuestions, approvalTips } from './data/visaData'
import { visaTransitions, visaOptions, nationalityOptions } from './data/visaTransitions'
import { t } from './data/i18n'
import { generateChatResponse } from './data/chatResponses'
import { updateLog, autoUpdateInfo, dataSources } from './data/updateLog'
import EducationTab from './components/EducationTab'
import AgencyTab from './components/AgencyTab'
import HomeTab, { trackActivity } from './components/HomeTab'
import PetTab from './components/PetTab'
import MedicalTab from './components/MedicalTab'
import FitnessTab from './components/FitnessTab'
import ShoppingTab from './components/ShoppingTab'
import CultureTab from './components/CultureTab'
import LifeToolsTab from './components/LifeToolsTab'
import JobsTab from './components/JobsTab'
import HousingTab from './components/HousingTab'
// New tabs
import TravelTab from './components/TravelTab'
import FoodTab from './components/FoodTab'
import HallyuTab from './components/HallyuTab'
import TranslatorTab from './components/TranslatorTab'
import ARTranslateTab from './components/ARTranslateTab'
import SOSTab from './components/SOSTab'
import CommunityTab from './components/CommunityTab'
import VisaAlertTab from './components/VisaAlertTab'
import FinanceTab from './components/FinanceTab'
import ResumeTab from './components/ResumeTab'
import DigitalWalletTab from './components/DigitalWalletTab'
function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}
function getDaysUntil(d) { if(!d) return null; const t=new Date(d),n=new Date(); t.setHours(0,0,0,0); n.setHours(0,0,0,0); return Math.ceil((t-n)/864e5) }
function loadProfile() { try { return JSON.parse(localStorage.getItem('visa_profile')) } catch { return null } }
function saveProfile(p) { localStorage.setItem('visa_profile', JSON.stringify(p)) }
const LANGS = ['ko','zh','en']
function nextLang(c) { return LANGS[(LANGS.indexOf(c)+1)%3] }
function langLabel(c) { return {ko:'한국어',zh:'中文',en:'EN'}[nextLang(c)] }

function Logo({ size = 'md' }) {
  const scales = { sm: 0.7, md: 0.9, lg: 1.15 }
  const sc = scales[size] || scales.md
  return (
    <svg width={186 * sc} height={28 * sc} viewBox="0 0 186 28" fill="none" style={{ overflow: 'visible' }}>
      {/* HANPOCKET 텍스트 */}
      <text x="82" y="19" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="300" fontSize="18" letterSpacing="0.25em" fill="#111827">
        HANPOCKET
      </text>

      {/* 복주머니 — 마침표 위치 (T 오른쪽 바로 뒤) */}
      <g transform="translate(162, 8) scale(0.5)">
        <path d="M6,7 Q10,2 14,7" fill="none" stroke="#B8956A" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="10" cy="7.5" r="1.3" fill="#B8956A"/>
        <line x1="8.5" y1="8.5" x2="7" y2="12" stroke="#B8956A" strokeWidth="0.8" strokeLinecap="round"/>
        <line x1="11.5" y1="8.5" x2="13" y2="12" stroke="#B8956A" strokeWidth="0.8" strokeLinecap="round"/>
        <path d="M3,9 Q1,14 3,19 Q5,23 10,24 Q15,23 17,19 Q19,14 17,9 Z" fill="#D42B40"/>
        <path d="M4,9 Q6,10.5 10,10.5 Q14,10.5 16,9" fill="none" stroke="#B02535" strokeWidth="0.5"/>
        <rect x="8" y="14" width="4" height="4" rx="0.5" fill="none" stroke="#B8956A" strokeWidth="0.6"/>
        <line x1="10" y1="14" x2="10" y2="18" stroke="#B8956A" strokeWidth="0.4"/>
        <line x1="8" y1="16" x2="12" y2="16" stroke="#B8956A" strokeWidth="0.4"/>
      </g>
    </svg>
  )
}

function Onboarding({ onComplete, lang, setLang }) {
  const [step, setStep] = useState('splash')
  const [nationality, setNationality] = useState(null)
  const [currentVisa, setCurrentVisa] = useState(null)
  const [exchangeRates, setExchangeRates] = useState(null)
  const s = t[lang]

  // 환율 로드 (CNY, HKD, TWD, MOP)
  useEffect(() => {
    Promise.all([
      fetch('https://api.exchangerate-api.com/v4/latest/CNY').then(r => r.json()),
      fetch('https://api.exchangerate-api.com/v4/latest/HKD').then(r => r.json()),
      fetch('https://api.exchangerate-api.com/v4/latest/TWD').then(r => r.json()),
      fetch('https://api.exchangerate-api.com/v4/latest/MOP').then(r => r.json()),
    ]).then(([cny, hkd, twd, mop]) => {
      setExchangeRates({
        CNY: cny.rates?.KRW ? Math.round(cny.rates.KRW * 100) / 100 : null,
        HKD: hkd.rates?.KRW ? Math.round(hkd.rates.KRW * 100) / 100 : null,
        TWD: twd.rates?.KRW ? Math.round(twd.rates.KRW * 100) / 100 : null,
        MOP: mop.rates?.KRW ? Math.round(mop.rates.KRW * 100) / 100 : null,
        _date: cny.date || null,
      })
    }).catch(() => {})
  }, [])

  // 스플래시 → 국적 선택으로 바로 전환
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => setStep('nationality'), 2500)
      return () => clearTimeout(timer)
    }
  }, [step])

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* 언어 토글 */}
        <button onClick={() => setLang(nextLang(lang))}
          className="absolute top-6 right-6 text-[#6B7280] text-sm px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#B8956A] transition-all z-10">
          {langLabel(lang)}
        </button>

        {/*  스플래시 (첫 화면)  */}
        {step === 'splash' && (
          <div className="animate-fade-up">
            <svg viewBox="0 0 320 260" style={{ width: '320px', height: '260px' }}>
              {/* 타원 마그넷 본체 — 그림자를 타원 자체에 */}
              <defs>
                <filter id="magnet-shadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.12"/>
                </filter>
              </defs>
              <ellipse cx="160" cy="130" rx="152" ry="122" fill="#FAFAF8" stroke="#E8D5B7" strokeWidth="3" filter="url(#magnet-shadow)"/>
              <ellipse cx="160" cy="130" rx="142" ry="112" fill="none" stroke="#E8D5B7" strokeWidth="0.5" opacity="0.5"/>

              {/* === 상단 아치: 산등선 + 남산타워 === */}
              {/* 산등선 */}
              <path d="M55,88 Q75,65 95,78 Q115,55 135,70 Q155,48 160,42 Q165,48 185,70 Q205,55 225,78 Q245,65 265,88" 
                fill="none" stroke="#111827" strokeWidth="1.2" strokeLinecap="round"/>
              {/* 남산타워 (가운데 봉우리 위) */}
              <line x1="160" y1="42" x2="160" y2="24" stroke="#111827" strokeWidth="1.5"/>
              <line x1="160" y1="24" x2="160" y2="18" stroke="#111827" strokeWidth="1"/>
              <circle cx="160" cy="17" r="1.5" fill="#111827"/>
              <ellipse cx="160" cy="38" rx="5" ry="2.5" fill="none" stroke="#111827" strokeWidth="0.8"/>
              
              {/* === 심볼들 === */}
              
              {/* 한강 물결 (왼쪽 산 아래) */}
              <path d="M62,95 Q67,92 72,95 Q77,98 82,95" fill="none" stroke="#4A90D9" strokeWidth="1" opacity="0.7"/>
              <path d="M65,99 Q70,96 75,99 Q80,102 85,99" fill="none" stroke="#4A90D9" strokeWidth="0.8" opacity="0.5"/>

              {/* 벚꽃 (왼쪽 위) */}
              <g transform="translate(80,68)">
                <circle cx="0" cy="-3" r="1.8" fill="#F9C7C8"/>
                <circle cx="2.8" cy="-1" r="1.8" fill="#F9C7C8"/>
                <circle cx="1.7" cy="2" r="1.8" fill="#F9C7C8"/>
                <circle cx="-1.7" cy="2" r="1.8" fill="#F9C7C8"/>
                <circle cx="-2.8" cy="-1" r="1.8" fill="#F9C7C8"/>
                <circle cx="0" cy="0" r="1" fill="#E8A0A0"/>
              </g>

              {/* 립스틱 = 뷰티 (왼쪽) */}
              <g transform="translate(42,115)">
                <ellipse cx="0" cy="-5" rx="2" ry="3" fill="#E74C5F"/>
                <ellipse cx="0" cy="1" rx="2.5" ry="4" fill="#111827"/>
              </g>

              {/* 한복 (왼쪽) */}
              <g transform="translate(38,145) scale(1.8)">
                {/* 치마 */}
                <path d="M0,-6 Q-7,0 -6,8 L6,8 Q7,0 0,-6 Z" fill="#E74C5F" opacity="0.75"/>
                {/* 저고리 */}
                <path d="M-3.5,-6 L3.5,-6 L2.5,-3 L-2.5,-3 Z" fill="#FFFFFF" stroke="#E74C5F" strokeWidth="0.5"/>
                {/* 소매 */}
                <path d="M-3.5,-5 L-6,-4" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M3.5,-5 L6,-4" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
                {/* 고름 리본 */}
                <path d="M-0.5,-3.5 Q-2,0 -3,1" stroke="#3B82F6" strokeWidth="0.7" fill="none"/>
                <path d="M0.5,-3.5 Q2,0 3,1" stroke="#E74C5F" strokeWidth="0.7" fill="none"/>
              </g>

              {/* 회오리감자 (하단 왼쪽) */}
              <g transform="translate(78,198)">
                <line x1="0" y1="5" x2="0" y2="-4" stroke="#C8A96E" strokeWidth="1.2"/>
                <path d="M-3,-4 Q-3,-7 0,-7 Q3,-7 3,-4 Q3,-1 0,-1 Q-2,-1 -2,-3" fill="none" stroke="#D4A030" strokeWidth="1.2"/>
                <path d="M-2,0 Q-3,2 0,2 Q3,2 3,0" fill="none" stroke="#D4A030" strokeWidth="1"/>
              </g>

              {/* 떡볶이 (하단) */}
              <g transform="translate(120,212)">
                <ellipse cx="-3" cy="0" rx="1.5" ry="5" fill="#E8573A"/>
                <ellipse cx="1" cy="-1" rx="1.5" ry="5.5" fill="#E8573A"/>
                <path d="M-6,5 Q0,8 6,5" fill="none" stroke="#111827" strokeWidth="0.8"/>
              </g>

              {/* 치킨 (하단 가운데) */}
              <g transform="translate(155,215)">
                <ellipse cx="0" cy="0" rx="5" ry="4" fill="#F0C75E"/>
                <ellipse cx="-3" cy="-2" rx="3" ry="2.5" fill="#E8B84A"/>
                <line x1="3" y1="1" x2="6" y2="4" stroke="#8B5E3C" strokeWidth="1" strokeLinecap="round"/>
              </g>

              {/* 소주병 (하단 오른쪽) — 둥근 병 모양 */}
              <g transform="translate(195,212)">
                <ellipse cx="0" cy="2" rx="3.5" ry="5" fill="none" stroke="#4A90D9" strokeWidth="0.8"/>
                <ellipse cx="0" cy="0" rx="3" ry="1.5" fill="#C8E6C9" opacity="0.4"/>
                <line x1="0" y1="-3" x2="0" y2="-6" stroke="#4A90D9" strokeWidth="1.2" strokeLinecap="round"/>
                <ellipse cx="0" cy="-6" rx="1.5" ry="0.8" fill="none" stroke="#4A90D9" strokeWidth="0.6"/>
              </g>

              {/* 음표 = K-POP (오른쪽 아래) */}
              <g transform="translate(240,195)">
                <circle cx="0" cy="4" r="2.5" fill="#111827"/>
                <line x1="2.5" y1="4" x2="2.5" y2="-6" stroke="#111827" strokeWidth="1"/>
                <path d="M2.5,-6 Q6,-8 6,-4" fill="none" stroke="#111827" strokeWidth="1"/>
              </g>

              {/* 마이크 = K-POP (오른쪽) */}
              <g transform="translate(275,155)">
                <circle cx="0" cy="-4" r="3" fill="none" stroke="#111827" strokeWidth="1"/>
                <line x1="0" y1="-1" x2="0" y2="5" stroke="#111827" strokeWidth="1"/>
                <line x1="-2" y1="5" x2="2" y2="5" stroke="#111827" strokeWidth="1"/>
              </g>

              {/* 가위 = 미용 (오른쪽 위) */}
              <g transform="translate(272,115)">
                <circle cx="-2" cy="4" r="2" fill="none" stroke="#111827" strokeWidth="0.8"/>
                <circle cx="2" cy="4" r="2" fill="none" stroke="#111827" strokeWidth="0.8"/>
                <line x1="-1" y1="2" x2="2" y2="-4" stroke="#111827" strokeWidth="0.8"/>
                <line x1="1" y1="2" x2="-2" y2="-4" stroke="#111827" strokeWidth="0.8"/>
              </g>

              {/* 경복궁 삭제 */}

              {/* 한옥 지붕 (상단 왼쪽 산 위) */}
              <g transform="translate(100,60)">
                <path d="M-6,0 Q0,-6 6,0" fill="none" stroke="#111827" strokeWidth="1"/>
                <line x1="-5" y1="0" x2="-5" y2="4" stroke="#111827" strokeWidth="0.6"/>
                <line x1="5" y1="0" x2="5" y2="4" stroke="#111827" strokeWidth="0.6"/>
              </g>

              {/* 하트 (산 사이) */}
              <g transform="translate(205,58)">
                <path d="M0,2 Q-4,-2 0,-4 Q4,-2 0,2 Z" fill="#E74C5F" opacity="0.6"/>
              </g>

              {/* 벚꽃 2 (오른쪽 산 근처) */}
              <g transform="translate(255,80)">
                <circle cx="0" cy="-2.5" r="1.5" fill="#F9C7C8"/>
                <circle cx="2.4" cy="-0.8" r="1.5" fill="#F9C7C8"/>
                <circle cx="1.5" cy="1.7" r="1.5" fill="#F9C7C8"/>
                <circle cx="-1.5" cy="1.7" r="1.5" fill="#F9C7C8"/>
                <circle cx="-2.4" cy="-0.8" r="1.5" fill="#F9C7C8"/>
                <circle cx="0" cy="0" r="0.8" fill="#E8A0A0"/>
              </g>

              {/* === 가운데 텍스트 === */}
              <text x="160" y="125" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="28" fontWeight="300" letterSpacing="0.15em" fill="#111827">
                HanPocket
              </text>
              <text x="160" y="145" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="400" letterSpacing="0.15em" fill="#888">
                {lang === 'ko' ? '한국에 온 걸 환영해' : lang === 'zh' ? '欢迎来到韩国' : 'Welcome to Korea'}
              </text>
            </svg>
          </div>
        )}

        {/*  국적 선택  */}
        {step === 'nationality' && (
          <div className="w-full max-w-sm animate-fade-up">
            <div className="text-center mb-8">
              <Logo />
            </div>
            <button onClick={() => setStep('splash')} className="text-[#6B7280] text-sm mb-4">{s.back}</button>
            <p className="text-[#6B7280] text-sm mb-4">{s.selectNationality}</p>
            <div className="space-y-3">
              {nationalityOptions.map(opt => (
                <button key={opt.id}
                  onClick={() => { setNationality(opt.id); setStep('visa') }}
                  className="w-full text-left bg-white border border-[#E5E7EB] text-[#111827] rounded-xl p-4 hover:border-[#B8956A]/40 transition-all btn-press shadow-sm">
                  {s[opt.id]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/*  비자 선택  */}
        {step === 'visa' && (
            <div className="w-full max-w-sm animate-fade-up space-y-3">
              <div className="text-center mb-4"><Logo /></div>
              <button onClick={() => setStep('nationality')} className="text-[#6B7280] text-sm">{s.back}</button>
              <p className="text-[#6B7280] text-sm mb-2">{s.selectCurrentVisa}</p>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {visaOptions.map(opt => {
                  const rgn = nationalityOptions.find(n => n.id === nationality)?.region
                  if (rgn === 'hkMoTw' && ['H-2','F-4','E-9'].includes(opt.id)) return null
                  return (
                    <button key={opt.id}
                      onClick={() => setCurrentVisa(opt.id)}
                      className={`w-full text-left text-sm rounded-xl p-3 transition-all border btn-press ${
                        currentVisa === opt.id
                          ? 'bg-[#111827] border-[#111827] text-white font-semibold'
                          : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]/40'
                      }`}>
                      {L(lang, opt.label)}
                    </button>
                  )
                })}
              </div>
              {currentVisa && (
                <button
                  ref={el => { if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100) }}
                  onClick={() => {
                    const p = { nationality, currentVisa, targetCountry: 'korea', lang }
                    saveProfile(p); onComplete(p)
                  }}
                  className="w-full bg-[#111827] text-white font-bold rounded-xl p-4 mt-4 transition-all btn-press shadow-lg animate-fade-up">
                  {s.start} →
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  )
}

function NoticePopup({ lang, onClose }) {
  const s = t[lang]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-fade-up">
        <div className="bg-white border-b border-[#E5E7EB] p-6">
          <h2 className="text-lg font-bold text-[#111827]">{lang === 'ko' ? '공지사항' : lang === 'zh' ? '公告' : 'Notice'}</h2>
          <p className="text-[#6B7280] text-xs mt-1">{lang === 'ko' ? '출입국관리법 기반 · 법무부 공개데이터' : lang === 'zh' ? '基于出入境管理法 · 法务部公开数据' : 'Based on Immigration Act · MOJ Open Data'}</p>
        </div>
        <div className="p-5 overflow-y-auto max-h-[50vh] space-y-5">
          {updateLog.map((entry, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-[#F3F4F6] text-[#111827] px-2 py-0.5 rounded-full">v{entry.version}</span>
                <span className="text-xs text-[#6B7280]">{entry.date}</span>
                {idx === 0 && <span className="text-xs bg-[#B8956A]/10 text-[#B8956A] px-2 py-0.5 rounded-full">NEW</span>}
              </div>
              <ul className="space-y-1">
                {entry.items[lang]?.map((item, i) => <li key={i} className="text-sm text-[#6B7280]">{item}</li>)}
              </ul>
            </div>
          ))}
          <div className="border-t border-[#E5E7EB] pt-3">
            <p className="text-xs text-[#9CA3AF] font-semibold mb-1">{lang === 'ko' ? '데이터 출처' : lang === 'zh' ? '数据来源' : 'Data Sources'}</p>
            {dataSources[lang]?.map((src, i) => <p key={i} className="text-xs text-[#9CA3AF]">{src}</p>)}
          </div>
        </div>
        <div className="p-4 border-t border-[#E5E7EB]">
          <button onClick={onClose} className="w-full bg-[#111827] text-white font-semibold py-3 rounded-xl hover:bg-[#1F2937] transition-all btn-press">
            {s.noticeClose}
          </button>
        </div>
      </div>
    </div>
  )
}

function SearchBar({ query, setQuery, lang }) {
  return (
    <div className="relative">
      <input type="text" placeholder={t[lang].search} value={query} onChange={e => setQuery(e.target.value)}
        className="w-full glass rounded-lg px-5 py-3.5 pl-11 text-sm border-0 focus:ring-2 focus:ring-[#B8956A]/30 outline-none transition-all placeholder:text-[#9CA3AF]" />
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
      <button onClick={onBack} className="text-[#B8956A] text-sm font-medium">{s.back}</button>
      <h2 className="text-lg font-bold text-[#111827]">{cat?.icon} {L(lang, cat?.name)}</h2>
      {!filtered.length ? <div className="glass rounded-lg p-8 text-center text-[#6B7280]">{s.noVisaForRegion}</div> :
        filtered.map((visa, i) => (
          <button key={visa.id} onClick={() => onSelectVisa(visa.id)}
            style={{ animationDelay: `${i * 0.05}s` }}
            className="w-full text-left glass rounded-lg p-4 card-hover btn-press animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#111827]">{visa.code}</span>
              <span className="text-xs bg-[#111827] text-[#B8956A] px-2.5 py-1 rounded-full">{L(lang, visa.duration)}</span>
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
      <button onClick={onBack} className="text-[#B8956A] text-sm font-medium">{s.back}</button>
      <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E5E7EB]">
        <div className="text-xs text-[#B8956A] tracking-wider">{visa.code}</div>
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
              <span className="font-mono text-[#B8956A] bg-[#111827] px-2 py-0.5 rounded text-xs">{st.code}</span>
              <span className="text-[#6B7280]">{L(lang, st.name)}</span>
            </div>
          ))}
        </Section>
      )}
      <Section title={s.requirements}>
        <ul className="space-y-2">{visa.requirements.map((r, i) => (
          <li key={i} className="flex gap-2 text-sm text-[#6B7280]"><span className="text-[#B8956A]">•</span><span>{L(lang, r)}</span></li>
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
        <div className="bg-[#B8956A]/5 rounded-lg p-4 border border-[#B8956A]/20">
          <h3 className="font-bold text-[#B8956A] text-sm mb-2">{s.tips}</h3>
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

function TransitionTab({ profile, lang }) {
  const s = t[lang]; const data = visaTransitions[profile.currentVisa || 'none']
  const rgn = ['china_hk','china_macau','china_taiwan'].includes(profile.nationality) ? 'hkMoTw' : 'mainland'
  if (!data) return <div className="text-center text-[#6B7280] py-12">{lang==='ko'?'비자 변경 정보가 없습니다.':lang==='zh'?'没有签证变更信息。':'No transition info.'}</div>
  const trans = data.transitions.filter(tr => rgn==='mainland' ? !tr.hkMoTwOnly : !tr.mainlandOnly)
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E5E7EB]">
        <div className="text-xs text-[#B8956A] tracking-wider">{s.myStatus}</div>
        <div className="text-lg font-bold mt-2">{L(lang, data.label)}</div>
        <div className="text-sm text-[#6B7280] mt-1">{s.nationality}: {s[profile.nationality]}</div>
      </div>
      <h2 className="text-base font-bold text-[#111827]">{s.changeOptions}</h2>
      <p className="text-sm text-[#6B7280]">{s.transitionDesc}</p>
      {!trans.length ? <div className="glass rounded-lg p-8 text-center text-[#6B7280]">{lang==='ko'?'변경 가능한 비자가 없습니다.':lang==='zh'?'没有可变更的签证。':'No transitions.'}</div>
        : trans.map((tr, i) => (
          <div key={i} className="glass rounded-lg p-4 animate-fade-up" style={{animationDelay:`${i*0.05}s`}}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-[#B8956A]/10 rounded-full flex items-center justify-center text-[#B8956A] text-xs">→</span>
              <span className="font-bold text-[#111827] text-sm">{L(lang, tr.label)}</span>
            </div>
            {tr.conditions[lang]?.map((c, j) => (
              <div key={j} className="flex gap-2 text-sm text-[#6B7280] mb-1"><span className="text-[#B8956A] shrink-0">✓</span><span>{c}</span></div>
            ))}
          </div>
        ))
      }
      {data.notes && <div className="bg-[#B8956A]/5 rounded-lg p-4 border border-[#B8956A]/20"><p className="text-sm text-[#6B7280]">{data.notes[lang]}</p></div>}
    </div>
  )
}

function ChatTab({ profile, lang }) {
  const s = t[lang]
  const [msgs, setMsgs] = useState([{ role: 'bot', text: s.chatWelcome }])
  const [input, setInput] = useState('')
  const ref = useRef(null)
  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])
  const send = () => {
    if (!input.trim()) return
    const u = input.trim(); setInput('')
    const r = generateChatResponse(u, { nationality: profile.nationality, currentVisa: profile.currentVisa, lang })
    setMsgs(prev => [...prev, { role: 'user', text: u }, { role: 'bot', text: r }])
  }
  const qqs = lang==='ko' ? ['변경 가능한 비자는?','영주권 조건은?','연장하려면?','서류는?','수수료는?']
    : lang==='zh' ? ['可以变更什么签证？','永住权条件？','怎么延期？','材料？','费用？']
    : ['Visa changes?','PR conditions?','Extend?','Documents?','Fees?']
  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="bg-[#F3F4F6] rounded-lg p-3 mb-3">
        <div className="text-xs text-[#6B7280]">
          <span className="font-semibold">{s[profile.nationality]}</span> · <span>{L(lang, visaOptions.find(v=>v.id===profile.currentVisa)?.label)}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'} animate-fade-up`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
              m.role==='user' ? 'bg-[#111827] text-white rounded-br-md' : 'glass text-[#374151] rounded-bl-md'
            }`}>{m.text}</div>
          </div>
        ))}
        <div ref={ref} />
      </div>
      {msgs.length <= 2 && (
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
          {qqs.map((q, i) => (
            <button key={i} onClick={() => setInput(q)} className="shrink-0 text-xs bg-[#F3F4F6] text-[#6B7280] px-3 py-1.5 rounded-full hover:bg-[#D1D1D6] btn-press">{q}</button>
          ))}
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();send()}}}
          placeholder={s.chatPlaceholder} className="flex-1 glass rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#B8956A]/30 placeholder:text-[#9CA3AF]" />
        <button onClick={send} className="bg-[#111827] text-[#B8956A] w-12 rounded-lg hover:bg-[#1F2937] transition-all btn-press text-lg">↑</button>
      </div>
    </div>
  )
}

function ProfileTab({ profile, setProfile, lang }) {
  const s = t[lang]
  const [exp, setExp] = useState(profile.expiryDate || '')
  const [name, setName] = useState(profile.passportName || '')
  const [num, setNum] = useState(profile.passportNumber || '')
  const [saved, setSaved] = useState(false)
  const [unmasked, setUnmasked] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('visa_notif_prefs')) || { d90: true, d60: true, d30: true, d7: true } }
    catch { return { d90: true, d60: true, d30: true, d7: true } }
  })
  const unmaskTimerRef = useRef(null)
  const days = getDaysUntil(exp)
  const vl = visaOptions.find(v => v.id === profile.currentVisa)?.label

  // Re-mask when leaving profile tab or after 30 seconds
  useEffect(() => {
    return () => { setUnmasked(false); if (unmaskTimerRef.current) clearTimeout(unmaskTimerRef.current) }
  }, [])

  const maskName = (n) => { if (!n || n.length <= 1) return n || '—'; return n[0] + '*'.repeat(n.length - 1) }
  const maskPassport = (p) => { if (!p || p.length <= 1) return p || '—'; return p[0] + '*'.repeat(p.length - 1) }

  const handleVerify = () => {
    setShowVerifyModal(false)
    setUnmasked(true)
    if (unmaskTimerRef.current) clearTimeout(unmaskTimerRef.current)
    unmaskTimerRef.current = setTimeout(() => setUnmasked(false), 30000)
  }

  const toggleNotif = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    localStorage.setItem('visa_notif_prefs', JSON.stringify(updated))
  }

  const save = () => {
    const u = { ...profile, expiryDate: exp, passportName: name, passportNumber: num }
    setProfile(u); saveProfile(u); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const notifOptions = [
    { key: 'd90', label: { ko: '90일 전', zh: '90天前', en: '90 days before' } },
    { key: 'd60', label: { ko: '60일 전', zh: '60天前', en: '60 days before' } },
    { key: 'd30', label: { ko: '30일 전', zh: '30天前', en: '30 days before' } },
    { key: 'd7', label: { ko: '7일 전', zh: '7天前', en: '7 days before' } },
  ]

  const verifyMethods = [
    { icon: '🛂', label: { ko: '여권', zh: '护照', en: 'Passport' } },
    { icon: '📱', label: { ko: '모바일 외국인등록증', zh: '移动外国人登录证', en: 'Mobile ARC' } },
    { icon: '💬', label: { ko: '카카오', zh: 'KakaoTalk', en: 'Kakao' } },
    { icon: '🟢', label: { ko: '네이버', zh: 'Naver', en: 'Naver' } },
    { icon: '🔐', label: { ko: 'PASS', zh: 'PASS', en: 'PASS' } },
  ]

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-lg w-full max-w-sm overflow-hidden shadow-2xl animate-fade-up">
            <div className="bg-[#F8F9FA] border-b border-[#E5E7EB] p-5">
              <h2 className="text-lg font-bold text-[#111827]">
                {lang === 'ko' ? '본인 인증' : lang === 'zh' ? '身份验证' : 'Identity Verification'}
              </h2>
              <p className="text-[#6B7280] text-xs mt-1">
                {lang === 'ko' ? '개인정보 확인을 위해 본인 인증이 필요합니다' : lang === 'zh' ? '查看个人信息需要身份验证' : 'Verification required to view personal info'}
              </p>
            </div>
            <div className="p-5 space-y-3">
              {verifyMethods.map((m, i) => (
                <button key={i} onClick={handleVerify}
                  className="w-full text-left bg-[#F3F4F6] hover:bg-[#D1D1D6] rounded-xl p-4 flex items-center gap-3 transition-all btn-press">
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-semibold text-[#111827] text-sm">{L(lang, m.label)}</span>
                </button>
              ))}
              <p className="text-[10px] text-[#9CA3AF] text-center mt-3">
                {lang === 'ko' ? '실제 본인인증은 서버 연동 후 활성화됩니다' : lang === 'zh' ? '实际身份验证将在服务器对接后激活' : 'Actual verification will be activated after server integration'}
              </p>
            </div>
            <div className="p-4 border-t border-[#E5E7EB]">
              <button onClick={() => setShowVerifyModal(false)} className="w-full text-[#6B7280] text-sm py-2">
                {lang === 'ko' ? '취소' : lang === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. 여권 스타일 프로필 카드 - Masked by default */}
      <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-[#B8956A] tracking-wider">PASSPORT INFO</div>
          <Logo size="sm" />
        </div>
        <div className="space-y-2 text-sm">
          <div><span className="text-[#6B7280] text-xs">NAME</span><p className="font-bold tracking-wide">{unmasked ? (name || '—') : maskName(name)}</p></div>
          <div><span className="text-[#6B7280] text-xs">PASSPORT NO.</span><p className="font-mono tracking-wider">{unmasked ? (num || '—') : maskPassport(num)}</p></div>
          <div className="flex gap-6">
            <div><span className="text-[#6B7280] text-xs">NATIONALITY</span><p>{s[profile.nationality]}</p></div>
            <div><span className="text-[#6B7280] text-xs">VISA</span><p>{L(lang, vl)}</p></div>
          </div>
        </div>
        {!unmasked && (name || num) && (
          <button onClick={() => setShowVerifyModal(true)}
            className="mt-3 px-4 py-2 bg-[#B8956A]/20 text-[#B8956A] text-xs font-semibold rounded-xl hover:bg-[#B8956A]/30 transition-all btn-press">
            🔓 {lang === 'ko' ? '정보 확인' : lang === 'zh' ? '查看信息' : 'View Info'}
          </button>
        )}
        {unmasked && (
          <p className="mt-2 text-[10px] text-[#6B7280]">
            {lang === 'ko' ? '30초 후 자동으로 마스킹됩니다' : lang === 'zh' ? '30秒后自动隐藏' : 'Auto-masked after 30 seconds'}
          </p>
        )}
      </div>

      {/* 2. Visa type + D-day */}
      {exp && days !== null && (
        <div className={`glass rounded-lg p-4 text-center font-bold text-lg ${
          days<=0?'bg-red-50 text-red-600':days<=30?'bg-red-50 text-red-600':days<=90?'bg-amber-50 text-[#B8956A]':'bg-green-50 text-green-600'
        }`}>
          <div className="text-xs text-[#6B7280] font-normal mb-1">{L(lang, vl)}</div>
          {days<=0 ? `🚨 ${s.expired}` : `D-${days} (${days} ${s.daysLeft})`}
        </div>
      )}

      {/* 입력 */}
      <div className="glass rounded-lg p-5 space-y-4">
        <Input label="NAME" value={name} onChange={setName} placeholder="HONG GILDONG" />
        <Input label="PASSPORT NO." value={num} onChange={v => setNum(v.toUpperCase())} placeholder="M12345678" mono />
        <div>
          <label className="text-xs text-[#6B7280] font-medium block mb-1.5">VISA EXPIRY</label>
          <input type="date" value={exp} onChange={e => setExp(e.target.value)}
            className="w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-[#B8956A]/30" />
        </div>
      </div>

      {/* 3. Push notification settings */}
      <div className="glass rounded-lg p-5 space-y-3">
        <h3 className="font-bold text-[#111827] text-sm">
          🔔 {lang === 'ko' ? '비자 만료 알림 설정' : lang === 'zh' ? '签证到期提醒设置' : 'Visa Expiry Reminders'}
        </h3>
        {notifOptions.map(opt => (
          <label key={opt.key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-[#6B7280]">{L(lang, opt.label)}</span>
            <button onClick={() => toggleNotif(opt.key)}
              className={`w-10 h-6 rounded-full transition-all relative ${notifPrefs[opt.key] ? 'bg-[#B8956A]' : 'bg-[#D1D1D6]'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifPrefs[opt.key] ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </label>
        ))}
        <p className="text-[10px] text-[#9CA3AF] mt-2">
          {lang === 'ko' ? '⚙️ 서버 연동 후 활성화 예정' : lang === 'zh' ? '⚙️ 服务器对接后激活' : '⚙️ Will be activated after server integration'}
        </p>
        <div className="mt-3 p-3 bg-[#FFF3E0] border border-[#FFB74D]/30 rounded-xl">
          <p className="text-[11px] text-[#E65100] leading-relaxed">
            ⚠️ {lang === 'ko' ? '체류기간 만료 시 범칙금·과태료 부과 대상' : lang === 'zh' ? '居留期满将被处以罚款·滞纳金' : 'Overstay may result in fines or penalties'}
          </p>
        </div>
      </div>

      {/* 4. Hi-Korea reservation button */}
      <a href="https://www.hikorea.go.kr/resv/ResveInfo.pt" target="_blank" rel="noopener noreferrer"
        className="block w-full bg-white text-center rounded-lg p-4 card-hover btn-press border border-[#B8956A]/30 shadow-sm">
        <span className="text-[#B8956A] font-bold text-base">
          🏛️ {lang === 'ko' ? '비자 연장 신청하러 가기' : lang === 'zh' ? '前往申请签证延期' : 'Apply for Visa Extension'}
        </span>
        <p className="text-[#6B7280] text-xs mt-1">Hi-Korea</p>
      </a>

      {/* 5. Save + Reset */}
      <button onClick={save}
        className="w-full bg-[#111827] text-white font-semibold py-3.5 rounded-lg hover:bg-[#1F2937] transition-all btn-press">
        {saved ? '✅' : s.saveProfile}
      </button>
      <button onClick={() => { localStorage.removeItem('visa_profile'); localStorage.removeItem('edu_state'); localStorage.removeItem('visa_notif_prefs'); setProfile(null) }}
        className="w-full text-[#9CA3AF] text-xs py-2 hover:text-[#6B7280]">
        {lang === 'ko' ? '프로필 재설정' : lang === 'zh' ? '重置资料' : 'Reset Profile'}
      </button>
    </div>
  )
}
function Input({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <label className="text-xs text-[#6B7280] font-medium block mb-1.5">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-[#B8956A]/30 placeholder:text-[#9CA3AF] ${mono ? 'font-mono tracking-wider' : ''}`} />
    </div>
  )
}

function DocumentAuthGuide({ lang, onBack }) {
  const d = documentAuth
  return (
    <div className="space-y-4 animate-fade-up">
      <button onClick={onBack} className="text-[#B8956A] text-sm font-medium">{t[lang].back}</button>
      <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E5E7EB]">
        <div className="text-xl font-bold">{L(lang, d.title)}</div>
        <div className="text-sm text-[#6B7280] mt-1">{L(lang, d.subtitle)}</div>
      </div>
      <Section title={lang==='ko'?'인증 대상 서류':lang==='zh'?'需认证的文件':'Documents Requiring Authentication'}>
        <div className="space-y-2">
          {d.documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[#6B7280]">
              <span>{doc.icon}</span><span>{L(lang, doc.name)}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title={lang==='ko'?'인증 절차':lang==='zh'?'认证流程':'Authentication Process'}>
        <div className="space-y-4">
          {d.steps.map((s, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-[#B8956A]/10 rounded-full flex items-center justify-center text-sm shrink-0">{s.icon}</div>
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
              <span className="font-mono text-[#B8956A] bg-[#111827] px-2 py-0.5 rounded text-xs shrink-0">{item.visa}</span>
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

function VisaTab({ profile, lang, view, setView, selCat, setSelCat, selVisa, setSelVisa, sq, setSq }) {
  const s = t[lang]
  const [showDocAuth, setShowDocAuth] = useState(false)
  const [subTab, setSubTab] = useState(view === 'agency' ? 'agency' : 'browse')
  const rgn = ['china_hk','china_macau','china_taiwan'].includes(profile.nationality) ? 'hkMoTw' : 'mainland'
  const selCategory = c => { setSelCat(c); setView('category'); setSq('') }
  const selVisaFn = v => { setSelVisa(v); setView('detail'); setSq('') }
  const back = () => { if (view==='detail' && selCat) { setView('category'); setSelVisa(null) } else { setView('home'); setSelCat(null); setSelVisa(null); setShowDocAuth(false) } }

  if (showDocAuth) return <div className="space-y-5"><DocumentAuthGuide lang={lang} onBack={() => setShowDocAuth(false)} /></div>

  return (
    <div className="space-y-5">
      {/* Sub-tabs: Browse / Transition */}
      <div className="flex gap-2">
        <button onClick={() => setSubTab('browse')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${subTab === 'browse' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
          {lang === 'ko' ? '비자 정보' : lang === 'zh' ? '签证信息' : 'Visa Info'}
        </button>
        <button onClick={() => setSubTab('transition')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${subTab === 'transition' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
          {lang === 'ko' ? '비자 변경' : lang === 'zh' ? '签证变更' : 'Visa Change'}
        </button>
        <button onClick={() => setSubTab('agency')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${subTab === 'agency' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
          {lang === 'ko' ? '서류 대행' : lang === 'zh' ? '文件代办' : 'Docs'}
        </button>
      </div>

      {subTab === 'agency' ? (
        <AgencyTab profile={profile} lang={lang} />
      ) : subTab === 'transition' ? (
        <TransitionTab profile={profile} lang={lang} />
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
                  <div className="text-xs text-[#B8956A] mt-2">{lang==='ko'?'공증 · 번역 · 아포스티유 안내 →':lang==='zh'?'公证 · 翻译 · 海牙认证指南 →':'Notarization · Translation · Apostille Guide →'}</div>
                </button>
                <ComparisonTable lang={lang} />

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

                {/* 비자 승인 팁 */}
                {approvalTips?.length > 0 && (
                <div className="bg-[#F8F9FA] rounded-lg p-5 border border-[#E5E7EB] space-y-2">
                  <h3 className="text-base font-bold text-[#111827]">{lang === 'ko' ? '승인률 높이는 팁' : lang === 'zh' ? '提高通过率的技巧' : 'Approval Tips'}</h3>
                  {approvalTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs text-[#111827] mt-0.5">{i + 1}.</span>
                      <p className="text-xs text-[#374151]">{L(lang, tip)}</p>
                    </div>
                  ))}
                </div>
                )}

                <h2 className="text-base font-bold text-[#111827]">{s.categories}</h2>
                <CategoryCards onSelect={selCategory} lang={lang} />
              </>
          }
        </>
      )}
    </div>
  )
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 40, fontFamily: 'monospace', fontSize: 14, color: 'red', whiteSpace: 'pre-wrap' }}>
        <h2>Runtime Error</h2>
        <p>{this.state.error.message}</p>
        <p>{this.state.error.stack}</p>
        <button onClick={() => { localStorage.clear(); window.location.reload() }}
          style={{ marginTop: 20, padding: '10px 20px', background: '#111', color: '#fff', border: 0, borderRadius: 8 }}>
          Reset & Reload
        </button>
      </div>
    )
    return this.props.children
  }
}

function AppInner() {
  const [lang, setLang] = useState('ko')
  const [profile, setProfile] = useState(() => loadProfile())
  const [showNotice, setShowNotice] = useState(false)
  const [tab, setTab] = useState('home')
  const [view, setView] = useState('home')
  const [selCat, setSelCat] = useState(null)
  const [selVisa, setSelVisa] = useState(null)
  const [sq, setSq] = useState('')
  const [exchangeRate, setExchangeRate] = useState(null)
  const [hoveredTab, setHoveredTab] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [fontSize, setFontSize] = useState('normal')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('hp-dark') === '1')
  useEffect(() => { localStorage.setItem('hp-dark', darkMode ? '1' : '0') }, [darkMode])
  const s = t[lang]

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/KRW').then(r => r.json()).then(data => {
      const r = data.rates || {}
      const toKRW = code => r[code] ? Math.round((1 / r[code]) * 100) / 100 : null
      setExchangeRate({
        CNY: toKRW('CNY'), HKD: toKRW('HKD'), TWD: toKRW('TWD'), MOP: toKRW('MOP'),
        USD: toKRW('USD'), JPY: toKRW('JPY'), VND: toKRW('VND'), PHP: toKRW('PHP'), THB: toKRW('THB'),
        _date: data.date || null,
      })
    }).catch(() => {})
  }, [])

  if (!profile) return <Onboarding lang={lang} setLang={setLang} onComplete={p => { setProfile(p); setLang(p.lang||'zh'); setShowNotice(true) }} />

  const tabs = [
    { id: 'home', label: { ko: '홈', zh: '首页', en: 'Home' } },
    { id: 'transition', label: { ko: '비자', zh: '签证', en: 'Visa' } },
    { id: 'travel', label: { ko: '여행', zh: '旅行', en: 'Travel' } },
    { id: 'food', label: { ko: '맛집', zh: '美食', en: 'Food' } },
    { id: 'shopping', label: { ko: '쇼핑', zh: '购物', en: 'Shopping' } },
    { id: 'hallyu', label: { ko: '한류', zh: '韩流', en: 'Hallyu' } },
    { id: 'learn', label: { ko: '한국어', zh: '韩语', en: 'Korean' } },
    { id: 'life', label: { ko: '생활', zh: '生活', en: 'Life' } },
    { id: 'jobs', label: { ko: '구직', zh: '求职', en: 'Jobs' } },
    { id: 'housing', label: { ko: '부동산', zh: '房产', en: 'Housing' } },
    { id: 'medical', label: { ko: '의료', zh: '医疗', en: 'Medical' } },
    { id: 'fitness', label: { ko: '운동', zh: '运动', en: 'Fitness' } },
    { id: 'translator', label: { ko: '통역', zh: '翻译', en: 'Translate' } },
    { id: 'sos', label: { ko: 'SOS', zh: 'SOS', en: 'SOS' } },
    { id: 'community', label: { ko: '커뮤니티', zh: '社区', en: 'Community' } },
    { id: 'finance', label: { ko: '금융', zh: '金融', en: 'Finance' } },
    { id: 'wallet', label: { ko: '월렛', zh: '钱包', en: 'Wallet' } },
    { id: 'profile', label: { ko: '내정보', zh: '我的', en: 'Me' } },
  ]

  // 29CM-style sub-menus per tab
  const subMenus = {
    transition: {
      title: { ko: '비자 · 서류', zh: '签证 · 文件', en: 'Visa · Docs' },
      items: [
        { label: { ko: '비자 종류별 안내', zh: '签证类型指南', en: 'Visa Types' }, action: () => { setTab('transition'); setView('home') } },
        { label: { ko: '비자 변경/전환', zh: '签证变更', en: 'Visa Change' }, action: () => { setTab('transition'); setView('transition') } },
        { label: { ko: 'D-day 알림', zh: 'D-day提醒', en: 'D-day Alert' }, action: () => { setTab('visaalert') } },
        { label: { ko: '서류 대행', zh: '文件代办', en: 'Document Services' }, action: () => { setTab('transition'); setView('agency') } },
        { label: { ko: '자동 상담', zh: '自动咨询', en: 'Auto Consult' }, action: () => { setTab('chat') } },
      ],
    },
    travel: {
      title: { ko: '여행', zh: '旅行', en: 'Travel' },
      items: [
        { label: { ko: '입국 가이드', zh: '入境指南', en: 'Arrival Guide' } },
        { label: { ko: '도시 가이드', zh: '城市指南', en: 'City Guides' } },
        { label: { ko: '교통', zh: '交通', en: 'Transportation' } },
        { label: { ko: '숙소', zh: '住宿', en: 'Accommodation' } },
        { label: { ko: '코스 추천', zh: '行程推荐', en: 'Itineraries' } },
        { label: { ko: '테마파크', zh: '主题公园', en: 'Theme Parks' } },
      ],
    },
    food: {
      title: { ko: '맛집', zh: '美食', en: 'Food' },
      items: [
        { label: { ko: '미슐랭 가이드', zh: '米其林指南', en: 'Michelin Guide' } },
        { label: { ko: '블루리본', zh: '蓝丝带', en: 'Blue Ribbon' } },
        { label: { ko: '지역별', zh: '按地区', en: 'By Area' } },
        { label: { ko: '종류별', zh: '按类型', en: 'By Cuisine' } },
        { label: { ko: '가격대별', zh: '按价格', en: 'By Price' } },
        { label: { ko: '범범뻠 PICK', zh: '范范呗精选', en: "Editor's Pick" } },
      ],
    },
    shopping: {
      title: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
      items: [
        { label: { ko: 'K-뷰티', zh: 'K-Beauty', en: 'K-Beauty' } },
        { label: { ko: 'K-패션', zh: 'K-Fashion', en: 'K-Fashion' } },
        { label: { ko: '면세/택스리펀', zh: '免税/退税', en: 'Duty-free/Tax Refund' } },
        { label: { ko: '할인/쿠폰', zh: '折扣/优惠', en: 'Coupons' } },
      ],
    },
    hallyu: {
      title: { ko: '한류', zh: '韩流', en: 'Hallyu' },
      items: [
        { label: { ko: 'K-POP 차트', zh: 'K-POP榜单', en: 'K-POP Chart' } },
        { label: { ko: '내 아이돌', zh: '我的爱豆', en: 'My Idols' } },
        { label: { ko: 'K-드라마', zh: '韩剧', en: 'K-Drama' } },
        { label: { ko: '팬 이벤트', zh: '粉丝活动', en: 'Fan Events' } },
        { label: { ko: '전통 체험', zh: '传统体验', en: 'Traditional' } },
        { label: { ko: '축제', zh: '节日', en: 'Festivals' } },
      ],
    },
    life: {
      title: { ko: '생활', zh: '生活', en: 'Life' },
      items: [
        { label: { ko: '환율 계산기', zh: '汇率计算器', en: 'Currency' } },
        { label: { ko: '택배/배송', zh: '快递/配送', en: 'Delivery' } },
        { label: { ko: '의료/병원', zh: '医疗/医院', en: 'Medical' }, action: () => { setTab('medical') } },
        { label: { ko: '통신/SIM', zh: '通信/SIM', en: 'Telecom' } },
        { label: { ko: '금융 가이드', zh: '金融指南', en: 'Finance Guide' }, action: () => { setTab('finance') } },
      ],
    },
    jobs: {
      title: { ko: '구직', zh: '求职', en: 'Jobs' },
      items: [
        { label: { ko: '아르바이트', zh: '兼职', en: 'Part-time' } },
        { label: { ko: '정규직', zh: '全职', en: 'Full-time' } },
        { label: { ko: '취업 가이드', zh: '就业指南', en: 'Job Guide' } },
        { label: { ko: '이력서 변환', zh: '简历转换', en: 'Resume Builder' }, action: () => { setTab('resume') } },
      ],
    },
    housing: {
      title: { ko: '부동산', zh: '房产', en: 'Housing' },
      items: [
        { label: { ko: '원룸/셰어하우스', zh: '单间/合租', en: 'Studio/Share' } },
        { label: { ko: '전월세 가이드', zh: '租房指南', en: 'Rent Guide' } },
        { label: { ko: '실거래가', zh: '实际交易价', en: 'Price Check' } },
      ],
    },
    medical: {
      title: { ko: '의료', zh: '医疗', en: 'Medical' },
      items: [
        { label: { ko: '병원 검색', zh: '医院搜索', en: 'Hospital Search' } },
        { label: { ko: '건강보험 가이드', zh: '健康保险指南', en: 'Health Insurance' } },
        { label: { ko: '응급실 안내', zh: '急诊室指南', en: 'Emergency' } },
        { label: { ko: '외국어 진료', zh: '外语诊疗', en: 'Foreign Language' } },
      ],
    },
    fitness: {
      title: { ko: '운동', zh: '运动', en: 'Fitness' },
      items: [
        { label: { ko: '공공 체육시설', zh: '公共体育设施', en: 'Public Facilities' } },
        { label: { ko: '헬스장', zh: '健身房', en: 'Gym' } },
        { label: { ko: '수영장', zh: '游泳池', en: 'Pool' } },
        { label: { ko: '요가/필라테스', zh: '瑜伽/普拉提', en: 'Yoga/Pilates' } },
      ],
    },
    translator: {
      title: { ko: '통역 · 번역', zh: '口译 · 翻译', en: 'Interpreter · Translator' },
      items: [
        { label: { ko: '실시간 통역', zh: '实时口译', en: 'Real-time Translation' }, action: () => { setTab('translator') } },
        { label: { ko: '간판 사전', zh: '招牌词典', en: 'Sign Dictionary' }, action: () => { setTab('artranslate') } },
      ],
    },
    wallet: {
      title: { ko: '디지털 월렛', zh: '数字钱包', en: 'Digital Wallet' },
      items: [
        { label: { ko: '신분증 보관', zh: '证件保管', en: 'ID Storage' }, action: () => { setTab('wallet') } },
        { label: { ko: '이름 관리', zh: '姓名管理', en: 'Name Management' }, action: () => { setTab('wallet') } },
        { label: { ko: '본인인증 가이드', zh: '身份验证指南', en: 'Verification Guide' }, action: () => { setTab('wallet') } },
        { label: { ko: '만료 알림', zh: '到期提醒', en: 'Expiry Alert' }, action: () => { setTab('wallet') } },
      ],
    },
    learn: {
      title: { ko: '한국어', zh: '韩语', en: 'Korean' },
      items: [
        { label: { ko: '한국어 학습', zh: '韩语学习', en: 'Korean Study' } },
        { label: { ko: '대학교 검색', zh: '大学搜索', en: 'University Search' } },
        { label: { ko: 'TOPIK 가이드', zh: 'TOPIK指南', en: 'TOPIK Guide' } },
      ],
    },
  }

  // Show sub-menu: on hover (desktop) or on tap when already on that tab (mobile)
  const showSubMenu = hoveredTab ? subMenus[hoveredTab] : (menuOpen ? subMenus[tab] : null)

  const heroData = {
    home: { title: null, sub: null },
    transition: {
      title: { ko: '비자 · 서류.', zh: '签证 · 文件。', en: 'Visa · Docs.' },
      sub: { ko: '비자 안내부터 서류 대행까지.', zh: '从签证指南到文件代办。', en: 'Visa guides and document services.' },
    },
    travel: {
      title: { ko: '여행.', zh: '旅行。', en: 'Travel.' },
      sub: { ko: '한국 여행의 모든 것.', zh: '韩国旅行的一切。', en: 'Everything about traveling Korea.' },
    },
    food: {
      title: { ko: '맛집.', zh: '美食。', en: 'Food.' },
      sub: { ko: '미슐랭부터 블루리본까지.', zh: '从米其林到蓝丝带。', en: 'From Michelin to Blue Ribbon.' },
    },
    shopping: {
      title: { ko: '쇼핑.', zh: '购物。', en: 'Shopping.' },
      sub: { ko: '한국에서 스마트하게 쇼핑하기.', zh: '在韩国聪明购物。', en: 'Shop smart in Korea.' },
    },
    hallyu: {
      title: { ko: '한류.', zh: '韩流。', en: 'Hallyu.' },
      sub: { ko: 'K-POP, 드라마, 아이돌, 전통문화.', zh: 'K-POP、韩剧、爱豆、传统文化。', en: 'K-POP, drama, idols, culture.' },
    },
    learn: {
      title: { ko: '쉬운 한국어.', zh: '轻松韩语。', en: 'Easy Korean.' },
      sub: { ko: '매일 10분, 한국어가 쉬워집니다.', zh: '每天10分钟，韩语变简单。', en: '10 minutes a day, Korean made easy.' },
    },
    life: {
      title: { ko: '생활.', zh: '生活。', en: 'Life.' },
      sub: { ko: '한국 생활에 유용한 도구 모음.', zh: '韩国生活实用工具集。', en: 'Useful tools for life in Korea.' },
    },
    work: {
      title: { ko: '구직 · 집.', zh: '工作 · 房。', en: 'Work · Housing.' },
      sub: { ko: '취업부터 집 구하기까지.', zh: '从就业到找房。', en: 'From jobs to housing.' },
    },
    translator: {
      title: { ko: '통역.', zh: '翻译。', en: 'Translation.' },
      sub: { ko: '실시간 통역과 간판 사전.', zh: '实时翻译和招牌词典。', en: 'Real-time translation and sign dictionary.' },
    },
    artranslate: {
      title: { ko: '간판 사전.', zh: '招牌词典。', en: 'Sign Dictionary.' },
      sub: { ko: '카메라로 간판을 보면서 아래 사전에서 검색하세요.', zh: '对照相机中的招牌，在下方词典中搜索。', en: 'View signs with camera and look up in the dictionary below.' },
    },
    sos: {
      title: { ko: '긴급 SOS.', zh: '紧急SOS。', en: 'Emergency SOS.' },
      sub: { ko: '위급할 때 도움을 요청하세요.', zh: '紧急时刻寻求帮助。', en: 'Request help in emergencies.' },
    },
    community: {
      title: { ko: '커뮤니티.', zh: '社区。', en: 'Community.' },
      sub: { ko: '정보 공유와 중고거래 플랫폼.', zh: '信息分享和二手交易平台。', en: 'Info sharing and marketplace platform.' },
    },
    visaalert: {
      title: { ko: 'D-day 알림.', zh: 'D-day提醒。', en: 'D-day Alert.' },
      sub: { ko: '비자 만료일 관리와 스마트 알림.', zh: '签证到期日管理和智能提醒。', en: 'Visa expiry management and smart alerts.' },
    },
    finance: {
      title: { ko: '금융 가이드.', zh: '金融指南。', en: 'Finance Guide.' },
      sub: { ko: '은행, 송금, 신용, 세금 완벽 가이드.', zh: '银行、汇款、信用、税务完整指南。', en: 'Complete guide to banking, remittance, credit, tax.' },
    },
    resume: {
      title: { ko: '이력서 변환.', zh: '简历转换。', en: 'Resume Builder.' },
      sub: { ko: '한국식 이력서 자동 생성 도구.', zh: '韩式简历自动生成工具。', en: 'Auto-generate Korean-style resume.' },
    },
    wallet: {
      title: { ko: '내 월렛.', zh: '我的钱包。', en: 'My Wallet.' },
      sub: { ko: '신분증, 서류, 이름을 한곳에서.', zh: '证件、文件、姓名，一处管理。', en: 'IDs, docs, and names in one place.' },
    },
    profile: {
      title: { ko: '내 정보.', zh: '我的信息。', en: 'My Info.' },
      sub: { ko: '비자, 알림, 설정을 한곳에서.', zh: '签证、提醒、设置，一处管理。', en: 'Visa, alerts, settings in one place.' },
    },
  }

  const currentHero = heroData[tab] || heroData.home

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#111827]' : 'bg-white'}`} style={{ fontSize: fontSize === 'large' ? '18px' : fontSize === 'small' ? '14px' : '16px' }}>
      {showNotice && <NoticePopup lang={lang} onClose={() => setShowNotice(false)} />}

      {/* Header — 29CM style: logo left, icons right */}
      <div className="bg-white border-b border-[#E5E7EB] px-5 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNotice(true)} className="text-[#6B7280] text-[11px] hover:text-[#111827] transition-all">{lang==='ko'?'공지':lang==='zh'?'公告':'Notice'}</button>
            <span className="text-[#E5E7EB]">|</span>
            <button onClick={() => setLang(nextLang(lang))} className="text-[#6B7280] text-[11px] hover:text-[#111827] transition-all">{langLabel(lang)}</button>
            <span className="text-[#E5E7EB]">|</span>
            <button onClick={() => setFontSize(f => f === 'normal' ? 'large' : f === 'large' ? 'small' : 'normal')} className="text-[#6B7280] text-[11px] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-white transition-all">
              {fontSize === 'large' ? 'A-' : fontSize === 'small' ? 'A' : 'A+'}
            </button>
            <span className="text-[#E5E7EB] dark:text-[#374151]">|</span>
            <button onClick={() => setDarkMode(d => !d)} className="text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-white transition-all">
              {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <span className="text-[#E5E7EB]">|</span>
            <button onClick={() => {
              if (window.confirm(lang === 'ko' ? '로그아웃 하시겠습니까?' : lang === 'zh' ? '确定要退出登录吗？' : 'Log out?')) {
                localStorage.clear()
                window.location.reload()
              }
            }} className="text-[#6B7280] text-[11px] hover:text-[#111827] transition-all">{lang==='ko'?'로그아웃':lang==='zh'?'退出':' Logout'}</button>
          </div>
        </div>
      </div>

      {/* 29CM-style Tab Navigation */}
      <div className="apple-top-nav" onMouseLeave={() => setHoveredTab(null)}>
        <div className="tab-row">
          {tabs.map(item => (
            <button key={item.id}
              onClick={() => {
                if (tab === item.id && subMenus[item.id]) {
                  // Already on this tab — toggle sub-menu (mobile)
                  setMenuOpen(!menuOpen)
                } else {
                  setTab(item.id)
                  setMenuOpen(false)
                  setHoveredTab(null)
                  if(item.id==='home'){setView('home');setSelCat(null);setSelVisa(null);setSq('')}
                }
              }}
              onMouseEnter={() => setHoveredTab(item.id)}
              className={`apple-tab-item ${tab===item.id ? 'apple-tab-active' : ''}`}>
              {L(lang, item.label)}
            </button>
          ))}
        </div>
        {/* Sub-menu dropdown */}
        {showSubMenu && (
          <div className="sub-menu-panel">
            <p className="sub-menu-title">{L(lang, showSubMenu.title)}</p>
            <div className="sub-menu-grid">
              {showSubMenu.items.map((item, i) => (
                <div key={i} className="sub-menu-item"
                  onClick={() => { if (item.action) item.action(); setHoveredTab(null); setMenuOpen(false); }}>
                  {L(lang, item.label)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hero Section */}
      {currentHero.title && (
        <div className="hero-section">
          <h1 className="hero-title">
            {typeof currentHero.title === 'string' ? currentHero.title : L(lang, currentHero.title)}
          </h1>
          {currentHero.sub && <p className="hero-subtitle">{L(lang, currentHero.sub)}</p>}
        </div>
      )}

      {/* Content */}
      <div className="px-5 pt-2 pb-8">
        {tab==='home' && <HomeTab profile={profile} lang={lang} exchangeRate={exchangeRate} setTab={setTab} />}
        {tab==='transition' && <VisaTab profile={profile} lang={lang} view={view} setView={setView} selCat={selCat} setSelCat={setSelCat} selVisa={selVisa} setSelVisa={setSelVisa} sq={sq} setSq={setSq} />}
        {tab==='chat' && <ChatTab profile={profile} lang={lang} />}
        {tab==='profile' && <ProfileTab profile={profile} setProfile={setProfile} lang={lang} />}
        {tab==='learn' && <EducationTab lang={lang} />}
        {tab==='travel' && <TravelTab lang={lang} setTab={setTab} />}
        {tab==='food' && <FoodTab lang={lang} setTab={setTab} />}
        {tab==='shopping' && <ShoppingTab lang={lang} setTab={setTab} />}
        {tab==='hallyu' && <HallyuTab lang={lang} setTab={setTab} />}
        {tab==='life' && <LifeToolsTab lang={lang} setTab={setTab} />}
        {tab==='jobs' && <JobsTab lang={lang} profile={profile} />}
        {tab==='housing' && <HousingTab lang={lang} profile={profile} />}
        {tab==='medical' && <MedicalTab lang={lang} />}
        {tab==='fitness' && <FitnessTab lang={lang} />}
        {tab==='translator' && <TranslatorTab lang={lang} />}
        {tab==='artranslate' && <ARTranslateTab lang={lang} />}
        {tab==='sos' && <SOSTab lang={lang} profile={profile} />}
        {tab==='community' && <CommunityTab lang={lang} profile={profile} />}
        {tab==='visaalert' && <VisaAlertTab lang={lang} profile={profile} />}
        {tab==='finance' && <FinanceTab lang={lang} profile={profile} />}
        {tab==='resume' && <ResumeTab lang={lang} profile={profile} />}
        {tab==='wallet' && <DigitalWalletTab lang={lang} profile={profile} />}
        {tab==='fan' && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <p className="text-sm text-[#9CA3AF]">{lang === 'ko' ? '준비 중입니다' : lang === 'zh' ? '准备中' : 'Coming soon'}</p>
          </div>
        )}
        {tab==='agency' && <AgencyTab profile={profile} lang={lang} />}
        <div className="mt-12 mb-6 text-center text-[11px] text-[#9CA3AF] space-y-1">
          <p className="text-[9px] text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
            {lang === 'ko' ? '본 앱의 정보는 참고용이며 법적 효력이 없습니다. 비자, 법률, 의료 관련 사항은 반드시 관련 기관에 직접 확인하시기 바랍니다.' 
            : lang === 'zh' ? '本应用信息仅供参考，不具有法律效力。签证、法律、医疗相关事项请务必直接向相关机构确认。'
            : 'Information in this app is for reference only and has no legal effect. Please verify visa, legal, and medical matters directly with relevant authorities.'}
          </p>
          <p>© 2026 HanPocket. All rights reserved.</p>
        </div>
      </div>
      <FloatingChatbot lang={lang} />
    </div>
  )
}

// ─── Floating Chatbot (개선 요청) ───
function FloatingChatbot({ lang }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [category, setCategory] = useState(null)
  const scrollRef = useRef(null)

  const categories = [
    { id: 'bug', label: { ko: '버그 신고', zh: '报告Bug', en: 'Report Bug' } },
    { id: 'feature', label: { ko: '기능 제안', zh: '功能建议', en: 'Suggest Feature' } },
    { id: 'content', label: { ko: '콘텐츠 요청', zh: '内容请求', en: 'Content Request' } },
    { id: 'other', label: { ko: '기타 문의', zh: '其他咨询', en: 'Other' } },
  ]

  const greeting = {
    ko: '안녕하세요! HanPocket 개선 요청을 남겨주세요. 어떤 종류인가요?',
    zh: '您好！请留下HanPocket改进建议。请选择类型：',
    en: 'Hi! Leave your feedback for HanPocket. What type?',
  }

  const afterCategory = {
    ko: '내용을 자유롭게 적어주세요!',
    zh: '请详细描述您的建议！',
    en: 'Please describe in detail!',
  }

  const thanks = {
    ko: '감사합니다! 소중한 의견 반영하겠습니다.',
    zh: '谢谢！我们会认真考虑您的建议。',
    en: 'Thank you! We\'ll review your feedback.',
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleOpen = () => {
    setOpen(true)
    if (messages.length === 0) {
      setMessages([{ from: 'bot', text: greeting[lang] || greeting.en }])
    }
  }

  const selectCategory = (cat) => {
    setCategory(cat.id)
    setMessages(prev => [
      ...prev,
      { from: 'user', text: L(lang, cat.label) },
      { from: 'bot', text: afterCategory[lang] || afterCategory.en },
    ])
  }

  const sendMessage = () => {
    if (!input.trim()) return
    const feedback = { category, message: input.trim(), timestamp: new Date().toISOString(), lang }
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('hp_feedback') || '[]')
    existing.push(feedback)
    localStorage.setItem('hp_feedback', JSON.stringify(existing))

    setMessages(prev => [
      ...prev,
      { from: 'user', text: input.trim() },
      { from: 'bot', text: thanks[lang] || thanks.en },
    ])
    setInput('')
    setCategory(null)
    setTimeout(() => setOpen(false), 2000)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#111827] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <MessageCircle size={20} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[320px] h-[420px] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#111827]">
            <span className="text-sm font-bold text-white">{lang === 'ko' ? '개선 요청' : lang === 'zh' ? '改进建议' : 'Feedback'}</span>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                  msg.from === 'user'
                    ? 'bg-[#111827] text-white rounded-br-sm'
                    : 'bg-[#F3F4F6] text-[#374151] rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Category buttons */}
            {!category && messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => selectCategory(cat)}
                    className="text-[10px] px-3 py-1.5 rounded-full bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] transition-colors font-medium">
                    {L(lang, cat.label)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          {category && (
            <div className="px-3 py-2 border-t border-[#E5E7EB] flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={lang === 'ko' ? '내용을 입력하세요...' : lang === 'zh' ? '请输入内容...' : 'Type your feedback...'}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border-none outline-none focus:ring-2 focus:ring-[#111827]/20"
              />
              <button onClick={sendMessage} className="px-3 py-2 bg-[#111827] text-white text-xs font-bold rounded-lg hover:bg-[#374151] transition-colors">
                {lang === 'ko' ? '전송' : lang === 'zh' ? '发送' : 'Send'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default function App() {
  return <ErrorBoundary><AppInner /></ErrorBoundary>
}
