// NEAR — 내 예약 목록
import { useState } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { STATUS_CONFIG, MOCK_SHOPS, PAYMENT_METHODS } from '../../data/reservationData'

export default function MyReservations({ lang, reservation: hook, onViewDetail }) {
  const { getUpcoming, getPast } = hook
  const [tab, setTab] = useState('upcoming')

  const upcoming = getUpcoming()
  const past = getPast()
  const list = tab === 'upcoming' ? upcoming : past

  return (
    <div className="px-5">
      {/* 탭 토글 */}
      <div className="flex gap-1 mb-4 card-glass rounded-xl p-1" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        {['upcoming', 'past'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all active:scale-95"
            style={{
              background: tab === t ? 'var(--gradient-dream)' : 'transparent',
              color: tab === t ? 'white' : 'var(--y2k-text-sub)',
              boxShadow: tab === t ? '0 2px 8px rgba(255, 133, 179, 0.2)' : 'none',
            }}
          >
            {t === 'upcoming' ? T.upcoming[lang] : T.past[lang]}
            {t === 'upcoming' && upcoming.length > 0 && (
              <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: tab === t ? '#374151' : '#F3F4F6' }}>
                {upcoming.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <span className="text-3xl mb-3">📋</span>
          <p className="text-[13px]" style={{ color: '#999' }}>{T.noReservations[lang]}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(res => {
            const statusCfg = STATUS_CONFIG[res.status]
            const shop = MOCK_SHOPS.find(s => s.id === res.shopId)
            const payment = PAYMENT_METHODS.find(p => p.id === res.paymentMethod)

            return (
              <button
                key={res.id}
                onClick={() => onViewDetail(res.id)}
                className="w-full text-left card-y2k rounded-2xl p-4 transition-all active:scale-[0.98]"
                style={{ background: 'var(--y2k-surface)', border: '1px solid var(--y2k-border)', boxShadow: '0 4px 20px rgba(255, 133, 179, 0.08)' }}
              >
                {/* 상태 + 날짜 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="badge-y2k text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: statusCfg.bg,
                      color: statusCfg.color,
                      border: `1px solid ${statusCfg.color}40`,
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}>
                    {statusCfg.label[lang]}
                  </span>
                  <span className="text-[11px]" style={{ color: '#999' }}>
                    {res.date} {res.time}
                  </span>
                </div>

                {/* 매장 */}
                {shop && (
                  <p className="text-[14px] font-semibold mb-1" style={{ color: '#111' }}>
                    {shop.name[lang]}
                  </p>
                )}

                {/* 서비스 */}
                <p className="text-[12px] mb-2" style={{ color: '#666' }}>
                  {res.services.map(s => s.name[lang] || s.name.zh).join(' + ')}
                </p>

                {/* 금액 */}
                <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-[12px]" style={{ color: '#999' }}>
                    {T.deposit[lang]}: ¥{res.depositCny} ({payment?.label[lang]})
                  </span>
                  <span className="text-[14px] font-semibold" style={{ color: '#111' }}>
                    ¥{res.totalPriceCny}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
