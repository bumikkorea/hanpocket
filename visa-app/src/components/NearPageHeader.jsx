/**
 * NearPageHeader — 서브페이지 공통 헤더 (App.jsx 탑바와 동일한 스타일)
 * 좌: ← 뒤로가기 | 중앙: NEAR 로고 | 우: 글로브 + 유저
 */
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Globe, User } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'

export default function NearPageHeader({ onBack, setTab }) {
  const { lang, setLanguage } = useLanguage()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!showLangMenu) return
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setShowLangMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showLangMenu])

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #F0F0F0',
      padding: '8px 16px 4px',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      {/* 좌: 뒤로가기 */}
      <div style={{ display: 'flex', alignItems: 'center', width: 64 }}>
        <button
          onClick={onBack}
          style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', marginLeft: -8 }}
        >
          <ChevronLeft size={24} color="#5F6368" />
        </button>
      </div>

      {/* 중앙: NEAR 로고 */}
      <button
        onClick={onBack}
        style={{ flex: 1, display: 'flex', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: '#C4725A', letterSpacing: '0.01em' }}>
          NEAR
        </span>
      </button>

      {/* 우: 글로브 + 유저 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: 80, gap: 2 }}>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowLangMenu(v => !v)}
            style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#5F6368', minWidth: 36, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Globe size={20} />
          </button>
          {showLangMenu && (
            <div style={{
              position: 'absolute', right: 0, top: 40,
              background: 'white', borderRadius: 10,
              border: '1px solid #E5E7EB',
              padding: '4px 0', zIndex: 9999,
              minWidth: 130,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}>
              {[
                { code: 'zh', label: '简体中文', flag: '🇨🇳' },
                { code: 'ko', label: '한국어',   flag: '🇰🇷' },
                { code: 'en', label: 'English',  flag: '🇺🇸' },
              ].map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.code); setShowLangMenu(false) }}
                  style={{
                    width: '100%', padding: '8px 12px', textAlign: 'left',
                    background: lang === l.code ? '#F3F4F6' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                    fontWeight: lang === l.code ? 700 : 400,
                    color: lang === l.code ? '#1A1A1A' : '#555',
                  }}
                >
                  <span>{l.flag}</span>
                  <span style={{ flex: 1 }}>{l.label}</span>
                  {lang === l.code && <span style={{ color: '#C4725A' }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setTab && setTab('profile')}
          style={{ padding: 4, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <User size={20} color="#5F6368" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
