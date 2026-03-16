import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, Trash2, Check, ChevronDown, MapPin, CheckCircle, XCircle, Clock, Edit3 } from 'lucide-react'

const API = 'https://hanpocket-popup-store.bumik-korea.workers.dev/api/popups'
const ADMIN_TOKEN = 'near2024admin'
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${ADMIN_TOKEN}` })

const VENUE_TYPES = [
  { v: 'department_store', ko: '백화점' },
  { v: 'hangang',          ko: '한강공원' },
  { v: 'hotplace',         ko: '핫플레이스' },
  { v: 'mall',             ko: '복합몰' },
  { v: 'popup_building',   ko: '팝업 전용 빌딩' },
  { v: 'other',            ko: '기타' },
]

const POPUP_TYPES = [
  { v: 'fashion',    ko: '패션/의류', em: '👗' },
  { v: 'beauty',     ko: '뷰티/화장품', em: '💄' },
  { v: 'kpop',       ko: 'K-POP/아이돌', em: '🎤' },
  { v: 'character',  ko: '캐릭터/IP', em: '🧸' },
  { v: 'exhibition', ko: '전시/아트', em: '🎨' },
  { v: 'comic',      ko: '코믹/만화', em: '📚' },
  { v: 'movie',      ko: '영화', em: '🎬' },
  { v: 'drama',      ko: '드라마', em: '📺' },
  { v: 'webtoon',    ko: '웹툰', em: '📱' },
  { v: 'food',       ko: '식품/음식', em: '🍽️' },
  { v: 'lifestyle',  ko: '생활용품', em: '🏠' },
  { v: 'game',       ko: '게임', em: '🎮' },
  { v: 'art',        ko: '아트', em: '🖼️' },
  { v: 'luxury',     ko: '럭셔리', em: '💎' },
  { v: 'collab',     ko: '콜라보', em: '✨' },
  { v: 'other',      ko: '기타', em: '📌' },
]

const DISTRICTS = [
  { v: 'seongsu',    ko: '성수' },
  { v: 'gangnam',    ko: '강남' },
  { v: 'hannam',     ko: '한남' },
  { v: 'hongdae',    ko: '홍대' },
  { v: 'myeongdong', ko: '명동' },
  { v: 'yeouido',    ko: '여의도' },
  { v: 'jongno',     ko: '종로/중구' },
  { v: 'itaewon',    ko: '이태원' },
  { v: 'coex',       ko: 'COEX' },
  { v: 'hangang',    ko: '한강' },
  { v: 'other',      ko: '기타' },
]

const COLORS = ['#FF6B9D','#7C3AED','#059669','#DC2626','#2563EB','#D97706','#0891B2','#6366F1','#EC4899','#10B981','#F59E0B','#111827']

const BLANK = {
  brand: '', title_ko: '', title_zh: '', title_en: '',
  description_ko: '', description_zh: '',
  venue_type: 'hotplace', popup_type: 'other', district: 'other',
  venue_name: '', address_ko: '', lat: '', lng: '',
  floor_ko: '', floor_zh: '',
  start_date: '', end_date: '',
  open_time: '10:00', close_time: '20:00',
  entry_type: 'free', entry_fee_krw: '',
  reservation_url: '',
  payment_alipay: false, payment_wechatpay: false, payment_unionpay: false,
  payment_card: true, payment_cash: true,
  chinese_staff: false, chinese_signage: false, chinese_brochure: false,
  tax_refund_available: false, tax_refund_min_krw: '30000',
  cn_sns_tag_zh: '',
  queue_info_ko: '', queue_info_zh: '',
  cover_image: '', source_xhs: '', source_instagram: '', official_url: '',
  emoji: '📌', color: '#6366F1', is_hot: false,
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-3 bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left">
        <p className="text-[12px] font-bold text-[#111827] uppercase tracking-wider">{title}</p>
        <ChevronDown size={16} className={`text-[#9CA3AF] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 border-t border-[#F3F4F6]">{children}</div>}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mt-3">
      <p className="text-[11px] text-[#9CA3AF] mb-1 font-medium">{label}</p>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C4725A]" />
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[#374151]">{label}</span>
      <button onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-[#111827]' : 'bg-[#D1D5DB]'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C4725A] bg-white">
      {options.map(o => <option key={o.v} value={o.v}>{o.ko}</option>)}
    </select>
  )
}

export default function PopupAdmin({ onClose }) {
  const [tab, setTab] = useState('list')    // 'list' | 'add' | 'staging'
  const [popups, setPopups] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [venues, setVenues] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [staging, setStaging] = useState([])
  const [stagingLoading, setStagingLoading] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [approveModal, setApproveModal] = useState(null)  // { item, data } — 승인 전 override 폼
  const [overrideForm, setOverrideForm] = useState({})

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch(`${API}?limit=100`).then(r => r.json()),
      fetch(`${API}/venues`).then(r => r.json()),
    ]).then(([p, v]) => { setPopups(p); setVenues(v) }).finally(() => setLoading(false))
  }

  const loadStaging = () => {
    setStagingLoading(true)
    fetch(`${API}/staging`, { headers: authH() })
      .then(r => r.json())
      .then(data => setStaging(Array.isArray(data) ? data : []))
      .finally(() => setStagingLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => { if (tab === 'staging') loadStaging() }, [tab])

  const openApproveModal = (item) => {
    const data = (() => { try { return JSON.parse(item.data_json) } catch { return {} } })()

    // end_date_hint 파싱 (미리보기용)
    let parsedEndDate = data.end_date || ''
    if (!parsedEndDate && data.end_date_hint) {
      const hint = data.end_date_hint
      const year = new Date().getFullYear()
      const p1 = hint.match(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/)
      const p2 = hint.match(/(\d{1,2})월\s*(\d{1,2})일/)
      const p3 = hint.match(/(\d{1,2})\/(\d{1,2})/)
      if (p1) parsedEndDate = `${p1[1]}-${p1[2].padStart(2,'0')}-${p1[3].padStart(2,'0')}`
      else if (p2) parsedEndDate = `${year}-${p2[1].padStart(2,'0')}-${p2[2].padStart(2,'0')}`
      else if (p3) parsedEndDate = `${year}-${p3[1].padStart(2,'0')}-${p3[2].padStart(2,'0')}`
    }
    const today = new Date().toISOString().split('T')[0]
    const in30  = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

    setOverrideForm({
      title_ko:   data.title_ko || '',
      brand:      data.brand || '',
      popup_type: data.popup_type || 'other',
      venue_name: data.venue_name || '',
      district:   data.district || 'other',
      start_date: data.start_date || today,
      end_date:   parsedEndDate || in30,
      lat:        data.lat || '',
      lng:        data.lng || '',
    })
    setApproveModal({ item, data })
  }

  const handleStaging = async (id, action, override = undefined) => {
    setActionId(id)
    await fetch(`${API}/staging/${id}`, {
      method: 'PUT',
      headers: authH(),
      body: JSON.stringify({ action, ...(override ? { override } : {}) }),
    })
    setActionId(null)
    loadStaging()
    if (action === 'approve') load()
  }

  const confirmApprove = async () => {
    if (!approveModal) return
    await handleStaging(approveModal.item.id, 'approve', overrideForm)
    setApproveModal(null)
    setExpandedId(null)
  }

  // 장소 마스터에서 자동 채우기
  const fillFromVenue = (slug) => {
    const v = venues.find(v => v.slug === slug)
    if (!v) return
    setForm(f => ({
      ...f,
      venue_name: v.name_ko,
      address_ko: v.address_ko,
      address_zh: v.address_zh || '',
      lat: String(v.lat),
      lng: String(v.lng),
      district: v.district,
      venue_type: v.venue_type,
      open_time: v.default_open,
      close_time: v.default_close,
      payment_alipay: v.alipay_accepted === 1,
    }))
  }

  const handleDelete = async (id) => {
    if (!confirm('삭제할까요?')) return
    await fetch(`${API}/${id}`, { method: 'DELETE', headers: authH() })
    load()
  }

  const handleSave = async () => {
    if (!form.title_ko || !form.start_date || !form.end_date || !form.lat || !form.lng) {
      alert('필수: 팝업명(한국어), 시작일, 종료일, 위도, 경도')
      return
    }
    setSaving(true)
    const body = {
      ...form,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      entry_fee_krw: parseInt(form.entry_fee_krw) || 0,
      tax_refund_min_krw: parseInt(form.tax_refund_min_krw) || 30000,
      payment_alipay: form.payment_alipay ? 1 : 0,
      payment_wechatpay: form.payment_wechatpay ? 1 : 0,
      payment_unionpay: form.payment_unionpay ? 1 : 0,
      payment_card: form.payment_card ? 1 : 0,
      payment_cash: form.payment_cash ? 1 : 0,
      chinese_staff: form.chinese_staff ? 1 : 0,
      chinese_signage: form.chinese_signage ? 1 : 0,
      chinese_brochure: form.chinese_brochure ? 1 : 0,
      tax_refund_available: form.tax_refund_available ? 1 : 0,
      is_hot: form.is_hot ? 1 : 0,
    }
    await fetch(API, { method: 'POST', headers: authH(), body: JSON.stringify(body) })
    setSavedOk(true)
    setTimeout(() => { setSavedOk(false); setTab('list'); setForm(BLANK) }, 1500)
    load()
    setSaving(false)
  }

  const filtered = filterType === 'all' ? popups : popups.filter(p => p.popup_type === filterType)

  return (
    <>
    <div className="fixed top-[52px] inset-x-0 bottom-0 z-50 bg-[#F9F9F7] overflow-y-auto">
      <div className="px-4 pt-4 pb-28">

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-3">
          <button onClick={tab === 'add' ? () => setTab('list') : onClose} className="p-1">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <p className="text-[10px] text-[#9CA3AF] font-bold tracking-widest uppercase">Admin</p>
            <h1 className="text-lg font-bold text-[#1A1A1A]">팝업 관리</h1>
          </div>
          {tab === 'list' && (
            <button onClick={() => setTab('add')}
              className="flex items-center gap-1.5 bg-[#111827] text-white text-xs font-semibold px-3 py-2 rounded-full">
              <Plus size={14} /> 추가
            </button>
          )}
        </div>

        {/* 탭 바 */}
        {tab !== 'add' && (
          <div className="flex gap-1 mb-4 bg-[#F3F4F6] p-1 rounded-[12px]">
            {[
              { v: 'list',    label: `등록됨 (${popups.length})` },
              { v: 'staging', label: `검토 대기 ${staging.length > 0 ? `(${staging.length})` : ''}`, badge: staging.length },
            ].map(t => (
              <button key={t.v} onClick={() => setTab(t.v)}
                className={`flex-1 py-2 text-xs font-bold rounded-[10px] transition-all relative ${tab === t.v ? 'bg-white text-[#111827] shadow-sm' : 'text-[#9CA3AF]'}`}>
                {t.label}
                {t.badge > 0 && tab !== t.v && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {t.badge > 9 ? '9+' : t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── 목록 탭 ── */}
        {tab === 'list' && (
          <>
            {/* 유형 필터 */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
              <button onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${filterType === 'all' ? 'bg-[#111827] text-white' : 'bg-white text-[#555]'}`}
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                전체 ({popups.length})
              </button>
              {POPUP_TYPES.filter(t => popups.some(p => p.popup_type === t.v)).map(t => (
                <button key={t.v} onClick={() => setFilterType(t.v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${filterType === t.v ? 'bg-[#111827] text-white' : 'bg-white text-[#555]'}`}
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  {t.em} {t.ko}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#C4725A] rounded-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm text-[#9CA3AF]">등록된 팝업이 없어요</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map(p => {
                  const typeInfo = POPUP_TYPES.find(t => t.v === p.popup_type)
                  const today = new Date().toISOString().split('T')[0]
                  const daysLeft = p.end_date ? Math.ceil((new Date(p.end_date) - new Date(today)) / 86400000) : null
                  return (
                    <div key={p.id} className="bg-white rounded-[12px] px-4 py-3"
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-[13px] font-semibold text-[#111827] truncate">{p.title_ko || p.name_ko}</p>
                            {p.is_hot === 1 && <span className="text-[10px] bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded-full font-bold">HOT</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p className="text-[11px] text-[#9CA3AF]">{p.venue_name || p.location_name}</p>
                            {typeInfo && <span className="text-[10px] text-[#6B7280]">{typeInfo.em} {typeInfo.ko}</span>}
                            {daysLeft !== null && (
                              <span className={`text-[10px] font-bold ${daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-orange-500' : 'text-[#9CA3AF]'}`}>
                                {daysLeft <= 0 ? '오늘마감' : `D-${daysLeft}`}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {p.payment_alipay === 1 && <span className="text-[10px] bg-[#EEF2FF] text-[#4F46E5] px-1.5 py-0.5 rounded">알리페이</span>}
                            {p.payment_wechatpay === 1 && <span className="text-[10px] bg-[#F0FDF4] text-[#16A34A] px-1.5 py-0.5 rounded">위챗페이</span>}
                            {p.chinese_staff === 1 && <span className="text-[10px] bg-[#FFF7ED] text-[#EA580C] px-1.5 py-0.5 rounded">중문직원</span>}
                          </div>
                        </div>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-full text-[#EF4444] active:scale-90 transition-transform shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── 검토 대기 탭 ── */}
        {tab === 'staging' && (
          <>
            {stagingLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#C4725A] rounded-full" />
              </div>
            ) : staging.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-sm text-[#9CA3AF]">검토 대기 중인 항목이 없어요</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {staging.map(item => {
                  const data = (() => { try { return JSON.parse(item.data_json) } catch { return {} } })()
                  const isExpanded = expandedId === item.id
                  const isActing = actionId === item.id
                  const sourceLabel = {
                    naver_blog: '네이버 블로그',
                    brand_submit: '브랜드 제출',
                    user_submit: '사용자 제보',
                    manual: '수동 입력',
                  }[item.source_type] || item.source_type

                  return (
                    <div key={item.id} className="bg-white rounded-[14px] overflow-hidden"
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      {/* 헤더 */}
                      <button className="w-full px-4 py-3 text-left" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#111827] line-clamp-2">
                              {data.title_ko || '제목 없음'}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">{sourceLabel}</span>
                              {data.district && data.district !== 'other' && (
                                <span className="text-[10px] bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-full">{data.district}</span>
                              )}
                              {data.end_date_hint && (
                                <span className="text-[10px] text-[#9CA3AF]">~{data.end_date_hint}</span>
                              )}
                              <span className="text-[10px] text-[#C0C0C0]">
                                {new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <ChevronDown size={16} className={`text-[#9CA3AF] mt-1 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* 확장 내용 */}
                      {isExpanded && (
                        <div className="px-4 pb-3 border-t border-[#F3F4F6]">
                          {data.description_ko && (
                            <p className="text-[12px] text-[#6B7280] mt-3 mb-3 leading-relaxed line-clamp-4">
                              {data.description_ko}
                            </p>
                          )}
                          {item.source_url && (
                            <a href={item.source_url} target="_blank" rel="noreferrer"
                              className="text-[11px] text-[#4F46E5] underline block mb-3 truncate">
                              🔗 원본 링크 보기
                            </a>
                          )}

                          {/* 승인 시 채울 정보 미리보기 */}
                          <div className="bg-[#F9F9F7] rounded-xl p-3 mb-3 text-[11px] text-[#6B7280] space-y-1">
                            <p><span className="font-semibold text-[#374151]">소스:</span> {sourceLabel}</p>
                            {data.district && <p><span className="font-semibold text-[#374151]">지역:</span> {data.district}</p>}
                            {data.end_date_hint && <p><span className="font-semibold text-[#374151]">종료 힌트:</span> {data.end_date_hint}</p>}
                            {data.pub_date && <p><span className="font-semibold text-[#374151]">작성일:</span> {new Date(data.pub_date).toLocaleDateString()}</p>}
                          </div>

                          <p className="text-[10px] text-[#9CA3AF] mb-2">승인하면 지도에 바로 표시돼요. 상세 정보는 등록 후 수정 가능.</p>

                          {/* 액션 버튼 */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => openApproveModal(item)}
                              disabled={isActing}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-[#111827] text-white text-[12px] font-bold py-2.5 rounded-xl active:scale-[0.98] transition-all disabled:opacity-50">
                              {isActing ? '처리 중...' : <><Edit3 size={14} /> 검토 후 승인</>}
                            </button>
                            <button
                              onClick={() => handleStaging(item.id, 'reject')}
                              disabled={isActing}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-[#F3F4F6] text-[#EF4444] text-[12px] font-bold py-2.5 rounded-xl active:scale-[0.98] transition-all disabled:opacity-50">
                              <XCircle size={14} /> 거부
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── 추가 탭 ── */}
        {tab === 'add' && (
          <>
            {/* 장소 마스터에서 빠른 채우기 */}
            {venues.length > 0 && (
              <div className="mb-3 bg-[#EEF2FF] rounded-[12px] p-3">
                <p className="text-[11px] font-bold text-[#4F46E5] mb-2">⚡ 장소 마스터에서 자동 채우기</p>
                <select onChange={e => fillFromVenue(e.target.value)}
                  className="w-full border border-[#C7D2FE] rounded-lg px-3 py-2 text-sm bg-white outline-none">
                  <option value="">장소 선택...</option>
                  {venues.map(v => <option key={v.slug} value={v.slug}>{v.name_ko}</option>)}
                </select>
              </div>
            )}

            {/* 기본 정보 */}
            <Section title="기본 정보">
              <Field label="브랜드명">
                <Input value={form.brand} onChange={v => set('brand', v)} placeholder="예: AESPA, DUNST" />
              </Field>
              <Field label="팝업명 (한국어) *">
                <Input value={form.title_ko} onChange={v => set('title_ko', v)} placeholder="팝업스토어 이름 (필수)" />
              </Field>
              <Field label="팝업명 (중국어)">
                <Input value={form.title_zh} onChange={v => set('title_zh', v)} placeholder="中文名称 (없으면 자동 번역)" />
              </Field>
              <Field label="팝업명 (영어)">
                <Input value={form.title_en} onChange={v => set('title_en', v)} placeholder="English name" />
              </Field>
              <Field label="한국어 설명">
                <textarea value={form.description_ko} onChange={e => set('description_ko', e.target.value)}
                  placeholder="팝업 소개 (한국어)"
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C4725A] resize-none h-20" />
              </Field>
              <Field label="중국어 설명">
                <textarea value={form.description_zh} onChange={e => set('description_zh', e.target.value)}
                  placeholder="中文介绍"
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C4725A] resize-none h-20" />
              </Field>
            </Section>

            {/* 분류 */}
            <Section title="분류">
              <Field label="장소 유형">
                <Select value={form.venue_type} onChange={v => set('venue_type', v)} options={VENUE_TYPES} />
              </Field>
              <Field label="팝업 유형">
                <div className="flex flex-wrap gap-2 mt-1">
                  {POPUP_TYPES.map(t => (
                    <button key={t.v} onClick={() => set('popup_type', t.v)}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${form.popup_type === t.v ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#555]'}`}>
                      {t.em} {t.ko}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="지역">
                <div className="flex flex-wrap gap-2 mt-1">
                  {DISTRICTS.map(d => (
                    <button key={d.v} onClick={() => set('district', d.v)}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${form.district === d.v ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#555]'}`}>
                      {d.ko}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>

            {/* 장소 정보 */}
            <Section title="장소 정보">
              <Field label="장소명">
                <Input value={form.venue_name} onChange={v => set('venue_name', v)} placeholder="더현대 서울, 팩토리얼 성수..." />
              </Field>
              <Field label="주소 (한국어)">
                <Input value={form.address_ko} onChange={v => set('address_ko', v)} placeholder="서울 성동구 성수이로 78" />
              </Field>
              <Field label="주소 (중국어)">
                <Input value={form.address_zh} onChange={v => set('address_zh', v)} placeholder="首尔市城东区圣水二路78号" />
              </Field>
              <Field label="위도 / 경도 *">
                <div className="flex gap-2">
                  <Input value={form.lat} onChange={v => set('lat', v)} placeholder="37.5261" />
                  <Input value={form.lng} onChange={v => set('lng', v)} placeholder="126.9289" />
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-1">
                  💡 <a href="https://map.kakao.com" target="_blank" rel="noreferrer" className="underline">카카오맵</a>에서 장소 우클릭 → 좌표 복사
                </p>
              </Field>
              <Field label="층/위치 (한국어)">
                <Input value={form.floor_ko} onChange={v => set('floor_ko', v)} placeholder="5층 팝업존, B2 아이코닉존" />
              </Field>
              <Field label="층/위치 (중국어)">
                <Input value={form.floor_zh} onChange={v => set('floor_zh', v)} placeholder="5楼快闪专区" />
              </Field>
            </Section>

            {/* 운영 기간 */}
            <Section title="운영 기간">
              <Field label="시작일 *">
                <Input type="date" value={form.start_date} onChange={v => set('start_date', v)} />
              </Field>
              <Field label="종료일 *">
                <Input type="date" value={form.end_date} onChange={v => set('end_date', v)} />
              </Field>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Field label="오픈 시간">
                    <Input type="time" value={form.open_time} onChange={v => set('open_time', v)} />
                  </Field>
                </div>
                <div className="flex-1">
                  <Field label="마감 시간">
                    <Input type="time" value={form.close_time} onChange={v => set('close_time', v)} />
                  </Field>
                </div>
              </div>
            </Section>

            {/* 입장 방식 */}
            <Section title="입장 방식" defaultOpen={false}>
              <Field label="입장 유형">
                <Select value={form.entry_type} onChange={v => set('entry_type', v)} options={[
                  { v: 'free', ko: '자유 입장' },
                  { v: 'reservation', ko: '사전 예약 필수' },
                  { v: 'ticket', ko: '유료 티켓' },
                  { v: 'limited', ko: '제한적 입장' },
                ]} />
              </Field>
              {form.entry_type === 'ticket' && (
                <Field label="입장료 (원)">
                  <Input value={form.entry_fee_krw} onChange={v => set('entry_fee_krw', v)} placeholder="10000" />
                </Field>
              )}
              {(form.entry_type === 'reservation' || form.entry_type === 'ticket') && (
                <Field label="예약 링크">
                  <Input value={form.reservation_url} onChange={v => set('reservation_url', v)} placeholder="https://..." />
                </Field>
              )}
              <Field label="대기 안내 (한국어)">
                <Input value={form.queue_info_ko} onChange={v => set('queue_info_ko', v)} placeholder="주말 30분 대기 예상" />
              </Field>
              <Field label="대기 안내 (중국어)">
                <Input value={form.queue_info_zh} onChange={v => set('queue_info_zh', v)} placeholder="周末预计等待30分钟" />
              </Field>
            </Section>

            {/* 중국인 특화 (핵심!) */}
            <Section title="🇨🇳 중국인 관광객 정보">
              <p className="text-[11px] text-[#6B7280] mt-3 mb-1 font-semibold">결제 수단</p>
              <Toggle label="알리페이 (支付宝)" checked={form.payment_alipay} onChange={v => set('payment_alipay', v)} />
              <Toggle label="위챗페이 (微信支付)" checked={form.payment_wechatpay} onChange={v => set('payment_wechatpay', v)} />
              <Toggle label="유니온페이 (银联)" checked={form.payment_unionpay} onChange={v => set('payment_unionpay', v)} />
              <Toggle label="신용/체크카드" checked={form.payment_card} onChange={v => set('payment_card', v)} />
              <Toggle label="현금" checked={form.payment_cash} onChange={v => set('payment_cash', v)} />

              <p className="text-[11px] text-[#6B7280] mt-4 mb-1 font-semibold">언어 지원</p>
              <Toggle label="중국어 가능 직원 상주" checked={form.chinese_staff} onChange={v => set('chinese_staff', v)} />
              <Toggle label="중국어 안내판/메뉴판" checked={form.chinese_signage} onChange={v => set('chinese_signage', v)} />
              <Toggle label="중국어 브로슈어" checked={form.chinese_brochure} onChange={v => set('chinese_brochure', v)} />

              <p className="text-[11px] text-[#6B7280] mt-4 mb-1 font-semibold">세금환급</p>
              <Toggle label="즉시/사후 세금환급 가능" checked={form.tax_refund_available} onChange={v => set('tax_refund_available', v)} />
              {form.tax_refund_available && (
                <Field label="환급 최소 구매액 (원)">
                  <Input value={form.tax_refund_min_krw} onChange={v => set('tax_refund_min_krw', v)} placeholder="30000" />
                </Field>
              )}

              <Field label="中国SNS 해시태그">
                <Input value={form.cn_sns_tag_zh} onChange={v => set('cn_sns_tag_zh', v)} placeholder="#首尔快闪 #韩国快闪" />
              </Field>
            </Section>

            {/* 미디어/링크 */}
            <Section title="미디어 & 링크" defaultOpen={false}>
              <Field label="커버 이미지 URL">
                <Input value={form.cover_image} onChange={v => set('cover_image', v)} placeholder="https://..." />
              </Field>
              <Field label="공식 홈페이지">
                <Input value={form.official_url} onChange={v => set('official_url', v)} placeholder="https://..." />
              </Field>
              <Field label="小红书 링크">
                <Input value={form.source_xhs} onChange={v => set('source_xhs', v)} placeholder="https://www.xiaohongshu.com/..." />
              </Field>
              <Field label="Instagram 링크">
                <Input value={form.source_instagram} onChange={v => set('source_instagram', v)} placeholder="https://www.instagram.com/..." />
              </Field>
            </Section>

            {/* 표시 설정 */}
            <Section title="표시 설정" defaultOpen={false}>
              <Field label="이모지">
                <div className="flex flex-wrap gap-2">
                  {['🌸','🎤','👗','📺','🎨','🎮','🍕','☕','👠','🎁','🐱','💄','🧸','🎪','🎬','📚','🎧','✨','💎'].map(e => (
                    <button key={e} onClick={() => set('emoji', e)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center ${form.emoji === e ? 'bg-[#111827]' : 'bg-[#F3F4F6]'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="테마 컬러">
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => set('color', c)}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-[#111827] scale-110' : ''}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </Field>
              <div className="mt-3">
                <Toggle label="🔥 HOT 배지 표시" checked={form.is_hot} onChange={v => set('is_hot', v)} />
              </div>
            </Section>

            {/* 저장 버튼 */}
            <button onClick={handleSave} disabled={saving}
              className="w-full py-4 rounded-[14px] bg-[#111827] text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 mt-2">
              {savedOk ? <><Check size={18} /> 저장됐어요!</> : saving ? '저장 중...' : <><Plus size={18} /> 팝업 등록하기</>}
            </button>
          </>
        )}
      </div>
    </div>

    {/* ── 승인 전 검토 모달 ── */}
    {approveModal && (
      <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={e => { if (e.target === e.currentTarget) setApproveModal(null) }}>
        <div className="w-full bg-white rounded-t-[20px] px-4 pt-5 pb-8 overflow-y-auto max-h-[85vh]">
          <div className="w-8 h-1 bg-[#D1D5DB] rounded-full mx-auto mb-4" />
          <p className="text-[11px] text-[#9CA3AF] font-bold tracking-widest uppercase mb-1">승인 전 검토</p>
          <h2 className="text-[15px] font-bold text-[#111827] mb-4 line-clamp-2">
            {approveModal.data.title_ko || '제목 없음'}
          </h2>

          {/* 팝업명 수정 */}
          <div className="mb-3">
            <p className="text-[11px] text-[#9CA3AF] mb-1 font-medium">팝업명 (한국어)</p>
            <input value={overrideForm.title_ko} onChange={e => setOverrideForm(f => ({...f, title_ko: e.target.value}))}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C4725A]" />
          </div>

          {/* 팝업 유형 */}
          <div className="mb-3">
            <p className="text-[11px] text-[#9CA3AF] mb-1 font-medium">팝업 유형</p>
            <div className="flex flex-wrap gap-1.5">
              {POPUP_TYPES.map(t => (
                <button key={t.v} onClick={() => setOverrideForm(f => ({...f, popup_type: t.v}))}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${overrideForm.popup_type === t.v ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#555]'}`}>
                  {t.em} {t.ko}
                </button>
              ))}
            </div>
          </div>

          {/* 지역 */}
          <div className="mb-3">
            <p className="text-[11px] text-[#9CA3AF] mb-1 font-medium">지역</p>
            <div className="flex flex-wrap gap-1.5">
              {DISTRICTS.map(d => (
                <button key={d.v} onClick={() => setOverrideForm(f => ({...f, district: d.v}))}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${overrideForm.district === d.v ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#555]'}`}>
                  {d.ko}
                </button>
              ))}
            </div>
          </div>

          {/* 장소명 */}
          <div className="mb-3">
            <p className="text-[11px] text-[#9CA3AF] mb-1 font-medium">장소명 (비워두면 자동 지오코딩)</p>
            <input value={overrideForm.venue_name} onChange={e => setOverrideForm(f => ({...f, venue_name: e.target.value}))}
              placeholder="더현대 서울, 팩토리얼 성수..."
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C4725A]" />
          </div>

          {/* 운영 기간 */}
          <div className="mb-3">
            <p className="text-[11px] text-[#9CA3AF] mb-1 font-medium">운영 기간</p>
            <div className="flex gap-2">
              <input type="date" value={overrideForm.start_date} onChange={e => setOverrideForm(f => ({...f, start_date: e.target.value}))}
                className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C4725A]" />
              <input type="date" value={overrideForm.end_date} onChange={e => setOverrideForm(f => ({...f, end_date: e.target.value}))}
                className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C4725A]" />
            </div>
            {approveModal.data.end_date_hint && (
              <p className="text-[10px] text-[#9CA3AF] mt-1">📌 힌트: {approveModal.data.end_date_hint}</p>
            )}
          </div>

          {/* 좌표 (선택) */}
          <div className="mb-5">
            <p className="text-[11px] text-[#9CA3AF] mb-1 font-medium">좌표 (비워두면 자동)</p>
            <div className="flex gap-2">
              <input type="number" step="any" value={overrideForm.lat} onChange={e => setOverrideForm(f => ({...f, lat: e.target.value}))}
                placeholder="위도 37.52..."
                className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C4725A]" />
              <input type="number" step="any" value={overrideForm.lng} onChange={e => setOverrideForm(f => ({...f, lng: e.target.value}))}
                placeholder="경도 126.92..."
                className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C4725A]" />
            </div>
          </div>

          {/* 원본 링크 */}
          {approveModal.item.source_url && (
            <a href={approveModal.item.source_url} target="_blank" rel="noreferrer"
              className="block text-[11px] text-[#4F46E5] underline mb-4 truncate">
              🔗 원본 링크 확인
            </a>
          )}

          {/* 버튼 */}
          <div className="flex gap-2">
            <button onClick={confirmApprove}
              disabled={actionId === approveModal.item.id}
              className="flex-1 flex items-center justify-center gap-2 bg-[#111827] text-white text-[13px] font-bold py-3.5 rounded-[14px] active:scale-[0.98] transition-all disabled:opacity-50">
              {actionId === approveModal.item.id ? '등록 중...' : <><CheckCircle size={16} /> 승인 & 등록</>}
            </button>
            <button onClick={() => setApproveModal(null)}
              className="px-5 flex items-center justify-center bg-[#F3F4F6] text-[#374151] text-[13px] font-bold py-3.5 rounded-[14px] active:scale-[0.98] transition-all">
              취소
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
