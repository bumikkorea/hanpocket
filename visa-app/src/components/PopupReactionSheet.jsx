// PopupReactionSheet — "마음에 드셨나요?" 바텀시트
// 3차원 현장 반응 루프: 15분 체류 후 자동 표시
// 왕좋아요 / 좋아요 선택 → 리뷰 작성으로 유도

import { useState } from 'react'
import { Heart, Sparkles, X, ChevronRight } from 'lucide-react'
import { REACTION_TEXT } from '../data/popupCategories'

export default function PopupReactionSheet({
  popup,
  lang = 'cn',    // cn/ko/en
  onReaction,     // (reactionType) => void
  onReviewStart,  // () => void — 리뷰 작성 화면으로
  onDismiss,      // () => void — 닫기
}) {
  const [reaction, setReaction] = useState(null) // null | 'super_like' | 'like'
  const [animating, setAnimating] = useState(false)

  if (!popup) return null

  const t = (obj) => obj?.[lang] || obj?.cn || obj?.ko || ''

  const handleReaction = async (type) => {
    setAnimating(true)
    setReaction(type)
    await onReaction?.(type)
    setTimeout(() => setAnimating(false), 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/40" onClick={onDismiss} />

      {/* 바텀시트 */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl px-6 pt-6 pb-8 animate-slide-up">
        {/* 닫기 */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        {/* 팝업 정보 */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-1">
            {popup.name_cn || popup.name_ko || popup.brand}
          </div>
          <div className="text-xl font-bold text-gray-900">
            {lang === 'cn' ? '觉得怎么样？' : lang === 'ko' ? '마음에 드셨나요?' : 'How was it?'}
          </div>
        </div>

        {/* 반응 선택 — 아직 안 눌렀을 때 */}
        {!reaction && (
          <div className="flex justify-center gap-8 mb-6">
            {/* 왕좋아요 */}
            <button
              onClick={() => handleReaction('super_like')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 group-active:scale-95 transition-all">
                <Heart size={36} className="text-red-500 fill-red-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {lang === 'cn' ? '超喜欢！' : lang === 'ko' ? '왕좋아요!' : 'Love it!'}
              </span>
            </button>

            {/* 좋아요 */}
            <button
              onClick={() => handleReaction('like')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 group-active:scale-95 transition-all">
                <Heart size={36} className="text-pink-400" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {lang === 'cn' ? '还不错' : lang === 'ko' ? '좋아요' : 'Nice'}
              </span>
            </button>
          </div>
        )}

        {/* 반응 후 메시지 */}
        {reaction && (
          <div className={`text-center mb-6 ${animating ? 'animate-bounce-in' : ''}`}>
            {/* 이모지 애니메이션 */}
            <div className="text-5xl mb-3">
              {reaction === 'super_like' ? '🎉' : '😊'}
            </div>

            {/* 반응별 멘트 */}
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              {t(REACTION_TEXT[reaction]?.prompt)}
            </p>

            {/* 리뷰 CTA */}
            <button
              onClick={onReviewStart}
              className="w-full py-3.5 px-6 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              <Sparkles size={18} />
              <span>{t(REACTION_TEXT[reaction]?.cta)}</span>
              <ChevronRight size={16} />
            </button>

            {/* 건너뛰기 */}
            <button
              onClick={onDismiss}
              className="mt-3 text-sm text-gray-400 hover:text-gray-600"
            >
              {lang === 'cn' ? '下次再说' : lang === 'ko' ? '다음에 할게요' : 'Maybe later'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
