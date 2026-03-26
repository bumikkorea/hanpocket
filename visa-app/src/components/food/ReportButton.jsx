import { useState } from 'react'
import { Flag, X, AlertTriangle, CheckCircle } from 'lucide-react'

const REPORT_REASONS = [
  { id: 'closed', label: { ko: '폐업', zh: '已关闭', en: 'Permanently Closed' } },
  { id: 'wrong_location', label: { ko: '위치오류', zh: '位置错误', en: 'Wrong Location' } },
  { id: 'wrong_info', label: { ko: '정보오류', zh: '信息错误', en: 'Wrong Information' } },
  { id: 'other', label: { ko: '기타', zh: '其他', en: 'Other' } },
]

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

/**
 * 신고하기 버튼 + 모달
 * localStorage fallback (Supabase 연동 준비됨)
 */
export default function ReportButton({ placeId, placeName, lang = 'ko', supabase }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const userId = localStorage.getItem('near_device_id') || 'anonymous'
  const reportKey = `report_${userId}_${placeId}`
  const alreadyReported = !!localStorage.getItem(reportKey)

  const handleSubmit = async () => {
    if (!reason) return
    setLoading(true)

    const report = {
      place_id: placeId,
      place_name: placeName,
      reason,
      detail: detail.trim(),
      user_id: userId,
      created_at: new Date().toISOString(),
      status: 'pending',
    }

    try {
      if (supabase) {
        await supabase.from('place_reports').insert(report)
      }
    } catch (e) {
      console.warn('Supabase insert failed, using localStorage fallback', e)
    }

    // localStorage fallback & duplicate prevention
    localStorage.setItem(reportKey, JSON.stringify(report))

    // Append to local reports list for admin
    const existing = JSON.parse(localStorage.getItem('place_reports') || '[]')
    existing.push({ ...report, id: Date.now() })
    localStorage.setItem('place_reports', JSON.stringify(existing))

    setLoading(false)
    setSubmitted(true)
    setTimeout(() => { setOpen(false); setSubmitted(false); setReason(''); setDetail('') }, 1500)
  }

  if (alreadyReported) {
    return (
      <button disabled className="flex items-center gap-1 text-[11px] text-gray-400 px-2 py-1 rounded-full border border-gray-200 cursor-not-allowed">
        <Flag size={12} />
        {L(lang, { ko: '신고완료', zh: '已举报', en: 'Reported' })}
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-red-500 px-2 py-1 rounded-full border border-gray-200 hover:border-red-300 transition-colors"
      >
        <Flag size={12} />
        {L(lang, { ko: '신고', zh: '举报', en: 'Report' })}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-t-2xl p-5 space-y-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            {submitted ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <CheckCircle size={40} className="text-green-500" />
                <p className="text-sm font-semibold">{L(lang, { ko: '신고가 접수되었습니다', zh: '举报已提交', en: 'Report submitted' })}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    {L(lang, { ko: '신고하기', zh: '举报', en: 'Report Issue' })}
                  </h3>
                  <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-gray-500 truncate">{placeName}</p>

                <div className="space-y-2">
                  <p className="text-sm font-medium">{L(lang, { ko: '사유 선택', zh: '选择原因', en: 'Select reason' })}</p>
                  {REPORT_REASONS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        reason === r.id
                          ? 'bg-red-50 text-red-700 border border-red-200 font-semibold'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      {L(lang, r.label)}
                    </button>
                  ))}
                </div>

                <textarea
                  value={detail}
                  onChange={e => setDetail(e.target.value)}
                  placeholder={L(lang, { ko: '상세 내용 (선택)', zh: '详情（选填）', en: 'Details (optional)' })}
                  rows={2}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 resize-none"
                />

                <button
                  onClick={handleSubmit}
                  disabled={!reason || loading}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-red-500 rounded-full disabled:bg-gray-300 active:scale-95 transition-all"
                >
                  {loading
                    ? L(lang, { ko: '제출 중...', zh: '提交中...', en: 'Submitting...' })
                    : L(lang, { ko: '신고 제출', zh: '提交举报', en: 'Submit Report' })}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
