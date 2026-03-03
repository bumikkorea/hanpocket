import { useState, useEffect, useRef } from 'react'
import { searchFlight, getRemainingRequests } from '../api/airportApi'

/**
 * 항공편 검색 훅 (500ms debounce)
 * useTourSearch 패턴 동일: cancellation token + debounce + { data, loading, error }
 *
 * @param {string} flightId - 편명 (예: 'KE123')
 * @param {{ enabled?: boolean, debounceMs?: number }} options
 * @returns {{ results, loading, error, limitWarning, remainingRequests }}
 */
export function useFlightSearch(flightId, { enabled = true, debounceMs = 500 } = {}) {
  const [results, setResults] = useState({ arrivals: [], departures: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [limitWarning, setLimitWarning] = useState(false)
  const timerRef = useRef(null)
  const cancelRef = useRef(false)
  const refreshRef = useRef(null)

  useEffect(() => {
    if (!enabled || !flightId || flightId.length < 3) {
      setResults({ arrivals: [], departures: [] })
      setError(null)
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      cancelRef.current = false
      setLoading(true)
      setError(null)

      searchFlight(flightId)
        .then(result => {
          if (cancelRef.current) return
          setResults({ arrivals: result.arrivals, departures: result.departures })
          setLimitWarning(result.limitWarning || false)
          if (result.error) setError(result.error)
        })
        .catch(err => {
          if (!cancelRef.current) setError(err.message)
        })
        .finally(() => {
          if (!cancelRef.current) setLoading(false)
        })
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (refreshRef.current) clearInterval(refreshRef.current)
      cancelRef.current = true
    }
  }, [flightId, enabled, debounceMs])

  // 5분마다 자동 새로고침
  useEffect(() => {
    if (!enabled || !flightId || flightId.length < 3) return
    refreshRef.current = setInterval(() => {
      cancelRef.current = false
      searchFlight(flightId)
        .then(result => {
          if (cancelRef.current) return
          setResults({ arrivals: result.arrivals, departures: result.departures })
          setLimitWarning(result.limitWarning || false)
          if (result.error) setError(result.error)
        })
        .catch(() => {})
    }, 5 * 60 * 1000)
    return () => { if (refreshRef.current) clearInterval(refreshRef.current) }
  }, [flightId, enabled])

  return {
    results,
    loading,
    error,
    limitWarning,
    remainingRequests: getRemainingRequests(),
  }
}
