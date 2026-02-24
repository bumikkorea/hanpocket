import React, { useState, useEffect } from 'react'
import { initKakao, handleKakaoCallback } from './utils/kakaoAuth'
import { initGA, setConsentMode, trackPageView, trackTabSwitch, trackLanguageChange, trackKakaoEvent, trackLogin } from './utils/analytics'
import { initServiceWorker, forceProfileDataRefresh } from './utils/sw-update'
import { Home, Shield, Grid3x3, MessageCircle, Search, Menu } from 'lucide-react'
import { t } from './data/i18n'

// Custom hooks
import { useProfile } from './hooks/useProfile'
import { useExchangeRate } from './hooks/useExchangeRate'
import { useNotification } from './hooks/useNotification'
import { useLanguage } from './hooks/useLanguage'

// Components
import OnboardingFlow from './components/OnboardingFlow'
import SearchModal from './components/modals/SearchModal'
import AffiliateTracker from './components/AffiliateTracker'
import Logo from './components/Logo'
import NoticePopup from './components/NoticePopup'
import PushNotificationPrompt from './components/PushNotificationPrompt'
import PageRouter from './components/PageRouter'

function AppInner() {
  // Custom hooks
  const { profile, setProfile } = useProfile()
  const exchangeRate = useExchangeRate()
  const { pushEnabled, pushDismissed, handleEnablePush, dismissPushPrompt } = useNotification()
  const { lang, setLang, toggleLanguage, getCurrentLangLabel } = useLanguage('ko')

  // Local state
  const [showNotice, setShowNotice] = useState(false)
  const [tab, setTab] = useState('home')
  const [view, setView] = useState('home')
  const [selCat, setSelCat] = useState(null)
  const [selVisa, setSelVisa] = useState(null)
  const [sq, setSq] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [hoveredTab, setHoveredTab] = useState(null)
  const [subPage, setSubPage] = useState(null)

  // Kakao OAuth callback handling
  useEffect(() => {
    initKakao()
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      trackKakaoEvent('kakao_oauth_callback_received')
      handleKakaoCallback().then(user => {
        if (user) {
          trackKakaoEvent('kakao_oauth_success', { nickname: user.nickname })
          trackLogin('kakao', 'resident')
          
          if (!profile) {
            const p = { lang, userType: 'resident' }
            setProfile(p)
            setLang(p.lang || 'ko')
          }
        } else {
          trackKakaoEvent('kakao_oauth_failed')
        }
      })
    }
  }, [profile, lang, setProfile, setLang])

  // Initialize analytics and service worker
  useEffect(() => {
    initGA()
    setConsentMode('granted', 'granted')
    trackPageView()
    initServiceWorker()
    
    // Show notice popup
    const dismissed = localStorage.getItem('hp_notice_dismiss')
    if (!dismissed || (dismissed !== 'forever' && dismissed !== new Date().toDateString())) {
      setTimeout(() => setShowNotice(true), 2000)
    }
  }, [])

  // Track tab changes
  useEffect(() => {
    trackTabSwitch(tab)
    if (tab !== 'pockets') setSubPage(null)
    forceProfileDataRefresh(tab)
  }, [tab])

  // Track language changes
  useEffect(() => {
    trackLanguageChange(lang)
  }, [lang])

  // OAuth redirect loading state
  const hasOAuthCode = new URLSearchParams(window.location.search).get('code')
  if (!profile && hasOAuthCode) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FCFCFA]" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#111827] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#6B7280]">
            {lang === 'ko' ? '로그인 처리 중...' : lang === 'zh' ? '登录处理中...' : 'Logging in...'}
          </p>
        </div>
      </div>
    )
  }

  // Onboarding flow
  if (!profile) {
    return (
      <OnboardingFlow 
        lang={lang} 
        setLang={setLang} 
        onComplete={p => { 
          setProfile(p) 
          setLang(p.lang || 'ko')
        }} 
      />
    )
  }

  const bottomTabs = [
    { id: 'home', icon: Home, label: { ko: '홈', zh: '首页', en: 'Home' } },
    { id: 'visa', icon: Shield, label: { ko: '비자', zh: '签证', en: 'Visa' } },
    { id: 'pockets', icon: Grid3x3, label: { ko: '포켓', zh: '口袋', en: 'Pockets' } },
    { id: 'chat', icon: MessageCircle, label: { ko: '채팅', zh: '聊天', en: 'Chat' } },
  ]

  return (
    <div className="min-h-screen bg-[#FCFCFA] pb-20" style={{ fontFamily: 'Inter, sans-serif' }}>
      <AffiliateTracker />
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FCFCFA]/95 backdrop-blur-sm border-b border-[#E5E7EB]/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-[#6B7280]" />
            </button>
            <button 
              onClick={toggleLanguage}
              className="text-[#6B7280] text-sm px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#111827] transition-all"
            >
              {getCurrentLangLabel()}
            </button>
            <button className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors">
              <Menu className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <PageRouter
          currentTab={tab}
          profile={profile}
          exchangeRate={exchangeRate}
          lang={lang}
          view={view}
          setView={setView}
          selCat={selCat}
          setSelCat={setSelCat}
          selVisa={selVisa}
          setSelVisa={setSelVisa}
          sq={sq}
          setSq={setSq}
          subPage={subPage}
          setSubPage={setSubPage}
          onTabChange={setTab}
        />
      </div>

      {/* Push Notification Prompt */}
      <PushNotificationPrompt
        pushEnabled={pushEnabled}
        pushDismissed={pushDismissed}
        lang={lang}
        onEnablePush={() => handleEnablePush(lang, profile)}
        onDismiss={dismissPushPrompt}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-4 py-2 z-30">
        <div className="flex justify-around">
          {bottomTabs.map((item) => {
            const Icon = item.icon
            const isActive = tab === item.id
            const isHovered = hoveredTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all ${
                  isActive ? 'text-[#111827] bg-[#F3F4F6]' : 'text-[#9CA3AF] hover:text-[#6B7280]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-all ${isActive || isHovered ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">
                  {item.label[lang] || item.label.en}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      {showSearch && (
        <SearchModal 
          isOpen={showSearch} 
          onClose={() => setShowSearch(false)} 
          onSelectVisa={(visaId) => {
            setSelVisa(visaId)
            setView('detail')
            setTab('visa')
          }}
          lang={lang}
        />
      )}
      
      {showNotice && <NoticePopup lang={lang} onClose={() => setShowNotice(false)} />}
    </div>
  )
}

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCFCFA] flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-[#111827] mb-2">Something went wrong</h2>
            <p className="text-sm text-[#6B7280] mb-4">Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#111827] text-white px-4 py-2 rounded-lg text-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  )
}