import { useState, lazy, Suspense } from 'react'

const KoreanGameMain = lazy(() => import('./korean-game/KoreanGameMain'))
const EducationTab = lazy(() => import('./EducationTab'))

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#111827] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

export default function KoreanTab({ lang }) {
  const [mode, setMode] = useState('game')

  return (
    <div>
      {/* 상단 탭 전환 */}
      <div className="flex gap-2 px-4 pt-4 pb-2">
        <button
          onClick={() => setMode('game')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'game'
              ? 'bg-[#1A1A1A] text-white'
              : 'bg-[#F5F1EB] text-[#666]'
          }`}
        >
          {lang === 'ko' ? '🎮 게임' : lang === 'zh' ? '🎮 游戏' : '🎮 Game'}
        </button>
        <button
          onClick={() => setMode('study')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'study'
              ? 'bg-[#1A1A1A] text-white'
              : 'bg-[#F5F1EB] text-[#666]'
          }`}
        >
          {lang === 'ko' ? '📖 학습' : lang === 'zh' ? '📖 学习' : '📖 Study'}
        </button>
      </div>

      {/* 콘텐츠 */}
      <Suspense fallback={<LoadingSpinner />}>
        {mode === 'game' && <KoreanGameMain lang={lang} />}
        {mode === 'study' && <EducationTab lang={lang} />}
      </Suspense>
    </div>
  )
}
