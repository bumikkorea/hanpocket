import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Volume2, CheckCircle, XCircle } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

function speakKorean(text, rate = 0.7) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR'
    utterance.rate = rate
    utterance.pitch = 1.1
    speechSynthesis.speak(utterance)
  }
}

// --- 카드 한 장 ---
function CharCard({ item, lang }) {
  const exampleParts = item.example.split(/[,(，]/)
  const mainWord = exampleParts[0]?.trim()

  return (
    <div className="flex-shrink-0 w-full snap-center px-2">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col items-center min-h-[360px] justify-center">
        {/* 한글 대형 */}
        <div className="text-[120px] font-bold text-[#1A1A1A] leading-none mb-2 select-none">
          {item.char}
        </div>

        {/* 로마자 */}
        <div className="text-2xl text-[#2D5A3D] font-medium mb-1">
          [{item.roman}]
        </div>

        {/* 중국어 근사 발음 */}
        <div className="text-sm text-[#666] mb-4">
          {item.zhSound}
        </div>

        {/* TTS 버튼 */}
        <button
          onClick={() => speakKorean(item.char)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2D5A3D] text-white rounded-xl text-sm font-medium active:scale-95 transition-transform mb-4"
        >
          <Volume2 size={16} />
          {lang === 'ko' ? '듣기' : lang === 'zh' ? '听发音' : 'Listen'}
        </button>

        {/* 예시 단어 */}
        <div className="text-center">
          <div className="text-base font-medium text-[#1A1A1A]">{mainWord}</div>
          <div className="text-xs text-[#999] mt-0.5">
            {exampleParts.slice(1).join(',').trim()}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- 퀴즈 화면 ---
function QuizView({ quiz, lang, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const total = quiz.length
  const q = quiz[current]

  const handleSelect = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    const isCorrect = idx === q.answer
    if (isCorrect) setCorrectCount(prev => prev + 1)

    setTimeout(() => {
      if (current < total - 1) {
        setCurrent(prev => prev + 1)
        setSelected(null)
      } else {
        setShowResult(true)
      }
    }, 1200)
  }

  if (showResult) {
    const passed = correctCount >= Math.ceil(total * 0.6)
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">{passed ? '🎉' : '💪'}</div>
        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
          {correctCount}/{total}
          {lang === 'zh' ? ' 正确' : lang === 'ko' ? ' 정답' : ' correct'}
        </h3>
        <p className="text-sm text-[#666] mb-1">
          {passed
            ? (lang === 'zh' ? '太棒了！+15 XP' : lang === 'ko' ? '훌륭합니다! +15 XP' : 'Great job! +15 XP')
            : (lang === 'zh' ? '再复习一下吧' : lang === 'ko' ? '다시 복습해보세요' : 'Review and try again')}
        </p>
        <button
          onClick={() => onComplete(passed, correctCount)}
          className="mt-6 px-8 py-3 bg-[#2D5A3D] text-white rounded-xl font-semibold active:scale-95 transition-transform"
        >
          {lang === 'zh' ? '完成' : lang === 'ko' ? '완료' : 'Done'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 진행 표시 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-[#F5F5F5] rounded-full h-2">
          <div
            className="bg-[#2D5A3D] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-[#999]">{current + 1}/{total}</span>
      </div>

      {/* 문제 */}
      <h3 className="text-base font-bold text-[#1A1A1A]">
        {L(lang, q.q)}
      </h3>

      {/* 선택지 */}
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls = 'bg-[#F5F5F5] border-[#E5E7EB]'
          if (selected !== null) {
            if (i === q.answer) cls = 'bg-green-50 border-green-400 text-green-700'
            else if (i === selected) cls = 'bg-red-50 border-red-400 text-red-700'
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left p-3.5 rounded-xl text-sm border transition-all ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div className={`flex items-center gap-2 text-sm p-3 rounded-xl ${
          selected === q.answer ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {selected === q.answer
            ? <><CheckCircle size={16} /> {lang === 'zh' ? '正确！' : lang === 'ko' ? '정답!' : 'Correct!'}</>
            : <><XCircle size={16} /> {lang === 'zh' ? '错了' : lang === 'ko' ? '틀렸어요' : 'Wrong'}</>
          }
        </div>
      )}
    </div>
  )
}

// --- 메인 컴포넌트 ---
export default function LessonDetailScreen({ unit, session, onBack, onComplete, lang }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const scrollRef = useRef(null)

  const content = unit.content || []
  const quiz = unit.quiz || []
  const total = content.length

  // 스크롤 인디케이터 동기화
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth)
      setActiveIndex(idx)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  const handleQuizComplete = (passed, correctCount) => {
    if (passed && onComplete) onComplete()
    if (onBack) onBack()
  }

  if (showQuiz && quiz.length > 0) {
    return (
      <div className="space-y-4 animate-fade-up">
        <button
          onClick={() => setShowQuiz(false)}
          className="text-[#2D5A3D] text-sm font-medium flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          {lang === 'zh' ? '返回卡片' : lang === 'ko' ? '카드로 돌아가기' : 'Back to cards'}
        </button>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB]">
          <QuizView quiz={quiz} lang={lang} onComplete={handleQuizComplete} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-[#2D5A3D] flex items-center gap-1 text-sm font-medium"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-[#1A1A1A] truncate">
            Day {unit.day}: {L(lang, unit.title)}
          </h2>
        </div>
      </div>

      {/* 카드 슬라이더 */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-2"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {content.map((item, i) => (
          <CharCard key={i} item={item} lang={lang} />
        ))}
      </div>

      {/* 도트 인디케이터 */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5">
          {content.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === activeIndex ? 'bg-[#2D5A3D] w-4' : 'bg-[#D1D5DB]'
              }`}
            />
          ))}
        </div>
      )}

      {/* 퀴즈 버튼 */}
      {quiz.length > 0 && (
        <button
          onClick={() => setShowQuiz(true)}
          className="w-full py-3.5 bg-gradient-to-r from-[#2D5A3D] to-[#1A3A28] text-white font-semibold rounded-xl active:scale-[0.98] transition-transform"
        >
          {lang === 'zh' ? '开始测验 →' : lang === 'ko' ? '퀴즈 시작 →' : 'Start Quiz →'}
        </button>
      )}
    </div>
  )
}
