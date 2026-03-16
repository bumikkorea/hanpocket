import { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1600)
    const finish = setTimeout(() => onFinish(), 2000)
    return () => { clearTimeout(timer); clearTimeout(finish) }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: '#C4715A' }}
      onClick={() => { setFadeOut(true); setTimeout(onFinish, 500) }}
    >
      {/* NEAR 로고 */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-7xl font-black tracking-tight" style={{ color: '#ffffff', fontFamily: "'Caveat', cursive", letterSpacing: -2 }}>
          NEAR
        </h1>
      </div>
    </div>
  )
}
