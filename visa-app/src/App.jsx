import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import useDarkMode from './hooks/useDarkMode'
import { isPushSupported, subscribePush, scheduleDdayCheck, cacheVisaProfile, registerPeriodicSync } from './utils/pushNotification'
import { initKakao, loginWithKakao, loginWithKakaoPopup, logoutFromKakao, getKakaoUser, isKakaoLoggedIn, handleKakaoCallback } from './utils/kakaoAuth'
import { loginWithApple, logoutFromApple, getAppleUser, isAppleLoggedIn, handleAppleCallback } from './utils/appleAuth'

// import { initServiceWorker, forceProfileDataRefresh, clearUserCache } from './utils/sw-update'
import { initGA, setConsentMode, trackPageView, trackLogin, trackTabSwitch, trackLanguageChange, trackKakaoEvent } from './utils/analytics'
import { MessageCircle, X, Home, Shield, Grid3x3, Wrench, User, Users, Search, ChevronLeft, Globe, Calendar, Bell, Save, Trash2, Pencil, LogOut, Settings, ChevronRight, HelpCircle, MapPin, Menu, Moon, Sun, Footprints, Map, Compass, Layers, Wallet, BookOpen } from 'lucide-react'
import { visaCategories, visaTypes, quickGuide, regionComparison, documentAuth, passportRequirements, immigrationQuestions, approvalTips } from './data/visaData'
import { visaTransitions, visaOptions, nationalityOptions } from './data/visaTransitions'
import { t } from './data/i18n'
import { generateChatResponse } from './data/chatResponses'
import { updateLog, autoUpdateInfo, dataSources } from './data/updateLog'
import HomeTab, { trackActivity } from './components/HomeTab'
import { pocketCategories, featureScores, serviceItems, subMenuData, IMPLEMENTED_POCKETS } from './data/pockets'
import AffiliateTracker from './components/AffiliateTracker'
import LoadingSpinner from './components/LoadingSpinner'
import PWAInstallPrompt from './components/PWAInstallPrompt'
// OnboardingSimple import removed — replaced by auth popup
import PocketContent from './components/pockets/PocketContent'
import OfflineNotice from './components/common/OfflineNotice'
import ErrorBoundary from './components/common/ErrorBoundary'

// Lazy-loaded tab components for better code splitting
const EducationTab = lazy(() => import('./components/EducationTab'))
const AgencyTab = lazy(() => import('./components/AgencyTab'))
const PetTab = lazy(() => import('./components/PetTab'))
const MedicalTab = lazy(() => import('./components/MedicalTab'))
const FitnessTab = lazy(() => import('./components/FitnessTab'))
const ShoppingTab = lazy(() => import('./components/ShoppingTab'))
const CultureTab = lazy(() => import('./components/CultureTab'))
const LifeToolsTab = lazy(() => import('./components/LifeToolsTab'))
const JobsTab = lazy(() => import('./components/JobsTab'))
const HousingTab = lazy(() => import('./components/HousingTab'))
const TravelTab = lazy(() => import('./components/TravelTab'))
const FoodTab = lazy(() => import('./components/FoodTab'))
const HallyuTab = lazy(() => import('./components/HallyuTab'))
const TranslatorTab = lazy(() => import('./components/TranslatorTab'))
const ARTranslateTab = lazy(() => import('./components/ARTranslateTab'))
const SOSTab = lazy(() => import('./components/SOSTab'))
const CommunityTab = lazy(() => import('./components/CommunityTab'))
const VisaAlertTab = lazy(() => import('./components/VisaAlertTab'))
const FinanceTab = lazy(() => import('./components/FinanceTab'))
const ResumeTab = lazy(() => import('./components/ResumeTab'))
const DigitalWalletTab = lazy(() => import('./components/DigitalWalletTab'))
const CourseTab = lazy(() => import('./components/CourseTab'))
const SearchTab = lazy(() => import('./components/SearchTab'))
const KoreanTab = lazy(() => import('./components/KoreanTab'))
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
    <svg width={160 * sc} height={28 * sc} viewBox="0 0 160 28" fill="none">
      {/* HANPOCKET 텍스트 */}
      <text x="80" y="19" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="300" fontSize="18" letterSpacing="0.25em" fill="var(--text-primary)">
        HANPOCKET
      </text>


    </svg>
  )
}

// 기존 온보딩은 OnboardingSimple.jsx로 교체됨 (Onboarding_Legacy 삭제)

function NoticePopup({ lang, onClose }) {
  const s = t[lang]
  const handleDismiss = (type) => {
    if (type === 'forever') {
      localStorage.setItem('hp_notice_dismiss', 'forever')
    } else if (type === 'today') {
      localStorage.setItem('hp_notice_dismiss', new Date().toDateString())
    }
    onClose()
  }
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
                {idx === 0 && <span className="text-xs bg-[#111827]/10 text-[#111827] px-2 py-0.5 rounded-full">NEW</span>}
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
        <div className="p-4 border-t border-[#E5E7EB] space-y-2">
          <button onClick={() => handleDismiss('close')} className="w-full bg-[#111827] text-white font-semibold py-3 rounded-xl hover:bg-[#1F2937] transition-all btn-press">
            {s.noticeClose}
          </button>
          <div className="flex justify-center gap-4">
            <button onClick={() => handleDismiss('today')} className="text-[11px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
              {lang === 'ko' ? '오늘 하루 보지 않기' : lang === 'zh' ? '今天不再显示' : "Don't show today"}
            </button>
            <span className="text-[11px] text-[#D1D5DB]">|</span>
            <button onClick={() => handleDismiss('forever')} className="text-[11px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
              {lang === 'ko' ? '다시 보지 않기' : lang === 'zh' ? '不再显示' : "Don't show again"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
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

function TransitionTab({ profile, lang }) {
  const s = t[lang]; const data = visaTransitions[profile.currentVisa || 'none']
  const rgn = ['china_hk','china_macau','china_taiwan'].includes(profile.nationality) ? 'hkMoTw' : 'mainland'
  if (!data) return <div className="text-center text-[#6B7280] py-12">{lang==='ko'?'비자 변경 정보가 없습니다.':lang==='zh'?'没有签证变更信息。':'No transition info.'}</div>
  const trans = data.transitions.filter(tr => rgn==='mainland' ? !tr.hkMoTwOnly : !tr.mainlandOnly)
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E5E7EB]">
        <div className="text-xs text-[#111827] tracking-wider">{s.myStatus}</div>
        <div className="text-lg font-bold mt-2">{L(lang, data.label)}</div>
        <div className="text-sm text-[#6B7280] mt-1">{s.nationality}: {s[profile.nationality]}</div>
      </div>
      <h2 className="text-base font-bold text-[#111827]">{s.changeOptions}</h2>
      <p className="text-sm text-[#6B7280]">{s.transitionDesc}</p>
      {!trans.length ? <div className="glass rounded-lg p-8 text-center text-[#6B7280]">{lang==='ko'?'변경 가능한 비자가 없습니다.':lang==='zh'?'没有可变更的签证。':'No transitions.'}</div>
        : trans.map((tr, i) => (
          <div key={i} className="glass rounded-lg p-4 animate-fade-up" style={{animationDelay:`${i*0.05}s`}}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-[#111827]/10 rounded-full flex items-center justify-center text-[#111827] text-xs">→</span>
              <span className="font-bold text-[#111827] text-sm">{L(lang, tr.label)}</span>
            </div>
            {tr.conditions[lang]?.map((c, j) => (
              <div key={j} className="flex gap-2 text-sm text-[#6B7280] mb-1"><span className="text-[#111827] shrink-0">✓</span><span>{c}</span></div>
            ))}
          </div>
        ))
      }
      {data.notes && <div className="bg-[#111827]/5 rounded-lg p-4 border border-[#111827]/20"><p className="text-sm text-[#6B7280]">{data.notes[lang]}</p></div>}
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
          placeholder={s.chatPlaceholder} className="flex-1 glass rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#111827]/30 placeholder:text-[#9CA3AF]" />
        <button onClick={send} className="bg-[#111827] text-[#111827] w-12 rounded-lg hover:bg-[#1F2937] transition-all btn-press text-lg">↑</button>
      </div>
    </div>
  )
}

function ProfileTab({ profile, setProfile, lang, onResetPushDismiss, isDark, toggleDarkMode }) {
  // 모달 관리
  const [showDateModal, setShowDateModal] = useState(false)
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [showTimingModal, setShowTimingModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [showVisaModal, setShowVisaModal] = useState(false)

  // 아바타
  const avatarInputRef = useRef(null)
  const [avatar, setAvatar] = useState(() => {
    try { return localStorage.getItem('hanpocket_avatar') || '' } catch { return '' }
  })

  // 닉네임
  const [nickname, setNickname] = useState(() => localStorage.getItem('hanpocket_nickname') || '')
  const [editingNickname, setEditingNickname] = useState(false)

  // 관리자 모드
  const [adminMode, setAdminMode] = useState(() => {
    try { return localStorage.getItem('admin_mode') === 'true' } catch { return false }
  })
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showAdminPwModal, setShowAdminPwModal] = useState(false)
  const [adminPw, setAdminPw] = useState('')
  const [adminPwError, setAdminPwError] = useState(false)
  const [pocketVisibility, setPocketVisibility] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pocket_visibility')) || {} } catch { return {} }
  })

  const handleAdminLogin = () => {
    if (adminPw === '1005') {
      setAdminMode(true)
      localStorage.setItem('admin_mode', 'true')
      setShowAdminPwModal(false)
      setShowAdminPanel(true)
      setAdminPw('')
      setAdminPwError(false)
    } else {
      setAdminPwError(true)
    }
  }

  const handleAdminLogout = () => {
    setAdminMode(false)
    localStorage.setItem('admin_mode', 'false')
    setShowAdminPanel(false)
  }

  // 아바타 업로드 (max 200x200, JPEG 0.7)
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 200
        let w = img.width, h = img.height
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX }
          else { w = Math.round(w * MAX / h); h = MAX }
        }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        setAvatar(dataUrl)
        localStorage.setItem('hanpocket_avatar', dataUrl)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const showToastMessage = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 1500)
  }

  const togglePocketVisibility = (pocketId) => {
    const current = getPocketVisible(pocketId)
    const updated = { ...pocketVisibility, [pocketId]: !current }
    setPocketVisibility(updated)
    localStorage.setItem('pocket_visibility', JSON.stringify(updated))
    const pocket = pocketCategories.flatMap(c => c.pockets).find(p => p.id === pocketId)
    const name = pocket ? L(lang, pocket.name) : pocketId
    showToastMessage(!current
      ? (lang === 'ko' ? `${name} 활성화됨` : lang === 'zh' ? `${name} 已激活` : `${name} activated`)
      : (lang === 'ko' ? `${name} 비활성화됨` : lang === 'zh' ? `${name} 已关闭` : `${name} deactivated`))
  }

  const getPocketVisible = (pocketId) => {
    if (pocketId in pocketVisibility) return pocketVisibility[pocketId]
    return IMPLEMENTED_POCKETS.has(pocketId)
  }

  const setAllPockets = (value) => {
    const updated = {}
    pocketCategories.forEach(cat => cat.pockets.forEach(p => { updated[p.id] = value }))
    setPocketVisibility(updated)
    localStorage.setItem('pocket_visibility', JSON.stringify(updated))
    showToastMessage(value
      ? (lang === 'ko' ? '전체 켜기 완료' : lang === 'zh' ? '全部开启' : 'All enabled')
      : (lang === 'ko' ? '전체 끄기 완료' : lang === 'zh' ? '全部关闭' : 'All disabled'))
  }

  // 비자 만료일 임시 저장
  const [tempDate, setTempDate] = useState('')

  // 알림 설정
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('visa_notif_prefs')) || { d60: true, d30: true, d7: true } }
    catch { return { d60: true, d30: true, d7: true } }
  })

  // 비자 선택 임시 저장
  const [tempVisaType, setTempVisaType] = useState('')

  // 비자 전체 목록
  const VISA_TYPES = [
    { code: 'B-1', label: { ko: 'B-1 (사증면제)', zh: 'B-1 (免签)', en: 'B-1 (Visa Exemption)' } },
    { code: 'B-2', label: { ko: 'B-2 (관광통과)', zh: 'B-2 (旅游过境)', en: 'B-2 (Tourist Transit)' } },
    { code: 'C-3', label: { ko: 'C-3 (단기방문)', zh: 'C-3 (短期访问)', en: 'C-3 (Short-term Visit)' } },
    { code: 'C-4', label: { ko: 'C-4 (단기취업)', zh: 'C-4 (短期就业)', en: 'C-4 (Short-term Employment)' } },
    { code: 'D-1', label: { ko: 'D-1 (문화예술)', zh: 'D-1 (文化艺术)', en: 'D-1 (Culture/Art)' } },
    { code: 'D-2', label: { ko: 'D-2 (유학)', zh: 'D-2 (留学)', en: 'D-2 (Study Abroad)' } },
    { code: 'D-4', label: { ko: 'D-4 (일반연수)', zh: 'D-4 (一般研修)', en: 'D-4 (General Training)' } },
    { code: 'D-5', label: { ko: 'D-5 (취재)', zh: 'D-5 (采访)', en: 'D-5 (Journalism)' } },
    { code: 'D-6', label: { ko: 'D-6 (종교)', zh: 'D-6 (宗教)', en: 'D-6 (Religion)' } },
    { code: 'D-7', label: { ko: 'D-7 (주재)', zh: 'D-7 (驻在)', en: 'D-7 (Intra-company Transfer)' } },
    { code: 'D-8', label: { ko: 'D-8 (기업투자)', zh: 'D-8 (企业投资)', en: 'D-8 (Corporate Investment)' } },
    { code: 'D-9', label: { ko: 'D-9 (무역경영)', zh: 'D-9 (贸易经营)', en: 'D-9 (Trade Management)' } },
    { code: 'D-10', label: { ko: 'D-10 (구직)', zh: 'D-10 (求职)', en: 'D-10 (Job Seeking)' } },
    { code: 'E-1', label: { ko: 'E-1 (교수)', zh: 'E-1 (教授)', en: 'E-1 (Professor)' } },
    { code: 'E-2', label: { ko: 'E-2 (회화지도)', zh: 'E-2 (会话指导)', en: 'E-2 (Foreign Language Instructor)' } },
    { code: 'E-3', label: { ko: 'E-3 (연구)', zh: 'E-3 (研究)', en: 'E-3 (Research)' } },
    { code: 'E-4', label: { ko: 'E-4 (기술지도)', zh: 'E-4 (技术指导)', en: 'E-4 (Technology Transfer)' } },
    { code: 'E-5', label: { ko: 'E-5 (전문직업)', zh: 'E-5 (专门职业)', en: 'E-5 (Professional)' } },
    { code: 'E-6', label: { ko: 'E-6 (예술흥행)', zh: 'E-6 (艺术演出)', en: 'E-6 (Arts/Performance)' } },
    { code: 'E-7', label: { ko: 'E-7 (특정활동)', zh: 'E-7 (特정活动)', en: 'E-7 (Specially Designated)' } },
    { code: 'E-9', label: { ko: 'E-9 (비전문취업)', zh: 'E-9 (非专业就业)', en: 'E-9 (Non-professional Employment)' } },
    { code: 'E-10', label: { ko: 'E-10 (선원취업)', zh: 'E-10 (船员就业)', en: 'E-10 (Crew Employment)' } },
    { code: 'F-1', label: { ko: 'F-1 (방문동거)', zh: 'F-1 (访问同居)', en: 'F-1 (Family Visit)' } },
    { code: 'F-2', label: { ko: 'F-2 (거주)', zh: 'F-2 (居住)', en: 'F-2 (Residence)' } },
    { code: 'F-3', label: { ko: 'F-3 (동반)', zh: 'F-3 (随行)', en: 'F-3 (Dependent Family)' } },
    { code: 'F-4', label: { ko: 'F-4 (재외동포)', zh: 'F-4 (海外同胞)', en: 'F-4 (Overseas Korean)' } },
    { code: 'F-5', label: { ko: 'F-5 (영주)', zh: 'F-5 (永住)', en: 'F-5 (Permanent Residence)' } },
    { code: 'F-6', label: { ko: 'F-6 (결혼이민)', zh: 'F-6 (结婚移民)', en: 'F-6 (Marriage Immigration)' } },
    { code: 'G-1', label: { ko: 'G-1 (기타)', zh: 'G-1 (其他)', en: 'G-1 (Miscellaneous)' } },
    { code: 'H-1', label: { ko: 'H-1 (관광취업)', zh: 'H-1 (观光就业)', en: 'H-1 (Working Holiday)' } },
    { code: 'H-2', label: { ko: 'H-2 (방문취업)', zh: 'H-2 (访问就业)', en: 'H-2 (Visit Employment)' } },
  ]

  // 비자 타입 표시
  const getVisaTypeLabel = () => {
    const vt = profile?.visaType
    if (!vt) return '-'
    const found = VISA_TYPES.find(v => v.code === vt)
    if (found) return L(lang, found.label)
    return vt
  }

  // 한국어 레벨 표시
  const getKoreanLevel = () => {
    try {
      const lv = localStorage.getItem('hanpocket_korean_level') || '1'
      return `Lv.${lv} / 200`
    } catch { return 'Lv.1 / 200' }
  }

  // 비자 만료일 및 D-day 계산
  const expiryDate = profile?.expiryDate
  const days = getDaysUntil(expiryDate)

  // 만료일 수정 버튼 클릭
  const handleEditExpiry = () => {
    setTempDate(expiryDate || '')
    setShowDateModal(true)
  }

  // 만료일 저장
  const handleSaveDate = () => {
    const updatedProfile = { ...profile, expiryDate: tempDate }
    setProfile(updatedProfile)
    saveProfile(updatedProfile)
    setShowDateModal(false)
    setShowNotifModal(true)
  }

  // 비자 선택 저장
  const handleSaveVisa = () => {
    if (!tempVisaType) return
    const updatedProfile = { ...profile, visaType: tempVisaType }
    setProfile(updatedProfile)
    saveProfile(updatedProfile)
    setShowVisaModal(false)
    // 비자 선택 후 만료일 설정으로 이어짐
    setTempDate(expiryDate || '')
    setShowDateModal(true)
  }

  // 알림 설정 Yes
  const handleNotifYes = async () => {
    setShowNotifModal(false)

    if (typeof Notification !== 'undefined') {
      try {
        await Notification.requestPermission()
      } catch (e) {
        console.log('Notification permission request failed:', e)
      }
    }

    setShowTimingModal(true)
  }

  // 알림 시점 저장
  const handleSaveTiming = () => {
    localStorage.setItem('visa_notif_prefs', JSON.stringify(notifPrefs))
    setShowTimingModal(false)
    showToastMessage(lang === 'ko' ? '비자 만료 알림이 설정되었습니다' : lang === 'zh' ? '已设置签证到期提醒' : 'Visa expiry alerts set')
  }

  // 알림 토글
  const toggleNotif = (key) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('visa_profile')
    localStorage.removeItem('visa_notif_prefs')
    localStorage.removeItem('hanpocket_avatar')
    localStorage.removeItem('hanpocket_nickname')
    localStorage.removeItem('hanpocket_korean_level')
    localStorage.removeItem('hanpocket_extra_timezones')
    localStorage.removeItem('hanpocket_widgets')
    setProfile(null)
    showToastMessage(lang === 'ko' ? '로그아웃 되었습니다' : lang === 'zh' ? '已注销' : 'Logged out')
  }

  return (
    <div className="min-h-screen p-4 pb-20 font-['Inter']" style={{ backgroundColor: '#FFFFFF' }}>
      {/* 메인 프로필 카드 */}
      <div className="rounded-2xl p-6 border border-[#E5E7EB]" style={{ backgroundColor: '#FFFFFF' }}>
        {/* 프로필 헤더 */}
        <div className="text-center mb-6">
          {/* 아바타 */}
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center cursor-pointer border-2 border-[#E5E7EB]"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[#9CA3AF]" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#2D5A3D] rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-white text-xs">📷</span>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          {/* 닉네임 */}
          {editingNickname ? (
            <input
              autoFocus
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              onBlur={() => { setEditingNickname(false); localStorage.setItem('hanpocket_nickname', nickname) }}
              onKeyDown={e => { if (e.key === 'Enter') { setEditingNickname(false); localStorage.setItem('hanpocket_nickname', nickname) }}}
              className="text-xl font-bold text-center bg-transparent border-b-2 border-[#2D5A3D] outline-none w-40"
              placeholder={lang === 'ko' ? '닉네임 입력' : lang === 'zh' ? '输入昵称' : 'Enter nickname'}
            />
          ) : (
            <div onClick={() => setEditingNickname(true)} className="text-xl font-bold cursor-pointer flex items-center justify-center gap-1" style={{ color: '#1A1A1A' }}>
              {nickname || (lang === 'ko' ? '사용자' : lang === 'zh' ? '用户' : 'User')}
              <Pencil className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="border-t border-[#E5E7EB] my-4"></div>

        {/* 프로필 정보 */}
        <div className="space-y-3">
          {/* 비자 (클릭→비자 선택 모달) */}
          <div
            className="flex justify-between items-center py-2 cursor-pointer active:bg-[#F9FAFB] rounded-lg -mx-2 px-2 transition-colors"
            onClick={() => { setTempVisaType(profile?.visaType || ''); setShowVisaModal(true) }}
          >
            <span className="text-[#6B7280] text-sm">
              {lang === 'ko' ? '비자' : lang === 'zh' ? '签证' : 'Visa'}
            </span>
            <span className="font-medium text-[#111827] text-sm flex items-center gap-1">
              {getVisaTypeLabel()}
              <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </span>
          </div>

          {/* 비자 만료일 (D-day) */}
          <div className="flex justify-between items-center py-2">
            <span className="text-[#6B7280] text-sm">
              {lang === 'ko' ? '비자 만료' : lang === 'zh' ? '签证到期' : 'Visa Expiry'}
            </span>
            <div className="flex items-center gap-2">
              {expiryDate && days !== null ? (
                <>
                  <span className="font-medium text-[#111827] text-sm">{expiryDate}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    days <= 0 ? 'bg-red-100 text-red-600' :
                    days <= 30 ? 'bg-red-100 text-red-600' :
                    days <= 90 ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {days <= 0 ? (lang === 'ko' ? '만료됨' : lang === 'zh' ? '已过期' : 'Expired') : `D-${days}`}
                  </span>
                </>
              ) : (
                <span className="text-[#9CA3AF] text-sm">-</span>
              )}
              <button
                onClick={handleEditExpiry}
                className="w-6 h-6 bg-[#F3F4F6] rounded-full flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
              >
                <Pencil className="w-3 h-3 text-[#6B7280]" />
              </button>
            </div>
          </div>

          {/* 한국어 레벨 */}
          <div className="flex justify-between items-center py-2">
            <span className="text-[#6B7280] text-sm">
              {lang === 'ko' ? '한국어 레벨' : lang === 'zh' ? '韩语等级' : 'Korean Level'}
            </span>
            <span className="font-medium text-[#111827] text-sm">{getKoreanLevel()}</span>
          </div>

          {/* 구독 */}
          <div className="flex justify-between items-center py-2">
            <span className="text-[#6B7280] text-sm">
              {lang === 'ko' ? '구독' : lang === 'zh' ? '订阅' : 'Subscription'}
            </span>
            <span className="font-medium text-[#111827] text-sm flex items-center gap-1">
              🟢 Free
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-[#E5E7EB] my-4"></div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="w-full text-[#6B7280] text-sm py-3 hover:text-[#111827] transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          {lang === 'ko' ? '로그아웃' : lang === 'zh' ? '注销' : 'Logout'}
        </button>
      </div>

      {/* 관리자 설정 (항상 표시) */}
      <div className="rounded-2xl p-4 border border-[#E5E7EB] mt-4 bg-white">
        <button
          onClick={() => {
            if (adminMode) setShowAdminPanel(!showAdminPanel)
            else setShowAdminPwModal(true)
          }}
          className="w-full flex items-center justify-between py-2"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#6B7280]" />
            <span className="text-sm text-[#6B7280]">
              {lang === 'ko' ? '관리자 설정' : lang === 'zh' ? '管理员设置' : 'Admin Settings'}
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${showAdminPanel && adminMode ? 'rotate-90' : ''}`} />
        </button>

        {adminMode && showAdminPanel && (
          <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                {lang === 'ko' ? '포켓 표시 관리' : lang === 'zh' ? '口袋显示管理' : 'Pocket Visibility'}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setAllPockets(true)} className="text-[10px] bg-[#111827] text-white px-2.5 py-1 rounded-full">
                  {lang === 'ko' ? '전체 켜기' : lang === 'zh' ? '全部开启' : 'All On'}
                </button>
                <button onClick={() => setAllPockets(false)} className="text-[10px] bg-[#E5E7EB] text-[#374151] px-2.5 py-1 rounded-full">
                  {lang === 'ko' ? '전체 끄기' : lang === 'zh' ? '全部关闭' : 'All Off'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {pocketCategories.map(cat => (
                <div key={cat.id}>
                  <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">{L(lang, cat.name)}</p>
                  <div className="space-y-1">
                    {cat.pockets.map(p => {
                      const isOn = getPocketVisible(p.id)
                      return (
                        <div key={p.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`text-base ${isOn ? '' : 'opacity-30'}`}>{p.icon}</span>
                            <span className={`text-sm ${isOn ? 'text-[#111827] font-medium' : 'text-[#9CA3AF]'}`}>{L(lang, p.name)}</span>
                          </div>
                          <button
                            onClick={() => togglePocketVisibility(p.id)}
                            className={`w-11 h-6 rounded-full transition-all relative ${isOn ? 'bg-[#111827]' : 'bg-[#D1D5DB]'}`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${isOn ? 'left-[22px]' : 'left-0.5'}`} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* 관리자 모드 해제 */}
            <button onClick={handleAdminLogout} className="w-full text-center text-xs text-red-500 mt-4 py-2">
              {lang === 'ko' ? '관리자 모드 해제' : lang === 'zh' ? '退出管理员模式' : 'Exit Admin Mode'}
            </button>
          </div>
        )}
      </div>

      {/* 비자 선택 모달 */}
      {showVisaModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1A1A1A]">
                {lang === 'ko' ? '비자 타입 선택' : lang === 'zh' ? '选择签证类型' : 'Select Visa Type'}
              </h3>
              <button onClick={() => setShowVisaModal(false)} className="w-8 h-8 flex items-center justify-center">
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {VISA_TYPES.map(v => (
                <button
                  key={v.code}
                  onClick={() => setTempVisaType(v.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    tempVisaType === v.code ? 'bg-[#2D5A3D]/10' : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    tempVisaType === v.code ? 'border-[#2D5A3D]' : 'border-[#D1D5DB]'
                  }`}>
                    {tempVisaType === v.code && <div className="w-2.5 h-2.5 rounded-full bg-[#2D5A3D]" />}
                  </div>
                  <span className={`text-sm ${tempVisaType === v.code ? 'font-medium text-[#1A1A1A]' : 'text-[#374151]'}`}>
                    {L(lang, v.label)}
                  </span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-[#E5E7EB]">
              <button
                onClick={handleSaveVisa}
                disabled={!tempVisaType}
                className="w-full py-3 rounded-xl bg-[#2D5A3D] text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {lang === 'ko' ? '선택 완료' : lang === 'zh' ? '确认选择' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달 1: 비자 만료일 입력 */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#111827] mb-4 text-center">
              {lang === 'ko' ? '비자 만료일 설정' : lang === 'zh' ? '设置签证到期日期' : 'Set Visa Expiry Date'}
            </h3>

            <input
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-[#111827] border border-[#E5E7EB] focus:border-[#111827] outline-none mb-6 box-border max-w-full text-base"
              style={{ WebkitAppearance: 'none', minWidth: 0 }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowDateModal(false)}
                className="flex-1 py-3 text-[#6B7280] font-medium rounded-xl hover:bg-[#F3F4F6] transition-colors"
              >
                {lang === 'ko' ? '취소' : lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveDate}
                disabled={!tempDate}
                className="flex-1 py-3 bg-[#111827] text-white font-medium rounded-xl hover:bg-[#1F2937] disabled:opacity-50 transition-colors"
              >
                {lang === 'ko' ? '저장' : lang === 'zh' ? '保存' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달 2: 알림 설정 확인 */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-xl">
            <div className="text-center mb-6">
              <Bell className="w-12 h-12 text-[#111827] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#111827] mb-2">
                {lang === 'ko' ? '비자 만료일 알림' : lang === 'zh' ? '签证到期提醒' : 'Visa Expiry Alert'}
              </h3>
              <p className="text-[#6B7280] text-sm">
                📱 {lang === 'ko' ? '비자 만료 60일/30일/7일 전 푸시 알림을 설정하시겠습니까?' : lang === 'zh' ? '您希望在签证到期60天/30天/7天前收到推送提醒吗？' : 'Set push reminders 60/30/7 days before visa expiry?'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNotifModal(false)}
                className="flex-1 py-3 text-[#6B7280] font-medium rounded-xl hover:bg-[#F3F4F6] transition-colors"
              >
                {lang === 'ko' ? '아니요' : lang === 'zh' ? '不用' : 'No'}
              </button>
              <button
                onClick={handleNotifYes}
                className="flex-1 py-3 bg-[#111827] text-white font-medium rounded-xl hover:bg-[#1F2937] transition-colors"
              >
                {lang === 'ko' ? '예' : lang === 'zh' ? '是' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달 3: 알림 시점 선택 */}
      {showTimingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#111827] mb-4 text-center">
              {lang === 'ko' ? '알림 시점 선택' : lang === 'zh' ? '选择提醒时间' : 'Choose Reminder Times'}
            </h3>

            <div className="space-y-4 mb-6">
              {[
                { key: 'd60', label: { ko: '60일 전', zh: '60天前', en: '60 days before' } },
                { key: 'd30', label: { ko: '30일 전', zh: '30天前', en: '30 days before' } },
                { key: 'd7', label: { ko: '7일 전', zh: '7天前', en: '7 days before' } }
              ].map(opt => (
                <label key={opt.key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-[#111827] font-medium">{L(lang, opt.label)}</span>
                  <button
                    onClick={() => toggleNotif(opt.key)}
                    className={`w-12 h-7 rounded-full transition-all relative ${
                      notifPrefs[opt.key] ? 'bg-[#111827]' : 'bg-[#D1D1D6]'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${
                      notifPrefs[opt.key] ? 'left-[22px]' : 'left-0.5'
                    }`} />
                  </button>
                </label>
              ))}
            </div>

            <button
              onClick={handleSaveTiming}
              className="w-full py-3 bg-[#111827] text-white font-medium rounded-xl hover:bg-[#1F2937] transition-colors"
            >
              {lang === 'ko' ? '확인' : lang === 'zh' ? '确认' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* 관리자 비밀번호 모달 */}
      {showAdminPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-8 w-full max-w-sm border border-[#E5E7EB]">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-4">
              {lang === 'ko' ? '관리자 비밀번호' : lang === 'zh' ? '管理员密码' : 'Admin Password'}
            </h3>
            <input
              type="password"
              value={adminPw}
              onChange={e => { setAdminPw(e.target.value); setAdminPwError(false) }}
              onKeyDown={e => { if (e.key === 'Enter') handleAdminLogin() }}
              placeholder="****"
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-[#2D5A3D]"
              autoFocus
            />
            {adminPwError && (
              <p className="text-xs text-red-500 mt-2 text-center">
                {lang === 'ko' ? '비밀번호가 틀렸습니다' : lang === 'zh' ? '密码错误' : 'Incorrect password'}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowAdminPwModal(false); setAdminPw(''); setAdminPwError(false) }}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#6B7280]">
                {lang === 'ko' ? '취소' : lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button onClick={handleAdminLogin}
                className="flex-1 py-2.5 rounded-xl bg-[#2D5A3D] text-white text-sm font-medium">
                {lang === 'ko' ? '확인' : lang === 'zh' ? '确认' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {showToast && (
        <div
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#111827] text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg z-50"
          style={{ animation: 'fadeInOut 1.5s ease-in-out' }}
        >
          {toastMsg || (lang === 'ko' ? '비자 만료 알림이 설정되었습니다' : lang === 'zh' ? '已设置签证到期提醒' : 'Visa expiry alerts set')}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
function Input({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <label className="text-xs text-[#6B7280] font-medium block mb-1.5">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-[#111827]/30 placeholder:text-[#9CA3AF] ${mono ? 'font-mono tracking-wider' : ''}`} />
    </div>
  )
}

function DocumentAuthGuide({ lang, onBack }) {
  const d = documentAuth
  return (
    <div className="space-y-4 animate-fade-up">
      <button onClick={onBack} className="text-[#111827] text-sm font-medium">{t[lang].back}</button>
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
                  <div className="text-xs text-[#111827] mt-2">{lang==='ko'?'공증 · 번역 · 아포스티유 안내 →':lang==='zh'?'公证 · 翻译 · 海牙认证指南 →':'Notarization · Translation · Apostille Guide →'}</div>
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

// ErrorBoundary moved to ./components/common/ErrorBoundary.jsx

// Service Grid Component — 구현/미구현 포켓 분리 표시
function ServiceGrid({ lang, L, setSubPage }) {
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [visibility] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pocket_visibility')) || {} } catch { return {} }
  })

  const isVisible = (pocketId) => {
    if (pocketId in visibility) return visibility[pocketId]
    return IMPLEMENTED_POCKETS.has(pocketId)
  }

  // 카테고리별로 활성/비활성 포켓 분리 (pocket_visibility 기반)
  const implementedCats = []
  const unimplementedPockets = []

  pocketCategories.forEach(cat => {
    const impl = cat.pockets.filter(p => isVisible(p.id))
    const unimpl = cat.pockets.filter(p => !isVisible(p.id))
    if (impl.length > 0) {
      implementedCats.push({ ...cat, pockets: impl })
    }
    unimpl.forEach(p => unimplementedPockets.push({ ...p, catName: cat.name, catId: cat.id }))
  })

  const comingSoonLabel = { ko: '업데이트 중', zh: '更新中', en: 'Coming Soon' }
  const updatingBadge = { ko: '(업데이트중)', zh: '(更新中)', en: '(Updating)' }

  // 래플스 호텔 테마 — 전체 카테고리 크림 통일
  const categoryBgColors = {
    'situational-korean': '#F5F1EB',
    'travel-food': '#F5F1EB',
    'hallyu-entertainment': '#F5F1EB',
    'shopping-beauty': '#F5F1EB',
    'learning': '#F5F1EB',
    'daily-life': '#F5F1EB',
    'tools': '#F5F1EB',
  }


  return (
    <div className="space-y-6">

      {/* 구현된 포켓 */}
      {implementedCats.map(cat => (
        <div key={cat.id}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{L(lang, cat.name)}</h3>
          <div className="grid grid-cols-3 gap-2">
            {cat.pockets.map(p => (
              <button key={p.id} onClick={() => setSubPage(p.id)}
                className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-[#E5E7EB] transition-all duration-200 active:scale-[0.98]">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: categoryBgColors[cat.id] || '#F3F4F6' }}>
                  <span className="text-2xl">{p.icon}</span>
                </div>
                <span className="text-xs text-[#1A1A1A] font-medium text-center leading-tight">{L(lang, p.name)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 미구현 포켓 — 업데이트 중 그룹 */}
      {unimplementedPockets.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowComingSoon(!showComingSoon)}
            className="flex items-center gap-2 w-full py-2 transition-all duration-200 active:scale-[0.98]"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{L(lang, comingSoonLabel)}</h3>
            <span className="text-xs text-gray-400">({unimplementedPockets.length})</span>
            <ChevronRight size={14} className={`text-gray-400 transition-transform duration-200 ${showComingSoon ? 'rotate-90' : ''}`} />
          </button>
          {showComingSoon && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {unimplementedPockets.map(p => (
                <div key={p.id}
                  className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-[#E5E7EB] opacity-60 cursor-default">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center opacity-50"
                    style={{ backgroundColor: categoryBgColors[p.catId] || '#F3F4F6' }}>
                    <span className="text-2xl">{p.icon}</span>
                  </div>
                  <span className="text-xs text-[#9CA3AF] font-medium text-center leading-tight">{L(lang, p.name)}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: '#F5F1EB', color: '#B8860B', border: '1px solid #B8860B' }}>
                    {L(lang, updatingBadge)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// App Shortcut Component
function AppShortcut({ name, description, deepLink, webUrl, domain }) {
  const handleAppLaunch = () => {
    if (deepLink) {
      // Try deep link first
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = deepLink
      document.body.appendChild(iframe)
      
      // Fallback to web URL after 1.5s
      setTimeout(() => {
        document.body.removeChild(iframe)
        window.open(webUrl, '_blank', 'noopener,noreferrer')
      }, 1500)
    } else {
      // Direct web URL
      window.open(webUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      onClick={handleAppLaunch}
      className="w-full flex items-center gap-3 p-3 hover:bg-[#F3F4F6] rounded-lg transition-colors text-left"
    >
      <img 
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt={`${name} logo`}
        className="w-8 h-8 rounded"
        onError={(e) => {
          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#111827] text-sm">{name}</div>
        <div className="text-xs text-[#9CA3AF] truncate">{description}</div>
      </div>
    </button>
  )
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
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredTab, setHoveredTab] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAppMenu, setShowAppMenu] = useState(false)
  const [widgetSettings, setWidgetSettings] = useState(() => { try { return JSON.parse(localStorage.getItem('hanpocket_widgets') || '{}') } catch { return {} } })
  const { isDark, toggleDarkMode } = useDarkMode()
  const s = t[lang]

  // Auth popup state (replaces onboarding)
  const [showAuthPopup, setShowAuthPopup] = useState(() => {
    return !loadProfile() && !localStorage.getItem('hanpocket_dismissed_auth')
  })
  const dismissAuth = () => {
    setShowAuthPopup(false)
    localStorage.setItem('hanpocket_dismissed_auth', '1')
  }
  const handleAuth = (provider) => {
    const p = {
      name: '',
      nationality: 'china_mainland',
      authProvider: provider,
      lang: 'zh'
    }
    setProfile(p)
    saveProfile(p)
    setShowAuthPopup(false)
  }

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

  // OAuth 리다이렉트 콜백 처리 (카카오 + 네이버)
  useEffect(() => {
    initKakao()
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    
    if (!code) return
    
    // 네이버인지 카카오인지 구분: 네이버는 naver_oauth_state가 localStorage에 있음
    const naverState = localStorage.getItem('naver_oauth_state')
    const isNaver = naverState && state === naverState
    
    const handleOAuthSuccess = (user, provider) => {
      const p = profile || { lang, userType: 'resident' }
      if (user.nickname || user.name) p.nickname = user.nickname || user.name
      if (user.profileImage) p.profileImage = user.profileImage
      p.loginMethod = provider
      setProfile(p)
      saveProfile(p)
      // URL에서 OAuth 파라미터 제거 → 홈으로
      window.history.replaceState({}, '', window.location.origin + '/')
    }
    
    if (isNaver) {
      // 네이버 콜백
      handleNaverCallback().then(user => {
        if (user) {
          trackLogin('naver', 'resident')
          handleOAuthSuccess(user, 'naver')
        } else {
          window.history.replaceState({}, '', window.location.origin + '/')
        }
      }).catch(() => {
        window.history.replaceState({}, '', window.location.origin + '/')
      })
    } else {
      // 카카오 콜백
      trackKakaoEvent('kakao_oauth_callback_received')
      handleKakaoCallback().then(user => {
        if (user) {
          trackKakaoEvent('kakao_oauth_success', { nickname: user.nickname })
          trackLogin('kakao', 'resident')
          handleOAuthSuccess(user, 'kakao')
        } else {
          trackKakaoEvent('kakao_oauth_failed')
          window.history.replaceState({}, '', window.location.origin + '/')
        }
      }).catch(error => {
        console.error('Kakao OAuth error:', error)
        trackKakaoEvent('kakao_oauth_error', { error: error.message })
        window.history.replaceState({}, '', window.location.origin + '/')
      })
    }
  }, [])

  // Service Worker 초기화 및 업데이트 관리
  // useEffect(() => {
  //   initServiceWorker()
  // }, [])

  // GA4 초기화 및 개인정보보호 설정
  useEffect(() => {
    // 사용자 동의 (한국의 개인정보보호법 고려)
    const hasAnalyticsConsent = localStorage.getItem('hp_analytics_consent') === 'true'
    
    if (!hasAnalyticsConsent) {
      // 첫 방문 시 기본 동의 설정 (분석 쿠키만, 광고 쿠키는 거부)
      localStorage.setItem('hp_analytics_consent', 'true')
    }
    
    // GA4 초기화
    initGA()
    
    // 동의 모드 업데이트
    setConsentMode(true, false) // 분석 쿠키 허용, 광고 쿠키 거부
    
    // 초기 페이지뷰 추적
    trackPageView('App Start', window.location.href, 'onboarding')
  }, [])

  // 언어 변경 추적
  const prevLangRef = useRef(lang)
  useEffect(() => {
    if (prevLangRef.current && prevLangRef.current !== lang) {
      trackLanguageChange(prevLangRef.current, lang)
    }
    prevLangRef.current = lang
  }, [lang])

  // 탭 변경 추적
  const prevTabRef = useRef(tab)
  useEffect(() => {
    if (prevTabRef.current && prevTabRef.current !== tab) {
      trackTabSwitch(tab, prevTabRef.current)
      trackPageView(`${tab} Tab`, window.location.href, tab)
    }
    prevTabRef.current = tab
  }, [tab])

  // 내정보 탭 진입 시 캐시 갱신
  // useEffect(() => {
  //   if (tab === 'profile' || view === 'profile' || tab === 'visa-alert') {
  //     forceProfileDataRefresh()
  //     console.log('Profile data cache refreshed for tab:', tab)
  //   }
  // }, [tab, view])

  const [pushEnabled, setPushEnabled] = useState(() => {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted'
  })
  const [pushDismissed, setPushDismissed] = useState(() => {
    return localStorage.getItem('hp_push_dismissed') === 'true'
  })

  const handleEnablePush = async () => {
    if (!isPushSupported()) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        alert(lang === 'ko' ? 'Safari에서 하단 공유 버튼 → "홈 화면에 추가"를 먼저 해주세요. 앱으로 설치해야 알림을 받을 수 있습니다.' : lang === 'zh' ? '请先在Safari中点击底部分享按钮→"添加到主屏幕"。安装为App后才能接收通知。' : 'Please tap Share → "Add to Home Screen" in Safari first. Notifications require the app to be installed.')
      } else {
        alert(lang === 'ko' ? '이 브라우저에서는 알림을 지원하지 않습니다.' : lang === 'zh' ? '此浏览器不支持通知。' : 'Notifications are not supported in this browser.')
      }
      return
    }
    const sub = await subscribePush()
    if (sub) {
      setPushEnabled(true)
      if (profile.visaExpiry) {
        await cacheVisaProfile(profile)
        scheduleDdayCheck(profile.visaExpiry)
      }
      await registerPeriodicSync()
    }
  }

  const [subPage, setSubPage] = useState(null)
  const scrollPositions = useRef({}) // { tabId: { y: number, timestamp: number } }

  // OAuth 리다이렉트 중이면 온보딩 대신 로딩 표시 (콜백 처리 대기)
  const hasOAuthCode = new URLSearchParams(window.location.search).get('code')
  if (!profile && hasOAuthCode) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#111827] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#6B7280]">{lang === 'ko' ? '로그인 처리 중...' : lang === 'zh' ? '登录处理中...' : 'Logging in...'}</p>
        </div>
      </div>
    )
  }
  // Onboarding removed — auth popup shows instead (profile no longer required to render app)
  const safeProfile = profile || { name: '', nationality: 'china_mainland', lang: 'zh' }

  const handleTabChange = (newTab) => {
    scrollPositions.current[tab] = { y: window.scrollY, timestamp: Date.now() }
    setTab(newTab)
    setSubPage(null)
    if (newTab === 'home') { setView('home'); setSelCat(null); setSelVisa(null); setSq('') }
    const saved = scrollPositions.current[newTab]
    if (saved && (Date.now() - saved.timestamp) < 300000) {
      requestAnimationFrame(() => { requestAnimationFrame(() => { window.scrollTo(0, saved.y) }) })
    } else {
      window.scrollTo(0, 0)
    }
  }

  const bottomTabs = [
    { id: 'home', icon: Home, label: { ko: '홈', zh: '首页', en: 'Home' } },
    { id: 'service', icon: Grid3x3, label: { ko: '탐색', zh: '探索', en: 'Explore' } },
    { id: 'course', icon: Compass, label: { ko: '코스', zh: '路线', en: 'Course' } },
    { id: 'korean', icon: BookOpen, label: { ko: '한국어', zh: '韩语', en: 'Korean' } },
  ]

  // Check if a service item has been migrated to pocket categories
  const getMigratedPocketIds = () => {
    const pocketIds = new Set()
    pocketCategories.forEach(cat => cat.pockets.forEach(p => pocketIds.add(p.id)))
    return pocketIds
  }
  const migratedIds = getMigratedPocketIds()

  // Generate status label based on migration state
  const getMigrationLabel = (itemId) => {
    if (migratedIds.has(itemId)) return { ko: '이관 완료', zh: '已迁移', en: 'Migrated' }
    return { ko: '이관 중', zh: '迁移中', en: 'Migrating' }
  }
  
  // Build explore and tool items with migration status
  const exploreItems = serviceItems
    .filter(item => item.category === 'explore')
    .map(item => ({
      id: item.id,
      migrated: migratedIds.has(item.id),
      label: {
        ko: `${item.name.ko} (${getMigrationLabel(item.id).ko})`,
        zh: `${item.name.zh} (${getMigrationLabel(item.id).zh})`,
        en: `${item.name.en} (${getMigrationLabel(item.id).en})`
      }
    }))

  const toolItems = serviceItems
    .filter(item => item.category === 'tool')
    .map(item => ({
      id: item.id,
      migrated: migratedIds.has(item.id),
      label: {
        ko: `${item.name.ko} (${getMigrationLabel(item.id).ko})`,
        zh: `${item.name.zh} (${getMigrationLabel(item.id).zh})`,
        en: `${item.name.en} (${getMigrationLabel(item.id).en})`
      }
    }))


  // Build sub-menus with actions from imported data
  const subMenus = Object.fromEntries(
    Object.entries(subMenuData).map(([key, menu]) => [
      key,
      {
        title: menu.title,
        items: menu.items.map(item => ({
          label: item.label,
          action: item.action ? () => {
            // Handle different action types
            switch(item.action) {
              case 'visaTypes': setTab('transition'); setView('home'); break;
              case 'visaChange': setTab('transition'); setView('transition'); break;
              case 'agency': setTab('transition'); setView('agency'); break;
              case 'visaalert': setTab('visaalert'); break;
              case 'medical': setTab('medical'); break;
              case 'finance': setTab('finance'); break;
              case 'resume': setTab('resume'); break;
              case 'translator': setTab('translator'); break;
              case 'artranslate': setTab('artranslate'); break;
              case 'wallet': setTab('wallet'); break;
              default: break;
            }
          } : item.action
        }))
      }
    ])
  )

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
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#FFFFFF' }}>
      {showNotice && <NoticePopup lang={lang} onClose={() => setShowNotice(false)} />}
      <PWAInstallPrompt />

      {/* Auth Popup (replaces onboarding) */}
      {showAuthPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" style={{ maxHeight: '85vh' }}>
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-[#1A1A1A]">HANPOCKET</h2>
                <button onClick={dismissAuth} className="p-1 text-[#999]"><X size={20} /></button>
              </div>
              <p className="text-sm text-[#666666]">
                {L(lang, { ko: '한국 여행의 모든 것을 한 곳에서.\n간편 인증으로 시작하세요.', zh: '韩国旅行一站式服务。\n简单认证即可开始。', en: 'Everything for Korea travel in one place.\nStart with easy sign-in.' }).split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
              </p>
            </div>
            <div className="px-5 py-4">
              <div className="flex justify-center gap-4">
                <button onClick={() => handleAuth('naver')} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-[#03C75A] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                  <span className="text-[10px] text-[#666]">{L(lang, { ko: '네이버', zh: 'Naver', en: 'Naver' })}</span>
                </button>
                <button onClick={() => handleAuth('kakao')} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-[#FEE500] flex items-center justify-center">
                    <span className="text-[#1C1C1E] font-bold text-lg">K</span>
                  </div>
                  <span className="text-[10px] text-[#666]">{L(lang, { ko: '카카오', zh: 'Kakao', en: 'Kakao' })}</span>
                </button>
                <button onClick={() => handleAuth('apple')} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center">
                    <span className="text-white font-bold text-lg"></span>
                  </div>
                  <span className="text-[10px] text-[#666]">Apple</span>
                </button>
                <button onClick={() => handleAuth('wechat')} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-[#07C160] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">微信</span>
                  </div>
                  <span className="text-[10px] text-[#666]">WeChat</span>
                </button>
                <button onClick={() => handleAuth('alipay')} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-[#1677FF] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">支</span>
                  </div>
                  <span className="text-[10px] text-[#666]">Alipay</span>
                </button>
              </div>
            </div>
            <div className="px-5 pb-5">
              <div className="border border-[#E5E7EB] rounded-xl p-3 max-h-40 overflow-y-auto">
                <p className="text-[10px] text-[#999999] leading-relaxed">
                  <strong>HanPocket 이용약관</strong><br/><br/>
                  제1조 (목적) 본 약관은 HanPocket(이하 "서비스")이 제공하는 모든 서비스의 이용조건 및 절차, 이용자와 서비스의 권리·의무·책임사항을 규정합니다.<br/><br/>
                  제2조 (용어의 정의) 1. 가입: SNS 채널인증과 본 약관에 동의하여 서비스 이용계약을 완료하는 행위. 2. 이용자: 본 약관에 동의하고 SNS 채널인증을 통해 이용권한을 부여받은 개인. 3. SNS 채널인증: 서비스 이용을 위해 이용자가 SNS 채널을 선택하고 인증하는 행위.<br/><br/>
                  제3조 (법령 준수) 서비스는 약관의 규제에 관한 법률, 정보통신망 이용촉진 및 정보보호법, 개인정보 보호법 등 관련법령을 준수합니다.<br/><br/>
                  제4조 (약관의 효력) 1. 본 약관은 서비스에 게시되고 가입 완료 시 효력이 발생합니다. 2. 약관 변경 시 적용일 7일 전 공지합니다.<br/><br/>
                  제5조 (개인정보 보호) 1. 서비스는 필요 최소한의 정보를 수집합니다. 2. 이용자 동의 없이 정보를 제3자에게 제공하지 않습니다. 3. 통계작성 등 법령에 의한 경우는 예외입니다.<br/><br/>
                  제6조 (이용자의 의무) 1. 타인의 인증정보를 도용하지 않습니다. 2. 서비스를 통해 전송된 내용의 출처를 위장하지 않습니다. 3. 다른 사용자의 개인정보를 수집·저장하지 않습니다.<br/><br/>
                  인증을 진행하면 위 약관에 동의하는 것으로 간주됩니다.
                </p>
              </div>
              <p className="text-[9px] text-[#999999] mt-2 text-center">
                {L(lang, { ko: '인증 시 위 이용약관 및 개인정보처리방침에 동의합니다.', zh: '认证即表示同意上述使用条款和隐私政策。', en: 'By signing in, you agree to our Terms of Service and Privacy Policy.' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar — scrolls with content (not sticky) */}
      <div className="relative z-10" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center">
            {/* 좌측: 햄버거 메뉴 (메인) 또는 뒤로가기 (서브) */}
            <div className="flex items-center gap-1 w-16">
              {subPage ? (
                <button onClick={() => { setSubPage(null) }} className="text-[#5F6368] p-1">
                  <ChevronLeft size={24} />
                </button>
              ) : (
                <button onClick={() => setShowAppMenu(true)} className="text-[#5F6368] p-2 -ml-2">
                  <Menu size={22} />
                </button>
              )}
            </div>

            {/* 중앙 로고 */}
            <div className="flex-1 flex justify-center">
              <Logo />
            </div>

            {/* 우측: 프로필 + 언어설정 */}
            <div className="flex items-center justify-end gap-1 w-16">
              <button onClick={() => { setTab('profile'); setSubPage(null) }} className="text-[#5F6368] p-1">
                <User size={20} />
              </button>
              <button onClick={() => setLang(nextLang(lang))} className="text-[#5F6368] p-1">
                <Globe size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <OfflineNotice lang={lang} />

      {/* Content — full width, no side padding (tabs handle their own padding) */}
      <div className="pt-1 pb-4">
        {/* Install / Push notification banner */}
        {!pushDismissed && tab === 'home' && (() => {
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
          if (pushEnabled) return null
          if (!isStandalone && isIOS) {
            // iOS Safari — 앱 설치 안내
            return (
              <div className="mx-4 mb-4 bg-[#F3F4F6] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-[#111827]">{lang === 'ko' ? '앱으로 설치하기' : lang === 'zh' ? '安装为App' : 'Install App'}</p>
                  <button onClick={() => { setPushDismissed(true); localStorage.setItem('hp_push_dismissed', 'true') }}
                    className="text-xs text-[#9CA3AF] px-2 py-1">X</button>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {lang === 'ko' ? '하단 공유 버튼(▫︎↑) → "홈 화면에 추가"를 눌러주세요. 알림 수신, 전체화면 등 앱처럼 사용할 수 있습니다.' 
                  : lang === 'zh' ? '点击底部分享按钮(▫︎↑) → "添加到主屏幕"。可以像App一样使用，接收通知。' 
                  : 'Tap Share (▫︎↑) → "Add to Home Screen". Use like a real app with notifications.'}
                </p>
              </div>
            )
          }
          // 일반 브라우저 — 알림 허용 배너
          return (
            <div className="mx-4 mb-4 bg-[#F3F4F6] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#111827]">{lang === 'ko' ? '알림 받기' : lang === 'zh' ? '开启通知' : 'Enable Notifications'}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{lang === 'ko' ? '비자 만료, 공지사항 등을 놓치지 마세요' : lang === 'zh' ? '不要错过签证到期、公告等信息' : "Don't miss visa expiry alerts & updates"}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setPushDismissed(true); localStorage.setItem('hp_push_dismissed', 'true') }}
                  className="text-xs text-[#9CA3AF] px-2 py-1.5">{lang === 'ko' ? '닫기' : lang === 'zh' ? '关闭' : 'Close'}</button>
                <button onClick={handleEnablePush}
                  className="text-xs font-semibold text-white bg-[#111827] px-4 py-1.5 rounded-lg">{lang === 'ko' ? '허용' : lang === 'zh' ? '允许' : 'Allow'}</button>
              </div>
            </div>
          )
        })()}
        {/* Service grid - pockets.js 데이터 기반 */}
        {tab==='service' && !subPage && (
          <div>
            <div className="px-4 pt-2 pb-3">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  type="text"
                  placeholder={lang === 'ko' ? '포켓, 코스, 가이드 검색...' : lang === 'zh' ? '搜索口袋、路线、指南...' : 'Search pockets, courses, guides...'}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5F1EB] rounded-xl text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:ring-1 focus:ring-[#2D5A3D]"
                  onFocus={() => { setTab('search') }}
                  readOnly
                />
              </div>
            </div>
            <div className="px-4">
              <ServiceGrid lang={lang} L={L} setSubPage={setSubPage} />
            </div>
          </div>
        )}

        {/* Sub-pages from explore/tools — wrapped with px-4 since parent has no padding */}
        <div className="px-4">
        {subPage==='travel' && (
          <Suspense fallback={<LoadingSpinner />}>
            <TravelTab lang={lang} setTab={(t) => setSubPage(t)} />
          </Suspense>
        )}
        {subPage==='food' && (
          <Suspense fallback={<LoadingSpinner />}>
            <FoodTab lang={lang} setTab={(t) => setSubPage(t)} />
          </Suspense>
        )}
        {subPage==='shopping' && (
          <Suspense fallback={<LoadingSpinner />}>
            <ShoppingTab lang={lang} setTab={(t) => setSubPage(t)} />
          </Suspense>
        )}
        {subPage==='hallyu' && (
          <Suspense fallback={<LoadingSpinner />}>
            <HallyuTab lang={lang} setTab={(t) => setSubPage(t)} />
          </Suspense>
        )}
        {subPage==='learn' && (
          <Suspense fallback={<LoadingSpinner />}>
            <EducationTab lang={lang} />
          </Suspense>
        )}
        {subPage==='life' && (
          <Suspense fallback={<LoadingSpinner />}>
            <LifeToolsTab lang={lang} setTab={(t) => setSubPage(t)} />
          </Suspense>
        )}
        {subPage==='medical' && (
          <Suspense fallback={<LoadingSpinner />}>
            <MedicalTab lang={lang} />
          </Suspense>
        )}
        {subPage==='fitness' && (
          <Suspense fallback={<LoadingSpinner />}>
            <FitnessTab lang={lang} />
          </Suspense>
        )}
        {subPage==='community' && (
          <Suspense fallback={<LoadingSpinner />}>
            <CommunityTab lang={lang} profile={safeProfile} />
          </Suspense>
        )}
        {subPage==='translator' && (
          <Suspense fallback={<LoadingSpinner />}>
            <TranslatorTab lang={lang} />
          </Suspense>
        )}
        {subPage==='artranslate' && (
          <Suspense fallback={<LoadingSpinner />}>
            <ARTranslateTab lang={lang} />
          </Suspense>
        )}
        {subPage==='sos' && (
          <Suspense fallback={<LoadingSpinner />}>
            <SOSTab lang={lang} profile={safeProfile} />
          </Suspense>
        )}
        {subPage==='finance' && (
          <Suspense fallback={<LoadingSpinner />}>
            <FinanceTab lang={lang} profile={safeProfile} />
          </Suspense>
        )}
        {subPage==='wallet' && (
          <Suspense fallback={<LoadingSpinner />}>
            <DigitalWalletTab lang={lang} profile={safeProfile} />
          </Suspense>
        )}
        {subPage==='visaalert' && (
          <Suspense fallback={<LoadingSpinner />}>
            <VisaAlertTab lang={lang} profile={safeProfile} />
          </Suspense>
        )}
        {subPage==='jobs' && (
          <Suspense fallback={<LoadingSpinner />}>
            <JobsTab lang={lang} />
          </Suspense>
        )}
        {subPage==='housing' && (
          <Suspense fallback={<LoadingSpinner />}>
            <HousingTab lang={lang} />
          </Suspense>
        )}
        {subPage==='resume' && (
          <Suspense fallback={<LoadingSpinner />}>
            <ResumeTab lang={lang} profile={safeProfile} />
          </Suspense>
        )}
        {subPage==='pet' && (
          <Suspense fallback={<LoadingSpinner />}>
            <PetTab lang={lang} />
          </Suspense>
        )}

        {/* Pocket catch-all — 전용 탭이 없는 pocket ID는 PocketContent로 렌더링 */}
        {subPage && tab === 'service' && !['travel','food','shopping','hallyu','learn','life','medical','fitness','community','translator','artranslate','sos','finance','wallet','visaalert','jobs','housing','resume','pet'].includes(subPage) && (
          <PocketContent pocketId={subPage} lang={lang} setTab={(t) => setSubPage(t)} />
        )}
        </div>

        {tab==='course' && !subPage && (
          <Suspense fallback={<LoadingSpinner />}>
            <CourseTab lang={lang} />
          </Suspense>
        )}
        {tab==='search' && !subPage && (
          <Suspense fallback={<LoadingSpinner />}>
            <SearchTab lang={lang} onNavigate={(target) => { setTab('service'); setSubPage(target) }} />
          </Suspense>
        )}
        {tab==='korean' && !subPage && (
          <Suspense fallback={<LoadingSpinner />}>
            <KoreanTab lang={lang} />
          </Suspense>
        )}
        {tab==='home' && !subPage && <HomeTab profile={profile} lang={lang} exchangeRate={exchangeRate} setTab={(t) => { if(['travel','food','shopping','hallyu','learn','life','jobs','housing','medical','fitness','translator','artranslate','sos','finance','wallet','resume','visaalert','community','pet'].includes(t)) { setTab('service'); setSubPage(t) } else { setTab(t) }}} />}
        {tab==='transition' && !subPage && <div className="px-4"><VisaTab profile={profile} lang={lang} view={view} setView={setView} selCat={selCat} setSelCat={setSelCat} selVisa={selVisa} setSelVisa={setSelVisa} sq={sq} setSq={setSq} /></div>}
        {tab==='profile' && !subPage && <ProfileTab profile={profile} setProfile={setProfile} lang={lang} onResetPushDismiss={() => setPushDismissed(false)} isDark={isDark} toggleDarkMode={toggleDarkMode} />}
        <div className="mt-12 mb-6 px-4 text-center text-[11px] text-[#9CA3AF]">
          <p>© 2026 HanPocket. All rights reserved.</p>
        </div>
      </div>
      {/* 검색 모달 */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* 검색 헤더 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
            <button onClick={() => { setShowSearch(false); setSearchQuery('') }} className="p-1">
              <ChevronLeft size={24} className="text-[#111827]" />
            </button>
            <div className="flex-1 bg-[#F1F3F4] rounded-full px-4 py-2.5 flex items-center gap-2">
              <Search size={18} className="text-[#9AA0A6]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={lang==='ko'?'검색어를 입력하세요':lang==='zh'?'请输入搜索词':'Search...'}
                className="bg-transparent outline-none text-sm text-[#202124] w-full placeholder:text-[#9AA0A6]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={16} className="text-[#9AA0A6]" />
                </button>
              )}
            </div>
          </div>

          {/* 검색 결과 / 바로가기 */}
          <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 60px)' }}>
            {!searchQuery ? (
              <>
                <p className="text-xs text-[#9AA0A6] uppercase tracking-wider font-semibold mb-3">
                  {lang==='ko'?'바로가기':lang==='zh'?'快捷入口':'Quick Access'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: { ko: '비자', zh: '签证', en: 'Visa' }, tab: 'explore', sub: 'visa' },
                    { label: { ko: '맛집', zh: '美食', en: 'Food' }, tab: 'explore', sub: 'food' },
                    { label: { ko: '여행', zh: '旅行', en: 'Travel' }, tab: 'explore', sub: 'travel' },
                    { label: { ko: '한류', zh: '韩流', en: 'Hallyu' }, tab: 'explore', sub: 'hallyu' },
                    { label: { ko: '한국어', zh: '韩语', en: 'Korean' }, tab: 'explore', sub: 'korean' },
                    { label: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, tab: 'explore', sub: 'shopping' },
                    { label: { ko: '구직', zh: '求职', en: 'Jobs' }, tab: 'community', sub: 'jobs' },
                    { label: { ko: '부동산', zh: '房产', en: 'Housing' }, tab: 'community', sub: 'housing' },
                    { label: { ko: '금융', zh: '金融', en: 'Finance' }, tab: 'tools', sub: 'finance' },
                    { label: { ko: 'SOS', zh: 'SOS', en: 'SOS' }, tab: 'tools', sub: 'sos' },
                    { label: { ko: '의료', zh: '医疗', en: 'Medical' }, tab: 'explore', sub: 'medical' },
                    { label: { ko: '커뮤니티', zh: '社区', en: 'Community' }, tab: 'community', sub: null },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setShowSearch(false)
                        setSearchQuery('')
                        setTab(item.tab)
                        if (item.sub) setSubPage(item.sub)
                      }}
                      className="bg-[#F8F9FA] rounded-xl py-3 px-2 text-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <span className="text-sm font-medium text-[#111827]">{L(lang, item.label)}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-[#9AA0A6] uppercase tracking-wider font-semibold mb-3">
                  {lang==='ko'?'검색 결과':lang==='zh'?'搜索结果':'Results'}
                </p>
                {(() => {
                  const q = searchQuery.toLowerCase()
                  const allItems = [
                    { keywords: ['비자','visa','签证','체류','거소'], label: { ko: '비자 정보', zh: '签证信息', en: 'Visa Info' }, tab: 'explore', sub: 'visa' },
                    { keywords: ['맛집','음식','food','美食','restaurant','밥'], label: { ko: '맛집', zh: '美食', en: 'Food' }, tab: 'explore', sub: 'food' },
                    { keywords: ['여행','travel','旅行','관광','tourism'], label: { ko: '여행', zh: '旅行', en: 'Travel' }, tab: 'explore', sub: 'travel' },
                    { keywords: ['한류','kpop','k-pop','韩流','아이돌','idol','드라마'], label: { ko: '한류', zh: '韩流', en: 'Hallyu' }, tab: 'explore', sub: 'hallyu' },
                    { keywords: ['한국어','korean','韩语','topik','학습'], label: { ko: '한국어 학습', zh: '韩语学习', en: 'Korean' }, tab: 'explore', sub: 'korean' },
                    { keywords: ['쇼핑','shopping','购物','올리브영','무신사'], label: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, tab: 'explore', sub: 'shopping' },
                    { keywords: ['생활','life','生活','편의점','배달'], label: { ko: '생활', zh: '生活', en: 'Life' }, tab: 'explore', sub: 'life' },
                    { keywords: ['의료','병원','hospital','医疗','약국','pharmacy'], label: { ko: '의료', zh: '医疗', en: 'Medical' }, tab: 'explore', sub: 'medical' },
                    { keywords: ['운동','gym','fitness','健身','헬스'], label: { ko: '운동', zh: '健身', en: 'Fitness' }, tab: 'explore', sub: 'fitness' },
                    { keywords: ['구직','알바','job','求职','work','일자리'], label: { ko: '구직', zh: '求职', en: 'Jobs' }, tab: 'community', sub: 'jobs' },
                    { keywords: ['부동산','집','house','housing','房产','월세','전세','rent'], label: { ko: '부동산', zh: '房产', en: 'Housing' }, tab: 'community', sub: 'housing' },
                    { keywords: ['이력서','resume','简历','cv'], label: { ko: '이력서', zh: '简历', en: 'Resume' }, tab: 'community', sub: 'resume' },
                    { keywords: ['금융','은행','bank','finance','金融','환율','송금'], label: { ko: '금융', zh: '金融', en: 'Finance' }, tab: 'tools', sub: 'finance' },
                    { keywords: ['sos','긴급','emergency','紧急','경찰','소방'], label: { ko: 'SOS 긴급', zh: 'SOS 紧急', en: 'SOS Emergency' }, tab: 'tools', sub: 'sos' },
                    { keywords: ['통역','번역','translate','翻译','interpreter'], label: { ko: '통역', zh: '翻译', en: 'Translate' }, tab: 'tools', sub: 'translator' },
                    { keywords: ['간판','sign','看板','사전'], label: { ko: '간판 사전', zh: '看板词典', en: 'Sign Dictionary' }, tab: 'tools', sub: 'ar-translate' },
                    { keywords: ['월렛','wallet','钱包','서류','document'], label: { ko: '디지털 월렛', zh: '数字钱包', en: 'Digital Wallet' }, tab: 'tools', sub: 'wallet' },
                    { keywords: ['알림','비자알림','visa alert','签证提醒','만료'], label: { ko: '비자 알림', zh: '签证提醒', en: 'Visa Alert' }, tab: 'tools', sub: 'visa-alert' },
                    { keywords: ['날씨','weather','天气'], label: { ko: '날씨', zh: '天气', en: 'Weather' }, tab: 'home', sub: null },
                    { keywords: ['환율','exchange','汇率','원화','위안'], label: { ko: '환율', zh: '汇率', en: 'Exchange Rate' }, tab: 'home', sub: null },
                    { keywords: ['커뮤니티','community','社区','게시판'], label: { ko: '커뮤니티', zh: '社区', en: 'Community' }, tab: 'community', sub: null },
                  ]
                  const results = allItems.filter(item => item.keywords.some(kw => kw.includes(q) || q.includes(kw)))
                  
                  if (results.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <p className="text-[#9AA0A6] text-sm">
                          {lang==='ko'?'검색 결과가 없습니다':lang==='zh'?'没有搜索结果':'No results found'}
                        </p>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="space-y-2">
                      {results.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setShowSearch(false)
                            setSearchQuery('')
                            setTab(item.tab)
                            if (item.sub) setSubPage(item.sub)
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F9FA] transition-colors text-left"
                        >
                          <Search size={16} className="text-[#9AA0A6] shrink-0" />
                          <span className="text-sm font-medium text-[#111827]">{L(lang, item.label)}</span>
                        </button>
                      ))}
                    </div>
                  )
                })()}
              </>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Settings Panel */}
      <>
        <div
          className="fixed inset-0 bg-black z-[199] transition-opacity duration-300"
          style={{ opacity: showAppMenu ? 0.5 : 0, pointerEvents: showAppMenu ? 'auto' : 'none' }}
          onClick={() => setShowAppMenu(false)}
        />
        <div
          className="fixed inset-0 z-[200] transition-transform duration-300 ease-out flex flex-col"
          style={{
            transform: showAppMenu ? 'translateX(0)' : 'translateX(100%)',
            backgroundColor: '#FAFAFA'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
            <h2 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>내 설정</h2>
            <button
              onClick={() => setShowAppMenu(false)}
              className="p-1"
              style={{ color: '#1A1A1A' }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {/* Widget Settings Section */}
            <div className="mb-8">
              <h3 className="text-sm font-bold mb-1" style={{ color: '#1A1A1A' }}>내 위젯 설정</h3>
              <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>홈 화면 위젯 순서를 변경할 수 있습니다</p>
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }}>
                {[
                  { key: 'weather', emoji: '☀️', label: '날씨' },
                  { key: 'exchange', emoji: '💱', label: '환율' },
                  { key: 'clock', emoji: '🕐', label: '한국 시간' },
                  { key: 'course', emoji: '🗺️', label: '추천 코스' },
                  { key: 'emergency', emoji: '🚨', label: '긴급 연락처' },
                ].map((w, i, arr) => {
                  const isOn = widgetSettings[w.key] !== false
                  return (
                    <div key={w.key} className="flex items-center justify-between px-4 py-3.5" style={i < arr.length - 1 ? { borderBottom: '1px solid #F3F4F6' } : {}}>
                      <span className="text-sm" style={{ color: '#1A1A1A' }}>{w.emoji} {w.label}</span>
                      <button
                        onClick={() => {
                          const next = { ...widgetSettings, [w.key]: !isOn }
                          setWidgetSettings(next)
                          localStorage.setItem('hanpocket_widgets', JSON.stringify(next))
                        }}
                        className="relative w-11 h-6 rounded-full transition-colors duration-200"
                        style={{ backgroundColor: isOn ? '#2D5A3D' : '#D1D5DB' }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                          style={{ transform: isOn ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* App Shortcuts Section */}
            <div>
              <h3 className="text-sm font-bold mb-4" style={{ color: '#1A1A1A' }}>앱 바로가기</h3>

              {/* 지도 */}
              <div className="mb-5">
                <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>지도</p>
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }}>
                  <AppShortcut name="카카오맵 (추천)" description="지도, 길찾기, 장소검색" deepLink="kakaomap://" webUrl="https://map.kakao.com" domain="map.kakao.com" />
                  <AppShortcut name="바이두 지도" description="百度地图 — 중국어 지도" deepLink="baidumap://" webUrl="https://map.baidu.com" domain="map.baidu.com" />
                  <AppShortcut name="구글맵" description="Google Maps" deepLink="comgooglemaps://" webUrl="https://maps.google.com" domain="maps.google.com" />
                  <AppShortcut name="네이버 지도" description="지도, 내비게이션" deepLink="nmap://" webUrl="https://map.naver.com" domain="map.naver.com" />
                </div>
              </div>

              {/* 쇼핑/배달 */}
              <div className="mb-5">
                <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>쇼핑/배달</p>
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }}>
                  <AppShortcut name="배달의민족" description="음식 배달 주문" deepLink="baemin://" webUrl="https://apps.apple.com/app/id378084485" domain="baemin.com" />
                  <AppShortcut name="무신사" description="패션 쇼핑몰" deepLink="musinsa://" webUrl="https://apps.apple.com/app/id1095563498" domain="musinsa.com" />
                  <AppShortcut name="올리브영" description="화장품, 생활용품" deepLink="oliveyoung://" webUrl="https://apps.apple.com/app/id1040498076" domain="global.oliveyoung.com" />
                  <AppShortcut name="쿠팡" description="온라인 쇼핑몰" deepLink="coupang://" webUrl="https://apps.apple.com/app/id454434967" domain="coupang.com" />
                  <AppShortcut name="인터파크" description="공연 티켓 구매 전문" deepLink="interpark://" webUrl="https://apps.apple.com/app/id380598498" domain="tickets.interpark.com" />
                </div>
              </div>

              {/* 여행/숙박 */}
              <div className="mb-5">
                <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>여행/숙박</p>
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }}>
                  <AppShortcut name="Trip.com" description="항공권, 호텔 예약" deepLink="ctrip://" webUrl="https://www.trip.com/?promo=aff_1892_hp&locale=ko-KR" domain="trip.com" />
                  <AppShortcut name="Klook" description="액티비티, 투어, 입장권" deepLink="klook://" webUrl="https://www.klook.com/ko/?aid=aff_3219_hp&utm_source=hanpocket" domain="klook.com" />
                </div>
              </div>

              {/* 생활/정부 */}
              <div className="mb-5">
                <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>생활/정부</p>
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }}>
                  <AppShortcut name="카카오톡" description="메신저, 소셜" deepLink="kakaotalk://" webUrl="https://apps.apple.com/app/id362057947" domain="kakaocorp.com" />
                  <AppShortcut name="당근" description="중고거래, 동네생활" deepLink="daangn://" webUrl="https://apps.apple.com/app/id1018769995" domain="daangn.com" />
                  <AppShortcut name="정부24" description="정부 민원 서비스" deepLink="" webUrl="https://apps.apple.com/app/id1327365498" domain="gov.kr" />
                  <AppShortcut name="하이코리아" description="출입국 외국인 정책" deepLink="" webUrl="https://www.hikorea.go.kr" domain="hikorea.go.kr" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>

      {/* Google-style Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom" style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-primary)' }}>
        <div className="flex items-center justify-around py-1.5">
          {bottomTabs.map(item => {
            const active = tab === item.id
            return (
              <button key={item.id} onClick={() => handleTabChange(item.id)}
                className="flex flex-col items-center gap-0.5 py-1 relative">
                <item.icon size={22} strokeWidth={active ? 2 : 1.5} style={{ color: active ? 'var(--accent-green)' : 'var(--text-tertiary)' }} />
                {item.id === 'profile' && localStorage.getItem('admin_mode') === 'true' && (
                  <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
                <span className="text-[11px] font-light" style={{ color: active ? 'var(--accent-green)' : 'var(--text-tertiary)' }}>{L(lang, item.label)}</span>
              </button>
            )
          })}
        </div>
      </div>
      {/* 챗봇 제거 */}
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
        <div className="fixed bottom-6 right-6 z-50 w-[320px] h-[420px] bg-white rounded-lg shadow-2xl border border-[#E5E7EB] flex flex-col overflow-hidden">
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
      <AffiliateTracker />
    </>
  )
}

export default function App() {
  return <ErrorBoundary><AppInner /></ErrorBoundary>
}
