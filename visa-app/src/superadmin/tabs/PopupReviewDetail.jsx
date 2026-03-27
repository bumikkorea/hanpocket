/**
 * PopupReviewDetail — 팝업 검수 상세 화면
 * 좌: 스크래퍼 원본 (읽기전용) / 우: NEAR DB 입력 폼
 */
import { useState } from 'react'
import { ArrowLeft, ExternalLink, MapPin, Calendar, Clock, Tag, Check, Ban, Pause } from 'lucide-react'

const CATEGORIES = [
  'popup','fashion','kpop','beauty','food','cafe','bar',
  'nail','medical','shopping','hotel','pharmacy','character','game','exhibition','luxury','other'
]

const DISTRICTS = [
  'seongsu','hannam','itaewon','myeongdong','cheongdam','hongdae',
  'bukchon','gangnam','yeouido','jamsil','yeonnam','seochon',
  'euljiro','ikseon','haebangchon','mangwon','sinchon','apgujeong','other'
]

// 스크래퍼 raw 데이터에서 NEAR DB 폼 초기값 추출
function initForm(item) {
  return {
    name_ko:         item.name || item.name_ko || '',
    name_zh:         item.name_zh || '',
    name_en:         item.name_en || '',
    category:        item.category || 'popup',
    district:        item.district || guessDistrict(item.address || item.address_ko || ''),
    address_ko:      item.address || item.address_ko || '',
    address_zh:      item.address_zh || '',
    lat:             item.lat ? String(item.lat) : '',
    lng:             item.lng ? String(item.lng) : '',
    start_date:      (item.start_date || item.start || '').slice(0, 10),
    end_date:        (item.end_date || item.end || '').slice(0, 10),
    open_time:       item.open_time || item.opening_time || '',
    close_time:      item.close_time || item.closing_time || '',
    image_url:       item.image_url || item.thumbnail_url || '',
    description_zh:  item.description_zh || '',
    is_temporary:    true,
    is_free:         item.is_free ?? true,
    has_reservation: item.has_reservation ?? false,
    has_alipay:      item.has_alipay ?? false,
    has_wechat_pay:  item.has_wechat_pay ?? false,
    has_union_pay:   item.has_union_pay ?? false,
    has_visa:        item.has_visa ?? false,
    has_tax_refund:  item.has_tax_refund ?? false,
    has_chinese_staff: item.has_chinese_staff ?? false,
    has_chinese_menu:  item.has_chinese_menu ?? false,
    review_note:     '',
  }
}

function guessDistrict(address) {
  const a = address.toLowerCase()
  if (a.includes('성수') || a.includes('seongsu')) return 'seongsu'
  if (a.includes('한남') || a.includes('hannam'))  return 'hannam'
  if (a.includes('이태원') || a.includes('itaewon')) return 'itaewon'
  if (a.includes('명동') || a.includes('myeongdong')) return 'myeongdong'
  if (a.includes('청담') || a.includes('cheongdam')) return 'cheongdam'
  if (a.includes('홍대') || a.includes('hongdae')) return 'hongdae'
  if (a.includes('강남') || a.includes('gangnam')) return 'gangnam'
  if (a.includes('여의도') || a.includes('yeouido')) return 'yeouido'
  if (a.includes('잠실') || a.includes('jamsil')) return 'jamsil'
  if (a.includes('연남') || a.includes('yeonnam')) return 'yeonnam'
  if (a.includes('망원') || a.includes('mangwon')) return 'mangwon'
  if (a.includes('북촌') || a.includes('bukchon')) return 'bukchon'
  if (a.includes('서촌') || a.includes('seochon')) return 'seochon'
  if (a.includes('을지로') || a.includes('euljiro')) return 'euljiro'
  if (a.includes('익선') || a.includes('ikseon')) return 'ikseon'
  if (a.includes('해방촌') || a.includes('haebangchon')) return 'haebangchon'
  if (a.includes('신촌') || a.includes('sinchon')) return 'sinchon'
  if (a.includes('압구정') || a.includes('apgujeong')) return 'apgujeong'
  return 'other'
}

// ─── 원본 데이터 행 ───
function RawRow({ label, value, link }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">{label}</span>
      {link
        ? <a href={value} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 break-all">{value} <ExternalLink size={10} /></a>
        : <span className="text-xs text-gray-700 break-words flex-1">{String(value)}</span>
      }
    </div>
  )
}

// ─── 폼 인풋 ───
function FormField({ label, children, required }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
const selectCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"

// ─── 거절 사유 모달 ───
function RejectModal({ onConfirm, onCancel }) {
  const [note, setNote] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900 mb-4">거절 사유 (선택)</h3>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="거절 사유를 입력하세요..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 resize-none"
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">취소</button>
          <button onClick={() => onConfirm(note)} className="flex-1 py-2 text-white rounded-xl text-sm font-medium" style={{ backgroundColor: '#E53935' }}>거절 확정</button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 컴포넌트 ───
export default function PopupReviewDetail({ item, onBack, supabaseNear, supabaseScraper, onDone }) {
  const [form, setForm] = useState(() => initForm(item))
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  // ─── 승인 ───
  const handleApprove = async () => {
    if (!form.name_ko && !form.name_zh) { showToast('❌ 매장명(한국어 또는 중국어)을 입력하세요'); return }
    if (!form.category) { showToast('❌ 카테고리를 선택하세요'); return }
    setLoading(true)
    try {
      // 1. NEAR DB INSERT
      const { error: insertErr } = await supabaseNear
        .from('popups')
        .insert({
          name_ko:           form.name_ko || null,
          name_zh:           form.name_zh || form.name_ko || '',  // NOT NULL
          name_en:           form.name_en || null,
          category:          form.category,
          district:          form.district || null,
          address_ko:        form.address_ko || null,
          address_zh:        form.address_zh || null,
          lat:               form.lat ? parseFloat(form.lat) : null,
          lng:               form.lng ? parseFloat(form.lng) : null,
          start_date:        form.start_date || null,
          end_date:          form.end_date || null,
          open_time:         form.open_time || null,
          close_time:        form.close_time || null,
          image_url:         form.image_url || null,
          description_zh:    form.description_zh || null,
          is_temporary:      form.is_temporary,
          has_reservation:   form.has_reservation,
          has_alipay:        form.has_alipay,
          has_wechat_pay:    form.has_wechat_pay,
          has_union_pay:     form.has_union_pay,
          has_visa:          form.has_visa,
          has_tax_refund:    form.has_tax_refund,
          has_chinese_staff: form.has_chinese_staff,
          has_chinese_menu:  form.has_chinese_menu,
        })
      if (insertErr) { showToast(`❌ NEAR DB 저장 실패: ${insertErr.message}`); setLoading(false); return }

      // 2. 스크래퍼 DB 상태 업데이트
      await supabaseScraper
        .from('popup_stores')
        .update({ review_status: 'approved', reviewed_at: new Date().toISOString(), review_note: form.review_note || null })
        .eq('id', item.id)

      showToast('✅ 승인 완료 — NEAR DB에 저장됨')
      setTimeout(() => onDone?.('approved'), 1000)
    } catch (e) {
      showToast(`❌ 오류: ${e.message}`)
    }
    setLoading(false)
  }

  // ─── 거절 ───
  const handleReject = async (note) => {
    setShowRejectModal(false)
    setLoading(true)
    await supabaseScraper
      .from('popup_stores')
      .update({ review_status: 'rejected', reviewed_at: new Date().toISOString(), review_note: note || null })
      .eq('id', item.id)
    showToast('🚫 거절 처리 완료')
    setTimeout(() => onDone?.('rejected'), 800)
    setLoading(false)
  }

  // ─── 보류 ───
  const handleHold = () => onBack?.()

  return (
    <div className="flex flex-col h-full">

      {/* ─── 상단 헤더 ─── */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={16} /> 목록으로
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700 truncate">{item.name || item.name_ko || '(이름 없음)'}</span>
        <span className="ml-auto text-xs text-gray-400">ID: {item.id}</span>
      </div>

      {/* ─── 좌우 패널 ─── */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

        {/* ── 좌: 원본 데이터 ── */}
        <div className="lg:w-[40%] bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">원본 데이터</p>
            <p className="text-xs text-gray-400 mt-0.5">소스: {item.source || '-'} · 스크래퍼 DB 읽기전용</p>
          </div>
          {(item.image_url || item.thumbnail_url) && (
            <img src={item.image_url || item.thumbnail_url} alt="" className="w-full h-40 object-cover" onError={e => { e.target.style.display = 'none' }} />
          )}
          <div className="flex-1 overflow-y-auto p-4">
            <RawRow label="매장명"   value={item.name || item.name_ko} />
            <RawRow label="영문명"   value={item.name_en} />
            <RawRow label="중국어명" value={item.name_zh} />
            <RawRow label="주소"     value={item.address || item.address_ko} />
            <RawRow label="지역"     value={item.district} />
            <RawRow label="시작일"   value={item.start_date || item.start} />
            <RawRow label="종료일"   value={item.end_date || item.end} />
            <RawRow label="영업시간" value={item.open_time || item.opening_hours || item.business_hours} />
            <RawRow label="위도"     value={item.lat} />
            <RawRow label="경도"     value={item.lng} />
            <RawRow label="카테고리" value={item.category} />
            <RawRow label="태그"     value={Array.isArray(item.tags) ? item.tags.join(', ') : item.tags} />
            <RawRow label="설명"     value={item.description || item.description_ko} />
            <RawRow label="수집일"   value={item.created_at?.slice(0, 10)} />
            <RawRow label="원본 URL" value={item.url} link={!!item.url} />
            <RawRow label="인스타"   value={item.instagram_url} link={!!item.instagram_url} />
          </div>
        </div>

        {/* ── 우: NEAR DB 입력 폼 ── */}
        <div className="lg:flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
            <p className="text-sm font-semibold text-blue-700">NEAR DB 입력</p>
            <p className="text-xs text-blue-400 mt-0.5">승인 시 popups 테이블에 INSERT됩니다</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">

            {/* 매장명 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <FormField label="name_ko" required>
                <input className={inputCls} value={form.name_ko} onChange={e => set('name_ko', e.target.value)} placeholder="한국어 매장명" />
              </FormField>
              <FormField label="name_zh">
                <input className={inputCls} value={form.name_zh} onChange={e => set('name_zh', e.target.value)} placeholder="中文名称" />
              </FormField>
              <FormField label="name_en">
                <input className={inputCls} value={form.name_en} onChange={e => set('name_en', e.target.value)} placeholder="English name" />
              </FormField>
            </div>

            {/* 분류 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <FormField label="category" required>
                <select className={selectCls} value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="district">
                <select className={selectCls} value={form.district} onChange={e => set('district', e.target.value)}>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </FormField>
            </div>

            {/* 주소 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <FormField label="address_ko">
                <input className={inputCls} value={form.address_ko} onChange={e => set('address_ko', e.target.value)} placeholder="한국어 주소" />
              </FormField>
              <FormField label="address_zh">
                <input className={inputCls} value={form.address_zh} onChange={e => set('address_zh', e.target.value)} placeholder="中文地址" />
              </FormField>
            </div>

            {/* 좌표 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <FormField label="lat">
                <input className={inputCls} value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="37.5443" type="number" step="any" />
              </FormField>
              <FormField label="lng">
                <input className={inputCls} value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="127.0563" type="number" step="any" />
              </FormField>
            </div>

            {/* 기간 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <FormField label="start_date">
                <input className={inputCls} value={form.start_date} onChange={e => set('start_date', e.target.value)} type="date" />
              </FormField>
              <FormField label="end_date">
                <input className={inputCls} value={form.end_date} onChange={e => set('end_date', e.target.value)} type="date" />
              </FormField>
            </div>

            {/* 영업시간 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <FormField label="open_time">
                <input className={inputCls} value={form.open_time} onChange={e => set('open_time', e.target.value)} type="time" />
              </FormField>
              <FormField label="close_time">
                <input className={inputCls} value={form.close_time} onChange={e => set('close_time', e.target.value)} type="time" />
              </FormField>
            </div>

            {/* 이미지 */}
            <FormField label="image_url">
              <input className={inputCls} value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
            </FormField>

            {/* 체크박스 그룹 */}
            <div className="mt-2 mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">특성</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  ['is_temporary',    '임시 팝업'],
                  ['is_free',         '입장 무료'],
                  ['has_reservation', '예약 필요'],
                  ['has_alipay',      '알리페이'],
                  ['has_wechat_pay',  '위챗페이'],
                  ['has_union_pay',   '유니온페이'],
                  ['has_visa',        'VISA'],
                  ['has_tax_refund',  '세금환급'],
                  ['has_chinese_staff','중국어 스태프'],
                  ['has_chinese_menu', '중국어 메뉴'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!form[key]}
                      onChange={e => set(key, e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 검수 메모 */}
            <FormField label="검수 메모 (선택)">
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 resize-none"
                rows={2}
                value={form.review_note}
                onChange={e => set('review_note', e.target.value)}
                placeholder="내부 메모..."
              />
            </FormField>

          </div>
        </div>
      </div>

      {/* ─── 하단 액션 버튼 ─── */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50 transition-colors text-sm font-medium"
          style={{ border: '1px solid #E53935', color: '#E53935' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFEBEE'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
        >
          <Ban size={15} /> 거절
        </button>
        <button
          onClick={handleHold}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50 transition-colors text-sm font-medium"
          style={{ border: '1px solid #888', color: '#888' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F5F5F5'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
        >
          <Pause size={15} /> 보류
        </button>
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-white rounded-xl disabled:opacity-50 transition-colors text-sm font-bold"
          style={{ backgroundColor: '#3182F6' }}
        >
          <Check size={16} /> {loading ? '처리 중...' : '승인 → NEAR DB 저장'}
        </button>
      </div>

      {/* ─── 거절 모달 ─── */}
      {showRejectModal && (
        <RejectModal onConfirm={handleReject} onCancel={() => setShowRejectModal(false)} />
      )}

      {/* ─── 토스트 ─── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-full text-sm shadow-xl z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
