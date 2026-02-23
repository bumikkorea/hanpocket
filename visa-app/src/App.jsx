import { useState, useRef, useEffect, Component } from 'react'
import { isPushSupported, subscribePush, scheduleDdayCheck, cacheVisaProfile, registerPeriodicSync } from './utils/pushNotification'
import { initKakao, loginWithKakao, loginWithKakaoPopup, logoutFromKakao, getKakaoUser, isKakaoLoggedIn, handleKakaoCallback } from './utils/kakaoAuth'
import { loginWithNaver, logoutFromNaver, getNaverUser, isNaverLoggedIn, handleNaverCallback } from './utils/naverAuth'
import { loginWithWeChat, logoutFromWeChat, getWeChatUser, isWeChatLoggedIn, handleWeChatCallback } from './utils/wechatAuth'
import { loginWithAlipay, logoutFromAlipay, getAlipayUser, isAlipayLoggedIn, handleAlipayCallback } from './utils/alipayAuth'
import { initServiceWorker, forceProfileDataRefresh, clearUserCache } from './utils/sw-update'
import { initGA, setConsentMode, trackPageView, trackLogin, trackTabSwitch, trackLanguageChange, trackKakaoEvent } from './utils/analytics'
import { MessageCircle, X, Home, Shield, Grid3x3, Wrench, User, Users, Search, ChevronLeft, Globe, Calendar, Bell, Save, Trash2, Pencil, LogOut, Settings, ChevronRight, HelpCircle, FileText, MapPin, Menu } from 'lucide-react'
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
import AffiliateTracker from './components/AffiliateTracker'
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
        <path d="M6,7 Q10,2 14,7" fill="none" stroke="#111827" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="10" cy="7.5" r="1.3" fill="#111827"/>
        <line x1="8.5" y1="8.5" x2="7" y2="12" stroke="#111827" strokeWidth="0.8" strokeLinecap="round"/>
        <line x1="11.5" y1="8.5" x2="13" y2="12" stroke="#111827" strokeWidth="0.8" strokeLinecap="round"/>
        <path d="M3,9 Q1,14 3,19 Q5,23 10,24 Q15,23 17,19 Q19,14 17,9 Z" fill="#D42B40"/>
        <path d="M4,9 Q6,10.5 10,10.5 Q14,10.5 16,9" fill="none" stroke="#B02535" strokeWidth="0.5"/>
        <rect x="8" y="14" width="4" height="4" rx="0.5" fill="none" stroke="#111827" strokeWidth="0.6"/>
        <line x1="10" y1="14" x2="10" y2="18" stroke="#111827" strokeWidth="0.4"/>
        <line x1="8" y1="16" x2="12" y2="16" stroke="#111827" strokeWidth="0.4"/>
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

  // 스플래시 → 로그인 화면으로 전환
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => setStep('login'), 1800)
      return () => clearTimeout(timer)
    }
  }, [step])

  return (
    <div className="min-h-screen bg-[#FCFCFA] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* 언어 토글 */}
        <button onClick={() => setLang(nextLang(lang))}
          className="absolute top-6 right-6 text-[#6B7280] text-sm px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#111827] transition-all z-10">
          {langLabel(lang)}
        </button>

        {/*  스플래시 (첫 화면) — iPhone Hello 스타일  */}
        {step === 'splash' && (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '72px',
              fontWeight: 200,
              color: '#111827',
              letterSpacing: '0.02em',
              opacity: 0,
              animation: 'fadeIn 1s ease forwards',
            }}>
              你好!
            </span>
          </div>
        )}

        {/*  통합 로그인 화면 — 5개 로그인 + 둘러보기  */}
        {step === 'login' && (
          <div className="w-full max-w-sm animate-fade-up">
            <div className="text-center mb-8">
              <Logo />
            </div>
            <p className="text-[#6B7280] text-sm mb-6 text-center">
              {L(lang, { ko: '간편 로그인으로 시작하세요', zh: '快速登录开始使用', en: 'Get started with quick login' })}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { initKakao(); loginWithKakao(); }}
                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#3C1E1E] rounded-xl p-4 font-medium hover:bg-[#FDD835] transition-all btn-press shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#3C1E1E" d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.75 4.93 4.38 6.24l-1.12 4.16c-.1.36.32.64.62.42l4.97-3.26c.37.04.75.06 1.15.06 5.52 0 10-3.36 10-7.62S17.52 3 12 3z"/></svg>
                {L(lang, { ko: '카카오로 로그인', zh: 'Kakao登录', en: 'Login with Kakao' })}
              </button>

              <button
                onClick={async () => { 
                  try {
                    const userInfo = await loginWithNaver()
                    if (userInfo) {
                      trackLogin('naver', 'visitor')
                      onComplete({ lang, socialLogin: { provider: 'naver', user: userInfo } })
                    }
                  } catch (error) {
                    console.error('네이버 로그인 실패:', error)
                    alert(lang === 'ko' ? '네이버 로그인에 실패했습니다. 나중에 다시 시도해주세요.' : 
                          lang === 'zh' ? 'Naver登录失败，请稍后重试' : 'Naver login failed. Please try again later.')
                    onComplete({ lang })
                  }
                }}
                className="w-full flex items-center justify-center gap-3 bg-[#03C75A] text-white rounded-xl p-4 font-medium hover:opacity-90 transition-all btn-press shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M13.6 11.4L9.5 5.5h-3v13h4.3v-6.6l4.1 6.6H18v-13h-4.4v5.9z"/>
                </svg>
                {L(lang, { ko: '네이버로 로그인', zh: 'Naver登录', en: 'Login with Naver' })}
              </button>

              <button
                onClick={async () => { 
                  try {
                    const userInfo = await loginWithWeChat()
                    if (userInfo) {
                      trackLogin('wechat', 'visitor')
                      onComplete({ lang, socialLogin: { provider: 'wechat', user: userInfo } })
                    }
                  } catch (error) {
                    console.error('WeChat 로그인 실패:', error)
                    alert(lang === 'ko' ? 'WeChat 로그인에 실패했습니다. 나중에 다시 시도해주세요.' : 
                          lang === 'zh' ? '微信登录失败，请稍后重试' : 'WeChat login failed. Please try again later.')
                    onComplete({ lang })
                  }
                }}
                className="w-full flex items-center justify-center gap-3 bg-[#07C160] text-white rounded-xl p-4 font-medium hover:opacity-90 transition-all btn-press shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.534c0 2.22 1.174 4.142 3.016 5.49a.75.75 0 01.27.87l-.458 1.597a.375.375 0 00.506.44l1.932-.901a.75.75 0 01.572-.036c1.014.305 2.1.472 3.228.472.169 0 .336-.005.502-.014a5.868 5.868 0 01-.254-1.718c0-3.56 3.262-6.45 7.282-6.45.215 0 .428.01.638.028C16.283 5.114 12.85 2.188 8.691 2.188zM5.785 7.095a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25zm5.813 0a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25z"/><path d="M23.997 15.268c0-3.29-3.262-5.96-7.285-5.96-4.023 0-7.285 2.67-7.285 5.96 0 3.292 3.262 5.96 7.285 5.96.89 0 1.746-.132 2.534-.375a.75.75 0 01.573.036l1.478.689a.375.375 0 00.506-.44l-.35-1.22a.75.75 0 01.27-.87c1.49-1.09 2.274-2.644 2.274-4.38zm-9.792-.75a.938.938 0 110-1.875.938.938 0 010 1.875zm5.015 0a.938.938 0 110-1.875.938.938 0 010 1.875z"/></svg>
                {L(lang, { ko: 'WeChat으로 로그인', zh: '微信登录', en: 'Login with WeChat' })}
              </button>
              <button
                onClick={async () => { 
                  try {
                    const userInfo = await loginWithAlipay()
                    if (userInfo) {
                      trackLogin('alipay', 'visitor')
                      onComplete({ lang, socialLogin: { provider: 'alipay', user: userInfo } })
                    }
                  } catch (error) {
                    console.error('Alipay 로그인 실패:', error)
                    alert(lang === 'ko' ? 'Alipay 로그인에 실패했습니다. 나중에 다시 시도해주세요.' : 
                          lang === 'zh' ? '支付宝登录失败，请稍后重试' : 'Alipay login failed. Please try again later.')
                    onComplete({ lang })
                  }
                }}
                className="w-full flex items-center justify-center gap-3 bg-[#1677FF] text-white rounded-xl p-4 font-medium hover:opacity-90 transition-all btn-press shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21.422 13.482C19.558 12.614 17.46 11.6 15.998 10.952c.72-1.748 1.164-3.678 1.164-5.202 0-1.554-.87-3.75-3.828-3.75-2.478 0-4.038 1.86-4.038 4.11 0 2.598 1.806 4.764 4.362 5.424-.498.804-1.104 1.518-1.788 2.118-1.62 1.416-3.456 2.13-5.454 2.13C4.146 15.782 2 14.258 2 11.988 2 6.468 7.098 2 13.332 2 19.566 2 22 6.468 22 11.988c0 .516-.03 1.02-.084 1.494h-.494z"/></svg>
                {L(lang, { ko: 'Alipay로 로그인', zh: '支付宝登录', en: 'Login with Alipay' })}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
              </div>

              <button
                onClick={() => {
                  onComplete({ lang, socialLogin: { provider: 'guest', user: { nickname: lang === 'ko' ? '게스트' : lang === 'zh' ? '访客' : 'Guest' } } })
                }}
                className="w-full text-center text-[#6B7280] text-sm py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all font-medium">
                {L(lang, { ko: '게스트로 둘러보기', zh: '以访客身份浏览', en: 'Continue as Guest' })}
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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

function ProfileTab({ profile, setProfile, lang, onResetPushDismiss }) {
  // 로그인 방식 확인을 위한 소셜 로그인 사용자 정보
  const kakaoUser = getKakaoUser()
  const naverUser = getNaverUser()
  const wechatUser = getWeChatUser()
  const alipayUser = getAlipayUser()
  
  // 모달 관리
  const [showDateModal, setShowDateModal] = useState(false)
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [showTimingModal, setShowTimingModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  
  // 비자 만료일 임시 저장
  const [tempDate, setTempDate] = useState('')
  
  // 알림 설정
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('visa_notif_prefs')) || { d90: true, d60: true, d30: true, d7: true } }
    catch { return { d90: true, d60: true, d30: true, d7: true } }
  })

  // 로그인 방식 표시
  const getLoginProvider = () => {
    if (kakaoUser) return { provider: 'kakao', nickname: kakaoUser.nickname, icon: '💬' }
    if (naverUser) return { provider: 'naver', nickname: naverUser.nickname || naverUser.name, icon: '🟢' }
    if (wechatUser) return { provider: 'wechat', nickname: wechatUser.nickname, icon: '💚' }
    if (alipayUser) return { provider: 'alipay', nickname: alipayUser.nickName, icon: '🔵' }
    return null
  }

  // 국적 표시
  const getNationalityLabel = () => {
    const nationalityLabels = {
      china_mainland: { ko: '중국(본토)', zh: '中国大陆', en: 'Mainland China' },
      china_hk: { ko: '홍콩', zh: '香港', en: 'Hong Kong' },
      china_macau: { ko: '마카오', zh: '澳门', en: 'Macau' },
      china_taiwan: { ko: '대만', zh: '台湾', en: 'Taiwan' },
      other: { ko: '기타', zh: '其他', en: 'Other' }
    }
    return nationalityLabels[profile?.nationality]?.[lang] || profile?.nationality || '-'
  }

  // 비자 타입 표시
  const getVisaTypeLabel = () => {
    const visaLabels = {
      'd2_4': { ko: 'D-2 (유학)', zh: 'D-2 (留学)', en: 'D-2 (Study)' },
      'd10': { ko: 'D-10 (구직)', zh: 'D-10 (求职)', en: 'D-10 (Job Seeking)' },
      'h1': { ko: 'H-1 (관광취업)', zh: 'H-1 (观光就业)', en: 'H-1 (Working Holiday)' },
      'f4': { ko: 'F-4 (재외동포)', zh: 'F-4 (海外同胞)', en: 'F-4 (Overseas Korean)' },
      'f5': { ko: 'F-5 (영주)', zh: 'F-5 (永住)', en: 'F-5 (Permanent)' },
      'f6': { ko: 'F-6 (결혼이민)', zh: 'F-6 (结婚移民)', en: 'F-6 (Marriage)' }
    }
    return visaLabels[profile?.visaType]?.[lang] || profile?.visaType || '-'
  }

  // 레벨 표시
  const getUserLevel = () => {
    return { ko: 'Lv.1 새내기', zh: 'Lv.1 新手', en: 'Lv.1 Newbie' }[lang]
  }

  // 구독 표시
  const getSubscription = () => {
    return { ko: 'Free', zh: 'Free', en: 'Free' }[lang]
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

  // 알림 설정 Yes
  const handleNotifYes = async () => {
    setShowNotifModal(false)
    
    // 푸시 알림 권한 요청 (가능한 경우)
    if (typeof Notification !== 'undefined') {
      try {
        await Notification.requestPermission()
      } catch (e) {
        console.log('Notification permission request failed:', e)
      }
    }
    
    // 권한 결과에 상관없이 타이밍 선택 모달 표시
    setShowTimingModal(true)
  }

  // 알림 시점 저장
  const handleSaveTiming = () => {
    localStorage.setItem('visa_notif_prefs', JSON.stringify(notifPrefs))
    setShowTimingModal(false)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 1000)
  }

  // 알림 토글
  const toggleNotif = (key) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // 로그아웃
  const handleLogout = () => {
    if (kakaoUser) logoutFromKakao()
    if (naverUser) logoutFromNaver()
    if (wechatUser) logoutFromWeChat()
    if (alipayUser) logoutFromAlipay()
    localStorage.removeItem('visa_profile')
    localStorage.removeItem('visa_notif_prefs')
    setProfile(null)
  }

  const loginInfo = getLoginProvider()

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-4 pb-20 font-['Inter']">
      {/* 메인 프로필 카드 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        {/* 프로필 헤더 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-3">
            {loginInfo ? (
              <span className="text-2xl">{loginInfo.icon}</span>
            ) : (
              <User className="w-8 h-8 text-[#6B7280]" />
            )}
          </div>
          
          <div className="text-xl font-bold text-[#111827] mb-1">
            {loginInfo?.nickname || (lang === 'ko' ? '사용자' : lang === 'zh' ? '用户' : 'User')}
          </div>
          
          {loginInfo && (
            <div className="text-sm text-[#6B7280] flex items-center justify-center gap-1">
              <span className="text-xs">{loginInfo.icon}</span>
              {loginInfo.provider === 'kakao' && (lang === 'ko' ? '카카오로 로그인' : lang === 'zh' ? 'Kakao登录' : 'Login with Kakao')}
              {loginInfo.provider === 'naver' && (lang === 'ko' ? '네이버로 로그인' : lang === 'zh' ? 'Naver登录' : 'Login with Naver')}
              {loginInfo.provider === 'wechat' && (lang === 'ko' ? 'WeChat으로 로그인' : lang === 'zh' ? '微信登录' : 'Login with WeChat')}
              {loginInfo.provider === 'alipay' && (lang === 'ko' ? 'Alipay로 로그인' : lang === 'zh' ? '支付宝登录' : 'Login with Alipay')}
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="border-t border-[#E5E7EB] my-4"></div>

        {/* 프로필 정보 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-[#6B7280] text-sm">
              {lang === 'ko' ? '국적' : lang === 'zh' ? '国籍' : 'Nationality'}
            </span>
            <span className="font-medium text-[#111827] text-sm">{getNationalityLabel()}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-[#6B7280] text-sm">
              {lang === 'ko' ? '비자' : lang === 'zh' ? '签证' : 'Visa'}
            </span>
            <span className="font-medium text-[#111827] text-sm">{getVisaTypeLabel()}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-[#6B7280] text-sm">
              {lang === 'ko' ? '레벨' : lang === 'zh' ? '等级' : 'Level'}
            </span>
            <span className="font-medium text-[#111827] text-sm">{getUserLevel()}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-[#6B7280] text-sm">
              {lang === 'ko' ? '구독' : lang === 'zh' ? '订阅' : 'Subscription'}
            </span>
            <span className="font-medium text-[#111827] text-sm flex items-center gap-1">
              <Shield className="w-4 h-4 text-[#6B7280]" />
              {getSubscription()}
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-[#E5E7EB] my-4"></div>

        {/* 비자 만료일 */}
        <div className="flex justify-between items-center py-2">
          <div>
            {expiryDate && days !== null ? (
              <>
                <span className="text-[#6B7280] text-sm">
                  {lang === 'ko' ? '비자 만료' : lang === 'zh' ? '签证到期' : 'Visa Expiry'}
                </span>
                <div className="mt-1">
                  <span className="font-medium text-[#111827] text-sm">{expiryDate}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    days <= 0 ? 'bg-red-100 text-red-600' :
                    days <= 30 ? 'bg-red-100 text-red-600' :
                    days <= 90 ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {days <= 0 ? (lang === 'ko' ? '만료됨' : lang === 'zh' ? '已过期' : 'Expired') : `D-${days}`}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-[#6B7280] text-sm">
                {lang === 'ko' ? '비자 만료일을 설정하세요' : lang === 'zh' ? '请设置签证到期日期' : 'Set visa expiry date'}
              </span>
            )}
          </div>
          
          <button
            onClick={handleEditExpiry}
            className="w-7 h-7 bg-[#F3F4F6] rounded-full flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
        </div>

        {/* 구분선 */}
        <div className="border-t border-[#E5E7EB] my-6"></div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="w-full text-[#6B7280] text-sm py-3 hover:text-[#111827] transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          {lang === 'ko' ? '로그아웃' : lang === 'zh' ? '注销' : 'Logout'}
        </button>
      </div>

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
                {lang === 'ko' ? '비자 만료일 알림을 받으시겠습니까?' : lang === 'zh' ? '您希望收到签证到期提醒吗？' : 'Would you like to receive visa expiry reminders?'}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowNotifModal(false)}
                className="flex-1 py-3 text-[#6B7280] font-medium rounded-xl hover:bg-[#F3F4F6] transition-colors"
              >
                {lang === 'ko' ? 'No' : 'No'}
              </button>
              <button
                onClick={handleNotifYes}
                className="flex-1 py-3 bg-[#111827] text-white font-medium rounded-xl hover:bg-[#1F2937] transition-colors"
              >
                {lang === 'ko' ? 'Yes' : 'Yes'}
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
                { key: 'd90', label: { ko: '90일 전', zh: '90天前', en: '90 days before' } },
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

      {/* 토스트 메시지 */}
      {showToast && (
        <div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#111827] text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg z-50 animate-fade-in"
          style={{ animation: 'fadeInOut 1s ease-in-out' }}
        >
          {lang === 'ko' ? '비자 만료 알림이 설정되었습니다' : lang === 'zh' ? '已设置签证到期提醒' : 'Visa expiry alerts set'}
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

  // 카카오 OAuth 리다이렉트 콜백 처리 (App 레벨)
  useEffect(() => {
    initKakao()
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      trackKakaoEvent('kakao_oauth_callback_received')
      handleKakaoCallback().then(user => {
        if (user) {
          // 로그인 성공 → 온보딩 건너뛰고 프로필 설정
          trackKakaoEvent('kakao_oauth_success', { nickname: user.nickname })
          trackLogin('kakao', 'resident')
          
          if (!profile) {
            const p = { lang, userType: 'resident' }
            setProfile(p)
            saveProfile(p)
          }
        } else {
          trackKakaoEvent('kakao_oauth_failed')
        }
      }).catch(error => {
        console.error('Kakao OAuth error:', error)
        trackKakaoEvent('kakao_oauth_error', { error: error.message })
      })
    }
  }, [])

  // Service Worker 초기화 및 업데이트 관리
  useEffect(() => {
    initServiceWorker()
  }, [])

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
  useEffect(() => {
    if (tab === 'profile' || view === 'profile' || tab === 'visa-alert') {
      forceProfileDataRefresh()
      console.log('Profile data cache refreshed for tab:', tab)
    }
  }, [tab, view])

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

  // OAuth 리다이렉트 중이면 온보딩 대신 로딩 표시 (콜백 처리 대기)
  const hasOAuthCode = new URLSearchParams(window.location.search).get('code')
  if (!profile && hasOAuthCode) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FCFCFA]" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#111827] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#6B7280]">{lang === 'ko' ? '로그인 처리 중...' : lang === 'zh' ? '登录处理中...' : 'Logging in...'}</p>
        </div>
      </div>
    )
  }
  if (!profile) return <Onboarding lang={lang} setLang={setLang} onComplete={p => { setProfile(p); saveProfile(p); setLang(p.lang||'ko'); }} />

  const bottomTabs = [
    { id: 'home', icon: Home, label: { ko: '홈', zh: '首页', en: 'Home' } },
    { id: 'pocket', icon: Grid3x3, label: { ko: '포켓', zh: '口袋', en: 'Pocket' } },
    { id: 'community', icon: Users, label: { ko: '커뮤니티', zh: '社区', en: 'Community' } },
    { id: 'profile', icon: User, label: { ko: '나', zh: '我', en: 'Me' } },
  ]

  // Feature completion scores from docs/feature-review-10k*.md
  const featureScores = {
    travel: 84,     // 수정중 (70-84)
    food: 87,       // 완료 (85+)
    shopping: 91,   // 완료 (85+)
    hallyu: 92,     // 완료 (85+)
    learn: 87,      // 완료 (85+)
    life: 91,       // 완료 (85+)
    medical: 90,    // 완료 (85+)
    fitness: 89,    // 완료 (85+)
    community: 87.5, // 완료 (85+)
    translator: 92.5, // 완료 (85+)
    artranslate: 93.2, // 완료 (85+)
    sos: 97,        // 완료 (85+)
    finance: 87,    // 완료 (85+)
    wallet: 95,     // 완료 (85+)
    visaalert: 86,  // 완료 (85+)
  }
  
  // Generate status label based on completion score
  const getStatusLabel = (score) => {
    if (score >= 85) return { ko: '완료', zh: '完成', en: 'Done' }
    if (score >= 70) return { ko: '수정중', zh: '修改中', en: 'WIP' }
    return { ko: '개발중', zh: '开发中', en: 'Dev' }
  }
  
  const exploreItems = [
    { id: 'travel', label: { ko: `여행 (${getStatusLabel(featureScores.travel).ko})`, zh: `旅行 (${getStatusLabel(featureScores.travel).zh})`, en: `Travel (${getStatusLabel(featureScores.travel).en})` } },
    { id: 'food', label: { ko: `맛집 (${getStatusLabel(featureScores.food).ko})`, zh: `美食 (${getStatusLabel(featureScores.food).zh})`, en: `Food (${getStatusLabel(featureScores.food).en})` } },
    { id: 'shopping', label: { ko: `쇼핑 (${getStatusLabel(featureScores.shopping).ko})`, zh: `购物 (${getStatusLabel(featureScores.shopping).zh})`, en: `Shopping (${getStatusLabel(featureScores.shopping).en})` } },
    { id: 'hallyu', label: { ko: `한류 (${getStatusLabel(featureScores.hallyu).ko})`, zh: `韩流 (${getStatusLabel(featureScores.hallyu).zh})`, en: `Hallyu (${getStatusLabel(featureScores.hallyu).en})` } },
    { id: 'learn', label: { ko: `한국어 (${getStatusLabel(featureScores.learn).ko})`, zh: `韩语 (${getStatusLabel(featureScores.learn).zh})`, en: `Korean (${getStatusLabel(featureScores.learn).en})` } },
    { id: 'life', label: { ko: `생활 (${getStatusLabel(featureScores.life).ko})`, zh: `生活 (${getStatusLabel(featureScores.life).zh})`, en: `Life (${getStatusLabel(featureScores.life).en})` } },
    { id: 'medical', label: { ko: `의료 (${getStatusLabel(featureScores.medical).ko})`, zh: `医疗 (${getStatusLabel(featureScores.medical).zh})`, en: `Medical (${getStatusLabel(featureScores.medical).en})` } },
    { id: 'fitness', label: { ko: `운동 (${getStatusLabel(featureScores.fitness).ko})`, zh: `运动 (${getStatusLabel(featureScores.fitness).zh})`, en: `Fitness (${getStatusLabel(featureScores.fitness).en})` } },
    { id: 'community', label: { ko: `커뮤니티 (${getStatusLabel(featureScores.community).ko})`, zh: `社区 (${getStatusLabel(featureScores.community).zh})`, en: `Community (${getStatusLabel(featureScores.community).en})` } },
  ]

  const toolItems = [
    { id: 'translator', label: { ko: `통역 (${getStatusLabel(featureScores.translator).ko})`, zh: `翻译 (${getStatusLabel(featureScores.translator).zh})`, en: `Translate (${getStatusLabel(featureScores.translator).en})` } },
    { id: 'artranslate', label: { ko: `간판 사전 (${getStatusLabel(featureScores.artranslate).ko})`, zh: `招牌词典 (${getStatusLabel(featureScores.artranslate).zh})`, en: `Sign Dict (${getStatusLabel(featureScores.artranslate).en})` } },
    { id: 'sos', label: { ko: `SOS (${getStatusLabel(featureScores.sos).ko})`, zh: `SOS (${getStatusLabel(featureScores.sos).zh})`, en: `SOS (${getStatusLabel(featureScores.sos).en})` } },
    { id: 'finance', label: { ko: `금융 (${getStatusLabel(featureScores.finance).ko})`, zh: `金融 (${getStatusLabel(featureScores.finance).zh})`, en: `Finance (${getStatusLabel(featureScores.finance).en})` } },
    { id: 'wallet', label: { ko: `월렛 (${getStatusLabel(featureScores.wallet).ko})`, zh: `钱包 (${getStatusLabel(featureScores.wallet).zh})`, en: `Wallet (${getStatusLabel(featureScores.wallet).en})` } },
    { id: 'visaalert', label: { ko: `비자 알림 (${getStatusLabel(featureScores.visaalert).ko})`, zh: `签证提醒 (${getStatusLabel(featureScores.visaalert).zh})`, en: `Visa Alert (${getStatusLabel(featureScores.visaalert).en})` } },
  ]

  // Keep old tabs array for compatibility
  const tabs = bottomTabs

  // 29CM-style sub-menus per tab
  const subMenus = {
    transition: {
      title: { ko: '비자 · 서류', zh: '签证 · 文件', en: 'Visa · Docs' },
      items: [
        { label: { ko: '비자 종류별 안내', zh: '签证类型指南', en: 'Visa Types' }, action: () => { setTab('transition'); setView('home') } },
        { label: { ko: '비자 변경/전환', zh: '签证变更', en: 'Visa Change' }, action: () => { setTab('transition'); setView('transition') } },
        { label: { ko: 'D-day 알림', zh: 'D-day提醒', en: 'D-day Alert' }, action: () => { setTab('visaalert') } },
        { label: { ko: '서류 대행', zh: '文件代办', en: 'Document Services' }, action: () => { setTab('transition'); setView('agency') } },
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
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {showNotice && <NoticePopup lang={lang} onClose={() => setShowNotice(false)} />}

      {/* Google-style Top Bar */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-3">
            {subPage ? (
              <button onClick={() => { setSubPage(null) }} className="text-[#5F6368] p-1">
                <ChevronLeft size={24} />
              </button>
            ) : (
              <Logo />
            )}
            <div className="flex-1" />
            <button onClick={() => setShowAppMenu(true)} className="text-[#5F6368] p-1">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-4">
        {/* Install / Push notification banner */}
        {!pushDismissed && tab === 'home' && (() => {
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
          if (pushEnabled) return null
          if (!isStandalone && isIOS) {
            // iOS Safari — 앱 설치 안내
            return (
              <div className="mb-4 bg-[#F3F4F6] rounded-xl p-4">
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
            <div className="mb-4 bg-[#F3F4F6] rounded-xl p-4 flex items-center justify-between">
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
        {/* Explore grid */}
        {tab==='pocket' && !subPage && (
          <div>
            <div className="grid grid-cols-3 gap-3">
              {[...exploreItems, ...toolItems].map(item => (
                <button key={item.id} onClick={() => { setSubPage(item.id) }}
                  className="bg-white rounded-lg p-4 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-sm text-[#111827] font-medium tracking-wide">{L(lang, item.label)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sub-pages from explore/tools */}
        {subPage==='travel' && <TravelTab lang={lang} setTab={(t) => setSubPage(t)} />}
        {subPage==='food' && <FoodTab lang={lang} setTab={(t) => setSubPage(t)} />}
        {subPage==='shopping' && <ShoppingTab lang={lang} setTab={(t) => setSubPage(t)} />}
        {subPage==='hallyu' && <HallyuTab lang={lang} setTab={(t) => setSubPage(t)} />}
        {subPage==='learn' && <EducationTab lang={lang} />}
        {subPage==='life' && <LifeToolsTab lang={lang} setTab={(t) => setSubPage(t)} />}
        {subPage==='medical' && <MedicalTab lang={lang} />}
        {subPage==='fitness' && <FitnessTab lang={lang} />}
        {subPage==='community' && <CommunityTab lang={lang} profile={profile} />}
        {subPage==='translator' && <TranslatorTab lang={lang} />}
        {subPage==='artranslate' && <ARTranslateTab lang={lang} />}
        {subPage==='sos' && <SOSTab lang={lang} profile={profile} />}
        {subPage==='finance' && <FinanceTab lang={lang} profile={profile} />}
        {subPage==='wallet' && <DigitalWalletTab lang={lang} profile={profile} />}
        {subPage==='visaalert' && <VisaAlertTab lang={lang} profile={profile} />}

        {tab==='community' && !subPage && <CommunityTab lang={lang} profile={profile} />}
        {tab==='home' && !subPage && <HomeTab profile={profile} lang={lang} exchangeRate={exchangeRate} setTab={(t) => { if(['travel','food','shopping','hallyu','learn','life','jobs','housing','medical','fitness','translator','artranslate','sos','finance','wallet','resume','visaalert','community'].includes(t)) { setTab('explore'); setSubPage(t) } else { setTab(t) }}} />}
        {tab==='transition' && !subPage && <VisaTab profile={profile} lang={lang} view={view} setView={setView} selCat={selCat} setSelCat={setSelCat} selVisa={selVisa} setSelVisa={setSelVisa} sq={sq} setSq={setSq} />}
        {tab==='profile' && !subPage && <ProfileTab profile={profile} setProfile={setProfile} lang={lang} onResetPushDismiss={() => setPushDismissed(false)} />}
        <div className="mt-12 mb-6 text-center text-[11px] text-[#9CA3AF] space-y-1">
          <p className="text-[9px] text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
            {lang === 'ko' ? '본 앱의 정보는 참고용이며 법적 효력이 없습니다. 비자, 법률, 의료 관련 사항은 반드시 관련 기관에 직접 확인하시기 바랍니다.' 
            : lang === 'zh' ? '本应用信息仅供参考，不具有法律效力。签证、法律、医疗相关事项请务必直接向相关机构确认。'
            : 'Information in this app is for reference only and has no legal effect. Please verify visa, legal, and medical matters directly with relevant authorities.'}
          </p>
          <p>© 2026 HanPocket. All rights reserved.</p>
        </div>
      </div>
      {/* 검색 모달 */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
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

      {/* Google-style Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] z-50 safe-bottom">
        <div className="flex items-center justify-around py-1">
          {bottomTabs.map(item => {
            const active = tab === item.id
            return (
              <button key={item.id} onClick={() => { setTab(item.id); setSubPage(null); if(item.id==='home'){setView('home');setSelCat(null);setSelVisa(null);setSq('')} }}
                className="flex flex-col items-center gap-0 py-0.5">
                {item.id === 'pocket' ? (
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none" className={active ? 'text-[#111827]' : 'text-[#9CA3AF]'}>
                    <path d="M20 4C14 4 8 8 8 8L6 12C6 12 5 16 6 20C7 24 10 28 14 31C17 33 20 36 20 36C20 36 23 33 26 31C30 28 33 24 34 20C35 16 34 12 34 12L32 8C32 8 26 4 20 4Z" fill={active ? '#D94F4F' : 'currentColor'} opacity={active ? 1 : 0.3}/>
                    <path d="M14 12C14 12 13 14 14 17C15 20 17 22 20 24C23 22 25 20 26 17C27 14 26 12 26 12" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    <circle cx="16" cy="10" r="1" fill="white" opacity="0.6"/>
                    <line x1="18" y1="8" x2="18" y2="6" stroke={active ? '#D94F4F' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" opacity={active ? 1 : 0.4}/>
                    <line x1="22" y1="8" x2="22" y2="5" stroke={active ? '#D94F4F' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" opacity={active ? 1 : 0.4}/>
                  </svg>
                ) : (
                  <item.icon size={20} strokeWidth={active ? 2 : 1.5} className={active ? 'text-[#111827]' : 'text-[#9CA3AF]'} />
                )}
                <span className={`text-[10px] font-light ${active ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>{L(lang, item.label)}</span>
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

      {/* App Shortcuts Sidebar */}
      {showAppMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowAppMenu(false)}
          />
          <div 
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-out z-50"
            style={{ transform: showAppMenu ? 'translateX(0)' : 'translateX(100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#111827]">앱 바로가기</h2>
              <button 
                onClick={() => setShowAppMenu(false)}
                className="text-[#5F6368] p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* App Categories */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 교통 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#111827] mb-3">교통</h3>
                <div className="space-y-2">
                  <AppShortcut 
                    name="카카오T"
                    description="택시, 대중교통, 주차"
                    deepLink="kakaot://"
                    webUrl="https://t.kakao.com"
                    domain="t.kakao.com"
                  />
                  <AppShortcut 
                    name="카카오맵"
                    description="지도, 길찾기, 장소검색"
                    deepLink="kakaomap://"
                    webUrl="https://map.kakao.com"
                    domain="map.kakao.com"
                  />
                  <AppShortcut 
                    name="네이버지도"
                    description="지도, 내비게이션"
                    deepLink="nmap://"
                    webUrl="https://map.naver.com"
                    domain="map.naver.com"
                  />
                </div>
              </div>

              {/* 배달/쇼핑 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#111827] mb-3">배달/쇼핑</h3>
                <div className="space-y-2">
                  <AppShortcut 
                    name="배달의민족"
                    description="음식 배달 주문"
                    deepLink="baemin://"
                    webUrl="https://www.baemin.com"
                    domain="baemin.com"
                  />
                  <AppShortcut 
                    name="당근"
                    description="중고거래, 동네생활"
                    deepLink="daangn://"
                    webUrl="https://www.daangn.com"
                    domain="daangn.com"
                  />
                  <AppShortcut 
                    name="쿠팡"
                    description="온라인 쇼핑몰"
                    deepLink="coupang://"
                    webUrl="https://www.coupang.com"
                    domain="coupang.com"
                  />
                  <AppShortcut 
                    name="무신사"
                    description="패션 쇼핑몰"
                    deepLink="musinsa://"
                    webUrl="https://www.musinsa.com"
                    domain="musinsa.com"
                  />
                  <AppShortcut 
                    name="올리브영"
                    description="화장품, 생활용품"
                    deepLink="oliveyoung://"
                    webUrl="https://global.oliveyoung.com"
                    domain="global.oliveyoung.com"
                  />
                </div>
              </div>

              {/* 여행/숙박 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#111827] mb-3">여행/숙박</h3>
                <div className="space-y-2">
                  <AppShortcut 
                    name="야놀자"
                    description="숙박, 레저 예약"
                    deepLink="yanolja://"
                    webUrl="https://www.yanolja.com"
                    domain="yanolja.com"
                  />
                  <AppShortcut 
                    name="여기어때"
                    description="국내 숙박 예약"
                    deepLink="gchoice://"
                    webUrl="https://www.goodchoice.kr"
                    domain="goodchoice.kr"
                  />
                  <AppShortcut 
                    name="Klook"
                    description="해외 액티비티, 투어"
                    deepLink="klook://"
                    webUrl="https://www.klook.com/ko/?aid=aff_3219_hp&utm_source=hanpocket"
                    domain="klook.com"
                  />
                  <AppShortcut 
                    name="Trip.com"
                    description="항공권, 호텔 예약"
                    deepLink="ctrip://"
                    webUrl="https://www.trip.com/?promo=aff_1892_hp&locale=ko-KR"
                    domain="trip.com"
                  />
                </div>
              </div>

              {/* 생활/정부 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#111827] mb-3">생활/정부</h3>
                <div className="space-y-2">
                  <AppShortcut 
                    name="카카오톡"
                    description="메신저, 소셜"
                    deepLink="kakaotalk://"
                    webUrl="https://www.kakaocorp.com/page/service/service/KakaoTalk"
                    domain="kakaocorp.com"
                  />
                  <AppShortcut 
                    name="정부24"
                    description="정부 민원 서비스"
                    deepLink=""
                    webUrl="https://www.gov.kr"
                    domain="gov.kr"
                  />
                  <AppShortcut 
                    name="하이코리아"
                    description="출입국 외국인 정책"
                    deepLink=""
                    webUrl="https://www.hikorea.go.kr"
                    domain="hikorea.go.kr"
                  />
                </div>
              </div>
            </div>

            {/* Language Toggle at Bottom */}
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={() => {
                  setLang(nextLang(lang))
                  setShowAppMenu(false)
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-[#F3F4F6] text-[#111827] rounded-lg hover:bg-[#E5E7EB] transition-colors"
              >
                <Globe size={16} />
                <span className="font-medium">{langLabel(lang)}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default function App() {
  return <ErrorBoundary><AppInner /></ErrorBoundary>
}
