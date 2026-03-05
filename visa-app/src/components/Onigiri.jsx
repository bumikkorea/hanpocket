// 삼각김밥 캐릭터 — 다양한 표정
// mood: 'happy' | 'loading' | 'error' | 'celebrate' | 'sos' | 'sleep'
export default function Onigiri({ mood = 'happy', size = 80 }) {
  const faces = {
    happy: { eyes: 'dots', mouth: 'smile' },
    loading: { eyes: 'dots', mouth: 'open' },
    error: { eyes: 'sweat', mouth: 'sad' },
    celebrate: { eyes: 'sparkle', mouth: 'big-smile' },
    sos: { eyes: 'cry', mouth: 'worry' },
    sleep: { eyes: 'closed', mouth: 'zzz' },
  }
  const face = faces[mood] || faces.happy

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* 밥 몸체 (삼각형, 둥근 모서리) */}
      <path d="M50 12 L88 78 Q88 88 78 88 L22 88 Q12 88 12 78 Z" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>

      {/* 김 (하단 반) */}
      <path d="M22 55 L78 55 L88 78 Q88 88 78 88 L22 88 Q12 88 12 78 Z" fill="#1A1A1A"/>

      {/* 눈 */}
      {face.eyes === 'dots' && (
        <>
          <circle cx="38" cy="48" r="3" fill="#1A1A1A"/>
          <circle cx="62" cy="48" r="3" fill="#1A1A1A"/>
        </>
      )}
      {face.eyes === 'sparkle' && (
        <>
          <text x="34" y="52" fontSize="12" textAnchor="middle">&#10024;</text>
          <text x="66" y="52" fontSize="12" textAnchor="middle">&#10024;</text>
        </>
      )}
      {face.eyes === 'cry' && (
        <>
          <circle cx="38" cy="46" r="3" fill="#1A1A1A"/>
          <circle cx="62" cy="46" r="3" fill="#1A1A1A"/>
          <path d="M35 50 Q33 56 36 58" stroke="#60A5FA" strokeWidth="1.5" fill="none"/>
          <path d="M65 50 Q67 56 64 58" stroke="#60A5FA" strokeWidth="1.5" fill="none"/>
        </>
      )}
      {face.eyes === 'closed' && (
        <>
          <path d="M34 48 Q38 44 42 48" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M58 48 Q62 44 66 48" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </>
      )}
      {face.eyes === 'sweat' && (
        <>
          <circle cx="38" cy="46" r="3" fill="#1A1A1A"/>
          <circle cx="62" cy="46" r="3" fill="#1A1A1A"/>
          <circle cx="75" cy="38" r="4" fill="#60A5FA" opacity="0.6"/>
        </>
      )}

      {/* 입 */}
      {face.mouth === 'smile' && (
        <path d="M44 58 Q50 64 56 58" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      )}
      {face.mouth === 'big-smile' && (
        <path d="M40 56 Q50 68 60 56" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      )}
      {face.mouth === 'sad' && (
        <path d="M44 62 Q50 56 56 62" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      )}
      {face.mouth === 'open' && (
        <ellipse cx="50" cy="60" rx="4" ry="5" fill="#1A1A1A"/>
      )}
      {face.mouth === 'worry' && (
        <path d="M44 60 L56 60" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
      )}
      {face.mouth === 'zzz' && (
        <text x="68" y="36" fontSize="10" fill="#9CA3AF" fontWeight="bold">z</text>
      )}

      {/* 볼터치 */}
      {(mood === 'happy' || mood === 'celebrate') && (
        <>
          <circle cx="30" cy="54" r="5" fill="#FFB7B7" opacity="0.4"/>
          <circle cx="70" cy="54" r="5" fill="#FFB7B7" opacity="0.4"/>
        </>
      )}
    </svg>
  )
}
