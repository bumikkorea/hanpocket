import { useState, useEffect } from 'react'
import { Trophy, Star, ArrowRight, RotateCcw } from 'lucide-react'
import { xpToLevel, levelXpRange } from './gameData'

function L(lang, obj) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj[lang] || obj.zh || obj.en || obj.ko || ''
}

export default function ResultScreen({ lang, correctCount, totalCount, earnedXp, totalXp, oldLevel, onNext, onBack }) {
  const [animatedPercent, setAnimatedPercent] = useState(0)
  const [animatedXp, setAnimatedXp] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const percent = Math.round((correctCount / totalCount) * 100)
  const newLevel = xpToLevel(totalXp)
  const leveledUp = newLevel > oldLevel

  useEffect(() => {
    // 퍼센트 애니메이션
    const timer1 = setTimeout(() => {
      setAnimatedPercent(percent)
    }, 300)
    // XP 카운트업
    const timer2 = setTimeout(() => {
      setAnimatedXp(earnedXp)
    }, 800)
    // 레벨업 표시
    const timer3 = leveledUp ? setTimeout(() => setShowLevelUp(true), 1500) : null
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      if (timer3) clearTimeout(timer3)
    }
  }, [percent, earnedXp, leveledUp])

  // Confetti CSS
  const confettiColors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6']

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Confetti */}
      {percent >= 70 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-sm opacity-80"
              style={{
                backgroundColor: confettiColors[i % confettiColors.length],
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">
        {/* 레벨업 오버레이 */}
        {showLevelUp && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 text-center mx-6 animate-bounceIn">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-2xl font-black text-gray-900 mb-1">LEVEL UP!</p>
              <p className="text-4xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Lv.{newLevel}
              </p>
              <button
                onClick={() => setShowLevelUp(false)}
                className="mt-6 px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold active:scale-95 transition-transform"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* 원형 프로그레스 */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={percent >= 70 ? '#22c55e' : percent >= 40 ? '#f59e0b' : '#ef4444'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - animatedPercent / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-900">{animatedPercent}%</span>
            <span className="text-xs text-gray-500">{correctCount}/{totalCount}</span>
          </div>
        </div>

        {/* 결과 메시지 */}
        <p className="text-lg font-bold text-gray-900">
          {percent === 100
            ? (lang === 'ko' ? '완벽해요!' : lang === 'en' ? 'Perfect!' : '完美！')
            : percent >= 70
              ? (lang === 'ko' ? '잘했어요!' : lang === 'en' ? 'Great job!' : '做得好！')
              : percent >= 40
                ? (lang === 'ko' ? '괜찮아요, 다시 도전!' : lang === 'en' ? 'Not bad, try again!' : '还不错，再试试！')
                : (lang === 'ko' ? '더 연습해 봐요' : lang === 'en' ? 'Keep practicing!' : '继续加油！')
          }
        </p>

        {/* XP 획득 */}
        <div className="flex items-center gap-3 bg-amber-50 px-6 py-3 rounded-2xl">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          <span className="text-2xl font-black text-amber-600">
            +{animatedXp} XP
          </span>
        </div>

        {/* 레벨 프로그레스 */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Lv.{newLevel}</span>
            <span>{totalXp} / {levelXpRange(newLevel).max} XP</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, ((totalXp - levelXpRange(newLevel).min) / (levelXpRange(newLevel).max - levelXpRange(newLevel).min)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-5 py-4 pb-6 flex flex-col gap-3">
        {onNext && (
          <button
            onClick={onNext}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            {lang === 'ko' ? '다음 레슨' : lang === 'en' ? 'Next Lesson' : '下一课'}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          {onNext
            ? (lang === 'ko' ? '챕터로 돌아가기' : lang === 'en' ? 'Back to Chapter' : '返回章节')
            : (lang === 'ko' ? '돌아가기' : lang === 'en' ? 'Go Back' : '返回')
          }
        </button>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-bounceIn { animation: bounceIn 0.5s ease-out; }
      `}</style>
    </div>
  )
}
