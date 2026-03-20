import { useEffect, useRef, useState } from 'react'
import { t } from '../locales/index.js'

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY

// 직선거리 기반 예상 요금 계산
function estimateFare(userPos, poi) {
  if (!userPos || !poi.lat || !poi.lng) return null
  const R = 6371
  const dLat = (poi.lat - userPos.lat) * Math.PI / 180
  const dLng = (poi.lng - userPos.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(userPos.lat * Math.PI / 180) * Math.cos(poi.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  // 기본요금 4,800원 + 거리 × 2,000원/km, 범위 ±30%
  const base = 4800 + distKm * 2000
  const lo = Math.round(base * 0.85 / 100) * 100
  const hi = Math.round(base * 1.15 / 100) * 100
  const mins = Math.round(distKm * 3 + 5) // 시내 평균 속도 20km/h 환산
  return { lo, hi, mins, distKm }
}

// 미니맵 컴포넌트
function MiniMap({ poi }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!poi?.lat || !poi?.lng) return

    const init = () => {
      if (!containerRef.current || !window.kakao?.maps) return
      const center = new window.kakao.maps.LatLng(poi.lat, poi.lng)
      const map = new window.kakao.maps.Map(containerRef.current, {
        center,
        level: 3,
        draggable: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
      })
      mapRef.current = map
      // 목적지 마커
      new window.kakao.maps.Marker({ position: center, map })
    }

    if (window.kakao?.maps) {
      init()
    } else {
      const script = document.createElement('script')
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`
      script.onload = () => window.kakao.maps.load(init)
      document.head.appendChild(script)
    }
  }, [poi])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#F3F4F6',
      }}
    />
  )
}

export default function TaxiCardView({ poi, bilingual, onClose, userPos }) {
  const [copied, setCopied] = useState(false)
  const wakeLockRef = useRef(null)
  const fare = estimateFare(userPos, poi)

  // Wake Lock — 화면 자동 꺼짐 방지
  useEffect(() => {
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen')
        .then(lock => { wakeLockRef.current = lock })
        .catch(() => {})
    }
    return () => {
      wakeLockRef.current?.release().catch(() => {})
    }
  }, [])

  const addressKo = poi.address_ko || ''
  const addressZh = poi.address_zh || ''
  const nameZh = poi.name_zh || poi.name_ko || ''
  const phone = poi._raw?.phone || poi.phone || ''

  const handleCopy = () => {
    navigator.clipboard.writeText(addressKo).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'white',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 16px 10px',
        borderBottom: '1px solid #F3F4F6',
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 700, color: '#C4725A',
            display: 'flex', alignItems: 'center', gap: 4,
            padding: 0,
          }}
        >
          ← {t('taxi_back', bilingual)}
        </button>
      </div>

      <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 미니맵 */}
        <MiniMap poi={poi} />

        {/* 목적지 정보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {t('taxi_dest', bilingual)}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.25 }}>
            {addressKo || <span style={{ color: '#9CA3AF' }}>주소 정보 없음</span>}
          </div>
          {addressZh && (
            <div style={{ fontSize: 16, color: '#888888', marginTop: 2 }}>{addressZh}</div>
          )}
          {nameZh && (
            <div style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginTop: 4 }}>{nameZh}</div>
          )}
        </div>

        {/* 구분선 */}
        <div style={{ height: 1, background: '#F3F4F6' }} />

        {/* 예상 요금 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 6 }}>
            {t('taxi_est_fare', bilingual)}
          </div>
          {fare ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>
                약 ₩{fare.lo.toLocaleString()} ~ ₩{fare.hi.toLocaleString()}
              </div>
              <div style={{ fontSize: 14, color: '#888888' }}>
                约 ¥{Math.round(fare.lo / 190)} ~ ¥{Math.round(fare.hi / 190)}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                约{fare.mins}分钟 · {fare.distKm.toFixed(1)}km
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, color: '#9CA3AF' }}>{t('taxi_no_location', bilingual)}</div>
          )}
        </div>

        {/* 구분선 */}
        <div style={{ height: 1, background: '#F3F4F6' }} />

        {/* 기사님 안내 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>
            {t('taxi_guide', bilingual)}
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>
            {t('taxi_show_driver', bilingual)}
          </div>
        </div>

        {/* 기사용 박스 — 핵심 */}
        <div style={{
          background: '#FFF8E1',
          border: '2px solid #F9A825',
          borderRadius: 12,
          padding: '20px 16px',
          display: 'flex', flexDirection: 'column', gap: 8,
          boxShadow: '0 2px 8px rgba(249,168,37,0.15)',
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A' }}>
            이곳으로 가주세요
          </div>
          <div style={{ fontSize: 20, color: '#374151', fontWeight: 500, lineHeight: 1.4 }}>
            {addressKo}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1, height: 48, borderRadius: 12,
              background: copied ? '#1A1A1A' : 'white',
              color: copied ? 'white' : '#374151',
              border: '1px solid #E5E7EB',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? t('taxi_copied', bilingual) : `📋 ${t('taxi_copy', bilingual)}`}
          </button>
          {phone ? (
            <a
              href={`tel:${phone}`}
              style={{
                flex: 1, height: 48, borderRadius: 12,
                background: '#F9A825', color: 'white',
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              📞 {t('taxi_call', bilingual)}
            </a>
          ) : (
            <button
              disabled
              style={{
                flex: 1, height: 48, borderRadius: 12,
                background: '#F3F4F6', color: '#D1D5DB',
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'not-allowed',
              }}
            >
              📞 {t('taxi_call', bilingual)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
