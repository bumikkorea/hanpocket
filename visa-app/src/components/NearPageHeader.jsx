/**
 * NearPageHeader — 서브페이지 공통 헤더 (NEAR Neumorphism)
 * 좌: ← 뒤로가기 | 중앙: NEAR 로고 | 우: 글로브 + 유저
 */
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Globe } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'

const NEU = {
  bg: '#FAFAFA',
  shadowOut: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF',
  shadowOutSm: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
  shadowIn: 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)',
  terra: '#C4725A',
  textPrimary: '#1A1A1A',
  textSecondary: '#888888',
}

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
      backgroundColor: NEU.bg,
      boxShadow: '0 4px 12px rgba(200,200,200,0.35), 0 -2px 6px rgba(255,255,255,0.9)',
      padding: '10px 16px 8px',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      fontFamily: '-apple-system, "Pretendard", sans-serif',
    }}>
      {/* 좌: 뒤로가기 */}
      <div style={{ display: 'flex', alignItems: 'center', width: 64 }}>
        <button
          onClick={onBack}
          style={{
            minWidth: 44, minHeight: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: NEU.bg,
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: NEU.shadowOutSm,
            transition: 'box-shadow 0.15s ease',
            marginLeft: -4,
          }}
          onMouseDown={e => e.currentTarget.style.boxShadow = NEU.shadowIn}
          onMouseUp={e => e.currentTarget.style.boxShadow = NEU.shadowOutSm}
          onTouchStart={e => e.currentTarget.style.boxShadow = NEU.shadowIn}
          onTouchEnd={e => e.currentTarget.style.boxShadow = NEU.shadowOutSm}
        >
          <ChevronLeft size={22} color={NEU.textSecondary} />
        </button>
      </div>

      {/* 중앙: NEAR 로고 */}
      <button
        onClick={onBack}
        style={{ flex: 1, display: 'flex', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: NEU.terra, letterSpacing: '0.01em' }}>
          NEAR
        </span>
      </button>

      {/* 우: 글로브 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: 80, gap: 2 }}>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowLangMenu(v => !v)}
            style={{
              width: 40, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: NEU.bg,
              border: 'none',
              borderRadius: 16,
              cursor: 'pointer',
              boxShadow: showLangMenu ? NEU.shadowIn : NEU.shadowOutSm,
              color: NEU.textSecondary,
              transition: 'box-shadow 0.15s ease',
            }}
          >
            <Globe size={18} />
          </button>
          {showLangMenu && (
            <div style={{
              position: 'absolute', right: 0, top: 48,
              background: NEU.bg,
              borderRadius: 16,
              padding: '6px 0',
              zIndex: 9999,
              minWidth: 140,
              boxShadow: '8px 8px 18px rgba(200,200,200,0.5), -8px -8px 18px #FFFFFF',
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
                    width: '100%', padding: '10px 14px', textAlign: 'left',
                    background: lang === l.code
                      ? 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)'
                      : 'transparent',
                    backgroundColor: lang === l.code ? 'rgba(196,114,90,0.06)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                    fontWeight: lang === l.code ? 700 : 400,
                    color: lang === l.code ? NEU.terra : '#555',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{l.flag}</span>
                  <span style={{ flex: 1 }}>{l.label}</span>
                  {lang === l.code && <span style={{ color: NEU.terra, fontSize: 14 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
