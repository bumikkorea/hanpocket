import { useState } from 'react'

// ─── Multi-Currency Exchange Rate Card ───

const CURRENCIES = [
  { code: 'CNY', flag: 'CN', name: '人民币', rate: 191.52 },
  { code: 'HKD', flag: 'HK', name: '港币', rate: 177.80 },
  { code: 'TWD', flag: 'TW', name: '新台币', rate: 42.50 },
  { code: 'MOP', flag: 'MO', name: '澳门元', rate: 171.20 },
  { code: 'USD', flag: 'US', name: '美元', rate: 1384.50 },
  { code: 'JPY', flag: 'JP', name: '日元', rate: 9.21 },
  { code: 'VND', flag: 'VN', name: '越南盾', rate: 0.055 },
  { code: 'PHP', flag: 'PH', name: '比索', rate: 24.10 },
  { code: 'THB', flag: 'TH', name: '泰铢', rate: 39.80 },
]

export default function ExchangeRateWidget({ exchangeRate, lang, compact }) {
  const [amount, setAmount] = useState('1000')
  const [selectedCurrency, setSelectedCurrency] = useState('CNY')
  const curr = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0]
  const rate = exchangeRate?.[selectedCurrency] || curr.rate
  const converted = (parseFloat(amount) || 0) * rate

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#6B7280]">{lang === 'ko' ? '환전 계산기' : lang === 'zh' ? '汇率计算器' : 'Currency Converter'}</span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <select
          value={selectedCurrency}
          onChange={e => setSelectedCurrency(e.target.value)}
          className="text-[11px] font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-1.5 py-1.5 outline-none border-none shrink-0"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
          ))}
        </select>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-0 flex-1 min-w-0 text-right text-sm font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1.5 outline-none"
        />
      </div>
      <div className="text-center text-[#9CA3AF] text-xs my-1">&darr;</div>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-[#111827] shrink-0 px-1.5">KRW</span>
        <div className="w-0 flex-1 min-w-0 text-right text-sm font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1.5 truncate">
          {converted.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
        </div>
      </div>
      <p className="text-[8px] text-[#9CA3AF] text-center mt-1">Last: {exchangeRate?._date || '-'}</p>
    </div>
  )
}