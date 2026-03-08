import { useState, useEffect } from 'react'

// 귀여운 한국 여행 캐릭터 — 캐리어 끄는 소녀 (카카오T 스타일 레이아웃)
function TravelCharacter() {
  return (
    <svg viewBox="0 0 280 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[240px]">
      {/* 소녀 캐릭터 */}
      <g transform="translate(60, 10)">
        {/* 머리카락 뒤 */}
        <ellipse cx="70" cy="65" rx="48" ry="50" fill="#2C1810" />
        
        {/* 버킷햇 */}
        <ellipse cx="70" cy="30" rx="52" ry="10" fill="#F5F0EB" />
        <path d="M30 30 Q30 5 70 2 Q110 5 110 30Z" fill="#F5F0EB" />
        <rect x="30" y="26" width="80" height="6" rx="3" fill="#E8E0D8" />
        
        {/* 얼굴 */}
        <ellipse cx="70" cy="65" rx="32" ry="34" fill="#FFE4CC" />
        
        {/* 앞머리 */}
        <path d="M38 42 Q45 30 55 38 Q58 28 70 35 Q82 28 85 38 Q95 30 102 42 Q100 36 95 32 Q85 22 70 25 Q55 22 45 32 Q40 36 38 42Z" fill="#2C1810" />
        
        {/* 눈 — 반짝반짝 */}
        <ellipse cx="56" cy="62" rx="5.5" ry="6" fill="#1A1A1A" />
        <circle cx="54" cy="59" r="2.2" fill="white" />
        <circle cx="59" cy="63" r="1" fill="white" />
        <ellipse cx="84" cy="62" rx="5.5" ry="6" fill="#1A1A1A" />
        <circle cx="82" cy="59" r="2.2" fill="white" />
        <circle cx="87" cy="63" r="1" fill="white" />
        
        {/* 속눈썹 */}
        <path d="M49 55 Q52 52 56 54" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M84 54 Q88 52 91 55" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        
        {/* 볼터치 */}
        <ellipse cx="46" cy="72" rx="7" ry="4.5" fill="#FFB5B5" opacity="0.5" />
        <ellipse cx="94" cy="72" rx="7" ry="4.5" fill="#FFB5B5" opacity="0.5" />
        
        {/* 코 */}
        <circle cx="70" cy="69" r="1.5" fill="#F0C8A0" />
        
        {/* 입 — 활짝 웃는 */}
        <path d="M61 78 Q70 86 79 78" stroke="#E8836B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        
        {/* 귀 */}
        <ellipse cx="36" cy="65" rx="5" ry="7" fill="#FFE4CC" />
        <ellipse cx="104" cy="65" rx="5" ry="7" fill="#FFE4CC" />
        
        {/* 머리카락 양옆 */}
        <path d="M38 45 Q32 55 34 80 Q36 70 40 55Z" fill="#2C1810" />
        <path d="M102 45 Q108 55 106 80 Q104 70 100 55Z" fill="#2C1810" />
        
        {/* 목 */}
        <rect x="60" y="95" width="20" height="12" rx="4" fill="#FFE4CC" />
        
        {/* 오버사이즈 후디 */}
        <path d="M25 107 Q70 100 115 107 L120 220 Q70 226 20 220Z" fill="#F8F8F8" />
        <path d="M25 107 Q70 100 115 107" stroke="#ECECEC" strokeWidth="1.5" fill="none" />
        {/* 후드 칼라 */}
        <path d="M48 107 Q70 115 92 107" stroke="#ECECEC" strokeWidth="2" fill="none" />
        
        {/* 후디 주머니 */}
        <rect x="42" y="165" width="56" height="28" rx="14" fill="none" stroke="#ECECEC" strokeWidth="1.5" />
        
        {/* 후디에 작은 하트 */}
        <path d="M65 140 Q65 135 70 138 Q75 135 75 140 Q75 146 70 150 Q65 146 65 140Z" fill="#FF6B6B" opacity="0.6" />
        
        {/* 팔 — 왼팔 (자연스럽게) */}
        <path d="M25 110 Q8 150 12 190" stroke="#F8F8F8" strokeWidth="22" fill="none" strokeLinecap="round" />
        <path d="M25 110 Q8 150 12 190" stroke="#ECECEC" strokeWidth="1" fill="none" />
        {/* 왼손 */}
        <circle cx="12" cy="192" r="8" fill="#FFE4CC" />
        
        {/* 팔 — 오른팔 (캐리어 손잡이 잡는) */}
        <path d="M115 110 Q132 145 135 175" stroke="#F8F8F8" strokeWidth="22" fill="none" strokeLinecap="round" />
        <path d="M115 110 Q132 145 135 175" stroke="#ECECEC" strokeWidth="1" fill="none" />
        {/* 오른손 */}
        <circle cx="136" cy="177" r="8" fill="#FFE4CC" />
        
        {/* 청바지 */}
        <path d="M35 218 L28 310 L58 310 L62 224Z" fill="#5B8EC9" />
        <path d="M78 224 L82 310 L112 310 L105 218Z" fill="#5B8EC9" />
        {/* 청바지 디테일 */}
        <path d="M45 260 L45 310" stroke="#4A7AB5" strokeWidth="0.8" opacity="0.4" />
        <path d="M95 260 L95 310" stroke="#4A7AB5" strokeWidth="0.8" opacity="0.4" />
        
        {/* 운동화 */}
        <path d="M24 308 Q24 318 42 320 Q58 320 60 312 L58 308Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
        <path d="M80 308 Q80 318 98 320 Q114 320 116 312 L112 308Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
        <circle cx="42" cy="314" r="2" fill="#FF6B6B" />
        <circle cx="98" cy="314" r="2" fill="#FF6B6B" />
      </g>
      
      {/* 캐리어 — 우측 */}
      <g transform="translate(175, 140)">
        {/* 캐리어 손잡이 (텔레스코픽) */}
        <rect x="22" y="-5" width="4" height="50" rx="2" fill="#999" />
        <rect x="44" y="-5" width="4" height="50" rx="2" fill="#999" />
        <rect x="18" y="-8" width="34" height="8" rx="4" fill="#888" />
        
        {/* 캐리어 본체 */}
        <rect x="8" y="45" width="54" height="75" rx="8" fill="#7EC8E3" />
        <rect x="8" y="45" width="54" height="75" rx="8" stroke="#5BB5D5" strokeWidth="1.5" fill="none" />
        
        {/* 캐리어 줄무늬 */}
        <line x1="8" y1="70" x2="62" y2="70" stroke="#5BB5D5" strokeWidth="1" opacity="0.5" />
        <line x1="8" y1="95" x2="62" y2="95" stroke="#5BB5D5" strokeWidth="1" opacity="0.5" />
        
        {/* 캐리어 스티커들 */}
        {/* 태극기 스티커 */}
        <g transform="translate(16, 75)">
          <rect width="18" height="12" rx="2" fill="white" stroke="#E0E0E0" strokeWidth="0.5" />
          <circle cx="9" cy="6" r="3.5" fill="none" />
          <path d="M9 2.5 A3.5 3.5 0 0 1 9 9.5" fill="#C60C30" />
          <path d="M9 2.5 A3.5 3.5 0 0 0 9 9.5" fill="#003478" />
        </g>
        
        {/* 하트 스티커 */}
        <g transform="translate(40, 78)">
          <path d="M5 3 Q5 0 8 2 Q11 0 11 3 Q11 6 8 9 Q5 6 5 3Z" fill="#FF6B6B" />
        </g>
        
        {/* 바퀴 */}
        <circle cx="20" cy="124" r="5" fill="#666" />
        <circle cx="20" cy="124" r="2" fill="#999" />
        <circle cx="50" cy="124" r="5" fill="#666" />
        <circle cx="50" cy="124" r="2" fill="#999" />
      </g>
      
      {/* 발밑 그림자 */}
      <ellipse cx="130" cy="340" rx="90" ry="8" fill="#000" opacity="0.04" />
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
      className={`fixed inset-0 z-[100] flex flex-col transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: '#FAFAFA' }}
      onClick={() => { setFadeOut(true); setTimeout(onFinish, 500) }}
    >
      {/* 상단 텍스트 — 카카오T 스타일 중앙 배치 */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ paddingBottom: '15vh' }}>
        <p className="text-xs tracking-[0.25em] font-normal mb-3" style={{ color: '#999', fontFamily: 'Inter, sans-serif' }}>
          입국부터 출국까지
        </p>
        <div className="w-6 h-px mx-auto mb-3" style={{ backgroundColor: '#DDD' }} />
        <h1 className="text-2xl font-semibold tracking-[0.12em]" style={{ color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}>
          HANPOCKET
        </h1>
      </div>

      {/* 하단 우측 캐릭터 — 카카오T 스타일 */}
      <div className="absolute bottom-8 right-4" style={{ width: '65%', maxWidth: 280 }}>
        <TravelCharacter />
      </div>
    </div>
  )
}
