// NEAR 관리자 — 오늘 예약 탭 (워크인 등록 추가)
import { useState } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { STATUS_CONFIG, MOCK_SHOPS, MOCK_STYLISTS, MOCK_CUSTOMERS, MOCK_SERVICES, COUNTRY_FLAGS, PAYMENT_METHODS, generateReservationNo } from '../../data/reservationData'
import useReservationAdmin from '../../hooks/useReservationAdmin'
import { UserPlus } from 'lucide-react'

export default function AdminToday({ lang }) {
  const {
    getTodayReservations, getTodayStats,
    confirmReservation, rejectReservation, completeReservation, markNoshow,
    getCustomer, updateShopNote,
  } = useReservationAdmin()

  const [selectedId, setSelectedId] = useState(null)
  const [showWalkin, setShowWalkin] = useState(false)
  const todayList = getTodayReservations()
  const stats = getTodayStats()
  const hasPending = stats.pending > 0

  return (
    <div className="px-5">
      {/* 워크인 등록 버튼 */}
      <button
        onClick={() => setShowWalkin(!showWalkin)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium mb-4 transition-all active:scale-[0.98]"
        style={{ backgroundColor: '#F3F4F6', color: '#666' }}
      >
        <UserPlus size={16} />
        {T.registerWalkin[lang]}
      </button>

      {/* 워크인 등록 폼 */}
      {showWalkin && (
        <WalkinForm
          lang={lang}
          onClose={() => setShowWalkin(false)}
        />
      )}

      {/* 요약 바 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: T.todayBookings[lang], value: stats.total, color: 'var(--y2k-text)' },
          { label: T.pendingCount[lang], value: stats.pending, color: 'var(--y2k-pink)' },
          { label: T.confirmedCount[lang], value: stats.confirmed, color: 'var(--y2k-mint)' },
          { label: T.todayRevenue[lang], value: `₩${(stats.revenue / 10000).toFixed(0)}만`, color: 'var(--y2k-text)' },
        ].map((item, i) => (
          <div key={i} className="card-y2k rounded-xl p-3 text-center" style={{ background: 'var(--y2k-surface)', border: '1px solid var(--y2k-border)', boxShadow: '0 2px 8px rgba(255, 133, 179, 0.08)' }}>
            <p className="text-[18px] font-bold typo-title" style={{ color: item.color }}>{item.value}</p>
            <p className="text-[10px] mt-0.5 typo-caption">{item.label}</p>
          </div>
        ))}
      </div>

      {/* 새 예약 알림 */}
      {hasPending && (
        <div className="bg-amber-50 rounded-xl p-3 mb-4 flex items-center gap-2"
          style={{ border: '1px solid #FDE68A' }}>
          <span className="text-lg">🔔</span>
          <span className="text-[13px] font-medium" style={{ color: '#92400E' }}>
            {T.newBookingAlert[lang]} ({stats.pending}건)
          </span>
        </div>
      )}

      {/* 예약 리스트 */}
      {todayList.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-3xl">📭</span>
          <p className="text-[13px] mt-2" style={{ color: '#999' }}>오늘 예약이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todayList.map(res => {
            const statusCfg = STATUS_CONFIG[res.status]
            const customer = [...MOCK_CUSTOMERS].find(c => c.id === res.customerId) || getCustomer(res.customerId)
            const stylist = MOCK_STYLISTS.find(s => s.id === res.stylistId)
            const shop = MOCK_SHOPS.find(s => s.id === res.shopId)
            const flag = customer ? COUNTRY_FLAGS[customer.countryCode] || '🌍' : '🌍'

            return (
              <div key={res.id}>
                <button
                  onClick={() => setSelectedId(selectedId === res.id ? null : res.id)}
                  className="w-full text-left bg-white rounded-xl p-4 transition-all active:scale-[0.99]"
                  style={{ border: res.status === 'pending' ? '1.5px solid #FDE68A' : '1px solid transparent' }}
                >
                  {/* 시간 + 상태 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold" style={{ color: '#111' }}>{res.time}</span>
                      <span className="text-[11px]" style={{ color: '#999' }}>{res.totalDuration}분</span>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                      {statusCfg.label[lang]}
                    </span>
                  </div>

                  {/* 고객 */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{flag}</span>
                    <span className="text-[14px] font-medium" style={{ color: '#111' }}>
                      {customer?.name || '고객'}
                    </span>
                    {customer?.nameEn && (
                      <span className="text-[11px]" style={{ color: '#999' }}>{customer.nameEn}</span>
                    )}
                  </div>

                  {/* 서비스 */}
                  <p className="text-[12px] mb-1" style={{ color: '#666' }}>
                    {res.services.map(s => s.name.ko + (s.name.zh ? ` (${s.name.zh})` : '')).join(' + ')}
                  </p>

                  {/* 스타일리스트 + 금액 */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: '#F5F5F5' }}>
                    {stylist ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stylist.color }} />
                        <span className="text-[12px]" style={{ color: '#666' }}>{stylist.name}</span>
                      </div>
                    ) : <span />}
                    <div className="text-right">
                      <span className="text-[13px] font-semibold" style={{ color: '#111' }}>₩{res.totalPriceKrw.toLocaleString()}</span>
                      <span className="text-[11px] ml-1" style={{ color: '#999' }}>보증금 ¥{res.depositCny}</span>
                    </div>
                  </div>

                  {/* 대기 건: 인라인 승인/거절 */}
                  {res.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmReservation(res.id) }}
                        className="flex-1 py-2 rounded-full text-[13px] font-semibold text-white transition-all active:scale-[0.95]"
                        style={{ background: 'var(--gradient-aurora)', boxShadow: '0 4px 16px rgba(134, 239, 172, 0.3)' }}
                      >
                        {T.approve[lang]}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); rejectReservation(res.id) }}
                        className="flex-1 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-[0.95]"
                        style={{ color: 'var(--y2k-pink)', border: '2px solid var(--y2k-pink)', background: 'transparent' }}
                      >
                        {T.reject[lang]}
                      </button>
                    </div>
                  )}
                </button>

                {/* 상세 모달 (인라인 펼침) */}
                {selectedId === res.id && res.status !== 'pending' && (
                  <AdminReservationDetail
                    lang={lang}
                    reservation={res}
                    customer={customer}
                    stylist={stylist}
                    onComplete={() => completeReservation(res.id)}
                    onNoshow={() => {
                      if (confirm(T.noshowConfirm[lang])) markNoshow(res.id)
                    }}
                    onClose={() => setSelectedId(null)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── 관리자 예약 상세 모달 ───
function AdminReservationDetail({ lang, reservation, customer, stylist, onComplete, onNoshow, onClose }) {
  const statusCfg = STATUS_CONFIG[reservation.status]
  const payment = PAYMENT_METHODS.find(p => p.id === reservation.paymentMethod)
  const flag = customer ? COUNTRY_FLAGS[customer.countryCode] || '🌍' : '🌍'

  return (
    <div className="bg-gray-50 rounded-xl p-4 mt-1 mb-2" style={{ border: '1px solid #E5E7EB' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-mono" style={{ color: '#999' }}>{reservation.reservationNo}</span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
          {statusCfg.label[lang]}
        </span>
      </div>

      {/* 고객 정보 */}
      <div className="mb-3">
        <p className="text-[11px] mb-1" style={{ color: '#999' }}>{T.customer[lang]}</p>
        <div className="flex items-center gap-2">
          <span>{flag}</span>
          <span className="text-[14px] font-medium" style={{ color: '#111' }}>{customer?.name}</span>
          {customer?.nameEn && <span className="text-[12px]" style={{ color: '#999' }}>({customer.nameEn})</span>}
        </div>
        {customer?.phone && (
          <p className="text-[12px] mt-0.5" style={{ color: '#666' }}>{customer.phone}</p>
        )}
      </div>

      {/* 서비스 */}
      <div className="mb-3">
        <p className="text-[11px] mb-1" style={{ color: '#999' }}>{T.service[lang]}</p>
        {reservation.services.map((svc, i) => (
          <p key={i} className="text-[13px]" style={{ color: '#111' }}>
            {svc.name.ko} ({svc.name.zh})
          </p>
        ))}
      </div>

      {/* 일시 + 스타일리스트 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[11px] mb-0.5" style={{ color: '#999' }}>{T.dateTime[lang]}</p>
          <p className="text-[13px]" style={{ color: '#111' }}>{reservation.date} {reservation.time}</p>
        </div>
        {stylist && (
          <div>
            <p className="text-[11px] mb-0.5" style={{ color: '#999' }}>{T.assignedStylist[lang]}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stylist.color }} />
              <span className="text-[13px]" style={{ color: '#111' }}>{stylist.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* 금액 + 보증금 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[11px] mb-0.5" style={{ color: '#999' }}>{T.totalPrice[lang]}</p>
          <p className="text-[13px] font-semibold" style={{ color: '#111' }}>₩{reservation.totalPriceKrw.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[11px] mb-0.5" style={{ color: '#999' }}>{T.depositStatus[lang]}</p>
          <p className="text-[13px]" style={{ color: '#22C55E' }}>
            ¥{reservation.depositCny} ✓ {payment?.label[lang]}
          </p>
        </div>
      </div>

      {/* 메모 */}
      {reservation.customerNote && (
        <div className="mb-3">
          <p className="text-[11px] mb-0.5" style={{ color: '#999' }}>{T.customerMemo[lang]}</p>
          <p className="text-[13px] bg-white rounded-lg p-2" style={{ color: '#111' }}>{reservation.customerNote}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      {reservation.status === 'confirmed' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={onComplete}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#111' }}
          >
            {T.markComplete[lang]}
          </button>
          <button
            onClick={onNoshow}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all active:scale-[0.97]"
            style={{ color: '#991B1B', backgroundColor: '#FEE2E2' }}
          >
            {T.markNoshow[lang]}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── 워크인 등록 폼 ───
function WalkinForm({ lang, onClose }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [stylistId, setStylistId] = useState('')

  const shopId = MOCK_SHOPS[0]?.id
  const services = MOCK_SERVICES.filter(s => s.shopId === shopId)
  const stylists = MOCK_STYLISTS.filter(s => s.shopId === shopId && s.isActive)

  const handleRegister = () => {
    if (!name.trim() || !serviceId) return
    const svc = services.find(s => s.id === serviceId)
    if (!svc) return

    const now = new Date()
    const walkin = {
      id: 'res-walkin-' + Date.now().toString(36),
      reservationNo: generateReservationNo(),
      shopId,
      customerId: 'walkin-' + Date.now(),
      stylistId: stylistId || null,
      services: [{
        serviceId: svc.id,
        name: svc.name,
        duration: svc.duration,
        priceKrw: svc.priceKrw,
        priceCny: svc.priceCny,
      }],
      totalPriceKrw: svc.priceKrw,
      totalPriceCny: svc.priceCny,
      totalDuration: svc.duration,
      date: now.toISOString().split('T')[0],
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      depositCny: 0,
      depositKrw: 0,
      depositRate: 0,
      paymentMethod: 'cash',
      paymentId: null,
      depositPaidAt: null,
      status: 'confirmed',
      bookingType: 'walkin',
      customerLang: 'ZH',
      customerNote: `워크인: ${name} ${phone}`,
      shopNote: '',
      couponId: null,
      pointsUsed: 0,
      createdAt: now.toISOString(),
      confirmedAt: now.toISOString(),
    }

    // localStorage에 추가
    try {
      const stored = JSON.parse(localStorage.getItem('near_reservations') || '[]')
      stored.unshift(walkin)
      localStorage.setItem('near_reservations', JSON.stringify(stored))
    } catch { /* ignore */ }

    onClose()
    window.location.reload() // 간단히 새로고침으로 반영
  }

  return (
    <div className="bg-white rounded-xl p-4 mb-4" style={{ border: '1px solid #E5E7EB' }}>
      <p className="text-[13px] font-medium mb-3" style={{ color: '#111' }}>{T.registerWalkin[lang]}</p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="고객 이름"
        className="w-full px-3 py-2 rounded-lg text-[13px] border mb-2"
        style={{ borderColor: '#E5E7EB', color: '#111' }}
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="전화번호 (선택)"
        className="w-full px-3 py-2 rounded-lg text-[13px] border mb-2"
        style={{ borderColor: '#E5E7EB', color: '#111' }}
      />

      <select
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-[13px] border mb-2"
        style={{ borderColor: '#E5E7EB', color: serviceId ? '#111' : '#999' }}
      >
        <option value="">서비스 선택</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.name.ko} - ₩{s.priceKrw.toLocaleString()}</option>
        ))}
      </select>

      <select
        value={stylistId}
        onChange={(e) => setStylistId(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-[13px] border mb-3"
        style={{ borderColor: '#E5E7EB', color: stylistId ? '#111' : '#999' }}
      >
        <option value="">담당자 (선택)</option>
        {stylists.map(s => (
          <option key={s.id} value={s.id}>{s.name} - {s.role?.ko}</option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          onClick={handleRegister}
          disabled={!name.trim() || !serviceId}
          className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white"
          style={{ backgroundColor: name.trim() && serviceId ? '#111' : '#D1D5DB' }}
        >
          등록
        </button>
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]" style={{ color: '#999' }}>
          취소
        </button>
      </div>
    </div>
  )
}
