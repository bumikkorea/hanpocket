import { useState, useEffect, useRef } from 'react'

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false)
  const [activeLang, setActiveLang] = useState('ko') // 'ko' → 'cn'
  const canvasRef = useRef(null)

  // 1초 뒤 중국어로 교체, 2초 뒤 종료
  useEffect(() => {
    const t1 = setTimeout(() => setActiveLang('cn'), 1000)
    const t2 = setTimeout(() => setFadeOut(true), 2000)
    const t3 = setTimeout(() => onFinish(), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  // Three.js 지구본 (0.013 투명도 와이어프레임)
  useEffect(() => {
    const el = canvasRef.current
    if (!el || !window.THREE) return
    const THREE = window.THREE
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(600, 600)
    el.appendChild(renderer.domElement)

    const geometry = new THREE.SphereGeometry(2, 40, 40)
    const material = new THREE.MeshPhongMaterial({
      color: 0x000000, wireframe: true, transparent: true, opacity: 0.013,
    })
    const globe = new THREE.Mesh(geometry, material)
    scene.add(globe)
    scene.add(new THREE.AmbientLight(0xffffff, 1.0))
    camera.position.z = 4

    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)
      globe.rotation.y += 0.005
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      renderer.dispose()
      el.innerHTML = ''
    }
  }, [])

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
      {/* 지구본 배경 */}
      <div
        ref={canvasRef}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', zIndex: -1,
        }}
      />

      {/* 콘텐츠 */}
      <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 로고 */}
        <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: -4, marginBottom: 24, color: '#000000' }}>
          NEAR
        </div>

        {/* 슬로건 교차 */}
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

        {/* 영문 캡션 */}
        <div style={{ fontSize: 13, fontWeight: 300, color: '#999', letterSpacing: '0.5px', opacity: 0.8 }}>
          Your premium Korea destination concierge.
        </div>
      </div>
    </div>
  )
}
