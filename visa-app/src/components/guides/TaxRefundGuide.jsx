import { useState } from 'react'
import { Receipt, AlertTriangle, MapPin, Calculator, Store, Plane, Building2 } from 'lucide-react'
import GuideLayout from './GuideLayout'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const card = 'bg-white rounded-2xl p-5 border border-[#E5E7EB]'

const REFUND_METHODS = [
  {
    id: 'instant',
    icon: Store,
    name: { ko: '즉시환급 (매장)', zh: '即时退税（店铺）', en: 'Instant Refund (In-Store)' },
    steps: [
      { ko: '결제 시 여권 제시', zh: '结账时出示护照', en: 'Show passport at checkout' },
      { ko: '세금 차감된 가격으로 바로 구매', zh: '直接以扣税后价格购买', en: 'Pay the tax-deducted price directly' },
      { ko: '환급 영수증 보관 (출국 시 확인 가능)', zh: '保管退税收据（出境时可能检查）', en: 'Keep refund receipt (may be checked at departure)' },
    ],
    tip: { ko: '가장 간편! Tax Free 매장에서 바로 적용', zh: '最简便！在Tax Free店铺直接适用', en: 'Easiest! Applied directly at Tax Free stores' },
  },
  {
    id: 'city',
    icon: Building2,
    name: { ko: '시내환급 (키오스크)', zh: '市内退税（自助机）', en: 'City Refund (Kiosk)' },
    steps: [
      { ko: '시내 환급 키오스크 방문', zh: '前往市内退税自助机', en: 'Visit city refund kiosk' },
      { ko: '영수증 스캔 + 여권 스캔', zh: '扫描收据+护照', en: 'Scan receipt + passport' },
      { ko: '현금 또는 카드 환급 선택', zh: '选择现金或银行卡退税', en: 'Choose cash or card refund' },
    ],
    tip: { ko: '명동, 홍대, 강남 주요 쇼핑몰에 키오스크 있음', zh: '明洞、弘大、江南主要商场有自助机', en: 'Kiosks in major malls at Myeongdong, Hongdae, Gangnam' },
  },
  {
    id: 'airport',
    icon: Plane,
    name: { ko: '공항환급 (출국 시)', zh: '机场退税（出境时）', en: 'Airport Refund (At Departure)' },
    steps: [
      { ko: '세관 신고대에서 물품 확인 + 도장', zh: '在海关申报台确认物品+盖章', en: 'Get customs stamp at declaration counter' },
      { ko: '환급 카운터 방문', zh: '前往退税柜台', en: 'Visit refund counter' },
      { ko: '현금(원화/위안) 또는 카드 환급', zh: '现金（韩元/人民币）或银行卡退税', en: 'Cash (KRW/CNY) or card refund' },
    ],
    tip: { ko: '출국 2시간 전까지 도착 권장', zh: '建议出发前2小时到达', en: 'Arrive 2 hours before departure' },
  },
]

const AIRPORT_LOCATIONS = [
  { name: { ko: '인천공항 T1', zh: '仁川机场T1', en: 'Incheon T1' }, detail: { ko: '출국장 28번 게이트 근처', zh: '出境大厅28号登机口附近', en: 'Near Gate 28, Departure' } },
  { name: { ko: '인천공항 T2', zh: '仁川机场T2', en: 'Incheon T2' }, detail: { ko: '출국장 253번 게이트 근처', zh: '出境大厅253号登机口附近', en: 'Near Gate 253, Departure' } },
]

export default function TaxRefundGuide({ lang, onClose }) {
  const [amount, setAmount] = useState('')
  const [expandedMethod, setExpandedMethod] = useState('instant')

  const numAmount = parseInt(amount.replace(/[^0-9]/g, '')) || 0
  // 부가세 10%, 실 환급률 약 7~8%
  const estimatedRefund = numAmount >= 15000 ? Math.round(numAmount * 0.075) : 0

  const formatNumber = (n) => n.toLocaleString()

  return (
    <GuideLayout
      title={{ ko: '세금 환급 가이드', zh: '退税指南', en: 'Tax Refund Guide' }}
      lang={lang}
      onClose={onClose}
    >
        {/* 기준일자 */}
        <p className="text-xs text-gray-400 text-center">
          {L(lang, { ko: '정보 기준: 2026년 3월', zh: '信息基准: 2026年3月', en: 'As of March 2026' })}
        </p>

        {/* 큰 숫자 카드 */}
        <div className={`${card} text-center`}>
          <p className="text-xs text-[#6B7280] mb-1">{L(lang, { ko: '최대 환급률', zh: '最高退税率', en: 'Max Refund Rate' })}</p>
          <p className="text-4xl font-bold text-[#111827]">~7-8%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">{L(lang, { ko: '부가세 10% 기준', zh: '基于增值税10%', en: 'Based on 10% VAT' })}</p>
        </div>

        {/* 환급 조건 */}
        <div className={card}>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <Receipt size={16} />
            {L(lang, { ko: '환급 조건', zh: '退税条件', en: 'Eligibility' })}
          </h3>
          <ul className="space-y-2 text-sm text-[#374151]">
            <li className="flex items-start gap-2">
              <span className="text-green-500 shrink-0">✓</span>
              {L(lang, { ko: '외국인 여권 소지자', zh: '持外国护照者', en: 'Foreign passport holder' })}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 shrink-0">✓</span>
              {L(lang, { ko: '1개 매장에서 1회 15,000원 이상 구매', zh: '单店单次消费15,000韩元以上', en: 'Min. ₩15,000 per purchase at one store' })}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 shrink-0">✓</span>
              {L(lang, { ko: '구매일로부터 3개월 이내 출국', zh: '购买之日起3个月内出境', en: 'Depart within 3 months of purchase' })}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 shrink-0">✓</span>
              {L(lang, { ko: 'Tax Free / Tax Refund 표시 매장', zh: '有Tax Free/Tax Refund标志的店铺', en: 'At Tax Free / Tax Refund stores' })}
            </li>
          </ul>
          <p className="text-[10px] text-gray-400 mt-3">
            {L(lang, { ko: '※ 환급 기준금액은 정책 변경될 수 있습니다. 최신 기준은 매장에서 확인하세요.', zh: '※ 退税基准金额可能因政策变更而调整。请在店铺确认最新标准。', en: '※ Minimum purchase amount may change. Please confirm at the store.' })}
          </p>
        </div>

        {/* 환급 방법 3가지 */}
        <div className="space-y-3">
          {REFUND_METHODS.map(m => (
            <button key={m.id}
              onClick={() => setExpandedMethod(expandedMethod === m.id ? null : m.id)}
              className={`${card} w-full text-left transition-all duration-200 active:scale-[0.98]`}>
              <div className="flex items-center gap-3">
                <m.icon size={20} className="text-[#111827] shrink-0" />
                <span className="text-sm font-bold text-[#111827] flex-1">{L(lang, m.name)}</span>
              </div>
              {expandedMethod === m.id && (
                <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                  <div className="space-y-2 mb-3">
                    {m.steps.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs font-bold text-white bg-[#111827] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-[#374151]">{L(lang, s)}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">💡 {L(lang, m.tip)}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 환급 계산기 */}
        <div className={card}>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <Calculator size={16} />
            {L(lang, { ko: '환급 계산기', zh: '退税计算器', en: 'Refund Calculator' })}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#6B7280] mb-1 block">
                {L(lang, { ko: '구매 금액 (원)', zh: '购买金额（韩元）', en: 'Purchase Amount (KRW)' })}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="50000"
                className="w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-lg font-bold text-[#111827] outline-none"
              />
            </div>
            {numAmount > 0 && (
              <div className={`rounded-xl p-4 text-center ${numAmount >= 15000 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {numAmount >= 15000 ? (
                  <>
                    <p className="text-xs text-green-600 mb-1">{L(lang, { ko: '예상 환급액', zh: '预计退税金额', en: 'Estimated Refund' })}</p>
                    <p className="text-2xl font-bold text-green-700">₩{formatNumber(estimatedRefund)}</p>
                    <p className="text-[10px] text-green-500 mt-1">≈ ¥{formatNumber(Math.round(estimatedRefund / 190))}</p>
                  </>
                ) : (
                  <p className="text-sm text-red-600">
                    {L(lang, { ko: '15,000원 이상 구매 시 환급 가능', zh: '消费15,000韩元以上可退税', en: 'Min. ₩15,000 required for refund' })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 공항 환급 위치 */}
        <div className={card}>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <MapPin size={16} />
            {L(lang, { ko: '공항 환급 위치', zh: '机场退税地点', en: 'Airport Refund Locations' })}
          </h3>
          <div className="space-y-2">
            {AIRPORT_LOCATIONS.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <Plane size={14} className="text-[#9CA3AF] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{L(lang, a.name)}</p>
                  <p className="text-xs text-[#6B7280]">{L(lang, a.detail)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 주의 카드 */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 mb-1">
                {L(lang, { ko: '영수증 잃어버리면 환급 불가!', zh: '收据丢失无法退税！', en: 'No receipt = No refund!' })}
              </p>
              <ul className="text-xs text-red-600 space-y-1">
                <li>{L(lang, { ko: '• 환급 영수증은 출국까지 반드시 보관', zh: '• 退税收据必须保管到出境', en: '• Keep refund receipts until departure' })}</li>
                <li>{L(lang, { ko: '• 사진 촬영 백업 추천', zh: '• 建议拍照备份', en: '• Take photos as backup' })}</li>
                <li>{L(lang, { ko: '• 고가 물품은 세관 확인 대비 휴대', zh: '• 贵重物品随身携带以备海关检查', en: '• Carry expensive items for customs inspection' })}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 출처 + 푸터 */}
        <p className="text-[10px] text-gray-400 text-center">
          {L(lang, { ko: '출처: 국세청, 관세청', zh: '来源：国税厅、关税厅', en: 'Source: National Tax Service, Korea Customs' })}
        </p>
        <p className="text-xs text-gray-400 text-center mt-8">
          {L(lang, { ko: '정보 기준: 2026년 3월 | 문의: hanpocket@email.com', zh: '信息基准: 2026年3月 | 联系: hanpocket@email.com', en: 'As of March 2026 | Contact: hanpocket@email.com' })}
        </p>
    </GuideLayout>
  )
}
