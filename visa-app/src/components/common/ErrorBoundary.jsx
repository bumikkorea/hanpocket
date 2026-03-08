import { Component } from 'react'

function CryingCharacter() {
  return (
    <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[180px]">
      <g transform="translate(40, 10)">
        {/* 머리카락 뒤 */}
        <ellipse cx="60" cy="55" rx="42" ry="44" fill="#2C1810" />
        
        {/* 버킷햇 — 살짝 기울어짐 */}
        <g transform="rotate(-5, 60, 25)">
          <ellipse cx="60" cy="25" rx="46" ry="9" fill="#F5F0EB" />
          <path d="M22 25 Q22 3 60 0 Q98 3 98 25Z" fill="#F5F0EB" />
          <rect x="22" y="22" width="76" height="5" rx="2.5" fill="#E8E0D8" />
        </g>
        
        {/* 얼굴 */}
        <ellipse cx="60" cy="55" rx="28" ry="30" fill="#FFE4CC" />
        
        {/* 앞머리 */}
        <path d="M32 38 Q38 26 48 34 Q50 24 60 30 Q70 24 72 34 Q82 26 88 38 Q86 32 82 28 Q74 20 60 22 Q46 20 38 28 Q34 32 32 38Z" fill="#2C1810" />
        
        {/* 눈 — 울고 있는 >< 모양 */}
        <path d="M42 52 L50 56 L42 60" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M78 52 L70 56 L78 60" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* 눈물 왼쪽 */}
        <path d="M44 62 Q42 72 44 80" stroke="#7EC8E3" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7">
          <animate attributeName="d" values="M44 62 Q42 72 44 80;M44 62 Q46 72 44 82;M44 62 Q42 72 44 80" dur="1.5s" repeatCount="indefinite" />
        </path>
        <circle cx="44" cy="82" r="3" fill="#7EC8E3" opacity="0.5">
          <animate attributeName="cy" values="82;90;82" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        
        {/* 눈물 오른쪽 */}
        <path d="M76 62 Q78 72 76 80" stroke="#7EC8E3" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7">
          <animate attributeName="d" values="M76 62 Q78 72 76 80;M76 62 Q74 72 76 82;M76 62 Q78 72 76 80" dur="1.8s" repeatCount="indefinite" />
        </path>
        <circle cx="76" cy="82" r="3" fill="#7EC8E3" opacity="0.5">
          <animate attributeName="cy" values="82;90;82" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
        </circle>
        
        {/* 볼터치 — 더 붉게 */}
        <ellipse cx="38" cy="64" rx="7" ry="4" fill="#FFB5B5" opacity="0.6" />
        <ellipse cx="82" cy="64" rx="7" ry="4" fill="#FFB5B5" opacity="0.6" />
        
        {/* 코 */}
        <circle cx="60" cy="60" r="1.5" fill="#F0C8A0" />
        
        {/* 입 — 울상 ㅠㅠ */}
        <path d="M50 72 Q60 66 70 72" stroke="#E8836B" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* 귀 */}
        <ellipse cx="30" cy="55" rx="4" ry="6" fill="#FFE4CC" />
        <ellipse cx="90" cy="55" rx="4" ry="6" fill="#FFE4CC" />
        
        {/* 머리카락 양옆 */}
        <path d="M32 40 Q26 48 28 70 Q30 60 34 48Z" fill="#2C1810" />
        <path d="M88 40 Q94 48 92 70 Q90 60 86 48Z" fill="#2C1810" />
        
        {/* 목 */}
        <rect x="50" y="82" width="20" height="10" rx="4" fill="#FFE4CC" />
        
        {/* 오버사이즈 후디 */}
        <path d="M18 92 Q60 86 102 92 L106 190 Q60 196 14 190Z" fill="#F8F8F8" />
        <path d="M18 92 Q60 86 102 92" stroke="#ECECEC" strokeWidth="1.5" fill="none" />
        <path d="M40 92 Q60 100 80 92" stroke="#ECECEC" strokeWidth="2" fill="none" />
        
        {/* 후디 주머니 */}
        <rect x="34" y="145" width="52" height="24" rx="12" fill="none" stroke="#ECECEC" strokeWidth="1.5" />
        
        {/* 후디에 깨진 하트 */}
        <path d="M55 120 Q55 115 60 118 Q65 115 65 120 Q65 126 60 130 Q55 126 55 120Z" fill="#FF6B6B" opacity="0.4" />
        <path d="M59 118 L61 130" stroke="#F8F8F8" strokeWidth="1.5" />
        
        {/* 팔 — 양쪽 다 아래로 축 늘어짐 */}
        <path d="M18 96 Q4 130 10 165" stroke="#F8F8F8" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d="M18 96 Q4 130 10 165" stroke="#ECECEC" strokeWidth="1" fill="none" />
        <circle cx="10" cy="167" r="7" fill="#FFE4CC" />
        
        <path d="M102 96 Q116 130 110 165" stroke="#F8F8F8" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d="M102 96 Q116 130 110 165" stroke="#ECECEC" strokeWidth="1" fill="none" />
        <circle cx="110" cy="167" r="7" fill="#FFE4CC" />
        
        {/* 청바지 */}
        <path d="M28 188 L22 260 L48 260 L52 194Z" fill="#5B8EC9" />
        <path d="M68 194 L72 260 L98 260 L92 188Z" fill="#5B8EC9" />
        
        {/* 운동화 */}
        <path d="M18 258 Q18 268 34 270 Q50 270 52 262 L48 258Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
        <path d="M70 258 Q70 268 86 270 Q102 270 104 262 L98 258Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
      </g>
    </svg>
  )
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, showDetails: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-white">
          <div className="flex-1" />
          
          {/* 메시지 영역 — 화면 중앙 */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <span className="text-xl font-black tracking-tighter text-[#111827]">HANPOCKET</span>
            </div>

            <h2 className="text-lg font-semibold text-[#111827] mb-1">
              사용자가 몰리고 있어요..
            </h2>
            <p className="text-sm text-gray-400 mb-1">用户太多啦..</p>
            <p className="text-sm text-gray-400 mb-6">Too many visitors..</p>

            <p className="text-sm text-[#6B7280] mb-6">
              조금만 기다려주세요 🙏<br/>
              <span className="text-xs text-gray-400">请稍等一下 / Please wait a moment</span>
            </p>

            <button
              onClick={() => window.location.reload()}
              className="bg-[#111827] text-white px-6 py-3 rounded-[6px] text-sm font-medium active:scale-[0.97] transition-transform mb-3"
            >
              새로고침 / 刷新 / Refresh
            </button>

            <button
              onClick={() => this.setState({ showDetails: !this.state.showDetails })}
              className="text-[10px] text-gray-300 underline"
            >
              {this.state.showDetails ? '접기' : 'details'}
            </button>
            {this.state.showDetails && this.state.error && (
              <pre className="mt-3 p-3 bg-gray-50 rounded-[6px] text-[10px] text-gray-400 max-w-full overflow-x-auto max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </pre>
            )}
          </div>

          {/* 캐릭터 — 화면 하단 중앙 */}
          <div className="mt-8 mb-4">
            <CryingCharacter />
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
