/**
 * 我的 탭 — 화해 스타일 리디자인
 * 프로필 + 여행 목적 태그 + 퀵 액션 3개 + 활동 내역 카드 + 메뉴 리스트
 */
import { useState, useEffect } from 'react'
import { Calendar, Heart, Car, Bell, HelpCircle, ChevronRight, X, Check, Gift, MapPin, MessageSquare, Footprints, Camera, Music, ShoppingBag, Briefcase, UtensilsCrossed, Pencil } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'

function L(lang, d) { return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

const MENU_ITEMS = [
  { id: 'reservations', icon: Calendar,    bg: '#FFF0E8', color: '#C4725A', labelKey: 'my.orders',       action: 'booking-my'        },
  { id: 'favorites',    icon: Heart,       bg: '#FFF8E1', color: '#FF9500', labelKey: 'my.wishlist',     action: 'sub:bookmarks'     },
  { id: 'taxi',         icon: Car,         bg: '#E3F2FD', color: '#2196F3', labelKey: 'my.taxiHistory',  action: 'sub:taxi-history'  },
  { id: 'notifications',icon: Bell,        bg: '#E8F5E9', color: '#4CAF50', labelKey: 'my.notifications',action: 'sub:notifications' },
  { id: 'help',         icon: HelpCircle,  bg: '#F7F7F7', color: '#999999', labelKey: 'my.help',         action: 'sub:help'          },
]

const LANG_OPTIONS = [
  { code: 'zh', native: '中文（简体）' },
  { code: 'ko', native: '한국어' },
  { code: 'en', native: 'English' },
]

const PURPOSE_OPTIONS = [
  { id: 'sightseeing', Icon: Camera,          zh: '观光',     ko: '관광',     en: 'Sightseeing' },
  { id: 'food',        Icon: UtensilsCrossed, zh: '美食',     ko: '미식',     en: 'Food'        },
  { id: 'kpop',        Icon: Music,           zh: 'K-POP',    ko: 'K-POP',    en: 'K-POP'       },
  { id: 'shopping',    Icon: ShoppingBag,     zh: '购物',     ko: '쇼핑',     en: 'Shopping'    },
  { id: 'medical',     Icon: Heart,           zh: '医疗美容', ko: '의료뷰티', en: 'Medical'     },
  { id: 'business',    Icon: Briefcase,       zh: '出差',     ko: '비즈니스', en: 'Business'    },
]

const ACTIVITY_STATS = [
  { icon: MapPin,        storageKey: 'near_checkins',   labelKey: 'my.checkins' },
  { icon: MessageSquare, storageKey: 'near_reviews',    labelKey: 'my.reviews'  },
  { icon: Car,           storageKey: 'near_taxi_count', labelKey: 'my.taxiUse'  },
  { icon: Heart,         storageKey: 'near_bookmarks',  labelKey: 'my.saved'    },
  { icon: Footprints,    storageKey: 'near_visited',    labelKey: 'my.visited'  },
]

function getStorageCount(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.length : (Number(parsed) || 0)
  } catch { return 0 }
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

  // 첫 진입 시 여행 목적 선택
  useEffect(() => {
    if (purposes === null) {
      setSelectedPurposes([])
      setPurposeModalOpen(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const bookingCount  = getStorageCount('near_bookings_v2')
  const favoriteCount = getStorageCount('near_bookmarks')

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
    <div style={{ paddingBottom: 0, fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>

      {/* ─── 프로필 헤더 ─── */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, #C4725A, #E8956F)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 22, fontWeight: 700, flexShrink: 0,
        }}>旅</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 닉네임 (터치 시 수정) */}
          <button
            onClick={() => { setNicknameInput(displayName); setNicknameModalOpen(true) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</span>
            <Pencil size={13} color="var(--text-muted)" />
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
                    fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 100, padding: '3px 10px',
                  }}>{L(lang, p)}</span>
                ))}
              </div>
            </button>
          ) : (
            <button
              onClick={() => { setSelectedPurposes([]); setPurposeModalOpen(true) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-hint)', borderBottom: '1px dashed var(--border)' }}>
                {L(lang, { zh: '+ 设置旅行目的', ko: '+ 여행 목적 설정', en: '+ Set travel purpose' })}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 퀵 액션 3개 ─── */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 20px' }}>
        {[
          { labelKey: 'my.orders',   Icon: Calendar, count: bookingCount,  unit: '', action: () => goToMyBookings()           },
          { labelKey: 'my.points',   Icon: Gift,     count: 0,             unit: 'P', action: () => {}                       },
          { labelKey: 'my.wishlist', Icon: Heart,    count: favoriteCount, unit: '', action: () => setSubPage?.('bookmarks') },
        ].map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 24, padding: '12px 8px', cursor: 'pointer',
            }}
          >
            <item.Icon size={16} color="var(--text-secondary)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
                {item.count}{item.unit}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t(item.labelKey)}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ─── 활동 내역 카드 ─── */}
      <div style={{ margin: '0 20px 20px', background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          {t('my.activity')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {ACTIVITY_STATS.map((stat, i) => {
            const StatIcon = stat.icon
            const count = getStorageCount(stat.storageKey)
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <StatIcon size={22} color="var(--text-secondary)" strokeWidth={1.5} />
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t(stat.labelKey)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── 메뉴 리스트 ─── */}
      <div style={{ padding: '0 20px' }}>
        {MENU_ITEMS.map((item, i) => {
          const MenuIcon = item.icon
          const isLast = i === MENU_ITEMS.length - 1
          const badge = item.id === 'reservations' ? bookingCount : item.id === 'favorites' ? favoriteCount : 0
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0',
                background: 'none', border: 'none',
                borderBottom: isLast ? 'none' : '0.5px solid var(--border)',
                cursor: 'pointer', textAlign: 'left',
              }}
              onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
              onTouchEnd={e   => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MenuIcon size={18} color={item.color} />
              </div>
              <span style={{ flex: 1, fontSize: 15, color: 'var(--text-primary)', fontWeight: 400 }}>{t(item.labelKey)}</span>
              {badge > 0 && (
                <span style={{ padding: '2px 8px', borderRadius: 10, background: 'var(--price)', color: 'white', fontSize: 11, fontWeight: 600 }}>{badge}</span>
              )}
              <ChevronRight size={14} color="var(--text-hint)" />
            </button>
          )
        })}
      </div>

      {/* ─── 버전 ─── */}
      <div style={{ textAlign: 'center', padding: '32px 0 8px' }}>
        <p style={{ fontSize: 11, color: 'var(--text-hint)', margin: 0 }}>NEAR v1.0.0</p>
        <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 4 }}>{t('my.version')}</p>
      </div>

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* ─── 언어 선택 모달 ─── */}
      {langModalOpen && (
        <div onClick={() => setLangModalOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('lang.title')}</h3>
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

      {/* ─── 닉네임 수정 모달 ─── */}
      {nicknameModalOpen && (
        <div onClick={() => setNicknameModalOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {L(lang, { zh: '修改昵称', ko: '닉네임 수정', en: 'Edit Nickname' })}
              </h3>
              <button onClick={() => setNicknameModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            <input
              value={nicknameInput}
              onChange={e => setNicknameInput(e.target.value)}
              maxLength={20}
              autoFocus
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 16, fontFamily: 'inherit' }}
            />
            <button onClick={saveNickname} className="btn btn-primary" style={{ width: '100%' }}>
              {L(lang, { zh: '保存', ko: '저장', en: 'Save' })}
            </button>
          </div>
        </div>
      )}

      {/* ─── 여행 목적 선택 모달 ─── */}
      {purposeModalOpen && (
        <div
          onClick={() => { if (purposes !== null) setPurposeModalOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('my.purposeTitle')}</h3>
              {purposes !== null && (
                <button onClick={() => setPurposeModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X size={20} color="var(--text-muted)" />
                </button>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              {L(lang, { zh: '最多选择3项', ko: '최대 3개 선택', en: 'Select up to 3' })}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
              {PURPOSE_OPTIONS.map(p => {
                const selected = selectedPurposes.includes(p.id)
                const PIcon = p.Icon
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePurpose(p.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: '16px 8px', borderRadius: 14,
                      border: selected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: selected ? 'var(--primary-light, #FFF0EC)' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <PIcon size={24} color={selected ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: 13, fontWeight: selected ? 700 : 400, color: selected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {L(lang, p)}
                    </span>
                  </button>
                )
              })}
            </div>
            <button onClick={savePurposes} className="btn btn-primary" style={{ width: '100%' }}>
              {t('my.done')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
