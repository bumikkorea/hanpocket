// NEAR 예약 탭 — 메인 엔트리 (NEAR DS v2 적용)
import { useState } from 'react'
import NEARBooking from './BookingFlow'
import AdminDashboard from './AdminDashboard'

export default function ReservationTab({ lang = 'zh', adminView = false, profile }) {
  const [view, setView] = useState('list') // list | booking | admin

  if (adminView) {
    return <AdminDashboard />
  }

  // 고객용: 예약 플로우 (NEAR DS v2)
  return <NEARBooking />
}

// ─── 예약 상세 (고객용) — 리뷰/변경 버튼 추가 ───
function ReservationDetail({ lang, reservationId, reservation: hook, onBack, onWriteReview, onViewReviews, onModify, onChat }) {
  const { getReservation, cancelReservation, calculateRefund } = hook
  const res = getReservation(reservationId)

  if (!res) return null

  const statusCfg = STATUS_CONFIG[res.status]
  const shop = MOCK_SHOPS.find(s => s.id === res.shopId)
  const stylist = MOCK_STYLISTS.find(s => s.id === res.stylistId)
  const payment = PAYMENT_METHODS.find(p => p.id === res.paymentMethod)
  const canCancel = ['pending', 'confirmed'].includes(res.status)
  const canReview = res.status === 'completed'
  const refundAmount = canCancel ? calculateRefund(res) : 0

  // 변경 가능 여부 체크
  const canModify = (() => {
    if (!['pending', 'confirmed'].includes(res.status)) return false
    if (!shop?.allowModification) return false
    const deadline = shop.modificationDeadlineHours || 24
    const resTime = new Date(`${res.date}T${res.time}:00`)
    const hoursUntil = (resTime - Date.now()) / (1000 * 60 * 60)
    return hoursUntil >= deadline
  })()

  return (
    <div className="px-5 pb-20">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-4" style={{ color: '#666' }}>
        ← {T.back[lang]}
      </button>

      {/* 상태 + 번호 */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
          {statusCfg.label[lang]}
        </span>
        <span className="text-xs" style={{ color: '#999' }}>{res.reservationNo}</span>
      </div>

      {/* 매장 */}
      {shop && (
        <div className="bg-white rounded-2xl p-4 mb-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[15px] font-semibold" style={{ color: '#111' }}>{shop.name[lang]}</p>
              <p className="text-xs mt-1" style={{ color: '#999' }}>{shop.address[lang]}</p>
            </div>
            <button
              onClick={() => onViewReviews(shop.id)}
              className="text-[11px] px-2 py-1 rounded-lg"
              style={{ backgroundColor: '#F3F4F6', color: '#666' }}
            >
              {T.reviews[lang]} →
            </button>
          </div>
        </div>
      )}

      {/* 서비스 */}
      <div className="bg-white rounded-2xl p-4 mb-3">
        <p className="text-xs font-medium mb-2" style={{ color: '#999' }}>{T.service[lang]}</p>
        {res.services.map((svc, i) => (
          <div key={i} className="flex justify-between items-center py-1.5">
            <span className="text-[14px]" style={{ color: '#111' }}>{svc.name[lang] || svc.name.zh}</span>
            <span className="text-[13px]" style={{ color: '#666' }}>¥{svc.priceCny} / ₩{svc.priceKrw.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* 일시 */}
      <div className="bg-white rounded-2xl p-4 mb-3">
        <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>{T.dateTime[lang]}</p>
        <p className="text-[15px] font-medium" style={{ color: '#111' }}>
          {res.date} {res.time}
        </p>
        {res.modifiedFrom && (
          <p className="text-[11px] mt-1" style={{ color: '#F59E0B' }}>
            {lang === 'zh' ? '变更前：' : lang === 'ko' ? '변경 전: ' : 'Changed from: '}
            {res.modifiedFrom.date} {res.modifiedFrom.time}
          </p>
        )}
        {stylist && (
          <>
            <p className="text-xs font-medium mt-3 mb-1" style={{ color: '#999' }}>{T.stylist[lang]}</p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stylist.color }} />
              <span className="text-[14px]" style={{ color: '#111' }}>
                {stylist.name}
                {stylist.role && <span className="text-[11px] ml-1" style={{ color: '#999' }}>{stylist.role[lang]}</span>}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 결제 정보 */}
      <div className="bg-white rounded-2xl p-4 mb-3">
        <div className="flex justify-between mb-2">
          <span className="text-xs" style={{ color: '#999' }}>{T.totalPrice[lang]}</span>
          <span className="text-[15px] font-semibold" style={{ color: '#111' }}>¥{res.totalPriceCny} / ₩{res.totalPriceKrw.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-xs" style={{ color: '#999' }}>{T.deposit[lang]}</span>
          <span className="text-[14px] font-medium" style={{ color: '#22C55E' }}>¥{res.depositCny} ✓ {payment?.label[lang]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs" style={{ color: '#999' }}>{T.remainingBalance[lang]}</span>
          <span className="text-[14px]" style={{ color: '#111' }}>¥{res.totalPriceCny - res.depositCny}</span>
        </div>
      </div>

      {/* 고객 메모 */}
      {res.customerNote && (
        <div className="bg-white rounded-2xl p-4 mb-3">
          <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>{T.customerMemo[lang]}</p>
          <p className="text-[14px]" style={{ color: '#111' }}>{res.customerNote}</p>
        </div>
      )}

      {/* 매장에 문의 (채팅) */}
      {['pending', 'confirmed'].includes(res.status) && onChat && (
        <button
          onClick={() => onChat(res.shopId)}
          className="w-full py-3 rounded-2xl text-[14px] font-medium mb-3 transition-all active:scale-[0.98]"
          style={{ backgroundColor: '#F3F4F6', color: '#666' }}
        >
          {T.chatWithShop[lang]}
        </button>
      )}

      {/* 리뷰 쓰기 (완료 상태만) */}
      {canReview && (
        <button
          onClick={() => onWriteReview(res)}
          className="w-full py-3 rounded-2xl text-[14px] font-semibold mb-3 transition-all active:scale-[0.98]"
          style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
        >
          {T.writeReview[lang]}
        </button>
      )}

      {/* 예약 변경 */}
      {canModify && (
        <button
          onClick={() => onModify(res)}
          className="w-full py-3 rounded-2xl text-[14px] font-medium mb-3 transition-all active:scale-[0.98]"
          style={{ color: '#1D4ED8', border: '1px solid #BFDBFE' }}
        >
          {T.modifyReservation[lang]}
        </button>
      )}

      {/* 취소 버튼 */}
      {canCancel && (
        <div className="mt-2">
          <p className="text-xs text-center mb-2" style={{ color: '#999' }}>
            {T.refundAmount[lang]}: ¥{refundAmount}
          </p>
          <button
            onClick={() => {
              if (confirm(T.cancelConfirm[lang])) {
                cancelReservation(res.id)
                onBack()
              }
            }}
            className="w-full py-3 rounded-2xl text-[14px] font-medium border transition-all active:scale-[0.98]"
            style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
          >
            {T.cancelReservation[lang]}
          </button>
        </div>
      )}
    </div>
  )
}
