// NEAR 관리자 — 고객 관리 탭 (세그먼트 뱃지 + 포인트)
import { useState } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { COUNTRY_FLAGS, LANG_LABELS, SEGMENT_CONFIG, STATUS_CONFIG } from '../../data/reservationData'
import useReservationAdmin from '../../hooks/useReservationAdmin'

export default function AdminCustomers({ lang }) {
  const { searchCustomers, blockCustomer, updateCustomerMemo, getCustomerReservations } = useReservationAdmin()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [editMemo, setEditMemo] = useState('')
  const [editingMemo, setEditingMemo] = useState(false)

  const customers = searchCustomers(query)

  return (
    <div className="px-5">
      {/* 검색 */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={T.searchCustomer[lang]}
          className="w-full px-4 py-2.5 rounded-xl text-[14px] bg-white border-none outline-none"
          style={{ color: '#111' }}
        />
      </div>

      {/* 고객 목록 */}
      <div className="space-y-2">
        {customers.map(cust => {
          const flag = COUNTRY_FLAGS[cust.countryCode] || '🌍'
          const langLabel = LANG_LABELS[cust.lang] || cust.lang
          const isSelected = selectedId === cust.id
          const custReservations = isSelected ? getCustomerReservations(cust.id) : []

          return (
            <div key={cust.id}>
              <button
                onClick={() => setSelectedId(isSelected ? null : cust.id)}
                className="w-full text-left bg-white rounded-xl p-4 transition-all active:scale-[0.99]"
                style={{ border: cust.isBlocked ? '1.5px solid #FCA5A5' : '1px solid transparent' }}
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{flag}</span>
                    <span className="text-[15px] font-medium" style={{ color: '#111' }}>{cust.name}</span>
                    {cust.nameEn && <span className="text-[11px]" style={{ color: '#999' }}>({cust.nameEn})</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {cust.segment && SEGMENT_CONFIG[cust.segment] && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: SEGMENT_CONFIG[cust.segment].bg, color: SEGMENT_CONFIG[cust.segment].color }}>
                        {SEGMENT_CONFIG[cust.segment].label[lang]}
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#F3F4F6', color: '#666' }}>
                      {langLabel}
                    </span>
                  </div>
                </div>

                {/* 전화번호 */}
                {cust.phone && (
                  <p className="text-[12px] mb-2" style={{ color: '#666' }}>{cust.phone}</p>
                )}

                {/* 통계 */}
                <div className="flex gap-3 flex-wrap">
                  <div>
                    <span className="text-[11px]" style={{ color: '#999' }}>{T.visits[lang]} </span>
                    <span className="text-[13px] font-semibold" style={{ color: '#111' }}>{cust.totalVisits}</span>
                  </div>
                  <div>
                    <span className="text-[11px]" style={{ color: '#999' }}>{T.totalSpent[lang]} </span>
                    <span className="text-[13px] font-semibold" style={{ color: '#111' }}>₩{cust.totalSpentKrw.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[11px]" style={{ color: '#999' }}>{T.noshowHistory[lang]} </span>
                    <span className="text-[13px] font-semibold"
                      style={{ color: cust.noshowCount > 0 ? '#EF4444' : '#111' }}>
                      {cust.noshowCount}
                    </span>
                  </div>
                  {cust.points > 0 && (
                    <div>
                      <span className="text-[11px]" style={{ color: '#999' }}>{T.points[lang]} </span>
                      <span className="text-[13px] font-semibold" style={{ color: '#F59E0B' }}>{cust.points}P</span>
                    </div>
                  )}
                </div>

                {/* 차단 상태 */}
                {cust.isBlocked && (
                  <div className="mt-2 px-2 py-1 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                    <span className="text-[11px] font-medium" style={{ color: '#991B1B' }}>
                      🚫 {T.blocked[lang]} — {cust.blockedReason}
                    </span>
                  </div>
                )}

                {/* 메모 */}
                {cust.memo && (
                  <div className="mt-2 px-2 py-1 rounded-lg" style={{ backgroundColor: '#FEF9C3' }}>
                    <span className="text-[11px]" style={{ color: '#92400E' }}>📝 {cust.memo}</span>
                  </div>
                )}
              </button>

              {/* 상세 펼침 */}
              {isSelected && (
                <div className="bg-gray-50 rounded-xl p-4 mt-1 mb-2" style={{ border: '1px solid #E5E7EB' }}>
                  {/* 액션 버튼 */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => blockCustomer(cust.id, !cust.isBlocked, cust.isBlocked ? '' : '관리자 차단')}
                      className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-all"
                      style={{
                        backgroundColor: cust.isBlocked ? '#DCFCE7' : '#FEE2E2',
                        color: cust.isBlocked ? '#166534' : '#991B1B',
                      }}
                    >
                      {cust.isBlocked ? T.unblock[lang] : T.block[lang]}
                    </button>
                    <button
                      onClick={() => { setEditMemo(cust.memo || ''); setEditingMemo(true) }}
                      className="flex-1 py-2 rounded-lg text-[12px] font-medium"
                      style={{ backgroundColor: '#F3F4F6', color: '#666' }}
                    >
                      {T.addMemo[lang]}
                    </button>
                  </div>

                  {/* 메모 입력 */}
                  {editingMemo && (
                    <div className="mb-4">
                      <textarea
                        value={editMemo}
                        onChange={(e) => setEditMemo(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-[13px] border resize-none h-16"
                        style={{ borderColor: '#E5E7EB', color: '#111' }}
                        placeholder="메모 입력..."
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => { updateCustomerMemo(cust.id, editMemo); setEditingMemo(false) }}
                          className="px-3 py-1 rounded-lg text-[12px] font-medium text-white"
                          style={{ backgroundColor: '#111' }}
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingMemo(false)}
                          className="px-3 py-1 rounded-lg text-[12px]"
                          style={{ color: '#999' }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 예약 이력 */}
                  <p className="text-[12px] font-medium mb-2" style={{ color: '#999' }}>예약 이력</p>
                  {custReservations.length === 0 ? (
                    <p className="text-[12px]" style={{ color: '#999' }}>예약 이력이 없습니다</p>
                  ) : (
                    <div className="space-y-1">
                      {custReservations.slice(0, 5).map(res => {
                        const statusCfg = STATUS_CONFIG[res.status]
                        return (
                          <div key={res.id} className="flex items-center justify-between py-1.5 bg-white rounded-lg px-2">
                            <span className="text-[12px]" style={{ color: '#111' }}>{res.date} {res.time}</span>
                            <span className="text-[12px]" style={{ color: '#666' }}>
                              {res.services[0]?.name?.ko}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                              {statusCfg.label[lang]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
