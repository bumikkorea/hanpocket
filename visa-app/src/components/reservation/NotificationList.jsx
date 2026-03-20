// NEAR 알림 목록 — 예약 리마인더, 리뷰 요청, 쿠폰 만료
import { useState, useMemo } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { MOCK_NOTIFICATIONS } from '../../data/reservationData'
import { Bell, Calendar, Star, Tag, Check } from 'lucide-react'

const STORAGE_KEY = 'near_notifications'

const NOTIF_ICONS = {
  new_reservation: Calendar,
  reservation_confirmed: Check,
  reservation_reminder: Bell,
  review_request: Star,
  coupon_expiry: Tag,
}

const NOTIF_COLORS = {
  new_reservation: '#3B82F6',
  reservation_confirmed: '#22C55E',
  reservation_reminder: '#F59E0B',
  review_request: '#8B5CF6',
  coupon_expiry: '#EF4444',
}

function loadNotifications() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return stored || MOCK_NOTIFICATIONS
  } catch {
    return MOCK_NOTIFICATIONS
  }
}

function saveNotifications(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function NotificationList({ lang, recipientType = 'customer', recipientId = 'cust-001', onBack }) {
  const [notifications, setNotifications] = useState(() => loadNotifications())

  const filtered = useMemo(() => {
    return notifications
      .filter(n => n.recipientType === recipientType)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [notifications, recipientType])

  const unreadCount = filtered.filter(n => !n.isRead).length

  const handleMarkAllRead = () => {
    const updated = notifications.map(n =>
      n.recipientType === recipientType ? { ...n, isRead: true } : n
    )
    setNotifications(updated)
    saveNotifications(updated)
  }

  const handleMarkRead = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    )
    setNotifications(updated)
    saveNotifications(updated)
  }

  return (
    <div className="px-5 pb-20">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-4" style={{ color: '#666' }}>
        ← {T.back[lang]}
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-bold" style={{ color: '#111' }}>
          {T.notifications[lang]}
          {unreadCount > 0 && (
            <span className="text-[12px] font-normal ml-2 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[12px]"
            style={{ color: '#999' }}
          >
            {T.markAllRead[lang]}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={32} color="#D1D5DB" className="mx-auto mb-3" />
          <p className="text-[13px]" style={{ color: '#999' }}>{T.noNotifications[lang]}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const Icon = NOTIF_ICONS[notif.type] || Bell
            const color = NOTIF_COLORS[notif.type] || '#666'
            const timeAgo = getTimeAgo(notif.createdAt, lang)

            return (
              <button
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className="w-full text-left bg-white rounded-xl p-4 transition-all active:scale-[0.99]"
                style={{
                  opacity: notif.isRead ? 0.7 : 1,
                  border: notif.isRead ? '1px solid transparent' : `1px solid ${color}20`,
                }}
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}15` }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[13px] font-medium" style={{ color: '#111' }}>
                        {notif.title[lang]}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      )}
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: '#666' }}>
                      {notif.body[lang]}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: '#999' }}>{timeAgo}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function getTimeAgo(dateStr, lang) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return lang === 'zh' ? `${days}天前` : lang === 'ko' ? `${days}일 전` : `${days}d ago`
  if (hours > 0) return lang === 'zh' ? `${hours}小时前` : lang === 'ko' ? `${hours}시간 전` : `${hours}h ago`
  if (mins > 0) return lang === 'zh' ? `${mins}分钟前` : lang === 'ko' ? `${mins}분 전` : `${mins}m ago`
  return lang === 'zh' ? '刚刚' : lang === 'ko' ? '방금' : 'Just now'
}
