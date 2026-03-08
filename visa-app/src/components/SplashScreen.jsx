import { useState, useEffect } from 'react'

// 조선 왕/왕비 SVG 일러스트 (인천공항 벽화 스타일)
function RoyalCouple() {
  return (
    <svg viewBox="0 0 400 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[320px]">
      {/* 왕 (King) - 왼쪽 */}
      <g transform="translate(60, 20)">
        {/* 익선관 (모자) */}
        <ellipse cx="70" cy="28" rx="38" ry="12" fill="#1A1A1A" />
        <rect x="42" y="16" width="56" height="14" rx="4" fill="#1A1A1A" />
        <rect x="62" y="0" width="16" height="20" rx="3" fill="#1A1A1A" />
        {/* 뒤 날개 */}
        <path d="M38 24 Q20 18 12 28 Q8 34 18 32 Q28 30 38 28Z" fill="#333" />
        <path d="M102 24 Q120 18 128 28 Q132 34 122 32 Q112 30 102 28Z" fill="#333" />
        
        {/* 얼굴 */}
        <ellipse cx="70" cy="55" rx="28" ry="30" fill="#FFDCB5" />
        {/* 눈 */}
        <ellipse cx="60" cy="52" rx="4" ry="3" fill="#1A1A1A" />
        <ellipse cx="80" cy="52" rx="4" ry="3" fill="#1A1A1A" />
        {/* 눈썹 */}
        <path d="M54 46 Q60 43 66 46" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
        <path d="M74 46 Q80 43 86 46" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
        {/* 코 */}
        <ellipse cx="70" cy="58" rx="3" ry="2" fill="#F0C8A0" />
        {/* 입 - 미소 */}
        <path d="M62 66 Q70 72 78 66" stroke="#D4605A" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* 볼터치 */}
        <circle cx="54" cy="62" r="5" fill="#FFB5B5" opacity="0.4" />
        <circle cx="86" cy="62" r="5" fill="#FFB5B5" opacity="0.4" />
        
        {/* 곤룡포 (빨간 용포) */}
        <path d="M30 85 Q70 78 110 85 L118 240 Q70 248 22 240Z" fill="#C0392B" />
        {/* 용포 금색 테두리 */}
        <path d="M30 85 Q70 78 110 85" stroke="#DAA520" strokeWidth="3" fill="none" />
        {/* 가슴 보(龍 문양) */}
        <rect x="50" y="100" width="40" height="36" rx="4" fill="#DAA520" />
        <text x="70" y="124" textAnchor="middle" fill="#C0392B" fontSize="20" fontWeight="bold">龍</text>
        {/* 허리띠 */}
        <rect x="28" y="155" width="84" height="8" rx="2" fill="#DAA520" />
        <circle cx="70" cy="159" r="6" fill="#8B0000" stroke="#DAA520" strokeWidth="1.5" />
        {/* 소매 */}
        <path d="M30 85 Q10 120 15 160 L35 155 Q32 120 38 92Z" fill="#C0392B" />
        <path d="M110 85 Q130 120 125 160 L105 155 Q108 120 102 92Z" fill="#C0392B" />
        {/* 소매 끝 금색 */}
        <path d="M15 155 L35 150" stroke="#DAA520" strokeWidth="4" />
        <path d="M125 155 L105 150" stroke="#DAA520" strokeWidth="4" />
        {/* 손 */}
        <ellipse cx="17" cy="163" rx="8" ry="6" fill="#FFDCB5" />
        <ellipse cx="123" cy="163" rx="8" ry="6" fill="#FFDCB5" />
        {/* 하의 */}
        <path d="M35 240 L25 340 L55 340 L60 248Z" fill="#1A6B3C" />
        <path d="M80 248 L85 340 L115 340 L105 240Z" fill="#1A6B3C" />
        {/* 신발 */}
        <ellipse cx="40" cy="342" rx="18" ry="6" fill="#1A1A1A" />
        <ellipse cx="100" cy="342" rx="18" ry="6" fill="#1A1A1A" />
      </g>

      {/* 왕비 (Queen) - 오른쪽 */}
      <g transform="translate(210, 20)">
        {/* 족두리/가체 (머리) */}
        <ellipse cx="70" cy="15" rx="30" ry="14" fill="#1A1A1A" />
        <ellipse cx="70" cy="28" rx="34" ry="8" fill="#1A1A1A" />
        {/* 비녀 */}
        <rect x="36" y="10" width="68" height="4" rx="2" fill="#DAA520" />
        <circle cx="36" cy="12" r="5" fill="#E74C3C" />
        <circle cx="104" cy="12" r="5" fill="#2ECC71" />
        {/* 떨잠 장식 */}
        <circle cx="56" cy="6" r="4" fill="#DAA520" />
        <circle cx="84" cy="6" r="4" fill="#DAA520" />
        <circle cx="70" cy="2" r="4" fill="#E74C3C" />
        
        {/* 얼굴 */}
        <ellipse cx="70" cy="52" rx="26" ry="28" fill="#FFDCB5" />
        {/* 머리카락 양쪽 */}
        <path d="M44 38 Q38 42 40 55 Q42 48 46 42Z" fill="#1A1A1A" />
        <path d="M96 38 Q102 42 100 55 Q98 48 94 42Z" fill="#1A1A1A" />
        {/* 눈 */}
        <ellipse cx="60" cy="49" rx="3.5" ry="3" fill="#1A1A1A" />
        <ellipse cx="80" cy="49" rx="3.5" ry="3" fill="#1A1A1A" />
        {/* 속눈썹 */}
        <path d="M55 44 Q60 41 65 44" stroke="#1A1A1A" strokeWidth="1.2" fill="none" />
        <path d="M75 44 Q80 41 85 44" stroke="#1A1A1A" strokeWidth="1.2" fill="none" />
        {/* 코 */}
        <ellipse cx="70" cy="55" rx="2.5" ry="2" fill="#F0C8A0" />
        {/* 입 - 앵두입술 */}
        <ellipse cx="70" cy="63" rx="5" ry="3" fill="#D4605A" />
        {/* 볼터치 */}
        <circle cx="52" cy="58" r="5" fill="#FFB5B5" opacity="0.5" />
        <circle cx="88" cy="58" r="5" fill="#FFB5B5" opacity="0.5" />
        {/* 연지 (이마) */}
        <circle cx="70" cy="38" r="2.5" fill="#D4605A" opacity="0.6" />
        
        {/* 활옷/원삼 (녹색 예복) */}
        <path d="M28 82 Q70 75 112 82 L120 245 Q70 252 20 245Z" fill="#1A6B3C" />
        {/* 금색 테두리 */}
        <path d="M28 82 Q70 75 112 82" stroke="#DAA520" strokeWidth="3" fill="none" />
        {/* 흉배 */}
        <rect x="48" y="96" width="44" height="38" rx="4" fill="#DAA520" />
        <text x="70" y="120" textAnchor="middle" fill="#1A6B3C" fontSize="18" fontWeight="bold">鳳</text>
        {/* 색동 소매 */}
        <path d="M28 82 Q8 115 10 165 L32 158 Q28 118 35 90Z" fill="#E74C3C" />
        <path d="M10 130 L32 126" stroke="#DAA520" strokeWidth="2" />
        <path d="M10 140 L32 136" stroke="#3498DB" strokeWidth="2" />
        <path d="M10 150 L32 146" stroke="#DAA520" strokeWidth="2" />
        <path d="M112 82 Q132 115 130 165 L108 158 Q112 118 105 90Z" fill="#3498DB" />
        <path d="M130 130 L108 126" stroke="#DAA520" strokeWidth="2" />
        <path d="M130 140 L108 136" stroke="#E74C3C" strokeWidth="2" />
        <path d="M130 150 L108 146" stroke="#DAA520" strokeWidth="2" />
        {/* 대대 (허리띠) */}
        <rect x="26" y="155" width="88" height="8" rx="2" fill="#E74C3C" />
        <path d="M70 163 L60 200 L70 195 L80 200Z" fill="#E74C3C" />
        {/* 손 */}
        <ellipse cx="12" cy="168" rx="7" ry="6" fill="#FFDCB5" />
        <ellipse cx="128" cy="168" rx="7" ry="6" fill="#FFDCB5" />
        {/* 치마 */}
        <path d="M20 245 Q70 255 120 245 L130 340 Q70 350 10 340Z" fill="#DAA520" />
        <path d="M20 245 Q70 255 120 245" stroke="#C0392B" strokeWidth="2" />
        {/* 신발 */}
        <ellipse cx="45" cy="342" rx="16" ry="5" fill="#E74C3C" />
        <ellipse cx="95" cy="342" rx="16" ry="5" fill="#E74C3C" />
      </g>
    </svg>
  )
}

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2500)
    const finish = setTimeout(() => onFinish(), 3200)
    return () => { clearTimeout(timer); clearTimeout(finish) }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: '#E8F5E9' }}
      onClick={() => { setFadeOut(true); setTimeout(onFinish, 500) }}
    >
      {/* 상단 슬로건 */}
      <div className="text-center mb-2">
        <p className="text-sm tracking-[0.3em] font-medium" style={{ color: '#2D5A3D', fontFamily: 'Inter, sans-serif' }}>
          입국부터 출국까지
        </p>
        <div className="w-8 h-px mx-auto my-3" style={{ backgroundColor: '#2D5A3D' }} />
        <h1 className="text-3xl font-bold tracking-[0.15em]" style={{ color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}>
          HANPOCKET
        </h1>
      </div>

      {/* 왕/왕비 일러스트 */}
      <div className="mt-8 px-8">
        <RoyalCouple />
      </div>
    </div>
  )
}
