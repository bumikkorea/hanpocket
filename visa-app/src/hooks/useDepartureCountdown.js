import { useState, useEffect, useCallback } from 'react'
import { fetchFlightStatus, getAirportCongestion, estimateGateWalkTime } from '../api/flightApi'

const STORAGE_KEY = 'hp_departure_flight'

function loadFlight() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
}
function saveFlight(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
function clearFlight() {
  localStorage.removeItem(STORAGE_KEY)
}

// Checklist items template
function buildChecklist(lang) {
  return [
    { id: 'passport', label: { ko: '여권 확인', zh: '确认护照', en: 'Check passport', ja: 'パスポート確認' }, checked: false },
    { id: 'baggage', label: { ko: '수하물 무게 확인', zh: '确认行李重量', en: 'Check baggage weight', ja: '荷物の重量確認' }, checked: false, hasInput: true, inputLabel: 'kg', inputValue: '' },
    { id: 'charger', label: { ko: '충전기/보조배터리', zh: '充电器/充电宝', en: 'Charger/power bank', ja: '充電器/モバイルバッテリー' }, checked: false },
    { id: 'krw', label: { ko: '남은 원화 사용 계획', zh: '剩余韩元使用计划', en: 'Plan for remaining KRW', ja: '残りのウォン使用計画' }, checked: false },
    { id: 'taxrefund', label: { ko: '세금환급 서류 준비', zh: '准备退税材料', en: 'Prepare tax refund docs', ja: '免税書類の準備' }, checked: false },
    { id: 'boarding', label: { ko: '탑승권 확인 (모바일/출력)', zh: '确认登机牌（手机/打印）', en: 'Boarding pass (mobile/printed)', ja: '搭乗券確認（モバイル/印刷）' }, checked: false },
    { id: 'address', label: { ko: '한국 숙소 주소 메모 (입국카드용)', zh: '记录韩国住所地址（入境卡用）', en: 'Note Korea address (for arrival card)', ja: '韓国の宿泊先住所メモ（入国カード用）' }, checked: false },
  ]
}

/**
 * Determine the current phase based on time until departure
 */
function getPhase(minutesUntil) {
  if (minutesUntil > 24 * 60) return 'early' // More than 24h
  if (minutesUntil > 20 * 60) return 'dday_eve' // D-1 evening (20h+)
  if (minutesUntil > 3 * 60) return 'dday_morning' // D-day morning
  if (minutesUntil > 2 * 60) return 'three_hours' // 3h before
  if (minutesUntil > 60) return 'two_hours' // 2h before
  if (minutesUntil > 0) return 'one_hour' // 1h before
  return 'departed' // Past departure
}

/**
 * Get notifications that should be shown for current phase
 */
function getNotifications(phase, lang) {
  const all = [
    {
      id: 'dday_eve',
      phase: 'dday_eve',
      title: { ko: '내일 출국이에요!', zh: '明天就出发了！', en: 'Departing tomorrow!', ja: '明日出発です！' },
      desc: { ko: '짐 싸기 체크리스트를 확인하세요', zh: '请确认行李打包清单', en: 'Check your packing checklist', ja: '荷造りチェックリストを確認してください' },
      time: 'D-1 20:00',
    },
    {
      id: 'three_hours',
      phase: 'three_hours',
      title: { ko: '출발 3시간 전', zh: '出发前3小时', en: '3 hours before departure', ja: '出発3時間前' },
      desc: { ko: '체크리스트 최종 확인하세요', zh: '请最终确认清单', en: 'Final checklist review', ja: 'チェックリスト最終確認' },
      time: 'D-day 3h',
    },
    {
      id: 'two_hours',
      phase: 'two_hours',
      title: { ko: '출발 2시간 전', zh: '出发前2小时', en: '2 hours before departure', ja: '出発2時間前' },
      desc: { ko: '게이트 정보와 공항 혼잡도를 확인하세요', zh: '查看登机口信息和机场拥挤度', en: 'Check gate info & airport congestion', ja: 'ゲート情報と空港混雑状況を確認' },
      time: 'D-day 2h',
    },
    {
      id: 'one_hour',
      phase: 'one_hour',
      title: { ko: '지금 출발하세요!', zh: '现在出发吧！', en: 'Leave now!', ja: '今すぐ出発！' },
      desc: { ko: '택시 호출 또는 AREX 시간표를 확인하세요', zh: '叫出租车或查看AREX时刻表', en: 'Call a taxi or check AREX schedule', ja: 'タクシーを呼ぶかAREXの時刻表を確認' },
      time: 'D-day 1h',
    },
  ]

  const phases = ['early', 'dday_eve', 'dday_morning', 'three_hours', 'two_hours', 'one_hour', 'departed']
  const currentIdx = phases.indexOf(phase)

  return all.map(n => ({
    ...n,
    active: n.phase === phase,
    completed: phases.indexOf(n.phase) < currentIdx,
    upcoming: phases.indexOf(n.phase) > currentIdx,
  }))
}

export default function useDepartureCountdown() {
  const [flight, setFlight] = useState(loadFlight)
  const [flightInfo, setFlightInfo] = useState(null)
  const [congestion, setCongestion] = useState(null)
  const [checklist, setChecklist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hp_departure_checklist')) || buildChecklist()
    } catch { return buildChecklist() }
  })
  const [loading, setLoading] = useState(false)

  // Calculate time until departure
  const departureTime = flightInfo?.departureTime ? new Date(flightInfo.departureTime) : null
  const now = new Date()
  const minutesUntil = departureTime ? Math.floor((departureTime - now) / (1000 * 60)) : null
  const phase = minutesUntil !== null ? getPhase(minutesUntil) : 'early'
  const notifications = getNotifications(phase)

  // Load flight info
  const lookupFlight = useCallback(async (flightNumber, date) => {
    setLoading(true)
    try {
      const info = await fetchFlightStatus(flightNumber, date)
      setFlightInfo(info)
      const saved = { flightNumber, date, savedAt: new Date().toISOString() }
      saveFlight(saved)
      setFlight(saved)

      // Also fetch congestion
      const cong = await getAirportCongestion(info.departureAirport)
      setCongestion(cong)
    } catch (e) {
      console.error('Flight lookup failed:', e)
    }
    setLoading(false)
  }, [])

  // On mount, re-fetch saved flight
  useEffect(() => {
    if (flight?.flightNumber) {
      lookupFlight(flight.flightNumber, flight.date)
    }
  }, [])

  // Save checklist changes
  useEffect(() => {
    localStorage.setItem('hp_departure_checklist', JSON.stringify(checklist))
  }, [checklist])

  const toggleChecklistItem = useCallback((id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }, [])

  const updateChecklistInput = useCallback((id, value) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, inputValue: value } : item))
  }, [])

  const resetFlight = useCallback(() => {
    clearFlight()
    setFlight(null)
    setFlightInfo(null)
    setCongestion(null)
    setChecklist(buildChecklist())
    localStorage.removeItem('hp_departure_checklist')
  }, [])

  const gateWalkTime = flightInfo ? estimateGateWalkTime(flightInfo.departureTerminal, flightInfo.departureGate) : null

  return {
    flight,
    flightInfo,
    congestion,
    loading,
    minutesUntil,
    phase,
    notifications,
    checklist,
    gateWalkTime,
    lookupFlight,
    toggleChecklistItem,
    updateChecklistInput,
    resetFlight,
  }
}
