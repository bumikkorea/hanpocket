// DB에서 팝업 목록을 가져오고 HomeTab/NearMap 공통 형식으로 정규화
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const API = 'https://hanpocket-popup-store.bumik-korea.workers.dev/api/popups'

// DB 레코드 → 앱 내부 형식으로 정규화
function normalize(p) {
  const today = new Date().toISOString().split('T')[0]
  const daysLeft = p.end_date
    ? Math.ceil((new Date(p.end_date) - new Date(today)) / 86400000)
    : null

  return {
    id: p.id,
    brand: p.brand || '',
    title: { ko: p.title_ko || p.name_ko || '', zh: p.title_zh || p.name_zh || '', en: p.title_en || p.name_en || '' },
    image: p.cover_image || '',
    emoji: p.emoji || '📌',
    color: p.color || '#6366F1',
    hot: p.is_hot === 1,
    district: p.district || 'other',
    venue_name: p.venue_name || p.location_name || '',
    venue_type: p.venue_type || 'other',
    popup_type: p.popup_type || 'other',
    period: {
      start: p.start_date || '',
      end:   p.end_date   || '',
    },
    floor: { ko: p.floor_ko || '', zh: p.floor_zh || '', en: p.floor_en || '' },
    lat: p.lat,
    lng: p.lng,
    // 중국인 특화
    payment_alipay:    p.payment_alipay    === 1,
    payment_wechatpay: p.payment_wechatpay === 1,
    chinese_staff:     p.chinese_staff     === 1,
    tax_refund:        p.tax_refund_available === 1,
    source_xhs:        p.source_xhs || '',
    cn_sns_tag_zh:     p.cn_sns_tag_zh || '',
    queue_info_zh:     p.queue_info_zh || '',
    entry_type:        p.entry_type || 'free',
    reservation_url:   p.reservation_url || '',
    open_time:         p.open_time || '10:00',
    close_time:        p.close_time || '20:00',
    // 계산된 필드
    daysLeft,
    isClosingSoon: daysLeft !== null && daysLeft <= 7 && daysLeft >= 0,
    isActive: p.end_date >= today && p.start_date <= today,
    isUpcoming: p.start_date > today,
    // 원본
    _raw: p,
  }
}

export function usePopupStores({ district, venue_type, popup_type, cn_pay, cn_staff, hot, closing_soon } = {}) {
  const [popups, setPopups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams({ limit: '100' })
    if (district    && district    !== 'all') params.set('district', district)
    if (venue_type  && venue_type  !== 'all') params.set('venue_type', venue_type)
    if (popup_type  && popup_type  !== 'all') params.set('popup_type', popup_type)
    if (cn_pay)     params.set('cn_pay', '1')
    if (cn_staff)   params.set('cn_staff', '1')
    if (hot)        params.set('hot', '1')
    if (closing_soon) params.set('closing_soon', '1')

    setLoading(true)
    fetch(`${API}?${params}`)
      .then(r => r.json())
      .then(data => setPopups(data.map(normalize)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [district, venue_type, popup_type, cn_pay, cn_staff, hot, closing_soon])

  const active   = popups.filter(p => p.isActive)
  const upcoming = popups.filter(p => p.isUpcoming)

  return { popups, active, upcoming, loading, error }
}

export function usePopupMap() {
  const [pins, setPins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/map`)
      .then(r => r.json())
      .then(data => setPins(data.map(normalize)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { pins, loading }
}

// Supabase 팝업 row → NearMap 내부 형식으로 정규화
function normalizeSupabasePin(row) {
  return {
    id: row.id,
    category: row.category || 'popup',
    name_zh: row.name_zh || '',
    name_ko: row.name_ko || row.name_zh || '',
    name_en: row.name_en || '',
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    address_zh: row.address_zh || '',
    address_ko: row.address_ko || '',
    image_url: row.image_url || '',
    is_temporary: row.is_temporary !== false,
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    open_time: row.open_time ? String(row.open_time).slice(0, 5) : '10:00',
    close_time: row.close_time ? String(row.close_time).slice(0, 5) : '20:00',
    tags: [],
    has_reservation: row.has_reservation || false,
    has_alipay: row.has_alipay || false,
    has_wechat_pay: row.has_wechat_pay || false,
    wait_minutes: null,
    created_at: row.created_at || '',
    view_count_7d: row.view_count_7d || 0,
    sort_priority: row.cn_score || 0,
  }
}

// NearMap용 핀 훅 — Supabase 우선, POI_DATA fallback
export function useNearPins() {
  const [pins, setPins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userPos, setUserPos] = useState(null)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    const loadPins = async () => {
      const { POI_DATA } = await import('../data/poiData.js')

      let rawData = POI_DATA
      try {
        const { data, error: fetchError } = await supabase
          .from('popups')
          .select('*, brands(name_zh, name_ko, name_en, brand_level)')
          .or(`is_temporary.eq.false,end_date.gte.${today}`)
          .order('cn_score', { ascending: false })

        if (fetchError) {
          setError(`DB 에러: ${fetchError.message}`)
        } else if (data?.length) {
          rawData = data.map(normalizeSupabasePin)
        }
      } catch (err) {
        setError('DB 연결 실패, 로컬 데이터 사용 중')
      }

      const applyDist = (lat, lng) => {
        const withDist = rawData
          .map(p => ({ ...p, distance: haversine(lat, lng, p.lat, p.lng) }))
          .sort((a, b) => a.distance - b.distance)
        setPins(withDist)
        setLoading(false)
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => { setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }); applyDist(pos.coords.latitude, pos.coords.longitude) },
          ()  => applyDist(37.5446, 127.0560),
        )
      } else {
        applyDist(37.5446, 127.0560)
      }
    }

    loadPins().catch(err => {
      setError(err?.message || '데이터 로드 실패')
      setLoading(false)
    })
  }, [])

  return { pins, loading, error, userPos }
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
