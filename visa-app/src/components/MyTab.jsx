/**
 * 我的 탭 — NEAR Neumorphism 리디자인
 * 프로필 + 여행 목적 태그 + 퀵 액션 3개 + 활동 내역 카드 + 메뉴 리스트
 */
import { useState, useEffect } from 'react'
import { useLanguage } from '../i18n/index.jsx'

function L(lang, d) { return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

// 뉴모피즘 토큰
const NEU = {
  bg: '#FFFFFF',
  shadowOut: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF',
  shadowOutSm: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
  shadowIn: 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)',
  terra: '#3182F6',
  terraLight: 'rgba(49,130,246,0.08)',
}

const MENU_ITEMS = [
  { id: 'reservations', bg: NEU.terraLight,      color: NEU.terra,    labelKey: 'my.orders',       action: 'booking-my'        },
  { id: 'coupons',      bg: 'rgba(255,149,0,0.08)',  color: '#FF9500',    labelKey: 'my.coupons',      action: 'sub:coupons'       },
  { id: 'notifications',bg: 'rgba(76,175,80,0.08)',  color: '#4CAF50',    labelKey: 'my.notifications',action: 'sub:notifications' },
  { id: 'help',         bg: 'rgba(153,153,153,0.08)',color: '#8B95A1',    labelKey: 'my.help',         action: 'sub:help'          },
]

const LANG_OPTIONS = [
  { code: 'zh', native: '中文（简体）' },
  { code: 'ko', native: '한국어' },
  { code: 'en', native: 'English' },
]

const PURPOSE_OPTIONS = [
  { id: 'sightseeing', zh: '观光',     ko: '관광',     en: 'Sightseeing' },
  { id: 'food',        zh: '美食',     ko: '미식',     en: 'Food'        },
  { id: 'kpop',        zh: 'K-POP',    ko: 'K-POP',    en: 'K-POP'       },
  { id: 'shopping',    zh: '购物',     ko: '쇼핑',     en: 'Shopping'    },
  { id: 'medical',     zh: '医疗美容', ko: '의료뷰티', en: 'Medical'     },
  { id: 'business',    zh: '出差',     ko: '비즈니스', en: 'Business'    },
]

const ACTIVITY_STATS = [
  { storageKey: 'near_checkins',   labelKey: 'my.checkins' },
  { storageKey: 'near_reviews',    labelKey: 'my.reviews'  },
  { storageKey: 'near_my_seoul',   labelKey: 'my.saved'    },
  { storageKey: 'near_visited',    labelKey: 'my.visited'  },
]

function getStorageCount(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    if (key === 'near_my_seoul' && parsed && Array.isArray(parsed.pins)) return parsed.pins.length
    return Array.isArray(parsed) ? parsed.length : (Number(parsed) || 0)
  } catch { return 0 }
}

// 뉴모픽 바텀시트 래퍼
function NeuSheet({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end' }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: NEU.bg,
          borderRadius: '24px 24px 0 0',
          padding: '0 20px 48px',
          width: '100%',
          boxShadow: '-4px -4px 20px rgba(255,255,255,0.9), 0 -6px 20px rgba(200,200,200,0.2)',
          fontFamily: '-apple-system, "Pretendard", "Noto Sans SC", sans-serif',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#8B95A1', margin: '12px auto 20px' }} />
        {children}
      </div>
    </div>
  )
}

export default function MyTab({ setTab, setSubPage }) {
  const { lang, t, setLanguage } = useLanguage()
  const [langModalOpen,     setLangModalOpen]     = useState(false)
  const [purposeModalOpen,  setPurposeModalOpen]  = useState(false)
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false)

  const [purposes, setPurposes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('near_travel_purpose') || 'null') } catch { return null }
  })
  const [nickname, setNickname] = useState(() =>
    localStorage.getItem('near_nickname') || ''
  )
  const [nicknameInput,      setNicknameInput]     = useState('')
  const [selectedPurposes,   setSelectedPurposes]  = useState([])

  // 목적 선택은 온보딩 마지막 스텝에서 처리 (자동 팝업 제거)

  const bookingCount  = getStorageCount('near_bookings_v2')
  const favoriteCount = getStorageCount('near_my_seoul')

  const displayName = nickname || t('my.traveler')

  const displayedPurposes = (purposes || [])
    .map(id => PURPOSE_OPTIONS.find(p => p.id === id))
    .filter(Boolean)

  const savePurposes = () => {
    localStorage.setItem('near_travel_purpose', JSON.stringify(selectedPurposes))
    setPurposes(selectedPurposes)
    setPurposeModalOpen(false)
  }

  const saveNickname = () => {
    const n = nicknameInput.trim()
    if (n) { localStorage.setItem('near_nickname', n); setNickname(n) }
    setNicknameModalOpen(false)
  }

  const togglePurpose = (id) => {
    setSelectedPurposes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const goToMyBookings = () => {
    localStorage.setItem('near_booking_open_screen', 'my-bookings')
    setTab('booking')
  }

  const handleMenuClick = (item) => {
    if (item.action === 'booking') { setTab('booking'); return }
    if (item.action === 'booking-my') { goToMyBookings(); return }
    if (item.action === 'sub:language') { setLangModalOpen(true); return }
    if (item.action.startsWith('sub:') && setSubPage) setSubPage(item.action.slice(4))
  }

  return (
    <div style={{ paddingBottom: 0, fontFamily: '-apple-system, "Pretendard", "Noto Sans SC", sans-serif', background: NEU.bg }}>

      {/* ─── 프로필 헤더 ─── */}
      <div style={{ padding: '28px 20px 20px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {/* 아바타 */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3182F6, #E8956F)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 24, fontWeight: 700, flexShrink: 0,
          boxShadow: '6px 6px 14px rgba(49,130,246,0.3), -4px -4px 10px rgba(255,255,255,0.8)',
        }}>旅</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 닉네임 */}
          <button
            onClick={() => { setNicknameInput(displayName); setNicknameModalOpen(true) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}
          >
            <span style={{ fontSize: 19, fontWeight: 700, color: '#191F28' }}>{displayName}</span>
            <span style={{ fontSize: 11, color: '#8B95A1' }}>수정</span>
          </button>

          {/* 여행 목적 태그 */}
          {displayedPurposes.length > 0 ? (
            <button
              onClick={() => { setSelectedPurposes(purposes); setPurposeModalOpen(true) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {displayedPurposes.map(p => (
                  <span key={p.id} style={{
                    fontSize: 12, fontWeight: 600, color: NEU.terra,
                    background: NEU.bg,
                    borderRadius: 24, padding: '4px 12px',
                    boxShadow: NEU.shadowOutSm,
                    transition: 'box-shadow 0.15s ease',
                  }}>{L(lang, p)}</span>
                ))}
              </div>
            </button>
          ) : (
            <button
              onClick={() => { setSelectedPurposes([]); setPurposeModalOpen(true) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <span style={{ fontSize: 12, color: '#8B95A1' }}>
                {L(lang, { zh: '+ 设置旅行目的', ko: '+ 여행 목적 설정', en: '+ Set travel purpose' })}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 퀵 액션 3개 ─── */}
      <div style={{ display: 'flex', gap: 10, padding: '0 20px 24px' }}>
        {[
          { labelKey: 'my.orders',   count: bookingCount,  unit: '', action: () => goToMyBookings()           },
          { labelKey: 'my.points',   count: 0,             unit: 'P', action: () => {}                       },
          { labelKey: 'my.coupons', count: 0, unit: '', action: () => setSubPage?.('coupons')  },
        ].map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: NEU.bg,
              border: 'none',
              borderRadius: 20, padding: '14px 8px', cursor: 'pointer',
              boxShadow: NEU.shadowOut,
              transition: 'box-shadow 0.15s ease',
            }}
            onTouchStart={e => e.currentTarget.style.boxShadow = NEU.shadowIn}
            onTouchEnd={e => e.currentTarget.style.boxShadow = NEU.shadowOut}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#191F28', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
                {item.count}{item.unit}
              </div>
              <div style={{ fontSize: 11, color: '#8B95A1', marginTop: 2 }}>{t(item.labelKey)}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ─── 활동 내역 카드 ─── */}
      <div style={{
        margin: '0 20px 24px',
        background: NEU.bg, border: 'none', borderRadius: 16, padding: '14px 16px',
        boxShadow: NEU.shadowOut,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>
          {t('my.activity')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {ACTIVITY_STATS.map((stat, i) => {
            const count = getStorageCount(stat.storageKey)
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#191F28', fontFamily: 'Inter, sans-serif' }}>{count}</div>
                <div style={{ fontSize: 11, color: '#8B95A1' }}>{t(stat.labelKey)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── 메뉴 리스트 ─── */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MENU_ITEMS.map((item) => {
          const badge = item.id === 'reservations' ? bookingCount : item.id === 'favorites' ? favoriteCount : 0
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                background: NEU.bg, border: 'none', borderRadius: 20,
                cursor: 'pointer', textAlign: 'left',
                boxShadow: NEU.shadowOut,
                transition: 'box-shadow 0.15s ease',
              }}
              onTouchStart={e => e.currentTarget.style.boxShadow = NEU.shadowIn}
              onTouchEnd={e => e.currentTarget.style.boxShadow = NEU.shadowOut}
            >
              <span style={{ flex: 1, fontSize: 15, color: '#191F28', fontWeight: 500 }}>{t(item.labelKey)}</span>
              {badge > 0 && (
                <span style={{
                  padding: '3px 9px', borderRadius: 12,
                  background: NEU.terra, color: 'white',
                  fontSize: 11, fontWeight: 700,
                }}>{badge}</span>
              )}
              <span style={{ fontSize: 14, color: '#8B95A1' }}>›</span>
            </button>
          )
        })}
      </div>

      {/* ─── 버전 ─── */}
      <div style={{ textAlign: 'center', padding: '32px 0 8px' }}>
        <p style={{ fontSize: 11, color: '#8B95A1', margin: 0 }}>NEAR v1.0.0</p>
        <p style={{ fontSize: 11, color: '#8B95A1', marginTop: 4 }}>{t('my.version')}</p>
      </div>

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* ─── 언어 선택 모달 ─── */}
      {langModalOpen && (
        <NeuSheet onClose={() => setLangModalOpen(false)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#191F28', margin: 0 }}>{t('lang.title')}</h3>
            <button onClick={() => setLangModalOpen(false)} style={{ background: NEU.bg, border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', boxShadow: NEU.shadowOutSm, display: 'flex', fontSize: 18, color: '#8B95A1' }}>
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LANG_OPTIONS.map(opt => (
              <button
                key={opt.code}
                onClick={() => { setLanguage(opt.code); setLangModalOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 18px', borderRadius: 16,
                  background: NEU.bg,
                  border: 'none',
                  boxShadow: lang === opt.code ? NEU.shadowIn : NEU.shadowOut,
                  cursor: 'pointer', width: '100%',
                  transition: 'box-shadow 0.15s ease',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: lang === opt.code ? NEU.terra : '#191F28' }}>{opt.native}</span>
                {lang === opt.code && <span style={{ fontSize: 18, color: NEU.terra }}>✓</span>}
              </button>
            ))}
          </div>
        </NeuSheet>
      )}

      {/* ─── 닉네임 수정 모달 ─── */}
      {nicknameModalOpen && (
        <NeuSheet onClose={() => setNicknameModalOpen(false)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#191F28', margin: 0 }}>
              {L(lang, { zh: '修改昵称', ko: '닉네임 수정', en: 'Edit Nickname' })}
            </h3>
            <button onClick={() => setNicknameModalOpen(false)} style={{ background: NEU.bg, border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', boxShadow: NEU.shadowOutSm, display: 'flex', fontSize: 18, color: '#8B95A1' }}>
              ✕
            </button>
          </div>
          <input
            value={nicknameInput}
            onChange={e => setNicknameInput(e.target.value)}
            maxLength={20}
            autoFocus
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 16,
              border: 'none',
              boxShadow: NEU.shadowIn,
              background: NEU.bg,
              fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 16,
              fontFamily: 'inherit', color: '#191F28',
            }}
          />
          <button
            onClick={saveNickname}
            style={{
              width: '100%', height: 50, borderRadius: 16,
              background: NEU.terra, color: 'white',
              fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
              boxShadow: `6px 6px 14px rgba(49,130,246,0.3), -4px -4px 10px rgba(255,255,255,0.8)`,
            }}
          >
            {L(lang, { zh: '保存', ko: '저장', en: 'Save' })}
          </button>
        </NeuSheet>
      )}

      {/* ─── 여행 목적 선택 모달 ─── */}
      {purposeModalOpen && (
        <NeuSheet onClose={() => { if (purposes !== null) setPurposeModalOpen(false) }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#191F28', margin: 0 }}>{t('my.purposeTitle')}</h3>
            {purposes !== null && (
              <button onClick={() => setPurposeModalOpen(false)} style={{ background: NEU.bg, border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', boxShadow: NEU.shadowOutSm, display: 'flex', fontSize: 18, color: '#8B95A1' }}>
                ✕
              </button>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 20 }}>
            {L(lang, { zh: '最多选择3项', ko: '최대 3개 선택', en: 'Select up to 3' })}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
            {PURPOSE_OPTIONS.map(p => {
              const selected = selectedPurposes.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => togglePurpose(p.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '16px 8px', borderRadius: 16,
                    border: 'none',
                    background: NEU.bg,
                    boxShadow: selected ? NEU.shadowIn : NEU.shadowOut,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: selected ? 700 : 400, color: selected ? NEU.terra : '#191F28' }}>
                    {L(lang, p)}
                  </span>
                </button>
              )
            })}
          </div>
          <button
            onClick={savePurposes}
            style={{
              width: '100%', height: 50, borderRadius: 16,
              background: NEU.terra, color: 'white',
              fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
              boxShadow: `6px 6px 14px rgba(49,130,246,0.3), -4px -4px 10px rgba(255,255,255,0.8)`,
            }}
          >
            {t('my.done')}
          </button>
        </NeuSheet>
      )}
    </div>
  )
}
