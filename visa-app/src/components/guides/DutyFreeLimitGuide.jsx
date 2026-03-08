import { useState } from 'react'
import { Plane, Calculator, AlertTriangle, ArrowRightLeft, CreditCard } from 'lucide-react'
import GuideLayout from './GuideLayout'

function L(lang, d) { 
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || '' 
}

const DUTY_FREE_LIMITS = [
  {
    country: { ko: '중국', zh: '中国', en: 'China' },
    flag: '🇨🇳',
    currency: '위안',
    limit: 5000,
    currencySymbol: '¥',
    exchangeRate: 180, // 1위안 = 180원 (예시)
    products: [
      { type: '담배', limit: '400개피 또는 시가 100개', excess: '초과분 50% 세금' },
      { type: '술', limit: '1.5L (12도 이상)', excess: '초과분 60% 세금' },
      { type: '화장품', limit: '한도 내', excess: '초과분 30% 세금' },
      { type: '전자제품', limit: '한도 내', excess: '초과분 20% 세금' }
    ]
  },
  {
    country: { ko: '인도네시아', zh: '印度尼西亚', en: 'Indonesia' },
    flag: '🇮🇩',
    currency: '달러',
    limit: 500,
    currencySymbol: '$',
    exchangeRate: 1350,
    products: [
      { type: '담배', limit: '200개피', excess: '초과분 40% 세금' },
      { type: '술', limit: '1L', excess: '초과분 75% 세금' },
      { type: '화장품', limit: '한도 내', excess: '초과분 25% 세금' },
      { type: '전자제품', limit: '한도 내', excess: '초과분 30% 세금' }
    ]
  },
  {
    country: { ko: '태국', zh: '泰国', en: 'Thailand' },
    flag: '🇹🇭',
    currency: '바트',
    limit: 20000,
    currencySymbol: '฿',
    exchangeRate: 37,
    products: [
      { type: '담배', limit: '200개피', excess: '초과분 60% 세금' },
      { type: '술', limit: '1L', excess: '초과분 80% 세금' },
      { type: '향수', limit: '60ml', excess: '초과분 30% 세금' },
      { type: '기타', limit: '한도 내', excess: '초과분 30% 세금' }
    ]
  },
  {
    country: { ko: '말레이시아', zh: '马来西亚', en: 'Malaysia' },
    flag: '🇲🇾',
    currency: '링깃',
    limit: 500,
    currencySymbol: 'RM',
    exchangeRate: 300,
    products: [
      { type: '담배', limit: '200개피', excess: '초과분 40% 세금' },
      { type: '술', limit: '1L', excess: '초과분 70% 세금' },
      { type: '초콜릿', limit: '한도 내', excess: '초과분 20% 세금' },
      { type: '전자제품', limit: '한도 내', excess: '초과분 25% 세금' }
    ]
  },
  {
    country: { ko: '베트남', zh: '越南', en: 'Vietnam' },
    flag: '🇻🇳',
    currency: '동',
    limit: 10000000,
    currencySymbol: '₫',
    exchangeRate: 0.055,
    products: [
      { type: '담배', limit: '400개피', excess: '초과분 70% 세금' },
      { type: '술', limit: '1.5L', excess: '초과분 65% 세금' },
      { type: '화장품', limit: '한도 내', excess: '초과분 35% 세금' },
      { type: '의류', limit: '한도 내', excess: '초과분 25% 세금' }
    ]
  },
  {
    country: { ko: '필리핀', zh: '菲律宾', en: 'Philippines' },
    flag: '🇵🇭',
    currency: '페소',
    limit: 10000,
    currencySymbol: '₱',
    exchangeRate: 24,
    products: [
      { type: '담배', limit: '400개피', excess: '초과분 50% 세금' },
      { type: '술', limit: '2병 (1L 이하)', excess: '초과분 100% 세금' },
      { type: '향수', limit: '150ml', excess: '초과분 30% 세금' },
      { type: '기타', limit: '한도 내', excess: '초과분 30% 세금' }
    ]
  }
]

const KOREA_DUTY_FREE = {
  limit: 600,
  currency: '달러',
  currencySymbol: '$',
  products: [
    { type: '담배', limit: '200개피', note: '19세 이상만' },
    { type: '술', limit: '1병 (1L 이하)', note: '19세 이상만' },
    { type: '향수', limit: '60ml', note: '' },
    { type: '기타', limit: '$600 이하', note: '총 한도 내' }
  ]
}

export default function DutyFreeLimitGuide({ lang, onClose }) {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [calculatorData, setCalculatorData] = useState({
    country: '',
    itemValue: '',
    currency: 'KRW'
  })
  const [activeTab, setActiveTab] = useState('limits')

  const formatCurrency = (amount, symbol) => {
    if (symbol === '₫') {
      return `${amount.toLocaleString()}${symbol}`
    }
    return `${symbol}${amount.toLocaleString()}`
  }

  const calculateTax = () => {
    const country = DUTY_FREE_LIMITS.find(c => c.country.ko === calculatorData.country)
    if (!country || !calculatorData.itemValue) return null

    let valueInKRW = parseFloat(calculatorData.itemValue)
    if (calculatorData.currency === 'USD') {
      valueInKRW *= 1350 // 달러-원 환율 (예시)
    } else if (calculatorData.currency === 'CNY') {
      valueInKRW *= 180 // 위안-원 환율 (예시)
    }

    const limitInKRW = country.limit * country.exchangeRate
    const excess = Math.max(0, valueInKRW - limitInKRW)
    const tax = excess * 0.3 // 기본 30% 세율 (예시)

    return {
      limitInKRW,
      valueInKRW,
      excess,
      tax,
      country
    }
  }

  const title = { 
    ko: '국가별 면세한도 가이드', 
    zh: '各国免税额度指南', 
    en: 'Duty-Free Limits by Country' 
  }

  const tip = {
    ko: '귀국 시 면세한도와 한국 입국 시 면세한도는 다릅니다. 각각 확인하시고 초과 시 세금을 준비하세요.',
    zh: '回国时的免税额度和入境韩国时的免税额度是不同的。请分别确认，超额时准备缴税。',
    en: 'Duty-free limits when returning home and entering Korea are different. Check both and prepare for taxes if exceeded.'
  }

  return (
    <GuideLayout title={title} lang={lang} onClose={onClose} tip={tip}>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('limits')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'limits'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plane size={16} className="inline-block mr-1" />
          {L(lang, { ko: '귀국 한도', zh: '回国限额', en: 'Return Home Limits' })}
        </button>
        <button
          onClick={() => setActiveTab('korea')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'korea'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowRightLeft size={16} className="inline-block mr-1" />
          {L(lang, { ko: '한국 입국', zh: '入境韩国', en: 'Enter Korea' })}
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'calculator'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calculator size={16} className="inline-block mr-1" />
          {L(lang, { ko: '세금 계산기', zh: '税费计算器', en: 'Tax Calculator' })}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'limits' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            {L(lang, { ko: '귀국 시 면세한도', zh: '回国时免税额度', en: 'Duty-Free Limits When Returning Home' })}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {DUTY_FREE_LIMITS.map((country, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                <button
                  onClick={() => setSelectedCountry(selectedCountry === index ? null : index)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <h3 className="font-bold text-[#1A1A1A]">{L(lang, country.country)}</h3>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(country.limit, country.currencySymbol)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {L(lang, { ko: '한국돈으로', zh: '换算韩元', en: 'In Korean Won' })}
                      </p>
                      <p className="font-medium">
                        ₩{(country.limit * country.exchangeRate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>

                {selectedCountry === index && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {L(lang, { ko: '품목별 한도', zh: '各类商品限额', en: 'Limits by Category' })}
                    </h4>
                    <div className="space-y-2">
                      {country.products.map((product, productIndex) => (
                        <div key={productIndex} className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
                          <div>
                            <span className="font-medium">{product.type}</span>
                            <p className="text-sm text-gray-600">{product.limit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-red-500">{product.excess}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-700">
                        {L(lang, {
                          ko: '⚠️ 초과분은 현지 세관에서 세금을 내야 합니다.',
                          zh: '⚠️ 超额部分需要在当地海关缴税。',
                          en: '⚠️ Excess amounts are subject to local customs taxes.'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'korea' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            {L(lang, { ko: '한국 입국 시 면세한도', zh: '入境韩国时免税额度', en: 'Duty-Free Limits Entering Korea' })}
          </h2>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🇰🇷</span>
              <div>
                <h3 className="font-bold text-[#1A1A1A]">
                  {L(lang, { ko: '한국 (대한민국)', zh: '韩国 (大韩民国)', en: 'Korea (Republic of Korea)' })}
                </h3>
                <p className="text-lg font-semibold text-green-600">
                  {KOREA_DUTY_FREE.currencySymbol}{KOREA_DUTY_FREE.limit} 
                  <span className="text-sm text-gray-500 ml-2">
                    (₩{(KOREA_DUTY_FREE.limit * 1350).toLocaleString()})
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">
                {L(lang, { ko: '품목별 한도', zh: '各类商品限额', en: 'Limits by Category' })}
              </h4>
              {KOREA_DUTY_FREE.products.map((product, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <span className="font-medium">{product.type}</span>
                    <p className="text-sm text-gray-600">{product.limit}</p>
                  </div>
                  {product.note && (
                    <div className="text-right">
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        {product.note}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-1">
                {L(lang, { ko: '추가 정보', zh: '附加信息', en: 'Additional Info' })}
              </h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {L(lang, { ko: '개인용품은 면세 (상식적 수량)', zh: '个人用品免税（合理数量）', en: 'Personal items are tax-free (reasonable quantity)' })}</li>
                <li>• {L(lang, { ko: '1년 이상 해외거주자는 한도 증가', zh: '海外居住1年以上者限额增加', en: 'Higher limit for overseas residents (1+ year)' })}</li>
                <li>• {L(lang, { ko: '미성년자는 담배/술 반입 불가', zh: '未成年人不可携带烟酒', en: 'Minors cannot bring tobacco/alcohol' })}</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-600 mt-1 shrink-0" />
              <div>
                <h4 className="font-bold text-red-700 mb-1">
                  {L(lang, { ko: '반입 금지 품목', zh: '禁止携带物品', en: 'Prohibited Items' })}
                </h4>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• {L(lang, { ko: '마약, 총기, 폭발물', zh: '毒品、枪支、爆炸物', en: 'Drugs, firearms, explosives' })}</li>
                  <li>• {L(lang, { ko: '위조품, 해적판', zh: '假冒商品、盗版', en: 'Counterfeit goods, pirated materials' })}</li>
                  <li>• {L(lang, { ko: '신선 과일, 고기류 (일부)', zh: '新鲜水果、肉类（部分）', en: 'Fresh fruits, meat (some)' })}</li>
                  <li>• {L(lang, { ko: '도박용품', zh: '赌博用品', en: 'Gambling equipment' })}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            {L(lang, { ko: '초과 세금 계산기', zh: '超额税费计算器', en: 'Excess Tax Calculator' })}
          </h2>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {L(lang, { ko: '귀국 국가', zh: '回国国家', en: 'Returning to' })}
                </label>
                <select
                  value={calculatorData.country}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  <option value="">{L(lang, { ko: '국가를 선택하세요', zh: '选择国家', en: 'Select country' })}</option>
                  {DUTY_FREE_LIMITS.map((country, index) => (
                    <option key={index} value={country.country.ko}>
                      {country.flag} {L(lang, country.country)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {L(lang, { ko: '구매 금액', zh: '购买金额', en: 'Purchase Amount' })}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={calculatorData.itemValue}
                    onChange={(e) => setCalculatorData(prev => ({ ...prev, itemValue: e.target.value }))}
                    placeholder="0"
                    className="flex-1 p-2 border border-gray-200 rounded-lg"
                  />
                  <select
                    value={calculatorData.currency}
                    onChange={(e) => setCalculatorData(prev => ({ ...prev, currency: e.target.value }))}
                    className="p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="KRW">₩ (원)</option>
                    <option value="USD">$ (달러)</option>
                    <option value="CNY">¥ (위안)</option>
                  </select>
                </div>
              </div>
            </div>

            {calculatorData.country && calculatorData.itemValue && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                {(() => {
                  const result = calculateTax()
                  if (!result) return null

                  return (
                    <div className="space-y-3">
                      <h4 className="font-bold text-[#1A1A1A]">
                        {L(lang, { ko: '계산 결과', zh: '计算结果', en: 'Calculation Result' })}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">{L(lang, { ko: '면세한도', zh: '免税额度', en: 'Duty-Free Limit' })}</p>
                          <p className="font-semibold">₩{result.limitInKRW.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">{L(lang, { ko: '구매금액', zh: '购买金额', en: 'Purchase Amount' })}</p>
                          <p className="font-semibold">₩{result.valueInKRW.toLocaleString()}</p>
                        </div>
                      </div>

                      {result.excess > 0 ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={16} className="text-red-600" />
                            <h5 className="font-bold text-red-700">
                              {L(lang, { ko: '한도 초과!', zh: '超过限额！', en: 'Over Limit!' })}
                            </h5>
                          </div>
                          <p className="text-sm text-red-600 mb-2">
                            {L(lang, { ko: '초과 금액:', zh: '超额金额:', en: 'Excess Amount:' })} ₩{result.excess.toLocaleString()}
                          </p>
                          <p className="text-lg font-bold text-red-700">
                            {L(lang, { ko: '예상 세금:', zh: '预计税费:', en: 'Expected Tax:' })} ₩{result.tax.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <p className="font-bold text-green-700">
                              {L(lang, { ko: '면세한도 내 입니다!', zh: '在免税额度内！', en: 'Within duty-free limit!' })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <CreditCard size={16} className="text-yellow-600 mt-1 shrink-0" />
              <div>
                <h4 className="font-bold text-yellow-800 mb-1">
                  {L(lang, { ko: '세금 납부 방법', zh: '税费缴纳方式', en: 'How to Pay Taxes' })}
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• {L(lang, { ko: '공항 세관에서 현금 또는 카드로 납부', zh: '在机场海关用现金或信用卡缴费', en: 'Pay at airport customs by cash or card' })}</li>
                  <li>• {L(lang, { ko: '영수증 보관 (재입국 시 필요할 수 있음)', zh: '保留收据（再次入境时可能需要）', en: 'Keep receipt (may be needed for re-entry)' })}</li>
                  <li>• {L(lang, { ko: '신고하지 않고 적발 시 더 큰 처벌', zh: '不申报被发现会受更大处罚', en: 'Larger penalties if caught without declaring' })}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </GuideLayout>
  )
}