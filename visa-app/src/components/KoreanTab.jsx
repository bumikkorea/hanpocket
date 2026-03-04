import { useState, useEffect, lazy, Suspense } from 'react'
import { CHAPTERS } from './korean-game/gameData'

const EducationTab = lazy(() => import('./EducationTab'))
const LessonScreen = lazy(() => import('./korean-game/LessonScreen'))

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#111827] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

const TOPIK_MILESTONES = [
  { level: 60, topik: '2급', label: { ko: 'TOPIK 2급', zh: 'TOPIK 2级', en: 'TOPIK Level 2' },
    desc: {
      ko: '기본 생활 한국어 가능! 식당 주문, 길 묻기, 쇼핑이 편해져요 🎉',
      zh: '基础生活韩语OK！点餐、问路、购物变轻松 🎉',
      en: 'Basic daily Korean! Ordering, directions, shopping made easy 🎉'
    }
  },
  { level: 100, topik: '3급', label: { ko: 'TOPIK 3급', zh: 'TOPIK 3级', en: 'TOPIK Level 3' },
    desc: {
      ko: '한국 친구와 일상 대화 가능! 드라마 자막 없이 반은 알아들어요 📺',
      zh: '能和韩国朋友日常对话！韩剧不看字幕能懂一半 📺',
      en: 'Daily conversations with Koreans! Understand half of K-dramas without subs 📺'
    }
  },
  { level: 200, topik: '4급', label: { ko: 'TOPIK 4급', zh: 'TOPIK 4级', en: 'TOPIK Level 4' },
    desc: {
      ko: '한국 생활 불편 없음! 뉴스, 업무, 깊은 대화까지. 한국에서 살 수 있어요 🏠',
      zh: '在韩国生活无障碍！新闻、工作、深度对话都OK。可以在韩国生活了 🏠',
      en: 'No barriers in Korea! News, work, deep conversations. Ready to live in Korea 🏠'
    }
  },
]

function getNextMilestone(level) {
  for (const m of TOPIK_MILESTONES) {
    if (level < m.level) return m
  }
  return TOPIK_MILESTONES[TOPIK_MILESTONES.length - 1]
}

// Pick a quiz lesson from gameData chapters based on what's available
function pickQuizLesson(completedLessons) {
  for (const chapter of CHAPTERS) {
    if (chapter.locked) continue
    for (const lesson of chapter.lessons) {
      if (!completedLessons.includes(lesson.id) && lesson.questions?.length > 0) {
        return lesson
      }
    }
  }
  // If all completed, cycle back to first available
  for (const chapter of CHAPTERS) {
    if (chapter.locked) continue
    if (chapter.lessons.length > 0 && chapter.lessons[0].questions?.length > 0) {
      return chapter.lessons[0]
    }
  }
  return null
}

function TopikGaugeBar({ currentLevel, lang }) {
  const next = getNextMilestone(currentLevel)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-[#1A1A1A]">
          {L(lang, { ko: '나의 한국어', zh: '我的韩语', en: 'My Korean' })}
        </p>
        <p className="text-xs text-[#666666]">
          {currentLevel} / 200 {L(lang, { ko: '단계', zh: '阶段', en: 'levels' })}
        </p>
      </div>

      {/* 프로그레스바 */}
      <div className="relative w-full h-3 bg-[#F5F5F5] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#2D5A3D] to-[#4A8A5A] rounded-full transition-all duration-500"
          style={{ width: `${(currentLevel / 200) * 100}%` }}
        />
      </div>

      {/* 마일스톤 라벨 */}
      <div className="relative flex justify-between text-[10px] text-[#999999] mb-3 h-4">
        <span>0</span>
        <span className="absolute" style={{ left: '30%', transform: 'translateX(-50%)' }}>2급</span>
        <span className="absolute" style={{ left: '50%', transform: 'translateX(-50%)' }}>3급</span>
        <span>4급</span>
      </div>

      {/* 다음 마일스톤 설명 카드 */}
      <div className="p-3 rounded-xl border border-[#E5E7EB] bg-white">
        <p className="text-xs font-medium text-[#2D5A3D]">
          {currentLevel >= 200
            ? L(lang, { ko: '🎓 최고 레벨 달성!', zh: '🎓 已达最高级！', en: '🎓 Max level reached!' })
            : L(lang, next.label)}
        </p>
        <p className="text-[11px] text-[#666666] mt-1">
          {currentLevel >= 200
            ? L(lang, { ko: '한국 생활 완전 정복! 🏆', zh: '韩国生活完全征服！🏆', en: 'Korean life fully mastered! 🏆' })
            : L(lang, next.desc)}
        </p>
      </div>
    </div>
  )
}

export default function KoreanTab({ lang }) {
  const [currentLevel, setCurrentLevel] = useState(() => {
    return parseInt(localStorage.getItem('hanpocket_korean_level') || '0')
  })
  const [quizLesson, setQuizLesson] = useState(null)
  const [completedQuizLessons, setCompletedQuizLessons] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hanpocket_korean_quiz_done') || '[]')
    } catch { return [] }
  })

  // 레벨 저장
  useEffect(() => {
    localStorage.setItem('hanpocket_korean_level', String(currentLevel))
  }, [currentLevel])

  // 완료된 퀴즈 저장
  useEffect(() => {
    localStorage.setItem('hanpocket_korean_quiz_done', JSON.stringify(completedQuizLessons))
  }, [completedQuizLessons])

  // 세션 완료 → 퀴즈 출제
  const handleSessionComplete = () => {
    const lesson = pickQuizLesson(completedQuizLessons)
    if (lesson) {
      setQuizLesson(lesson)
    } else {
      // 퀴즈 없으면 바로 레벨업
      setCurrentLevel(prev => Math.min(200, prev + 1))
    }
  }

  // 퀴즈 완료 핸들러
  const handleQuizComplete = (result) => {
    const passRate = result.correctCount / result.totalCount
    if (passRate >= 0.7) {
      setCurrentLevel(prev => Math.min(200, prev + 1))
      if (quizLesson) {
        setCompletedQuizLessons(prev => [...prev, quizLesson.id])
      }
    }
    // ResultScreen의 onBack이 호출될 때 quiz 모드 종료
  }

  const handleQuizExit = () => {
    setQuizLesson(null)
  }

  // 퀴즈 모드
  if (quizLesson) {
    // LessonScreen에 필요한 gameState 구성
    const gameState = {
      xp: currentLevel * 50,
      hearts: 5,
      completedLessons: completedQuizLessons,
      lessonScores: {},
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LessonScreen
          lang={lang}
          lesson={quizLesson}
          gameState={gameState}
          onComplete={handleQuizComplete}
          onExit={handleQuizExit}
        />
      </Suspense>
    )
  }

  return (
    <div className="pt-4 pb-24 px-4">
      {/* TOPIK 게이지바 */}
      <TopikGaugeBar currentLevel={currentLevel} lang={lang} />

      {/* 학습 콘텐츠 — EducationTab 재사용 */}
      <Suspense fallback={<LoadingSpinner />}>
        <EducationTab lang={lang} onSessionComplete={handleSessionComplete} />
      </Suspense>
    </div>
  )
}
