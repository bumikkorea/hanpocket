/**
 * 我的 탭 — 프로필 + 통계 + 메뉴
 */
import { useState } from 'react'
import { Calendar, Heart, Car, Globe, Bell, HelpCircle, ChevronRight, X, Check } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'

function L(lang, d) { return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

const MENU_ITEMS = [
  { id: 'reservations', icon: Calendar,    bg: '#FFF0E8', color: '#C4725A', labelKey: 'my.bookings',      action: 'booking'          },
  { id: 'favorites',    icon: Heart,       bg: '#FFF8E1', color: '#FF9500', labelKey: 'my.favorites',     action: 'sub:bookmarks'    },
  { id: 'taxi',         icon: Car,         bg: '#E3F2FD', color: '#2196F3', labelKey: 'my.taxiHistory',   action: 'sub:taxi-history' },
  { id: 'language',     icon: Globe,       bg: '#F3E5F5', color: '#9C27B0', labelKey: 'my.language',      action: 'sub:language'     },
  { id: 'notifications',icon: Bell,        bg: '#E8F5E9', color: '#4CAF50', labelKey: 'my.notifications', action: 'sub:notifications'},
  { id: 'help',         icon: HelpCircle,  bg: '#F7F7F7', color: '#999999', labelKey: 'my.help',          action: 'sub:help'         },
]

const LANG_OPTIONS = [
  { code: 'zh', native: '中文（简体）' },
  { code: 'ko', native: '한국어' },
  { code: 'en', native: 'English' },
]

export default function MyTab({ setTab, setSubPage }) {
  const { lang, t, setLanguage } = useLanguage()
  const [langModalOpen, setLangModalOpen] = useState(false)

  // 예약 수 로드 (localStorage)
  const bookingCount = (() => {
    try { return JSON.parse(localStorage.getItem('near_bookings_v2') || '[]').length } catch { return 0 }
  })()
  // 북마크 수 (localStorage)
  const favoriteCount = (() => {
    try { return JSON.parse(localStorage.getItem('near_bookmarks') || '[]').length } catch { return 0 }
  })()

  const handleMenuClick = (item) => {
    if (item.action === 'booking') { setTab('booking'); return }
    if (item.action === 'sub:language') { setLangModalOpen(true); return }
    if (item.action.startsWith('sub:') && setSubPage) {
      setSubPage(item.action.slice(4))
    }
  }

  return (
    <div style={{ paddingBottom: 0, fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>

      {/* ─── 프로필 헤더 ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 20px 24px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #C4725A, #E8956F)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 20, fontWeight: 700, flexShrink: 0,
        }}>
          旅
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{t('my.traveler')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{t('my.welcome')}</div>
        </div>
      </div>

      {/* ─── 통계 바 ─── */}
      <div style={{ display: 'flex', padding: '0 20px', marginBottom: 24 }}>
        {[
          { num: bookingCount,  labelKey: 'my.stat.booking' },
          { num: favoriteCount, labelKey: 'my.stat.saved'   },
          { num: 0,             labelKey: 'my.stat.visits'  },
        ].map((stat, i, arr) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '14px 0',
            background: 'var(--surface)',
            borderRadius: i === 0 ? 'var(--radius-card) 0 0 var(--radius-card)' : i === arr.length - 1 ? '0 var(--radius-card) var(--radius-card) 0' : 0,
            borderLeft: i > 0 ? '0.5px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{stat.num}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t(stat.labelKey)}</div>
          </div>
        ))}
      </div>

      {/* ─── 메뉴 리스트 ─── */}
      <div style={{ padding: '0 20px' }}>
        {MENU_ITEMS.map((item, i) => {
          const Icon = item.icon
          const isLast = i === MENU_ITEMS.length - 1
          const badgeCount = item.id === 'reservations' ? bookingCount : item.id === 'favorites' ? favoriteCount : 0
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 0',
                borderBottom: isLast ? 'none' : '0.5px solid var(--border)',
                background: 'none', border: 'none',
                borderBottomWidth: isLast ? 0 : 0.5,
                borderBottomStyle: 'solid',
                borderBottomColor: 'var(--border)',
                cursor: 'pointer', textAlign: 'left',
              }}
              onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
              onMouseUp={e => e.currentTarget.style.opacity = '1'}
              onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
              onTouchEnd={e => e.currentTarget.style.opacity = '1'}
            >
              {/* 아이콘 */}
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: item.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} color={item.color} />
              </div>
              {/* 라벨 */}
              <span style={{ flex: 1, fontSize: 15, color: 'var(--text-primary)', fontWeight: 400 }}>
                {t(item.labelKey)}
              </span>
              {/* 뱃지 */}
              {badgeCount > 0 && (
                <span style={{
                  padding: '2px 8px', borderRadius: 10,
                  background: 'var(--price)', color: 'white',
                  fontSize: 11, fontWeight: 600,
                }}>
                  {badgeCount}
                </span>
              )}
              {/* 화살표 */}
              <ChevronRight size={14} color="var(--text-hint)" />
            </button>
          )
        })}
      </div>

      {/* NEAR 버전 */}
      <div style={{ textAlign: 'center', padding: '32px 0 8px' }}>
        <p style={{ fontSize: 11, color: 'var(--text-hint)', margin: 0 }}>NEAR v1.0.0</p>
        <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 4 }}>{t('my.version')}</p>
      </div>

      {/* ─── 언어 선택 모달 (바텀시트) ─── */}
      {langModalOpen && (
        <div
          onClick={() => setLangModalOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {t('lang.title')}
              </h3>
              <button onClick={() => setLangModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LANG_OPTIONS.map(opt => (
                <button
                  key={opt.code}
                  onClick={() => { setLanguage(opt.code); setLangModalOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: 'var(--radius-card)',
                    background: lang === opt.code ? 'var(--primary-light, #FFF0EC)' : 'var(--surface)',
                    border: lang === opt.code ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                    cursor: 'pointer', width: '100%',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{opt.native}</span>
                  {lang === opt.code && <Check size={18} color="var(--primary)" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
