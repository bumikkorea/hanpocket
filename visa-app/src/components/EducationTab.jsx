import { useState, useEffect } from 'react'
import { Play, Volume2, Mic, Award, Target, CheckCircle, XCircle, ChevronLeft } from 'lucide-react'
import { sessions, minimaps, xpRules, levelTitles, getLevelFromXp, getNextLevelXp, levels } from '../data/education'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

// TTS 유틸리티
function speakKorean(text, rate = 0.7) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR'
    utterance.rate = rate
    utterance.pitch = 1.1
    speechSynthesis.speak(utterance)
  }
}

// 발음 연습을 위한 미니 퀴즈 컴포넌트
function PronunciationQuiz({ word, pronunciation, meaning, lang, onComplete }) {
  const [isListening, setIsListening] = useState(false)
  const [result, setResult] = useState(null)
  
  const handleSpeak = () => {
    speakKorean(word)
  }

  const handleListen = () => {
    setIsListening(true)
    // TODO: 실제 STT 구현 필요
    // 현재는 3초 후 랜덤 결과 시뮬레이션
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% 성공률
      setResult(success ? 'correct' : 'retry')
      setIsListening(false)
      if (success) {
        setTimeout(() => onComplete(true), 1500)
      }
    }, 3000)
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{word}</h3>
        <p className="text-sm text-gray-600 italic">[{pronunciation}]</p>
        <p className="text-xs text-gray-500 mt-1">{L(lang, meaning)}</p>
      </div>
      
      <div className="flex justify-center gap-3 mb-4">
        <button onClick={handleSpeak}
          className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
          <Volume2 size={18} />
          {lang === 'ko' ? '듣기' : lang === 'zh' ? '听一下' : 'Listen'}
        </button>
        
        <button onClick={handleListen} disabled={isListening}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}>
          <Mic size={18} />
          {isListening 
            ? (lang === 'ko' ? '듣는 중...' : lang === 'zh' ? '正在听...' : 'Listening...')
            : (lang === 'ko' ? '발음하기' : lang === 'zh' ? '跟读' : 'Pronounce')
          }
        </button>
      </div>

      {result && (
        <div className={`text-center p-3 rounded-lg ${
          result === 'correct' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
        }`}>
          {result === 'correct' ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              {lang === 'ko' ? '완벽합니다!' : lang === 'zh' ? '完美！' : 'Perfect!'}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <XCircle size={16} />
              {lang === 'ko' ? '다시 한번 해보세요' : lang === 'zh' ? '再试一次' : 'Try again'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 로컬스토리지 유틸
function loadEduState() {
  try { return JSON.parse(localStorage.getItem('edu_state')) || defaultState() }
  catch { return defaultState() }
}
function saveEduState(state) { localStorage.setItem('edu_state', JSON.stringify(state)) }
function defaultState() {
  return { xp: 0, streak: 0, lastLoginDate: null, completedUnits: [], completedQuizzes: [], level: 'beginner', currentSession: 0 }
}

// ─── XP 바 ───
function XpBar({ xp, lang }) {
  const level = getLevelFromXp(xp)
  const nextXp = getNextLevelXp(level)
  const prevXp = level === 0 ? 0 : getNextLevelXp(level - 1)
  const progress = Math.min(((xp - prevXp) / (nextXp - prevXp)) * 100, 100)
  const title = levelTitles[lang]?.[level] || levelTitles.en[level]

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <span className="font-bold text-slate-800">Lv.{level + 1} {title}</span>
        </div>
        <span className="text-sm text-slate-500">{xp} XP</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-400">
        <span>{prevXp}</span>
        <span>{nextXp}</span>
      </div>
    </div>
  )
}

// ─── 스트릭 ───
function StreakBadge({ streak, lang }) {
  const labels = { ko: '연속 출석', zh: '连续签到', en: 'Streak' }
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-3 text-white flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <div>
          <div className="font-bold text-lg">{streak}{lang === 'ko' ? '일' : lang === 'zh' ? '天' : ' days'}</div>
          <div className="text-xs opacity-80">{labels[lang]}</div>
        </div>
      </div>
      {streak >= 7 && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">🏆 ×{Math.floor(streak / 7)}</span>}
    </div>
  )
}

// ─── 세션 카드 ───
function SessionCard({ session, isActive, isCurrent, isLocked, completedCount, totalCount, onClick, lang }) {
  return (
    <button
      onClick={isLocked ? undefined : onClick}
      className={`w-full text-left rounded-xl p-4 transition-all border ${
        isCurrent ? 'bg-white shadow-md border-blue-300 ring-2 ring-blue-100' :
        isLocked ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' :
        'bg-white shadow-sm border-slate-100 hover:border-blue-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${session.color} flex items-center justify-center text-2xl shadow-sm`}>
          {isLocked ? '🔒' : session.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">{L(lang, session.title)}</span>
            {isCurrent && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {lang === 'ko' ? '진행중' : lang === 'zh' ? '进行中' : 'Current'}
            </span>}
            <span className="text-xs text-slate-400 ml-auto">TOPIK {session.topikLevel}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{L(lang, session.subtitle)}</p>
          {!isLocked && (
            <div className="mt-2">
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-400 mt-0.5">{completedCount}/{totalCount}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── 레슨 목록 ───
function LessonList({ session, eduState, onComplete, onOpenMinimap, onOpenUnit, onBack, lang }) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-blue-600 text-sm font-medium">
        {lang === 'ko' ? '← 뒤로' : lang === 'zh' ? '← 返回' : '← Back'}
      </button>
      <div className={`bg-gradient-to-r ${session.color} rounded-xl p-5 text-white`}>
        <div className="text-3xl mb-2">{session.icon}</div>
        <div className="text-xl font-bold">{L(lang, session.title)}</div>
        <div className="text-sm opacity-80 mt-1">{L(lang, session.subtitle)}</div>
        <div className="text-xs opacity-60 mt-2">{session.days} {lang === 'ko' ? '일' : lang === 'zh' ? '天' : 'days'} · TOPIK {session.topikLevel}</div>
      </div>

      <div className="space-y-2">
        {session.units.map((unit, idx) => {
          const unitKey = `${session.id}-${unit.day}`
          const done = eduState.completedUnits.includes(unitKey)
          const isNext = !done && (idx === 0 || eduState.completedUnits.includes(`${session.id}-${session.units[idx-1]?.day}`))

          return (
            <button
              key={unit.day}
              onClick={() => {
                if (unit.minimap) { onOpenMinimap(unit.minimap) }
                else if (isNext && !done && unit.pronunciation) { onOpenUnit(unit) }
                else if (isNext || done) { onComplete(unitKey) }
              }}
              className={`w-full text-left rounded-xl p-3 flex items-center gap-3 transition-all border ${
                done ? 'bg-green-50 border-green-200' :
                isNext ? 'bg-white border-blue-300 shadow-sm' :
                'bg-slate-50 border-slate-100 opacity-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                done ? 'bg-green-500 text-white' :
                isNext ? 'bg-blue-500 text-white' :
                'bg-slate-200 text-slate-400'
              }`}>
                {done ? '✓' : unit.day}
              </div>
              <span className={`text-sm flex-1 ${done ? 'text-green-700' : isNext ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                {L(lang, unit.title)}
              </span>
              {unit.minimap && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">🗺️</span>}
              {done && <span className="text-green-500 text-xs">+{xpRules.lessonComplete} XP</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── 미니맵 화면 ───
function MinimapView({ minimapId, onBack, eduState, onQuizAnswer, lang }) {
  const [selectedScene, setSelectedScene] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizResult, setQuizResult] = useState(null)
  const map = minimaps[minimapId]
  if (!map) return null

  const scene = selectedScene !== null ? map.scenes[selectedScene] : null

  if (scene && showQuiz) {
    return (
      <div className="space-y-4">
        <button onClick={() => { setShowQuiz(false); setQuizResult(null) }} className="text-blue-600 text-sm font-medium">
          {lang === 'ko' ? '← 대화로 돌아가기' : lang === 'zh' ? '← 返回对话' : '← Back to dialogue'}
        </button>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">📝 Quiz</h3>
          <p className="text-sm text-slate-700 mb-4">{L(lang, scene.quiz.question)}</p>
          <div className="space-y-2">
            {scene.quiz.options[lang]?.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  if (quizResult !== null) return
                  const correct = i === scene.quiz.answer
                  setQuizResult({ index: i, correct })
                  onQuizAnswer(correct)
                }}
                className={`w-full text-left p-3 rounded-xl text-sm border transition-all ${
                  quizResult?.index === i
                    ? quizResult.correct ? 'bg-green-50 border-green-400 text-green-700' : 'bg-red-50 border-red-400 text-red-700'
                    : quizResult !== null && i === scene.quiz.answer ? 'bg-green-50 border-green-400 text-green-700'
                    : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {quizResult && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${quizResult.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {quizResult.correct
                ? (lang === 'ko' ? '🎉 정답! +5 XP' : lang === 'zh' ? '🎉 正确！+5 XP' : '🎉 Correct! +5 XP')
                : (lang === 'ko' ? '❌ 틀렸어요. +1 XP' : lang === 'zh' ? '❌ 错了。+1 XP' : '❌ Wrong. +1 XP')}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (scene) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedScene(null)} className="text-blue-600 text-sm font-medium">
          {lang === 'ko' ? '← 미니맵으로' : lang === 'zh' ? '← 回到迷你地图' : '← Back to minimap'}
        </button>
        <h2 className="text-lg font-bold text-slate-800">{L(lang, scene.title)}</h2>

        {/* 대화문 */}
        <div className="space-y-3">
          {scene.dialogue[lang]?.map((line, i) => (
            <div key={i} className={`flex ${line.speaker === 'you' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                line.speaker === 'you'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-700 rounded-bl-md'
              }`}>
                {line.speaker !== 'you' && <div className="text-xs text-slate-400 mb-1">🧑‍💼 Staff</div>}
                {line.text}
              </div>
            </div>
          ))}
        </div>

        {/* 퀴즈 버튼 */}
        <button
          onClick={() => setShowQuiz(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all"
        >
          📝 {lang === 'ko' ? '퀴즈 풀기' : lang === 'zh' ? '做题' : 'Take Quiz'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-blue-600 text-sm font-medium">
        {lang === 'ko' ? '← 뒤로' : lang === 'zh' ? '← 返回' : '← Back'}
      </button>
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-5 text-white">
        <div className="text-2xl mb-2">🗺️</div>
        <div className="text-xl font-bold">{L(lang, map.name)}</div>
        <div className="text-sm opacity-80 mt-1">
          {map.scenes.length} {lang === 'ko' ? '가지 상황' : lang === 'zh' ? '个场景' : 'scenes'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {map.scenes.map((scene, i) => (
          <button
            key={scene.id}
            onClick={() => setSelectedScene(i)}
            className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-lg font-bold text-purple-600">
                {i + 1}
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-sm">{L(lang, scene.title)}</div>
                <div className="text-xs text-slate-400">
                  {lang === 'ko' ? '대화 + 퀴즈' : lang === 'zh' ? '对话 + 练习' : 'Dialogue + Quiz'}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── 메인 교육 탭 ───
// 유닛 상세 학습 화면
function UnitDetail({ session, unit, onBack, onComplete, lang }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedPronunciations, setCompletedPronunciations] = useState([])
  
  const pronunciationWords = unit.pronunciation || []
  const totalSteps = pronunciationWords.length + 1 // 발음 연습 + 마무리
  
  const handlePronunciationComplete = (wordIndex) => {
    if (!completedPronunciations.includes(wordIndex)) {
      setCompletedPronunciations([...completedPronunciations, wordIndex])
    }
    if (currentStep < pronunciationWords.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setCurrentStep(totalSteps - 1) // 마무리 단계로
    }
  }

  const handleUnitComplete = () => {
    onComplete()
    onBack()
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <button onClick={onBack} className="text-blue-600 text-sm font-medium flex items-center gap-2">
        <ChevronLeft size={16} />
        {lang === 'ko' ? '세션으로 돌아가기' : lang === 'zh' ? '返回课程' : 'Back to Session'}
      </button>
      
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Day {unit.day}</h2>
            <p className="text-gray-600">{L(lang, unit.title)}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{currentStep + 1} / {totalSteps}</div>
            <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
              <div className="bg-blue-500 h-2 rounded-full transition-all" 
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
            </div>
          </div>
        </div>
        
        {currentStep < pronunciationWords.length ? (
          <PronunciationQuiz
            word={pronunciationWords[currentStep].word}
            pronunciation={pronunciationWords[currentStep].pronunciation}
            meaning={pronunciationWords[currentStep].meaning}
            lang={lang}
            onComplete={() => handlePronunciationComplete(currentStep)}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {lang === 'ko' ? '완료!' : lang === 'zh' ? '完成！' : 'Complete!'}
            </h3>
            <p className="text-gray-600 mb-6">
              {lang === 'ko' ? '이 학습을 완료했습니다.' : lang === 'zh' ? '您已完成本课学习。' : 'You have completed this lesson.'}
            </p>
            <button onClick={handleUnitComplete}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
              <Award className="inline mr-2" size={20} />
              {lang === 'ko' ? '완료하고 XP 받기' : lang === 'zh' ? '完成并获得XP' : 'Complete & Get XP'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EducationTab({ lang }) {
  const [eduState, setEduState] = useState(loadEduState)
  const [view, setView] = useState('main') // main | session | minimap | unit
  const [activeSession, setActiveSession] = useState(null)
  const [activeMinimap, setActiveMinimap] = useState(null)
  const [activeUnit, setActiveUnit] = useState(null)

  // 오늘 출석 체크
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (eduState.lastLoginDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const newStreak = eduState.lastLoginDate === yesterday ? eduState.streak + 1 : 1
      const bonus = newStreak % 7 === 0 ? xpRules.streakBonus7 : 0
      const updated = {
        ...eduState,
        lastLoginDate: today,
        streak: newStreak,
        xp: eduState.xp + xpRules.dailyLogin + bonus,
      }
      setEduState(updated)
      saveEduState(updated)
    }
  }, [])

  const completeUnit = (unitKey) => {
    if (eduState.completedUnits.includes(unitKey)) return
    const updated = {
      ...eduState,
      completedUnits: [...eduState.completedUnits, unitKey],
      xp: eduState.xp + xpRules.lessonComplete,
    }
    setEduState(updated)
    saveEduState(updated)
  }

  const handleQuizAnswer = (correct) => {
    const xpGain = correct ? xpRules.quizCorrect : xpRules.quizWrong
    const updated = { ...eduState, xp: eduState.xp + xpGain }
    setEduState(updated)
    saveEduState(updated)
  }

  if (view === 'minimap' && activeMinimap) {
    return (
      <MinimapView
        minimapId={activeMinimap}
        eduState={eduState}
        onQuizAnswer={handleQuizAnswer}
        onBack={() => { setView(activeSession !== null ? 'session' : 'main'); setActiveMinimap(null) }}
        lang={lang}
      />
    )
  }

  if (view === 'unit' && activeUnit && activeSession !== null) {
    const session = sessions[activeSession]
    return (
      <UnitDetail
        session={session}
        unit={activeUnit}
        onBack={() => { setView('session'); setActiveUnit(null) }}
        onComplete={() => completeUnit(`${session.id}-${activeUnit.day}`)}
        lang={lang}
      />
    )
  }

  if (view === 'session' && activeSession !== null) {
    const session = sessions[activeSession]
    return (
      <LessonList
        session={session}
        eduState={eduState}
        onComplete={completeUnit}
        onOpenMinimap={(id) => { setActiveMinimap(id); setView('minimap') }}
        onOpenUnit={(unit) => { setActiveUnit(unit); setView('unit') }}
        onBack={() => { setView('main'); setActiveSession(null) }}
        lang={lang}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* XP + 스트릭 */}
      <XpBar xp={eduState.xp} lang={lang} />
      <StreakBadge streak={eduState.streak} lang={lang} />

      {/* 세션 목록 */}
      <h2 className="text-lg font-bold text-slate-800">
        📚 {lang === 'ko' ? '학습 세션' : lang === 'zh' ? '学习课程' : 'Study Sessions'}
      </h2>
      <div className="space-y-3">
        {sessions.map((session, idx) => {
          const completedCount = session.units.filter(u => eduState.completedUnits.includes(`${session.id}-${u.day}`)).length
          const prevCompleted = idx === 0 || sessions[idx-1].units.every(u => eduState.completedUnits.includes(`${sessions[idx-1].id}-${u.day}`))
          const isLocked = idx > 0 && !prevCompleted
          const isCurrent = !isLocked && completedCount < session.units.length && (idx === 0 || prevCompleted)

          return (
            <SessionCard
              key={session.id}
              session={session}
              isActive={!isLocked}
              isCurrent={isCurrent}
              isLocked={isLocked}
              completedCount={completedCount}
              totalCount={session.units.length}
              onClick={() => { setActiveSession(idx); setView('session') }}
              lang={lang}
            />
          )
        })}
      </div>

      {/* TOPIK 진행도 */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold">🎯 TOPIK {lang === 'ko' ? '목표' : lang === 'zh' ? '目标' : 'Goal'}: 3{lang === 'ko' ? '급' : lang === 'zh' ? '级' : ''}</div>
            <div className="text-xs opacity-80 mt-1">
              {eduState.completedUnits.length} / 120 {lang === 'ko' ? '레슨 완료' : lang === 'zh' ? '课程完成' : 'lessons done'}
            </div>
          </div>
          <div className="text-3xl font-bold">
            {Math.round((eduState.completedUnits.length / 120) * 100)}%
          </div>
        </div>
      </div>
    </div>
  )
}
