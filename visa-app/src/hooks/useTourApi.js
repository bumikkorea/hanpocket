import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getAreaBasedList,
  getLocationBasedList,
  searchKeyword,
  searchFestival,
  searchStay,
  getFullDetail,
  getNearbyAll,
} from '../api/tourApi'

/**
 * Generic TourAPI hook
 */
export function useTourApi(fetcher, params, { enabled = true, deps = [] } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher(params)
      .then(result => { if (!cancelled) setData(result) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [enabled, ...deps])

  return { data, loading, error }
}

/**
 * 주변 관광지 검색
 */
export function useNearbySpots(lat, lng, radius = 5000, contentTypeId) {
  const [data, setData] = useState({ items: [], totalCount: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lng) return
    let cancelled = false
    setLoading(true)

    getLocationBasedList({
      mapX: lng,
      mapY: lat,
      radius,
      contentTypeId,
      numOfRows: 20,
      arrange: 'E', // distance order
    })
      .then(result => { if (!cancelled) setData(result) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [lat, lng, radius, contentTypeId])

  return { ...data, loading, error }
}

/**
 * 키워드 검색 (디바운스 300ms)
 */
export function useTourSearch(keyword, filters = {}) {
  const [data, setData] = useState({ items: [], totalCount: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!keyword || keyword.length < 2) {
      setData({ items: [], totalCount: 0 })
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      let cancelled = false
      setLoading(true)

      searchKeyword(keyword, { numOfRows: 30, ...filters })
        .then(result => { if (!cancelled) setData(result) })
        .catch(err => { if (!cancelled) setError(err.message) })
        .finally(() => { if (!cancelled) setLoading(false) })

      return () => { cancelled = true }
    }, 300)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [keyword, filters.contentTypeId, filters.areaCode])

  return { ...data, loading, error }
}

/**
 * 상세 정보 (공통 + 소개 + 이미지 병렬)
 */
export function useTourDetail(contentId, contentTypeId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!contentId || !contentTypeId) return
    let cancelled = false
    setLoading(true)

    getFullDetail(contentId, contentTypeId)
      .then(result => { if (!cancelled) setData(result) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [contentId, contentTypeId])

  return { data, loading, error }
}

/**
 * 행사/축제 검색
 */
export function useFestivals(areaCode, page = 1) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const [data, setData] = useState({ items: [], totalCount: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    searchFestival(today, {
      areaCode: areaCode || undefined,
      numOfRows: 20,
      pageNo: page,
      arrange: 'R',
    })
      .then(result => { if (!cancelled) setData(result) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [areaCode, page])

  return { ...data, loading }
}

/**
 * 숙박 검색
 */
export function useStaySearch(areaCode, page = 1) {
  const [data, setData] = useState({ items: [], totalCount: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    searchStay({
      areaCode: areaCode || undefined,
      numOfRows: 20,
      pageNo: page,
      arrange: 'R',
    })
      .then(result => { if (!cancelled) setData(result) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [areaCode, page])

  return { ...data, loading }
}

/**
 * GPS 위치 가져오기
 */
export function useGeoLocation() {
  const [pos, setPos] = useState(null)
  const [error, setError] = useState(null)

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => setError(e.message),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  useEffect(() => { refresh() }, [])

  return { pos, error, refresh }
}
