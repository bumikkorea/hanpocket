import { useState, useCallback } from 'react'
import { X, Heart } from 'lucide-react'
import QuizCard from './QuizCard'
import ResultScreen from './ResultScreen'
import { xpToLevel } from './gameData'

export default function LessonScreen({ lang, lesson, gameState, onComplete, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [earnedXp, setEarnedXp] = useState(0)
  const [hearts, setHearts] = useState(gameState.hearts)
  const [finished, setFinished] = useState(false)
  const [xpPopup, setXpPopup] = useState(null)

  const questions = lesson.questions
  const total = questions.length
  const oldLevel = xpToLevel(gameState.xp)

  const handleAnswer = useCallback((isCorrect) => {
    if (isCorrect) {
      const xp = questions[currentIndex].xp
      setCorrectCount(c => c + 1)
      setEarnedXp(x => x + xp)
      // XP popup
      setXpPopup(xp)
      setTimeout(() => setXpPopup(null), 1000)
    } else {
      setHearts(h => h - 1)
    }

    const nextIndex = currentIndex + 1
    if (nextIndex >= total || (!isCorrect && hearts - 1 <= 0)) {
      // 하트 0이면 강제 종료
      setTimeout(() => {
        setFinished(true)
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount
        const finalXp = isCorrect ? earnedXp + questions[currentIndex].xp : earnedXp
        onComplete({
          correctCount: finalCorrect,
          totalCount: total,
          earnedXp: finalXp,
          heartsLeft: isCorrect ? hearts : hearts - 1,
          outOfHearts: !isCorrect && hearts - 1 <= 0,
        })
      }, 500)
    } else {
      setTimeout(() => setCurrentIndex(nextIndex), 300)
    }
  }, [currentIndex, correctCount, earnedXp, hearts, total, questions, onComplete])

  if (finished) {
    const finalXp = earnedXp
    return (
      <ResultScreen
        lang={lang}
        correctCount={correctCount}
        totalCount={total}
        earnedXp={finalXp}
        totalXp={gameState.xp + finalXp}
        oldLevel={oldLevel}
        onBack={onExit}
      />
    )
  }

  // 하트 0 화면
  if (hearts <= 0) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center px-6">
        <div className="text-5xl mb-4">💔</div>
        <p className="text-xl font-bold text-gray-900 mb-2">
          {lang === 'ko' ? '하트가 없습니다' : lang === 'en' ? 'No hearts left' : '没有爱心了'}
        </p>
        <p className="text-sm text-gray-500 mb-8 text-center">
          {lang === 'ko' ? '1시간 후 하트가 회복됩니다.' : lang === 'en' ? 'Hearts recover in 1 hour.' : '1小时后爱心会恢复。'}
        </p>
        <button
          onClick={onExit}
          className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold active:scale-95 transition-transform"
        >
          {lang === 'ko' ? '돌아가기' : lang === 'en' ? 'Go Back' : '返回'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* 상단 바: 진행률 + 하트 + 닫기 */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={onExit} className="p-1 active:scale-90 transition-transform">
          <X className="w-6 h-6 text-gray-400" />
        </button>
        {/* 진행률 바 */}
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex) / total) * 100}%` }}
          />
        </div>
        {/* 하트 */}
        <div className="flex items-center gap-1">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <span className="text-sm font-bold text-red-500">{hearts}</span>
        </div>
      </div>

      {/* 문제 번호 */}
      <div className="px-5 pb-1">
        <span className="text-xs text-gray-400 font-medium">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* XP 팝업 */}
      {xpPopup && (
        <div className="absolute top-16 right-6 z-20 animate-xpPop">
          <span className="text-lg font-black text-green-500">+{xpPopup} XP</span>
        </div>
      )}

      {/* 퀴즈 카드 */}
      <div className="flex-1 overflow-hidden">
        <QuizCard
          key={`${lesson.id}-${currentIndex}`}
          question={questions[currentIndex]}
          lang={lang}
          onAnswer={handleAnswer}
        />
      </div>

      <style>{`
        @keyframes xpPop {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-30px) scale(1.3); opacity: 0; }
        }
        .animate-xpPop { animation: xpPop 1s ease-out forwards; }
      `}</style>
    </div>
  )
}
