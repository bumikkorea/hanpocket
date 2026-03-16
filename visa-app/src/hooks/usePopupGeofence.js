// usePopupGeofence — 위치 기반 팝업 감지 + 알림 트리거
// 3차원 현장 반응 루프의 진입점
//
// 동작 흐름:
// 1. 앱 활성 상태에서 GPS 감시
// 2. 활성 팝업 목록 중 반경 100m 이내 팝업 감지
// 3. 같은 팝업은 24시간 내 1회만 트리거
// 4. 15분 체류 감지 시 "마음에 드셨나요?" 프롬프트

import { useState, useEffect, useCallback, useRef } from 'react'

const GEOFENCE_RADIUS = 100   // 미터
const DWELL_THRESHOLD = 15    // 분
const COOLDOWN_HOURS = 24     // 같은 팝업 재트리거 방지
const TRIGGER_KEY = 'hp_geo_triggers'
const API = 'https://hanpocket-popup-store.bumik-korea.workers.dev/api'

// Haversine 거리 계산 (미터)
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// 트리거 이력 로드 (쿨다운 체크용)
function loadTriggers() {
  try {
    return JSON.parse(localStorage.getItem(TRIGGER_KEY)) || {}
  } catch { return {} }
}

function saveTrigger(popupId) {
  const triggers = loadTriggers()
  triggers[popupId] = Date.now()
  // 7일 이상 된 것은 정리
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  for (const [k, v] of Object.entries(triggers)) {
    if (v < weekAgo) delete triggers[k]
  }
  localStorage.setItem(TRIGGER_KEY, JSON.stringify(triggers))
}

function isOnCooldown(popupId) {
  const triggers = loadTriggers()
  const last = triggers[popupId]
  if (!last) return false
  return (Date.now() - last) < COOLDOWN_HOURS * 60 * 60 * 1000
}


export function usePopupGeofence(activePopups = [], enabled = true) {
  const [nearbyPopup, setNearbyPopup] = useState(null)      // 현재 근처 팝업
  const [dwellPopup, setDwellPopup] = useState(null)         // 15분 체류한 팝업
  const [userPosition, setUserPosition] = useState(null)
  const [isWatching, setIsWatching] = useState(false)

  const dwellTimers = useRef({})    // popupId → setTimeout ID
  const watchId = useRef(null)

  // 서버에 지오트리거 로그 전송
  const logGeoTrigger = useCallback(async (popupId, triggerType, lat, lng) => {
    const user_token = localStorage.getItem('hp_user_token') || ''
    try {
      await fetch(`${API}/popups/${popupId}/geo-trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_token, trigger_type: triggerType, lat, lng }),
      })
    } catch {} // 실패해도 무시
  }, [])

  // 위치 업데이트 시 팝업 매칭
  const checkNearby = useCallback((position) => {
    const { latitude, longitude } = position.coords
    setUserPosition({ lat: latitude, lng: longitude })

    if (!activePopups.length) return

    // 가장 가까운 팝업 찾기
    let closest = null
    let closestDist = Infinity

    for (const popup of activePopups) {
      if (!popup.latitude || !popup.longitude) continue
      // 좌표가 문자열인 경우 대비
      const plat = parseFloat(popup.latitude || popup.lat)
      const plng = parseFloat(popup.longitude || popup.lng)
      if (!plat || !plng) continue

      const dist = distanceMeters(latitude, longitude, plat, plng)
      if (dist < GEOFENCE_RADIUS && dist < closestDist) {
        closest = popup
        closestDist = dist
      }
    }

    if (closest && !isOnCooldown(closest.id)) {
      // 진입 감지
      if (!nearbyPopup || nearbyPopup.id !== closest.id) {
        setNearbyPopup(closest)
        saveTrigger(closest.id)
        logGeoTrigger(closest.id, 'enter', latitude, longitude)

        // 체류 타이머 시작
        if (dwellTimers.current[closest.id]) {
          clearTimeout(dwellTimers.current[closest.id])
        }
        dwellTimers.current[closest.id] = setTimeout(() => {
          // 15분 후에도 근처에 있으면 dwell 트리거
          setDwellPopup(closest)
          logGeoTrigger(closest.id, 'dwell_15min', latitude, longitude)
        }, DWELL_THRESHOLD * 60 * 1000)
      }
    } else if (nearbyPopup && (!closest || closest.id !== nearbyPopup.id)) {
      // 이탈 감지
      if (dwellTimers.current[nearbyPopup.id]) {
        clearTimeout(dwellTimers.current[nearbyPopup.id])
        delete dwellTimers.current[nearbyPopup.id]
      }
      logGeoTrigger(nearbyPopup.id, 'exit', latitude, longitude)
      setNearbyPopup(null)
    }
  }, [activePopups, nearbyPopup, logGeoTrigger])

  // GPS 감시 시작/중지
  useEffect(() => {
    if (!enabled || !navigator.geolocation || !activePopups.length) return

    setIsWatching(true)
    watchId.current = navigator.geolocation.watchPosition(
      checkNearby,
      () => setIsWatching(false),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    )

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current)
        watchId.current = null
      }
      // 모든 체류 타이머 정리
      for (const timer of Object.values(dwellTimers.current)) {
        clearTimeout(timer)
      }
      dwellTimers.current = {}
      setIsWatching(false)
    }
  }, [enabled, activePopups.length, checkNearby])

  // "마음에 드셨나요?" 표시 후 초기화
  const dismissDwell = useCallback(() => {
    setDwellPopup(null)
  }, [])

  // 수동 체크인 (GPS 없이 QR/버튼)
  const manualCheckin = useCallback((popup) => {
    if (isOnCooldown(popup.id)) return false
    saveTrigger(popup.id)
    setNearbyPopup(popup)
    setDwellPopup(popup) // 바로 리뷰 프롬프트
    logGeoTrigger(popup.id, 'enter', 0, 0)
    logGeoTrigger(popup.id, 'dwell_15min', 0, 0)
    return true
  }, [logGeoTrigger])

  return {
    nearbyPopup,      // 현재 100m 이내 팝업 (알림용)
    dwellPopup,       // 15분 체류 팝업 ("마음에 드셨나요?" 프롬프트용)
    userPosition,
    isWatching,

    dismissDwell,
    manualCheckin,
  }
}
