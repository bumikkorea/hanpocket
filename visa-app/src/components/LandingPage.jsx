import { useState, useEffect } from 'react'

export default function LandingPage({ onEnter }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    // 600ms 후 자동으로 로그인 화면으로 전환 (fade out 300ms 포함하면 총 ~900ms)
    setTimeout(() => {
      setExiting(true)
      setTimeout(() => onEnter(), 300)
    }, 600)
  }, [])
  
  const handleEnter = () => {
    setExiting(true)
    setTimeout(() => onEnter(), 400)
  }
  
  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center"
      style={{
        background: '#3182F6',
        transition: 'opacity 0.3s ease',
        opacity: exiting ? 0 : 1,
      }}
    >
      {/* NEAR 로고 */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: "'Caveat', cursive",
          fontSize: 80,
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: -2,
          transition: 'opacity 0.3s ease',
          opacity: exiting ? 0 : 1,
        }}
      >
        NEAR
      </div>
      
    </div>
  )
}
