import { useEffect, useRef, useState } from 'react'
import { X, Car, Copy, Phone, Check } from 'lucide-react'
import { t, tLang } from '../locales/index.js'

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
  const base = 4800 + distKm * 2000
  const lo = Math.round(base * 0.85 / 100) * 100
  const hi = Math.round(base * 1.15 / 100) * 100
  const mins = Math.round(distKm * 3 + 5)
  return { lo, hi, mins, distKm }
}

export default function TaxiCardView({ poi, lang, onClose, userPos }) {
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
      background: '#1A1A1A',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* ─── 헤더 ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 20px 16px',
        flexShrink: 0,
      }}>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={18} color="white" />
        </button>

        {/* 출租车模式 배지 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--primary)',
          color: 'white', padding: '6px 14px',
          borderRadius: 'var(--radius-pill)',
          fontSize: 13, fontWeight: 600,
        }}>
          <Car size={14} />
          出租车模式
        </div>
      </div>

      {/* ─── 메인 콘텐츠 (스크롤 가능) ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 힌트 라벨 */}
        <div style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>
          请把这个给司机看
        </div>

        {/* ─── 중앙 카드 ─── */}
        <div style={{
          position: 'relative',
          background: 'white', borderRadius: 20,
          padding: '32px 24px',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          {/* 상단 accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: 24, right: 24, height: 4,
            background: 'var(--primary)',
            borderRadius: '0 0 4px 4px',
          }} />

          {/* 目的地 라벨 */}
          <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: 12 }}>
            目的地
          </div>

          {/* 한국어 주소 */}
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px', lineHeight: 1.4 }}>
            {addressKo || <span style={{ color: 'var(--text-hint)' }}>주소 정보 없음</span>}
          </div>

          {/* 중국어 매장명 */}
          {nameZh && (
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>{nameZh}</div>
          )}
          {addressZh && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{addressZh}</div>
          )}

          {/* 구분선 */}
          <div style={{ width: 40, height: 2, background: 'var(--border)', margin: '16px auto' }} />

          {/* 예상 요금 */}
          {fare ? (
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>预计费用</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                약 ₩{fare.lo.toLocaleString()} ~ ₩{fare.hi.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                约 ¥{Math.round(fare.lo / 190)} ~ ¥{Math.round(fare.hi / 190)} · 约{fare.mins}分钟
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tLang('taxi_no_location', lang)}</div>
          )}
        </div>
      </div>

      {/* ─── 하단 버튼 ─── */}
      <div style={{ display: 'flex', gap: 10, padding: '24px 28px', flexShrink: 0 }}>
        <button
          onClick={handleCopy}
          className="btn btn-glass"
          style={{ flex: 1 }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? tLang('taxi_copied', lang) : tLang('taxi_copy', lang)}
        </button>
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <Phone size={16} />
            {tLang('taxi_call', lang)}
          </a>
        ) : (
          <button
            disabled
            className="btn btn-outline"
            style={{ flex: 1, opacity: 0.4, cursor: 'not-allowed' }}
          >
            <Phone size={16} />
            {tLang('taxi_call', lang)}
          </button>
        )}
      </div>

      {/* ─── 화면 상태 ─── */}
      <div style={{ textAlign: 'center', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: '#34C759',
            animation: 'pulse-dot 2s infinite',
          }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>屏幕常亮中</span>
        </div>
      </div>
    </div>
  )
}
