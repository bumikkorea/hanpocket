// PopupReviewForm — 리뷰 작성 + 랜덤박스 보상
// 최소 마찰 설계: 별점 1탭 → 혼잡도 1탭 → (선택) 텍스트/사진/태그

import { useState, useRef } from 'react'
import { Star, Camera, Send, Gift, Users, Clock, Tag, X, Sparkles, ChevronDown } from 'lucide-react'
import { REVIEW_TAGS, REWARD_TIERS } from '../data/popupCategories'

export default function PopupReviewForm({
  popup,
  lang = 'cn',
  onSubmit,       // (reviewData) => Promise<{ success, reward }>
  onClose,
}) {
  const [step, setStep] = useState('review')  // review | reward
  const [rating, setRating] = useState(0)
  const [crowdLevel, setCrowdLevel] = useState(null)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [reward, setReward] = useState(null)
  const [showTags, setShowTags] = useState(false)
  const fileRef = useRef(null)

  if (!popup) return null

  const t = (obj) => obj?.[lang] || obj?.cn || obj?.ko || ''

  const crowdOptions = [
    { level: 'low',    emoji: '😌', label: { cn: '很空', ko: '한산', en: 'Quiet' } },
    { level: 'medium', emoji: '🙂', label: { cn: '一般', ko: '보통', en: 'Normal' } },
    { level: 'high',   emoji: '😅', label: { cn: '很挤', ko: '붐빔', en: 'Busy' } },
    { level: 'packed', emoji: '🥵', label: { cn: '排队', ko: '줄섰음', en: 'Packed' } },
  ]

  const canSubmit = rating > 0 && crowdLevel

  // 리뷰 티어 판별
  const getReviewTier = () => {
    if (photos.length > 0 && comment.trim()) return 'premium'
    if (comment.trim()) return 'normal'
    return 'mini'
  }

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 3)
    const urls = files.map(f => URL.createObjectURL(f))
    setPhotos(prev => [...prev, ...urls].slice(0, 3))
  }

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
  }

  const toggleTag = (code) => {
    setSelectedTags(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    )
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)

    const reviewData = {
      rating,
      crowd_level: crowdLevel,
      comment: comment.trim(),
      lang,
      photos,       // TODO: 실제로는 S3/R2 업로드 후 URL
      tags: selectedTags,
      category: popup.category,
      district: popup.district,
    }

    const result = await onSubmit?.(reviewData)
    if (result?.reward) {
      setReward(result.reward)
      setStep('reward')
    }
    setSubmitting(false)
  }

  // ── 리뷰 작성 화면 ──
  if (step === 'review') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={onClose} className="p-1 text-gray-500">
            <X size={22} />
          </button>
          <span className="font-medium text-gray-900">
            {lang === 'cn' ? '写评价' : lang === 'ko' ? '리뷰 작성' : 'Write Review'}
          </span>
          <div className="w-8" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* 팝업 정보 간단히 */}
          <div className="flex items-center gap-3">
            {popup.cover_image && (
              <img src={popup.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div>
              <div className="font-bold text-gray-900 text-sm">
                {popup.name_cn || popup.name_ko}
              </div>
              <div className="text-xs text-gray-500">
                {popup.district} · {popup.address_cn || popup.address_ko}
              </div>
            </div>
          </div>

          {/* 별점 (필수) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {lang === 'cn' ? '评分' : lang === 'ko' ? '별점' : 'Rating'} *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className="p-1 active:scale-110 transition-transform"
                >
                  <Star
                    size={32}
                    className={n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 혼잡도 (필수) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Users size={14} />
              {lang === 'cn' ? '拥挤程度' : lang === 'ko' ? '혼잡도' : 'Crowd Level'} *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {crowdOptions.map(opt => (
                <button
                  key={opt.level}
                  onClick={() => setCrowdLevel(opt.level)}
                  className={`py-2.5 rounded-xl text-center transition-all ${
                    crowdLevel === opt.level
                      ? 'bg-black text-white scale-[1.02]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xl mb-0.5">{opt.emoji}</div>
                  <div className="text-xs">{t(opt.label)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 한줄평 (선택, 보상 UP) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              💬 {lang === 'cn' ? '一句话评价' : lang === 'ko' ? '한줄평' : 'Comment'}
              <span className="text-xs text-green-600 font-normal">
                {lang === 'cn' ? '写了奖励更多！' : lang === 'ko' ? '작성하면 보상 UP!' : 'More rewards!'}
              </span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={lang === 'cn' ? '分享你的体验...' : lang === 'ko' ? '경험을 공유해주세요...' : 'Share your experience...'}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10"
              maxLength={300}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{comment.length}/300</div>
          </div>

          {/* 사진 (선택, 보상 MAX) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Camera size={14} />
              {lang === 'cn' ? '添加照片' : lang === 'ko' ? '사진 추가' : 'Photos'}
              <span className="text-xs text-amber-600 font-normal">
                {lang === 'cn' ? '有照片=高级盒子🎁' : lang === 'ko' ? '사진=프리미엄 박스🎁' : 'Photos = Premium Box🎁'}
              </span>
            </label>
            <div className="flex gap-2">
              {photos.map((url, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={url} alt="" className="w-full h-full rounded-lg object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500"
                >
                  <Camera size={24} />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          {/* 태그 (선택) */}
          <div>
            <button
              onClick={() => setShowTags(!showTags)}
              className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
            >
              <Tag size={14} />
              {lang === 'cn' ? '添加标签' : lang === 'ko' ? '태그 추가' : 'Tags'}
              <ChevronDown size={14} className={`transition-transform ${showTags ? 'rotate-180' : ''}`} />
            </button>
            {showTags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {REVIEW_TAGS.map(tag => (
                  <button
                    key={tag.code}
                    onClick={() => toggleTag(tag.code)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      selectedTags.includes(tag.code)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag.emoji} {t(tag.label)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 보상 미리보기 */}
          <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3">
            <Gift size={20} className="text-amber-600 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <div className="font-medium mb-0.5">
                {lang === 'cn' ? '🎁 预计奖励' : lang === 'ko' ? '🎁 예상 보상' : '🎁 Expected Reward'}
              </div>
              {(() => {
                const tier = getReviewTier()
                const info = REWARD_TIERS[tier]
                return (
                  <span>
                    {t(info.label)} ({info.points[0]}~{info.points[1]}P)
                  </span>
                )
              })()}
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-3.5 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-gray-500 active:scale-[0.98] transition-all"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={16} />
                {lang === 'cn' ? '提交并领取随机盒子 🎁' : lang === 'ko' ? '제출하고 랜덤박스 받기 🎁' : 'Submit & Get Random Box 🎁'}
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // ── 랜덤박스 보상 화면 ──
  if (step === 'reward' && reward) {
    const tierInfo = REWARD_TIERS[reward.tier] || REWARD_TIERS.mini
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-6">
        {/* 박스 오픈 애니메이션 */}
        <div className="animate-bounce-reward mb-6">
          <div className="text-7xl">🎁</div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {lang === 'cn' ? '恭喜！' : lang === 'ko' ? '축하합니다!' : 'Congratulations!'}
        </h2>

        <div className="text-lg text-gray-700 mb-1">
          {t(tierInfo.label)}
        </div>

        <div className="text-3xl font-bold text-amber-600 mb-4">
          +{reward.detail}
        </div>

        <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
          {reward.tier === 'premium'
            ? (lang === 'cn' ? '照片评价 = 最高奖励！感谢您的分享 📸' : lang === 'ko' ? '사진 리뷰 = 최고 보상! 공유 감사해요 📸' : 'Photo review = Top reward! Thanks for sharing 📸')
            : (lang === 'cn' ? '下次附上照片，可以获得更多奖励哦！' : lang === 'ko' ? '다음엔 사진도 함께하면 보상이 더 커져요!' : 'Add photos next time for bigger rewards!')
          }
        </p>

        <button
          onClick={onClose}
          className="w-full max-w-xs py-3.5 bg-black text-white rounded-xl font-medium active:scale-[0.98] transition-all"
        >
          {lang === 'cn' ? '查看周边推荐 →' : lang === 'ko' ? '주변 추천 보기 →' : 'See Nearby Picks →'}
        </button>

        <button
          onClick={onClose}
          className="mt-3 text-sm text-gray-400"
        >
          {lang === 'cn' ? '关闭' : lang === 'ko' ? '닫기' : 'Close'}
        </button>

        <style>{`
          @keyframes bounce-reward {
            0% { transform: scale(0) rotate(-10deg); }
            50% { transform: scale(1.2) rotate(5deg); }
            70% { transform: scale(0.9) rotate(-3deg); }
            100% { transform: scale(1) rotate(0); }
          }
          .animate-bounce-reward {
            animation: bounce-reward 0.8s ease-out;
          }
        `}</style>
      </div>
    )
  }

  return null
}
