/**
 * NearPageHeader — 서브페이지 공통 헤더
 * 메인 App TopBar와 동일한 스타일로 통일
 */
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Globe } from 'lucide-react'
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
      position: 'relative',
      fontFamily: '-apple-system, "Pretendard", sans-serif',
    }}>
      {/* 좌: 뒤로가기 */}
      <div style={{ display: 'flex', alignItems: 'center', width: 44 }}>
        <button
          onClick={onBack}
          style={{
            minWidth: 44, minHeight: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#5F6368', marginLeft: -8,
          }}
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* 중앙: NEAR 로고 — 절대 중앙 고정 */}
      <div
        style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          padding: '4px 8px',
        }}
      >
        <span style={{
          fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22,
          color: '#C4725A', letterSpacing: '0.01em',
          textShadow: '2px 2px 5px rgba(200,200,200,0.6), -1px -1px 3px rgba(255,255,255,0.9)',
        }}>
          NEAR
        </span>
      </div>

      {/* 우: 언어 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowLangMenu(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5F6368', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Globe size={20} />
          </button>
          {showLangMenu && (
            <div style={{
              position: 'absolute', right: 0, top: 36,
              background: '#FFFFFF',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              padding: '4px 0',
              zIndex: 9999,
              minWidth: 120,
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
                    fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontWeight: lang === l.code ? 700 : 400,
                    color: lang === l.code ? '#1A1A1A' : '#555555',
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
      </div>
    </div>
  )
}
