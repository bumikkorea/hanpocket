import { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false)
  const [activeLang, setActiveLang] = useState('ko')

  useEffect(() => {
    const t1 = setTimeout(() => setActiveLang('cn'), 1000)
    const t2 = setTimeout(() => setFadeOut(true), 2000)
    const t3 = setTimeout(() => onFinish(), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: '#FFFFFF',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: fadeOut ? 'none' : 'auto',
        fontFamily: "'Noto Sans', sans-serif",
      }}
      onClick={() => { setFadeOut(true); setTimeout(onFinish, 500) }}
    >
      <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: -4, marginBottom: 24, color: '#000000', fontFamily: "'Montserrat', sans-serif" }}>
          NEAR
        </div>

        <div style={{ height: 30, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 12 }}>
          <div style={{
            position: 'absolute', fontSize: 16, fontWeight: 400, color: '#444',
            opacity: activeLang === 'ko' ? 1 : 0,
            transform: activeLang === 'ko' ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.4s ease-in-out', whiteSpace: 'nowrap',
          }}>
            당신의 가장 한국다운 순간을 위하여
          </div>
          <div style={{
            position: 'absolute', fontSize: 16, fontWeight: 400, color: '#444',
            opacity: activeLang === 'cn' ? 1 : 0,
            transform: activeLang === 'cn' ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.4s ease-in-out', whiteSpace: 'nowrap',
          }}>
            您的韩国高端服务管家。
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 300, color: '#999', letterSpacing: '0.5px', opacity: 0.8 }}>
          Your premium Korea destination concierge.
        </div>
      </div>
    </div>
  )
}
