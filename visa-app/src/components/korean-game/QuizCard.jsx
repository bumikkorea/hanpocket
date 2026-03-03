import { useState } from 'react'

function L(lang, obj) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj[lang] || obj.zh || obj.en || obj.ko || ''
}

// 선택지 텍스트 추출 (string이면 그대로, 다국어 객체면 L)
function optionText(lang, opt) {
  if (typeof opt.text === 'string') return opt.text
  return L(lang, opt.text)
}

export default function QuizCard({ question, lang, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [arranged, setArranged] = useState([])
  const [available, setAvailable] = useState(question.words ? [...question.words] : [])
  const [fillValue, setFillValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSubmit = () => {
    if (submitted) {
      onAnswer(isCorrect)
      return
    }

    let correct = false
    if (question.type === 'multiple-choice') {
      correct = question.options[selected]?.correct === true
    } else if (question.type === 'word-arrange') {
      correct = arranged.join(' ') === question.answer.join(' ')
    } else if (question.type === 'fill-blank') {
      correct = fillValue.trim() === question.answer
    }
    setIsCorrect(correct)
    setSubmitted(true)
  }

  const canSubmit = () => {
    if (question.type === 'multiple-choice') return selected !== null
    if (question.type === 'word-arrange') return arranged.length > 0
    if (question.type === 'fill-blank') return fillValue.trim().length > 0
    return false
  }

  const addWord = (word, idx) => {
    setArranged([...arranged, word])
    const next = [...available]
    next.splice(idx, 1)
    setAvailable(next)
  }

  const removeWord = (word, idx) => {
    setAvailable([...available, word])
    const next = [...arranged]
    next.splice(idx, 1)
    setArranged(next)
  }

  // 정답/오답 배경
  const feedbackBg = submitted
    ? isCorrect ? 'bg-green-50' : 'bg-red-50'
    : 'bg-white'
  const shakeClass = submitted && !isCorrect ? 'animate-shake' : ''

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${feedbackBg} ${shakeClass}`}>
      {/* 문제 텍스트 */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-lg font-semibold text-gray-900 leading-relaxed">
          {L(lang, question.question)}
        </p>
      </div>

      {/* 문제 유형별 UI */}
      <div className="flex-1 px-5 pb-4 overflow-y-auto">
        {question.type === 'multiple-choice' && (
          <div className="flex flex-col gap-3">
            {question.options.map((opt, i) => {
              const isSelected = selected === i
              const showResult = submitted
              let borderClass = 'border-gray-200'
              if (showResult && opt.correct) borderClass = 'border-green-500 bg-green-50'
              else if (showResult && isSelected && !opt.correct) borderClass = 'border-red-500 bg-red-50'
              else if (isSelected) borderClass = 'border-blue-500 bg-blue-50'

              return (
                <button
                  key={i}
                  onClick={() => !submitted && setSelected(i)}
                  disabled={submitted}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                    ${borderClass}
                    ${!submitted && !isSelected ? 'active:scale-[0.98]' : ''}
                  `}
                >
                  <span className="text-base text-gray-800">{optionText(lang, opt)}</span>
                </button>
              )
            })}
          </div>
        )}

        {question.type === 'word-arrange' && (
          <div className="flex flex-col gap-6">
            {/* 조합된 문장 슬롯 */}
            <div className="min-h-[56px] flex flex-wrap gap-2 items-center p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
              {arranged.length === 0 && (
                <span className="text-sm text-gray-400">
                  {lang === 'ko' ? '단어를 탭하여 문장을 만드세요' : lang === 'en' ? 'Tap words to form a sentence' : '点击下方单词组成句子'}
                </span>
              )}
              {arranged.map((w, i) => (
                <button
                  key={`a-${i}`}
                  onClick={() => !submitted && removeWord(w, i)}
                  disabled={submitted}
                  className={`px-3 py-2 rounded-lg font-medium text-base transition-all
                    ${submitted && isCorrect ? 'bg-green-500 text-white' : ''}
                    ${submitted && !isCorrect ? 'bg-red-400 text-white' : ''}
                    ${!submitted ? 'bg-blue-500 text-white active:scale-95' : ''}
                  `}
                >
                  {w}
                </button>
              ))}
            </div>
            {/* 사용 가능한 단어 */}
            <div className="flex flex-wrap gap-2 justify-center">
              {available.map((w, i) => (
                <button
                  key={`w-${i}`}
                  onClick={() => !submitted && addWord(w, i)}
                  disabled={submitted}
                  className="px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 font-medium text-base active:scale-95 transition-all"
                >
                  {w}
                </button>
              ))}
            </div>
            {/* 번역 표시 (제출 후) */}
            {submitted && question.translation && (
              <p className="text-sm text-gray-500 text-center mt-1">
                {L(lang, question.translation)}
              </p>
            )}
          </div>
        )}

        {question.type === 'fill-blank' && (
          <div className="flex flex-col gap-4">
            {/* 문장 with 빈칸 */}
            <div className="text-center py-6">
              <p className="text-2xl font-bold text-gray-900 tracking-wide">
                {question.sentence.split('___').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={`inline-block min-w-[80px] mx-1 border-b-2 ${
                        submitted && isCorrect ? 'border-green-500 text-green-600' :
                        submitted && !isCorrect ? 'border-red-500 text-red-600' :
                        'border-blue-500 text-blue-600'
                      } font-bold`}>
                        {fillValue || '\u00A0\u00A0\u00A0\u00A0'}
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </div>
            {/* 입력 필드 */}
            <input
              type="text"
              value={fillValue}
              onChange={e => !submitted && setFillValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSubmit() && handleSubmit()}
              disabled={submitted}
              placeholder={L(lang, question.hint)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 text-lg text-center
                focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-50"
              autoComplete="off"
            />
            {/* 정답 표시 (오답 시) */}
            {submitted && !isCorrect && (
              <p className="text-center text-sm text-red-500">
                {lang === 'ko' ? '정답' : lang === 'en' ? 'Answer' : '正确答案'}: <span className="font-bold">{question.answer}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* 피드백 영역 */}
      {submitted && (
        <div className={`px-5 py-3 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
            <span className={`font-bold text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect
                ? (lang === 'ko' ? '정답!' : lang === 'en' ? 'Correct!' : '正确！')
                : (lang === 'ko' ? '오답' : lang === 'en' ? 'Incorrect' : '错误')
              }
              {isCorrect && ` +${question.xp} XP`}
            </span>
          </div>
          {!isCorrect && question.explanation && (
            <p className="text-xs text-gray-600">{L(lang, question.explanation)}</p>
          )}
        </div>
      )}

      {/* 확인/다음 버튼 */}
      <div className="px-5 py-4 pb-6">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98]
            ${canSubmit()
              ? submitted
                ? 'bg-gray-900 text-white'
                : 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {submitted
            ? (lang === 'ko' ? '다음' : lang === 'en' ? 'Next' : '下一题')
            : (lang === 'ko' ? '확인' : lang === 'en' ? 'Check' : '确认')
          }
        </button>
      </div>

      {/* CSS shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}
