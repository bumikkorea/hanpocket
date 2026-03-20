// NEAR 예약 시스템 — 관리자용 훅 (Supabase 실시간 연동)
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_RESERVATIONS, MOCK_CUSTOMERS } from '../data/reservationData'

const RES_KEY  = 'near_reservations'
const CUST_KEY = 'near_customers'

function loadLocal(key, fallback) {
  try {
    const s = JSON.parse(localStorage.getItem(key))
    return s && s.length > 0 ? s : fallback
  } catch { return fallback }
}

// Supabase 행 → 기존 UI가 기대하는 형태로 정규화
function normalizeBooking(row) {
  return {
    id:             row.id,
    reservationNo:  row.booking_number,
    shopId:         row.popup_id,
    customerId:     row.device_id,
    customerName:   row.customer_name || '',
    deviceId:       row.device_id,
    services: row.popup_services ? [{
      serviceId:  row.service_id,
      name: { ko: row.popup_services.name_ko, zh: row.popup_services.name_zh, en: row.popup_services.name_ko },
      priceKrw:   row.popup_services.price_krw,
    }] : [],
    totalPriceKrw:  row.total_krw || 0,
    date:           row.booking_date,
    time:           row.booking_time?.slice(0, 5),
    partySize:      row.guests || 1,
    depositKrw:     row.deposit_krw || 0,
    paymentMethod:  row.payment_method,
    paymentStatus:  row.payment_status,
    status:         row.status,
    customerNote:   '',
    shopNote:       row.customer_memo || '',
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  }
}

// 예약 목록에서 고객 통계 집계
function deriveCustomers(bookings) {
  const map = {}
  bookings.forEach(b => {
    const key = b.customerId
    if (!map[key]) {
      map[key] = {
        id:           key,
        name:         b.customerName || key.slice(0, 6),
        deviceId:     key,
        totalVisits:  0,
        totalSpentKrw: 0,
        noshowCount:  0,
        lastVisitAt:  b.date,
        memo:         b.shopNote || '',
        isBlocked:    false,
      }
    }
    map[key].totalVisits++
    if (b.status === 'completed') map[key].totalSpentKrw += b.totalPriceKrw
    if (b.status === 'noshow')    map[key].noshowCount++
    if (b.date > map[key].lastVisitAt) map[key].lastVisitAt = b.date
  })
  return Object.values(map)
}

const useReservationAdmin = (shopId) => {
  const usingSupabase = !!shopId

  // 로컬 폴백: shopId 없으면 mock 데이터
  const [reservations, setReservations] = useState(() =>
    usingSupabase ? [] : loadLocal(RES_KEY, MOCK_RESERVATIONS)
  )
  const [customers, setCustomers] = useState(() =>
    usingSupabase ? [] : loadLocal(CUST_KEY, MOCK_CUSTOMERS)
  )
  const [loading, setLoading] = useState(usingSupabase)

  // ── Supabase fetch ──────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!shopId) return
    const { data, error } = await supabase
      .from('bookings')
      .select('*, popup_services(name_zh, name_ko, price_krw)')
      .eq('popup_id', shopId)
      .order('booking_date', { ascending: false })
      .order('booking_time')
    if (error) {
      console.error('[useReservationAdmin] fetch error', error)
      return
    }
    const normalized = (data || []).map(normalizeBooking)
    setReservations(normalized)
    setCustomers(deriveCustomers(normalized))
    setLoading(false)
  }, [shopId])

  // ── 실시간 구독 ─────────────────────────────────────────────
  useEffect(() => {
    if (!shopId) return
    fetchBookings()

    const channel = supabase
      .channel(`bookings:${shopId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `popup_id=eq.${shopId}` },
        () => fetchBookings()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [shopId, fetchBookings])

  // localStorage 동기 (Supabase 없을 때만)
  useEffect(() => {
    if (!usingSupabase) localStorage.setItem(RES_KEY, JSON.stringify(reservations))
  }, [reservations, usingSupabase])

  // ── 상태 변경 ───────────────────────────────────────────────
  const updateStatus = useCallback(async (id, status, extra = {}) => {
    if (usingSupabase) {
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString(), ...extra })
        .eq('id', id)
      if (error) console.error('[updateStatus]', error)
      // 실시간 구독이 자동으로 refetch 처리함
    } else {
      setReservations(prev => prev.map(r =>
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString(), ...extra } : r
      ))
    }
  }, [usingSupabase])

  const confirmReservation = useCallback((id) =>
    updateStatus(id, 'confirmed', { confirmedAt: new Date().toISOString() }),
  [updateStatus])

  const rejectReservation = useCallback((id, reason = '') =>
    updateStatus(id, 'cancelled', {
      cancelledAt: new Date().toISOString(),
      cancelledBy: 'merchant',
      cancelReason: reason,
    }),
  [updateStatus])

  const completeReservation = useCallback(async (id) => {
    await updateStatus(id, 'completed', { completedAt: new Date().toISOString() })
    if (!usingSupabase) {
      const res = reservations.find(r => r.id === id)
      if (res) {
        setCustomers(prev => prev.map(c =>
          c.id === res.customerId ? {
            ...c,
            totalVisits:   (c.totalVisits || 0) + 1,
            totalSpentKrw: (c.totalSpentKrw || 0) + res.totalPriceKrw,
          } : c
        ))
      }
    }
  }, [reservations, updateStatus, usingSupabase])

  const markNoshow = useCallback(async (id) => {
    await updateStatus(id, 'noshow', { noshowAt: new Date().toISOString() })
    if (!usingSupabase) {
      const res = reservations.find(r => r.id === id)
      if (res) {
        setCustomers(prev => prev.map(c => {
          if (c.id !== res.customerId) return c
          const newCount = (c.noshowCount || 0) + 1
          return { ...c, noshowCount: newCount, isBlocked: newCount >= 3 }
        }))
      }
    }
  }, [reservations, updateStatus, usingSupabase])

  // ── 메모 ────────────────────────────────────────────────────
  const updateShopNote = useCallback(async (id, note) => {
    if (usingSupabase) {
      await supabase.from('bookings').update({ customer_memo: note }).eq('id', id)
    } else {
      setReservations(prev => prev.map(r =>
        r.id === id ? { ...r, shopNote: note } : r
      ))
    }
  }, [usingSupabase])

  const updateCustomerMemo = useCallback((customerId, memo) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, memo } : c
    ))
  }, [])

  const blockCustomer = useCallback((customerId, block = true) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, isBlocked: block } : c
    ))
  }, [])

  // ── 조회 ────────────────────────────────────────────────────
  const getTodayReservations = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    return reservations
      .filter(r => r.date === today)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  }, [reservations])

  const getReservationsByDate = useCallback((date) => {
    return reservations
      .filter(r => r.date === date)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  }, [reservations])

  const getCustomer = useCallback((id) =>
    customers.find(c => c.id === id),
  [customers])

  const searchCustomers = useCallback((query) => {
    if (!query) return customers
    const q = query.toLowerCase()
    return customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.deviceId?.includes(q)
    )
  }, [customers])

  const getCustomerReservations = useCallback((customerId) => {
    return reservations
      .filter(r => r.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [reservations])

  const getTodayStats = useCallback(() => {
    const today = getTodayReservations()
    const now = new Date()
    const monthRevenue = reservations
      .filter(r => {
        const d = new Date(r.date)
        return r.status === 'completed' &&
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
      })
      .reduce((s, r) => s + r.totalPriceKrw, 0)
    return {
      total:     today.length,
      pending:   today.filter(r => r.status === 'pending').length,
      confirmed: today.filter(r => r.status === 'confirmed').length,
      completed: today.filter(r => r.status === 'completed').length,
      noshow:    today.filter(r => r.status === 'noshow').length,
      revenue:   today.filter(r => r.status === 'completed').reduce((s, r) => s + r.totalPriceKrw, 0),
      monthRevenue,
    }
  }, [getTodayReservations, reservations])

  const getSettlements = useCallback(() => [], [])

  return {
    reservations,
    customers,
    loading,
    confirmReservation,
    rejectReservation,
    completeReservation,
    markNoshow,
    updateShopNote,
    updateCustomerMemo,
    blockCustomer,
    getTodayReservations,
    getReservationsByDate,
    getCustomer,
    searchCustomers,
    getCustomerReservations,
    getTodayStats,
    getSettlements,
  }
}

export default useReservationAdmin
