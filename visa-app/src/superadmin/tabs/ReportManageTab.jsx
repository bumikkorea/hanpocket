import { useState, useEffect, useMemo } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Trash2, Eye, RefreshCw } from 'lucide-react'

const REASON_LABELS = {
  closed: '폐업',
  wrong_location: '위치오류',
  wrong_info: '정보오류',
  other: '기타',
}

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  resolved: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-600',
}

export default function ReportManageTab({ supabaseNear }) {
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('pending') // pending | resolved | dismissed | all
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)

  const loadReports = async () => {
    setLoading(true)
    try {
      if (supabaseNear) {
        const { data, error } = await supabaseNear
          .from('place_reports')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && data) {
          setReports(data)
          setLoading(false)
          return
        }
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using localStorage', e)
    }

    // localStorage fallback
    const local = JSON.parse(localStorage.getItem('place_reports') || '[]')
    setReports(local.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    setLoading(false)
  }

  useEffect(() => { loadReports() }, [])

  // Group by place_id with count
  const grouped = useMemo(() => {
    const map = {}
    reports.forEach(r => {
      if (!map[r.place_id]) {
        map[r.place_id] = { place_id: r.place_id, place_name: r.place_name, reports: [], count: 0, pendingCount: 0 }
      }
      map[r.place_id].reports.push(r)
      map[r.place_id].count++
      if (r.status === 'pending') map[r.place_id].pendingCount++
    })
    return Object.values(map).sort((a, b) => b.pendingCount - a.pendingCount || b.count - a.count)
  }, [reports])

  const filteredReports = useMemo(() => {
    if (filter === 'all') return reports
    return reports.filter(r => r.status === filter)
  }, [reports, filter])

  const pendingTotal = reports.filter(r => r.status === 'pending').length

  const updateStatus = async (reportId, newStatus) => {
    try {
      if (supabaseNear) {
        await supabaseNear.from('place_reports').update({ status: newStatus }).eq('id', reportId)
      }
    } catch (e) {
      console.warn('Supabase update failed', e)
    }

    // Update localStorage
    const local = JSON.parse(localStorage.getItem('place_reports') || '[]')
    const idx = local.findIndex(r => r.id === reportId)
    if (idx >= 0) {
      local[idx].status = newStatus
      localStorage.setItem('place_reports', JSON.stringify(local))
    }

    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r))
  }

  const bulkResolve = async (placeId) => {
    const toResolve = reports.filter(r => r.place_id === placeId && r.status === 'pending')
    for (const r of toResolve) {
      await updateStatus(r.id, 'resolved')
    }
  }

  const bulkDismiss = async (placeId) => {
    const toDismiss = reports.filter(r => r.place_id === placeId && r.status === 'pending')
    for (const r of toDismiss) {
      await updateStatus(r.id, 'dismissed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">신고 관리</h2>
          <p className="text-sm text-gray-500 mt-1">
            총 {reports.length}건 · 대기 중 <span className="font-semibold text-amber-600">{pendingTotal}건</span>
          </p>
        </div>
        <button onClick={loadReports} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50">
          <RefreshCw size={14} />
          새로고침
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { id: 'pending', label: '대기 중' },
          { id: 'resolved', label: '처리완료' },
          { id: 'dismissed', label: '기각' },
          { id: 'all', label: '전체' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {f.id === 'pending' && pendingTotal > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px]">{pendingTotal}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <>
          {/* Grouped by place */}
          {filter === 'pending' && (
            <div className="space-y-3">
              {grouped.filter(g => g.pendingCount > 0).map(g => (
                <div
                  key={g.place_id}
                  className={`bg-white border rounded-xl p-4 ${g.count >= 10 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{g.place_name || g.place_id}</h3>
                      <p className="text-xs text-gray-500">
                        신고 {g.count}건 · 대기 {g.pendingCount}건
                        {g.count >= 10 && <span className="ml-2 text-red-600 font-semibold">주의</span>}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => bulkResolve(g.place_id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100"
                      >
                        <CheckCircle size={12} /> 처리
                      </button>
                      <button
                        onClick={() => bulkDismiss(g.place_id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100"
                      >
                        <XCircle size={12} /> 기각
                      </button>
                    </div>
                  </div>

                  {/* Individual reports */}
                  <div className="space-y-1.5 mt-3">
                    {g.reports.filter(r => r.status === 'pending').map(r => (
                      <div key={r.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">
                            {REASON_LABELS[r.reason] || r.reason}
                          </span>
                          {r.detail && <span className="text-gray-500 truncate max-w-[200px]">{r.detail}</span>}
                        </div>
                        <span className="text-gray-400 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString('ko')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {grouped.filter(g => g.pendingCount > 0).length === 0 && (
                <div className="text-center py-12 text-gray-400">대기 중인 신고가 없습니다</div>
              )}
            </div>
          )}

          {/* Flat list for resolved/dismissed/all */}
          {filter !== 'pending' && (
            <div className="space-y-2">
              {filteredReports.map(r => (
                <div key={r.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-900 truncate">{r.place_name || r.place_id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_STYLES[r.status]}`}>
                        {r.status === 'pending' ? '대기' : r.status === 'resolved' ? '처리' : '기각'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{REASON_LABELS[r.reason] || r.reason}</span>
                      {r.detail && <span className="truncate max-w-[200px]">· {r.detail}</span>}
                      <span>· {new Date(r.created_at).toLocaleDateString('ko')}</span>
                    </div>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-1.5 ml-2">
                      <button onClick={() => updateStatus(r.id, 'resolved')} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => updateStatus(r.id, 'dismissed')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {filteredReports.length === 0 && (
                <div className="text-center py-12 text-gray-400">해당 상태의 신고가 없습니다</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/**
 * 네비게이션 뱃지용 pending count 가져오기
 */
export function useReportPendingCount(supabaseNear) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        if (supabaseNear) {
          const { count: c, error } = await supabaseNear
            .from('place_reports')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
          if (!error && c != null) { setCount(c); return }
        }
      } catch (e) {}
      const local = JSON.parse(localStorage.getItem('place_reports') || '[]')
      setCount(local.filter(r => r.status === 'pending').length)
    }
    load()
  }, [supabaseNear])

  return count
}
