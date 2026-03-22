/**
 * PopupNearManage — NEAR DB 팝업 목록 관리
 * 검색/필터, 수정(모달), 삭제, CSV 다운로드/업로드
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Pencil, Trash2, Download, Upload, RefreshCw, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import PopupFormFields, { CATEGORIES, DISTRICTS, emptyForm, formToInsert } from './PopupFormFields'

const PAGE_SIZE = 20

// ─── CSV 유틸 ───
const CSV_HEADERS = ['id','name_ko','name_zh','name_en','category','district','address_ko','start_date','end_date','open_time','close_time','lat','lng','image_url','is_temporary','has_alipay','has_wechat_pay','has_union_pay','has_visa','has_tax_refund','has_reservation','has_chinese_staff','has_chinese_menu','created_at']

function toCSV(rows) {
  const esc = v => v == null ? '' : String(v).includes(',') || String(v).includes('"') || String(v).includes('\n') ? `"${String(v).replace(/"/g,'""')}"` : String(v)
  return [CSV_HEADERS.join(','), ...rows.map(r => CSV_HEADERS.map(h => esc(r[h])).join(','))].join('\n')
}

function downloadCSV(data, filename) {
  const blob = new Blob(['\uFEFF' + data], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(Boolean)
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim())
  const rows = lines.slice(1).map(line => {
    const vals = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') { inQ = !inQ }
      else if (c === ',' && !inQ) { vals.push(cur); cur = '' }
      else cur += c
    }
    vals.push(cur)
    return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.replace(/^"|"$/g,'') ?? '']))
  })
  return { headers, rows }
}

function csvRowToInsert(row) {
  const bool = (v) => v === 'true' || v === '1' || v === 'TRUE'
  const num  = (v) => v && !isNaN(v) ? parseFloat(v) : null
  return {
    name_ko:           row.name_ko || null,
    name_zh:           row.name_zh || row.name_ko || '',
    name_en:           row.name_en || null,
    category:          row.category || 'popup',
    district:          row.district || null,
    address_ko:        row.address_ko || null,
    address_zh:        row.address_zh || null,
    lat:               num(row.lat),
    lng:               num(row.lng),
    start_date:        row.start_date || null,
    end_date:          row.end_date   || null,
    open_time:         row.open_time  || null,
    close_time:        row.close_time || null,
    image_url:         row.image_url  || null,
    is_temporary:      bool(row.is_temporary),
    has_reservation:   bool(row.has_reservation),
    has_alipay:        bool(row.has_alipay),
    has_wechat_pay:    bool(row.has_wechat_pay),
    has_union_pay:     bool(row.has_union_pay),
    has_visa:          bool(row.has_visa),
    has_tax_refund:    bool(row.has_tax_refund),
    has_chinese_staff: bool(row.has_chinese_staff),
    has_chinese_menu:  bool(row.has_chinese_menu),
  }
}

// ─── 편집 모달 ───
function EditModal({ item, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    name_ko:           item.name_ko  || '',
    name_zh:           item.name_zh  || '',
    name_en:           item.name_en  || '',
    category:          item.category || 'popup',
    district:          item.district || 'other',
    address_ko:        item.address_ko  || '',
    address_zh:        item.address_zh  || '',
    lat:               item.lat  != null ? String(item.lat) : '',
    lng:               item.lng  != null ? String(item.lng) : '',
    start_date:        item.start_date?.slice(0,10) || '',
    end_date:          item.end_date?.slice(0,10)   || '',
    open_time:         item.open_time   || '',
    close_time:        item.close_time  || '',
    image_url:         item.image_url   || '',
    description_zh:    item.description_zh || '',
    is_temporary:      item.is_temporary   ?? true,
    has_reservation:   item.has_reservation   ?? false,
    has_alipay:        item.has_alipay        ?? false,
    has_wechat_pay:    item.has_wechat_pay    ?? false,
    has_union_pay:     item.has_union_pay     ?? false,
    has_visa:          item.has_visa          ?? false,
    has_tax_refund:    item.has_tax_refund    ?? false,
    has_chinese_staff: item.has_chinese_staff ?? false,
    has_chinese_menu:  item.has_chinese_menu  ?? false,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">팝업 수정</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <PopupFormFields form={form} onChange={setForm} />
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">취소</button>
          <button onClick={() => onSave(form)} disabled={loading} className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50" style={{ backgroundColor: '#C4725A' }}>
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 삭제 확인 모달 ───
function DeleteModal({ item, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">팝업 삭제</p>
            <p className="text-xs text-gray-500 mt-0.5">"{item.name_ko || item.name_zh}"를 삭제하시겠습니까?</p>
          </div>
        </div>
        <p className="text-xs text-red-500 bg-red-50 rounded-lg p-3 mb-4">이 작업은 되돌릴 수 없습니다. NEAR DB에서 영구 삭제됩니다.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">취소</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50">
            {loading ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CSV 업로드 모달 ───
function CSVUploadModal({ onClose, onUpload, loading, result }) {
  const [parsed, setParsed] = useState(null)
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setParsed(parseCSV(ev.target.result))
    reader.readAsText(file, 'UTF-8')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">CSV 업로드</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* 파일 선택 */}
          <div>
            <p className="text-xs text-gray-500 mb-2">CSV 파일을 선택하세요. 첫 행은 헤더여야 합니다.</p>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="text-sm" />
          </div>

          {/* 컬럼 안내 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-600 mb-1">지원 컬럼</p>
            <p className="text-xs text-gray-500 font-mono leading-relaxed">{CSV_HEADERS.filter(h => h !== 'id' && h !== 'created_at').join(', ')}</p>
          </div>

          {/* 미리보기 */}
          {parsed && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">미리보기 (첫 5행, 총 {parsed.rows.length}행)</p>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="text-xs w-full">
                  <thead className="bg-gray-50">
                    <tr>{parsed.headers.map(h => <th key={h} className="px-2 py-1.5 text-left font-medium text-gray-600 border-b border-gray-200">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0,5).map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {parsed.headers.map(h => <td key={h} className="px-2 py-1 text-gray-700 max-w-[120px] truncate">{row[h] || '-'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 결과 */}
          {result && (
            <div className={`rounded-lg p-3 text-sm font-medium ${result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {result.error ? `❌ ${result.error}` : `✅ 성공 ${result.ok}건 / 실패 ${result.fail}건`}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">닫기</button>
          <button
            onClick={() => parsed && onUpload(parsed.rows)}
            disabled={!parsed || loading}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ backgroundColor: '#C4725A' }}
          >
            {loading ? '업로드 중...' : `업로드 (${parsed?.rows.length ?? 0}건)`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 ───
export default function PopupNearManage({ supabaseNear }) {
  const [popups, setPopups] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState('')

  const [search, setSearch]           = useState('')
  const [filterCat, setFilterCat]     = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [page, setPage]               = useState(1)

  const [editItem, setEditItem]     = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [showCSVUp, setShowCSVUp]   = useState(false)
  const [csvResult, setCsvResult]   = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // ─── Fetch ───
  const fetchPopups = useCallback(async () => {
    if (!supabaseNear) return
    setLoading(true)
    const { data, error } = await supabaseNear
      .from('popups').select('*').order('created_at', { ascending: false }).limit(500)
    setLoading(false)
    if (error) { showToast(`❌ 로드 실패: ${error.message}`); return }
    setPopups(data || [])
  }, [supabaseNear])

  useEffect(() => { fetchPopups() }, [fetchPopups])

  // ─── 필터링 ───
  const filtered = popups.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || (p.name_ko||'').toLowerCase().includes(q)
      || (p.name_zh||'').toLowerCase().includes(q)
      || (p.address_ko||'').toLowerCase().includes(q)
    const matchCat = !filterCat || p.category === filterCat
    const matchDist = !filterDistrict || p.district === filterDistrict
    return matchSearch && matchCat && matchDist
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // 필터 바뀌면 1페이지로
  useEffect(() => setPage(1), [search, filterCat, filterDistrict])

  // ─── 수정 저장 ───
  const handleSave = async (form) => {
    setActionLoading(true)
    const { error } = await supabaseNear.from('popups').update(formToInsert(form)).eq('id', editItem.id)
    setActionLoading(false)
    if (error) { showToast(`❌ 수정 실패: ${error.message}`); return }
    showToast('✅ 수정 완료')
    setEditItem(null)
    fetchPopups()
  }

  // ─── 삭제 ───
  const handleDelete = async () => {
    setActionLoading(true)
    const { error } = await supabaseNear.from('popups').delete().eq('id', deleteItem.id)
    setActionLoading(false)
    if (error) { showToast(`❌ 삭제 실패: ${error.message}`); return }
    showToast('🗑 삭제 완료')
    setDeleteItem(null)
    fetchPopups()
  }

  // ─── CSV 다운로드 ───
  const handleDownload = () => {
    downloadCSV(toCSV(filtered), `near_popups_${new Date().toISOString().slice(0,10)}.csv`)
  }

  // ─── CSV 업로드 ───
  const handleCSVUpload = async (rows) => {
    setActionLoading(true); setCsvResult(null)
    let ok = 0, fail = 0
    // 50개씩 배치 INSERT
    const BATCH = 50
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH).map(csvRowToInsert).filter(r => r.name_ko || r.name_zh)
      if (batch.length === 0) continue
      const { error } = await supabaseNear.from('popups').insert(batch)
      if (error) fail += batch.length; else ok += batch.length
    }
    setActionLoading(false)
    setCsvResult({ ok, fail })
    if (ok > 0) fetchPopups()
  }

  return (
    <div className="space-y-4">

      {/* ─── 필터 바 ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input type="text" placeholder="매장명, 주소 검색..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-sm flex-1" />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-gray-400" /></button>}
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="">전체 카테고리</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="">전체 지역</option>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download size={14} /> CSV↓
          </button>
          <button onClick={() => { setShowCSVUp(true); setCsvResult(null) }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm" style={{ border: '1px solid #C4725A', color: '#C4725A' }}>
            <Upload size={14} /> CSV↑
          </button>
          <button onClick={fetchPopups} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm disabled:opacity-50" style={{ backgroundColor: '#C4725A' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ─── 테이블 ─── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">이름 (ko)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">이름 (zh)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">카테고리</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">지역</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">기간</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({length: 8}).map((_,i) => (
                  <tr key={i}>
                    {Array.from({length:6}).map((_,j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-200 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-400">데이터가 없습니다</td></tr>
              ) : paginated.map(item => (
                <tr key={item.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{item.name_ko || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{item.name_zh || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(196,114,90,0.1)', color: '#C4725A' }}>{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.district || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {item.start_date?.slice(0,10) || '?'} ~ {item.end_date?.slice(0,10) || '?'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setEditItem(item)} className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors">
                        <Pencil size={12} /> 수정
                      </button>
                      <button onClick={() => setDeleteItem(item)} className="flex items-center gap-1 px-2.5 py-1.5 border border-red-200 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={12} /> 삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 하단 통계 + 페이지네이션 */}
        <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-gray-500">
            전체 <strong>{popups.length}</strong>건 · 필터 결과 <strong>{filtered.length}</strong>건
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-gray-600">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── 모달들 ─── */}
      {editItem   && <EditModal   item={editItem}   onSave={handleSave}   onClose={() => setEditItem(null)}   loading={actionLoading} />}
      {deleteItem && <DeleteModal item={deleteItem} onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} loading={actionLoading} />}
      {showCSVUp  && <CSVUploadModal onClose={() => setShowCSVUp(false)} onUpload={handleCSVUpload} loading={actionLoading} result={csvResult} />}

      {/* ─── 토스트 ─── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-full text-sm shadow-xl z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
