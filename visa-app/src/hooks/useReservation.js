// NEAR 예약 시스템 — 고객용 훅 (Antom 결제 연동)
import { useState, useEffect, useCallback } from 'react'
import { generateReservationNo, DEFAULT_REFUND_POLICY, MOCK_RESERVATIONS } from '../data/reservationData'
import { requestRefund, cancelPayment } from '../api/paymentApi'

const STORAGE_KEY = 'near_reservations'
const LIVE_PAYMENT = !!import.meta.env.VITE_PAYMENT_API_URL

function loadReservations() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return stored && stored.length > 0 ? stored : MOCK_RESERVATIONS
  } catch {
    return MOCK_RESERVATIONS
  }
}

function saveReservations(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const useReservation = () => {
  const [reservations, setReservations] = useState(loadReservations)

  useEffect(() => {
    saveReservations(reservations)
  }, [reservations])

  // 결제 복귀 후 pending 결제 확인
  useEffect(() => {
    const pending = sessionStorage.getItem('near_pending_payment')
    if (pending) {
      try {
        const { paymentRequestId, booking } = JSON.parse(pending)
        sessionStorage.removeItem('near_pending_payment')
        // 결제 성공 시 예약 생성 (returnUrl로 돌아왔으므로)
        // 실제로는 pollPaymentStatus로 확인해야 하지만, 간소화
        console.log('[NEAR] Payment return detected:', paymentRequestId)
      } catch { /* ignore */ }
    }
  }, [])

  // 예약 생성
  const createReservation = useCallback(({ shopId, services, date, time, stylistId, paymentMethod, customerNote, customerLang = 'ZH', paymentId: externalPaymentId } = {}) => {
    const totalPriceKrw = services.reduce((sum, s) => sum + s.priceKrw, 0)
    const totalPriceCny = services.reduce((sum, s) => sum + s.priceCny, 0)
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0)
    const depositRate = DEFAULT_REFUND_POLICY.depositRate
    const depositCny = Math.round(totalPriceCny * depositRate)
    const depositKrw = Math.round(totalPriceKrw * depositRate)

    const newRes = {
      id: 'res-' + Date.now().toString(36),
      reservationNo: generateReservationNo(),
      shopId,
      customerId: 'self',
      stylistId: stylistId || null,
      services: services.map(s => ({
        serviceId: s.id || s.serviceId,
        name: s.name,
        duration: s.duration,
        priceKrw: s.priceKrw,
        priceCny: s.priceCny,
      })),
      totalPriceKrw,
      totalPriceCny,
      totalDuration,
      date,
      time,
      depositCny,
      depositKrw,
      depositRate,
      paymentMethod,
      paymentId: externalPaymentId || 'MOCK-' + Date.now(),
      depositPaidAt: new Date().toISOString(),
      status: 'pending',
      customerLang,
      customerNote: customerNote || '',
      shopNote: '',
      createdAt: new Date().toISOString(),
    }

    setReservations(prev => [newRes, ...prev])
    return newRes
  }, [])

  // 예약 취소 + 환불 요청
  const cancelReservation = useCallback(async (id) => {
    const res = reservations.find(r => r.id === id)
    if (!res) return

    const refundAmount = calculateRefund(res)

    // 실결제 모드에서 환불 API 호출
    if (LIVE_PAYMENT && res.paymentId && !res.paymentId.startsWith('MOCK-')) {
      try {
        if (refundAmount > 0) {
          await requestRefund({
            paymentId: res.paymentId,
            refundAmount,
            refundCurrency: 'CNY',
            refundReason: 'Customer cancellation',
          })
        } else {
          // 환불 금액 0이면 결제 취소만
          await cancelPayment(res.paymentId)
        }
      } catch (err) {
        console.error('[NEAR] Refund/cancel error:', err)
        // 환불 실패해도 예약은 취소 처리 (수동 환불 필요)
      }
    }

    setReservations(prev => prev.map(r =>
      r.id === id ? {
        ...r,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'customer',
        refundAmount,
        refundStatus: refundAmount > 0 ? 'processing' : 'none',
      } : r
    ))
  }, [reservations])

  // 환불 금액 계산
  const calculateRefund = useCallback((reservation) => {
    if (!reservation || reservation.status === 'cancelled') return 0
    const reservationTime = new Date(`${reservation.date}T${reservation.time}:00`)
    const now = new Date()
    const hoursUntil = (reservationTime - now) / (1000 * 60 * 60)

    const tiers = DEFAULT_REFUND_POLICY.cancellationTiers
    for (const tier of tiers) {
      if (hoursUntil >= tier.hoursBefore) {
        return Math.round(reservation.depositCny * tier.refundRate)
      }
    }
    return 0
  }, [])

  // 내 예약 조회
  const getMyReservations = useCallback(() => {
    return reservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [reservations])

  // 예정 예약
  const getUpcoming = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    return reservations
      .filter(r => r.date >= today && ['pending', 'confirmed'].includes(r.status))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  }, [reservations])

  // 지난 예약
  const getPast = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    return reservations
      .filter(r => r.date < today || ['completed', 'cancelled', 'noshow'].includes(r.status))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [reservations])

  // 단건 조회
  const getReservation = useCallback((id) => {
    return reservations.find(r => r.id === id)
  }, [reservations])

  return {
    reservations,
    createReservation,
    cancelReservation,
    calculateRefund,
    getMyReservations,
    getUpcoming,
    getPast,
    getReservation,
  }
}

export default useReservation
