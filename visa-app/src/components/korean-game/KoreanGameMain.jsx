import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Heart, Lock, ChevronDown, ChevronUp, CheckCircle2, Circle, Gamepad2 } from 'lucide-react'
import { CHAPTERS, loadGameState, saveGameState, xpToLevel, levelXpRange, recoverHearts, updateStreak } from './gameData'
const LessonScreen = lazy(() => import('./LessonScreen'))
import StreakBanner from './StreakBanner'

function L(lang, obj) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj[lang] || obj.zh || obj.en || obj.ko || ''
}

export default function KoreanGameMain({ lang }) {
  const [gameState, setGameState] = useState(() => {
    const state = loadGameState()
    return recoverHearts(state)
  })
  const [expandedChapter, setExpandedChapter] = useState('airport')
  const [activeLesson, setActiveLesson] = useState(null)
  const [activeLessonData, setActiveLessonData] = useState(null)

  // 게임 상태 저장
  useEffect(() => {
    saveGameState(gameState)
  }, [gameState])

  const level = xpToLevel(gameState.xp)
  const { min: levelMin, max: levelMax } = levelXpRange(level)
  const levelProgress = levelMax > levelMin ? ((gameState.xp - levelMin) / (levelMax - levelMin)) * 100 : 0
  const todayDone = gameState.lastPlayDate === new Date().toDateString()

  const startLesson = useCallback((chapter, lesson) => {
    if (gameState.hearts <= 0) return
    setActiveLesson({ chapterId: chapter.id, lessonId: lesson.id })
    setActiveLessonData(lesson)
  }, [gameState.hearts])

  const handleLessonComplete = useCallback((result) => {
    setGameState(prev => {
      let next = { ...prev }
      next.xp = prev.xp + result.earnedXp
      next.level = xpToLevel(next.xp)
      next.hearts = result.heartsLeft
      if (result.heartsLeft < prev.hearts) {
        next.lastHeartLoss = Date.now()
      }
      // 마크 완료 (70% 이상)
      const lessonKey = `${activeLesson.chapterId}/${activeLesson.lessonId}`
      const passRate = result.correctCount / result.totalCount
      if (passRate >= 0.7 && !prev.completedLessons.includes(lessonKey)) {
        next.completedLessons = [...prev.completedLessons, lessonKey]
      }
      next.lessonScores = {
        ...prev.lessonScores,
        [lessonKey]: Math.max(prev.lessonScores[lessonKey] || 0, Math.round(passRate * 100)),
      }
      // 스트릭 업데이트
      next = updateStreak(next)
      return next
    })
  }, [activeLesson])

  const handleLessonExit = useCallback(() => {
    setActiveLesson(null)
    setActiveLessonData(null)
  }, [])

  // 레슨 화면
  if (activeLesson && activeLessonData) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin w-6 h-6 border-2 border-[#2D5A3D] border-t-transparent rounded-full"></div>
        </div>
      }>
        <LessonScreen
          lang={lang}
          lesson={activeLessonData}
          gameState={gameState}
          onComplete={handleLessonComplete}
          onExit={handleLessonExit}
        />
      </Suspense>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">

      <div className="flex-1 overflow-y-auto">
        {/* 스트릭 배너 */}
        <div className="pt-4">
          <StreakBanner lang={lang} streak={gameState.streak} todayDone={todayDone} />
        </div>

        {/* 프로필 카드 */}
        <div className="mx-4 mb-4 p-4 bg-white rounded-2xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2D5A3D] to-[#1A3A28] rounded-2xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-[#1A1A1A]">Lv.{level}</p>
                <p className="text-xs text-[#666666]">{gameState.xp} / {levelMax} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-transform ${
                    i < gameState.hearts
                      ? 'text-red-500 fill-red-500'
                      : 'text-[#E5E7EB]'
                  }`}
                />
              ))}
            </div>
          </div>
          {/* XP 프로그레스 */}
          <div className="w-full h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2D5A3D] to-[#4A8A5A] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, levelProgress)}%` }}
            />
          </div>
        </div>

        {/* 챕터 리스트 */}
        <div className="px-4 pb-8 flex flex-col gap-4">
          {CHAPTERS.map(chapter => {
            const isExpanded = expandedChapter === chapter.id
            const isLocked = chapter.locked
            const completedCount = chapter.lessons.filter(l =>
              gameState.completedLessons.includes(`${chapter.id}/${l.id}`)
            ).length
            const totalLessons = chapter.lessons.length

            return (
              <div key={chapter.id} className="overflow-hidden">
                {/* 챕터 카드 */}
                <button
                  onClick={() => !isLocked && setExpandedChapter(isExpanded ? null : chapter.id)}
                  disabled={isLocked}
                  className={`w-full text-left transition-all active:scale-[0.98]
                    ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className={`bg-white border border-[#E5E7EB] ${isExpanded && !isLocked ? 'rounded-t-2xl border-b-0' : 'rounded-2xl'} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isLocked ? 'from-[#9CA3AF] to-[#6B7280]' : chapter.gradient} flex items-center justify-center shrink-0`}>
                          {isLocked ? (
                            <Lock className="w-5 h-5 text-white/60" />
                          ) : (
                            <span className="text-white text-sm font-bold">{chapter.lessons?.[0]?.emoji || '📚'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-[#1A1A1A]">{L(lang, chapter.name)}</p>
                          {!isLocked && totalLessons > 0 && (
                            <p className="text-xs text-[#666666] mt-0.5">
                              {completedCount}/{totalLessons} {lang === 'ko' ? '레슨' : lang === 'en' ? 'lessons' : '课'}
                            </p>
                          )}
                          {isLocked && (
                            <p className="text-xs text-[#999999] mt-0.5">
                              {lang === 'ko' ? '곧 공개' : lang === 'en' ? 'Coming soon' : '即将开放'}
                            </p>
                          )}
                        </div>
                      </div>
                      {!isLocked && (
                        isExpanded
                          ? <ChevronUp className="w-5 h-5 text-[#999999]" />
                          : <ChevronDown className="w-5 h-5 text-[#999999]" />
                      )}
                    </div>
                    {/* 완료율 바 */}
                    {!isLocked && totalLessons > 0 && (
                      <div className="mt-3 w-full h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#2D5A3D] to-[#4A8A5A] rounded-full transition-all duration-500"
                          style={{ width: `${(completedCount / totalLessons) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </button>

                {/* 레슨 리스트 (아코디언) */}
                {isExpanded && !isLocked && (
                  <div className="bg-white rounded-b-2xl border border-t-0 border-[#E5E7EB] divide-y divide-[#F5F5F5]">
                    {chapter.lessons.map((lesson, i) => {
                      const lessonKey = `${chapter.id}/${lesson.id}`
                      const isCompleted = gameState.completedLessons.includes(lessonKey)
                      const score = gameState.lessonScores[lessonKey]
                      const noHearts = gameState.hearts <= 0

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => startLesson(chapter, lesson)}
                          disabled={noHearts}
                          className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-all active:bg-[#F5F5F5]
                            ${noHearts ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          {/* 아이콘 */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isCompleted ? 'bg-[#E8F5E9]' : 'bg-[#F5F5F5]'
                          }`}>
                            {isCompleted
                              ? <CheckCircle2 className="w-5 h-5 text-[#2D5A3D]" />
                              : <Circle className="w-5 h-5 text-[#D1D5DB]" />
                            }
                          </div>
                          {/* 레슨 정보 */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                              {L(lang, lesson.name)}
                            </p>
                            <p className="text-xs text-[#666666]">
                              {lesson.questions.length} {lang === 'ko' ? '문제' : lang === 'en' ? 'questions' : '题'}
                            </p>
                          </div>
                          {/* 점수 */}
                          {score !== undefined && (
                            <span className={`text-sm font-bold ${score >= 70 ? 'text-[#2D5A3D]' : 'text-[#B8860B]'}`}>
                              {score}%
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
