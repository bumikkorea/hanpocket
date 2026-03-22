import Onigiri from './Onigiri'

const PARTICLES = [
  { size: 6, left: '20%', top: '30%', delay: '0s', color: '#C4725A' },
  { size: 4, left: '70%', top: '20%', delay: '1.2s', color: '#D4956B' },
  { size: 5, left: '40%', top: '60%', delay: '2.4s', color: '#8B6F5C' },
  { size: 3, left: '80%', top: '50%', delay: '0.8s', color: '#B8860B' },
  { size: 4, left: '15%', top: '70%', delay: '3.0s', color: '#2D5A3D' },
  { size: 5, left: '60%', top: '40%', delay: '1.8s', color: '#C4725A' },
]

const LoadingSpinner = () => {
  return (
    <div className="relative flex flex-col items-center justify-center py-20 overflow-hidden">
      {/* 🫧 Floating particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="floating-particle"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: `${4 + i * 0.5}s`,
          }}
        />
      ))}
      <div className="animate-bounce relative z-10">
        <Onigiri mood="loading" size={60} />
      </div>
      <p className="text-xs text-[#999999] mt-3 animate-pulse relative z-10">준비 중...</p>
    </div>
  )
}

export default LoadingSpinner
