// NEAR 리뷰 목록 — 평점분포 + 세부평점 + 인증뱃지 + 업주답글 + 정렬
import { useState, useMemo } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { MOCK_REVIEWS, MOCK_STYLISTS, REVIEW_CRITERIA } from '../../data/reservationData'
import { Star, ShieldCheck, MessageSquare } from 'lucide-react'

export default function ReviewList({ lang, shopId, onBack }) {
  const [sort, setSort] = useState('latest') // latest | highest | lowest
  const [filter, setFilter] = useState('all') // all | photo

  // localStorage + 목업 합치기
  const allReviews = useMemo(() => {
    let stored = []
    try { stored = JSON.parse(localStorage.getItem('near_reviews') || '[]') } catch { /* */ }
    return [...stored, ...MOCK_REVIEWS].filter(r => r.shopId === shopId)
  }, [shopId])

  const reviews = useMemo(() => {
    let list = [...allReviews]
    if (filter === 'photo') list = list.filter(r => r.photos?.length > 0)
    if (sort === 'latest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sort === 'highest') list.sort((a, b) => b.overallRating - a.overallRating)
    else if (sort === 'lowest') list.sort((a, b) => a.overallRating - b.overallRating)
    return list
  }, [allReviews, sort, filter])

  // 평균 + 분포
  const stats = useMemo(() => {
    if (allReviews.length === 0) return null
    const avg = allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length
    const dist = [0, 0, 0, 0, 0]
    allReviews.forEach(r => { dist[r.overallRating - 1]++ })

    // 세부 평균
    const subAvg = {}
    REVIEW_CRITERIA.forEach(c => {
      const vals = allReviews.filter(r => r.subRatings?.[c.id]).map(r => r.subRatings[c.id])
      subAvg[c.id] = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-'
    })

    return { avg: avg.toFixed(1), total: allReviews.length, dist, subAvg }
  }, [allReviews])

  const SORT_OPTIONS = [
    { id: 'latest', label: T.sortLatest },
    { id: 'highest', label: T.sortHighest },
    { id: 'lowest', label: T.sortLowest },
  ]

  return (
    <div className="px-5 pb-20">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-4" style={{ color: '#666' }}>
        ← {T.back[lang]}
      </button>

      <h2 className="text-[18px] font-bold mb-4" style={{ color: '#111' }}>{T.reviews[lang]}</h2>

      {/* 평점 요약 */}
      {stats && (
        <div className="bg-white rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-[32px] font-bold" style={{ color: '#111' }}>{stats.avg}</p>
              <div className="flex gap-0.5 justify-center mb-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={14} fill={s <= Math.round(stats.avg) ? '#F59E0B' : 'none'} color={s <= Math.round(stats.avg) ? '#F59E0B' : '#D1D5DB'} strokeWidth={1.5} />
                ))}
              </div>
              <p className="text-[11px]" style={{ color: '#999' }}>{stats.total}{T.reviewCount[lang]}</p>
            </div>
            {/* 분포 바 */}
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.dist[star - 1]
                const pct = stats.total ? (count / stats.total) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[11px] w-3 text-right" style={{ color: '#999' }}>{star}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: '#F59E0B' }} />
                    </div>
                    <span className="text-[10px] w-4" style={{ color: '#999' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 세부 평점 평균 */}
          <div className="grid grid-cols-5 gap-2 pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
            {REVIEW_CRITERIA.map(c => (
              <div key={c.id} className="text-center">
                <p className="text-[11px] mb-0.5" style={{ color: '#999' }}>{c.label[lang]}</p>
                <p className="text-[14px] font-semibold" style={{ color: '#111' }}>{stats.subAvg[c.id]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 필터 + 정렬 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className="px-3 py-1 rounded-full text-[11px] font-medium"
            style={{ backgroundColor: filter === 'all' ? '#111' : '#F3F4F6', color: filter === 'all' ? '#fff' : '#666' }}
          >
            {T.allReviews[lang]}
          </button>
          <button
            onClick={() => setFilter('photo')}
            className="px-3 py-1 rounded-full text-[11px] font-medium"
            style={{ backgroundColor: filter === 'photo' ? '#111' : '#F3F4F6', color: filter === 'photo' ? '#fff' : '#666' }}
          >
            {T.photoReviews[lang]}
          </button>
        </div>
        <div className="flex gap-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSort(opt.id)}
              className="px-2 py-0.5 text-[10px] rounded"
              style={{ color: sort === opt.id ? '#111' : '#999', fontWeight: sort === opt.id ? 600 : 400 }}
            >
              {opt.label[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-3">
        {reviews.length === 0 && (
          <p className="text-center py-10 text-[13px]" style={{ color: '#999' }}>{T.noReviews[lang]}</p>
        )}

        {reviews.map(review => {
          const stylist = MOCK_STYLISTS.find(s => s.id === review.stylistId)
          const dateStr = new Date(review.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ko' ? 'ko-KR' : 'en-US')

          return (
            <div key={review.id} className="bg-white rounded-2xl p-4">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium" style={{ color: '#111' }}>{review.customerName}</span>
                  {review.isVerified && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>
                      <ShieldCheck size={10} /> {T.verifiedVisit[lang]}
                    </span>
                  )}
                </div>
                <span className="text-[11px]" style={{ color: '#999' }}>{dateStr}</span>
              </div>

              {/* 별점 */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} fill={s <= review.overallRating ? '#F59E0B' : 'none'} color={s <= review.overallRating ? '#F59E0B' : '#D1D5DB'} strokeWidth={1.5} />
                  ))}
                </div>
                {stylist && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#F3F4F6', color: '#666' }}>
                    {stylist.name}
                  </span>
                )}
              </div>

              {/* 세부 평점 (컴팩트) */}
              {review.subRatings && (
                <div className="flex gap-3 mb-2">
                  {REVIEW_CRITERIA.map(c => (
                    <span key={c.id} className="text-[10px]" style={{ color: '#999' }}>
                      {c.label[lang]} {review.subRatings[c.id]}
                    </span>
                  ))}
                </div>
              )}

              {/* 내용 */}
              <p className="text-[13px] leading-relaxed mb-2" style={{ color: '#333' }}>{review.content}</p>

              {/* 업주 답글 */}
              {review.ownerReply && (
                <div className="bg-gray-50 rounded-xl p-3 mt-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageSquare size={12} color="#666" />
                    <span className="text-[11px] font-medium" style={{ color: '#666' }}>{T.ownerReply[lang]}</span>
                  </div>
                  <p className="text-[12px]" style={{ color: '#666' }}>{review.ownerReply}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
