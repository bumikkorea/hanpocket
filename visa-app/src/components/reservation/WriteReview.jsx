// NEAR 리뷰 작성 — 5개 세부평점 + 텍스트 + 사진
import { useState } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { REVIEW_CRITERIA, MOCK_SHOPS, MOCK_STYLISTS } from '../../data/reservationData'
import { Star } from 'lucide-react'

const SUB_RATING_KEYS = ['skill', 'service', 'ambiance', 'cleanliness', 'value']
const RATE_I18N = {
  skill: 'rateSkill',
  service: 'rateService',
  ambiance: 'rateAmbiance',
  cleanliness: 'rateCleanliness',
  value: 'rateValue',
}

export default function WriteReview({ lang, reservation, onSubmit, onBack }) {
  const [overall, setOverall] = useState(5)
  const [subRatings, setSubRatings] = useState({ skill: 5, service: 5, ambiance: 5, cleanliness: 5, value: 5 })
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const shop = MOCK_SHOPS.find(s => s.id === reservation?.shopId)
  const stylist = MOCK_STYLISTS.find(s => s.id === reservation?.stylistId)

  const handleSubRating = (key, val) => {
    const next = { ...subRatings, [key]: val }
    setSubRatings(next)
    // 전체 평점 = 세부 평균 (반올림)
    const avg = Object.values(next).reduce((a, b) => a + b, 0) / Object.values(next).length
    setOverall(Math.round(avg))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const review = {
      id: 'rev-' + Date.now().toString(36),
      shopId: reservation.shopId,
      reservationId: reservation.id,
      customerId: reservation.customerId || 'self',
      customerName: '我', // 실제론 프로필에서 가져옴
      stylistId: reservation.stylistId,
      overallRating: overall,
      subRatings,
      content,
      photos: [],
      isVerified: true,
      ownerReply: null,
      ownerReplyAt: null,
      createdAt: new Date().toISOString(),
    }
    // localStorage에 저장
    try {
      const stored = JSON.parse(localStorage.getItem('near_reviews') || '[]')
      stored.unshift(review)
      localStorage.setItem('near_reviews', JSON.stringify(stored))
    } catch { /* ignore */ }

    await new Promise(r => setTimeout(r, 500))
    setSubmitting(false)
    onSubmit(review)
  }

  const StarRow = ({ value, onChange, size = 20 }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onChange(s)} className="p-0.5">
          <Star
            size={size}
            fill={s <= value ? '#F59E0B' : 'none'}
            color={s <= value ? '#F59E0B' : '#D1D5DB'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )

  return (
    <div className="px-5 pb-20">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-4" style={{ color: '#666' }}>
        ← {T.back[lang]}
      </button>

      <h2 className="text-[18px] font-bold mb-1" style={{ color: '#111' }}>{T.writeReview[lang]}</h2>
      {shop && (
        <p className="text-[13px] mb-5" style={{ color: '#999' }}>
          {shop.name[lang]} {stylist ? `· ${stylist.name}` : ''}
        </p>
      )}

      {/* 전체 평점 */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <p className="text-[13px] font-medium mb-3" style={{ color: '#111' }}>{T.overallRating[lang]}</p>
        <div className="flex items-center gap-3">
          <StarRow value={overall} onChange={setOverall} size={28} />
          <span className="text-[20px] font-bold" style={{ color: '#F59E0B' }}>{overall}</span>
        </div>
      </div>

      {/* 세부 평점 */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <p className="text-[13px] font-medium mb-4" style={{ color: '#111' }}>{T.detailedRating[lang]}</p>
        <div className="space-y-3">
          {SUB_RATING_KEYS.map(key => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[13px]" style={{ color: '#666' }}>{T[RATE_I18N[key]][lang]}</span>
              <StarRow value={subRatings[key]} onChange={(v) => handleSubRating(key, v)} size={18} />
            </div>
          ))}
        </div>
      </div>

      {/* 리뷰 내용 */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <p className="text-[13px] font-medium mb-2" style={{ color: '#111' }}>{T.reviewContent[lang]}</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={T.reviewPlaceholder[lang]}
          className="w-full px-3 py-2.5 rounded-xl text-[13px] border resize-none h-24"
          style={{ borderColor: '#E5E7EB', color: '#111' }}
        />
      </div>

      {/* 제출 */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !content.trim()}
        className="w-full py-3.5 rounded-2xl text-[15px] font-semibold text-white transition-all active:scale-[0.98]"
        style={{ backgroundColor: submitting || !content.trim() ? '#D1D5DB' : '#111' }}
      >
        {submitting
          ? (lang === 'zh' ? '提交中...' : lang === 'ko' ? '등록 중...' : 'Submitting...')
          : T.submitReview[lang]
        }
      </button>
    </div>
  )
}
