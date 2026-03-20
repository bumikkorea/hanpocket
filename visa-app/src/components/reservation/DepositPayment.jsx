// NEAR 예약 Step 3 — 보증금 결제 (Antom 실결제 연동)
import { useState } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { MOCK_SHOPS, MOCK_STYLISTS, PAYMENT_METHODS, DEFAULT_REFUND_POLICY } from '../../data/reservationData'
import { createPayment, pollPaymentStatus } from '../../api/paymentApi'

// 실결제 모드 여부 (Antom Client ID가 설정되어 있으면 실결제)
const LIVE_PAYMENT = !!import.meta.env.VITE_PAYMENT_API_URL

export default function DepositPayment({ lang, booking, onPaymentMethodChange, onNoteChange, onPay, onBack }) {
  const [agreed, setAgreed] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  const shop = MOCK_SHOPS.find(s => s.id === booking.shopId)
  const stylist = booking.stylistId ? MOCK_STYLISTS.find(s => s.id === booking.stylistId) : null

  const totalKrw = booking.services.reduce((sum, s) => sum + s.priceKrw, 0)
  const totalCny = booking.services.reduce((sum, s) => sum + s.priceCny, 0)
  const totalDuration = booking.services.reduce((sum, s) => sum + s.duration, 0)
  const depositRate = DEFAULT_REFUND_POLICY.depositRate
  const depositCny = Math.round(totalCny * depositRate)
  const depositKrw = Math.round(totalKrw * depositRate)
  const balanceCny = totalCny - depositCny

  const handlePay = async () => {
    setProcessing(true)
    setPaymentError(null)

    if (LIVE_PAYMENT) {
      // ─── 실결제: Antom API 호출 ───
      try {
        const serviceNames = booking.services.map(s => s.name.zh || s.name.ko).join('+')
        const shopName = shop?.name?.zh || shop?.name?.ko || 'NEAR'

        const result = await createPayment({
          reservationNo: `N-${Date.now().toString(36).toUpperCase()}`,
          amount: depositCny,
          currency: 'CNY',
          subject: `${serviceNames} — ${shopName}`,
          paymentMethod: booking.paymentMethod,
        })

        if (result.error) {
          setPaymentError(result.error)
          setProcessing(false)
          return
        }

        if (result.redirectUrl) {
          // 알리페이 앱/웹으로 리다이렉트
          // 결제 완료 후 returnUrl로 돌아옴
          sessionStorage.setItem('near_pending_payment', JSON.stringify({
            paymentRequestId: result.paymentRequestId,
            booking,
          }))
          window.location.href = result.redirectUrl
          return // 리다이렉트되므로 여기서 끝
        }

        // QR 결제 등 리다이렉트 없이 완료된 경우
        if (result.resultCode === 'SUCCESS') {
          setProcessing(false)
          onPay({ paymentId: result.paymentId, paymentRequestId: result.paymentRequestId })
          return
        }

        // 결제 대기 → 폴링
        const status = await pollPaymentStatus(result.paymentRequestId)
        setProcessing(false)
        if (status.settled && !status.failed) {
          onPay({ paymentId: result.paymentRequestId })
        } else {
          setPaymentError(lang === 'zh' ? '支付失败，请重试' : lang === 'ko' ? '결제에 실패했습니다' : 'Payment failed')
        }
      } catch (err) {
        setPaymentError(err.message)
        setProcessing(false)
      }
    } else {
      // ─── 목업: 시뮬레이션 ───
      await new Promise(r => setTimeout(r, 1500))
      setProcessing(false)
      onPay()
    }
  }

  // 결제 처리 중 화면
  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-3 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4" />
        <p className="text-[15px] font-medium mb-1" style={{ color: '#111' }}>
          {T.processingPayment[lang]}
        </p>
        <p className="text-[12px]" style={{ color: '#999' }}>
          {booking.paymentMethod === 'alipay' ? T.redirectingAlipay[lang] : T.processingPayment[lang]}
        </p>
        <div className="mt-6 bg-white rounded-2xl p-4 w-full">
          <div className="flex justify-between">
            <span className="text-[13px]" style={{ color: '#999' }}>{T.deposit[lang]}</span>
            <span className="text-[15px] font-semibold" style={{ color: '#111' }}>¥{depositCny}</span>
          </div>
        </div>
        {LIVE_PAYMENT && (
          <p className="text-[10px] mt-4" style={{ color: '#999' }}>
            Powered by Antom (Alipay Global)
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* 결제 오류 */}
      {paymentError && (
        <div className="bg-red-50 rounded-xl p-3 mb-4" style={{ border: '1px solid #FCA5A5' }}>
          <p className="text-[13px]" style={{ color: '#991B1B' }}>{paymentError}</p>
        </div>
      )}

      {/* 예약 내역 카드 */}
      <div className="card-y2k rounded-2xl p-5 mb-4" style={{ background: 'var(--y2k-surface)', border: '1px solid var(--y2k-border)', boxShadow: '0 4px 20px rgba(255, 133, 179, 0.08)' }}>
        <p className="text-[13px] font-medium mb-3" style={{ color: '#999' }}>{T.reservationSummary[lang]}</p>

        {shop && (
          <p className="text-[15px] font-semibold mb-3" style={{ color: '#111' }}>{shop.name[lang]}</p>
        )}

        {booking.services.map((svc, i) => (
          <div key={i} className="flex justify-between py-1">
            <span className="text-[13px]" style={{ color: '#111' }}>{svc.name[lang]}</span>
            <span className="text-[13px]" style={{ color: '#666' }}>¥{svc.priceCny}</span>
          </div>
        ))}

        <div className="border-t mt-3 pt-3" style={{ borderColor: '#F3F4F6' }}>
          <div className="flex justify-between mb-1">
            <span className="text-[12px]" style={{ color: '#999' }}>{T.dateTime[lang]}</span>
            <span className="text-[13px]" style={{ color: '#111' }}>{booking.date} {booking.time}</span>
          </div>
          {stylist && (
            <div className="flex justify-between mb-1">
              <span className="text-[12px]" style={{ color: '#999' }}>{T.stylist[lang]}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stylist.color }} />
                <span className="text-[13px]" style={{ color: '#111' }}>{stylist.name}</span>
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[12px]" style={{ color: '#999' }}>{T.duration[lang]}</span>
            <span className="text-[13px]" style={{ color: '#111' }}>{totalDuration}{T.minutes[lang]}</span>
          </div>
        </div>
      </div>

      {/* 금액 breakdown */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-[13px]" style={{ color: '#111' }}>{T.totalPrice[lang]}</span>
          <span className="text-[15px] font-semibold" style={{ color: '#111' }}>
            ¥{totalCny} <span className="text-[11px] font-normal" style={{ color: '#999' }}>/ ₩{totalKrw.toLocaleString()}</span>
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <div>
            <span className="text-[13px] font-medium" style={{ color: '#111' }}>{T.deposit[lang]}</span>
            <span className="text-[11px] ml-1" style={{ color: '#999' }}>{T.depositDesc[lang]}</span>
          </div>
          <span className="text-[15px] font-bold" style={{ color: '#111' }}>¥{depositCny}</span>
        </div>
        <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#F3F4F6' }}>
          <span className="text-[12px]" style={{ color: '#999' }}>{T.remainingBalance[lang]}</span>
          <span className="text-[13px]" style={{ color: '#999' }}>¥{balanceCny}</span>
        </div>
      </div>

      {/* 결제 수단 */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <p className="text-[13px] font-medium mb-3" style={{ color: '#111' }}>{T.paymentMethod[lang]}</p>
        <div className="space-y-2">
          {PAYMENT_METHODS.map(pm => (
            <button
              key={pm.id}
              onClick={() => onPaymentMethodChange(pm.id)}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-all active:scale-98"
              style={{
                background: booking.paymentMethod === pm.id ? 'var(--y2k-bg)' : 'var(--y2k-surface)',
                border: booking.paymentMethod === pm.id ? '2px solid var(--y2k-pink)' : '1px solid var(--y2k-border)',
                boxShadow: booking.paymentMethod === pm.id ? '0 4px 16px rgba(255, 133, 179, 0.15)' : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{pm.icon}</span>
                <span className="text-[14px]" style={{ color: '#111' }}>{pm.label[lang]}</span>
                {pm.recommended && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>
                    {T.recommended[lang]}
                  </span>
                )}
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: booking.paymentMethod === pm.id ? '#111' : '#D1D5DB' }}>
                {booking.paymentMethod === pm.id && (
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#111' }} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 메모 */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <p className="text-[13px] font-medium mb-2" style={{ color: '#111' }}>{T.customerMemo[lang]}</p>
        <textarea
          value={booking.customerNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={lang === 'zh' ? '请输入备注（可选）' : lang === 'ko' ? '요청사항 (선택)' : 'Note (optional)'}
          className="w-full px-3 py-2 rounded-xl text-[13px] border resize-none h-16"
          style={{ borderColor: '#E5E7EB', color: '#111' }}
        />
      </div>

      {/* 환불 정책 */}
      <div className="bg-amber-50 rounded-2xl p-4 mb-4">
        <p className="text-[12px] font-medium mb-2" style={{ color: '#92400E' }}>{T.refundPolicy[lang]}</p>
        <p className="text-[11px] mb-1" style={{ color: '#92400E' }}>• {T.refundTier72h[lang]}</p>
        <p className="text-[11px] mb-1" style={{ color: '#92400E' }}>• {T.refundTier24h[lang]}</p>
        <p className="text-[11px] mb-3" style={{ color: '#92400E' }}>• {T.refundNoshow[lang]}</p>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded" />
          <span className="text-[12px] font-medium" style={{ color: '#92400E' }}>
            {T.agreeRefundPolicy[lang]}
          </span>
        </label>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-all"
          style={{ color: '#666', border: '1px solid #E5E7EB' }}>
          {T.back[lang]}
        </button>
        <button
          onClick={handlePay}
          disabled={!agreed}
          className="flex-[2] py-3 rounded-full text-[14px] font-semibold text-white transition-all active:scale-[0.95]"
          style={{
            background: agreed ? 'var(--gradient-dream)' : '#D1D5DB',
            boxShadow: agreed ? '0 4px 16px rgba(255, 133, 179, 0.3)' : 'none',
          }}
        >
          {T.payDeposit[lang]} ¥{depositCny}
        </button>
      </div>

      {/* 결제 모드 표시 */}
      <p className="text-[10px] text-center mt-3" style={{ color: '#D1D5DB' }}>
        {LIVE_PAYMENT ? 'Antom (Alipay Global) Secure Payment' : 'Demo Mode — 결제 시뮬레이션'}
      </p>
    </div>
  )
}
