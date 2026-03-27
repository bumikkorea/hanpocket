import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

const screens = [
  {
    title: { ko: '발견하기', zh: '发现身边的好店', en: 'Discover' },
    description: { ko: '주변 최고의 매장들을 발견하세요', zh: '探索身边最好的商店', en: 'Find the best shops nearby' },
    background: 'linear-gradient(135deg, #3182F6, #6BA8F8)',
    emoji: '🔍'
  },
  {
    title: { ko: '예약하기', zh: '3步完成预约', en: 'Book' },
    description: { ko: '간단하게 예약을 완료하세요', zh: '仅需3步完成预约', en: 'Complete booking in 3 steps' },
    background: 'linear-gradient(135deg, #2080F0, #1677FF)',
    emoji: '📅'
  },
  {
    title: { ko: '택시 모드', zh: '出租车模式直达', en: 'Taxi Mode' },
    description: { ko: '택시 기사에게 주소를 쉽게 알려주세요', zh: '轻松告诉司机目的地', en: 'Show address to taxi driver easily' },
    background: 'linear-gradient(135deg, #15CC65, #07C160)',
    emoji: '🚖'
  }
]

export default function OnboardingFlow({ onComplete }) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const screen = screens[currentScreen]
  const isLast = currentScreen === screens.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      setCurrentScreen(currentScreen + 1)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* 상단 60% - 비주얼 영역 */}
      <div
        className="flex-[3] flex flex-col items-center justify-center text-white relative overflow-hidden"
        style={{ background: screen.background }}
      >
        <div className="text-7xl mb-6">{screen.emoji}</div>
        <h1 className="text-3xl font-bold text-center px-6">{L(screen.title)}</h1>
      </div>

      {/* 하단 40% - 컨텐츠 영역 */}
      <div
        className="flex-[2] bg-white rounded-t-[28px] flex flex-col px-6 py-8"
        style={{
          boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* 설명 */}
        <p className="text-center text-base text-[var(--text-secondary)] leading-relaxed">
          {L(screen.description)}
        </p>

        {/* 닷 인디케이터 */}
        <div className="flex justify-center gap-2 mt-8">
          {screens.map((_, index) => (
            <div
              key={index}
              className="transition-all"
              style={{
                width: index === currentScreen ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor:
                  index === currentScreen ? 'var(--primary)' : 'var(--border)'
              }}
            />
          ))}
        </div>

        {/* CTA 버튼 */}
        <div className="flex-1 flex flex-col justify-end gap-3">
          <button
            onClick={handleNext}
            className="w-full h-13 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius-btn)] transition-all hover:-translate-y-0.5 active:scale-95"
          >
            {isLast ? L({ ko: '시작하기', zh: '开始探索首尔', en: 'Start Exploring' }) : L({ ko: '다음', zh: '下一步', en: 'Next' })}
          </button>

          <button
            onClick={onComplete}
            className="text-sm text-[var(--text-muted)]"
          >
            {L({ ko: '건너뛰기', zh: '跳过', en: 'Skip' })}
          </button>
        </div>
      </div>
    </div>
  )
}
