// NEAR 쿠폰 선택 — 결제 시 쿠폰/포인트 적용
import { useState, useMemo } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { MOCK_COUPONS_ISSUED, MOCK_COUPON_DEFINITIONS, MOCK_CUSTOMERS } from '../../data/reservationData'
import { Tag, Gift } from 'lucide-react'

export default function CouponSelector({ lang, customerId = 'self', shopId, totalKrw, onApplyCoupon, onUsePoints, selectedCouponId, usedPoints }) {
  const [showCoupons, setShowCoupons] = useState(false)
  const [pointInput, setPointInput] = useState(usedPoints || 0)

  // 사용 가능한 쿠폰
  const availableCoupons = useMemo(() => {
    // localStorage 또는 목업에서 가져오기
    let issued = MOCK_COUPONS_ISSUED.filter(c =>
      c.status === 'active' && c.shopId === shopId
    )
    // 정의 데이터 매핑
    return issued.map(c => {
      const def = MOCK_COUPON_DEFINITIONS.find(d => d.id === c.definitionId)
      if (!def) return null
      // 최소 주문 금액 체크
      const isApplicable = totalKrw >= def.minOrderAmount
      return { ...c, definition: def, isApplicable }
    }).filter(Boolean)
  }, [shopId, totalKrw])

  // 포인트 잔액
  const customer = MOCK_CUSTOMERS.find(c => c.id === customerId) || { points: 0 }
  const maxPoints = Math.min(customer.points, Math.floor(totalKrw * 0.1)) // 최대 10%까지 사용

  const handleApplyPoints = () => {
    const pts = Math.min(Math.max(0, parseInt(pointInput) || 0), maxPoints)
    setPointInput(pts)
    onUsePoints(pts)
  }

  // 쿠폰 할인 계산
  const getCouponDiscount = (coupon) => {
    const def = coupon.definition
    if (def.type === 'percentage') {
      const disc = Math.round(totalKrw * def.value / 100)
      return Math.min(disc, def.maxDiscountKrw)
    }
    return def.value
  }

  return (
    <div className="bg-white rounded-2xl p-4 mb-4">
      {/* 쿠폰 */}
      <button
        onClick={() => setShowCoupons(!showCoupons)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <Tag size={16} color="#666" />
          <span className="text-[13px] font-medium" style={{ color: '#111' }}>{T.coupons[lang]}</span>
          {availableCoupons.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
              {availableCoupons.length}
            </span>
          )}
        </div>
        {selectedCouponId ? (
          <span className="text-[12px] font-medium" style={{ color: '#22C55E' }}>{T.couponApplied[lang]}</span>
        ) : (
          <span className="text-[12px]" style={{ color: '#999' }}>
            {availableCoupons.length > 0
              ? `${availableCoupons.length}${lang === 'zh' ? '张可用' : lang === 'ko' ? '개 사용가능' : ' available'}`
              : (lang === 'zh' ? '无可用' : lang === 'ko' ? '없음' : 'None')
            }
          </span>
        )}
      </button>

      {showCoupons && (
        <div className="space-y-2 mb-3 pl-6">
          {availableCoupons.length === 0 && (
            <p className="text-[11px]" style={{ color: '#999' }}>
              {lang === 'zh' ? '暂无可用优惠券' : lang === 'ko' ? '사용 가능한 쿠폰이 없습니다' : 'No available coupons'}
            </p>
          )}
          {availableCoupons.map(cpn => {
            const disc = getCouponDiscount(cpn)
            const isSelected = selectedCouponId === cpn.id
            return (
              <button
                key={cpn.id}
                disabled={!cpn.isApplicable}
                onClick={() => onApplyCoupon(isSelected ? null : cpn.id, isSelected ? 0 : disc)}
                className="w-full text-left p-3 rounded-xl transition-all"
                style={{
                  border: isSelected ? '1.5px solid #22C55E' : '1px solid #E5E7EB',
                  opacity: cpn.isApplicable ? 1 : 0.5,
                }}
              >
                <div className="flex justify-between">
                  <span className="text-[13px] font-medium" style={{ color: '#111' }}>
                    {cpn.definition.name[lang]}
                  </span>
                  <span className="text-[13px] font-bold" style={{ color: '#EF4444' }}>
                    -₩{disc.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: '#999' }}>
                  {T.minOrder[lang]} ₩{cpn.definition.minOrderAmount.toLocaleString()} ·
                  {T.validUntil[lang]} {new Date(cpn.expiresAt).toLocaleDateString()}
                </p>
                {!cpn.isApplicable && (
                  <p className="text-[10px] mt-0.5" style={{ color: '#EF4444' }}>
                    {lang === 'zh' ? '未达最低消费' : lang === 'ko' ? '최소 주문 금액 미달' : 'Min. order not met'}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* 포인트 */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
        <div className="flex items-center gap-2">
          <Gift size={16} color="#666" />
          <span className="text-[13px] font-medium" style={{ color: '#111' }}>{T.points[lang]}</span>
          <span className="text-[11px]" style={{ color: '#999' }}>
            ({lang === 'zh' ? '可用' : lang === 'ko' ? '보유' : 'Available'}: {customer.points.toLocaleString()}P)
          </span>
        </div>
        {customer.points > 0 ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={pointInput}
              onChange={(e) => setPointInput(e.target.value)}
              onBlur={handleApplyPoints}
              className="w-16 px-2 py-1 rounded text-[12px] text-right border"
              style={{ borderColor: '#E5E7EB', color: '#111' }}
              max={maxPoints}
              min={0}
            />
            <span className="text-[11px]" style={{ color: '#999' }}>P</span>
          </div>
        ) : (
          <span className="text-[11px]" style={{ color: '#D1D5DB' }}>0P</span>
        )}
      </div>
      {maxPoints > 0 && (
        <p className="text-[10px] text-right mt-1" style={{ color: '#999' }}>
          {lang === 'zh' ? `最多可用 ${maxPoints}P` : lang === 'ko' ? `최대 ${maxPoints}P 사용 가능` : `Max ${maxPoints}P usable`}
        </p>
      )}
    </div>
  )
}
