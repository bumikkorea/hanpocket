// NEAR 관리자 — 정산 탭 (스타일리스트별/시간대별 통계 추가)
import { reservationText as T } from '../../data/reservationI18n'
import { MOCK_STYLISTS, MOCK_SERVICES } from '../../data/reservationData'
import useReservationAdmin from '../../hooks/useReservationAdmin'

export default function AdminSettlements({ lang }) {
  const { getSettlements } = useReservationAdmin()
  const settlements = getSettlements()

  // 월간 합산
  const totalRevenue = settlements.reduce((sum, s) => sum + s.totalRevenueKrw, 0)
  const totalDeposits = settlements.reduce((sum, s) => sum + s.totalDepositsCny, 0)
  const totalCommission = settlements.reduce((sum, s) => sum + s.commissionKrw, 0)
  const totalPayout = settlements.reduce((sum, s) => sum + s.payoutKrw, 0)
  const totalBookings = settlements.reduce((sum, s) => sum + s.totalBookings, 0)
  const totalCompleted = settlements.reduce((sum, s) => sum + s.completedBookings, 0)
  const totalCancelled = settlements.reduce((sum, s) => sum + s.cancelledBookings, 0)
  const totalNoshow = settlements.reduce((sum, s) => sum + s.noshowBookings, 0)

  return (
    <div className="px-5">
      {/* 월간 요약 */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <p className="text-[13px] font-medium mb-4" style={{ color: '#999' }}>2026년 3월 {T.settlementPeriod[lang]}</p>

        {/* 예약 통계 */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <StatCard label="총 예약" value={totalBookings} color="#111" />
          <StatCard label="완료" value={totalCompleted} color="#22C55E" />
          <StatCard label="취소" value={totalCancelled} color="#EF4444" />
          <StatCard label="노쇼" value={totalNoshow} color="#991B1B" />
        </div>

        {/* 금액 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[13px]" style={{ color: '#111' }}>{T.totalRevenue[lang]}</span>
            <span className="text-[17px] font-bold" style={{ color: '#111' }}>₩{totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[13px]" style={{ color: '#666' }}>{T.depositsCollected[lang]}</span>
            <span className="text-[14px] font-medium" style={{ color: '#666' }}>¥{totalDeposits.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: '#F3F4F6' }}>
            <span className="text-[13px]" style={{ color: '#EF4444' }}>{T.nearCommission[lang]}</span>
            <span className="text-[14px] font-medium" style={{ color: '#EF4444' }}>-₩{totalCommission.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: '#F3F4F6' }}>
            <span className="text-[14px] font-semibold" style={{ color: '#111' }}>{T.payout[lang]}</span>
            <span className="text-[18px] font-bold" style={{ color: '#22C55E' }}>₩{totalPayout.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 정산일 안내 */}
      <div className="bg-blue-50 rounded-xl p-3 mb-4">
        <p className="text-[12px]" style={{ color: '#1D4ED8' }}>📅 {T.payoutSchedule[lang]}</p>
      </div>

      {/* 스타일리스트별 매출 (첫 번째 정산 기준) */}
      {settlements[0]?.stylistBreakdown?.length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <p className="text-[12px] font-medium mb-3" style={{ color: '#999' }}>스타일리스트별 매출</p>
          <div className="space-y-2">
            {settlements[0].stylistBreakdown.map(sb => {
              const st = MOCK_STYLISTS.find(s => s.id === sb.stylistId)
              if (!st) return null
              const pct = settlements[0].totalRevenueKrw ? Math.round(sb.revenueKrw / settlements[0].totalRevenueKrw * 100) : 0
              return (
                <div key={sb.stylistId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                      <span className="text-[13px]" style={{ color: '#111' }}>{st.name}</span>
                      <span className="text-[11px]" style={{ color: '#999' }}>{sb.bookings}건</span>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: '#111' }}>₩{sb.revenueKrw.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: st.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 시간대별 예약 분포 */}
      {settlements[0]?.hourlyBreakdown?.length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <p className="text-[12px] font-medium mb-3" style={{ color: '#999' }}>시간대별 예약</p>
          <div className="flex items-end gap-1 h-20">
            {settlements[0].hourlyBreakdown.map(hb => {
              const maxBookings = Math.max(...settlements[0].hourlyBreakdown.map(h => h.bookings))
              const heightPct = maxBookings ? (hb.bookings / maxBookings) * 100 : 0
              return (
                <div key={hb.hour} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[9px]" style={{ color: '#999' }}>{hb.bookings}</span>
                  <div className="w-full rounded-t" style={{ height: `${heightPct}%`, minHeight: 4, backgroundColor: '#111' }} />
                  <span className="text-[9px]" style={{ color: '#999' }}>{hb.hour}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 인기 서비스 */}
      {settlements[0]?.serviceBreakdown?.length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <p className="text-[12px] font-medium mb-3" style={{ color: '#999' }}>인기 서비스 TOP</p>
          <div className="space-y-1.5">
            {settlements[0].serviceBreakdown.slice(0, 5).map((sb, i) => {
              const svc = MOCK_SERVICES.find(s => s.id === sb.serviceId)
              return (
                <div key={sb.serviceId} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] w-4 text-center font-bold" style={{ color: i < 3 ? '#F59E0B' : '#999' }}>{i + 1}</span>
                    <span className="text-[13px]" style={{ color: '#111' }}>{svc?.name?.ko || sb.serviceId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px]" style={{ color: '#666' }}>{sb.count}건 · </span>
                    <span className="text-[12px] font-semibold" style={{ color: '#111' }}>₩{sb.revenueKrw.toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 정산 건별 */}
      <p className="text-[13px] font-medium mb-3" style={{ color: '#999' }}>정산 내역</p>
      <div className="space-y-3">
        {settlements.map(stl => (
          <div key={stl.id} className="bg-white rounded-xl p-4">
            {/* 기간 + 상태 */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium" style={{ color: '#111' }}>
                {stl.periodStart} ~ {stl.periodEnd}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: stl.status === 'completed' ? '#DCFCE7' : '#FEF9C3',
                  color: stl.status === 'completed' ? '#166534' : '#92400E',
                }}>
                {stl.status === 'completed' ? T.statusCompleted[lang] : T.statusPending[lang]}
              </span>
            </div>

            {/* 상세 */}
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div>
                <span style={{ color: '#999' }}>예약: </span>
                <span style={{ color: '#111' }}>{stl.totalBookings}건 (완료 {stl.completedBookings})</span>
              </div>
              <div>
                <span style={{ color: '#999' }}>매출: </span>
                <span style={{ color: '#111' }}>₩{stl.totalRevenueKrw.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: '#999' }}>보증금: </span>
                <span style={{ color: '#111' }}>¥{stl.totalDepositsCny.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: '#999' }}>수수료: </span>
                <span style={{ color: '#EF4444' }}>-₩{stl.commissionKrw.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t" style={{ borderColor: '#F5F5F5' }}>
              <span className="text-[12px]" style={{ color: '#999' }}>
                {stl.payoutDate ? `정산일: ${stl.payoutDate}` : ''}
              </span>
              <span className="text-[14px] font-bold" style={{ color: '#22C55E' }}>₩{stl.payoutKrw.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="text-center">
      <p className="text-[16px] font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px]" style={{ color: '#999' }}>{label}</p>
    </div>
  )
}
