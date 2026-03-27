/**
 * PopupReviewTab — 팝업 스토어 검수 탭
 * 스크래퍼 DB (jwnnmauwweicvdkltdao) popup_stores 테이블 기반
 */
import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, X, MapPin, Calendar, Tag, ExternalLink, Check, Ban, Clock } from 'lucide-react'
import PopupReviewDetail from './PopupReviewDetail'

// ─── 지역 키워드 맵 ───
const AREA_OPTIONS = [
  { value: '', label: '전체 지역' },
  { value: '성수', label: '성수' },
  { value: '홍대', label: '홍대' },
  { value: '강남', label: '강남' },
  { value: '명동', label: '명동' },
  { value: '한남', label: '한남' },
  { value: '이태원', label: '이태원' },
  { value: '잠실', label: '잠실' },
]

const SOURCE_OPTIONS = [
  { value: '', label: '전체 소스' },
  { value: 'dayforyou', label: 'dayforyou' },
  { value: 'popply', label: 'popply' },
  { value: 'instagram', label: 'instagram' },
]

const STATUS_BADGE = {
  pending:  { bg: '#FFF8E1', color: '#F9A825', label: '대기' },
  approved: { bg: '#E8F5E9', color: '#43A047', label: '승인' },
  rejected: { bg: '#FFEBEE', color: '#E53935', label: '거절' },
}

const STATUS_OPTIONS = [
  { value: 'pending',  label: '대기' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '거절' },
]

function statusBadge(status) {
  const b = STATUS_BADGE[status]
  return b
    ? <span style={{ backgroundColor: b.bg, color: b.color }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold">{b.label}</span>
    : <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">{status}</span>
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return dateStr.slice(0, 10).replace(/-/g, '.')
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getMonth()+1}/${d.getDate()}`
}

// ─── 상세 모달 ───
function DetailModal({ item, onClose, onApprove, onReject, loading }) {
  const [note, setNote] = useState('')

  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{item.name || item.name_ko || '(이름 없음)'}</h3>
            <div className="flex items-center gap-2 mt-1">
              {statusBadge(item.review_status || 'pending')}
              <span className="text-xs text-gray-400">ID: {item.id}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* 이미지 */}
        {(item.image_url || item.thumbnail_url) && (
          <div className="h-48 overflow-hidden">
            <img
              src={item.image_url || item.thumbnail_url}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
        )}

        {/* 상세 정보 */}
        <div className="p-5 space-y-4">
          {/* 주소 */}
          <div className="flex gap-2">
            <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700">{item.address || item.address_ko || '-'}</p>
              {(item.lat && item.lng) && (
                <a
                  href={`https://maps.google.com/?q=${item.lat},${item.lng}`}
                  target="_blank" rel="noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                >
                  지도 보기 <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>

          {/* 기간 */}
          <div className="flex gap-2">
            <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              {formatDate(item.start_date || item.start)} ~ {formatDate(item.end_date || item.end)}
            </p>
          </div>

          {/* 소스 & 수집일 */}
          <div className="flex gap-2">
            <Tag size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              소스: <span className="font-medium">{item.source || '-'}</span>
              &nbsp;·&nbsp; 수집일: {formatDate(item.created_at || item.scraped_at)}
            </p>
          </div>

          {/* 설명 */}
          {(item.description || item.description_ko) && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description || item.description_ko}
              </p>
            </div>
          )}

          {/* 원본 URL */}
          {item.url && (
            <a
              href={item.url}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              원본 링크 <ExternalLink size={13} />
            </a>
          )}

          {/* 기존 검수 메모 */}
          {item.review_note && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-700 mb-1">이전 검수 메모</p>
              <p className="text-sm text-amber-800">{item.review_note}</p>
            </div>
          )}

          {/* 메모 입력 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">검수 메모 (선택)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="거절 사유나 메모를 입력하세요..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 resize-none"
            />
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={() => onReject(item.id, note)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Ban size={15} /> 거절
          </button>
          <button
            onClick={() => onApprove(item.id, note)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Check size={15} /> 승인
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 팝업 카드 ───
function PopupCard({ item, onClick }) {
  const name = item.name || item.name_ko || '(이름 없음)'
  const address = item.address || item.address_ko || '-'
  const status = item.review_status || 'pending'

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#3182F6] hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onClick(item)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {statusBadge(status)}
            <span className="text-xs text-gray-400">{item.source || '-'}</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 truncate">{name}</h4>
          <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1">
            <MapPin size={11} className="flex-shrink-0" /> {address}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(item.start_date || item.start)} ~ {formatDate(item.end_date || item.end)}
            </span>
            <span className="text-gray-300">·</span>
            <span>수집 {formatDateShort(item.created_at || item.scraped_at)}</span>
          </div>
        </div>
        {(item.image_url || item.thumbnail_url) && (
          <img
            src={item.image_url || item.thumbnail_url}
            alt={name}
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            onError={e => { e.target.style.display = 'none' }}
          />
        )}
      </div>
    </div>
  )
}

// ─── 메인 탭 ───
export default function PopupReviewTab({ supabaseScraper, supabaseNear }) {
  const [detailItem, setDetailItem] = useState(null)  // null = 리스트, item = 상세

  const [popups, setPopups] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('pending')
  const [filterSource, setFilterSource] = useState('')
  const [filterArea, setFilterArea] = useState('')

  const [selected, setSelected] = useState(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // ─── 데이터 fetch ───
  const fetchPopups = useCallback(async () => {
    if (!supabaseScraper) { setError('Supabase 스크래퍼 클라이언트가 없습니다. .env를 확인하세요.'); return }
    setLoading(true)
    setError('')
    try {
      let query = supabaseScraper
        .from('popup_stores')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterStatus) query = query.eq('review_status', filterStatus)
      if (filterSource) query = query.eq('source', filterSource)
      if (filterArea) query = query.ilike('address', `%${filterArea}%`)

      const { data, error: err } = await query
      if (err) throw err
      setPopups(data || [])

      // 통계 집계
      const { data: all } = await supabaseScraper.from('popup_stores').select('review_status')
      if (all) {
        const s = { total: all.length, pending: 0, approved: 0, rejected: 0 }
        all.forEach(r => { if (s[r.review_status] !== undefined) s[r.review_status]++ })
        setStats(s)
      }
    } catch (e) {
      setError(e.message || '데이터를 불러오지 못했습니다.')
    }
    setLoading(false)
  }, [supabaseScraper, filterStatus, filterSource, filterArea])

  useEffect(() => { fetchPopups() }, [fetchPopups])

  // ─── 클라이언트 사이드 검색 필터 ───
  const filtered = popups.filter(p => {
    if (!search.trim()) return true
    const name = (p.name || p.name_ko || '').toLowerCase()
    const addr = (p.address || p.address_ko || '').toLowerCase()
    return name.includes(search.toLowerCase()) || addr.includes(search.toLowerCase())
  })

  // ─── 승인 / 거절 ───
  const handleApprove = async (id, note) => {
    setActionLoading(true)
    const { error: err } = await supabaseScraper
      .from('popup_stores')
      .update({ review_status: 'approved', reviewed_at: new Date().toISOString(), review_note: note || null })
      .eq('id', id)
    setActionLoading(false)
    if (err) { showToast(`오류: ${err.message}`); return }
    showToast('✅ 승인 완료')
    setSelected(null)
    fetchPopups()
  }

  const handleReject = async (id, note) => {
    setActionLoading(true)
    const { error: err } = await supabaseScraper
      .from('popup_stores')
      .update({ review_status: 'rejected', reviewed_at: new Date().toISOString(), review_note: note || null })
      .eq('id', id)
    setActionLoading(false)
    if (err) { showToast(`오류: ${err.message}`); return }
    showToast('🚫 거절 처리 완료')
    setSelected(null)
    fetchPopups()
  }

  // ─── 상세 뷰 ───
  if (detailItem) {
    return (
      <PopupReviewDetail
        item={detailItem}
        supabaseNear={supabaseNear}
        supabaseScraper={supabaseScraper}
        onBack={() => setDetailItem(null)}
        onDone={() => { setDetailItem(null); fetchPopups() }}
      />
    )
  }

  return (
    <div className="space-y-4">

      {/* ─── 필터 바 ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row gap-3">
        {/* 검색 */}
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="매장명, 주소 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* 상태 필터 */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">전체 상태</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* 소스 필터 */}
        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* 지역 필터 */}
        <select
          value={filterArea}
          onChange={e => setFilterArea(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          {AREA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* 새로고침 */}
        <button
          onClick={fetchPopups}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors text-sm font-medium flex-shrink-0"
          style={{ backgroundColor: '#3182F6' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </div>

      {/* ─── 에러 ─── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-2">
          <X size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">연결 오류</p>
            <p className="mt-0.5">{error}</p>
            <p className="mt-1 text-xs text-red-500">.env의 VITE_SCRAPER_SUPABASE_ANON_KEY를 확인하세요.</p>
          </div>
        </div>
      )}

      {/* ─── 카드 리스트 ─── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <Clock size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {error ? '데이터를 불러올 수 없습니다.' : '해당 조건의 팝업이 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <PopupCard key={item.id} item={item} onClick={setDetailItem} />
          ))}
        </div>
      )}

      {/* ─── 통계 바 ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 text-sm justify-center">
          <span className="text-gray-500">전체 <strong className="text-gray-900">{stats.total}</strong>건</span>
          <span className="text-gray-300">|</span>
          <span className="text-yellow-600">대기 <strong>{stats.pending}</strong>건</span>
          <span className="text-gray-300">|</span>
          <span className="text-green-600">승인 <strong>{stats.approved}</strong>건</span>
          <span className="text-gray-300">|</span>
          <span className="text-red-500">거절 <strong>{stats.rejected}</strong>건</span>
          {!loading && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-blue-500">표시 <strong>{filtered.length}</strong>건</span>
            </>
          )}
        </div>
      </div>

      {/* ─── 상세 모달 ─── */}
      <DetailModal
        item={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />

      {/* ─── 토스트 ─── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-full text-sm shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
