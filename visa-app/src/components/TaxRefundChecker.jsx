import { useState } from 'react'
import { calculateRefund, EXCHANGE_RATES } from '../api/taxRefundApi'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

export default function TaxRefundChecker({ lang, profile }) {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(
    profile?.nationality === 'japan' ? 'JPY' : profile?.nationality === 'usa' ? 'USD' : 'CNY'
  )

  const num = parseInt(amount.replace(/,/g, '')) || 0
  const refund = calculateRefund(num, currency)
  const format = (n) => n.toLocaleString()
  const quickAmounts = [50000, 100000, 200000, 500000, 1000000]

  return (
    <div className="max-w-[480px] mx-auto px-4 py-6">
      {/* 통화 선택 */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {Object.keys(EXCHANGE_RATES).map(c => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currency === c ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}
          >
            {EXCHANGE_RATES[c].symbol} {c}
          </button>
        ))}
      </div>

      {/* 금액 입력 */}
      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] text-lg font-medium">₩</span>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={e => {
              const v = e.target.value.replace(/[^0-9]/g, '')
              setAmount(v ? parseInt(v).toLocaleString() : '')
            }}
            placeholder={L(lang, { ko: '구매 금액 입력', zh: '输入购买金额', en: 'Enter amount' })}
            className="w-full pl-10 pr-4 py-4 bg-white border border-[#E5E7EB] rounded-[6px] text-xl font-bold text-[#1A1A1A] outline-none focus:border-[#111827] transition-colors"
          />
        </div>
      </div>

      {/* 빠른 금액 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {quickAmounts.map(q => (
          <button
            key={q}
            onClick={() => setAmount(q.toLocaleString())}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#E5E7EB] text-[#374151] active:scale-95 transition-all"
            style={{ backgroundColor: num === q ? '#F0F7F4' : '#fff' }}
          >
            ₩{format(q)}
          </button>
        ))}
      </div>

      {/* 결과 */}
      <div className="bg-white rounded-[6px] border border-[#E5E7EB] overflow-hidden">
        <div className="p-5 text-center border-b border-[#E5E7EB]" style={{ backgroundColor: refund.eligible ? '#F0F7F4' : '#F9FAFB' }}>
          <p className="text-xs text-[#6B7280] mb-1">
            {L(lang, { ko: '예상 환급액', zh: '预计退税金额', en: 'Estimated Refund' })}
          </p>
          <p className="text-3xl font-black" style={{ color: refund.eligible ? '#2D5A3D' : '#D1D5DB' }}>
            ₩{format(refund.refundKRW)}
          </p>
          {refund.eligible && (
            <p className="text-sm text-[#6B7280] mt-1">
              ≈ {refund.symbol}{refund.refundForeign} {currency}
            </p>
          )}
          {num > 0 && !refund.eligible && (
            <p className="text-xs text-[#EF4444] mt-2">
              {L(lang, { ko: '₩15,000 이상 구매 시 환급 가능', zh: '消费满₩15,000才可退税', en: 'Min ₩15,000 required for refund' })}
            </p>
          )}
        </div>

        {refund.eligible && (
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{L(lang, { ko: '구매 금액', zh: '购买金额', en: 'Purchase' })}</span>
              <span className="font-medium text-[#1A1A1A]">₩{format(num)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{L(lang, { ko: '환급액', zh: '退税额', en: 'Refund' })}</span>
              <span className="font-bold text-[#2D5A3D]">₩{format(refund.refundKRW)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#F0F0F0] pt-2">
              <span className="text-[#6B7280]">{L(lang, { ko: '실제 부담액', zh: '实际支付', en: 'Actual cost' })}</span>
              <span className="font-bold text-[#1A1A1A]">₩{format(num - refund.refundKRW)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{L(lang, { ko: '할인율', zh: '折扣率', en: 'Discount' })}</span>
              <span className="font-bold text-[#B8860B]">-{(refund.refundKRW / num * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
