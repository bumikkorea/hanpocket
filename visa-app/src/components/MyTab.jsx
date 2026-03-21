/**
 * 我的 탭 — 프로필 + 통계 + 메뉴
 */
import { Calendar, Heart, Car, Globe, Bell, HelpCircle, ChevronRight } from 'lucide-react'

function L(lang, d) { return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

const MENU_ITEMS = [
  {
    id: 'reservations',
    icon: Calendar,
    bg: '#FFF0E8',
    color: '#C4725A',
    label: { zh: '我的预约', ko: '내 예약', en: 'My Bookings' },
    action: 'booking',
  },
  {
    id: 'favorites',
    icon: Heart,
    bg: '#FFF8E1',
    color: '#FF9500',
    label: { zh: '我的收藏', ko: '찜 목록', en: 'Favorites' },
    action: 'sub:bookmarks',
  },
  {
    id: 'taxi',
    icon: Car,
    bg: '#E3F2FD',
    color: '#2196F3',
    label: { zh: '出租车记录', ko: '택시 기록', en: 'Taxi History' },
    action: 'sub:taxi-history',
  },
  {
    id: 'language',
    icon: Globe,
    bg: '#F3E5F5',
    color: '#9C27B0',
    label: { zh: '语言设置', ko: '언어 설정', en: 'Language' },
    action: 'sub:language',
  },
  {
    id: 'notifications',
    icon: Bell,
    bg: '#E8F5E9',
    color: '#4CAF50',
    label: { zh: '通知设置', ko: '알림 설정', en: 'Notifications' },
    action: 'sub:notifications',
  },
  {
    id: 'help',
    icon: HelpCircle,
    bg: '#F7F7F7',
    color: '#999999',
    label: { zh: '帮助与反馈', ko: '도움말', en: 'Help & Feedback' },
    action: 'sub:help',
  },
]

export default function MyTab({ lang, setTab, setSubPage }) {
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
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>旅行者</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>欢迎来到首尔</div>
        </div>
      </div>

      {/* ─── 통계 바 ─── */}
      <div style={{ display: 'flex', padding: '0 20px', marginBottom: 24 }}>
        {[
          { num: bookingCount,  label: { zh: '预约', ko: '예약', en: 'Booking' } },
          { num: favoriteCount, label: { zh: '收藏', ko: '찜',  en: 'Saved'   } },
          { num: 0,             label: { zh: '足迹', ko: '발자국',en: 'Visits' } },
        ].map((stat, i, arr) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '14px 0',
            background: 'var(--surface)',
            borderRadius: i === 0 ? 'var(--radius-card) 0 0 var(--radius-card)' : i === arr.length - 1 ? '0 var(--radius-card) var(--radius-card) 0' : 0,
            borderLeft: i > 0 ? '0.5px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{stat.num}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{L(lang, stat.label)}</div>
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
                {L(lang, item.label)}
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
        <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 4 }}>到韩国，只需NEAR</p>
      </div>
    </div>
  )
}
